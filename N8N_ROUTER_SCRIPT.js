const body = $input.item.json.body;
// Handle string vs object case (Logic Sakti tadi)
let text = "";
if (typeof body === 'string') {
    try {
        const parsed = JSON.parse(body);
        text = parsed.text || "";
    } catch (e) { text = body; } // Siapa tau plain text
} else {
    text = body.text || "";
}

// Logic Router Channel
// Default ke #joy-clipper
let channel = "#joy-clipper";

if (text.includes("COPYWRITING REQUEST")) {
    // Arahkan ke channel copywriting
    // Pastikan nama channel ini BENAR dan App kamu SUDAH DI-INVITE ke channel ini!
    channel = "#joy-copywriting";
}
else if (text.includes("CLIP REQUEST")) {
    channel = "#joy-clipper";
}

// Return data asli + variable channel baru
return {
    json: {
        ...$input.item.json,
        slack_channel: channel
    }
};
