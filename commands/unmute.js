const { add } = require('../core/registry');

add({ name: 'unmute', cat: 'admin', desc: 'ouvrir le groupe', group: true, admin: true, botAdmin: true, async run(ctx) {
  await ctx.sock.groupSettingUpdate(ctx.from, 'not_announcement');
  await ctx.reply('🔊 Groupe ouvert : tout le monde peut écrire.');
} });
