# smartpivot-data

Public, versioned data for **SmartPivot** (https://launchpad.smartpivot.xyz). It covers **every O*NET-SOC occupation (1,016)** along with:
- tasks, skills, abilities, knowledge, technologies and related occupations
- BLS wages, employment and projections
- AI exposure and robot exposure
- derived future skills, skills to develop and career transitions
- weekly signals for each occupation family
- catalogs of AI agent platforms and robotics platforms

Every figure comes from a named source with a URL and a `retrieved_at` date.

Base raw URL: `https://raw.githubusercontent.com/drewsherman6/smartpivot-data/main/`

**Frontend developers: start with [docs/FRONTEND_HANDOFF.md](docs/FRONTEND_HANDOFF.md).**

## How the frontend should consume
1. Load **`index.json`**. It lists every dataset with path, schema, schema_version, last_updated and record_count.
2. Load **`data/occupations/index.json`**. It holds all 1,016 occupations (`code`, `title`, `shard`, wage, growth, `ai_exposure_composite`, `robot_exposure_index`) and is enough for search and lists.
3. For an occupation page, fetch its shard (`data/occupations/<SOC major>.json`, e.g. `43.json` for 43-4051.00) and find the matching `code`.
4. Family pages and the weekly signal come from **`data/signals/families.json`**: one entry per SOC major group, with `changes_since_previous`.

| Path | Content |
|---|---|
| `data/occupations/index.json` | All occupations, summary fields + shard path |
| `data/occupations/{11..55}.json` | Full records, sharded by SOC major group (23 files) |
| `data/exposure/ai_exposure.json` | AI exposure per occupation (each measure kept separate + derived composite) |
| `data/exposure/robot_exposure.json` | Robot exposure per occupation |
| `data/robotics/platforms.json` | Robot developers/systems cited as task evidence → occupations |
| `data/robotics_manufacturers.json` | Major robot makers (industrial, cobot, humanoid, surgical, logistics, service, AV, ag, construction) |
| `data/agent_platforms.json` | AI agent platforms; `onet_mapping.occupations[]` = every occupation the platform maps to (uncapped) |
| `data/agents_by_occupation.json` | Reverse index: top 12 verified platforms per occupation |
| `data/signals/families.json` | Weekly per-family signals |
| `data/headline_stats.json`, `data/occupations.json`, `data/emerging_skills.json` | Curated headline research (hand-sourced) |
| Legacy (frozen shapes): `skills_export.json`, `skills_summary.json`, `risk_scoring_overlay.json`, `agentic_capabilities.json`, `robotics_capabilities.json`, `*.md` | Kept for existing UI code |

### Occupation record (shard) — key fields
- `skills[]`: `kind: "skill"`, category `essential` or `transferable`, `importance` (1–5) and `level` (0–7). Source: O*NET.
- `abilities[]`: `kind: "ability"`, with category `cognitive`, `psychomotor`, `physical` or `sensory`. **These are not skills.** Don't show Finger Dexterity or Depth Perception under "Skills to Develop".
- `knowledge[]`: `kind: "knowledge"`.
- `technology[]`: O*NET technology examples, with `hot` and `in_demand` flags.
- `tasks[]`: each task has `ai_task_penetration` (from Anthropic), and `robot_tier` (E0–E3) plus `time_share` (from Anthropic robot exposure).
- `emerging_tasks[]`, `related[]`, `job_zone`.
- `bls.oews`: May 2025 employment, plus median, mean, 10th-percentile and 90th-percentile wages. Matched on the 6-digit SOC, falling back to the broad, minor, then major group (marked `inferred_from`; see "Inferred data"). `bls.unavailable` documents any remaining gap.
- `inferred_from` (only on occupations O*NET hasn't rated): where borrowed skills/abilities/tasks came from. See "Inferred data".
- `bls.projections`: 2025–35 employment change %, annual openings and typical education.
- `exposure.ai`: `eloundou_2023` (α/β/γ, rated by both GPT-4 and humans), `felten_aioe` and `anthropic_observed_exposure`, plus `composite` (derived).
- `exposure.robotics`: `anthropic_robot_exposure_index` (0–3), `onet_degree_of_automation` (1–5), `exposed_tasks[]` and `cited_systems[]`. Each cited system has its developer, maturity and evidence URL.
- `agents`: `platforms[]` (top 12 verified: id, name, url, status, category, score, relevance, matched_tasks[]), `platform_count`, `category_scores`.
- `exposure.robotics.total_tasks`, `rated_tasks`, `exposed_tasks_count`, `exposed_task_share`, `exposed_time_share`; `exposure.ai.task_share` {total_tasks, tasks_with_data, tasks_with_ai_usage, share, mean_penetration}.
- `derived`: `transitions[]`, `future_skills[]`, `core_skills[]`, `skills_to_develop[]`, `skills_to_deepen[]` and `future_technologies[]`. See below.
- `bls.oews.shared_soc` / `bls.projections.shared_soc`: present when several O*NET codes share one BLS SOC figure (see "BLS figures").
- `bls.oews.top_coded`: present only when BLS top-coded a wage (`#` in the source); the affected fields are null.

### BLS figures
- **Exactly as published.** `bls.oews` wage fields are copied from the raw OEWS May 2025 national file. `*` (not available) becomes null. `#` (top-coded: "a wage equal to or greater than $115.00 per hour or $239,200 per year") becomes null with `top_coded: true`, `top_coded_fields[]` and `top_code_threshold` {annual, hourly, definition}; a published mean is kept. `npm test` re-reads `.cache/oews.zip` and fails if any stored wage differs from its source cell. The May 2025 file contains **no** `#` cells (BLS publishes exact values even for physicians), so no occupation is currently top-coded; the handling is there for future releases.
- **Shared SOC.** BLS publishes one figure per 6-digit SOC; when several O*NET codes map to it (215 codes in 72 SOCs, e.g. 33-3051.00 Police and Sheriff's Patrol Officers and 33-3051.04 Customs and Border Protection Officers), `bls.oews.shared_soc` and `bls.projections.shared_soc` = {soc, title, codes[], occupations[{code,title}], label, note}. `label` is ready to show, e.g. "BLS reports this together with Police and Sheriff's Patrol Officers (SOC 33-3051)". Not set on group fallbacks (`inferred_from`), which already say they are group estimates.

### Derived fields (documented formulas; no new numbers are invented)
- **composite AI exposure**: the mean of the occupation's percentile ranks on whichever of the three AI measures exist for it (Eloundou `dv_beta`, Felten AIOE, Anthropic observed exposure). `n_measures` says how many were used.
- **transitions**: the candidates are O*NET related occupations.
  - `score = 0.35·relatedness + 0.30·growth + 0.20·exposure_reduction + 0.15·wage`
  - relatedness: Primary-Short = 1, Primary-Long = 0.7, Supplemental = 0.4
  - growth: BLS change % / 20, clamped to [-1, 1]
  - exposure_reduction: own composite minus target composite
  - wage: ln(target median wage / own median wage), clamped
  - The top 8 are kept. Each one lists `skill_gaps` (top 5): target skills with importance ≥ 3 whose level is at least 0.25 above the current occupation's level. Skills the current occupation has but whose O*NET level is suppressed are skipped (gap unknown, not treated as level 0). Each gap has `already_strong: true` when the skill is in the occupation's future_skills/core_skills or has importance ≥ 3.5.
  - Together, transitions and skill gaps form the **skill → future-career graph**.
- **future_skills** (up to 8, job-distinctive; skills only):
  - `distinctiveness` = the mean of the importance z-score and the level z-score for that skill, compared against all 910 occupations that rate it.
  - `future_score` = distinctiveness plus bonuses:
    - growing transitions: up to +0.5, when the skill is more important in top-5 transition targets that are projected to grow
    - hot or in-demand technology: +0.3 (O*NET flags, matched via `catalog.skillSignals`)
    - O*NET emerging task: +0.3
    - rising-skill match in `data/emerging_skills.json`: +0.2 (via `catalog.skillToRising`)
  - Eligible skills have importance ≥ 2.75 and distinctiveness > 0. Generic baseline skills (average importance across occupations ≥ 3) are excluded unless distinctiveness is ≥ 1. If fewer than 5 skills qualify, the list is filled with the best remaining skills of importance ≥ 2.5.
  - Each item keeps `skill`, `category`, `kind`, `future_importance` and `current_importance`, and adds `level`, `distinctiveness`, `future_score`, `why` and `signal_sources[]` ({type, source, url/items/value}).
- **core_skills** (up to 6): the generic baseline skills (for example Critical Thinking, Active Listening, Speaking, Reading Comprehension), ranked by the occupation's importance. They are kept so they aren't lost; show them separately as "Core skills".
- **skills_to_develop** (up to 8): skill gaps (all qualifying gaps, not just the displayed top 5) summed over the top 5 transitions, weighted by score × gap × target importance / 5. Skills only, never abilities. **Never** includes a skill that is in the same occupation's `future_skills` or `core_skills`, or that the occupation already rates at importance ≥ 3.5. A remaining skill is also dropped when its current importance already meets every target's importance and its largest level gap is < 0.5. `npm test` enforces no overlap.
- **skills_to_deepen** (up to 8): skills the user already has strongly (`strength`: `future_skill`, `core_skill` or `high_importance`) where at least one top-5 target needs a level ≥ 0.5 higher. Each item: `skill`, `kind`, `strength`, `current_level`, `current_importance`, `weighted_gap`, `max_gap`, `targets[]` ({code, title, current_level, target_level, target_importance, gap}, only targets with gap ≥ 0.5, largest first). Strong skills with smaller gaps appear in neither list.
- **future_technologies**: hot or in-demand technologies across the occupation and its top transitions.

- **agent mapping**: for each occupation, the code matches each task (statement + O*NET Detailed Work Activity titles) against keyword patterns per platform category (`scripts/catalog.js` → `categoryPatterns`).
  - `category_score` = sum of the matched tasks' weights. A task's weight is its Anthropic `time_share` (normalized), or 1/n when that's missing. Add +0.05 if the occupation's technology categories match.
  - `platform score` = best category score × (1 for the primary category, 0.8 for others) × the generic-category weight (`genericCategories`) × (0.5 + 0.5 × AI composite).
  - A platform is listed only when the matched task weight (without the technology bonus) is ≥ 0.05.
  - `relevance` is high at ≥ 0.30, medium at ≥ 0.15, low otherwise. Only `verified` platforms are mapped. Code: `scripts/agent-mapping.js`.
- **robot task share**:
  - `exposed_task_share` = tasks rated E1–E3 ÷ tasks rated in the Anthropic robot exposure data (joined by O*NET task id).
  - `exposed_time_share` = the sum of Anthropic `time_share` over E1–E3 tasks.
- **AI task share**: `share` = tasks with Anthropic task penetration > 0 ÷ tasks matched to the Anthropic task-penetration file (exact text match).

### Skill risk and future-proof pathways (`scripts/skill-risk.js`)
Drew's method, computed for all 1,016 occupations. It runs inside `npm run refresh` and on its own with `node scripts/skill-risk.js`. The full method text and every parameter are in `data/skills/skill_risk.json` (`method`, `parameters`). Spot check: `docs/SKILL_RISK_SPOTCHECK.md`.

1. **Task risk.** AI = 0.75 x Anthropic Economic Index task penetration + 0.25 x the Eloundou et al. GPT-4 task label (beta: E1=1, E2=0.5, E0=0). Missing pieces fall back to the Eloundou occupation dv_beta, then the Felten AIOE percentile, then the AI composite. Robotics = Anthropic robot tier / 3 (E0=0 … E3=1; non-physical = 0), raised to the tier of any `cited_systems` entry for that task_id. Tasks not in the robot file use 0.5 x (O*NET degree of automation − 1) / 4. Combined = 1 − (1 − AI)(1 − robotics).
2. **Task to skill.** O*NET has no task-skill table, so each task goes through DWA, then GWA (`tasks_to_dwas`, `gwas_to_iwas_to_dwas`), then skill, using O*NET 31's official `essential_skills_to_work_activities` and `transferable_skills_to_work_activities`. relevance = share of the task's DWAs whose GWA links to the skill.
3. **Skill risk** = (time_share x relevance)-weighted mean of linked task risks within the occupation. Skills with no linked task get the occupation's task average (`basis: occupation_average`, `confidence: low`). Confidence is high when there are at least 3 linked tasks and at least 70% Anthropic coverage, and medium otherwise.
4. **Bands (fixed):** combined < 0.30 is `safe`, ≥ 0.50 is `at_risk`, and anything between is `moderate`. `derived.safe_skills` and `derived.at_risk_skills` list only skills with importance ≥ 2.5. They are disjoint and contain skills only.
5. **Pathways** (`derived.future_proof_pathways`, top 10) search every occupation. `safe_overlap` = the share of the target's required skills (importance ≥ 2.5, at least the top 6) that the user's not-at-risk skills cover. Each target skill is weighted by importance x distinctiveness. Credit is 1 for safe, 0.5 for moderate and 0 for at_risk, and drops linearly once the user's level is more than 0.5 below the target's. score = safe_overlap x (1 − target exposure) x (1 + min(growth,20)/40) x gap_factor x job_zone_factor x similarity_factor x (1.1 if O*NET related). A target is eligible only if all of these hold:
   - its exposure is ≤ source − 0.10 and ≤ 0.85 x source
   - BLS 2025-35 growth is ≥ 0 (missing growth means not eligible)
   - safe_overlap is ≥ 0.30
   - its job zone is within +2/−1 of the source
   - skill-profile similarity is ≥ 0.3
   - it isn't an ", All Other" code

   Every pathway carries a `breakdown`, the covered skills, the gaps and a plain-language `reason`. If an occupation gets no pathways, `derived.future_proof_note` says why. `derived.transitions` is unchanged.
   **Tiered fallback (at least 3 pathways for every job).** Each pathway has `tier` and `tier_label`. Tier 1 ("Strict match") is the rule set above. When a job gets fewer than 3 tier-1 pathways, the list is filled, never replaced:
   - **Tier 2 ("Relaxed thresholds"):** the same scoring and safe-skill crediting, but the exposure drop only has to be at least 0.03 and at most 95% of the source. It also needs safe_overlap ≥ 0.15 and similarity ≥ 0.20, applies no interest-fit cut, and requires a BLS median wage.
   - **Tier 3 ("Broader move, retraining likely"):** any job with strictly lower exposure, BLS growth ≥ 0 and a BLS wage, with job zone +2/−2 and gating kept. In tiers 2 and 3, a job zone 5 or doctoral health target is only allowed when the source is itself job zone 5 or doctoral health. Overlap credits every skill the user has at level (`breakdown.skill_fit`, `needs_retraining: true`).
   - **Tier 3 similarity floor:** the target's skill-profile similarity must be at least min(0.10, the source's own 90th-percentile similarity to all occupations). That means at least 10% cosine overlap of above-average skill profiles, or one of the 10% of jobs most similar to the source. The second part covers flat skill profiles such as Dancers.
   - **Very low-exposure jobs:** only for jobs at or below 6% exposure that still lack 3 pathways, a target under 10% exposure is allowed. The reason then says it is similarly low, not lower.
   - **Licensed doctors:** MD/DO, DDS/DMD, DC, OD, DPM and DVM practitioner codes (SOC 29-1011, 29-102x, 29-1041, 29-1081, 29-1131, 29-12xx with a BLS doctoral or professional degree) are only reachable from a source in the same group, in every tier and in reskilling.

   Fallback items keep hub damping but not the 10% cap. Every reason starts with "Tier 2" or "Tier 3". Before this change (8d4a5eb), 201 jobs had no future-proof pathways and 281 had fewer than 3; now all 1,016 have at least 3. The 201 empty jobs were either already at most 0.40 exposed, where the strict 10-point drop leaves almost nothing (177), or had mostly at-risk skills, so safe_overlap stayed below 0.30 (24). `npm test` enforces at least 3 pathways per job and the per-tier thresholds.
6. **Inferred occupations** compute from their borrowed tasks; `derived.skill_risk_summary.inferred_from` names the source.

### Task exposure breakdown (`scripts/task-breakdown.js`)
`data/exposure/task_breakdown/{GG}.json` lists, for every one of the 1,016 jobs, each O*NET task with:
- its time share and O*NET importance
- its group: AI-exposed (AEI penetration above 0), robotics-exposed (robot tier E1–E3), both, safe, or no data
- its evidence: AEI penetration, the Eloundou GPT-4 label and the robot tier
- its DWA, IWA and GWA links

For the work activities, skills and abilities linked to the tasks, it gives the share of each one's linked task time that falls in the AI, robotics and safe groups. Only official O*NET 31.0 linkage files are used (`tasks_to_dwas`, `gwas_to_iwas_to_dwas`, `*_skills_to_work_activities`, `abilities_to_work_activities`). Technology is listed per job, because O*NET does not link technology to tasks. The weekly refresh rebuilds these files.

### Industry staffing patterns (`scripts/industry-staffing.js`)
`data/industries/oews_staffing.json` comes from the BLS OEWS national industry-specific estimates for May 2025 (`oesm25in4.zip`, https://www.bls.gov/oes/tables.htm). It covers every NAICS sector, 3-digit and 4-digit industry (352 in all, including BLS aggregates such as 3250A1). For each one it lists the top 40 detailed occupations by `pct_of_industry` (BLS PCT_TOTAL), along with employment, the industry-specific median wage, and the mapped O*NET-SOC code. Suppressed BLS cells are null, and those occupations are skipped. The weekly refresh rebuilds it from the cached zip. The app's `/employers` page uses it to prefill typical roles.

### Inferred data (occupations O*NET hasn't rated) — `inferred_from`
106 of the 1,016 O*NET-SOC codes have no O*NET skill/ability ratings (and 93 of them no task statements either): new detailed occupations O*NET hasn't surveyed yet (e.g. 13-2051.00 Financial and Investment Analysts, 29-1212.00 Cardiologists, 29-2042.00 EMTs, 11-1031.00 Legislators), "All Other" catch-alls, and military codes (55-xxxx). So that every occupation a user can pick has usable data, `scripts/infer.js` borrows the **empty** blocks (never overwrites real O*NET data) from the best rated source, in this order:

| `method` | When | Source |
|---|---|---|
| `same_soc_siblings` | rated O*NET-SOC codes share the 6-digit SOC (e.g. 11-9199.00 ← 11-9199.01, .02 …) | ratings averaged across siblings; tasks/technology combined |
| `onet_soc_2010_crosswalk` | the O*NET-SOC 2010 predecessor was split (official 2010→2019 crosswalk; "All Other" predecessors ignored) | the rated sibling from the same predecessor (e.g. EMTs ← Paramedics) |
| `military_civilian_equivalent` | 55-xxxx only (O*NET rates no military occupation) | documented civilian equivalent (`MILITARY` map in `scripts/infer.js`) |
| `onet_related_top_ranked` | detailed occupation with an O*NET related-occupations list | highest-ranked related occupation that has ratings (e.g. Cardiologists ← General Internal Medicine Physicians) |
| `same_broad_soc_group_most_similar`, then `same_minor_soc_group_most_similar` | "All Other" codes / no related list | most similar rated detailed occupation in the same broad (then minor) SOC group: TF-IDF cosine of title + description, ties → larger OEWS employment |

Provenance:
- `occupation.inferred_from` = `{code, title, method, label, sources[{code,title}], fields[], note, predecessor?}`. `fields` lists exactly which blocks were borrowed (`skills`, `abilities`, `knowledge`, `tasks`, `technology`, `related`, `job_zone`). `label` is ready to show, e.g. "Based on closest related role: Paramedics".
- Borrowed elements keep their `kind` (`skill` / `ability` / `knowledge`), so abilities never enter `skills[]`. Borrowed tasks carry `source_code`.
- Everything computed from borrowed blocks is marked: `derived.inferred_from` (`{code,title,method,label,fields}`) and `inferred: true` on each `future_skills` / `core_skills` / `skills_to_develop` / `transitions` item; `exposure.ai.task_share.inferred_from` and `exposure.robotics.inferred_from` when tasks were borrowed; `exposure.ai.composite.inferred_from` (`n_measures: 0`) and `exposure.robotics.robot_exposure_index_inferred: true` when those values came from the source.
- `data/occupations/index.json` entries carry `inferred_from` (or `null`) and `bls_basis`.
- A transition whose target occupation is itself inferred carries `target_inferred_from` (its skill gaps use the borrowed ratings). Inferred targets never feed the "growing transitions" bonus of another occupation's future_skills.
- Inferred values are excluded from `skills` z-score statistics (future_skills distinctiveness is computed against the 910 rated occupations) and from `data/signals/families.json` aggregates.

BLS fallbacks:
- `bls.oews` / `bls.projections` use the detailed SOC; otherwise the broad (xx-xxx0), minor (xx-xx00) or major (xx-0000) group aggregate, marked `inferred_from: {code, title, method: "bls_broad_group" | "bls_minor_group" | "bls_major_group"}`. Show these as "group estimate".
- When a figure still doesn't exist, `bls.unavailable` documents why: `oews` / `projections` (military: BLS doesn't cover the armed forces) or `median_annual` (performers etc.: BLS publishes only an hourly wage; use `bls.oews.median_hourly`).

`npm test` fails if any occupation lacks non-empty `skills`, `derived.future_skills`, `exposure.ai.task_share.share`, `exposure.robotics.exposed_task_share`, a BLS median wage (or a documented reason), or projections (or a documented reason); if an ability name appears in any skill field; or if an inferred block lacks provenance.

**future_skills `why` tools:** in-demand tools are ranked by how many rated occupations list them (more recognisable first) and shown with friendly names (`scripts/infer.js` `friendlyTool`: "Cascading style sheets CSS" → "CSS", "Amazon Web Services AWS software" → "AWS", "The MathWorks MATLAB" → "MATLAB"). `signal_sources[].items` keep the raw O*NET names; `display_names` has the friendly ones. `future_technologies[]` also has `display_name`.

## Sources (see `sources` in each file for exact URL + retrieved_at)
O*NET 31.0 (Aug 2026, CC BY 4.0) · BLS OEWS May 2025 · BLS Employment Projections 2025–35 · Eloundou et al. "GPTs are GPTs" · Felten, Raj & Seamans AIOE · Anthropic Economic Index (labor-market impacts; robot exposure "What work can robots do?") · vendor homepages (agent/robot catalogs, fetched as evidence).

## Commands
```
npm install
npm run refresh        # download all bulk sources, rebuild, verify platforms, rebuild manifest (only changed files are rewritten)
npm run skill-risk     # recompute per-skill risk + future-proof pathways from the committed shards (needs .cache from a refresh)
npm test               # validation: strict JSON + schemas + coverage + sourcing; must pass before any push
node scripts/update.js patch.json   # merge curated records (headline_stats etc.)
```
Layout: `scripts/` (refresh, skill-risk, verify-platforms, update, validate, build-manifest, sources, catalog), `schemas/`, `data/`, `data/history/changes.jsonl`, `CHANGELOG.md`.

## App update after a refresh
After pushing a weekly refresh to `main`, run `npm run notify-app`. It waits until raw.githubusercontent.com serves the new data, then calls `https://launchpad.smartpivot.xyz/api/revalidate` so every results page and PDF uses it immediately (secret from `$SMARTPIVOT_REVALIDATE_SECRET` or `/workspace/.smartpivot-secrets/revalidate`). Without it, the app still updates within an hour (ISR) and a daily Vercel cron re-checks the data repo's `main` SHA. The app uses: occupation shards, `agent_platforms.json` (verification status + facts), `headline_stats.json`, `emerging_skills.json`, `signals/families.json` and `history/changes.jsonl` (the "data as of" date). Keep appending a dated line to `changes.jsonl` on every refresh. `risk_scoring_overlay.json` is not used by the app (uncited legacy multipliers).
