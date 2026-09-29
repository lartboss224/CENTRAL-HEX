const { add } = require('../core/registry');
const cfg = require('../core/config');

add({ name: 'ping', cat: 'general', desc: 'vitesse du bot', async run(ctx) {
  const t = Number(ctx.msg.messageTimestamp) * 1000;
  const ms = Math.max(1, Date.now() - (t || Date.now()));
  await ctx.reply(`🏓 *Pong !*\n⚡ Vitesse : *${ms} ms*\n> ${cfg.BOT_NAME}`);
} });
