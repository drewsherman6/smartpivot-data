# Crosswalk audit (exhaustive, read-only)

Run: Oct 21, 2026, 8:50–9:30 AM ET. Data: `smartpivot-data@b37f3f7` (multi-source score is primary). Supabase `sp` was loaded from the same SHA (`sp.data_versions` = `smartpivot-data@b37f3f7`, 8:47 AM ET). App: `smartpivot-app@59c2cdb`. Reference data: O*NET 31.0 (`.cache/onet.zip`) and the cached official crosswalk files in `.cache/multisource/`.
Scripts are in `docs/audit/crosswalk/`. They only read data. No scoring code or data was changed.

## Summary

| Area | Items checked | Pass rate | Main failures |
|---|---|---|---|
| 1. O*NET ID integrity (tasks, skills, knowledge, abilities, DWAs, technology) | 21,658 tasks, 35,560 skills, 12,192 knowledge, 20,320 abilities, 27,615 task→DWA links, 15,500 technology items, 1,016 job zones | **100%** | none |
| 1. Task time shares sum to about 100% | 1,016 jobs | 92.3% (938) | 15 inferred "All Other" jobs sum to 200–600%; 14 native jobs sum to 92–97%; 95 jobs have some tasks with no time share |
| 1. Breakdown group counts and time vs the headline cards | 1,016 jobs | **100%** after normalisation | 45 jobs show per-task time rows that don't add to 100% |
| 1. Risk-level rule (<0.30 Low, ≥0.50 High) and combined = 1−(1−AI)(1−robotics) | 1,016 jobs, 35,560 skill rows | **100%** | none |
| 1. Headline level vs task breakdown | 1,016 jobs | 69.4% | **307 jobs have ≥50% of time on exposed tasks but are rated Low (108) or Moderate (199)** |
| 2. All job pairs, strict eligibility recomputed independently | 1,031,240 pairs, 42,180 strictly eligible | — | — |
| 2. Listed pathways obey every rule | 7,693 pathways (6,957 tier 1, 571 tier 2, 165 tier 3) + 193 reskilling routes | **100%** of rules; recomputed overlap and similarity match to 0.01 for every tier-1 pathway | 5 tier-1 targets have no BLS wage (allowed by spec) |
| 2. Strictly eligible pairs missing | 391 jobs with fewer than 10 tier-1 pathways | 99.96% | 15 pairs missed by a floating-point boundary bug |
| 3. Crosswalk links traceable to an official row | 4,128 ESCO links, 1,016 SOC 2010 sets, 1,295 ISCO links, 1,956 NOC 2021 links, 155,396 statement source refs | **100%** for official crosswalks | NICE is a curated mapping (13 jobs, no official crosswalk exists); 3 jobs have no ISCO group |
| 3. Dedupe: wrong merges (random 300 of 1,136 multi-source merges, read by hand) | 300 | 99% (0 wrong, 3 borderline) | — |
| 3. Dedupe: near-duplicates left | 151,397 statements | — | 119 pairs with token Jaccard ≥0.6 left unmerged, many real duplicates |
| 3. Borrowed (transferred) exposure | 1,831 AI + 1,424 robotics transferred scores | — | 72% of AI and 69% of robotics transfers come from a weak donor (similarity 0.34–0.50) |
| 4. Supabase vs repo | 1,016 jobs × 6 fields, 7,693 pathways, 193 reskilling routes, 35,560 skill-risk rows, 35,560 skill rows | **100%** | none |
| 5. `sp_pathways_for_skills`, each job's own skills | 1,016 runs, 15,964 rows | 100% of invariants | 10 doctor jobs lose `29-1029.00 Dentists, All Other Specialists` (the "All Other" filter differs) |
| 5. `sp_pathways_for_skills`, 200 random skill sets | 200 runs, 2,280 rows | **100%** | none |
| 6. Resume matcher, top-1 | 1,016 official, 58,534 alternate and 8,189 reported titles | 94.6% official, 99.86% alternate, 99.90% reported (any valid code for that title) | 49 long official titles can't match; 82 singular titles go to the wrong job |
| 6. Resume matcher, technology detection | 3,000 sampled technology examples | 99.4% | names longer than 8 words aren't detected |

## 1. Job-level integrity (all 1,016 jobs)

**Passed:**
- Every task ID is in O*NET 31.0 for its job, or for its documented donor job when the job is inferred (`inferred_from.sources`). Every task text matches O*NET exactly.
- Every skill, knowledge and ability ID is in the content model and rated for that job.
- Every task→DWA link is a row in `tasks_to_dwas.csv`, and every DWA's parent GWA is consistent.
- Every technology example is in `software_skills.csv` for that job.
- Job zones match `job_zones.csv`.
- There are no duplicate IDs in any list.
- Every job's headline combined risk follows the documented band rule and the formula 1−(1−AI)(1−robotics). So does every one of the 35,560 skill-risk rows.
- The index (`data/occupations/index.json`) agrees with the shard records.
- The breakdown's AI, robotics and safe counts and times match its own task rows for every job, once 61 "both" tasks are counted in both groups and the weights are normalised.

**Failures:**

1. **Headline level contradicts the task breakdown (307 jobs, the highest-impact issue).** These jobs spend ≥50% of their time on tasks the breakdown marks as AI- or robot-exposed, but their headline level is below High: 108 are Low and 199 are Moderate. Of them, 62 are Low and 138 are Moderate even with **≥70%** exposed.
   - Examples: Fine Artists, 100%+ exposed, combined 0.22 (Low; was High before the switch). Floor Sanders, 100%, 0.24 (Low). Sewers, Hand, 96%, 0.17 (Low). Dishwashers, 100%, 0.33 (Moderate). Industrial Truck Operators, 100%, 0.46 (Moderate; was High). Customer Service Reps, 75% AI time, 0.487 (Moderate; was 0.692 High). Heavy Truck Drivers, 78% robotics time, 0.347 (Moderate; was 0.53 High).
   - 117 of the 307 changed level in the switch to the multi-source score.
   - Cause: the breakdown calls a task exposed if it has **any** observed AI use (Anthropic penetration > 0) or a robot tier E1–E3. The headline is an equipercentile-linked blend of 8 measures. A task with 2% penetration counts as fully exposed in the breakdown, while the blend dilutes strong task evidence with job-level measures. The robotics link is also being reworked by the parallel worker.
2. **Task time shares on inferred "All Other" jobs (15 jobs).** Each donor's shares are copied unscaled, so the per-task rows sum to the number of donors: Managers, All Other 600%; Business Operations Specialists, All Other 400%; Personal Service Managers, All Other 200%. The summary cards normalise, so the headline percentages are right, but the per-task "% of time" shown in the breakdown is 2–6× too high.
3. **Native jobs with missing task time (95 jobs; 14 sum to 92–97%).** In the breakdown, tasks without an Anthropic time share get weight 1/n. Their rows display "—", and the shown percentages add to 92–97%, for example Buyers, Farm Products 92%. The cards normalise.

## 2. Pathways and reskilling routes across all 1,031,240 job pairs

The strict-tier rules were reimplemented independently in Python from `scripts/skill-risk.js`: exposure drop ≥0.10 and ≤85% of the source, growth ≥0, not ", All Other", job-zone +2/−1, the zone-5 and doctoral gate, the licensed-doctor block, skill-profile similarity ≥0.35, interest fit ≥0.1, safe-skill overlap ≥0.30, and the source having at least one non-at-risk skill. They were run on every ordered pair.

**Passed for all 7,693 listed pathways and 193 reskilling routes:**
- target less exposed; growth present and ≥0; no ", All Other" target
- doctor-type block; job-zone-5 and doctoral gate
- zone jump ≤2, drop ≤1 (≤2 for tier 3)
- fallback tiers never open a gated target
- tier-2 thresholds (0.03, 0.95, overlap 0.15, similarity 0.20)
- fallback only used when a job has fewer than 3 strict pathways; every job has ≥3
- no duplicate targets; hub cap of 101 respected; pay factor ≤1.08
- stored exposures match current values
- reskilling only when there are fewer than 3 strict pathways, skill fit ≥0.4, ≤4 new skills, no overlap with pathways

Every tier-1 pathway is strictly eligible. Its stored `safe_overlap` and `profile_similarity` match the independent recomputation within 0.01.

**Failures:**
1. **Floating-point boundary (15 pairs missing).** When the exposure drop is exactly 0.100, JavaScript evaluates `0.023 <= 0.123 - 0.1` as false. Examples: Emergency Management Directors → Exercise Trainers (overlap 1.00), Landscape Architects → Makeup Artists (listed only as tier 2 instead of tier 1), Home Health Aides → Paramedics, Mechanical Engineers → Musical Instrument Repairers. The SQL function uses exact numerics and includes them, so the site and the custom-skills tool disagree.
2. **Tier-1 targets without a BLS wage (5).** Musicians and Singers (from Video Game Designers, Graphic Designers, Special Effects Artists) and Disc Jockeys (from Cooks, Paperhangers). The spec only requires wages for tiers 2 and 3. These cards show "pay comparison unavailable".
3. Scale: 208 jobs have no strictly eligible target at all, and 391 have fewer than 10. 10,000+ eligible pairs are blocked by the 10% hub cap. This is by design, and not a failure.

## 3. Multi-source layer

**Traceability (all links):**
- All 4,128 ESCO occupation links are exact rows in the ESCO–O*NET crosswalk (Sep 2022) with the same match type.
- SOC 2018→2010 sets match the BLS file for all 1,016 jobs.
- All 1,295 ISCO-08 links are in the BLS ISCO–SOC crosswalk, or are ESCO `exactISCO` rows.
- NOC 2021 sets match StatCan's NOC16→SOC18 + NOC16→NOC21 chain for all jobs.
- Every one of the 155,396 statement source refs resolves:
  - O*NET refs to a task of the job
  - ESCO refs to a skill linked to that ESCO occupation, with the essential/optional flag correct
  - ILO refs to a row in the ILO 2025 file under one of the job's ISCO groups
  - OaSIS refs to one of the job's NOC units
  - NICE refs to a task of the named work role
- **Not traceable by design:** the NICE work-role mapping for 13 cyber/IT jobs is curated by title (weight 0.5). No official SOC↔NICE crosswalk exists.
- **No ISCO group (3 jobs):** 19-2099.00, 19-2099.01, 53-2022.00. These get no ILO tasks.
- One cached ESCO occupation file is empty or unreadable.
- OaSIS refs point to a profile (for example `62100.00`), not a specific duty row. Refine the ref to profile + duty index so each statement is traceable to one row.

**Dedupe:**
- Wrong merges: I read 300 of the 1,136 multi-source merged statements (random, seed 7) by hand. 0 were wrong. 3 were borderline: "assist passengers" absorbed "assist disabled passengers" and "Assisting passengers with luggage" (Shuttle Drivers), and "Keep records of work assignments" absorbed "keep records of work progress" (Plumbers).
- Near-duplicates left: 119 unmerged pairs of non-knowledge statements in the same job have token Jaccard ≥0.6. Many are real duplicates that differ only by grammar or plurals:
  - "Adjust cutting techniques to types of fabrics and styles of garments." / "Adjust cutting technique to type of fabric and style of garment" (51-6062)
  - "Participate in faculty and college committee activities." / "…activities of various faculty and college committees." (11-9033)
  - "Measure, cut, bend and thread pipes…" / "Measure, cut, thread and bend pipe…" (47-2152)
  - Cause: first-match greedy merge and a tokenizer that doesn't stem plurals or "-ing" consistently.

**Borrowed (transferred) exposure:**
- Of 1,831 transferred AI scores, 1,311 (72%) have donor similarity under 0.50. Of 1,424 transferred robotics scores, 984 (69%) do. The threshold is 0.34.
- Weak or wrong donors:
  - "diagnostic methods in medical laboratory" ← "Manage medical laboratories"
  - "operate dry cleaning pressing machines" ← "Clean and maintain pressing machines"
  - "transport patient to medical facility" ← "Monitoring changes in health status of patients during transport"
- Transferred scores are display-only and don't vote in the blend, so they don't move scores. They do appear as statement-level evidence.

## 4. Supabase vs data repo

Every item matched (0 mismatches):
- for 1,016 jobs: combined, AI, robotics, wage, growth and job zone
- all 7,693 pathways: rank, tier and score
- all 193 reskilling routes
- all 35,560 skill-risk rows: combined and band
- all 35,560 occupation-skill rows: importance and level

## 5. `sp_pathways_for_skills` (custom-skills / assessment function)

- **Each job's own skills (1,016 runs, 15,964 rows):** every row obeys every invariant listed in §2 for its tier. Tier-1 rows are all strictly eligible, and their overlap matches the independent formula. The function returns every strictly eligible target up to its 25-row limit, with one exception: in 10 physician jobs (Anesthesiologists, Dermatologists, OB/GYN, Pediatricians, Pathologists and others), `29-1029.00 Dentists, All Other Specialists` is listed in the repo but dropped by the function. The cause is that SQL filters `title !~* ', all other'` anywhere in the title, while the repo only excludes titles *ending* in ", All Other".
- **200 random skill sets:** 2,280 rows, 0 violations. Every run returned at least 3 results.
- By design, the function has no global hub cap, so its ranking can differ from the stored list.

## 6. Resume matcher (`src/lib/resume/map.ts`, the same lookup as `sp_resume_lookup`)

Each title was fed on its own as a one-line resume against the full `sp.onet_titles` and `sp.onet_tech` tables.

| Title set | n | Top-1 = the code the title belongs to | Top-1 = any code that lists this title | In top 5 | No match |
|---|---|---|---|---|---|
| Official occupation titles | 1,016 | 94.6% | 94.6% | 94.6% | 49 |
| Alternate titles | 58,534 | 82.3% | **99.86%** | 98.5% | 12 |
| Reported titles | 8,189 | 76.9% | **99.90%** | 95.3% | 0 |

17,159 alternate titles belong to more than one O*NET code, so the "any valid code" column is the fair top-1 accuracy. Title plus 3 of the job's own technologies gave 1,860 of 1,861 correct.

**Failures:**
1. **Long official titles (49) can't match.** The n-gram cap is 8 words, for example "Middle School Teachers, Except Special and Career/Technical Education" and "First-Line Supervisors of Food Preparation and Serving Workers". Real resumes rarely use these exact strings, but the long title should still be matchable.
2. **Singular→plural collision (about 80).** A singular alternate title is pluralised and then matches another job's plural official title, which outweighs the exact alternate:
   - "Range Manager" → Range Managers 19-1031.02 instead of 11-9013
   - "Credit Counselor" → 13-2071 instead of 13-2052
   - "Intelligence Analyst" → 33-3021.06 instead of 15-2051.01
   - "Editor" → 27-3041 instead of 27-4032
3. **Technology detection:** 2,981 of 3,000 sampled examples (99.4%) were detected. The misses are names longer than 8 words, for example "Systems analysis programs for hands on integrated reliability evaluation software SAPHIRE".

## Recommended fixes, ranked by impact

1. **Reconcile the headline level with the task breakdown (307 jobs).** Either drive the breakdown's "exposed" flag from the same calibrated task scores the blend uses, with a penetration threshold instead of >0, or show the breakdown as "tasks with any observed AI use" with a note explaining why the level can be lower. Re-check Customer Service Reps and Heavy Truck Drivers after the parallel AI+robotics combination fix.
2. **Fix the floating-point boundary** in `evalCand`: compare with `E_T <= E_S - minDrop + 1e-9` and `E_T <= E_S * maxRatio + 1e-9`. This adds 15 tier-1 pathways and makes the site match `sp_pathways_for_skills`.
3. **Align the "All Other" filter.** Use `title ~* ', all other$'` in SQL, or broaden the JS regex, so 29-1029.00 is treated the same everywhere.
4. **Normalise per-task time shares** for inferred multi-donor jobs (divide by the number of donors) and for jobs with missing shares (apply the 1/n weight before display). The per-task rows then add to 100%.
5. **Resume matcher:**
   - Rank an exact alternate or reported match above a pluralised match of a different code. For example, add a bonus when the line norm equals `r.gram`, or skip plural grams when the singular exists in `onet_titles`.
   - Raise the n-gram cap to 14 words, or match long official titles by containment.
   - Match technology names by containment of their first 6+ words.
6. **Dedupe:** stem "-ing" and plurals symmetrically before the Jaccard test, and merge into the best match rather than the first. Review the 119 remaining pairs (list in `docs/audit/crosswalk/p3.py` output).
7. **Transferred exposure:** raise `TRANSFER_J` to 0.5, or label transfers under 0.5 as "weak match" in the UI. This drops about 70% of transfers.
8. **Traceability:** store the OaSIS duty index in refs. Add ISCO groups for 19-2099.00, 19-2099.01 and 53-2022.00 from ESCO `exactISCO`, or from the 2-digit SOC fallback with a flag. Re-download the one empty ESCO cache file.
9. Optional: require a BLS wage for tier-1 targets too (5 pathways), for consistency with tiers 2 and 3.

## Fix results (Oct 21, 2026, data e975a25, app 71be3ff)

Fixes #2–#6 applied to all 1,016 jobs; #1 (headline vs breakdown) untouched pending Drew. Headline AI/robotics/combined values and risk levels unchanged for all 1,016 jobs (576/355/85).

| Issue | Before | After |
|---|---|---|
| #2 float boundary: strictly eligible pairs missing | 15 | 0 (tier 1: 6,957 → 6,969; listed pathways 7,693 → 7,698) |
| #3 "All Other" filter: repo vs `sp_pathways_for_skills` | 10 physician jobs differ (29-1029.00) | 0 (JS now `/, All Other/i`, same as SQL) |
| #4 breakdown per-task rows not summing to 100% | 45 jobs (15 at 200–600%, rest 92–97%) | 0 (`time_share_normalized`; raw `time_share` kept) |
| #5 resume: official titles top-1 / no match | 961 / 49 | 1,016 / 0 |
| #5 resume: alternate top-1 any valid / reported | 58,452 / 8,181 | 58,532 / 8,189 |
| #5 technology detection (3,000 sample) | 2,981 | 3,000 |
| #6 near-duplicate pairs J≥0.6 left | 119 | 111 (40 true cross-source duplicates merged; statements 151,397 → 151,357). Remaining pairs are distinct official rows (e.g. two ESCO skills, "teach languages" vs "teach sign language") and are kept. |
| Supabase vs repo (p4) | 0 mismatches | 0 mismatches |


## Issue #1 resolved: time weighting (Oct 21, 2026)

Drew's decision: the headline AI and robotics scores must be weighted by how much time each job spends on each task. Implemented in `scripts/time-weighted.js` + `scripts/blend.js` (method: docs/BLEND_COMPARISON.md "Time weighting"; site: /method#time-weighting).

| | Before | After |
|---|---|---|
| Low / Moderate / High | 576 / 355 / 85 | 383 / 468 / 165 |
| Issue #1 jobs (>=50% flagged time, below High) | 311 | 252 (59 now High) |
| Jobs with graded time-weighted exposure >= 50% but below High | n/a | 8 (headline 0.486-0.497, T 0.500-0.511) |
| Heavy truck drivers 53-3032.00 | 0.347 Moderate | 0.516 High (robot T 0.505: 63% of time driving, tier E2) |
| Customer service reps 43-4051.00 | 0.487 Moderate | 0.733 High (AI T 0.753) |
| Software developers 15-1252.00 | 0.407 Moderate | 0.539 High (AI T 0.545) |
| Fine artists 27-1013.00 | 0.217 Low | 0.501 High (T AI 0.391, robots 0.212) |
| Floor sanders 47-2043.00 | 0.235 Low | 0.328 Moderate (robot T 0.333: all flagged tasks are tier E1) |

Why 252 remain: the audit's "flagged time" counts a task as fully exposed on *any* AI use or *any* robot tier E1-E3; the headline now uses each task's graded exposure. In 240 of the 252, most of the flagged time is robot tier E1 only ("robots can do parts of it", strength 1/3), so their graded time-weighted exposure is below 50%. 7 sit at the line (T 0.500-0.508, headline 0.486-0.497 because the other measures keep 10%), 5 have partial-strength tasks. Per-job reasons: `docs/audit/time_weighting/residual311.md` (script `residual311.py`). The audit script p1 now also checks the graded rule (`headline_below_High_but_time_weighted_graded_exposure_>=50pct`: 8, all within 0.02).
