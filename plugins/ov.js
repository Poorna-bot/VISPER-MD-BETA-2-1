const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const config = require('../config')
const os = require('os')
const axios = require('axios');
const mimeTypes = require("mime-types");
const fs = require('fs');
const path = require('path');
const { generateForwardMessageContent, prepareWAMessageFromContent, generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const { URL } = require('url');

// 1. Gemini AI Setup
const genAI = new GoogleGenerativeAI("AIzaSyAfeTpfPr04kNmgDMcE6m1gxgtF4m2Fl1k");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Bot එක Off කළ යුතු Chat IDs තාවකාලිකව තබා ගැනීමට
let disabledChats = new Set();

// 2. Ovnix Company Training Context
const COMPANY_CONTEXT = `
ඔබ "Ovnix AI" සහායකයා වේ. ඔබ ශ්‍රී ලංකාවේ "Ovnix" නම් වෙබ් සංවර්ධන ආයතනය නියෝජනය කරයි.
සේවාවන්: Web Design, Full-stack Dev, WhatsApp Bot Development.
මිල ගණන්: රු. 25,000 සිට ඉහළට.

විශේෂ උපදෙස්:
- පාරිභෝගිකයා වෙබ් අඩවියක් ගැන විමසූ විට ඔවුන්ගේ නම සහ අවශ්‍යතාවය අසන්න.
- ඔවුන් තොරතුරු ලබා දුන් පසු "ස්තූතියි! අපේ නියෝජිතයෙකු ඉතා ඉක්මනින් ඔබව සම්බන්ධ කර ගනු ඇත. එතෙක් කරුණාකර රැඳී සිටින්න." යනුවෙන් පවසා සංවාදය අවසන් කරන්න.
`;

// 3. The Main Logic
cmd({ on: "body" },
    async (conn, mek, m, { from, body, isCmd, isOwner, pushname, reply }) => {
        try {
            // පණිවිඩය Command එකක් නම්, Bot ගෙන් ආ එකක් නම් හෝ මෙම Chat එකට Bot Off කර ඇත්නම් නතර කරන්න
            if (isCmd || m.key.fromMe || !body || disabledChats.has(from)) return;

            // AI එක වැඩ කරන බව පෙන්වීමට Typing status
            await conn.sendPresenceUpdate('composing', from);

            // Gemini AI එකෙන් පිළිතුර ලබා ගැනීම
            const prompt = `${COMPANY_CONTEXT}\n\nUser (${pushname}): ${body}\nAI:`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const aiText = response.text();

            // WhatsApp හරහා පිළිතුර යැවීම
            await conn.sendMessage(from, { text: aiText }, { quoted: mek });

            // 4. AI එක වැඩේ අවසන් කළ බව හඳුනා ගැනීම (Trigger words)
            const triggerWords = ["සම්බන්ධ කර ගනු ඇත", "රැඳී සිටින්න", "contact you", "stay tuned"];
            const shouldDisable = triggerWords.some(word => aiText.toLowerCase().includes(word));

            if (shouldDisable) {
                // ඔබගේ (Admin) අංකයට Alert එකක් යැවීම
                const adminMsg = `📢 *Ovnix Alert:* පාරිභෝගිකයෙක් (${pushname}) විස්තර ලබා දී ඇත.\nAI එක ඔවුන්ව දැනුවත් කර අවසන්. දැන් ඔබට මැදිහත් විය හැකියි.\nNumber: ${from.split('@')[0]}`;
                await conn.sendMessage(conn.user.id, { text: adminMsg });

                // මෙම Chat එක සඳහා Bot Disable කිරීම
                disabledChats.add(from);
                console.log(`[SYSTEM] Bot disabled for: ${from}`);
            }

        } catch (e) {
            console.error("AI Error: ", e);
            // 404 Error එකක් ආවොත් model එක gemini-pro ලෙස මාරු කර උත්සාහ කිරීමට මෙතැනින් පුළුවනි
        }
    }
);

// 5. නැවත Bot On කිරීමට Command එක (.bot-on)
cmd({
    pattern: "bot-on",
    desc: "නැවත Chatbot ක්‍රියාත්මක කිරීමට",
    category: "owner",
    use: '.bot-on',
    filename: __filename
},
async (conn, mek, m, { from, reply, isOwner }) => {
    if (!isOwner) return reply("❌ ඔබට මෙම Command එක භාවිතා කිරීමට අවසර නැත.");
    
    if (disabledChats.has(from)) {
        disabledChats.delete(from);
        return reply("✅ Ovnix AI නැවත ක්‍රියාත්මක කරන ලදී.");
    } else {
        return reply("ℹ️ Bot දැනටමත් ක්‍රියාත්මකයි.");
    }
});
