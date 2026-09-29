const { add } = require('../core/registry');
const cfg = require('../core/config');
const { num, sleep } = require('../lib/util');

const PAGE = 50; // membres par message (lisible + notifications fiables)

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
  const tag = p => `┋ ➤ @${num(p.id)}`;   // le texte doit correspondre au jid mentionné

  const header =
    `╔══〔 📣 𝗧𝗔𝗚𝗔𝗟𝗟 〕══⚔️\n` +
    `┋ 👥 Groupe : *${ctx.meta?.subject || '—'}*\n` +
    `┋ 🙋 Par : @${num(ctx.sender)}\n` +
    `┋ 🔢 ${onlyAdmins ? 'Admins' : 'Membres'} : *${admins.length + members.length}*${onlyAdmins ? '' : ` (👑 ${admins.length} admin${admins.length > 1 ? 's' : ''})`}\n` +
    `┋ 🕒 ${when}\n` +
    (text ? `┋ 💬 *${text}*\n` : '') +
    `╚═══════════════⚔️\n`;
  const footer = `\n> ${cfg.BOT_NAME} 🇬🇳`;

  // Découpage en pages : admins d'abord, puis membres
  const rows = [
    ...admins.map(p => ({ p, sec: 'admins' })),
    ...members.map(p => ({ p, sec: 'members' }))
  ];
  const pages = [];
  for (let i = 0; i < rows.length; i += PAGE) pages.push(rows.slice(i, i + PAGE));

  for (let i = 0; i < pages.length; i++) {
    let body = i === 0 ? header + '\n' : `📣 *Suite ${i + 1}/${pages.length}*\n\n`;
    let cur = null;
    for (const { p, sec } of pages[i]) {
      if (sec !== cur) {
        cur = sec;
        if (!body.endsWith('\n\n')) body += '\n';
        body += sec === 'admins' ? '👑 𝗔𝗗𝗠𝗜𝗡𝗦\n' : '🌐 𝗠𝗘𝗠𝗕𝗥𝗘𝗦\n';
      }
      body += tag(p) + '\n';
    }
    if (pages.length > 1) body += `\n📄 Partie ${i + 1}/${pages.length}`;
    body += footer;
    const mentions = pages[i].map(r => r.p.id);
    if (i === 0) mentions.push(ctx.sender);
    await ctx.sock.sendMessage(ctx.from, { text: body, mentions }, i === 0 ? { quoted: ctx.msg } : {});
    if (i < pages.length - 1) await sleep(1500);
  }
} });
