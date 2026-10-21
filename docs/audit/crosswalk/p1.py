import json,glob,csv,collections,re,sys
R='/workspace/smartpivot-data/'; O='/workspace/audit/db_31_0_csv/'
def rd(f): return list(csv.DictReader(open(O+f,encoding='utf-8')))
occ={};IDX={}
for f in sorted(glob.glob(R+'data/occupations/*.json')):
    for o in json.load(open(f))['occupations']:
        if 'derived' in o: occ[o['code']]=o
        else: IDX[o['code']]=o
tb={}
for f in glob.glob(R+'data/exposure/task_breakdown/*.json'):
    for o in json.load(open(f))['occupations']: tb[o['code']]=o
od={r['O*NET-SOC Code']:r for r in rd('occupation_data.csv')}
tasks=collections.defaultdict(dict)
for r in rd('task_statements.csv'): tasks[r['O*NET-SOC Code']][r['Task ID']]=r
el=collections.defaultdict(lambda:collections.defaultdict(set))
for fn,k in [('transferable_skills.csv','skill'),('essential_skills.csv','skill'),('knowledge.csv','knowledge'),('abilities.csv','ability'),('work_activities.csv','wa')]:
    for r in rd(fn): el[k][r['O*NET-SOC Code']].add(r['Element ID'])
cm={r['Element ID'] for r in rd('content_model_reference.csv')}
dw=collections.defaultdict(set)
for r in rd('tasks_to_dwas.csv'): dw[(r['O*NET-SOC Code'],r['Task ID'])].add(r['DWA Element ID'])
sw=collections.defaultdict(set)
for r in rd('software_skills.csv'): sw[r['O*NET-SOC Code']].add(r['Workplace Example'])
jz={r['O*NET-SOC Code']:int(r['Job Zone']) for r in rd('job_zones.csv')}
F=collections.defaultdict(list); C=collections.Counter()
def fail(cat,ex):
    F[cat].append(ex)
C['jobs']=len(occ); C['onet_occ']=len(od)
for c in od:
    if c not in occ: fail('onet_occ_missing_from_data',c)
for c,o in occ.items():
    if c not in od: fail('job_not_in_onet31',c)
    src=o.get('inferred_from',{}) or {}
    tc=c if c in tasks else None
    ids=[t['id'] for t in o.get('tasks',[])]
    C['tasks']+=len(ids)
    if len(ids)!=len(set(ids)): fail('dup_task_ids',c)
    for t in o.get('tasks',[]):
        pool=[c]+[x['code'] for x in (o.get('inferred_from') or {}).get('sources',[])]
        hit=[p for p in pool if t['id'] in tasks.get(p,{})]
        if not hit: fail('task_id_not_in_onet31_for_job_or_donors',f"{c}:{t['id']}")
        elif tasks[hit[0]][t['id']]['Task'].strip()!=t['text'].strip(): fail('task_text_mismatch',f"{c}:{t['id']}")
    if c in tasks and len(tasks[c])!=len(ids): fail('task_count_differs_from_onet',f"{c}: data {len(ids)} vs onet {len(tasks[c])}")
    ts=[t.get('time_share') for t in o.get('tasks',[])]
    if ids:
        if any(x is None for x in ts): fail('time_share_partly_missing' if any(x is not None for x in ts) else 'time_share_all_missing',f'{c}: {sum(x is None for x in ts)}/{len(ts)} missing')
        else:
            s=sum(ts); C['time_sum_checked']+=1
            if abs(s-1)>0.02: fail('time_share_sum_off_'+('inferred' if o.get('inferred_from') else 'native'),f"{c} {o['title']}: {s:.3f}")
    for key,k in [('skills',None),('knowledge','knowledge'),('abilities','ability')]:
        L=o.get(key,[]); xs=[x['id'] for x in L]; C[key]+=len(xs)
        if len(xs)!=len(set(xs)): fail('dup_'+key,c)
        for x in L:
            kk=k or ('skill' if x['kind']=='skill' else x['kind'])
            if x['id'] not in cm: fail('element_id_not_in_content_model',f"{c}:{x['id']}")
            pool=el['skill' if kk=='skill' else kk].get(c)
            if pool is not None and x['id'] not in pool: fail(f'{key}_id_not_rated_for_job',f"{c}:{x['id']}")
        if not L and c in od and key=='skills': fail('job_has_no_skills',c)
    for t in o.get('technology',[]):
        C['tech']+=1
        if c in sw and t['example'] not in sw[c]: fail('technology_not_in_onet_for_job',f"{c}:{t['example']}")
    if o.get('job_zone') is not None and c in jz and jz[c]!=o['job_zone']: fail('job_zone_mismatch',c)
    # task breakdown
    b=tb.get(c)
    if not b: fail('no_task_breakdown',c); continue
    S=b['summary']; T=b['tasks']
    if {t['id'] for t in T}!=set(ids): fail('breakdown_tasks_differ_from_record',c)
    for t in T:
        for d in t.get('dwas',[]):
            C['dwa_links']+=1
            if d['id'] not in cm: fail('dwa_id_not_in_content_model',f"{c}:{t['id']}:{d['id']}")
            if not any(d['id'] in dw.get((p,t['id']),set()) for p in [c]+[x['code'] for x in (o.get('inferred_from') or {}).get('sources',[])]): fail('dwa_link_not_in_tasks_to_dwas',f"{c}:{t['id']}:{d['id']}")
            if d.get('gwa') and not d['id'].startswith(d['gwa']): fail('dwa_gwa_parent_mismatch',f"{c}:{d['id']}")
        if not t.get('dwas') and any(dw.get((p,t['id'])) for p in [c]+[x['code'] for x in (o.get('inferred_from') or {}).get('sources',[])]): fail('dwa_links_dropped',f"{c}:{t['id']}")
    g=collections.Counter(); tm=collections.defaultdict(float); n=len(T)
    W=[t['time_share'] if t.get('time_share') is not None else 1/n for t in T]; tot=sum(W) or 1
    for t,w in zip(T,W):
        gs=['ai','robotics'] if t['group']=='both' else [t['group']]
        for x in gs: g[x]+=1; tm[x]+=w/tot
    C['both_tasks']+=sum(t['group']=='both' for t in T)
    disp=sum((t['time_share_normalized'] if t.get('time_share_normalized') is not None else (t['time_share'] or 0)) for t in T)  # site shows time_share_normalized (fix #4)
    if T and abs(disp-1)>0.02: fail('breakdown_displayed_task_time_not_100pct',f"{c} {o['title']}: rows sum {disp:.0%}")
    for grp,k1,k2 in [('ai','ai_tasks','ai_time'),('robotics','robotics_tasks','robotics_time'),('safe','safe_tasks','safe_time')]:
        if g.get(grp,0)!=S.get(k1): fail('breakdown_group_count_mismatch',f"{c}:{grp} {g.get(grp,0)} vs {S.get(k1)}")
        if abs(tm.get(grp,0)-S.get(k2,0))>0.006: fail('breakdown_group_time_mismatch',f"{c}:{grp} {tm.get(grp,0):.3f} vs {S.get(k2)}")
    # headline level
    sm=o['derived']['skill_risk_summary']; comb=sm['occupation_combined']
    band='safe' if comb<0.3 else 'at_risk' if comb>=0.5 else 'moderate'
    ai,rb=sm['occupation_ai'],sm['occupation_robotics']
    if abs(ai+rb-comb)>0.002: fail("combined_formula_off",c)  # one score (Oct 21, 2026): AI points + robot points = occupation_combined
    exp_t=S.get('combined_time_weighted') if S.get('combined_time_weighted') is not None else S.get('ai_time',0)+S.get('robotics_time',0)  # Oct 21, 2026: exposed time = the pooled task-level score (sum of time x automatable), the same per-task fractions as the card; binary 'any AI %' time is no longer a measure
    C['band_'+band]+=1
    if exp_t>=0.5 and band!='at_risk': fail('headline_below_High_but_>=50pct_time_exposed',f"{c} {o['title']}: {exp_t:.0%} time exposed, combined {comb:.2f} ({band})")
    tw=sm.get('time_weighted') or {}
    if tw.get('combined') is not None and tw['combined']>=0.5 and band!='at_risk': fail('headline_below_High_but_time_weighted_graded_exposure_>=50pct',f"{c} {o['title']}: time-weighted {tw['combined']:.3f}, combined {comb:.3f} ({band})")
    if tw.get('combined') is not None and tw['combined']<0.3 and band=='at_risk': fail('headline_High_but_time_weighted_graded_exposure_<30pct',f"{c} {o['title']}: time-weighted {tw['combined']:.3f}, combined {comb:.3f}")
    if exp_t<0.1 and band=='at_risk': fail('headline_High_but_<10pct_time_exposed',f"{c} {o['title']}: {exp_t:.0%} time exposed, combined {comb:.2f}")
    ix=IDX.get(c)
    if ix is None: fail('missing_from_index',c)
    else:
        if ix.get('combined_risk') is not None and abs((ix['combined_risk'] if not isinstance(ix['combined_risk'],dict) else ix['combined_risk'].get('value',-9))-comb)>0.002: fail('index_combined_risk_differs_from_record',f"{c}: {ix['combined_risk']} vs {comb}")
    for s in o['derived']['skill_risk']:
        bb='safe' if s['combined']<0.3 else 'at_risk' if s['combined']>=0.5 else 'moderate'
        C['skill_risk_rows']+=1
        if bb!=s['band']: fail('skill_band_rule_violation',f"{c}:{s['skill']}")
json.dump({'counts':C,'fails':{k:{'n':len(v),'ex':v[:12]} for k,v in F.items()}},open('/workspace/audit/p1.json','w'),indent=1)
print(dict(C)); [print(k,len(v),v[:4]) for k,v in F.items()]
