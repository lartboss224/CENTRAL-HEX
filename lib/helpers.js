// Fonctions partagées entre les commandes
const cfg = require('../core/config');
const find = require('../lib/find');
const axios = require('axios');
const cheerio = require('cheerio');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const { getJson, firstOk, download } = require('../lib/util');

const MEDIA = path.join(process.cwd(), 'data', 'media');

fs.mkdirSync(MEDIA, { recursive: true });


function menuImage(ctx) {
  const f = ctx.store.data.menuImage;
  if (f && f.startsWith('http')) return { url: f };
  if (f && fs.existsSync(f)) return fs.readFileSync(f);
  return { url: cfg.MENU_IMAGE };
}

const banner = (ctx, caption) => ctx.send({ image: menuImage(ctx), caption });


const own = ctx => ctx.sock.user.id.split(':')[0] + '@s.whatsapp.net';


function pickMedia(ctx, types) {
  for (const src of [ctx.m, ctx.quoted]) {
    if (!src) continue;
    for (const t of types) if (src[t]) return { type: t.replace('Message', ''), content: src[t], msg: src };
  }
  return null;
}


async function viewOnce(ctx, silent) {
  const raw = ctx.quotedRaw;
  if (!raw) return silent ? null : ctx.reply('👉 *Réponds à un média « vue unique »* avec cette commande.');
  const wrapped = !!(raw.viewOnceMessage || raw.viewOnceMessageV2 || raw.viewOnceMessageV2Extension);
  const inner = ctx.quoted;
  const t = ['imageMessage', 'videoMessage', 'audioMessage'].find(k => inner?.[k] && (wrapped || inner[k].viewOnce));
  if (!t) return silent ? null : ctx.reply('ℹ️ Ce message n\'est pas un média à vue unique.');
  const kind = t.replace('Message', '');
  const buf = await download(inner[t], kind);
  const payload = { [kind]: buf, caption: `👁️ Vue unique récupérée\n> ${cfg.BOT_NAME}` };
  if (kind === 'audio') { payload.mimetype = 'audio/mp4'; delete payload.caption; }
  await ctx.sock.sendMessage(ctx.sender, payload);
  if (!silent) await ctx.reply('📥 Média envoyé dans ta discussion privée.');
}

async function ddg(query, n = 6) {
  const r = await axios.post('https://html.duckduckgo.com/html/', new URLSearchParams({ q: query }).toString(), {
    headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 20000 });
  const $ = cheerio.load(r.data);
  const out = [];
  $('.result').each((_, el) => {
    if (out.length >= n) return;
    const a = $(el).find('.result__a').first();
    let href = a.attr('href') || '';
    const m = href.match(/uddg=([^&]+)/);
    if (m) href = decodeURIComponent(m[1]);
    if (href.startsWith('//')) href = 'https:' + href;
    const title = a.text().trim();
    if (title && /^https?:/.test(href)) out.push({ title, href, snippet: $(el).find('.result__snippet').text().trim() });
  });
  return out;
}

const reachable = async u => {
  const r = await axios.get(u, { headers: { ...UA, Range: 'bytes=0-1' }, timeout: 15000, validateStatus: s => s < 400, responseType: 'stream' });
  r.data.destroy();
  return true;
};


async function ytFind(q) {
  if (/^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)/i.test(q)) {
    const id = (q.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/) || [])[1];
    if (id) { const v = await yts({ videoId: id }); if (v) return v; }
  }
  const r = await yts(q);
  const v = r.videos?.[0];
  if (!v) throw new Error('aucun résultat YouTube');
  return v;
}

async function ytLink(url, kind) {
  const u = encodeURIComponent(url);
  const apis = kind === 'mp3' ? [
    `https://eliteprotech-apis.zone.id/ytdown?url=${u}&format=mp3`,
    `https://api.yupra.my.id/api/downloader/ytmp3?url=${u}`,
    `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${u}`,
    `https://apis-keith.vercel.app/download/dlmp3?url=${u}`
  ] : [
    `https://eliteprotech-apis.zone.id/ytdown?url=${u}&format=mp4`,
    `https://api.yupra.my.id/api/downloader/ytmp4?url=${u}`,
    `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${u}`
  ];
  return firstOk(apis.map(a => async () => {
    const link = find.mediaUrl(await getJson(a));
    if (!link) return null;
    await reachable(link);
    return link;
  }));
}

const info = v => `🎬 *${v.title}*\n👤 ${v.author?.name || '—'}\n⏱️ ${v.timestamp || '—'}  •  👁️ ${(v.views || 0).toLocaleString('fr-FR')}\n🔗 ${v.url}`;


const GOODNIGHT = [
  'Que ta nuit soit douce et tes rêves remplis de belles choses. 🌙✨',
  'Ferme les yeux, respire, demain sera une belle journée. 😴💫',
  'Les étoiles veillent sur toi cette nuit. Dors bien ! 🌟',
  'Repose-toi, tu as bien mérité cette nuit de paix. 🛌💙',
  'Bonne nuit ! Recharge tes batteries, demain on conquiert le monde. 🚀',
  'Que la lune éclaire tes rêves et que le sommeil te berce. 🌜'
];

const QUIZ = [
  ['Quelle est la capitale de la Guinée ?', ['Conakry', 'Dakar', 'Bamako', 'Freetown'], 0],
  ['Combien y a-t-il de continents ?', ['5', '6', '7', '8'], 2],
  ['Quel est le plus grand océan du monde ?', ['Atlantique', 'Pacifique', 'Indien', 'Arctique'], 1],
  ['Qui a peint la Joconde ?', ['Picasso', 'Van Gogh', 'Léonard de Vinci', 'Michel-Ange'], 2],
  ['Quel est le symbole chimique de l\'or ?', ['Ag', 'Au', 'Fe', 'Or'], 1],
  ['Quelle planète est la plus proche du Soleil ?', ['Vénus', 'Mars', 'Mercure', 'Terre'], 2],
  ['Combien de joueurs par équipe sur le terrain au football ?', ['9', '10', '11', '12'], 2],
  ['Quel pays a remporté la Coupe du monde 2018 ?', ['Croatie', 'France', 'Brésil', 'Allemagne'], 1],
  ['En quelle année a été fondée l\'ONU ?', ['1919', '1945', '1960', '1989'], 1],
  ['Quel langage sert à structurer une page web ?', ['Python', 'HTML', 'SQL', 'C++'], 1],
  ['Quel est le plus long fleuve d\'Afrique ?', ['Niger', 'Congo', 'Nil', 'Zambèze'], 2],
  ['Combien de côtés a un hexagone ?', ['5', '6', '7', '8'], 1],
  ['Quel animal est le plus rapide sur terre ?', ['Lion', 'Guépard', 'Cheval', 'Antilope'], 1],
  ['Que signifie « IA » ?', ['Internet Avancé', 'Intelligence Artificielle', 'Information Auto', 'Interface Active'], 1],
  ['Quel est le résultat de 12 × 12 ?', ['124', '132', '144', '164'], 2],
  ['Quel pays est surnommé « le pays du Soleil-Levant » ?', ['Chine', 'Corée', 'Japon', 'Thaïlande'], 2]
];

module.exports = { ddg, reachable, ytFind, ytLink, info, pickMedia, own, viewOnce, menuImage, banner, MEDIA, GOODNIGHT, QUIZ };
