// Lecture tolérante des réponses d'API (les formats changent souvent)
const IMG = /\.(jpe?g|png|webp|gif)(\?|$)/i;

function walk(o, fn, key = '', depth = 0) {
  if (depth > 6 || o == null) return;
  if (typeof o === 'string') return fn(key, o);
  if (Array.isArray(o)) return o.forEach(v => walk(v, fn, key, depth + 1));
  if (typeof o === 'object') Object.entries(o).forEach(([k, v]) => walk(v, fn, k, depth + 1));
}
// Premier lien média (hors vignettes) — préfère les clés "download/url/link/hd"
function mediaUrl(o, prefer = /download|url|link|hd|mp3|mp4|video|audio/i) {
  const found = [];
  walk(o, (k, v) => { if (/^https?:\/\//i.test(v) && !IMG.test(v) && !/thumb|cover|poster/i.test(k)) found.push([k, v]); });
  return (found.find(([k]) => prefer.test(k)) || found[0] || [])[1] || null;
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
