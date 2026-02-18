# Copywriting Tools - Implementasi Guide

## 📋 Overview

Fitur Copywriting Tools sekarang mendukung **6 kombinasi LLM** dengan routing otomatis:
- **Jina Reader + GPT-4o** (Recommended)
- **Jina Reader + Claude Sonnet**
- **Jina Reader + Gemini 2.0 Flash**
- **Firecrawl + GPT-4o**
- **Firecrawl + Claude Sonnet**
- **Perplexity Sonar** (All-in-One)

Setiap media memiliki **persona** unik (brand voice, tone, audience) yang dikirim ke LLM untuk hasil copywriting yang konsisten dengan brand.

---

## 🛠️ Setup

### 1. Environment Variables

Tambahkan ke `.env`:

```bash
# Copywriting Webhook
VITE_WEBHOOK_COPYWRITING=https://your-n8n-instance.com/webhook/copywriting

# API Keys (untuk N8N)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GEMINI_API_KEY=AIza...
FIRECRAWL_API_KEY=fc-...
PERPLEXITY_API_KEY=pplx-...
```

### 2. Import N8N Workflow

1. Buka N8N Dashboard
2. Import `n8n_copywriting_workflow.json`
3. Setup Credentials:
   - OpenAI API (untuk GPT-4o)
   - Anthropic API (untuk Claude)
   - Google Gemini API (untuk Gemini 2.0)
   - Firecrawl API (opsional, free tier 500 credits)
   - Perplexity API (opsional, $1/1M tokens)

4. **Activate Workflow**
5. Copy **Production Webhook URL** → masukkan ke `VITE_WEBHOOK_COPYWRITING`

---

## 📊 Workflow Logic

```
Frontend
    │
    ├─ User pilih: Media + Model + URL/Article
    │
    ↓
N8N Webhook
    │
    ├─ Receive: { media, model, content, persona }
    │
    ↓
Switch Router (based on model)
    │
    ├─ Output 0: jina-gpt4o    → Jina Reader → GPT-4o
    ├─ Output 1: jina-claude   → Jina Reader → Claude
    ├─ Output 2: jina-gemini   → Jina Reader → Gemini
    ├─ Output 3: firecrawl-gpt4o   → Firecrawl → GPT-4o
    ├─ Output 4: firecrawl-claude  → Firecrawl → Claude
    └─ Output 5: perplexity-sonar  → Perplexity (one-shot)
    │
    ↓
LLM Processing (with persona context)
    │
    ↓
Normalize Output (Code node)
    │
    ├─ Parse JSON from different LLM response formats
    ├─ Standardize to { headlines: [...], captions: [...] }
    │
    ↓
Respond to Webhook
    │
    └─ Return JSON to frontend
```

---

## 🎯 Media Personas

Setiap media punya **personality guide** yang dikirim ke LLM:

### Contoh: Raga Plus ID

```javascript
{
  voice: 'Profesional namun tetap engaging, berita olahraga Indonesia',
  tone: 'Energik, passionate, informatif',
  audience: 'Penggemar sepak bola dan olahraga Indonesia usia 18-35 tahun',
  style: 'Langsung to the point, emosional saat big moments, sertakan data/fakta',
  hashtag_style: '#sepakbola #timnasindonesia #liga1'
}
```

### Contoh: Bocahe Kaesang

```javascript
{
  voice: 'Fun, playful, anak muda banget',
  tone: 'Ceria, lucu, santai',
  audience: 'Gen Z dan milenial 15-30 tahun',
  style: 'Bahasa gaul, meme-able, singkat dan punchy, banyak emoji',
  hashtag_style: '#genZ #viral #FYP'
}
```

Persona ini **automatically included** di system prompt LLM.

---

## 💰 Cost Estimates

### Per Caption (3 headlines + 2 captions)

| Model | Scraper Cost | LLM Cost | **Total** |
|---|---|---|---|
| **Jina + GPT-4o** | $0 (free) | ~$0.003 | **~$0.003** |
| **Jina + Claude** | $0 (free) | ~$0.005 | **~$0.005** |
| **Jina + Gemini** | $0 (free) | $0 (free tier) | **$0** |
| **Firecrawl + GPT-4o** | ~$0.0005 | ~$0.003 | **~$0.0035** |
| **Firecrawl + Claude** | ~$0.0005 | ~$0.005 | **~$0.0055** |
| **Perplexity Sonar** | N/A | ~$0.0005 | **~$0.0005** |

### Monthly (100 captions)

| Model | Monthly Cost |
|---|---|
| Jina + Gemini | **$0** 🎉 |
| Perplexity Sonar | **$0.05** |
| Jina + GPT-4o | **$0.30** |
| Firecrawl + GPT-4o | **$0.35** |
| Jina + Claude | **$0.50** |
| Firecrawl + Claude | **$0.55** |

**Rekomendasi:** Mulai dengan **Jina + Gemini** (gratis!) atau **Jina + GPT-4o** (paling akurat).

---

## 🧪 Testing

### Manual Test via curl

```bash
curl -X POST https://your-n8n.com/webhook/copywriting \
  -H "Content-Type: application/json" \
  -d '{
    "media": "Raga Plus ID",
    "model": "jina-gpt4o",
    "input_type": "link",
    "content": "https://www.goal.com/id/berita/man-united-menang-3-1",
    "persona": {
      "voice": "Profesional namun tetap engaging",
      "tone": "Energik, passionate, informatif",
      "audience": "Penggemar sepak bola Indonesia 18-35 tahun",
      "style": "Langsung to the point, sertakan data/fakta"
    },
    "editor_email": "test@kulturai.com"
  }'
```

### Expected Response

```json
{
  "headlines": [
    "BREAKING: Man United Menang Telak 3-1 Atas Arsenal! 🔥",
    "Rashford Hattrick! Ini Alasan Kenapa MU Dominan Malam Ini",
    "Arsenal Takluk di Old Trafford, Arteta Kecewa Berat"
  ],
  "captions": [
    "Pertandingan seru semalam di Old Trafford! Manchester United berhasil menang telak 3-1 atas Arsenal berkat hattrick Marcus Rashford. Arsenal yang sebelumnya unbeaten harus menelan pil pahit di markas Setan Merah.\n\nRashford jadi bintang dengan 3 gol di menit 23', 67', dan 89'. Sementara gol balasan Arsenal dicetak oleh Martinelli.\n\nApakah ini momentum kebangkitan MU?\n\n#sepakbola #manutd #arsenal #rashford #premierleague",
    "..."
  ]
}
```

---

## 🐛 Troubleshooting

### Error: "Missing VITE_WEBHOOK_COPYWRITING"

✅ **Fix:** Tambahkan env variable di `.env` dan restart dev server

### Error: "Webhook failed: 401"

✅ **Fix:** N8N workflow belum di-activate atau webhook URL salah

### Headlines/Captions kosong

✅ **Fix:** 
- Periksa N8N logs untuk error dari LLM API
- Pastikan API keys valid
- Coba model lain (switch dari GPT-4o ke Gemini)

### LLM halusinasi (fakta salah)

✅ **Fix:**
- Gunakan **Jina Reader** atau **Firecrawl** (bukan Perplexity) untuk artikel spesifik
- Pastikan URL artikel valid dan accessible
- Tambahkan "JANGAN HALUSINASI" di system prompt

---

## 📱 Usage di UI

1. Buka **Copywriting Tools**
2. Pilih **Media** (e.g., "Raga Plus ID")
3. Pilih **AI Model** (e.g., "Jina Reader + GPT-4o")
4. Toggle **Input Type**:
   - **Article** → Paste teks artikel langsung
   - **Social Link** → Paste URL (Twitter, Instagram, article, dll)
5. Klik **Generate Copywriting**
6. Copy headline/caption yang diinginkan

---

## 🚀 Next Improvements

- [ ] Add "Regenerate" button untuk re-generate specific headline/caption
- [ ] Save favorite outputs ke Supabase
- [ ] A/B testing mode (bandingkan output 2 model side-by-side)
- [ ] Batch mode (generate untuk multiple URLs sekaligus)
- [ ] Custom persona override (user bisa edit persona sementara)

---

## 📞 Support

Kalau ada issue, cek:
1. N8N workflow execution logs
2. Browser console (F12) untuk frontend errors
3. File `CopywritingTools.jsx` line 60-90 untuk webhook call logic
