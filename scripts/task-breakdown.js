#!/usr/bin/env node
/**
 * Task-level exposure breakdown for every occupation: which tasks are exposed to AI (Anthropic Economic Index observed
 * use) or robots (Anthropic robot exposure tiers E1-E3), and which O*NET work activities, skills and abilities are linked
 * to each group through official O*NET linkages only:
 *   task -> DWA (tasks_to_dwas) -> IWA -> GWA (gwas_to_iwas_to_dwas)
 *   GWA -> skill (essential_ + transferable_skills_to_work_activities), GWA -> ability (abilities_to_work_activities)
 * Technology is listed per occupation (O*NET publishes no task-level technology link).
 * Output: data/exposure/task_breakdown/{GG}.json (one file per SOC major group). Usage: node scripts/task-breakdown.js
 */
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { parse } = require('csv-parse/sync');
const SRC = require('./sources');
const { ROOT, today } = require('./lib');

const CACHE = path.join(ROOT, '.cache');
const ROBOT_EXPOSED = new Set(['E1', 'E2', 'E3']);
const r3 = (x) => (x == null ? null : Math.round(x * 1000) / 1000);
function onet(name) {
  const e = new AdmZip(path.join(CACHE, SRC.onet.file)).getEntries().find((x) => x.entryName.endsWith('/' + name));
  if (!e) throw new Error(`task-breakdown: O*NET ${name} missing; run scripts/refresh.js`);
  return parse(e.getData().toString('utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true });
}
function eloundou() {
  const f = path.join(CACHE, SRC.eloundou_tasks.file); if (!fs.existsSync(f)) return new Map();
  const m = new Map(); for (const r of parse(fs.readFileSync(f, 'utf8'), { columns: true, delimiter: '\t', skip_empty_lines: true, relax_quotes: true })) m.set(String(parseInt(r['Task ID'], 10)), r.gpt4_exposure);
  return m;
}

function build() {
  const dwa = new Map(); // dwa id -> {title, iwa, iwa_title, gwa, gwa_title}
  for (const r of onet('gwas_to_iwas_to_dwas.csv')) dwa.set(r['DWA Element ID'], { title: r['DWA Element Name'], iwa: r['IWA Element ID'], iwa_title: r['IWA Element Name'], gwa: r['GWA Element ID'], gwa_title: r['GWA Element Name'] });
  const taskDwas = new Map(); for (const r of onet('tasks_to_dwas.csv')) { const k = String(r['Task ID']); (taskDwas.get(k) || taskDwas.set(k, []).get(k)).push(r['DWA Element ID']); }
  const imp = new Map(); // `${occ}|${task}` -> importance (IM, 1-5); also task -> first seen
  const impAny = new Map();
  for (const r of onet('task_ratings.csv')) { if (r['Scale ID'] !== 'IM') continue; const v = Number(r['Data Value']); imp.set(`${r['O*NET-SOC Code']}|${r['Task ID']}`, v); if (!impAny.has(r['Task ID'])) impAny.set(r['Task ID'], v); }
  const skillGwa = new Map();
  for (const [f, c] of [['essential_skills_to_work_activities.csv', 'Essential Skills Element ID'], ['transferable_skills_to_work_activities.csv', 'Transferable Skills Element ID']])
    for (const r of onet(f)) (skillGwa.get(r['Work Activities Element ID']) || skillGwa.set(r['Work Activities Element ID'], new Set()).get(r['Work Activities Element ID'])).add(r[c]);
  const abilGwa = new Map(); for (const r of onet('abilities_to_work_activities.csv')) (abilGwa.get(r['Work Activities Element ID']) || abilGwa.set(r['Work Activities Element ID'], new Set()).get(r['Work Activities Element ID'])).add(r['Abilities Element ID']);
  const elo = eloundou();
  const dir = path.join(ROOT, 'data/occupations');
  const shards = fs.readdirSync(dir).filter((f) => /^\d\d\.json$/.test(f)).sort();
  const outs = [];
  for (const f of shards) {
    const occs = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).occupations;
    const recs = occs.map((o) => {
      const n = o.tasks.length || 1;
      const tasks = o.tasks.map((t) => {
        const id = String(t.id); const pen = t.ai_task_penetration ?? null; const tier = t.robot_tier || null;
        const ai = pen != null && pen > 0; const rob = ROBOT_EXPOSED.has(tier);
        const ds = (taskDwas.get(id) || []).filter((d) => dwa.has(d));
        return { id, text: t.text, type: t.type ?? null, time_share: t.time_share ?? null, importance: imp.get(`${t.source_code || o.code}|${id}`) ?? imp.get(`${o.code}|${id}`) ?? impAny.get(id) ?? null,
          ai_exposed: ai, robotics_exposed: rob, group: ai && rob ? 'both' : ai ? 'ai' : rob ? 'robotics' : (pen == null && !tier && t.time_share == null ? 'no_data' : 'safe'),
          evidence: { aei_penetration: pen, eloundou_label: elo.get(id) ?? null, robot_tier: tier },
          dwas: ds.map((d) => ({ id: d, title: dwa.get(d).title, iwa: dwa.get(d).iwa_title, gwa: dwa.get(d).gwa, gwa_title: dwa.get(d).gwa_title })) };
      });
      const weight = (t) => t.time_share ?? 1 / n;
      // Linked elements per group: weight of a GWA in a task = task weight x (DWAs of the task under that GWA / DWAs of the task)
      const skills = new Map(o.skills.filter((s) => s.kind === 'skill').map((s) => [s.id, s]));
      const abil = new Map((o.abilities || []).map((a) => [a.id, a]));
      const acc = { gwa: new Map(), skill: new Map(), ability: new Map() };
      const add = (kind, id, g, w) => { const m = acc[kind]; const e = m.get(id) || m.set(id, { ai: 0, robotics: 0, safe: 0, total: 0, tasks: { ai: new Set(), robotics: new Set(), safe: new Set() } }).get(id); for (const k of g) { e[k] += w; } e.total += w; };
      for (const t of tasks) {
        if (!t.dwas.length || t.group === 'no_data') continue;
        const g = t.group === 'both' ? ['ai', 'robotics'] : [t.group];
        const per = new Map(); for (const d of t.dwas) per.set(d.gwa, (per.get(d.gwa) || 0) + 1 / t.dwas.length);
        for (const [gwa, frac] of per) {
          const w = weight(t) * frac; add('gwa', gwa, g, w); for (const k of g) acc.gwa.get(gwa).tasks[k].add(t.id);
          for (const s of skillGwa.get(gwa) || []) if (skills.has(s)) { add('skill', s, g, w); for (const k of g) acc.skill.get(s).tasks[k].add(t.id); }
          for (const a of abilGwa.get(gwa) || []) if (abil.has(a)) { add('ability', a, g, w); for (const k of g) acc.ability.get(a).tasks[k].add(t.id); }
        }
      }
      const gwaTitle = new Map(); for (const t of tasks) for (const d of t.dwas) gwaTitle.set(d.gwa, d.gwa_title);
      const list = (kind, name, impOf) => [...acc[kind]].map(([id, e]) => ({ id, name: name(id), importance: impOf(id),
        ai_share: r3(e.ai / e.total), robotics_share: r3(e.robotics / e.total), safe_share: r3(e.safe / e.total), linked_weight: r3(e.total),
        ai_tasks: [...e.tasks.ai], robotics_tasks: [...e.tasks.robotics], safe_tasks: [...e.tasks.safe] })).sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0) || b.linked_weight - a.linked_weight);
      const W = tasks.reduce((s, t) => s + weight(t), 0) || 1;
      const sumW = (pred) => r3(tasks.filter(pred).reduce((s, t) => s + weight(t), 0) / W);
      return { code: o.code, title: o.title, time_basis: tasks.every((t) => t.time_share != null) ? 'anthropic_time_share' : 'equal_weight_fallback',
        summary: { tasks: tasks.length, ai_tasks: tasks.filter((t) => t.ai_exposed).length, robotics_tasks: tasks.filter((t) => t.robotics_exposed).length, safe_tasks: tasks.filter((t) => t.group === 'safe').length, no_data_tasks: tasks.filter((t) => t.group === 'no_data').length,
          ai_time: sumW((t) => t.ai_exposed), robotics_time: sumW((t) => t.robotics_exposed), safe_time: sumW((t) => t.group === 'safe'), tasks_with_dwa_links: tasks.filter((t) => t.dwas.length).length },
        tasks,
        work_activities: list('gwa', (id) => gwaTitle.get(id), () => null),
        skills: list('skill', (id) => skills.get(id).name, (id) => skills.get(id).importance),
        abilities: list('ability', (id) => abil.get(id).name, (id) => abil.get(id).importance),
        technology: { note: 'O*NET lists technology per occupation and does not link it to tasks, so it is shown as context for the whole job.', items: (o.technology || []).slice(0, 20).map((x) => ({ example: x.example, category: x.category, hot: !!x.hot })) },
        ...(o.inferred_from?.fields?.includes('tasks') ? { inferred_from: { code: o.inferred_from.code, title: o.inferred_from.title, label: o.inferred_from.label } } : {}),
      };
    });
    outs.push([f, recs]);
  }
  return outs;
}
const METHOD = 'Per O*NET task: AI-exposed = Anthropic Economic Index task penetration > 0 (observed AI use); robotics-exposed = Anthropic robot exposure tier E1-E3; safe = rated in either source and neither; no_data = in neither source. Eloundou et al. (2023) GPT-4 label is shown as extra evidence (E1 direct, E2 with tools, E0 none). Time = Anthropic time_share (equal weights when missing). Work activities, skills and abilities are linked only through official O*NET 31.0 files: tasks_to_dwas, gwas_to_iwas_to_dwas, essential/transferable_skills_to_work_activities, abilities_to_work_activities; each element\'s ai_share / robotics_share / safe_share is the share of its linked task time in each group (a task\'s time is split evenly across its DWAs). Technology is occupation-level (O*NET has no task link).';
function run() {
  const outDir = path.join(ROOT, 'data/exposure/task_breakdown'); fs.mkdirSync(outDir, { recursive: true });
  let n = 0;
  for (const [f, recs] of build()) {
    fs.writeFileSync(path.join(outDir, f), JSON.stringify({ schema_version: '1.0.0', dataset: 'task_breakdown', generated: today(), sources: { onet: SRC.onet.url, aei: SRC.aei_task?.url, robots: SRC.robot_tasks?.url, eloundou: SRC.eloundou_tasks.url }, method: METHOD, occupations: recs }) + '\n');
    n += recs.length;
  }
  console.log(`task-breakdown: ${n} occupations -> data/exposure/task_breakdown/`);
}
module.exports = { run, build };
if (require.main === module) run();
