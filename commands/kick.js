const { add } = require('../core/registry');
const { num } = require('../lib/util');

add({ name: 'kick', cat: 'admin', desc: 'expulser un membre', group: true, admin: true, botAdmin: true, async run(ctx) {
  const t = ctx.target();
  if (!t) return ctx.reply('👉 Mentionne le membre ou réponds à son message : *kick @user*');
  if (num(t) === num(ctx.sock.user.id)) return ctx.reply('😅 Je ne peux pas m\'expulser moi-même.');
  await ctx.sock.groupParticipantsUpdate(ctx.from, [t], 'remove');
  await ctx.reply(`👢 @${num(t)} a été expulsé.`, { mentions: [t] });
} });
