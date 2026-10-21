// Tests for AI product -> task linkage (catalog.capabilityRules). Run by npm test.
const assert = require('assert'); const fs = require('fs'); const path = require('path');
const C = require('./catalog');
const R = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/audit', f))).items;
// 1. precision on the hand-labelled tuning samples stays >= 0.90 and on the untouched final holdout >= 0.80 (measured 0.825) and keeps >= 85% of true links
for (const [f, minP] of [['ai_links_sample_before.json', 0.9], ['ai_links_holdout_v1.json', 0.9], ['ai_links_holdout_v2.json', 0.9], ['ai_links_holdout_final.json', 0.8], ['ai_links_added_holdout.json', 0.9], ['ai_links_added_holdout2.json', 0.9], ['ai_links_holdout_final2.json', 0.8]]) {
  const d = R(f); let k = 0, tp = 0, all = 0;
  for (const x of d) { all += x.label; if (C.capabilityMatch(x.cat, x.text)) { k++; tp += x.label; } }
  assert.ok(tp / k >= minP, `${f} precision ${tp / k}`); assert.ok(tp / all >= 0.85, `${f} recall ${tp / all}`);
}
// 1b. recall: on the task holdouts (label 1 = a verified product documents a capability that performs the task), the tasks
// the data marks as targeted (agents.targeted_task_ids) cover >= 80% of true tasks (measured 0.97 tuning / 0.83 final) with >= 80% precision.
{
  const occ = new Map(); for (const f of fs.readdirSync(path.join(__dirname, '../data/occupations')).filter((x) => /^\d{2}\.json$/.test(x))) for (const o of JSON.parse(fs.readFileSync(path.join(__dirname, '../data/occupations', f))).occupations) occ.set(o.code, new Set(o.agents?.targeted_task_ids || []));
  for (const f of ['ai_recall_holdout.json', 'ai_recall_holdout_final.json']) {
    const d = R(f); const pos = d.filter((x) => x.label).length; const pred = d.filter((x) => occ.get(x.code)?.has(x.task_id)); const tp = pred.filter((x) => x.label).length;
    assert.ok(tp / pos >= 0.8, `${f} recall ${tp / pos}`); assert.ok(tp / pred.length >= 0.8, `${f} task precision ${tp / pred.length}`);
  }
}
// 2. known keyword-only false positives are rejected; core matches kept
const no = [['security_ops', 'Supply the latest price quotes on any security.'], ['legal', 'Plan or conduct basic genomic and biological research related to areas such as regulation of gene expression.'], ['security_ops', 'Monitor compliance with standard operating procedures for loss prevention, physical security, or risk management.'],['customer_service', 'Monitor financial market trends to ensure that client plans are responsive.'],
  ['it_service', 'Configure servers to meet functional specifications.'], ['software_engineering', 'Teach patient education programs that include information required to make informed health care and treatment decisions.'],
  ['healthcare_documentation', 'Record facts to prepare reports that document incidents and activities.'], ['general_assistant', 'Edit films and videotapes to insert music, dialogue, and sound effects.'],
  ['computer_use', 'Analyze and report computer network security breaches or attempted breaches.'], ['healthcare_documentation', 'Analyze records, reports, test results, or examination information to diagnose medical condition of patient.']];
for (const [c, t] of no) assert.ok(!C.capabilityMatch(c, t), `should reject ${c}: ${t}`);
const yes = [['security_ops', 'Monitor use of data files and regulate access to safeguard information in computer files.'], ['healthcare_documentation', "Monitor, record, and report symptoms or changes in patients' conditions."], ['design_creative', 'Edit graphics and photos, using pixel or bitmap editing, airbrushing, masking, or image retouching.'], ['sales_marketing', 'Develop, present, or respond to proposals for specific customer requirements, including request for proposal responses.'],['customer_service', "Answer customers' questions about products, prices, availability, or credit terms."], ['software_engineering', 'Write supporting code for Web applications or Web sites.'],
  ['healthcare_documentation', "Obtain and record patients' medical histories."], ['legal', 'Prepare legal briefs and opinions, and file appeals in state and federal courts of appeal.'],
  ['it_service', 'Troubleshoot network or connectivity problems for users or user groups.'], ['personal_assistant', 'Make travel arrangements for executives.']];
for (const [c, t] of yes) assert.ok(C.capabilityMatch(c, t), `should keep ${c}: ${t}`);
// 3. every category has a documented capability and rules
for (const c of Object.keys(C.categoryPatterns)) { const r = C.capabilityRules[c]; assert.ok(r && r.capability && r.include.length, 'rules for ' + c); }
// 4. data: every listed platform is verified and every matched task satisfies its category rule on the task statement
const ap = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/agent_platforms.json'))); const st = new Map(ap.platforms.map((p) => [p.id, p.status]));
let n = 0;
for (const f of fs.readdirSync(path.join(__dirname, '../data/occupations')).filter((x) => /^\d{2}\.json$/.test(x)))
  for (const o of JSON.parse(fs.readFileSync(path.join(__dirname, '../data/occupations', f))).occupations) {
    n++; const T = new Map(o.tasks.map((t) => [String(t.id), t.text]));
    for (const p of o.agents?.platforms || []) {
      assert.strictEqual(st.get(p.id), 'verified', `${o.code} ${p.id} not verified`);
      for (const id of p.matched_task_ids) assert.ok(C.capabilityMatch(p.category, T.get(id)), `${o.code} ${p.id} ${id}`);
    }
    const verifiedCats = new Set(ap.platforms.filter((p) => p.status === 'verified').flatMap((p) => p.categories || [p.category]));
    const tb = o.agents?.targeted_by_category; assert.ok(tb, `${o.code} targeted_by_category`);
    assert.deepStrictEqual(new Set(o.agents.targeted_task_ids), new Set(Object.values(tb).flat()), `${o.code} targeted union`);
    for (const c of Object.keys(tb)) assert.ok(verifiedCats.has(c), `${o.code} ${c} has no verified platform`);
    for (const id of o.agents?.targeted_task_ids || []) assert.ok([...verifiedCats].some((c) => C.capabilityMatch(c, T.get(id))), `${o.code} targeted ${id} has no verified capability`);
  }
assert.ok(n >= 1000);
console.log(`ai-links tests passed (${n} occupations)`);
