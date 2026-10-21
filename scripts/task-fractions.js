#!/usr/bin/env node
/**
 * Standalone: add per-task robot automatable share (Anthropic robot_exposure_tasks.csv instances) to the committed
 * occupation shards without a full refresh (refresh.js does the same inline). Needs .cache/robot_tasks.csv.
 */
const fs = require('fs'); const path = require('path'); const { ROOT } = require('./lib'); const RL = require('./robot-links');
async function run() {
  const { parse } = require('csv-parse'); const m = new Map();
  const p = fs.createReadStream(path.join(ROOT, '.cache/robot_tasks.csv')).pipe(parse({ columns: true, relax_quotes: true }));
  for await (const r of p) { let inst = []; try { inst = JSON.parse(r.instances || '[]'); } catch { /* none */ } let srcs = []; try { srcs = JSON.parse(r.sources || '[]'); } catch { /* none */ }
    const drive = r.physical === 'Yes' && RL.isVehicleTask(r.task_statement, RL.taskDwas(r.task_id)) ? RL.instanceDriverless(inst, srcs) : null;
    m.set(r.onetsoc_code + '|' + r.task_id, { physical: r.physical === 'Yes', automatable: r.physical === 'Yes' ? Math.max(RL.instanceFeasible(inst) ?? 0, drive ?? 0) : 0, driving: drive != null }); }
  const dir = path.join(ROOT, 'data/occupations'); let n = 0, hit = 0;
  for (const f of fs.readdirSync(dir).filter((x) => /^\d\d\.json$/.test(x))) {
    const abs = path.join(dir, f); const d = JSON.parse(fs.readFileSync(abs, 'utf8'));
    for (const o of d.occupations) for (const t of o.tasks || []) { n++; const rt = m.get((t.source_code || o.code) + '|' + t.id); if (rt) { hit++; t.robot_physical = rt.physical; t.robot_automatable_share = rt.automatable; t.robot_driving_rule = rt.driving; } }
    fs.writeFileSync(abs, JSON.stringify(d) + '\n');
  }
  console.log(`task-fractions: ${hit}/${n} tasks matched to the Anthropic robot task file`);
}
if (require.main === module) run().catch((e) => { console.error(e); process.exit(1); });
module.exports = { run };
