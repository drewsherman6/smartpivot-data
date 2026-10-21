import json,subprocess,random,glob
occ={}
for f in glob.glob('/workspace/smartpivot-data/data/occupations/[0-9]*.json'):
    for o in json.load(open(f))['occupations']: occ[o['code']]=o
codes=sorted(occ); out=[]
def q(sql):
    r=subprocess.run(['./q.sh',sql],capture_output=True,text=True).stdout
    return json.loads(r)
for i in range(0,len(codes),60):
    ch=codes[i:i+60]; arr=",".join("'"+c+"'" for c in ch)
    sql=f"select o.code src, f.* from sp.occupations o cross join lateral sp_pathways_for_skills(o.code,(select array_agg(skill_id) from sp.occupation_skills s where s.occupation_code=o.code),25) f where o.code in ({arr})"
    r=q(sql)
    if not isinstance(r,list): print('ERR',r); break
    for x in r: x['run']='full'
    out+=r; print(i,len(r),flush=True)
random.seed(11); combos=[]
for n in range(200):
    c=random.choice(codes); ks=[s['id'] for s in occ[c]['skills'] if s.get('kind')=='skill']
    sub=random.sample(ks,random.randint(1,len(ks))) if ks else []
    combos.append((n,c,sub))
for i in range(0,200,40):
    parts=[]
    for n,c,sub in combos[i:i+40]:
        a="array["+",".join("'"+k+"'" for k in sub)+"]::text[]"
        parts.append(f"select {n} run_id,'{c}' src,f.* from sp_pathways_for_skills('{c}',{a},25) f")
    r=q(" union all ".join(parts))
    if not isinstance(r,list): print('ERR',r); break
    for x in r: x['run']='combo'
    out+=r; print('combo',i,len(r),flush=True)
json.dump({'rows':out,'combos':combos},open('p5_rows.json','w'))
