const { add } = require('../core/registry');
const { download } = require('../lib/util');
const { pickMedia } = require('../lib/helpers');

add({ name: 'save', cat: 'editing', desc: 'sauvegarder un média', async run(ctx) {
  const mm = pickMedia({ m: {}, quoted: ctx.quoted }, ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage']);
  if (!mm) return ctx.reply('💾 *Réponds à un média* (image, vidéo, audio, statut…) avec *save*.');
  const buf = await download(mm.content, mm.type);
  const p = { [mm.type]: buf };
  if (mm.type === 'audio') p.mimetype = mm.content.mimetype || 'audio/mp4';
  if (mm.type === 'document') { p.mimetype = mm.content.mimetype; p.fileName = mm.content.fileName; }
  if (mm.content.caption) p.caption = mm.content.caption;
  await ctx.sock.sendMessage(ctx.sender, p);
  if (ctx.isGroup || ctx.from !== ctx.sender) await ctx.reply('💾 Média sauvegardé dans ta discussion privée.');
} });
