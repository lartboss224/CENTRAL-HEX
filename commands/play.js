const { add } = require('../core/registry');
const cfg = require('../core/config');
const { ddg } = require('../lib/helpers');

add({ name: 'play', cat: 'search', desc: 'Play Store', async run(ctx) {
  if (!ctx.q) return ctx.reply('📱 Utilise : *play whatsapp* (recherche une application sur le Play Store)');
  const res = (await ddg(`site:play.google.com/store/apps ${ctx.q}`, 8)).filter(r => r.href.includes('play.google.com')).slice(0, 5);
  if (!res.length) throw new Error('aucune application trouvée');
  await ctx.reply(`📱 *Play Store — ${ctx.q}*\n\n` + res.map((r, i) => `*${i + 1}. ${r.title.replace(/- Apps on Google Play/i, '').trim()}*\n🔗 ${r.href}`).join('\n\n') + `\n\n> ${cfg.BOT_NAME}`);
} });
