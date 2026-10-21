// Unit + data tests for robot/AI product -> task linkage. Run by npm test.
const assert = require('assert');
const fs = require('fs'); const path = require('path');
const RL = require('./robot-links');
// instanceCoverage: covered only where instance tier >= setting tier and a commercial/deployed autonomous source is cited
const src = [
  { source: 0, system: 'Aurora Driver', developer: 'Aurora', maturity: 'commercial', autonomy_status: 'autonomous', date: '2026-07-22', url: 'https://a/1' },
  { source: 1, system: 'Demo Bot', developer: 'D', maturity: 'demo', autonomy_status: 'autonomous', url: 'https://d/1' },
  { source: 2, system: 'Teleop Bot', developer: 'T', maturity: 'deployed', autonomy_status: 'teleoperated', url: 'https://t/1' },
  { source: 3, system: 'Cell Robot', developer: 'C', maturity: 'deployed', autonomy_status: 'autonomous', url: 'https://c/1' },
];
const cov = RL.instanceCoverage([
  { weight_pct: 25, tier: 'E3', setting_tier: 'E3', sources: '0,1' }, // covered by Aurora
  { weight_pct: 20, tier: 'E3', setting_tier: 'E3', sources: '1,2' }, // only demo / teleoperated -> not covered
  { weight_pct: 30, tier: 'E1', setting_tier: 'E2', sources: '3' },   // robot needs a purpose-built cell, work is in a human facility -> not covered
  { weight_pct: 15, tier: 'E2', setting_tier: 'E1', sources: '3' },   // covered
  { weight_pct: 10, tier: 'E0', setting_tier: 'E0', sources: '0' },   // E0 never covered
], src);
assert.strictEqual(cov.covered_share, 0.4);
assert.deepStrictEqual(cov.systems.map((s) => s.system), ['Aurora Driver', 'Cell Robot']);
assert.strictEqual(RL.instanceCoverage([], src).covered_share, 0);
// displaySample: systems covering the most task time first, legacy keys, unique names, capped
const cites = [
  ...Array.from({ length: 12 }, (_, i) => ({ task_id: 'minor', tier: 'E1', system: 'Other ' + i, developer: 'X', maturity: 'commercial', date: '2025-01-01', url: 'https://x/' + i })),
  { task_id: 'core', tier: 'E2', system: 'Aurora Driver', developer: 'Aurora', maturity: 'commercial', date: '2026-05-01', url: 'https://a/2' },
];
const covMap = new Map([['core', { covered_share: 0.25, systems: [{ system: 'Aurora Driver' }] }]]);
const ds = RL.displaySample(cites, covMap, new Map([['minor', 0.01], ['core', 0.63]]), 10);
assert.strictEqual(ds.length, 10); assert.strictEqual(ds[0].system, 'Aurora Driver');
for (const k of ['task_id', 'tier', 'system', 'developer', 'maturity', 'date', 'url']) assert.ok(k in ds[0], 'legacy key ' + k);
// 4. data: every occupation has task_citations, links reference its own tasks, and for heavy truck drivers the core driving task is linked
const shards = fs.readdirSync(path.join(__dirname, '../data/occupations')).filter((f) => /^\d{2}\.json$/.test(f));
let n = 0;
for (const f of shards) for (const o of JSON.parse(fs.readFileSync(path.join(__dirname, '../data/occupations', f))).occupations) {
  n++; const r = o.exposure.robotics;
  assert.ok(Array.isArray(r.task_citations), o.code + ' task_citations');
  const own = new Set(o.tasks.map((t) => String(t.id)));
  for (const t of r.task_citations) { assert.ok(own.has(String(t.task_id)), `${o.code} cites foreign task ${t.task_id}`); assert.ok(t.covered_share > 0 && t.covered_share <= 1); assert.ok(t.systems.length && t.systems.every(RL.isCountedLink), o.code + ' counted systems only'); }
  for (const p of o.agents?.platforms || []) { assert.ok(Array.isArray(p.matched_task_ids), o.code + ' matched_task_ids');
    for (const m of p.matched_tasks || []) assert.ok(p.matched_task_ids.includes(String(m.id)), `${o.code} ${p.id} matched_tasks subset`); }
  if (o.code === '53-3032.00') {
    const core = r.task_citations.find((t) => String(t.task_id) === '10641');
    assert.ok(core && core.systems.some((s) => /Aurora/.test(s.system)), 'Aurora on drive-trucks task');
    assert.ok(core.covered_share > 0 && core.covered_share < 1, 'partial coverage of driving');
  }
}
assert.ok(n >= 1000, 'occupations ' + n);
console.log(`robot-links tests passed (${n} occupations)`);
