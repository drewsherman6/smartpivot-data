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
    similarity_floor: 0.5, min_similarity: 0.3, // similarity_factor = 0.5 + 0.5 x max(0, cosine of centred skill-importance profiles)
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
  for (const o of all) {
    const x = occOut.get(o.code); const E_S = x.summary.occupation_combined;
    const safe = new Map(x.skillRisk.filter((s) => s.band !== 'at_risk').map((s) => [s.id, s]));
    const credit = (s) => (s.band === 'safe' ? 1 : PP.moderate_credit); const mine = new Map(o.skills.map((s) => [s.id, s]));
    const relatedSet = new Set((o.related || []).map((r) => r.code));
    const cands = [];
    if (safe.size) for (const t of all) {
      if (t.code === o.code || PP.exclude_target_title.test(t.title)) continue;
      const tx = occOut.get(t.code); const E_T = tx.summary.occupation_combined;
      const g = t.bls.projections?.change_percent;
      if (g == null || g < PP.min_growth) continue;
      if (!(E_T <= E_S - PP.min_exposure_drop && E_T <= E_S * PP.max_exposure_ratio)) continue;
      if (o.job_zone != null && t.job_zone != null && (t.job_zone > o.job_zone + PP.max_job_zone_jump || t.job_zone < o.job_zone - PP.max_job_zone_drop)) continue;
      const ts = t.skills.filter((s) => s.kind === 'skill').sort((a, b) => b.importance - a.importance);
      let req = ts.filter((s) => s.importance >= PP.required_importance);
      if (req.length < PP.min_required_skills) req = ts.slice(0, PP.min_required_skills);
      if (!req.length) continue;
      let tot = 0, cov = 0, short = 0; const covered = [], gaps = [];
      for (const s of req) {
        const wt = dw(s); tot += wt; const tl = s.level ?? 0; const u = safe.get(s.id);
        if (u) { const ul = u.level ?? 0; const c = ul >= tl - PP.level_tolerance ? 1 : clamp(1 - (tl - PP.level_tolerance - ul) / PP.partial_span); const cc = c * credit(u); cov += wt * cc; if (cc > 0) covered.push({ skill: s.name, band: u.band, your_level: ul, target_level: tl, coverage: r3(cc) }); }
        const ml = mine.get(s.id)?.level ?? 0; const sf = Math.max(0, tl - ml); short += sf;
        if (sf >= PP.level_tolerance) gaps.push({ skill: s.name, your_level: r3(ml), target_level: tl, gap: r3(sf), you_have_it_safely: !!u });
      }
      const overlap = cov / tot; if (overlap < PP.min_safe_overlap) continue;
      const meanShort = short / req.length; const gapF = 1 - PP.gap_max_penalty * Math.min(1, meanShort / PP.gap_scale);
      const gF = PP.growth_factor(g); const rel = relatedSet.has(t.code) ? PP.related_bonus : 1;
      const zF = o.job_zone != null && t.job_zone != null ? Math.max(PP.job_zone_factor_min, 1 - PP.job_zone_drop_penalty * Math.max(0, o.job_zone - t.job_zone - PP.job_zone_drop_free)) : 1;
      const sim = cos(o.code, t.code); if (sim < PP.min_similarity) continue; const sF = PP.similarity_floor + (1 - PP.similarity_floor) * Math.max(0, sim);
      const score = overlap * (1 - E_T) * gF * gapF * zF * sF * rel;
      cands.push({ t, tx, E_T, g, overlap, gapF, gF, zF, sim, sF, rel, score, covered, gaps, meanShort });
    }
    cands.sort((a, b) => b.score - a.score);
    x.pathways = cands.slice(0, PP.top_n).map((c, i) => {
      const topCov = c.covered.sort((a, b) => b.coverage - a.coverage).slice(0, 4).map((s) => s.skill);
      const mainGaps = c.gaps.sort((a, b) => b.gap - a.gap).slice(0, 3);
      const gtxt = c.g > 0 ? `BLS projects ${c.g.toFixed(1)}% job growth for 2025-35` : 'BLS projects flat employment for 2025-35 (0.0%)';
      const reason = `Your skills that are not at risk cover ${fmtPct(c.overlap)} of what this role needs (${topCov.join(', ')}). `
        + `Its tasks are about ${fmtPct(c.E_T)} exposed to AI and robots, versus ${fmtPct(E_S)} in your current job. ${gtxt}.`
        + (mainGaps.length ? ` To close: ${mainGaps.map((gp) => `${gp.skill} (level ${gp.your_level} to ${gp.target_level})`).join(', ')}.` : ' No significant skill gaps.');
      return {
        rank: i + 1, code: c.t.code, title: c.t.title, score: r3(c.score),
        breakdown: { safe_overlap: r3(c.overlap), target_combined_exposure: r3(c.E_T), source_combined_exposure: r3(E_S), exposure_drop: r3(E_S - c.E_T), exposure_factor: r3(1 - c.E_T), growth_percent: c.g, growth_factor: r3(c.gF), mean_level_shortfall: r3(c.meanShort), gap_factor: r3(c.gapF), job_zone_factor: r3(c.zF), profile_similarity: r3(c.sim), similarity_factor: r3(c.sF), onet_related_bonus: r3(c.rel) },
        future_proof: true, onet_related: c.rel > 1,
        covered_safe_skills: c.covered.slice(0, 8), skill_gaps: mainGaps,
        median_annual_wage: c.t.bls.oews?.median_annual ?? null, job_zone: c.t.job_zone ?? null,
        growth_basis: c.t.bls.projections?.inferred_from ? `group estimate (BLS: ${c.t.bls.projections.inferred_from.title || c.t.bls.projections.inferred_from.code})` : c.t.bls.projections?.shared_soc ? c.t.bls.projections.shared_soc.label : 'detailed',
        ...(c.t.inferred_from ? { target_inferred_from: { code: c.t.inferred_from.code, title: c.t.inferred_from.title, method: c.t.inferred_from.method, label: c.t.inferred_from.label } } : {}),
        reason,
      };
    });
    const nonRisk = x.skillRisk.filter((s) => s.importance >= P.min_importance_for_lists && s.band !== 'at_risk').length, relN = x.skillRisk.filter((s) => s.importance >= P.min_importance_for_lists).length;
    x.pathwayNote = !x.pathways.length && relN && nonRisk / relN < 0.35 ? `Most of this job's skills are at risk (${relN - nonRisk} of ${relN} relevant skills), so no lower-exposure job is mostly covered by the skills that are not. A move will need retraining; see at_risk_skills and transitions.`
      : !safe.size ? 'No skills in this job fall in the safe band, so no pathway can be built from safe skills; see moderate skills in skill_risk.'
      : !x.pathways.length ? (E_S < P.bands.safe_below + PP.min_exposure_drop ? 'This job is already among the least exposed: no other job with non-negative growth is meaningfully less exposed.' : 'No occupation met all the thresholds (safe-skill overlap, lower exposure, non-negative growth, job-zone jump).') : null;
  }

  // ---- global per-skill table
  const g = new Map();
  for (const o of all) for (const s of occOut.get(o.code).skillRisk) {
    const e = g.get(s.id) || g.set(s.id, { id: s.id, skill: s.skill, w: 0, a: 0, r: 0, c: 0, n: 0, safe: 0, at: 0, vals: [] }).get(s.id);
    e.w += s.importance; e.a += s.importance * s.ai_risk; e.r += s.importance * s.robotics_risk; e.c += s.importance * s.combined; e.n++; e.vals.push(s.combined);
    if (s.band === 'safe') e.safe++; if (s.band === 'at_risk') e.at++;
  }
  const globalSkills = [...g.values()].map((e) => { const v = e.vals.sort((a, b) => a - b); const c = r3(e.c / e.w); return { id: e.id, skill: e.skill, kind: 'skill', ai_risk: r3(e.a / e.w), robotics_risk: r3(e.r / e.w), combined: r3(c), band: c < P.bands.safe_below ? 'safe' : c >= P.bands.at_risk_from ? 'at_risk' : 'moderate', occupations: e.n, occupations_safe: e.safe, occupations_at_risk: e.at, p10: r3(v[Math.floor(v.length * 0.1)]), median: r3(v[Math.floor(v.length / 2)]), p90: r3(v[Math.floor(v.length * 0.9)]) }; }).sort((a, b) => a.combined - b.combined);
  return { occOut, globalSkills };
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
  occupation_combined: 'time-weighted mean of task combined risk (derived.skill_risk_summary.occupation_combined). This is the exposure figure used by the pathway search.',
  pathways: `Every occupation is a candidate (O*NET related gets a x${P.pathways.related_bonus} bonus only). safe_overlap = sum over target skills with importance >= ${P.pathways.required_importance} of importance x coverage / total importance, where coverage = credit x level match, credit = 1 for a skill in the user's safe band, 0.5 for moderate, 0 for at_risk; level match = 1 at level >= target level - ${P.pathways.level_tolerance}, falling linearly to 0 over the next ${P.pathways.partial_span} level points. target skills are weighted by importance x distinctiveness (generic skills every job rates highly count half; skills the target rates far above the all-occupation average count up to 1.5x); targets with fewer than 6 skills at importance >= 2.5 use their top 6. score = safe_overlap x (1 - target combined exposure) x growth_factor x gap_factor x job_zone_factor x similarity_factor x related_bonus; similarity_factor = 0.5 + 0.5 x max(0, cosine similarity of the two occupations' skill-importance profiles z-scored per skill across occupations and keeping only above-average skills, so it compares what is distinctive about each job's skill make-up; candidates below 0.3 are dropped) so the overall skill make-up counts too (safe_overlap still has the larger range: 0.3-1 vs 0.5-1); job_zone_factor = max(0.5, 1 - 0.25 x max(0, source zone - target zone - 1)) to avoid steep downshifts; growth_factor = 1 + min(growth%, 20) / 40; gap_factor = 1 - 0.5 x min(1, mean level shortfall over required target skills / 2). Eligible (future_proof) only if: target exposure <= source - ${P.pathways.min_exposure_drop} AND <= ${P.pathways.max_exposure_ratio} x source; BLS 2025-35 growth >= 0 (missing growth = not eligible); safe_overlap >= ${P.pathways.min_safe_overlap}; target job zone within source +${P.pathways.max_job_zone_jump} / -${P.pathways.max_job_zone_drop}; profile similarity >= ${P.pathways.min_similarity}. Catch-all ", All Other" codes are not used as targets. Top ${P.pathways.top_n} kept.`,
};

function sourcesMeta() {
  const keys = ['onet', 'aei_task', 'eloundou', 'eloundou_tasks', 'aioe', 'robot_tasks', 'robot_occ', 'ep'];
  return Object.fromEntries(keys.filter((k) => SRC[k]).map((k) => { const f = path.join(CACHE, SRC[k].file); return [k, { name: SRC[k].name, version: SRC[k].version, url: SRC[k].url, retrieved_at: fs.existsSync(f) ? fs.statSync(f).mtime.toLocaleDateString('en-CA') : today() }]; }));
}

// Adds the derived.* skill-risk fields to every occupation object in place; returns the skill_risk.json document.
function apply(all) {
  const { occOut, globalSkills } = compute(all);
  for (const o of all) {
    const x = occOut.get(o.code);
    o.derived.skill_risk = x.skillRisk;
    o.derived.safe_skills = x.safe;
    o.derived.at_risk_skills = x.atRisk;
    o.derived.skill_risk_summary = x.summary;
    o.derived.future_proof_pathways = x.pathways;
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
    occupations_with_pathways: cnt((o) => o.derived.future_proof_pathways.length), occupations_inferred_tasks: cnt((o) => o.derived.skill_risk_summary.inferred_from),
  };
  return { schema_version: '1.0.0', dataset: 'skill_risk', generated: today(), sources: sourcesMeta(), method: METHOD, parameters: { ...P, pathways: { ...P.pathways, growth_factor: '1 + min(growth_percent, 20) / 40', exclude_target_title: String(P.pathways.exclude_target_title) } }, coverage, count: globalSkills.length, skills: globalSkills };
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
