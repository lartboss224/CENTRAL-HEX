const { add } = require('../core/registry');
const cfg = require('../core/config');
const menu = require('../core/menu');

add({ name: 'allmenu', cat: 'general', desc: 'les commandes', async run(ctx) {
  await ctx.reply(`📚 *TOUTES LES COMMANDES — ${cfg.BOT_NAME}*\n_Écris simplement le nom, sans préfixe._\n\n${menu.compact()}\n\n> ${cfg.BOT_NAME} 🇬🇳`);
} });
