# Changelog

Machine-readable history: `data/history/changes.jsonl`. `scripts/update.js` appends entries here automatically.

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
