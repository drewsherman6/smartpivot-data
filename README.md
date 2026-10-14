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
- `bls.oews`: May 2025 employment, plus median, mean, 10th-percentile and 90th-percentile wages. Matched on the 6-digit SOC, falling back to the broad group.
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
- **future_skills**: average skill importance over the occupation itself (weight 1) plus its top 5 transitions (weighted by score). Skills only.
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
