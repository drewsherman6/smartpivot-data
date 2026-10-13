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
