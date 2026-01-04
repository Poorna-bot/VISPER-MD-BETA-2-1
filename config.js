import fs from 'fs';
import dotenv from 'dotenv';

if (fs.existsSync('config.env')) {
    dotenv.config({ path: './config.env' });
}

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

// Config object එකක් විදිහට define කිරීම
const config = {
    SESSION_ID: process.env.SESSION_ID || 'VISPER-MD&08850d86-f9e6-460f-b2fe-a84e116bbbfa',
    ANTI_DELETE: process.env.ANTI_DELETE === undefined ? 'true' : process.env.ANTI_DELETE, 
    MV_BLOCK: process.env.MV_BLOCK === undefined ? 'true' : process.env.MV_BLOCK,    
    ANTI_LINK: process.env.ANTI_LINK === undefined ? 'true' : process.env.ANTI_LINK, 
    SEEDR_MAIL: process.env.SEEDR_MAIL || '',
    SEEDR_PASSWORD: process.env.SEEDR_PASSWORD || '',
    SUDO: process.env.SUDO || '',
    DB_NAME: process.env.DB_NAME || 'pramaaaataaaaaaaaaaaaajjaa',
    LANG: process.env.LANG || 'SI',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '94724884317',
    TG_GROUP: process.env.TG_GROUP || 'https://t.me/+Zm865mJ_TL0yNGVl'
};

// ESM වලදී default export එක භාවිතා කිරීම
export default config;
