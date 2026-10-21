#!/usr/bin/env node
/**
 * Agentic skills catalog matched to each job's tasks (brings back the old smartpivot.xyz "Agentic skills" section).
 * Inputs (real data only): agentic_capabilities.json (agent_skills_catalog + platforms, sourced), data/exposure/task_breakdown
 * (O*NET tasks with % of time and AI % automatable), data/occupations (O*NET skills with skill-risk bands).
 * A catalog skill matches a task when the task has AI % automatable > 0 and contains that skill's phrase rule (RULES, written from
 * the skill's own description and use cases). No score is invented: task_time_share = sum of the matched tasks' time.
 * skills_to_build = the job's own O*NET skills rated Low risk (band "safe") by the skill-risk model, by O*NET importance:
 * the skills to keep and grow while agents take the matched tasks.
 * Output: data/agentic_skills.json. Usage: node scripts/agentic-skills.js
 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const cap = J('agentic_capabilities.json');
// One documented phrase rule per catalog skill, taken from its own description and use cases (word stems that
// must appear in the task text). A bag-of-words overlap was too loose (e.g. "promotions" matched personnel actions).
const RULES = {
  computer_use: /\b(spreadsheets?|desktop|computer files?|enter(ing)? data|data entry|keyboard)\b/i,
  crm_actions: /\b(customer (accounts?|records?|database)|crm|sales (records?|leads?)|prospect(s|ive customers)?|opportunit(y|ies) for sales|client accounts?)\b/i,
  customer_service_agents: /\b(customer('s|s'|s)? (inquir|question|complaint|service)|respond(ing)? to (customer|client|patron|caller|public)|appointments?|complaints|information about (products|services))/i,
  sales_automation: /\b(prospect(ing)? (customers|clients)|sales leads?|sales calls?|follow up on (sales|leads))\b/i,
  field_service_agents: /\b(work orders?|service calls?|inventor(y|ies) of (parts|supplies))\b/i,
  marketing_campaigns: /\b(marketing (campaigns?|programs?|plans?|strateg)|advertising campaigns?|promotional (campaigns?|materials?)|leads? management)\b/i,
  commerce_agents: /\b(customer orders?|orders? (status|tracking)|track(ing)? (the status of )?(orders|shipments)|product (information|recommendations?|search)|merchandise to customers|checkout|sales transactions?|(take|enter|taking|entering) (or enter )?orders)\b/i,
  rpa_actions: /\b(process(ing)? (forms|documents|invoices|claims|applications|payroll|payments|transactions)|post(ing)? (transactions|entries)|reconcile)\b/i,
  multi_agent_orchestration: /\b(compile|research|analy[sz]e)\b.*\b(reports?)\b/i,
  function_calling: /\b(databases?|query|queries|api|application programming interfaces?)\b/i,
  web_navigation: /\b(internet|web ?sites?|online (sources|databases|research)|web research|search(ing)? (the )?(web|internet))\b/i,
  document_processing: /\b(invoices?|contracts?|claims? forms?|extract(ing)? (data|information)|classify(ing)? documents|legal documents|review(ing)? documents|forms? (for|to) (completeness|accuracy))\b/i,
  pipeline_management: /\b(sales (pipeline|forecasts?)|forecast(ing)? sales|deal(s)? (tracking|status))\b/i,
  case_deflection: /\b(resolv(e|ing) (customer|client|billing|service)|customer complaints?|billing (complaints|questions|inquiries))\b/i,
  quote_generation: /\b(quot(e|es|ing|ations?) (prices?|rates|costs?)|prepare (price )?quotes?|cost estimates? for customers|price quotations?)\b/i,
};
const urlOf = new Map(cap.platforms.map((p) => [p.name, p.url]));
const catalog = cap.agent_skills_catalog.filter((k) => RULES[k.skill]).map((k) => ({ ...k, re: RULES[k.skill] }));
if (catalog.length !== cap.agent_skills_catalog.length) throw new Error('agentic-skills: a catalog skill has no matching rule');
const occ = new Map();
for (const f of fs.readdirSync(path.join(ROOT, 'data/occupations')).filter((f) => /^\d/.test(f))) for (const o of J('data/occupations/' + f).occupations) occ.set(o.code, o);
const out = {};
let jobs = 0, withMatch = 0;
for (const f of fs.readdirSync(path.join(ROOT, 'data/exposure/task_breakdown'))) for (const r of J('data/exposure/task_breakdown/' + f).occupations) {
  jobs++;
  const tasks = r.tasks.filter((t) => (t.ai_automatable ?? 0) > 0);
  const matched = [];
  for (const k of catalog) {
    const hits = tasks.map((t) => ({ t, m: t.text.match(k.re) })).filter((x) => x.m).map((x) => ({ t: x.t, shared: [x.m[0]] }));
    if (!hits.length) continue;
    hits.sort((a, b) => (b.t.time_share_normalized ?? 0) - (a.t.time_share_normalized ?? 0));
    matched.push({ skill: k.skill, description: k.description, platforms: k.platforms.map((p) => ({ name: p, url: urlOf.get(p) || null })),
      task_time_share: Math.round(hits.reduce((a, x) => a + (x.t.time_share_normalized ?? 0), 0) * 1000) / 1000,
      tasks: hits.slice(0, 5).map((x) => ({ id: x.t.id, text: x.t.text, time_share: x.t.time_share_normalized ?? null, ai_automatable: x.t.ai_automatable, matched_phrase: x.shared[0] })) });
  }
  matched.sort((a, b) => b.task_time_share - a.task_time_share);
  const o = occ.get(r.code);
  const imp = new Map((o?.skills || []).map((s) => [s.id, s.importance ?? 0]));
  const build = (o?.derived?.skill_risk || []).filter((q) => q.band === 'safe' && imp.has(q.id)).sort((a, b) => imp.get(b.id) - imp.get(a.id)).slice(0, 5)
    .map((q) => ({ id: q.id, skill: q.skill, combined_risk: q.combined, importance: imp.get(q.id) }));
  if (matched.length) withMatch++;
  out[r.code] = { matched, skills_to_build: build };
}
fs.writeFileSync(path.join(ROOT, 'data/agentic_skills.json'), JSON.stringify({ schema_version: '1.0.0', dataset: 'agentic_skills', catalog_version: cap.version, catalog_skills: catalog.length,
  method: 'A catalog skill (agentic_capabilities.json, sourced platforms) matches a task when the task has AI % automatable > 0 and contains the skill phrase rule (written from its description and use cases, listed in scripts/agentic-skills.js); task_time_share = sum of the matched tasks\' % of time. skills_to_build = the job\'s O*NET skills rated Low risk by the skill-risk model, by O*NET importance.',
  occupations: out }) + '\n');
console.log(`agentic-skills: ${jobs} jobs, ${withMatch} with at least one catalog skill matched`);
