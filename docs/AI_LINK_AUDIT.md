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
