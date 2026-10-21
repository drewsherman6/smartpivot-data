#!/usr/bin/env node
/**
 * Multi-source work-statement layer (additive; legacy shapes untouched).
 * For every O*NET-SOC occupation, merges work statements from:
 *   onet  - O*NET 31.0 tasks already in data/occupations/<g>.json (with Anthropic AI penetration + robot tier)
 *   esco  - ESCO v1.2.x essential/optional skills & knowledge, via the official ESCO-O*NET crosswalk (EC + US DOL, 2022)
 *   ilo   - ISCO-08 task statements with ILO WP140 (2025) GenAI task scores, via BLS ISCO-08<->SOC 2010 + SOC 2010->2018
 *   oasis - Canada OaSIS 2025 main duties, via StatCan NOC 2016 v1.3->SOC 2018 + NOC 2016->NOC 2021
 *   nice  - NIST NICE Framework v2.x work-role tasks, via a curated title mapping (flagged; no official SOC crosswalk)
 * Dedupe: ESCO skill URI identity, then normalized lexical token-set Jaccard >= DEDUPE_J within an occupation.
 * Exposure: only published scores. Direct = O*NET task (Anthropic penetration / robot tier) or ILO task score.
 *   Other statements inherit the score of their most lexically similar directly-scored statement in the same
 *   occupation (Jaccard >= TRANSFER_J), recorded as basis "transferred" with the donor id and similarity; else null.
 * Calibration: each direct source is mapped to its own percentile rank (mid-rank over all its statements), so ILO 0-1
 *   scores and Anthropic penetration are on one scale (same approach as the existing composite).
 * Blend: per source, weighted mean of statement percentiles; occupation blend = mean over sources with any score.
 * Outputs: data/multisource/occ/<code>.json (one per occupation), data/multisource/index.json, docs/BLEND_COMPARISON.md
 */
const fs = require('fs'); const path = require('path');
const XLSX = require('xlsx'); const { parse } = require('csv-parse/sync');
const { ROOT, today } = require('./lib');
const UA = 'smartpivot-data/2.0 (drewsherman6@gmail.com)';
const CACHE = path.join(ROOT, '.cache/multisource');
const DEDUPE_J = 0.6, TRANSFER_J = 0.34;
const OASIS = 'https://open.canada.ca/data/dataset/10ce43bd-fb58-4969-806b-4bffebc87bec/resource/';
const SRC = {
  esco_onet: { name: 'ESCO-O*NET Crosswalk (Occupations), EC ESCO Secretariat + US DOL/ETA, v1 Sep-2022', url: 'https://esco.ec.europa.eu/system/files/2023-08/ONET_%28Occupations%29_0_updated.csv', page: 'https://esco.ec.europa.eu/en/use-esco/other-crosswalks', license: 'EC reuse (Decision 2011/833/EU), commercial use allowed with attribution', file: 'esco_onet.csv' },
  esco_api: { name: 'ESCO API (occupation skill links)', url: 'https://ec.europa.eu/esco/api/resource/occupation', page: 'https://esco.ec.europa.eu/en/use-esco/use-esco-services-api', license: 'EC reuse (Decision 2011/833/EU)' },
  isco_soc: { name: 'BLS ISCO-08 to 2010 SOC crosswalk (June 2015)', url: 'https://www.bls.gov/soc/ISCO_SOC_Crosswalk.xls', page: 'https://www.bls.gov/soc/soccrosswalks.htm', license: 'US public domain', file: 'isco_soc.xls' },
  soc10_18: { name: 'BLS 2010 SOC to 2018 SOC crosswalk', url: 'https://www.bls.gov/soc/2018/soc_2010_to_2018_crosswalk.xlsx', page: 'https://www.bls.gov/soc/2018/crosswalks_used_by_agencies.htm', license: 'US public domain', file: 'soc10_18.xlsx' },
  ilo: { name: 'ILO WP140 Gmyrek et al. (2025) GenAI task scores, ISCO-08', url: 'https://raw.githubusercontent.com/pgmyrek/2025_GenAI_scores_ISCO08/main/Final_Scores_ISCO08_Gmyrek_et_al_2025.xlsx', page: 'https://doi.org/10.54394/HETP0387', license: 'CC BY 4.0 (ILO); adaptation disclaimer required', file: 'ilo2025.xlsx' },
  noc_soc: { name: 'StatCan NOC 2016 V1.3 to SOC 2018 (US) correspondence', url: 'https://www.statcan.gc.ca/en/statistical-programs/document/noc2016v1_3-soc2018us-eng.csv', page: 'https://www.statcan.gc.ca/en/statistical-programs/document/noc2016v1_3-soc2018US', license: 'Statistics Canada Open Licence', file: 'noc16_soc18.csv' },
  noc16_21: { name: 'StatCan NOC 2016 V1.3 to NOC 2021 V1.0 correspondence', url: 'https://www.statcan.gc.ca/en/statistical-programs/document/noc2016v1_3-noc2021v1_0-eng.csv', page: 'https://www.statcan.gc.ca/en/statistical-programs/document/noc2016v1_3-noc2021v1_0', license: 'Statistics Canada Open Licence', file: 'noc16_21.csv' },
  oasis: { name: 'ESDC OaSIS 2025 v1.0 Main Duties (NOC 2021)', url: OASIS + '92e4107e-a804-4126-85ec-1fca23b82d81/download/main-duties_oasis-2025_v1.1.csv', page: 'https://open.canada.ca/data/en/dataset/10ce43bd-fb58-4969-806b-4bffebc87bec', license: 'Open Government Licence - Canada', file: 'oasis_duties.csv' },
  oasis_labels: { name: 'ESDC OaSIS 2025 v1.0 Labels', url: OASIS + 'af53ca1d-5efc-4e52-ad42-9b858a4507c6/download/labels_oasis_2025_v1.1.csv', page: 'https://open.canada.ca/data/en/dataset/10ce43bd-fb58-4969-806b-4bffebc87bec', license: 'Open Government Licence - Canada', file: 'oasis_labels.csv' },
  nice: { name: 'NIST NICE Framework Components v2.2.0 (SP 800-181r1)', url: 'https://csrc.nist.gov/csrc/media/Projects/cprt/documents/nice/v2-2-0_nf_components.json', page: 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/nice-framework-current-versions', license: 'US public domain (NIST)', file: 'nice.json' },
};
// Curated NICE work role -> O*NET-SOC (no official crosswalk exists; title/definition match, weight 0.5, flagged)
const NICE_MAP = {
  '15-1212.00': ['PD-WRL-001', 'PD-WRL-003', 'PD-WRL-006', 'IO-WRL-006', 'OG-WRL-012'],
  '15-1299.04': ['PD-WRL-007'], '15-1299.05': ['DD-WRL-001', 'DD-WRL-004'], '15-1299.06': ['PD-WRL-002', 'IN-WRL-002'],
  '15-1244.00': ['IO-WRL-005', 'IO-WRL-004'], '15-1242.00': ['IO-WRL-002'], '15-1241.00': ['DD-WRL-001'],
  '15-1299.08': ['DD-WRL-004', 'DD-WRL-002'], '15-1253.00': ['DD-WRL-007', 'DD-WRL-005'], '15-1252.00': ['DD-WRL-003'],
  '11-3021.00': ['OG-WRL-014', 'OG-WRL-007'], '15-1232.00': ['IO-WRL-007'], '15-1231.00': ['IO-WRL-004'],
};
const MATCH_W = { exactMatch: 1, closeMatch: 0.8, narrowMatch: 0.6, broadMatch: 0.5 }; // relatedMatch excluded (not DOL-validated)
const MISSING = []; // crosswalk ESCO concepts (built on v1.1.0) that the current ESCO release no longer has
const r3 = (x) => (x == null ? null : Math.round(x * 1000) / 1000);

async function fetchTo(file, url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, From: 'drewsherman6@gmail.com' } });
  if (!res.ok) throw new Error(`multisource: ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000 || /Access Denied/.test(buf.slice(0, 2000).toString())) throw new Error('multisource: blocked ' + url);
  fs.writeFileSync(path.join(CACHE, file), buf);
}
async function download(offline) {
  fs.mkdirSync(path.join(CACHE, 'esco'), { recursive: true });
  for (const s of Object.values(SRC)) if (s.file) {
    const dest = path.join(CACHE, s.file);
    if (!offline) { try { await fetchTo(s.file, s.url); } catch (e) { if (!fs.existsSync(dest)) throw e; console.warn(e.message, '(using cache)'); } }
    s.retrieved_at = fs.statSync(dest).mtime.toLocaleDateString('en-CA');
  }
}
async function escoVersion() {
  try { const t = await (await fetch('https://esco.ec.europa.eu/en/use-esco/download', { headers: { 'User-Agent': UA } })).text(); return (t.match(/Current version:\s*ESCO (v[\d.]+)/) || [])[1] || null; } catch { return null; }
}
async function escoOccupations(uris, offline) {
  const dir = path.join(CACHE, 'esco'); const verFile = path.join(dir, 'VERSION');
  const ver = offline ? null : await escoVersion(); const prev = fs.existsSync(verFile) ? fs.readFileSync(verFile, 'utf8').trim() : null;
  const stale = ver && prev && ver !== prev; // new ESCO release -> refetch everything
  const todo = uris.filter((u) => stale || !fs.existsSync(path.join(dir, u.split('/').pop() + '.json')));
  if (todo.length && !offline) {
    console.log(`multisource: fetching ${todo.length} ESCO occupations (${ver || '?'})`);
    let i = 0; const worker = async () => { while (i < todo.length) { const u = todo[i++]; for (let t = 0; t < 4; t++) { try {
      const r = await fetch(`${SRC.esco_api.url}?uri=${encodeURIComponent(u)}&language=en`, { headers: { 'User-Agent': UA } }); if (r.status === 404) { fs.writeFileSync(path.join(dir, u.split('/').pop() + '.json'), JSON.stringify({ uri: u, missing: true })); break; } if (!r.ok) throw new Error(r.status);
      const o = await r.json(); const L = o._links || {}; const pick = (a) => (a || []).map((x) => ({ uri: x.uri, title: x.title, skillType: x.skillType }));
      fs.writeFileSync(path.join(dir, u.split('/').pop() + '.json'), JSON.stringify({ uri: u, title: o.title, code: o.code, status: o.status, isco: (L.broaderIscoGroup || []).map((x) => x.code), essential: pick(L.hasEssentialSkill), optional: pick(L.hasOptionalSkill) })); break;
    } catch { await new Promise((z) => setTimeout(z, 1000 * (t + 1))); } } } };
    await Promise.all(Array.from({ length: 8 }, worker));
  }
  if (ver) fs.writeFileSync(verFile, ver);
  SRC.esco_api.version = ver || prev; SRC.esco_api.retrieved_at = today();
  const m = new Map(); for (const u of uris) { const f = path.join(dir, u.split('/').pop() + '.json'); if (fs.existsSync(f)) { const d = JSON.parse(fs.readFileSync(f, 'utf8')); if (!d.missing) m.set(u, d); else MISSING.push(u); } }
  return m;
}

// ---------- text normalization ----------
const STOP = new Set('a an and or the of to in on for with by from as at into via using use their its it be is are other others such etc including include may e.g eg i.e ie all any each this that these those who which when where about'.split(' '));
const stem = (w) => w.replace(/(ies)$/, 'y').replace(/(ing|ed|es|s)$/, (m, _p, off) => (off > 3 ? '' : m));
const toks = (t) => new Set(String(t).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)).map(stem).filter((w) => w.length > 1));
const jac = (a, b) => { if (!a.size || !b.size) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n); };
const norm = (t) => [...toks(t)].sort().join(' ');
// Second-pass duplicate test (audit 2026-10-21 #6): symmetric stem so "-ing"/"-e"/plural forms collapse
// ("Preparing estimates" = "Prepare estimate"); "may" dropped (OaSIS phrasing).
const STOP2 = new Set([...STOP, 'may']);
const stem2 = (w) => { w = w.replace(/ies$/, 'y'); for (let i = 0; i < 2; i++) w = w.replace(/(ing|ed|es|s|e)$/, (m, _p, off) => (off > 3 ? '' : m)); return w; };
const toks2 = (t) => new Set(String(t).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w && !STOP2.has(w)).map(stem2).filter((w) => w.length > 1));
const DUP2_J = 0.75, DUP2_MAXDIFF = 2;
// True duplicate: different official sources (two rows of one source are distinct by definition), not two distinct ESCO
// skills, both non-knowledge, stem2-Jaccard >= 0.75 and at most 2 tokens differ. Merged into the best (highest-J) match.
function dupScore(a, b) {
  if (a.kind === 'knowledge' || b.kind === 'knowledge') return 0;
  if (a.esco_uri && b.esco_uri && a.esco_uri !== b.esco_uri) return 0;
  const sa = new Set(a.sources.map((z) => z.source)), sb = new Set(b.sources.map((z) => z.source));
  for (const x of sa) if (sb.has(x)) return 0;
  const A = a.tok2 || (a.tok2 = toks2(a.text)), B = b.tok2 || (b.tok2 = toks2(b.text));
  let n = 0; for (const x of A) if (B.has(x)) n++; const u = A.size + B.size - n; if (!u) return 0;
  return (u - n) <= DUP2_MAXDIFF && n / u >= DUP2_J ? n / u : 0;
}

function readCsv(f, opts = {}) { return parse(fs.readFileSync(path.join(CACHE, f), 'utf8').replace(/^\uFEFF/, ''), { relax_quotes: true, relax_column_count: true, skip_empty_lines: true, ...opts }); }
function sheetRows(f, name) { const wb = XLSX.readFile(path.join(CACHE, f)); return XLSX.utils.sheet_to_json(wb.Sheets[name || wb.SheetNames[0]], { header: 1, defval: null }); }

function crosswalks() {
  // ESCO <-> O*NET
  const rows = readCsv(SRC.esco_onet.file); const h = rows.findIndex((r) => r[0] === 'O*NET Id');
  const escoByOnet = new Map(); const exactIsco = new Map(); let excluded = 0;
  for (const r of rows.slice(h + 1)) { if (r[6] === 'exactISCO' && /\/isco\/C(\d{4})/.test(r[3] || '')) { (exactIsco.get(r[0]) || exactIsco.set(r[0], new Set()).get(r[0])).add(r[3].match(/C(\d{4})/)[1]); continue; } const w = MATCH_W[r[6]]; if (!r[3] || !/\/occupation\//.test(r[3])) continue; if (!w) { excluded++; continue; } (escoByOnet.get(r[0]) || escoByOnet.set(r[0], []).get(r[0])).push({ uri: r[3], title: r[4], match: r[6], w }); }
  // SOC 2018 -> SOC 2010
  const s1018 = sheetRows(SRC.soc10_18.file); const soc18to10 = new Map();
  for (const r of s1018) if (/^\d{2}-\d{4}$/.test(String(r[0]).trim()) && /^\d{2}-\d{4}$/.test(String(r[2]).trim())) { const k = String(r[2]).trim(); (soc18to10.get(k) || soc18to10.set(k, new Set()).get(k)).add(String(r[0]).trim()); }
  // SOC 2010 -> ISCO
  const wb = XLSX.readFile(path.join(CACHE, SRC.isco_soc.file)); const sn = wb.SheetNames.find((n) => /SOC to ISCO/i.test(n));
  const soc10toIsco = new Map();
  for (const r of XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: null })) { const s = String(r[0] || '').trim(), i = String(r[3] || '').trim(); if (/^\d{2}-\d{4}$/.test(s) && /^\d{4}$/.test(i)) (soc10toIsco.get(s) || soc10toIsco.set(s, new Set()).get(s)).add(i); }
  // SOC 2018 -> NOC 2016 -> NOC 2021
  const soc18toNoc16 = new Map();
  for (const r of readCsv(SRC.noc_soc.file, { from_line: 2 })) { const n = String(r[0]).trim(), s = String(r[3]).trim(); if (/^\d{4}$/.test(n) && /^\d{2}-\d{4}$/.test(s)) (soc18toNoc16.get(s) || soc18toNoc16.set(s, new Set()).get(s)).add(n); }
  const noc16to21 = new Map();
  for (const r of readCsv(SRC.noc16_21.file, { from_line: 2 })) { const a = String(r[0]).trim(), b = String(r[3]).trim(); if (/^\d{4}$/.test(a) && /^\d{5}$/.test(b)) (noc16to21.get(a) || noc16to21.set(a, new Set()).get(a)).add(b); }
  return { escoByOnet, exactIsco, excluded, soc18to10, soc10toIsco, soc18toNoc16, noc16to21 };
}

async function run(opts = {}) {
  const offline = opts.offline ?? process.argv.includes('--offline');
  await download(offline);
  const X = crosswalks();
  const escoUris = [...new Set([...X.escoByOnet.values()].flat().map((x) => x.uri))];
  const esco = await escoOccupations(escoUris, offline);
  // ILO tasks by ISCO
  const iloRows = sheetRows(SRC.ilo.file); const ih = iloRows[0]; const col = (n) => ih.indexOf(n);
  const iloByIsco = new Map();
  for (const r of iloRows.slice(1)) { const isco = String(r[col('ISCO_08')]).padStart(4, '0'); const s = r[col('score_2025')]; if (s == null) continue; (iloByIsco.get(isco) || iloByIsco.set(isco, []).get(isco)).push({ id: `${isco}-${r[col('taskID')]}`, text: String(r[col('Task_ISCO')]).replace(/;\s*$/, ''), score: Number(s) }); }
  // OaSIS duties by NOC 2021 unit
  const duties = new Map();
  for (const r of readCsv(SRC.oasis.file, { delimiter: ';', from_line: 2 })) { const noc = String(r[0]).slice(0, 5); (duties.get(noc) || duties.set(noc, []).get(noc)).push({ profile: r[0], text: String(r[1]).trim() }); }
  // NICE
  const nice = JSON.parse(fs.readFileSync(path.join(CACHE, SRC.nice.file), 'utf8'));
  const el = new Map(nice.elements.map((e) => [e.element_identifier, e]));
  const niceTasks = new Map();
  for (const rel of nice.relationships) { const d = el.get(rel.dest_element_identifier); if (d?.element_type === 'task' && /WRL/.test(rel.source_element_identifier)) (niceTasks.get(rel.source_element_identifier) || niceTasks.set(rel.source_element_identifier, []).get(rel.source_element_identifier)).push(d); }
  SRC.nice.version = nice.documents?.[0]?.version;

  // ---------- per occupation ----------
  const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/occupations/index.json'), 'utf8')).occupations;
  const shards = new Map();
  for (const g of [...new Set(idx.map((o) => o.shard))]) for (const o of JSON.parse(fs.readFileSync(path.join(ROOT, g), 'utf8')).occupations) shards.set(o.code, o);
  const occs = [];
  for (const ix of idx) {
    const o = shards.get(ix.code); const soc18 = o.code.slice(0, 7);
    const st = []; // raw statements before dedupe
    const maxTime = Math.max(0, ...o.tasks.map((t) => t.time_share || 0));
    for (const t of o.tasks) st.push({ text: t.text, kind: 'task', src: { source: 'onet', ref: t.id, via: o.code, match: 'native', w: maxTime ? Math.max(t.time_share || 0, 0.001) / maxTime : 1 }, ai_direct: t.ai_task_penetration ?? null, rob_direct: t.robot_tier ? Number(String(t.robot_tier).slice(1)) / 3 : (t.robot_tier === null && t.time_share != null ? null : null), tier: t.robot_tier });
    // ESCO
    const escoOccs = (X.escoByOnet.get(o.code) || []).filter((m) => esco.has(m.uri));
    const escoIsco = new Set();
    for (const m of escoOccs) { const e = esco.get(m.uri); e.isco.forEach((c) => escoIsco.add(String(c).slice(0, 4)));
      for (const [lst, ew] of [[e.essential, 1], [e.optional, 0.5]]) for (const s of lst) st.push({ text: s.title, kind: /knowledge/.test(s.skillType || '') ? 'knowledge' : 'skill', esco_uri: s.uri, src: { source: 'esco', ref: s.uri, via: m.uri, match: m.match, essential: ew === 1, w: m.w * ew } }); }
    // ILO via ISCO
    const soc10 = X.soc18to10.get(soc18) || new Set([soc18]);
    let isco = new Set([...soc10].flatMap((s) => [...(X.soc10toIsco.get(s) || [])]));
    const inter = [...isco].filter((c) => escoIsco.has(c)); let iscoBasis = inter.length ? 'bls_crosswalk∩esco_isco' : 'bls_crosswalk';
    if (inter.length) isco = new Set(inter);
    if (X.exactIsco.has(o.code)) { isco = X.exactIsco.get(o.code); iscoBasis = 'esco_onet_exactISCO'; }
    for (const c of isco) for (const t of iloByIsco.get(c) || []) st.push({ text: t.text, kind: 'task', src: { source: 'ilo', ref: t.id, via: c, match: iscoBasis, w: 1 / isco.size }, ai_direct_ilo: t.score });
    // OaSIS via NOC
    const noc21 = new Set([...(X.soc18toNoc16.get(soc18) || [])].flatMap((n) => [...(X.noc16to21.get(n) || [])]));
    for (const n of noc21) for (const d of duties.get(n) || []) st.push({ text: d.text, kind: 'duty', src: { source: 'oasis', ref: d.profile, via: n, match: 'statcan_concordance', w: 1 / noc21.size } });
    // NICE
    for (const wr of NICE_MAP[o.code] || []) for (const t of niceTasks.get(wr) || []) st.push({ text: t.text, kind: 'task', src: { source: 'nice', ref: t.element_identifier, via: wr, via_title: el.get(wr)?.title, match: 'curated_title', w: 0.5 } });
    // ---- dedupe: ESCO URI, exact normalized text, then Jaccard within occupation ----
    const merged = [];
    const byKey = new Map();
    for (const s of st) {
      s.tok = toks(s.text); const key = s.esco_uri || norm(s.text);
      let m = byKey.get(key);
      if (!m) m = merged.find((x) => x.kind !== 'knowledge' && s.kind !== 'knowledge' && jac(x.tok, s.tok) >= DEDUPE_J);
      if (m) { if (!m.sources.some((z) => z.source === s.src.source && z.ref === s.src.ref)) m.sources.push(s.src); else { const z = m.sources.find((q) => q.source === s.src.source && q.ref === s.src.ref); z.w = Math.max(z.w, s.src.w); }
        if (s.ai_direct != null && m.ai_onet == null) m.ai_onet = s.ai_direct; if (s.ai_direct_ilo != null) m.ai_ilo = Math.max(m.ai_ilo ?? 0, s.ai_direct_ilo); if (s.tier && !m.tier) m.tier = s.tier; continue; }
      m = { text: s.text, kind: s.kind, tok: s.tok, esco_uri: s.esco_uri || null, sources: [s.src], ai_onet: s.ai_direct ?? null, ai_ilo: s.ai_direct_ilo ?? null, tier: s.tier || null, onet_task: s.src.source === 'onet' };
      merged.push(m); byKey.set(key, m);
    }
    // second pass: fold remaining true duplicates into their best match (earlier statement kept as the text)
    for (let i = merged.length - 1; i > 0; i--) {
      let bj = -1, bs = 0; for (let j = 0; j < i; j++) { const v = dupScore(merged[j], merged[i]); if (v > bs) { bs = v; bj = j; } }
      if (bj < 0) continue; const m = merged[bj], s = merged[i];
      for (const z of s.sources) if (!m.sources.some((q) => q.source === z.source && q.ref === z.ref)) m.sources.push(z);
      if (m.ai_onet == null) m.ai_onet = s.ai_onet; if (s.ai_ilo != null) m.ai_ilo = Math.max(m.ai_ilo ?? 0, s.ai_ilo); if (!m.tier) m.tier = s.tier; if (!m.esco_uri) m.esco_uri = s.esco_uri; m.onet_task = m.onet_task || s.onet_task;
      m.tok2 = null; merged.splice(i, 1);
    }
    occs.push({ o, merged, isco: [...isco], iscoBasis, noc21: [...noc21], escoOccs, soc10: [...soc10] });
  }
  // ---------- calibration: percentiles per direct source ----------
  const all = occs.flatMap((x) => x.merged);
  const pctOf = (vals) => { const s = vals.slice().sort((a, b) => a - b); return (v) => { let lo = 0, hi = s.length; while (lo < hi) { const m = (lo + hi) >> 1; if (s[m] < v) lo = m + 1; else hi = m; } return lo / s.length; }; }; // share of the source's statements scoring strictly lower (zero -> 0)
  const pOnet = pctOf(all.filter((m) => m.ai_onet != null).map((m) => m.ai_onet));
  const pIlo = pctOf(all.filter((m) => m.ai_ilo != null).map((m) => m.ai_ilo));
  const SOURCES = ['onet', 'esco', 'ilo', 'oasis', 'nice'];
  const out = []; const cov = Object.fromEntries(SOURCES.map((s) => [s, 0]));
  for (const { o, merged, isco, iscoBasis, noc21, escoOccs, soc10 } of occs) {
    const donorsAi = merged.filter((m) => m.ai_onet != null || m.ai_ilo != null); const donorsRob = merged.filter((m) => m.onet_task && m.tier);
    const onetRated = merged.filter((m) => m.onet_task && (m.tier || o.tasks.find((t) => t.text === m.text)?.time_share != null));
    let id = 0;
    const stmts = merged.map((m) => {
      let ai = null;
      if (m.ai_onet != null || m.ai_ilo != null) { const ps = [m.ai_onet != null ? pOnet(m.ai_onet) : null, m.ai_ilo != null ? pIlo(m.ai_ilo) : null].filter((x) => x != null); ai = { pct: r3(ps.reduce((a, b) => a + b, 0) / ps.length), anthropic_penetration: m.ai_onet, ilo_2025: m.ai_ilo, basis: 'direct' }; }
      else { let best = null, bj = 0; for (const d of donorsAi) { const j = jac(m.tok, d.tok); if (j > bj) { bj = j; best = d; } } if (best && bj >= TRANSFER_J) { const ps = [best.ai_onet != null ? pOnet(best.ai_onet) : null, best.ai_ilo != null ? pIlo(best.ai_ilo) : null].filter((x) => x != null); ai = { pct: r3(ps.reduce((a, b) => a + b, 0) / ps.length), anthropic_penetration: best.ai_onet, ilo_2025: best.ai_ilo, basis: 'transferred', from: best.text.slice(0, 120), similarity: r3(bj) }; } }
      let rob = null;
      if (m.onet_task) { const t = o.tasks.find((q) => q.text === m.text); if (t && (t.robot_tier || t.time_share != null)) rob = { tier: m.tier || 'E0', score: m.tier ? Number(m.tier.slice(1)) / 3 : 0, basis: 'direct' }; }
      if (!rob && m.kind !== 'knowledge') { let best = null, bj = 0; for (const d of onetRated) { const j = jac(m.tok, d.tok); if (j > bj) { bj = j; best = d; } } if (best && bj >= TRANSFER_J) rob = { tier: best.tier || 'E0', score: best.tier ? Number(best.tier.slice(1)) / 3 : 0, basis: 'transferred', from: best.text.slice(0, 120), similarity: r3(bj) }; }
      const w = Math.max(...m.sources.map((s) => s.w));
      return { id: `${o.code}#${++id}`, text: m.text, kind: m.kind, esco_uri: m.esco_uri, sources: m.sources.map((s) => ({ ...s, w: r3(s.w) })), n_sources: new Set(m.sources.map((s) => s.source)).size, weight: r3(w), ai, robotics: rob };
    });
    const bySrc = {}; const blendParts = []; const robParts = [];
    for (const s of SOURCES) {
      const mine = stmts.filter((x) => x.sources.some((z) => z.source === s)); if (mine.length) cov[s]++;
      const wOf = (x) => x.sources.filter((z) => z.source === s).reduce((a, z) => Math.max(a, z.w), 0);
      const sa = mine.filter((x) => x.ai); const sr = mine.filter((x) => x.robotics);
      const wm = (arr, f) => { const W = arr.reduce((a, x) => a + wOf(x), 0); return W ? arr.reduce((a, x) => a + wOf(x) * f(x), 0) / W : null; };
      const aiv = wm(sa, (x) => x.ai.pct); const rv = wm(sr, (x) => x.robotics.score);
      // blend uses directly-scored statements only (transferred scores repeat a donor and are display-only)
      const dir = s === 'onet' ? sa.filter((x) => x.ai.basis === 'direct' && x.ai.anthropic_penetration != null) : s === 'ilo' ? sa.filter((x) => x.ai.basis === 'direct' && x.ai.ilo_2025 != null) : [];
      const dv = s === 'onet' ? wm(dir, (x) => pOnet(x.ai.anthropic_penetration)) : s === 'ilo' ? wm(dir, (x) => pIlo(x.ai.ilo_2025)) : null;
      const rdir = sr.filter((x) => x.robotics.basis === 'direct'); const drv = s === 'onet' ? wm(rdir, (x) => x.robotics.score) : null;
      bySrc[s] = { statements: mine.length, ai_scored: sa.length, ai_direct: sa.filter((x) => x.ai.basis === 'direct').length, robotics_scored: sr.length, ai_pct_mean: r3(aiv), robotics_mean: r3(rv), ai_direct_pct_mean: r3(dv) };
      if (dv != null) blendParts.push(dv); if (drv != null) robParts.push(drv);
    }
    const blendAi = blendParts.length ? r3(blendParts.reduce((a, b) => a + b, 0) / blendParts.length) : null;
    const blendRob = robParts.length ? r3(robParts.reduce((a, b) => a + b, 0) / robParts.length) : null;
    out.push({ code: o.code, title: o.title, crosswalk: { esco: escoOccs.map((m) => ({ uri: m.uri, title: m.title, match: m.match, weight: m.w })), soc2010: soc10, isco08: isco, isco_basis: iscoBasis, noc2021: noc21, nice_work_roles: NICE_MAP[o.code] || [] },
      summary: { statements: stmts.length, by_source: bySrc, multi_source_statements: stmts.filter((x) => x.n_sources > 1).length, ai_scored: stmts.filter((x) => x.ai).length, robotics_scored: stmts.filter((x) => x.robotics).length },
      blend: { ai_pct: blendAi, ai_sources: blendParts.length, robotics: blendRob, robotics_sources: robParts.length, current_ai_composite: o.exposure.ai.composite?.value ?? null, current_robot_index: o.exposure.robotics.anthropic_robot_exposure_index ?? null, primary: 'multi_source' },
      statements: stmts });
  }
  // ---------- full multi-measure blend (scripts/blend.js) ----------
  const BL = require('./blend'); const blendRes = BL.compute(shards, new Map(out.map((x) => [x.code, x])));
  for (const x of out) { const b = blendRes.byCode.get(x.code);
    x.blend = { ai_pct: b.ai.score, ai_sources: b.ai.agreement.families, robotics: b.robotics.score, robotics_sources: b.robotics.agreement.families, current_ai_composite: b.current_ai_composite, current_robot_index: b.current_robot_index, primary: 'multi_source', inferred_from: b.inferred, ai: b.ai, robotics_detail: b.robotics }; }
  // ---------- write ----------
  const meta = { dataset: 'multisource_statements', schema_version: '1.0.0', generated: today(), sources: SRC, esco_concepts_not_in_current_release: MISSING.length,
    method: { dedupe: `ESCO skill URI identity; then identical normalized text (lowercase, punctuation/stopwords removed, light suffix stemming, sorted token set); then token-set Jaccard >= ${DEDUPE_J} within the occupation (knowledge items only merge by URI/text); then a second pass folds true cross-source duplicates (symmetric -ing/-e/plural stemming, Jaccard >= ${DUP2_J}, at most ${DUP2_MAXDIFF} differing tokens, never two rows of the same source or two distinct ESCO skills) into their best match. Deterministic and offline; no embeddings.`,
      crosswalk_weights: 'ESCO match type: exact 1.0, close 0.8, narrow 0.6, broad 0.5 (relatedMatch excluded: not validated by US DOL); ESCO optional skills x0.5. ILO/OaSIS: 1/n of mapped ISCO groups / NOC units. ISCO groups = BLS SOC2010->ISCO-08 list, intersected with the ISCO groups of the ESCO occupations mapped to this O*NET code when that intersection is non-empty. NICE: 0.5, curated title mapping (no official SOC crosswalk). O*NET tasks: Anthropic time share / the occupation max (equal weights when missing).',
      exposure: `Only published scores. AI direct: Anthropic Economic Index task penetration (O*NET tasks) and ILO WP140 2025 task score (ISCO tasks). Robotics direct: Anthropic robot exposure tier E0-E3 on O*NET tasks (score = tier/3). Others inherit from the most lexically similar directly-scored statement in the same occupation when Jaccard >= ${TRANSFER_J} (basis "transferred", donor and similarity recorded); otherwise null. Calibration: each AI source -> its own percentile (share of that source's statements scoring strictly lower, so a zero score stays 0; statements with both: mean).`,
      blend_full: 'See scripts/blend.js and docs/BLEND_COMPARISON.md: every available measure as a percentile across occupations, grouped into independent families (AI: observed use, rated LLM exposure, ability-based, ILO tasks, market targeting; robotics: Anthropic robot, O*NET degree of automation, deployed robots); family = mean of available members; blend = mean of available families (missing re-weighted, never zero).',
      blend_v1_superseded: 'AI: unweighted mean of two independent task-level sources, each weight-averaged over its directly-scored statements: O*NET tasks (Anthropic penetration percentile, time-share weights) and ISCO-08 tasks (ILO 2025 percentile, 1/n ISCO weights). ESCO/OaSIS/NICE statements carry transferred scores for display but do not vote (no published task score of their own). Robotics: only O*NET tasks carry a published robot tier, so the robotics blend equals the O*NET task mean. Primary since Oct 21, 2026 (Drew approved).' } };
  const outDir = path.join(ROOT, 'data/multisource'); fs.mkdirSync(outDir, { recursive: true });
  // one small file per occupation (the app fetches only the job it shows); sources/method live in index.json
  const occDir = path.join(outDir, 'occ'); fs.rmSync(occDir, { recursive: true, force: true }); fs.mkdirSync(occDir, { recursive: true });
  for (const x of out) fs.writeFileSync(path.join(occDir, `${x.code}.json`), JSON.stringify({ dataset: 'multisource_occupation', schema_version: '1.0.0', generated: meta.generated, index: 'data/multisource/index.json', ...x }));
  for (const f of fs.readdirSync(outDir)) if (/^\d\d\.json$/.test(f)) fs.rmSync(path.join(outDir, f));
  const counts = out.map((x) => x.summary.statements).sort((a, b) => a - b);
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify({ ...meta, count: out.length, coverage_by_source: cov, statements_per_occupation: { min: counts[0], median: counts[counts.length >> 1], max: counts[counts.length - 1], mean: r3(counts.reduce((a, b) => a + b, 0) / counts.length) },
    occupations: out.map((x) => ({ code: x.code, title: x.title, file: `data/multisource/occ/${x.code}.json`, statements: x.summary.statements, sources: Object.entries(x.summary.by_source).filter(([, v]) => v.statements).map(([k]) => k), blend: x.blend })) }, null, 0));
  writeComparison(out, cov, counts, blendRes, BL, shards);
  console.log(`multisource: ${out.length} occupations; statements min ${counts[0]} median ${counts[counts.length >> 1]} max ${counts[counts.length - 1]}; coverage ${JSON.stringify(cov)}`);
  return out;
}

function writeComparison(out, cov, counts, B, BL, shards) {
  const bandOf = (x) => (x < 0.3 ? 'Low' : x >= 0.5 ? 'High' : 'Moderate');
  const lv = [...shards.values()].filter((o) => o.derived?.skill_risk_summary?.previous_method).map((o) => { const S = o.derived.skill_risk_summary; return { c: o.code, t: o.title, a: bandOf(S.previous_method.occupation_combined), b: bandOf(S.occupation_combined), pa: S.previous_method.occupation_combined, pb: S.occupation_combined, ai0: S.previous_method.occupation_ai, ai1: S.occupation_ai, r0: S.previous_method.occupation_robotics, r1: S.occupation_robotics }; });
  const trans = {}; for (const x of lv) trans[`${x.a} → ${x.b}`] = (trans[`${x.a} → ${x.b}`] || 0) + 1;
  const dist = (k) => ['Low', 'Moderate', 'High'].map((b) => `${b} ${lv.filter((x) => x[k] === b).length}`).join(', ');
  const aiLv = lv.filter((x) => bandOf(x.ai0) !== bandOf(x.ai1)).length, rLv = lv.filter((x) => bandOf(x.r0) !== bandOf(x.r1)).length;
  const foN = B.coverage.frey_osborne_ai;
  const levelSection = lv.length ? `## Primary switch (approved by Drew, Oct 21, 2026)
The multi-source score is now the **primary** score. It drives the headline AI and robotics figures, the risk-level bands, skill risks, pathways, reskilling routes, the employer brief, the PDF and CSV, and Supabase. The previous task-only method is kept as \`previous_method\` in each record and is shown on /method.

**From score to risk level.** The bands are defined on a 0–1 "share of work exposed" scale: Low below 0.30, High at 0.50 and above. To keep that scale and its meaning, the multi-source AI and robotics scores are **equipercentile-linked** onto it. A job at the 80th percentile of the multi-source AI score gets the 80th-percentile value of task-based AI risk across all jobs, and the same is done for robotics. Combined risk = 1 − (1 − AI)(1 − robotics). Each skill's risk is scaled by its job's new/old ratio, so the order of skills within a job is unchanged. Pathways and reskilling were recomputed on the new combined risk. Every invariant still holds: at least 3 pathways per job, targets with lower risk, the doctor-type block, and the tiers.

| | Low | Moderate | High |
|---|---|---|---|
| Previous method | ${lv.filter((x) => x.a === 'Low').length} | ${lv.filter((x) => x.a === 'Moderate').length} | ${lv.filter((x) => x.a === 'High').length} |
| Multi-source (primary) | ${lv.filter((x) => x.b === 'Low').length} | ${lv.filter((x) => x.b === 'Moderate').length} | ${lv.filter((x) => x.b === 'High').length} |

- **Combined risk level** changed for **${lv.filter((x) => x.a !== x.b).length}** of ${lv.length} jobs: ${Object.entries(trans).filter(([k]) => k.split(' → ')[0] !== k.split(' → ')[1]).map(([k, v]) => `${k} ${v}`).join(', ')}.
- **AI component band** changed for ${aiLv} jobs, and the **robotics component band** for ${rLv}.
- The site can still raise a level when products already on the market cover more of the work. That rule is unchanged.

Largest combined-risk changes:

| Code | Title | Previous | Multi-source | Level |
|---|---|---|---|---|
${lv.slice().sort((a, b) => Math.abs(b.pb - b.pa) - Math.abs(a.pb - a.pa)).slice(0, 20).map((x) => `| ${x.c} | ${x.t} | ${x.pa} | ${x.pb} | ${x.a}${x.a !== x.b ? ' → ' + x.b : ''} |`).join('\n')}

` : '';
  const tw = [...shards.values()].filter((o) => o.derived?.skill_risk_summary?.before_time_weighting).map((o) => { const S = o.derived.skill_risk_summary; return { c: o.code, t: o.title, a: bandOf(S.before_time_weighting.occupation_combined), b: bandOf(S.occupation_combined), pa: S.before_time_weighting.occupation_combined, pb: S.occupation_combined, twa: S.time_weighted?.ai, twr: S.time_weighted?.robotics, wa: S.time_weighted?.ai_weight, wr: S.time_weighted?.robotics_weight }; });
  const twTrans = {}; for (const x of tw) if (x.a !== x.b) twTrans[`${x.a} → ${x.b}`] = (twTrans[`${x.a} → ${x.b}`] || 0) + 1;
  const twSection = tw.length ? `## Time weighting (Drew, Oct 21, 2026)
The headline AI and robotics scores are now weighted by **how much of the job's time each task takes**.

1. **Time-weighted task exposure (T)**, AI and robotics separately: the sum over the job's tasks of *% of work time × % of the task that can be automated* (Drew, Oct 21, 2026: a task that is 20% automatable adds 20% of its time share). Time share = Anthropic Economic Index time share where published, otherwise 1/n, normalised to 100% (the same "% of time" shown in the task breakdown). AI % automatable = mean of the task's available evidence: Anthropic task penetration (continuous; automated use full weight, augmentative half), ILO 2025 GenAI task score where the O*NET task is the same statement as an ILO task (continuous), and the Eloundou et al. (2023) label (tier-based: E1 = 50% and E2 = 25%, because the label only says an LLM cuts the task's time by at least half, with E2 at the paper's half weight; E0 = 0). Robotics % automatable = share of the task's instances (by weight) that a cited robot can complete in that instance's own setting (Legate-Yang & Massenkoff 2026 task instances, continuous; never below the share covered by commercial/deployed robots); 0 for tasks the source rates non-physical. Verified-product targeting is not a fraction, so it stays in the market family and the market rule. Tasks with no evidence for a dimension are left out of it and their time is spread over the tasks that have evidence (never counted as 0); a job with no task evidence gets no T and uses the other measures alone. T is on the 0–1 "share of work exposed" scale the bands are defined on.
2. **Every other measure is kept.** They are blended as before (percentiles, equal families, O*NET automation and Frey-Osborne at 0.5) and the blend is equipercentile-linked onto T's distribution (Kolen & Brennan, *Test Equating, Scaling, and Linking*, 2014), so both are on the same scale (O).
3. **Headline = benefit-of-the-doubt weighting with weight restrictions** (Cherchye, Moesen, Rogge & Van Puyenbroeck 2007, *Social Indicators Research* 82:111–145; OECD/JRC *Handbook on Constructing Composite Indicators* 2008, §6.3): the weight on T is chosen between 0.5 and 0.9, whichever gives the job the higher score: headline = max(0.5·T + 0.5·O, 0.9·T + 0.1·O). Task evidence always has at least half the weight and dominates (90%) when it is stronger than the other measures; every other measure always keeps at least 10%. Combined = 1 − (1 − AI)(1 − robotics); bands unchanged (Low < 0.30, High ≥ 0.50); the market rule on the site is unchanged.

| | Low | Moderate | High |
|---|---|---|---|
| Before time weighting (b37f3f7) | ${tw.filter((x) => x.a === 'Low').length} | ${tw.filter((x) => x.a === 'Moderate').length} | ${tw.filter((x) => x.a === 'High').length} |
| Time-weighted (primary) | ${tw.filter((x) => x.b === 'Low').length} | ${tw.filter((x) => x.b === 'Moderate').length} | ${tw.filter((x) => x.b === 'High').length} |

Level changed for **${tw.filter((x) => x.a !== x.b).length}** jobs: ${Object.entries(twTrans).map(([k, v]) => `${k} ${v}`).join(', ')}. T dominated (weight 0.9) for ${tw.filter((x) => x.wa === 0.9).length} AI and ${tw.filter((x) => x.wr === 0.9).length} robotics scores.

| Code | Title | T AI | T robotics | Before | Now | Level |
|---|---|---|---|---|---|---|
${['53-3032.00', '43-4051.00', '15-1252.00', '27-1013.00', '47-2043.00', '29-1215.00', '25-2021.00'].map((c) => tw.find((x) => x.c === c)).filter(Boolean).map((x) => `| ${x.c} | ${x.t} | ${x.twa} | ${x.twr} | ${x.pa} | ${x.pb} | ${x.a}${x.a !== x.b ? ' → ' + x.b : ''} |`).join('\n')}

` : '';
  const rankOf = (vals) => { const v = vals.filter((x) => x != null).sort((a, b) => a - b); return (x) => (x == null ? null : (v.filter((q) => q < x).length + (v.filter((q) => q === x).length) / 2) / v.length); };
  const ids = out.map((x) => x.code); const get = (c) => B.byCode.get(c);
  const band = (p) => (p >= 2 / 3 ? 'High' : p >= 1 / 3 ? 'Moderate' : 'Low');
  const pct = (x) => (x == null ? '–' : (x * 100).toFixed(0));
  const cmp = (curF, newF) => {
    const rc = rankOf(ids.map((c) => curF(get(c)))), rn = rankOf(ids.map((c) => newF(get(c))));
    const rows = ids.map((c) => ({ c, t: out.find((x) => x.code === c).title, cur: rc(curF(get(c))), nb: rn(newF(get(c))) })).filter((r) => r.cur != null && r.nb != null).map((r) => ({ ...r, d: r.nb - r.cur }));
    const rho = BL.pear(rows.map((r) => [r.cur, r.nb])); const moved = rows.filter((r) => band(r.cur) !== band(r.nb));
    return { rows, rho, n: rows.length, mad: rows.reduce((a, r) => a + Math.abs(r.d), 0) / rows.length, big: rows.filter((r) => Math.abs(r.d) >= 0.2).length, moved: moved.length, up: moved.filter((r) => r.d > 0).length, down: moved.filter((r) => r.d < 0).length };
  };
  const curAI = (b) => b.current_ai_composite, curR = (b) => b.current_robot_index;
  const famStr = (F) => Object.entries(F).map(([k, f]) => `${k.replace(/_/g, ' ')} ${pct(f.score)}`).join(', ');
  const driver = (b, r, F) => { const fs_ = Object.entries(F).filter(([, f]) => f.score != null).sort((x, y) => (r.d > 0 ? y[1].score - x[1].score : x[1].score - y[1].score)); return fs_.slice(0, 2).map(([k, f]) => `${k.replace(/_/g, ' ')} (${pct(f.score)})`).join(', '); };
  const A = cmp(curAI, (b) => b.ai.score); const R = cmp(curR, (b) => b.robotics.score);
  const sens = Object.entries(BL.SCHEMES).map(([k, s]) => { const a = cmp(curAI, (b) => b.ai.schemes[k]); const r = cmp(curR, (b) => b.robotics.schemes[k]); const vsA = BL.pear(ids.map((c) => [get(c).ai.schemes[k], get(c).ai.score]).filter(([u, v]) => u != null && v != null)); return `| ${s.label} | ${a.rho.toFixed(3)} | ${vsA.toFixed(3)} | ${a.moved} (${a.up} up / ${a.down} down) | ${r.rho.toFixed(3)} | ${r.moved} |`; });
  const table = (rows, F) => rows.map((r) => { const b = get(r.c); return `| ${r.c} | ${r.t} | ${pct(r.cur)} | ${pct(r.nb)} | ${r.d > 0 ? '+' : ''}${pct(r.d)} | ${driver(b, r, F(b))} | ${b.ai.agreement.label}${b.inferred ? `; inferred from ${b.inferred}` : ''} |`; }).join('\n');
  const topUp = A.rows.slice().sort((a, b) => b.d - a.d).slice(0, 15), topDown = A.rows.slice().sort((a, b) => a.d - b.d).slice(0, 15);
  const rTop = R.rows.slice().sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 15);
  const recheck = ['55-3015.00', '19-2099.00', '19-2099.01'].map((c) => { const b = get(c); const r = A.rows.find((x) => x.c === c); return `### ${c} ${out.find((x) => x.code === c).title}\nCurrent composite rank ${pct(r.cur)}, multi-source rank ${pct(r.nb)} (${r.d > 0 ? '+' : ''}${pct(r.d)}; the first version of the blend had it far lower). ${b.inferred ? `Job-level measures are taken from ${b.inferred}, the same related role the current composite uses. ` : ''}Agreement: ${b.ai.agreement.label} (SD ${b.ai.agreement.sd}).\n\n| Family | Score (pct) | Measures (raw → pct) |\n|---|---|---|\n${Object.values(b.ai.families).map((f) => `| ${f.label} | ${pct(f.score)} | ${f.measures.map((m) => `${m.label}: ${m.raw ?? 'n/a'} → ${pct(m.pct)}`).join('; ')} |`).join('\n')}\n`; }).join('\n');
  const agreeCounts = ['sources agree', 'sources partly agree', 'sources disagree', 'single source'].map((l) => `${l} ${ids.filter((c) => get(c).ai.agreement.label === l).length}`).join(', ');
  const calRows = Object.entries(B.calibration).filter(([k]) => !/robot|automation/.test(k)).sort((a, b) => b[1].rho - a[1].rho).map(([k, v]) => `| ${k.replace('~', ' vs ')} | ${v.n} | ${v.rho.toFixed(2)} |`).join('\n');
  const calR = Object.entries(B.calibration).filter(([k]) => /^(robot|onet_degree)[^~]*~(robot|onet_degree)/.test(k)).map(([k, v]) => `| ${k.replace('~', ' vs ')} | ${v.n} | ${v.rho.toFixed(2)} |`).join('\n');
  const md = `# Multi-source exposure score vs current score (all ${out.length} occupations)

Generated ${today()} by \`scripts/multisource.js\` and \`scripts/blend.js\`. **The multi-source score is the PRIMARY score; Drew approved it on Oct 21, 2026, and it is time-weighted since the same day (see below).** In the sections after "Time weighting", "multi-source" ranks refer to the full headline. "Current" in the tables below means the previous method (the O*NET composite and the Anthropic robot index), which is kept for comparison.

${twSection}${levelSection}

## Method
1. **Every available measure is used.** Each is converted to a mid-rank percentile across the ${out.length} occupations, so measures on different scales become comparable. That puts a β share, a 0–1 ILO score, an AIOE z-score, a 1–5 automation rating and a time share all on the same 0–1 scale.
2. **Measures are grouped into independent families** (below), so that one research group is not counted several times for producing several numbers. The family score is the mean of the members the job has.
3. **The blend is the mean of the families the job has.** Missing measures are removed and the rest re-weighted. They are never counted as 0, so thin coverage cannot drag a score down.
4. **Jobs O*NET does not rate directly** take job-level measures from the related role the current composite already uses (\`inferred_from\`). Their task-level measures use the job's own task list.
5. **Agreement** is the standard deviation of the family scores: below 0.15 "sources agree", 0.15–0.25 "partly agree", 0.25 and above "disagree". Counts: ${agreeCounts}.
6. **Weighting rationale:** each independent family gets equal weight (scheme A). That follows the standard practice of averaging standardized indicators when no family is known to be more valid; see OECD/JRC, *Handbook on Constructing Composite Indicators* (2008). Schemes B and C below show how sensitive the result is to that choice.
7. **Final weights:** every family counts 1.0, except two at 0.5.
   - **O*NET Degree of Automation** (robotics) counts 0.5. Its correlation with the other robot measures is only about 0.10, because it rates how machine-paced the work is, not whether robots can do it.
   - **Frey & Osborne (2013)** counts 0.5 in both AI and robotics. Their probability of computerisation covers machine learning and mobile robotics together, so it cannot be assigned to just one. It is also a pre-LLM estimate built from nine O*NET variables. It is coded to SOC 2010 and was linked to 2018 SOC with the BLS 2010→2018 crosswalk, averaging when several 2010 codes map to one 2018 code. It covers ${foN} of ${out.length} jobs, and missing values are treated as missing. It is left out of the agreement statistic because it is a 2013 baseline. Source: https://www.oxfordmartin.ox.ac.uk/downloads/academic/The_Future_of_Employment.pdf (appendix table; ranks 1–702 extracted, see \`data/sources/frey_osborne_2013.json\`).

| AI family (weight) | Measures (coverage = number of occupations) |
|---|---|
${Object.entries(BL.AI_FAMILIES).map(([k, f]) => `| ${f.label} (${f.weight ?? 1}) | ${f.measures.map((m) => `${BL.MEASURE_LABEL[m]} (${B.coverage[m]})`).join('; ')} |`).join('\n')}

| Robotics family (weight) | Measures (coverage) |
|---|---|
${Object.entries(BL.ROB_FAMILIES).map(([k, f]) => `| ${f.label} (${f.weight ?? 1}) | ${f.measures.map((m) => `${BL.MEASURE_LABEL[m]} (${B.coverage[m]})`).join('; ')} |`).join('\n')}

## Headline (scheme A vs current)
- **AI:** rank correlation with the current composite **${A.rho.toFixed(3)}** (Spearman). Mean absolute rank change ${pct(A.mad)} points; ${A.big} jobs move 20 or more points. The Low/Moderate/High tercile changes for **${A.moved}** of ${A.n} jobs (${A.up} up, ${A.down} down).
- **Robotics:** rank correlation with the current Anthropic robot index **${R.rho.toFixed(3)}**. The tercile changes for ${R.moved} jobs (${R.up} up, ${R.down} down). Many jobs share the robot index value 0, so tercile moves at the low end are partly tie-breaking.
- Statements per job (the work-statement layer): min ${counts[0]}, median ${counts[counts.length >> 1]}, max ${counts[counts.length - 1]}. Coverage: ${Object.entries(cov).map(([k, v]) => `${k} ${v}`).join(', ')}.

## Sensitivity to the weighting scheme
| Scheme | AI ρ vs current | AI ρ vs scheme A | AI tercile changes vs current | Robotics ρ vs current | Robotics tercile changes |
|---|---|---|---|---|---|
${sens.join('\n')}

## Calibration: how the AI measures agree with each other (Spearman on percentiles)
| Pair | n | ρ |
|---|---|---|
${calRows}

| Robotics pair | n | ρ |
|---|---|---|
${calR}

## Rechecked jobs
${recheck}
## Top 15 AI increases (multi-source ranks the job as more exposed)
| Code | Title | Current | Multi-source | Δ | Families that drove it | Agreement |
|---|---|---|---|---|---|---|
${table(topUp, (b) => b.ai.families)}

## Top 15 AI decreases
| Code | Title | Current | Multi-source | Δ | Families that drove it | Agreement |
|---|---|---|---|---|---|---|
${table(topDown, (b) => b.ai.families)}

## Top 15 robotics movers
| Code | Title | Current | Multi-source | Δ | Families that drove it | AI agreement |
|---|---|---|---|---|---|---|
${table(rTop, (b) => b.robotics.families)}

## Full AI table
| Code | Title | Current rank | Multi-source rank | Δ | Family scores (pct) | Agreement |
|---|---|---|---|---|---|---|
${A.rows.slice().sort((a, b) => a.c.localeCompare(b.c)).map((r) => { const b = get(r.c); return `| ${r.c} | ${r.t} | ${pct(r.cur)} | ${pct(r.nb)} | ${r.d > 0 ? '+' : ''}${pct(r.d)} | ${famStr(b.ai.families)} | ${b.ai.agreement.label} |`; }).join('\n')}
`;
  fs.writeFileSync(path.join(ROOT, 'docs/BLEND_COMPARISON.md'), md);
}
module.exports = { run, toks, jac, norm };
if (require.main === module) run().catch((e) => { console.error(e); process.exit(1); });
