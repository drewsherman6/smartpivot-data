/**
 * scripts/infer.js — documented fallbacks for occupations that O*NET has not rated yet.
 *
 * Some O*NET-SOC codes have no skills/abilities/knowledge ratings and/or no task statements:
 *   - new detailed occupations O*NET hasn't surveyed yet (e.g. 13-2051.00, 29-1212.00, 29-2042.00, 11-1031.00)
 *   - "All Other" catch-all codes (rated only through their .01/.02 sub-occupations, or not at all)
 *   - military codes (55-xxxx), which O*NET never rates.
 * For each such occupation we borrow the missing descriptor blocks from the best rated source, in this order:
 *   (a) same_soc_siblings         - rated O*NET-SOC codes with the same 6-digit SOC (e.g. 11-9199.01, .02 ...);
 *                                   ratings are averaged across all siblings, tasks/technology are unioned
 *   (a) onet_soc_2010_crosswalk   - the occupation's O*NET-SOC 2010 predecessor (official 2010->2019 crosswalk)
 *                                   was split; borrow from the rated sibling that came out of the same predecessor
 *                                   (predecessors titled "All Other" are ignored: they are not real ancestors)
 *   (b) onet_related_top_ranked   - the highest-ranked O*NET related occupation that is rated
 *   (b) same_broad_soc_group_most_similar / same_minor_soc_group_most_similar
 *                                 - for "All Other" codes (or codes with no related list): the most similar rated
 *                                   detailed occupation in the same broad SOC group (then minor group), by TF-IDF
 *                                   cosine of title + description; ties go to the larger OEWS employment
 *   (c) military_civilian_equivalent - 55-xxxx codes only: a documented civilian equivalent (MILITARY below),
 *                                   because O*NET rates no military occupation and the DMDC MOC crosswalk links
 *                                   55-xxxx codes almost exclusively to other 55-xxxx codes.
 * Every borrowed block is recorded in occupation.inferred_from = {code, title, method, label, sources[], fields[], note}.
 * Only blocks that are empty are filled; real O*NET data is never overwritten. `kind` tags are kept, so abilities
 * stay in abilities[] and never enter skills[].
 */
const r2 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 1000) / 1000);

// Civilian equivalents for military codes (O*NET has no ratings for 55-xxxx). Chosen by matching the O*NET
// description of the military code to the civilian occupation that does the same core work.
const MILITARY = {
  '55-1011.00': ['53-2011.00', 'fly and command military aircraft'],
  '55-1012.00': ['53-2022.00', 'direct aircraft launch, recovery and airfield operations'],
  '55-1013.00': ['33-1012.00', 'lead armed teams in tactical operations'],
  '55-1014.00': ['33-1012.00', 'lead armed teams in tactical operations'],
  '55-1015.00': ['11-9161.00', 'direct command, control and emergency operations centers'],
  '55-1016.00': ['33-1012.00', 'lead armed teams in tactical operations'],
  '55-1017.00': ['33-1012.00', 'lead armed teams in tactical operations'],
  '55-1019.00': ['33-1012.00', 'lead armed teams in tactical operations'],
  '55-2011.00': ['53-1041.00', 'supervise air crew and aircraft cargo/loading work'],
  '55-2012.00': ['33-1012.00', 'supervise armed tactical crews'],
  '55-2013.00': ['33-1012.00', 'supervise armed tactical crews'],
  '55-3011.00': ['53-2011.00', 'operate aircraft systems as flight crew'],
  '55-3012.00': ['53-2022.00', 'handle aircraft on the flight line and airfield'],
  '55-3013.00': ['47-2073.00', 'operate heavy tracked vehicles and equipment'],
  '55-3014.00': ['47-5032.00', 'handle, load and fire explosives and ordnance'],
  '55-3015.00': ['43-5031.00', 'operate command, control and communications consoles'],
  '55-3016.00': ['33-3051.00', 'patrol, secure areas and use weapons under rules of engagement'],
  '55-3018.00': ['33-3051.00', 'patrol, secure areas and use weapons under rules of engagement'],
  '55-3019.00': ['33-3051.00', 'patrol, secure areas and use weapons under rules of engagement'],
};

const STOP = new Set('and the for with all other not listed separately this that are from such workers occupations occupation related include includes including may who their under various'.split(' '));
const toks = (s) => String(s || '').toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.replace(/ies$/, 'y').replace(/s$/, ''));
const isAllOther = (o) => /\bAll Other\b/i.test(o.title);

function makeSim(all) {
  const df = new Map(); const docs = new Map();
  for (const o of all) { const t = [...toks(o.title), ...toks(o.title), ...toks(o.description)]; docs.set(o.code, t); new Set(t).forEach((w) => df.set(w, (df.get(w) || 0) + 1)); }
  const N = all.length; const vec = new Map();
  for (const [code, t] of docs) { const v = new Map(); t.forEach((w) => v.set(w, (v.get(w) || 0) + 1)); for (const [w, n] of v) v.set(w, n * Math.log(N / df.get(w))); const norm = Math.sqrt([...v.values()].reduce((s, x) => s + x * x, 0)) || 1; for (const [w, x] of v) v.set(w, x / norm); vec.set(code, v); }
  return (a, b) => { const va = vec.get(a), vb = vec.get(b); let s = 0; for (const [w, x] of va) s += x * (vb.get(w) || 0); return s; };
}

function avgElems(lists) {
  const m = new Map();
  for (const l of lists) for (const e of l) {
    const k = e.category + '|' + e.id; const a = m.get(k) || { e, n: 0, im: 0, lv: 0, ln: 0 };
    a.n++; a.im += e.importance; if (e.level != null) { a.lv += e.level; a.ln++; } m.set(k, a);
  }
  return [...m.values()].map(({ e, n, im, lv, ln }) => { const x = { ...e, importance: r2(im / n) }; if ('level' in e || ln) x.level = ln ? r2(lv / ln) : null; return x; });
}

/**
 * Fill empty descriptor blocks. all: occupation objects straight from O*NET (before exposure/derived).
 * opts: { crosswalk: rows of the O*NET-SOC 2010->2019 crosswalk, employment: (code) => number|null }
 * Returns { counts by method }.
 */
function fillDescriptors(all, occ, opts) {
  const rated = (o) => o.skills.length > 0 && o.abilities.length > 0 && o.tasks.length > 0;
  const native = new Set(all.filter(rated).map((o) => o.code));
  const sim = makeSim(all);
  const pred = new Map(), succ = new Map();
  for (const r of opts.crosswalk) {
    const a = r['O*NET-SOC 2010 Code'], at = r['O*NET-SOC 2010 Title'], b = r['O*NET-SOC 2019 Code'];
    const p = pred.get(b) || []; if (!p.find((x) => x.code === a)) p.push({ code: a, title: at }); pred.set(b, p);
    const s = succ.get(a) || new Set(); s.add(b); succ.set(a, s);
  }
  const ok = (x, o) => x && x.code !== o.code && native.has(x.code);
  const relRank = (o, code) => { const r = o.related.find((x) => x.code === code); return r ? (r.index ?? 99) : 999; };

  function pick(o) {
    let s = all.filter((x) => ok(x, o) && x.code.slice(0, 7) === o.code.slice(0, 7));
    if (s.length) return { method: 'same_soc_siblings', sources: s, note: `O*NET rates this SOC occupation only through ${s.length === 1 ? 'a more specific O*NET-SOC role' : `${s.length} more specific O*NET-SOC roles`}; ratings are averaged and tasks combined.` };
    const preds = (pred.get(o.code) || []).filter((p) => !/All Other/i.test(p.title));
    const cand = [];
    for (const p of preds) for (const c of succ.get(p.code) || []) { const x = occ.get(c); if (ok(x, o) && !cand.find((y) => y.x === x)) cand.push({ x, p }); }
    if (cand.length) {
      cand.sort((a, b) => relRank(o, a.x.code) - relRank(o, b.x.code) || sim(o.code, b.x.code) - sim(o.code, a.x.code));
      const { x, p } = cand[0];
      return { method: 'onet_soc_2010_crosswalk', sources: [x], predecessor: p, note: `Both this occupation and ${x.title} were split from the O*NET-SOC 2010 occupation "${p.title}" (${p.code}).` };
    }
    if (MILITARY[o.code]) {
      const [c, why] = MILITARY[o.code]; const x = occ.get(c);
      if (ok(x, o)) return { method: 'military_civilian_equivalent', sources: [x], note: `O*NET does not rate military occupations. ${x.title} is the closest civilian occupation: both ${why}.` };
    }
    const rel = [...o.related].sort((a, b) => (a.index ?? 99) - (b.index ?? 99)).map((r) => occ.get(r.code)).find((x) => ok(x, o));
    if (rel && !isAllOther(o)) return { method: 'onet_related_top_ranked', sources: [rel], note: `${rel.title} is the highest-ranked O*NET related occupation with ratings.` };
    for (const [len, method, label] of [[6, 'same_broad_soc_group_most_similar', 'broad'], [4, 'same_minor_soc_group_most_similar', 'minor'], [2, 'same_major_soc_group_most_similar', 'major']]) {
      const c = all.filter((x) => ok(x, o) && !isAllOther(x) && x.code.slice(0, len) === o.code.slice(0, len));
      if (!c.length) continue;
      c.sort((a, b) => (r2(sim(o.code, b.code)) - r2(sim(o.code, a.code))) || ((opts.employment(b.code) || 0) - (opts.employment(a.code) || 0)));
      const x = c[0];
      return { method, sources: [x], note: `"All Other" catch-all with no O*NET ratings; ${x.title} is the most similar rated occupation in the same ${label} SOC group (${o.code.slice(0, len)}…).` };
    }
    if (rel) return { method: 'onet_related_top_ranked', sources: [rel], note: `${rel.title} is the highest-ranked O*NET related occupation with ratings.` };
    return null;
  }

  const counts = {};
  for (const o of all) {
    if (native.has(o.code)) continue;
    const p = pick(o);
    if (!p) continue;
    const src = p.sources; const fields = [];
    const borrow = (field, fn) => { if (!o[field].length) { o[field] = fn(); if (o[field].length) fields.push(field); } };
    borrow('skills', () => avgElems(src.map((x) => x.skills)));
    borrow('abilities', () => avgElems(src.map((x) => x.abilities)));
    borrow('knowledge', () => avgElems(src.map((x) => x.knowledge)));
    borrow('tasks', () => { const seen = new Set(); return src.flatMap((x) => x.tasks.map((t) => ({ ...t, source_code: x.code }))).filter((t) => !seen.has(t.text) && seen.add(t.text)); });
    borrow('technology', () => { const seen = new Set(); return src.flatMap((x) => x.technology).filter((t) => !seen.has(t.example) && seen.add(t.example)).map((t) => ({ ...t })); });
    borrow('related', () => {
      const own = src.map((x) => ({ code: x.code, title: x.title, tier: 'Primary-Short', index: 0, inferred: true }));
      const seen = new Set([o.code, ...src.map((x) => x.code)]);
      const rest = src.flatMap((x) => x.related).sort((a, b) => (a.index ?? 99) - (b.index ?? 99)).filter((r) => !seen.has(r.code) && seen.add(r.code)).map((r) => ({ ...r, inferred: true }));
      return [...own, ...rest].slice(0, 20);
    });
    if (o.job_zone == null) { const z = src.map((x) => x.job_zone).filter((x) => x != null); if (z.length) { o.job_zone = Math.round(z.reduce((a, b) => a + b, 0) / z.length); fields.push('job_zone'); } }
    if (!fields.length) continue;
    const primary = src[0];
    o.inferred_from = {
      code: primary.code, title: primary.title, method: p.method,
      label: p.method === 'same_soc_siblings' && src.length > 1 ? `Based on ${src.length} closely related O*NET roles (e.g. ${primary.title})` : `Based on closest related role: ${primary.title}`,
      sources: src.map((x) => ({ code: x.code, title: x.title })), fields, note: p.note,
      ...(p.predecessor ? { predecessor: p.predecessor } : {}),
    };
    counts[p.method] = (counts[p.method] || 0) + 1;
  }
  return counts;
}

/** Short provenance reference used on derived/exposure blocks. */
const ref = (o) => (o.inferred_from ? { code: o.inferred_from.code, title: o.inferred_from.title, method: o.inferred_from.method, label: o.inferred_from.label } : null);

/**
 * Friendlier technology names for user-facing text:
 *   "Cascading style sheets CSS" -> "CSS", "Amazon Web Services AWS software" -> "AWS", "SAP software" -> "SAP",
 *   "The MathWorks MATLAB" -> "MATLAB", "Oracle Java" -> "Java", "Atlassian JIRA" -> "Jira".
 */
const VENDOR = [/^The MathWorks /, /^Atlassian /, /^Dassault Systemes /, /^Intuit /, /^Autodesk /, /^Bentley /, /^ESRI /, /^Apache (?=Kafka|Hadoop|Spark|Maven|Tomcat|Cassandra|Airflow)/, /^Oracle (?=Java$|JavaScript)/, /^Apple (?=macOS|iOS)/, /^Google (?=Docs|Sheets|Drive)/, /^Adobe (?=Photoshop|Illustrator|InDesign|Acrobat|Premiere)/];
const RENAME = { JIRA: 'Jira', 'IBM SPSS Statistics': 'SPSS', 'Microsoft Office': 'Microsoft Office', 'Epic Systems': 'Epic' };
function friendlyTool(name) {
  let s = String(name).trim().replace(/\s+software$/i, '');
  const words = s.split(/\s+/); const last = words[words.length - 1];
  if (words.length >= 3 && /^[A-Z][A-Z0-9#+]{1,}$/.test(last)) {
    const before = words.slice(0, -1).join(' ').toLowerCase(); const letters = last.toLowerCase().replace(/[^a-z]/g, '');
    let i = 0; for (const ch of before) if (ch === letters[i]) i++;
    const initials = words.slice(0, -1).map((w) => w[0].toLowerCase());
    if (i === letters.length && (initials.includes(letters[0]) || words.slice(1, -1).some((w) => /^[a-z]/.test(w)))) s = last;
  }
  for (const re of VENDOR) s = s.replace(re, '');
  return RENAME[s] || s;
}

module.exports = { fillDescriptors, friendlyTool, ref, MILITARY, isAllOther };
