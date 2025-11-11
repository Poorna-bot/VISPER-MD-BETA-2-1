const config = require('../config')
const fg = require('api-dylux');
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
cmd({
    pattern: "dnkdrive",
    alias: ["dgd"],
    react: '📑',
    desc: "Download googledrive files.",
    category: "download",
    use: '.gdrive <googledrive link>',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
  if (!q) return await  reply('*Please give me googledrive url !!*')   
let res = await fg.GDriveDl(q.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download' , '/view'))
reply(`*⬇ DINKA GDRIVE DOWNLOADER ⬇* \n\n*📃 File name:*  ${res.fileName}
*💈 File Size:* ${res.fileSize}
*🕹️ File type:* ${res.mimetype}

*•ɴᴀᴅᴇᴇɴ-ᴍᴅ•* `)		
conn.sendMessage(from, { document: { url: res.downloadUrl }, fileName: "📽️DINKA📽️"+ res.fileName, mimetype: res.mimetype, caption: res.fileName.replace('[Cinesubz.co]' , '[DINKA-MOVIES.lk]') +'\n\n> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*'}, { quoted: mek })
} catch (e) {
reply('*Error !!*')
l(e)
}
})
