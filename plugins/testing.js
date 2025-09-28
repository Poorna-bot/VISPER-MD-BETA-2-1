const config = require('../config')
const l = console.log
const { cmd, commands } = require('../command')
const axios = require('axios');
const os = require("os");
const fs = require('fs-extra')
var videotime = 60000 // 1000 min
var sizetoo =  "This file size is too big"
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const yts = require("ytsearch-venom")
const { mimeTypes } = require('file-type')



cmd({
    pattern: "test",
    alias: ["play", "ytmp3", "yta", "lagu"],
    use: '.song <song name>',
    react: "🍟",
    desc: "Search & download yt song.",
    category: "download",
    filename: __filename
}, async (conn, mek, m, {
    from, reply
}) => {
    try {
        const cap = `test`;

        // Ensure these variables are defined somewhere before this block
       const prefix = "...";
       const data = { url: "..." };
      
await conn.sendMessage(from, {
    image: { url: config.LOGO },
    caption: cap,
    footer: config.FOOTER,
    buttons: [

        {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "Follow us",
                    url: "https://example.com",
                    merchant_url: "https://example.com",
                    type: 1
                }),
            },
        {
            buttonId: `.menu`,
            buttonText: { displayText: "`[Voice Note(Ptt) 🎧]`" },
            type: 1
        },
        {
            buttonId: `${prefix}ytaud ${data.url}`,
            buttonText: { displayText: "`[Audio Type 🎧]`" },
            type: 1
        },
        {
            buttonId: `${prefix}ytdoc ${data.url}`,
            buttonText: { displayText: "`[Document 📁]`" },
            type: 1
        },
        {
            buttonId: `${prefix}devilv ${data.url}`,
            buttonText: { displayText: "`[Video 📽️]`" },
            type: 1
        }
    ],
    headerType: 1,
    viewOnce: true,
}, { quoted: mek });


    } catch (e) {
        reply("🚩 Not Found !");
        console.error(e);
    }
});






cmd({
    pattern: "menu2",
    react: "🗄️",
    alias: ["panel", "list", "commands"],
    desc: "Get bot's command list.",
    category: "other",
    use: '.menu',
    filename: __filename
},

async (conn, mek, m, {
    from,
    pushname,
    reply
}) => {
    try {
        let hostname;

        if (os.hostname().length === 12) hostname = 'replit';
        else if (os.hostname().length === 36) hostname = 'heroku';
        else if (os.hostname().length === 8) hostname = 'koyeb';
        else hostname = os.hostname();

        const monspace = '```';
 const ramUsage = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem() / 1024 / 1024)}MB`;
    const uptime = await runtime(process.uptime());

    // Load external bot details
    const details = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;

        const MNG = `*🫟 VISPER MD - Bot Menu*

> *Uptime:* ${uptime}
> *RAM Usage:* ${ramUsage}
> *Platform:* ${hostname}
> *Version:* 2.0.1

*Now you can buy not only movies but everything else from this WhatsApp bot.*

📢 *Channel:* ${details.chlink}

📦 *Repo:* ${details.reponame}`;

        const buttons = [
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "Follow us",
                    url: "https://example.com",
                    merchant_url: "https://example.com"
                }),
            },
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Select a Category:",
                    sections: [
                        {
                            title: "SELECT MENU",
                            highlight_label: "VISPER-MD",
                            rows: [
                                {
                                    header: "1",
                                    title: "MAIN MENU",
                                    description: "Main menu",
                                    id: ".allmenu"
                                },
                                {
                                    header: "1",
                                    title: "DOWNLOAD MENU",
                                    description: "Download menu",
                                    id: ".downloadmenu"
                                },
                                {
                                    header: "1",
                                    title: "MOVIE MENU",
                                    description: "Movie menu",
                                    id: ".moviemenu"
                                },
                                {
                                    header: "1",
                                    title: "CONVERT MENU",
                                    description: "Convert menu",
                                    id: ".convertmenu"
                                },
                                {
                                    header: "1",
                                    title: "OWNER MENU",
                                    description: "Owner menu",
                                    id: ".ownermenu"
                                }
                            ]
                        }
                    ]
                })
            }
        ];

        const opts = {
            image: config.LOGO,
            header: '',
            footer: config.FOOTER,
            body: MNG
        };

        await conn.sendButtonMessage3(from, buttons, m, opts);

    } catch (e) {
        reply('*Error !!*');
        console.error(e);
    }
});




cmd({
    pattern: "tvsub",
    react: '🔎',
    category: "tvshow",
    alias: ["tvsearch"],
    desc: "Search for TV shows on subtv.netlify.app",
    use: ".tvsub Zorro",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // Check premium status
        const pr = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;
        const isFree = pr.mvfree === "true";

        if (!isFree && !isMe && !isPre) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, {
                text: "*`You are not a premium user⚠️`*\n\n" +
                      "*Send a message to one of the 2 numbers below and buy Lifetime premium 🎉.*\n\n" +
                      "_Price: 200 LKR ✔️_\n\n" +
                      "*👨‍💻Contact us: 0778500326, 0722617699*"
            }, { quoted: mek });
        }

        // Check if command is blocked
        if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: "*This command currently only works for the Bot owner. To disable it for others, use the .settings command 👨‍🔧.*" }, { quoted: mek });
        }

        if (!q) return await reply('*Please provide a search query! E.g., .tvsub Zorro*');

        // Encode query and fetch search results
        const encodedQuery = encodeURIComponent(q.trim());
        const searchUrl = `https://subtv.netlify.app/api/search/search?text=${encodedQuery}`;
        console.log(`Fetching from URL: ${searchUrl}`); // Debug: Log the API URL
        const searchResults = await fetchJson(searchUrl);

        // Debug: Log the raw API response
        console.log('API Response:', JSON.stringify(searchResults, null, 2));

        // Handle different API response structures
        let results = [];
        if (Array.isArray(searchResults)) {
            results = searchResults;
        } else if (searchResults && Array.isArray(searchResults.results)) {
            results = searchResults.results;
        } else if (searchResults && Array.isArray(searchResults.data)) {
            results = searchResults.data;
        } else {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: '*Invalid API response format. Please try again later or contact support.*' }, { quoted: mek });
        }

        if (results.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: '*No TV shows found for your query. Try a different search term.*' }, { quoted: mek });
        }

        // Prepare search results for display
        const srh = results.map(item => ({
            title: (item.title || item.name || 'Unknown Title').replace("Sinhala Subtitles | සිංහල උපසිරසි සමඟ", "").trim(),
            description: item.description || '',
            rowId: prefix + 'tvepisodes ' + (item.link || item.url)
        }));

        const sections = [{
            title: "subtv.netlify.app results",
            rows: srh
        }];

        const listMessage = {
            text: `_*SUBTV TV SHOW SEARCH RESULTS 📺*_\n\n*\`Input:\`* ${q}`,
            footer: config.FOOTER,
            title: 'subtv.netlify.app results 📺',
            buttonText: '*Reply Below Number 🔢*',
            sections
        };

        const caption = `_*SUBTV TV SHOW SEARCH RESULTS 📺*_\n\n*\`Input:\`* ${q}`;

        // Button mode for search results
        const rowss = results.map(item => ({
            title: (item.title || item.name || 'Unknown Title').replace(/WEBDL|WEB DL|BluRay HD|BluRay SD|BluRay FHD|Telegram BluRay SD|Telegram BluRay HD|Direct BluRay SD|Direct BluRay HD|Direct BluRay FHD|FHD|HD|SD|Telegram BluRay FHD/gi, "").trim() || "No info",
            id: prefix + `tvepisodes ${item.link || item.url}`
        }));

        const listButtons = {
            title: "Choose a TV Show :)",
            sections: [{
                title: "Available TV Shows",
                rows: rowss
            }]
        };

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: caption,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "tvshow_list",
                    buttonText: { displayText: "📺 Select Option" },
                    type: 4,
                    nativeFlowInfo: {
                        name: "single_select",
                        paramsJson: JSON.stringify(listButtons)
                    }
                }],
                headerType: 1,
                viewOnce: true
            }, { quoted: mek });
        } else {
            await conn.listMessage(from, listMessage, mek);
        }
    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`🚫 *Error Occurred !!*\n\n${e.message}`);
        console.error('tvsub error:', e);
    }
});   
                    
