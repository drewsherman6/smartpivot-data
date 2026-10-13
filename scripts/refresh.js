#!/usr/bin/env node
/**
 * scripts/refresh.js — unattended rebuild of all bulk-sourced datasets.
 *   node scripts/refresh.js            download sources (cache in .cache/), rebuild, write only changed files
 *   node scripts/refresh.js --offline  rebuild from .cache/ without downloading
 * Outputs: data/occupations/*, data/exposure/*, data/robotics/platforms.json, data/signals/families.json
 * Volatile fields (generated, retrieved_at, checked_at) are ignored when deciding whether a file changed,
 * so dates only move when the data moves. No git operations here.
 */
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const XLSX = require('xlsx');
const { parse } = require('csv-parse/sync');
const SRC = require('./sources');
const { ROOT, today } = require('./lib');

const CACHE = path.join(ROOT, '.cache');
const OFFLINE = process.argv.includes('--offline');
const UA = 'smartpivot-data/2.0 (drewsherman6@gmail.com)'; // BLS requires a contact UA for automated downloads
const TODAY = today();
const r2 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 1000) / 1000);
const num = (x) => { if (x === '' || x == null) return null; const n = Number(String(x).replace(/,/g, '')); return Number.isFinite(n) ? n : null; };

async function download() {
  fs.mkdirSync(CACHE, { recursive: true });
  const meta = {};
  for (const [k, s] of Object.entries(SRC)) {
    const dest = path.join(CACHE, s.file);
    if (!OFFLINE) {
      const res = await fetch(s.url, { headers: { 'User-Agent': UA, From: 'drewsherman6@gmail.com' } });
      if (!res.ok) throw new Error(`download failed ${res.status} ${s.url}`);
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    }
    if (!fs.existsSync(dest)) throw new Error(`missing cache ${dest}; run without --offline`);
    meta[k] = { name: s.name, version: s.version, url: s.url, page: s.page, retrieved_at: OFFLINE ? fs.statSync(dest).mtime.toLocaleDateString('en-CA') : TODAY };
  }
  return meta;
}

function onetTables() {
  const zip = new AdmZip(path.join(CACHE, SRC.onet.file));
  const get = (name) => {
    const e = zip.getEntries().find((x) => x.entryName.endsWith('/' + name));
    if (!e) throw new Error('O*NET file missing: ' + name);
    return parse(e.getData().toString('utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true });
  };
  const readme = zip.getEntries().find((x) => /Read Me\.txt$/.test(x.entryName));
  const ver = readme ? (readme.getData().toString('utf8').match(/O\*NET ([\d.]+) Database\s*\n(.*Release)/) || []) : [];
  return { get, version: ver[1], release: ver[2] };
}
const csvFile = (f) => parse(fs.readFileSync(path.join(CACHE, f), 'utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true });
const sheet = (f, name, opts = {}) => { const wb = XLSX.readFile(path.join(CACHE, f)); return XLSX.utils.sheet_to_json(wb.Sheets[name || wb.SheetNames[0]], { defval: null, ...opts }); };
const pct = (arr) => { const s = arr.filter((v) => v != null).sort((a, b) => a - b); return (v) => (v == null ? null : s.filter((x) => x <= v).length / s.length); };

const MAJOR = {}; // filled from OEWS major rows
function stripVolatile(o) { return JSON.stringify(o, (k, v) => (['generated', 'retrieved_at', 'checked_at', 'updated'].includes(k) ? undefined : v)); }
const written = [];
function writeIfChanged(rel, obj) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (fs.existsSync(abs)) {
    try { if (stripVolatile(JSON.parse(fs.readFileSync(abs, 'utf8'))) === stripVolatile(obj)) return false; } catch (e) { /* rewrite broken file */ }
  }
  const txt = JSON.stringify(obj) + '\n'; // compact: shards are machine-read
  JSON.parse(txt);
  fs.writeFileSync(abs + '.tmp', txt); fs.renameSync(abs + '.tmp', abs);
  written.push(rel); return true;
}

async function main() {
  const S = await download();
  const O = onetTables();
  S.onet.version = O.version || S.onet.version; S.onet.release = O.release;

  // ---------- O*NET ----------
  const occ = new Map();
  for (const r of O.get('occupation_data.csv')) occ.set(r['O*NET-SOC Code'], { code: r['O*NET-SOC Code'], title: r.Title, description: r.Description, tasks: [], emerging_tasks: [], skills: [], knowledge: [], abilities: [], technology: [], related: [] });
  for (const r of O.get('job_zones.csv')) { const o = occ.get(r['O*NET-SOC Code']); if (o) o.job_zone = num(r['Job Zone']); }
  for (const r of O.get('task_statements.csv')) { const o = occ.get(r['O*NET-SOC Code']); if (o) o.tasks.push({ id: r['Task ID'], text: r.Task, type: r['Task Type'] || null }); }
  for (const r of O.get('emerging_tasks.csv')) { const o = occ.get(r['O*NET-SOC Code']); if (o) o.emerging_tasks.push({ text: r.Task, category: r.Category, date: r.Date }); }
  const elem = (file, kind, category) => {
    const acc = new Map();
    for (const r of O.get(file)) {
      if (r['Recommend Suppress'] === 'Y') continue;
      const key = r['O*NET-SOC Code'] + '|' + r['Element ID'];
      const e = acc.get(key) || { code: r['O*NET-SOC Code'], id: r['Element ID'], name: r['Element Name'], kind, category: typeof category === 'function' ? category(r['Element ID']) : category };
      if (r['Scale ID'] === 'IM') e.importance = num(r['Data Value']);
      if (r['Scale ID'] === 'LV') e.level = num(r['Data Value']);
      acc.set(key, e);
    }
    return [...acc.values()].filter((e) => e.importance != null);
  };
  const abilityCat = (id) => ({ '1.A.1': 'cognitive', '1.A.2': 'psychomotor', '1.A.3': 'physical', '1.A.4': 'sensory' }[id.slice(0, 5)] || 'other');
  const push = (arr, field) => arr.forEach(({ code, ...e }) => { const o = occ.get(code); if (o) o[field].push(e); });
  push(elem('essential_skills.csv', 'skill', 'essential'), 'skills');
  push(elem('transferable_skills.csv', 'skill', 'transferable'), 'skills');
  push(elem('knowledge.csv', 'knowledge', 'knowledge'), 'knowledge');
  push(elem('abilities.csv', 'ability', abilityCat), 'abilities');
  for (const r of O.get('software_skills.csv')) { const o = occ.get(r['O*NET-SOC Code']); if (o) o.technology.push({ example: r['Workplace Example'], category: r['Element Name'], hot: r['Hot Technology'] === 'Y', in_demand: r['In Demand'] === 'Y' }); }
  for (const r of O.get('related_occupations.csv')) { const o = occ.get(r['O*NET-SOC Code']); if (o) o.related.push({ code: r['Related O*NET-SOC Code'], title: r['Related Title'], tier: r['Relatedness Tier'], index: num(r.Index) }); }
  const automation = new Map();
  for (const r of O.get('work_context.csv')) if (r['Element Name'] === 'Degree of Automation' && r['Scale ID'] === 'CX') automation.set(r['O*NET-SOC Code'], num(r['Data Value']));

  // ---------- BLS ----------
  const oewsZip = new AdmZip(path.join(CACHE, SRC.oews.file));
  const oewsEntry = oewsZip.getEntries().find((e) => /national_M\d{4}_dl\.xlsx$/.test(e.entryName));
  const oewsRows = XLSX.utils.sheet_to_json(XLSX.read(oewsEntry.getData()).Sheets[XLSX.read(oewsEntry.getData()).SheetNames[0]], { defval: null });
  const oews = new Map();
  for (const r of oewsRows) {
    if (r.O_GROUP === 'major') MAJOR[r.OCC_CODE.slice(0, 2)] = r.OCC_TITLE;
    if (!['detailed', 'broad'].includes(r.O_GROUP) && r.O_GROUP !== 'major') continue;
    oews.set(r.OCC_CODE, { soc: r.OCC_CODE, group: r.O_GROUP, employment: num(r.TOT_EMP), median_annual: num(r.A_MEDIAN), mean_annual: num(r.A_MEAN), median_hourly: num(r.H_MEDIAN), annual_p10: num(r.A_PCT10), annual_p90: num(r.A_PCT90), hourly_only: r.HOURLY === 'TRUE' || r.HOURLY === true });
  }
  S.oews.version = (oewsEntry.entryName.match(/M(\d{4})/) || [])[1] ? 'May ' + oewsEntry.entryName.match(/M(\d{4})/)[1] : S.oews.version;
  const epRaw = sheet(SRC.ep.file, 'Table 1.2', { header: 1 });
  const hdr = epRaw.findIndex((r) => r && String(r[1]).includes('Matrix code'));
  const H = epRaw[hdr]; const col = (re) => H.findIndex((h) => re.test(String(h)));
  const c = { code: col(/Matrix code/), type: col(/Occupation type/), e0: col(/^Employment, \d{4}$/), e1: H.findIndex((h, i) => /^Employment, \d{4}$/.test(String(h)) && i > col(/^Employment, \d{4}$/)), chg: col(/change, percent/), num: col(/change, numeric/), open: col(/openings/), wage: col(/Median annual wage/), edu: col(/Typical education/) };
  S.ep.version = (String(H[c.chg]).match(/(\d{4}).(\d{2})/) || []).slice(1).join('-') || S.ep.version;
  const ep = new Map(); let epTotal = null;
  for (const r of epRaw.slice(hdr + 1)) {
    if (!r || !r[c.code]) continue;
    const rec = { matrix_code: r[c.code], title: String(r[0]).trim(), employment_base_thousands: num(r[c.e0]), employment_projected_thousands: num(r[c.e1]), change_numeric_thousands: num(r[c.num]), change_percent: num(r[c.chg]), openings_annual_thousands: num(r[c.open]), median_annual_wage: num(r[c.wage]), typical_education: r[c.edu] || null, period: S.ep.version };
    if (r[c.code] === '00-0000') epTotal = rec;
    ep.set(r[c.code], rec);
  }
  const soc6 = (code) => code.slice(0, 7);
  const findBls = (map, code) => map.get(soc6(code)) || map.get(soc6(code).slice(0, 6) + '0') || map.get(soc6(code).slice(0, 5) + '00') || null;

  // ---------- Exposure ----------
  const elo = new Map(csvFile(SRC.eloundou.file).map((r) => [r['O*NET-SOC Code'], { dv_alpha: r2(num(r.dv_rating_alpha)), dv_beta: r2(num(r.dv_rating_beta)), dv_gamma: r2(num(r.dv_rating_gamma)), human_alpha: r2(num(r.human_rating_alpha)), human_beta: r2(num(r.human_rating_beta)), human_gamma: r2(num(r.human_rating_gamma)) }]));
  const aioe = new Map(sheet(SRC.aioe.file, 'Appendix A').map((r) => [r['SOC Code'], r2(num(r.AIOE))]));
  const aeiObs = new Map(csvFile(SRC.aei_exposure.file).map((r) => [r.occ_code, r2(num(r.observed_exposure))]));
  const taskPen = new Map(csvFile(SRC.aei_task.file).map((r) => [r.task.trim(), num(r.penetration)]));
  const robotIdx = new Map(csvFile(SRC.robot_occ.file).map((r) => [r.onetsoc_code, r2(num(r.robot_exposure_index))]));
  // robot task file is ~100 MB: stream-parse line by line through csv-parse
  const robotTask = new Map(); const robotByOcc = new Map(); const devs = new Map();
  {
    const { parse: parseStream } = require('csv-parse');
    const parser = fs.createReadStream(path.join(CACHE, SRC.robot_tasks.file)).pipe(parseStream({ columns: true, relax_quotes: true }));
    for await (const r of parser) {
      robotTask.set(r.onetsoc_code + '|' + r.task_id, { tier: r.exposure_tier || null, time_share: num(r.time_share) });
      if (!r.sources || r.sources === '[]') continue;
      let srcs; try { srcs = JSON.parse(r.sources); } catch { continue; }
      const list = robotByOcc.get(r.onetsoc_code) || []; 
      for (const s of srcs) {
        if (!s.system || !s.url) continue;
        list.push({ task_id: r.task_id, tier: r.exposure_tier, system: s.system, developer: s.developer, maturity: s.maturity, date: s.date, url: s.url });
        const d = devs.get(s.developer) || { developer: s.developer, systems: new Map(), occupations: new Set(), tasks: 0, maturity: {}, urls: new Set() };
        d.systems.set(s.system, (d.systems.get(s.system) || 0) + 1); d.occupations.add(r.onetsoc_code); d.tasks++;
        d.maturity[s.maturity] = (d.maturity[s.maturity] || 0) + 1; if (d.urls.size < 5) d.urls.add(s.url);
        devs.set(s.developer, d);
      }
      robotByOcc.set(r.onetsoc_code, list);
    }
  }

  // composite AI exposure = mean of available percentile ranks (Eloundou dv_beta, AIOE, AEI observed)
  const all = [...occ.values()];
  const pE = pct(all.map((o) => elo.get(o.code)?.dv_beta)), pA = pct([...aioe.values()]), pO = pct([...aeiObs.values()]);
  for (const o of all) {
    const e = elo.get(o.code) || null, a = aioe.get(soc6(o.code)) ?? null, ob = aeiObs.get(soc6(o.code)) ?? null;
    const parts = [e && pE(e.dv_beta), a != null ? pA(a) : null, ob != null ? pO(ob) : null].filter((x) => x != null);
    o.exposure = {
      ai: { eloundou_2023: e, felten_aioe: a, anthropic_observed_exposure: ob,
        composite: parts.length ? { value: r2(parts.reduce((s, x) => s + x, 0) / parts.length), n_measures: parts.length, method: 'mean percentile rank of available measures (eloundou.dv_beta, felten_aioe, anthropic_observed_exposure); derived' } : null },
      robotics: { anthropic_robot_exposure_index: robotIdx.get(o.code) ?? null, onet_degree_of_automation: r2(automation.get(o.code) ?? null) },
    };
    for (const t of o.tasks) { const p = taskPen.get(t.text.trim()); if (p != null) t.ai_task_penetration = r2(p); const rt = robotTask.get(o.code + '|' + t.id); if (rt) { t.robot_tier = rt.tier; t.time_share = rt.time_share; } }
    const cites = robotByOcc.get(o.code) || []; const seen = new Set();
    o.exposure.robotics.cited_systems = cites.filter((x) => { const k = x.system; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10);
    o.exposure.robotics.exposed_tasks = o.tasks.filter((t) => ['E1', 'E2', 'E3'].includes(t.robot_tier)).sort((a, b) => (b.time_share || 0) - (a.time_share || 0)).slice(0, 8).map((t) => ({ id: t.id, text: t.text, tier: t.robot_tier }));
    o.bls = { oews: findBls(oews, o.code), projections: findBls(ep, o.code) };
    o.major_group = { code: o.code.slice(0, 2) + '-0000', title: MAJOR[o.code.slice(0, 2)] || null };
    o.skills.sort((a, b) => b.importance - a.importance); o.knowledge.sort((a, b) => b.importance - a.importance); o.abilities.sort((a, b) => b.importance - a.importance);
    o.knowledge = o.knowledge.slice(0, 12); o.abilities = o.abilities.slice(0, 20);
    o.technology.sort((a, b) => (b.hot + b.in_demand) - (a.hot + a.in_demand)); o.technology_total = o.technology.length; o.technology = o.technology.slice(0, 20);
  }

  // ---------- Derived: transitions, future skills, skills to develop ----------
  const TIER_W = { 'Primary-Short': 1, 'Primary-Long': 0.7, 'Supplemental': 0.4 };
  const clamp = (x) => Math.max(-1, Math.min(1, x));
  const lv = (o) => new Map(o.skills.map((s) => [s.name, s]));
  for (const o of all) {
    const self = lv(o); const sg = o.bls.projections?.change_percent; const sw = o.bls.oews?.median_annual; const sc = o.exposure.ai.composite?.value;
    const cands = o.related.map((r) => {
      const t = occ.get(r.code); if (!t) return null;
      const tg = t.bls.projections?.change_percent, tw = t.bls.oews?.median_annual, tc = t.exposure.ai.composite?.value;
      const comp = { relatedness: TIER_W[r.tier] ?? 0.4, growth: tg == null ? 0 : clamp(tg / 20), exposure_reduction: sc == null || tc == null ? 0 : clamp(sc - tc), wage: sw && tw ? clamp(Math.log(tw / sw)) : 0 };
      const score = 0.35 * comp.relatedness + 0.3 * comp.growth + 0.2 * comp.exposure_reduction + 0.15 * comp.wage;
      const tl = lv(t);
      const gaps = [...tl.values()].map((s) => ({ skill: s.name, current_level: self.get(s.name)?.level ?? null, target_level: s.level, target_importance: s.importance, gap: r2((s.level || 0) - (self.get(s.name)?.level || 0)) })).filter((g) => g.gap >= 0.25 && g.target_importance >= 3).sort((a, b) => b.gap * b.target_importance - a.gap * a.target_importance).slice(0, 5);
      return { code: t.code, title: t.title, relatedness_tier: r.tier, projected_change_percent: tg ?? null, median_annual_wage: tw ?? null, ai_exposure_composite: tc ?? null, robot_exposure_index: t.exposure.robotics.anthropic_robot_exposure_index, score: r2(score), components: Object.fromEntries(Object.entries(comp).map(([k, v]) => [k, r2(v)])), skill_gaps: gaps, growing_faster_than_average: tg != null && epTotal ? tg > epTotal.change_percent : null };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
    const top = cands.slice(0, 8);
    const fsAcc = new Map();
    const add = (s, w) => { const a = fsAcc.get(s.name) || { skill: s.name, category: s.category, w: 0, sum: 0 }; a.w += w; a.sum += w * s.importance; fsAcc.set(s.name, a); };
    o.skills.forEach((s) => add(s, 1));
    top.slice(0, 5).forEach((t) => { if (t.score > 0) occ.get(t.code).skills.forEach((s) => add(s, t.score)); });
    const future = [...fsAcc.values()].map((a) => ({ skill: a.skill, category: a.category, kind: 'skill', future_importance: r2(a.sum / a.w), current_importance: self.get(a.skill)?.importance ?? null })).sort((a, b) => b.future_importance - a.future_importance).slice(0, 10);
    const dev = new Map();
    top.slice(0, 5).forEach((t) => t.skill_gaps.forEach((g) => { const d = dev.get(g.skill) || { skill: g.skill, kind: 'skill', weighted_gap: 0, for_transitions: [] }; d.weighted_gap += Math.max(t.score, 0.05) * g.gap * g.target_importance / 5; d.for_transitions.push(t.code); dev.set(g.skill, d); }));
    const techAcc = new Map();
    [o, ...top.slice(0, 5).map((t) => occ.get(t.code))].forEach((x) => x.technology.filter((t) => t.hot || t.in_demand).forEach((t) => techAcc.set(t.example, (techAcc.get(t.example) || 0) + 1)));
    o.derived = {
      transitions: top,
      future_skills: future,
      skills_to_develop: [...dev.values()].map((d) => ({ ...d, weighted_gap: r2(d.weighted_gap) })).sort((a, b) => b.weighted_gap - a.weighted_gap).slice(0, 8),
      future_technologies: [...techAcc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, n]) => ({ name, occurrences: n })),
      method: 'See README "Derived fields". Inputs: O*NET related occupations, skills (importance/level), BLS projections, OEWS wages, composite AI exposure.',
    };
  }

  // ---------- Write occupation shards ----------
  const meta = { generated: TODAY, sources: S, license_notes: 'O*NET data CC BY 4.0 (U.S. DOL/ETA). BLS public domain. Anthropic Economic Index CC-BY. Eloundou et al. and Felten et al. per their repositories.' };
  const groups = new Map();
  for (const o of all) { const g = o.code.slice(0, 2); (groups.get(g) || groups.set(g, []).get(g)).push(o); }
  const index = [];
  for (const [g, list] of [...groups.entries()].sort()) {
    writeIfChanged(`data/occupations/${g}.json`, { schema_version: '1.0.0', dataset: 'occupation_shard', major_group: { code: g + '-0000', title: MAJOR[g] || null }, ...meta, occupations: list });
    for (const o of list) index.push({ code: o.code, title: o.title, shard: `data/occupations/${g}.json`, job_zone: o.job_zone ?? null, employment: o.bls.oews?.employment ?? null, median_annual_wage: o.bls.oews?.median_annual ?? null, projected_change_percent: o.bls.projections?.change_percent ?? null, ai_exposure_composite: o.exposure.ai.composite?.value ?? null, robot_exposure_index: o.exposure.robotics.anthropic_robot_exposure_index });
  }
  writeIfChanged('data/occupations/index.json', { schema_version: '1.0.0', dataset: 'occupations_index', ...meta, count: index.length, occupations: index });

  // ---------- Robotics platforms (from cited systems) ----------
  const plat = [...devs.values()].filter((d) => d.developer && d.tasks >= 10).sort((a, b) => b.tasks - a.tasks).map((d) => ({
    developer: d.developer, cited_task_count: d.tasks, occupation_count: d.occupations.size, occupations: [...d.occupations].sort(),
    systems: [...d.systems.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, n]) => ({ name, citations: n })), maturity: d.maturity, source_urls: [...d.urls],
  }));
  writeIfChanged('data/robotics/platforms.json', { schema_version: '1.0.0', dataset: 'robotics_platforms', generated: TODAY, sources: { robot_tasks: S.robot_tasks }, note: 'Robot systems/developers cited as evidence in the Anthropic "What work can robots do?" task ratings (developers with >=10 cited tasks). Each source_url is the evidence the rating cited.', count: plat.length, platforms: plat });

  // ---------- Family signals ----------
  const prev = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data/signals/families.json'), 'utf8')); } catch { return null; } })();
  const fam = [...groups.entries()].sort().map(([g, list]) => {
    const withEmp = list.filter((o) => o.code.endsWith('.00') && o.bls.oews?.employment);
    const emp = withEmp.reduce((s, o) => s + o.bls.oews.employment, 0);
    const wavg = (f) => { const xs = withEmp.filter((o) => f(o) != null); const w = xs.reduce((s, o) => s + o.bls.oews.employment, 0); return w ? r2(xs.reduce((s, o) => s + f(o) * o.bls.oews.employment, 0) / w) : null; };
    const growth = list.filter((o) => o.bls.projections?.change_percent != null);
    const hot = new Map(); list.forEach((o) => o.technology.filter((t) => t.hot).forEach((t) => hot.set(t.example, (hot.get(t.example) || 0) + 1)));
    const signal = {
      code: g + '-0000', title: MAJOR[g] || null, occupations: list.length, oews_employment: emp,
      employment_weighted: { projected_change_percent: wavg((o) => o.bls.projections?.change_percent), ai_exposure_composite: wavg((o) => o.exposure.ai.composite?.value), robot_exposure_index: wavg((o) => o.exposure.robotics.anthropic_robot_exposure_index), median_annual_wage: wavg((o) => o.bls.oews?.median_annual) },
      fastest_growing: growth.sort((a, b) => b.bls.projections.change_percent - a.bls.projections.change_percent).slice(0, 5).map((o) => ({ code: o.code, title: o.title, change_percent: o.bls.projections.change_percent })),
      fastest_declining: growth.slice().sort((a, b) => a.bls.projections.change_percent - b.bls.projections.change_percent).slice(0, 5).map((o) => ({ code: o.code, title: o.title, change_percent: o.bls.projections.change_percent })),
      most_ai_exposed: list.filter((o) => o.exposure.ai.composite).sort((a, b) => b.exposure.ai.composite.value - a.exposure.ai.composite.value).slice(0, 5).map((o) => ({ code: o.code, title: o.title, composite: o.exposure.ai.composite.value })),
      most_robot_exposed: list.filter((o) => o.exposure.robotics.anthropic_robot_exposure_index != null).sort((a, b) => b.exposure.robotics.anthropic_robot_exposure_index - a.exposure.robotics.anthropic_robot_exposure_index).slice(0, 5).map((o) => ({ code: o.code, title: o.title, index: o.exposure.robotics.anthropic_robot_exposure_index })),
      emerging_tasks: list.flatMap((o) => o.emerging_tasks.map((t) => ({ code: o.code, title: o.title, task: t.text, date: t.date }))).slice(0, 10),
      hot_technologies: [...hot.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, n]) => ({ name, occupations: n })),
    };
    const p = prev?.families?.find((f) => f.code === signal.code);
    signal.changes_since_previous = p ? Object.fromEntries(Object.entries(signal.employment_weighted).map(([k, v]) => [k, v != null && p.employment_weighted?.[k] != null ? r2(v - p.employment_weighted[k]) : null])) : null;
    return signal;
  });
  writeIfChanged('data/signals/families.json', { schema_version: '1.0.0', dataset: 'family_signals', generated: TODAY, sources: S, method: 'Aggregates of per-occupation data; employment-weighted by OEWS employment of .00 O*NET codes. changes_since_previous compares with the prior committed version.', families: fam });

  // ---------- Flat exposure tables (convenience) ----------
  writeIfChanged('data/exposure/ai_exposure.json', { schema_version: '1.0.0', dataset: 'ai_exposure', generated: TODAY, sources: { eloundou: S.eloundou, aioe: S.aioe, aei_exposure: S.aei_exposure }, occupations: all.map((o) => ({ code: o.code, title: o.title, ...o.exposure.ai })) });
  writeIfChanged('data/exposure/robot_exposure.json', { schema_version: '1.0.0', dataset: 'robot_exposure', generated: TODAY, sources: { robot_occ: S.robot_occ, onet: S.onet }, occupations: all.map((o) => ({ code: o.code, title: o.title, anthropic_robot_exposure_index: o.exposure.robotics.anthropic_robot_exposure_index, onet_degree_of_automation: o.exposure.robotics.onet_degree_of_automation, top_developers: [...new Set(o.exposure.robotics.cited_systems.map((s) => s.developer))].slice(0, 5) })) });

  console.log(`occupations: ${all.length}, shards: ${groups.size}, robot platforms: ${plat.length}, BLS-OEWS matched: ${all.filter((o) => o.bls.oews).length}, EP matched: ${all.filter((o) => o.bls.projections).length}`);
  console.log(written.length ? 'changed:\n  ' + written.join('\n  ') : 'no data changes');
  fs.writeFileSync(path.join(CACHE, 'last-refresh.json'), JSON.stringify({ date: TODAY, changed: written }, null, 1));
}
main().then(() => (process.argv.includes('--no-verify') ? null : require('./verify-platforms').run())).then(() => require('./build-manifest')).catch((e) => { console.error(e); process.exit(1); });
