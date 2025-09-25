const config = require('../config')
const os = require('os')
const axios = require('axios');
const mimeTypes = require("mime-types");
const fs = require('fs');
const path = require('path');
const { generateForwardMessageContent, prepareWAMessageFromContent, generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const GEMINI_API_KEY = "AIzaSyB8xtFPtvG_N9S7bBZZOSfTyZW8rQyJQkY";
const { URL } = require('url');


cmd({
    pattern: "gemini",
    react: "👾",
    alias: ["geminiai", "geminichat", "ai2"],
    desc: "Use Gemini AI to get a response",
    category: "ai",
    use: "gemini < query >",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, prefix }) => {
    const userMessage = args.join(" ");
    if (!userMessage) return await reply(noInputMsg, `\`${prefix}gemini your question\``);

    try {
        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: userMessage }] }]
            }
        );

        const aiResponse = res.data.candidates[0].content.parts[0].text.trim();
        await reply(`${aiResponse}`);
    } catch (error) {
        console.error("Google Gemini API Error:", error.response?.data || error.message);
        await reply("❌ *Error connecting to Gemini AI. Please try again later.*");
    }
});


cmd({
 pattern: "imagen",
  alias: ["imggen", "dalle"],
  react: "🎨",
  desc: "Generate an AI image",
  category: "ai",
  filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
  try {
    if (!q) return reply("❗ Please provide a prompt.\nExample: `.image A futuristic city`");

    // Free image generation API (pollinations.ai)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(q)}`;

    await conn.sendMessage(from, { image: { url: imageUrl }, caption: `🖼️ AI Generated Image\nPrompt: ${q}\n\n ${config.FOOTER}` }, { quoted: mek });
  } catch (err) {
    reply("⚠️ Image generation failed.");
    console.error(err);
  }
});

    cmd({
        pattern: "blackbox",
    react: "👾",
    alias: ["bbox", "bb", "ai"],
    desc: "Use BlackBox AI to get a response",
    category: "ai",
    use: "blackbox < query >",
    filename: __filename
},
async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) {
            return await reply(queryMsg, '🧠');
        }

        const scraperData = await blackbox(q);
        const apiData = await fetchJson("https://api.siputzx.my.id/api/ai/blackboxai-pro?content=" + q);
        const result = scraperData ? scraperData : apiData?.data;
        await reply(result, `🧠`);

    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        console.error(e);
        await reply(errorMsg);
    }
});



