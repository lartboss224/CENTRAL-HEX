// Lecture tolérante des réponses d'API (les formats changent souvent)
const IMG = /\.(jpe?g|png|webp|gif)(\?|$)/i;

function walk(o, fn, key = '', depth = 0) {
  if (depth > 6 || o == null) return;
  if (typeof o === 'string') return fn(key, o);
  if (Array.isArray(o)) return o.forEach(v => walk(v, fn, key, depth + 1));
  if (typeof o === 'object') Object.entries(o).forEach(([k, v]) => walk(v, fn, k, depth + 1));
}
// Premier lien média (hors vignettes et hors lien YouTube d'origine), clés les plus fiables d'abord
const YT_PAGE = /^https?:\/\/(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\//i;
const PRIORITY = [/^(downloadurl|download_url|downloadlink|download_link|dl_link|dlink|dl)$/i, /^(mp4|mp3|audio|video|hd|sd)$/i, /download/i, /^(link|url)$/i];
function mediaUrl(o) {
  const found = [];
  walk(o, (k, v) => {
    if (/^https?:\/\//i.test(v) && !IMG.test(v) && !YT_PAGE.test(v) && !/thumb|cover|poster|image|icon/i.test(k)) found.push([k, v]);
  });
  for (const re of PRIORITY) { const f = found.find(([k]) => re.test(k)); if (f) return f[1]; }
  return (found[0] || [])[1] || null;
}
function imageUrls(o) {
  const out = new Set();
  walk(o, (k, v) => { if (/^https?:\/\//i.test(v) && IMG.test(v)) out.add(v); });
  return [...out];
}
function firstText(o, keys = /lyrics|lirik|result|data|text/i) {
  let best = '';
  walk(o, (k, v) => { if (keys.test(k) && v.length > best.length && !/^https?:\/\//.test(v)) best = v; });
  return best;
}
module.exports = { mediaUrl, imageUrls, firstText, walk };
