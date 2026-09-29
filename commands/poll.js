const { add } = require('../core/registry');

add({ name: 'poll', cat: 'search', desc: 'sondage', async run(ctx) {
  const parts = ctx.q.split('|').map(s => s.trim()).filter(Boolean);
  if (parts.length < 3) return ctx.reply('📊 Utilise : *poll Question | option 1 | option 2 | option 3*');
  const [name, ...values] = parts;
  await ctx.send({ poll: { name, values: values.slice(0, 12), selectableCount: 1 } });
} });
