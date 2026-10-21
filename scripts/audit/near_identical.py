"""Near-identical jobs audit: pairs with O*NET DWA Jaccard >= 0.7 whose headline scores differ by > 0.10.
For each pair the task-level gap is decomposed per DWA (task time split evenly across its DWAs):
  time-mix  = sum (w_a - w_b) * mean(u)   -> how much time each job spends on each kind of work (genuine)
  evidence  = sum mean(w) * (u_a - u_b)   -> same work rated differently (artifact if large)
  other     = headline gap not explained by the task-level score (job-level other measures)
Usage: python3 scripts/audit/near_identical.py [--json out.json]"""
import json, glob, itertools, sys, collections
B, S, O = {}, {}, {}
for f in glob.glob('data/exposure/task_breakdown/*.json'):
    for r in json.load(open(f))['occupations']: B[r['code']] = r
for f in glob.glob('data/occupations/[0-9]*.json'):
    for o in json.load(open(f))['occupations']: S[o['code']] = o['derived']['skill_risk_summary']['occupation_combined']; O[o['code']] = o
def prof(r):
    w, u = collections.defaultdict(float), collections.defaultdict(list)
    for t in r['tasks']:
        ds = [d['id'] for d in t.get('dwas', [])] or ['task:' + str(t['id'])]
        for d in ds: w[d] += (t.get('time_share_normalized') or 0) / len(ds); u[d].append(t.get('automatable') or 0)
    return w, {d: sum(v) / len(v) for d, v in u.items()}
D = {k: set(d['id'] for t in r['tasks'] for d in t.get('dwas', [])) for k, r in B.items()}
ks = [k for k in D if len(D[k]) >= 5]; rows = []
for a, b in itertools.combinations(ks, 2):
    j = len(D[a] & D[b]) / len(D[a] | D[b])
    if j < 0.7 or abs(S[a] - S[b]) <= 0.10: continue
    if S[a] < S[b]: a, b = b, a
    (wa, ua), (wb, ub) = prof(B[a]), prof(B[b]); mix = ev = 0
    for d in set(wa) | set(wb):
        xa, xb = ua.get(d, ub.get(d, 0)), ub.get(d, ua.get(d, 0))
        mix += (wa.get(d, 0) - wb.get(d, 0)) * (xa + xb) / 2; ev += (wa.get(d, 0) + wb.get(d, 0)) / 2 * (xa - xb)
    Ta, Tb = B[a]['summary']['combined_time_weighted'], B[b]['summary']['combined_time_weighted']
    def Timp(r):
        ws = [(t.get('importance') or 0) for t in r['tasks']]; tot = sum(ws) or 1
        return sum(w / tot * (t.get('automatable') or 0) for w, t in zip(ws, r['tasks']))
    imp_gap = Timp(B[a]) - Timp(B[b])
    rows.append(dict(imp_T_gap=round(imp_gap, 3), a=a, b=b, jaccard=round(j, 2), score_a=S[a], score_b=S[b], gap=round(S[a] - S[b], 3), T_gap=round(Ta - Tb, 3),
                     time_mix=round(mix, 3), evidence=round(ev, 3), other=round(S[a] - S[b] - (Ta - Tb), 3),
                     time_basis=(B[a].get('time_basis'), B[b].get('time_basis')),
                     cause='time-mix (robust to importance weights)' if abs(imp_gap) >= 0.05 and abs(mix) >= abs(ev) and abs(mix) >= 0.05 else 'time-mix (time-data sensitive)' if abs(mix) >= abs(ev) and abs(mix) >= 0.05 else 'evidence' if abs(ev) >= 0.05 else 'other-measures'))
rows.sort(key=lambda r: -r['gap'])
for r in rows: print(r['a'], r['b'], r['jaccard'], r['gap'], 'T', r['T_gap'], 'mix', r['time_mix'], 'ev', r['evidence'], 'oth', r['other'], 'impT', r['imp_T_gap'], r['cause'], r['time_basis'])
print('pairs', len(rows), collections.Counter(r['cause'] for r in rows))
if '--json' in sys.argv: json.dump(rows, open(sys.argv[sys.argv.index('--json') + 1], 'w'), indent=1)
