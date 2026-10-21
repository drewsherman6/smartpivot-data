# Changelog

Machine-readable history: `data/history/changes.jsonl`. `scripts/update.js` appends entries here automatically.

## 2026-10-21 - Quality pass: scale linking, same-setting robot pooling, crosswalk cache, resume tie-break
- `scripts/blend.js`: other measures are equipercentile-linked onto the task-level score distribution before blending (rank from 1-(1-O_ai)(1-O_rob); AI:robot ratio kept; `other_measures_unlinked` kept). Max effect 0.012.
- `scripts/time-weighted.js`: robot DWA pool = jobs in the same SOC minor group plus jobs in other groups whose O*NET 31.0 Work Context (CX) profile has cosine similarity >= the median same-group pair (0.536); tasks copied from a source job use the source job's setting (53-7199.00 now 0.373 vs 47-5022.00 0.372, was 0.468 vs 0.312). Source tag `+same_work_context`.
- `scripts/refresh.js`: offline runs download any source whose cache is missing (fixes the missing O*NET 2010-2019 crosswalk); runs agentic-skills after task-breakdown. Full online refresh run end to end.
- App resume mapping: ambiguous alternate-vs-official title ties go to the job with higher BLS employment (CSR resume -> 43-4051.00, was 43-4041.00).
- Near-identical audit (`scripts/audit/near_identical.py`, `docs/audit/near_identical_pairs.json`): 21 pairs (DWA Jaccard >= 0.7, gap > 0.10); evidence term <= 0.03 in all, 16 explained by task time mix (O*NET/Anthropic time shares, e.g. nursing instructors' 15% clinical supervision), 5 by job-level other measures. Genuine, documented; no artifact found.
- `docs/audit/crosswalk/dump_db.sh`: reproducible DB dump for audits p1-p5.
- Bands Low/Moderate/High 307/376/333 -> 309/380/327; market-rule levels safe/moderate/at_risk 298/384/334.

## 2026-10-21 - Breakdown groups by main driver
- `scripts/task-breakdown.js`: each task with points is listed once, under its main driver (AI or robots, whichever adds more of its points); `ai_exposed`/`robotics_exposed`/`group` follow it, `main_driver`, `any_ai`, `any_robotics` added; summary `ai_group_points` + `robotics_group_points` = `combined_time_weighted`. Truck drivers: AI group 13% of time / 7 pts, robots 83% / 64 pts (was 83% AI by the any-fraction rule).

## 2026-10-21 - "What is exposed" uses the score's pooled per-task fractions
- `scripts/task-breakdown.js`: `ai_exposed` / `robotics_exposed` / `group` now = AI % / robot % > 0 from the same pooled per-task fractions as the score (`ai_automatable`, `robotics_automatable`), so the card, PDF and CSV task groups, times and points add up to the headline inputs. Own-wording flags kept as `own_statement_ai_exposed` / `own_statement_robotics_exposed` (these still match the "N of M O*NET tasks show AI usage" tiles). p1: exposed time = the pooled task-level score; 'High but <10% time exposed' 51 -> 0.

## 2026-10-21 - Driving tasks by work activity; robot evidence pooled by activity within SOC minor group
- `robot-links.js` `isVehicleTask`: the approved driving rule also applies to tasks O*NET links to a vehicle-driving DWA (Drive passenger vehicles / trucks or truck-mounted equipment / trucks or other vehicles to or at work sites / vehicles to transport individuals or equipment / vehicles to transport patrons) whose wording moves a vehicle or its riders (15 more tasks, e.g. school bus "Pick up and drop off students...", taxi "Pick up passengers..."). Used by task-fractions.js and refresh.js.
- `time-weighted.js`: a task's robot fraction = mean over its DWAs of the own-statement robot fractions of tasks linked to that DWA within the job's SOC minor group (same kind of workplace); driving-rule tasks keep their own rating and are not pooled. Every one of the 21,658 tasks has a DWA link, so no IWA fallback is needed.
- Effect vs d6f07d9: 304/360/352 -> 316/367/333; 84 jobs (8.3%) change level. School bus drivers 34 -> 61. Teachers 42/51/51 -> 43/51/51 (rest is task mix; docs/audit/time_weighting/similar_pairs.md). Near-identical pairs over 15 pts: 47 -> 16 (182 at cf3a6dd).

## 2026-10-21 - AI task evidence pooled by O*NET work activity (Drew: near-identical jobs must score alike)
- Root cause: every AI source rates O*NET task *statements*, and the same work is worded differently per job. Elementary teachers' main task (26% of time) "Instruct students individually and in groups, using ... lectures, discussions, and demonstrations" has 0 observed Claude use and an E0/E2 label with no "software exists" proof, so AI = 0; middle/secondary "Instruct through lectures, discussions, and demonstrations in one or more subjects" has 0.853 penetration, so AI = 1. That one wording difference was ~25 of the 34-point gap; the E2 software test also depended on which job a verified product happened to target.
- `scripts/time-weighted.js`: each task's AI fraction = mean, over its O*NET Detailed Work Activities (tasks_to_dwas.csv), of the mean own-statement AI fraction of every O*NET task linked to that DWA (all 1,016 jobs, each task once). Tasks without a DWA keep their own evidence. Robotics keeps the task's own Anthropic instance rating (instances are setting-specific and DWAs are too coarse: "drive trucks" also holds "crank trailer landing gear"); the DWA pool only fills robot fractions a task has no rating for. Breakdown tasks carry `ai_own`/`robotics_own` and `dwa_ids`; basis `dwa_pooled`, source `onet_dwa_pool`.
- Effect vs cf3a6dd (raw bands): Low/Moderate/High 328/327/361 -> 304/360/352; 123 jobs (12.1%) change level. Teachers: elementary 33 -> 42, middle 67 -> 51, secondary 64 -> 51. Near-identical pairs (885) over 15 points: 182 -> 47 (AI-driven 146 -> 9; the rest are robot-rating differences). See docs/audit/time_weighting/similar_pairs.md.

## 2026-10-21 - Agentic skills catalog matched to tasks (Drew)
- New `data/agentic_skills.json` (`scripts/agentic-skills.js`, `npm run agentic-skills`): for each job, the `agentic_capabilities.json` catalog skills (15, sourced platforms) whose phrase rule (written from the skill's own description/use cases) appears in a task with AI % automatable > 0, with the matched tasks, platforms and task time share; plus `skills_to_build` = the job's O*NET skills rated Low risk by the skill-risk model, by importance. 406 of 1,016 jobs have at least one match (after DWA pooling, d6f07d9). No score changes.

## 2026-10-21 - ONE task-level risk score, AI capability rule, driverless settings (Drew, approved)
- `scripts/time-weighted.js`: per task automatable = 1-(1-AI)(1-robot); T = sum(time x that); points split AI:robot in proportion to the two fractions. AI fraction = strongest real capability evidence (max of Eloundou label score with E1 = 1, E2 = 1 only where observed use or a verified product shows software exists, E0 = 0; Anthropic task penetration; ILO 2025 score). No evidence = no AI.
- Driving tasks (`robot-links.js` isDrivingTask/instanceDriverless, `task-fractions.js`, refresh.js): instances count where a deployed/commercial driverless system operates, any vehicle class (capability, not adoption).
- `blend.js`: one headline = benefit of the doubt on (T, O_c = 1-(1-O_ai)(1-O_rob)); `skill_risk_summary.occupation_combined` = it, `occupation_ai` + `occupation_robotics` = its AI / robot points, `ai_share`, `robotics_share`, `ai_agents` (task_time_share = sum time x AI fraction), `two_scores_time_weighted` kept for comparison. Pathways: `target_ai_agent_share`, `source_ai_agent_share`.
- Breakdown tasks: `automatable`, `points`, `points_ai`, `points_robotics`; summary `combined_time_weighted` (task-level score), `combined_ai_share`, `combined_robotics_share`.
- Effect vs c35f88a (raw bands): 383/468/165 -> 328/327/361.

## 2026-10-21 - Points = % of time x % automatable (superseded the same day by the entry above)
- `scripts/time-weighted.js` v2: each task's strength is now the fraction of the task that can be automated. AI = mean of Anthropic task penetration (continuous), ILO 2025 task score for same-statement ISCO tasks (continuous, 339 O*NET tasks) and the Eloundou label (tier-based: E1 = 0.5, E2 = 0.25 from the paper's ">= 50% time saved" definition and its half weight for E2). Verified-product targeting no longer counts as 1 in the task (it stays in the market family and the market rule). Robotics = weight_pct share of the task's Anthropic robot instances a cited robot can do in that instance's own setting (new per-task `robot_automatable_share`, `robot_physical` from `scripts/task-fractions.js` / refresh.js), never below deployed cover; 0 for non-physical tasks. Replaces tier/3.
- Breakdown tasks: `ai_automatable`, `ai_automatable_basis`, `ai_automatable_sources`, `ai_points`, `robotics_automatable`, `robotics_automatable_basis`, `robotics_automatable_source`, `robotics_points` (points add up to the job's T); summary `ai_basis_time`, `robotics_basis_time`.
- Effect vs c35f88a: Low/Moderate/High 383/468/165 -> 753/235/28; 506 level changes (505 down, 1 up). Of the 311 audit jobs, 11 are High. Truck drivers 51.6% High -> 24.0% Low (driving is 63% of time and 25% automatable in its real setting per Anthropic's instances).
- Pathways: tier-3 near-floor source cut-off = the wider of the least-exposed 5% and the original fixed 0.06 (School Bus Monitors otherwise had 2); all 1,016 jobs keep >= 3.

## 2026-10-21 - Time weighting: headline AI and robotics risk weighted by time spent on each task (Drew)
- New `scripts/time-weighted.js`: for every job, AI and robotics separately, T = sum over tasks of (task time share, normalised to 100% = the breakdown's `time_share_normalized`) x (graded task exposure 0-1). AI strength = mean of Anthropic task penetration, Eloundou task beta (E1 1, E2 0.5) and verified-product targeting (1, only with observed use); robotics strength = max of Anthropic robot tier (E0-E3 = 0, 1/3, 2/3, 1) and deployed-robot cover. Tasks with no evidence are left out and their time redistributed (never 0); no task evidence -> no T. All 1,016 jobs have T (evidence covers 100% of task time for AI and robotics).
- `scripts/blend.js`: headline = benefit-of-the-doubt weighting with weight restrictions (Cherchye et al. 2007; OECD/JRC Handbook 2008 sec. 6.3): max(0.5 T + 0.5 O, 0.9 T + 0.1 O), where O = every other measure (unchanged percentile family blend, O*NET automation and Frey-Osborne at 0.5) equipercentile-linked onto T's distribution. Task evidence always >= 50%, 90% when stronger; every other measure always >= 10%. Combined = 1-(1-AI)(1-robotics); bands unchanged.
- `derived.skill_risk_summary`: `basis: multi_source_time_weighted`, new `time_weighted` (T, coverage, weights, O) and `before_time_weighting` (the b37f3f7 multi-source score, reproduced exactly for all 1,016 jobs); `previous_method` kept. Breakdown tasks gain `ai_strength`, `robotics_strength`, `ai_weighted`, `robotics_weighted`, `strength_evidence`; summary gains `ai_time_weighted`, `robotics_time_weighted`, `combined_time_weighted`.
- Effect: Low/Moderate/High 576/355/85 -> 383/468/165; 280 jobs changed level. CROSSWALK_AUDIT issue #1: 59 of the 311 now High; the other 252 have graded time-weighted exposure below 50% (240 because most flagged time is robot tier E1 only, Anthropic's lowest tier) or sit at the line; per-job reasons in docs/audit/time_weighting/residual311.md. Jobs whose graded T >= 50% but headline below High: 8 (all within 0.02 of the line).
- Pathways: tier-3 near-floor rule made scale-free (source in the least-exposed 5% of jobs instead of <= 0.06; target at most 10 points more exposed instead of < 0.10), because time weighting lifted the floor of the distribution and 7 low-exposure jobs otherwise had < 3 pathways. Every job has >= 3; 7,981 pathways (7,397 tier 1, 439 tier 2, 145 tier 3).
- Tests: scripts/test-time-weighted.js (all jobs: shares sum to 100%, strengths in 0..1, T = sum(time x strength), headline = the weighting formula, comparison scores kept).

## 2026-10-21 - agents.targeted_by_category (re-gate on weekly verification)
- Adds `agents.targeted_by_category` ({category: [task ids]}, categories with >=1 verified platform at build time); `targeted_task_ids` stays (legacy, = union). Consumers must count a category only while a product in it is currently verified in data/agent_platforms.json, so a product failing the weekly check stops counting immediately (app bug: targeted_task_ids ignored the weekly status).
- Written by scripts/agent-mapping.js; current shards were back-filled with the identical computation (union verified equal to targeted_task_ids for all 1,016 jobs). Tests assert presence, union equality and verified categories.

## 2026-10-20 - AI-link recall audit and pinned-SHA notify
- Recall on the final holdout went from 0.407 to 0.833, with task precision 0.900 and link precision 0.852 on an untouched sample. Details are in docs/AI_LINK_AUDIT.md.
- New categories security_ops and design_creative, plus 9 platforms. Some rules were broadened and others tightened. Adds `agents.targeted_task_ids`.
- notify-app now checks that raw-by-SHA files match the local files, revalidates, then polls /api/data-version and the canary page until it sees the pushed SHA. It fails loudly otherwise.
- Tests: recall/precision floors and the new holdouts in test-ai-links.js.

## 2026-10-21 - AI product -> task links: evidence-based capability rules (false-positive audit)
- Audit (docs/AI_LINK_AUDIT.md, labelled samples in docs/audit/): precision of the links that count toward "work already targeted" was 0.57 on a stratified sample of 269 (0.56 weighted by category size). The cause was naive keyword matching (`categoryPatterns`) on the task statement plus generic O*NET DWA titles.
- New `catalog.capabilityRules`: each product category has a documented capability, plus action+object include rules, exclude rules and, where needed, a domain require rule. These are matched on the task statement only; DWA titles are no longer used. Only verified platforms are mapped. Precision on an untouched final holdout (63 links) is 0.825.
- A job's platform list now includes the best platform of each matched category before the top-12 fill, so one category no longer cuts off another's matched work.
- Effect: counted links 9,735 -> 3,805 (2,421 kept, 7,314 removed, 1,384 added) and all links 58,946 -> 18,114, with removals in 888 jobs. "Work already targeted" changed for 327 jobs (288 down, 39 up). Risk level changed for 2 jobs: Radiologists High -> Moderate (55% -> 22%) and Cashiers Moderate -> High (39% -> 51%). Whole-role exposure is unchanged for every job. `categoryPatterns` is deprecated for task links and kept for the technology bonus.
- Tests: scripts/test-ai-links.js checks precision floors on the labelled samples, known false positives and true positives, a rule for every category, that every mapped platform is verified, and that every matched task satisfies its rule.

## 2026-10-20 (fourth pass) - Robot and AI product to task links: full, in-setting coverage
- Root cause (mapping error): `exposure.robotics.cited_systems` kept only the first 10 unique system names per occupation in source-file order (task-id order), so later, high-time core tasks lost their links. For 53-3032.00 Heavy truck drivers, Aurora and Kodiak survived only on 10635 (hazmat safety, 1% of time), and the 10641 "Drive trucks" links (63% of time) were dropped. AI products had the same problem: `agents.platforms[].matched_tasks` kept only the top 3 matched tasks while the score used all of them.
- New `exposure.robotics.task_citations` (all 1,016 jobs): for each task, `covered_share` is the weight_pct share of the Anthropic robot-exposure task instances that a commercial or deployed, autonomous system can do in the setting where the work actually happens (instance tier above E0 and at least the instance setting_tier), plus those systems with their evidence URL, maturity and date. This also drops wrong links: a robot that only works in a purpose-built cell (E1) no longer counts for work done in a kitchen, a store or on a public road (E2/E3), and demo, teleoperated or unclear systems never count. Source: Anthropic robot exposure tasks file (instances, sources).
- New `agents.platforms[].matched_task_ids`: every task the product matched (the legacy `matched_tasks`, top 3 with text, is unchanged).
- Legacy shapes kept: `cited_systems` keeps the same fields and 10-item cap but is now ranked by covered task time; it is deprecated for coverage math (use `task_citations`).
- Effect: 14,683 counted robot links in task_citations; 749 jobs had robot links added or removed; 31,959 AI product task links restored in 592 jobs. Whole-role exposure (`derived.skill_risk_summary.occupation_combined`) is unchanged for every job. "Work already targeted" changed for 864 jobs (543 up, 321 down) and the market-raised risk level changed for 26 jobs; these are corrections of the mapping error. Heavy truck drivers: 1% -> 22% (High, unchanged).
- Tests: `scripts/test-robot-links.js` (in-setting coverage rules, legacy display shape, every job has task_citations on its own tasks, Aurora on the drive-trucks task).

## 2026-10-20 (third pass) - Pathway gating, pay cap 1.08, hub relief
- Job zone 5 / doctoral health targets are only reachable from job zone >= 4 sources in a related family (same major group; health or science sources for health targets). Surgeons, Prosthodontists and Optometrists are no longer hubs: they had 97 / 91 / 91 appearances and are now out of the top 10.
- pay_factor capped at 1.08 (was 1.15).
- Hub damping eased by skill-profile similarity, and O*NET related targets are exempt; the 10% per-target cap still applies. Truck Drivers -> Bus and Truck Mechanics is now #2.
- Tests: no gated move, pay_factor <= cap, Truck Drivers -> Bus and Truck Mechanics in the top 3.

## 2026-10-20 (later) - Pathways: pay factor, hub damping, interest fit, reskilling routes
- `future_proof_pathways` score adds `pay_factor` (log BLS median wage ratio, clamped 0.5-1.15; neutral + `pay_missing` when a wage is missing), `fit_factor` (O*NET RIASEC + specific interest areas; fit < 0.1 dropped) and `hub_factor` (IDF-style damping), plus a hard cap of 10% of occupations per target. Skill-profile similarity minimum raised from 0.30 to 0.35. Reasons now state pay. Top hubs before → after: Hearing Aid Specialists 220 → 57, Optometrists 185 → 91, Barbers 136 → <60 (not in top 10); the highest is now 97 (Oral and Maxillofacial Surgeons).
- `skill_gaps` in pathways use the user's own level; suppressed levels are no longer treated as 0 (fixes "Programming level 0 to 3.38"); `already_strong` added.
- `growth_basis` is always a full label; new `task_shares` (target/current AI task share and robotics exposed task share) per pathway; method text explains how combined exposure differs from the task-share cards.
- New `derived.reskilling_pathways` (needs_retraining, ≤4 new skills) for the 28 occupations with < 3 future-proof pathways, e.g. Customer Service Representatives.
- 55-0000 family title set to "Military Specific Occupations" (refresh fallback added).
- Tests: score = product of breakdown (incl. pay/fit/hub), pay factor present and pay wording follows its sign, no target for > ~10% of occupations, reskilling labelled/separate/bounded, gaps use the user's level, growth_basis labelled, every family titled; safe_overlap must have the largest spread of all score factors.

## 2026-10-20 - Per-skill AI/robotics risk and future-proof pathways (Drew's method)
- New `scripts/skill-risk.js` (also run by `refresh.js`): task-level AI risk (Anthropic task penetration + Eloundou GPT-4 task labels, with AIOE/composite fallbacks) and robotics risk (Anthropic robot tiers, cited systems per task_id, O*NET degree of automation). Tasks are linked to skills through O*NET DWAs, GWAs and the skills-to-work-activities linkage, then aggregated per skill per occupation.
- New per-occupation fields (additive): `derived.skill_risk`, `safe_skills`, `at_risk_skills`, `skill_risk_summary`, `future_proof_pathways`, `future_proof_note`, `skill_risk_method`. `derived.transitions` is unchanged.
- New dataset `data/skills/skill_risk.json` (global per-skill risk, method, parameters, coverage) + `schemas/skill_risk.schema.json`.
- New source: Eloundou et al. task-level labels (`full_labelset.tsv`).
- Coverage: 35,560 skill scores in 1,016 occupations (13,213 high / 9,223 medium / 13,124 low confidence); 852 occupations have pathways (164 have a note explaining why not).
- `npm test` now checks that every skill is scored, that safe/at-risk lists are disjoint, skills only and match their thresholds, and that every pathway has exposure ≥ 0.10 below the source, non-negative growth, safe_overlap ≥ 0.30 and a score equal to its breakdown. It also checks that safe_overlap drives the ranking (Spearman with score 0.87 vs 0.40 for exposure).
- Spot check of 11 occupations: `docs/SKILL_RISK_SPOTCHECK.md`.

## 2026-10-19 - Weekly refresh
- Bulk sources unchanged (O*NET 31.0, OEWS May 2025, BLS projections 2025-35, Eloundou, AIOE, Anthropic EI incl. robot exposure); no occupation, exposure, robotics or wage data changed.
- agent_platforms: 129 (+Cohere North); fixed URLs for 9 bot-blocked/404 entries and evidence tokens for 3 renamed products; 126 verified, 3 unreachable (Adept, ChatGPT agent, Perplexity Comet), 0 needs_review. 828 occupations' agent lists updated accordingly.
- robotics_manufacturers: 56 (+ROBROS, +Leju Robotics); Omron and Ocado URLs fixed.
- headline_stats: +7 (IFR World Robotics 2026, NBER w35859, IMF), see entry below.
- verify-platforms.js: skips writing when only check dates change, never un-deprecates an entry, and treats "One moment, please" pages as bot interstitials.

## 2026-10-18 - Skills to develop vs deepen, shared-SOC labels, BLS source check
- `derived.skills_to_develop` no longer repeats skills from the same occupation's `future_skills`/`core_skills` or skills it already rates at importance ≥ 3.5 (before: 944 of 1,016 occupations had overlaps, 3,026 duplicate items; now 0, enforced by `npm test`). Skills where current importance already meets the target and the level gap is < 0.5 are dropped.
- New `derived.skills_to_deepen`: strong existing skills that a top-5 target needs at a level ≥ 0.5 higher, with the target role(s) (968 occupations, 5,174 items). `skill_gaps[].already_strong` added.
- Skill gaps no longer treat a suppressed O*NET level (163 skill ratings) as 0 (this produced e.g. "+4.25 Programming" for Software Developers).
- `bls.oews.shared_soc` / `bls.projections.shared_soc` with a ready `label` for the 215 O*NET codes that share a BLS SOC with another code (72 SOCs).
- OEWS top-code handling (`#` → null + `top_coded`, `top_code_threshold`); validate.js now checks every stored wage against the raw OEWS May 2025 file. No `#` cells in May 2025, so no wage changed; Cardiologists $496,010 confirmed as published.
- occupation_shard schema 1.2.0 (additive).

## 2026-10-15 - Usable data for every occupation (inferred fallbacks)
- `scripts/infer.js` + `scripts/refresh.js`: the 106 occupations O*NET hasn't rated now borrow skills/abilities/knowledge (and, for 93, tasks/technology/related) from the closest rated role, with provenance in `inferred_from` (methods: same_soc_siblings 24, same_broad_soc_group_most_similar 31, same_minor_soc_group_most_similar 16, military_civilian_equivalent 19, onet_related_top_ranked 9, onet_soc_2010_crosswalk 7). Derived fields and task shares are computed for them and marked inferred.
- New source: O*NET-SOC 2010→2019 taxonomy crosswalk.
- BLS: group fallback extended to minor/major SOC groups and now marked with `inferred_from` on `bls.oews` / `bls.projections`; remaining gaps documented in `bls.unavailable`.
- future_skills `why`: recognisable tools first, friendly names ("CSS", "AWS"); `display_names` / `display_name` added.
- Schemas: occupation_shard and occupations_index 1.1.0 (additive). `npm test` now enforces per-occupation coverage and no abilities in skill fields.

## 2026-10-13 - Rebuild of the research pipeline (v2)
- Added `data/` datasets with per-record sourcing: headline_stats (27), occupations (23), emerging_skills (16), agent_platforms (81: 7 verified + 74 restored_unverified), robotics_manufacturers (8).
- Restored the agent platform list from commit d4344e7 (2026-07-08). The July 8 file failed JSON.parse; the `platforms` array was recovered and the rest was discarded.
- Legacy files kept with the same paths and shapes. Added entries: agentic_capabilities.json (+n8n, Zapier Agents, Lindy, Microsoft Agent Framework) and robotics_capabilities.json (+ABB, FANUC, Universal Robots, KUKA, Intuitive Surgical).
- Added JSON Schemas, `npm test` validation, `index.json` manifest and the merge-only updater `scripts/update.js`.
- Removed `agentic_research.js`, which overwrote data with hard-coded values, auto-bumped dates and force-pushed to main.

## 2026-10-13 - headline_stats
BLS Employment Projections 2025-35 release supersedes 2024-34 total
- headline_stats: add `bls-2535-total-growth`

## 2026-10-13 - v3: every occupation, exposure, transitions, unattended refresh
- Added `data/occupations/`: all 1,016 O*NET 31.0 occupations in 23 shards plus an index. Each record has tasks, skills (`kind: skill`), abilities (`kind: ability`, with a category), knowledge, technologies, related occupations, job zone and emerging tasks.
- Joined BLS OEWS May 2025 (wages, employment) for 995 occupations and BLS Employment Projections 2025-35 for 997.
- Added AI exposure per occupation: Eloundou et al., Felten AIOE and Anthropic observed exposure, plus a derived composite.
- Added robot exposure per occupation: Anthropic robot exposure index and O*NET Degree of Automation, plus exposed tasks and cited robot systems.
- Added `data/robotics/platforms.json`: 726 robot developers cited as task evidence, mapped to occupations.
- Added `data/signals/families.json`: per-family weekly signals.
- Added per-occupation derived outputs: transitions with skill gaps, future_skills, skills_to_develop (skills only) and future_technologies.
- agent_platforms grew to 122. 106 are verified by homepage evidence and all have an O*NET work-activity and occupation mapping. Added Dify, Make, Activepieces, Gumloop, Tines and 37 more.
- robotics_manufacturers grew to 54 makers across 11 segments.
- Added `scripts/refresh.js`, `verify-platforms.js`, `sources.js` and `catalog.js`, plus new schemas. Validation now checks occupation coverage.
- risk_scoring_overlay.json: dates and trend summary refreshed from sourced figures; LinkedIn 2026 skills added to new_emerging_skills.
- headline_stats: added the BLS 2025-35 total growth figure.

## 2026-10-13 - Agent mapping rebuild + task shares
- Rebuilt the agent→occupation mapping (`scripts/agent-mapping.js`). It now uses task-weighted keyword overlap with O*NET task statements, Detailed Work Activities and technology categories, scaled by AI exposure. Generic categories are down-weighted. There is no per-platform cap.
- Coverage: 822 of the 923 occupations that have tasks now have at least one verified platform, up from 185 of 1,016.
- Added `occupation.agents` (top 12 per occupation), `data/agents_by_occupation.json`, and `onet_mapping.occupations[]` / `occupation_count` per platform (the old `top_occupations` is removed).
- Platforms now carry a `categories[]` list (explicit overrides in `catalog.categoryOverrides`). Fixed the "hr" regex that miscategorized Anthropic.
- Added Gorgias, NiCE Cognigy, Freshdesk Freddy AI, Amazon Q Developer, JetBrains Junie and Google Jules. Fixed the OpenAI Codex and Ada URLs.
- Added `exposure.robotics.{total_tasks, rated_tasks, exposed_tasks_count, exposed_task_share, exposed_time_share, task_share_method}` and `exposure.ai.task_share`.

## 2026-10-14 - Job-distinctive future skills
- `derived.future_skills` now ranks each skill by how distinctive it is for the occupation (importance and level z-scores across all occupations) plus future signals: growing transitions, hot or in-demand technology, O*NET emerging tasks, and rising-skill matches in `data/emerging_skills.json`.
- Items gain `level`, `distinctiveness`, `future_score`, `why` and `signal_sources[]`. The existing fields are unchanged.
- New `derived.core_skills` holds the generic baseline skills (Critical Thinking, Active Listening, etc.).
- Mappings are in `scripts/catalog.js` (`skillSignals`, `skillToRising`).

## 2026-10-19 - headline_stats
Weekly research 2026-10-19: IFR World Robotics 2026 (published 2026-09-24) supersedes WR 2025 figures; new NBER and IMF research.
- headline_stats: add `ifr-wr26-installations`
- headline_stats: add `ifr-wr26-operational-stock`
- headline_stats: add `ifr-wr26-forecast-2026`
- headline_stats: add `ifr-wr26-us-installations`
- headline_stats: add `nber-w35859-ai-dissertations`
- headline_stats: add `imf-wp-2026-ai-exposed-demand`
- headline_stats: add `imf-2026-jobs-exposed`
