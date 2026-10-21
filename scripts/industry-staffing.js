#!/usr/bin/env node
/**
 * Industry staffing patterns from BLS OEWS national industry-specific estimates (May 2025, oesm25in4.zip):
 * for every NAICS sector, 3-digit and 4-digit industry, the detailed occupations with their employment and
 * share of the industry's total employment (PCT_TOTAL), mapped to O*NET-SOC codes in data/occupations.
 * Output: data/industries/oews_staffing.json (used by the app's /employers industry scoping).
 * Usage: node scripts/industry-staffing.js   (downloads to .cache/oews_industry.zip if missing)
 */
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const XLSX = require('xlsx');
const { ROOT, today } = require('./lib');

const SRC = { name: 'BLS Occupational Employment and Wage Statistics (OEWS), national industry-specific estimates', version: 'May 2025', url: 'https://www.bls.gov/oes/special-requests/oesm25in4.zip', page: 'https://www.bls.gov/oes/tables.htm', file: 'oews_industry.zip' };
const UA = 'smartpivot-data/2.0 (drewsherman6@gmail.com)'; // BLS requires a contact UA for automated downloads
const TOP_N = 40;
const FILES = [['natsector', 'sector'], ['nat3d', '3-digit'], ['nat4d', '4-digit']];

async function ensureZip() {
  const zp = path.join(ROOT, '.cache', SRC.file);
  if (!fs.existsSync(zp)) {
    const res = await fetch(SRC.url, { headers: { 'User-Agent': UA, From: 'drewsherman6@gmail.com' } });
    if (!res.ok) throw new Error(`industry-staffing: download ${res.status}`);
    fs.mkdirSync(path.dirname(zp), { recursive: true }); fs.writeFileSync(zp, Buffer.from(await res.arrayBuffer()));
  }
  return zp;
}
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null); // BLS uses "**" / "*" for suppressed cells

function build(zp) {
  const zip = new AdmZip(zp);
  const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/occupations/index.json'), 'utf8')).occupations;
  const bySoc = new Map(); for (const o of index) { const s = o.code.slice(0, 7); (bySoc.get(s) || bySoc.set(s, []).get(s)).push(o); }
  const industries = [];
  for (const [stem, level] of FILES) {
    const e = zip.getEntries().find((x) => new RegExp(`/${stem}_M\\d{4}_dl\\.xlsx$`, 'i').test(x.entryName));
    if (!e) throw new Error(`industry-staffing: ${stem} missing in ${SRC.file}`);
    const wb = XLSX.read(e.getData(), { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    const g = new Map();
    for (const r of rows) { const k = String(r.NAICS); (g.get(k) || g.set(k, []).get(k)).push(r); }
    for (const [naics, rs] of g) {
      const tot = rs.find((r) => r.O_GROUP === 'total');
      const det = rs.filter((r) => r.O_GROUP === 'detailed' && num(r.PCT_TOTAL) != null).sort((a, b) => b.PCT_TOTAL - a.PCT_TOTAL);
      const roles = [];
      for (const r of det) {
        const occs = bySoc.get(r.OCC_CODE) || [];
        if (!occs.length) continue; // SOC not in the O*NET-SOC taxonomy we publish (rare residual codes)
        const primary = occs.find((o) => o.code.endsWith('.00')) || occs[0];
        roles.push({ soc: r.OCC_CODE, soc_title: r.OCC_TITLE, onet_code: primary.code, onet_title: primary.title, other_onet_codes: occs.filter((o) => o !== primary).map((o) => o.code),
          employment: num(r.TOT_EMP), pct_of_industry: num(r.PCT_TOTAL), industry_median_annual: num(r.A_MEDIAN) });
        if (roles.length >= TOP_N) break;
      }
      const code = level === '3-digit' ? naics.slice(0, 3) : level === '4-digit' ? (/^\d{4}00$/.test(naics) ? naics.slice(0, 4) : naics) : naics; // BLS aggregates like 3250A1 keep their code
      industries.push({ naics: code, naics_raw: naics, title: rs[0].NAICS_TITLE, level, total_employment: num(tot?.TOT_EMP),
        covered_pct: Math.round(roles.reduce((s, x) => s + (x.pct_of_industry || 0), 0) * 100) / 100, roles });
    }
  }
  industries.sort((a, b) => a.naics.localeCompare(b.naics));
  return { schema_version: '1.0.0', dataset: 'industry_staffing', generated: today(),
    source: { ...SRC, retrieved_at: fs.statSync(zp).mtime.toLocaleDateString('en-CA'), data_as_of: 'May 2025 (OEWS reference period)' },
    method: `For each NAICS sector, 3-digit and 4-digit industry, the top ${TOP_N} detailed SOC occupations by PCT_TOTAL (percent of the industry's total employment, as published by BLS), mapped to the O*NET-SOC code in this repo (".00" code when it exists; other_onet_codes lists the remaining codes sharing the SOC). Suppressed BLS cells ("**", "*") are null and those occupations are skipped. Cross-industry national data; it describes a typical employer in the industry, not any specific one.`,
    count: industries.length, industries };
}
async function run() {
  const out = build(await ensureZip());
  const p = path.join(ROOT, 'data/industries/oews_staffing.json');
  fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(out) + '\n');
  console.log(`industry-staffing: ${out.count} industries -> ${path.relative(ROOT, p)}`);
}
module.exports = { run, build };
if (require.main === module) run().catch((e) => { console.error(e); process.exit(1); });
