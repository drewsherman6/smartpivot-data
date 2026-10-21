const fs=require('fs');const path=require('path');const {parse}=require('csv-parse/sync');
const dir='data/occupations';const occ=[];
for(const f of fs.readdirSync(dir).filter(x=>/^\d\d\.json$/.test(x)))occ.push(...JSON.parse(fs.readFileSync(path.join(dir,f))).occupations);
const T2D=new Map();for(const r of parse(fs.readFileSync('.cache/tasks_to_dwas.csv','utf8'),{columns:true})){const k=String(r['Task ID']);if(!T2D.has(k))T2D.set(k,new Set());T2D.get(k).add(r['DWA Element ID']);}
const vec=(o,f)=>{const m=new Map();const n=(o.tasks||[]).length||1;for(const t of o.tasks||[]){const ds=T2D.get(String(t.id));if(!ds)continue;const w=(t.time_share??1/n)/ds.size;for(const d of ds)m.set(d,(m.get(d)||0)+w);}return m};
const sk=o=>new Map((o.skills||[]).filter(s=>s.kind==='skill').map(s=>[s.id,s.importance]));
const cos=(a,b)=>{let s=0,na=0,nb=0;for(const[k,v]of a){na+=v*v;if(b.has(k))s+=v*b.get(k)}for(const v of b.values())nb+=v*v;return na&&nb?s/Math.sqrt(na*nb):0};
const score=o=>o.derived?.skill_risk_summary?.occupation_combined;
const V=occ.map(o=>({o,d:vec(o),s:sk(o)}));const pairs=[];
const tw=s=>new Set(s.toLowerCase().replace(/,.*$/,'').split(/\W+/).filter(w=>w.length>3));
for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++){const a=V[i],b=V[j];const minor=a.o.code.slice(0,4)===b.o.code.slice(0,4);
 const ta=tw(a.o.title),tb=tw(b.o.title);const inter=[...ta].filter(x=>tb.has(x)).length;const tj=inter/(new Set([...ta,...tb]).size||1);
 if(!minor&&tj<0.5)continue;const sc=cos(a.s,b.s);const dc=cos(a.d,b.d);
 if(sc>=0.97&&dc>=0.6)pairs.push({a:a.o.code,at:a.o.title,b:b.o.code,bt:b.o.title,sc:+sc.toFixed(3),dc:+dc.toFixed(3),sa:score(a.o),sb:score(b.o),gap:Math.abs(score(a.o)-score(b.o))});}
pairs.sort((x,y)=>y.gap-x.gap);
const out=process.argv[2]||'.work/pairs_before.json';fs.writeFileSync(out,JSON.stringify(pairs,null,1));
console.log('pairs',pairs.length,'>15',pairs.filter(p=>p.gap>0.15).length,'>10',pairs.filter(p=>p.gap>0.10).length);
for(const p of pairs.slice(0,15))console.log((p.gap*100).toFixed(0),p.sc,p.dc,p.a,p.at.slice(0,40),p.sa,'|',p.b,p.bt.slice(0,40),p.sb);
const t=pairs.filter(p=>[p.a,p.b].every(c=>['25-2021.00','25-2022.00','25-2031.00'].includes(c)));console.log(t);
