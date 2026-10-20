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
  const byCode = new Map(recs.map((o) => [o.code, o])); const pathPairs = [];
  let SR = null; try { SR = readJson('data/skills/skill_risk.json'); } catch (e) { errors.push(e.message); }
  const PW = SR?.parameters?.pathways || {};
  // skills_to_develop never repeats a skill the occupation already has strongly (future/core); deepen items need a real gap
  for (const o of recs) {
    const d = o.derived; const strong = new Set([...d.future_skills, ...d.core_skills].map((x) => x.skill));
    const dup = d.skills_to_develop.filter((x) => strong.has(x.skill)).map((x) => x.skill);
    if (dup.length) errors.push(`${o.code}: skills_to_develop repeats future/core skills: ${dup.join(', ')}`);
    const devNames = new Set(d.skills_to_develop.map((x) => x.skill));
    for (const x of d.skills_to_deepen || []) {
      if (devNames.has(x.skill)) errors.push(`${o.code}: ${x.skill} in both skills_to_develop and skills_to_deepen`);
      if (!x.targets.length || x.targets.some((t) => !(t.gap >= 0.5) || !codes.has(t.code))) errors.push(`${o.code}: skills_to_deepen ${x.skill} lacks a valid target gap`);
    }
    // Skill risk (scripts/skill-risk.js): every skill scored, safe/at-risk disjoint and skills only, pathways future-proof
    const sr = d.skill_risk || []; const srIds = new Set(sr.map((x) => x.id));
    const unscored = o.skills.filter((s) => !srIds.has(s.id)); if (unscored.length) errors.push(`${o.code}: skills without skill_risk: ${unscored.map((s) => s.name).join(', ')}`);
    if (sr.some((x) => [x.ai_risk, x.robotics_risk, x.combined].some((v) => typeof v !== 'number' || v < 0 || v > 1))) errors.push(`${o.code}: skill_risk value missing or outside 0..1`);
    const safeN = new Set((d.safe_skills || []).map((x) => x.skill)); const riskN = (d.at_risk_skills || []).map((x) => x.skill);
    if (riskN.some((n) => safeN.has(n))) errors.push(`${o.code}: skill in both safe_skills and at_risk_skills`);
    const leak2 = [...safeN, ...riskN, ...sr.map((x) => x.skill)].filter((n) => abilityNames.has(n) && !o.skills.some((s) => s.name === n)); if (leak2.length) errors.push(`${o.code}: abilities in skill_risk lists: ${leak2.join(', ')}`);
    const band = new Map(sr.map((x) => [x.skill, x])); const T = SR?.parameters?.bands;
    if (T) for (const n of safeN) if (!(band.get(n)?.combined < T.safe_below)) errors.push(`${o.code}: safe skill ${n} not below ${T.safe_below}`);
    if (T) for (const n of riskN) if (!(band.get(n)?.combined >= T.at_risk_from)) errors.push(`${o.code}: at-risk skill ${n} below ${T.at_risk_from}`);
    const E = d.skill_risk_summary?.occupation_combined;
    if (o.inferred_from?.fields.includes('tasks') && d.skill_risk_summary?.inferred_from?.code !== o.inferred_from.code) errors.push(`${o.code}: inferred tasks but skill_risk_summary lacks inferred_from`);
    let prevScore = Infinity;
    for (const p of d.future_proof_pathways || []) {
      const b = p.breakdown; const t = byCode.get(p.code);
      if (!t) { errors.push(`${o.code}: pathway to unknown ${p.code}`); continue; }
      if (p.code === o.code) errors.push(`${o.code}: pathway to itself`);
      if (!(b.target_combined_exposure <= E - PW.min_exposure_drop + 1e-9)) errors.push(`${o.code}: pathway ${p.code} exposure ${b.target_combined_exposure} not meaningfully below source ${E}`);
      if (Math.abs(b.target_combined_exposure - t.derived.skill_risk_summary.occupation_combined) > 1e-6) errors.push(`${o.code}: pathway ${p.code} exposure does not match target record`);
      const g = t.bls.projections?.change_percent; if (!(g >= 0) || g !== b.growth_percent) errors.push(`${o.code}: pathway ${p.code} growth ${g} negative/missing or mismatched`);
      if (!(b.safe_overlap >= PW.min_safe_overlap)) errors.push(`${o.code}: pathway ${p.code} safe_overlap ${b.safe_overlap} below ${PW.min_safe_overlap}`);
      const re = b.safe_overlap * b.exposure_factor * b.growth_factor * b.gap_factor * b.job_zone_factor * b.similarity_factor * b.onet_related_bonus;
      if (Math.abs(re - p.score) > 0.01) errors.push(`${o.code}: pathway ${p.code} score ${p.score} != product of breakdown ${re.toFixed(3)}`);
      if (p.score > prevScore + 1e-9) errors.push(`${o.code}: pathways not sorted by score`); prevScore = p.score;
      if (p.covered_safe_skills.some((c) => !band.has(c.skill) || band.get(c.skill).band === 'at_risk')) errors.push(`${o.code}: pathway ${p.code} credits an at-risk or unknown skill`);
      if (/rewarding|tailwind|shortlist/i.test(p.reason) || (g === 0 && /growth/.test(p.reason) && !/flat/.test(p.reason))) errors.push(`${o.code}: pathway ${p.code} reason wording`);
      pathPairs.push([p.score, b.safe_overlap, b.exposure_factor]);
    }
    // skill_risk_summary.occupation_combined of every target in the top list must be below the source; no pathways and no note = unexplained
    if (!(d.future_proof_pathways || []).length && !d.future_proof_note) errors.push(`${o.code}: no future_proof_pathways and no future_proof_note`);
    // shared SOC blocks must list this code and only codes that really share the SOC
    for (const k of ['oews', 'projections']) {
      const sh = o.bls[k]?.shared_soc; if (!sh) continue;
      if (!sh.codes.includes(o.code) || sh.codes.length < 2 || sh.codes.some((c) => c.slice(0, 7) !== o.code.slice(0, 7) && !c.startsWith(sh.soc))) errors.push(`${o.code}: bad bls.${k}.shared_soc`);
      if (o.bls[k].inferred_from) errors.push(`${o.code}: bls.${k} has both shared_soc and inferred_from`);
    }
    const w = o.bls.oews;
    if (w?.top_coded && (!w.top_coded_fields?.length || w.top_coded_fields.some((f) => w[f] != null) || typeof w.top_code_threshold?.annual !== 'number')) errors.push(`${o.code}: inconsistent top_coded wage block`);
  }
  // Safe overlap drives the ranking: across all stored pathways it must correlate with score more than the exposure factor does
  { const rank = (xs) => { const s = xs.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]); const r = new Array(xs.length); s.forEach(([, i], k) => { r[i] = k; }); return r; };
    const sp = (a, b) => { const ra = rank(a), rb = rank(b); const n = a.length; const m = (n - 1) / 2; let num = 0, da = 0, db = 0; for (let i = 0; i < n; i++) { num += (ra[i] - m) * (rb[i] - m); da += (ra[i] - m) ** 2; db += (rb[i] - m) ** 2; } return num / Math.sqrt(da * db); };
    if (pathPairs.length > 100) { const sc = pathPairs.map((x) => x[0]); const rOv = sp(sc, pathPairs.map((x) => x[1])), rEx = sp(sc, pathPairs.map((x) => x[2]));
      console.log(`Pathway ranking: Spearman(score, safe_overlap)=${rOv.toFixed(3)}, Spearman(score, 1-exposure)=${rEx.toFixed(3)} over ${pathPairs.length} pathways`);
      if (!(rOv > 0.3) || !(rOv > rEx)) errors.push(`safe_overlap does not drive pathway ranking (rho ${rOv.toFixed(3)} vs exposure ${rEx.toFixed(3)})`); } else errors.push('too few future_proof_pathways overall'); }
  // BLS wages must be exactly what the raw OEWS file publishes: a number only when the source cell is a number,
  // null when it is "*" (not available) or "#" (top-coded, then top_coded must be set). Needs .cache/oews.zip
  // (written by scripts/refresh.js); skipped with a notice when the cache is absent.
  const oewsZip = path.join(ROOT, '.cache', 'oews.zip');
  if (fs.existsSync(oewsZip)) {
    const AdmZip = require('adm-zip'); const XLSX = require('xlsx');
    const ent = new AdmZip(oewsZip).getEntries().find((e) => /national_M\d{4}_dl\.xlsx$/.test(e.entryName));
    const wb = XLSX.read(ent.getData()); const src = new Map(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null }).map((r) => [r.OCC_CODE, r]));
    const COLS = { median_annual: 'A_MEDIAN', mean_annual: 'A_MEAN', median_hourly: 'H_MEDIAN', annual_p10: 'A_PCT10', annual_p90: 'A_PCT90' };
    let checked = 0;
    for (const o of recs) {
      const w = o.bls.oews; if (!w) continue;
      const r = src.get(w.soc); if (!r) { errors.push(`${o.code}: bls.oews.soc ${w.soc} not in OEWS source`); continue; }
      for (const [f, c] of Object.entries(COLS)) {
        const raw = r[c]; const want = typeof raw === 'number' ? raw : null;
        if (w[f] !== want) errors.push(`${o.code}: bls.oews.${f}=${w[f]} but OEWS source ${c} for ${w.soc} is ${JSON.stringify(raw)}`);
        if (raw === '#' && !w.top_coded_fields?.includes(f)) errors.push(`${o.code}: OEWS ${c} is top-coded (#) but ${f} not marked top_coded`);
      }
      checked++;
    }
    console.log(`OEWS source check: ${checked} wage blocks checked against ${ent.entryName}`);
  } else console.log('OEWS source check skipped: .cache/oews.zip not present (run scripts/refresh.js first)');
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
