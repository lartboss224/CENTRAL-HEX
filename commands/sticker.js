const { add } = require('../core/registry');
const media = require('../lib/media');
const { download } = require('../lib/util');
const { pickMedia } = require('../lib/helpers');

add({ name: 'sticker', cat: 'editing', desc: 'créer un sticker', async run(ctx) {
  const mm = pickMedia(ctx, ['imageMessage', 'videoMessage']);
  if (!mm) return ctx.reply('🎨 Envoie ou *réponds à une image / vidéo* avec *sticker*.');
  if (mm.type === 'video' && (mm.content.seconds || 0) > 12) return ctx.reply('⏱️ Vidéo trop longue (12 s max).');
  const buf = await download(mm.content, mm.type);
  await ctx.send({ sticker: await media.toSticker(buf, mm.type) });
} });
