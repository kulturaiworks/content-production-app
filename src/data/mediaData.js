// Media list for Indonesia content production
export const MEDIA_LIST = [
    'Raga Plus ID',
    'Red Talks ID',
    'Kultur AI',
    'Bersama Teddy',
    'Kami Meutya',
    'Bocahe Kaesang',
    'Team Pur',
    'Motorell',
    'Fox Populi',
    'Whats On',
    'Dakwah AI',
    'Wisato ID',
    'Maxi Theory'
]

// Media Personas (for copywriting AI)
export const MEDIA_PERSONAS = {
    'Raga Plus ID': {
        voice: 'Profesional namun tetap engaging, berita olahraga Indonesia',
        tone: 'Energik, passionate, informatif',
        audience: 'Penggemar sepak bola dan olahraga Indonesia usia 18-35 tahun',
        style: 'Langsung to the point, emosional saat big moments, sertakan data/fakta',
        hashtag_style: '#sepakbola #timnasindonesia #liga1'
    },
    'Red Talks ID': {
        voice: 'Santai, ramah, seperti ngobrol dengan teman',
        tone: 'Kasual, friendly, sedikit humor',
        audience: 'Anak muda 18-30 tahun yang suka gossip dan trending topics',
        style: 'Storytelling, pakai bahasa gaul, ajak interaksi ("kalian setuju gak?")',
        hashtag_style: '#trending #viral #redtalk'
    },
    'Kultur AI': {
        voice: 'Edukatif dan inspiratif tentang teknologi dan AI',
        tone: 'Profesional tapi accessible, tidak terlalu teknis',
        audience: 'Profesional, mahasiswa, tech enthusiasts usia 20-40 tahun',
        style: 'Jelaskan dengan analogi, future-focused, sertakan manfaat praktis',
        hashtag_style: '#AI #teknologi #digitaltransformation'
    },
    'Bersama Teddy': {
        voice: 'Personal, hangat, motivational',
        tone: 'Inspiratif, supportive, penuh empati',
        audience: 'Orang dewasa 25-45 tahun yang mencari motivasi dan pengembangan diri',
        style: 'Personal story, ajak refleksi, berikan actionable advice',
        hashtag_style: '#motivasi #pengembangandiri #inspirasiharini'
    },
    'Kami Meutya': {
        voice: 'Feminine, empowering, relatable',
        tone: 'Warm, supportive, authentic',
        audience: 'Perempuan muda 20-35 tahun, fokus lifestyle dan career',
        style: 'Relatable experiences, empowering message, honest + vulnerable',
        hashtag_style: '#perempuanindonesia #lifestyleblogger #empowerment'
    },
    'Bocahe Kaesang': {
        voice: 'Fun, playful, anak muda banget',
        tone: 'Ceria, lucu, santai',
        audience: 'Gen Z dan milenial 15-30 tahun',
        style: 'Bahasa gaul, meme-able, singkat dan punchy, banyak emoji',
        hashtag_style: '#genZ #viral #FYP'
    },
    'Team Pur': {
        voice: 'Energik, community-driven',
        tone: 'Enthusiastic, loyal, penuh semangat',
        audience: 'Fans klub/komunitas tertentu, semua usia',
        style: 'Solidaritas, bangga dengan achievements, ajak support bersama',
        hashtag_style: '#teampurwin #solidarity #fansclub'
    },
    'Motorell': {
        voice: 'Maskulin, teknis, passion untuk otomotif',
        tone: 'Knowledgeable, excited, detail-oriented',
        audience: 'Pria 20-45 tahun pecinta motor dan otomotif',
        style: 'Spesifikasi teknis, performa, review jujur, lifestyle branding',
        hashtag_style: '#motorindonesia #riderslife #otomotif'
    },
    'Fox Populi': {
        voice: 'Cerdas, kritis, sedikit sarkastis',
        tone: 'Witty, sharp, observant',
        audience: 'Educated millennials 25-40 tahun yang aware politik/sosial',
        style: 'Analisis tajam, humor cerdas, questioning mindset',
        hashtag_style: '#politik #sosial #kritissosial'
    },
    'Whats On': {
        voice: 'Update dan informatif tentang event/hiburan',
        tone: 'Excited, FOMO-inducing, helpful',
        audience: 'Anak muda 18-35 tahun yang aktif socializing',
        style: 'Quick info, event details, ajak action ("buruan daftar!")',
        hashtag_style: '#event #Jakarta #hiburan'
    },
    'Dakwah AI': {
        voice: 'Religius, bijaksana, menenangkan',
        tone: 'Respectful, wise, inspirational',
        audience: 'Muslim usia 20-50 tahun yang ingin belajar agama',
        style: 'Dalil + penjelasan, inspirasi spiritual, ajakan berbuat baik',
        hashtag_style: '#dakwah #islamicreminder #hijrah'
    },
    'Wisato ID': {
        voice: 'Adventurous, wanderlust-inducing',
        tone: 'Excited, descriptive, inspiring',
        audience: 'Traveler dan travel enthusiast 20-40 tahun',
        style: 'Deskripsi vivid, tips praktis, ajak explore, bikin pengen pergi',
        hashtag_style: '#travel #explorenusantara #wisataindonesia'
    },
    'Maxi Theory': {
        voice: 'Intelektual, thought-provoking',
        tone: 'Analytical, questioning, mind-expanding',
        audience: 'Thinkers, academics, lifelong learners 25-50 tahun',
        style: 'Deep analysis, berbagai perspektif, ajak berpikir kritis',
        hashtag_style: '#philosophy #deepthoughts #mindexpanding'
    }
}

// LLM Model Options (for copywriting)
export const LLM_MODELS = [
    { id: 'chatgpt-jina', label: 'ChatGPT + Jina AI (Web Scraping)' },
    { id: 'chatgpt-firecrawl', label: 'ChatGPT + Firecrawl (Web Scraping)' },
    { id: 'perplexity', label: 'Perplexity AI (All in One)' }
]

// Single Post content types (Image/Video only)
export const SINGLE_POST_TYPES = [
    { id: 'Image', label: 'Image' },
    { id: 'Video', label: 'Video' }
]

// 1 Click content types
export const ONE_CLICK_TYPES = [
    { id: 'Single Post Image', label: 'Single Post Image' },
    { id: 'Single Post Video', label: 'Single Post Video' },
    { id: 'Carousel Image', label: 'Carousel Image' },
    { id: 'Carousel Video', label: 'Carousel Video' },
    { id: 'Article', label: 'Article' }
]

// Fixed content types for specific tools
export const FIXED_CONTENT_TYPES = {
    carousel_tools: 'Image',
    clipper_tools: 'Clipper',
    downloader: 'Downloader'
}

// Tool name mapping
export const TOOL_NAMES = {
    single_post: 'Single Post',
    carousel_tools: 'Carousel Tools',
    clipper_tools: 'Clipper Tools',
    one_click: '1 Click',
    downloader: 'Downloader'
}

// Legacy
export const CONTENT_TYPES = SINGLE_POST_TYPES

// === Asset Config Helpers (reduce repetition) ===
const h = (hide) => ['text_1', 'text_2', 'text_3', 'text_4', 'text_5', 'image_1', 'image_2', 'image_3', 'image_4', 'image_5', 'video_1', 'video_2', 'video_3', 'video_4', 'video_5'].filter(f => !Object.keys(hide).includes(f))

const coverImg = (labels) => ({ ui_style: 'none', hide_fields: h(labels), labels })
const articleConfig = () => ({ ui_style: 'none', hide_fields: h({ text_1: 'Title', text_2: 'Content', image_1: 'Featured Image' }), labels: { text_1: 'Article Title', text_2: 'Body Content', image_1: 'Featured Image' } })
const FOX_OPTIONS = [
    { name: 'Fox Pede', url: 'https://www.dropbox.com/scl/fi/c6l22mw3bbfjdc5ffmccy/5.png?rlkey=00qpswyvbuhc9v1n2rgqjh6ir&st=7siupteq&dl=1' },
    { name: 'Fox Kaget', url: 'https://www.dropbox.com/scl/fi/ivy0ait4x350ipukvudzb/4.png?rlkey=zyl40mpnpwo3hdtg51h2g1gsu&st=9f9vlvp1&dl=1' },
    { name: 'Fox Ketawa', url: 'https://www.dropbox.com/scl/fi/yg7jgs090b4ehki67nqxa/1-1.png?rlkey=hynpzo281jc5v97ap4juj3lyx&st=j7hu3t03&dl=1' },
    { name: 'Fox Senyum', url: 'https://www.dropbox.com/scl/fi/j8y2m707dv0bnansqo02o/3.png?rlkey=zwxkevw43sw3wr1jgst3aqk47&st=ut6wbs45&dl=1' },
    { name: 'Fox Sedih', url: 'https://www.dropbox.com/scl/fi/ywic8andm8g8pkhcy2mm4/2-1.png?rlkey=ggc4zxl5ac5q2z5rkolmjpjoi&st=egtphrhg&dl=1' },
    { name: 'Fox Love', url: 'https://www.dropbox.com/scl/fi/j18aikds1ri6nqedvikv5/love.png?rlkey=o58d1dbtbmv1skt9kw6o0bvew&st=6wb5k53e&dl=1' }
]
const foxGrid = (labels) => ({ label: 'Pilih Ekspresi Fox', param_name: 'image_5', ui_style: 'grid', hide_fields: h(labels).filter(f => f !== 'image_5'), labels, options: FOX_OPTIONS })

// === UNIVERSAL TEMPLATES (ALL MEDIA) ===
const UNIVERSAL_TEMPLATES = [
    {
        id: 'universal_carousel_video',
        display_name: 'Carousel Video (Universal)',
        backend_value: 'universal_carousel_video', // N8N Mapping Required
        type_category: 'Video',
        asset_config: coverImg({
            video_1: 'Input Link Video (mp4/mov)'
        })
    }
]

// === TEMPLATES ===
export const TEMPLATES = {
    'Raga Plus ID': [
        {
            id: 'raga_article_standard', display_name: 'Standard Article', backend_value: 'raga article standard', type_category: 'Article',
            asset_config: articleConfig()
        },
        {
            id: 'raga_cover_white', display_name: 'Headline / Cover Carousel (white)', backend_value: 'raga cover carousel (putih)', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama' })
        },
        {
            id: 'raga_cover_black', display_name: 'Headline / Cover Carousel (black)', backend_value: 'raga cover carousel (hitam)', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama' })
        },
        {
            id: 'raga_cover_white_circle_ka', display_name: 'Headline / Cover Carousel (white) with circle kanan atas', backend_value: 'raga cover carousel (putih) with circle kanan atas', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_cover_white_circle_kb', display_name: 'Headline / Cover Carousel (white) with circle kiri bawah', backend_value: 'raga cover carousel (putih) with circle kiri bawah', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_cover_black_circle_kia', display_name: 'Headline / Cover Carousel (black) with circle kiri atas', backend_value: 'raga cover carousel (hitam) with circle kiri atas', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_cover_black_circle_kab', display_name: 'Headline / Cover Carousel (black) with circle kanan bawah', backend_value: 'raga cover carousel (hitam) with circle kanan bawah', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_slide_white', display_name: 'Slide Carousel (white)', backend_value: 'raga slide carousel (putih)', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'raga_slide_black', display_name: 'Slide Carousel (black)', backend_value: 'raga slide carousel (hitam)', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'raga_slide_white_circle', display_name: 'Slide Carousel (white) with circle', backend_value: 'raga slide carousel (putih) with circle', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_slide_black_circle', display_name: 'Slide Carousel (black) with circle', backend_value: 'raga slide carousel (hitam) with circle', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_repurpose_landscape', display_name: 'Repurpose (landscape)', backend_value: 'raga video repurpose landscape', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'raga_repurpose_portrait', display_name: 'Repurpose (portrait)', backend_value: 'raga video repurpose portrait', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'raga_repurpose_square', display_name: 'Repurpose (square)', backend_value: 'raga video repurpose square', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'raga_moment', display_name: 'Moment (1 image)', backend_value: 'raga moment 1 gambar', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Kosongkan bagian TEXT', image_1: 'Image Utama' })
        },
        { id: 'raga_football', display_name: 'Football Result', backend_value: 'raga football result', type_category: 'Image', asset_config: null },
        { id: 'raga_badminton', display_name: 'Badminton Result', backend_value: 'raga badmin result', type_category: 'Image', asset_config: null }
    ],
    'Red Talks ID': [
        {
            id: 'rt_cover', display_name: 'Headline / Cover Carousel', backend_value: 'rt image article / cover', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'rt_cover_circle_kanan', display_name: 'Headline / Cover Carousel (white) with circle kanan', backend_value: 'rt image article with circle kanan', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'rt_cover_circle_kiri', display_name: 'Headline / Cover Carousel (white) with circle kiri', backend_value: 'rt image article with circle kiri', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'rt_slide', display_name: 'Slide Carousel', backend_value: 'rt slide carousel', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'rt_slide_circle', display_name: 'Slide Carousel with circle', backend_value: 'rt carousel with circle', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'rt_repurpose_square', display_name: 'Repurpose (square)', backend_value: 'rt video repurpose square', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'rt_moment', display_name: 'Moment (1 image)', backend_value: 'rt moment 1 gambar', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Kosongkan bagian TEXT', image_1: 'Image Utama' })
        },
        { id: 'rt_football', display_name: 'Football Result', backend_value: 'rt result', type_category: 'Image', asset_config: null }
    ],
    'Kultur AI': [
        {
            id: 'kultur_cover_image', display_name: 'Headline / Cover Carousel (image)', backend_value: 'kultur cover image', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image Utama' })
        },
        {
            id: 'kultur_cover_video', display_name: 'Headline / Cover Carousel (video)', backend_value: 'kultur cover video', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", video_1: 'Video (URL)' })
        },
        {
            id: 'kultur_cover_circle_ka', display_name: 'Headline / Cover Carousel with circle kanan atas', backend_value: 'kultur cover carousel with circle kanan atas', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'kultur_cover_circle_kia', display_name: 'Headline / Cover Carousel with circle kiri atas', backend_value: 'kultur cover carousel with circle kiri atas', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'kultur_cover_circle_kab', display_name: 'Headline / Cover Carousel with circle kanan bawah', backend_value: 'kultur cover carousel with circle kanan bawah', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'kultur_slide', display_name: 'Slide Carousel', backend_value: 'kultur slide carousel', type_category: 'Image',
            asset_config: coverImg({
                text_1: 'Sub-Headline (Judul Utama)',
                text_2: 'Narasi Slide 1',
                text_3: 'Narasi Slide 2',
                text_4: 'Narasi Slide 3',
                text_5: 'Narasi Slide 4',
                text_6: 'Narasi Slide 5 (CTA)',
                image_1: 'Image Utama'
            })
        },
        {
            id: 'kultur_slide_circle', display_name: 'Slide Carousel with circle', backend_value: 'kultur slide carousel with circle', type_category: 'Image',
            asset_config: coverImg({
                text_1: 'Sub-Headline (Hook)',
                text_2: 'Narasi Slide 1',
                text_3: 'Narasi Slide 2',
                text_4: 'Narasi Slide 3',
                text_5: 'Narasi Slide 4',
                text_6: 'Narasi Slide 5 (CTA)',
                image_1: 'Image Utama',
                image_2: 'Image Circle'
            })
        },
        {
            id: 'kultur_slide_2img_lr', display_name: 'Slide Carousel with 2 image (kiri kanan)', backend_value: 'kultur slide carousel 2 image kiri kanan', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Sub-Headline (Hook)', text_2: 'Narasi Carousel', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image 1 (Kiri)', image_2: 'Image 2 (Kanan)' })
        },
        {
            id: 'kultur_slide_2img_tb', display_name: 'Slide Carousel with 2 image (atas bawah)', backend_value: 'kultur slide carousel 2 image atas bawah', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Sub-Headline (Hook)', text_2: 'Narasi Carousel', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image 1 (Atas)', image_2: 'Image 2 (Bawah)' })
        }
    ],
    'Bersama Teddy': [
        {
            id: 'teddy_cover', display_name: 'Headline / Cover Carousel', backend_value: 'img article bersamateddy', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'teddy_cover_circle', display_name: 'Headline / Cover Carousel with circle', backend_value: 'img article bersamateddy with circle', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'teddy_clipper_landscape', display_name: 'Clipper (landscape)', backend_value: 'clipper teddy landscape', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'teddy_clipper_portrait', display_name: 'Clipper (portrait)', backend_value: 'clipper teddy full portrait', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'teddy_clipper_square', display_name: 'Clipper (square)', backend_value: 'clipper teddy square', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'teddy_repurpose', display_name: 'Repurpose', backend_value: 'repurpose bersamateddy', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        }
    ],
    'Kami Meutya': [
        {
            id: 'meutya_cover', display_name: 'Headline / Cover Carousel', backend_value: 'img article kamimeutya', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'meutya_cover_circle', display_name: 'Headline / Cover Carousel with circle', backend_value: 'img article kamimeutya with circle', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'meutya_clipper_landscape', display_name: 'Clipper (landscape)', backend_value: 'clipper meutya landscape', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'meutya_clipper_portrait', display_name: 'Clipper (portrait)', backend_value: 'clipper meutya full portrait', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'meutya_clipper_square', display_name: 'Clipper (square)', backend_value: 'clipper meutya square', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'meutya_repurpose', display_name: 'Repurpose', backend_value: 'repurpose kamimeutya', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        }
    ],
    'Bocahe Kaesang': [
        {
            id: 'kaesang_cover', display_name: 'Headline / Cover Carousel', backend_value: 'img article bocahekaesang', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'kaesang_cover_circle', display_name: 'Headline / Cover Carousel with circle', backend_value: 'img article bocahekaesang with circle', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'kaesang_clipper_landscape', display_name: 'Clipper (landscape)', backend_value: 'clipper kaesang landscape', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'kaesang_clipper_portrait', display_name: 'Clipper (portrait)', backend_value: 'clipper kaesang full portrait', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'kaesang_clipper_square', display_name: 'Clipper (square)', backend_value: 'clipper kaesang square', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'kaesang_repurpose', display_name: 'Repurpose', backend_value: 'repurpose bocahekaesang', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        }
    ],
    'Team Pur': [
        {
            id: 'pur_cover', display_name: 'Headline / Cover Carousel', backend_value: 'img article teampur', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'pur_cover_circle', display_name: 'Headline / Cover Carousel with circle', backend_value: 'img article teampur with circle', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'pur_clipper_landscape', display_name: 'Clipper (landscape)', backend_value: 'clipper purbaya landscape', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'pur_clipper_portrait', display_name: 'Clipper (portrait)', backend_value: 'clipper purbaya portrait', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'pur_clipper_square', display_name: 'Clipper (square)', backend_value: 'clipper purbaya square', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'pur_repurpose', display_name: 'Repurpose', backend_value: 'repurpose teampur', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        }
    ],
    'Motorell': [
        {
            id: 'motorell_cover', display_name: 'Headline / Cover Carousel', backend_value: 'motorell cover carousel', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama' })
        },
        {
            id: 'motorell_cover_circle_kiri', display_name: 'Headline / Cover Carousel with circle kiri', backend_value: 'motorell cover carousel with circle kiri', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'motorell_cover_circle_kanan', display_name: 'Headline / Cover Carousel with circle kanan', backend_value: 'motorell cover carousel with circle kanan', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'motorell_slide', display_name: 'Slide Carousel', backend_value: 'motorell slide carousel', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Sub-Headline (Hook)', text_2: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'motorell_repurpose_portrait', display_name: 'Repurpose (portrait)', backend_value: 'motorell clipper portrait', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'motorell_repurpose_square', display_name: 'Repurpose (square)', backend_value: 'motorell clipper square', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'motorell_cta', display_name: 'CTA', backend_value: 'motorell cta', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook atau CTA)', image_1: 'Image (Motor)', credit_text: 'Source / Credit (Skip aja biarkan kosong)' })
        }
    ],
    'Fox Populi': [
        {
            id: 'fox_cover_kiri', display_name: 'Headline / Cover Carousel (Fox di kiri)', backend_value: 'fox cover carousel karakter kiri', type_category: 'Image',
            asset_config: foxGrid({ text_1: 'Headline', image_1: 'Image Utama' })
        },
        {
            id: 'fox_cover_kanan', display_name: 'Headline / Cover Carousel (Fox di kanan)', backend_value: 'fox cover carousel karakter kanan', type_category: 'Image',
            asset_config: foxGrid({ text_1: 'Headline', image_1: 'Image Utama' })
        },
        {
            id: 'fox_cover_circle_kiri', display_name: 'Headline / Cover Carousel (Circle kiri)', backend_value: 'fox cover carousel with circle kiri', type_category: 'Image',
            asset_config: foxGrid({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'fox_cover_circle_kanan', display_name: 'Headline / Cover Carousel (Circle kanan)', backend_value: 'fox cover carousel with circle kanan', type_category: 'Image',
            asset_config: foxGrid({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'fox_slide', display_name: 'Slide Carousel', backend_value: 'fox slide carousel', type_category: 'Image',
            asset_config: foxGrid({ text_1: 'Sub-Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'fox_repurpose_kanan', display_name: 'Repurpose (Fox di kanan)', backend_value: 'fox repurpose portrait (positive)', type_category: 'Video',
            asset_config: foxGrid({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'fox_repurpose_kiri', display_name: 'Repurpose (Fox di kiri)', backend_value: 'fox repurpose square (negative)', type_category: 'Video',
            asset_config: foxGrid({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'fox_repurpose_tengah', display_name: 'Repurpose (Fox di tengah)', backend_value: 'fox repurpose square (neutral)', type_category: 'Video',
            asset_config: foxGrid({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        }
    ],
    'Whats On': [
        {
            id: 'whatson_cover', display_name: 'Headline / Cover Carousel', backend_value: 'whatson cover carousel', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'whatson_cover_circle_kiri', display_name: 'Headline / Cover Carousel with circle kiri', backend_value: 'whatson cover carousel with circle kiri', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'whatson_cover_circle_kanan', display_name: 'Headline / Cover Carousel with circle kanan', backend_value: 'whatson cover carousel with circle kanan', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'whatson_slide', display_name: 'Slide Carousel', backend_value: 'whatson slide carousel', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'whatson_repurpose_portrait', display_name: 'Repurpose (portrait)', backend_value: 'whatson repurpose portrait', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline Utama', text_2: 'Narasi 1 (Kosongkan jika tidak perlu) / mulai detik 3-7', text_3: 'Narasi 2 (Kosongkan jika tidak perlu) / mulai detik 9-13', text_4: 'Narasi 3 (Kosongkan jika tidak perlu) / mulai detik 14-18', text_5: 'Narasi 4 (Kosongkan jika tidak perlu) / mulai detik 19-24', video_1: 'Video (URL)' })
        },
        {
            id: 'whatson_repurpose_square', display_name: 'Repurpose (square)', backend_value: 'whatson repurpose square', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline Utama', text_2: 'Narasi 1 (Kosongkan jika tidak perlu) / mulai detik 3-7', text_3: 'Narasi 2 (Kosongkan jika tidak perlu) / mulai detik 9-13', text_4: 'Narasi 3 (Kosongkan jika tidak perlu) / mulai detik 14-18', text_5: 'Narasi 4 (Kosongkan jika tidak perlu) / mulai detik 19-24', video_1: 'Video (URL)' })
        }
    ],
    'Dakwah AI': [
        {
            id: 'dakwah_cover', display_name: 'Headline / Cover Carousel', backend_value: 'dakwah cover carousel', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'dakwah_cover_circle_kiri', display_name: 'Headline / Cover Carousel with circle kiri', backend_value: 'dakwah cover carousel with circle kiri', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'dakwah_cover_circle_kanan', display_name: 'Headline / Cover Carousel with circle kanan', backend_value: 'dakwah cover carousel with circle kanan', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'dakwah_slide', display_name: 'Slide Carousel', backend_value: 'dakwah slide carousel', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Sub-Headline (Judul Utama)', text_2: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'dakwah_clipper_portrait', display_name: 'Clipper (portrait)', backend_value: 'dakwah repurpose portrait', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'dakwah_clipper_square', display_name: 'Clipper (square)', backend_value: 'dakwah repurpose square', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        }
    ],
    'Wisato ID': [
        {
            id: 'wisato_cover', display_name: 'Headline / Cover Carousel', backend_value: 'wisato cover carousel', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'wisato_cover_circle_kiri', display_name: 'Headline / Cover Carousel with circle kiri', backend_value: 'wisato cover carousel with circle kiri', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'wisato_cover_circle_kanan', display_name: 'Headline / Cover Carousel with circle kanan', backend_value: 'wisato cover carousel with circle kanan', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'wisato_slide', display_name: 'Slide Carousel', backend_value: 'wisato slide carousel', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'wisato_clipper_portrait', display_name: 'Clipper (portrait)', backend_value: 'wisato repurpose portrait', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'wisato_clipper_square', display_name: 'Clipper (square)', backend_value: 'wisato repurpose square', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        }
    ],
    'Maxi Theory': [
        {
            id: 'max_cover', display_name: 'Headline / Cover Carousel', backend_value: 'max cover carousel', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'max_cover_circle_kiri', display_name: 'Headline / Cover Carousel with circle kiri', backend_value: 'max cover carousel with circle kiri', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'max_cover_circle_kanan', display_name: 'Headline / Cover Carousel with circle kanan', backend_value: 'max cover carousel with circle kanan', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'max_slide', display_name: 'Slide Carousel', backend_value: 'max slide carousel', type_category: 'Image',
            asset_config: coverImg({ text_1: 'Sub-Headline (Judul Utama)', text_2: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'max_repurpose_narasi', display_name: 'Repurpose (portrait) dengan Narasi', backend_value: 'max repurpose portrait dengan narasi', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline Utama', text_2: 'Narasi 1 (Kosongkan jika tidak perlu) / mulai detik 5-10', text_3: 'Narasi 2 (Kosongkan jika tidak perlu) / mulai detik 10-15', text_4: 'Narasi 3 (Kosongkan jika tidak perlu) / mulai detik 15-20', text_5: 'Narasi 4 (Kosongkan jika tidak perlu) / mulai detik 20-25', video_1: 'Video (URL)' })
        },
        {
            id: 'max_repurpose_tanpa', display_name: 'Repurpose (portrait) tanpa Narasi', backend_value: 'max repurpose portrait tanpa narasi', type_category: 'Video',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        }
    ]
}

// Helper function to get templates for a media
export function getTemplatesForMedia(mediaName) {
    const specific = TEMPLATES[mediaName] || []
    return [...specific, ...UNIVERSAL_TEMPLATES]
}

// Helper function to get visible fields for a template
export function getVisibleFields(template) {
    if (!template?.asset_config) return []
    const config = template.asset_config
    const allFields = ['text_1', 'text_2', 'text_3', 'text_4', 'text_5', 'image_1', 'image_2', 'image_3', 'image_4', 'image_5', 'video_1', 'video_2', 'video_3', 'video_4', 'video_5', 'credit_text']
    const hidden = config.hide_fields || []
    return allFields.filter(f => !hidden.includes(f) && config.labels?.[f])
}

// Helper function to get field label
export function getFieldLabel(template, fieldName) {
    if (!template?.asset_config?.labels) return fieldName
    return template.asset_config.labels[fieldName] || fieldName
}

/*
 * === HOW TO ADD NEW MEDIA / TEMPLATES ===
 * 
 * 1. Add media name to MEDIA_LIST array
 * 2. Add entry in TEMPLATES object with the media name as key
 * 3. Each template needs: id, display_name, backend_value, type_category, asset_config
 * 4. For asset_config, use coverImg() helper:
 *    - coverImg({ text_1: 'Label', image_1: 'Label' })
 *    - Only list the fields you WANT to show. All others are auto-hidden.
 * 5. For grid/picker UI (like Fox Populi), use foxGrid() helper or create custom config with:
 *    { label, param_name, ui_style: 'grid', hide_fields, labels, options: [{name, url}] }
 * 6. type_category: 'Image' or 'Video' (determines which fields are relevant)
 * 7. For templates without input (like Football Result), set asset_config: null
 */
