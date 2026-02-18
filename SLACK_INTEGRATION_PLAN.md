# Rencana Integrasi Slack: Agar OpenClaw (Joy) Merespon Request Web App

## Masalah Utama
Joy (OpenClaw) hanya merespon pesan dari **User Asli** (User Message), sedangkan Web App kita saat ini mengirim pesan sebagai **Bot/App** (Bot Message).

## Analisa Solusi Joy
Joy menyarankan:
1. Ganti Bot Token (`xoxb`) ke User Token (`xoxp`).
2. Pakai parameter `as_user: true`.

**Tantangan Teknis:**
- **Keamanan Frontend:** Web App kita berjalan di client-side (React). Menyimpan **User Token (`xoxp`)** di frontend (`.env` yang terekspos) sangat **BERBAHAYA**. Jika token ini bocor, orang lain bisa login Slack atas nama kamu dan membaca/mengirim pesan apa saja.
- **Incoming Webhook:** Tool OneClick saat ini memakai *Incoming Webhook URL*. Webhook jenis ini **TIDAK BISA** mengirim pesan sebagai user (`as_user` tidak didukung). Webhook selalu mengirim sebagai Bot App.

## Solusi Rekomendasi: "The n8n Relay"

Solusi terbaik, aman, dan tanpa mengubah banyak kode Web App adalah menggunakan **n8n sebagai perantara (Relay)**.

### Arsitektur Baru
`Web App (React)` -> `n8n Webhook` -> `n8n Slack Node (User Credential)` -> `Slack Channel` -> `Joy Detects User Message ✅`

### Keuntungan:
1. **Aman**: User Token disimpan di server n8n, tidak terekspos di browser user.
2. **Fleksibel**: Bisa ubah format pesan tanpa redeploy Web App.
3. **Works for Joy**: Pesan benar-benar akan muncul dari akun User kamu.

---

## Langkah Implementasi

### 1. Untuk Clipper Tools & Analyze (Sudah pakai n8n)
Tool ini sudah mengirim data ke n8n (`VITE_WEBHOOK_CLIPPER_ANALYZE`). Kita tinggal ubah konfigurasi di n8n workflow-nya.

**Action di n8n:**
1. Buka Workflow **Clipper Analyze**.
2. Cari Node **Slack** yang mengirim notifikasi ke `#joy-clipper`.
3. Buka Node tersebut.
4. Di bagian **Authentication** / **Credential**, jangan pakai "Slack App/Bot Token".
5. Buat/Pilih **Credential Baru**: Gunakan **Slack OAuth2 API**.
   - Login dengan akun Slack User kamu saat setup credential.
6. (Opsional) Di parameter node, pastikan tidak ada override username/icon yang memaksanya jadi bot.
7. Save & Activate.

### 2. Untuk One Click Tool (Pakai Webhook Langsung)
Tool ini mengirim langsung ke Incoming Webhook Slack. Ini harus diubah jalurnya.

**Action di n8n:**
1. Buat Workflow Baru: "Slack Relay".
2. Add **Webhook Node** (POST). Copy URL-nya (Test/Production).
3. Add **Slack Node**.
   - Credential: Pakai **User Token OAuth2** (sama kayak step 1).
   - Channel: `#joy-clipper` (atau channel target).
   - Text: Ambil dari input webhook.
4. Save & Activate.

**Action di Web App (G2):**
1. Buka file `.env`.
2. Ubah `VITE_SLACK_COPYWRITING_WEBHOOK` (atau variabel OneClick webhook):
   - **Dari:** `https://hooks.slack.com/services/...`
   - **Ke:** URL n8n Webhook Relay yang baru dibuat.
3. Redeploy Web App.

---

## Kesimpulan
Saran saya adalah **jangan ubah kode React untuk pakai token User**. Itu resiko security tinggi.
Lakukan integrasi di "Layer Belakang" (n8n). Heartbeat juga opsi oke, tapi n8n relay lebih real-time ("Push" vs "Poll").

**Rekomendasi:** Lakukan adjustment di n8n hari ini juga, tes satu request, dan lihat apakah Joy merespon! 🚀
