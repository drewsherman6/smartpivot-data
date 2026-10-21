import { mapResume, splitLines, grams, LookupRow } from "/workspace/smartpivot-app/src/lib/resume/map";
import { norm } from "/workspace/smartpivot-app/src/lib/resume/normalize";
import * as fs from "fs";
const T: any[] = JSON.parse(fs.readFileSync("/workspace/audit/db_titles.json", "utf8"));
const K: any[] = JSON.parse(fs.readFileSync("/workspace/audit/db_tech.json", "utf8"));
const tByNorm = new Map<string, any[]>(); for (const t of T) (tByNorm.get(t.norm) ?? tByNorm.set(t.norm, []).get(t.norm)!).push(t);
const kByNorm = new Map<string, any[]>(); for (const k of K) (kByNorm.get(k.norm) ?? kByNorm.set(k.norm, []).get(k.norm)!).push(k);
function lookup(gs: string[]): LookupRow[] {
  const g = [...new Set(gs.slice(0, 8000))].filter((x) => x.length >= 2 && x.length <= 120); const rows: LookupRow[] = []; const codes = new Set<string>();
  for (const x of g) for (const t of tByNorm.get(x) ?? []) { rows.push({ kind: "title", gram: t.norm, code: t.code, label: t.title, source: t.source, category: null, n: null }); codes.add(t.code); }
  for (const x of g) { const ks = kByNorm.get(x); if (!ks) continue; rows.push({ kind: "tech", gram: x, code: null, label: ks.map((k) => k.example).sort()[0], source: ks.some((k) => k.hot) ? "hot" : "listed", category: ks.map((k) => k.category).sort()[0], n: new Set(ks.map((k) => k.code)).size });
    const by = new Map<string, string[]>(); for (const k of ks) if (codes.has(k.code)) (by.get(k.code) ?? by.set(k.code, []).get(k.code)!).push(k.example);
    for (const [c, ex] of by) rows.push({ kind: "tech_occ", gram: x, code: c, label: ex.sort()[0], source: null, category: null, n: null }); }
  return rows;
}
const run = (text: string) => mapResume(text, lookup(grams(splitLines(text))));
const res: any = { bySource: {}, fails: {}, tech: {} };
const codesForTitle = new Map<string, Set<string>>(); for (const t of T) (codesForTitle.get(t.norm) ?? codesForTitle.set(t.norm, new Set()).get(t.norm)!).add(t.code);
for (const src of ["occupation", "alternate", "reported"]) {
  const L = T.filter((t) => t.source === src); const s = { n: 0, top1_exact: 0, top1_any_valid: 0, in_top5: 0, no_match: 0, ambiguous_titles: 0 };
  const fx: string[] = [];
  for (const t of L) {
    s.n++; const m = run(t.title); const top = m.titles[0]?.code; const valid = codesForTitle.get(t.norm)!;
    if (valid.size > 1) s.ambiguous_titles++;
    if (!top) { s.no_match++; if (fx.length < 400) fx.push(`NO MATCH: "${t.title}" (${t.code})`); continue; }
    if (top === t.code) s.top1_exact++;
    if (valid.has(top)) s.top1_any_valid++; else if (fx.length < 400) fx.push(`WRONG: "${t.title}" (${t.code}) -> ${top} via "${m.titles[0].matched}"`);
    if (m.titles.some((x) => x.code === t.code)) s.in_top5++;
  }
  res.bySource[src] = s; res.fails[src] = fx;
}
// tech: sample 3000 distinct examples, as a resume line
const ex = [...new Set(K.map((k) => k.example))]; let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const samp = ex.sort(() => rnd() - 0.5).slice(0, 3000); const tf: string[] = []; let det = 0, exact = 0;
for (const e of samp) { const m = run(`Used ${e} daily`); const hit = m.tech.find((h) => norm(h.example) === norm(e)); if (m.tech.length) det++; if (hit) exact++; else if (tf.length < 60) tf.push(`${e} -> ${m.tech.map((h) => h.example).join("; ") || "none"}`); }
res.tech = { sampled: samp.length, any_detected: det, exact_detected: exact, misses: tf };
// title + tech line: does tech support help? sample 2000 alternates with tech from their own occupation
const ttech = new Map<string, string[]>(); for (const k of K) (ttech.get(k.code) ?? ttech.set(k.code, []).get(k.code)!).push(k.example);
let n2 = 0, ok2 = 0; for (const t of T.filter((x) => x.source === "alternate").sort(() => rnd() - 0.5).slice(0, 2000)) { const tx = ttech.get(t.code); if (!tx) continue; n2++; const m = run(`${t.title}\nTools: ${tx.slice(0, 3).join(", ")}`); if (m.titles[0] && codesForTitle.get(t.norm)!.has(m.titles[0].code)) ok2++; }
res.title_plus_tech = { n: n2, top1_any_valid: ok2 };
fs.writeFileSync("/workspace/audit/p6.json", JSON.stringify(res, null, 1));
console.log(JSON.stringify({ bySource: res.bySource, tech: { ...res.tech, misses: res.tech.misses.slice(0, 8) }, title_plus_tech: res.title_plus_tech }, null, 1));
