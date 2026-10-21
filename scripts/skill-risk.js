#!/usr/bin/env node
/**
 * Per-skill AI / robotics risk + future-proof pathway search (Drew's method).
 * Reads data/occupations/*.json, adds derived.skill_risk, derived.safe_skills, derived.at_risk_skills,
 * derived.skill_risk_summary, derived.future_proof_pathways (additive; nothing else in the record changes),
 * and writes data/skills/skill_risk.json (global per-skill table + method).
 * Run standalone (`node scripts/skill-risk.js`) or via scripts/refresh.js (runs after shards are written).
 * Method and thresholds: README "Skill risk and future-proof pathways" and docs/FRONTEND_HANDOFF.md section 5.
 */
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { parse } = require('csv-parse/sync');
const SRC = require('./sources');
const { ROOT, today } = require('./lib');

const CACHE = path.join(ROOT, '.cache');
const r3 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 1000) / 1000);
const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));

// ---------------- Fixed, documented parameters ----------------
const P = {
  ai_weights: { anthropic_task_penetration: 0.75, eloundou_task_beta: 0.25 }, // per-task AI blend when both exist
  robot_tier_score: { E0: 0, E1: 1 / 3, E2: 2 / 3, E3: 1 }, // Anthropic tier / 3; non-physical rated task = 0
  doa_fallback_scale: 0.5, // unrated task: robotics = 0.5 * (O*NET degree of automation - 1) / 4
  bands: { safe_below: 0.3, at_risk_from: 0.5 }, // combined risk: <0.30 safe, >=0.50 at_risk, else moderate
  min_importance_for_lists: 2.5, // safe_skills / at_risk_skills only include skills with importance >= 2.5 (O*NET "relevant")
  pathways: {
    required_importance: 2.5, // target skills counted in overlap
    level_tolerance: 0.5, // user level >= target level - 0.5 counts as full coverage
    partial_span: 1.5, // coverage falls linearly to 0 over the next 1.5 level points
    min_safe_overlap: 0.3,
    moderate_credit: 0.5, // a 'moderate' skill (not safe, not at risk) counts half; at_risk skills count 0
    similarity_floor: 0.5, min_similarity: 0.35, // similarity_factor = 0.5 + 0.5 x max(0, cosine of distinctive skill-importance profiles)
    min_interest_fit: 0.1, fit_floor: 0.5, // fit = mean cosine of centred RIASEC interests and specific interest areas (O*NET 31 OI scale); < 0.1 dropped; fit_factor = 0.5 + 0.5 x max(0, fit); neutral 1 if either job lacks interest data
    pay: { log_scale: 0.4, min: 0.5, max: 1.08 }, // pay_factor = clamp(1 + 0.4 x ln(target median / current median), 0.5, 1.08); 1 and pay_missing:true if either wage missing
    hub: { top_k: 30, df0: 20, alpha: 0.4, min: 0.5, max_share: 0.1, similarity_relief: 0.5 }, // hub_factor = max(0.5, 1 / (1 + 0.4 x ln(1 + appearances / 20))); appearances = sources with the target in their pre-damping top 30; hard cap: a target is kept for at most 10% of occupations (highest scores first)
    licensed_doctor: { soc_pattern: '^29-(1011|102\\d|1041|1081|1131|12\\d\\d)', education: 'doctoral|professional degree' }, // MD/DO, DDS/DMD, DC, OD, DPM, DVM practitioner codes whose BLS typical education is a doctoral or professional degree: only reachable from the same group, every tier and reskilling
    gated: { zone: 5, health_doctoral_prefix: '29-1', health_science_families: ['29', '19'], min_source_zone: 4 }, // see method.gating
    reskill: { when_fewer_than: 3, min_skill_fit: 0.4, max_new_skills: 4, new_skill_gap: 1.0, top_n: 5 }, // reskilling_pathways only for jobs with < 3 future_proof pathways
    min_exposure_drop: 0.1, // target combined exposure must be <= source - 0.10 (absolute)
    max_exposure_ratio: 0.85, // ... and <= 85% of the source's
    min_growth: 0, // BLS 2025-35 change percent must be >= 0 (missing growth = not eligible)
    growth_cap: 20, growth_factor: (g) => 1 + Math.min(g, 20) / 40, // 1.0 .. 1.5
    gap_scale: 2, gap_max_penalty: 0.5, // gap_factor = 1 - 0.5 * min(1, mean_shortfall / 2)
    related_bonus: 1.1, // O*NET related occupation (bonus only)
    max_job_zone_jump: 2,
    min_required_skills: 6, // if a target has fewer than 6 skills at importance >= 2.5, its top 6 skills by importance are used
    distinctiveness: 'weight = importance x (0.5 + min(2, max(0, importance - mean importance of that skill across all occupations)) / 2)',
    job_zone_drop_free: 1, job_zone_drop_penalty: 0.25, job_zone_factor_min: 0.5, max_job_zone_drop: 1, // zone_factor = max(0.5, 1 - 0.25 x max(0, source zone - target zone - 1))
    top_n: 10,
    // Tiered fallback (only when fewer than min_pathways strict pathways): every job gets >= 3 lower-exposure pathways, each labelled with its tier.
    fallback: {
      min_pathways: 3,
      tier2: { label: 'Relaxed thresholds', min_exposure_drop: 0.03, max_exposure_ratio: 0.95, min_safe_overlap: 0.15, min_similarity: 0.2, interest_fit_filter: false, require_wages: true },
      tier3: { label: 'Broader move (retraining likely)', min_exposure_drop: 0, max_exposure_ratio: 1, min_skill_fit: 0, min_similarity: 0.1, similarity_percentile: 0.9, interest_fit_filter: false, require_wages: true, allow_equal_when_source_is_minimum: true, max_job_zone_drop: 2, near_floor_band: 0.06, near_floor_target_max: 0.1 }, // near_floor: only for sources at or below 6% exposure that still lack 3 pathways; targets under 10% exposure (similarly low, not necessarily lower), labelled
    },
    exclude_target_title: /, All Other$/, // catch-all BLS residual codes are not shown as pathways
  },
};

function onetTable(name) {
  const zp = path.join(CACHE, SRC.onet.file);
  if (fs.existsSync(zp)) {
    const e = new AdmZip(zp).getEntries().find((x) => x.entryName.endsWith('/' + name));
    if (e) return parse(e.getData().toString('utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true });
  }
  throw new Error(`O*NET ${name} not found in ${zp}; run scripts/refresh.js (downloads it)`);
}
function eloundouTasks() {
  const f = path.join(CACHE, SRC.eloundou_tasks.file);
  if (!fs.existsSync(f)) { console.warn('skill-risk: Eloundou task labels missing, falling back to occupation-level beta'); return new Map(); }
  const rows = parse(fs.readFileSync(f, 'utf8'), { columns: true, delimiter: '\t', skip_empty_lines: true, relax_quotes: true });
  const B = { E0: 0, E1: 1, E2: 0.5, E3: 0 }; // beta = E1 + 0.5*E2 (GPT-4 rubric labels)
  const m = new Map();
  for (const r of rows) { const id = String(parseInt(r['Task ID'], 10)); if (r.gpt4_exposure in B) m.set(id, B[r.gpt4_exposure]); }
  return m;
}

function loadAll() {
  const dir = path.join(ROOT, 'data/occupations');
  const shards = fs.readdirSync(dir).filter((f) => /^\d\d\.json$/.test(f)).sort();
  const docs = shards.map((f) => ({ f, d: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
  return { docs, all: docs.flatMap((x) => x.d.occupations) };
}

function compute(all) {
  // ---- task -> GWA links (O*NET tasks_to_dwas + gwas_to_iwas_to_dwas)
  const dwaGwa = new Map(onetTable('gwas_to_iwas_to_dwas.csv').map((r) => [r['DWA Element ID'], r['GWA Element ID']]));
  const taskGwas = new Map(); // task id -> Map(gwa -> count)
  for (const r of onetTable('tasks_to_dwas.csv')) {
    const g = dwaGwa.get(r['DWA Element ID']); if (!g) continue;
    const m = taskGwas.get(r['Task ID']) || taskGwas.set(r['Task ID'], new Map()).get(r['Task ID']);
    m.set(g, (m.get(g) || 0) + 1);
  }
  // ---- skill -> GWA relevance (O*NET 31 official skills-to-work-activities linkage)
  const skillGwas = new Map();
  for (const [file, col] of [['essential_skills_to_work_activities.csv', 'Essential Skills Element ID'], ['transferable_skills_to_work_activities.csv', 'Transferable Skills Element ID']])
    for (const r of onetTable(file)) (skillGwas.get(r[col]) || skillGwas.set(r[col], new Set()).get(r[col])).add(r['Work Activities Element ID']);
  const eloT = eloundouTasks();
  // AIOE percentile (fallback prior)
  const aioe = all.map((o) => o.exposure.ai.felten_aioe).filter((v) => v != null).sort((a, b) => a - b);
  const aioePct = (v) => (v == null ? null : aioe.filter((x) => x <= v).length / aioe.length);
  const byCode = new Map(all.map((o) => [o.code, o]));

  const occOut = new Map();
  for (const o of all) {
    const occBeta = o.exposure.ai.eloundou_2023?.dv_beta ?? null;
    const prior = occBeta ?? aioePct(o.exposure.ai.felten_aioe) ?? o.exposure.ai.composite?.value ?? null;
    const priorSrc = occBeta != null ? 'eloundou_occupation_beta' : o.exposure.ai.felten_aioe != null ? 'felten_aioe_percentile' : 'ai_composite';
    const doa = o.exposure.robotics.onet_degree_of_automation;
    const cites = new Map(); for (const c of o.exposure.robotics.cited_systems || []) { const s = P.robot_tier_score[c.tier]; if (s != null) cites.set(c.task_id, Math.max(cites.get(c.task_id) || 0, s)); }
    const tasks = o.tasks.map((t) => {
      const pen = t.ai_task_penetration; const eb = eloT.get(String(t.id));
      let ai, aiSrc;
      if (pen != null && eb != null) { ai = P.ai_weights.anthropic_task_penetration * pen + P.ai_weights.eloundou_task_beta * eb; aiSrc = 'anthropic+eloundou_task'; }
      else if (pen != null) { ai = P.ai_weights.anthropic_task_penetration * pen + P.ai_weights.eloundou_task_beta * (prior ?? pen); aiSrc = 'anthropic+' + priorSrc; }
      else if (eb != null) { ai = eb; aiSrc = 'eloundou_task'; }
      else if (prior != null) { ai = prior; aiSrc = priorSrc; }
      else { ai = null; aiSrc = 'none'; }
      let rob, robSrc;
      const rated = t.time_share != null; // present in Anthropic robot task file
      if (rated) { rob = t.robot_tier ? P.robot_tier_score[t.robot_tier] ?? 0 : 0; robSrc = 'anthropic_robot_tier'; if (cites.has(String(t.id)) && cites.get(String(t.id)) > rob) { rob = cites.get(String(t.id)); robSrc = 'cited_system_tier'; } }
      else if (doa != null) { rob = P.doa_fallback_scale * clamp((doa - 1) / 4); robSrc = 'onet_degree_of_automation'; }
      else { rob = 0; robSrc = 'none'; }
      const comb = ai == null ? rob : 1 - (1 - ai) * (1 - rob);
      return { id: String(t.id), text: t.text, w: t.time_share ?? 1 / o.tasks.length, ai: ai ?? 0, rob, comb, aiSrc, robSrc, gw: taskGwas.get(String(t.id)) };
    });
    const tw = tasks.reduce((s, t) => s + t.w, 0) || 1;
    const occAi = tasks.reduce((s, t) => s + t.w * t.ai, 0) / tw, occRob = tasks.reduce((s, t) => s + t.w * t.rob, 0) / tw, occComb = tasks.reduce((s, t) => s + t.w * t.comb, 0) / tw;
    const aiCov = tasks.filter((t) => t.aiSrc.startsWith('anthropic')).length / (tasks.length || 1);
    const robCov = tasks.filter((t) => t.robSrc !== 'onet_degree_of_automation' && t.robSrc !== 'none').length / (tasks.length || 1);
    const linkedTasks = tasks.filter((t) => t.gw).length;
    const skillRisk = o.skills.filter((s) => s.kind === 'skill').map((s) => {
      const gset = skillGwas.get(s.id) || new Set();
      let W = 0, A = 0, R = 0, C = 0; const contrib = [];
      for (const t of tasks) {
        if (!t.gw) continue; let tot = 0, hit = 0; for (const [g, n] of t.gw) { tot += n; if (gset.has(g)) hit += n; }
        if (!hit) continue; const rel = hit / tot; const w = t.w * rel;
        if (!(w > 0)) continue;
        W += w; A += w * t.ai; R += w * t.rob; C += w * t.comb; contrib.push({ t, w });
      }
      const linked = contrib.length;
      const ai = linked ? A / W : occAi, rob = linked ? R / W : occRob;
      const combined = r3(1 - (1 - ai) * (1 - rob));
      const band = combined < P.bands.safe_below ? 'safe' : combined >= P.bands.at_risk_from ? 'at_risk' : 'moderate';
      const confidence = linked >= 3 && aiCov >= 0.7 ? 'high' : linked >= 1 ? 'medium' : 'low';
      return {
        skill: s.name, id: s.id, kind: 'skill', importance: s.importance, level: s.level ?? null,
        ai_risk: r3(ai), robotics_risk: r3(rob), combined: r3(combined), band, confidence, linked_tasks: linked,
        basis: linked ? 'linked_tasks' : 'occupation_average',
        top_tasks: contrib.sort((a, b) => b.w - a.w).slice(0, 3).map(({ t, w }) => ({ id: t.id, text: t.text, weight: r3(w / W), ai: r3(t.ai), robotics: r3(t.rob), combined: r3(t.comb) })),
      };
    }).sort((a, b) => b.importance - a.importance);
    const inf = o.inferred_from && o.inferred_from.fields.includes('tasks');
    occOut.set(o.code, {
      skillRisk,
      summary: {
        occupation_ai: r3(occAi), occupation_robotics: r3(occRob), occupation_combined: r3(occComb),
        tasks: tasks.length, tasks_linked_to_skills: linkedTasks, ai_task_coverage: r3(aiCov), robot_task_coverage: r3(robCov),
        ai_prior: priorSrc, ai_prior_value: r3(prior),
        ...(inf ? { inferred_from: { code: o.inferred_from.code, title: o.inferred_from.title, method: o.inferred_from.method, label: o.inferred_from.label, note: 'Tasks (and so task risks) are borrowed from the source occupation(s); skill risk is computed from those tasks.' } } : {}),
      },
    });
  }

  // ---- safe / at-risk lists
  for (const o of all) {
    const x = occOut.get(o.code);
    const rel = x.skillRisk.filter((s) => s.importance >= P.min_importance_for_lists);
    const pick = (s) => ({ skill: s.skill, id: s.id, kind: 'skill', importance: s.importance, level: s.level, ai_risk: s.ai_risk, robotics_risk: s.robotics_risk, combined: s.combined, confidence: s.confidence });
    x.safe = rel.filter((s) => s.band === 'safe').sort((a, b) => a.combined - b.combined).map(pick);
    x.atRisk = rel.filter((s) => s.band === 'at_risk').sort((a, b) => b.combined - a.combined).map(pick);
  }

  const x0 = {};
  // ---- pathway search over all occupations
  const PP = P.pathways;
  const meanImp = new Map(); { const acc = new Map(); for (const o of all) for (const s of o.skills) { const a = acc.get(s.id) || acc.set(s.id, [0, 0]).get(s.id); a[0] += s.importance; a[1]++; } for (const [k, [t, n]] of acc) meanImp.set(k, t / n); }
  // centred skill-importance profiles (importance minus the all-occupation mean) for profile similarity
  const ids = [...meanImp.keys()];
  const sdImp = new Map(ids.map((k) => { const xs = all.map((o) => o.skills.find((s) => s.id === k)?.importance ?? 0); const m = meanImp.get(k); return [k, Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / xs.length) || 1]; }));
  const prof = new Map(all.map((o) => { const m = new Map(o.skills.map((s) => [s.id, s.importance])); const z = ids.map((k) => ((m.get(k) ?? 0) - meanImp.get(k)) / sdImp.get(k)); const v = z.map((x) => Math.max(0, x)); const n = Math.hypot(...v) || 1; return [o.code, v.map((x) => x / n)]; }));
  const cos = (a, b) => { const x = prof.get(a), y = prof.get(b); let s = 0; for (let i = 0; i < x.length; i++) s += x[i] * y[i]; return s; };
  const dw = (s) => s.importance * (0.5 + Math.min(2, Math.max(0, s.importance - (meanImp.get(s.id) || 0))) / 2);
  const fmtPct = (v) => `${Math.round(v * 100)}%`;
  const fmtUsd = (v) => `$${Math.round(v / 1000)}K`;
  // ---- interest (RIASEC) and domain (specific interest area) profiles, O*NET 31 "OI" scale, centred per occupation
  const interestVec = (file) => { const m = new Map(); for (const r of onetTable(file)) { if (r['Scale ID'] !== 'OI') continue; const v = m.get(r['O*NET-SOC Code']) || m.set(r['O*NET-SOC Code'], new Map()).get(r['O*NET-SOC Code']); v.set(r['Element ID'], Number(r['Data Value'])); } const keys = [...new Set([...m.values()].flatMap((v) => [...v.keys()]))].sort(); const out = new Map(); for (const [c, v] of m) { const xs = keys.map((k) => v.get(k) ?? 0); const mu = xs.reduce((a2, b2) => a2 + b2, 0) / xs.length; const cx = xs.map((q) => q - mu); const n = Math.hypot(...cx); if (n > 0) out.set(c, cx.map((q) => q / n)); } return out; };
  const RIASEC = interestVec('career_interest_types.csv'), DOMAIN = interestVec('specific_interest_areas.csv');
  const vecFor = (M, o) => M.get(o.code) || (o.inferred_from ? M.get(o.inferred_from.code) : null) || null;
  const dot = (x, y) => { let q = 0; for (let i = 0; i < x.length; i++) q += x[i] * y[i]; return q; };
  // Gate: job zone 5 targets and licensed doctoral health roles (29-1xxx with a doctoral/professional degree) are only
  // reachable from job zone >= 4 sources in a related family: same SOC major group, or health (29) / science (19) for health targets.
  const GT = PP.gated; const fam = (o) => o.code.slice(0, 2);
  const docHealth = (t) => t.code.startsWith(GT.health_doctoral_prefix) && /doctoral|professional degree/i.test(t.bls.projections?.typical_education || '');
  const LD = new RegExp(PP.licensed_doctor.soc_pattern), LDe = new RegExp(PP.licensed_doctor.education, 'i');
  const licDoc = (t) => LD.test(t.code) && LDe.test(t.bls.projections?.typical_education || '');
  function gatedBlocked(o, t) {
    const dh = docHealth(t); if (!dh && t.job_zone !== GT.zone) return false;
    if (!(o.job_zone >= GT.min_source_zone)) return true;
    const related = fam(o) === fam(t) || ((dh || fam(t) === '29') && GT.health_science_families.includes(fam(o)));
    return !related;
  }
  const wageOf = (o) => o.bls.oews?.median_annual ?? null;

  // Evaluate one source -> target candidate. mode 'future_proof': overlap counts only not-at-risk skills;
  // mode 'reskilling': overlap counts every skill the user has at level, and the new skills needed must be bounded.
  const minExposure = Math.min(...all.filter((t) => (t.bls.projections?.change_percent ?? -1) >= PP.min_growth && wageOf(t) > 0 && !PP.exclude_target_title.test(t.title)).map((t) => occOut.get(t.code).summary.occupation_combined));
  // tier 3 similarity floor: min(0.10, the source's own 90th-percentile similarity to all occupations), i.e. the target is either
  // >= 0.10 similar or among the 10% of jobs most similar to the source (needed for flat skill profiles such as Dancers)
  const simPctMemo = new Map();
  const simPct = (c, q) => { const k = c + q; if (!simPctMemo.has(k)) { const xs = all.filter((t) => t.code !== c).map((t) => cos(c, t.code)).sort((a2, b2) => a2 - b2); simPctMemo.set(k, xs[Math.floor(q * (xs.length - 1))]); } return simPctMemo.get(k); };
  function evalCand(o, x, t, mode, R) {
    const E_S = x.summary.occupation_combined;
    const minDrop = R ? R.min_exposure_drop : PP.min_exposure_drop, maxRatio = R ? R.max_exposure_ratio : PP.max_exposure_ratio, minSim = R ? R.min_similarity : PP.min_similarity;
    if (t.code === o.code || PP.exclude_target_title.test(t.title)) return null;
    const E_T = occOut.get(t.code).summary.occupation_combined; const g = t.bls.projections?.change_percent;
    if (g == null || g < PP.min_growth) return null;
    if (R && R.require_wages && !(wageOf(t) > 0)) return null; // target needs a BLS wage; a source without one (e.g. military, some arts) gets pay_missing
    if (R && R.near_floor) { if (!(E_S <= R.near_floor && E_T <= FB.tier3.near_floor_target_max)) return null; }
    else if (R && R.allow_equal && E_S <= minExposure + 1e-9) { if (E_T > E_S + 1e-9) return null; }
    else if (R && R.min_exposure_drop === 0) { if (!(E_T < E_S - 1e-9)) return null; }
    else if (!(E_T <= E_S - minDrop && E_T <= E_S * maxRatio)) return null;
    if (o.job_zone != null && t.job_zone != null && (t.job_zone > o.job_zone + PP.max_job_zone_jump || t.job_zone < o.job_zone - ((R && R.max_job_zone_drop) ?? PP.max_job_zone_drop))) return null;
    if (gatedBlocked(o, t)) return null;
    if (licDoc(t) && !licDoc(o)) return null;
    if (R && (docHealth(t) || t.job_zone === GT.zone) && !(docHealth(o) || o.job_zone === GT.zone)) return null; // fallback tiers never open a doctoral / job-zone-5 move from a source below that level
    const sim = cos(o.code, t.code); if (sim < (R && R.similarity_percentile ? Math.min(minSim, simPct(o.code, R.similarity_percentile)) : minSim)) return null;
    const ri = vecFor(RIASEC, o) && vecFor(RIASEC, t) ? dot(vecFor(RIASEC, o), vecFor(RIASEC, t)) : null;
    const di = vecFor(DOMAIN, o) && vecFor(DOMAIN, t) ? dot(vecFor(DOMAIN, o), vecFor(DOMAIN, t)) : null;
    const fits = [ri, di].filter((v) => v != null); const fit = fits.length ? fits.reduce((a2, b2) => a2 + b2, 0) / fits.length : null;
    if (fit != null && fit < PP.min_interest_fit && !(R && R.interest_fit_filter === false)) return null;
    const fitF = fit == null ? 1 : PP.fit_floor + (1 - PP.fit_floor) * Math.max(0, fit);
    const ts = t.skills.filter((q) => q.kind === 'skill').sort((a2, b2) => b2.importance - a2.importance);
    let req = ts.filter((q) => q.importance >= PP.required_importance); if (req.length < PP.min_required_skills) req = ts.slice(0, PP.min_required_skills);
    if (!req.length) return null;
    const risk = x.riskById; const mine = x.mineById;
    let tot = 0, cov = 0, short = 0; const covered = [], gaps = [], newSkills = [];
    for (const q of req) {
      const wt = x.dw(q); tot += wt; const u = risk.get(q.id); const m = mine.get(q.id);
      // Suppressed O*NET levels (null) are unknown, not 0: compare importance instead and never report a level gap
      const known = m && m.level != null && q.level != null; const tl = q.level ?? null; const ul = m ? m.level ?? null : 0;
      const lvl = !m ? 0 : known ? (ul >= tl - PP.level_tolerance ? 1 : clamp(1 - (tl - PP.level_tolerance - ul) / PP.partial_span)) : clamp(1 - Math.max(0, q.importance - PP.level_tolerance - m.importance) / PP.partial_span);
      const strong = !!m && m.importance >= 3.5;
      const credit = !u ? 0 : mode === 'reskilling' || mode === 'broad' ? 1 : u.band === 'safe' ? 1 : u.band === 'moderate' ? PP.moderate_credit : 0;
      const cc = lvl * credit; cov += wt * cc; if (cc > 0) covered.push({ skill: q.name, band: u.band, your_level: ul == null ? null : r3(ul), target_level: tl, coverage: r3(cc) });
      const sf = m && !known ? 0 : Math.max(0, (tl ?? 0) - (ul ?? 0)); short += sf;
      if (sf >= PP.level_tolerance) gaps.push({ skill: q.name, your_level: r3(ul), target_level: tl, gap: r3(sf), already_strong: strong, you_have_it_safely: !!u && u.band !== 'at_risk' });
      if (sf >= PP.reskill.new_skill_gap && !strong) newSkills.push({ skill: q.name, your_level: r3(ul), target_level: tl, gap: r3(sf) });
    }
    const overlap = cov / tot;
    if (mode === 'future_proof' && overlap < (R ? R.min_safe_overlap : PP.min_safe_overlap)) return null;
    if (mode === 'broad' && overlap < R.min_skill_fit) return null;
    if (mode === 'reskilling' && (overlap < PP.reskill.min_skill_fit || newSkills.length > PP.reskill.max_new_skills)) return null;
    const meanShort = short / req.length; const gapF = 1 - PP.gap_max_penalty * Math.min(1, meanShort / PP.gap_scale);
    const gF = PP.growth_factor(g); const rel = x.related.has(t.code) ? PP.related_bonus : 1;
    const zF = o.job_zone != null && t.job_zone != null ? Math.max(PP.job_zone_factor_min, 1 - PP.job_zone_drop_penalty * Math.max(0, o.job_zone - t.job_zone - PP.job_zone_drop_free)) : 1;
    const sF = PP.similarity_floor + (1 - PP.similarity_floor) * Math.max(0, sim);
    const wS = wageOf(o), wT = wageOf(t); const payMissing = !(wS > 0 && wT > 0); const ratio = payMissing ? null : wT / wS;
    const payF = payMissing ? 1 : clamp(1 + PP.pay.log_scale * Math.log(ratio), PP.pay.min, PP.pay.max);
    const base = overlap * (1 - E_T) * gF * gapF * zF * sF * rel * payF * fitF;
    return { tier: R ? R.tier : 1, t, E_T, E_S, g, overlap, gapF, gF, zF, sim, sF, rel, payF, payMissing, ratio, wS, wT, ri, di, fit, fitF, base, covered, gaps, newSkills, meanShort, mode };
  }
  for (const o of all) {
    const x = occOut.get(o.code);
    x.riskById = new Map(x.skillRisk.map((q) => [q.id, q])); x.mineById = new Map(o.skills.map((q) => [q.id, q]));
    x.related = new Set((o.related || []).map((r) => r.code)); x.dw = dw;
    x.hasSafe = x.skillRisk.some((q) => q.band !== 'at_risk');
  }
  // Pass 1: candidates + pre-damping score; hub appearances = how many sources have the target in their top-K
  const hubCount = (mode, pick) => { const df = new Map(); for (const o of all) { const cs = pick(o); for (const c of cs.slice(0, PP.hub.top_k)) df.set(c.t.code, (df.get(c.t.code) || 0) + 1); } return df; };
  const assign = (mode, candsBy, df, nOut) => {
    const hubF = (code) => Math.max(PP.hub.min, 1 / (1 + PP.hub.alpha * Math.log(1 + (df.get(code) || 0) / PP.hub.df0)));
    const pairs = []; for (const [code, cs] of candsBy) for (const c of cs) { c.hubN = df.get(c.t.code) || 0; c.hubF = c.rel > 1 ? 1 : Math.pow(hubF(c.t.code), 1 - PP.hub.similarity_relief * Math.max(0, Math.min(1, c.sim))); c.score = c.base * c.hubF; pairs.push([code, c]); }
    pairs.sort((p1, p2) => p2[1].score - p1[1].score);
    const cap = Math.floor(all.length * PP.hub.max_share); const used = new Map(); const out = new Map([...candsBy.keys()].map((k) => [k, []]));
    for (const [code, c] of pairs) { const l = out.get(code); if (l.length >= nOut) continue; if ((used.get(c.t.code) || 0) >= cap) continue; l.push(c); used.set(c.t.code, (used.get(c.t.code) || 0) + 1); }
    return out;
  };
  const fpCands = new Map(all.map((o) => { const x = occOut.get(o.code); const cs = x.hasSafe ? all.map((t) => evalCand(o, x, t, 'future_proof')).filter(Boolean).sort((a2, b2) => b2.base - a2.base) : []; return [o.code, cs]; }));
  const fpDf = hubCount('future_proof', (o) => fpCands.get(o.code));
  const fpOut = assign('future_proof', fpCands, fpDf, PP.top_n);
  // Tiered fallback: fill to FB.min_pathways with tier 2 (relaxed), then tier 3 (broader). Hub damping applies (no hard cap).
  const FB = PP.fallback;
  for (const o of all) {
    const l = fpOut.get(o.code); if (l.length >= FB.min_pathways) continue;
    const x = occOut.get(o.code); const have = new Set(l.map((c) => c.t.code));
    for (const [tier, mode, R] of [[2, 'future_proof', { ...FB.tier2, tier: 2 }], [3, 'broad', { ...FB.tier3, tier: 3, allow_equal: FB.tier3.allow_equal_when_source_is_minimum }], [3, 'broad', { ...FB.tier3, tier: 3, near_floor: FB.tier3.near_floor_band }]]) {
      if (l.length >= FB.min_pathways) break;
      const cs = all.filter((t) => !have.has(t.code)).map((t) => evalCand(o, x, t, mode, R)).filter(Boolean);
      for (const c of cs) { c.hubN = fpDf.get(c.t.code) || 0; c.hubF = c.rel > 1 ? 1 : Math.pow(Math.max(PP.hub.min, 1 / (1 + PP.hub.alpha * Math.log(1 + c.hubN / PP.hub.df0))), 1 - PP.hub.similarity_relief * Math.max(0, Math.min(1, c.sim))); c.score = c.base * c.hubF; }
      cs.sort((a2, b2) => b2.score - a2.score);
      for (const c of cs) { if (l.length >= FB.min_pathways) break; l.push(c); have.add(c.t.code); }
    }
    const t1 = l.filter((c) => c.tier === 1); const rest = l.filter((c) => c.tier > 1).sort((a2, b2) => a2.tier - b2.tier || b2.score - a2.score); l.length = 0; l.push(...t1, ...rest);
  }
  const needReskill = all.filter((o) => fpOut.get(o.code).filter((c) => c.tier === 1).length < PP.reskill.when_fewer_than);
  const rsCands = new Map(needReskill.map((o) => { const x = occOut.get(o.code); const have = new Set(fpOut.get(o.code).map((c) => c.t.code)); return [o.code, all.map((t) => (have.has(t.code) ? null : evalCand(o, x, t, 'reskilling'))).filter(Boolean).sort((a2, b2) => b2.base - a2.base)]; }));
  const rsDf = hubCount('reskilling', (o) => rsCands.get(o.code) || []);
  const rsOut = assign('reskilling', rsCands, rsDf, PP.reskill.top_n);

  const fmt = (o) => (c, i) => {
    const tierTxt = c.tier === 2 ? 'Tier 2 (relaxed thresholds): fewer than 3 jobs met the strict pathway thresholds, so this one was found with a smaller required exposure drop (3 points), lower skill overlap (15%) and similarity (0.20), and no interest-fit cut. ' : c.tier === 3 ? (c.E_T >= c.E_S - 1e-9 ? `Tier 3 (broader move): your job is already among the least exposed (${fmtPct(c.E_S)}), and too few jobs are less exposed, so this is a similarly low-exposure job (under 10%) with growth and pay data, not a lower one. ` : 'Tier 3 (broader move): no strict or relaxed match existed, so this is the best-scoring less exposed job with non-negative growth and pay data; expect retraining. ') : '';
    const topCov = c.covered.sort((a2, b2) => b2.coverage - a2.coverage).slice(0, 4).map((q) => q.skill);
    const mainGaps = c.gaps.sort((a2, b2) => b2.gap - a2.gap).slice(0, 3);
    const gtxt = c.g > 0 ? `BLS projects ${c.g.toFixed(1)}% job growth for 2025-35` : 'BLS projects flat employment for 2025-35 (0.0%)';
    const pct = c.ratio == null ? null : Math.round((c.ratio - 1) * 100);
    const ptxt = c.payMissing ? 'Pay comparison unavailable (BLS median wage missing for one of the two jobs).'
      : Math.abs(pct) <= 5 ? `Similar pay (median ${fmtUsd(c.wT)} vs ${fmtUsd(c.wS)}).`
      : pct < 0 ? `Pay cut of ${-pct}% (median ${fmtUsd(c.wT)} vs ${fmtUsd(c.wS)}).` : `Pay rise of ${pct}% (median ${fmtUsd(c.wT)} vs ${fmtUsd(c.wS)}).`;
    const reusedAtRisk = c.covered.filter((q) => q.band === 'at_risk').slice(0, 3).map((q) => q.skill);
    const lead = tierTxt + (c.mode === 'reskilling' || c.mode === 'broad'
      ? (c.newSkills.length ? `Needs retraining: ${c.newSkills.length} new skill${c.newSkills.length === 1 ? '' : 's'} to learn (${c.newSkills.map((q) => q.skill).join(', ')}). ` : `Needs retraining: no large skill gaps, but expect role-specific training or certification. `)
        + `Your current skills cover ${fmtPct(c.overlap)} of what this role needs${reusedAtRisk.length ? `, including ${reusedAtRisk.join(', ')}, which are at risk in your current job but used in a less exposed way here` : ''}. `
      : `Your skills that are not at risk cover ${fmtPct(c.overlap)} of what this role needs (${topCov.join(', ')}). `);
    const reason = lead + `Its tasks are about ${fmtPct(c.E_T)} exposed to AI and robots, versus ${fmtPct(c.E_S)} in your current job. ${gtxt}. ${ptxt}`
      + (c.mode !== 'reskilling' ? (mainGaps.length ? ` To close: ${mainGaps.map((gp) => `${gp.skill} (${gp.already_strong ? 'deepen, ' : ''}level ${gp.your_level} to ${gp.target_level})`).join(', ')}.` : ' No significant skill gaps.') : '');
    return {
      rank: i + 1, code: c.t.code, title: c.t.title, score: r3(c.score),
      breakdown: { [c.mode === 'reskilling' || c.mode === 'broad' ? 'skill_fit' : 'safe_overlap']: r3(c.overlap), target_combined_exposure: r3(c.E_T), source_combined_exposure: r3(c.E_S), exposure_drop: r3(c.E_S - c.E_T), exposure_factor: r3(1 - c.E_T), growth_percent: c.g, growth_factor: r3(c.gF), mean_level_shortfall: r3(c.meanShort), gap_factor: r3(c.gapF), job_zone_factor: r3(c.zF), profile_similarity: r3(c.sim), similarity_factor: r3(c.sF), interest_fit: r3(c.ri), domain_fit: r3(c.di), fit_factor: r3(c.fitF), current_median_wage: c.wS ?? null, target_median_wage: c.wT ?? null, pay_ratio: r3(c.ratio), pay_factor: r3(c.payF), pay_missing: c.payMissing, hub_appearances: c.hubN, hub_factor: r3(c.hubF), onet_related_bonus: r3(c.rel) },
      ...(c.mode === 'reskilling' ? { needs_retraining: true, new_skills: c.newSkills } : { future_proof: true, tier: c.tier, tier_label: c.tier === 1 ? 'Strict match' : PP.fallback['tier' + c.tier].label, ...(c.mode === 'broad' ? { needs_retraining: true, new_skills: c.newSkills } : {}) }), onet_related: c.rel > 1,
      covered_safe_skills: c.covered.slice(0, 8), skill_gaps: mainGaps,
      median_annual_wage: c.wT ?? null, job_zone: c.t.job_zone ?? null,
      growth_basis: c.t.bls.projections?.inferred_from ? `Group estimate (BLS projections for ${c.t.bls.projections.inferred_from.title || c.t.bls.projections.inferred_from.code}, 2025-35)` : c.t.bls.projections?.shared_soc ? c.t.bls.projections.shared_soc.label : `BLS projection for this occupation (${c.t.bls.projections.title || c.t.title}, ${c.t.bls.projections.period || '2025-35'})`,
      task_shares: { note: 'Same basis as the AI and robotics task-share cards (share of tasks), for comparison; the pathway exposure above is the time-weighted combined task risk.', target: { ai_task_share: c.t.exposure.ai.task_share?.share ?? null, robotics_exposed_task_share: c.t.exposure.robotics.exposed_task_share ?? null }, current: { ai_task_share: o.exposure.ai.task_share?.share ?? null, robotics_exposed_task_share: o.exposure.robotics.exposed_task_share ?? null } },
      ...(c.t.inferred_from ? { target_inferred_from: { code: c.t.inferred_from.code, title: c.t.inferred_from.title, method: c.t.inferred_from.method, label: c.t.inferred_from.label } } : {}),
      reason,
    };
  };
  for (const o of all) {
    const x = occOut.get(o.code); const E_S = x.summary.occupation_combined;
    x.pathways = fpOut.get(o.code).map(fmt(o));
    x.reskilling = (rsOut.get(o.code) || []).map(fmt(o));
    const nonRisk = x.skillRisk.filter((q) => q.importance >= P.min_importance_for_lists && q.band !== 'at_risk').length, relN = x.skillRisk.filter((q) => q.importance >= P.min_importance_for_lists).length;
    const rsTxt = x.reskilling.length ? ` See reskilling_pathways (${x.reskilling.length}) for less exposed jobs that need a bounded amount of retraining.` : '';
    const strictN = x.pathways.filter((q) => q.tier === 1).length;
    const fbTxt = strictN < PP.fallback.min_pathways && x.pathways.length > strictN ? ` ${x.pathways.length - strictN} broader pathway${x.pathways.length - strictN === 1 ? ' is' : 's are'} shown from the tiered fallback (tier 2 relaxed thresholds, tier 3 broader move), each labelled.` : '';
    x.pathwayNote = strictN >= PP.fallback.min_pathways ? null : strictN ? `Only ${strictN} job${strictN === 1 ? '' : 's'} met the strict thresholds.${fbTxt}` : (
      relN && nonRisk / relN < 0.35 ? `Most of this job's skills are at risk (${relN - nonRisk} of ${relN} relevant skills), so no lower-exposure job is mostly covered by the skills that are not.${rsTxt || ' A move will need retraining; see at_risk_skills and transitions.'}`
      : !x.hasSafe ? `No skills in this job fall below the at-risk band, so no pathway can be built from them.${rsTxt}`
      : E_S < P.bands.safe_below + PP.min_exposure_drop ? 'This job is already among the least exposed: no other job with non-negative growth is meaningfully less exposed (by the strict 10-point margin).'
      : `No occupation met all the thresholds (skill overlap, lower exposure, non-negative growth, job zone, skill and interest fit).${rsTxt}`) + fbTxt;
  }
  x0.hubStats = { future_proof: [...fpOut.values()].flat().reduce((m, c) => m.set(c.t.title, (m.get(c.t.title) || 0) + 1), new Map()), reskilling: [...rsOut.values()].flat().reduce((m, c) => m.set(c.t.title, (m.get(c.t.title) || 0) + 1), new Map()) };

  // ---- global per-skill table
  const g = new Map();
  for (const o of all) for (const s of occOut.get(o.code).skillRisk) {
    const e = g.get(s.id) || g.set(s.id, { id: s.id, skill: s.skill, w: 0, a: 0, r: 0, c: 0, n: 0, safe: 0, at: 0, vals: [] }).get(s.id);
    e.w += s.importance; e.a += s.importance * s.ai_risk; e.r += s.importance * s.robotics_risk; e.c += s.importance * s.combined; e.n++; e.vals.push(s.combined);
    if (s.band === 'safe') e.safe++; if (s.band === 'at_risk') e.at++;
  }
  const globalSkills = [...g.values()].map((e) => { const v = e.vals.sort((a, b) => a - b); const c = r3(e.c / e.w); return { id: e.id, skill: e.skill, kind: 'skill', ai_risk: r3(e.a / e.w), robotics_risk: r3(e.r / e.w), combined: r3(c), band: c < P.bands.safe_below ? 'safe' : c >= P.bands.at_risk_from ? 'at_risk' : 'moderate', occupations: e.n, occupations_safe: e.safe, occupations_at_risk: e.at, p10: r3(v[Math.floor(v.length * 0.1)]), median: r3(v[Math.floor(v.length / 2)]), p90: r3(v[Math.floor(v.length * 0.9)]) }; }).sort((a, b) => a.combined - b.combined);
  return { occOut, globalSkills, hubStats: x0.hubStats };
}

const METHOD = {
  summary: 'Each O*NET task gets an AI risk and a robotics risk from task-level research data. Tasks are linked to skills through O*NET Detailed Work Activities -> Generalized Work Activities and O*NET\'s official skills-to-work-activities linkage. A skill\'s risk in an occupation is the time-share x link-relevance weighted mean of its linked tasks\' risks.',
  task_ai_risk: 'Anthropic Economic Index task penetration (exact task text match) blended 0.75 / 0.25 with the Eloundou et al. GPT-4 task label (beta: E1=1, E2=0.5, E0=0). If a task has no Eloundou label the 0.25 uses the occupation prior (Eloundou occupation dv_beta, else Felten AIOE percentile, else AI composite). Tasks without Anthropic penetration use the Eloundou task label, else the prior.',
  task_robotics_risk: 'Anthropic "What work can robots do?" tier / 3 (E0=0, E1=0.33, E2=0.67, E3=1; non-physical rated tasks 0), raised to the tier of any cited robot system tagged to that task_id. Tasks not in the Anthropic robot file: 0.5 x (O*NET degree of automation - 1) / 4.',
  task_combined: '1 - (1 - ai) x (1 - robotics)',
  task_to_skill_link: 'relevance(task, skill) = share of the task\'s DWA links whose GWA is linked to the skill in O*NET 31 essential_skills_to_work_activities / transferable_skills_to_work_activities. Weight = task time_share (Anthropic) x relevance.',
  skill_risk: 'weighted mean of linked task ai / robotics risk; combined = 1 - (1 - ai)(1 - robotics). If no task of the occupation links to the skill, the occupation\'s time-weighted task average is used (basis "occupation_average", confidence low).',
  confidence: 'high: >= 3 linked tasks and >= 70% of tasks with Anthropic task penetration; medium: >= 1 linked task; low: occupation average.',
  bands: `safe: combined < ${P.bands.safe_below}; at_risk: combined >= ${P.bands.at_risk_from}; moderate otherwise. safe_skills / at_risk_skills list only skills with importance >= ${P.min_importance_for_lists}; the two lists are disjoint and contain skills only (never abilities or knowledge).`,
  exposure_vs_task_share_cards: 'The pathway exposure (skill_risk_summary.occupation_combined, breakdown.target_combined_exposure) is the time-weighted average combined task risk: each task scores 0..1 for AI and robotics and is weighted by its time share. The task-share cards count tasks instead: exposure.ai.task_share.share = share of tasks with any Anthropic usage; exposure.robotics.exposed_task_share = share of tasks rated E1-E3. A job can have a high AI task share (many tasks touched) but lower combined risk (low penetration or little time on them), and vice versa. Each pathway carries task_shares.target / task_shares.current so both measures can be shown side by side.',
  occupation_combined: 'time-weighted mean of task combined risk (derived.skill_risk_summary.occupation_combined). This is the exposure figure used by the pathway search.',
  pathways: `Every occupation is a candidate (O*NET related gets a x${P.pathways.related_bonus} bonus only). safe_overlap = importance x distinctiveness weighted share of the target's required skills (importance >= ${P.pathways.required_importance}, at least the top ${P.pathways.min_required_skills}) covered by the user's skills: credit 1 for safe, ${P.pathways.moderate_credit} for moderate, 0 for at_risk, times level match (1 at level >= target - ${P.pathways.level_tolerance}, falling to 0 over ${P.pathways.partial_span} more points). score = safe_overlap x exposure_factor (1 - target combined exposure) x growth_factor (1 + min(growth%, 20)/40) x gap_factor (1 - 0.5 x min(1, mean level shortfall / 2)) x job_zone_factor x similarity_factor (0.5 + 0.5 x skill-profile cosine) x fit_factor (0.5 + 0.5 x mean of RIASEC-interest and specific-interest-area cosines) x pay_factor (clamp(1 + ${P.pathways.pay.log_scale} x ln(target/current BLS median wage), ${P.pathways.pay.min}, ${P.pathways.pay.max}); 1 with pay_missing when a wage is missing) x hub_factor (max(${P.pathways.hub.min}, 1 / (1 + ${P.pathways.hub.alpha} x ln(1 + appearances / ${P.pathways.hub.df0}))) ^ (1 - ${P.pathways.hub.similarity_relief} x skill-profile similarity), so a popular target is damped hard for unrelated sources and barely for closely related ones; O*NET related targets are exempt (hub_factor 1) because the related list is independent evidence the move is real; appearances = sources with the target in their pre-damping top ${P.pathways.hub.top_k}) x related_bonus. Eligible only if: target exposure <= source - ${P.pathways.min_exposure_drop} and <= ${P.pathways.max_exposure_ratio} x source; BLS 2025-35 growth >= 0; safe_overlap >= ${P.pathways.min_safe_overlap}; job zone within +${P.pathways.max_job_zone_jump}/-${P.pathways.max_job_zone_drop}; skill-profile similarity >= ${P.pathways.min_similarity}; interest fit >= ${P.pathways.min_interest_fit} (when both jobs have interest data); not an ", All Other" code. Slots are filled highest score first across all occupations and no target is kept for more than ${P.pathways.hub.max_share * 100}% of occupations. Top ${P.pathways.top_n} kept.`,
  tiered_fallback: 'Every occupation gets at least 3 future_proof_pathways. Tier 1 (tier_label "Strict match") = the rules above. If fewer than 3 tier-1 pathways exist, the list is filled (never replaced) in order: tier 2 "Relaxed thresholds" = same scoring and safe-skill crediting, but exposure drop >= 0.03 and <= 95% of the source, safe_overlap >= 0.15, similarity >= 0.20, no interest-fit cut, target must have a BLS median wage; tier 3 "Broader move (retraining likely)" = any job with strictly lower combined exposure, non-negative BLS growth and a BLS median wage, job zone +2/-2, gating kept (and in tiers 2-3 a job zone 5 or doctoral health target needs a source that is itself job zone 5 or doctoral health), overlap credits every skill at level (breakdown.skill_fit, needs_retraining: true); only for sources at or below 6% exposure that still lack 3 is a target under 10% exposure allowed (similarly low, not necessarily lower, and the reason says so). Tier 3 similarity floor: min(0.10, the source own 90th-percentile similarity to all occupations). MD/DO, DDS/DMD, DC, OD, DPM and DVM practitioner targets (licensed_doctor) are only reachable from the same group, in every tier and in reskilling. Fallback items keep hub damping but not the 10% hard cap, are sorted by tier then score, and every reason starts with "Tier 2" / "Tier 3".',
  gating: 'Targets in O*NET job zone 5, and licensed doctoral health roles (SOC 29-1xxx whose BLS typical education is a doctoral or professional degree), are only eligible when the source is job zone >= 4 AND in a related family: the same SOC major group, or, for health targets, a health (29) or science (19) source. Applies to future_proof and reskilling pathways.',
  reskilling_pathways: `Only for occupations with fewer than ${P.pathways.reskill.when_fewer_than} future_proof_pathways. Same eligibility, factors, hub damping and cap, but skill_fit credits every skill the user has at level (any risk band), needs skill_fit >= ${P.pathways.reskill.min_skill_fit}, and allows at most ${P.pathways.reskill.max_new_skills} new skills (target skills with a level gap >= ${P.pathways.reskill.new_skill_gap}). Each item has needs_retraining: true and new_skills[]; never mixed into future_proof_pathways. Top ${P.pathways.reskill.top_n}.`,
};

function sourcesMeta() {
  const keys = ['onet', 'aei_task', 'eloundou', 'eloundou_tasks', 'aioe', 'robot_tasks', 'robot_occ', 'ep'];
  return Object.fromEntries(keys.filter((k) => SRC[k]).map((k) => { const f = path.join(CACHE, SRC[k].file); return [k, { name: SRC[k].name, version: SRC[k].version, url: SRC[k].url, retrieved_at: fs.existsSync(f) ? fs.statSync(f).mtime.toLocaleDateString('en-CA') : today() }]; }));
}

// Adds the derived.* skill-risk fields to every occupation object in place; returns the skill_risk.json document.
function apply(all) {
  const { occOut, globalSkills, hubStats } = compute(all);
  for (const o of all) {
    const x = occOut.get(o.code);
    o.derived.skill_risk = x.skillRisk;
    o.derived.safe_skills = x.safe;
    o.derived.at_risk_skills = x.atRisk;
    o.derived.skill_risk_summary = x.summary;
    o.derived.future_proof_pathways = x.pathways;
    o.derived.reskilling_pathways = x.reskilling;
    if (x.pathwayNote) o.derived.future_proof_note = x.pathwayNote; else delete o.derived.future_proof_note;
    o.derived.skill_risk_method = 'See data/skills/skill_risk.json "method" and README "Skill risk and future-proof pathways".';
  }
  const n = all.length; const cnt = (f) => all.filter(f).length;
  const coverage = {
    occupations: n, skills_scored: all.reduce((s, o) => s + o.derived.skill_risk.length, 0),
    skill_scores_by_confidence: ['high', 'medium', 'low'].reduce((m, c) => ({ ...m, [c]: all.reduce((s, o) => s + o.derived.skill_risk.filter((x) => x.confidence === c).length, 0) }), {}),
    skill_scores_by_band: ['safe', 'moderate', 'at_risk'].reduce((m, c) => ({ ...m, [c]: all.reduce((s, o) => s + o.derived.skill_risk.filter((x) => x.band === c).length, 0) }), {}),
    tasks: all.reduce((s, o) => s + o.tasks.length, 0), tasks_linked_to_skills: all.reduce((s, o) => s + o.derived.skill_risk_summary.tasks_linked_to_skills, 0),
    occupations_with_safe_skills: cnt((o) => o.derived.safe_skills.length), occupations_with_at_risk_skills: cnt((o) => o.derived.at_risk_skills.length),
    occupations_with_pathways: cnt((o) => o.derived.future_proof_pathways.length), occupations_with_3plus_pathways: cnt((o) => o.derived.future_proof_pathways.length >= 3), occupations_with_reskilling_pathways: cnt((o) => o.derived.reskilling_pathways.length), occupations_with_neither: cnt((o) => !o.derived.future_proof_pathways.length && !o.derived.reskilling_pathways.length),
    top_hub_targets: [...hubStats.future_proof.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([title, n]) => ({ title, appearances: n })), occupations_inferred_tasks: cnt((o) => o.derived.skill_risk_summary.inferred_from),
  };
  return { schema_version: '1.0.0', dataset: 'skill_risk', generated: today(), sources: sourcesMeta(), method: METHOD, parameters: { ...P, pathways: { ...P.pathways, growth_factor: '1 + min(growth_percent, 20) / 40',  exclude_target_title: String(P.pathways.exclude_target_title) } }, coverage, count: globalSkills.length, skills: globalSkills };
}

function writeSkillRisk(out) {
  fs.mkdirSync(path.join(ROOT, 'data/skills'), { recursive: true });
  const p = path.join(ROOT, 'data/skills/skill_risk.json');
  const strip = (o) => JSON.stringify({ ...o, generated: null, sources: Object.fromEntries(Object.entries(o.sources || {}).map(([k, v]) => [k, { ...v, retrieved_at: null }])) });
  const prev = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  if (!prev || strip(prev) !== strip(out)) { fs.writeFileSync(p, JSON.stringify(out, null, 1) + '\n'); return true; }
  return false;
}

// Standalone: recompute from the committed shards (no downloads besides what is already in .cache).
function run() {
  const { docs, all } = loadAll();
  const out = apply(all);
  let changed = 0;
  for (const { f, d } of docs) {
    const abs = path.join(ROOT, 'data/occupations', f); const txt = JSON.stringify(d) + '\n';
    if (fs.readFileSync(abs, 'utf8') !== txt) { fs.writeFileSync(abs + '.tmp', txt); fs.renameSync(abs + '.tmp', abs); changed++; }
  }
  writeSkillRisk(out);
  console.log(`skill-risk: ${changed} shard(s) updated; coverage ${JSON.stringify(out.coverage)}`);
  return out;
}
module.exports = { run, apply, compute, writeSkillRisk, P, METHOD };
if (require.main === module) run();
