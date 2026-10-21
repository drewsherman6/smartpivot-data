#!/usr/bin/env node
// Time weighting invariants for all occupations (scripts/time-weighted.js, blend.js, skill-risk.js, task-breakdown.js).
const fs = require('fs'); const path = require('path'); const assert = require('assert'); const { ROOT } = require('./lib');
const dir = path.join(ROOT, 'data/occupations'); const all = fs.readdirSync(dir).filter((f) => /^\d\d\.json$/.test(f)).flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).occupations);
const bd = new Map(); const bdir = path.join(ROOT, 'data/exposure/task_breakdown'); for (const f of fs.readdirSync(bdir)) for (const o of JSON.parse(fs.readFileSync(path.join(bdir, f), 'utf8')).occupations) bd.set(o.code, o);
const near = (a, b, e = 0.0015) => Math.abs(a - b) <= e;
let n = 0;
for (const o of all) {
  const S = o.derived.skill_risk_summary; const T = S.time_weighted; const b = bd.get(o.code); assert(T && b, `${o.code}: time_weighted + breakdown`);
  assert.strictEqual(S.basis, 'multi_source_time_weighted', o.code);
  assert(near(b.tasks.reduce((s, t) => s + t.time_share_normalized, 0), 1, 0.02), `${o.code}: task time shares sum to 100%`);
  for (const t of b.tasks) for (const k of ['ai_strength', 'robotics_strength']) assert(t[k] == null || (t[k] >= 0 && t[k] <= 1), `${o.code}/${t.id}: ${k} in 0..1`);
  assert.strictEqual(b.summary.ai_time_weighted, T.ai, `${o.code}: breakdown AI T = summary`); assert.strictEqual(b.summary.robotics_time_weighted, T.robotics, `${o.code}: breakdown robotics T = summary`);
  const aw = b.tasks.filter((t) => t.ai_strength != null); if (aw.length) assert(near(aw.reduce((s, t) => s + t.time_share_normalized * t.ai_strength, 0) / aw.reduce((s, t) => s + t.time_share_normalized, 0), T.ai, 0.01), `${o.code}: AI T = sum(time x strength)`);
  for (const [k, tk] of [['ai_points', 'ai'], ['robotics_points', 'robotics']]) if (T[tk] != null) assert(near(b.tasks.reduce((s, t) => s + (t[k] ?? 0), 0), T[tk], 0.002), `${o.code}: ${k} add up to T`);
  for (const t of b.tasks) { if (t.ai_automatable != null) assert(['continuous', 'tier', 'mixed'].includes(t.ai_automatable_basis) && t.ai_automatable_sources.length, `${o.code}/${t.id}: AI basis + source`); if (t.robotics_automatable != null) assert(['continuous', 'tier', 'not_physical'].includes(t.robotics_automatable_basis) && t.robotics_automatable_source, `${o.code}/${t.id}: robot basis + source`); }
  for (const [k, w, oth] of [['occupation_ai', 'ai_weight', 'ai_other_measures'], ['occupation_robotics', 'robotics_weight', 'robotics_other_measures']]) {
    const t = T[k === 'occupation_ai' ? 'ai' : 'robotics']; const O = T[oth];
    if (t != null && O != null) { const h = Math.max(0.5 * t + 0.5 * O, 0.9 * t + 0.1 * O); assert(near(S[k], h, 0.002), `${o.code}: ${k} = benefit-of-the-doubt mix (${S[k]} vs ${h})`); assert([0.5, 0.9].includes(T[w]), `${o.code}: weight`); assert(S[k] >= Math.min(t, O) - 0.002 && S[k] <= Math.max(t, O) + 0.002, `${o.code}: ${k} between T and O`); }
  }
  assert(near(S.occupation_combined, 1 - (1 - S.occupation_ai) * (1 - S.occupation_robotics), 0.002), `${o.code}: combined formula`);
  assert(S.before_time_weighting && S.previous_method, `${o.code}: comparison scores kept`);
  n++;
}
console.log(`time-weighted tests passed (${n} occupations)`);
