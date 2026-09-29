const { add } = require('../core/registry');
const { num } = require('../lib/util');

add({ name: 'tag', cat: 'admin', desc: 'mention', group: true, admin: true, async run(ctx) {
  const targets = ctx.mentioned.length ? ctx.mentioned : (ctx.quotedSender ? [ctx.quotedSender] : []);
  if (!targets.length) return ctx.reply('👉 Utilise : *tag @user ton message*');
  const msg = ctx.args.filter(a => !a.startsWith('@')).join(' ') || 'Tu es demandé(e) !';
  await ctx.send({ text: `${targets.map(t => '@' + num(t)).join(' ')} ${msg}`, mentions: targets });
} });
