#!/bin/bash
# Re-dump the Supabase sp tables the crosswalk/pathway audits (p1-p5) read. Needs $SUPABASE_ACCESS_TOKEN (never printed).
# usage: docs/audit/crosswalk/dump_db.sh [outdir=/workspace/audit]   then run p1-p4, p5run.py, p5check.py from outdir.
set -euo pipefail
OUT=${1:-/workspace/audit}; PROJECT=${SUPABASE_PROJECT:-yhlkfgokukhpjtlicvtk}; mkdir -p "$OUT"
: "${SUPABASE_ACCESS_TOKEN:?set SUPABASE_ACCESS_TOKEN}"
cat > "$OUT/q.sh" <<'Q'
#!/bin/bash
python3 -c 'import json,sys;print(json.dumps({"query":sys.argv[1]}))' "$1" > /tmp/q.json
curl -s -X POST "https://api.supabase.com/v1/projects/${SUPABASE_PROJECT:-yhlkfgokukhpjtlicvtk}/database/query" -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json" --data @/tmp/q.json
Q
chmod +x "$OUT/q.sh"
q() { "$OUT/q.sh" "$1" > "$OUT/$2"; python3 -c "import json,sys;d=json.load(open(sys.argv[1]));assert isinstance(d,list),d;print(sys.argv[1],len(d))" "$OUT/$2"; }
q "select code,title,job_zone,bls_median_annual w,bls_growth_pct g,occupation_ai ai,occupation_robotics rob,occupation_combined e,data_version from sp.occupations" db_occ.json
q "select occupation_code s,target_code t,rank,tier,score from sp.pathways" db_pw.json
q "select occupation_code s,target_code t,rank,score from sp.reskilling_pathways" db_rs.json
q "select occupation_code c,skill_id k,combined,band from sp.skill_risk" db_sr.json
q "select occupation_code c,skill_id k,importance,level from sp.occupation_skills" db_os.json
