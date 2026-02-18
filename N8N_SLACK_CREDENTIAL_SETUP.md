# Panduan Setup Kredensial Slack di n8n (User Token)

Agar pesan dari Web App terbaca sebagai pesan dari **User Asli** (bukan Bot) oleh Joy/OpenClaw, kita perlu menggunakan **Slack OAuth2 API** dengan **User Token Configuration**.

Ikuti langkah-langkah ini dengan teliti:

## Langkah 1: Buat Slack App
1. Buka [api.slack.com/apps](https://api.slack.com/apps).
2. Klik **Create New App** -> **From scratch**.
3. **App Name**: "n8n Relay" (atau nama bebas).
4. **Workspace**: Pilih workspace Slack kantor kamu.
5. Klik **Create App**.

## Langkah 2: Konfigurasi OAuth & Permissions
Di sidebar kiri menu App kamu:
1. Klik **OAuth & Permissions**.
2. Scroll ke bawah sampai **Redirect URLs**.
3. Klik **Add New Redirect URL**.
4. Masukkan URL Callback n8n (biasanya):
   - `https://oauth.n8n.io/v2/credential/callback`
   - *(Note: Jika n8n kamu self-hosted dengan tunnel, cek URL di window credential n8n)*.
5. Klik **Save URLs**.

## Langkah 3: Tentukan Scopes (PENTING!)
Masih di halaman **OAuth & Permissions**, scroll ke **Scopes**.

### User Token Scopes (Wajib untuk Joy)
Tambahkan permission berikut di bagian **User Token Scopes** (JANGAN di Bot Token Scopes):
- `chat:write` (Untuk kirim pesan atas nama user)
- `channels:read` (Opsional: Untuk list channel)
- `files:write` (Opsional: Jika mau upload file)

*(Biarkan Bot Token Scopes kosong jika kamu hanya ingin fungsi user relay)*.

## Langkah 4: Dapatkan ID & Secret
1. Klik **Basic Information** di sidebar kiri.
2. Scroll ke bagian **App Credentials**.
3. Kamu akan melihat **Client ID** dan **Client Secret**. (Jangan tutup tab ini).

## Langkah 5: Setup di n8n
1. Buka n8n -> **Credentials** -> **New**.
2. Cari **Slack OAuth2 API**.
3. Masukkan data:
   - **Client ID**: Copy dari Step 4.
   - **Client Secret**: Copy dari Step 4.
   - **Auth URI** & **Access Token URI**: Biarkan default (`https://slack.com/oauth/v2/authorize`, dll).
4. Klik **Connect my account** (tombol merah/biru).
5. Akan muncul popup Slack permission. Pastikan yang diminta adalah izin untuk **User** kamu.
6. Klik **Allow**.

**Selesai!** Sekarang Node Slack di n8n akan mengirim pesan menggunakan identitas Slack kamu (foto & nama kamu), sehingga Joy/OpenClaw akan meresponnya! 🚀
