/**
 * Time-weighted task exposure (Drew, Oct 21, 2026), v2 "points = time x automatable fraction":
 *   T = sum over tasks of (task time share) x (fraction of the task that can be automated) / (time share of tasks with evidence)
 * so a task taking 30% of the day that is 20% automatable adds 0.30 x 0.20 = 6 points. AI and robotics separately.
 * Task time share: Anthropic Economic Index time share where published, otherwise 1/n; normalised to sum to 100%.
 * AI automatable fraction of a task (0..1) = mean of the available per-task evidence:
 *   continuous - Anthropic Economic Index task penetration (Massenkoff & McCrory 2026): share of the task covered by
 *                work-related Claude use, automated use at full weight and augmentative use at half weight;
 *   continuous - ILO WP140 (Gmyrek et al. 2025) GenAI task score 0..1, where the O*NET task is the same statement as an
 *                ILO ISCO-08 task (SmartPivot multi-source merge);
 *   tier-based - Eloundou et al. (2023) label, which only says whether an LLM cuts the task's time by at least half:
 *                E1 (LLM alone) = 0.5 (the definition's 50% time-saving threshold), E2 (LLM + extra tools) = 0.25
 *                (same threshold at the half weight the paper's beta gives E2), E0 = 0; mean of GPT-4 and human labels.
 * Robotics automatable fraction of a task (0..1):
 *   continuous - Legate-Yang & Massenkoff (2026) "What work can robots do?" task instances: weight_pct share of the task's
 *                instances a cited robot can complete in that instance's own setting (instance tier > E0 and >= setting
 *                tier); at least the share already covered by commercial/deployed autonomous robots (SmartPivot robot links);
 *   not physical - the source rates the task non-physical -> 0;
 *   tier-based  - only if a task has a tier but no instances: E0 = 0, E1-E3 = 0.5 (the source's rule: a tier means more
 *                than half of instances by weight are exposed at it).
 * Tasks with no evidence are left out and their time redistributed (never counted as 0). Verified-product targeting
 * is not a fraction and stays in the job-level "market" family and the market rule, not in the task fraction.
 */
const fs = require('fs'); const path = require('path'); const { parse } = require('csv-parse/sync'); const { ROOT } = require('./lib');
const TIER = { E0: 0, E1: 1 / 3, E2: 2 / 3, E3: 1 }; // legacy tier score (kept for the job-level robot_task_tier measure)
const ELOUNDOU_FRACTION = { E0: 0, E1: 1 }; // E2 handled by labelScore (1 with software evidence)
const ROBOT_TIER_FRACTION = { E0: 0, E1: 0.5, E2: 0.5, E3: 0.5 };
const r3 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1000) / 1000);
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
let ET = null;
function eloundouTasks() {
  if (ET) return ET; ET = new Map();
  const f = path.join(ROOT, '.cache/eloundou_tasks.tsv'); if (!fs.existsSync(f)) return ET;
  for (const r of parse(fs.readFileSync(f, 'utf8'), { columns: true, delimiter: '\t', relax_quotes: true, skip_empty_lines: true }))
    ET.set(String(r['Task ID']).replace(/\.0$/, ''), [r.gpt4_exposure, r.human_exposure_agg].filter((x) => x in ELOUNDOU_FRACTION || x === 'E2'));
  return ET;
}
// Capability rule (Drew, Oct 21, 2026, approved): a task is AI-automatable if AI can perform it at all (cost, not speed).
// Per Eloundou rater label: E1 (LLM alone can do it) = 1; E2 (LLM + software) = 1 when software for the task is shown to
// exist (observed Anthropic use > 0 or a weekly-verified AI product targets the task), otherwise the label is not used and
// the task's other evidence decides; E0 = 0. Label score = mean over the raters (GPT-4, human) that give a usable label.
function labelScore(labels, softwareExists) {
  const xs = (labels || []).map((l) => (l === 'E1' ? 1 : l === 'E0' ? 0 : l === 'E2' ? (softwareExists ? 1 : null) : null)).filter((x) => x != null);
  return xs.length ? mean(xs) : null;
}
let ILO = null; // O*NET task id -> ILO 2025 score, from the committed multi-source shards (same-statement merges only)
function iloTasks() {
  if (ILO) return ILO; ILO = new Map();
  const dir = path.join(ROOT, 'data/multisource/occ'); if (!fs.existsSync(dir)) return ILO;
  for (const f of fs.readdirSync(dir)) {
    let d; try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { continue; }
    for (const s of d.statements || []) {
      if (s.ai?.ilo_2025 == null || !s.sources.some((z) => z.source === 'ilo')) continue;
      for (const z of s.sources) if (z.source === 'onet') ILO.set(String(z.ref), Math.max(ILO.get(String(z.ref)) ?? 0, s.ai.ilo_2025));
    }
  }
  return ILO;
}
function ownTaskRows(o) {
  const tasks = o.tasks || []; const n = tasks.length || 1; const E = eloundouTasks(); const I = iloTasks();
  const raw = tasks.map((t) => t.time_share ?? 1 / n); const W = raw.reduce((a, b) => a + b, 0) || 1;
  const targeted = new Set((o.agents?.targeted_task_ids || []).map(String));
  const cover = new Map((o.exposure?.robotics?.task_citations || []).map((c) => [String(c.task_id), Math.max(0, Math.min(1, c.covered_share || 0))]));
  return tasks.map((t, i) => {
    const id = String(t.id); const pen = t.ai_task_penetration ?? null; const ilo = I.has(id) ? I.get(id) : null;
    const tgt = targeted.has(id); const soft = (pen != null && pen > 0) || tgt; const elo = E.has(id) ? labelScore(E.get(id), soft) : null;
    // AI automatable fraction = the strongest real capability evidence the task has (any one source showing AI can do it):
    // max of the Eloundou label score, Anthropic task penetration and the ILO 2025 task score; no evidence -> null.
    const aiParts = []; if (pen != null) aiParts.push(['anthropic_task_penetration', pen, 'continuous']); if (ilo != null) aiParts.push(['ilo_2025_task_score', ilo, 'continuous']); if (elo != null) aiParts.push(['eloundou_2023_label', elo, 'tier']);
    const ai = aiParts.length ? Math.max(...aiParts.map((p) => p[1])) : null;
    const top = aiParts.filter((p) => ai != null && p[1] === ai); const aiKinds = new Set(top.map((p) => p[2]));
    const cov = cover.has(id) ? cover.get(id) : null; let rob = null, robBasis = null, robSrc = null;
    if (t.robot_automatable_share != null && t.robot_physical) { rob = Math.max(t.robot_automatable_share, cov ?? 0); robBasis = 'continuous'; robSrc = t.robot_driving_rule ? 'driverless_settings_rule' : 'anthropic_robot_task_instances'; }
    else if (t.robot_physical === false) { rob = 0; robBasis = 'not_physical'; robSrc = 'anthropic_robot_not_physical'; }
    else if (t.robot_tier && t.robot_tier in ROBOT_TIER_FRACTION) { rob = Math.max(ROBOT_TIER_FRACTION[t.robot_tier], cov ?? 0); robBasis = 'tier'; robSrc = 'anthropic_robot_tier'; }
    else if (t.time_share != null && pen != null) { rob = cov ?? 0; robBasis = 'not_physical'; robSrc = 'anthropic_robot_not_physical'; }
    return { id, share: raw[i] / W, time_basis: t.time_share != null ? 'anthropic' : 'equal_share',
      ai, ai_basis: aiKinds.size === 2 ? 'mixed' : aiKinds.size ? [...aiKinds][0] : null, ai_sources: top.map((p) => p[0]), ai_evidence_sources: aiParts.map((p) => p[0]),
      robotics: rob, robotics_basis: robBasis, robotics_source: robSrc,
      evidence: { aei_penetration: pen, ilo_2025: ilo, eloundou_labels: E.get(id) ?? null, eloundou_score: elo, verified_product: tgt, robot_tier: t.robot_tier ?? null, robot_automatable_share: t.robot_automatable_share ?? null, deployed_cover: cov } };
  });
}
// DWA pooling (Oct 21, 2026; Drew: near-identical jobs must score alike). Each source rates O*NET task *statements*, and
// the same work is worded differently in different jobs (e.g. Elementary "Instruct students individually and in groups,
// using ... lectures, discussions, and demonstrations" has 0 observed Claude use while Middle/Secondary "Instruct through
// lectures, discussions, and demonstrations in one or more subjects" has 0.853), and the E2 "software exists" test
// depends on job-specific product targeting. So a task's AI and robot fractions are taken at the level of the work it
// performs: O*NET's own task -> Detailed Work Activity links (tasks_to_dwas.csv). For each DWA, pooled fraction = mean of
// the own-statement fractions of every O*NET task linked to it (all 1,016 jobs, each task once). A task's fraction =
// mean over its DWAs of the pooled fraction. Tasks without a DWA link (or whose DWAs have no rated task) keep their own
// statement evidence. Nothing is filled in where no source rated any task of that activity.
let POOL = null;
function dwaLinks() {
  const f = path.join(ROOT, '.cache/tasks_to_dwas.csv'); const m = new Map();
  if (!fs.existsSync(f)) { const z = path.join(ROOT, '.cache/onet.zip'); if (!fs.existsSync(z)) return m; const AdmZip = require('adm-zip'); const e = new AdmZip(z).getEntries().find((x) => /tasks_to_dwas\.csv$/.test(x.entryName)); if (!e) return m; fs.writeFileSync(f, e.getData()); }
  for (const r of parse(fs.readFileSync(f, 'utf8'), { columns: true, relax_quotes: true, skip_empty_lines: true })) { const k = String(r['Task ID']); if (!m.has(k)) m.set(k, new Set()); m.get(k).add(r['DWA Element ID']); }
  return m;
}
function pool() {
  if (POOL) return POOL; const links = dwaLinks(); const seen = new Map(); const seenR = new Map(); const dir = path.join(ROOT, 'data/occupations');
  for (const f of fs.readdirSync(dir).filter((x) => /^\d\d\.json$/.test(x))) for (const o of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).occupations) {
    const drive = new Set((o.tasks || []).filter((t) => t.robot_driving_rule).map((t) => String(t.id)));
    const home = new Map((o.tasks || []).map((t) => [String(t.id), t.source_code || o.code])); // a task copied from another job keeps that job's setting
    for (const r of ownTaskRows(o)) {
      const k = r.id; const prev = seen.get(k) || { ai: [], rob: [] }; if (r.ai != null) prev.ai.push(r.ai); if (r.robotics != null) prev.rob.push(r.robotics); seen.set(k, prev);
      if (r.robotics != null && !drive.has(k)) { const g = minor(home.get(k) || o.code); const kk = g + '|' + k; const pr = seenR.get(kk) || { g, id: k, v: [] }; pr.v.push(r.robotics); seenR.set(kk, pr); }
    } }
  const acc = new Map(); // dwa -> {ai:[...], rob:[...]} one value per task id (mean over the jobs listing it)
  for (const [id, v] of seen) { const ds = links.get(id); if (!ds) continue; for (const d of ds) { const a = acc.get(d) || { ai: [], rob: [] }; if (v.ai.length) a.ai.push(mean(v.ai)); if (v.rob.length) a.rob.push(mean(v.rob)); acc.set(d, a); } }
  const dwa = new Map(); for (const [d, a] of acc) dwa.set(d, { ai: mean(a.ai), ai_n: a.ai.length, rob: mean(a.rob), rob_n: a.rob.length });
  const accR = new Map(); for (const { g, id, v } of seenR.values()) for (const d of links.get(id) || []) { const kk = g + '|' + d; if (!accR.has(kk)) accR.set(kk, []); accR.get(kk).push(mean(v)); }
  const dwaMinor = new Map(); for (const [kk, v] of accR) dwaMinor.set(kk, { rob: mean(v), rob_n: v.length });
  POOL = { links, dwa, dwaMinor }; return POOL;
}
const minor = (code) => String(code).slice(0, 4); // SOC minor group (e.g. 51-4 metal and plastic workers): same kind of work setting
function taskRows(o) {
  const own = ownTaskRows(o); const P = pool();
  return own.map((r) => {
    const ds = [...(P.links.get(r.id) || [])].map((d) => P.dwa.get(d)).filter(Boolean);
    const ai = ds.filter((d) => d.ai != null); const rb = ds.filter((d) => d.rob != null);
    const out = { ...r, ai_own: r.ai, robotics_own: r.robotics, dwa_ids: [...(P.links.get(r.id) || [])], ai_dwa_tasks: ai.reduce((s, d) => s + d.ai_n, 0), robotics_dwa_tasks: rb.reduce((s, d) => s + d.rob_n, 0) };
    if (ai.length) { out.ai = mean(ai.map((d) => d.ai)); out.ai_basis = 'dwa_pooled'; out.ai_sources = [...new Set([...(r.ai_sources || []), 'onet_dwa_pool'])]; }
    // Robotics (Oct 21, 2026, pass 2): robot instance ratings are setting-specific, so they are pooled per DWA *within the
    // job's SOC minor group* (same kind of workplace); driving-rule tasks keep their own rating (approved driving rule) and
    // are not pooled. Unrated tasks are filled from the same pool, else from the all-jobs DWA pool.
    const drive = (o.tasks || []).find((t) => String(t.id) === r.id)?.robot_driving_rule;
    const src = (o.tasks || []).find((t) => String(t.id) === r.id)?.source_code || o.code; // same statement, same setting, same evidence (tasks an O*NET-unrated job takes from its source job)
    const rm = drive ? [] : out.dwa_ids.map((d) => P.dwaMinor.get(minor(src) + '|' + d)).filter(Boolean);
    if (rm.length) { out.robotics = mean(rm.map((d) => d.rob)); out.robotics_basis = 'dwa_pooled'; out.robotics_source = r.robotics_source ? r.robotics_source + '+onet_dwa_pool_minor_group' : 'onet_dwa_pool_minor_group'; out.robotics_dwa_tasks = rm.reduce((s2, d) => s2 + d.rob_n, 0); }
    else if (rb.length && r.robotics == null) { out.robotics = mean(rb.map((d) => d.rob)); out.robotics_basis = 'dwa_pooled'; out.robotics_source = 'onet_dwa_pool'; }
    return out;
  });
}
// One task-level score (Drew, Oct 21, 2026): per task combined = 1 - (1 - ai)(1 - robot) (AI and robots usually automate
// different parts of a task; independence = the same rule used to combine any two exposures; max would assume full
// overlap and is only a lower bound). A dimension a task has no evidence for counts 0 in the combination if the other
// dimension is rated; tasks rated in neither are left out. Attribution: each task's points are split AI : robot in
// proportion to its AI and robot fractions (overlap split the same way).
function combine(r) { if (r.ai == null && r.robotics == null) return null; const a = r.ai ?? 0, b = r.robotics ?? 0; const c = 1 - (1 - a) * (1 - b); return { c, aiPart: a + b > 0 ? c * (a / (a + b)) : 0 }; }
function twe(o) {
  const rows = taskRows(o);
  const dim = (k) => { let s = 0, w = 0; for (const r of rows) { if (r[k] == null) continue; s += r.share * r[k]; w += r.share; } return { value: w > 0 ? s / w : null, coverage: w }; };
  const a = dim('ai'), b = dim('robotics');
  let cs = 0, cw = 0, ca = 0; for (const r of rows) { const x = combine(r); if (!x) continue; cs += r.share * x.c; cw += r.share; ca += r.share * x.aiPart; }
  const basisTime = (k) => { const out = {}; for (const r of rows) { const kb = r[k + '_basis']; if (kb) out[kb] = (out[kb] || 0) + r.share; } for (const x in out) out[x] = r3(out[x]); return out; };
  return { ai: r3(a.value), ai_coverage: r3(a.coverage), robotics: r3(b.value), robotics_coverage: r3(b.coverage),
    combined: cw > 0 ? r3(cs / cw) : null, combined_coverage: r3(cw), ai_share: cs > 0 ? r3(ca / cs) : null, robotics_share: cs > 0 ? r3(1 - ca / cs) : null,
    ai_basis_time: basisTime('ai'), robotics_basis_time: basisTime('robotics'),
    time_basis: rows.every((r) => r.time_basis === 'anthropic') ? 'anthropic_time_share' : rows.some((r) => r.time_basis === 'anthropic') ? 'mixed' : 'equal_weight_fallback',
    tasks: rows.map((r) => ({ id: r.id, time_share: r3(r.share), ai: r3(r.ai), robotics: r3(r.robotics) })) };
}
module.exports = { twe, taskRows, ownTaskRows, pool, combine, labelScore, TIER, ELOUNDOU_FRACTION, ROBOT_TIER_FRACTION };
