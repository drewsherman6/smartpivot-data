#!/usr/bin/env node
/**
 * Loads data/multisource into Supabase (sp.ms_* tables; migration in smartpivot-app
 * supabase/migrations/20261021100000_multisource.sql) through the Management API SQL endpoint.
 * Needs SUPABASE_ACCESS_TOKEN (never printed). Skips quietly when it is not set. Full replace per run, in batches.
 * Usage: node scripts/multisource-sync.js [--dry-run]
 */
const fs = require('fs'); const path = require('path'); const { ROOT, readJson } = require('./lib');
const PROJECT = process.env.SUPABASE_PROJECT || 'yhlkfgokukhpjtlicvtk';
const q = (v) => (v == null ? 'null' : typeof v === 'number' ? String(v) : typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
async function sql(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${PROJECT}/database/query`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
  const t = await r.text(); if (!r.ok) throw new Error(`supabase ${r.status}: ${t.slice(0, 300)}`); return JSON.parse(t || '[]');
}
async function run({ dryRun = process.argv.includes('--dry-run') } = {}) {
  if (!process.env.SUPABASE_ACCESS_TOKEN && !dryRun) { console.log('multisource-sync: SUPABASE_ACCESS_TOKEN not set; skipped'); return; }
  const idx = readJson('data/multisource/index.json');
  const valid = dryRun ? null : new Set((await sql('select code from sp.occupations')).map((r) => r.code));
  const ins = { src: [], xw: [], st: [], ss: [], ex: [], bl: [] };
  for (const [id, s] of Object.entries(idx.sources)) ins.src.push(`(${[id, s.name, s.url, s.page, s.license, s.version || null, s.retrieved_at || null].map(q).join(',')})`);
  let skipped = 0;
  for (const e of idx.occupations) {
    if (valid && !valid.has(e.code)) { skipped++; continue; }
    const o = readJson(e.file); const c = o.code; const X = o.crosswalk;
    for (const m of X.esco) ins.xw.push(`(${[c, 'esco', m.uri, m.title, m.match, m.weight].map(q).join(',')})`);
    for (const s of X.soc2010) ins.xw.push(`(${[c, 'soc2010', s, null, 'bls_2010_2018', null].map(q).join(',')})`);
    for (const s of X.isco08) ins.xw.push(`(${[c, 'isco08', s, null, X.isco_basis, r3(1 / X.isco08.length)].map(q).join(',')})`);
    for (const s of X.noc2021) ins.xw.push(`(${[c, 'noc2021', s, null, 'statcan_concordance', r3(1 / X.noc2021.length)].map(q).join(',')})`);
    for (const s of X.nice_work_roles) ins.xw.push(`(${[c, 'nice', s, null, 'curated_title', 0.5].map(q).join(',')})`);
    o.statements.forEach((s, i) => {
      ins.st.push(`(${[s.id, c, i + 1, s.text, s.kind, s.esco_uri, s.weight, s.n_sources].map(q).join(',')})`);
      const seen = new Set();
      for (const z of s.sources) { const k = z.source + '|' + z.ref; if (seen.has(k)) continue; seen.add(k); ins.ss.push(`(${[s.id, z.source, z.ref, z.via, z.match, z.w, z.essential ?? null].map(q).join(',')})`); }
      if (s.ai) ins.ex.push(`(${[s.id, 'ai', s.ai.pct, s.ai.anthropic_penetration ?? null, s.ai.ilo_2025 ?? null, null, s.ai.basis, s.ai.from || null, s.ai.similarity ?? null].map(q).join(',')})`);
      if (s.robotics) ins.ex.push(`(${[s.id, 'robotics', r3(s.robotics.score), null, null, s.robotics.tier, s.robotics.basis, s.robotics.from || null, s.robotics.similarity ?? null].map(q).join(',')})`);
    });
    const b = o.blend; ins.bl.push(`(${[c, o.summary.statements, b.ai_pct, b.ai_sources, b.robotics, b.robotics_sources, b.current_ai_composite, b.current_robot_index].map(q).join(',')},${q(JSON.stringify(o.summary.by_source))}::jsonb,false,${q(idx.generated)},${q(JSON.stringify({ ai: b.ai, robotics: b.robotics_detail, inferred_from: b.inferred_from }))}::jsonb)`);
  }
  const T = { src: 'sp.ms_source (id,name,url,page,license,version,retrieved_at)', xw: 'sp.ms_occupation_crosswalk (occupation_code,system,target_code,target_title,match,weight)', st: 'sp.ms_statement (id,occupation_code,ord,text,kind,esco_uri,weight,n_sources)', ss: 'sp.ms_statement_source (statement_id,source_id,ref,via,match,weight,essential)', ex: 'sp.ms_statement_exposure (statement_id,dimension,value,anthropic_penetration,ilo_2025,tier,basis,donor_text,similarity)', bl: 'sp.ms_occupation_blend (occupation_code,statements,ai_pct,ai_sources,robotics,robotics_sources,current_ai_composite,current_robot_index,by_source,is_primary,generated,measures)' };
  console.log('multisource-sync rows:', Object.fromEntries(Object.entries(ins).map(([k, v]) => [k, v.length])), skipped ? `skipped ${skipped} codes not in sp.occupations` : '');
  if (dryRun) return;
  await sql('truncate sp.ms_statement_exposure, sp.ms_statement_source, sp.ms_statement, sp.ms_occupation_crosswalk, sp.ms_occupation_blend, sp.ms_source');
  for (const k of ['src', 'xw', 'st', 'ss', 'ex', 'bl']) {
    let batch = [], size = 0;
    const flush = async () => { if (batch.length) await sql(`insert into ${T[k]} values ${batch.join(',')}`); batch = []; size = 0; };
    for (const row of ins[k]) { batch.push(row); size += row.length; if (size > 1_500_000) await flush(); }
    await flush();
  }
  const [n] = await sql('select (select count(*) from sp.ms_statement) st, (select count(*) from sp.ms_statement_source) ss, (select count(*) from sp.ms_statement_exposure) ex, (select count(*) from sp.ms_occupation_blend) bl');
  console.log('multisource-sync loaded:', JSON.stringify(n));
}
const r3 = (x) => Math.round(x * 1000) / 1000;
module.exports = { run };
if (require.main === module) run().catch((e) => { console.error(e.message); process.exit(1); });
