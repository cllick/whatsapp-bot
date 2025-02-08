const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ["WhatsApp Bot", "Chrome", "1.0"]
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update;
        if (qr) {
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") {
            console.log("✅ Bot terhubung ke WhatsApp!");
        }
    });

    sock.ev.on("messages.upsert", async (msg) => {
    const message = msg.messages[0];
    if (!message.message || message.key.fromMe) return;

    const sender = message.key.remoteJid;
    const text = message.message.conversation || message.message.extendedTextMessage?.text;

    console.log(`📩 Pesan diterima dari ${sender}: ${text}`);

    // ✅ Tambahkan lebih dari satu keyword
    const keywords = ["kehadiran", "jadwal"]; // Tambahkan keyword di sini
    const isMatchingKeyword = keywords.some((kw) => text?.toLowerCase().includes(kw));

    if (isMatchingKeyword) {
        const target = "120363228624527147@g.us"; // Ganti dengan ID grup tujuan
        await sock.sendMessage(target, { text: `${text}` });
        console.log(`➡️ Pesan diteruskan ke ${target}`);
    }
});

    sock.ev.on("creds.update", saveCreds);
}

connectToWhatsApp();
