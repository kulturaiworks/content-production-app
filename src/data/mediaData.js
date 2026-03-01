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
    { name: 'Fox Sedih', url: 'https://www.dropbox.com/scl/fi/ywic8andm8g8pkhcy2mm4/2-1.png?rlkey=ggc4zxl5ac5q2z5rkolmjpjoi&st=egtphrhg&dl=1' },
    { name: 'Fox Love', url: 'https://www.dropbox.com/scl/fi/j18aikds1ri6nqedvikv5/love.png?rlkey=o58d1dbtbmv1skt9kw6o0bvew&st=6wb5k53e&dl=1' }
]
const foxGrid = (labels) => ({ label: 'Pilih Ekspresi Fox', param_name: 'image_5', ui_style: 'grid', hide_fields: h(labels).filter(f => f !== 'image_5'), labels, options: FOX_OPTIONS })

// === UNIVERSAL TEMPLATES (ALL MEDIA) ===
export const UNIVERSAL_TEMPLATES = [
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
            id: 'raga_cover_white', display_name: 'Cover Carousel (white)', backend_value: 'raga cover carousel (putih)', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/grsmgzv1gxv004ggorswm/db00a6d9-c556-4e03-b7b8-ded1fa711c04.png?rlkey=afsamjuqnn5h1tu2pqrhtlg87&st=vh8e4hho&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama' })
        },
        {
            id: 'raga_cover_black', display_name: 'Cover Carousel (black)', backend_value: 'raga cover carousel (hitam)', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/ovl03rh8ofrepyk7qdwiw/e73036d0-109a-4a88-b97a-7f965eb5f068.png?rlkey=94xz77le6gi2ggefpvczet0pk&st=10955cs9&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama' })
        },
        {
            id: 'raga_cover_white_circle_ka', display_name: 'Cover (white) + circle kanan atas', backend_value: 'raga cover carousel (putih) with circle kanan atas', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/c3duio8sxk8of7qhh3adh/670b149b-f49d-4258-84b0-69d7fec96632.png?rlkey=2y38xnf33arx44ffx7hzssmmh&st=d4zkddy9&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_cover_white_circle_kb', display_name: 'Cover (white) + circle kiri bawah', backend_value: 'raga cover carousel (putih) with circle kiri bawah', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/9qrtw1gqeno5qhzemojj8/f957f394-da73-4b3b-8f06-cabb8769f692.png?rlkey=fk1zn7ayeqvjblbt0tjsamhta&st=g34k90rf&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_cover_black_circle_kia', display_name: 'Cover (black) + circle kiri atas', backend_value: 'raga cover carousel (hitam) with circle kiri atas', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/z1njm61lu38jbvcpu4arr/1441310a-a0cc-435f-9d46-d001f12d822e.png?rlkey=lkntpojcsx64g29y9eztipvil&st=8l182f7n&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_cover_black_circle_kab', display_name: 'Cover (black) + circle kanan bawah', backend_value: 'raga cover carousel (hitam) with circle kanan bawah', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/ery0a3sw7dlmvj9wsl5s1/8072d0c5-613a-404d-9efb-663391ea2ea4.png?rlkey=vn67ysn1k4dybou35kiidey58&st=qxi1uh0l&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_slide_white', display_name: 'Slide Carousel (white)', backend_value: 'raga slide carousel (putih)', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/uqtpwq44qvbmfnzhik06g/f456d7e5-4de7-4394-a630-6da59f13f258.jpg?rlkey=ecdke25lo2p4xtm3tvsylgu2c&st=rbdrtgcz&dl=1',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'raga_slide_black', display_name: 'Slide Carousel (black)', backend_value: 'raga slide carousel (hitam)', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/op5m1xjhb5d950q64wqyf/d10a6bc9-ae90-4ae3-ae85-9e15be2a9623.jpg?rlkey=xskxqyb4j11yx2p4nh0eroce3&st=q4k7e0uk&dl=1',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'raga_slide_white_circle', display_name: 'Slide (white) + circle', backend_value: 'raga slide carousel (putih) with circle', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/sgflomi2ewxmuio5pobtu/f44c7a49-1f26-46da-9f5e-e503dbc166b7.jpg?rlkey=b60afv61cfqk3iyz0r5mhc8nz&st=lw3hv2cm&dl=1',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_slide_black_circle', display_name: 'Slide (black) + circle', backend_value: 'raga slide carousel (hitam) with circle', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/yix62aonimq8hbn1t97q0/23bae031-5676-4904-9c2d-abe95ca8eaca.jpg?rlkey=c3ummwi35q797zdrzm7vtodsg&st=pug5qpjs&dl=1',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'raga_repurpose_landscape', display_name: 'Repurpose (landscape)', backend_value: 'raga video repurpose landscape', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/3ze32hk2vvkzke5b924ex/2.png?rlkey=0iw7aw2qf9s253ysjfagx7iyn&st=vjov00hh&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'raga_repurpose_portrait', display_name: 'Repurpose (portrait)', backend_value: 'raga video repurpose portrait', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/caed9e2c6pi51rsqduxp7/1.png?rlkey=xf76mtmufc9k0av5quwiyzdrs&st=h0pdicho&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'raga_repurpose_square', display_name: 'Repurpose (square)', backend_value: 'raga video repurpose square', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/j8y2m707dv0bnansqo02o/3.png?rlkey=zwxkevw43sw3wr1jgst3aqk47&st=or5sa2vj&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'raga_moment', display_name: 'Moment (1 image)', backend_value: 'raga moment 1 gambar', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/di5mdrl8ncl2p2ys1ac3z/a023d83f-c1bc-45b9-960f-14e7f16d2b34.png?rlkey=1gzb0ds0vmnpnqb65gjuqi5pv&st=6ntqondi&dl=1',
            asset_config: coverImg({ text_1: 'Kosongkan bagian TEXT', image_1: 'Image Utama' })
        },
        {
            id: 'raga_football', display_name: 'Football Result', backend_value: 'raga football result', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/38ioeyuvtzxtzkkyydq61/0a2a4d2d-22c3-4d54-839a-11a8bcf2e8a8.png?rlkey=tbbxu70ohhw9st1b0vtqusyhh&st=pwwutp5d&dl=1',
            asset_config: null
        },
        {
            id: 'raga_badminton', display_name: 'Badminton Result', backend_value: 'raga badmin result', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/cngoka1zpaxqknk21ecj8/d2f31a07-f5fb-49cb-969d-601442dee154.jpg?rlkey=e5eml1qlqjygaka7lahcnfuaj&st=n6zxllxa&dl=1',
            asset_config: null
        }
    ],
    'Red Talks ID': [
        {
            id: 'rt_cover', display_name: 'Cover Carousel', backend_value: 'rt image article / cover', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/33gfx4vbfu9099wndaq9e/edbda48f-5fb8-4b14-ac18-1b110d9084df.png?rlkey=10d9ensuxgqqdo958ybh2dsqc&st=sk4matbp&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'rt_cover_circle_kanan', display_name: 'Cover + circle kanan', backend_value: 'rt image article with circle kanan', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/7t21azaxv8xldya9n4ctx/6bd89d48-7fee-4aa1-bc23-841d13f89d04.png?rlkey=uxomzbac2vssfnrnkc9iq6eg2&st=o91jlo7o&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'rt_cover_circle_kiri', display_name: 'Cover + circle kiri', backend_value: 'rt image article with circle kiri', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/dyequthr0mdf3633j6ia3/86dd732f-21ea-4940-9116-1857930d3096.png?rlkey=1qni5mpkgo5zxfjwaitqk1sb0&st=hs6vmyie&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'rt_slide', display_name: 'Slide Carousel', backend_value: 'rt slide carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/fr7rj6if390jwqcxuni9x/a756ca35-e059-40db-be9c-2f283382889d.png?rlkey=drlvjpgx7np9ofgmuecr84n7c&st=i5wq0lrb&dl=1',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'rt_slide_circle', display_name: 'Slide + circle', backend_value: 'rt carousel with circle', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/t2pnqg9wfhrooda3gyx95/eae1d4f9-89a2-45ca-adef-58104e2bcbd3.png?rlkey=i6k6c67s9n28p5lg1j9pz8e0l&st=6pc2t2ds&dl=1',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'rt_repurpose_square', display_name: 'Repurpose (square)', backend_value: 'rt video repurpose square', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/wfjygwn1ujecng774g4nj/hhh.PNG?rlkey=4hwpnrs49hbw2y2t3ox3jlbl2&st=nq2z16zs&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'rt_moment', display_name: 'Moment (1 image)', backend_value: 'rt moment 1 gambar', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/17oqtjbzefypekky15ryf/85e25cbe-771e-460d-93b3-4beccf53e5c1.png?rlkey=buy7x1ew4u6uj3pnq5fii80ow&st=kdwyqkso&dl=1',
            asset_config: coverImg({ text_1: 'Kosongkan bagian TEXT', image_1: 'Image Utama' })
        },
        {
            id: 'rt_football', display_name: 'Football Result', backend_value: 'rt result', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/3uta4r2b0wuumak4nf4hm/1ac681a8-c013-4fec-91dd-6a20cbc907b4.png?rlkey=sr8zkejmtnaihr3ia7fqjtrkq&st=dfydz5y3&dl=1',
            asset_config: null
        },
        {
            id: 'rt_quote', display_name: 'Quote', backend_value: 'rt quote', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/zl65a7ifnkx5f1vjm5e0d/f2f9c94d-494e-4d51-a163-6f61b5d85a24.png?rlkey=3z8wkxmsl5b43tfwcus0ipm4f&st=eke3z5f1&dl=1',
            asset_config: coverImg({ text_1: 'Quote Text', image_1: 'Image Utama' })
        }
    ],
    'Kultur AI': [
        {
            id: 'kultur_cover_image', display_name: 'Cover (image)', backend_value: 'kultur cover image', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/eivorq7d98m9mw9yegkuh/l2.png?rlkey=trbpdcxipu6hdsvy6s930im8p&st=t5o91r5o&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image Utama' })
        },
        {
            id: 'kultur_cover_video', display_name: 'Cover (video)', backend_value: 'kultur cover video', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/rsjpg7897y77p7twmdvjs/l1.PNG?rlkey=srjnwe62ti0z5j99ytajfkik5&st=uytdcdmq&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", video_1: 'Video (URL)' })
        },
        {
            id: 'kultur_cover_circle_ka', display_name: 'Cover + circle kanan atas', backend_value: 'kultur cover carousel with circle kanan atas', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/klciesskue17gf5eidax4/l8.png?rlkey=a6wr7gtcaaovev19sbdhc3r4m&st=fqgq71xc&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'kultur_cover_circle_kia', display_name: 'Cover + circle kiri atas', backend_value: 'kultur cover carousel with circle kiri atas', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/ktjlbjo9acye0cwidv0g4/l3.png?rlkey=g722hlk2saq49ssl1sbt7mxw2&st=lv8o5tvb&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'kultur_cover_circle_kab', display_name: 'Cover + circle kanan bawah', backend_value: 'kultur cover carousel with circle kanan bawah', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/45edczc01fifr0d50pknr/l7.png?rlkey=7zr14x3j84my1y5d1najt29cw&st=5l14z78b&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'kultur_slide', display_name: 'Slide Carousel', backend_value: 'kultur slide carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/uwue9blh90el4oi9rpwma/l9.png?rlkey=1vsvaqbu61q0xndzj3u1v63iw&st=vtol1iwr&dl=1',
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
            id: 'kultur_slide_circle', display_name: 'Slide + circle', backend_value: 'kultur slide carousel with circle', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/7n67kkszwf7basn4mcw2w/l4.png?rlkey=oa6fot4w2skysnqn3xcmrkxhl&st=uwuzme89&dl=1',
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
            id: 'kultur_slide_2img_lr', display_name: 'Slide 2 image (kiri kanan)', backend_value: 'kultur slide carousel 2 image kiri kanan', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/xu9uw0ux2j85n1ngrl0b7/l6.png?rlkey=carmn0g6b631oweqg7aw6txsd&st=38906x6g&dl=1',
            asset_config: coverImg({ text_1: 'Sub-Headline (Hook)', text_2: 'Narasi Carousel', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image 1 (Kiri)', image_2: 'Image 2 (Kanan)' })
        },
        {
            id: 'kultur_slide_2img_tb', display_name: 'Slide 2 image (atas bawah)', backend_value: 'kultur slide carousel 2 image atas bawah', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/tdpd5n3f1lcacr8wxj7bx/l5.png?rlkey=sukehyybjqtg7i17chx8eg7ip&st=ews0k3lu&dl=1',
            asset_config: coverImg({ text_1: 'Sub-Headline (Hook)', text_2: 'Narasi Carousel', text_3: "CTA: 'Geser Kiri' atau 'Lanjut di Caption'", image_1: 'Image 1 (Atas)', image_2: 'Image 2 (Bawah)' })
        },
        {
            id: 'kultur_video_repurpose', display_name: 'Repurpose', backend_value: 'kultur repurpose', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/eorx1w97xovboz74s1jke/l11.png?rlkey=bfepvw6k57of30dtbgbwljd20&st=3k00lcfb&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'kultur_slide_video', display_name: 'Slide Video', backend_value: 'kultur slide video', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/c9oaniuhq346hc3ingwch/l33.png?rlkey=jicqb4o36mj0v7t5j4b9cboq2&st=uff03h5r&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        }
    ],
    'Bersama Teddy': [
        {
            id: 'teddy_cover', display_name: 'Cover Carousel', backend_value: 'img article bersamateddy', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/eyvffcpw1priz3dc75a9y/70ae7d0c-bfe4-4aed-90a7-6f203208caa7.png?rlkey=00o2k9s74vmdroby424vp8hpn&st=vwlguvj4&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'teddy_cover_circle', display_name: 'Cover + circle', backend_value: 'img article bersamateddy with circle', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/q31lfmoyp8dtzlh0ga6tw/96062a6d-8b07-4c54-9729-11f24943e898.png?rlkey=wfp3jsys32liol6aefuh958uc&st=4lcxatc6&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'teddy_clipper_portrait', display_name: 'Repurpose (portrait)', backend_value: 'clipper teddy full portrait', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/ud0dni1p1877p14q6dr97/t1.PNG?rlkey=4gyplb3jl95zwbi1j0gnecwuy&st=15l7pil9&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'teddy_clipper_square', display_name: 'Repurpose (square)', backend_value: 'clipper teddy square', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/fyohz0iz1t2erzlzevqkq/t2.PNG?rlkey=1ykn1a1h1l73kd5w03b753ioe&st=hof00uez&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        }
    ],
    'Kami Meutya': [
        {
            id: 'meutya_cover', display_name: 'Cover Carousel', backend_value: 'img article kamimeutya', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/wjwqe7krck6ltnrwssbzb/84550ec8-1981-438a-b879-c50668030d2f.png?rlkey=7p4izxxvjg4ot0qq8px1myxvk&st=e9y285r3&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'meutya_cover_circle', display_name: 'Cover + circle', backend_value: 'img article kamimeutya with circle', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/rhsb51e7wvjeucjmousrz/38bef6f1-b684-4b52-a19b-1b71ca18fa2d.png?rlkey=91xe83cm5q0rmwvgk51kt25mo&st=nx3i63s7&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'meutya_clipper_landscape', display_name: 'Repurpose (landscape)', backend_value: 'clipper meutya landscape', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/bx2xs08el7fk7jritm674/mh3.PNG?rlkey=158kh5534tpncz6i1jmqu8obz&st=8jl2ywsm&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'meutya_clipper_portrait', display_name: 'Repurpose (portrait)', backend_value: 'clipper meutya full portrait', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/fginv58lniwh1b00pc6t1/mh1.PNG?rlkey=z009zdh0wor9yuvy6ivgj6bhn&st=61ijki3x&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'meutya_clipper_square', display_name: 'Repurpose (square)', backend_value: 'clipper meutya square', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/9qqubgofowspe2q5k7fxo/mh2.PNG?rlkey=4hb4shq0wyye8ffwza0og0oou&st=le39w1wl&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        }
    ],
    'Bocahe Kaesang': [
        {
            id: 'kaesang_cover', display_name: 'Cover Carousel', backend_value: 'img article bocahekaesang', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/lnma8xvfu4s546o4s1c4f/58a308ec-ee07-42e5-958c-ba4083136f55.png?rlkey=s12f0lo4b6w9d4t0hmpirn1bp&st=q4h4ei3z&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'kaesang_cover_circle', display_name: 'Cover + circle', backend_value: 'img article bocahekaesang with circle', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/k9vhney9uahluc19k7x0i/f22ca53b-079e-41b6-be2f-16855f2d91dd.png?rlkey=xfhk2rm6lvn0nqur7g601ec6h&st=0g4z2gob&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'kaesang_clipper_landscape', display_name: 'Repurpose (landscape)', backend_value: 'clipper kaesang landscape', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/pshkvqdj1z0q4onf0ixkt/k2.PNG?rlkey=no5atiszd2bc2oz2sx5igdvi2&st=4wcgefd4&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'kaesang_clipper_portrait', display_name: 'Repurpose (portrait)', backend_value: 'clipper kaesang full portrait', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/l61tr1mj9m84d3arn95kg/K3.PNG?rlkey=gsfgqfmx9vj0r2rpvd5y6wboo&st=osebj8xa&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'kaesang_clipper_square', display_name: 'Repurpose (square)', backend_value: 'clipper kaesang square', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/jcc8z0wv5lp2nyr0f2v6d/k1.PNG?rlkey=eppa237lzyc9idnyo65iy1c7p&st=66m3s9et&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        }
    ],
    'Team Pur': [
        {
            id: 'pur_cover', display_name: 'Cover Carousel', backend_value: 'img article teampur', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/0hetkpwm4e8b1nrzlkcjr/p1.png?rlkey=u3wk1yxee9ohuoec2njr4mjny&st=inn66z07&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'pur_cover_circle', display_name: 'Cover + circle', backend_value: 'img article teampur with circle', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/fq07pflw9l50iqsf8c6lk/p2.png?rlkey=3dza98p4qy6xf98saamzrusq5&st=t89257wr&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'pur_clipper_landscape', display_name: 'Clipper (landscape)', backend_value: 'clipper purbaya landscape', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/3pc9k8x4emxymqb3zakxy/pp3.PNG?rlkey=czyrtm01y3xeyxx7ni1eueusa&st=xmkw6dtw&dl=0',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'pur_clipper_portrait', display_name: 'Clipper (portrait)', backend_value: 'clipper purbaya portrait', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/bpnt0kdwvjf3xbo0upas3/pp1.PNG?rlkey=kc2pb4rhx8an29lbh9ul0p7mr&st=jtwv7mjg&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        },
        {
            id: 'pur_clipper_square', display_name: 'Clipper (square)', backend_value: 'clipper purbaya square', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/qw63tgfl4lekhhnzo2tzm/pp2.PNG?rlkey=x85tidwy2xungzjxb2iv6bkxl&st=jvhus4fd&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', text_2: 'Sub-Headline (Jika dibutuhkan)', video_1: 'Video (URL)' })
        }
    ],
    'Motorell': [
        {
            id: 'motorell_cover', display_name: 'Cover Carousel', backend_value: 'motorell cover carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/jebjros7k6a6cf10qnpkq/0b1cb52a-f7f2-442c-b0d8-49f4de428d46.jpg?rlkey=fuayw0idq1geaqja9p8nvn812&st=eu1w7ew8&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama' })
        },
        {
            id: 'motorell_cover_circle_kiri', display_name: 'Cover + circle kiri', backend_value: 'motorell cover carousel with circle kiri', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/my5sw483ru4q3n1zbxhvf/0d95ad96-fda4-4b55-86fe-65b62cfe45e1.jpg?rlkey=yl7q304379yim8fcetmitqg8b&st=nalu2f90&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'motorell_cover_circle_kanan', display_name: 'Cover + circle kanan', backend_value: 'motorell cover carousel with circle kanan', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/oxccucmwlzhyza5t6nl1e/7b5f5a16-1804-4d86-a553-bb9f1e2bce9a.jpg?rlkey=6pycc0kmhcgehynhfc815eifh&st=zhfdrnun&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'motorell_slide', display_name: 'Slide Carousel', backend_value: 'motorell slide carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/f9u6p75hs309tgv57c966/92e442fc-feb9-4035-9ced-a26204bee2f4.jpg?rlkey=w65gywme13sneck2oxev4en42&st=o4pjsraf&dl=1',
            asset_config: coverImg({ text_1: 'Sub-Headline (Hook)', text_2: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'motorell_repurpose_portrait', display_name: 'Repurpose (portrait)', backend_value: 'motorell clipper portrait', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/xt9k5j553ltktmwt7utus/M1.PNG?rlkey=rpgx0alrubad3rm1hmemdnllb&st=4sqkr66z&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'motorell_repurpose_square', display_name: 'Repurpose (square)', backend_value: 'motorell clipper square', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/8fnh6i29s52sqgeajg7ed/M2.PNG?rlkey=fn6f28abp0wjrfy90uwhfs81z&st=0mlik3ly&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', text_2: 'Sub-Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'motorell_cta', display_name: 'CTA', backend_value: 'motorell cta', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/gltdgahu3ahsp59ovg5r4/a77288e4-6c75-422d-9742-7bd348528d92.jpg?rlkey=73c6h1ucnsgjw6vagkxsby69b&st=y1qcz3oc&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook atau CTA)', image_1: 'Image (Motor)', credit_text: 'Source / Credit (Skip aja biarkan kosong)' })
        }
    ],
    'Fox Populi': [
        {
            id: 'fox_cover_kiri', display_name: 'Cover (Fox kiri)', backend_value: 'fox cover carousel karakter kiri', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/z9rmsysomtrhy9zc983a8/foxpopuli_cover-carousel-karakter-di-kiri.jpg?rlkey=pmupixsw72jfdajrx02y4x12l&st=dkt2wxie&dl=1',
            asset_config: foxGrid({ text_1: 'Headline', image_1: 'Image Utama' })
        },
        {
            id: 'fox_cover_kanan', display_name: 'Cover (Fox kanan)', backend_value: 'fox cover carousel karakter kanan', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/ibusfeuhvw2rhg9so9l6r/foxpopuli_cover-carousel-karakter-di-kanan.jpg?rlkey=9o2r4p8u7ndimjlndixjaqp4u&st=dwpgh1eb&dl=1',
            asset_config: foxGrid({ text_1: 'Headline', image_1: 'Image Utama' })
        },
        {
            id: 'fox_cover_circle_kiri', display_name: 'Cover + circle kiri', backend_value: 'fox cover carousel with circle kiri', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/hxatuv945f9u4w4z6cq7v/foxpopuli_cover-carousel-with-circle-kiri.png?rlkey=93ncet0jpkcqbml22uyiausbc&st=jsjdci1i&dl=1',
            asset_config: foxGrid({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'fox_cover_circle_kanan', display_name: 'Cover + circle kanan', backend_value: 'fox cover carousel with circle kanan', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/miyofqbefjv90u8n5txqh/foxpopuli_cover-carousel-with-circle-kanan.png?rlkey=fb46zxhkpjo9354i1cawjz8qc&st=xrqvyt2f&dl=1',
            asset_config: foxGrid({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'fox_slide', display_name: 'Slide Carousel', backend_value: 'fox slide carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/l5jw3cqyuix4gptl54ru0/foxpopuli_slide-carousel.png?rlkey=djjhdpy3qwmpeiq7midy2zz6z&st=r1uykio4&dl=1',
            asset_config: foxGrid({ text_1: 'Sub-Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'fox_repurpose_kanan', display_name: 'Repurpose (Fox kanan)', backend_value: 'fox repurpose portrait (positive)', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/085imoewp0m5b8eabf3mx/F3.PNG?rlkey=njz6c9ltv8vcad3dmv9pksc7z&st=t94j8jz4&dl=1',
            asset_config: foxGrid({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'fox_repurpose_kiri', display_name: 'Repurpose (Fox kiri)', backend_value: 'fox repurpose square (negative)', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/i5s4jxiwuaumo2m8b1fog/F1.PNG?rlkey=57td2xhhkmyf62yabg7c9qcqx&st=rmrhlzj4&dl=1',
            asset_config: foxGrid({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'fox_repurpose_tengah', display_name: 'Repurpose (Fox tengah)', backend_value: 'fox repurpose square (neutral)', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/n0e8d521wwj0dr0phavbp/F2.PNG?rlkey=i893wotninsxhgafvbfbtg59a&st=ubwmuw72&dl=1',
            asset_config: foxGrid({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        }
    ],
    'Whats On': [
        {
            id: 'whatson_cover', display_name: 'Cover Carousel', backend_value: 'whatson cover carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/1nrbebfvzn75knkxhk4pg/508a4cdd-d9c2-40e6-bc72-e2554b389fbf.jpg?rlkey=g2fmidzweois7j13g7waqyzpb&st=ifyubh3p&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'whatson_cover_circle_kiri', display_name: 'Cover + circle kiri', backend_value: 'whatson cover carousel with circle kiri', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/2kwgh935eh2zvlrc6pa26/17ae6647-e9fc-4e3e-b8cf-433333f8439d.jpg?rlkey=ecxord20tsut28yphvmhnc38f&st=7q5lk0s2&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'whatson_cover_circle_kanan', display_name: 'Cover + circle kanan', backend_value: 'whatson cover carousel with circle kanan', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/oxpqi2jjrdbea9mt5vsat/0c0837c9-ae05-42a1-aad9-bb0dfa75cb64.jpg?rlkey=mvml7oo3lzfhi2pk8j6wqzy79&st=cuv0r13x&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'whatson_slide', display_name: 'Slide Carousel', backend_value: 'whatson slide carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/ojsa6yyi2eb2702b1547q/28e1e09f-5863-402a-a5da-0486c31c36da.jpg?rlkey=cta25c9kflz51laf012xys3x0&st=e5s3uqze&dl=1',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'whatson_repurpose_portrait_narasi', display_name: 'Repurpose (portrait) dengan Narasi', backend_value: 'whatson repurpose portrait', type_category: 'Video',
            preview_image: [
                'https://www.dropbox.com/scl/fi/jbc3j72xawt1tsg0kmngo/wo1.PNG?rlkey=51whwiu1s6m7hn7i6have0vwm&st=la8e5lm6&dl=1',
                'https://www.dropbox.com/scl/fi/vuztedgof77kok33r59z4/wo2.PNG?rlkey=s87s0wh4tyf3gvylhnx1wakxh&st=wdjhgq98&dl=1'
            ],
            asset_config: coverImg({ text_1: 'Headline Utama', text_2: 'Narasi 1 (Kosongkan jika tidak perlu) / mulai detik 3-7', text_3: 'Narasi 2 (Kosongkan jika tidak perlu) / mulai detik 9-13', text_4: 'Narasi 3 (Kosongkan jika tidak perlu) / mulai detik 14-18', text_5: 'Narasi 4 (Kosongkan jika tidak perlu) / mulai detik 19-24', video_1: 'Video (URL)' })
        },
        {
            id: 'whatson_repurpose_square', display_name: 'Repurpose (portrait) tanpa Narasi', backend_value: 'whatson repurpose square', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/jbc3j72xawt1tsg0kmngo/wo1.PNG?rlkey=51whwiu1s6m7hn7i6have0vwm&st=la8e5lm6&dl=1',
            asset_config: coverImg({ text_1: 'Headline Utama', text_2: 'Narasi 1 (Kosongkan jika tidak perlu) / mulai detik 3-7', text_3: 'Narasi 2 (Kosongkan jika tidak perlu) / mulai detik 9-13', text_4: 'Narasi 3 (Kosongkan jika tidak perlu) / mulai detik 14-18', text_5: 'Narasi 4 (Kosongkan jika tidak perlu) / mulai detik 19-24', video_1: 'Video (URL)' })
        }
    ],
    'Dakwah AI': [
        {
            id: 'dakwah_cover', display_name: 'Cover Carousel', backend_value: 'dakwah cover carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/rxesoe9a9xk5xjab1432r/d6.jpg?rlkey=eml0p5ohawbrnu3rsir1l0e8z&st=30rcnm05&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'dakwah_cover_circle_kiri', display_name: 'Cover + circle kiri', backend_value: 'dakwah cover carousel with circle kiri', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/2ntxlbcajcnemt0ohru1k/d1.jpg?rlkey=f24t5o0s8rhuh5mf0i3ac772y&st=xokcbzrq&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'dakwah_cover_circle_kanan', display_name: 'Cover + circle kanan', backend_value: 'dakwah cover carousel with circle kanan', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/aggv6jxi51yj2q744xsv2/d7.jpg?rlkey=fa3tbttpmnai1wlweoie2pgwu&st=m0v2vhcf&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'dakwah_slide', display_name: 'Slide Carousel', backend_value: 'dakwah slide carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/z9uh12m5bangoza7sahi0/d2.png?rlkey=irmkm8po7xn735e5neo00wyjm&st=98x9dylq&dl=1',
            asset_config: coverImg({ text_1: 'Sub-Headline (Judul Utama)', text_2: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'dakwah_clipper_portrait', display_name: 'Repurpose (portrait)', backend_value: 'dakwah repurpose portrait', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/wtqkuvu1gt3sr1o8tbbri/d4.PNG?rlkey=96xzf58j4ie7l74xwqp3hnx1q&st=75utqsq3&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'dakwah_clipper_square', display_name: 'Repurpose (square)', backend_value: 'dakwah repurpose square', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/nfcdjmto59zm7o1ncxxar/d5.PNG?rlkey=g438t0bfcsftvbcfsmbwsksuk&st=zkc04rno&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'dakwah_quote_satu', display_name: 'Quote 1', backend_value: 'dakwah quote satu', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/fo2722bbmmbfgrangrbm6/q1.jpg?rlkey=yiuwwruh2qrzfz08noisienxc&st=49ndu3we&dl=1',
            asset_config: coverImg({ text_1: 'Quote Text', image_1: 'Image Utama' })
        },
        {
            id: 'dakwah_quote_dua', display_name: 'Quote 2', backend_value: 'dakwah quote dua', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/xusbh6ecmeu4h1zr0kn4a/quote-2.jpg?rlkey=l569wpd3xch2mmv3x35f06pwf&st=7n7jfcnv&dl=1',
            asset_config: coverImg({ text_1: 'Quote Text', image_1: 'Image Utama' })
        }
    ],
    'Wisato ID': [
        {
            id: 'wisato_cover', display_name: 'Cover Carousel', backend_value: 'wisato cover carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/2050of2964ofpa4h22jow/wis-1.png?rlkey=3sl9dtpybxu6689dx5b5d1b2f&st=m82zg4b7&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'wisato_cover_circle', display_name: 'Cover Carousel (with circle)', backend_value: 'wisato cover carousel with circle', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/2sqpklmjtrv5n0jqihjmr/93116349-2cdf-49cf-9da9-646c23816a87.png?rlkey=clbq2zfhetddcupfzh09ifmiu&st=2sv84lof&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'wisato_slide', display_name: 'Slide Carousel', backend_value: 'wisato slide carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/vyyxamxe36iho7zco74g5/wis-2.png?rlkey=hswiy03ffocg5747d1tru0ps6&st=grn84bb0&dl=1',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'wisato_slide_circle', display_name: 'Slide Carousel (with circle)', backend_value: 'wisato slide carousel with circle', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/nl5eaeavsycsehnlvv7c5/wis-3.png?rlkey=cupmk7luqzd55buq2fhcci3zj&st=kd6d4xn5&dl=1',
            asset_config: coverImg({ text_1: 'Narasi Carousel', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'wisato_repurpose', display_name: 'Repurpose', backend_value: 'wisato repurpose', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/eaaxf2h4wt1c9onpc8r2h/53d0c7cb-ad31-49c8-912c-b97bffb1f438.png?rlkey=kf7at0q9aapykabk1jqsgjzb0&st=v0b5t5x3&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        }
    ],
    'Maxi Theory': [
        {
            id: 'max_cover', display_name: 'Cover Carousel', backend_value: 'max cover carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/hhe17e2qnzs0r3x4cf2ae/dd982043-e345-4974-bcf7-db2fcf923d1e.jpg?rlkey=kfzjhsaciez18glx5tp1kl4yr&st=2sjgsw68&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama' })
        },
        {
            id: 'max_cover_circle_kiri', display_name: 'Cover + circle kiri', backend_value: 'max cover carousel with circle kiri', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/13qmp6qlo9d9puwl39emc/0f59f669-d9da-4f5e-938e-77f307236d68.jpg?rlkey=tzt9ivwvadxjekdol7ktu662h&st=h5zoyavm&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'max_cover_circle_kanan', display_name: 'Cover + circle kanan', backend_value: 'max cover carousel with circle kanan', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/jacflf7fix0cj0tmrqaxq/6e4e53ac-b839-4da9-8ae2-dfbc1d592ac1.jpg?rlkey=lp39vdp2yk9rd5ta2a0kri586&st=gv3eupmt&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Hook)', image_1: 'Image Utama', image_2: 'Image Circle' })
        },
        {
            id: 'max_slide', display_name: 'Slide Carousel', backend_value: 'max slide carousel', type_category: 'Image',
            preview_image: 'https://www.dropbox.com/scl/fi/pu1w34w42gq84z9p90ev9/d3664312-fb4b-43c7-b3c2-62912047791e.jpg?rlkey=u96ws1rxqywgzs0jz7068y1d5&st=goyn53sz&dl=1',
            asset_config: coverImg({ text_1: 'Sub-Headline (Judul Utama)', text_2: 'Narasi Carousel', image_1: 'Image Utama' })
        },
        {
            id: 'max_repurpose_narasi', display_name: 'Repurpose (portrait) dengan Narasi', backend_value: 'max repurpose portrait dengan narasi', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/1ob10wsac4obuco9fjij7/j3.PNG?rlkey=dej80tdi3nuwso7hr22xeawb1&st=ed988mqn&dl=1',
            asset_config: coverImg({ text_1: 'Headline Utama', text_2: 'Narasi 1 (Kosongkan jika tidak perlu) / mulai detik 5-10', text_3: 'Narasi 2 (Kosongkan jika tidak perlu) / mulai detik 10-15', text_4: 'Narasi 3 (Kosongkan jika tidak perlu) / mulai detik 15-20', text_5: 'Narasi 4 (Kosongkan jika tidak perlu) / mulai detik 20-25', video_1: 'Video (URL)' })
        },
        {
            id: 'max_repurpose_tanpa', display_name: 'Repurpose (portrait) tanpa Narasi', backend_value: 'max repurpose portrait tanpa narasi', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/hzle0wdyvfvipa12xn6k8/j2.PNG?rlkey=4l4q4idzzv3niqw7u6vjybtyy&st=tv6ptnq6&dl=1',
            asset_config: coverImg({ text_1: 'Headline (Judul Utama)', video_1: 'Video (URL)' })
        },
        {
            id: 'max_repurpose_tanpa_square', display_name: 'Repurpose (square) tanpa Narasi', backend_value: 'max repurpose square tanpa narasi', type_category: 'Video',
            preview_image: 'https://www.dropbox.com/scl/fi/812m6tsh8qtctxx4zdapj/jjj.PNG?rlkey=91vkvgk92yfqzf8yk4hd8owlo&st=4nv087aq&dl=1',
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
    const val = template.asset_config.labels[fieldName]
    // Handle object config (for dropdowns etc)
    if (typeof val === 'object' && val !== null) {
        return val.label || fieldName
    }
    return val || fieldName
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
