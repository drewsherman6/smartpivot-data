# Aether Weekly Research Runbook

**Purpose:** Each week, refresh SmartPivot's sourced data on the workforce and AI, agents, robotics and automation.
**Output:** merge-only updates to `data/*.json` (plus careful hand edits to the legacy files), validated with `npm test` and published through a PR.
**Golden rules**
1. **No invented numbers.** Every figure must come from a page you actually opened this run. Give its URL, publication date and today's `retrieved_at`.
2. **Merge, never overwrite.** Use `scripts/update.js` with a patch file. Never regenerate whole files from hard-coded lists. To retire something, deprecate it; do not delete it.
3. **Dates move only when data changes.** The updater handles this. Do not touch `updated` or `last_checked` by hand unless you actually re-verified the item.
4. **Legacy files are frozen in shape** (field names and top-level keys). Additive entries are OK. Whole-role risk scores move at most **±6 points** per week.
5. **No force-push and no direct pushes to main.** Work on a branch and open a PR.

## 1. What to check (in priority order)
| Tier | Sources | Feeds |
|---|---|---|
| 1 | WEF Future of Jobs, McKinsey Global Institute, IFR World Robotics, Deloitte/PwC AI Jobs Barometer/BCG | headline_stats, emerging_skills |
| 2 | BLS Employment Projections + TED/MLR, O*NET, OECD Employment/Skills Outlook, ILO, IMF, World Bank | occupations, headline_stats |
| 3 | NBER, Brookings, Stanford AI Index, MIT | headline_stats (confidence follows evidence) |
| 4 | LinkedIn Economic Graph (Jobs/Skills on the Rise), Lightcast, Indeed Hiring Lab | occupations, emerging_skills |
| 5 | AI labs (Anthropic Economic Index, OpenAI, Google, Microsoft), company earnings and press releases | headline_stats, agent_platforms, robotics_manufacturers |
| 6 | Agent platforms: Salesforce Agentforce, ServiceNow, Microsoft (Copilot Studio / Agent Framework), OpenAI, Anthropic, UiPath, Automation Anywhere, n8n, Zapier, Lindy, CrewAI, LangChain, Glean, Kore.ai, Sierra, Decagon, Moveworks | agent_platforms (+ legacy agentic_capabilities.json) |
| 7 | Robot makers: ABB, FANUC, KUKA, Universal Robots, Yaskawa, Boston Dynamics, Figure, Agility, Tesla Optimus, Intuitive, Omron, Epson, Rockwell | robotics_manufacturers (+ legacy robotics_capabilities.json) |

Each week, also:
- Search for anything published in the last 7 days on "AI jobs report", "automation employment", "AI agents enterprise adoption" and "humanoid robot deployment".
- Re-verify at least 10 `restored_unverified` platforms in `data/agent_platforms.json`. Promote each one to `verified` with a source, or deprecate it.

## 2. How to record
Build a patch file per dataset:
```json
{"dataset":"headline_stats","note":"WEF/BLS refresh 2026-10-20","upsert":[{"id":"bls-2434-data-scientists","statement":"...","value":33.5,"unit":"percent","geography":"US","period":"2024-2034","source":{"name":"...","url":"https://...","publication_date":"2026-..","tier":2},"retrieved_at":"2026-10-20","confidence":"high"}],"deprecate":[]}
```
- Keep ids stable (`<source>-<topic>`). A newer edition of the same figure gets a new id. Deprecate the old id only if it has been superseded.
- confidence: `high` = you read the figure on the source page; `medium` = taken from a secondary report or a search summary; `low` = unverified.

## 3. Merge and validate
```
node scripts/update.js patch.json --dry-run   # review
node scripts/update.js patch.json             # apply; appends CHANGELOG.md + data/history/changes.jsonl; rebuilds index.json
npm test                                      # MUST pass
```
If you hand-edit a legacy file, run `node scripts/build-manifest.js` and then `npm test`.

## 4. Publish
```
git checkout -b research/YYYY-MM-DD
git add -A && git commit -m "Weekly research YYYY-MM-DD: <summary>"
git push -u origin research/YYYY-MM-DD
gh pr create --base main --title "Weekly research YYYY-MM-DD" --body "<counts added/updated/deprecated, sources>"
```
The operator reviews and merges the PR. If nothing changed, commit nothing.

## Legacy formats (frozen)
- `risk_scoring_overlay.json`: version, generated_date, trend_summary, skill_adjustments{name:{multiplier,risk_delta,reason}}, new_emerging_skills, high_risk_signals, future_career_pathways, general_guidance.
- `skills_summary.json`: metadata{version,generated,total_skills}, skills[{name, category future_proof|at_risk, risk_level, importance (null for at_risk), short_rationale, top_3_occupations}].
- `agentic_capabilities.json`: version, generated_date, platforms[{name,url,last_checked,skills,prebuilt_agents_count}], agent_skills_catalog, prebuilt_agents.
- `robotics_capabilities.json`: last_updated, platforms[{name,url,last_checked,robots,skills,current_tasks}], skills_catalog, total_robots_tracked.
Exact schemas: `schemas/`.

*Last updated: 2026-10-13*
