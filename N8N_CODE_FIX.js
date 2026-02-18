const items = $input.all();
const resultCards = [];

for (const item of items) {
    const json = item.json;
    let content = null;

    /* --- 1. PARSING --- */
    let rawText = "";
    if (json.choices && json.choices[0] && json.choices[0].message) {
        rawText = json.choices[0].message.content;
    } else if (json.output) {
        rawText = json.output;
    } else {
        content = json;
    }

    if (!content && rawText) {
        try {
            if (typeof rawText === 'string') {
                const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
                content = JSON.parse(cleaned);
            } else {
                content = rawText;
            }
        } catch (e) {
            content = { text_1: rawText };
        }
    }

    /* --- 2. NORMALIZE (FIXED FOR 'FIELDS' WRAPPER) --- */
    let cardsArray = [];
    let isCarouselImage = false;

    if (Array.isArray(content)) {
        cardsArray = content;
    } else if (content && typeof content === 'object') {
        if (Array.isArray(content.cards)) {
            cardsArray = content.cards;
        } else if (Array.isArray(content.slides)) {
            isCarouselImage = true;
            cardsArray = content.slides;
        } else if (content.fields) {
            // --- FIX: Handle wrapper 'fields' yang muncul di screenshot ---
            // Jika outputnya { fields: { text_1: "..." } }
            cardsArray = Array.isArray(content.fields) ? content.fields : [content.fields];
        } else if (Array.isArray(content.data)) {
            cardsArray = content.data;
        } else if (Array.isArray(content.items)) {
            cardsArray = content.items;
        } else if (content["0"] && (Array.isArray(content["0"]) || typeof content["0"] === 'object')) {
            if (Array.isArray(content["0"])) cardsArray = content["0"];
            else cardsArray = Object.values(content);
        } else {
            const vals = Object.values(content);
            if (vals.length > 0 && (vals[0].text_1 || vals[0].headline || vals[0].card_type)) {
                cardsArray = vals;
            }
        }
    }

    /* --- 3. MAPPING --- */
    // Pastikan ambil Media dari item.json.media atau fallback
    const mediaName = json.media || item.json.media || "Media Not Found";

    if (isCarouselImage) {
        // ... Logika Carousel Image (Sama seperti sebelumnya) ...
        const credit = content.credit_text || "";
        resultCards.push({
            media: mediaName, type: 'Carousel Image', card_type: 'Cover',
            text_1: content.cover_headline || content.headline, credit_text: credit
        });
        cardsArray.forEach((slideText, idx) => {
            resultCards.push({
                media: mediaName, type: 'Carousel Image', card_type: `Slide ${idx + 1}`,
                text_1: typeof slideText === 'string' ? slideText : (slideText.text_1 || slideText),
                credit_text: credit
            });
        });
    }
    else if (cardsArray.length > 0) {
        cardsArray.forEach((cardItem, idx) => {
            if (Array.isArray(cardItem)) cardItem = cardItem[0];
            // FIX: Handle jika cardItem adalah string (biar gak blank)
            if (typeof cardItem === 'string') {
                resultCards.push({
                    media: mediaName, type: 'Carousel Video', card_type: 'Standard',
                    text_1: cardItem, text_2: '', credit_text: ''
                });
                return;
            }

            resultCards.push({
                media: mediaName,
                type: json.type || 'Carousel Video',
                card_type: cardItem.card_type || (idx === 0 ? 'Headline' : 'Slide'),
                text_1: cardItem.text_1 || cardItem.headline || '',
                text_2: cardItem.text_2 || cardItem.caption || cardItem.body || (cardItem.narration || ''),
                credit_text: cardItem.credit_text || ''
            });
        });
    }
    else {
        // Fallback C (Last Resort)
        // Cek apakah content memiliki fields di root level (jika normalisasi gagal tapi struktur flat)
        resultCards.push({
            media: mediaName,
            type: json.type || 'Image',
            card_type: 'Standard',
            // FIX: Cek content.fields.text_1 juga untuk safety
            text_1: content.text_1 || content.headline || content.fields?.text_1 || (typeof content === 'string' ? content : ""),
            text_2: content.text_2 || content.fields?.text_2 || "",
            credit_text: content.credit_text || ''
        });
    }
}

return { cards: resultCards };
