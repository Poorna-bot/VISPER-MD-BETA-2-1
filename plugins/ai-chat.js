
const { GoogleGenAI } = require('@google/genai');
const crypto = require('crypto');
const config = require('../config');
const os = require('os');
const axios = require('axios');
const mimeTypes = require("mime-types");
const fs = require('fs');
const path = require('path');
const { cmd, commands } = require('../command');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions');

const DEFAULT_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAfeTpfPr04kNmgDMcE6m1gxgtF4m2Fl1k";

// --- SYSTEM PROMPT (Logic for Language & Pricing) ---
let usp = `<?xml version="1.0" encoding="UTF-8"?>
<system_prompt>
    <persona_and_tone>
        You are "Ovnix AI", the official virtual assistant for Ovnix (Web Development Company in Sri Lanka).
        Services: Web Design, Full-stack Development, WhatsApp Bot Development.
        Tone: Professional and Helpful.
    </persona_and_tone>

    <interaction_logic>
        1. **Language Check (First Message):** පළමු පණිවිඩයේදීම "Please select your language / කරුණාකර භාෂාවක් තෝරන්න: 1. English, 2. සිංහල" ලෙස අසන්න. 
           පරිශීලකයා 1 හෝ 2 තෝරන තෙක් වෙනත් තොරතුරු ලබා නොදෙන්න.

        2. **Pricing:** මිල ගණන් (Price/Cost) ඇසූ විට: "මිල ගණන් සහ පැකේජ පිළිබඳ වැඩිදුර තොරතුරු ලබාදීමට අපගේ ආයතනික නිලධාරියෙකු ඔබව සම්බන්ධ කරගනු ඇත. (Our official representative will contact you shortly regarding pricing.)" ලෙස පවසන්න.

        3. **Lead Capture:** නම සහ අවශ්‍යතාවය විමසා ඒවා ලබාගත් පසු: "ස්තූතියි! ඔබ ලබාදුන් තොරතුරු අප වෙත ලැබුණා. අපේ නියෝජිතයෙකු ඉතා ඉක්මනින් ඔබව සම්බන්ධ කර ගනු ඇත. එතෙක් කරුණාකර රැඳී සිටින්න." ලෙස පවසා සංවාදය අවසන් කරන්න.
    </interaction_logic>
</system_prompt>`;

const chatHistory = new Map();
const disabledChats = new Set();
const MY_NUMBER = "94724375368@s.whatsapp.net"; // ඔබේ WhatsApp අංකය

// --- HELPER FUNCTIONS ---
function getAiClient() {
    return new GoogleGenAI({ apiKey: DEFAULT_API_KEY });
}

function cleanRawGeminiOutput(text) {
    if (!text) return "";
    return text.replace(/<.*?>/g, "").trim();
}

function getUserHistory(userId) {
    if (!chatHistory.has(userId)) chatHistory.set(userId, []);
    return chatHistory.get(userId);
}

function addToHistory(userId, role, partsArray) {
    const history = getUserHistory(userId);
    history.push({ role: role === 'user' ? 'user' : 'model', parts: partsArray });
    if (history.length > 10) history.splice(0, history.length - 10);
}

async function getGeminiResponse(prompt, userId, options = {}) {
    const ai = getAiClient();
    try {
        let history = getUserHistory(userId);
        let messageParts = [{ text: prompt }];

        if (options.img) {
            messageParts.push({ inlineData: { mimeType: "image/jpeg", data: options.img.toString('base64') }});
        }

        const model = ai.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: usp 
        });

        const result = await model.generateContent({
            contents: [...history, { role: 'user', parts: messageParts }]
        });

        let reply = cleanRawGeminiOutput(result.response.text());
        addToHistory(userId, 'user', messageParts);
        addToHistory(userId, 'model', [{ text: reply }]);

        return { status: true, text: reply };
    } catch (error) {
        return { status: false, error: error.message };
    }
}

// --- COMMANDS ---

// Manual Gemini Command
cmd({
    pattern: "gem",
    react: "🎊",
    desc: "AI chat",
    category: "ai",
    use: ".gem <query>",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, prefix }) => {
    const userMessage = args.join(" ");
    if (!userMessage) return await reply(`*Example:* \`${prefix}gem hello\``);
    const response = await getGeminiResponse(userMessage, m.sender);
    if (response.status) await reply(response.text);
});

// --- AUTO CHATBOT LOGIC ---
cmd({ on: "body" },
    async (conn, mek, m, { from, body, isCmd, sender, reply, pushname }) => {
        try {
            if (config.CHAT_BOT !== "true" || m.fromMe || isCmd) return;
            
            // පණිවිඩය අංකයක් පමණක් නම් (භාෂාව තේරීම සඳහා) එය AI වෙත යැවිය යුතුය
            // එබැවින් isNaN(m.body) චෙක් එක ඉවත් කර ඇත.

            if (disabledChats.has(m.sender)) return;

            let inputText = m.body || m.imageMessage?.caption || "";
            const imageBuffer = (m.type === 'imageMessage' || m.quoted?.type === 'imageMessage') ? await m.download() : null;

            const response = await getGeminiResponse(inputText, m.sender, { img: imageBuffer });

            if (response.status) {
                await reply(response.text);

                // පරීක්ෂා කිරීම: නිලධාරියෙකු සම්බන්ධ වන බව පවසා ඇත්නම් බොට්ව OFF කරන්න
                const stopKeywords = ["සම්බන්ධ වෙයි", "නියෝජිතයෙකු", "representative", "contact you", "ස්තූතියි"];
                const shouldDisable = stopKeywords.some(kw => response.text.includes(kw));

                if (shouldDisable) {
                    // 1. දැනුම්දීමක් එවීම
                    const notificationMsg = `🔔 *Ovnix AI Notification* 🔔\n\n👤 *Customer:* ${pushname}\n📱 *Number:* ${m.sender.split('@')[0]}\n\n⚠️ බොට් මේ පරිශීලකයා සඳහා අක්‍රිය කරන ලදී. කරුණාකර ඔබ මැදිහත් වන්න.`;
                    await conn.sendMessage(MY_NUMBER, { text: notificationMsg });

                    // 2. Chatbot එක Disable කිරීම
                    disabledChats.add(m.sender);
                }
            }
        } catch (e) {
            console.error("Ovnix AI Error:", e);
        }
    }
);
