# Changelog

Machine-readable history: `data/history/changes.jsonl`. `scripts/update.js` appends entries here automatically.

## 2026-10-13 - Rebuild of the research pipeline (v2)
- Added `data/` datasets with per-record sourcing: headline_stats (27), occupations (23), emerging_skills (16), agent_platforms (81: 7 verified + 74 restored_unverified), robotics_manufacturers (8).
- Restored the agent platform list from commit d4344e7 (2026-07-08). The July 8 file failed JSON.parse; the `platforms` array was recovered and the rest was discarded.
- Legacy files kept with the same paths and shapes. Added entries: agentic_capabilities.json (+n8n, Zapier Agents, Lindy, Microsoft Agent Framework) and robotics_capabilities.json (+ABB, FANUC, Universal Robots, KUKA, Intuitive Surgical).
- Added JSON Schemas, `npm test` validation, `index.json` manifest and the merge-only updater `scripts/update.js`.
- Removed `agentic_research.js`, which overwrote data with hard-coded values, auto-bumped dates and force-pushed to main.
