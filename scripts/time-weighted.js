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
const ELOUNDOU_FRACTION = { E0: 0, E1: 0.5, E2: 0.25 };
const ROBOT_TIER_FRACTION = { E0: 0, E1: 0.5, E2: 0.5, E3: 0.5 };
const r3 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1000) / 1000);
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
let ET = null;
function eloundouTasks() {
  if (ET) return ET; ET = new Map();
  const f = path.join(ROOT, '.cache/eloundou_tasks.tsv'); if (!fs.existsSync(f)) return ET;
  for (const r of parse(fs.readFileSync(f, 'utf8'), { columns: true, delimiter: '\t', relax_quotes: true, skip_empty_lines: true })) {
    const id = String(r['Task ID']).replace(/\.0$/, ''); const xs = [ELOUNDOU_FRACTION[r.gpt4_exposure], ELOUNDOU_FRACTION[r.human_exposure_agg]].filter((x) => x != null);
    if (xs.length) ET.set(id, mean(xs));
  }
  return ET;
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
function taskRows(o) {
  const tasks = o.tasks || []; const n = tasks.length || 1; const E = eloundouTasks(); const I = iloTasks();
  const raw = tasks.map((t) => t.time_share ?? 1 / n); const W = raw.reduce((a, b) => a + b, 0) || 1;
  const targeted = new Set((o.agents?.targeted_task_ids || []).map(String));
  const cover = new Map((o.exposure?.robotics?.task_citations || []).map((c) => [String(c.task_id), Math.max(0, Math.min(1, c.covered_share || 0))]));
  return tasks.map((t, i) => {
    const id = String(t.id); const pen = t.ai_task_penetration ?? null; const ilo = I.has(id) ? I.get(id) : null; const elo = E.has(id) ? E.get(id) : null;
    const aiParts = []; if (pen != null) aiParts.push(['anthropic_task_penetration', pen, 'continuous']); if (ilo != null) aiParts.push(['ilo_2025_task_score', ilo, 'continuous']); if (elo != null) aiParts.push(['eloundou_2023_label', elo, 'tier']);
    const aiKinds = new Set(aiParts.map((p) => p[2]));
    const ai = aiParts.length ? mean(aiParts.map((p) => p[1])) : null;
    const cov = cover.has(id) ? cover.get(id) : null; let rob = null, robBasis = null, robSrc = null;
    if (t.robot_automatable_share != null && t.robot_physical) { rob = Math.max(t.robot_automatable_share, cov ?? 0); robBasis = 'continuous'; robSrc = 'anthropic_robot_task_instances'; }
    else if (t.robot_physical === false) { rob = 0; robBasis = 'not_physical'; robSrc = 'anthropic_robot_not_physical'; }
    else if (t.robot_tier && t.robot_tier in ROBOT_TIER_FRACTION) { rob = Math.max(ROBOT_TIER_FRACTION[t.robot_tier], cov ?? 0); robBasis = 'tier'; robSrc = 'anthropic_robot_tier'; }
    else if (t.time_share != null && pen != null) { rob = cov ?? 0; robBasis = 'not_physical'; robSrc = 'anthropic_robot_not_physical'; }
    return { id, share: raw[i] / W, time_basis: t.time_share != null ? 'anthropic' : 'equal_share',
      ai, ai_basis: aiKinds.size === 2 ? 'mixed' : aiKinds.size ? [...aiKinds][0] : null, ai_sources: aiParts.map((p) => p[0]),
      robotics: rob, robotics_basis: robBasis, robotics_source: robSrc,
      evidence: { aei_penetration: pen, ilo_2025: ilo, eloundou_fraction: elo, verified_product: pen != null && pen > 0 && targeted.has(id), robot_tier: t.robot_tier ?? null, robot_automatable_share: t.robot_automatable_share ?? null, deployed_cover: cov } };
  });
}
function twe(o) {
  const rows = taskRows(o);
  const dim = (k) => { let s = 0, w = 0; for (const r of rows) { if (r[k] == null) continue; s += r.share * r[k]; w += r.share; } return { value: w > 0 ? s / w : null, coverage: w }; };
  const a = dim('ai'), b = dim('robotics');
  const basisTime = (k) => { const out = {}; for (const r of rows) { const kb = r[k + '_basis']; if (kb) out[kb] = (out[kb] || 0) + r.share; } for (const x in out) out[x] = r3(out[x]); return out; };
  return { ai: r3(a.value), ai_coverage: r3(a.coverage), robotics: r3(b.value), robotics_coverage: r3(b.coverage),
    ai_basis_time: basisTime('ai'), robotics_basis_time: basisTime('robotics'),
    time_basis: rows.every((r) => r.time_basis === 'anthropic') ? 'anthropic_time_share' : rows.some((r) => r.time_basis === 'anthropic') ? 'mixed' : 'equal_weight_fallback',
    tasks: rows.map((r) => ({ id: r.id, time_share: r3(r.share), ai: r3(r.ai), robotics: r3(r.robotics) })) };
}
module.exports = { twe, taskRows, TIER, ELOUNDOU_FRACTION, ROBOT_TIER_FRACTION };
