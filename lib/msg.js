
import pkg from '@whiskeysockets/baileys';
const { proto, downloadContentFromMessage, getContentType, jidNormalizedUser } = pkg;
import fs from 'fs';

/**
 * මීඩියා මැසේජ් ඩවුන්ලෝඩ් කරන ෆන්ක්ෂන් එක
 */
const downloadMediaMessage = async (m, filename) => {
    if (m.type === 'viewOnceMessage') {
        m.type = m.msg.type;
    }
    
    // මීඩියා ටයිප් එක අනුව අදාළ එක්ස්ටෙන්ෂන් එක තේරීම
    let mimeType = m.type.replace('Message', '');
    let extension = '';
    
    if (m.type === 'imageMessage') extension = '.jpg';
    else if (m.type === 'videoMessage') extension = '.mp4';
    else if (m.type === 'audioMessage') extension = '.mp3';
    else if (m.type === 'stickerMessage') extension = '.webp';
    else if (m.type === 'documentMessage') {
        extension = '.' + m.msg.fileName.split('.').pop().toLowerCase()
            .replace('jpeg', 'jpg').replace('png', 'jpg').replace('m4a', 'mp3');
    }

    const nameFile = filename ? filename + extension : 'undefined' + extension;
    const stream = await downloadContentFromMessage(m.msg, mimeType === 'document' ? 'document' : mimeType.toLowerCase());
    
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    fs.writeFileSync(nameFile, buffer);
    return fs.readFileSync(nameFile);
};

/**
 * මැසේජ් එක ලේසියෙන් හසුරුවන්න පුළුවන් විදිහට සකස් කරන ෆන්ක්ෂන් එක
 */
const sms = (conn, m, groupMetadata = null) => {
    if (m.key) {
        m.id = m.key.id;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        
        let rawSender;
        if (m.fromMe) {
            rawSender = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        } else {
            rawSender = m.key.senderPn || m.key.participantAlt || m.key.remoteJidAlt || 
                        (m.isGroup ? m.key.participant : m.key.remoteJid);
        }

        let sender = jidNormalizedUser(rawSender);

        if (m.isGroup && sender.includes('@lid') && groupMetadata?.participants) {
            const participant = groupMetadata.participants.find(p => p.id === sender || p.lid === sender);
            if (participant) sender = participant.jid;
        }
        m.sender = sender;
    }

    if (m.message) {
        m.type = getContentType(m.message);
        m.msg = (m.type === 'viewOnceMessage') ? m.message[m.type].message[getContentType(m.message[m.type].message)] : m.message[m.type];
        
        if (m.msg) {
            if (m.type === 'viewOnceMessage') {
                m.msg.type = getContentType(m.message[m.type].message);
            }

            // Mentions හැසිරවීම
            const quotedMention = m.msg.contextInfo?.participant || '';
            const tagMention = m.msg.contextInfo?.mentionedJid || [];
            const mention = typeof tagMention === 'string' ? [tagMention] : tagMention;
            if (quotedMention) mention.push(quotedMention);

            m.mentionUser = mention.length > 0 ? mention.filter(Boolean).map(jid => {
                let resolvedJid = jidNormalizedUser(jid);
                if (m.isGroup && resolvedJid.includes('@lid') && groupMetadata?.participants) {
                    const participant = groupMetadata.participants.find(p => p.id === resolvedJid || p.lid === resolvedJid);
                    if (participant) resolvedJid = participant.jid;
                }
                return resolvedJid;
            }) : [];

            m.body = (m.type === 'conversation') ? m.msg : 
                     (m.type === 'extendedTextMessage') ? m.msg.text : 
                     (m.type == 'imageMessage') && m.msg.caption ? m.msg.caption : 
                     (m.type == 'videoMessage') && m.msg.caption ? m.msg.caption : 
                     (m.type == 'templateButtonReplyMessage') && m.msg.selectedId ? m.msg.selectedId : 
                     (m.type == 'buttonsResponseMessage') && m.msg.selectedButtonId ? m.msg.selectedButtonId : '';

            m.quoted = m.msg.contextInfo != undefined ? m.msg.contextInfo.quotedMessage : null;

            if (m.quoted) {
                m.quoted.type = getContentType(m.quoted);
                m.quoted.id = m.msg.contextInfo.stanzaId;
                
                let rawQuotedSender = m.msg.contextInfo.participant;
                if (rawQuotedSender) {
                    let quotedSender = jidNormalizedUser(rawQuotedSender);
                    if (quotedSender.includes('@lid')) {
                        if (m.isGroup && groupMetadata?.participants) {
                            const participant = groupMetadata.participants.find(p => p.id === quotedSender || p.lid === quotedSender);
                            if (participant) quotedSender = participant.jid;
                        } else if (!m.isGroup) {
                            const myLid = conn.user?.lid ? jidNormalizedUser(conn.user.lid) : null;
                            const isMe = myLid ? (quotedSender === myLid) : false;
                            quotedSender = isMe ? jidNormalizedUser(conn.user.id) : jidNormalizedUser(m.chat);
                        }
                    }
                    m.quoted.sender = quotedSender;
                }

                m.quoted.fromMe = m.quoted.sender.split('@')[0].includes(conn.user.id.split(':')[0]);
                m.quoted.msg = (m.quoted.type === 'viewOnceMessage') ? m.quoted[m.quoted.type].message[getContentType(m.quoted[m.quoted.type].message)] : m.quoted[m.quoted.type];
                
                if (m.quoted.type === 'viewOnceMessage') {
                    m.quoted.msg.type = getContentType(m.quoted[m.quoted.type].message);
                }

                const quoted_quotedMention = m.quoted.msg?.contextInfo?.participant || '';
                const quoted_tagMention = m.quoted.msg?.contextInfo?.mentionedJid || [];
                const quoted_mention = typeof quoted_tagMention === 'string' ? [quoted_tagMention] : quoted_tagMention;
                if (quoted_quotedMention) quoted_mention.push(quoted_quotedMention);

                m.quoted.mentionUser = quoted_mention.length > 0 ? quoted_mention.filter(Boolean).map(jid => {
                    let resolvedJid = jidNormalizedUser(jid);
                    if (m.isGroup && resolvedJid.includes('@lid') && groupMetadata?.participants) {
                        const participant = groupMetadata.participants.find(p => p.id === resolvedJid || p.lid === resolvedJid);
                        if (participant) resolvedJid = participant.jid;
                    }
                    return resolvedJid;
                }) : [];

                m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
                    key: {
                        remoteJid: m.chat,
                        fromMe: m.quoted.fromMe,
                        id: m.quoted.id,
                        participant: m.quoted.sender
                    },
                    message: m.quoted
                });

                m.quoted.download = (filename) => downloadMediaMessage(m.quoted, filename);
                m.quoted.delete = () => conn.sendMessage(m.chat, { delete: m.quoted.fakeObj.key });
                m.quoted.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.quoted.fakeObj.key } });
            }
        }
        m.download = (filename) => downloadMediaMessage(m, filename);
    }

    // Quick Reply functions
    m.reply = (teks, id = m.chat, option = { mentions: [m.sender] }) => conn.sendMessage(id, { text: teks, contextInfo: { mentionedJid: option.mentions } }, { quoted: m });
    m.replyS = (stik, id = m.chat, option = { mentions: [m.sender] }) => conn.sendMessage(id, { sticker: stik, contextInfo: { mentionedJid: option.mentions } }, { quoted: m });
    m.replyImg = (img, teks, id = m.chat, option = { mentions: [m.sender] }) => conn.sendMessage(id, { image: img, caption: teks, contextInfo: { mentionedJid: option.mentions } }, { quoted: m });
    m.replyVid = (vid, teks, id = m.chat, option = { mentions: [m.sender], gif: false }) => conn.sendMessage(id, { video: vid, caption: teks, gifPlayback: option.gif, contextInfo: { mentionedJid: option.mentions } }, { quoted: m });
    m.replyAud = (aud, id = m.chat, option = { mentions: [m.sender], ptt: false }) => conn.sendMessage(id, { audio: aud, ptt: option.ptt, mimetype: 'audio/mpeg', contextInfo: { mentionedJid: option.mentions } }, { quoted: m });
    m.replyDoc = (doc, id = m.chat, option = { mentions: [m.sender], filename: 'undefined.pdf', mimetype: 'application/pdf' }) => conn.sendMessage(id, { document: doc, mimetype: option.mimetype, fileName: option.filename, contextInfo: { mentionedJid: option.mentions } }, { quoted: m });
    m.replyContact = (name, info, number) => {
        const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + name + '\n' + 'ORG:' + info + ';\n' + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n' + 'END:VCARD';
        conn.sendMessage(m.chat, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: m });
    };
    m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });

    return m;
};

// ESM Export
export { sms, downloadMediaMessage };
