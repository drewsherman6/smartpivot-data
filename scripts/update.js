#!/usr/bin/env node
/**
 * Merge-not-overwrite updater.
 * Usage: node scripts/update.js <patch.json> [--dry-run]
 * Patch format: { "dataset": "headline_stats", "upsert": [ {record with id...} ], "deprecate": ["id", ...], "note": "why" }
 *  - upsert: new ids are added; existing ids are replaced only if content differs (retrieved_at alone does not count).
 *  - deprecate: never deletes; sets status "deprecated" (platforms) or adds deprecated:true.
 *  - Dataset "updated" date only changes if something actually changed.
 *  - Every change is appended to data/history/changes.jsonl and CHANGELOG.md.
 *  - Writes are validated against the schema before being committed to disk. NO git operations here:
 *    publishing is done by the operator (git commit / push / PR).
 */
const fs = require('fs');
const path = require('path');
const { ROOT, readJson, writeJsonValidated, today } = require('./lib');
const datasets = require('./datasets');

const [patchPath, flag] = process.argv.slice(2);
if (!patchPath) { console.error('usage: node scripts/update.js <patch.json> [--dry-run]'); process.exit(2); }
const patch = JSON.parse(fs.readFileSync(path.resolve(patchPath), 'utf8'));
const ds = datasets.find((d) => d.name === patch.dataset && !d.legacy);
if (!ds) { console.error(`unknown or legacy dataset: ${patch.dataset} (legacy files are edited by hand + validated)`); process.exit(2); }

const data = readJson(ds.path);
const list = data[ds.key];
const strip = (r) => { const { retrieved_at, ...rest } = r; return JSON.stringify(rest); };
const changes = [];
for (const rec of patch.upsert || []) {
  if (!rec.id) throw new Error('upsert record missing id');
  const i = list.findIndex((r) => r.id === rec.id);
  if (i === -1) { list.push(rec); changes.push({ op: 'add', id: rec.id }); }
  else if (strip(list[i]) !== strip(rec)) { changes.push({ op: 'update', id: rec.id, before: list[i] }); list[i] = rec; }
}
for (const id of patch.deprecate || []) {
  const r = list.find((x) => x.id === id);
  if (!r) continue;
  if ('status' in r) { if (r.status !== 'deprecated') { r.status = 'deprecated'; changes.push({ op: 'deprecate', id }); } }
  else if (!r.deprecated) { r.deprecated = true; changes.push({ op: 'deprecate', id }); }
}
if (!changes.length) { console.log('No changes; dataset and dates untouched.'); process.exit(0); }
data.updated = today();
if (flag === '--dry-run') { console.log(JSON.stringify(changes.map(({ before, ...c }) => c), null, 1)); process.exit(0); }
writeJsonValidated(ds.path, data, ds.schema);
const hist = path.join(ROOT, 'data/history/changes.jsonl');
for (const c of changes) fs.appendFileSync(hist, JSON.stringify({ date: today(), dataset: ds.name, note: patch.note || '', ...c }) + '\n');
const cl = path.join(ROOT, 'CHANGELOG.md');
const lines = changes.map((c) => `- ${ds.name}: ${c.op} \`${c.id}\``).join('\n');
fs.appendFileSync(cl, `\n## ${today()} - ${ds.name}\n${patch.note ? patch.note + '\n' : ''}${lines}\n`);
require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'build-manifest.js')], { stdio: 'inherit' });
console.log(`${changes.length} change(s) applied to ${ds.path}. Now run: npm test, then commit and push.`);
