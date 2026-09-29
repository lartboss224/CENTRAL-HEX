const { add } = require('../core/registry');

add({ name: 'mode', cat: 'admin', desc: 'public/privé', owner: true, async run(ctx) {
  const v = (ctx.args[0] || '').toLowerCase();
  if (!['public', 'private', 'prive', 'privé'].includes(v)) return ctx.reply(`📢 Mode actuel : *${ctx.store.data.mode}*\nUtilise : *mode public* ou *mode private*`);
  ctx.store.data.mode = v === 'public' ? 'public' : 'private';
  ctx.store.save();
  await ctx.reply(`✅ Mode *${ctx.store.data.mode}* activé.`);
} });
