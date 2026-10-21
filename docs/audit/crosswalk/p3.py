import json,glob,csv,collections,re,random,os
R='/workspace/smartpivot-data/'; CM=R+'.cache/multisource/'; AU='/workspace/audit/'
C=collections.Counter(); F=collections.defaultdict(list)
def fail(k,e): F[k].append(e)
# official rows
rows=list(csv.reader(open(CM+'esco_onet.csv',encoding='utf-8-sig',errors='replace')))
h=[i for i,r in enumerate(rows) if r and r[0]=='O*NET Id'][0]
esco_rows={(r[0],r[3],r[6]) for r in rows[h+1:] if len(r)>6}
s1018=json.load(open(AU+'soc10_18.xlsx.json')); soc18to10=collections.defaultdict(set)
for r in s1018:
    a,b=str(r[0] or '').strip(),str(r[2] or '').strip() if len(r)>2 else ''
    if re.match(r'^\d{2}-\d{4}$',a) and re.match(r'^\d{2}-\d{4}$',b): soc18to10[b].add(a)
iscos=collections.defaultdict(set)
for r in json.load(open(AU+'isco_soc.xls.json')):
    s=str(r[0] or '').strip(); i=str(r[3] or '').strip() if len(r)>3 else ''
    if re.match(r'^\d{2}-\d{4}$',s) and re.match(r'^\d{4}$',i): iscos[s].add(i)
exactIsco=collections.defaultdict(set)
for r in rows[h+1:]:
    if len(r)>6 and r[6]=='exactISCO':
        m=re.search(r'C(\d{4})',r[3] or '')
        if m: exactIsco[r[0]].add(m.group(1))
s18n16=collections.defaultdict(set)
for r in list(csv.reader(open(CM+'noc16_soc18.csv',encoding='utf-8-sig',errors='replace')))[1:]:
    if len(r)>3 and re.match(r'^\d{4}$',r[0].strip()) and re.match(r'^\d{2}-\d{4}$',r[3].strip()): s18n16[r[3].strip()].add(r[0].strip())
n16n21=collections.defaultdict(set)
for r in list(csv.reader(open(CM+'noc16_21.csv',encoding='utf-8-sig',errors='replace')))[1:]:
    if len(r)>3 and re.match(r'^\d{4}$',r[0].strip()) and re.match(r'^\d{5}$',r[3].strip()): n16n21[r[0].strip()].add(r[3].strip())
duties=set()
for r in list(csv.reader(open(CM+'oasis_duties.csv',encoding='utf-8-sig',errors='replace'),delimiter=';'))[1:]:
    if len(r)>1: duties.add((r[0],r[1].strip()))
ilo=json.load(open(AU+'ilo2025.xlsx.json')); ih=ilo[0]; ci={n:i for i,n in enumerate(ih)}
iloT={}
for r in ilo[1:]:
    if r[ci['score_2025']] is None: continue
    iloT[f"{str(r[ci['ISCO_08']]).zfill(4)}-{r[ci['taskID']]}"]=(str(r[ci['Task_ISCO']]).rstrip('; ').strip(),r[ci['score_2025']])
nice=json.load(open(CM+'nice.json')); nel={e['element_identifier']:e for e in nice['elements']}
nrel={(r['source_element_identifier'],r['dest_element_identifier']) for r in nice['relationships']}
escoOcc={}
for f in os.listdir(CM+'esco'):
    try: d=json.load(open(CM+'esco/'+f))
    except Exception: C['esco_cache_unreadable']+=1; continue
    escoOcc[d['uri']]={'ess':{s['uri'] for s in d.get('essential',[])},'opt':{s['uri'] for s in d.get('optional',[])},'title':{s['uri']:s['title'] for s in d.get('essential',[])+d.get('optional',[])}}
occ={}
for f in glob.glob(R+'data/occupations/[0-9]*.json'):
    for o in json.load(open(f))['occupations']: occ[o['code']]=o
STOP=set('a an and the of or to for in on with by as at from into be is are their other such may'.split())
def toks(t): return {w.rstrip('s') for w in re.findall(r'[a-z0-9]+',t.lower()) if w not in STOP}
def jac(a,b): return len(a&b)/len(a|b) if a|b else 0
merges=[]; near=[]; weak=[]
for f in sorted(glob.glob(R+'data/multisource/occ/*.json')):
    m=json.load(open(f)); c=m['code']; o=occ[c]; soc18=c[:7]; X=m['crosswalk']; C['ms_jobs']+=1
    for e in X['esco']:
        C['esco_occ_links']+=1
        if (c,e['uri'],e['match']) not in esco_rows: fail('esco_link_not_in_official_crosswalk',f"{c} {e['title']} {e['match']}")
    exp10=soc18to10.get(soc18) or {soc18}
    if set(X['soc2010'])!=exp10: fail('soc2010_not_matching_official',f"{c}: {X['soc2010']} vs {sorted(exp10)}")
    C['isco_links']+=len(X['isco08'])
    offi=set().union(*[iscos.get(s,set()) for s in exp10]) if exp10 else set()
    for i in X['isco08']:
        if X['isco_basis']=='esco_onet_exactISCO':
            if i not in exactIsco.get(c,set()): fail('isco_exact_not_in_esco_onet',f"{c}:{i}")
        elif i not in offi: fail('isco_not_in_BLS_crosswalk',f"{c}:{i}")
    if not X['isco08']: fail('job_has_no_isco',c)
    exp21=set().union(*[n16n21.get(n,set()) for n in s18n16.get(soc18,set())]) if s18n16.get(soc18) else set()
    C['noc_links']+=len(X['noc2021'])
    if set(X['noc2021'])!=exp21: fail('noc2021_not_matching_statcan',f"{c}: {X['noc2021']} vs {sorted(exp21)}")
    if not X['noc2021']: fail('job_has_no_noc',c)
    if X['nice_work_roles']: C['nice_jobs']+=1; fail('nice_link_curated_no_official_crosswalk',f"{c} {o['title']}: {X['nice_work_roles']}")
    sts=m['statements']; C['statements']+=len(sts)
    tl={t['id']:t['text'] for t in o['tasks']}
    for s in sts:
        for z in s['sources']:
            C['source_refs']+=1; src=z['source']; C['refs_'+src]+=1
            if src=='onet':
                if z['ref'] not in tl: fail('onet_ref_not_job_task',f"{c}:{z['ref']}")
            elif src=='esco':
                eo=escoOcc.get(z['via'])
                if not eo or z['ref'] not in eo['ess']|eo['opt']: fail('esco_skill_not_linked_to_esco_occ',f"{c}:{s['text']}")
                elif (z['ref'] in eo['ess'])!=bool(z.get('essential')): fail('esco_essential_flag_wrong',f"{c}:{s['text']}")
                if not any(e['uri']==z['via'] for e in X['esco']): fail('esco_via_not_in_job_crosswalk',f"{c}:{z['via']}")
            elif src=='ilo':
                if z['ref'] not in iloT: fail('ilo_ref_not_in_ilo_file',f"{c}:{z['ref']}")
                if z['via'] not in X['isco08']: fail('ilo_via_isco_not_in_job',f"{c}:{z['ref']}")
            elif src=='oasis':
                if z['via'] not in X['noc2021']: fail('oasis_via_noc_not_in_job',f"{c}:{z['ref']}")
            elif src=='nice':
                if (z['via'],z['ref']) not in nrel: fail('nice_task_not_in_work_role',f"{c}:{z['ref']}")
        if s['n_sources']>1 and len({z['source']+z['ref'] for z in s['sources']})>1: merges.append((c,o['title'],s))
        for k in ('ai','robotics'):
            v=s.get(k)
            if v and v.get('basis')=='transferred':
                C['transferred_'+k]+=1; sim=v.get('similarity',0)
                if sim<0.5: weak.append((c,k,s['text'],v.get('from'),sim)); C['weak_donor_'+k+'_<0.5']+=1
            elif v: C['direct_'+k]+=1
    # near-duplicates left (non-knowledge)
    T=[(s['text'],toks(s['text']),s['kind']) for s in sts]
    for a in range(len(T)):
        for b in range(a+1,len(T)):
            if T[a][2]=='knowledge' or T[b][2]=='knowledge': continue
            j=jac(T[a][1],T[b][1])
            if j>=0.5: near.append((c,round(j,2),T[a][0][:90],T[b][0][:90]))
C['merged_statements']=len(merges); C['near_dup_pairs_j>=0.5']=len(near); C['near_dup_pairs_j>=0.6']=sum(n[1]>=0.6 for n in near)
random.seed(7); samp=random.sample(merges,min(300,len(merges)))
with open(AU+'merge_sample.txt','w') as fh:
    for i,(c,t,s) in enumerate(samp):
        texts=[]
        for z in s['sources']:
            if z['source']=='onet': texts.append('ONET: '+{x['id']:x['text'] for x in occ[c]['tasks']}.get(z['ref'],'?'))
            elif z['source']=='esco': texts.append('ESCO: '+escoOcc.get(z['via'],{}).get('title',{}).get(z['ref'],'?'))
            elif z['source']=='ilo': texts.append('ILO: '+iloT.get(z['ref'],('?',))[0])
            elif z['source']=='oasis': texts.append('OASIS: '+z['ref'])
            else: texts.append(z['source']+': '+z['ref'])
        fh.write(f"#{i} {c} {t} | {s['text']}\n   "+"\n   ".join(x[:160] for x in texts)+"\n")
random.shuffle(weak)
json.dump({'counts':C,'fails':{k:{'n':len(v),'ex':v[:12]} for k,v in F.items()},'near_ex':sorted(near,key=lambda x:-x[1])[:40],'weak_ex':weak[:30]},open(AU+'p3.json','w'),indent=1)
print(dict(C)); [print(k,len(v),v[:3]) for k,v in F.items()]

# --- merge sample judgment helper
dprof=collections.defaultdict(list)
for p,t in duties: dprof[p].append(t)
out=[]; 
for i,(c,t,s) in enumerate(samp):
    base=toks(s['text']); mem=[]
    for z in s['sources']:
        if z['source']=='onet': tx={x['id']:x['text'] for x in occ[c]['tasks']}.get(z['ref'],'')
        elif z['source']=='esco': tx=escoOcc.get(z['via'],{}).get('title',{}).get(z['ref'],'')
        elif z['source']=='ilo': tx=iloT.get(z['ref'],('',))[0]
        elif z['source']=='oasis': tx=max(dprof.get(z['ref'],['']),key=lambda d:jac(toks(d),base))
        else: tx=nel.get(z['ref'],{}).get('text','')
        mem.append((z['source'],round(jac(toks(tx),base),2),tx[:120]))
    out.append({'i':i,'code':c,'title':t,'text':s['text'][:120],'members':mem,'min_j':min(m[1] for m in mem)})
json.dump(out,open(AU+'merge_sample.json','w'),indent=0)
import statistics
print('sample',len(out),'min_j<0.6:',sum(o['min_j']<0.6 for o in out),'min_j<0.4:',sum(o['min_j']<0.4 for o in out))
