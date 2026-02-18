# Setup N8N Copywriting Workflow

## 📥 Import Workflow

1. **Buka N8N** → klik **Workflows** (sidebar kiri)
2. Klik tombol **"+"** → pilih **"Import from File"**
3. Upload file: `n8n_copywriting_workflow.json`
4. Klik **"Import"**

## 🔑 Setup Credentials

### 1. OpenAI (untuk ChatGPT)
- Klik node **"ChatGPT (Jina)"** atau **"ChatGPT (Firecrawl)"**
- Di panel kanan, klik **"Credential to connect with"** dropdown
- Klik **"+ Create New Credential"**
- Pilih **"OpenAI API"**
- Masukkan **API Key** → Save
- Credential ID akan auto-update di workflow

### 2. Perplexity (opsional)
- Klik node **"Perplexity"**
- Di **"Authentication"** → pilih **"Generic Credential Type"**
- Tambahkan Header Auth:
  - Name: `Authorization`
  - Value: `Bearer YOUR_PERPLEXITY_API_KEY`

### 3. Firecrawl (opsional, free tier 500 credits)
- Klik node **"Firecrawl"**
- Setup sama seperti Perplexity
- Atau create credential **"HTTP Header Auth"**
- Value: `Bearer YOUR_FIRECRAWL_API_KEY`

## ✅ Activate Workflow

1. Klik tombol **"Active"** toggle (kanan atas)
2. Workflow status jadi **hijau**
3. Copy **Production URL** dari node **"Webhook"**
4. Paste ke `.env`:

```bash
VITE_WEBHOOK_COPYWRITING=https://your-n8n.app.n8n.cloud/webhook/copywriting
```

## 🧪 Test

**Manual test via N8N:**
1. Klik node **"Webhook"**
2. Klik **"Listen for Test Event"**
3. Di terminal/Postman:

```bash
curl -X POST https://your-n8n-url/webhook-test/copywriting \
  -H "Content-Type: application/json" \
  -d '{
    "media": "Raga Plus ID",
    "model": "chatgpt-jina",
    "content": "https://www.goal.com/id/berita/article-url"
  }'
```

4. Lihat hasil di N8N execution panel

**Test dari UI:**
1. `npm run dev`
2. Buka **Copywriting Tools**
3. Pilih media + model → paste URL → Generate

## 📋 Node Structure

```
Webhook
  ↓
Persona Mapper (Code) ← 13 media personas di sini
  ↓
Router (Switch by model)
  ├─ chatgpt-jina → Jina Reader → ChatGPT
  ├─ chatgpt-firecrawl → Firecrawl → ChatGPT
  └─ perplexity → Perplexity (standalone)
  ↓
Parse Response (Code) ← normalize output
  ↓
Respond
```

## 💡 Tips

- **Jina Reader**: Gratis, cepat, reliable untuk 90% case
- **Firecrawl**: Lebih clean scraping, tapi bayar ($0.0005/scrape)
- **Perplexity**: All-in-one, tapi kadang kurang akurat kalau URL spesifik

Default pakai **ChatGPT + Jina** (paling murah ~$0.003/caption).
