/**
 * Multi-source blended exposure (secondary score; the current composite stays primary until sign-off).
 * Every available measure contributes. Each measure is put on a common scale as its mid-rank percentile across the
 * 1,016 occupations. Measures are grouped into independent families. A family score is the mean of its available
 * member percentiles. The blend is the mean of the available family scores: missing measures are re-weighted away and
 * never count as zero. Agreement = SD of the family scores.
 * Occupations O*NET does not rate directly take job-level measures from the same related role the current composite
 * uses (inferred_from), flagged "inferred".
 */
const fs = require('fs'); const path = require('path'); const { parse } = require('csv-parse/sync'); const { ROOT } = require('./lib');
const r3 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1000) / 1000);
const mean = (a) => { const v = a.filter((x) => x != null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
const sd = (a) => { const v = a.filter((x) => x != null); if (v.length < 2) return null; const m = mean(v); return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / v.length); };

const AI_FAMILIES = {
  observed_use: { label: 'Observed AI use (Anthropic Economic Index)', measures: ['aei_observed_exposure', 'aei_task_penetration'] },
  rated_potential: { label: 'Rated LLM exposure (Eloundou et al. 2023)', measures: ['eloundou_gpt4_beta', 'eloundou_human_beta', 'eloundou_task_beta'] },
  ability_based: { label: 'Ability-based AI exposure (Felten, Raj & Seamans AIOE)', measures: ['felten_aioe'] },
  ilo_tasks: { label: 'ILO 2025 GenAI task scores (ISCO-08)', measures: ['ilo_task_score'] },
  market: { label: 'Work already targeted by verified AI products (SmartPivot weekly)', measures: ['ai_targeted_share'] },
  frey_osborne: { label: 'Frey & Osborne (2013) probability of computerisation (supporting, half weight)', measures: ['frey_osborne_ai'], weight: 0.5 },
};
const ROB_FAMILIES = {
  anthropic_robot: { label: 'Anthropic robot exposure', measures: ['robot_index', 'robot_task_tier'] },
  onet_automation: { label: 'O*NET Degree of Automation (work context, half weight)', measures: ['onet_degree_of_automation'], weight: 0.5 },
  deployed: { label: 'Work covered by commercial/deployed robots (SmartPivot weekly)', measures: ['robot_targeted_share'] },
  frey_osborne: { label: 'Frey & Osborne (2013) probability of computerisation (supporting, half weight)', measures: ['frey_osborne_rob'], weight: 0.5 },
};
const MEASURE_LABEL = {
  aei_observed_exposure: 'Anthropic observed exposure (job)', aei_task_penetration: 'Anthropic task penetration, time-weighted (tasks)',
  eloundou_gpt4_beta: 'Eloundou β, GPT-4 rated (job)', eloundou_human_beta: 'Eloundou β, human rated (job)', eloundou_task_beta: 'Eloundou β from task labels, E1=1, E2=0.5 (tasks)',
  felten_aioe: 'Felten AIOE (job)', ilo_task_score: 'ILO 2025 mean task score via ISCO-08 (tasks)', ai_targeted_share: 'Share of work time in AI-used tasks targeted by verified products',
  robot_index: 'Anthropic robot exposure index (job)', robot_task_tier: 'Anthropic robot tier, time-weighted (tasks)', onet_degree_of_automation: 'O*NET Degree of Automation 1-5 (job)', robot_targeted_share: 'Share of work time covered by commercial/deployed robots', frey_osborne_ai: 'Frey-Osborne probability of computerisation (SOC 2010 via BLS 2010-2018)', frey_osborne_rob: 'Frey-Osborne probability of computerisation (SOC 2010 via BLS 2010-2018)',
};
const SCHEMES = {
  A_equal_families: { label: 'A. Final: equal family weights; O*NET automation and Frey-Osborne at 0.5 (primary)', fam: true },
  B_equal_measures: { label: 'B. Equal weight per measure', fam: false },
  C_exposure_only: { label: 'C. Final weights without the market signals', fam: true, drop: ['market', 'deployed'] },
  D_all_full: { label: 'D. Every family at full weight', fam: true, full: true },
};

function eloundouTasks() {
  const f = path.join(ROOT, '.cache/eloundou_tasks.tsv'); if (!fs.existsSync(f)) return new Map();
  const rows = parse(fs.readFileSync(f, 'utf8'), { columns: true, delimiter: '\t', relax_quotes: true, skip_empty_lines: true });
  const v = { E0: 0, E1: 1, E2: 0.5 }; const m = new Map(); // task beta: E1 + 0.5*E2 (Eloundou et al. definition of beta)
  for (const r of rows) { const id = String(r['Task ID']).replace(/\.0$/, ''); const g = v[r.gpt4_exposure], h = v[r.human_exposure_agg]; const s = mean([g, h]); if (s != null) m.set(id, s); }
  return m;
}
let FO = null;
function freyOsborne() {
  if (FO) return FO; FO = { bySoc10: new Map(), soc18to10: new Map() };
  const f = path.join(ROOT, 'data/sources/frey_osborne_2013.json'); if (!fs.existsSync(f)) return FO;
  for (const r of JSON.parse(fs.readFileSync(f, 'utf8')).occupations) FO.bySoc10.set(r.soc2010, r.probability);
  const XLSX = require('xlsx'); const x = path.join(ROOT, '.cache/multisource/soc10_18.xlsx');
  if (fs.existsSync(x)) for (const r of XLSX.utils.sheet_to_json(XLSX.readFile(x).Sheets[XLSX.readFile(x).SheetNames[0]], { header: 1 })) { const a = String(r[0] || '').trim(), b = String(r[2] || '').trim(); if (/^\d{2}-\d{4}$/.test(a) && /^\d{2}-\d{4}$/.test(b)) (FO.soc18to10.get(b) || FO.soc18to10.set(b, new Set()).get(b)).add(a); }
  return FO;
}
function foFor(code) { const F = freyOsborne(); const s18 = code.slice(0, 7); const s10 = F.soc18to10.get(s18) || new Set([s18]); return mean([...s10].map((c) => F.bySoc10.get(c) ?? null)); }
function rawMeasures(o, byCode, ms, eTask) {
  const src = (blk) => (blk?.inferred_from?.code && byCode.get(blk.inferred_from.code)) || null;
  const ai = o.exposure.ai; const aiSrc = (ai.eloundou_2023 || ai.felten_aioe != null || ai.anthropic_observed_exposure != null) ? null : src(ai.composite);
  const A = aiSrc ? aiSrc.exposure.ai : ai; const inferred = !!aiSrc;
  const tasks = o.tasks || []; const tw = (t) => (t.time_share > 0 ? t.time_share : null);
  const W = tasks.some(tw) ? (t) => tw(t) || 0 : () => 1;
  const wavg = (f) => { let s = 0, w = 0; for (const t of tasks) { const v = f(t); if (v == null) continue; s += W(t) * v; w += W(t); } return w ? s / w : null; };
  const targeted = new Set((o.agents?.targeted_task_ids || []).map(String));
  const cover = new Map((o.exposure.robotics.task_citations || []).map((c) => [String(c.task_id), Math.max(0, Math.min(1, c.covered_share))]));
  const anyTime = tasks.some(tw);
  const ilo = ms?.summary?.by_source?.ilo; // ILO: weighted mean raw task score over the ISCO tasks mapped to this job
  const iloStmts = ms ? ms.statements.filter((s) => s.ai?.basis === 'direct' && s.ai.ilo_2025 != null && s.sources.some((z) => z.source === 'ilo')) : [];
  const iloW = iloStmts.reduce((a, s) => a + Math.max(...s.sources.filter((z) => z.source === 'ilo').map((z) => z.w)), 0);
  const R = o.exposure.robotics; const rSrc = R.robot_exposure_index_inferred || R.inferred_from ? src(R) : null;
  return {
    inferred,
    ai: {
      aei_observed_exposure: A.anthropic_observed_exposure ?? null,
      aei_task_penetration: wavg((t) => t.ai_task_penetration ?? null),
      eloundou_gpt4_beta: A.eloundou_2023?.dv_beta ?? null, eloundou_human_beta: A.eloundou_2023?.human_beta ?? null,
      eloundou_task_beta: wavg((t) => (eTask.has(String(t.id)) ? eTask.get(String(t.id)) : null)),
      felten_aioe: A.felten_aioe ?? null,
      ilo_task_score: iloW ? iloStmts.reduce((a, s) => a + Math.max(...s.sources.filter((z) => z.source === 'ilo').map((z) => z.w)) * s.ai.ilo_2025, 0) / iloW : null,
      frey_osborne_ai: foFor(o.code),
      ai_targeted_share: anyTime ? wavg((t) => ((t.ai_task_penetration ?? 0) > 0 && targeted.has(String(t.id)) ? 1 : 0)) : null,
    },
    rob: {
      robot_index: R.anthropic_robot_exposure_index ?? null,
      robot_task_tier: wavg((t) => (t.robot_tier ? Number(t.robot_tier.slice(1)) / 3 : (t.time_share != null ? 0 : null))),
      onet_degree_of_automation: R.onet_degree_of_automation ?? (rSrc?.exposure.robotics.onet_degree_of_automation ?? null),
      frey_osborne_rob: foFor(o.code),
      robot_targeted_share: anyTime && R.task_citations ? wavg((t) => cover.get(String(t.id)) ?? 0) : null,
    },
  };
}
const pctFn = (vals) => { const s = vals.filter((v) => v != null).sort((a, b) => a - b); return (v) => { if (v == null) return null; let lo = 0, hi = s.length; while (lo < hi) { const m = (lo + hi) >> 1; if (s[m] < v) lo = m + 1; else hi = m; } let e = lo; while (e < s.length && s[e] === v) e++; return (lo + e) / 2 / s.length; }; };
function score(p, FAM, scheme) {
  const fams = Object.entries(FAM).filter(([k]) => !(scheme.drop || []).includes(k));
  if (scheme.fam) { let S = 0, W = 0; for (const [, f] of fams) { const v = mean(f.measures.map((m) => p[m])); if (v == null) continue; const w = scheme.full ? 1 : f.weight ?? 1; S += w * v; W += w; } return W ? S / W : null; }
  return mean(fams.flatMap(([, f]) => f.measures.map((m) => p[m])));
}
function compute(shards, msByCode) {
  const all = [...shards.values()]; const eTask = eloundouTasks();
  const raw = new Map(all.map((o) => [o.code, rawMeasures(o, shards, msByCode.get(o.code), eTask)]));
  const pAI = {}, pR = {};
  for (const m of Object.keys(MEASURE_LABEL)) { const dim = m in raw.values().next().value.ai ? 'ai' : 'rob'; const f = pctFn([...raw.values()].map((r) => r[dim][m])); (dim === 'ai' ? pAI : pR)[m] = f; }
  const out = new Map();
  for (const o of all) {
    const r = raw.get(o.code);
    const pa = Object.fromEntries(Object.entries(r.ai).map(([k, v]) => [k, r3(pAI[k](v))]));
    const pr = Object.fromEntries(Object.entries(r.rob).map(([k, v]) => [k, r3(pR[k](v))]));
    const fam = (FAM, p, rawv) => Object.fromEntries(Object.entries(FAM).map(([k, f]) => [k, { label: f.label, weight: f.weight ?? 1, score: r3(mean(f.measures.map((m) => p[m]))), measures: f.measures.map((m) => ({ id: m, label: MEASURE_LABEL[m], raw: r3(rawv[m]), pct: p[m] })) }]));
    const fa = fam(AI_FAMILIES, pa, r.ai), fr = fam(ROB_FAMILIES, pr, r.rob);
    const agree = (F) => { const v = Object.entries(F).filter(([k]) => k !== 'frey_osborne').map(([, f]) => f.score); const s = sd(v); const n = v.filter((x) => x != null).length; return { families: n, sd: r3(s), range: n ? r3(Math.max(...v.filter((x) => x != null)) - Math.min(...v.filter((x) => x != null))) : null, label: s == null ? 'single source' : s < 0.15 ? 'sources agree' : s < 0.25 ? 'sources partly agree' : 'sources disagree' }; };
    out.set(o.code, {
      ai: { score: r3(score(pa, AI_FAMILIES, SCHEMES.A_equal_families)), schemes: Object.fromEntries(Object.entries(SCHEMES).map(([k, s]) => [k, r3(score(pa, AI_FAMILIES, s))])), families: fa, agreement: agree(fa) },
      robotics: { score: r3(score(pr, ROB_FAMILIES, SCHEMES.A_equal_families)), schemes: Object.fromEntries(Object.entries(SCHEMES).map(([k, s]) => [k, r3(score(pr, ROB_FAMILIES, s))])), families: fr, agreement: agree(fr) },
      inferred: r.inferred ? (o.exposure.ai.composite?.inferred_from?.code || null) : null,
      current_ai_composite: o.exposure.ai.composite?.previous_method?.value ?? o.exposure.ai.composite?.value ?? null, current_robot_index: o.exposure.robotics.anthropic_robot_exposure_index ?? null,
      combined_potential: o.derived?.skill_risk_summary?.occupation_combined ?? null,
    });
  }
  // calibration: pairwise Spearman (Pearson on percentiles) between measures
  const cal = {}; const ms = Object.keys(MEASURE_LABEL);
  for (const a of ms) for (const b of ms) if (a < b) { const xs = [...out.values()].map((x) => [pick(x, a), pick(x, b)]).filter(([u, v]) => u != null && v != null); if (xs.length > 30) cal[`${a}~${b}`] = { n: xs.length, rho: r3(pear(xs)) }; }
  return { byCode: out, calibration: cal, coverage: Object.fromEntries(ms.map((m) => [m, [...out.values()].filter((x) => pick(x, m) != null).length])) };
}
function pick(x, m) { for (const F of [x.ai.families, x.robotics.families]) for (const f of Object.values(F)) for (const q of f.measures) if (q.id === m) return q.pct; return null; }
function pear(xs) { const n = xs.length; const mx = xs.reduce((a, [u]) => a + u, 0) / n, my = xs.reduce((a, [, v]) => a + v, 0) / n; let c = 0, vx = 0, vy = 0; for (const [u, v] of xs) { c += (u - mx) * (v - my); vx += (u - mx) ** 2; vy += (v - my) ** 2; } return c / Math.sqrt(vx * vy); }
module.exports = { compute, AI_FAMILIES, ROB_FAMILIES, SCHEMES, MEASURE_LABEL, pear };
