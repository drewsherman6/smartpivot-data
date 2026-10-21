"""Re-checks CROSSWALK_AUDIT issue #1 after time weighting: the 311 jobs with >=50% of time on tasks the breakdown flags
as exposed (any AI use or robot tier E1-E3) that were below High before time weighting. Writes a reason per remaining job.
Usage: python3 docs/audit/time_weighting/residual311.py > docs/audit/time_weighting/residual311.md"""
import json,glob,os
R=os.path.dirname(os.path.abspath(__file__))+'/../../../'
new={o['code']:o for f in glob.glob(R+'data/occupations/[0-9][0-9].json') for o in json.load(open(f))['occupations']}
bd={o['code']:o for f in glob.glob(R+'data/exposure/task_breakdown/*.json') for o in json.load(open(f))['occupations']}
band=lambda v:'Low' if v<0.3 else 'High' if v>=0.5 else 'Moderate'
rows=[];fixed=0
for c,o in sorted(new.items()):
    S=o['derived']['skill_risk_summary']; b=bd[c]; s=b['summary']; exp=s['ai_time']+s['robotics_time']
    if exp<0.5 or band(S['before_time_weighting']['occupation_combined'])=='High': continue
    now=band(S['occupation_combined'])
    if now=='High': fixed+=1; continue
    T=S['time_weighted']; ex=[t for t in b['tasks'] if t['ai_exposed'] or t['robotics_exposed']]
    et=sum(t['time_share_normalized'] for t in ex) or 1
    e1=sum(t['time_share_normalized'] for t in ex if t['robotics_exposed'] and not t['ai_exposed'] and t['evidence']['robot_tier']=='E1')/et
    aiw=sum(t['time_share_normalized'] for t in ex if t['ai_exposed'] and (t['ai_strength'] or 0)<0.5+1e-9 and not t['robotics_exposed'])/et
    if T['combined']>=0.5: why=f"Time-weighted task exposure is {T['combined']:.0%}, right at the line; the other measures (10% weight) put the headline {S['occupation_combined']:.1%}, just under High."
    else:
        parts=[]
        if e1>=0.05: parts.append(f"{e1:.0%} of the flagged time is robot tier E1 only (Anthropic's lowest tier, strength 1/3)")
        if aiw>=0.05: parts.append(f"{aiw:.0%} is AI tasks whose graded strength is 0.5 or less (observed use but rated not exposed, E0, by Eloundou et al.)")
        if not parts: parts.append("the flagged tasks have partial graded strength")
        why=f"Graded, time-weighted exposure is {T['combined']:.0%} (AI {T['ai']:.0%}, robotics {T['robotics']:.0%}), below 50%: "+'; '.join(parts)+'.'
    rows.append((c,o['title'],exp,T['ai'],T['robotics'],T['combined'],S['before_time_weighting']['occupation_combined'],S['occupation_combined'],now,why))
print(f"# Issue #1 re-check after time weighting\n\n311 jobs had >=50% of their time on tasks flagged exposed (any use) and were below High before time weighting. **{fixed} are now High; {len(rows)} remain** (listed with the reason). \"Flagged time\" counts a task as fully exposed on any AI use or any robot tier E1-E3; the headline uses the graded strength of each task.\n")
print('| Code | Title | Flagged time | T AI | T robotics | T combined | Before | Now | Level | Why it is not High |\n|---|---|---|---|---|---|---|---|---|---|')
for r in rows: print(f"| {r[0]} | {r[1]} | {r[2]:.0%} | {r[3]} | {r[4]} | {r[5]} | {r[6]} | {r[7]} | {r[8]} | {r[9]} |")
