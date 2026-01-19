const config = require('../config')
const { cmd, commands } = require('../command')
const axios = require('axios');
const fg = require('api-dylux');


let isUploadingTv = false;

// ==================== CINESUB SEARCH ====================
cmd({
    pattern: "ctztv",
    react: '🔎',
    category: "tv",
    alias: ["cinesubz", "tvsub"],
    desc: "Search TV series on cinesubz.lk",
    use: ".cinesub <tv series name>",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // Premium & Block checks
        const pr = (await axios.get('https://raw.githubusercontent.com/Nadeenpoorna-app/main-data/refs/heads/main/master.json')).data;
        const isFree = pr.mvfree === "true";

        if (!isFree && !isMe && !isPre) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, {
                text: "*`You are not a premium user⚠️`*\n\n" +
                      "*Send a message to one of the 2 numbers below and buy Lifetime premium 🎉.*\n\n" +
                      "_Price : 200 LKR ✔️_\n\n" +
                      "*👨‍💻Contact us : 0778500326 , 0722617699*"
            }, { quoted: mek });
        }

        if (config.MV_BLOCK == "true" && !isMe && !isSudo && !isOwner) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: "*This command currently only works for the Bot owner.*" }, { quoted: mek });
        }

        if (!q) return await reply('*Please enter a TV series name! 📺*');

        const { data } = await axios.get(`https://tharuzz-movie-api.vercel.app/api/cinesub/search?query=${encodeURIComponent(q)}`);

        if (!data.result || !Array.isArray(data.result)) return await reply('*No results found ❌*');

        const results = data.result.filter(item => item.type === "tvshows");

        if (!results.length) return await reply('*No TV series found ❌*');

        let srh = results.map((v, index) => ({
            title: v.title.replace(/Sinhala Subtitles\s*\|?\s*සිංහල උපසිරසි.*/gi, "").trim(),
            description: "",
            rowId: `${prefix}tvinfo ${v.link}`
        }));

        const sections = [{ title: "cinesubz.lk TV Series Results 📺", rows: srh }];

        const listMessage = {
            text: `_*CINESUBZ TV SERIES SEARCH RESULTS 📺*_\n\n*🔎 Input:* ${q}`,
            footer: config.FOOTER,
            title: 'Select a TV Series',
            buttonText: '*Reply a Number 🔢*',
            sections
        };

        if (config.BUTTON === "true") {
            const listButtons = {
                title: "Choose a TV Series 📺",
                sections: [{ title: "Available TV Series", rows: srh }]
            };

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: `_*CINESUBZ TV SERIES SEARCH RESULTS 📺*_\n\n*🔎 Input:* ${q}`,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "download_list",
                    buttonText: { displayText: "📺 Select Series" },
                    type: 4,
                    nativeFlowInfo: {
                        name: "single_select",
                        paramsJson: JSON.stringify(listButtons)
                    }
                }],
                headerType: 1
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, listMessage, { quoted: mek });
        }

    } catch (e) {
        console.error("CineSub Search Error:", e);
        reply('🚫 *Error Occurred !!*\n\n' + e.message);
    }
});

// ==================== TV SERIES INFO & EPISODES (with thumbnail) ====================
cmd({
    pattern: "tvinfo",
    react: "📺",
    desc: "Get TV series details and episodes",
    filename: __filename
},
async (conn, mek, m, { from, q, prefix, reply }) => {
    try {
        if (!q) return await reply('🚩 *Please provide a valid TV series URL!*');

        const { data } = await axios.get(`https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(q)}`);
        const series = data.result;

        if (!series) return await reply("*Couldn't find TV series info 😔*");

        // Cast
        let castStr = "N/A";
        if (series.cast && Array.isArray(series.cast)) {
            castStr = series.cast.map(c => `• ${c.name} ${c.role ? 'as ' + c.role : ''}`).join('\n');
        }

        const infoMsg = `*📺 Title ➮* _${series.title || series.serie || 'N/A'}_\n\n` +
                        `*📅 Year ➮* _${series.year || 'N/A'}_\n\n` +
                        `*🎭 Cast ➮*\n${castStr}\n\n` +
                        `*📖 Description ➮*\n_${series.description || 'N/A'}_`;

        // Build episode list
        let episodeRows = [];
        let episodeListRows = [];

        if (series.seasons && Array.isArray(series.seasons)) {
            series.seasons.forEach(season => {
                if (season.episodes && Array.isArray(season.episodes)) {
                    season.episodes.forEach(ep => {
                        const sNum = season.season ? `S${String(season.season).padStart(2, '0')}` : '';
                        const eNum = ep.episode ? `E${String(ep.episode).padStart(2, '0')}` : '';
                        const epTitle = `${sNum}${eNum} - ${ep.title || 'Episode'}`;
                        const fullTitle = `${series.title || series.serie} ${epTitle}`;

                        const row = {
                            title: epTitle,
                            rowId: `${prefix}tvquality ${ep.url}±${series.poster || config.LOGO}±${fullTitle}`
                        };

                        episodeRows.push({
                            buttonId: row.rowId,
                            buttonText: { displayText: epTitle },
                            type: 1
                        });
                        episodeListRows.push(row);
                    });
                }
            });
        }

        if (episodeListRows.length === 0) return await reply("*No episodes found for this series.*");

        const listButtons = {
            title: "Select Episode 📺",
            sections: [{ title: "All Episodes", rows: episodeListRows }]
        };

        const poster = series.poster || config.LOGO;

        // Always send with thumbnail (details card)
        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                image: { url: poster },
                caption: infoMsg,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "download_list",
                    buttonText: { displayText: "📺 Select Episode" },
                    type: 4,
                    nativeFlowInfo: {
                        name: "single_select",
                        paramsJson: JSON.stringify(listButtons)
                    }
                }],
                headerType: 1
            }, { quoted: mek });
        } else {
            // Normal mode: send image + caption first, then list (no image in list)
            await conn.sendMessage(from, { image: { url: poster }, caption: infoMsg, footer: config.FOOTER }, { quoted: mek });
            const listMsg = {
                text: "*📺 Select an Episode Below*",
                footer: config.FOOTER,
                title: "Episodes",
                buttonText: "Reply Number 🔢",
                sections: [{ title: "All Episodes", rows: episodeListRows }]
            };
            await conn.sendMessage(from, listMsg, { quoted: mek });
        }

    } catch (e) {
        console.error("TV Info Error:", e);
        reply('🚫 *Error Occurred !!*\n\n' + e.message);
    }
});

// ==================== QUALITY SELECTION (no thumbnail in menu) ====================
cmd({
    pattern: "tvquality",
    react: "🎥",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, prefix, reply }) => {
    try {
        const [epUrl, imgLink, title] = q.split("±");
        if (!epUrl || !title) return await reply("⚠️ Invalid episode data.");

        const { data: convData } = await axios.get(`https://down-seven-bice.vercel.app/api/download?url=${encodeURIComponent(epUrl)}`);

        if (!convData.downloads || convData.downloads.length === 0) {
            return await reply("⚠️ No download qualities found.");
        }

        let qualityRows = [];
        let qualityListRows = [];

        convData.downloads.forEach((dl, i) => {
            const qual = dl.quality || `Quality ${i + 1}`;
            const rowId = `${prefix}tvdl ${dl.url}±${imgLink}±${title} [${qual}]`;

            qualityRows.push({
                buttonId: rowId,
                buttonText: { displayText: qual },
                type: 1
            });
            qualityListRows.push({
                title: qual,
                rowId: rowId
            });
        });

        const qualMsg = `*📺 Select Quality for:*\n_${title}_`;

        const listButtons = {
            title: "Select Quality",
            sections: [{ title: "Available Qualities", rows: qualityListRows }]
        };

        // Only text + list for quality menu (no thumbnail here as requested)
        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                text: qualMsg,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "download_list",
                    buttonText: { displayText: "🎥 Choose Quality" },
                    type: 4,
                    nativeFlowInfo: {
                        name: "single_select",
                        paramsJson: JSON.stringify(listButtons)
                    }
                }]
            }, { quoted: mek });
        } else {
            const listMsg = {
                text: qualMsg,
                footer: config.FOOTER,
                title: "Select Quality 🎥",
                buttonText: "Reply Number 🔢",
                sections: [{ title: "Qualities", rows: qualityListRows }]
            };
            await conn.sendMessage(from, listMsg, { quoted: mek });
        }

    } catch (e) {
        console.error("Quality Error:", e);
        reply('🚫 *Error fetching qualities!!*\n\n' + e.message);
    }
});

// ==================== FINAL DOWNLOAD (tvdl - automatic using API + api-dylux) ====================
 cmd({
    pattern: "tvdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    if (isUploadingTv) return await reply('*Another episode is uploading. Please wait ⏳*');

    try {
        const parts = q.split("±");
        const processedUrl = parts[0]; // https://cinesubz.lk/api-.../fblovaxw0v
        let title = parts.slice(2).join("±");

        if (!processedUrl || !title) return await reply("⚠️ Invalid data.");

        // Call the API to get the download links
        const apiUrl = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(processedUrl)}&apikey=82406ca340409d44`;
        const { data: apiRes } = await axios.get(apiUrl);

        if (!apiRes.status || !apiRes.data?.download?.length) {
            return await reply("⚠️ API error or no download links (apikey may be invalid).");
        }

        let downloadUrl = null;
        let fileName = title || "TV_Episode";
        let mimetype = "video/mp4";

        // First priority: Look for "Cloud" direct link
        const cloudEntry = apiRes.data.download.find(dl => dl.name.toLowerCase() === "cloud");
        if (cloudEntry && cloudEntry.url) {
            downloadUrl = cloudEntry.url.trim();
            await reply('*Direct Cloud link found! Uploading your episode.. ⬆️*\n\n_Please wait, large files may take time._');
        } else {
            // Fallback: Google Drive
            const gdriveEntry = apiRes.data.download.find(dl => dl.name.toLowerCase() === "gdrive");
            if (!gdriveEntry || !gdriveEntry.url) {
                return await reply("⚠️ No Cloud or Google Drive link found in API response.");
            }

            const gdriveLink = gdriveEntry.url.trim();

            await reply('*GDrive link found (fallback). Processing.. ⬆️*\n\n_Please wait, large files may take time._');

            let res = await fg.GDriveDl(gdriveLink.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download', '/view'));

            if (!res || !res.downloadUrl) {
                return await reply("*Failed to process Google Drive link.*");
            }

            downloadUrl = res.downloadUrl;
            fileName = res.fileName || fileName;
            mimetype = res.mimetype || mimetype;

            // GDrive style message
            await reply(` *↗️ᴜᴘʟᴏᴀᴅɪɴɢ ʏᴏᴜʀ ᴛᴠ sʜᴏᴡ ᴡᴀɪᴛ 3 sᴇᴄᴄᴏɴᴅs* \n\n*↗️ғɪʟᴇ ɴᴀᴍᴇ:*  ${res.fileName}\n*↗️ғɪʟᴇ sɪᴢᴇ:* ${res.fileSize}\n*↗️ғɪʟᴇ ᴛʏᴘᴇ:* ${res.mimetype}\n\n•シ︎ᴅᴀʀᴋʟᴇx-ᴍᴅ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ•`);
        }

        isUploadingTv = true;

        // Upload as document (direct URL use කරලා)
        await conn.sendMessage(config.JID || from, { 
            document: { url: downloadUrl }, 
            fileName: "🎥ᴅᴀʀᴋʟᴇx🎥️" + fileName, 
            mimetype: mimetype,
            caption: fileName.replace('[Cinesubz.co]', '') + '\n\n> *•シ︎ᴅᴀʀᴋʟᴇx-ᴍᴅ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ•*'
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (e) {
        console.error("TV Download Error:", e);
        reply('*Error !!*\n\n' + e.message);
    } finally {
        isUploadingTv = false;
    }
});