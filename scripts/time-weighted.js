/**
 * Time-weighted task exposure (Drew, Oct 21, 2026): for every job, AI and robotics separately,
 *   TWE = sum over tasks of (task time share) x (graded task exposure strength) / (time share of tasks that have evidence)
 * Task time share: Anthropic Economic Index time share where published, otherwise 1/n; normalised so the job's
 * tasks sum to 100% (identical to `time_share_normalized` shown in the task breakdown).
 * Graded AI strength of a task (0..1) = mean of the published evidence the task has:
 *   - Anthropic Economic Index task penetration (observed AI use, 0..1)
 *   - Eloundou et al. (2023) task beta, E1 = 1, E2 = 0.5, E0 = 0 (mean of GPT-4 and human labels)
 *   - verified-product targeting: 1 when a verified AI product (SmartPivot weekly check) targets the task AND the task has
 *     observed AI use (positive evidence only; "not targeted" is not evidence of no exposure)
 * Graded robotics strength of a task (0..1) = max of
 *   - Anthropic robot tier E0..E3 -> 0, 1/3, 2/3, 1 (a task in the Anthropic robot file without a tier is rated 0)
 *   - share of the task covered by commercial/deployed robots (SmartPivot robot links, cited systems)
 * Tasks with no evidence for a dimension are left out of that dimension and their time is redistributed over the tasks
 * that have evidence (never counted as 0). `coverage` = share of the job's time that has evidence. A job with no task
 * evidence at all gets null (the blend then re-weights it away, like every other missing measure).
 */
const fs = require('fs'); const path = require('path'); const { parse } = require('csv-parse/sync'); const { ROOT } = require('./lib');
const TIER = { E0: 0, E1: 1 / 3, E2: 2 / 3, E3: 1 };
const r3 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1000) / 1000);
let ET = null;
function eloundouTasks() {
  if (ET) return ET; ET = new Map();
  const f = path.join(ROOT, '.cache/eloundou_tasks.tsv'); if (!fs.existsSync(f)) return ET;
  const v = { E0: 0, E1: 1, E2: 0.5 };
  for (const r of parse(fs.readFileSync(f, 'utf8'), { columns: true, delimiter: '\t', relax_quotes: true, skip_empty_lines: true })) {
    const id = String(r['Task ID']).replace(/\.0$/, ''); const xs = [v[r.gpt4_exposure], v[r.human_exposure_agg]].filter((x) => x != null);
    if (xs.length) ET.set(id, xs.reduce((a, b) => a + b, 0) / xs.length);
  }
  return ET;
}
function taskRows(o) {
  const tasks = o.tasks || []; const n = tasks.length || 1; const E = eloundouTasks();
  const raw = tasks.map((t) => t.time_share ?? 1 / n); const W = raw.reduce((a, b) => a + b, 0) || 1;
  const targeted = new Set((o.agents?.targeted_task_ids || []).map(String));
  const cover = new Map((o.exposure?.robotics?.task_citations || []).map((c) => [String(c.task_id), Math.max(0, Math.min(1, c.covered_share || 0))]));
  return tasks.map((t, i) => {
    const id = String(t.id); const pen = t.ai_task_penetration ?? null; const beta = E.has(id) ? E.get(id) : null;
    const tgt = pen != null && pen > 0 && targeted.has(id);
    const aiEv = [pen, beta, tgt ? 1 : null].filter((x) => x != null);
    const tier = t.robot_tier && t.robot_tier in TIER ? TIER[t.robot_tier] : (t.time_share != null && pen != null ? 0 : null);
    const cov = cover.has(id) ? cover.get(id) : null;
    const robEv = [tier, cov].filter((x) => x != null);
    return { id, share: raw[i] / W, time_basis: t.time_share != null ? 'anthropic' : 'equal_share',
      ai: aiEv.length ? aiEv.reduce((a, b) => a + b, 0) / aiEv.length : null, robotics: robEv.length ? Math.max(...robEv) : null,
      evidence: { aei_penetration: pen, eloundou_beta: beta, verified_product: tgt, robot_tier_score: tier, deployed_cover: cov } };
  });
}
function twe(o) {
  const rows = taskRows(o);
  const dim = (k) => { let s = 0, w = 0; for (const r of rows) { if (r[k] == null) continue; s += r.share * r[k]; w += r.share; } return { value: w > 0 ? s / w : null, coverage: w }; };
  const a = dim('ai'), b = dim('robotics');
  return { ai: r3(a.value), ai_coverage: r3(a.coverage), robotics: r3(b.value), robotics_coverage: r3(b.coverage),
    time_basis: rows.every((r) => r.time_basis === 'anthropic') ? 'anthropic_time_share' : rows.some((r) => r.time_basis === 'anthropic') ? 'mixed' : 'equal_weight_fallback',
    tasks: rows.map((r) => ({ id: r.id, time_share: r3(r.share), ai: r3(r.ai), robotics: r3(r.robotics) })) };
}
module.exports = { twe, taskRows, TIER };
