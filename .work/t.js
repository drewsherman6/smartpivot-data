const fs=require('fs');const TW=require('../scripts/time-weighted');
const d=JSON.parse(fs.readFileSync('data/occupations/25.json'));
for(const c of ['25-2021.00','25-2022.00','25-2031.00']){const o=d.occupations.find(x=>x.code===c);
console.log('\n',c,o.title,'tasks',o.tasks.length, JSON.stringify(o.risk||o.exposure?.headline||Object.keys(o)).slice(0,400));
const rows=TW.taskRows(o);const tw=TW.twe(o);console.log('twe',tw.ai,tw.ai_coverage,tw.robotics,tw.combined,tw.combined_coverage);
for(const r of rows){const t=o.tasks.find(x=>String(x.id)===r.id);console.log(r.id,(r.share*100).toFixed(1),r.ai==null?'-':r.ai.toFixed(2),r.robotics==null?'-':r.robotics.toFixed(2),JSON.stringify(r.evidence.eloundou_labels),r.evidence.aei_penetration,r.evidence.ilo_2025,t.time_share==null?'eq':'', (t.statement||t.task||'').slice(0,70));}}
