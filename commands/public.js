const { add } = require('../core/registry');

add({ name: 'public', cat: 'general', desc: 'mode public', owner: true, async run(ctx) {
  ctx.store.data.mode = 'public'; ctx.store.save();
  await ctx.reply('📢 Mode *public* activé : tout le monde peut utiliser le bot.');
} });
