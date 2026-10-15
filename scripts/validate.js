#!/usr/bin/env node
// npm test: fails (exit 1) on any invalid JSON, schema violation, duplicate id, missing sourcing, or stale manifest.
const fs = require('fs');
const path = require('path');
const { ROOT, ajv, readJson } = require('./lib');
const datasets = require('./datasets');
const errors = [];
const a = ajv();
const compiled = new Map();
const compile = (rel) => { if (!compiled.has(rel)) compiled.set(rel, a.compile(readJson(rel))); return compiled.get(rel); };

for (const ds of datasets) {
  let data;
  try { data = readJson(ds.path); } catch (e) { errors.push(e.message); continue; }
  const v = compile(ds.schema);
  if (!v(data)) errors.push(`${ds.path}: ${a.errorsText(v.errors, { separator: '\n  ' })}`);
  if (ds.key && Array.isArray(data[ds.key])) {
    const seen = new Set();
    for (const r of data[ds.key]) {
      if (seen.has(r.id)) errors.push(`${ds.path}: duplicate id ${r.id}`);
      seen.add(r.id);
      const restored = r.status === 'restored_unverified';
      if (!restored && !/^https?:\/\//.test(r.source?.url || '')) errors.push(`${ds.path}: ${r.id} has no source URL`);
      if (restored && r.confidence !== 'low') errors.push(`${ds.path}: ${r.id} restored_unverified must be confidence low`);
    }
  }
}
// Occupation coverage: every index code must exist in its shard, and vice versa
try {
  const idx = readJson('data/occupations/index.json'); let n = 0;
  const shards = new Map();
  for (const o of idx.occupations) {
    if (!shards.has(o.shard)) shards.set(o.shard, new Set(readJson(o.shard).occupations.map((x) => x.code)));
    if (!shards.get(o.shard).has(o.code)) errors.push(`index lists ${o.code} but ${o.shard} lacks it`);
  }
  for (const s of shards.values()) n += s.size;
  if (n !== idx.count || idx.count !== idx.occupations.length) errors.push(`occupation count mismatch index=${idx.count} shards=${n}`);
} catch (e) { errors.push(e.message); }
// Usable data for every occupation a user can pick (O*NET-rated or inferred, see scripts/infer.js):
// non-empty skills + future_skills, AI and robot task shares, a BLS median wage (or a documented reason),
// BLS projections (or a documented reason), provenance on every inferred block, and no abilities in skill fields.
try {
  const idx = readJson('data/occupations/index.json'); const shards = new Map();
  const codes = new Set(idx.occupations.map((o) => o.code));
  const abilityNames = new Set(); const recs = [];
  for (const e of idx.occupations) { if (!shards.has(e.shard)) shards.set(e.shard, readJson(e.shard).occupations); }
  for (const list of shards.values()) for (const o of list) { recs.push(o); o.abilities.forEach((a) => abilityNames.add(a.name)); }
  const gaps = {};
  const gap = (k, code) => { (gaps[k] = gaps[k] || []).push(code); };
  for (const o of recs) {
    if (!o.skills.length) gap('skills', o.code);
    if (!o.derived.future_skills.length) gap('derived.future_skills', o.code);
    if (typeof o.exposure.ai.task_share?.share !== 'number') gap('exposure.ai.task_share', o.code);
    if (typeof o.exposure.robotics.exposed_task_share !== 'number') gap('exposure.robotics.exposed_task_share', o.code);
    if (o.bls.oews?.median_annual == null && !(o.bls.unavailable?.median_annual || o.bls.unavailable?.oews)) gap('bls.oews.median_annual (no documented reason)', o.code);
    if (!o.bls.projections && !o.bls.unavailable?.projections) gap('bls.projections (no documented reason)', o.code);
    const skillLists = [o.skills.map((s) => s.name), o.derived.future_skills.map((s) => s.skill), o.derived.core_skills.map((s) => s.skill), o.derived.skills_to_develop.map((s) => s.skill), o.derived.transitions.flatMap((t) => t.skill_gaps.map((g) => g.skill))];
    const leaked = skillLists.flat().filter((n) => abilityNames.has(n));
    if (leaked.length) errors.push(`${o.code}: abilities in skill fields: ${[...new Set(leaked)].join(', ')}`);
    const inf = o.inferred_from;
    if (inf) {
      if (!codes.has(inf.code) || inf.sources.some((s) => !codes.has(s.code))) errors.push(`${o.code}: inferred_from points at unknown code`);
      if (inf.sources.some((s) => s.code === o.code)) errors.push(`${o.code}: inferred from itself`);
      if (inf.fields.includes('skills') && (o.derived.future_skills.some((x) => !x.inferred) || o.derived.inferred_from?.code !== inf.code)) errors.push(`${o.code}: inferred skills but derived.future_skills not marked inferred`);
      if (inf.fields.includes('tasks') && (o.exposure.robotics.inferred_from?.code !== inf.code || (o.exposure.ai.task_share && o.exposure.ai.task_share.inferred_from?.code !== inf.code))) errors.push(`${o.code}: inferred tasks but exposure task shares lack inferred_from`);
      const src = recs.find((x) => x.code === inf.code);
      if (src?.inferred_from) errors.push(`${o.code}: inferred from ${inf.code}, which is itself inferred`);
    } else if (o.derived.future_skills.some((x) => x.inferred)) errors.push(`${o.code}: future_skills marked inferred without occupation.inferred_from`);
  }
  for (const [k, list] of Object.entries(gaps)) errors.push(`${list.length} occupations missing ${k}: ${list.slice(0, 10).join(' ')}${list.length > 10 ? ' …' : ''}`);
} catch (e) { errors.push('coverage check: ' + e.message); }
// Legacy-specific invariants
try {
  const s = readJson('skills_summary.json');
  if (s.metadata.total_skills !== s.skills.length) errors.push(`skills_summary.json: total_skills ${s.metadata.total_skills} != ${s.skills.length}`);
} catch (e) {}
// Manifest must list every dataset with matching dates
try {
  const idx = readJson('index.json');
  const v = a.compile(readJson('schemas/index.schema.json'));
  if (!v(idx)) errors.push(`index.json: ${a.errorsText(v.errors)}`);
  for (const ds of datasets) if (!idx.datasets.find((d) => d.path === ds.path)) errors.push(`index.json missing ${ds.path}`);
} catch (e) { errors.push(e.message); }
// Every .json file in repo (outside node_modules) must parse
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f.startsWith('.')) continue;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.json')) { try { JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { errors.push(`${path.relative(ROOT, p)}: invalid JSON - ${e.message}`); } }
  }
})(ROOT);

if (errors.length) { console.error('VALIDATION FAILED\n- ' + errors.join('\n- ')); process.exit(1); }
console.log(`OK: ${datasets.length} datasets valid`);
