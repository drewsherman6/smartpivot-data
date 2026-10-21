// Robot system -> O*NET task linkage, from the Anthropic robot exposure task file (per-task `instances` and `sources`).
// A task's work is "already targeted" only for the instances (weighted by weight_pct) where
//   (a) the instance tier is not E0 and is >= the instance's own setting_tier, i.e. a cited robot can do it in the setting
//       where the work actually happens (an E1 purpose-built-cell robot does not cover a task done in an E2 kitchen or on an
//       E3 public road), and
//   (b) at least one source cited for that instance is maturity commercial or deployed and autonomy_status autonomous.
// Pure helpers, unit-tested in scripts/test-robot-links.js.
const COUNTED = new Set(['commercial', 'deployed']);
const RANK = { E0: 0, E1: 1, E2: 2, E3: 3 };
const MAT_RANK = { deployed: 0, commercial: 1 };
const isCounted = (s) => !!s && COUNTED.has(s.maturity) && s.autonomy_status === 'autonomous' && !!s.url && !!s.system;
exports.isCounted = isCounted;
exports.isCountedLink = (s) => COUNTED.has(s.maturity) && !!s.url && !!s.system;

// instances: [{weight_pct, tier, setting_tier, sources:"0,2"}], sources: [{source, system, developer, maturity, autonomy_status, date, url}]
// -> { covered_share (0-1 of the task's occurrences), systems: counted sources that decide a covered instance }
exports.instanceCoverage = (instances, sources) => {
  const bySrc = new Map((sources || []).map((s, i) => [String(s.source ?? i), s]));
  let total = 0, covered = 0; const used = new Map();
  for (const inst of instances || []) {
    const w = Number(inst.weight_pct) || 0; total += w;
    const t = RANK[inst.tier] ?? 0, st = RANK[inst.setting_tier] ?? 3;
    if (!(t > 0 && t >= st)) continue;
    const srcs = String(inst.sources || '').split(',').map((x) => x.trim()).filter(Boolean).map((k) => bySrc.get(k)).filter(isCounted);
    if (!srcs.length) continue;
    covered += w;
    for (const s of srcs) if (!used.has(s.system)) used.set(s.system, { system: s.system, developer: s.developer || null, maturity: s.maturity, date: s.date || null, url: s.url });
  }
  return { covered_share: total > 0 ? Math.round((covered / total) * 1000) / 1000 : 0, systems: [...used.values()] };
};

// Legacy-shaped display sample (task_id, tier, system, developer, maturity, date, url): systems that cover the most task time first.
// cites: legacy per-source rows; cov: Map task_id -> instanceCoverage; timeShare: Map task_id -> time share.
exports.displaySample = (cites, cov, timeShare, n = 10) => {
  const covering = (c) => !!cov.get(String(c.task_id))?.systems.some((s) => s.system === c.system);
  const key = (c) => [covering(c) ? 0 : 1, -((timeShare.get(String(c.task_id)) || 0) * (cov.get(String(c.task_id))?.covered_share || 0)), COUNTED.has(c.maturity) ? 0 : 1, -(timeShare.get(String(c.task_id)) || 0), MAT_RANK[c.maturity] ?? 2];
  const cmp = (a, b) => { for (let i = 0; i < a.k.length; i++) if (a.k[i] !== b.k[i]) return a.k[i] - b.k[i]; return String(b.c.date || '').localeCompare(String(a.c.date || '')) || a.i - b.i; };
  const sorted = cites.filter((c) => c.system && c.url).map((c, i) => ({ c, i, k: key(c) })).sort(cmp).map((x) => x.c);
  const seen = new Set(); const out = [];
  for (const c of sorted) { if (seen.has(c.system)) continue; seen.add(c.system); out.push(c); if (out.length >= n) break; }
  return out;
};

// Automatable share of a task (Legate-Yang & Massenkoff 2026, robot_exposure_tasks.csv `instances`): weight_pct share of the
// task's instances that a cited robot (any maturity) can complete in the instance's own setting (instance tier above E0 and
// at least setting_tier). Continuous 0..1 in 5% steps. Deployed/commercial-only coverage is instanceCoverage above.
exports.instanceFeasible = (instances) => {
  let total = 0, ok = 0;
  for (const inst of instances || []) { const w = Number(inst.weight_pct) || 0; total += w; const t = RANK[inst.tier] ?? 0, st = RANK[inst.setting_tier] ?? 3; if (t > 0 && t >= st) ok += w; }
  return total > 0 ? Math.round((ok / total) * 1000) / 1000 : null;
};

// Driving tasks (Drew, Oct 21, 2026, approved): a driving instance counts as automatable wherever a deployed or commercial
// driverless system already operates in that kind of setting, in any vehicle class (e.g. Waymo on city streets, Aurora on
// highways, Gatik regional box trucks, Komatsu/Caterpillar haulage, Outrider yards). Operationally: instance tier above E0
// with at least one cited deployed/commercial source. Demo-only instances and E0 instances (e.g. tow/wrecker response) do not
// count. This reflects current driverless capability, not adoption.
exports.DRIVING_TASK = /^(Drive|Operate|Pilot)\b.*\b(truck|trucks|vehicle|vehicles|bus|buses|busses|taxi|taxicabs|cab|van|vans|car|cars|automobile|limousine|limousines|tractor|tractors|ambulance|shuttle)\b/i;
exports.isDrivingTask = (text) => exports.DRIVING_TASK.test(text || '') && !/^Operate idle/i.test(text || '');
// Vehicle-operation tasks worded without "Drive/Operate ... vehicle" (Oct 21, 2026): a task also counts as driving when
// O*NET links it to a vehicle-driving Detailed Work Activity (Drive passenger vehicles / trucks or truck-mounted equipment /
// trucks or other vehicles to or at work sites / vehicles to transport individuals or equipment / vehicles to transport
// patrons) AND its wording is moving a vehicle or its riders (drive, pick up, park, tow, transport ... a vehicle/passengers).
// E.g. school bus "Pick up and drop off students at regularly scheduled neighborhood locations", taxi "Pick up passengers".
exports.VEHICLE_DWAS = new Set(['4.A.3.a.4.a.14', '4.A.3.a.4.a.10', '4.A.3.a.4.a.12', '4.A.3.a.4.a.3', '4.A.3.a.4.a.9']);
const VEH_OBJ = /\b(vehicles?|trucks?|vans?|cars?|automobiles|buses|busses|bus|taxicabs?|hearses?|ambulances?|limousines|crew carriers|intensive care unit|aircraft|tractors?|subways|trains|passengers|students)\b/i;
const VEH_ACT = /^(drive|pilot|escort or drive|clean and drive|transfer or transport|transport|pick up|park|tow|regulate vehicle speed)\b/i;
exports.isVehicleTask = (text, dwaIds) => exports.isDrivingTask(text) || ([...(dwaIds || [])].some((d) => exports.VEHICLE_DWAS.has(d)) && VEH_ACT.test(text || '') && VEH_OBJ.test(text || '') && !/^transport machines/i.test(text || ''));
let T2D = null; // task id -> Set of DWA ids (O*NET tasks_to_dwas.csv, cached by time-weighted.js / refresh)
exports.taskDwas = (taskId) => {
  if (!T2D) { T2D = new Map(); try { const f = require('path').join(__dirname, '..', '.cache/tasks_to_dwas.csv'); const { parse } = require('csv-parse/sync');
    for (const r of parse(require('fs').readFileSync(f, 'utf8'), { columns: true, relax_quotes: true })) { const k = String(r['Task ID']); if (!T2D.has(k)) T2D.set(k, new Set()); T2D.get(k).add(r['DWA Element ID']); } } catch { /* no cache: wording rule only */ } }
  return T2D.get(String(taskId)) || new Set();
};
exports.instanceDriverless = (instances, sources) => {
  const bySrc = new Map((sources || []).map((s, i) => [String(s.source ?? i), s])); let total = 0, ok = 0;
  for (const inst of instances || []) { const w = Number(inst.weight_pct) || 0; total += w; if ((RANK[inst.tier] ?? 0) <= 0) continue;
    const srcs = String(inst.sources || '').split(',').map((x) => x.trim()).filter(Boolean).map((k) => bySrc.get(k));
    if (srcs.some((z) => z && (z.maturity === 'deployed' || z.maturity === 'commercial'))) ok += w; }
  return total > 0 ? Math.round((ok / total) * 1000) / 1000 : null;
};

// task_citations for one occupation: one row per task with any coverage.
exports.taskCitations = (tasks, covByKey, codeOf) => tasks.map((t) => {
  const c = covByKey.get(codeOf(t) + '|' + t.id); if (!c || !(c.covered_share > 0)) return null;
  return { task_id: String(t.id), tier: t.robot_tier || null, covered_share: c.covered_share, systems: c.systems.slice(0, 8), system_count: c.systems.length };
}).filter(Boolean);
