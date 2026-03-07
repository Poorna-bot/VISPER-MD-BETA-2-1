const config = require('../config')
const { cmd, commands } = require('../command')
const axios = require('axios');
const sharp = require('sharp');
const Seedr = require("seedr");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { Buffer } = require('buffer'); 
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fileType = require("file-type")
const l = console.log
const https = require("https")
const { URL } = require('url');
const { sizeFormatter} = require('human-readable');
const fg = require('api-dylux');
const { Octokit } = require("@octokit/rest");



   cmd({
         pattern: "mv",
         react: "🔎",
         alias: ["movie", "film", "cinema"],
         desc: "all movie search",
         category: "movie",
         use: '.movie',
         filename: __filename
        },
async (conn, mek, m, {
	
from, prefix, l, quoted, q,
isPre, isSudo, isOwner, isMe, reply
}) => {
try {
const pr = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;
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

    if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await conn.sendMessage(from, {
        text: "*This command currently only works for the Bot owner. To disable it for others, use the .settings command 👨‍🔧.*"
      }, { quoted: mek });
    }

    if (!q) return await reply('*Enter movie name..🎬*');

    const sources = [
      { name: "CINESUBZ", cmd: "cine" },
      { name: "SINHALASUB", cmd: "sinhalasub" },
     
	  { name: "SUBLK", cmd: "sublk" }
		
	 
    ];


    let imageBuffer;
    try {
      const res = await axios.get('https://nadeen-botzdatabse.vercel.app/MovieZoneX.png', {
        responseType: 'arraybuffer'
      });
      imageBuffer = Buffer.from(res.data, 'binary');
    } catch {
      imageBuffer = null; 
    }

    const caption = `_*VISPER MOVIE SYSTEM 🎬*_\n\n*\`🔍Input :\`* ${q}\n\n_*🌟 Select your preferred movie download site*_`;

    if (config.BUTTON === "true") {
     
      const listButtons = {
        title: "❯❯ Choose a movie source ❮❮",
        sections: [
          {
            title: "❯❯ Choose a movie source ❮❮",
            rows: sources.map(src => ({
              title: `${src.name} Results 🎬`,
              id: prefix + src.cmd + ' ' + q
            }))
          }
        ]
      };

      return await conn.sendMessage(from, {
        image: imageBuffer || { url: 'https://nadeen-botzdatabse.vercel.app/MovieZoneX.png' },
        caption,
        footer: config.FOOTER,
        buttons: [
          {
            buttonId: "movie_menu_list",
            buttonText: { displayText: "🎥 Select Option" },
            type: 4,
            nativeFlowInfo: {
              name: "single_select",
              paramsJson: JSON.stringify(listButtons)
            }
          }
        ],
        headerType: 1,
        viewOnce: true
      }, { quoted: mek });

    } else {
  
      const buttons = sources.map(src => ({
        buttonId: prefix + src.cmd + ' ' + q,
        buttonText: { displayText: `_${src.name} Results 🍿_` },
        type: 1
      }));

      return await conn.buttonMessage2(from, {
        image: { url: 'https://nadeen-botzdatabse.vercel.app/MovieZoneX.png' },
        caption,
        footer: config.FOOTER,
        buttons,
        headerType: 4
      }, mek);
    }

  } catch (e) {
    reply('*❌ Error occurred*');
    l(e);
  }
});




cmd({
    pattern: "baiscopes",    
    react: '🔎',
    category: "movie",
    desc: "Baiscopes.lk movie search",
    use: ".baiscopes 2025",
    filename: __filename
},
async (conn, m, mek, { from, isPre, q, prefix, isMe, isSudo, isOwner, reply }) => {
try {

    // --- Premium & Config Check ---
    const pr = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;
    const isFree = pr.mvfree === "true";

    if (!isFree && !isMe && !isPre) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return await conn.sendMessage(from, {
            text: "*`You are not a premium user⚠️`*\n\n" +
                  "*Send a message to one of the 2 numbers below and buy Lifetime premium 🎉.*\n\n" +
                  "_Price : 200 LKR ✔_ \n\n" +
                  "*👨‍💻Contact us : 0778500326 , 0722617699*"
        }, { quoted: mek });
    }

    if (config.MV_BLOCK == "true" && !isMe && !isSudo && !isOwner) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return await conn.sendMessage(from, { text: "*This command currently only works for the Bot owner.*" }, { quoted: mek });
    }

    if (!q) return await reply('*Please provide a movie name! (e.g. .baiscopes Batman)*');

    // --- Fetching Search Results ---
    // මම මෙතනට ඔයා දුන්න අලුත් API එක ඇතුලත් කළා
    let res = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/search?q=${q}&apiKey=sadasggggg`);

    if (!res || !res.data || res.data.length === 0) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return await conn.sendMessage(from, { text: '*No results found for your search ❌*' }, { quoted: mek });
    }

    var srh = [];  
    for (var i = 0; i < res.data.length; i++) {
        srh.push({
            title: `${res.data[i].title}`,
            description: `Year: ${res.data[i].year || 'N/A'}`,
            rowId: prefix + `bdl ${res.data[i].link}&${res.data[i].imageUrl}` // Download cmd එකට link එක යවනවා
        });
    }

    const sections = [{
        title: "Baiscopes.lk Search Results",
        rows: srh
    }];

    const listMessage = {
        text: `*_BAISCOPES MOVIE SEARCH RESULT 🎬_*\n\n*\`Input :\`* ${q}`,
        footer: config.FOOTER,
        title: 'Baiscopes.lk Results',
        buttonText: '*Select Your Movie 🔢*',
        sections
    };

    await conn.listMessage(from, listMessage, mek);

} catch (e) {
    console.log(e);
    await conn.sendMessage(from, { text: '🚩 *Error occurred while fetching movies!*' }, { quoted: mek });
}
});

cmd({
    pattern: "bdl",    
    react: '🎥',
    desc: "movie downloader",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, isSudo, isOwner, prefix, reply }) => {
try {
 const datae = q.split("&")[0];
        const datas = q.split("&")[1];
    if (!q) return await reply('*Please provide the movie link!*');

    // API එකට request එක යැවීම (q ලෙස ලැබෙන්නේ search එකෙන් ආපු movie link එකයි)
    let sadas = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${datae}&apiKey=sadasggggg`);

    if (!sadas || !sadas.status || !sadas.data) {
        return await conn.sendMessage(from, { text: '🚩 *Error: Could not fetch movie details!*' }, { quoted: mek });
    }

    const movie = sadas.data.movieInfo;
    const dlLinks = sadas.data.downloadLinks;

    let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* _${movie.title || 'N/A'}_

*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${movie.releaseDate || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${movie.ratingValue || 'N/A'}_ (${movie.ratingCount} votes)
*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* _${movie.runtime || 'N/A'}_
*🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${movie.country || 'N/A'}_
*🎭 𝗚ᴇɴᴀʀᴇꜱ ➮* ${movie.genres ? movie.genres.join(', ') : 'N/A'}
`;

    var rows = [];  

rows.push(
    { buttonId: prefix + 'bdetails ' + `${datae}&${datas}`, buttonText: { displayText: 'Details Card\n' }, type: 1 }
    
);
	

    // Download links බොත්තම් ලෙස එකතු කිරීම
    if (dlLinks && dlLinks.length > 0) {
        dlLinks.map((v) => {
            rows.push({
                buttonId: prefix + `cdl ${v.directLinkUrl}±${movie.title}±${datas}±${v.quality}`,
                buttonText: { displayText: `${v.quality} (${v.size})` },
                type: 1
            });
        });
    } else {
        return await reply("No download links found for this movie.");
    }



    const buttonMessage = {
        image: { url: datas },    
        caption: msg,
        footer: config.FOOTER,
        buttons: rows,
        headerType: 4
    };

    return await conn.buttonMessage(from, buttonMessage, mek);

} catch (e) {
    console.log(e);
    await conn.sendMessage(from, { text: '🚩 *Error !!*' }, { quoted: mek });
}
});


let isUploading = false; // Track upload status



cmd({
    pattern: "cdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, isMe, reply }) => {
    
    if (!q) {
        return await reply('*Please provide a direct URL!*');
    }





	
    if (isUploading) {
        return await conn.sendMessage(from, { 
            text: '*A movie is already being uploaded. Please wait a while before uploading another one.* ⏳', 
            quoted: mek 
        });
    }

    try {
        isUploading = true; // Set upload in progress

        

        const datae = q.split("±")[0];
        const datas = q.split("±")[1];
        const dat = q.split("±")[2];    
		const dattt = q.split("±")[3];    




if (!datae.includes('https://drive.baiscopeslk')) {
    console.log('Invalid input:', q);
    return await reply('*❗ Sorry, this download url is incorrect please choose another number*');
}
        const mediaUrl = datae;

     

        const botimg = `${dat}`;

       
 await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

       await conn.sendMessage(from, { text: '*Uploading your movie..⬆️*' });

       
 await conn.sendMessage(config.JID || from, { 
            document: { url: mediaUrl },
            caption: `*🎬 Name :* *${datas}*\n\n*\`${dattt}\`*\n\n${config.NAME}`,
            mimetype: "video/mp4",
            jpegThumbnail: await (await fetch(botimg)).buffer(),
            fileName: `🎬 ${datas}.mp4`
        });



        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
        await conn.sendMessage(from, { text: `*Movie sent successfully to JID ${config.JID} ✔*` }, { quoted: mek });

    } catch (error) {
        console.error('Error fetching or sending:', error);
        await conn.sendMessage(from, { text: "*Erro fetching this moment retry now ❗*" }, { quoted: mek });
    } finally {
        isUploading = false; // Reset upload status
    }
});

cmd({
  pattern: "bdetails",
  react: '🎬',
  desc: "Movie details sender",
  filename: __filename
},
async (conn, m, mek, { from, q, isMe, reply }) => {
  try {
    if (!q) 
      return await reply('⚠️ *Please provide the movie URL!*');
 const [url, imgUrl] = q.split("&");
    // API එකෙන් විස්තර ලබා ගැනීම
    let sadas = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${url}&apiKey=sadasggggg`);
    
    if (!sadas || !sadas.status || !sadas.data) {
        return await conn.sendMessage(from, { text: '🚩 *Error: Could not fetch movie details!*' }, { quoted: mek });
    }

    const movie = sadas.data.movieInfo;
    let details = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;

    // විස්තර පෙළ සැකසීම
    let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${movie.title || 'N/A'}_*

*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${movie.releaseDate || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${movie.ratingValue || 'N/A'}_
*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* _${movie.runtime || 'N/A'}_
*🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${movie.country || 'N/A'}_
*🎭 𝗚ᴇɴᴀʀᴇꜱ ➮* ${movie.genres ? movie.genres.join(', ') : 'N/A'}

✨ *Follow us:* ${details.chlink}`;

    // Gallery එකේ පළමු රූපය හෝ Poster එක තෝරා ගැනීම
    const displayImg = (movie.galleryImages && movie.galleryImages.length > 0) 
        ? movie.galleryImages[0] 
        : movie.posterUrl;

    // පණිවිඩය යැවීම (config.JID තිබේ නම් එයට, නැතිනම් current chat එකට)
    await conn.sendMessage(config.JID || from, {
      image: { url: imgUrl },
      caption: msg
    });

    await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

  } catch (error) {
    console.error('Error:', error);
    await conn.sendMessage(from, '⚠️ *An error occurred while fetching details.*', { quoted: mek });
  }
});





cmd({
    pattern: "cine",
    react: '🔎',
    category: "movie",
    alias: ["cz"],
    desc: "cinesubz.co movie search",
    use: ".cine 2025",
    filename: __filename
},
async (conn, m, mek, {
    from, q, prefix, isPre, isSudo, isOwner, isMe, reply
}) => {
    try {
        // Premium check
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

        // Block check
        if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, {
                text: "*This command currently only works for the Bot owner.*"
            }, { quoted: mek });
        }

        if (!q) return await reply('*Please give me a movie name 🎬*');

        // Fetching Data from API
        const apiUrl = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-search?q=${encodeURIComponent(q)}&apikey=82406ca340409d44`;
        const response = await axios.get(apiUrl);
        const result = response.data;

        if (!result.status || !result.data || result.data.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
        }

        let srh = [];
        result.data.forEach((movie) => {
            // Clean title
            const cleanTitle = movie.title
                .replace("Sinhala Subtitles | සිංහල උපසිරැසි සමඟ", "")
                .replace("Sinhala Subtitle | සිංහල උපසිරැසි සමඟ", "")
                .trim();

            srh.push({
                title: cleanTitle,
                //description: `Quality: ${movie.quality} | Rating: ${movie.rating}`,
                rowId: `${prefix}cinedl2 ${movie.link}`
            });
        });

        const sections = [{
            title: "Cinesubz.lk Search Results",
            rows: srh
        }];

        const listMessage = {
            text: `_*CINESUBZ MOVIE SEARCH RESULTS 🎬*_\n\n*\`Input :\`* ${q}\n\n*Select a movie from the list below to download.*`,
            footer: config.FOOTER,
            title: 'Cinesubz Movie Downloader',
            buttonText: 'Click here to view',
            sections
        };

        // Sending the list
        await conn.listMessage(from, listMessage, mek);

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { text: '🚩 *Error occurred while fetching data!*' }, { quoted: mek });
    }
});





cmd({
    pattern: "cinedl2",
    react: '🎥',
    desc: "movie downloader info",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, prefix, reply }) => {
    try {
        if (!q) return await reply('*Please provide a link!*');

        // ලින්ක් එක encode කර API එකට යැවීම
        const apiUrl = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(q)}&apikey=82406ca340409d44`;

        const res = await axios.get(apiUrl);
        const sadas = res.data;

        if (!sadas.status || !sadas.data) {
            return await conn.sendMessage(from, { text: '🚩 *Error fetching movie details!*' }, { quoted: mek });
        }

        const movie = sadas.data;

        // Message Format එක (ඔබ ඉල්ලූ පරිදි)
        // සටහන: මෙම API එකෙන් දැනට ලැබෙන්නේ title සහ size පමණක් බැවින් අනෙක්වා default අගයන් ලෙස තබා ඇත.
        let msg = `*🍿 𝗧ɪᴛʟᴇ ➮* *_${movie.title || 'N/A'}_*

*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${movie.year || 'N/A'}_
*🌎 𝗖ᴏᴜɴᴛʀʏ ➮* _${movie.country || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${movie.rating || 'N/A'}_
*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* _${movie.runtime || 'N/A'}_
*⚖️ 𝗦ɪᴢᴇ ➮* _${movie.size || 'N/A'}_
*💁 𝗦ᴜʙᴛɪᴛʟᴇ ʙʏ ➮* _CineSubz_
*🎭 𝗚ᴇɴᴀʀᴇꜱ ➮* _Movie_`

        let rows = [];

                rows.push(
    { buttonId: prefix + 'cdetails ' + `${q}`, buttonText: { displayText: 'Details Card\n' }, type: 1 }

);
       // Download Links බොත්තම් ලෙස සැකසීම
if (movie.downloads && movie.downloads.length > 0) {
    movie.downloads.forEach((dl) => {
        // JSON එකේ dl.name නැති නිසා quality සහ size එක බොත්තම සඳහා භාවිතා කරමු
        // අවශ්ය නම් siteName එකට static අගයක් දිය හැක (උදා: "DOWNLOAD")

        rows.push({
            buttonId: `${prefix}nadeendl ${dl.link}±${movie.title}±${movie.image}±${dl.quality}`, 
            buttonText: { 
                displayText: `${dl.quality} - ${dl.size}` 
            },
            type: 1
        });
    });
}

        // පින්තූරය සහිත බොත්තම් පණිවිඩය
        const buttonMessage = {
            image: { url: movie.image.replace(/-\d+x\d+(?=\.jpg)/, '') }, // API එකේ පින්තූරය නැති නිසා default logo එක
            caption: msg,
            footer: config.FOOTER,
            buttons: rows,
            headerType: 4
        };

        return await conn.buttonMessage(from, buttonMessage, mek);

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { text: '🚩 *Error !!*' }, { quoted: mek });
    }
});




// --- Configuration ---
const GITHUB_AUTH_TOKEN = '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';
const GITHUB_USER = 'THEMISADAS2007';
const GITHUB_REPO = 'CINEDL-SAVE';
const DB_PATH = 'database.json';
const MEGA_API_KEY = 'sadasggggg';

const octokit = new Octokit({ auth: GITHUB_AUTH_TOKEN });

// --- GitHub DB Helpers ---
async function getStoredData() {
    try {
        const res = await octokit.repos.getContent({
            owner: GITHUB_USER, repo: GITHUB_REPO, path: DB_PATH,
        });
        const content = Buffer.from(res.data.content, 'base64').toString();
        return { db: JSON.parse(content), sha: res.data.sha };
    } catch (e) {
        return { db: {}, sha: null };
    }
}

async function saveToDb(movieKey, linkData) {
    const { db, sha } = await getStoredData();
    db[movieKey] = linkData; 
    const updatedContent = Buffer.from(JSON.stringify(db, null, 2)).toString('base64');
    await octokit.repos.createOrUpdateFileContents({
        owner: GITHUB_USER, repo: GITHUB_REPO, path: DB_PATH,
        message: `DB Update: Link Refresh for ${movieKey}`,
        content: updatedContent, sha: sha
    });
}

// --- Fetch Function (API එකෙන් ලින්ක් ගන්නා වෙනම function එකක්) ---
async function fetchNewLink(movieUrl) {
    const apiRes = await axios.get(`https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${movieUrl}&apikey=82406ca340409d44`);

    const dlData = apiRes.data.data.download;
    console.log("--- API Download Data ---", JSON.stringify(dlData, null, 2));

    const unknown = dlData.find(l => l && l.name === "unknown")?.url;
    const gdrive = dlData.find(l => l && l.name === "gdrive")?.url;
    const mega = dlData.find(l => l && l.name === "mega")?.url;
    if (unknown) {
        return { type: 'direct', link: unknown };
    } else if (gdrive) {
        const formattedGdrive = gdrive.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download' , '/view');
        return { type: 'gdrive', link: formattedGdrive };
    } else if (mega) {
        return { type: 'mega', link: mega };
    }
    return null;
}




cmd({
    pattern: "nadeendl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply('*📍 Please provide the movie link!*');
        
        const [movieUrl, movieName, thumbUrl, quality] = q.split("±");
        if (!movieUrl || !movieName) return await reply('*⚠️ Invalid Format!*');

        // --- STEP 1: Bypass the Redirect Link ---
        const bypassResponse = await fetchJson(`https://cine-redirect.vercel.app/bypass?url=${movieUrl}`);
        
        // අලුත් JSON structure එකට අනුව check කිරීම
        if (!bypassResponse || !bypassResponse.success || !bypassResponse.final_link) {
            return await reply('*❌ Error: Failed to get final link from redirect API!*');
        }
        
        const finalMovieUrl = bypassResponse.final_link; // අලුත් key එක (final_link)

        // --- STEP 2: Fetch Download Links ---
        const response = await fetchJson(`https://cine-download-api.vercel.app/api/download?url=${finalMovieUrl}`);

        if (!response || !response.data || !response.data.downloadUrls) {
            return await reply('*❌ Error: Could not fetch download links from API!*');
        }

        // Pahan Server ලින්ක් එක පෙරීම
        const pahanLink = response.data.downloadUrls.find(item => 
            item.url && !item.url.includes("pixeldrain") && !item.url.includes("t.me")
        );

        if (!pahanLink) return await reply('*❌ Direct download link not found!*');
        
        const downloadUrl = pahanLink.url;
        const fileSize = response.data.size || "Unknown Size";

        // --- STEP 3: Status Message ---
        const loadingMsg = await conn.sendMessage(from, { 
            text: `*🚀 Uploading Movie...*\n\n*🎬 Name:* ${movieName}\n*📦 Size:* ${fileSize}` 
        }, { quoted: mek });

        // Thumbnail Processing
        let resizedBotImg = null;
        if (thumbUrl) {
            try {
                const botimgResponse = await fetch(thumbUrl);
                const botimgBuffer = await botimgResponse.buffer();
                resizedBotImg = await resizeImage(botimgBuffer, 200, 200);
            } catch (e) { console.log("Thumb error skipped"); }
        }

        // --- STEP 4: Sending File ---
        await conn.sendMessage(from, { 
            document: { url: downloadUrl }, 
            mimetype: 'video/mp4',
            fileName: `🎬 ${movieName}.mp4`,
            caption: `*🎬 Name :* *${movieName}*\n\n*\`${quality}\`*\n\n${config.NAME}`,
            jpegThumbnail: resizedBotImg
        }, { quoted: mek });

        await conn.sendMessage(from, { delete: loadingMsg.key });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.log("Error Log:", e);
        await reply(`*❌ Error:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: "⚠️", key: mek.key } });
    }
});



cmd({
    pattern: "sinhalasub",
    react: '🔎',
    category: "movie",
    alias: ["cz"],
    desc: "sinhalasub.lk movie search",
    use: ".cine 2025",
    filename: __filename
},
async (conn, m, mek, {
    from, q, prefix, isPre, isSudo, isOwner, isMe, reply
}) => {
    try {
        // Premium check
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

        // Block check
        if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, {
                text: "*This command currently only works for the Bot owner.*"
            }, { quoted: mek });
        }

        if (!q) return await reply('*Please give me a movie name 🎬*');

        // Fetching Data from API
        const apiUrl = `https://apis.sadas.dev/api/v1/movie/sinhalasub/search?q=${q}&apiKey=sadasggggg`;
        const response = await axios.get(apiUrl);
        const result = response.data;

        if (!result.status || !result.data || result.data.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
        }

        let srh = [];
        result.data.forEach((movie) => {
            // Clean title
            const cleanTitle = movie.Title
                .replace("Sinhala Subtitles | සිංහල උපසිරැසි සමඟ", "")
                .replace("Sinhala Subtitle | සිංහල උපසිරැසි සමඟ", "")
                .trim();

            srh.push({
                title: cleanTitle,
                //description: `Quality: ${movie.quality} | Rating: ${movie.rating}`,
                rowId: `${prefix}sinhalasubinfo ${movie.Link}`
            });
        });

        const sections = [{
            title: "Sinhalasub.lk Search Results",
            rows: srh
        }];

        const listMessage = {
            text: `_*SINHALASUB MOVIE SEARCH RESULTS 🎬*_\n\n*\`Input :\`* ${q}\n\n*Select a movie from the list below to download.*`,
            footer: config.FOOTER,
            title: 'Sinhalasub Movie Downloader',
            buttonText: 'Click here to view',
            sections
        };

        // Sending the list
        await conn.listMessage(from, listMessage, mek);

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { text: '🚩 *Error occurred while fetching data!*' }, { quoted: mek });
    }
});



cmd({
    pattern: "sinhalasubinfo",
    react: '🎥',
    desc: "movie downloader info",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, prefix, reply }) => {
    try {
        if (!q) return await reply('*Please provide a link!*');

        // ලින්ක් එක encode කර API එකට යැවීම
        const apiUrl = `https://apis.sadas.dev/api/v1/movie/sinhalasub/infodl?q=${q}&apiKey=sadasggggg`;

        const res = await axios.get(apiUrl);
        const sadas = res.data;

        if (!sadas.status || !sadas.data) {
            return await conn.sendMessage(from, { text: '🚩 *Error fetching movie details!*' }, { quoted: mek });
        }

        const movie = sadas.data;

        // Message Format එක (ඔබ ඉල්ලූ පරිදි)
        // සටහන: මෙම API එකෙන් දැනට ලැබෙන්නේ title සහ size පමණක් බැවින් අනෙක්වා default අගයන් ලෙස තබා ඇත.
       let msg = `*🍿 𝗧ɪᴛʟᴇ ➮* *_${sadas.data.title || 'N/A'}_*

*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${sadas.data.date || 'N/A'}_
*🌎 𝗖ᴏᴜɴᴛʀʏ ➮* _${sadas.data.country || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${sadas.data.rating || 'N/A'}_
*⏰ 𝗗ᴜʀᴀᴛɪᴏɴ ➮* _${sadas.data.duration || 'N/A'}_
*💁 𝗦ᴜʙᴛɪᴛʟᴇ ʙʏ ➮* _${sadas.data.subtitles || 'N/A'}_
*🎭 𝗗ᴇꜱᴄʀɪᴘᴛɪᴏɴ ➮* _${sadas.data.description ? sadas.data.description.substring(0, 100) + '...' : 'N/A'}_`

        let rows = [];

                rows.push(
    { buttonId: prefix + 'sinhalasubdetails ' + `${q}`, buttonText: { displayText: 'Details Card\n' }, type: 1 }

);
       // Download Links බොත්තම් ලෙස සැකසීම
// Download Links බොත්තම් ලෙස සැකසීම (Pixeldrain පමණක්)
if (sadas.data.downloadLinks && sadas.data.downloadLinks.length > 0) {
    sadas.data.downloadLinks.forEach((dl) => {
        // server එක Pixeldrain නම් පමණක් බොත්තමක් සාදන්න
        if (dl.server === "Pixeldrain") {
            rows.push({
                buttonId: `${prefix}sinhalasubdl ${dl.link}±${sadas.data.title}±${sadas.data.images[0]}±${dl.quality}`, 
                buttonText: { 
                    displayText: `${dl.size} - ${dl.quality}` 
                },
                type: 1
            });
        }
    });
}

        // පින්තූරය සහිත බොත්තම් පණිවිඩය
        const buttonMessage = {
            image: { url: movie.images[0] }, // API එකේ පින්තූරය නැති නිසා default logo එක
            caption: msg,
            footer: config.FOOTER,
            buttons: rows,
            headerType: 4
        };

        return await conn.buttonMessage(from, buttonMessage, mek);

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { text: '🚩 *Error !!*' }, { quoted: mek });
    }
});

cmd({
    pattern: "sinhalasubdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply('*📍 Please provide the movie link!*');
        
        const [movieUrl, movieName, thumbUrl, quality] = q.split("±");
        if (!movieUrl || !movieName) return await reply('*⚠️ Invalid Format!*');

     const original_link = movieUrl;
const direct_link = original_link.replace("/u/", "/api/file/")
        // Thumbnail Processing
        let resizedBotImg = null;
        if (thumbUrl) {
            try {
                const botimgResponse = await fetch(thumbUrl);
                const botimgBuffer = await botimgResponse.buffer();
                resizedBotImg = await resizeImage(botimgBuffer, 200, 200);
            } catch (e) { console.log("Thumb error skipped"); }
        }

        // --- STEP 4: Sending File ---
        await conn.sendMessage(from, { 
            document: { url: direct_link }, 
            mimetype: 'video/mp4',
            fileName: `🎬 ${movieName}.mp4`,
            caption: `*🎬 Name :* *${movieName}*\n\n*\`${quality}\`*\n\n${config.NAME}`,
            jpegThumbnail: resizedBotImg
        }, { quoted: mek });

       
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.log("Error Log:", e);
        await reply(`*❌ Error:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: "⚠️", key: mek.key } });
    }
});





































cmd({
    pattern: "cineauto",
    react: '🔄',
    category: "movie",
    desc: "A-Z Movie Automation with DB Save & File Sender",
    filename: __filename
},
async (conn, m, mek, { from, reply }) => {
    try {
        if (autoStatus) return await reply("*⚠️ Automation is already running!*");
        autoStatus = true;

        const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        await reply("*🚀 Starting A-Z Automation & DB Syncing...*");

        for (let char of alphabet) {
            if (!autoStatus) break;

            const searchUrl = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-search?q=${char}&apikey=82406ca340409d44`;
            const searchRes = await axios.get(searchUrl);
            if (!searchRes.data.status || !searchRes.data.data) continue;

            for (let movie of searchRes.data.data) {
                if (!autoStatus) break;

                try {
                    // 1. චිත්‍රපට විස්තර ලබා ගැනීම
                    const infoUrl = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(movie.link)}&apikey=82406ca340409d44`;
                    const infoRes = await axios.get(infoUrl);
                    const movieData = infoRes.data.data;
                    if (!movieData) continue;

                    // 2. DB එක පරීක්ෂා කිරීම සහ ලින්ක් ලබා ගැනීම
                    const { db } = await getStoredData();
                    let linkData = db[movie.link] || null;

                    if (!linkData) {
                        const dlApi = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(movie.link)}&apikey=82406ca340409d44`;
                        const dlRes = await axios.get(dlApi);
                        const dlLinks = dlRes.data.data.download;
                        const target = dlLinks.find(l => l && (l.name === "mega" || l.name === "gdrive" || l.name === "pix"));

                        if (target) {
                            linkData = { type: target.name, url: target.url };
                            await saveToDb(movie.link, linkData); // DB එකට Save කිරීම
                        }
                    }

                    if (linkData) {
                        // 3. Card එක යැවීම
                        let msg = `*🍿 𝗧ɪᴛʟᴇ ➮* *_${movieData.title}_*\n*📅 𝗬ᴇᴀʀ ➮* _${movieData.year || 'N/A'}_\n*⚖️ 𝗦ɪᴢᴇ ➮* _${movieData.size || 'N/A'}_`;
                        await conn.sendMessage(from, { image: { url: movieData.image }, caption: msg });

                        // 4. File එක Direct කර යැවීම
                        let finalDownloadUrl = "";
                        if (linkData.type === 'mega') {
                            const megaRes = await axios.get(`https://apis.sadas.dev/api/v1/download/mega?q=${encodeURIComponent(linkData.url)}&apiKey=${MEGA_API_KEY}`);
                            finalDownloadUrl = megaRes.data.data.result.download;
                        } else if (linkData.type === 'gdrive') {
                            const gdRes = await fg.GDriveDl(linkData.url.replace('download?id=', 'file/d/').split('&')[0]);
                            finalDownloadUrl = gdRes.downloadUrl;
                        }
                                                 else { finalDownloadUrl = linkData.url }

                        await conn.sendMessage(from, { 
                            document: { url: finalDownloadUrl }, 
                            mimetype: 'video/mp4',
                            fileName: `🎬 ${movieData.title}.mp4`,
                            caption: `*✅ Done:* ${movieData.title}`
                        });
                    }

                    // විරාමයක් ලබා දීම
                    await new Promise(resolve => setTimeout(resolve, 15000));

                } catch (err) {
                    console.log("Error in Loop:", err);
                    continue;
                }
            }
        }
        autoStatus = false;
        await reply("*✅ A-Z Automation Completed!*");
    } catch (e) {
        autoStatus = false;
        console.log(e);
    }
});

// Stop Command
cmd({ pattern: "stopauto", filename: __filename }, async (conn, m, mek, { reply }) => {
    autoStatus = false;
    await reply("*🛑 Automation Stopped!*");
});













cmd({
    pattern: "cdetails",
    react: '🎬',
    desc: "Movie details sender from Cinesubz",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, reply }) => {
    try {
        if (!q) 
            return await reply('⚠️ *Please provide the movie URL!*');

        // URL එක පමණක් ලබා ගැනීම (පැරණි logic එකේ තිබූ split අවශ්‍ය නැතිනම් කෙලින්ම q භාවිතා කළ හැක)
        const movieUrl = q;

        // API එකෙන් විස්තර ලබා ගැනීම
        let sadas = await fetchJson(`https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${movieUrl}&apikey=82406ca340409d44`);

        if (!sadas || !sadas.status || !sadas.data) {
            return await conn.sendMessage(from, { text: '🚩 *Error: Could not fetch movie details!*' }, { quoted: mek });
        }

        const movie = sadas.data;
        let details = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;

        // විස්තර පෙළ සැකසීම (නව API Response එකට අනුව)
        let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${movie.title || 'N/A'}_*

*📅 𝗬ᴇᴀʀ ➮* _${movie.year || 'N/A'}_
*💃 𝗥ᴀᴛɪɴɢ ➮* _${movie.rating || 'N/A'}_
*⏰ 𝗗ᴜʀᴀᴛɪᴏᴍ ➮* _${movie.duration || 'N/A'}_
*🌍 𝗖ᴏᴜɴᴛʀʏ ➮* _${movie.country || 'N/A'}_
*🎭 𝗤ᴜᴀʟɪᴛʏ ➮* _${movie.quality || 'N/A'}_
*🎬 𝗗ɪʀᴇᴄᴛᴏʀ ➮* _${movie.directors || 'N/A'}_
*🎬 𝗠ᴏᴠɪᴇ 𝗧ᴀɢ ➮* _${movie.tag || 'N/A'}_

✨ *Follow us:* ${details.mvchlink}`;

        // පණිවිඩය යැවීම (API එකෙන් එන image එක භාවිතා කරයි)
        await conn.sendMessage(config.JID || from, {
            image: { url: movie.image },
            caption: msg
        });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (error) {
        console.error('Error:', error);
        await conn.sendMessage(from, '⚠️ *An error occurred while fetching details.*', { quoted: mek });
    }
});

cmd({
    pattern: "sinhalasubdetails",
    react: '🎬',
    desc: "Movie details sender from SinhalaSub",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, reply }) => {
    try {
        if (!q) 
            return await reply('⚠️ *Please provide the movie search query!*');

        // ඔබ දුන් API URL එක (q යනු සෙවිය යුතු නමයි)
        let apiUrl = `https://apis.sadas.dev/api/v1/movie/sinhalasub/infodl?q=${q}&apiKey=sadasggggg`;
        let sadas = await fetchJson(apiUrl);

        if (!sadas || !sadas.status || !sadas.data) {
            return await conn.sendMessage(from, { text: '🚩 *Error: Could not find movie details!*' }, { quoted: mek });
        }

        const movie = sadas.data;
         let details = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;
        // විස්තර පෙළ සැකසීම
        let msg = `*🎬 𝗧ɪᴛʟᴇ ➮* *_${movie.title || 'N/A'}_*

*📅 𝗬ᴇᴀʀ ➮* _${movie.date || 'N/A'}_
*🌟 𝗥ᴀᴛɪɴɢ ➮* _${movie.rating || 'N/A'}_
*⏰ 𝗗ᴜʀᴀᴛɪᴏɴ ➮* _${movie.duration || 'N/A'}_
*🌍 𝗖ᴏᴜɴᴛʀʏ ➮* _${movie.country || 'N/A'}_
*✍️ 𝗔ᴜᴛʜᴏʀ ➮* _${movie.author || 'N/A'}_
*📂 𝗦ᴜʙᴛɪᴛʟᴇꜱ ➮* _${movie.subtitles || 'N/A'}_
*📝 𝗗ᴇsᴄʀɪᴘᴛɪᴏɴ ➮*
_${movie.description || 'N/A'}_

✨ *Follow us:* ${details.mvchlink}`;

        // පණිවිඩය යැවීම
        await conn.sendMessage(from, {
            image: { url: movie.images[0] }, // API එකේ images array එකේ පළමු එක
            caption: msg
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (error) {
        console.error('Error:', error);
        await conn.sendMessage(from, { text: '⚠️ *An error occurred while fetching details.*' }, { quoted: mek });
    }
});





cmd({
    pattern: "imdb",  
    alias: ["mvinfo","filminfo"],
    desc: "Fetch detailed information about a movie.",
    category: "movie",
    react: "🎬",
    use: '.movieinfo < Movie Name >',
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, msr, creator, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {


if(!q) return await reply(msr.giveme)
        
        const apiUrl = `http://www.omdbapi.com/?t=${encodeURIComponent(q)}&apikey=76cb7f39`;
        const response = await axios.get(apiUrl);

        const data = response.data;
       
const details = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data
 
        const movieInfo = `*☘️ 𝗧ɪᴛʟᴇ ➮* ${data.Title}


*📅 𝗥ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ ➮* ${data.Released}
*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* ${data.Runtime}
*🎭 𝗚ᴇɴᴀʀᴇꜱ ➮* ${data.Genre}
*💁‍♂️ 𝗦ᴜʙᴛɪᴛʟᴇ ʙʏ ➮* ${data.Director}
*🌎 𝗖ᴏᴜɴᴛʀʏ ➮* ${data.Country}
*💃 𝗥ᴀᴛɪɴɢ ➮* ${data.imdbRating}

> 🌟 Follow us : *${details.chlink}*`;

        // Define the image URL
        const imageUrl = data.Poster && data.Poster !== 'N/A' ? data.Poster : config.LOGO;

        // Send the movie information along with the poster image
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: `${movieInfo}
            
           `
          
        });
    } catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
})
cmd({
    pattern: "sublk",        
    react: '🎬',
    category: "movie",
    desc: "SUB.LK movie search",
    use: ".sublk Avatar",
    filename: __filename
},
async (conn, m, mek, { from, isPre, q, prefix, isMe, isSudo, isOwner, reply }) => {
try {
    if (!q) return await reply('*Please give me a movie name 🎥*')

    // Fetch data from SUB.LK API
    let url = await fetchJson(`https://visper-md-ap-is.vercel.app/movie/sublk/SEARCH?q=${encodeURIComponent(q)}`)

    if (!url || !url.result || url.result.length === 0) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
    }

    // Create rows with rowId
    var srh = [];  
    for (var i = 0; i < url.result.length; i++) {
        srh.push({
            title: url.result[i].title,
            //description: url.result[i].year || '',
            rowId: prefix + `sdl ${url.result[i].link}&${url.result[i].year}`
        });
    }

    const listMessage = {
        text: `*_SUB.LK MOVIE SEARCH RESULT 🎬_*

*\`Input :\`* ${q}`,
        footer: config.FOOTER,
        title: 'SUB.LK Results',
        buttonText: '*Reply Below Number 🔢*',
        sections: [{
            title: "SUB.LK Results",
            rows: srh
        }]
    }

    const caption = `*_SUB.LK MOVIE SEARCH RESULT 🎬_*

*\`Input :\`* ${q}
_Total results:_ ${url.result.length}`

    // Also create listButtons for button mode
    const rowss = url.result.map((v, i) => {
        return {
            title: v.title || `Result ${i+1}`,
            id: prefix + `sdl ${v.link}&${v.year}`
        }
    });

    const listButtons = {
        title: "Choose a Movie 🎬",
        sections: [
            {
                title: "SUB.LK Search Results",
                rows: rowss
            }
        ]
    };

    // Send as buttons or list depending on config
    if (config.BUTTON === "true") {
        await conn.sendMessage(from, {
            image: { url: config.LOGO },
            caption: caption,
            footer: config.FOOTER,
            buttons: [
                {
                    buttonId: "download_list",
                    buttonText: { displayText: "🎥 Select Option" },
                    type: 4,
                    nativeFlowInfo: {
                        name: "single_select",
                        paramsJson: JSON.stringify(listButtons)
                    }
                }
            ],
            headerType: 1,
            viewOnce: true
        }, { quoted: mek });
    } else {
        await conn.listMessage(from, listMessage, mek)
    }

} catch (e) {
    console.log(e)
    await conn.sendMessage(from, { text: '🚩 *Error fetching results !!*' }, { quoted: mek })
}
})

cmd({
    pattern: "sdl",    
    react: '🎥',
    desc: "SUB.LK movie downloader",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
try {
    if (!q || !q.includes('https://sub.lk/movies/')) {
        return await reply('*❗ Invalid link. Please search using .sublk and select a movie.*');
    }

    let data = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/sublk/infodl?q=${q}&apiKey=sadasggggg`);
    
    // JSON එකේ ඇතුලත තියෙන්නේ 'data' කියන object එකයි
    const res = data.data;

    if (!res) return await reply('*🚩 No details found !*');

    let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${res.title || 'N/A'}_*
${res.tagline ? `*✨ Tagline:* _${res.tagline}_` : ''}

*📅 𝗥ᴇʟᴇᴀꜱᴇ 𝗗𝗮𝘁𝗲 ➮* _${res.releaseDate || 'N/A'}_
*🌎 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${res.country || 'N/A'}_
*💃 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _Value: ${res.ratingValue || 'N/A'} (Count: ${res.ratingCount || 'N/A'})_
*⏰ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲 ➮* _${res.runtime || 'N/A'}_
*🎭 𝗚𝗲𝗻𝗿𝗲𝘀 ➮* ${res.genres?.join(', ') || 'N/A'}
`;

    let rows = [];

rows.push({
      buttonId: prefix + 'ssdetails ' + q, buttonText: {displayText: 'Details send'}, type: 1}

);
	
    // මෙහි downloads array එකේ නම 'pixeldrainDownloads' වේ
    if (res.pixeldrainDownloads && res.pixeldrainDownloads.length > 0) {
        res.pixeldrainDownloads.forEach((dl) => {
            rows.push({
                buttonId: `${prefix}subdl ${dl.finalDownloadUrl}±${res.imageUrl}±${res.title}±[${dl.quality}]`,
                buttonText: { 
                    displayText: `${dl.size} - ${dl.quality}`
                },
                type: 1
            });
        });
    }

    const buttonMessage = {
        image: { url: res.imageUrl.replace('-200x300', '') }, // High quality image එක සඳහා
        caption: msg,
        footer: config.FOOTER,
        buttons: rows,
        headerType: 4
    };

    return await conn.buttonMessage(from, buttonMessage, mek);

} catch (e) {
    console.log(e);
    await conn.sendMessage(from, { text: '🚩 *Error occurred while fetching data!*' }, { quoted: mek });
}
})

cmd({
    pattern: "subdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    
    if (typeof isUploadinggggg !== 'undefined' && isUploadinggggg) {
        return await conn.sendMessage(from, { 
            text: '*A movie is already being uploaded. Please wait until it finishes.* ⏳', 
            quoted: mek 
        });
    }

    try {
        // split කිරීමේදී "±" භාවිතා කරන්න
        const [megaUrl, imglink, title, quality] = q.split("±");

        if (!megaUrl || !imglink || !title) {
            return await reply("⚠️ Invalid format.");
        }

        isUploadingggggggggg = true; 
      await conn.sendMessage(from, { text: '*Fetching direct link from Mega...* ⏳', quoted: mek });

        // මෙතැනදී encodeURIComponent භාවිතා කර API Request එක යැවීම
        const apiUrl = `https://sadaslk-fast-mega-dl.vercel.app/mega?q=${encodeURIComponent(megaUrl.trim())}`;
        let megaApi = await fetchJson(apiUrl);
        
        if (!megaApi.status || !megaApi.result || !megaApi.result.download) {
            isUploadinggggg = false;
            return await reply("🚫 *Failed to fetch download link from Mega! Check the link again.*");
        }

        const directDownloadUrl = megaApi.result.download;
        const fileName = megaApi.result.name || title;

        await conn.sendMessage(from, { text: '*Uploading your movie.. ⬆️*', quoted: mek });

        const message = {
            document: { url: directDownloadUrl },
            caption: `🎬 *${title}*\n\n*\`${quality}\`*\n\n${config.NAME}`,
            mimetype: "video/mp4",
            jpegThumbnail: await (await fetch(imglink.trim())).buffer(),
            fileName: `🎬 ${fileName}.mp4`,
        };

        await conn.sendMessage(config.JID || from, message);
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (e) {
        console.error("sindl error:", e);
        reply('🚫 *Error Occurred !!*\n\n' + e.message);
    } finally {
        isUploadingggggggggg = false; 
    }
});



cmd({
    pattern: "ssdetails",
    react: '🎬',
    desc: "Movie details sender (Details Only)",
    filename: __filename
},
async (conn, m, mek, { from, q, isMe, reply }) => {
    try {
        if (!q) 
            return await reply('⚠️ *Please provide the movie URL!*');

        // URL එක ලබා ගැනීම
        const movieUrl = q;

        // API එකෙන් විස්තර ලබා ගැනීම
        let sadas = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/sublk/infodl?q=${movieUrl}&apiKey=sadasggggg`);

        if (!sadas || !sadas.status || !sadas.data) {
            return await conn.sendMessage(from, { text: '🚩 *Error: Could not fetch movie details!*' }, { quoted: mek });
        }

        const movie = sadas.data;
        let details = (await axios.get('https://mv-visper-full-db.pages.dev/Main/main_var.json')).data;

        // විස්තර පෙළ සැකසීම (Download links රහිතව)
        let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${movie.title || 'N/A'}_*
*✨ 𝗧𝗮𝗴𝗹𝗶𝗻𝗲 ➮* _${movie.tagline || 'N/A'}_

*📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲 ➮* _${movie.releaseDate || 'N/A'}_
*💃 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${movie.ratingValue || 'N/A'} (${movie.ratingCount})_
*⏰ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲 ➮* _${movie.runtime || 'N/A'}_
*🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${movie.country || 'N/A'}_
*🎭 𝗚𝗲𝗻ﺮ𝗲𝘀 ➮* ${movie.genres ? movie.genres.join(', ') : 'N/A'}
*🔞 𝗖𝗼𝗻𝘁𝗲𝗻𝘁 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${movie.contentRating || 'N/A'}_

✨ *Follow us:* ${details.chlink}`;

        // පණිවිඩය යැවීම
        await conn.sendMessage(config.JID || from, {
            image: { url: movie.imageUrl },
            caption: msg
        });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (error) {
        console.error('Error:', error);
        await conn.sendMessage(from, '⚠️ *An error occurred while fetching details.*', { quoted: mek });
    }
});





