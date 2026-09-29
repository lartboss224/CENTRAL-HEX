const { add } = require('../core/registry');
const { num, sleep } = require('../lib/util');

add({ name: 'kickall', cat: 'admin', desc: 'expulser tous les membres', group: true, admin: true, botAdmin: true, async run(ctx) {
  const ids = p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(num);
  const spare = [ctx.sock.user.id, ctx.sock.user.lid, ctx.sender].filter(Boolean).map(num); // bot + celui qui lance la commande
  const all = ctx.meta?.participants || [];
  const targets = all.filter(p => !p.admin && !ids(p).some(x => spare.includes(x))).map(p => p.id);
  if (!targets.length) return ctx.reply('ℹ️ Aucun membre à expulser (les admins sont épargnés).');

  // Prélude mystérieux — le premier message notifie tout le monde sans afficher la liste
  await ctx.sock.sendMessage(ctx.from, { text: '🌑 *Le silence tombe sur ce groupe...*', mentions: all.map(p => p.id) });
  await sleep(3500);
  await ctx.sock.sendMessage(ctx.from, { text: '👁️ _Certains sont venus pour rester._\n_D\'autres n\'auraient jamais dû entrer._' });
  await sleep(3500);
  await ctx.sock.sendMessage(ctx.from, { text: '⚔️ *L\'heure du jugement a sonné...*\n\n> ' + require('../core/config').BOT_NAME });
  await sleep(3000);

  // Expulsion par lots de 5
  let done = 0;
  for (let i = 0; i < targets.length; i += 5) {
    const batch = targets.slice(i, i + 5);
    try { await ctx.sock.groupParticipantsUpdate(ctx.from, batch, 'remove'); done += batch.length; } catch {}
    await sleep(1500);
  }
  await ctx.sock.sendMessage(ctx.from, { text: `🕯️ *Le silence est revenu.*\n${done} âme(s) ont quitté le groupe${done < targets.length ? ` — ${targets.length - done} n'ont pas pu être retirées` : ''}.` });
} });
