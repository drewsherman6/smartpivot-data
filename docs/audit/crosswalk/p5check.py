exec(open('p2.py').read().split("C=collections.Counter(); F=")[0])
import json,collections
D=json.load(open('p5_rows.json')); rows=D['rows']
C=collections.Counter(); F=collections.defaultdict(list)
def v(k,e): F[k].append(e)
by=collections.defaultdict(list)
for r in rows: by[(r['run'],r.get('run_id'),r['src'])].append(r)
for (run,rid,s),rs in by.items():
    i=ix[s]; C['runs_'+run]+=1
    if len(rs)<3: v(f'{run}_fewer_than_3_results',f"{s} {A[i]['title']} ({len(rs)})")
    for r in rs:
        C['rows_'+run]+=1; j=ix[r['target_code']]; tier=r['tier']; tag=f"[{run}{'' if rid is None else '#'+str(rid)}] {s} {A[i]['title'][:35]} -> {r['target_code']} {A[j]['title'][:35]} t{tier}"
        Es_,Et_=float(r['source_combined']),float(r['target_combined'])
        if abs(Es_-E[i])>0.0015 or abs(Et_-E[j])>0.0015: v('exposure_differs_from_repo',tag)
        if not (Et_<Es_ or (Es_<=sorted(E)[int(0.05*(len(E)-1))]+1e-9 and Et_<=Es_+0.10+1e-9)): v('target_not_lower',tag)  # near-floor: least-exposed 5%, target <= source + 0.10 (Oct 21, 2026)
        if np.isnan(G[j]) or G[j]<0: v('growth_missing_or_negative',tag)
        if allother[j]: v('all_other_target',tag)
        if not gate_ok[i,j]: v('gate_violated',tag)
        if not ld_ok[i,j]: v('licensed_doctor_violated',tag)
        if not zj[i,j]: v('zone_jump',tag)
        if tier<3 and not zd1[i,j]: v('zone_drop_gt1_tier1_2',tag)
        if tier>1 and np.isnan(W[j]): v('fallback_without_wage',tag)
        if tier>1 and gated_t[0,j] and not (dh[i] or JZ[i]==5): v('fallback_opened_gated',tag)
        ov=float(r['safe_overlap'])
        if tier==1:
            ok=Et_<=Es_-0.1+1e-9 and Et_<=0.85*Es_+1e-9 and SIM[i,j]>=0.35-1e-6 and fit_ok[i,j] and ov>=0.3-1e-9
            if not ok: v('tier1_rule_violated',tag+f" ov {ov} sim {SIM[i,j]:.2f} fit {FIT[i,j]:.2f}")
            if run=='full' and abs(ov-OVf[i,j])>0.006: v('full_run_overlap_differs_from_repo_formula',tag+f" {ov} vs {OVf[i,j]:.3f}")
        if tier==2 and not (Et_<=Es_-0.03+1e-9 and Et_<=0.95*Es_+1e-9 and SIM[i,j]>=0.2-1e-6 and ov>=0.15-1e-9): v('tier2_rule_violated',tag)
    if run=='full':
        t1={r['target_code'] for r in rs if r['tier']==1}; st={codes[j] for j in np.where(strict[i])[0]}
        nt=len(st)
        if not t1<=st: v('function_tier1_not_strict_eligible',f"{s}: {sorted(t1-st)[:5]}")
        if len(t1)<min(25,nt): v('function_misses_strict_eligible',f"{s} {A[i]['title']}: fn {len(t1)} vs eligible {nt}; missing e.g. {sorted(st-t1)[:3]}")
        repo1={p['code'] for p in A[i]['derived']['future_proof_pathways'] if p['tier']==1}
        if not repo1<=t1 and len(t1)<25: v('repo_tier1_absent_from_function',f"{s}: {sorted(repo1-t1)[:4]}")
        C['full_tier1_rows']+=len(t1)
        if nt==0 and any(r['tier']==1 for r in rs): v('x',s)
C['full_runs_with_results']=sum(1 for k in by if k[0]=='full'); C['full_jobs_no_results']=1016-C['full_runs_with_results']
C['combo_runs_with_results']=sum(1 for k in by if k[0]=='combo'); 
json.dump({'counts':C,'fails':{k:{'n':len(x),'ex':x[:12]} for k,x in F.items()}},open('p5.json','w'),indent=1)
print(dict(C)); [print(k,len(x),'\n  '+'\n  '.join(x[:5])) for k,x in F.items()]
