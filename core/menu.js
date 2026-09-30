// Menu CENTRAL-HEX — mise en page fournie par le propriétaire
const cfg = require('./config');
const registry = require('./registry');

// [nom de commande, libellé affiché, description]
const SECTIONS = [
  ['⚙️', '𝗚𝗘𝗡𝗘𝗥𝗔𝗟', [
    ['menu', 'menu', 'le menu'],
    ['allmenu', 'allmenu', 'les commandes'],
    ['help', 'help', 'aide sur le bot'],
    ['ping', 'ping', 'vitesse du bot'],
    ['alive', 'alive', 'état du bot'],
    ['public', 'public', 'mode public'],
    ['owner', 'owner', 'propriétaire'],
    ['settings', 'settings', 'paramètres']]],
  ['👑', '𝗔𝗗𝗠𝗜𝗡 ', [
    ['mode', 'mode', 'public/privé'],
    ['kick', 'kick', 'expulser un membre'],
    ['kickall', 'kickall', 'expulser tous'],
    ['mute', 'mute', 'fermer le groupe'],
    ['unmute', 'unmute', 'ouvrir le groupe'],
    ['tagall', 'tagall', 'mentionner tous'],
    ['tag', 'tag @user texte', 'mention'],
    ['warn', '@user', 'avertir un membre'],
    ['welcome', 'welcome', 'activer bienvenue'],
    ['goodbye', 'goodbye', 'activer revoir'],
    ['setmenuimage', 'setmenuimage', 'image du menu']]],
  ['🛡️', '𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗜𝗢𝗡', [
    ['pair', 'pair <numéro>', 'Connexion pair'],
    ['antispam', 'antispam', 'anti-spam'],
    ['antilink', 'antilink', 'bloquer les liens'],
    ['antimarabout', 'antimarabout', 'bloquer'],
    ['antidelete', 'antidelete', 'suppression'],
    ['antibot', 'antibot', 'bloquer les bots'],
    ['antistatus', 'antistatus', 'mentions de statut'],
    ['antisticker', 'antisticker', 'bloquer les stickers'],
    ['antipurge', 'antipurge', 'protection']]],
  ['🎨', '𝗘𝗗𝗜𝗧𝗜𝗡𝗚', [
    ['image', 'image', 'chercher images'],
    ['sticker', 'sticker', 'créer un sticker'],
    ['stickersearch', 'sticker', 'rechercher sticker'],
    ['toimg', 'toimg', 'sticker en image'],
    ['waouh', 'waouh', 'on sais tout'],
    ['humm', 'humm', 'on vois tout'],
    ['lyrics', 'lyrics', "paroles d'une chanson"],
    ['ss', 'ss', "capture d'écran"],
    ['save', 'save', 'save un média']]],
  ['🔎', '𝗥𝗘𝗖𝗛𝗘𝗥𝗖𝗛𝗘', [
    ['google', 'google', 'recherche Google'],
    ['play', 'play', 'Play Store'],
    ['video', 'video', 'recherche vidéo'],
    ['song', 'song', 'musique'],
    ['mediafire', 'mediafire', 'MediaFire'],
    ['facebook', 'facebook', 'Facebook'],
    ['instagram', 'instagram', 'Instagram'],
    ['tiktok', 'tiktok', 'TikTok'],
    ['lyrics', 'lyrics', 'paroles'],
    ['image', 'image', 'images'],
    ['getpp', 'getpp', 'photo de profil'],
    ['goodnight', 'goodnight', 'bonne nuit'],
    ['wcg', 'wcg', 'classement'],
    ['quizz', 'quizz', 'quiz'],
    ['anime', 'anime', 'anime'],
    ['profile', 'profile', 'profil'],
    ['couple', 'couple', 'couple'],
    ['poll', 'poll', 'sondage'],
    ['emojimix', 'emojimix', "mélange d'emojis"]]]
];

function header(ctx) {
  return [
    '╔══𝗖𝗘𝗡𝗧𝗥𝗔𝗟-𝗛𝗘𝗫═══⚔️ ',
    `┋  ● 👑 ᴏᴡɴᴇʀ: *${cfg.OWNER.name}*`,
    `┋  ● 📄 ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs: *${registry.total()}*`,
    `┋  ● 🚀 BOT NAME: *${cfg.BOT_NAME}*`,
    '┋  ● 📝 ᴘʀᴇғɪx: *aucun (sans préfixe)*',
    `┋  ● 📢 ᴍᴏᴅᴇ: *${ctx.store.data.mode}*`,
    `┋  ● 🤖 ᴠᴇʀsɪᴏɴ: *${cfg.VERSION}*`,
    '┋╭────────────⚔️',
    '┋│      『 𝗠𝗘𝗡𝗨-𝗕𝗢𝗧 』',
    '╚╰────────────⚔️',
    '',
    '👇✨👇',
    ''
  ].join('\n');
}

function build(ctx) {
  const out = [header(ctx)];
  SECTIONS.forEach(([emoji, title, items], i) => {
    out.push(`${i === 0 ? '╔═' : '╔'}〔${emoji}『${title}』`);
    out.push('║ ');
    items.forEach(([, label, desc], j) => {
      out.push(`┋   ${j === items.length - 1 ? '└' : '├'}─ ${label} → ${desc}`);
    });
    out.push(i === 0 ? '╚║ ' : '╚║');
    out.push('');
  });
  out.push('║╭─────────────◆', '║│      『 𝗖𝗘𝗡𝗧𝗥𝗔𝗟-𝗛𝗘𝗫 』', '║╰─────────────◆', '╚═══════════════════════⚔️');
  return out.join('\n');
}

// allmenu : version compacte (noms seulement)
function compact() {
  return SECTIONS.map(([e, t, items]) => `${e} *${t.trim()}*\n${[...new Set(items.map(i => i[0]))].join(' • ')}`).join('\n\n');
}

module.exports = { build, compact, SECTIONS };
