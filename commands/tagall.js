const { add } = require('../core/registry');
const cfg = require('../core/config');
const { num } = require('../lib/util');

// Numéro de téléphone si connu (la mention s'affiche alors avec le nom), sinon l'identifiant du groupe (LID)
const jidOf = p => p.phoneNumber || p.id;

add({ name: 'tagall', cat: 'admin', desc: 'mentionner tous les membres', group: true, admin: true, async run(ctx) {
  let args = [...ctx.args];
  const onlyAdmins = /^admins?$/i.test(args[0] || '');
  if (onlyAdmins) args.shift();
  const text = args.join(' ').trim();

  const me = [ctx.sock.user.id, ctx.sock.user.lid].filter(Boolean).map(num);
  const list = (ctx.meta?.participants || []).filter(p => ![p.id, p.lid, p.phoneNumber].filter(Boolean).map(num).some(x => me.includes(x)));
  const admins = list.filter(p => p.admin);
  const members = onlyAdmins ? [] : list.filter(p => !p.admin);
  if (!admins.length && !members.length) return ctx.reply('ℹ️ Personne à mentionner.');

  const when = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Conakry', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(' ', ' · ');
  const tag = p => `┋ ➤ @${num(jidOf(p))}`;   // le texte doit correspondre au jid mentionné

  let body =
    `╔══〔 📣 𝗧𝗔𝗚𝗔𝗟𝗟 〕══⚔️\n` +
    `┋ 👥 Groupe : *${ctx.meta?.subject || '—'}*\n` +
    `┋ 🙋 Par : @${num(ctx.sender)}\n` +
    `┋ 🔢 ${onlyAdmins ? 'Admins' : 'Membres'} : *${admins.length + members.length}*${onlyAdmins ? '' : ` (👑 ${admins.length} admin${admins.length > 1 ? 's' : ''})`}\n` +
    `┋ 🕒 ${when}\n` +
    (text ? `┋ 💬 *${text}*\n` : '') +
    `╚═══════════════⚔️\n`;

  if (admins.length) body += `\n👑 𝗔𝗗𝗠𝗜𝗡𝗦\n` + admins.map(tag).join('\n') + '\n';
  if (members.length) body += `\n🌐 𝗠𝗘𝗠𝗕𝗥𝗘𝗦\n` + members.map(tag).join('\n') + '\n';
  body += `\n> ${cfg.BOT_NAME} 🇬🇳`;

  // UN SEUL message avec tous les membres
  const mentions = [...admins, ...members].map(jidOf);
  mentions.push(ctx.sender);
  await ctx.sock.sendMessage(ctx.from, { text: body, mentions }, { quoted: ctx.msg });
} });
