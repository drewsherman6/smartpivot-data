/**
 * Maps verified agent platforms to every occupation via task text.
 * For each occupation: each task gets weight = Anthropic time_share (normalized) or 1/n when unavailable.
 * A task matches a category when catalog.categoryPatterns[category] matches the task statement, any of its
 * O*NET Detailed Work Activity titles, or (weakly) the occupation's technology-skill categories.
 *   category_score = sum of weights of matched tasks (+0.05 if technology categories match), capped at 1
 *   platform_score = max over platform categories (primary x1.0, secondary x0.8) of category_score
 *                    x (0.5 + 0.5 x AI exposure composite, 0.5 when missing)
 *   x catalog.genericCategories weight for generic categories (computer_use, general_assistant, ...)
 * A platform is listed when matched task weight (no technology bonus) >= 0.05; relevance: high >= 0.30, medium >= 0.15, low otherwise.
 * Writes: occupation.agents (top 12), data/agent_platforms.json onet_mapping.occupations (all, uncapped),
 * returns data/agents_by_occupation.json content.
 */
const { readJson, writeJsonValidated, today } = require('./lib');
const C = require('./catalog');
const THRESHOLD = 0.05;
const CONF = { high: 0, medium: 1, low: 2 };
const r3 = (x) => Math.round(x * 1000) / 1000;
const METHOD = 'Task-weighted keyword overlap between platform categories (scripts/catalog.js categoryPatterns) and O*NET task statements + Detailed Work Activities (+ technology categories), times (0.5 + 0.5*AI exposure composite). Generic categories down-weighted (catalog.genericCategories). Listed when matched tasks (excluding the technology bonus) are >= 0.05 of task time; relevance high >= 0.30, medium >= 0.15, else low. Derived heuristic; see README.';

exports.mapAgents = (occs, onetGet, sources) => {
  const dwa = new Map();
  for (const r of onetGet('tasks_to_dwas.csv')) { const k = r['O*NET-SOC Code'] + '|' + r['Task ID']; dwa.set(k, (dwa.get(k) || '') + ' ' + r['DWA Element Name']); }
  const ap = readJson('data/agent_platforms.json');
  const plats = ap.platforms.filter((p) => p.status === 'verified');
  const cats = Object.keys(C.categoryPatterns);
  const forward = new Map(plats.map((p) => [p.id, []]));
  const byOcc = [];
  for (const o of occs) {
    const n = o.tasks.length;
    const tsum = o.tasks.reduce((s, t) => s + (t.time_share || 0), 0);
    const w = (t) => (tsum > 0.5 ? (t.time_share || 0) / tsum : 1 / n);
    const techText = o.technology.map((t) => t.category).join(' ').toLowerCase();
    const catScore = {}; const catTasks = {}; const catIds = {}; const taskOnly = {};
    for (const c of cats) {
      const re = C.categoryPatterns[c];
      const hits = o.tasks.filter((t) => re.test((t.text + ' ' + (dwa.get((t.source_code || o.code) + '|' + t.id) || '')).toLowerCase()));
      taskOnly[c] = hits.reduce((s, t) => s + w(t), 0);
      catScore[c] = Math.min(1, taskOnly[c] + (re.test(techText) ? 0.05 : 0));
      const sorted = hits.sort((a, b) => w(b) - w(a)); catTasks[c] = sorted.slice(0, 3).map((t) => ({ id: t.id, text: t.text })); catIds[c] = sorted.map((t) => String(t.id));
    }
    const ai = o.exposure.ai.composite?.value ?? 0.5;
    const list = [];
    for (const p of plats) {
      const pc = p.categories || [p.category];
      let best = 0, bestCat = null;
      pc.forEach((c, i) => { const v = (catScore[c] || 0) * (i === 0 ? 1 : 0.8) * (C.genericCategories[c] || 1); if (v > best) { best = v; bestCat = c; } });
      if (!bestCat || taskOnly[bestCat] < THRESHOLD) continue;
      const score = r3(best * (0.5 + 0.5 * ai));
      list.push({ id: p.id, name: p.name, url: p.url, status: p.status, category: bestCat, score, relevance: taskOnly[bestCat] >= 0.3 ? 'high' : taskOnly[bestCat] >= 0.15 ? 'medium' : 'low', matched_tasks: catTasks[bestCat], matched_task_ids: catIds[bestCat], confidence: p.confidence });
      forward.get(p.id).push({ code: o.code, score });
    }
    list.sort((a, b) => b.score - a.score || CONF[a.confidence] - CONF[b.confidence] || a.name.localeCompare(b.name));
    list.forEach((x) => delete x.confidence);
    o.agents = { platforms: list.slice(0, 12), platform_count: list.length, category_scores: Object.fromEntries(cats.map((c) => [c, r3(catScore[c])])), method: METHOD };
    byOcc.push({ code: o.code, title: o.title, platforms: list.slice(0, 12).map(({ id, name, score, category, relevance }) => ({ id, name, score, category, relevance })) });
  }
  for (const p of ap.platforms) {
    const occ = (forward.get(p.id) || []).sort((a, b) => b.score - a.score);
    p.onet_mapping = { ...(p.onet_mapping || {}), method: METHOD, occupation_count: occ.length, occupations: occ };
    delete p.onet_mapping.top_occupations;
  }
  writeJsonValidated('data/agent_platforms.json', ap, 'schemas/agent_platforms.schema.json');
  return { schema_version: '1.0.0', dataset: 'agents_by_occupation', generated: today(), sources: { onet: sources.onet }, method: METHOD, covered: byOcc.filter((x) => x.platforms.length).length, occupations: byOcc };
};
