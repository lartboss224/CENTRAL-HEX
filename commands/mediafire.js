const { add } = require('../core/registry');
const axios = require('axios');
const cheerio = require('cheerio');
const { UA, download } = require('../lib/util');

add({ name: 'mediafire', cat: 'search', desc: 'MediaFire', async run(ctx) {
  const url = ctx.args.find(a => /mediafire\.com/i.test(a));
  if (!url) return ctx.reply('📦 Utilise : *mediafire https://www.mediafire.com/file/…*');
  const html = (await axios.get(url, { headers: UA, timeout: 25000 })).data;
  const $ = cheerio.load(html);
  const link = $('#downloadButton').attr('href') || $('a.input.popsok').attr('href') || (html.match(/https?:\/\/download\d*\.mediafire\.com[^"']+/) || [])[0];
  if (!link) throw new Error('lien de téléchargement introuvable');
  const name = ($('.dl-btn-label').attr('title') || $('div.filename').text() || link.split('/').pop()).trim();
  const size = ($('#downloadButton').text().match(/\(([^)]+)\)/) || [])[1] || '?';
  const mb = /GB/i.test(size) ? 9999 : /MB/i.test(size) ? parseFloat(size) : 1;
  if (mb > 90) return ctx.reply(`📦 *${name}* (${size})\nFichier trop lourd pour WhatsApp (90 Mo max).\n🔗 ${link}`);
  await ctx.reply(`📦 *${name}*\n💾 ${size}\n⬇️ Envoi en cours…`);
  const ext = (name.split('.').pop() || '').toLowerCase();
  const mimes = { pdf: 'application/pdf', zip: 'application/zip', apk: 'application/vnd.android.package-archive', mp4: 'video/mp4', mp3: 'audio/mpeg', jpg: 'image/jpeg', png: 'image/png' };
  await ctx.send({ document: { url: link }, fileName: name, mimetype: mimes[ext] || 'application/octet-stream' });
} });
