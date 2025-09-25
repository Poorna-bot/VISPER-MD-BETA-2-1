const config = require('../config')
const os = require('os')
const {
    cmd,
    commands
} = require('../command')
const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson
} = require('../lib/functions')


cmd({
    pattern: "approve",
    desc: "Automatically approve Specific Country users in the waiting list",
    react: "✅",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { isGroup, isBotAdmins, isAdmins, args, reply }) => {
    try {
        if (!isGroup) return reply("This command is only for groups.");
        if (!isBotAdmins) return reply("I need to be a group admin to perform this action.");
        if (!isAdmins) return reply("You must be an admin to use this command.");

        const groupJid = mek.key.remoteJid;
        const response = await conn.groupRequestParticipantsList(groupJid);
        
        if (response.length === 0) {
            return reply("No participants are in the waiting list.");
        }
        const toAddUsers = response.filter(user => user.jid.startsWith(config.AUTO_ADD_Country_Code));

        if (toAddUsers.length === 0) {
            return reply("No +94 users found in the waiting list.");
        }

        const userJids = toAddUsers.map(user => user.jid);
        const approveResponse = await conn.groupRequestParticipantsUpdate(
            groupJid, 
            userJids,
            "approve"
        );

        console.log(approveResponse);
        reply(`Approved the following +94 users:\n${userJids.join("\n")}`);

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        reply(`Error: ${e}`);
    }
});



cmd({
    pattern: "requests",
    desc: "View pending join requests",
    use: ".requests",
    react: "📝",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) {
        return await reply("This command can only be used in groups.");
    }
    const botNumber = conn.user.jid;
    const groupMetadata = await conn.groupMetadata(from);
    const isBotAdmin = groupMetadata.participants.some(participant => participant.jid === botNumber && participant.admin);

    if (!isBotAdmin) {
        return await reply("I'm not an admin in this group.");
    }

    try {
        const requests = await conn.groupRequestParticipantsList(from);
        if (requests.length === 0) {
            return await reply("No pending join requests.");
        }

        let msg = "Pending Join Requests:\n\n";
        requests.forEach((request, index) => {
            msg += `${index + 1}. @${request.jid.split("@")[0]}\n`;
        });
        return await reply(msg, { mentions: requests.map(r => r.jid) });
    } catch (error) {
        console.error('Error retrieving join requests:', error);
        return await reply("Failed to retrieve join requests. Please try again later.");
    }
});

// Command to accept group join requests
cmd({
    pattern: "accept",
    desc: "Accept group join request(s)",
    use: ".accept <request numbers>",
    react: "✔️",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, match }) => {
    // Check if the command is being used in a group
    if (!isGroup) {
        return await reply("This command can only be used in groups.");
    }
    const botNumber = conn.user.jid;
    const groupMetadata = await conn.groupMetadata(from);
    const isBotAdmin = groupMetadata.participants.some(participant => participant.jid === botNumber && participant.admin);

    if (!isBotAdmin) {
        return await reply("_I'm not an admin in this group._");
    }
    try {
        const requests = await conn.groupRequestParticipantsList(from);
        if (requests.length === 0) {
            return await reply("No pending join requests.");
        }
        if (!match) {
            return await reply("_Provide the number(s) of the request(s) to accept, separated by commas._");
        }
        const indexes = match.split(",").map(num => parseInt(num.trim()) - 1);
        const validIndexes = indexes.filter(index => index >= 0 && index < requests.length);
        if (validIndexes.length === 0) {
            return await reply("_Invalid request number(s)._");
        }
        for (let index of validIndexes) {
            await conn.groupRequestParticipantsUpdate(from, [requests[index].jid], "accept");
        }
        return await reply(`_Accepted ${validIndexes.length} join request(s)._`);
    } catch (error) {
        console.error('Error accepting join requests:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        return await reply("Failed to accept join requests. Please try again later.");
    }
});

// Command to reject group join requests
cmd({
    pattern: "reject",
    desc: "Reject group join request(s)",
    use: ".reject <request numbers>",
    react: "❌",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, match }) => {
    if (!isGroup) {
        return await reply("This command can only be used in groups.");
    }
    const botNumber = conn.user.jid;
    const groupMetadata = await conn.groupMetadata(from);
    const isBotAdmin = groupMetadata.participants.some(participant => participant.jid === botNumber && participant.admin);

    if (!isBotAdmin) {
        return await reply("I'm not an admin in this group.");
    }

    try {
        const requests = await conn.groupRequestParticipantsList(from);
        if (requests.length === 0) {
            return await reply("No pending join requests.");
        }
        if (!match) {
            return await reply("Provide the number(s) of the request(s) to reject, separated by commas.");
        }

        const indexes = match.split(",").map(num => parseInt(num.trim()) - 1);
        const validIndexes = indexes.filter(index => index >= 0 && index < requests.length);

        if (validIndexes.length === 0) {
            return await reply("_Invalid request number(s)._");
        }
        for (let index of validIndexes) {
            await conn.groupRequestParticipantsUpdate(from, [requests[index].jid], "reject");
        }

        return await reply(`_Rejected ${validIndexes.length} join request(s)._`);
    } catch (error) {
        console.error('Error rejecting join requests:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        return await reply("Failed to reject join requests. Please try again later.");
    }
});



//---------------------------------------------Hide Tag --------------------------------------------

cmd({
    pattern: "hidetag",
    react: "📢",
    alias: ["htag"],
    desc: "Tags everyone in group without showing numbers",
    category: "group",
    filename: __filename,
    use: '<text>',
},
async (conn, mek, m, {
    from, l, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber,
    pushname, isMe, isOwner, groupMetadata, groupName,
    participants, isItzcp, groupAdmins, isBotAdmins, isAdmins, reply
}) => {

    if (!isGroup) return reply('Group only command ⛔');
    if (!isOwner && !isAdmins) return reply('Only admins can use this command ⛔');
    if (!isBotAdmins) return reply('I need to be admin to tag members ⛔');

    try {
        conn.sendMessage(m.chat, {
            text: q ? q : "",
            mentions: participants.map((a) => a.id),
        }, {
            quoted: mek
        });
    } catch (e) {
        reply('*Error !!*');
        l(e);
    }
});

// ===== GROUP COMMANDS =====
cmd({
    pattern: "kick",
    react: "🥏",
    alias: ["remove"],
    desc: "Remove a participant from the group.",
    category: "group",
    use: '.kick',
    filename: __filename
}, async (conn, mek, m, { from, mentionByTag, isGroup, isAdmins, isMe, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*\nThis command works only in groups.");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied*\nYou must be a group admin to use this.");
        if (!isBotAdmins) return reply("❌ *Bot Lacks Permission*\nMake me an admin to perform this action.");

        const mention = await mentionByTag;
        let users = mention || mek?.msg?.contextInfo?.participant;
        if (!users) return reply("⚠️ *No User Mentioned*\nTag a user or reply to their message.");

        await conn.groupParticipantsUpdate(from, [users], "remove");
        await conn.sendMessage(from, { text: `✅ *User Removed Successfully*` }, { quoted: mek });
    } catch (e) {
        reply(`🚫 *An Error Occurred!*\n${e}`);
        console.error(e);
    }
});


// ===== MAIN / UTILITY COMMANDS =====

// --- JOIN GROUP BY LINK ---
cmd({
    pattern: "join",
    desc: "Join a group via WhatsApp link.",
    category: "main",
    use: '<group link>',
}, async (conn, mek, m, { q, isOwner, isSadas, isMe, isDev, reply }) => {
    if (!isOwner && !isSadas && !isDev && !isMe) return; // restricted access
    try {
        if (!q) return reply("⚠️ *No Link Provided*\nPlease provide a WhatsApp group link.");
        if (!q.includes("https://chat.whatsapp.com/")) return reply("❌ *Invalid Link*\nPlease send a valid WhatsApp group link.");

        const inviteCode = q.split("https://chat.whatsapp.com/")[1].trim();
        await conn.groupAcceptInvite(inviteCode)
            .then(() => reply("✅ *Joined Group Successfully*"))
            .catch(() => reply("🚫 *Failed to Join Group*"));
    } catch (e) {
        reply("🚫 *An Error Occurred!*");
        console.error(e);
    }
});

// --- DELETE MESSAGE ---
cmd({
    pattern: "del",
    react: "⛔",
    alias: [","],
    desc: "Delete a message.",
    category: "main",
    use: '.del',
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        if (!m.quoted) return reply("⚠️ *Reply to a message to delete it.*");

        const key = {
            remoteJid: m.chat,
            fromMe: false,
            id: m.quoted.id,
            participant: m.quoted.sender
        };
        await conn.sendMessage(m.chat, { delete: key });
        await reply("✅ *Message Deleted Successfully*");
    } catch (e) {
        reply("🚫 *Failed to Delete Message!*");
        console.error(e);
    }
});

// --- BLOCK CONTACT / USER ---
cmd({
    pattern: "block",
    react: "⛔",
    desc: "Block a contact or user (OWNER ONLY).",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, isMe, reply }) => {
    try {
        if (!isMe) return reply("⛔ *OWNER ONLY COMMAND*");

        await conn.updateBlockStatus(from, 'block');
        await reply("✅ *Contact Blocked Successfully*");
    } catch (e) {
        reply("🚫 *Failed to Block Contact!*");
        console.error(e);
    }
});


cmd({
    pattern: "promote",
    react: "🥏",
    alias: ["addadmin"],
    desc: "Promote a participant to admin.",
    category: "group",
    use: '.promote',
    filename: __filename
}, async (conn, mek, m, { from, mentionByTag, isGroup, isAdmins, isMe, isBotAdmins, participants, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied*");
        if (!isBotAdmins) return reply("❌ *Bot Lacks Permission*");

        const mention = await mentionByTag;
        let users = mention || mek?.msg?.contextInfo?.participant;
        if (!users) return reply("⚠️ *No User Mentioned*");

        const groupAdmins = participants.filter(p => p.admin).map(a => a.id);
        if (groupAdmins.includes(users)) return reply("ℹ️ *User is already an admin.*");

        await conn.groupParticipantsUpdate(from, [users], "promote");
        await conn.sendMessage(from, { text: `✅ *User Promoted to Admin*` }, { quoted: mek });
    } catch (e) {
        reply(`🚫 *An Error Occurred!*\n${e}`);
        console.error(e);
    }
});

cmd({
    pattern: "demote",
    react: "🥏",
    alias: ["removeadmin"],
    desc: "Demote an admin to member.",
    category: "group",
    use: '.demote',
    filename: __filename
}, async (conn, mek, m, { from, mentionByTag, isGroup, isAdmins, isMe, isBotAdmins, participants, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied*");
        if (!isBotAdmins) return reply("❌ *Bot Lacks Permission*");

        const mention = await mentionByTag;
        let users = mention || mek?.msg?.contextInfo?.participant;
        if (!users) return reply("⚠️ *No User Mentioned*");

        const groupAdmins = participants.filter(p => p.admin).map(a => a.id);
        if (!groupAdmins.includes(users)) return reply("ℹ️ *User is not an admin.*");

        await conn.groupParticipantsUpdate(from, [users], "demote");
        await conn.sendMessage(from, { text: `✅ *User Demoted to Member*` }, { quoted: mek });
    } catch (e) {
        reply(`🚫 *An Error Occurred!*\n${e}`);
        console.error(e);
    }
});

cmd({
    pattern: "mute",
    react: "🔒",
    alias: ["close"],
    desc: "Mute group so only admins can send messages.",
    category: "group",
    use: '.mute',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, isMe, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot Lacks Permission*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied*");

        await conn.groupSettingUpdate(from, 'announcement');
        await conn.sendMessage(from, { text: `🔒 *Group Chat Muted*` }, { quoted: mek });
    } catch (e) {
        reply("🚫 *An Error Occurred!*");
        console.error(e);
    }
});

cmd({
    pattern: "unmute",
    react: "🔓",
    alias: ["open"],
    desc: "Unmute group so all members can send messages.",
    category: "group",
    use: '.unmute',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, isMe, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot Lacks Permission*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied*");

        await conn.groupSettingUpdate(from, 'not_announcement');
        await conn.sendMessage(from, { text: `🔓 *Group Chat Unmuted*` }, { quoted: mek });
    } catch (e) {
        reply("🚫 *An Error Occurred!*");
        console.error(e);
    }
});

cmd({
    pattern: "invite",
    react: "🖇️",
    alias: ["grouplink","glink"],
    desc: "Get group invite link.",
    category: "group",
    use: '.invite',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, isMe, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot Lacks Permission*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied*");

        const code = await conn.groupInviteCode(from);
        await conn.sendMessage(from, { text: `🖇️ *Group Invite Link:*\nhttps://chat.whatsapp.com/${code}` }, { quoted: mek });
    } catch (e) {
        reply("🚫 *An Error Occurred!*");
        console.error(e);
    }
});

cmd({
    pattern: "ginfo",
    react: "📋",
    alias: ["groupinfo"],
    desc: "Get group information.",
    category: "group",
    use: '.ginfo',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, isMe, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot Lacks Permission*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied*");

        const metadata = await conn.groupMetadata(from);
        let ppUrl = await conn.profilePictureUrl(from, 'image');
        const gdata = `
📛 *Group Name:* ${metadata.subject}
🆔 *Group JID:* ${metadata.id}
👥 *Members:* ${metadata.size}
👑 *Creator:* ${metadata.owner || "Unknown"}
📝 *Description:* ${metadata.desc || "No description"}
        `;
        await conn.sendMessage(from, { image: { url: ppUrl }, caption: gdata }, { quoted: mek });
    } catch (e) {
        reply(`🚫 *An Error Occurred!*\n${e}`);
        console.error(e);
    }
});

cmd({
    pattern: "leave",
    react: "👋",
    desc: "Leave the group.",
    category: "group",
    use: '.leave',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isMe, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isMe) return reply("⚠️ *Permission Denied*");

        await conn.sendMessage(from, { text: `👋 *Goodbye Everyone!*` }, { quoted: mek });
        await conn.groupLeave(from);
    } catch (e) {
        reply("🚫 *An Error Occurred!*");
        console.error(e);
    }
});



	
// ===== GROUP MANAGEMENT =====

// --- ADD MEMBER ---
cmd({
    pattern: "add",
    desc: "Add a member to the group.",
    category: "group",
    react: "➕",
    filename: __filename
}, async (conn, mek, m, { from, q, isGroup, isAdmins, isBotAdmins, isMe, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot Lacks Permission* - Make me an admin first.");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied* - Only admins can use this command.");

        const user = q.split(' ')[0];
        if (!user) return reply("⚠️ *No Number Provided*\nPlease provide a phone number to add.");

        await conn.groupParticipantsUpdate(from, [`${user}@s.whatsapp.net`], 'add');
        await reply(`✅ @${user} has been added to the group.`, { mentions: [`${user}@s.whatsapp.net`] });
    } catch (e) {
        console.error(e);
        reply(`🚫 *An Error Occurred!*\n${e}`);
    }
});

// --- REMOVE ALL MEMBERS (EXCEPT BOT & CREATOR) ---
cmd({
    pattern: "end",
    desc: "Remove all members from the group (except bot and creator).",
    category: "group",
    react: "🚫",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, isAdmins, isBotAdmins, isMe, groupMetadata, reply }) => {
    try {
        if (!isOwner && !isMe && !isAdmins && !isBotAdmins) return reply("⚠️ *Permission Denied*\nThis command is restricted.");

        const creator = groupMetadata.owner;
        const botId = conn.user.id;
        const participants = groupMetadata.participants
            .filter(p => p.id !== creator && p.id !== botId)
            .map(p => p.id);

        await conn.groupParticipantsUpdate(from, participants, "remove");
        reply("🚫 *All members have been removed from the group (except bot and creator).*");
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e}`);
    }
});

// --- TAG ALL ADMINS ---
cmd({
    pattern: "tagadmin",
    desc: "Tag all admins in the group.",
    category: "group",
    use: ".tagadmin",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, groupAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!groupAdmins || groupAdmins.length === 0) return reply("ℹ️ *No admins found in this group.*");

        let msg = "*Tagging all admins:*\n\n";
        for (let admin of groupAdmins) {
            msg += `@${admin.split('@')[0]}\n`;
        }

        await conn.sendMessage(from, { text: msg, mentions: groupAdmins }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply("🚫 *Failed to tag admins.* Please try again.");
    }
});

// ===== OWNER COMMANDS =====

// --- SHUTDOWN BOT ---
cmd({
    pattern: "shutdown",
    desc: "Shutdown the bot.",
    category: "owner",
    react: "🛑",
    filename: __filename
}, async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    reply("🛑 *Shutting down...*").then(() => process.exit());
});

// --- BROADCAST MESSAGE ---
cmd({
    pattern: "broadcast",
    desc: "Broadcast a message to all groups.",
    category: "owner",
    react: "📢",
    filename: __filename
}, async (conn, mek, m, { isOwner, args, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!args.length) return reply("📢 Please provide a message to broadcast.");

    const message = args.join(' ');
    const groups = Object.keys(await conn.groupFetchAllParticipating());

    for (const groupId of groups) {
        await conn.sendMessage(groupId, { text: message }, { quoted: mek });
    }

    reply("📢 *Message broadcasted to all groups successfully!*");
});

// --- CLEAR ALL CHATS ---
cmd({
    pattern: "clearchats",
    desc: "Clear all chats from the bot.",
    category: "owner",
    react: "🧹",
    filename: __filename
}, async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    try {
        const chats = conn.chats.all();
        for (const chat of chats) {
            await conn.modifyChat(chat.jid, 'delete');
        }
        reply("🧹 *All chats cleared successfully!*");
    } catch (error) {
        reply(`❌ *Error clearing chats:* ${error.message}`);
    }
});

// ===== MORE GROUP COMMANDS =====

// --- SET GROUP DESCRIPTION ---
cmd({
    pattern: "setdesc",
    desc: "Set or update the group description.",
    category: "group",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isMe, args, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot must be admin to set description.*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied* - Only admins can use this.");

        const newDesc = args.join(' ');
        if (!newDesc) return reply("⚠️ *Please provide a description text.*");

        await conn.groupUpdateDescription(from, newDesc);
        reply(`✅ *Group description updated successfully.*`);
    } catch (e) {
        console.error(e);
        reply(`🚫 *Error updating description:* ${e}`);
    }
});

// --- SET GROUP SUBJECT / NAME ---
cmd({
    pattern: "setname",
    desc: "Change the group name.",
    category: "group",
    react: "✏️",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isMe, args, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot must be admin to change group name.*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied* - Only admins can use this.");

        const newName = args.join(' ');
        if (!newName) return reply("⚠️ *Please provide a new group name.*");

        await conn.groupUpdateSubject(from, newName);
        reply(`✅ *Group name updated to:* ${newName}`);
    } catch (e) {
        console.error(e);
        reply(`🚫 *Error updating group name:* ${e}`);
    }
});

// --- SET GROUP PROFILE PICTURE ---
cmd({
    pattern: "setpp",
    desc: "Change the group profile picture.",
    category: "group",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isMe, quoted, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot must be admin to change group picture.*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied* - Only admins can use this.");
        if (!quoted || !quoted.imageMessage) return reply("⚠️ *Reply to an image to set as group picture.*");

        const imgBuffer = await conn.downloadMediaMessage(quoted);
        await conn.updateProfilePicture(from, imgBuffer);
        reply("✅ *Group profile picture updated successfully.*");
    } catch (e) {
        console.error(e);
        reply(`🚫 *Error updating profile picture:* ${e}`);
    }
});

// --- PIN MESSAGE IN GROUP ---
cmd({
    pattern: "pin",
    desc: "Pin a message in the group.",
    category: "group",
    react: "📌",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isMe, quoted, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot must be admin to pin messages.*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied* - Only admins can use this.");
        if (!quoted) return reply("⚠️ *Reply to a message to pin it.*");

        await conn.groupPinMessage(from, quoted.key.id);
        reply("📌 *Message pinned successfully.*");
    } catch (e) {
        console.error(e);
        reply(`🚫 *Error pinning message:* ${e}`);
    }
});

// --- UNPIN MESSAGE IN GROUP ---
cmd({
    pattern: "unpin",
    desc: "Unpin a pinned message in the group.",
    category: "group",
    react: "📌",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isMe, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot must be admin to unpin messages.*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied* - Only admins can use this.");

        await conn.groupUnpinAllMessages(from);
        reply("📌 *All messages unpinned successfully.*");
    } catch (e) {
        console.error(e);
        reply(`🚫 *Error unpinning messages:* ${e}`);
    }
});

// ===== ADDITIONAL GROUP COMMANDS =====

// --- VIEW GROUP PARTICIPANTS LIST ---
cmd({
    pattern: "participants",
    desc: "List all participants in the group.",
    category: "group",
    react: "👥",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");

        let list = "*Group Participants:*\n\n";
        participants.forEach((p, i) => {
            list += `${i + 1}. @${p.id.split('@')[0]}\n`;
        });

        await conn.sendMessage(from, { text: list, mentions: participants.map(p => p.id) }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply("🚫 *Failed to fetch participants.*");
    }
});

// --- VIEW GROUP ADMINS LIST ---
cmd({
    pattern: "admins",
    desc: "List all admins in the group.",
    category: "group",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, groupAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!groupAdmins || groupAdmins.length === 0) return reply("ℹ️ *No admins found in this group.*");

        let list = "*Group Admins:*\n\n";
        groupAdmins.forEach((admin, i) => {
            list += `${i + 1}. @${admin.split('@')[0]}\n`;
        });

        await conn.sendMessage(from, { text: list, mentions: groupAdmins }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply("🚫 *Failed to fetch admins.*");
    }
});

// --- SET GROUP RESTRICTED MODE (ONLY ADMINS CAN SEND MESSAGES) ---
cmd({
    pattern: "restrict",
    desc: "Restrict group: only admins can send messages.",
    category: "group",
    react: "🔒",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isMe, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot must be admin to change group settings.*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied* - Only admins can use this.");

        await conn.groupSettingUpdate(from, "announcement");
        reply("🔒 *Group restricted: Only admins can send messages now.*");
    } catch (e) {
        console.error(e);
        reply("🚫 *Failed to set restricted mode.*");
    }
});

// --- UNRESTRICT GROUP (ALL MEMBERS CAN SEND MESSAGES) ---
cmd({
    pattern: "unrestrict",
    desc: "Allow all members to send messages in the group.",
    category: "group",
    react: "🔓",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isMe, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot must be admin to change group settings.*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied* - Only admins can use this.");

        await conn.groupSettingUpdate(from, "not_announcement");
        reply("🔓 *Group unrestricted: All members can send messages now.*");
    } catch (e) {
        console.error(e);
        reply("🚫 *Failed to unset restricted mode.*");
    }
});

// --- GET GROUP INVITE LINK ---
cmd({
    pattern: "grouplink",
    desc: "Get the WhatsApp group invite link.",
    category: "group",
    react: "🖇️",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isMe, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot must be admin to generate invite link.*");
        if (!isAdmins && !isMe) return reply("⚠️ *Permission Denied* - Only admins can use this.");

        const code = await conn.groupInviteCode(from);
        reply(`🖇️ *Group Invite Link:*\nhttps://chat.whatsapp.com/${code}`);
    } catch (e) {
        console.error(e);
        reply("🚫 *Failed to get group invite link.*");
    }
});


cmd({
    pattern: "clearpins",
    desc: "Clear all pinned messages in the group",
    category: "group",
    filename: __filename
}, async(conn, mek, m, {from, isGroup, isAdmins, isBotAdmins, reply}) => {
    try {
        if(!isGroup) return reply("⛔ *Group Only Command*");
        if(!isAdmins) return reply("⚠️ *Only admins can use this command.*");
        if(!isBotAdmins) return reply("❌ *Bot must be admin to clear pins.*");

        const metadata = await conn.groupMetadata(from);
        const pinned = metadata.pinnedMessage || [];
        if(pinned.length === 0) return reply("ℹ️ No pinned messages found.");

        for(const msg of pinned) {
            await conn.groupParticipantsUpdate(from, [], 'unpin'); // Some versions require protocol messages
        }

        reply("📌 All pinned messages cleared.");
    } catch(e) {
        console.error(e);
        reply("🚫 Failed to clear pinned messages.");
    }
});


// --- LOCK GROUP INFO ---
cmd({
    pattern: "lockinfo",
    desc: "Lock group info so only admins can edit group info.",
    category: "group",
    react: "🔒",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot must be admin to change group info.*");
        if (!isAdmins) return reply("⚠️ *Only admins can use this command.*");

        await conn.groupSettingUpdate(from, "locked");
        reply("🔒 Group info locked: Only admins can change group info.");
    } catch (e) {
        console.error(e);
        reply("🚫 *Failed to lock group info.*");
    }
});

// --- UNLOCK GROUP INFO ---
cmd({
    pattern: "unlockinfo",
    desc: "Unlock group info so all members can edit group info.",
    category: "group",
    react: "🔓",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⛔ *Group Only Command*");
        if (!isBotAdmins) return reply("❌ *Bot must be admin to change group info.*");
        if (!isAdmins) return reply("⚠️ *Only admins can use this command.*");

        await conn.groupSettingUpdate(from, "unlocked");
        reply("🔓 Group info unlocked: All members can now change group info.");
    } catch (e) {
        console.error(e);
        reply("🚫 *Failed to unlock group info.*");
    }
});









