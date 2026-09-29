const { add } = require('../core/registry');
const cfg = require('../core/config');
const { num, pick } = require('../lib/util');
const { GOODNIGHT } = require('../lib/helpers');

add({ name: 'goodnight', cat: 'search', desc: 'bonne nuit', async run(ctx) {
  const t = ctx.target();
  await ctx.send({ text: `🌙 *Bonne nuit${t ? ' @' + num(t) : ''} !*\n\n${pick(GOODNIGHT)}\n\n> ${cfg.BOT_NAME}`, mentions: t ? [t] : [] });
} });
