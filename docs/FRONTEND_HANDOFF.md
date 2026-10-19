# Frontend handoff: launchpad.smartpivot.xyz ← smartpivot-data

**For:** the SmartPivot frontend developer or agent · **Owner of this repo:** Jarvis (Drew's assistant), replacing the old research agent · **Updated:** 2026-10-15

Raw base: `https://raw.githubusercontent.com/drewsherman6/smartpivot-data/main/`

---

## 1. What changed

| Before | Now |
|---|---|
| Repo was **private**, so raw fetches returned 404 ("Remote fetch failed" on `risk_scoring_overlay.json`) and the app served its bundled May/July snapshot | Repo is **public**. Raw URLs on `main` return 200 |
| Hand-typed research, last real update 2026-07-20; one July file was invalid JSON | PR #1 merged, plus a full-coverage build: **all 1,016 O\*NET 31.0 occupations**, BLS national wages and projections, AI and robot exposure, transitions, per-family signals |
| Script force-pushed and bumped dates every run | Merge-only updates. Dates change **only when data changes**. Never force-pushed |
| Old agent | Maintained by **Jarvis** |

### Schedule
- The weekly refresh is scheduled for **Mondays 7:35 AM Toronto**, before your 10:00 AM assumption. Your 1-hour cache is fine.
- The repo has no Actions workflow. The routine is in `aether-research.md`, and the run is scheduled outside the repo.

### Branch: `main` is canonical, `master` is mirrored
- The maintained branch is **`main`**.
- **`master`** was frozen at 2026-07-20, which is why your "master first" order served July data. As of 2026-10-13 it has been fast-forwarded to `main`, and every weekly refresh keeps it in sync.
- Your current fetch order works. Fetching `main` directly is still recommended, because it saves a request and is the branch we guarantee.

---

## 2. Legacy root files (paths and top-level shapes unchanged)

All of these are now validated against `schemas/*.schema.json` on every push. Your "clean broken formatting" step is no longer needed. Keep it only as a defensive fallback.

| File | What changed | Actual counts now |
|---|---|---|
| `risk_scoring_overlay.json` | `version`/`generated_date` set to `2026-10-13`. `trend_summary` rewritten from sourced figures (BLS 2025–35, WEF 2025, McKinsey Nov 2025). 5 LinkedIn 2026 skills appended to `new_emerging_skills`. `skill_adjustments` unchanged | 4 skill adjustments |
| `skills_summary.json` / `skills_export.json` | Unchanged (`generated: 2026-07-06`) | 28 skills (18 future_proof, 10 at_risk) |
| `agentic_capabilities.json` | Added n8n, Zapier Agents, Lindy, Microsoft Agent Framework. Dates `2026-10-13` | **10 platforms, 11 prebuilt agents, 15 catalog skills** |
| `robotics_capabilities.json` | Added ABB Robotics, FANUC, Universal Robots, KUKA, Intuitive Surgical. `total_robots_tracked` 7 → 10 | **9 platforms, 4 catalog skills** |
| `future_proof_skills.md`, `at_risk_skills.md` | Unchanged | |

**Discrepancies with your current assumptions**
- *"78 platforms, 713 agents"*: that only matches the **broken July 8 file**, whose platform list had 78 entries; I can't tell where 713 comes from. The valid legacy file has **10 platforms / 11 agents**. The full catalog now lives in `data/agent_platforms.json`: **122 platforms**, 106 verified.
- *"35+ / 40 robotics platforms"*: the legacy file has **9**. Use `data/robotics_manufacturers.json` (**54 makers**) and `data/robotics/platforms.json` (**726 developers** mapped to occupations).

The **±6 whole-role cap** is still the rule for `risk_scoring_overlay.json` and is enforced by the runbook. Keep applying it client-side too.

---

## 3. New datasets

Start at **`index.json`**, which lists every dataset with `path`, `schema`, `schema_version`, `last_updated` and `record_count`.
```json
{"name":"headline_stats","path":"data/headline_stats.json","schema":"schemas/headline_stats.schema.json","schema_version":"1.0.0","last_updated":"2026-10-13","legacy":false,"record_count":28}
```

### 3.1 Occupations (keyed by O\*NET-SOC code)
- `data/occupations/index.json` has all 1,016 codes with summary fields:
```json
{"code":"43-4051.00","title":"Customer Service Representatives","shard":"data/occupations/43.json","job_zone":2,"employment":2595750,"median_annual_wage":44770,"projected_change_percent":-5.3,"ai_exposure_composite":0.867,"robot_exposure_index":0}
```
- **Lookup recipe:** take the first 2 digits of the code (`43-4051.00` → `43`), fetch `data/occupations/43.json`, then find the entry in `occupations[]` with that `code`. There are 23 shards (11…55), each 0.2–3.5 MB, so cache them per shard.
- This also covers free-typed titles. Match against `title` in the index, or keep your Supabase O\*NET copy and use the code to look up here.

Key fields in each occupation record:

| Field | Use |
|---|---|
| `skills[]` | `{id,name,kind:"skill",category:"essential"\|"transferable",importance(1-5),level(0-7)}` |
| `abilities[]` | `{…,kind:"ability",category:"cognitive"\|"psychomotor"\|"physical"\|"sensory"}`, top 20 by importance |
| `knowledge[]`, `technology[]` (`hot`, `in_demand`), `tasks[]`, `emerging_tasks[]`, `related[]`, `job_zone` | O\*NET 31.0 |
| `bls.oews` / `bls.projections` | See §4 |
| `exposure.ai` / `exposure.robotics` | See §3.3 |
| `derived.transitions[]`, `derived.future_skills[]`, `derived.core_skills[]`, `derived.skills_to_develop[]`, `derived.skills_to_deepen[]`, `derived.future_technologies[]` | See §3.2 |

**Fixes "Skills to Develop" showing Finger Dexterity / Depth Perception:** filter by `kind === "skill"`. `derived.skills_to_develop` already contains skills only.

### 3.2 Transitions and future skills
These address three problems: the CSR Future Forecast showing ML skills, the thin Skill Evolution Map, and 0 Career Matches.
```json
"derived": {
  "transitions": [{"code":"13-1111.00","title":"Management Analysts","relatedness_tier":"Primary-Short","projected_change_percent":10.1,"median_annual_wage":101860,"ai_exposure_composite":0.804,"score":0.427,
     "skill_gaps":[{"skill":"Operations Analysis","current_level":0.62,"target_level":3.88,"target_importance":3,"gap":3.26}]}],
  "future_skills": [{"skill":"Active Listening","category":"essential","kind":"skill","future_importance":3.873,"current_importance":4}],
  "skills_to_develop": [{"skill":"Operations Analysis","kind":"skill","weighted_gap":0.835,"for_transitions":["13-1111.00"]}],
  "future_technologies": [{"name":"Microsoft Excel","occurrences":6}]
}
```
(Real values for 43-4051.00 as of 2026-10-13; arrays truncated.)
- **Career Matches / pathways:** use `transitions` (up to 8, ranked by `score`).
- **Skill Evolution Map:** draw an edge from each `skill_gaps[].skill` to its `transitions[].title`. That gives about 5 skills × 8 careers per occupation.
- **Future Forecast:** use `future_skills`, which ranks skills by how distinctive they are for this job plus future signals, and `future_technologies`. Show each item's `why`, and use `signal_sources[]` for provenance. Put generic baseline skills from **`core_skills`** in a separate "Core skills" row. Example for 15-1252.00:
```json
{"skill":"Programming","category":"transferable","kind":"skill","future_importance":4,"current_importance":4,"distinctiveness":2.264,"future_score":2.764,"why":"importance 4 vs 1.602 avg across 910 occupations; hot/in-demand tech: Apache Kafka, C, C#; rising: AI and big data; …","signal_sources":[{"type":"distinctiveness","source":"O*NET 31.0 skills (importance/level z-score vs all occupations)","value":2.264},{"type":"hot_technology","source":"O*NET 31.0 technology skills (Hot Technology / In Demand flags)","items":["Apache Kafka","C","C#"]},{"type":"rising_skill","source":"World Economic Forum - Future of Jobs Report 2025","url":"…","record_id":"wef-ai-bigdata"}]}
```
- **Skills to Develop vs Skills to Deepen (no duplicates):** `skills_to_develop` never contains a skill that is also in the same occupation's `future_skills` or `core_skills` (or that it already rates at importance ≥ 3.5); `npm test` enforces this for all 1,016 occupations. Strong existing skills that a target role needs at a clearly higher level are in **`skills_to_deepen`** instead:
```json
"skills_to_deepen":[{"skill":"Repairing","kind":"skill","strength":"future_skill","current_level":2.75,"current_importance":2.88,"weighted_gap":0.391,"max_gap":1.13,
  "targets":[{"code":"49-3031.00","title":"Bus and Truck Mechanics and Diesel Engine Specialists","current_level":2.75,"target_level":3.88,"target_importance":4,"gap":1.13}]}]
```
(53-3032.00 Truck Drivers.) Show it as e.g. "Deepen: Repairing (for Bus and Truck Mechanics…)". Don't merge it back into Skills to Develop. 22 occupations have an empty `skills_to_develop` (every gap is a skill they already have): hide that section. In `transitions[].skill_gaps[]`, `already_strong: true` marks the same kind of skill, so the pathway card can say "build on" instead of "learn".
- The formulas are in `README.md` → "Derived fields".

### 3.3 Exposure
- `data/exposure/ai_exposure.json` has per-code `eloundou_2023` {dv_/human_ alpha, beta, gamma}, `felten_aioe`, `anthropic_observed_exposure`, and `composite` {value 0–1 percentile, n_measures, method}. Show each measure separately and label the composite as **derived**.
- `data/exposure/robot_exposure.json`:
```json
{"code":"47-2061.00","title":"Construction Laborers","anthropic_robot_exposure_index":1.049,"onet_degree_of_automation":1.3,"top_developers":["ZenRobotics / Terex","Bedrock Robotics","Built Robotics", "…"]}
```

**Task shares (true percentages):**
```json
"exposure":{"robotics":{"total_tasks":27,"rated_tasks":27,"exposed_tasks_count":22,"exposed_task_share":0.815,"exposed_time_share":0.852,"task_share_method":"…"},
            "ai":{"task_share":{"total_tasks":13,"tasks_with_data":13,"tasks_with_ai_usage":6,"share":0.462,"mean_penetration":0.459,"method":"…"}}}
```
(The robotics figures are for 47-2061.00 Construction Laborers; the AI figures are for 43-4051.00 CSR.) Show "X% of tasks", using `exposed_task_share` or `share`. Use `exposed_time_share` when you mean "share of work time".

### 3.4 Robotics
- `data/robotics/platforms.json` has 726 robot developers cited as evidence in task ratings. Each has `systems[]`, `occupations[]` (O\*NET codes) and `source_urls[]`.
- `data/robotics_manufacturers.json` has 54 makers across segments (industrial, cobot, humanoid_mobile, surgical_medical, logistics, service, autonomous_vehicles, agriculture, construction, drones_inspection). Each has `evidence` and `robot_exposure_citations.occupations`.
- Per occupation (shard): `exposure.robotics.cited_systems[]` (system, developer, maturity, url) and `exposed_tasks[]` (with tier E1–E3).
- **Your SOC routing rule** (47, 51, 53, 45, 35 always; 31, 33, 39 partial) still works. To refine the partial groups, show robotics for an occupation when `anthropic_robot_exposure_index > 0` or `cited_systems.length > 0`. Otherwise hide the panel. This replaces "40 platforms tracked" with real per-job systems.

### 3.5 Agent platforms
`data/agent_platforms.json` has 122 entries with `category`, `skills`, `facts`, `status`, `source`, `evidence` {http_status, title, description, checked_at} and `onet_mapping` {activities[], top_occupations[25]}.
- **Per occupation (preferred):** each shard record has `agents.platforms[]`, the top 12 **verified** platforms ranked by task-weighted overlap. `data/agents_by_occupation.json` has the same list for every code. Show `matched_tasks` as the "why".
```json
"agents":{"platforms":[{"id":"restored-intercom-fin-ai-agent","name":"Intercom Fin AI Agent","url":"https://www.intercom.com/","status":"verified","category":"customer_service","score":0.791,"relevance":"high","matched_tasks":[{"id":"18565","text":"Confer with customers by telephone or in person to provide information about products or services, take or enter orders, cancel accounts, or obtain details of complaints."}]}],"platform_count":52,"category_scores":{"customer_service":0.847}}
```
- **Per platform:** `onet_mapping.occupations[]` lists every mapped occupation as `{code, score}`, with no cap. `onet_mapping.occupation_count` gives the count.
- Hide `relevance:"low"` by default. 101 occupations with tasks have no platform above the threshold (mostly driving and hands-on manual roles), so show an empty state for them.

### 3.6 Weekly signals per family
`data/signals/families.json` has one entry per SOC major group. This fixes the identical, May-28-dated "This week's signal" shown for every role.
```json
{"code":"43-0000","title":"Office and Administrative Support Occupations","occupations":55,"employment_weighted":{"projected_change_percent":-4.056,"ai_exposure_composite":0.817,"robot_exposure_index":0.238,"median_annual_wage":49453.074},"fastest_growing":[…],"fastest_declining":[…],"most_ai_exposed":[…],"most_robot_exposed":[…],"emerging_tasks":[…],"hot_technologies":[…],"changes_since_previous":null}
```
Use the top-level `generated` as the signal date.

### 3.7 Inferred data: "based on closest related role" (`inferred_from`)
Every one of the 1,016 occupations now has non-empty `skills`, `derived.future_skills`, `derived.core_skills`, `derived.transitions`, `exposure.ai.task_share` and `exposure.robotics.exposed_task_share` (enforced by `npm test`). For **106** occupations O*NET has no ratings (new roles like Financial and Investment Analysts, Cardiologists, EMTs, Legislators; "All Other" catch-alls; military 55-xxxx), so the data is borrowed from the closest rated role and marked:
```json
"inferred_from": {"code":"29-2043.00","title":"Paramedics","method":"onet_soc_2010_crosswalk",
  "label":"Based on closest related role: Paramedics","sources":[{"code":"29-2043.00","title":"Paramedics"}],
  "fields":["skills","abilities","knowledge"],
  "note":"Both this occupation and Paramedics were split from the O*NET-SOC 2010 occupation \"Emergency Medical Technicians and Paramedics\" (29-2041.00)."}
```
- **Where it appears:** `occupation.inferred_from` (full), `derived.inferred_from` (`{code,title,method,label,fields}`), `inferred: true` on each derived item, `exposure.ai.task_share.inferred_from` / `exposure.robotics.inferred_from` (only when tasks were borrowed), `exposure.ai.composite.inferred_from`, and `inferred_from` (or `null`) in `data/occupations/index.json`.
- **What to show:** when `inferred_from` is present, show `inferred_from.label` once (e.g. a small note under the skills / Future Forecast / exposure sections, or on the dashboard header): *"Based on closest related role: Paramedics"*. `fields` tells you which sections it applies to. Keep it as a note, not an error.
- `method` values: `same_soc_siblings`, `onet_soc_2010_crosswalk`, `military_civilian_equivalent`, `onet_related_top_ranked`, `same_broad_soc_group_most_similar`, `same_minor_soc_group_most_similar` (README → "Inferred data").
- `kind` is preserved, so `kind === "skill"` filtering still keeps abilities out.
- **BLS group estimates:** `bls.oews.inferred_from` / `bls.projections.inferred_from` = `{code, title, method: "bls_broad_group"|"bls_minor_group"|"bls_major_group"}` means the figure is a SOC-group aggregate. Label it "group estimate (BLS: {title})". The index has `bls_basis.oews` / `bls_basis.projections` (`"detailed"` or the group method).
- **Documented BLS gaps:** `bls.unavailable` is a reason string per missing figure: `median_annual` (5 performer occupations: BLS publishes only an hourly wage, so show `bls.oews.median_hourly` as "/hour"), `oews` and `projections` (19 military codes: BLS doesn't cover the armed forces). Show the reason instead of a number, never an estimate.
- **Friendlier tool names:** `future_skills[].why` now lists recognisable tools first with clean names ("CSS", "AWS", "MATLAB" instead of "Cascading style sheets CSS"). `future_technologies[].display_name` has the same clean name.

---

## 4. BLS: recommended switch

| You use | Repo has | Recommendation |
|---|---|---|
| Weighted proxy from 6 states (CA, TX, FL, NY, IL, PA) | `bls.oews` = **official national OEWS May 2025**: `employment`, `median_annual`, `mean_annual`, `median_hourly`, `annual_p10`, `annual_p90` | Use the national figure. The proxy isn't needed |
| Fixed 2023–33 projections | `bls.projections` = **2025–35** (`change_percent`, `openings_annual_thousands`, `typical_education`) | Switch. 2023–33 is two releases old |

- Label the evidence class in the UI: "Published national estimate (BLS OEWS, May 2025)" vs "Projection (BLS 2025–35)".
- Coverage: a wage or projection for every civilian code. Some are SOC-group aggregates (`inferred_from` on the block; label them "group estimate"). The only gaps are documented in `bls.unavailable` (19 military codes; 5 hourly-only performer codes have `median_hourly` instead of an annual median). Don't substitute your own estimate. See §3.7.
- `bls.oews.soc` may be a broad-group code when there is no detailed match. Show it.
- **Shared SOC (`shared_soc`):** BLS publishes one wage/projection per 6-digit SOC. When several O*NET roles share it (215 codes in 72 SOCs), `bls.oews.shared_soc` / `bls.projections.shared_soc` = `{soc, title, codes[], occupations[], label, note}`. Show `label` next to the figure, e.g. on Customs and Border Protection Officers (33-3051.04): *"BLS reports this together with Police and Sheriff's Patrol Officers (SOC 33-3051)"*. Don't present the number as specific to that role, and don't compare two codes from the same `shared_soc` on pay/growth as if they differed (they are the same number).
- **Top-coded wages (`top_coded`):** wages are stored exactly as in the OEWS source file (checked by `npm test`). If BLS top-codes a wage (`#`, ≥ $239,200/yr or ≥ $115/hr), that field is null, `top_coded: true`, `top_coded_fields` lists which, `top_code_threshold.annual` gives the threshold, and `bls.unavailable.median_annual` has the reason. Show "≥ $239,200" (from the threshold), never a number of your own. The May 2025 file has no top-coded cells, so this is currently unused. Physician wages such as Cardiologists $496,010 (mean $454,940) are the real published values; a median above the mean is normal for these left-skewed distributions.

---

## 5. Provenance
- **Curated records** (`data/headline_stats.json`, `data/occupations.json`, `data/emerging_skills.json`, `data/agent_platforms.json`, `data/robotics_manufacturers.json`) carry:
```json
"source":{"name":"World Economic Forum - Future of Jobs Report 2025, ch.2 Jobs outlook","url":"https://www.weforum.org/…/2-jobs-outlook/","publication_date":"2025-01-07","tier":1},"retrieved_at":"2026-10-13","confidence":"high"
```
- **Bulk files** (shards, exposure, signals, robotics platforms) carry a top-level `sources{}` map, each with `name`, `version`, `url`, `page` and `retrieved_at`.
- **Display:** add a small "Source" chip (name + link). On hover, show the publication date, retrieved date and confidence. Grey out `confidence:"low"`.
- **Platform `status`:** `verified` · `needs_review` · `unreachable` (bot-blocked or 404) · `restored_unverified` · `deprecated`. **By default, show only `verified`.**

---

## 6. Bugs found in our walkthrough (frontend side)
1. Login wall contradicts the "no account required" claim.
2. Skipping the resume still says "we parsed your resume".
3. Progress bar jumps from 10% to 100%.
4. Quiz Q6/8 has the wrong heading. "1 points" should be "1 point".
5. The Career Matches counter shows 0, then pathways appear.
6. The BLS live wage is empty. Use `bls.oews.median_annual`.
7. Robotics says "40 platforms tracked" but shows none. See §3.4.
8. A "Remote fetch failed" error and the internal GitHub URL are shown to users. Hide both and log them instead.
9. Analysis takes about 50 s against a claimed 10–20 s.
10. ESCO strings are lowercase and there are grammar errors ("a Customer Service Representatives").
11. The footer shows `┬⌐` (an encoding error; it should be ©).
12. The Learn More and Pitch Deck nav links are dead.
13. Deep routes return 404 and the URL never changes.
14. "This week's signal" is dated May 28. See §3.6.
15. Homepage stats and testimonials are hard-coded with 2023–25 citations. Use `data/headline_stats.json`.
16. Ad placeholders are empty.

**Correction to earlier notes:** the generative layer is **OpenAI + the built-in Google model only**. There are no Perplexity or Grok keys.

---

## 7. Contract

**This repo guarantees:**
- Paths listed in `index.json` stay stable. Legacy root files keep their path and top-level shape.
- Schemas live in `schemas/`, with `schema_version` on each dataset. A **patch or minor** version bump means additive changes only. A **major** bump means a breaking change: it ships under a new path, with the old path kept for at least 4 weeks.
- Dates change only when the data changes. Every push passes `npm test`.
- Nothing is deleted. Retired items get `status:"deprecated"` (or `deprecated:true`).
- `main` is canonical. `master` is kept identical to it as a mirror.

**We ask of the frontend:**
- Prefer `main` (`master` mirrors it), with your 1-hour cache and the bundled fallback.
- Hide `deprecated` items. Show provenance.
- Request new fields or report data issues through a GitHub issue in `drewsherman6/smartpivot-data` labelled **`frontend-request`**.
