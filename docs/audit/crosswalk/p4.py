import json,glob,collections
A='/workspace/audit/'; R='/workspace/smartpivot-data/'
occ={}
for f in glob.glob(R+'data/occupations/[0-9]*.json'):
    for o in json.load(open(f))['occupations']: occ[o['code']]=o
L=lambda f: json.load(open(A+f))
C=collections.Counter(); F=collections.defaultdict(list)
db={r['code']:r for r in L('db_occ.json')}
fl=lambda x: None if x is None else float(x)
for c,o in occ.items():
    r=db.get(c)
    if not r: F['occ_missing_in_db'].append(c); continue
    s=o['derived']['skill_risk_summary']; C['occ_compared']+=1
    for k,v in [('e',s['occupation_combined']),('ai',s['occupation_ai']),('rob',s['occupation_robotics']),('w',(o['bls'].get('oews') or {}).get('median_annual')),('g',(o['bls'].get('projections') or {}).get('change_percent')),('job_zone',o.get('job_zone'))]:
        C['occ_fields']+=1
        a=fl(r[k]); 
        if (a is None)!=(v is None) or (a is not None and abs(a-v)>0.0015): F['occ_field_mismatch_'+k].append(f"{c}: db {r[k]} vs repo {v}")
for c in db:
    if c not in occ: F['db_occ_not_in_repo'].append(c)
pw=collections.defaultdict(dict)
for r in L('db_pw.json'): pw[r['s']][r['t']]=r
for c,o in occ.items():
    rp={p['code']:p for p in o['derived']['future_proof_pathways']}
    d=pw.get(c,{})
    C['pathways_repo']+=len(rp); C['pathways_db']+=len(d)
    for t,p in rp.items():
        if t not in d: F['pathway_missing_in_db'].append(f"{c}->{t}"); continue
        x=d[t]
        if x['rank']!=p['rank'] or x['tier']!=p['tier'] or abs(float(x['score'])-p['score'])>0.0015: F['pathway_field_mismatch'].append(f"{c}->{t}: db r{x['rank']} t{x['tier']} {x['score']} vs repo r{p['rank']} t{p['tier']} {p['score']}")
    for t in d:
        if t not in rp: F['db_pathway_not_in_repo'].append(f"{c}->{t}")
rs=collections.defaultdict(set)
for r in L('db_rs.json'): rs[r['s']].add(r['t'])
for c,o in occ.items():
    a={p['code'] for p in o['derived']['reskilling_pathways']}
    C['reskill_repo']+=len(a)
    if a!=rs.get(c,set()): F['reskilling_mismatch'].append(f"{c}: repo {sorted(a)} db {sorted(rs.get(c,set()))}")
sr={(r['c'],r['k']):r for r in L('db_sr.json')}
for c,o in occ.items():
    for q in o['derived']['skill_risk']:
        C['skill_risk_compared']+=1; r=sr.get((c,q['id']))
        if not r: F['skill_risk_missing_db'].append(f"{c}:{q['id']}"); continue
        if r['band']!=q['band'] or abs(float(r['combined'])-q['combined'])>0.0015: F['skill_risk_mismatch'].append(f"{c}:{q['skill']} db {r['combined']} {r['band']} vs {q['combined']} {q['band']}")
os_={(r['c'],r['k']):r for r in L('db_os.json')}
for c,o in occ.items():
    for q in o['skills']:
        C['occ_skills_compared']+=1; r=os_.get((c,q['id']))
        if not r: F['occ_skill_missing_db'].append(f"{c}:{q['id']}"); continue
        if abs(float(r['importance'])-q['importance'])>0.006 or ((r['level'] is None)!=(q.get('level') is None)) or (r['level'] is not None and q.get('level') is not None and abs(float(r['level'])-q['level'])>0.006): F['occ_skill_value_mismatch'].append(f"{c}:{q['id']}")
json.dump({'counts':C,'fails':{k:{'n':len(v),'ex':v[:10]} for k,v in F.items()}},open(A+'p4.json','w'),indent=1)
print(dict(C)); [print(k,len(v),v[:3]) for k,v in F.items()]
