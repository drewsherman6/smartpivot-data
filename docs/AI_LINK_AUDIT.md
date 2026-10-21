# AI product -> task link audit (2026-10-21)

**Scope.** Every AI product -> O*NET task link across all 1,016 jobs (`agents.platforms[].matched_task_ids`). The links that count toward "work already targeted" on launchpad.smartpivot.xyz are verified products with high/medium relevance on tasks with Anthropic task penetration > 0.

**Rubric.** A link is correct (label 1) when the capability the product category documents (`scripts/catalog.js` `capabilityRules[cat].capability`, paraphrasing the verified products' official pages, re-checked weekly by `verify-platforms.js`) performs the action in the task statement. A link is wrong (label 0) when task and category only share a keyword, for example "client" in "Manage client portfolios" (customer service), "network" in "Configure servers" (IT service desk), or "programs" in "Teach patient education programs" (coding agents). The data agent labelled the samples. The labelled files are in `docs/audit/`.

**Old rule.** One keyword regex per category (`categoryPatterns`) was matched against the task statement plus its O*NET Detailed Work Activity titles. Generic DWA wording ("Maintain records", "Analyze data") and bare nouns caused most of the false positives.

**New rule.** `capabilityRules`: a task links only if the task statement itself matches an action + object `include` pattern and no `exclude` pattern. Some categories also have a domain `require` pattern, for example clinical context for ambient clinical documentation. DWA titles are no longer used for linkage. Only `verified` platforms are mapped, and the tests assert this. Each job's shown platform list now includes the best platform of every matched category before the top-12 fill, so one category can't crowd out another's matched work.

| Sample | n | Precision (labels) | Precision after new rule | True links kept |
|---|---|---|---|---|
| Before: old links, stratified, ≤20 per category (`ai_links_sample_before.json`) | 269 | 0.572 (0.56 weighted by category size) | 0.952 (in-sample, used for tuning) | 0.896 |
| Holdout v1: first-pass rule (`ai_links_holdout_v1.json`) | 157 | 0.771 (out-of-sample, v1) | 1.000 (tuned) | 1.000 |
| Holdout v2: second-pass rule (`ai_links_holdout_v2.json`) | 67 | 0.806 (out-of-sample, v2) | 1.000 (tuned) | 1.000 |
| **Final holdout: final rule, untouched (`ai_links_holdout_final.json`)** | 63 | **0.825 (out-of-sample)** | n/a | n/a |

The honest estimate of current precision is the final holdout: **about 82%**, up from 57%. The remaining errors are mostly generic document or report tasks matched to a specialised category, for example compliance reports linked to legal research tools.

## Recall audit (2026-10-20)

The strict rule (79bfbb0) dropped some jobs to 0%: Information Security Analysts, Desktop Publishers, Sales Engineers, and Registered Nurses (0.3%). Measured on stratified task holdouts (label 1 = a verified product documents a capability that performs the task):

| Holdout | keyword (3d314f3) | strict (79bfbb0) | this change (`agents.targeted_task_ids`) |
|---|---|---|---|
| tuning, 125 tasks (`ai_recall_holdout.json`, seed 101) | R 0.607 / P 0.552 | R 0.328 / P 0.870 | R 0.967 / P 0.937 |
| final, 89 tasks, not tuned on (`ai_recall_holdout_final.json`, seed 202) | R 0.648 / P 0.673 | R 0.407 / P 0.880 | R 0.833 / P 0.900 |

Link-level precision of the links this change adds: 0.656 (seed 303) and then 0.794 (seed 404) out of sample, both measured before rules were tightened on them. The final untouched sample (`ai_links_holdout_final2.json`, seed 505, 54 links) scores **0.852**.

Changes:
- New categories **security_ops** (Microsoft Security Copilot, CrowdStrike Charlotte AI, Google Security Operations) and **design_creative** (Figma AI, Canva AI; Canva's homepage is currently unreachable, so it is not counted).
- New platforms Responsive AI (RFP response), Microsoft Dragon Copilot (including the nurses page), and Suki.
- Rules broadened only where vendor pages document the capability: proposals/RFPs, nursing symptom/vitals/progress documentation and dictation, reports/lesson plans/materials, clerical workflow, customer information, and data synthesis. More excludes were added, e.g. securities and price quotes, public records, and genomic regulation.
- `agents.targeted_task_ids` is the uncapped union of tasks matched by any category that has a verified platform. The app uses it for "work already targeted" instead of only the top-12 high/medium platforms.

Movers in "work already targeted": Desktop Publishers 0 → 0.553, Information Security Analysts 0 → 0.463, Online Merchants 0.042 → 0.306, Network/Systems Admins 0.022 → 0.277, Sales Engineers 0 → 0.152, Registered Nurses 0.003 → 0.112. The mean across 1,016 jobs went from 0.120 to 0.141. **No risk level changed.**
