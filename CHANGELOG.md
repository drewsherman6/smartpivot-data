# Changelog

Machine-readable history: `data/history/changes.jsonl`. `scripts/update.js` appends entries here automatically.

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
