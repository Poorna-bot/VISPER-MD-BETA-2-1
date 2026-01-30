const config = require('../config')
const { cmd, commands } = require('../command')
const axios = require('axios'); 
const sharp = require('sharp');
const fg = require('api-dylux');
const fetch = require('node-fetch');

let isUploadingTv = false;
const FOOTER_TEXT = '> 📽️ \*𝐕ɪꜱᴘᴇʀ 𝐌ᴏ𝐯ɪᴇ 𝐙ᴏɴᴇ 𝐗 📽️\*';

async function getResizedThumb(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        return await sharp(buffer)
            .resize(200, 200, { fit: 'cover' }) 
            .jpeg({ quality: 80 }) 
            .toBuffer();
    } catch (e) {
        console.error("Sharp Error:", e.message);
        return null;
    }
}

// ==================== 1. TV SERIES SEARCH ====================
cmd({
    pattern: "ctztv",
    react: '🔎',
    category: "tv",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return await reply('\*Please enter a TV series name! 📺\*');
        const { data } = await axios.get(`https://tharuzz-movie-api.vercel.app/api/cinesub/search?query=${encodeURIComponent(q)}`);
        
        if (!data.result || !Array.isArray(data.result)) return await reply('\*No results found ❌\*');
        const results = data.result.filter(item => item.type === "tvshows");
        let srh = results.map(v => ({
            title: v.title.replace(/Sinhala Subtitles\s*\|?\s*සිංහල උපසිරසි.*/gi, "").trim(),
            rowId: `${prefix}tvinfo ${v.link}`
        }));
        await conn.listMessage(from, {
            text: `_*CINESUBZ TV SERIES SEARCH RESULTS 📺*_\n\n*🔎 Input:* ${q}\n\n*Select a series from the list below to view episodes.*`,
            footer: FOOTER_TEXT,
            title: '', 
            buttonText: 'Click to View Results 🎬',
            sections: [{ title: "Available TV Series", rows: srh }]
        }, mek);
    } catch (e) { reply('🚩 \*Error during search!\*'); }
});

// ==================== 2. TV INFO & EPISODES ====================
cmd({
    pattern: "tvinfo",
    react: "📺",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        const { data } = await axios.get(`https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(q)}`);
        const series = data.result;
        if (!series) return await reply("\*Couldn't find TV series info!\*");

        let msg = `\*🍿 𝗧ɪᴛʟᴇ ➮\* \*\_${series.title || 'N/A'}\_\*\n\*📅 𝗬ᴇᴀʀ ➮\* \_${series.year || 'N/A'}\_`;
        
        let rows = [];
        // View Details Card Button
        rows.push({
            buttonId: `${prefix}ctvdetails ${q}`,
            buttonText: { displayText: 'View Details Card 📋' },
            type: 1
        });

        // ALL EPISODES DOWNLOAD BUTTON
        rows.push({
            buttonId: `${prefix}tvallquality ${q}±${series.poster}±${series.title}`,
            buttonText: { displayText: '📥 Download All Episodes' },
            type: 1
        });

      
        series.seasons.forEach(season => {
            season.episodes.forEach(ep => {
                const epTitle = `S${String(season.season).padStart(2, '0')} E${String(ep.episode).padStart(2, '0')}`;
                rows.push({
                    buttonId: `${prefix}tvquality ${ep.url}±${series.poster}±${series.title} ${epTitle}±${q}`,
                    buttonText: { displayText: epTitle },
                    type: 1
                });
            });
        });

        return await conn.buttonMessage(from, {
            image: { url: series.poster || config.LOGO },
            caption: msg,
            footer: FOOTER_TEXT,
            buttons: rows.slice(0, 15), // Extended to show more buttons
            headerType: 4
        }, mek);
    } catch (e) { reply('🚩 \*Error fetching episodes!\*'); }
});

// ==================== 3. DETAILS CARD ====================
cmd({
    pattern: "ctvdetails",
    react: '📋',
    desc: "Rich TV info card",
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        const { data } = await axios.get(`https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(q)}&apikey=82406ca340409d44`);
        const movie = data.data;
        let msg = `\*✨ 𝐓ᴠ 𝐒ᴇʀɪᴇꜱ 𝐃ᴇᴛᴀɪʟꜱ ✨\*\n\n` +
                  `\*🍿 𝐓ɪᴛʟᴇ ➮\* \*\_${movie.title || 'N/A'}\_\*\n` +
                  `\*📅 𝐑ᴇʟᴇᴀsᴇᴅ ➮\* \_${movie.year || 'N/A'}\_\n` +
                  `\*💃 𝐑ᴀᴛɪɴɢ ➮\* \_⭐ ${movie.rating || 'N/A'}/10\_\n` +
                  `\*⏰ 𝐃ᴜʀᴀᴛɪᴏɴ ➮\* \_${movie.duration || 'N/A'}\_\n` +
                  `\*🌎 𝐂ᴏᴜɴᴛʀʏ ➮\* \_${movie.country || 'N/A'}\_\n` +
                  `\*🎭 𝐆ᴇɴʀᴇs ➮\* \_${movie.genres || 'TV Series'}\_\n` +
                  `\*🎞️ 𝐐ᴜᴀʟɪᴛʏ ➮\* \_${movie.quality || 'N/A'}\_\n` +
                  `\*🎬 𝐃ɪʀᴇᴄᴛᴏʀ ➮\* \_${movie.directors || 'N/A'}\_\n\n` +
                  `\*💁 𝐒ᴜʙᴛɪᴛʟᴇ ʙʏ ➮\* \_CineSubz.co\_\n\n` +
                  `${FOOTER_TEXT}`;

        await conn.sendMessage(from, { 
            image: { url: movie.image }, 
            caption: msg 
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) { reply('🚩 \*Error fetching details card!\*'); }
});

// ==================== 4. QUALITY SELECTION (INDIVIDUAL) ====================
cmd({
    pattern: "tvquality",
    react: "🎥",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        const [epUrl, imgLink, title, mainUrl] = q.split("±");
        const { data: convData } = await axios.get(`https://down-seven-bice.vercel.app/api/download?url=${encodeURIComponent(epUrl)}`);
        let rows = convData.downloads.map(dl => ({
            buttonId: `${prefix}tvdl ${dl.url}±${imgLink}±${title}±${mainUrl}±${dl.quality}`,
            buttonText: { displayText: dl.quality },
            type: 1
        }));
        await conn.buttonMessage(from, {
            image: { url: imgLink },
            caption: `\*🎥 Select Quality for:\* \n_${title}_`,
            footer: FOOTER_TEXT,
            buttons: rows,
            headerType: 4
        }, mek);
    } catch (e) { reply('🚩 \*Error fetching qualities!\*'); }
});

// ==================== 5. ALL EPISODES QUALITY SELECTION ====================
cmd({
    pattern: "tvallquality",
    react: "📑",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        const [mainUrl, imgLink, title] = q.split("±");
        // We fetch the first episode's qualities to give options for all
        const { data: seriesData } = await axios.get(`https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(mainUrl)}`);
        const firstEpUrl = seriesData.result.seasons[0].episodes[0].url;
        
        const { data: convData } = await axios.get(`https://down-seven-bice.vercel.app/api/download?url=${encodeURIComponent(firstEpUrl)}`);
        
        let rows = convData.downloads.map(dl => ({
            buttonId: `${prefix}tvdlall ${mainUrl}±${imgLink}±${title}±${dl.quality}`,
            buttonText: { displayText: dl.quality },
            type: 1
        }));

        await conn.buttonMessage(from, {
            image: { url: imgLink },
            caption: `\*📥 DOWNLOAD ALL EPISODES\*\n\n\*Series:\* ${title}\n\*Select the quality you want to download all episodes in:\*`,
            footer: FOOTER_TEXT,
            buttons: rows,
            headerType: 4
        }, mek);
    } catch (e) { reply('🚩 \*Error fetching quality list for all episodes!\*'); }
});

// ==================== 6. DOWNLOAD ALL EXECUTION ====================
cmd({
    pattern: "tvdlall",
    react: "⏳",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    if (isUploadingTv) return await reply('\*Another process is running. Please wait ⏳\*');
    
    try {
        const [mainUrl, imgLink, title, selectedQuality] = q.split("±");
        isUploadingTv = true;
        
        await reply(`\*🚀 Starting to download all episodes in ${selectedQuality}...\*\n\*Please be patient, this might take a while.\*`);

        const { data: seriesData } = await axios.get(`https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(mainUrl)}`);
        const seasons = seriesData.result.seasons;

        for (const season of seasons) {
            for (const ep of season.episodes) {
                try {
                    const epTitle = `${title} S${String(season.season).padStart(2, '0')}E${String(ep.episode).padStart(2, '0')}`;
                    
                    
                    const { data: qData } = await axios.get(`https://down-seven-bice.vercel.app/api/download?url=${encodeURIComponent(ep.url)}`);
                    const matchingDl = qData.downloads.find(d => d.quality.trim() === selectedQuality.trim()) || qData.downloads[0];

                    // Get Download Links (GDrive/Mega)
                    const { data: apiRes } = await axios.get(`https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(matchingDl.url)}&apikey=82406ca340409d44`);
                    const downloadLinks = apiRes.data.download;
                    
                    let downloadUrl = null;
                    let fileName = epTitle;

                    const gdriveEntry = downloadLinks.find(dl => dl.name.toLowerCase() === "gdrive");
                    if (gdriveEntry) {
                        try {
                            const res = await fg.GDriveDl(gdriveEntry.url.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download', '/view'));
                            if (res && res.downloadUrl) {
                                downloadUrl = res.downloadUrl;
                                fileName = res.fileName;
                            }
                        } catch (e) { /* skip */ }
                    }

                    if (!downloadUrl) {
                        const megaEntry = downloadLinks.find(dl => dl.name.toLowerCase() === "mega");
                        if (megaEntry) {
                            const megaRes = await axios.get(`https://sadaslk-fast-mega-dl.vercel.app/mega?q=${encodeURIComponent(megaEntry.url)}`);
                            if (megaRes.data && megaRes.data.url) downloadUrl = megaRes.data.url;
                        }
                    }

                    if (downloadUrl) {
                        const resizedThumb = await getResizedThumb(imgLink);
                        const caption = `🎬 *𝗡𝗮𝗺𝗲 :* ${epTitle}\n` +
                                        `Sinhala Subtitles | සිංහල උපසිරසි සමඟ\n\n` +
                                        ` \` ${selectedQuality.trim()} \` \n\n` + 
                                        `${FOOTER_TEXT}`;
                        
                        const targetJid = config.JID || from;
                        await conn.sendMessage(targetJid, { 
                            document: { url: downloadUrl }, 
                            fileName: "🎥 " + fileName.trim() + ".mp4", 
                            mimetype: "video/mp4",
                            jpegThumbnail: resizedThumb,
                            caption: caption
                        });
                        // පොඩි delay එකක් දන්න spam/ban වලින් බේරෙන්න
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                } catch (err) {
                    console.error(`Error downloading episode:`, err);
                }
            }
        }
        await reply('\*✅ All available episodes have been sent!\*');
    } catch (e) {
        console.error(e);
        reply('\*Critical error in Download All!*');
    } finally {
        isUploadingTv = false;
    }
});

// ==================== 7. FINAL INDIVIDUAL DOWNLOAD ====================
cmd({
    pattern: "tvdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    if (isUploadingTv) return await reply('\*Another episode is uploading. Please wait ⏳\*');
    try {
        const [processedUrl, imgLink, title, mainUrl, quality] = q.split("±");
        const { data: apiRes } = await axios.get(`https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(processedUrl)}&apikey=82406ca340409d44`);
        const downloadLinks = apiRes.data.download;
        let downloadUrl = null;
        let fileName = title;

        const gdriveEntry = downloadLinks.find(dl => dl.name.toLowerCase() === "gdrive");
        if (gdriveEntry) {
            try {
                const res = await fg.GDriveDl(gdriveEntry.url.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download', '/view'));
                if (res && res.downloadUrl) {
                    downloadUrl = res.downloadUrl;
                    fileName = res.fileName;
                }
            } catch (e) { console.log("GDrive Fail, checking Mega..."); }
        }
        if (!downloadUrl) {
            const megaEntry = downloadLinks.find(dl => dl.name.toLowerCase() === "mega");
            if (megaEntry) {
                const megaRes = await axios.get(`https://sadaslk-fast-mega-dl.vercel.app/mega?q=${encodeURIComponent(megaEntry.url)}`);
                if (megaRes.data && megaRes.data.url) downloadUrl = megaRes.data.url;
            }
        }
        if (!downloadUrl) return await reply("⚠️ No working link found.");

        isUploadingTv = true;
        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
        const resizedThumb = await getResizedThumb(imgLink);
        
        const qText = quality ? quality.trim() : 'Unknown Quality';
        const caption = `🎬 𝗡𝗮𝗺𝗲 : \*${title}\*\nSinhala Subtitles | සිංහල උපසිරසි සමඟ\n\n \` ${qText} \` \n\n${FOOTER_TEXT}`; 
        
        const targetJid = config.JID || from;
        await conn.sendMessage(targetJid, { 
            document: { url: downloadUrl }, 
            fileName: "🎥🎬 " + fileName.trim() + ".mp4", 
            mimetype: "video/mp4",
            jpegThumbnail: resizedThumb,
            caption: caption
        });
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) {
        console.error(e);
        reply('\*Download Error !!\*');
    } finally {
        isUploadingTv = false;
    }
});