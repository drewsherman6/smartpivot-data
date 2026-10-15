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
- `derived`: `transitions[]`, `future_skills[]`, `skills_to_develop[]` and `future_technologies[]`. See below.

### Derived fields (documented formulas; no new numbers are invented)
- **composite AI exposure**: the mean of the occupation's percentile ranks on whichever of the three AI measures exist for it (Eloundou `dv_beta`, Felten AIOE, Anthropic observed exposure). `n_measures` says how many were used.
- **transitions**: the candidates are O*NET related occupations.
  - `score = 0.35·relatedness + 0.30·growth + 0.20·exposure_reduction + 0.15·wage`
  - relatedness: Primary-Short = 1, Primary-Long = 0.7, Supplemental = 0.4
  - growth: BLS change % / 20, clamped to [-1, 1]
  - exposure_reduction: own composite minus target composite
  - wage: ln(target median wage / own median wage), clamped
  - The top 8 are kept. Each one lists `skill_gaps`: target skills with importance ≥ 3 whose level is at least 0.25 above the current occupation's level.
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
- **skills_to_develop**: skill gaps summed over the top 5 transitions, weighted by score × gap × target importance / 5. Skills only, never abilities.
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
npm test               # validation: strict JSON + schemas + coverage + sourcing; must pass before any push
node scripts/update.js patch.json   # merge curated records (headline_stats etc.)
```
Layout: `scripts/` (refresh, verify-platforms, update, validate, build-manifest, sources, catalog), `schemas/`, `data/`, `data/history/changes.jsonl`, `CHANGELOG.md`.
