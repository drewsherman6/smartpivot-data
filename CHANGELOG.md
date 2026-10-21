# Changelog

Machine-readable history: `data/history/changes.jsonl`. `scripts/update.js` appends entries here automatically.

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
