// Tests for AI product -> task linkage (catalog.capabilityRules). Run by npm test.
const assert = require('assert'); const fs = require('fs'); const path = require('path');
const C = require('./catalog');
const R = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/audit', f))).items;
// 1. precision on the hand-labelled tuning samples stays >= 0.90 and on the untouched final holdout >= 0.80 (measured 0.825) and keeps >= 85% of true links
for (const [f, minP] of [['ai_links_sample_before.json', 0.9], ['ai_links_holdout_v1.json', 0.9], ['ai_links_holdout_v2.json', 0.9], ['ai_links_holdout_final.json', 0.8]]) {
  const d = R(f); let k = 0, tp = 0, all = 0;
  for (const x of d) { all += x.label; if (C.capabilityMatch(x.cat, x.text)) { k++; tp += x.label; } }
  assert.ok(tp / k >= minP, `${f} precision ${tp / k}`); assert.ok(tp / all >= 0.85, `${f} recall ${tp / all}`);
}
// 2. known keyword-only false positives are rejected; core matches kept
const no = [['customer_service', 'Monitor financial market trends to ensure that client plans are responsive.'],
  ['it_service', 'Configure servers to meet functional specifications.'], ['software_engineering', 'Teach patient education programs that include information required to make informed health care and treatment decisions.'],
  ['healthcare_documentation', 'Record facts to prepare reports that document incidents and activities.'], ['general_assistant', 'Edit films and videotapes to insert music, dialogue, and sound effects.'],
  ['computer_use', 'Analyze and report computer network security breaches or attempted breaches.'], ['healthcare_documentation', 'Analyze records, reports, test results, or examination information to diagnose medical condition of patient.']];
for (const [c, t] of no) assert.ok(!C.capabilityMatch(c, t), `should reject ${c}: ${t}`);
const yes = [['customer_service', "Answer customers' questions about products, prices, availability, or credit terms."], ['software_engineering', 'Write supporting code for Web applications or Web sites.'],
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
  }
assert.ok(n >= 1000);
console.log(`ai-links tests passed (${n} occupations)`);
