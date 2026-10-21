import json,glob,csv,collections,re,math
import numpy as np
R='/workspace/smartpivot-data/'; O='/workspace/audit/db_31_0_csv/'
occ={}
for f in sorted(glob.glob(R+'data/occupations/[0-9]*.json')):
    for o in json.load(open(f))['occupations']: occ[o['code']]=o
codes=sorted(occ); N=len(codes); ix={c:i for i,c in enumerate(codes)}
A=[occ[c] for c in codes]
# skills universe (kind==skill)
sk=sorted({s['id'] for o in A for s in o['skills'] if s.get('kind')=='skill'}); K=len(sk); kx={s:i for i,s in enumerate(sk)}
allids=sorted({s['id'] for o in A for s in o['skills']})
imp=np.full((N,K),np.nan); lvl=np.full((N,K),np.nan); cred=np.zeros((N,K)); has=np.zeros((N,K),bool); band=np.zeros((N,K),int) # 0 none
for i,o in enumerate(A):
    rb={q['id']:q['band'] for q in o['derived']['skill_risk']}
    for s in o['skills']:
        if s.get('kind')!='skill': continue
        k=kx[s['id']]; imp[i,k]=s['importance']; lvl[i,k]=s['level'] if s.get('level') is not None else np.nan; has[i,k]=True
        b=rb.get(s['id']); cred[i,k]={'safe':1,'moderate':0.5,'at_risk':0}.get(b,0); band[i,k]={'safe':1,'moderate':2,'at_risk':3}.get(b,0)
# meanImp over all ids (skills list)
acc=collections.defaultdict(list)
for o in A:
    for s in o['skills']: acc[s['id']].append(s['importance'])
meanImp={k:sum(v)/len(v) for k,v in acc.items()}
# profile over all ids in o.skills
mI=np.array([meanImp[k] for k in allids]); M=np.zeros((N,len(allids))); ax={k:i for i,k in enumerate(allids)}
for i,o in enumerate(A):
    for s in o['skills']: M[i,ax[s['id']]]=s['importance']
sd=np.sqrt(((M-mI)**2).mean(0)); sd[sd==0]=1
Z=np.maximum(0,(M-mI)/sd); nz=np.linalg.norm(Z,axis=1); nz[nz==0]=1; P=Z/nz[:,None]; SIM=P@P.T
def ivec(fn):
    m=collections.defaultdict(dict)
    for r in csv.DictReader(open(O+fn)):
        if r['Scale ID']=='OI': m[r['O*NET-SOC Code']][r['Element ID']]=float(r['Data Value'])
    keys=sorted({k for v in m.values() for k in v}); out={}
    for c,v in m.items():
        x=np.array([v.get(k,0) for k in keys]); x=x-x.mean(); n=np.linalg.norm(x)
        if n>0: out[c]=x/n
    return out
RI,DO=ivec('career_interest_types.csv'),ivec('specific_interest_areas.csv')
def vf(Mp,o): return Mp.get(o['code']) if o['code'] in Mp else (Mp.get(o['inferred_from']['code']) if o.get('inferred_from') else None)
def fitmat(Mp):
    V=np.zeros((N,len(next(iter(Mp.values()))))); ok=np.zeros(N,bool)
    for i,o in enumerate(A):
        v=vf(Mp,o)
        if v is not None: V[i]=v; ok[i]=True
    return V@V.T, ok[:,None]&ok[None,:]
rM,rOk=fitmat(RI); dM,dOk=fitmat(DO)
nf=rOk.astype(int)+dOk.astype(int); FIT=np.where(nf>0,(np.where(rOk,rM,0)+np.where(dOk,dM,0))/np.maximum(nf,1),np.nan)
E=np.array([o['derived']['skill_risk_summary']['occupation_combined'] for o in A])
G=np.array([(o['bls'].get('projections') or {}).get('change_percent',np.nan) if (o['bls'].get('projections') or {}).get('change_percent') is not None else np.nan for o in A])
W=np.array([(o['bls'].get('oews') or {}).get('median_annual') or np.nan for o in A],float)
JZ=np.array([o.get('job_zone') if o.get('job_zone') is not None else np.nan for o in A],float)
edu=[(o['bls'].get('projections') or {}).get('typical_education') or '' for o in A]
allother=np.array([bool(re.search(r', All Other$',o['title'])) for o in A])
dh=np.array([c.startswith('29-1') and bool(re.search('doctoral|professional degree',e,re.I)) for c,e in zip(codes,edu)])
LD=np.array([bool(re.match(r'^29-(1011|102\d|1041|1081|1131|12\d\d)',c)) and bool(re.search('doctoral|professional degree',e,re.I)) for c,e in zip(codes,edu)])
fam=np.array([c[:2] for c in codes])
hasSafe=np.array([any(q['band']!='at_risk' for q in o['derived']['skill_risk']) for o in A])
# overlap matrices: target t req skills
wt=np.zeros((N,K)); req=np.zeros((N,K),bool)
mk=np.array([meanImp[s] for s in sk])
for t in range(N):
    ti=np.where(has[t])[0]; order=ti[np.argsort(-imp[t,ti],kind='stable')]
    r=[k for k in order if imp[t,k]>=2.5]
    if len(r)<6: r=list(order[:6])
    req[t,r]=True
    wt[t,r]=imp[t,r]*(0.5+np.minimum(2,np.maximum(0,imp[t,r]-mk[r]))/2)
def overlap(mode):
    OV=np.zeros((N,N)); SH=np.zeros((N,N)); NEW=np.zeros((N,N),int)
    for o in range(N):
        m=has[o][None,:]; ul=lvl[o][None,:]; tl=lvl; known=m & ~np.isnan(ul) & ~np.isnan(tl)
        lv_known=np.where(ul>=tl-0.5,1,np.clip(1-(tl-0.5-ul)/1.5,0,1))
        lv_unk=np.clip(1-np.maximum(0,imp-0.5-imp[o][None,:])/1.5,0,1)
        L=np.where(~m,0,np.where(known,lv_known,np.nan_to_num(lv_unk)))
        c=(band[o]>0).astype(float) if mode!='future_proof' else cred[o]
        cc=L*c[None,:]
        OV[o]=(wt*cc*req).sum(1)/np.maximum((wt*req).sum(1),1e-12)
        if mode=='reskilling':
            sf=np.where(m & ~known,0,np.maximum(0,np.nan_to_num(tl)-np.where(m,np.nan_to_num(ul),0)))
            strong=m & (imp[o][None,:]>=3.5)
            NEW[o]=((sf>=1.0)&~strong&req).sum(1)
    return OV,NEW
OVf,_=overlap('future_proof'); OVr,NEWr=overlap('reskilling'); OVb,_=overlap('broad')
Es=E[:,None]; Et=E[None,:]
base_ok=(~np.eye(N,dtype=bool)) & ~allother[None,:] & (np.nan_to_num(G,nan=-1)[None,:]>=0)
zj=(JZ[None,:]<=JZ[:,None]+2)|np.isnan(JZ[None,:])|np.isnan(JZ[:,None])
zd1=(JZ[None,:]>=JZ[:,None]-1)|np.isnan(JZ[None,:])|np.isnan(JZ[:,None])
gated_t=(dh|(JZ==5))[None,:]
rel=(fam[:,None]==fam[None,:]) | (((dh|(fam=='29'))[None,:]) & np.isin(fam,['29','19'])[:,None])
gate_ok=~gated_t | ((JZ[:,None]>=4) & rel)
ld_ok=~LD[None,:] | LD[:,None]
fit_ok=np.isnan(FIT)|(FIT>=0.1)
strict=base_ok & (Et<=Es-0.1+1e-9) & (Et<=Es*0.85+1e-9) & zj & zd1 & gate_ok & ld_ok & (SIM>=0.35) & fit_ok & (OVf>=0.3-1e-9) & hasSafe[:,None]
C=collections.Counter(); F=collections.defaultdict(list)
C['pairs_evaluated']=N*(N-1); C['strict_eligible_pairs']=int(strict.sum())
listed=collections.defaultdict(set); used=collections.Counter()
def viol(cat,ex): F[cat].append(ex)
for i,o in enumerate(A):
    fp=o['derived']['future_proof_pathways']; C['jobs']+=1
    if len(fp)<3: viol('fewer_than_3_pathways',o['code'])
    codesl=[p['code'] for p in fp]
    if len(codesl)!=len(set(codesl)): viol('duplicate_pathway_target',o['code'])
    for p in fp:
        C['pathways_listed']+=1; C[f"tier{p['tier']}"]+=1
        j=ix.get(p['code'])
        if j is None: viol('pathway_target_unknown',f"{o['code']}->{p['code']}"); continue
        tag=f"{o['code']} {o['title'][:40]} -> {p['code']} {A[j]['title'][:40]} (tier {p['tier']})"
        if p['tier']==1: used[p['code']]+=1; listed[i].add(j)
        if not (E[j]<E[i]-1e-9 or (p['tier']==3 and E[j]<=0.1+1e-9 and E[i]<=0.06+1e-9) or (p['tier']==3 and E[j]<=E[i]+1e-9)): viol('target_not_lower_exposure',tag+f" {E[i]:.3f}->{E[j]:.3f}")
        if np.isnan(G[j]) or G[j]<0: viol('target_growth_missing_or_negative',tag)
        if np.isnan(W[j]): viol('target_wage_missing',tag)
        if allother[j]: viol('target_is_All_Other',tag)
        if not ld_ok[i,j]: viol('licensed_doctor_block_violated',tag)
        if not gate_ok[i,j]: viol('job_zone5_or_doctoral_gate_violated',tag)
        if not zj[i,j]: viol('job_zone_jump_over_2',tag)
        if p['tier']<3 and not zd1[i,j]: viol('job_zone_drop_over_1',tag)
        if p['tier']==3 and not ((JZ[j]>=JZ[i]-2) or np.isnan(JZ[i]) or np.isnan(JZ[j])): viol('job_zone_drop_over_2_tier3',tag)
        if p['tier']>1 and gated_t[0,j] and not (dh[i] or JZ[i]==5): viol('fallback_opened_gated_target',tag)
        if p['tier']==1:
            if not strict[i,j]:
                why=[n for n,ok in [('exp_drop',E[j]<=E[i]-0.1+1e-9),('exp_ratio',E[j]<=E[i]*0.85+1e-9),('sim',SIM[i,j]>=0.35),('fit',fit_ok[i,j]),('overlap',OVf[i,j]>=0.3-1e-9),('zone',zj[i,j] and zd1[i,j])] if not ok]
                viol('tier1_listed_but_not_strict_eligible',tag+' fails:'+','.join(why)+f" ov={OVf[i,j]:.3f} vs {p['breakdown'].get('safe_overlap')} sim={SIM[i,j]:.3f}")
            if abs(p['breakdown'].get('safe_overlap',-1)-OVf[i,j])>0.01: viol('recomputed_safe_overlap_differs',tag+f" {OVf[i,j]:.3f} vs {p['breakdown'].get('safe_overlap')}")
            if abs(p['breakdown'].get('profile_similarity',-1)-SIM[i,j])>0.01: viol('recomputed_similarity_differs',tag+f" {SIM[i,j]:.3f} vs {p['breakdown'].get('profile_similarity')}")
        if p['tier']==2:
            if not (E[j]<=E[i]-0.03+1e-9 and E[j]<=E[i]*0.95+1e-9 and OVf[i,j]>=0.15-1e-9 and SIM[i,j]>=0.2-1e-9): viol('tier2_threshold_violated',tag+f" E {E[i]:.3f}->{E[j]:.3f} ov {OVf[i,j]:.2f} sim {SIM[i,j]:.2f}")
        if abs(p['breakdown'].get('target_combined_exposure',-1)-E[j])>0.002: viol('pathway_target_exposure_stale',tag+f" listed {p['breakdown'].get('target_combined_exposure')} vs now {E[j]:.3f}")
        if abs(p['breakdown'].get('source_combined_exposure',-1)-E[i])>0.002: viol('pathway_source_exposure_stale',tag)
        pf=p['breakdown'].get('pay_factor'); 
        if pf is not None and pf>1.08+1e-9: viol('pay_factor_over_cap',tag)
    t1=sum(p['tier']==1 for p in fp); t2=[p for p in fp if p['tier']>1]
    if t1>=3 and t2: viol('fallback_used_although_3_strict',o['code'])
    for p in o['derived']['reskilling_pathways']:
        C['reskilling_listed']+=1; j=ix[p['code']]; tag=f"{o['code']} {o['title'][:40]} -> {p['code']} {A[j]['title'][:40]} (reskill)"
        if t1>=3: viol('reskilling_present_although_3_strict',o['code'])
        ok=base_ok[i,j] and E[j]<=E[i]-0.1+1e-9 and E[j]<=E[i]*0.85+1e-9 and zj[i,j] and zd1[i,j] and gate_ok[i,j] and ld_ok[i,j] and SIM[i,j]>=0.35 and fit_ok[i,j] and OVr[i,j]>=0.4-1e-9 and NEWr[i,j]<=4
        if not ok: viol('reskilling_route_violates_rules',tag+f" E {E[i]:.2f}->{E[j]:.2f} sim {SIM[i,j]:.2f} fit {FIT[i,j]:.2f} ov {OVr[i,j]:.2f} new {NEWr[i,j]}")
        if p['code'] in [q['code'] for q in fp]: viol('reskilling_duplicates_pathway',tag)
        if len(p.get('new_skills',[]))>4: viol('reskilling_over_4_new_skills',tag)
cap=int(N*0.1)
for t,n in used.items():
    if n>cap: viol('hub_cap_exceeded',f"{t} used {n}>{cap}")
# missing strict
miss=0
for i in range(N):
    nl=len(listed[i]); el=np.where(strict[i])[0]
    if nl>=10: continue
    for j in el:
        if j in listed[i]: continue
        if used[codes[j]]>=cap: C['eligible_blocked_by_hub_cap']+=1; continue
        miss+=1; viol('strict_eligible_but_missing',f"{codes[i]} {A[i]['title'][:40]} -> {codes[j]} {A[j]['title'][:40]} (source has {nl} tier-1) ov {OVf[i,j]:.2f} sim {SIM[i,j]:.2f}")
C['jobs_with_<10_tier1']=sum(len(listed[i])<10 for i in range(N))
C['jobs_with_0_strict_eligible']=int((strict.sum(1)==0).sum())
np.save('/workspace/audit/strict.npy',strict)
json.dump({'counts':C,'fails':{k:{'n':len(v),'ex':v[:15]} for k,v in F.items()}},open('/workspace/audit/p2.json','w'),indent=1)
print(dict(C)); [print(k,len(v),'\n   '+'\n   '.join(v[:5])) for k,v in F.items()]
