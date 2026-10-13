# smartpivot-data

Versioned research data for the **SmartPivot** website. The data covers how AI, AI agents and robotics are changing the workforce: emerging and at-risk skills, emerging and declining occupations, headline statistics, agent platforms and robot makers. The frontend reads the files straight from GitHub raw URLs.

## Frontend URLs
Base: `https://raw.githubusercontent.com/drewsherman6/smartpivot-data/main/`

Start from **`index.json`**. It lists every dataset with its path, schema, schema_version, last_updated and record_count.

| Dataset | Path | Notes |
|---|---|---|
| Manifest | `index.json` | Lists all datasets |
| Headline stats | `data/headline_stats.json` | New. Fully sourced |
| Occupations | `data/occupations.json` | New. Emerging and declining |
| Skill signals | `data/emerging_skills.json` | New |
| Agent platforms | `data/agent_platforms.json` | New. `status`: verified / restored_unverified / deprecated |
| Robot makers | `data/robotics_manufacturers.json` | New |
| Legacy | `skills_export.json`, `skills_summary.json`, `risk_scoring_overlay.json`, `agentic_capabilities.json`, `robotics_capabilities.json`, `future_proof_skills.md`, `at_risk_skills.md` | **Paths and top-level shapes are frozen** so existing frontend code keeps working |

## Record contract (data/*)
Every record has an `id` (kebab-case, stable) and the following fields:
`source: {name, url, publication_date, tier}`, `retrieved_at` (YYYY-MM-DD) and `confidence` (`high` = read on the source page, `medium` = secondary or search summary, `low` = unverified).
`tier` follows aether-research.md (1 = WEF/McKinsey..., 5 = companies and AI labs, 0 = repo history).
Rule: **no number goes in without a real source URL that was retrieved.**

## Layout
```
data/            new sourced datasets + history/changes.jsonl
schemas/         JSON Schema (draft-07) for every dataset + index
scripts/
  datasets.js        dataset registry (single source of truth)
  validate.js        npm test: strict JSON.parse + schema + duplicate ids + sourcing + manifest
  update.js          merge-not-overwrite updater (no git, no date bumps without changes)
  build-manifest.js  regenerates index.json
aether-research.md  weekly research runbook
CHANGELOG.md
```

## Commands
```
npm install
npm test                                  # must pass before every commit
node scripts/update.js patch.json --dry-run
node scripts/update.js patch.json         # merges, logs history, rebuilds index.json
```
Scripts never run git. Publishing is done by hand: branch, then commit, then PR, then merge.
