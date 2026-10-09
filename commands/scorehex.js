const { add } = require('../core/registry');
const cfg = require('../core/config');
const { getJson } = require('../lib/util');

// Source : API publique ESPN (aucune clé nécessaire)
const BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const TZ = 'Africa/Conakry';

const FOOT = [
  ['fifa.world', 'Coupe du monde'], ['fifa.worldq.caf', 'Éliminatoires CAF'], ['caf.nations', 'CAN'], ['caf.champions', 'CAF Ligue des champions'],
  ['uefa.champions', 'Ligue des champions'], ['uefa.europa', 'Europa League'], ['uefa.europa.conf', 'Conference League'], ['uefa.nations', 'Ligue des nations'],
  ['uefa.euro', 'Euro'], ['uefa.euroq', 'Éliminatoires Euro'], ['conmebol.libertadores', 'Copa Libertadores'], ['conmebol.america', 'Copa América'],
  ['fra.1', 'Ligue 1 🇫🇷'], ['fra.2', 'Ligue 2 🇫🇷'], ['fra.coupe_de_france', 'Coupe de France'],
  ['eng.1', 'Premier League 🏴'], ['eng.2', 'Championship 🏴'], ['eng.fa', 'FA Cup'], ['eng.league_cup', 'Carabao Cup'],
  ['esp.1', 'LaLiga 🇪🇸'], ['esp.copa_del_rey', 'Copa del Rey'], ['ita.1', 'Serie A 🇮🇹'], ['ita.coppa_italia', 'Coupe d\'Italie'],
  ['ger.1', 'Bundesliga 🇩🇪'], ['ger.dfb_pokal', 'DFB Pokal'], ['por.1', 'Liga Portugal 🇵🇹'], ['ned.1', 'Eredivisie 🇳🇱'],
  ['bel.1', 'Jupiler Pro League 🇧🇪'], ['tur.1', 'Süper Lig 🇹🇷'], ['sco.1', 'Premiership 🏴'], ['gre.1', 'Super League 🇬🇷'],
  ['usa.1', 'MLS 🇺🇸'], ['mex.1', 'Liga MX 🇲🇽'], ['bra.1', 'Brasileirão 🇧🇷'], ['arg.1', 'Liga Argentina 🇦🇷'],
  ['sau.1', 'Saudi Pro League 🇸🇦'], ['jpn.1', 'J1 League 🇯🇵'], ['chn.1', 'Super League 🇨🇳'],
  ['fifa.friendly', 'Matchs amicaux'], ['club.friendly', 'Amicaux clubs'], ['fifa.cwc', 'Coupe du monde des clubs']
];
const BASKET = [['nba', 'NBA'], ['wnba', 'WNBA']];

const SPORTS = {
  foot: { path: 'soccer', leagues: FOOT, icon: '⚽', label: 'FOOTBALL' },
  basket: { path: 'basketball', leagues: BASKET, icon: '🏀', label: 'BASKET' }
};

const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, '');
const hour = iso => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const dayLabel = d => d.toLocaleDateString('fr-FR', { timeZone: TZ, weekday: 'long', day: '2-digit', month: 'long' });

function parse(ev, leagueName) {
  const c = ev.competitions?.[0];
  if (!c) return null;
  const home = c.competitors?.find(x => x.homeAway === 'home') || c.competitors?.[0];
  const away = c.competitors?.find(x => x.homeAway === 'away') || c.competitors?.[1];
  if (!home || !away) return null;
  const st = ev.status?.type || {};
  return {
    league: leagueName, date: ev.date, state: st.state || 'pre', name: st.name || '',
    clock: st.shortDetail || st.detail || '', display: ev.status?.displayClock || '',
    home: home.team?.displayName || home.team?.name || '?', away: away.team?.displayName || away.team?.name || '?',
    hs: home.score ?? '0', as: away.score ?? '0'
  };
}

async function fetchSport(sp, dateStr) {
  const jobs = sp.leagues.map(async ([code, label]) => {
    const d = await getJson(`${BASE}/${sp.path}/${code}/scoreboard?dates=${dateStr}&limit=100`);
    return (d.events || []).map(ev => parse(ev, label)).filter(Boolean);
  });
  const res = await Promise.allSettled(jobs);
  const ok = res.filter(r => r.status === 'fulfilled');
  if (!ok.length) throw new Error('service de scores indisponible');
  return ok.flatMap(r => r.value);
}

function line(m, icon) {
  if (m.state === 'in') {
    const t = /half/i.test(m.name) || /^HT$/i.test(m.clock) ? 'Mi-temps' : (m.display || m.clock);
    return `🔴 ${m.home} *${m.hs} - ${m.as}* ${m.away}  _(${t})_`;
  }
  if (m.state === 'post') {
    const extra = /pen/i.test(m.clock) ? ' (t.a.b)' : /aet|extra/i.test(m.clock) ? ' (prol.)' : '';
    return `✅ ${m.home} *${m.hs} - ${m.as}* ${m.away}${extra}`;
  }
  const flag = /postpon|delay|cancel|suspend/i.test(m.name) ? ` ⚠️ ${m.clock}` : '';
  return `⏰ *${hour(m.date)}*  ${m.home} 🆚 ${m.away}${flag}`;
}

function build(matches, sp, filter, when) {
  let list = matches;
  if (filter === 'live') list = list.filter(m => m.state === 'in');
  if (filter === 'fini') list = list.filter(m => m.state === 'post');
  if (filter === 'avenir') list = list.filter(m => m.state === 'pre');
  if (!list.length) return [];

  const live = list.filter(m => m.state === 'in').length;
  const head = `╔══〔 ${sp.icon} 𝗛𝗘𝗫𝗦𝗖𝗢𝗥𝗘 〕══⚔️\n┋ 📅 ${dayLabel(when)}\n┋ 🏟️ ${list.length} match${list.length > 1 ? 's' : ''}${live ? `  •  🔴 ${live} en direct` : ''}\n╚═══════════════⚔️`;

  const byLeague = new Map();
  for (const m of list) { if (!byLeague.has(m.league)) byLeague.set(m.league, []); byLeague.get(m.league).push(m); }
  // ligues avec du direct d'abord
  const order = [...byLeague.entries()].sort((a, b) => (b[1].some(x => x.state === 'in') - a[1].some(x => x.state === 'in')));

  const rank = { in: 0, pre: 1, post: 2 };
  const blocks = order.map(([lg, ms]) => {
    ms.sort((a, b) => rank[a.state] - rank[b.state] || new Date(a.date) - new Date(b.date));
    return `\n🏆 *${lg}*\n` + ms.map(m => line(m)).join('\n');
  });

  // découpe en messages de ~3000 caractères
  const out = []; let cur = head;
  for (const b of blocks) {
    if ((cur + b).length > 3000 && cur !== head) { out.push(cur); cur = ''; }
    cur += b + '\n';
  }
  out.push(cur + `\n🔴 direct  ⏰ à venir  ✅ terminé\n> ${cfg.BOT_NAME} 🇬🇳`);
  return out;
}

add({ name: 'hexscore', cat: 'search', desc: 'scores, heures et minutes des matchs', async run(ctx) {
  const a = ctx.args.map(x => x.toLowerCase());
  const has = (...w) => a.some(x => w.includes(x));

  const sp = has('basket', 'nba', 'basketball') ? SPORTS.basket : SPORTS.foot;
  const filter = has('live', 'direct', 'encours') ? 'live' : has('fini', 'finis', 'termine', 'terminé', 'terminés', 'resultats', 'résultats') ? 'fini' : has('avenir', 'prochains', 'programme') ? 'avenir' : null;
  const when = new Date(Date.now() + (has('demain') ? 86400000 : has('hier') ? -86400000 : 0));

  if (has('aide', 'help')) {
    return ctx.reply(`⚽ *HEXSCORE*\n\n*hexscore* : tous les matchs du jour\n*hexscore live* : seulement en direct\n*hexscore fini* : matchs terminés\n*hexscore avenir* : matchs à venir\n*hexscore demain* / *hexscore hier*\n*hexscore basket* : NBA / WNBA`);
  }

  await ctx.reply(`${sp.icon} Recherche des matchs…`);
  const matches = await fetchSport(sp, ymd(when));
  const msgs = build(matches, sp, filter, when);
  if (!msgs.length) {
    return ctx.reply(filter === 'live' ? '😴 Aucun match en direct pour le moment.' : '📭 Aucun match trouvé pour cette période.');
  }
  for (const t of msgs) await ctx.reply(t);
} });
