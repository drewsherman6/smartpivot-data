# Multi-source exposure score vs current score (all 1016 occupations)

Generated 2026-10-21 by `scripts/multisource.js` and `scripts/blend.js`. **The multi-source score is the PRIMARY score; Drew approved it on Oct 21, 2026, and it is time-weighted since the same day (see below).** In the sections after "Time weighting", "multi-source" ranks refer to the full headline. "Current" in the tables below means the previous method (the O*NET composite and the Anthropic robot index), which is kept for comparison.

## Time weighting (Drew, Oct 21, 2026)
The headline AI and robotics scores are now weighted by **how much of the job's time each task takes**.

1. **One task-level score (T)** (Drew, Oct 21, 2026): per task, % automatable by AI or robots = 1 − (1 − AI)(1 − robot); T = the sum over the job's tasks of *% of work time × that %*, split into AI and robotics points in proportion to the two fractions. Time share = Anthropic Economic Index time share where published, otherwise 1/n, normalised to 100%. AI % (capability, not speed): the strongest real evidence that AI can carry out the task: Eloundou et al. (2023) label (E1 = 100%; E2 = 100% where observed Anthropic use or a weekly-verified product shows the software exists, otherwise the label is not used; E0 = 0, mean over the GPT-4 and human raters), Anthropic task penetration, ILO 2025 task score (max of those available). Robot % = share of the task's instances (Legate-Yang & Massenkoff 2026) a cited robot can do in that instance's own setting; for driving tasks, every setting where a deployed or commercial driverless system operates, in any vehicle class (current capability, not adoption); 0 for non-physical tasks. Tasks with no evidence in either dimension are left out (never counted as 0).
2. **Every other measure is kept.** They are blended as before (percentiles, equal families, O*NET automation and Frey-Osborne at 0.5) and the blend is equipercentile-linked onto T's distribution (Kolen & Brennan, *Test Equating, Scaling, and Linking*, 2014), so both are on the same scale (O).
3. **Headline = benefit-of-the-doubt weighting with weight restrictions** (Cherchye, Moesen, Rogge & Van Puyenbroeck 2007, *Social Indicators Research* 82:111–145; OECD/JRC *Handbook on Constructing Composite Indicators* 2008, §6.3): the weight on T is chosen between 0.5 and 0.9, whichever gives the job the higher score: headline = max(0.5·T + 0.5·O, 0.9·T + 0.1·O). Task evidence always has at least half the weight and dominates (90%) when it is stronger than the other measures; every other measure always keeps at least 10%. Combined = 1 − (1 − AI)(1 − robotics); bands unchanged (Low < 0.30, High ≥ 0.50); the market rule on the site is unchanged.

| | Low | Moderate | High |
|---|---|---|---|
| Before time weighting (b37f3f7) | 576 | 355 | 85 |
| Time-weighted (primary) | 316 | 367 | 333 |

Level changed for **572** jobs: Low → Moderate 239, Moderate → High 169, Low → High 88, Moderate → Low 67, High → Moderate 9. T dominated (weight 0.9) for 483 AI and 460 robotics scores.

| Code | Title | T AI | T robotics | Before | Now | Level |
|---|---|---|---|---|---|---|
| 53-3032.00 | Heavy and Tractor-Trailer Truck Drivers | 0.082 | 0.635 | 0.347 | 0.663 | Moderate → High |
| 43-4051.00 | Customer Service Representatives | 0.785 | 0.028 | 0.487 | 0.79 | Moderate → High |
| 15-1252.00 | Software Developers | 0.793 | 0 | 0.407 | 0.782 | Moderate → High |
| 27-1013.00 | Fine Artists, Including Painters, Sculptors, and Illustrators | 0.294 | 0.03 | 0.217 | 0.368 | Low → Moderate |
| 47-2043.00 | Floor Sanders and Finishers | 0 | 0.122 | 0.235 | 0.12 | Low |
| 29-1215.00 | Family Medicine Physicians | 0.389 | 0.012 | 0.223 | 0.434 | Low → Moderate |
| 25-2021.00 | Elementary School Teachers, Except Special Education | 0.424 | 0.02 | 0.15 | 0.432 | Low → Moderate |

## Primary switch (approved by Drew, Oct 21, 2026)
The multi-source score is now the **primary** score. It drives the headline AI and robotics figures, the risk-level bands, skill risks, pathways, reskilling routes, the employer brief, the PDF and CSV, and Supabase. The previous task-only method is kept as `previous_method` in each record and is shown on /method.

**From score to risk level.** The bands are defined on a 0–1 "share of work exposed" scale: Low below 0.30, High at 0.50 and above. To keep that scale and its meaning, the multi-source AI and robotics scores are **equipercentile-linked** onto it. A job at the 80th percentile of the multi-source AI score gets the 80th-percentile value of task-based AI risk across all jobs, and the same is done for robotics. Combined risk = 1 − (1 − AI)(1 − robotics). Each skill's risk is scaled by its job's new/old ratio, so the order of skills within a job is unchanged. Pathways and reskilling were recomputed on the new combined risk. Every invariant still holds: at least 3 pathways per job, targets with lower risk, the doctor-type block, and the tiers.

| | Low | Moderate | High |
|---|---|---|---|
| Previous method | 564 | 374 | 78 |
| Multi-source (primary) | 316 | 367 | 333 |

- **Combined risk level** changed for **615** of 1016 jobs: Low → Moderate 242, Low → High 102, Moderate → High 165, Moderate → Low 94, High → Moderate 10, High → Low 2.
- **AI component band** changed for 451 jobs, and the **robotics component band** for 142.
- The site can still raise a level when products already on the market cover more of the work. That rule is unchanged.

Largest combined-risk changes:

| Code | Title | Previous | Multi-source | Level |
|---|---|---|---|---|
| 15-2051.00 | Data Scientists | 0.223 | 0.809 | Low → High |
| 13-1041.07 | Regulatory Affairs Specialists | 0.213 | 0.798 | Low → High |
| 15-1299.07 | Blockchain Engineers | 0.247 | 0.81 | Low → High |
| 13-2031.00 | Budget Analysts | 0.178 | 0.73 | Low → High |
| 19-2041.03 | Industrial Ecologists | 0.145 | 0.685 | Low → High |
| 15-1299.04 | Penetration Testers | 0.224 | 0.761 | Low → High |
| 23-2093.00 | Title Examiners, Abstractors, and Searchers | 0.174 | 0.701 | Low → High |
| 23-2099.00 | Legal Support Workers, All Other | 0.171 | 0.696 | Low → High |
| 15-1255.01 | Video Game Designers | 0.226 | 0.732 | Low → High |
| 15-2041.01 | Biostatisticians | 0.285 | 0.785 | Low → High |
| 13-2081.00 | Tax Examiners and Collectors, and Revenue Agents | 0.179 | 0.678 | Low → High |
| 15-1299.05 | Information Security Engineers | 0.191 | 0.69 | Low → High |
| 43-6012.00 | Legal Secretaries and Administrative Assistants | 0.323 | 0.821 | Moderate → High |
| 13-2041.00 | Credit Analysts | 0.32 | 0.803 | Moderate → High |
| 43-4061.00 | Eligibility Interviewers, Government Programs | 0.22 | 0.701 | Low → High |
| 19-1099.00 | Life Scientists, All Other | 0.146 | 0.624 | Low → High |
| 19-1011.00 | Animal Scientists | 0.146 | 0.621 | Low → High |
| 13-2082.00 | Tax Preparers | 0.267 | 0.741 | Low → High |
| 15-1299.02 | Geographic Information Systems Technologists and Technicians | 0.346 | 0.818 | Moderate → High |
| 55-1015.00 | Command and Control Center Officers | 0.104 | 0.571 | Low → High |



## Method
1. **Every available measure is used.** Each is converted to a mid-rank percentile across the 1016 occupations, so measures on different scales become comparable. That puts a β share, a 0–1 ILO score, an AIOE z-score, a 1–5 automation rating and a time share all on the same 0–1 scale.
2. **Measures are grouped into independent families** (below), so that one research group is not counted several times for producing several numbers. The family score is the mean of the members the job has.
3. **The blend is the mean of the families the job has.** Missing measures are removed and the rest re-weighted. They are never counted as 0, so thin coverage cannot drag a score down.
4. **Jobs O*NET does not rate directly** take job-level measures from the related role the current composite already uses (`inferred_from`). Their task-level measures use the job's own task list.
5. **Agreement** is the standard deviation of the family scores: below 0.15 "sources agree", 0.15–0.25 "partly agree", 0.25 and above "disagree". Counts: sources agree 780, sources partly agree 222, sources disagree 14, single source 0.
6. **Weighting rationale:** each independent family gets equal weight (scheme A). That follows the standard practice of averaging standardized indicators when no family is known to be more valid; see OECD/JRC, *Handbook on Constructing Composite Indicators* (2008). Schemes B and C below show how sensitive the result is to that choice.
7. **Final weights:** every family counts 1.0, except two at 0.5.
   - **O*NET Degree of Automation** (robotics) counts 0.5. Its correlation with the other robot measures is only about 0.10, because it rates how machine-paced the work is, not whether robots can do it.
   - **Frey & Osborne (2013)** counts 0.5 in both AI and robotics. Their probability of computerisation covers machine learning and mobile robotics together, so it cannot be assigned to just one. It is also a pre-LLM estimate built from nine O*NET variables. It is coded to SOC 2010 and was linked to 2018 SOC with the BLS 2010→2018 crosswalk, averaging when several 2010 codes map to one 2018 code. It covers 826 of 1016 jobs, and missing values are treated as missing. It is left out of the agreement statistic because it is a 2013 baseline. Source: https://www.oxfordmartin.ox.ac.uk/downloads/academic/The_Future_of_Employment.pdf (appendix table; ranks 1–702 extracted, see `data/sources/frey_osborne_2013.json`).

| AI family (weight) | Measures (coverage = number of occupations) |
|---|---|
| Time-weighted task exposure (% of work time x % automatable) (1) | Time-weighted AI task exposure: sum of task time share x % of the task automatable (strongest of Anthropic task penetration, ILO 2025 task score and Eloundou label, pooled over the task's O*NET Detailed Work Activities across all jobs) (1016) |
| Observed AI use (Anthropic Economic Index) (1) | Anthropic observed exposure (job) (960); Anthropic task penetration, time-weighted (tasks) (1016) |
| Rated LLM exposure (Eloundou et al. 2023) (1) | Eloundou β, GPT-4 rated (job) (989); Eloundou β, human rated (job) (989); Eloundou β from task labels, E1=1, E2=0.5 (tasks) (1016) |
| Ability-based AI exposure (Felten, Raj & Seamans AIOE) (1) | Felten AIOE (job) (860) |
| ILO 2025 GenAI task scores (ISCO-08) (1) | ILO 2025 mean task score via ISCO-08 (tasks) (987) |
| Work already targeted by verified AI products (SmartPivot weekly) (1) | Share of work time in AI-used tasks targeted by verified products (1016) |
| Frey & Osborne (2013) probability of computerisation (supporting, half weight) (0.5) | Frey-Osborne probability of computerisation (SOC 2010 via BLS 2010-2018) (826) |

| Robotics family (weight) | Measures (coverage) |
|---|---|
| Time-weighted task exposure (% of work time x % automatable) (1) | Time-weighted robot task exposure: sum of task time share x % of the task robots can do in its own setting (Anthropic robot task instances, continuous; deployed-robot cover as floor) (1016) |
| Anthropic robot exposure (1) | Anthropic robot exposure index (job) (1016); Anthropic robot tier, time-weighted (tasks) (1016) |
| O*NET Degree of Automation (work context, half weight) (0.5) | O*NET Degree of Automation 1-5 (job) (1004) |
| Work covered by commercial/deployed robots (SmartPivot weekly) (1) | Share of work time covered by commercial/deployed robots (1016) |
| Frey & Osborne (2013) probability of computerisation (supporting, half weight) (0.5) | Frey-Osborne probability of computerisation (SOC 2010 via BLS 2010-2018) (826) |

## Headline (scheme A vs current)
- **AI:** rank correlation with the current composite **0.947** (Spearman). Mean absolute rank change 7 points; 46 jobs move 20 or more points. The Low/Moderate/High tercile changes for **170** of 1016 jobs (84 up, 86 down).
- **Robotics:** rank correlation with the current Anthropic robot index **0.905**. The tercile changes for 215 jobs (107 up, 108 down). Many jobs share the robot index value 0, so tercile moves at the low end are partly tie-breaking.
- Statements per job (the work-statement layer): min 23, median 136, max 742. Coverage: onet 1016, esco 935, ilo 987, oasis 1016, nice 13.

## Sensitivity to the weighting scheme
| Scheme | AI ρ vs current | AI ρ vs scheme A | AI tercile changes vs current | Robotics ρ vs current | Robotics tercile changes |
|---|---|---|---|---|---|
| A. Other measures (all except time-weighted tasks): equal family weights; O*NET automation and Frey-Osborne at 0.5 (O in the headline) | 0.945 | 0.952 | 184 (90 up / 94 down) | 0.920 | 193 |
| B. Equal weight per measure | 0.959 | 0.974 | 161 (79 up / 82 down) | 0.927 | 182 |
| C. Final weights without the market signals | 0.958 | 0.962 | 149 (74 up / 75 down) | 0.880 | 250 |
| D. Every family at full weight | 0.940 | 0.961 | 184 (91 up / 93 down) | 0.885 | 238 |
| F. Time-weighted task family as one equal family (no dominance) | 0.954 | 0.974 | 162 (80 up / 82 down) | 0.928 | 180 |

## Calibration: how the AI measures agree with each other (Spearman on percentiles)
| Pair | n | ρ |
|---|---|---|
| frey_osborne_ai vs frey_osborne_rob | 826 | 1.00 |
| eloundou_gpt4_beta vs eloundou_task_beta | 989 | 0.95 |
| eloundou_task_beta vs twe_ai | 1016 | 0.95 |
| eloundou_human_beta vs eloundou_task_beta | 989 | 0.95 |
| eloundou_human_beta vs twe_ai | 989 | 0.93 |
| eloundou_gpt4_beta vs twe_ai | 989 | 0.91 |
| eloundou_gpt4_beta vs eloundou_human_beta | 989 | 0.90 |
| eloundou_task_beta vs felten_aioe | 860 | 0.88 |
| felten_aioe vs twe_ai | 860 | 0.88 |
| aei_task_penetration vs ai_targeted_share | 1016 | 0.86 |
| eloundou_gpt4_beta vs felten_aioe | 839 | 0.85 |
| eloundou_human_beta vs felten_aioe | 839 | 0.85 |
| ilo_task_score vs twe_ai | 987 | 0.85 |
| eloundou_task_beta vs ilo_task_score | 987 | 0.83 |
| aei_observed_exposure vs aei_task_penetration | 960 | 0.83 |
| eloundou_gpt4_beta vs ilo_task_score | 961 | 0.82 |
| eloundou_human_beta vs ilo_task_score | 961 | 0.81 |
| felten_aioe vs ilo_task_score | 834 | 0.81 |
| aei_observed_exposure vs twe_ai | 960 | 0.72 |
| aei_observed_exposure vs eloundou_task_beta | 960 | 0.71 |
| aei_task_penetration vs twe_ai | 1016 | 0.71 |
| aei_observed_exposure vs eloundou_gpt4_beta | 937 | 0.70 |
| aei_observed_exposure vs ai_targeted_share | 960 | 0.69 |
| aei_task_penetration vs eloundou_task_beta | 1016 | 0.68 |
| aei_observed_exposure vs eloundou_human_beta | 937 | 0.68 |
| aei_observed_exposure vs ilo_task_score | 932 | 0.67 |
| aei_task_penetration vs eloundou_gpt4_beta | 989 | 0.66 |
| aei_task_penetration vs felten_aioe | 860 | 0.66 |
| ai_targeted_share vs twe_ai | 1016 | 0.65 |
| aei_task_penetration vs eloundou_human_beta | 989 | 0.64 |
| aei_observed_exposure vs felten_aioe | 837 | 0.63 |
| ai_targeted_share vs eloundou_task_beta | 1016 | 0.62 |
| aei_task_penetration vs ilo_task_score | 987 | 0.62 |
| ai_targeted_share vs eloundou_gpt4_beta | 989 | 0.60 |
| ai_targeted_share vs felten_aioe | 860 | 0.60 |
| ai_targeted_share vs eloundou_human_beta | 989 | 0.58 |
| ai_targeted_share vs ilo_task_score | 987 | 0.57 |
| frey_osborne_ai vs twe_rob | 826 | 0.44 |
| frey_osborne_rob vs twe_rob | 826 | 0.44 |
| ai_targeted_share vs frey_osborne_ai | 826 | -0.14 |
| ai_targeted_share vs frey_osborne_rob | 826 | -0.14 |
| frey_osborne_ai vs ilo_task_score | 819 | -0.20 |
| frey_osborne_rob vs ilo_task_score | 819 | -0.20 |
| aei_task_penetration vs frey_osborne_ai | 826 | -0.22 |
| aei_task_penetration vs frey_osborne_rob | 826 | -0.22 |
| aei_observed_exposure vs frey_osborne_ai | 791 | -0.23 |
| aei_observed_exposure vs frey_osborne_rob | 791 | -0.23 |
| eloundou_gpt4_beta vs frey_osborne_ai | 809 | -0.29 |
| eloundou_gpt4_beta vs frey_osborne_rob | 809 | -0.29 |
| frey_osborne_ai vs twe_ai | 826 | -0.31 |
| frey_osborne_rob vs twe_ai | 826 | -0.31 |
| eloundou_task_beta vs frey_osborne_ai | 826 | -0.34 |
| eloundou_task_beta vs frey_osborne_rob | 826 | -0.34 |
| eloundou_human_beta vs frey_osborne_ai | 809 | -0.37 |
| eloundou_human_beta vs frey_osborne_rob | 809 | -0.37 |
| felten_aioe vs frey_osborne_ai | 729 | -0.40 |
| felten_aioe vs frey_osborne_rob | 729 | -0.40 |
| ai_targeted_share vs twe_rob | 1016 | -0.50 |
| aei_observed_exposure vs twe_rob | 960 | -0.52 |
| ilo_task_score vs twe_rob | 987 | -0.55 |
| aei_task_penetration vs twe_rob | 1016 | -0.56 |
| eloundou_gpt4_beta vs twe_rob | 989 | -0.64 |
| eloundou_human_beta vs twe_rob | 989 | -0.65 |
| eloundou_task_beta vs twe_rob | 1016 | -0.67 |
| twe_ai vs twe_rob | 1016 | -0.68 |
| felten_aioe vs twe_rob | 860 | -0.71 |

| Robotics pair | n | ρ |
|---|---|---|
| robot_index vs robot_task_tier | 1016 | 1.00 |
| robot_index vs robot_targeted_share | 1016 | 0.84 |
| onet_degree_of_automation vs robot_index | 1004 | 0.10 |
| onet_degree_of_automation vs robot_task_tier | 1004 | 0.10 |
| onet_degree_of_automation vs robot_targeted_share | 1004 | 0.15 |
| robot_targeted_share vs robot_task_tier | 1016 | 0.84 |

## Rechecked jobs
### 55-3015.00 Command and Control Center Specialists
Current composite rank 79, multi-source rank 86 (+8; the first version of the blend had it far lower). Job-level measures are taken from 43-5031.00, the same related role the current composite uses. Agreement: sources partly agree (SD 0.228).

| Family | Score (pct) | Measures (raw → pct) |
|---|---|---|
| Time-weighted task exposure (% of work time x % automatable) | 89 | Time-weighted AI task exposure: sum of task time share x % of the task automatable (strongest of Anthropic task penetration, ILO 2025 task score and Eloundou label, pooled over the task's O*NET Detailed Work Activities across all jobs): 0.636 → 89 |
| Observed AI use (Anthropic Economic Index) | 61 | Anthropic observed exposure (job): 0.047 → 63; Anthropic task penetration, time-weighted (tasks): 0.045 → 59 |
| Rated LLM exposure (Eloundou et al. 2023) | 94 | Eloundou β, GPT-4 rated (job): 0.656 → 94; Eloundou β, human rated (job): 0.594 → 92; Eloundou β from task labels, E1=1, E2=0.5 (tasks): 0.707 → 97 |
| Ability-based AI exposure (Felten, Raj & Seamans AIOE) | 71 | Felten AIOE (job): 0.907 → 71 |
| ILO 2025 GenAI task scores (ISCO-08) | – | ILO 2025 mean task score via ISCO-08 (tasks): n/a → – |
| Work already targeted by verified AI products (SmartPivot weekly) | 30 | Share of work time in AI-used tasks targeted by verified products: 0 → 30 |
| Frey & Osborne (2013) probability of computerisation (supporting, half weight) | – | Frey-Osborne probability of computerisation (SOC 2010 via BLS 2010-2018): n/a → – |

### 19-2099.00 Physical Scientists, All Other
Current composite rank 70, multi-source rank 73 (+3; the first version of the blend had it far lower). Agreement: sources agree (SD 0.081).

| Family | Score (pct) | Measures (raw → pct) |
|---|---|---|
| Time-weighted task exposure (% of work time x % automatable) | 75 | Time-weighted AI task exposure: sum of task time share x % of the task automatable (strongest of Anthropic task penetration, ILO 2025 task score and Eloundou label, pooled over the task's O*NET Detailed Work Activities across all jobs): 0.495 → 75 |
| Observed AI use (Anthropic Economic Index) | 60 | Anthropic observed exposure (job): 0.038 → 60; Anthropic task penetration, time-weighted (tasks): 0.046 → 59 |
| Rated LLM exposure (Eloundou et al. 2023) | 61 | Eloundou β, GPT-4 rated (job): n/a → –; Eloundou β, human rated (job): n/a → –; Eloundou β from task labels, E1=1, E2=0.5 (tasks): 0.403 → 61 |
| Ability-based AI exposure (Felten, Raj & Seamans AIOE) | 81 | Felten AIOE (job): 1.14 → 81 |
| ILO 2025 GenAI task scores (ISCO-08) | – | ILO 2025 mean task score via ISCO-08 (tasks): n/a → – |
| Work already targeted by verified AI products (SmartPivot weekly) | 70 | Share of work time in AI-used tasks targeted by verified products: 0.047 → 70 |
| Frey & Osborne (2013) probability of computerisation (supporting, half weight) | 45 | Frey-Osborne probability of computerisation (SOC 2010 via BLS 2010-2018): 0.43 → 45 |

### 19-2099.01 Remote Sensing Scientists and Technologists
Current composite rank 67, multi-source rank 73 (+6; the first version of the blend had it far lower). Agreement: sources agree (SD 0.072).

| Family | Score (pct) | Measures (raw → pct) |
|---|---|---|
| Time-weighted task exposure (% of work time x % automatable) | 75 | Time-weighted AI task exposure: sum of task time share x % of the task automatable (strongest of Anthropic task penetration, ILO 2025 task score and Eloundou label, pooled over the task's O*NET Detailed Work Activities across all jobs): 0.495 → 75 |
| Observed AI use (Anthropic Economic Index) | 60 | Anthropic observed exposure (job): 0.038 → 60; Anthropic task penetration, time-weighted (tasks): 0.046 → 59 |
| Rated LLM exposure (Eloundou et al. 2023) | 66 | Eloundou β, GPT-4 rated (job): 0.457 → 65; Eloundou β, human rated (job): 0.446 → 72; Eloundou β from task labels, E1=1, E2=0.5 (tasks): 0.403 → 61 |
| Ability-based AI exposure (Felten, Raj & Seamans AIOE) | 81 | Felten AIOE (job): 1.14 → 81 |
| ILO 2025 GenAI task scores (ISCO-08) | – | ILO 2025 mean task score via ISCO-08 (tasks): n/a → – |
| Work already targeted by verified AI products (SmartPivot weekly) | 70 | Share of work time in AI-used tasks targeted by verified products: 0.047 → 70 |
| Frey & Osborne (2013) probability of computerisation (supporting, half weight) | 45 | Frey-Osborne probability of computerisation (SOC 2010 via BLS 2010-2018): 0.43 → 45 |

## Top 15 AI increases (multi-source ranks the job as more exposed)
| Code | Title | Current | Multi-source | Δ | Families that drove it | Agreement |
|---|---|---|---|---|---|---|
| 33-9094.00 | School Bus Monitors | 12 | 54 | +42 | time weighted (60), market (30) | sources agree |
| 43-5053.00 | Postal Service Mail Sorters, Processors, and Processing Machine Operators | 13 | 50 | +38 | ilo tasks (81), frey osborne (65) | sources partly agree |
| 39-9031.00 | Exercise Trainers and Group Fitness Instructors | 1 | 38 | +37 | time weighted (43), ilo tasks (39) | sources agree |
| 25-2055.00 | Special Education Teachers, Kindergarten | 25 | 62 | +37 | observed use (77), market (70) | sources agree |
| 41-9011.00 | Demonstrators and Product Promoters | 43 | 74 | +31 | ilo tasks (82), time weighted (76) | sources agree |
| 11-3012.00 | Administrative Services Managers | 49 | 79 | +29 | time weighted (82), ilo tasks (82) | sources disagree |
| 25-2056.00 | Special Education Teachers, Elementary School | 35 | 63 | +28 | observed use (75), market (63) | sources agree |
| 39-7011.00 | Tour Guides and Escorts | 42 | 68 | +26 | frey osborne (81), time weighted (70) | sources agree |
| 53-1044.00 | First-Line Supervisors of Passenger Attendants | 32 | 57 | +25 | market (63), observed use (61) | sources agree |
| 11-9072.00 | Entertainment and Recreation Managers, Except Gambling | 42 | 67 | +25 | time weighted (71), ilo tasks (60) | sources partly agree |
| 53-1049.00 | First-Line Supervisors of Transportation Workers, All Other | 32 | 57 | +25 | market (63), observed use (61) | sources agree; inferred from 53-1044.00 |
| 43-5041.00 | Meter Readers, Utilities | 36 | 61 | +25 | ilo tasks (73), frey osborne (72) | sources partly agree |
| 41-2011.00 | Cashiers | 44 | 67 | +23 | frey osborne (94), market (81) | sources partly agree |
| 29-2011.00 | Medical and Clinical Laboratory Technologists | 38 | 61 | +23 | observed use (81), frey osborne (79) | sources agree |
| 51-2022.00 | Electrical and Electronic Equipment Assemblers | 9 | 32 | +23 | frey osborne (89), observed use (66) | sources partly agree |

## Top 15 AI decreases
| Code | Title | Current | Multi-source | Δ | Families that drove it | Agreement |
|---|---|---|---|---|---|---|
| 29-1229.02 | Hospitalists | 74 | 42 | -32 | market (30), time weighted (40) | sources agree |
| 27-2091.00 | Disc Jockeys, Except Radio | 84 | 56 | -28 | observed use (24), market (30) | sources partly agree |
| 27-2099.00 | Entertainers and Performers, Sports and Related Workers, All Other | 84 | 57 | -27 | observed use (24), market (30) | sources partly agree; inferred from 27-2091.00 |
| 27-2012.04 | Talent Directors | 75 | 51 | -24 | frey osborne (15), market (30) | sources agree |
| 19-4044.00 | Hydrologic Technicians | 78 | 55 | -23 | observed use (24), market (30) | sources partly agree |
| 29-1041.00 | Optometrists | 48 | 25 | -22 | time weighted (21), observed use (25) | sources agree |
| 17-2199.05 | Mechatronics Engineers | 73 | 51 | -22 | frey osborne (9), market (30) | sources agree |
| 29-1031.00 | Dietitians and Nutritionists | 88 | 66 | -22 | frey osborne (2), time weighted (55) | sources agree |
| 39-5091.00 | Makeup Artists, Theatrical and Performance | 39 | 18 | -21 | frey osborne (6), time weighted (20) | sources agree |
| 53-3051.00 | Bus Drivers, School | 44 | 22 | -21 | ilo tasks (22), time weighted (23) | sources agree |
| 29-2051.00 | Dietetic Technicians | 73 | 52 | -21 | frey osborne (30), market (30) | sources partly agree |
| 29-1299.02 | Orthoptists | 68 | 47 | -21 | frey osborne (14), ilo tasks (35) | sources partly agree |
| 27-2012.05 | Media Technical Directors/Managers | 66 | 45 | -21 | frey osborne (15), market (30) | sources agree |
| 11-9121.02 | Water Resource Specialists | 81 | 60 | -21 | frey osborne (13), market (30) | sources partly agree |
| 51-9162.00 | Computer Numerically Controlled Tool Programmers | 91 | 71 | -21 | ilo tasks (30), frey osborne (41) | sources partly agree |

## Top 15 robotics movers
| Code | Title | Current | Multi-source | Δ | Families that drove it | AI agreement |
|---|---|---|---|---|---|---|
| 29-1011.00 | Chiropractors | 14 | 69 | +55 | time weighted (74), frey osborne (16) | sources agree |
| 17-1022.01 | Geodetic Surveyors | 14 | 69 | +55 | onet automation (92), time weighted (73) | sources partly agree |
| 29-1041.00 | Optometrists | 14 | 64 | +50 | deployed (73), onet automation (71) | sources agree |
| 41-9012.00 | Models | 14 | 62 | +48 | frey osborne (97), time weighted (65) | sources agree |
| 49-3022.00 | Automotive Glass Installers and Repairers | 71 | 25 | -45 | onet automation (1), deployed (16) | sources agree |
| 33-9031.00 | Gambling Surveillance Officers and Gambling Investigators | 14 | 56 | +42 | frey osborne (89), onet automation (61) | sources agree |
| 47-4099.00 | Construction and Related Workers, All Other | 67 | 27 | -40 | deployed (16), time weighted (26) | sources agree |
| 47-4099.03 | Weatherization Installers and Technicians | 67 | 27 | -40 | deployed (16), time weighted (26) | sources agree |
| 43-3011.00 | Bill and Account Collectors | 14 | 53 | +39 | onet automation (93), frey osborne (89) | sources agree |
| 27-1012.00 | Craft Artists | 71 | 32 | -39 | onet automation (14), deployed (16) | sources partly agree |
| 27-1019.00 | Artists and Related Workers, All Other | 71 | 32 | -39 | onet automation (14), deployed (16) | sources agree; inferred from 27-1012.00 |
| 17-2111.02 | Fire-Prevention and Protection Engineers | 14 | 53 | +39 | time weighted (58), onet automation (31) | sources disagree |
| 47-2072.00 | Pile Driver Operators | 43 | 80 | +37 | deployed (83), time weighted (82) | sources agree |
| 39-5092.00 | Manicurists and Pedicurists | 44 | 78 | +34 | frey osborne (89), time weighted (81) | sources partly agree |
| 19-1023.00 | Zoologists and Wildlife Biologists | 35 | 68 | +34 | deployed (75), time weighted (72) | sources partly agree |

## Full AI table
| Code | Title | Current rank | Multi-source rank | Δ | Family scores (pct) | Agreement |
|---|---|---|---|---|---|---|
| 11-1011.00 | Chief Executives | 71 | 70 | -1 | time weighted 73, observed use 61, rated potential 59, ability based 90, ilo tasks 73, market 62, frey osborne 10 | sources agree |
| 11-1011.03 | Chief Sustainability Officers | 81 | 64 | -17 | time weighted 67, observed use 41, rated potential 73, ability based 90, ilo tasks 61, market 30, frey osborne 10 | sources partly agree |
| 11-1021.00 | General and Operations Managers | 70 | 69 | -1 | time weighted 67, observed use 77, rated potential 66, ability based 62, ilo tasks 73, market 85, frey osborne 31 | sources agree |
| 11-1031.00 | Legislators | 50 | 69 | +19 | time weighted 74, observed use 25, rated potential 72, ability based –, ilo tasks 59, market 30, frey osborne – | sources partly agree |
| 11-2011.00 | Advertising and Promotions Managers | 82 | 86 | +4 | time weighted 88, observed use 82, rated potential 79, ability based 87, ilo tasks 77, market 91, frey osborne 21 | sources agree |
| 11-2021.00 | Marketing Managers | 89 | 80 | -9 | time weighted 75, observed use 92, rated potential 78, ability based 88, ilo tasks 81, market 92, frey osborne 9 | sources agree |
| 11-2022.00 | Sales Managers | 69 | 68 | -2 | time weighted 62, observed use 62, rated potential 72, ability based 85, ilo tasks 81, market 72, frey osborne 8 | sources agree |
| 11-2032.00 | Public Relations Managers | 89 | 74 | -15 | time weighted 70, observed use 84, rated potential 85, ability based –, ilo tasks 77, market 85, frey osborne 10 | sources agree |
| 11-2033.00 | Fundraising Managers | 89 | 73 | -16 | time weighted 75, observed use 70, rated potential 81, ability based –, ilo tasks 81, market 66, frey osborne 10 | sources agree |
| 11-3012.00 | Administrative Services Managers | 49 | 79 | +29 | time weighted 82, observed use 25, rated potential 68, ability based –, ilo tasks 82, market 30, frey osborne 60 | sources disagree |
| 11-3013.00 | Facilities Managers | 59 | 55 | -4 | time weighted 55, observed use 52, rated potential 46, ability based –, ilo tasks 82, market 30, frey osborne 60 | sources partly agree |
| 11-3013.01 | Security Managers | 75 | 76 | +1 | time weighted 69, observed use 80, rated potential 79, ability based –, ilo tasks 82, market 79, frey osborne 60 | sources agree |
| 11-3021.00 | Computer and Information Systems Managers | 82 | 78 | -4 | time weighted 80, observed use 78, rated potential 83, ability based 78, ilo tasks 84, market 65, frey osborne 20 | sources agree |
| 11-3031.00 | Financial Managers | 92 | 81 | -11 | time weighted 78, observed use 91, rated potential 71, ability based 98, ilo tasks 72, market 87, frey osborne 25 | sources agree |
| 11-3031.01 | Treasurers and Controllers | 91 | 78 | -13 | time weighted 72, observed use 89, rated potential 70, ability based 98, ilo tasks 72, market 84, frey osborne 25 | sources agree |
| 11-3031.03 | Investment Fund Managers | 94 | 86 | -7 | time weighted 82, observed use 97, rated potential 81, ability based 98, ilo tasks 84, market 86, frey osborne 25 | sources agree |
| 11-3051.00 | Industrial Production Managers | 60 | 63 | +2 | time weighted 66, observed use 38, rated potential 63, ability based 61, ilo tasks 74, market 30, frey osborne 18 | sources partly agree |
| 11-3051.01 | Quality Control Systems Managers | 62 | 68 | +6 | time weighted 72, observed use 51, rated potential 77, ability based 61, ilo tasks 74, market 30, frey osborne 18 | sources partly agree |
| 11-3051.02 | Geothermal Production Managers | 60 | 49 | -11 | time weighted 52, observed use 38, rated potential 64, ability based 61, ilo tasks 74, market 30, frey osborne 18 | sources agree |
| 11-3051.03 | Biofuels Production Managers | 48 | 42 | -6 | time weighted 44, observed use 38, rated potential 39, ability based 61, ilo tasks 74, market 30, frey osborne 18 | sources agree |
| 11-3051.04 | Biomass Power Plant Managers | 51 | 53 | +3 | time weighted 49, observed use 57, rated potential 48, ability based 61, ilo tasks 74, market 63, frey osborne 18 | sources agree |
| 11-3051.06 | Hydroelectric Production Managers | 51 | 47 | -4 | time weighted 51, observed use 38, rated potential 50, ability based 61, ilo tasks 74, market 30, frey osborne 18 | sources agree |
| 11-3061.00 | Purchasing Managers | 93 | 79 | -14 | time weighted 75, observed use 83, rated potential 82, ability based 97, ilo tasks 82, market 78, frey osborne 18 | sources agree |
| 11-3071.00 | Transportation, Storage, and Distribution Managers | 71 | 71 | -0 | time weighted 71, observed use 77, rated potential 73, ability based 70, ilo tasks 76, market 63, frey osborne 51 | sources agree |
| 11-3071.04 | Supply Chain Managers | 72 | 61 | -11 | time weighted 61, observed use 49, rated potential 73, ability based 70, ilo tasks 76, market 30, frey osborne 51 | sources partly agree |
| 11-3111.00 | Compensation and Benefits Managers | 73 | 73 | +0 | time weighted 76, observed use 25, rated potential 74, ability based 88, ilo tasks 64, market 30, frey osborne 91 | sources partly agree |
| 11-3121.00 | Human Resources Managers | 69 | 65 | -4 | time weighted 69, observed use 25, rated potential 71, ability based 89, ilo tasks 64, market 30, frey osborne 4 | sources partly agree |
| 11-3131.00 | Training and Development Managers | 89 | 68 | -21 | time weighted 58, observed use 95, rated potential 76, ability based 86, ilo tasks 64, market 79, frey osborne 4 | sources agree |
| 11-9013.00 | Farmers, Ranchers, and Other Agricultural Managers | 45 | 40 | -6 | time weighted 44, observed use 25, rated potential 46, ability based 46, ilo tasks 33, market 30, frey osborne 23 | sources agree |
| 11-9021.00 | Construction Managers | 70 | 60 | -11 | time weighted 59, observed use 75, rated potential 61, ability based 76, ilo tasks 61, market 30, frey osborne 25 | sources partly agree |
| 11-9031.00 | Education and Childcare Administrators, Preschool and Daycare | 64 | 62 | -2 | time weighted 64, observed use 63, rated potential 68, ability based 69, ilo tasks 54, market 63, frey osborne 10 | sources agree |
| 11-9032.00 | Education Administrators, Kindergarten through Secondary | 64 | 66 | +2 | time weighted 68, observed use 60, rated potential 62, ability based 78, ilo tasks 65, market 65, frey osborne 3 | sources agree |
| 11-9033.00 | Education Administrators, Postsecondary | 78 | 71 | -7 | time weighted 72, observed use 66, rated potential 68, ability based 99, ilo tasks 65, market 69, frey osborne 6 | sources agree |
| 11-9039.00 | Education Administrators, All Other | 56 | 69 | +14 | time weighted 72, observed use 64, rated potential 66, ability based 58, ilo tasks 65, market 69, frey osborne – | sources agree |
| 11-9041.00 | Architectural and Engineering Managers | 63 | 67 | +4 | time weighted 69, observed use 57, rated potential 64, ability based 68, ilo tasks 80, market 30, frey osborne 12 | sources partly agree |
| 11-9041.01 | Biofuels/Biodiesel Technology and Product Development Managers | 59 | 48 | -11 | time weighted 49, observed use 41, rated potential 54, ability based 68, ilo tasks 80, market 30, frey osborne 12 | sources partly agree |
| 11-9051.00 | Food Service Managers | 48 | 55 | +8 | time weighted 58, observed use 43, rated potential 58, ability based 46, ilo tasks 65, market 30, frey osborne 27 | sources agree |
| 11-9071.00 | Gambling Managers | 69 | 57 | -12 | time weighted 51, observed use 43, rated potential 76, ability based 68, ilo tasks 60, market 74, frey osborne 28 | sources agree |
| 11-9072.00 | Entertainment and Recreation Managers, Except Gambling | 42 | 67 | +25 | time weighted 71, observed use 24, rated potential 59, ability based –, ilo tasks 60, market 30, frey osborne 37 | sources partly agree |
| 11-9081.00 | Lodging Managers | 65 | 64 | -0 | time weighted 62, observed use 75, rated potential 64, ability based 59, ilo tasks 72, market 75, frey osborne 2 | sources agree |
| 11-9111.00 | Medical and Health Services Managers | 70 | 66 | -4 | time weighted 66, observed use 66, rated potential 59, ability based 85, ilo tasks 64, market 69, frey osborne 5 | sources agree |
| 11-9121.00 | Natural Sciences Managers | 85 | 78 | -7 | time weighted 77, observed use 72, rated potential 86, ability based 90, ilo tasks 80, market 81, frey osborne 13 | sources agree |
| 11-9121.01 | Clinical Research Coordinators | 82 | 77 | -5 | time weighted 79, observed use 60, rated potential 76, ability based 90, ilo tasks 80, market 64, frey osborne 13 | sources agree |
| 11-9121.02 | Water Resource Specialists | 81 | 60 | -21 | time weighted 56, observed use 46, rated potential 73, ability based 90, ilo tasks 80, market 30, frey osborne 13 | sources partly agree |
| 11-9131.00 | Postmasters and Mail Superintendents | 65 | 70 | +5 | time weighted 71, observed use 46, rated potential 77, ability based 68, ilo tasks 82, market 76, frey osborne 61 | sources agree |
| 11-9141.00 | Property, Real Estate, and Community Association Managers | 76 | 71 | -5 | time weighted 68, observed use 78, rated potential 65, ability based 83, ilo tasks 64, market 72, frey osborne 67 | sources agree |
| 11-9151.00 | Social and Community Service Managers | 72 | 74 | +3 | time weighted 76, observed use 81, rated potential 62, ability based 82, ilo tasks 67, market 85, frey osborne 4 | sources agree |
| 11-9161.00 | Emergency Management Directors | 59 | 81 | +21 | time weighted 85, observed use 25, rated potential 75, ability based 77, ilo tasks 73, market 30, frey osborne 0 | sources partly agree |
| 11-9171.00 | Funeral Home Managers | 54 | 75 | +21 | time weighted 76, observed use 54, rated potential 70, ability based –, ilo tasks 82, market 69, frey osborne – | sources agree |
| 11-9179.00 | Personal Service Managers, All Other | 80 | 71 | -9 | time weighted 71, observed use 79, rated potential 63, ability based –, ilo tasks 72, market 81, frey osborne 37 | sources agree |
| 11-9179.01 | Fitness and Wellness Coordinators | 62 | 64 | +1 | time weighted 67, observed use 72, rated potential 52, ability based –, ilo tasks 60, market 30, frey osborne 37 | sources agree |
| 11-9179.02 | Spa Managers | 81 | 76 | -5 | time weighted 75, observed use 83, rated potential 71, ability based –, ilo tasks 60, market 92, frey osborne 37 | sources agree |
| 11-9199.00 | Managers, All Other | 71 | 70 | -1 | time weighted 71, observed use 67, rated potential 68, ability based 72, ilo tasks 76, market 70, frey osborne 37 | sources agree |
| 11-9199.01 | Regulatory Affairs Managers | 78 | 80 | +2 | time weighted 80, observed use 77, rated potential 86, ability based 72, ilo tasks 72, market 91, frey osborne 37 | sources agree |
| 11-9199.02 | Compliance Managers | 75 | 78 | +3 | time weighted 80, observed use 69, rated potential 82, ability based 72, ilo tasks 65, market 72, frey osborne 37 | sources agree |
| 11-9199.08 | Loss Prevention Managers | 66 | 60 | -6 | time weighted 58, observed use 64, rated potential 58, ability based 72, ilo tasks 72, market 30, frey osborne 37 | sources agree |
| 11-9199.09 | Wind Energy Operations Managers | 66 | 60 | -6 | time weighted 62, observed use 47, rated potential 59, ability based 72, ilo tasks 72, market 30, frey osborne 37 | sources agree |
| 11-9199.10 | Wind Energy Development Managers | 76 | 65 | -11 | time weighted 66, observed use 64, rated potential 81, ability based 72, ilo tasks 72, market 30, frey osborne 37 | sources partly agree |
| 11-9199.11 | Brownfield Redevelopment Specialists and Site Managers | 68 | 73 | +5 | time weighted 76, observed use 47, rated potential 71, ability based 72, ilo tasks 72, market 30, frey osborne 37 | sources partly agree |
| 13-1011.00 | Agents and Business Managers of Artists, Performers, and Athletes | 82 | 79 | -3 | time weighted 81, observed use 78, rated potential 73, ability based 79, ilo tasks 85, market 77, frey osborne 35 | sources agree |
| 13-1021.00 | Buyers and Purchasing Agents, Farm Products | 75 | 55 | -20 | time weighted 54, observed use 24, rated potential 59, ability based 66, ilo tasks 78, market 30, frey osborne 74 | sources partly agree |
| 13-1022.00 | Wholesale and Retail Buyers, Except Farm Products | 65 | 52 | -12 | time weighted 54, observed use 24, rated potential 64, ability based 68, ilo tasks 79, market 30, frey osborne 39 | sources partly agree |
| 13-1023.00 | Purchasing Agents, Except Wholesale, Retail, and Farm Products | 86 | 73 | -13 | time weighted 65, observed use 74, rated potential 64, ability based 100, ilo tasks 78, market 75, frey osborne 63 | sources agree |
| 13-1031.00 | Claims Adjusters, Examiners, and Investigators | 81 | 82 | +1 | time weighted 75, observed use 71, rated potential 80, ability based 85, ilo tasks 86, market 78, frey osborne 97 | sources agree |
| 13-1032.00 | Insurance Appraisers, Auto Damage | 62 | 70 | +8 | time weighted 73, observed use 25, rated potential 75, ability based 63, ilo tasks 86, market 30, frey osborne 97 | sources partly agree |
| 13-1041.00 | Compliance Officers | 82 | 90 | +8 | time weighted 92, observed use 87, rated potential 94, ability based 65, ilo tasks 83, market 97, frey osborne 26 | sources agree |
| 13-1041.01 | Environmental Compliance Inspectors | 67 | 71 | +4 | time weighted 74, observed use 51, rated potential 72, ability based 65, ilo tasks 76, market 30, frey osborne 26 | sources partly agree |
| 13-1041.03 | Equal Opportunity Representatives and Officers | 80 | 78 | -1 | time weighted 79, observed use 75, rated potential 87, ability based 65, ilo tasks 76, market 85, frey osborne 26 | sources agree |
| 13-1041.04 | Government Property Inspectors and Investigators | 66 | 76 | +10 | time weighted 76, observed use 77, rated potential 67, ability based 65, ilo tasks 76, market 88, frey osborne 26 | sources agree |
| 13-1041.06 | Coroners | 61 | 80 | +19 | time weighted 83, observed use 67, rated potential 62, ability based 65, ilo tasks 76, market 73, frey osborne 26 | sources agree |
| 13-1041.07 | Regulatory Affairs Specialists | 76 | 97 | +20 | time weighted 98, observed use 72, rated potential 91, ability based 65, ilo tasks 76, market 74, frey osborne 26 | sources agree |
| 13-1041.08 | Customs Brokers | 81 | 73 | -8 | time weighted 71, observed use 82, rated potential 93, ability based 65, ilo tasks 76, market 67, frey osborne 26 | sources agree |
| 13-1051.00 | Cost Estimators | 76 | 75 | -1 | time weighted 77, observed use 25, rated potential 75, ability based 94, ilo tasks 85, market 30, frey osborne 50 | sources disagree |
| 13-1071.00 | Human Resources Specialists | 97 | 93 | -4 | time weighted 88, observed use 95, rated potential 91, ability based 93, ilo tasks 86, market 97, frey osborne – | sources agree |
| 13-1074.00 | Farm Labor Contractors | 29 | 43 | +14 | time weighted 47, observed use 25, rated potential 17, ability based 37, ilo tasks 77, market 30, frey osborne 94 | sources partly agree |
| 13-1075.00 | Labor Relations Specialists | 78 | 64 | -14 | time weighted 63, observed use 25, rated potential 76, ability based 91, ilo tasks 86, market 30, frey osborne – | sources disagree |
| 13-1081.00 | Logisticians | 85 | 66 | -18 | time weighted 65, observed use 74, rated potential 73, ability based 87, ilo tasks 87, market 30, frey osborne 7 | sources partly agree |
| 13-1081.01 | Logistics Engineers | 85 | 82 | -3 | time weighted 79, observed use 83, rated potential 88, ability based 87, ilo tasks 87, market 87, frey osborne 7 | sources agree |
| 13-1081.02 | Logistics Analysts | 88 | 81 | -6 | time weighted 79, observed use 77, rated potential 91, ability based 87, ilo tasks 87, market 81, frey osborne 7 | sources agree |
| 13-1082.00 | Project Management Specialists | 88 | 75 | -13 | time weighted 77, observed use 74, rated potential 75, ability based –, ilo tasks 81, market 30, frey osborne 35 | sources partly agree |
| 13-1111.00 | Management Analysts | 83 | 79 | -4 | time weighted 80, observed use 89, rated potential 67, ability based 98, ilo tasks 87, market 30, frey osborne 30 | sources partly agree |
| 13-1121.00 | Meeting, Convention, and Event Planners | 67 | 63 | -3 | time weighted 64, observed use 75, rated potential 66, ability based 58, ilo tasks 88, market 30, frey osborne 20 | sources partly agree |
| 13-1131.00 | Fundraisers | 77 | 83 | +6 | time weighted 86, observed use 63, rated potential 78, ability based 84, ilo tasks 83, market 63, frey osborne – | sources agree |
| 13-1141.00 | Compensation, Benefits, and Job Analysis Specialists | 81 | 71 | -10 | time weighted 64, observed use 66, rated potential 71, ability based 98, ilo tasks 86, market 68, frey osborne 46 | sources agree |
| 13-1151.00 | Training and Development Specialists | 89 | 82 | -6 | time weighted 84, observed use 89, rated potential 90, ability based 83, ilo tasks 84, market 30, frey osborne 9 | sources partly agree |
| 13-1161.00 | Market Research Analysts and Marketing Specialists | 95 | 96 | +0 | time weighted 94, observed use 100, rated potential 84, ability based 97, ilo tasks 94, market 100, frey osborne 52 | sources agree |
| 13-1161.01 | Search Marketing Strategists | 97 | 96 | -2 | time weighted 96, observed use 99, rated potential 83, ability based 97, ilo tasks 94, market 96, frey osborne 52 | sources agree |
| 13-1199.00 | Business Operations Specialists, All Other | 82 | 80 | -2 | time weighted 79, observed use 79, rated potential 84, ability based 78, ilo tasks 83, market 80, frey osborne 34 | sources agree |
| 13-1199.04 | Business Continuity Planners | 85 | 76 | -9 | time weighted 72, observed use 75, rated potential 83, ability based 78, ilo tasks 83, market 77, frey osborne 34 | sources agree |
| 13-1199.05 | Sustainability Specialists | 86 | 81 | -5 | time weighted 83, observed use 69, rated potential 93, ability based 78, ilo tasks 83, market 67, frey osborne 34 | sources agree |
| 13-1199.06 | Online Merchants | 87 | 87 | -0 | time weighted 87, observed use 86, rated potential 87, ability based 78, ilo tasks 83, market 94, frey osborne 34 | sources agree |
| 13-1199.07 | Security Management Specialists | 82 | 77 | -5 | time weighted 75, observed use 82, rated potential 74, ability based 78, ilo tasks 83, market 75, frey osborne 34 | sources agree |
| 13-2011.00 | Accountants and Auditors | 97 | 92 | -4 | time weighted 87, observed use 90, rated potential 83, ability based 99, ilo tasks 91, market 95, frey osborne 87 | sources agree |
| 13-2022.00 | Appraisers of Personal and Business Property | 91 | 83 | -8 | time weighted 87, observed use 24, rated potential 88, ability based –, ilo tasks 86, market 30, frey osborne 79 | sources disagree |
| 13-2023.00 | Appraisers and Assessors of Real Estate | 72 | 86 | +14 | time weighted 80, observed use 86, rated potential 74, ability based –, ilo tasks 86, market 94, frey osborne 79 | sources agree |
| 13-2031.00 | Budget Analysts | 86 | 93 | +7 | time weighted 94, observed use 67, rated potential 87, ability based 100, ilo tasks 91, market 80, frey osborne 87 | sources agree |
| 13-2041.00 | Credit Analysts | 90 | 97 | +7 | time weighted 96, observed use 83, rated potential 87, ability based 92, ilo tasks 99, market 93, frey osborne 97 | sources agree |
| 13-2051.00 | Financial and Investment Analysts | 89 | 89 | -1 | time weighted 83, observed use 99, rated potential 74, ability based 95, ilo tasks 98, market 99, frey osborne 34 | sources agree |
| 13-2052.00 | Personal Financial Advisors | 92 | 91 | -2 | time weighted 88, observed use 93, rated potential 87, ability based 96, ilo tasks 97, market 89, frey osborne 50 | sources agree |
| 13-2053.00 | Insurance Underwriters | 85 | 80 | -5 | time weighted 80, observed use 64, rated potential 86, ability based 89, ilo tasks 92, market 30, frey osborne 99 | sources partly agree |
| 13-2054.00 | Financial Risk Specialists | 89 | 89 | +1 | time weighted 89, observed use 87, rated potential 86, ability based –, ilo tasks 99, market 95, frey osborne 38 | sources agree |
| 13-2061.00 | Financial Examiners | 83 | 85 | +2 | time weighted 87, observed use 60, rated potential 83, ability based 100, ilo tasks 99, market 71, frey osborne 32 | sources agree |
| 13-2071.00 | Credit Counselors | 95 | 90 | -5 | time weighted 91, observed use 85, rated potential 94, ability based 95, ilo tasks 98, market 77, frey osborne 21 | sources agree |
| 13-2072.00 | Loan Officers | 93 | 92 | -0 | time weighted 88, observed use 81, rated potential 91, ability based 95, ilo tasks 98, market 85, frey osborne 97 | sources agree |
| 13-2081.00 | Tax Examiners and Collectors, and Revenue Agents | 84 | 90 | +6 | time weighted 91, observed use 56, rated potential 92, ability based 94, ilo tasks 90, market 71, frey osborne 84 | sources agree |
| 13-2082.00 | Tax Preparers | 88 | 93 | +5 | time weighted 94, observed use 77, rated potential 92, ability based 87, ilo tasks 91, market 76, frey osborne 99 | sources agree |
| 13-2099.00 | Financial Specialists, All Other | 93 | 90 | -3 | time weighted 90, observed use 86, rated potential 95, ability based 93, ilo tasks 85, market 90, frey osborne 40 | sources agree |
| 13-2099.01 | Financial Quantitative Analysts | 96 | 96 | +1 | time weighted 97, observed use 91, rated potential 96, ability based 93, ilo tasks 85, market 95, frey osborne 40 | sources agree |
| 13-2099.04 | Fraud Examiners, Investigators and Analysts | 85 | 81 | -4 | time weighted 77, observed use 79, rated potential 81, ability based 93, ilo tasks 85, market 79, frey osborne 40 | sources agree |
| 15-1211.00 | Computer Systems Analysts | 97 | 93 | -4 | time weighted 95, observed use 91, rated potential 88, ability based –, ilo tasks 90, market 81, frey osborne 4 | sources agree |
| 15-1211.01 | Health Informatics Specialists | 83 | 92 | +9 | time weighted 94, observed use 84, rated potential 85, ability based –, ilo tasks 89, market 75, frey osborne 4 | sources agree |
| 15-1212.00 | Information Security Analysts | 99 | 99 | +0 | time weighted 99, observed use 98, rated potential 90, ability based –, ilo tasks 89, market 98, frey osborne – | sources agree |
| 15-1221.00 | Computer and Information Research Scientists | 97 | 91 | -6 | time weighted 92, observed use 93, rated potential 88, ability based –, ilo tasks 89, market 30, frey osborne 10 | sources partly agree |
| 15-1231.00 | Computer Network Support Specialists | 94 | 97 | +2 | time weighted 97, observed use 89, rated potential 88, ability based –, ilo tasks 83, market 96, frey osborne – | sources agree |
| 15-1232.00 | Computer User Support Specialists | 98 | 98 | +0 | time weighted 96, observed use 98, rated potential 94, ability based –, ilo tasks 87, market 98, frey osborne – | sources agree |
| 15-1241.00 | Computer Network Architects | 92 | 94 | +2 | time weighted 95, observed use 83, rated potential 91, ability based –, ilo tasks 92, market 80, frey osborne – | sources agree |
| 15-1241.01 | Telecommunications Engineering Specialists | 91 | 91 | +0 | time weighted 92, observed use 82, rated potential 87, ability based –, ilo tasks 92, market 83, frey osborne – | sources agree |
| 15-1242.00 | Database Administrators | 99 | 99 | +1 | time weighted 100, observed use 95, rated potential 97, ability based –, ilo tasks 96, market 90, frey osborne 18 | sources agree |
| 15-1243.00 | Database Architects | 100 | 98 | -1 | time weighted 98, observed use 99, rated potential 96, ability based –, ilo tasks 96, market 96, frey osborne 18 | sources agree |
| 15-1243.01 | Data Warehousing Specialists | 100 | 100 | +0 | time weighted 100, observed use 99, rated potential 99, ability based –, ilo tasks 96, market 97, frey osborne 18 | sources agree |
| 15-1244.00 | Network and Computer Systems Administrators | 98 | 95 | -3 | time weighted 96, observed use 91, rated potential 91, ability based –, ilo tasks 96, market 94, frey osborne 18 | sources agree |
| 15-1251.00 | Computer Programmers | 100 | 100 | -0 | time weighted 100, observed use 100, rated potential 99, ability based –, ilo tasks 97, market 100, frey osborne 46 | sources agree |
| 15-1252.00 | Software Developers | 98 | 96 | -2 | time weighted 97, observed use 90, rated potential 89, ability based –, ilo tasks 92, market 93, frey osborne 27 | sources agree |
| 15-1253.00 | Software Quality Assurance Analysts and Testers | 100 | 98 | -1 | time weighted 99, observed use 96, rated potential 97, ability based –, ilo tasks 93, market 75, frey osborne 27 | sources agree |
| 15-1254.00 | Web Developers | 100 | 100 | +0 | time weighted 100, observed use 99, rated potential 98, ability based –, ilo tasks 95, market 98, frey osborne – | sources agree |
| 15-1255.00 | Web and Digital Interface Designers | 97 | 98 | +1 | time weighted 96, observed use 89, rated potential 97, ability based –, ilo tasks 98, market 93, frey osborne – | sources agree |
| 15-1255.01 | Video Game Designers | 95 | 93 | -2 | time weighted 95, observed use 77, rated potential 92, ability based –, ilo tasks 93, market 30, frey osborne – | sources partly agree |
| 15-1299.00 | Computer Occupations, All Other | 96 | 94 | -2 | time weighted 95, observed use 86, rated potential 95, ability based –, ilo tasks 89, market 77, frey osborne 64 | sources agree |
| 15-1299.01 | Web Administrators | 98 | 99 | +0 | time weighted 99, observed use 90, rated potential 98, ability based –, ilo tasks 89, market 78, frey osborne 64 | sources agree |
| 15-1299.02 | Geographic Information Systems Technologists and Technicians | 94 | 98 | +3 | time weighted 98, observed use 88, rated potential 91, ability based –, ilo tasks 89, market 95, frey osborne 64 | sources agree |
| 15-1299.03 | Document Management Specialists | 95 | 98 | +3 | time weighted 98, observed use 92, rated potential 94, ability based –, ilo tasks 89, market 84, frey osborne 64 | sources agree |
| 15-1299.04 | Penetration Testers | 98 | 95 | -3 | time weighted 97, observed use 58, rated potential 95, ability based –, ilo tasks 89, market 30, frey osborne 64 | sources disagree |
| 15-1299.05 | Information Security Engineers | 97 | 91 | -6 | time weighted 92, observed use 73, rated potential 94, ability based –, ilo tasks 89, market 66, frey osborne 64 | sources agree |
| 15-1299.06 | Digital Forensics Analysts | 97 | 87 | -10 | time weighted 89, observed use 58, rated potential 95, ability based –, ilo tasks 89, market 30, frey osborne 64 | sources partly agree |
| 15-1299.07 | Blockchain Engineers | 99 | 97 | -1 | time weighted 99, observed use 58, rated potential 94, ability based –, ilo tasks 89, market 30, frey osborne 64 | sources disagree |
| 15-1299.08 | Computer Systems Engineers/Architects | 98 | 93 | -4 | time weighted 94, observed use 91, rated potential 93, ability based –, ilo tasks 89, market 87, frey osborne 64 | sources agree |
| 15-1299.09 | Information Technology Project Managers | 93 | 84 | -9 | time weighted 81, observed use 90, rated potential 79, ability based –, ilo tasks 89, market 74, frey osborne 64 | sources agree |
| 15-2011.00 | Actuaries | 84 | 80 | -4 | time weighted 82, observed use 65, rated potential 84, ability based 100, ilo tasks 95, market 30, frey osborne 33 | sources partly agree |
| 15-2021.00 | Mathematicians | 99 | 98 | -1 | time weighted 98, observed use 93, rated potential 99, ability based 99, ilo tasks 95, market 89, frey osborne 23 | sources agree |
| 15-2031.00 | Operations Research Analysts | 98 | 99 | +1 | time weighted 99, observed use 93, rated potential 93, ability based 96, ilo tasks 95, market 76, frey osborne 20 | sources agree |
| 15-2041.00 | Statisticians | 96 | 98 | +2 | time weighted 98, observed use 86, rated potential 97, ability based 95, ilo tasks 95, market 94, frey osborne 34 | sources agree |
| 15-2041.01 | Biostatisticians | 95 | 96 | +1 | time weighted 97, observed use 80, rated potential 97, ability based 95, ilo tasks 95, market 87, frey osborne 34 | sources agree |
| 15-2051.00 | Data Scientists | 99 | 97 | -2 | time weighted 97, observed use 80, rated potential 94, ability based –, ilo tasks 96, market 75, frey osborne – | sources agree |
| 15-2051.01 | Business Intelligence Analysts | 99 | 99 | +1 | time weighted 99, observed use 99, rated potential 94, ability based –, ilo tasks 96, market 100, frey osborne – | sources agree |
| 15-2051.02 | Clinical Data Managers | 98 | 97 | -1 | time weighted 96, observed use 91, rated potential 92, ability based –, ilo tasks 96, market 92, frey osborne – | sources agree |
| 15-2099.00 | Mathematical Science Occupations, All Other | 99 | 100 | +0 | time weighted 99, observed use 96, rated potential 98, ability based –, ilo tasks 96, market 96, frey osborne 99 | sources agree |
| 15-2099.01 | Bioinformatics Technicians | 99 | 99 | +0 | time weighted 99, observed use 96, rated potential 97, ability based –, ilo tasks 96, market 96, frey osborne 99 | sources agree |
| 17-1011.00 | Architects, Except Landscape and Naval | 74 | 67 | -6 | time weighted 66, observed use 69, rated potential 69, ability based 78, ilo tasks 71, market 66, frey osborne 13 | sources agree |
| 17-1012.00 | Landscape Architects | 60 | 61 | +1 | time weighted 65, observed use 25, rated potential 58, ability based 77, ilo tasks 71, market 30, frey osborne 22 | sources partly agree |
| 17-1021.00 | Cartographers and Photogrammetrists | 74 | 72 | -2 | time weighted 65, observed use 72, rated potential 75, ability based 68, ilo tasks 84, market 79, frey osborne 76 | sources agree |
| 17-1022.00 | Surveyors | 57 | 56 | -1 | time weighted 56, observed use 37, rated potential 70, ability based 53, ilo tasks 84, market 30, frey osborne 42 | sources partly agree |
| 17-1022.01 | Geodetic Surveyors | 61 | 64 | +3 | time weighted 68, observed use 37, rated potential 72, ability based 53, ilo tasks 84, market 30, frey osborne 42 | sources partly agree |
| 17-2011.00 | Aerospace Engineers | 87 | 72 | -14 | time weighted 70, observed use 71, rated potential 85, ability based 91, ilo tasks 60, market 81, frey osborne 12 | sources agree |
| 17-2021.00 | Agricultural Engineers | 59 | 54 | -5 | time weighted 56, observed use 25, rated potential 58, ability based 72, ilo tasks 60, market 30, frey osborne 47 | sources partly agree |
| 17-2031.00 | Bioengineers and Biomedical Engineers | 84 | 75 | -9 | time weighted 74, observed use 77, rated potential 89, ability based 73, ilo tasks 56, market 88, frey osborne 20 | sources agree |
| 17-2041.00 | Chemical Engineers | 68 | 63 | -5 | time weighted 66, observed use 25, rated potential 61, ability based 91, ilo tasks 63, market 30, frey osborne 12 | sources partly agree |
| 17-2051.00 | Civil Engineers | 65 | 55 | -10 | time weighted 57, observed use 37, rated potential 62, ability based 86, ilo tasks 55, market 30, frey osborne 13 | sources partly agree |
| 17-2051.01 | Transportation Engineers | 72 | 58 | -14 | time weighted 57, observed use 50, rated potential 77, ability based 86, ilo tasks 55, market 30, frey osborne 13 | sources partly agree |
| 17-2051.02 | Water/Wastewater Engineers | 72 | 52 | -20 | time weighted 51, observed use 37, rated potential 78, ability based 86, ilo tasks 55, market 30, frey osborne 13 | sources partly agree |
| 17-2061.00 | Computer Hardware Engineers | 88 | 69 | -19 | time weighted 58, observed use 77, rated potential 75, ability based 81, ilo tasks 82, market 79, frey osborne 34 | sources agree |
| 17-2071.00 | Electrical Engineers | 80 | 60 | -19 | time weighted 58, observed use 66, rated potential 73, ability based 80, ilo tasks 59, market 30, frey osborne 29 | sources partly agree |
| 17-2072.00 | Electronics Engineers, Except Computer | 77 | 77 | -1 | time weighted 74, observed use 81, rated potential 85, ability based 64, ilo tasks 82, market 88, frey osborne 16 | sources agree |
| 17-2072.01 | Radio Frequency Identification Device Specialists | 80 | 70 | -10 | time weighted 73, observed use 50, rated potential 80, ability based 64, ilo tasks 86, market 30, frey osborne 16 | sources partly agree |
| 17-2081.00 | Environmental Engineers | 82 | 64 | -18 | time weighted 64, observed use 57, rated potential 81, ability based 92, ilo tasks 74, market 30, frey osborne 13 | sources partly agree |
| 17-2111.00 | Health and Safety Engineers, Except Mining Safety Engineers and Inspectors | 62 | 70 | +8 | time weighted 74, observed use 25, rated potential 75, ability based 74, ilo tasks 56, market 30, frey osborne 17 | sources partly agree |
| 17-2111.02 | Fire-Prevention and Protection Engineers | 69 | 79 | +10 | time weighted 83, observed use 25, rated potential 91, ability based 74, ilo tasks 56, market 30, frey osborne 17 | sources disagree |
| 17-2112.00 | Industrial Engineers | 74 | 78 | +3 | time weighted 81, observed use 42, rated potential 85, ability based 81, ilo tasks 66, market 30, frey osborne 17 | sources partly agree |
| 17-2112.01 | Human Factors Engineers and Ergonomists | 72 | 76 | +4 | time weighted 78, observed use 57, rated potential 82, ability based 81, ilo tasks 66, market 30, frey osborne 17 | sources partly agree |
| 17-2112.02 | Validation Engineers | 81 | 79 | -2 | time weighted 81, observed use 56, rated potential 88, ability based 81, ilo tasks 66, market 63, frey osborne 17 | sources agree |
| 17-2112.03 | Manufacturing Engineers | 68 | 64 | -4 | time weighted 66, observed use 60, rated potential 73, ability based 81, ilo tasks 66, market 30, frey osborne 17 | sources partly agree |
| 17-2121.00 | Marine Engineers and Naval Architects | 57 | 69 | +12 | time weighted 72, observed use 62, rated potential 65, ability based 62, ilo tasks 60, market 63, frey osborne 6 | sources agree |
| 17-2131.00 | Materials Engineers | 65 | 50 | -15 | time weighted 53, observed use 25, rated potential 63, ability based 77, ilo tasks 54, market 30, frey osborne 14 | sources partly agree |
| 17-2141.00 | Mechanical Engineers | 68 | 53 | -15 | time weighted 51, observed use 73, rated potential 62, ability based 74, ilo tasks 60, market 30, frey osborne 7 | sources agree |
| 17-2141.01 | Fuel Cell Engineers | 71 | 63 | -8 | time weighted 65, observed use 48, rated potential 75, ability based 74, ilo tasks 60, market 30, frey osborne 7 | sources partly agree |
| 17-2141.02 | Automotive Engineers | 83 | 74 | -9 | time weighted 73, observed use 73, rated potential 93, ability based 74, ilo tasks 60, market 80, frey osborne 7 | sources agree |
| 17-2151.00 | Mining and Geological Engineers, Including Mining Safety Engineers | 71 | 70 | -1 | time weighted 73, observed use 25, rated potential 77, ability based 92, ilo tasks 54, market 30, frey osborne 31 | sources partly agree |
| 17-2161.00 | Nuclear Engineers | 77 | 65 | -12 | time weighted 68, observed use 25, rated potential 82, ability based 88, ilo tasks 56, market 30, frey osborne 25 | sources partly agree |
| 17-2171.00 | Petroleum Engineers | 73 | 62 | -10 | time weighted 58, observed use 41, rated potential 77, ability based 85, ilo tasks 54, market 73, frey osborne 31 | sources agree |
| 17-2199.00 | Engineers, All Other | 67 | 66 | -2 | time weighted 67, observed use 68, rated potential 70, ability based 67, ilo tasks 56, market 73, frey osborne 9 | sources agree |
| 17-2199.03 | Energy Engineers, Except Wind and Solar | 75 | 62 | -13 | time weighted 58, observed use 65, rated potential 82, ability based 67, ilo tasks 56, market 71, frey osborne 9 | sources agree |
| 17-2199.05 | Mechatronics Engineers | 73 | 51 | -22 | time weighted 54, observed use 47, rated potential 64, ability based 67, ilo tasks 56, market 30, frey osborne 9 | sources agree |
| 17-2199.06 | Microsystems Engineers | 71 | 66 | -5 | time weighted 65, observed use 68, rated potential 78, ability based 67, ilo tasks 56, market 74, frey osborne 9 | sources agree |
| 17-2199.07 | Photonics Engineers | 67 | 58 | -9 | time weighted 54, observed use 70, rated potential 57, ability based 67, ilo tasks 56, market 66, frey osborne 9 | sources agree |
| 17-2199.08 | Robotics Engineers | 77 | 72 | -6 | time weighted 72, observed use 76, rated potential 82, ability based 67, ilo tasks 56, market 86, frey osborne 9 | sources agree |
| 17-2199.09 | Nanosystems Engineers | 77 | 66 | -11 | time weighted 60, observed use 74, rated potential 82, ability based 67, ilo tasks 56, market 83, frey osborne 9 | sources agree |
| 17-2199.10 | Wind Energy Engineers | 66 | 81 | +15 | time weighted 85, observed use 47, rated potential 76, ability based 67, ilo tasks 56, market 30, frey osborne 9 | sources partly agree |
| 17-2199.11 | Solar Energy Systems Engineers | 65 | 74 | +9 | time weighted 78, observed use 47, rated potential 69, ability based 67, ilo tasks 56, market 30, frey osborne 9 | sources partly agree |
| 17-3011.00 | Architectural and Civil Drafters | 68 | 76 | +8 | time weighted 78, observed use 25, rated potential 82, ability based 71, ilo tasks 62, market 30, frey osborne 48 | sources partly agree |
| 17-3012.00 | Electrical and Electronics Drafters | 79 | 71 | -8 | time weighted 69, observed use 71, rated potential 81, ability based 71, ilo tasks 62, market 73, frey osborne 67 | sources agree |
| 17-3013.00 | Mechanical Drafters | 64 | 68 | +4 | time weighted 71, observed use 25, rated potential 74, ability based 69, ilo tasks 62, market 30, frey osborne 57 | sources partly agree |
| 17-3019.00 | Drafters, All Other | 64 | 68 | +4 | time weighted 71, observed use 25, rated potential 74, ability based 69, ilo tasks 62, market 30, frey osborne – | sources partly agree |
| 17-3021.00 | Aerospace Engineering and Operations Technologists and Technicians | 48 | 52 | +3 | time weighted 56, observed use 25, rated potential 44, ability based 58, ilo tasks 43, market 30, frey osborne 46 | sources agree |
| 17-3022.00 | Civil Engineering Technologists and Technicians | 80 | 71 | -9 | time weighted 71, observed use 72, rated potential 83, ability based 71, ilo tasks 48, market 80, frey osborne 61 | sources agree |
| 17-3023.00 | Electrical and Electronic Engineering Technologists and Technicians | 54 | 57 | +3 | time weighted 58, observed use 54, rated potential 53, ability based 57, ilo tasks 64, market 30, frey osborne 70 | sources agree |
| 17-3024.00 | Electro-Mechanical and Mechatronics Technologists and Technicians | 41 | 46 | +5 | time weighted 50, observed use 25, rated potential 44, ability based 40, ilo tasks 44, market 30, frey osborne 67 | sources agree |
| 17-3024.01 | Robotics Technicians | 46 | 49 | +2 | time weighted 53, observed use 25, rated potential 49, ability based 40, ilo tasks 44, market 30, frey osborne 67 | sources agree |
| 17-3025.00 | Environmental Engineering Technologists and Technicians | 58 | 65 | +7 | time weighted 69, observed use 72, rated potential 63, ability based 50, ilo tasks 42, market 30, frey osborne 37 | sources partly agree |
| 17-3026.00 | Industrial Engineering Technologists and Technicians | 57 | 43 | -14 | time weighted 47, observed use 25, rated potential 64, ability based 63, ilo tasks 42, market 30, frey osborne 18 | sources agree |
| 17-3026.01 | Nanotechnology Engineering Technologists and Technicians | 54 | 43 | -11 | time weighted 48, observed use 25, rated potential 54, ability based 63, ilo tasks 42, market 30, frey osborne 18 | sources agree |
| 17-3027.00 | Mechanical Engineering Technologists and Technicians | 60 | 62 | +1 | time weighted 65, observed use 70, rated potential 66, ability based 47, ilo tasks 43, market 30, frey osborne 42 | sources agree |
| 17-3027.01 | Automotive Engineering Technicians | 48 | 50 | +2 | time weighted 54, observed use 73, rated potential 41, ability based 47, ilo tasks 43, market 30, frey osborne 42 | sources agree |
| 17-3028.00 | Calibration Technologists and Technicians | 51 | 43 | -8 | time weighted 48, observed use 24, rated potential 48, ability based –, ilo tasks 49, market 30, frey osborne 35 | sources agree |
| 17-3029.00 | Engineering Technologists and Technicians, Except Drafters, All Other | 51 | 45 | -6 | time weighted 49, observed use 25, rated potential 41, ability based 54, ilo tasks 42, market 30, frey osborne 35 | sources agree |
| 17-3029.01 | Non-Destructive Testing Specialists | 46 | 56 | +11 | time weighted 61, observed use 25, rated potential 45, ability based 54, ilo tasks 48, market 30, frey osborne 35 | sources agree |
| 17-3029.08 | Photonics Technicians | 41 | 35 | -6 | time weighted 37, observed use 25, rated potential 38, ability based 54, ilo tasks 42, market 30, frey osborne 35 | sources agree |
| 17-3031.00 | Surveying and Mapping Technicians | 58 | 47 | -11 | time weighted 49, observed use 25, rated potential 71, ability based 51, ilo tasks 48, market 30, frey osborne 91 | sources partly agree |
| 19-1011.00 | Animal Scientists | 69 | 87 | +17 | time weighted 89, observed use 25, rated potential 93, ability based 77, ilo tasks 79, market 30, frey osborne 24 | sources disagree |
| 19-1012.00 | Food Scientists and Technologists | 54 | 63 | +9 | time weighted 66, observed use 25, rated potential 65, ability based 68, ilo tasks 79, market 30, frey osborne 26 | sources partly agree |
| 19-1013.00 | Soil and Plant Scientists | 65 | 73 | +7 | time weighted 75, observed use 69, rated potential 86, ability based 63, ilo tasks 52, market 30, frey osborne 14 | sources partly agree |
| 19-1021.00 | Biochemists and Biophysicists | 67 | 69 | +1 | time weighted 68, observed use 70, rated potential 69, ability based 70, ilo tasks 79, market 72, frey osborne 16 | sources agree |
| 19-1022.00 | Microbiologists | 62 | 50 | -12 | time weighted 46, observed use 70, rated potential 54, ability based 64, ilo tasks 79, market 30, frey osborne 7 | sources partly agree |
| 19-1023.00 | Zoologists and Wildlife Biologists | 61 | 78 | +17 | time weighted 81, observed use 63, rated potential 78, ability based 57, ilo tasks 79, market 30, frey osborne 39 | sources partly agree |
| 19-1029.00 | Biological Scientists, All Other | 84 | 80 | -4 | time weighted 81, observed use 85, rated potential 81, ability based 75, ilo tasks 79, market 78, frey osborne 10 | sources agree |
| 19-1029.01 | Bioinformatics Scientists | 89 | 90 | +1 | time weighted 92, observed use 90, rated potential 92, ability based 75, ilo tasks 79, market 93, frey osborne 10 | sources agree |
| 19-1029.02 | Molecular and Cellular Biologists | 80 | 68 | -12 | time weighted 70, observed use 72, rated potential 71, ability based 75, ilo tasks 79, market 30, frey osborne 10 | sources partly agree |
| 19-1029.03 | Geneticists | 82 | 78 | -4 | time weighted 77, observed use 91, rated potential 79, ability based 75, ilo tasks 79, market 84, frey osborne 10 | sources agree |
| 19-1029.04 | Biologists | 79 | 77 | -2 | time weighted 80, observed use 74, rated potential 69, ability based 75, ilo tasks 79, market 30, frey osborne 10 | sources partly agree |
| 19-1031.00 | Conservation Scientists | 52 | 44 | -8 | time weighted 45, observed use 25, rated potential 73, ability based 51, ilo tasks 75, market 30, frey osborne 12 | sources partly agree |
| 19-1031.02 | Range Managers | 47 | 39 | -8 | time weighted 39, observed use 25, rated potential 59, ability based 51, ilo tasks 75, market 30, frey osborne 12 | sources partly agree |
| 19-1031.03 | Park Naturalists | 59 | 74 | +15 | time weighted 77, observed use 25, rated potential 78, ability based 51, ilo tasks 75, market 30, frey osborne 12 | sources partly agree |
| 19-1032.00 | Foresters | 45 | 36 | -9 | time weighted 38, observed use 25, rated potential 58, ability based 45, ilo tasks 52, market 30, frey osborne 6 | sources agree |
| 19-1041.00 | Epidemiologists | 70 | 83 | +13 | time weighted 87, observed use 40, rated potential 77, ability based 98, ilo tasks 79, market 30, frey osborne 33 | sources partly agree |
| 19-1042.00 | Medical Scientists, Except Epidemiologists | 77 | 76 | -1 | time weighted 78, observed use 57, rated potential 85, ability based 86, ilo tasks 79, market 30, frey osborne 3 | sources partly agree |
| 19-1099.00 | Life Scientists, All Other | 69 | 87 | +18 | time weighted 89, observed use 25, rated potential 93, ability based 77, ilo tasks 79, market 30, frey osborne – | sources disagree |
| 19-2011.00 | Astronomers | 86 | 85 | -1 | time weighted 87, observed use 93, rated potential 67, ability based 94, ilo tasks 74, market 92, frey osborne 22 | sources agree |
| 19-2012.00 | Physicists | 97 | 89 | -8 | time weighted 90, observed use 87, rated potential 96, ability based 92, ilo tasks 74, market 93, frey osborne 29 | sources agree |
| 19-2021.00 | Atmospheric and Space Scientists | 84 | 85 | +1 | time weighted 88, observed use 64, rated potential 89, ability based 94, ilo tasks 93, market 30, frey osborne 56 | sources partly agree |
| 19-2031.00 | Chemists | 65 | 61 | -4 | time weighted 58, observed use 86, rated potential 60, ability based 60, ilo tasks 76, market 30, frey osborne 29 | sources partly agree |
| 19-2032.00 | Materials Scientists | 78 | 82 | +5 | time weighted 85, observed use 80, rated potential 80, ability based 77, ilo tasks 61, market 80, frey osborne 14 | sources agree |
| 19-2041.00 | Environmental Scientists and Specialists, Including Health | 72 | 79 | +7 | time weighted 80, observed use 75, rated potential 87, ability based 76, ilo tasks 75, market 87, frey osborne 19 | sources agree |
| 19-2041.01 | Climate Change Policy Analysts | 76 | 82 | +6 | time weighted 85, observed use 45, rated potential 92, ability based 76, ilo tasks 75, market 30, frey osborne 19 | sources partly agree |
| 19-2041.02 | Environmental Restoration Planners | 74 | 63 | -11 | time weighted 64, observed use 45, rated potential 87, ability based 76, ilo tasks 75, market 30, frey osborne 19 | sources partly agree |
| 19-2041.03 | Industrial Ecologists | 75 | 90 | +16 | time weighted 93, observed use 58, rated potential 91, ability based 76, ilo tasks 75, market 30, frey osborne 19 | sources partly agree |
| 19-2042.00 | Geoscientists, Except Hydrologists and Geographers | 63 | 69 | +6 | time weighted 72, observed use 59, rated potential 67, ability based 65, ilo tasks 65, market 30, frey osborne 54 | sources agree |
| 19-2043.00 | Hydrologists | 70 | 77 | +7 | time weighted 79, observed use 48, rated potential 82, ability based 63, ilo tasks 65, market 30, frey osborne 9 | sources partly agree |
| 19-2099.00 | Physical Scientists, All Other | 70 | 73 | +3 | time weighted 75, observed use 60, rated potential 61, ability based 81, ilo tasks –, market 70, frey osborne 45 | sources agree |
| 19-2099.01 | Remote Sensing Scientists and Technologists | 67 | 73 | +6 | time weighted 75, observed use 60, rated potential 66, ability based 81, ilo tasks –, market 70, frey osborne 45 | sources agree |
| 19-3011.00 | Economists | 91 | 92 | +1 | time weighted 93, observed use 91, rated potential 74, ability based 96, ilo tasks 94, market 96, frey osborne 45 | sources agree |
| 19-3011.01 | Environmental Economists | 95 | 91 | -4 | time weighted 90, observed use 84, rated potential 95, ability based 96, ilo tasks 94, market 91, frey osborne 45 | sources agree |
| 19-3022.00 | Survey Researchers | 98 | 95 | -4 | time weighted 93, observed use 95, rated potential 96, ability based 97, ilo tasks 95, market 96, frey osborne 34 | sources agree |
| 19-3032.00 | Industrial-Organizational Psychologists | 86 | 85 | -1 | time weighted 87, observed use 81, rated potential 82, ability based 96, ilo tasks 77, market 67, frey osborne 7 | sources agree |
| 19-3033.00 | Clinical and Counseling Psychologists | 56 | 52 | -4 | time weighted 55, observed use 61, rated potential 62, ability based –, ilo tasks 77, market 30, frey osborne 3 | sources partly agree |
| 19-3034.00 | School Psychologists | 56 | 67 | +10 | time weighted 66, observed use 61, rated potential 75, ability based –, ilo tasks 77, market 71, frey osborne 3 | sources agree |
| 19-3039.00 | Psychologists, All Other | 76 | 60 | -15 | time weighted 51, observed use 46, rated potential 64, ability based 96, ilo tasks 77, market 79, frey osborne 2 | sources partly agree |
| 19-3039.02 | Neuropsychologists | 70 | 62 | -9 | time weighted 54, observed use 47, rated potential 61, ability based 96, ilo tasks 77, market 81, frey osborne 2 | sources partly agree |
| 19-3039.03 | Clinical Neuropsychologists | 69 | 63 | -6 | time weighted 56, observed use 47, rated potential 60, ability based 96, ilo tasks 77, market 82, frey osborne 2 | sources partly agree |
| 19-3041.00 | Sociologists | 96 | 94 | -2 | time weighted 95, observed use 95, rated potential 90, ability based 97, ilo tasks 88, market 96, frey osborne 24 | sources agree |
| 19-3051.00 | Urban and Regional Planners | 76 | 77 | +1 | time weighted 78, observed use 63, rated potential 80, ability based 84, ilo tasks 81, market 64, frey osborne 30 | sources agree |
| 19-3091.00 | Anthropologists and Archeologists | 66 | 75 | +9 | time weighted 72, observed use 81, rated potential 77, ability based 64, ilo tasks 88, market 88, frey osborne 5 | sources agree |
| 19-3092.00 | Geographers | 87 | 75 | -12 | time weighted 65, observed use 76, rated potential 72, ability based 98, ilo tasks 88, market 85, frey osborne 37 | sources agree |
| 19-3093.00 | Historians | 66 | 68 | +2 | time weighted 69, observed use 55, rated potential 73, ability based 79, ilo tasks 87, market 30, frey osborne 45 | sources partly agree |
| 19-3094.00 | Political Scientists | 92 | 92 | +0 | time weighted 94, observed use 95, rated potential 80, ability based 97, ilo tasks 87, market 67, frey osborne 21 | sources agree |
| 19-3099.00 | Social Scientists and Related Workers, All Other | 77 | 83 | +7 | time weighted 86, observed use 56, rated potential 90, ability based 90, ilo tasks 98, market 30, frey osborne 21 | sources partly agree |
| 19-3099.01 | Transportation Planners | 79 | 83 | +5 | time weighted 86, observed use 56, rated potential 89, ability based 90, ilo tasks 92, market 30, frey osborne 21 | sources partly agree |
| 19-4012.00 | Agricultural Technicians | 43 | 51 | +7 | time weighted 49, observed use 50, rated potential 40, ability based –, ilo tasks 43, market 61, frey osborne 94 | sources agree |
| 19-4012.01 | Precision Agriculture Technicians | 63 | 58 | -5 | time weighted 59, observed use 37, rated potential 75, ability based –, ilo tasks 43, market 30, frey osborne 94 | sources partly agree |
| 19-4013.00 | Food Science Technicians | 64 | 56 | -8 | time weighted 54, observed use 81, rated potential 50, ability based –, ilo tasks 43, market 30, frey osborne 94 | sources partly agree |
| 19-4021.00 | Biological Technicians | 58 | 57 | -1 | time weighted 50, observed use 65, rated potential 51, ability based 57, ilo tasks 74, market 73, frey osborne 39 | sources agree |
| 19-4031.00 | Chemical Technicians | 63 | 63 | -0 | time weighted 58, observed use 92, rated potential 59, ability based 50, ilo tasks 43, market 88, frey osborne 50 | sources partly agree |
| 19-4042.00 | Environmental Science and Protection Technicians, Including Health | 71 | 72 | +1 | time weighted 65, observed use 79, rated potential 65, ability based –, ilo tasks 74, market 86, frey osborne 63 | sources agree |
| 19-4043.00 | Geological Technicians, Except Hydrologic Technicians | 67 | 67 | -1 | time weighted 61, observed use 84, rated potential 50, ability based –, ilo tasks 46, market 79, frey osborne 81 | sources partly agree |
| 19-4044.00 | Hydrologic Technicians | 78 | 55 | -23 | time weighted 57, observed use 24, rated potential 69, ability based –, ilo tasks 44, market 30, frey osborne 62 | sources partly agree |
| 19-4051.00 | Nuclear Technicians | 36 | 33 | -3 | time weighted 31, observed use 25, rated potential 35, ability based 54, ilo tasks 42, market 30, frey osborne 72 | sources agree |
| 19-4051.02 | Nuclear Monitoring Technicians | 40 | 50 | +11 | time weighted 54, observed use 25, rated potential 43, ability based 54, ilo tasks 42, market 30, frey osborne 72 | sources agree |
| 19-4061.00 | Social Science Research Assistants | 95 | 95 | +0 | time weighted 96, observed use 96, rated potential 94, ability based 83, ilo tasks 96, market 96, frey osborne 55 | sources agree |
| 19-4071.00 | Forest and Conservation Technicians | 47 | 48 | +2 | time weighted 48, observed use 57, rated potential 50, ability based –, ilo tasks 31, market 72, frey osborne 44 | sources agree |
| 19-4092.00 | Forensic Science Technicians | 51 | 46 | -4 | time weighted 51, observed use 25, rated potential 49, ability based 56, ilo tasks 42, market 30, frey osborne 6 | sources agree |
| 19-4099.00 | Life, Physical, and Social Science Technicians, All Other | 65 | 66 | +1 | time weighted 66, observed use 72, rated potential 72, ability based 59, ilo tasks 42, market 73, frey osborne 52 | sources agree |
| 19-4099.01 | Quality Control Analysts | 70 | 56 | -14 | time weighted 56, observed use 69, rated potential 75, ability based 59, ilo tasks 42, market 30, frey osborne 52 | sources partly agree |
| 19-4099.03 | Remote Sensing Technicians | 73 | 72 | -1 | time weighted 74, observed use 73, rated potential 79, ability based 59, ilo tasks 43, market 82, frey osborne 52 | sources agree |
| 19-5011.00 | Occupational Health and Safety Specialists | 45 | 48 | +3 | time weighted 52, observed use 25, rated potential 53, ability based –, ilo tasks 49, market 30, frey osborne 32 | sources agree |
| 19-5012.00 | Occupational Health and Safety Technicians | 50 | 55 | +6 | time weighted 59, observed use 25, rated potential 61, ability based –, ilo tasks 38, market 30, frey osborne 37 | sources agree |
| 21-1011.00 | Substance Abuse and Behavioral Disorder Counselors | 49 | 42 | -7 | time weighted 43, observed use 51, rated potential 40, ability based 77, ilo tasks 50, market 30, frey osborne 19 | sources agree |
| 21-1012.00 | Educational, Guidance, and Career Counselors and Advisors | 62 | 70 | +8 | time weighted 73, observed use 80, rated potential 54, ability based 73, ilo tasks 65, market 30, frey osborne 6 | sources partly agree |
| 21-1013.00 | Marriage and Family Therapists | 53 | 39 | -14 | time weighted 38, observed use 25, rated potential 35, ability based 94, ilo tasks 50, market 30, frey osborne 9 | sources partly agree |
| 21-1014.00 | Mental Health Counselors | 62 | 43 | -18 | time weighted 42, observed use 56, rated potential 41, ability based 91, ilo tasks 50, market 30, frey osborne 3 | sources partly agree |
| 21-1015.00 | Rehabilitation Counselors | 51 | 63 | +12 | time weighted 68, observed use 25, rated potential 67, ability based 60, ilo tasks 50, market 30, frey osborne 6 | sources partly agree |
| 21-1019.00 | Counselors, All Other | 62 | 70 | +8 | time weighted 73, observed use 80, rated potential 54, ability based 73, ilo tasks 50, market 30, frey osborne – | sources partly agree |
| 21-1021.00 | Child, Family, and School Social Workers | 47 | 54 | +7 | time weighted 57, observed use 37, rated potential 45, ability based 66, ilo tasks 50, market 30, frey osborne 17 | sources agree |
| 21-1022.00 | Healthcare Social Workers | 62 | 54 | -8 | time weighted 44, observed use 73, rated potential 60, ability based 71, ilo tasks 50, market 82, frey osborne 1 | sources agree |
| 21-1023.00 | Mental Health and Substance Abuse Social Workers | 54 | 51 | -3 | time weighted 46, observed use 50, rated potential 47, ability based 80, ilo tasks 50, market 85, frey osborne 0 | sources partly agree |
| 21-1029.00 | Social Workers, All Other | 47 | 55 | +7 | time weighted 57, observed use 37, rated potential 45, ability based 66, ilo tasks 50, market 30, frey osborne – | sources agree |
| 21-1091.00 | Health Education Specialists | 77 | 69 | -8 | time weighted 70, observed use 77, rated potential 80, ability based 64, ilo tasks 49, market 84, frey osborne 22 | sources agree |
| 21-1092.00 | Probation Officers and Correctional Treatment Specialists | 54 | 54 | 0 | time weighted 56, observed use 25, rated potential 62, ability based 62, ilo tasks 50, market 30, frey osborne 37 | sources agree |
| 21-1093.00 | Social and Human Service Assistants | 53 | 55 | +2 | time weighted 57, observed use 25, rated potential 59, ability based 59, ilo tasks 61, market 30, frey osborne 30 | sources partly agree |
| 21-1094.00 | Community Health Workers | 44 | 56 | +12 | time weighted 61, observed use 25, rated potential 54, ability based 49, ilo tasks 34, market 30, frey osborne – | sources agree |
| 21-1099.00 | Community and Social Service Specialists, All Other | 44 | 57 | +12 | time weighted 61, observed use 25, rated potential 54, ability based 49, ilo tasks 50, market 30, frey osborne – | sources agree |
| 21-2011.00 | Clergy | 68 | 52 | -17 | time weighted 51, observed use 76, rated potential 44, ability based 86, ilo tasks 15, market 68, frey osborne 6 | sources partly agree |
| 21-2021.00 | Directors, Religious Activities and Education | 75 | 61 | -15 | time weighted 64, observed use 79, rated potential 66, ability based 83, ilo tasks 15, market 30, frey osborne 16 | sources partly agree |
| 21-2099.00 | Religious Workers, All Other | 75 | 61 | -14 | time weighted 64, observed use 79, rated potential 66, ability based 83, ilo tasks 5, market 30, frey osborne – | sources disagree |
| 23-1011.00 | Lawyers | 78 | 72 | -6 | time weighted 70, observed use 79, rated potential 68, ability based 90, ilo tasks 65, market 78, frey osborne 20 | sources agree |
| 23-1012.00 | Judicial Law Clerks | 89 | 90 | +1 | time weighted 92, observed use 82, rated potential 78, ability based 99, ilo tasks 78, market 95, frey osborne 44 | sources agree |
| 23-1021.00 | Administrative Law Judges, Adjudicators, and Hearing Officers | 91 | 80 | -12 | time weighted 75, observed use 90, rated potential 69, ability based 95, ilo tasks 58, market 95, frey osborne 54 | sources agree |
| 23-1022.00 | Arbitrators, Mediators, and Conciliators | 91 | 75 | -16 | time weighted 68, observed use 87, rated potential 69, ability based 98, ilo tasks 72, market 87, frey osborne 24 | sources agree |
| 23-1023.00 | Judges, Magistrate Judges, and Magistrates | 85 | 68 | -17 | time weighted 56, observed use 89, rated potential 54, ability based 99, ilo tasks 58, market 95, frey osborne 43 | sources partly agree |
| 23-2011.00 | Paralegals and Legal Assistants | 89 | 89 | -0 | time weighted 90, observed use 83, rated potential 77, ability based 87, ilo tasks 78, market 78, frey osborne 87 | sources agree |
| 23-2093.00 | Title Examiners, Abstractors, and Searchers | 79 | 91 | +12 | time weighted 94, observed use 39, rated potential 86, ability based 86, ilo tasks 78, market 30, frey osborne 99 | sources partly agree |
| 23-2099.00 | Legal Support Workers, All Other | 79 | 91 | +12 | time weighted 94, observed use 39, rated potential 86, ability based 86, ilo tasks 78, market 30, frey osborne – | sources partly agree |
| 25-1011.00 | Business Teachers, Postsecondary | 88 | 86 | -2 | time weighted 83, observed use 92, rated potential 70, ability based 92, ilo tasks 69, market 90, frey osborne – | sources agree |
| 25-1021.00 | Computer Science Teachers, Postsecondary | 86 | 85 | -2 | time weighted 83, observed use 88, rated potential 71, ability based 85, ilo tasks 69, market 91, frey osborne – | sources agree |
| 25-1022.00 | Mathematical Science Teachers, Postsecondary | 94 | 86 | -8 | time weighted 83, observed use 96, rated potential 78, ability based 91, ilo tasks 69, market 82, frey osborne – | sources agree |
| 25-1031.00 | Architecture Teachers, Postsecondary | 67 | 83 | +15 | time weighted 85, observed use 55, rated potential 70, ability based 84, ilo tasks 69, market 91, frey osborne – | sources agree |
| 25-1032.00 | Engineering Teachers, Postsecondary | 92 | 88 | -4 | time weighted 84, observed use 94, rated potential 74, ability based 93, ilo tasks 69, market 95, frey osborne – | sources agree |
| 25-1041.00 | Agricultural Sciences Teachers, Postsecondary | 63 | 81 | +17 | time weighted 82, observed use 59, rated potential 84, ability based 66, ilo tasks 69, market 94, frey osborne – | sources agree |
| 25-1042.00 | Biological Science Teachers, Postsecondary | 83 | 83 | 0 | time weighted 80, observed use 91, rated potential 67, ability based 84, ilo tasks 69, market 92, frey osborne – | sources agree |
| 25-1043.00 | Forestry and Conservation Science Teachers, Postsecondary | 69 | 83 | +14 | time weighted 84, observed use 72, rated potential 71, ability based 85, ilo tasks 69, market 92, frey osborne – | sources agree |
| 25-1051.00 | Atmospheric, Earth, Marine, and Space Sciences Teachers, Postsecondary | 73 | 83 | +10 | time weighted 81, observed use 79, rated potential 68, ability based 88, ilo tasks 69, market 94, frey osborne – | sources agree |
| 25-1052.00 | Chemistry Teachers, Postsecondary | 81 | 82 | +1 | time weighted 77, observed use 91, rated potential 63, ability based 90, ilo tasks 69, market 90, frey osborne – | sources agree |
| 25-1053.00 | Environmental Science Teachers, Postsecondary | 78 | 85 | +7 | time weighted 85, observed use 74, rated potential 74, ability based 92, ilo tasks 69, market 92, frey osborne – | sources agree |
| 25-1054.00 | Physics Teachers, Postsecondary | 60 | 78 | +18 | time weighted 79, observed use 61, rated potential 61, ability based 78, ilo tasks 69, market 91, frey osborne – | sources agree |
| 25-1061.00 | Anthropology and Archeology Teachers, Postsecondary | 77 | 85 | +8 | time weighted 84, observed use 76, rated potential 72, ability based 89, ilo tasks 69, market 93, frey osborne – | sources agree |
| 25-1062.00 | Area, Ethnic, and Cultural Studies Teachers, Postsecondary | 73 | 81 | +8 | time weighted 81, observed use 59, rated potential 72, ability based 88, ilo tasks 69, market 92, frey osborne – | sources agree |
| 25-1063.00 | Economics Teachers, Postsecondary | 69 | 86 | +17 | time weighted 88, observed use 58, rated potential 72, ability based 89, ilo tasks 69, market 94, frey osborne – | sources agree |
| 25-1064.00 | Geography Teachers, Postsecondary | 69 | 82 | +13 | time weighted 83, observed use 57, rated potential 73, ability based 89, ilo tasks 69, market 92, frey osborne – | sources agree |
| 25-1065.00 | Political Science Teachers, Postsecondary | 71 | 83 | +13 | time weighted 85, observed use 59, rated potential 68, ability based 94, ilo tasks 69, market 94, frey osborne – | sources agree |
| 25-1066.00 | Psychology Teachers, Postsecondary | 87 | 87 | -0 | time weighted 86, observed use 94, rated potential 68, ability based 90, ilo tasks 69, market 90, frey osborne – | sources agree |
| 25-1067.00 | Sociology Teachers, Postsecondary | 66 | 84 | +18 | time weighted 86, observed use 59, rated potential 65, ability based 92, ilo tasks 69, market 91, frey osborne – | sources agree |
| 25-1069.00 | Social Sciences Teachers, Postsecondary, All Other | 71 | 83 | +13 | time weighted 85, observed use 59, rated potential 68, ability based 94, ilo tasks 69, market 94, frey osborne – | sources agree |
| 25-1071.00 | Health Specialties Teachers, Postsecondary | 79 | 80 | +2 | time weighted 78, observed use 90, rated potential 67, ability based 71, ilo tasks 69, market 91, frey osborne – | sources agree |
| 25-1072.00 | Nursing Instructors and Teachers, Postsecondary | 64 | 73 | +9 | time weighted 73, observed use 83, rated potential 57, ability based 61, ilo tasks 69, market 76, frey osborne – | sources agree |
| 25-1081.00 | Education Teachers, Postsecondary | 84 | 84 | +0 | time weighted 82, observed use 89, rated potential 73, ability based 83, ilo tasks 69, market 89, frey osborne – | sources agree |
| 25-1082.00 | Library Science Teachers, Postsecondary | 78 | 86 | +8 | time weighted 86, observed use 73, rated potential 73, ability based 95, ilo tasks 69, market 94, frey osborne – | sources agree |
| 25-1111.00 | Criminal Justice and Law Enforcement Teachers, Postsecondary | 76 | 82 | +6 | time weighted 85, observed use 56, rated potential 70, ability based 96, ilo tasks 69, market 84, frey osborne – | sources agree |
| 25-1112.00 | Law Teachers, Postsecondary | 68 | 84 | +16 | time weighted 84, observed use 60, rated potential 80, ability based 93, ilo tasks 69, market 97, frey osborne – | sources agree |
| 25-1113.00 | Social Work Teachers, Postsecondary | 65 | 81 | +16 | time weighted 80, observed use 58, rated potential 74, ability based 92, ilo tasks 69, market 92, frey osborne – | sources agree |
| 25-1121.00 | Art, Drama, and Music Teachers, Postsecondary | 70 | 79 | +9 | time weighted 77, observed use 85, rated potential 77, ability based 66, ilo tasks 69, market 82, frey osborne – | sources agree |
| 25-1122.00 | Communications Teachers, Postsecondary | 81 | 85 | +4 | time weighted 82, observed use 88, rated potential 77, ability based 92, ilo tasks 69, market 88, frey osborne – | sources agree |
| 25-1123.00 | English Language and Literature Teachers, Postsecondary | 94 | 88 | -6 | time weighted 82, observed use 95, rated potential 84, ability based 97, ilo tasks 69, market 86, frey osborne – | sources agree |
| 25-1124.00 | Foreign Language and Literature Teachers, Postsecondary | 90 | 88 | -3 | time weighted 84, observed use 92, rated potential 86, ability based 90, ilo tasks 69, market 85, frey osborne – | sources agree |
| 25-1125.00 | History Teachers, Postsecondary | 87 | 88 | +2 | time weighted 84, observed use 82, rated potential 86, ability based 98, ilo tasks 69, market 90, frey osborne – | sources agree |
| 25-1126.00 | Philosophy and Religion Teachers, Postsecondary | 88 | 88 | -0 | time weighted 84, observed use 90, rated potential 85, ability based 94, ilo tasks 69, market 89, frey osborne – | sources agree |
| 25-1192.00 | Family and Consumer Sciences Teachers, Postsecondary | 74 | 84 | +10 | time weighted 86, observed use 56, rated potential 91, ability based 83, ilo tasks 69, market 82, frey osborne – | sources agree |
| 25-1193.00 | Recreation and Fitness Studies Teachers, Postsecondary | 84 | 85 | +1 | time weighted 80, observed use 86, rated potential 90, ability based 82, ilo tasks 69, market 88, frey osborne – | sources agree |
| 25-1194.00 | Career/Technical Education Teachers, Postsecondary | 67 | 76 | +9 | time weighted 78, observed use 80, rated potential 72, ability based 53, ilo tasks 63, market 30, frey osborne – | sources partly agree |
| 25-1199.00 | Postsecondary Teachers, All Other | 74 | 84 | +10 | time weighted 86, observed use 56, rated potential 91, ability based 83, ilo tasks 69, market 82, frey osborne – | sources agree |
| 25-2011.00 | Preschool Teachers, Except Special Education | 38 | 43 | +5 | time weighted 48, observed use 46, rated potential 41, ability based 49, ilo tasks 31, market 61, frey osborne 5 | sources agree |
| 25-2012.00 | Kindergarten Teachers, Except Special Education | 42 | 58 | +16 | time weighted 60, observed use 48, rated potential 41, ability based 58, ilo tasks 31, market 69, frey osborne 31 | sources agree |
| 25-2021.00 | Elementary School Teachers, Except Special Education | 61 | 64 | +3 | time weighted 67, observed use 76, rated potential 47, ability based 70, ilo tasks 43, market 65, frey osborne 3 | sources agree |
| 25-2022.00 | Middle School Teachers, Except Special and Career/Technical Education | 76 | 74 | -2 | time weighted 75, observed use 94, rated potential 57, ability based 87, ilo tasks 43, market 66, frey osborne 32 | sources partly agree |
| 25-2023.00 | Career/Technical Education Teachers, Middle School | 49 | 66 | +17 | time weighted 68, observed use 51, rated potential 49, ability based 62, ilo tasks 63, market 69, frey osborne 38 | sources agree |
| 25-2031.00 | Secondary School Teachers, Except Special and Career/Technical Education | 72 | 73 | +1 | time weighted 75, observed use 92, rated potential 57, ability based 83, ilo tasks 54, market 73, frey osborne 5 | sources agree |
| 25-2032.00 | Career/Technical Education Teachers, Secondary School | 49 | 67 | +18 | time weighted 70, observed use 51, rated potential 50, ability based 58, ilo tasks 63, market 70, frey osborne 6 | sources agree |
| 25-2051.00 | Special Education Teachers, Preschool | 40 | 52 | +12 | time weighted 50, observed use 60, rated potential 40, ability based 58, ilo tasks 51, market 67, frey osborne – | sources agree |
| 25-2055.00 | Special Education Teachers, Kindergarten | 25 | 62 | +37 | time weighted 61, observed use 77, rated potential 45, ability based –, ilo tasks 51, market 70, frey osborne – | sources agree |
| 25-2056.00 | Special Education Teachers, Elementary School | 35 | 63 | +28 | time weighted 62, observed use 75, rated potential 50, ability based –, ilo tasks 51, market 63, frey osborne – | sources agree |
| 25-2057.00 | Special Education Teachers, Middle School | 58 | 65 | +6 | time weighted 67, observed use 82, rated potential 50, ability based –, ilo tasks 51, market 66, frey osborne 12 | sources agree |
| 25-2058.00 | Special Education Teachers, Secondary School | 56 | 62 | +6 | time weighted 65, observed use 80, rated potential 50, ability based –, ilo tasks 51, market 66, frey osborne 5 | sources agree |
| 25-2059.00 | Special Education Teachers, All Other | 38 | 45 | +8 | time weighted 47, observed use 53, rated potential 41, ability based 30, ilo tasks 51, market 64, frey osborne – | sources agree |
| 25-2059.01 | Adapted Physical Education Specialists | 48 | 46 | -2 | time weighted 47, observed use 53, rated potential 51, ability based 30, ilo tasks 51, market 64, frey osborne – | sources agree |
| 25-3011.00 | Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors | 72 | 74 | +3 | time weighted 76, observed use 73, rated potential 64, ability based 92, ilo tasks 62, market 65, frey osborne 33 | sources agree |
| 25-3021.00 | Self-Enrichment Teachers | 58 | 66 | +9 | time weighted 69, observed use 72, rated potential 54, ability based 62, ilo tasks 39, market 77, frey osborne 30 | sources agree |
| 25-3031.00 | Substitute Teachers, Short-Term | 44 | 52 | +8 | time weighted 49, observed use 55, rated potential 38, ability based –, ilo tasks 61, market 68, frey osborne – | sources agree |
| 25-3041.00 | Tutors | 93 | 79 | -14 | time weighted 81, observed use 95, rated potential 72, ability based –, ilo tasks 61, market 68, frey osborne – | sources agree |
| 25-3099.00 | Teachers and Instructors, All Other | 93 | 76 | -17 | time weighted 76, observed use 78, rated potential 66, ability based 89, ilo tasks 62, market 65, frey osborne – | sources agree |
| 25-4011.00 | Archivists | 74 | 75 | +1 | time weighted 69, observed use 77, rated potential 80, ability based 64, ilo tasks 88, market 82, frey osborne 62 | sources agree |
| 25-4012.00 | Curators | 82 | 72 | -10 | time weighted 67, observed use 96, rated potential 81, ability based 66, ilo tasks 88, market 78, frey osborne 5 | sources agree |
| 25-4013.00 | Museum Technicians and Conservators | 38 | 45 | +7 | time weighted 48, observed use 25, rated potential 40, ability based 47, ilo tasks 71, market 30, frey osborne 51 | sources partly agree |
| 25-4022.00 | Librarians and Media Collections Specialists | 87 | 79 | -8 | time weighted 69, observed use 83, rated potential 83, ability based –, ilo tasks 94, market 84, frey osborne 48 | sources agree |
| 25-4031.00 | Library Technicians | 66 | 82 | +16 | time weighted 84, observed use 61, rated potential 86, ability based 50, ilo tasks 87, market 69, frey osborne 99 | sources agree |
| 25-9021.00 | Farm and Home Management Educators | 55 | 72 | +17 | time weighted 77, observed use 25, rated potential 68, ability based 69, ilo tasks 52, market 30, frey osborne 5 | sources partly agree |
| 25-9031.00 | Instructional Coordinators | 87 | 87 | +0 | time weighted 89, observed use 90, rated potential 80, ability based 88, ilo tasks 78, market 89, frey osborne 2 | sources agree |
| 25-9042.00 | Teaching Assistants, Preschool, Elementary, Middle, and Secondary School, Except Special Education | 45 | 61 | +16 | time weighted 62, observed use 85, rated potential 48, ability based –, ilo tasks 38, market 62, frey osborne 49 | sources partly agree |
| 25-9043.00 | Teaching Assistants, Special Education | 27 | 49 | +22 | time weighted 45, observed use 74, rated potential 38, ability based –, ilo tasks 38, market 62, frey osborne 49 | sources agree |
| 25-9044.00 | Teaching Assistants, Postsecondary | 81 | 78 | -3 | time weighted 79, observed use 73, rated potential 67, ability based –, ilo tasks 69, market 75, frey osborne – | sources agree |
| 25-9049.00 | Teaching Assistants, All Other | 27 | 49 | +22 | time weighted 45, observed use 74, rated potential 38, ability based –, ilo tasks 38, market 62, frey osborne 49 | sources agree |
| 25-9099.00 | Educational Instruction and Library Workers, All Other | 87 | 88 | +1 | time weighted 89, observed use 90, rated potential 80, ability based 88, ilo tasks 61, market 89, frey osborne – | sources agree |
| 27-1011.00 | Art Directors | 81 | 73 | -7 | time weighted 72, observed use 81, rated potential 74, ability based 76, ilo tasks 66, market 86, frey osborne 15 | sources agree |
| 27-1012.00 | Craft Artists | 32 | 41 | +8 | time weighted 46, observed use 62, rated potential 36, ability based 20, ilo tasks 16, market 30, frey osborne 20 | sources partly agree |
| 27-1013.00 | Fine Artists, Including Painters, Sculptors, and Illustrators | 60 | 54 | -6 | time weighted 50, observed use 94, rated potential 54, ability based 33, ilo tasks 31, market 84, frey osborne 22 | sources partly agree |
| 27-1014.00 | Special Effects Artists and Animators | 83 | 89 | +6 | time weighted 91, observed use 93, rated potential 79, ability based 65, ilo tasks 90, market 92, frey osborne 10 | sources agree |
| 27-1019.00 | Artists and Related Workers, All Other | 32 | 42 | +9 | time weighted 46, observed use 62, rated potential 36, ability based 20, ilo tasks –, market 30, frey osborne – | sources agree |
| 27-1021.00 | Commercial and Industrial Designers | 64 | 62 | -2 | time weighted 60, observed use 60, rated potential 68, ability based 70, ilo tasks 63, market 67, frey osborne 20 | sources agree |
| 27-1022.00 | Fashion Designers | 59 | 60 | +1 | time weighted 61, observed use 61, rated potential 58, ability based 62, ilo tasks 63, market 63, frey osborne 14 | sources agree |
| 27-1023.00 | Floral Designers | 33 | 36 | +2 | time weighted 40, observed use 25, rated potential 37, ability based 41, ilo tasks 11, market 30, frey osborne 23 | sources agree |
| 27-1024.00 | Graphic Designers | 81 | 84 | +3 | time weighted 86, observed use 91, rated potential 72, ability based 65, ilo tasks 90, market 88, frey osborne 27 | sources agree |
| 27-1025.00 | Interior Designers | 68 | 47 | -21 | time weighted 48, observed use 25, rated potential 66, ability based 80, ilo tasks 67, market 30, frey osborne 15 | sources partly agree |
| 27-1026.00 | Merchandise Displayers and Window Trimmers | 28 | 32 | +5 | time weighted 34, observed use 25, rated potential 45, ability based 17, ilo tasks 67, market 30, frey osborne 46 | sources partly agree |
| 27-1027.00 | Set and Exhibit Designers | 47 | 49 | +2 | time weighted 53, observed use 25, rated potential 58, ability based 48, ilo tasks 67, market 30, frey osborne 4 | sources agree |
| 27-1029.00 | Designers, All Other | 33 | 38 | +5 | time weighted 40, observed use 25, rated potential 37, ability based 41, ilo tasks 63, market 30, frey osborne – | sources agree |
| 27-2011.00 | Actors | 49 | 55 | +6 | time weighted 53, observed use 71, rated potential 30, ability based 53, ilo tasks 59, market 62, frey osborne 42 | sources agree |
| 27-2012.00 | Producers and Directors | 69 | 65 | -5 | time weighted 60, observed use 76, rated potential 69, ability based 71, ilo tasks 66, market 72, frey osborne 15 | sources agree |
| 27-2012.03 | Media Programming Directors | 72 | 76 | +4 | time weighted 78, observed use 62, rated potential 83, ability based 71, ilo tasks 66, market 30, frey osborne 15 | sources partly agree |
| 27-2012.04 | Talent Directors | 75 | 51 | -24 | time weighted 47, observed use 67, rated potential 64, ability based 71, ilo tasks 66, market 30, frey osborne 15 | sources agree |
| 27-2012.05 | Media Technical Directors/Managers | 66 | 45 | -21 | time weighted 42, observed use 49, rated potential 54, ability based 71, ilo tasks 66, market 30, frey osborne 15 | sources agree |
| 27-2021.00 | Athletes and Sports Competitors | 1 | 18 | +17 | time weighted 23, observed use 25, rated potential 3, ability based 2, ilo tasks 35, market 30, frey osborne 38 | sources agree |
| 27-2022.00 | Coaches and Scouts | 45 | 35 | -10 | time weighted 36, observed use 25, rated potential 38, ability based 52, ilo tasks 73, market 30, frey osborne 8 | sources partly agree |
| 27-2023.00 | Umpires, Referees, and Other Sports Officials | 43 | 37 | -6 | time weighted 30, observed use 25, rated potential 37, ability based 48, ilo tasks 73, market 30, frey osborne 97 | sources partly agree |
| 27-2031.00 | Dancers | 1 | 11 | +10 | time weighted 15, observed use 25, rated potential 8, ability based 0, ilo tasks 26, market 30, frey osborne 30 | sources agree |
| 27-2032.00 | Choreographers | 28 | 31 | +4 | time weighted 35, observed use 66, rated potential 35, ability based 5, ilo tasks 26, market 30, frey osborne 2 | sources partly agree |
| 27-2041.00 | Music Directors and Composers | 77 | 65 | -12 | time weighted 69, observed use 59, rated potential 72, ability based 70, ilo tasks 49, market 30, frey osborne 10 | sources agree |
| 27-2042.00 | Musicians and Singers | 49 | 31 | -18 | time weighted 33, observed use 25, rated potential 41, ability based 49, ilo tasks 49, market 30, frey osborne 25 | sources agree |
| 27-2091.00 | Disc Jockeys, Except Radio | 84 | 56 | -28 | time weighted 60, observed use 24, rated potential 71, ability based –, ilo tasks 35, market 30, frey osborne – | sources partly agree |
| 27-2099.00 | Entertainers and Performers, Sports and Related Workers, All Other | 84 | 57 | -27 | time weighted 60, observed use 24, rated potential 71, ability based –, ilo tasks 54, market 30, frey osborne – | sources partly agree |
| 27-3011.00 | Broadcast Announcers and Radio Disc Jockeys | 79 | 77 | -2 | time weighted 79, observed use 65, rated potential 89, ability based 69, ilo tasks 87, market 30, frey osborne 29 | sources partly agree |
| 27-3023.00 | News Analysts, Reporters, and Journalists | 92 | 87 | -5 | time weighted 88, observed use 78, rated potential 93, ability based –, ilo tasks 93, market 75, frey osborne 27 | sources agree |
| 27-3031.00 | Public Relations Specialists | 95 | 92 | -3 | time weighted 94, observed use 97, rated potential 95, ability based 87, ilo tasks 84, market 95, frey osborne 33 | sources agree |
| 27-3041.00 | Editors | 90 | 93 | +3 | time weighted 94, observed use 85, rated potential 95, ability based 80, ilo tasks 93, market 82, frey osborne 23 | sources agree |
| 27-3042.00 | Technical Writers | 96 | 95 | -1 | time weighted 92, observed use 98, rated potential 96, ability based 82, ilo tasks 93, market 98, frey osborne 77 | sources agree |
| 27-3043.00 | Writers and Authors | 90 | 96 | +6 | time weighted 97, observed use 87, rated potential 99, ability based 74, ilo tasks 94, market 95, frey osborne 21 | sources agree |
| 27-3043.05 | Poets, Lyricists and Creative Writers | 91 | 99 | +8 | time weighted 100, observed use 85, rated potential 99, ability based 74, ilo tasks 93, market 93, frey osborne 21 | sources agree |
| 27-3091.00 | Interpreters and Translators | 95 | 99 | +4 | time weighted 98, observed use 97, rated potential 99, ability based 79, ilo tasks 98, market 99, frey osborne 42 | sources agree |
| 27-3092.00 | Court Reporters and Simultaneous Captioners | 99 | 94 | -5 | time weighted 94, observed use 92, rated potential 94, ability based –, ilo tasks 93, market 96, frey osborne 47 | sources agree |
| 27-3099.00 | Media and Communication Workers, All Other | 95 | 99 | +4 | time weighted 98, observed use 97, rated potential 99, ability based 79, ilo tasks 87, market 99, frey osborne 59 | sources agree |
| 27-4011.00 | Audio and Video Technicians | 52 | 46 | -6 | time weighted 38, observed use 51, rated potential 54, ability based 48, ilo tasks 63, market 61, frey osborne 49 | sources agree |
| 27-4012.00 | Broadcast Technicians | 61 | 54 | -7 | time weighted 49, observed use 52, rated potential 56, ability based 52, ilo tasks 63, market 61, frey osborne 61 | sources agree |
| 27-4014.00 | Sound Engineering Technicians | 55 | 40 | -15 | time weighted 41, observed use 25, rated potential 53, ability based 60, ilo tasks 63, market 30, frey osborne 30 | sources agree |
| 27-4015.00 | Lighting Technicians | 10 | 20 | +11 | time weighted 23, observed use 24, rated potential 25, ability based –, ilo tasks –, market 30, frey osborne – | sources agree |
| 27-4021.00 | Photographers | 58 | 51 | -6 | time weighted 50, observed use 83, rated potential 50, ability based 45, ilo tasks 77, market 30, frey osborne 14 | sources partly agree |
| 27-4031.00 | Camera Operators, Television, Video, and Film | 56 | 41 | -15 | time weighted 34, observed use 81, rated potential 48, ability based 37, ilo tasks 63, market 30, frey osborne 51 | sources partly agree |
| 27-4032.00 | Film and Video Editors | 83 | 69 | -13 | time weighted 67, observed use 86, rated potential 77, ability based 73, ilo tasks 66, market 64, frey osborne 39 | sources agree |
| 27-4099.00 | Media and Communication Equipment Workers, All Other | 83 | 71 | -12 | time weighted 67, observed use 86, rated potential 77, ability based 73, ilo tasks 63, market 64, frey osborne – | sources agree |
| 29-1011.00 | Chiropractors | 50 | 42 | -8 | time weighted 46, observed use 42, rated potential 54, ability based 44, ilo tasks 27, market 70, frey osborne 16 | sources agree |
| 29-1021.00 | Dentists, General | 40 | 25 | -15 | time weighted 26, observed use 60, rated potential 37, ability based 45, ilo tasks 12, market 30, frey osborne 3 | sources partly agree |
| 29-1022.00 | Oral and Maxillofacial Surgeons | 24 | 8 | -15 | time weighted 11, observed use 25, rated potential 16, ability based 42, ilo tasks 12, market 30, frey osborne 1 | sources agree |
| 29-1023.00 | Orthodontists | 45 | 33 | -12 | time weighted 29, observed use 44, rated potential 38, ability based 53, ilo tasks 12, market 74, frey osborne 15 | sources partly agree |
| 29-1024.00 | Prosthodontists | 25 | 13 | -12 | time weighted 13, observed use 25, rated potential 18, ability based 46, ilo tasks 22, market 30, frey osborne 23 | sources agree |
| 29-1029.00 | Dentists, All Other Specialists | 40 | 28 | -12 | time weighted 26, observed use 60, rated potential 37, ability based 45, ilo tasks 12, market 30, frey osborne – | sources partly agree |
| 29-1031.00 | Dietitians and Nutritionists | 88 | 66 | -22 | time weighted 55, observed use 76, rated potential 76, ability based 91, ilo tasks 81, market 68, frey osborne 2 | sources agree |
| 29-1041.00 | Optometrists | 48 | 25 | -22 | time weighted 21, observed use 25, rated potential 29, ability based 61, ilo tasks 36, market 30, frey osborne 31 | sources agree |
| 29-1051.00 | Pharmacists | 63 | 60 | -3 | time weighted 62, observed use 72, rated potential 61, ability based 62, ilo tasks 61, market 30, frey osborne 7 | sources agree |
| 29-1071.00 | Physician Assistants | 48 | 39 | -9 | time weighted 43, observed use 44, rated potential 41, ability based 52, ilo tasks 36, market 30, frey osborne 31 | sources agree |
| 29-1071.01 | Anesthesiologist Assistants | 37 | 28 | -9 | time weighted 31, observed use 25, rated potential 27, ability based 52, ilo tasks 36, market 30, frey osborne 31 | sources agree |
| 29-1081.00 | Podiatrists | 49 | 35 | -13 | time weighted 39, observed use 25, rated potential 43, ability based 63, ilo tasks 27, market 30, frey osborne 3 | sources agree |
| 29-1122.00 | Occupational Therapists | 45 | 50 | +5 | time weighted 55, observed use 37, rated potential 57, ability based 52, ilo tasks 27, market 30, frey osborne 1 | sources agree |
| 29-1122.01 | Low Vision Therapists, Orientation and Mobility Specialists, and Vision Rehabilitation Therapists | 43 | 46 | +2 | time weighted 50, observed use 54, rated potential 45, ability based 52, ilo tasks 27, market 30, frey osborne 1 | sources agree |
| 29-1123.00 | Physical Therapists | 33 | 44 | +11 | time weighted 48, observed use 51, rated potential 44, ability based 39, ilo tasks 51, market 30, frey osborne 14 | sources agree |
| 29-1124.00 | Radiation Therapists | 39 | 35 | -4 | time weighted 38, observed use 25, rated potential 37, ability based 42, ilo tasks 33, market 30, frey osborne 40 | sources agree |
| 29-1125.00 | Recreational Therapists | 46 | 46 | -1 | time weighted 51, observed use 25, rated potential 52, ability based 55, ilo tasks 27, market 30, frey osborne 0 | sources agree |
| 29-1126.00 | Respiratory Therapists | 34 | 42 | +8 | time weighted 48, observed use 25, rated potential 35, ability based 44, ilo tasks 57, market 30, frey osborne 24 | sources agree |
| 29-1127.00 | Speech-Language Pathologists | 63 | 53 | -10 | time weighted 56, observed use 25, rated potential 63, ability based 81, ilo tasks 37, market 30, frey osborne 4 | sources partly agree |
| 29-1128.00 | Exercise Physiologists | 39 | 48 | +9 | time weighted 52, observed use 25, rated potential 48, ability based 48, ilo tasks 51, market 30, frey osborne – | sources agree |
| 29-1129.00 | Therapists, All Other | 61 | 54 | -7 | time weighted 55, observed use 56, rated potential 64, ability based –, ilo tasks 27, market 62, frey osborne – | sources agree |
| 29-1129.01 | Art Therapists | 48 | 50 | +3 | time weighted 54, observed use 56, rated potential 50, ability based –, ilo tasks 27, market 61, frey osborne – | sources agree |
| 29-1129.02 | Music Therapists | 59 | 57 | -2 | time weighted 57, observed use 56, rated potential 72, ability based –, ilo tasks 27, market 61, frey osborne – | sources partly agree |
| 29-1131.00 | Veterinarians | 50 | 34 | -16 | time weighted 37, observed use 69, rated potential 38, ability based 47, ilo tasks 10, market 30, frey osborne 21 | sources partly agree |
| 29-1141.00 | Registered Nurses | 54 | 59 | +4 | time weighted 53, observed use 69, rated potential 56, ability based 55, ilo tasks 41, market 80, frey osborne – | sources agree |
| 29-1141.01 | Acute Care Nurses | 53 | 47 | -6 | time weighted 51, observed use 59, rated potential 50, ability based 55, ilo tasks 41, market 30, frey osborne – | sources agree |
| 29-1141.02 | Advanced Practice Psychiatric Nurses | 61 | 61 | -0 | time weighted 64, observed use 65, rated potential 73, ability based 55, ilo tasks 41, market 30, frey osborne – | sources agree |
| 29-1141.03 | Critical Care Nurses | 55 | 48 | -7 | time weighted 39, observed use 68, rated potential 43, ability based 55, ilo tasks 41, market 74, frey osborne – | sources agree |
| 29-1141.04 | Clinical Nurse Specialists | 60 | 50 | -11 | time weighted 43, observed use 64, rated potential 57, ability based 55, ilo tasks 41, market 67, frey osborne – | sources agree |
| 29-1151.00 | Nurse Anesthetists | 39 | 27 | -12 | time weighted 24, observed use 25, rated potential 26, ability based 56, ilo tasks 41, market 30, frey osborne – | sources agree |
| 29-1161.00 | Nurse Midwives | 55 | 51 | -4 | time weighted 44, observed use 62, rated potential 49, ability based 54, ilo tasks 54, market 73, frey osborne – | sources agree |
| 29-1171.00 | Nurse Practitioners | 64 | 53 | -11 | time weighted 54, observed use 73, rated potential 63, ability based 54, ilo tasks 41, market 30, frey osborne – | sources agree |
| 29-1181.00 | Audiologists | 57 | 49 | -9 | time weighted 53, observed use 25, rated potential 66, ability based 63, ilo tasks 37, market 30, frey osborne 1 | sources partly agree |
| 29-1211.00 | Anesthesiologists | 37 | 28 | -9 | time weighted 30, observed use 25, rated potential 40, ability based –, ilo tasks 45, market 30, frey osborne – | sources agree |
| 29-1212.00 | Cardiologists | 40 | 58 | +18 | time weighted 47, observed use 80, rated potential 48, ability based –, ilo tasks 45, market 89, frey osborne – | sources partly agree |
| 29-1213.00 | Dermatologists | 49 | 50 | +2 | time weighted 43, observed use 48, rated potential 51, ability based –, ilo tasks 45, market 84, frey osborne – | sources partly agree |
| 29-1214.00 | Emergency Medicine Physicians | 59 | 51 | -8 | time weighted 53, observed use 65, rated potential 65, ability based –, ilo tasks 45, market 30, frey osborne – | sources agree |
| 29-1215.00 | Family Medicine Physicians | 54 | 65 | +10 | time weighted 62, observed use 54, rated potential 62, ability based –, ilo tasks 52, market 89, frey osborne – | sources agree |
| 29-1216.00 | General Internal Medicine Physicians | 66 | 62 | -5 | time weighted 50, observed use 78, rated potential 62, ability based –, ilo tasks 52, market 88, frey osborne – | sources agree |
| 29-1217.00 | Neurologists | 56 | 52 | -4 | time weighted 55, observed use 46, rated potential 64, ability based –, ilo tasks 45, market 30, frey osborne – | sources agree |
| 29-1218.00 | Obstetricians and Gynecologists | 60 | 56 | -4 | time weighted 45, observed use 77, rated potential 49, ability based –, ilo tasks 45, market 90, frey osborne – | sources partly agree |
| 29-1221.00 | Pediatricians, General | 59 | 58 | -1 | time weighted 50, observed use 50, rated potential 63, ability based –, ilo tasks 52, market 84, frey osborne – | sources agree |
| 29-1222.00 | Physicians, Pathologists | 74 | 63 | -12 | time weighted 57, observed use 83, rated potential 61, ability based –, ilo tasks 46, market 71, frey osborne – | sources agree |
| 29-1223.00 | Psychiatrists | 58 | 68 | +10 | time weighted 68, observed use 52, rated potential 74, ability based –, ilo tasks 45, market 88, frey osborne – | sources partly agree |
| 29-1224.00 | Radiologists | 80 | 77 | -3 | time weighted 72, observed use 91, rated potential 79, ability based –, ilo tasks 45, market 91, frey osborne – | sources partly agree |
| 29-1229.00 | Physicians, All Other | 57 | 55 | -2 | time weighted 45, observed use 62, rated potential 58, ability based –, ilo tasks 53, market 71, frey osborne – | sources agree |
| 29-1229.01 | Allergists and Immunologists | 58 | 62 | +3 | time weighted 54, observed use 73, rated potential 63, ability based –, ilo tasks 45, market 83, frey osborne – | sources agree |
| 29-1229.02 | Hospitalists | 74 | 42 | -32 | time weighted 40, observed use 41, rated potential 69, ability based –, ilo tasks 52, market 30, frey osborne – | sources agree |
| 29-1229.03 | Urologists | 51 | 49 | -1 | time weighted 37, observed use 67, rated potential 50, ability based –, ilo tasks 45, market 86, frey osborne – | sources partly agree |
| 29-1229.04 | Physical Medicine and Rehabilitation Physicians | 43 | 36 | -7 | time weighted 38, observed use 41, rated potential 37, ability based –, ilo tasks 45, market 30, frey osborne – | sources agree |
| 29-1229.05 | Preventive Medicine Physicians | 61 | 48 | -12 | time weighted 52, observed use 41, rated potential 63, ability based –, ilo tasks 53, market 30, frey osborne – | sources agree |
| 29-1229.06 | Sports Medicine Physicians | 53 | 49 | -4 | time weighted 52, observed use 41, rated potential 61, ability based –, ilo tasks 45, market 30, frey osborne – | sources agree |
| 29-1241.00 | Ophthalmologists, Except Pediatric | 53 | 44 | -9 | time weighted 33, observed use 44, rated potential 54, ability based –, ilo tasks 45, market 77, frey osborne – | sources agree |
| 29-1242.00 | Orthopedic Surgeons, Except Pediatric | 45 | 30 | -14 | time weighted 34, observed use 25, rated potential 42, ability based –, ilo tasks 45, market 30, frey osborne – | sources agree |
| 29-1243.00 | Pediatric Surgeons | 47 | 35 | -12 | time weighted 38, observed use 25, rated potential 43, ability based –, ilo tasks 45, market 30, frey osborne – | sources agree |
| 29-1249.00 | Surgeons, All Other | 53 | 44 | -9 | time weighted 33, observed use 44, rated potential 54, ability based –, ilo tasks 45, market 77, frey osborne – | sources agree |
| 29-1291.00 | Acupuncturists | 31 | 37 | +6 | time weighted 37, observed use 42, rated potential 40, ability based –, ilo tasks 61, market 30, frey osborne 14 | sources agree |
| 29-1292.00 | Dental Hygienists | 32 | 37 | +5 | time weighted 36, observed use 43, rated potential 27, ability based –, ilo tasks 15, market 76, frey osborne 57 | sources partly agree |
| 29-1299.00 | Healthcare Diagnosing or Treating Practitioners, All Other | 55 | 48 | -8 | time weighted 49, observed use 56, rated potential 62, ability based –, ilo tasks 35, market 66, frey osborne 14 | sources agree |
| 29-1299.01 | Naturopathic Physicians | 59 | 55 | -3 | time weighted 59, observed use 39, rated potential 56, ability based –, ilo tasks 41, market 30, frey osborne 14 | sources agree |
| 29-1299.02 | Orthoptists | 68 | 47 | -21 | time weighted 38, observed use 62, rated potential 70, ability based –, ilo tasks 35, market 74, frey osborne 14 | sources partly agree |
| 29-2011.00 | Medical and Clinical Laboratory Technologists | 38 | 61 | +23 | time weighted 55, observed use 81, rated potential 36, ability based 56, ilo tasks 58, market 73, frey osborne 79 | sources agree |
| 29-2011.01 | Cytogenetic Technologists | 55 | 51 | -4 | time weighted 52, observed use 49, rated potential 54, ability based 56, ilo tasks 58, market 30, frey osborne 79 | sources agree |
| 29-2011.02 | Cytotechnologists | 54 | 53 | -2 | time weighted 47, observed use 92, rated potential 45, ability based 56, ilo tasks 58, market 30, frey osborne 79 | sources partly agree |
| 29-2011.04 | Histotechnologists | 42 | 36 | -6 | time weighted 28, observed use 53, rated potential 28, ability based 56, ilo tasks 58, market 30, frey osborne 79 | sources agree |
| 29-2012.00 | Medical and Clinical Laboratory Technicians | 30 | 47 | +17 | time weighted 43, observed use 61, rated potential 29, ability based 46, ilo tasks 58, market 72, frey osborne 46 | sources agree |
| 29-2012.01 | Histology Technicians | 22 | 20 | -2 | time weighted 9, observed use 24, rated potential 14, ability based 46, ilo tasks 58, market 30, frey osborne 46 | sources partly agree |
| 29-2031.00 | Cardiovascular Technologists and Technicians | 45 | 47 | +1 | time weighted 40, observed use 48, rated potential 44, ability based 47, ilo tasks 57, market 81, frey osborne 34 | sources agree |
| 29-2032.00 | Diagnostic Medical Sonographers | 39 | 36 | -3 | time weighted 39, observed use 25, rated potential 44, ability based 41, ilo tasks 33, market 30, frey osborne 41 | sources agree |
| 29-2033.00 | Nuclear Medicine Technologists | 50 | 46 | -4 | time weighted 42, observed use 66, rated potential 44, ability based 51, ilo tasks 33, market 76, frey osborne 30 | sources agree |
| 29-2034.00 | Radiologic Technologists and Technicians | 39 | 38 | -1 | time weighted 40, observed use 37, rated potential 51, ability based 33, ilo tasks 33, market 30, frey osborne – | sources agree |
| 29-2035.00 | Magnetic Resonance Imaging Technologists | 47 | 45 | -2 | time weighted 40, observed use 63, rated potential 44, ability based 48, ilo tasks 33, market 72, frey osborne – | sources agree |
| 29-2036.00 | Medical Dosimetrists | 60 | 40 | -20 | time weighted 43, observed use 24, rated potential 60, ability based –, ilo tasks 57, market 30, frey osborne – | sources agree |
| 29-2042.00 | Emergency Medical Technicians | 33 | 29 | -3 | time weighted 33, observed use 25, rated potential 35, ability based –, ilo tasks 32, market 30, frey osborne 23 | sources agree |
| 29-2043.00 | Paramedics | 29 | 32 | +3 | time weighted 36, observed use 25, rated potential 35, ability based –, ilo tasks 32, market 30, frey osborne 23 | sources agree |
| 29-2051.00 | Dietetic Technicians | 73 | 52 | -21 | time weighted 48, observed use 88, rated potential 74, ability based 46, ilo tasks 57, market 30, frey osborne 30 | sources partly agree |
| 29-2052.00 | Pharmacy Technicians | 57 | 73 | +16 | time weighted 74, observed use 71, rated potential 67, ability based 49, ilo tasks 55, market 78, frey osborne 83 | sources agree |
| 29-2053.00 | Psychiatric Technicians | 30 | 36 | +6 | time weighted 39, observed use 25, rated potential 39, ability based 42, ilo tasks 57, market 30, frey osborne 22 | sources agree |
| 29-2055.00 | Surgical Technologists | 23 | 23 | -0 | time weighted 24, observed use 25, rated potential 10, ability based 35, ilo tasks 57, market 30, frey osborne 40 | sources agree |
| 29-2056.00 | Veterinary Technologists and Technicians | 31 | 27 | -4 | time weighted 30, observed use 25, rated potential 29, ability based 39, ilo tasks 10, market 30, frey osborne 17 | sources agree |
| 29-2057.00 | Ophthalmic Medical Technicians | 46 | 43 | -3 | time weighted 31, observed use 48, rated potential 38, ability based 51, ilo tasks 62, market 83, frey osborne – | sources partly agree |
| 29-2061.00 | Licensed Practical and Licensed Vocational Nurses | 33 | 46 | +13 | time weighted 52, observed use 25, rated potential 42, ability based 35, ilo tasks 33, market 30, frey osborne 24 | sources agree |
| 29-2072.00 | Medical Records Specialists | 98 | 96 | -3 | time weighted 93, observed use 99, rated potential 86, ability based –, ilo tasks 92, market 100, frey osborne 81 | sources agree |
| 29-2081.00 | Opticians, Dispensing | 44 | 51 | +8 | time weighted 55, observed use 25, rated potential 45, ability based 52, ilo tasks 38, market 30, frey osborne 58 | sources agree |
| 29-2091.00 | Orthotists and Prosthetists | 42 | 34 | -8 | time weighted 37, observed use 25, rated potential 37, ability based 50, ilo tasks 22, market 30, frey osborne 1 | sources agree |
| 29-2092.00 | Hearing Aid Specialists | 43 | 33 | -10 | time weighted 25, observed use 40, rated potential 23, ability based 62, ilo tasks 22, market 70, frey osborne – | sources partly agree |
| 29-2099.00 | Health Technologists and Technicians, All Other | 50 | 54 | +4 | time weighted 52, observed use 66, rated potential 57, ability based 40, ilo tasks 57, market 69, frey osborne 29 | sources agree |
| 29-2099.01 | Neurodiagnostic Technologists | 47 | 38 | -9 | time weighted 39, observed use 43, rated potential 42, ability based 40, ilo tasks 57, market 30, frey osborne 29 | sources agree |
| 29-2099.05 | Ophthalmic Medical Technologists | 48 | 40 | -8 | time weighted 29, observed use 63, rated potential 38, ability based 40, ilo tasks 57, market 78, frey osborne 29 | sources partly agree |
| 29-2099.08 | Patient Representatives | 60 | 83 | +22 | time weighted 86, observed use 72, rated potential 87, ability based 40, ilo tasks 57, market 68, frey osborne 29 | sources partly agree |
| 29-9021.00 | Health Information Technologists and Medical Registrars | 96 | 93 | -3 | time weighted 91, observed use 91, rated potential 86, ability based –, ilo tasks 92, market 97, frey osborne 81 | sources agree |
| 29-9091.00 | Athletic Trainers | 44 | 45 | +1 | time weighted 42, observed use 67, rated potential 51, ability based 39, ilo tasks 39, market 79, frey osborne 5 | sources partly agree |
| 29-9092.00 | Genetic Counselors | 79 | 75 | -4 | time weighted 75, observed use 61, rated potential 84, ability based 100, ilo tasks 27, market 81, frey osborne – | sources partly agree |
| 29-9093.00 | Surgical Assistants | 17 | 15 | -2 | time weighted 12, observed use 25, rated potential 9, ability based –, ilo tasks 57, market 30, frey osborne – | sources partly agree |
| 29-9099.00 | Healthcare Practitioners and Technical Workers, All Other | 52 | 41 | -10 | time weighted 45, observed use 25, rated potential 50, ability based 56, ilo tasks 37, market 30, frey osborne – | sources agree |
| 29-9099.01 | Midwives | 50 | 41 | -9 | time weighted 45, observed use 25, rated potential 49, ability based 56, ilo tasks 28, market 30, frey osborne – | sources agree |
| 31-1121.00 | Home Health Aides | 0 | 19 | +19 | time weighted 22, observed use 24, rated potential 15, ability based –, ilo tasks 40, market 30, frey osborne 43 | sources agree |
| 31-1122.00 | Personal Care Aides | 20 | 38 | +19 | time weighted 31, observed use 50, rated potential 39, ability based –, ilo tasks 37, market 62, frey osborne 61 | sources agree |
| 31-1131.00 | Nursing Assistants | 24 | 31 | +7 | time weighted 36, observed use 25, rated potential 24, ability based –, ilo tasks 10, market 30, frey osborne – | sources agree |
| 31-1132.00 | Orderlies | 15 | 7 | -8 | time weighted 10, observed use 25, rated potential 7, ability based –, ilo tasks 12, market 30, frey osborne – | sources agree |
| 31-1133.00 | Psychiatric Aides | 26 | 33 | +6 | time weighted 37, observed use 25, rated potential 27, ability based –, ilo tasks 10, market 30, frey osborne 46 | sources agree |
| 31-2011.00 | Occupational Therapy Assistants | 37 | 41 | +4 | time weighted 44, observed use 25, rated potential 40, ability based 40, ilo tasks 57, market 30, frey osborne 17 | sources agree |
| 31-2012.00 | Occupational Therapy Aides | 36 | 39 | +3 | time weighted 41, observed use 64, rated potential 29, ability based 26, ilo tasks 12, market 72, frey osborne 38 | sources partly agree |
| 31-2021.00 | Physical Therapist Assistants | 28 | 34 | +6 | time weighted 38, observed use 25, rated potential 28, ability based 34, ilo tasks 17, market 30, frey osborne 13 | sources agree |
| 31-2022.00 | Physical Therapist Aides | 23 | 31 | +8 | time weighted 34, observed use 38, rated potential 32, ability based 22, ilo tasks 12, market 65, frey osborne 52 | sources partly agree |
| 31-9011.00 | Massage Therapists | 8 | 25 | +17 | time weighted 28, observed use 25, rated potential 24, ability based 7, ilo tasks 17, market 30, frey osborne 48 | sources agree |
| 31-9091.00 | Dental Assistants | 34 | 37 | +3 | time weighted 42, observed use 25, rated potential 32, ability based 34, ilo tasks 15, market 30, frey osborne 47 | sources agree |
| 31-9092.00 | Medical Assistants | 53 | 56 | +3 | time weighted 56, observed use 60, rated potential 42, ability based 53, ilo tasks 62, market 68, frey osborne 39 | sources agree |
| 31-9093.00 | Medical Equipment Preparers | 22 | 16 | -6 | time weighted 20, observed use 25, rated potential 14, ability based 27, ilo tasks 12, market 30, frey osborne 64 | sources agree |
| 31-9094.00 | Medical Transcriptionists | 96 | 94 | -1 | time weighted 95, observed use 99, rated potential 73, ability based 79, ilo tasks 92, market 100, frey osborne 77 | sources agree |
| 31-9095.00 | Pharmacy Aides | 47 | 67 | +20 | time weighted 71, observed use 57, rated potential 41, ability based 46, ilo tasks 12, market 73, frey osborne 59 | sources partly agree |
| 31-9096.00 | Veterinary Assistants and Laboratory Animal Caretakers | 28 | 34 | +6 | time weighted 32, observed use 53, rated potential 32, ability based 26, ilo tasks 9, market 65, frey osborne 73 | sources partly agree |
| 31-9097.00 | Phlebotomists | 32 | 30 | -2 | time weighted 34, observed use 25, rated potential 28, ability based 41, ilo tasks 12, market 30, frey osborne – | sources agree |
| 31-9099.00 | Healthcare Support Workers, All Other | 51 | 40 | -11 | time weighted 39, observed use 37, rated potential 38, ability based 53, ilo tasks 36, market 60, frey osborne – | sources agree |
| 31-9099.01 | Speech-Language Pathology Assistants | 64 | 57 | -6 | time weighted 61, observed use 25, rated potential 63, ability based 53, ilo tasks 36, market 30, frey osborne – | sources partly agree |
| 31-9099.02 | Endoscopy Technicians | 34 | 26 | -8 | time weighted 10, observed use 37, rated potential 10, ability based 53, ilo tasks 36, market 61, frey osborne – | sources partly agree |
| 33-1011.00 | First-Line Supervisors of Correctional Officers | 38 | 49 | +11 | time weighted 53, observed use 67, rated potential 44, ability based 33, ilo tasks 9, market 83, frey osborne 16 | sources partly agree |
| 33-1012.00 | First-Line Supervisors of Police and Detectives | 41 | 58 | +17 | time weighted 63, observed use 25, rated potential 53, ability based 43, ilo tasks 36, market 30, frey osborne 3 | sources agree |
| 33-1021.00 | First-Line Supervisors of Firefighting and Prevention Workers | 40 | 54 | +13 | time weighted 56, observed use 47, rated potential 58, ability based 32, ilo tasks 39, market 79, frey osborne 1 | sources partly agree |
| 33-1091.00 | First-Line Supervisors of Security Workers | 52 | 44 | -7 | time weighted 49, observed use 24, rated potential 51, ability based –, ilo tasks 29, market 30, frey osborne – | sources agree |
| 33-1099.00 | First-Line Supervisors of Protective Service Workers, All Other | 52 | 44 | -7 | time weighted 49, observed use 24, rated potential 51, ability based –, ilo tasks 29, market 30, frey osborne – | sources agree |
| 33-2011.00 | Firefighters | 13 | 29 | +15 | time weighted 34, observed use 25, rated potential 25, ability based 8, ilo tasks 24, market 30, frey osborne 32 | sources agree |
| 33-2021.00 | Fire Inspectors and Investigators | 43 | 46 | +4 | time weighted 50, observed use 25, rated potential 53, ability based 50, ilo tasks 44, market 30, frey osborne 46 | sources agree |
| 33-2022.00 | Forest Fire Inspectors and Prevention Specialists | 35 | 53 | +19 | time weighted 57, observed use 25, rated potential 48, ability based 42, ilo tasks 42, market 30, frey osborne 23 | sources agree |
| 33-3011.00 | Bailiffs | 20 | 29 | +8 | time weighted 23, observed use 25, rated potential 21, ability based 35, ilo tasks 78, market 30, frey osborne 41 | sources partly agree |
| 33-3012.00 | Correctional Officers and Jailers | 27 | 34 | +8 | time weighted 38, observed use 25, rated potential 41, ability based 21, ilo tasks 9, market 30, frey osborne 51 | sources agree |
| 33-3021.00 | Detectives and Criminal Investigators | 50 | 59 | +8 | time weighted 58, observed use 62, rated potential 53, ability based 55, ilo tasks 36, market 78, frey osborne 40 | sources agree |
| 33-3021.02 | Police Identification and Records Officers | 52 | 41 | -11 | time weighted 44, observed use 42, rated potential 54, ability based 55, ilo tasks 36, market 30, frey osborne 40 | sources agree |
| 33-3021.06 | Intelligence Analysts | 64 | 74 | +11 | time weighted 77, observed use 64, rated potential 75, ability based 55, ilo tasks 36, market 71, frey osborne 40 | sources agree |
| 33-3031.00 | Fish and Game Wardens | 36 | 38 | +2 | time weighted 42, observed use 25, rated potential 37, ability based 36, ilo tasks 28, market 30, frey osborne 26 | sources agree |
| 33-3041.00 | Parking Enforcement Workers | 35 | 41 | +6 | time weighted 46, observed use 25, rated potential 52, ability based 31, ilo tasks 28, market 30, frey osborne 70 | sources agree |
| 33-3051.00 | Police and Sheriff's Patrol Officers | 42 | 44 | +2 | time weighted 45, observed use 78, rated potential 42, ability based 30, ilo tasks 9, market 87, frey osborne 28 | sources disagree |
| 33-3051.04 | Customs and Border Protection Officers | 55 | 58 | +3 | time weighted 60, observed use 83, rated potential 62, ability based 30, ilo tasks 59, market 30, frey osborne 28 | sources partly agree |
| 33-3052.00 | Transit and Railroad Police | 29 | 40 | +11 | time weighted 41, observed use 47, rated potential 54, ability based 25, ilo tasks 9, market 81, frey osborne 50 | sources partly agree |
| 33-9011.00 | Animal Control Workers | 38 | 37 | -1 | time weighted 41, observed use 25, rated potential 40, ability based 32, ilo tasks 28, market 30, frey osborne 33 | sources agree |
| 33-9021.00 | Private Detectives and Investigators | 55 | 61 | +6 | time weighted 65, observed use 25, rated potential 65, ability based 66, ilo tasks 78, market 30, frey osborne 39 | sources partly agree |
| 33-9031.00 | Gambling Surveillance Officers and Gambling Investigators | 57 | 47 | -10 | time weighted 47, observed use 25, rated potential 55, ability based 66, ilo tasks 59, market 30, frey osborne 89 | sources agree |
| 33-9032.00 | Security Guards | 31 | 29 | -2 | time weighted 32, observed use 25, rated potential 36, ability based 37, ilo tasks 30, market 30, frey osborne 70 | sources agree |
| 33-9091.00 | Crossing Guards and Flaggers | 25 | 22 | -3 | time weighted 24, observed use 25, rated potential 32, ability based 33, ilo tasks 28, market 30, frey osborne 47 | sources agree |
| 33-9092.00 | Lifeguards, Ski Patrol, and Other Recreational Protective Service Workers | 24 | 24 | -0 | time weighted 25, observed use 25, rated potential 33, ability based 36, ilo tasks 28, market 30, frey osborne 56 | sources agree |
| 33-9093.00 | Transportation Security Screeners | 34 | 30 | -4 | time weighted 28, observed use 25, rated potential 39, ability based 35, ilo tasks 59, market 30, frey osborne – | sources agree |
| 33-9094.00 | School Bus Monitors | 12 | 54 | +42 | time weighted 60, observed use 24, rated potential 29, ability based –, ilo tasks 28, market 30, frey osborne – | sources agree |
| 33-9099.00 | Protective Service Workers, All Other | 57 | 49 | -8 | time weighted 44, observed use 68, rated potential 53, ability based 51, ilo tasks 28, market 71, frey osborne – | sources agree |
| 33-9099.02 | Retail Loss Prevention Specialists | 54 | 49 | -5 | time weighted 44, observed use 68, rated potential 54, ability based 51, ilo tasks 28, market 71, frey osborne – | sources agree |
| 35-1011.00 | Chefs and Head Cooks | 37 | 37 | -0 | time weighted 36, observed use 38, rated potential 38, ability based 41, ilo tasks 40, market 62, frey osborne 29 | sources agree |
| 35-1012.00 | First-Line Supervisors of Food Preparation and Serving Workers | 61 | 48 | -13 | time weighted 41, observed use 66, rated potential 58, ability based 42, ilo tasks 34, market 76, frey osborne 54 | sources agree |
| 35-2011.00 | Cooks, Fast Food | 16 | 9 | -6 | time weighted 5, observed use 25, rated potential 5, ability based 28, ilo tasks 23, market 30, frey osborne 67 | sources agree |
| 35-2012.00 | Cooks, Institution and Cafeteria | 24 | 16 | -8 | time weighted 16, observed use 25, rated potential 19, ability based 31, ilo tasks 24, market 30, frey osborne 69 | sources agree |
| 35-2013.00 | Cooks, Private Household | 28 | 27 | -1 | time weighted 30, observed use 25, rated potential 38, ability based 25, ilo tasks 24, market 30, frey osborne 39 | sources agree |
| 35-2014.00 | Cooks, Restaurant | 22 | 23 | +2 | time weighted 15, observed use 51, rated potential 20, ability based 27, ilo tasks 24, market 30, frey osborne 91 | sources agree |
| 35-2015.00 | Cooks, Short Order | 18 | 13 | -5 | time weighted 11, observed use 25, rated potential 3, ability based 32, ilo tasks 26, market 30, frey osborne 87 | sources agree |
| 35-2019.00 | Cooks, All Other | 16 | 5 | -11 | time weighted 5, observed use 25, rated potential 5, ability based 28, ilo tasks 24, market 30, frey osborne – | sources agree |
| 35-2021.00 | Food Preparation Workers | 7 | 10 | +3 | time weighted 14, observed use 25, rated potential 11, ability based 10, ilo tasks 7, market 30, frey osborne 74 | sources agree |
| 35-3011.00 | Bartenders | 29 | 25 | -4 | time weighted 24, observed use 25, rated potential 27, ability based 31, ilo tasks 43, market 30, frey osborne 63 | sources agree |
| 35-3023.00 | Fast Food and Counter Workers | 20 | 23 | +3 | time weighted 22, observed use 25, rated potential 17, ability based –, ilo tasks 37, market 30, frey osborne 87 | sources agree |
| 35-3023.01 | Baristas | 27 | 23 | -3 | time weighted 17, observed use 25, rated potential 23, ability based –, ilo tasks 37, market 30, frey osborne 87 | sources agree |
| 35-3031.00 | Waiters and Waitresses | 22 | 33 | +10 | time weighted 36, observed use 25, rated potential 34, ability based 20, ilo tasks 49, market 30, frey osborne 87 | sources agree |
| 35-3041.00 | Food Servers, Nonrestaurant | 23 | 21 | -2 | time weighted 14, observed use 25, rated potential 22, ability based 28, ilo tasks 49, market 30, frey osborne 73 | sources agree |
| 35-9011.00 | Dining Room and Cafeteria Attendants and Bartender Helpers | 1 | 6 | +5 | time weighted 7, observed use 25, rated potential 3, ability based 1, ilo tasks 26, market 30, frey osborne 81 | sources agree |
| 35-9021.00 | Dishwashers | 2 | 1 | -1 | time weighted 2, observed use 25, rated potential 3, ability based 3, ilo tasks 7, market 30, frey osborne 63 | sources agree |
| 35-9031.00 | Hosts and Hostesses, Restaurant, Lounge, and Coffee Shop | 46 | 48 | +2 | time weighted 39, observed use 69, rated potential 41, ability based 48, ilo tasks 32, market 75, frey osborne 94 | sources partly agree |
| 35-9099.00 | Food Preparation and Serving Related Workers, All Other | 2 | 1 | -1 | time weighted 2, observed use 25, rated potential 3, ability based 3, ilo tasks 7, market 30, frey osborne – | sources agree |
| 37-1011.00 | First-Line Supervisors of Housekeeping and Janitorial Workers | 38 | 43 | +4 | time weighted 41, observed use 59, rated potential 39, ability based 32, ilo tasks 32, market 63, frey osborne 87 | sources agree |
| 37-1012.00 | First-Line Supervisors of Landscaping, Lawn Service, and Groundskeeping Workers | 50 | 45 | -5 | time weighted 44, observed use 74, rated potential 44, ability based 33, ilo tasks 25, market 66, frey osborne 50 | sources partly agree |
| 37-2011.00 | Janitors and Cleaners, Except Maids and Housekeeping Cleaners | 3 | 4 | +1 | time weighted 3, observed use 25, rated potential 6, ability based 6, ilo tasks 28, market 30, frey osborne 56 | sources agree |
| 37-2012.00 | Maids and Housekeeping Cleaners | 3 | 4 | +1 | time weighted 7, observed use 25, rated potential 7, ability based 6, ilo tasks 8, market 30, frey osborne 57 | sources agree |
| 37-2019.00 | Building Cleaning Workers, All Other | 3 | 2 | -2 | time weighted 3, observed use 25, rated potential 6, ability based 6, ilo tasks 2, market 30, frey osborne – | sources agree |
| 37-2021.00 | Pest Control Workers | 35 | 34 | -0 | time weighted 37, observed use 66, rated potential 37, ability based 28, ilo tasks 8, market 30, frey osborne 56 | sources partly agree |
| 37-3011.00 | Landscaping and Groundskeeping Workers | 2 | 4 | +2 | time weighted 4, observed use 25, rated potential 7, ability based 1, ilo tasks 4, market 30, frey osborne 89 | sources agree |
| 37-3012.00 | Pesticide Handlers, Sprayers, and Applicators, Vegetation | 15 | 27 | +12 | time weighted 30, observed use 25, rated potential 12, ability based 22, ilo tasks 8, market 30, frey osborne 94 | sources agree |
| 37-3013.00 | Tree Trimmers and Pruners | 5 | 5 | +0 | time weighted 6, observed use 25, rated potential 12, ability based 3, ilo tasks 25, market 30, frey osborne 63 | sources agree |
| 37-3019.00 | Grounds Maintenance Workers, All Other | 2 | 3 | +1 | time weighted 4, observed use 25, rated potential 7, ability based 1, ilo tasks 3, market 30, frey osborne – | sources agree |
| 39-1013.00 | First-Line Supervisors of Gambling Services Workers | 53 | 45 | -8 | time weighted 45, observed use 25, rated potential 58, ability based –, ilo tasks 85, market 30, frey osborne 44 | sources partly agree |
| 39-1014.00 | First-Line Supervisors of Entertainment and Recreation Workers, Except Gambling Services | 55 | 65 | +10 | time weighted 68, observed use 61, rated potential 53, ability based –, ilo tasks 39, market 67, frey osborne 25 | sources agree |
| 39-1022.00 | First-Line Supervisors of Personal Service Workers | 57 | 58 | +1 | time weighted 59, observed use 62, rated potential 56, ability based –, ilo tasks 34, market 69, frey osborne 25 | sources agree |
| 39-2011.00 | Animal Trainers | 18 | 19 | +1 | time weighted 23, observed use 25, rated potential 23, ability based 21, ilo tasks 9, market 30, frey osborne 29 | sources agree |
| 39-2021.00 | Animal Caretakers | 28 | 28 | +0 | time weighted 32, observed use 25, rated potential 36, ability based 21, ilo tasks 9, market 30, frey osborne 68 | sources agree |
| 39-3011.00 | Gambling Dealers | 34 | 36 | +2 | time weighted 28, observed use 25, rated potential 25, ability based 50, ilo tasks 85, market 30, frey osborne 91 | sources partly agree |
| 39-3012.00 | Gambling and Sports Book Writers and Runners | 46 | 58 | +12 | time weighted 59, observed use 25, rated potential 45, ability based 59, ilo tasks 85, market 30, frey osborne 81 | sources partly agree |
| 39-3019.00 | Gambling Service Workers, All Other | 34 | 34 | +0 | time weighted 28, observed use 25, rated potential 25, ability based 50, ilo tasks 85, market 30, frey osborne – | sources partly agree |
| 39-3021.00 | Motion Picture Projectionists | 32 | 31 | -0 | time weighted 28, observed use 25, rated potential 28, ability based 38, ilo tasks 53, market 30, frey osborne 94 | sources agree |
| 39-3031.00 | Ushers, Lobby Attendants, and Ticket Takers | 31 | 39 | +8 | time weighted 42, observed use 25, rated potential 30, ability based 42, ilo tasks 53, market 30, frey osborne 91 | sources agree |
| 39-3091.00 | Amusement and Recreation Attendants | 38 | 47 | +9 | time weighted 51, observed use 66, rated potential 43, ability based 34, ilo tasks 53, market 30, frey osborne 59 | sources agree |
| 39-3092.00 | Costume Attendants | 35 | 32 | -3 | time weighted 35, observed use 25, rated potential 39, ability based 36, ilo tasks –, market 30, frey osborne 52 | sources agree |
| 39-3093.00 | Locker Room, Coatroom, and Dressing Room Attendants | 25 | 30 | +5 | time weighted 33, observed use 25, rated potential 23, ability based 39, ilo tasks 54, market 30, frey osborne 45 | sources agree |
| 39-3099.00 | Entertainment Attendants and Related Workers, All Other | 35 | 31 | -4 | time weighted 35, observed use 25, rated potential 39, ability based 36, ilo tasks –, market 30, frey osborne – | sources agree |
| 39-4011.00 | Embalmers | 17 | 20 | +3 | time weighted 24, observed use 25, rated potential 11, ability based 27, ilo tasks 16, market 30, frey osborne 48 | sources agree |
| 39-4012.00 | Crematory Operators | 0 | 18 | +18 | time weighted 22, observed use 24, rated potential 18, ability based –, ilo tasks 28, market 30, frey osborne – | sources agree |
| 39-4021.00 | Funeral Attendants | 29 | 32 | +4 | time weighted 32, observed use 41, rated potential 35, ability based 33, ilo tasks 16, market 69, frey osborne 42 | sources partly agree |
| 39-4031.00 | Morticians, Undertakers, and Funeral Arrangers | 33 | 31 | -2 | time weighted 35, observed use 25, rated potential 27, ability based 44, ilo tasks 16, market 30, frey osborne – | sources agree |
| 39-5011.00 | Barbers | 25 | 22 | -4 | time weighted 25, observed use 25, rated potential 22, ability based 27, ilo tasks 17, market 30, frey osborne 66 | sources agree |
| 39-5012.00 | Hairdressers, Hairstylists, and Cosmetologists | 23 | 23 | -0 | time weighted 17, observed use 56, rated potential 14, ability based 29, ilo tasks 14, market 65, frey osborne 29 | sources partly agree |
| 39-5091.00 | Makeup Artists, Theatrical and Performance | 39 | 18 | -21 | time weighted 20, observed use 25, rated potential 44, ability based 36, ilo tasks 24, market 30, frey osborne 6 | sources agree |
| 39-5092.00 | Manicurists and Pedicurists | 31 | 34 | +3 | time weighted 24, observed use 45, rated potential 17, ability based 49, ilo tasks 24, market 74, frey osborne 89 | sources partly agree |
| 39-5093.00 | Shampooers | 21 | 11 | -9 | time weighted 10, observed use 25, rated potential 17, ability based 21, ilo tasks 24, market 30, frey osborne 65 | sources agree |
| 39-5094.00 | Skincare Specialists | 33 | 20 | -13 | time weighted 22, observed use 25, rated potential 26, ability based 41, ilo tasks 24, market 30, frey osborne 39 | sources agree |
| 39-6011.00 | Baggage Porters and Bellhops | 23 | 40 | +17 | time weighted 40, observed use 71, rated potential 34, ability based 9, ilo tasks 71, market 30, frey osborne 69 | sources partly agree |
| 39-6012.00 | Concierges | 73 | 87 | +14 | time weighted 89, observed use 85, rated potential 84, ability based 69, ilo tasks 91, market 75, frey osborne 33 | sources agree |
| 39-7011.00 | Tour Guides and Escorts | 42 | 68 | +26 | time weighted 70, observed use 50, rated potential 52, ability based 58, ilo tasks 59, market 62, frey osborne 81 | sources agree |
| 39-7012.00 | Travel Guides | 55 | 64 | +9 | time weighted 67, observed use 77, rated potential 57, ability based 63, ilo tasks 59, market 30, frey osborne 23 | sources agree |
| 39-9011.00 | Childcare Workers | 31 | 37 | +7 | time weighted 36, observed use 53, rated potential 38, ability based 38, ilo tasks 26, market 65, frey osborne 27 | sources agree |
| 39-9011.01 | Nannies | 30 | 36 | +6 | time weighted 39, observed use 38, rated potential 37, ability based 38, ilo tasks 26, market 30, frey osborne 27 | sources agree |
| 39-9031.00 | Exercise Trainers and Group Fitness Instructors | 1 | 38 | +37 | time weighted 43, observed use 25, rated potential 25, ability based 0, ilo tasks 39, market 30, frey osborne 27 | sources agree |
| 39-9032.00 | Recreation Workers | 35 | 47 | +11 | time weighted 53, observed use 25, rated potential 38, ability based 42, ilo tasks 32, market 30, frey osborne 4 | sources agree |
| 39-9041.00 | Residential Advisors | 52 | 44 | -8 | time weighted 42, observed use 65, rated potential 40, ability based 60, ilo tasks 32, market 64, frey osborne 24 | sources agree |
| 39-9099.00 | Personal Care and Service Workers, All Other | 30 | 36 | +6 | time weighted 39, observed use 38, rated potential 37, ability based 38, ilo tasks 28, market 30, frey osborne – | sources agree |
| 41-1011.00 | First-Line Supervisors of Retail Sales Workers | 69 | 66 | -3 | time weighted 58, observed use 90, rated potential 66, ability based 49, ilo tasks 65, market 87, frey osborne 38 | sources agree |
| 41-1012.00 | First-Line Supervisors of Non-Retail Sales Workers | 89 | 80 | -9 | time weighted 77, observed use 86, rated potential 76, ability based 88, ilo tasks 90, market 77, frey osborne 25 | sources agree |
| 41-2011.00 | Cashiers | 44 | 67 | +23 | time weighted 63, observed use 72, rated potential 43, ability based 42, ilo tasks 79, market 81, frey osborne 94 | sources partly agree |
| 41-2012.00 | Gambling Change Persons and Booth Cashiers | 39 | 45 | +5 | time weighted 46, observed use 25, rated potential 45, ability based 48, ilo tasks 79, market 30, frey osborne 69 | sources partly agree |
| 41-2021.00 | Counter and Rental Clerks | 73 | 88 | +15 | time weighted 90, observed use 81, rated potential 90, ability based 51, ilo tasks –, market 30, frey osborne 94 | sources partly agree |
| 41-2022.00 | Parts Salespersons | 44 | 67 | +23 | time weighted 70, observed use 25, rated potential 53, ability based 47, ilo tasks 76, market 30, frey osborne 97 | sources partly agree |
| 41-2031.00 | Retail Salespersons | 62 | 75 | +13 | time weighted 74, observed use 92, rated potential 52, ability based 52, ilo tasks 76, market 80, frey osborne 83 | sources agree |
| 41-3011.00 | Advertising Sales Agents | 84 | 92 | +7 | time weighted 93, observed use 80, rated potential 91, ability based 82, ilo tasks 85, market 89, frey osborne 48 | sources agree |
| 41-3021.00 | Insurance Sales Agents | 94 | 92 | -3 | time weighted 88, observed use 91, rated potential 86, ability based 91, ilo tasks 92, market 90, frey osborne 83 | sources agree |
| 41-3031.00 | Securities, Commodities, and Financial Services Sales Agents | 94 | 89 | -5 | time weighted 89, observed use 96, rated potential 87, ability based 85, ilo tasks 99, market 83, frey osborne 12 | sources agree |
| 41-3041.00 | Travel Agents | 91 | 88 | -3 | time weighted 87, observed use 96, rated potential 85, ability based 80, ilo tasks 91, market 93, frey osborne 28 | sources agree |
| 41-3091.00 | Sales Representatives of Services, Except Advertising, Insurance, Financial Services, and Travel | 96 | 97 | +2 | time weighted 95, observed use 99, rated potential 89, ability based –, ilo tasks 90, market 99, frey osborne – | sources agree |
| 41-4011.00 | Sales Representatives, Wholesale and Manufacturing, Technical and Scientific Products | 84 | 90 | +6 | time weighted 91, observed use 94, rated potential 84, ability based 70, ilo tasks 91, market 97, frey osborne 37 | sources agree |
| 41-4011.07 | Solar Sales Representatives and Assessors | 76 | 88 | +13 | time weighted 90, observed use 78, rated potential 82, ability based 70, ilo tasks 90, market 30, frey osborne 37 | sources partly agree |
| 41-4012.00 | Sales Representatives, Wholesale and Manufacturing, Except Technical and Scientific Products | 89 | 93 | +3 | time weighted 92, observed use 100, rated potential 95, ability based 68, ilo tasks 90, market 99, frey osborne 72 | sources agree |
| 41-9011.00 | Demonstrators and Product Promoters | 43 | 74 | +31 | time weighted 76, observed use 64, rated potential 43, ability based 52, ilo tasks 82, market 69, frey osborne 47 | sources agree |
| 41-9012.00 | Models | 22 | 25 | +4 | time weighted 16, observed use 25, rated potential 47, ability based 13, ilo tasks 40, market 30, frey osborne 97 | sources agree |
| 41-9021.00 | Real Estate Brokers | 85 | 67 | -18 | time weighted 59, observed use 89, rated potential 73, ability based 82, ilo tasks 64, market 30, frey osborne 94 | sources partly agree |
| 41-9022.00 | Real Estate Sales Agents | 74 | 84 | +10 | time weighted 86, observed use 89, rated potential 65, ability based 69, ilo tasks 64, market 76, frey osborne 73 | sources agree |
| 41-9031.00 | Sales Engineers | 86 | 86 | -0 | time weighted 88, observed use 93, rated potential 81, ability based 81, ilo tasks 91, market 85, frey osborne 2 | sources agree |
| 41-9041.00 | Telemarketers | 92 | 97 | +5 | time weighted 96, observed use 94, rated potential 91, ability based 80, ilo tasks 98, market 99, frey osborne 99 | sources agree |
| 41-9091.00 | Door-to-Door Sales Workers, News and Street Vendors, and Related Workers | 63 | 69 | +6 | time weighted 62, observed use 80, rated potential 56, ability based 79, ilo tasks 61, market 83, frey osborne 87 | sources agree |
| 41-9099.00 | Sales and Related Workers, All Other | 63 | 72 | +8 | time weighted 62, observed use 80, rated potential 56, ability based 79, ilo tasks 87, market 83, frey osborne – | sources agree |
| 43-1011.00 | First-Line Supervisors of Office and Administrative Support Workers | 79 | 77 | -2 | time weighted 73, observed use 82, rated potential 78, ability based 77, ilo tasks 83, market 90, frey osborne 9 | sources agree |
| 43-2011.00 | Switchboard Operators, Including Answering Service | 90 | 94 | +4 | time weighted 93, observed use 96, rated potential 86, ability based 73, ilo tasks 93, market 98, frey osborne 91 | sources agree |
| 43-2021.00 | Telephone Operators | 77 | 94 | +17 | time weighted 96, observed use 47, rated potential 95, ability based 76, ilo tasks 93, market 80, frey osborne 94 | sources partly agree |
| 43-2099.00 | Communications Equipment Operators, All Other | 90 | 92 | +2 | time weighted 93, observed use 96, rated potential 86, ability based 73, ilo tasks 74, market 98, frey osborne 97 | sources agree |
| 43-3011.00 | Bill and Account Collectors | 94 | 87 | -7 | time weighted 80, observed use 89, rated potential 83, ability based 85, ilo tasks 83, market 84, frey osborne 89 | sources agree |
| 43-3021.00 | Billing and Posting Clerks | 94 | 95 | +1 | time weighted 91, observed use 90, rated potential 87, ability based 90, ilo tasks 100, market 98, frey osborne 91 | sources agree |
| 43-3031.00 | Bookkeeping, Accounting, and Auditing Clerks | 92 | 90 | -2 | time weighted 90, observed use 88, rated potential 78, ability based 77, ilo tasks 95, market 80, frey osborne 97 | sources agree |
| 43-3041.00 | Gambling Cage Workers | 59 | 69 | +9 | time weighted 70, observed use 65, rated potential 64, ability based 59, ilo tasks 85, market 72, frey osborne 43 | sources agree |
| 43-3051.00 | Payroll and Timekeeping Clerks | 86 | 89 | +4 | time weighted 90, observed use 64, rated potential 90, ability based 85, ilo tasks 98, market 75, frey osborne 94 | sources agree |
| 43-3061.00 | Procurement Clerks | 96 | 91 | -6 | time weighted 82, observed use 87, rated potential 84, ability based 99, ilo tasks 98, market 83, frey osborne 97 | sources agree |
| 43-3071.00 | Tellers | 65 | 77 | +12 | time weighted 78, observed use 52, rated potential 68, ability based 60, ilo tasks 97, market 62, frey osborne 97 | sources agree |
| 43-3099.00 | Financial Clerks, All Other | 96 | 89 | -7 | time weighted 82, observed use 87, rated potential 84, ability based 99, ilo tasks 95, market 83, frey osborne – | sources agree |
| 43-4011.00 | Brokerage Clerks | 89 | 97 | +7 | time weighted 95, observed use 82, rated potential 98, ability based 81, ilo tasks 99, market 93, frey osborne 97 | sources agree |
| 43-4021.00 | Correspondence Clerks | 93 | 99 | +6 | time weighted 99, observed use 92, rated potential 99, ability based 82, ilo tasks 99, market 98, frey osborne 73 | sources agree |
| 43-4031.00 | Court, Municipal, and License Clerks | 87 | 88 | +1 | time weighted 90, observed use 74, rated potential 94, ability based 82, ilo tasks 83, market 82, frey osborne 46 | sources agree |
| 43-4041.00 | Credit Authorizers, Checkers, and Clerks | 93 | 92 | -1 | time weighted 87, observed use 77, rated potential 90, ability based 98, ilo tasks 99, market 86, frey osborne 94 | sources agree |
| 43-4051.00 | Customer Service Representatives | 90 | 96 | +6 | time weighted 97, observed use 100, rated potential 94, ability based 72, ilo tasks 97, market 100, frey osborne 49 | sources agree |
| 43-4061.00 | Eligibility Interviewers, Government Programs | 85 | 91 | +7 | time weighted 93, observed use 65, rated potential 94, ability based 84, ilo tasks 86, market 74, frey osborne 58 | sources agree |
| 43-4071.00 | File Clerks | 81 | 89 | +9 | time weighted 91, observed use 81, rated potential 89, ability based 57, ilo tasks 67, market 90, frey osborne 94 | sources agree |
| 43-4081.00 | Hotel, Motel, and Resort Desk Clerks | 75 | 84 | +10 | time weighted 84, observed use 81, rated potential 72, ability based 62, ilo tasks 91, market 89, frey osborne 87 | sources agree |
| 43-4111.00 | Interviewers, Except Eligibility and Loan | 96 | 90 | -6 | time weighted 85, observed use 94, rated potential 86, ability based 87, ilo tasks 94, market 86, frey osborne 87 | sources agree |
| 43-4121.00 | Library Assistants, Clerical | 70 | 72 | +2 | time weighted 69, observed use 72, rated potential 72, ability based 55, ilo tasks 87, market 70, frey osborne 89 | sources agree |
| 43-4131.00 | Loan Interviewers and Clerks | 93 | 91 | -2 | time weighted 89, observed use 82, rated potential 86, ability based 94, ilo tasks 99, market 79, frey osborne 83 | sources agree |
| 43-4141.00 | New Accounts Clerks | 74 | 86 | +12 | time weighted 88, observed use 40, rated potential 90, ability based 82, ilo tasks 99, market 68, frey osborne 99 | sources partly agree |
| 43-4151.00 | Order Clerks | 81 | 88 | +7 | time weighted 83, observed use 76, rated potential 95, ability based 69, ilo tasks 99, market 86, frey osborne 97 | sources agree |
| 43-4161.00 | Human Resources Assistants, Except Payroll and Timekeeping | 97 | 96 | -1 | time weighted 93, observed use 96, rated potential 84, ability based 93, ilo tasks 98, market 99, frey osborne 79 | sources agree |
| 43-4171.00 | Receptionists and Information Clerks | 87 | 95 | +7 | time weighted 92, observed use 95, rated potential 87, ability based 75, ilo tasks 97, market 97, frey osborne 91 | sources agree |
| 43-4181.00 | Reservation and Transportation Ticket Agents and Travel Clerks | 68 | 89 | +21 | time weighted 91, observed use 85, rated potential 81, ability based 55, ilo tasks 94, market 76, frey osborne 52 | sources agree |
| 43-4199.00 | Information and Record Clerks, All Other | 87 | 93 | +5 | time weighted 92, observed use 95, rated potential 87, ability based 75, ilo tasks 90, market 97, frey osborne – | sources agree |
| 43-5011.00 | Cargo and Freight Agents | 73 | 69 | -3 | time weighted 70, observed use 39, rated potential 60, ability based 97, ilo tasks 97, market 30, frey osborne 99 | sources disagree |
| 43-5011.01 | Freight Forwarders | 83 | 82 | -1 | time weighted 83, observed use 61, rated potential 91, ability based 97, ilo tasks 97, market 30, frey osborne 99 | sources partly agree |
| 43-5021.00 | Couriers and Messengers | 33 | 37 | +4 | time weighted 34, observed use 58, rated potential 36, ability based 19, ilo tasks 49, market 30, frey osborne 87 | sources agree |
| 43-5031.00 | Public Safety Telecommunicators | 79 | 85 | +7 | time weighted 89, observed use 61, rated potential 94, ability based 71, ilo tasks 28, market 30, frey osborne 47 | sources disagree |
| 43-5032.00 | Dispatchers, Except Police, Fire, and Ambulance | 92 | 91 | -1 | time weighted 92, observed use 84, rated potential 96, ability based 84, ilo tasks 90, market 30, frey osborne 91 | sources partly agree |
| 43-5041.00 | Meter Readers, Utilities | 36 | 61 | +25 | time weighted 65, observed use 25, rated potential 55, ability based 18, ilo tasks 73, market 30, frey osborne 72 | sources partly agree |
| 43-5051.00 | Postal Service Clerks | 37 | 50 | +13 | time weighted 53, observed use 25, rated potential 46, ability based 34, ilo tasks 97, market 30, frey osborne 89 | sources partly agree |
| 43-5052.00 | Postal Service Mail Carriers | 22 | 41 | +19 | time weighted 45, observed use 25, rated potential 38, ability based 15, ilo tasks 81, market 30, frey osborne 57 | sources partly agree |
| 43-5053.00 | Postal Service Mail Sorters, Processors, and Processing Machine Operators | 13 | 50 | +38 | time weighted 55, observed use 25, rated potential 23, ability based 11, ilo tasks 81, market 30, frey osborne 65 | sources partly agree |
| 43-5061.00 | Production, Planning, and Expediting Clerks | 78 | 80 | +2 | time weighted 80, observed use 70, rated potential 85, ability based 65, ilo tasks 84, market 68, frey osborne 76 | sources agree |
| 43-5071.00 | Shipping, Receiving, and Inventory Clerks | 49 | 60 | +11 | time weighted 63, observed use 25, rated potential 64, ability based 27, ilo tasks 67, market 30, frey osborne 97 | sources partly agree |
| 43-5111.00 | Weighers, Measurers, Checkers, and Samplers, Recordkeeping | 40 | 58 | +18 | time weighted 60, observed use 25, rated potential 45, ability based 44, ilo tasks 67, market 30, frey osborne 89 | sources partly agree |
| 43-6011.00 | Executive Secretaries and Executive Administrative Assistants | 88 | 94 | +6 | time weighted 95, observed use 85, rated potential 96, ability based 79, ilo tasks 93, market 94, frey osborne 73 | sources agree |
| 43-6012.00 | Legal Secretaries and Administrative Assistants | 75 | 98 | +23 | time weighted 99, observed use 46, rated potential 97, ability based 76, ilo tasks 94, market 77, frey osborne 97 | sources partly agree |
| 43-6013.00 | Medical Secretaries and Administrative Assistants | 94 | 95 | +1 | time weighted 95, observed use 93, rated potential 93, ability based 84, ilo tasks 92, market 97, frey osborne 67 | sources agree |
| 43-6014.00 | Secretaries and Administrative Assistants, Except Legal, Medical, and Executive | 93 | 95 | +2 | time weighted 91, observed use 97, rated potential 91, ability based 79, ilo tasks 97, market 97, frey osborne 91 | sources agree |
| 43-9021.00 | Data Entry Keyers | 88 | 98 | +10 | time weighted 98, observed use 99, rated potential 90, ability based 57, ilo tasks 100, market 99, frey osborne 99 | sources partly agree |
| 43-9022.00 | Word Processors and Typists | 85 | 96 | +11 | time weighted 97, observed use 85, rated potential 90, ability based 63, ilo tasks 100, market 91, frey osborne 67 | sources agree |
| 43-9031.00 | Desktop Publishers | 86 | 97 | +11 | time weighted 97, observed use 98, rated potential 86, ability based 57, ilo tasks 75, market 99, frey osborne 31 | sources partly agree |
| 43-9041.00 | Insurance Claims and Policy Processing Clerks | 91 | 95 | +4 | time weighted 96, observed use 78, rated potential 92, ability based 84, ilo tasks 99, market 81, frey osborne 97 | sources agree |
| 43-9051.00 | Mail Clerks and Mail Machine Operators, Except Postal Service | 26 | 39 | +13 | time weighted 41, observed use 25, rated potential 31, ability based 25, ilo tasks 81, market 30, frey osborne 87 | sources partly agree |
| 43-9061.00 | Office Clerks, General | 90 | 94 | +4 | time weighted 91, observed use 97, rated potential 86, ability based 74, ilo tasks 98, market 98, frey osborne 91 | sources agree |
| 43-9071.00 | Office Machine Operators, Except Computer | 44 | 50 | +6 | time weighted 53, observed use 54, rated potential 45, ability based 34, ilo tasks 67, market 30, frey osborne 83 | sources agree |
| 43-9081.00 | Proofreaders and Copy Markers | 93 | 97 | +4 | time weighted 98, observed use 84, rated potential 97, ability based 87, ilo tasks 91, market 30, frey osborne 70 | sources partly agree |
| 43-9111.00 | Statistical Assistants | 99 | 100 | +0 | time weighted 100, observed use 98, rated potential 98, ability based 96, ilo tasks 96, market 99, frey osborne 56 | sources agree |
| 43-9199.00 | Office and Administrative Support Workers, All Other | 90 | 94 | +4 | time weighted 91, observed use 97, rated potential 86, ability based 74, ilo tasks 99, market 98, frey osborne – | sources agree |
| 45-1011.00 | First-Line Supervisors of Farming, Fishing, and Forestry Workers | 36 | 26 | -10 | time weighted 28, observed use 25, rated potential 37, ability based 36, ilo tasks 14, market 30, frey osborne 50 | sources agree |
| 45-2011.00 | Agricultural Inspectors | 45 | 41 | -4 | time weighted 43, observed use 25, rated potential 42, ability based 54, ilo tasks 51, market 30, frey osborne 87 | sources agree |
| 45-2021.00 | Animal Breeders | 20 | 25 | +5 | time weighted 28, observed use 25, rated potential 25, ability based 16, ilo tasks 25, market 30, frey osborne 89 | sources agree |
| 45-2041.00 | Graders and Sorters, Agricultural Products | 10 | 11 | +0 | time weighted 6, observed use 25, rated potential 14, ability based 7, ilo tasks 57, market 30, frey osborne 44 | sources partly agree |
| 45-2091.00 | Agricultural Equipment Operators | 7 | 2 | -5 | time weighted 3, observed use 25, rated potential 3, ability based 13, ilo tasks 6, market 30, frey osborne – | sources agree |
| 45-2092.00 | Farmworkers and Laborers, Crop, Nursery, and Greenhouse | 13 | 12 | -1 | time weighted 11, observed use 51, rated potential 19, ability based 4, ilo tasks 4, market 60, frey osborne – | sources partly agree |
| 45-2093.00 | Farmworkers, Farm, Ranch, and Aquacultural Animals | 11 | 15 | +4 | time weighted 18, observed use 25, rated potential 16, ability based 14, ilo tasks 4, market 30, frey osborne – | sources agree |
| 45-2099.00 | Agricultural Workers, All Other | 7 | 2 | -5 | time weighted 3, observed use 25, rated potential 3, ability based 13, ilo tasks 4, market 30, frey osborne – | sources agree |
| 45-3031.00 | Fishing and Hunting Workers | 0 | 5 | +4 | time weighted 3, observed use 24, rated potential 10, ability based –, ilo tasks 8, market 30, frey osborne 66 | sources agree |
| 45-4011.00 | Forest and Conservation Workers | 11 | 16 | +5 | time weighted 20, observed use 25, rated potential 13, ability based 15, ilo tasks 3, market 30, frey osborne 74 | sources agree |
| 45-4021.00 | Fallers | 2 | 9 | +7 | time weighted 12, observed use 25, rated potential 17, ability based 2, ilo tasks 5, market 30, frey osborne 62 | sources agree |
| 45-4022.00 | Logging Equipment Operators | 22 | 9 | -13 | time weighted 11, observed use 25, rated potential 19, ability based 17, ilo tasks 6, market 30, frey osborne 65 | sources agree |
| 45-4023.00 | Log Graders and Scalers | 32 | 26 | -6 | time weighted 29, observed use 25, rated potential 35, ability based 36, ilo tasks 5, market 30, frey osborne 94 | sources agree |
| 45-4029.00 | Logging Workers, All Other | 22 | 8 | -14 | time weighted 11, observed use 25, rated potential 19, ability based 17, ilo tasks 3, market 30, frey osborne – | sources agree |
| 47-1011.00 | First-Line Supervisors of Construction Trades and Extraction Workers | 47 | 38 | -9 | time weighted 35, observed use 61, rated potential 47, ability based 40, ilo tasks 49, market 30, frey osborne 32 | sources agree |
| 47-1011.03 | Solar Energy Installation Managers | 50 | 35 | -15 | time weighted 34, observed use 41, rated potential 51, ability based 40, ilo tasks 52, market 30, frey osborne 32 | sources agree |
| 47-2011.00 | Boilermakers | 8 | 7 | -1 | time weighted 7, observed use 25, rated potential 6, ability based 14, ilo tasks 30, market 30, frey osborne 57 | sources agree |
| 47-2021.00 | Brickmasons and Blockmasons | 3 | 4 | +1 | time weighted 6, observed use 25, rated potential 6, ability based 2, ilo tasks 0, market 30, frey osborne 68 | sources agree |
| 47-2022.00 | Stonemasons | 2 | 0 | -2 | time weighted 0, observed use 25, rated potential 3, ability based 3, ilo tasks 3, market 30, frey osborne 77 | sources agree |
| 47-2031.00 | Carpenters | 14 | 13 | -1 | time weighted 16, observed use 25, rated potential 22, ability based 8, ilo tasks 7, market 30, frey osborne 59 | sources agree |
| 47-2041.00 | Carpet Installers | 6 | 4 | -2 | time weighted 6, observed use 25, rated potential 10, ability based 5, ilo tasks 2, market 30, frey osborne 74 | sources agree |
| 47-2042.00 | Floor Layers, Except Carpet, Wood, and Hard Tiles | 5 | 1 | -3 | time weighted 2, observed use 25, rated potential 3, ability based 8, ilo tasks 2, market 30, frey osborne 65 | sources agree |
| 47-2043.00 | Floor Sanders and Finishers | 6 | 1 | -5 | time weighted 0, observed use 25, rated potential 8, ability based 3, ilo tasks 2, market 30, frey osborne 74 | sources agree |
| 47-2044.00 | Tile and Stone Setters | 11 | 10 | -2 | time weighted 13, observed use 25, rated potential 16, ability based 10, ilo tasks 2, market 30, frey osborne 61 | sources agree |
| 47-2051.00 | Cement Masons and Concrete Finishers | 1 | 2 | +0 | time weighted 2, observed use 25, rated potential 3, ability based 2, ilo tasks 3, market 30, frey osborne 87 | sources agree |
| 47-2053.00 | Terrazzo Workers and Finishers | 1 | 1 | -1 | time weighted 1, observed use 25, rated potential 5, ability based 2, ilo tasks 3, market 30, frey osborne 76 | sources agree |
| 47-2061.00 | Construction Laborers | 8 | 6 | -1 | time weighted 3, observed use 54, rated potential 9, ability based 4, ilo tasks 0, market 30, frey osborne 76 | sources partly agree |
| 47-2071.00 | Paving, Surfacing, and Tamping Equipment Operators | 6 | 4 | -3 | time weighted 4, observed use 25, rated potential 3, ability based 11, ilo tasks 8, market 30, frey osborne 69 | sources agree |
| 47-2072.00 | Pile Driver Operators | 5 | 1 | -4 | time weighted 0, observed use 25, rated potential 3, ability based 10, ilo tasks 8, market 30, frey osborne 68 | sources agree |
| 47-2073.00 | Operating Engineers and Other Construction Equipment Operators | 15 | 11 | -4 | time weighted 13, observed use 25, rated potential 15, ability based 22, ilo tasks 8, market 30, frey osborne 89 | sources agree |
| 47-2081.00 | Drywall and Ceiling Tile Installers | 4 | 3 | -1 | time weighted 5, observed use 25, rated potential 10, ability based 4, ilo tasks 4, market 30, frey osborne 65 | sources agree |
| 47-2082.00 | Tapers | 3 | 0 | -3 | time weighted 1, observed use 25, rated potential 3, ability based 5, ilo tasks 4, market 30, frey osborne 53 | sources agree |
| 47-2111.00 | Electricians | 23 | 20 | -3 | time weighted 23, observed use 25, rated potential 28, ability based 26, ilo tasks 26, market 30, frey osborne 31 | sources agree |
| 47-2121.00 | Glaziers | 9 | 7 | -3 | time weighted 9, observed use 25, rated potential 15, ability based 7, ilo tasks 9, market 30, frey osborne 60 | sources agree |
| 47-2131.00 | Insulation Workers, Floor, Ceiling, and Wall | 5 | 3 | -2 | time weighted 3, observed use 25, rated potential 16, ability based 4, ilo tasks 7, market 30, frey osborne 69 | sources agree |
| 47-2132.00 | Insulation Workers, Mechanical | 13 | 7 | -6 | time weighted 5, observed use 57, rated potential 10, ability based 9, ilo tasks 7, market 30, frey osborne 54 | sources partly agree |
| 47-2141.00 | Painters, Construction and Maintenance | 5 | 15 | +10 | time weighted 19, observed use 25, rated potential 11, ability based 4, ilo tasks 6, market 30, frey osborne 61 | sources agree |
| 47-2142.00 | Paperhangers | 2 | 5 | +2 | time weighted 7, observed use 25, rated potential 5, ability based 3, ilo tasks 6, market 30, frey osborne 74 | sources agree |
| 47-2151.00 | Pipelayers | 7 | 3 | -3 | time weighted 4, observed use 25, rated potential 6, ability based 10, ilo tasks 13, market 30, frey osborne 53 | sources agree |
| 47-2152.00 | Plumbers, Pipefitters, and Steamfitters | 15 | 21 | +5 | time weighted 18, observed use 53, rated potential 17, ability based 14, ilo tasks 13, market 67, frey osborne 41 | sources partly agree |
| 47-2152.04 | Solar Thermal Installers and Technicians | 11 | 9 | -2 | time weighted 11, observed use 38, rated potential 14, ability based 14, ilo tasks 13, market 30, frey osborne 41 | sources agree |
| 47-2161.00 | Plasterers and Stucco Masons | 6 | 3 | -3 | time weighted 4, observed use 25, rated potential 11, ability based 2, ilo tasks 4, market 30, frey osborne 70 | sources agree |
| 47-2171.00 | Reinforcing Iron and Rebar Workers | 5 | 5 | +0 | time weighted 7, observed use 25, rated potential 9, ability based 0, ilo tasks 4, market 30, frey osborne 79 | sources agree |
| 47-2181.00 | Roofers | 4 | 7 | +3 | time weighted 6, observed use 53, rated potential 7, ability based 2, ilo tasks 6, market 30, frey osborne 79 | sources partly agree |
| 47-2211.00 | Sheet Metal Workers | 10 | 11 | +1 | time weighted 12, observed use 25, rated potential 12, ability based 12, ilo tasks 30, market 30, frey osborne 68 | sources agree |
| 47-2221.00 | Structural Iron and Steel Workers | 8 | 8 | +0 | time weighted 7, observed use 62, rated potential 6, ability based 2, ilo tasks 4, market 30, frey osborne 69 | sources partly agree |
| 47-2231.00 | Solar Photovoltaic Installers | 18 | 20 | +1 | time weighted 24, observed use 25, rated potential 21, ability based 20, ilo tasks 15, market 30, frey osborne – | sources agree |
| 47-3011.00 | Helpers--Brickmasons, Blockmasons, Stonemasons, and Tile and Marble Setters | 1 | 3 | +2 | time weighted 4, observed use 25, rated potential 3, ability based 1, ilo tasks 1, market 30, frey osborne 69 | sources agree |
| 47-3012.00 | Helpers--Carpenters | 4 | 2 | -2 | time weighted 2, observed use 25, rated potential 3, ability based 6, ilo tasks 1, market 30, frey osborne 83 | sources agree |
| 47-3013.00 | Helpers--Electricians | 4 | 2 | -2 | time weighted 3, observed use 25, rated potential 5, ability based 5, ilo tasks 1, market 30, frey osborne 61 | sources agree |
| 47-3014.00 | Helpers--Painters, Paperhangers, Plasterers, and Stucco Masons | 1 | 0 | -0 | time weighted 0, observed use 25, rated potential 3, ability based 0, ilo tasks 1, market 30, frey osborne 87 | sources agree |
| 47-3015.00 | Helpers--Pipelayers, Plumbers, Pipefitters, and Steamfitters | 2 | 4 | +2 | time weighted 5, observed use 25, rated potential 3, ability based 4, ilo tasks 1, market 30, frey osborne 50 | sources agree |
| 47-3016.00 | Helpers--Roofers | 1 | 0 | -1 | time weighted 0, observed use 25, rated potential 3, ability based 1, ilo tasks 1, market 30, frey osborne 59 | sources agree |
| 47-3019.00 | Helpers, Construction Trades, All Other | 4 | 0 | -3 | time weighted 2, observed use 25, rated potential 3, ability based 6, ilo tasks 2, market 30, frey osborne – | sources agree |
| 47-4011.00 | Construction and Building Inspectors | 48 | 43 | -5 | time weighted 44, observed use 67, rated potential 33, ability based 57, ilo tasks 48, market 30, frey osborne 54 | sources agree |
| 47-4011.01 | Energy Auditors | 58 | 60 | +3 | time weighted 64, observed use 44, rated potential 65, ability based 57, ilo tasks 48, market 30, frey osborne 54 | sources agree |
| 47-4021.00 | Elevator and Escalator Installers and Repairers | 24 | 24 | +0 | time weighted 28, observed use 25, rated potential 25, ability based 23, ilo tasks 19, market 30, frey osborne 43 | sources agree |
| 47-4031.00 | Fence Erectors | 4 | 4 | +0 | time weighted 6, observed use 25, rated potential 12, ability based 1, ilo tasks 1, market 30, frey osborne 83 | sources agree |
| 47-4041.00 | Hazardous Materials Removal Workers | 21 | 7 | -14 | time weighted 9, observed use 25, rated potential 13, ability based 29, ilo tasks 1, market 30, frey osborne 48 | sources agree |
| 47-4051.00 | Highway Maintenance Workers | 5 | 1 | -3 | time weighted 1, observed use 25, rated potential 4, ability based 9, ilo tasks 0, market 30, frey osborne 74 | sources agree |
| 47-4061.00 | Rail-Track Laying and Maintenance Equipment Operators | 4 | 1 | -3 | time weighted 1, observed use 25, rated potential 3, ability based 7, ilo tasks 0, market 30, frey osborne 77 | sources agree |
| 47-4071.00 | Septic Tank Servicers and Sewer Pipe Cleaners | 10 | 15 | +4 | time weighted 18, observed use 25, rated potential 19, ability based 10, ilo tasks 2, market 30, frey osborne 69 | sources agree |
| 47-4091.00 | Segmental Pavers | 0 | 5 | +5 | time weighted 6, observed use 24, rated potential 14, ability based 18, ilo tasks 3, market 30, frey osborne 69 | sources agree |
| 47-4099.00 | Construction and Related Workers, All Other | 7 | 23 | +16 | time weighted 27, observed use 24, rated potential 28, ability based 22, ilo tasks 1, market 30, frey osborne – | sources agree |
| 47-4099.03 | Weatherization Installers and Technicians | 12 | 23 | +11 | time weighted 27, observed use 24, rated potential 32, ability based 22, ilo tasks 1, market 30, frey osborne – | sources agree |
| 47-5011.00 | Derrick Operators, Oil and Gas | 4 | 6 | +2 | time weighted 8, observed use 25, rated potential 3, ability based 6, ilo tasks 25, market 30, frey osborne 66 | sources agree |
| 47-5012.00 | Rotary Drill Operators, Oil and Gas | 17 | 14 | -3 | time weighted 16, observed use 25, rated potential 12, ability based 26, ilo tasks 25, market 30, frey osborne 48 | sources agree |
| 47-5013.00 | Service Unit Operators, Oil and Gas | 14 | 19 | +5 | time weighted 21, observed use 25, rated potential 23, ability based 18, ilo tasks 25, market 30, frey osborne 84 | sources agree |
| 47-5022.00 | Excavating and Loading Machine and Dragline Operators, Surface Mining | 15 | 8 | -7 | time weighted 10, observed use 25, rated potential 3, ability based –, ilo tasks 8, market 30, frey osborne 87 | sources agree |
| 47-5023.00 | Earth Drillers, Except Oil and Gas | 27 | 17 | -10 | time weighted 15, observed use 25, rated potential 23, ability based –, ilo tasks 25, market 30, frey osborne 72 | sources agree |
| 47-5032.00 | Explosives Workers, Ordnance Handling Experts, and Blasters | 27 | 27 | +0 | time weighted 32, observed use 25, rated potential 26, ability based –, ilo tasks 5, market 30, frey osborne 56 | sources agree |
| 47-5041.00 | Continuous Mining Machine Operators | 7 | 3 | -4 | time weighted 1, observed use 25, rated potential 9, ability based 12, ilo tasks 17, market 30, frey osborne 48 | sources agree |
| 47-5043.00 | Roof Bolters, Mining | 15 | 3 | -12 | time weighted 0, observed use 25, rated potential 3, ability based –, ilo tasks 17, market 30, frey osborne 47 | sources agree |
| 47-5044.00 | Loading and Moving Machine Operators, Underground Mining | 16 | 8 | -8 | time weighted 11, observed use 25, rated potential 13, ability based –, ilo tasks 17, market 30, frey osborne 45 | sources agree |
| 47-5049.00 | Underground Mining Machine Operators, All Other | 16 | 9 | -7 | time weighted 11, observed use 25, rated potential 13, ability based –, ilo tasks 17, market 30, frey osborne 51 | sources agree |
| 47-5051.00 | Rock Splitters, Quarry | 6 | 5 | -1 | time weighted 1, observed use 25, rated potential 16, ability based 2, ilo tasks 17, market 30, frey osborne 91 | sources agree |
| 47-5071.00 | Roustabouts, Oil and Gas | 3 | 3 | +0 | time weighted 1, observed use 25, rated potential 3, ability based 5, ilo tasks 25, market 30, frey osborne 57 | sources agree |
| 47-5081.00 | Helpers--Extraction Workers | 3 | 1 | -1 | time weighted 2, observed use 25, rated potential 11, ability based 5, ilo tasks 3, market 30, frey osborne 42 | sources agree |
| 47-5099.00 | Extraction Workers, All Other | 3 | 1 | -1 | time weighted 2, observed use 25, rated potential 11, ability based 5, ilo tasks 11, market 30, frey osborne – | sources agree |
| 49-1011.00 | First-Line Supervisors of Mechanics, Installers, and Repairers | 58 | 45 | -12 | time weighted 49, observed use 74, rated potential 50, ability based 48, ilo tasks 21, market 30, frey osborne 0 | sources partly agree |
| 49-2011.00 | Computer, Automated Teller, and Office Machine Repairers | 53 | 40 | -13 | time weighted 40, observed use 74, rated potential 43, ability based 39, ilo tasks 39, market 30, frey osborne 61 | sources agree |
| 49-2021.00 | Radio, Cellular, and Tower Equipment Installers and Repairers | 24 | 25 | +2 | time weighted 25, observed use 25, rated potential 22, ability based 31, ilo tasks 37, market 30, frey osborne 84 | sources agree |
| 49-2022.00 | Telecommunications Equipment Installers and Repairers, Except Line Installers | 33 | 34 | +2 | time weighted 31, observed use 55, rated potential 37, ability based 23, ilo tasks 37, market 61, frey osborne 41 | sources agree |
| 49-2091.00 | Avionics Technicians | 37 | 33 | -4 | time weighted 36, observed use 25, rated potential 33, ability based 45, ilo tasks 40, market 30, frey osborne 58 | sources agree |
| 49-2092.00 | Electric Motor, Power Tool, and Related Repairers | 21 | 22 | +1 | time weighted 25, observed use 25, rated potential 14, ability based 25, ilo tasks 19, market 30, frey osborne 62 | sources agree |
| 49-2093.00 | Electrical and Electronics Installers and Repairers, Transportation Equipment | 27 | 29 | +2 | time weighted 30, observed use 25, rated potential 35, ability based 24, ilo tasks 39, market 30, frey osborne 81 | sources agree |
| 49-2094.00 | Electrical and Electronics Repairers, Commercial and Industrial Equipment | 38 | 34 | -5 | time weighted 36, observed use 25, rated potential 42, ability based 36, ilo tasks 33, market 30, frey osborne 44 | sources agree |
| 49-2095.00 | Electrical and Electronics Repairers, Powerhouse, Substation, and Relay | 38 | 39 | +1 | time weighted 43, observed use 25, rated potential 40, ability based 33, ilo tasks 33, market 30, frey osborne 42 | sources agree |
| 49-2096.00 | Electronic Equipment Installers and Repairers, Motor Vehicles | 25 | 18 | -7 | time weighted 19, observed use 25, rated potential 25, ability based 25, ilo tasks 33, market 30, frey osborne 52 | sources agree |
| 49-2097.00 | Audiovisual Equipment Installers and Repairers | 31 | 29 | -2 | time weighted 32, observed use 25, rated potential 28, ability based 32, ilo tasks 37, market 30, frey osborne 55 | sources agree |
| 49-2098.00 | Security and Fire Alarm Systems Installers | 29 | 32 | +3 | time weighted 27, observed use 55, rated potential 30, ability based 29, ilo tasks 19, market 64, frey osborne 68 | sources partly agree |
| 49-3011.00 | Aircraft Mechanics and Service Technicians | 25 | 28 | +3 | time weighted 31, observed use 25, rated potential 23, ability based 30, ilo tasks 27, market 30, frey osborne 58 | sources agree |
| 49-3021.00 | Automotive Body and Related Repairers | 9 | 11 | +3 | time weighted 14, observed use 25, rated potential 13, ability based 12, ilo tasks 21, market 30, frey osborne 81 | sources agree |
| 49-3022.00 | Automotive Glass Installers and Repairers | 6 | 8 | +2 | time weighted 11, observed use 25, rated potential 3, ability based 10, ilo tasks 21, market 30, frey osborne 49 | sources agree |
| 49-3023.00 | Automotive Service Technicians and Mechanics | 17 | 23 | +6 | time weighted 27, observed use 25, rated potential 20, ability based 20, ilo tasks 21, market 30, frey osborne 51 | sources agree |
| 49-3031.00 | Bus and Truck Mechanics and Diesel Engine Specialists | 9 | 5 | -4 | time weighted 6, observed use 25, rated potential 3, ability based 17, ilo tasks 21, market 30, frey osborne 60 | sources agree |
| 49-3041.00 | Farm Equipment Mechanics and Service Technicians | 14 | 25 | +12 | time weighted 29, observed use 25, rated potential 29, ability based 10, ilo tasks 18, market 30, frey osborne 61 | sources agree |
| 49-3042.00 | Mobile Heavy Equipment Mechanics, Except Engines | 13 | 18 | +5 | time weighted 22, observed use 25, rated potential 24, ability based 12, ilo tasks 18, market 30, frey osborne 43 | sources agree |
| 49-3043.00 | Rail Car Repairers | 10 | 17 | +7 | time weighted 21, observed use 25, rated potential 20, ability based 6, ilo tasks 18, market 30, frey osborne 76 | sources agree |
| 49-3051.00 | Motorboat Mechanics and Service Technicians | 17 | 17 | +0 | time weighted 21, observed use 25, rated potential 15, ability based 22, ilo tasks 21, market 30, frey osborne 56 | sources agree |
| 49-3052.00 | Motorcycle Mechanics | 14 | 8 | -6 | time weighted 8, observed use 25, rated potential 3, ability based 26, ilo tasks 21, market 30, frey osborne 65 | sources agree |
| 49-3053.00 | Outdoor Power Equipment and Other Small Engine Mechanics | 23 | 25 | +2 | time weighted 28, observed use 25, rated potential 28, ability based 21, ilo tasks 19, market 30, frey osborne 84 | sources agree |
| 49-3091.00 | Bicycle Repairers | 18 | 19 | +1 | time weighted 22, observed use 25, rated potential 19, ability based 20, ilo tasks 7, market 30, frey osborne 87 | sources agree |
| 49-3092.00 | Recreational Vehicle Service Technicians | 14 | 22 | +7 | time weighted 25, observed use 25, rated potential 19, ability based 20, ilo tasks 21, market 30, frey osborne 51 | sources agree |
| 49-3093.00 | Tire Repairers and Changers | 3 | 3 | -0 | time weighted 2, observed use 25, rated potential 3, ability based 5, ilo tasks 21, market 30, frey osborne 58 | sources agree |
| 49-9011.00 | Mechanical Door Repairers | 13 | 22 | +9 | time weighted 25, observed use 25, rated potential 22, ability based 7, ilo tasks 19, market 30, frey osborne 81 | sources agree |
| 49-9012.00 | Control and Valve Installers and Repairers, Except Mechanical Door | 22 | 27 | +4 | time weighted 30, observed use 25, rated potential 22, ability based 26, ilo tasks 19, market 30, frey osborne 54 | sources agree |
| 49-9021.00 | Heating, Air Conditioning, and Refrigeration Mechanics and Installers | 21 | 28 | +7 | time weighted 31, observed use 52, rated potential 26, ability based 24, ilo tasks 31, market 30, frey osborne 55 | sources agree |
| 49-9031.00 | Home Appliance Repairers | 20 | 26 | +6 | time weighted 29, observed use 25, rated potential 27, ability based 19, ilo tasks 19, market 30, frey osborne 59 | sources agree |
| 49-9041.00 | Industrial Machinery Mechanics | 26 | 26 | +0 | time weighted 29, observed use 52, rated potential 33, ability based 13, ilo tasks 18, market 30, frey osborne 56 | sources agree |
| 49-9043.00 | Maintenance Workers, Machinery | 20 | 21 | +1 | time weighted 24, observed use 25, rated potential 26, ability based 18, ilo tasks 18, market 30, frey osborne 73 | sources agree |
| 49-9044.00 | Millwrights | 5 | 6 | +1 | time weighted 8, observed use 25, rated potential 10, ability based 9, ilo tasks 18, market 30, frey osborne 51 | sources agree |
| 49-9045.00 | Refractory Materials Repairers, Except Brickmasons | 5 | 1 | -4 | time weighted 2, observed use 25, rated potential 3, ability based 9, ilo tasks 0, market 30, frey osborne 68 | sources agree |
| 49-9051.00 | Electrical Power-Line Installers and Repairers | 8 | 10 | +2 | time weighted 14, observed use 25, rated potential 3, ability based 15, ilo tasks 14, market 30, frey osborne 28 | sources agree |
| 49-9052.00 | Telecommunications Line Installers and Repairers | 9 | 11 | +2 | time weighted 13, observed use 25, rated potential 11, ability based 15, ilo tasks 37, market 30, frey osborne 47 | sources agree |
| 49-9061.00 | Camera and Photographic Equipment Repairers | 45 | 36 | -9 | time weighted 21, observed use 59, rated potential 24, ability based 50, ilo tasks 32, market 68, frey osborne 94 | sources partly agree |
| 49-9062.00 | Medical Equipment Repairers | 39 | 32 | -7 | time weighted 35, observed use 25, rated potential 44, ability based 41, ilo tasks 32, market 30, frey osborne 38 | sources agree |
| 49-9063.00 | Musical Instrument Repairers and Tuners | 19 | 12 | -7 | time weighted 12, observed use 25, rated potential 6, ability based 34, ilo tasks 9, market 30, frey osborne 81 | sources agree |
| 49-9064.00 | Watch and Clock Repairers | 34 | 30 | -4 | time weighted 27, observed use 25, rated potential 32, ability based 42, ilo tasks 32, market 30, frey osborne 99 | sources agree |
| 49-9069.00 | Precision Instrument and Equipment Repairers, All Other | 19 | 10 | -9 | time weighted 12, observed use 25, rated potential 6, ability based 34, ilo tasks 32, market 30, frey osborne – | sources agree |
| 49-9071.00 | Maintenance and Repair Workers, General | 18 | 18 | -0 | time weighted 22, observed use 25, rated potential 22, ability based 17, ilo tasks 3, market 30, frey osborne 54 | sources agree |
| 49-9081.00 | Wind Turbine Service Technicians | 12 | 8 | -5 | time weighted 11, observed use 25, rated potential 10, ability based 19, ilo tasks 19, market 30, frey osborne – | sources agree |
| 49-9091.00 | Coin, Vending, and Amusement Machine Servicers and Repairers | 34 | 35 | +1 | time weighted 32, observed use 25, rated potential 37, ability based 28, ilo tasks 73, market 30, frey osborne 87 | sources partly agree |
| 49-9092.00 | Commercial Divers | 11 | 13 | +2 | time weighted 17, observed use 25, rated potential 19, ability based 14, ilo tasks 14, market 30, frey osborne 33 | sources agree |
| 49-9094.00 | Locksmiths and Safe Repairers | 18 | 14 | -4 | time weighted 14, observed use 25, rated potential 17, ability based 23, ilo tasks 30, market 30, frey osborne 63 | sources agree |
| 49-9095.00 | Manufactured Building and Mobile Home Installers | 8 | 15 | +7 | time weighted 19, observed use 25, rated potential 20, ability based 6, ilo tasks 1, market 30, frey osborne 33 | sources agree |
| 49-9096.00 | Riggers | 5 | 12 | +7 | time weighted 15, observed use 25, rated potential 9, ability based 10, ilo tasks 6, market 30, frey osborne 77 | sources agree |
| 49-9097.00 | Signal and Track Switch Repairers | 18 | 16 | -2 | time weighted 19, observed use 25, rated potential 14, ability based 23, ilo tasks 19, market 30, frey osborne 79 | sources agree |
| 49-9098.00 | Helpers--Installation, Maintenance, and Repair Workers | 5 | 2 | -3 | time weighted 3, observed use 25, rated potential 6, ability based 8, ilo tasks 3, market 30, frey osborne 65 | sources agree |
| 49-9099.00 | Installation, Maintenance, and Repair Workers, All Other | 36 | 35 | -1 | time weighted 38, observed use 25, rated potential 35, ability based 32, ilo tasks 5, market 30, frey osborne 91 | sources agree |
| 49-9099.01 | Geothermal Technicians | 30 | 35 | +4 | time weighted 38, observed use 25, rated potential 39, ability based 32, ilo tasks 5, market 30, frey osborne 91 | sources agree |
| 51-1011.00 | First-Line Supervisors of Production and Operating Workers | 47 | 39 | -8 | time weighted 41, observed use 38, rated potential 46, ability based 47, ilo tasks 62, market 30, frey osborne 12 | sources agree |
| 51-2011.00 | Aircraft Structure, Surfaces, Rigging, and Systems Assemblers | 19 | 22 | +3 | time weighted 7, observed use 65, rated potential 10, ability based 23, ilo tasks 44, market 30, frey osborne 65 | sources partly agree |
| 51-2021.00 | Coil Winders, Tapers, and Finishers | 26 | 33 | +7 | time weighted 24, observed use 39, rated potential 28, ability based 25, ilo tasks 48, market 67, frey osborne 60 | sources partly agree |
| 51-2022.00 | Electrical and Electronic Equipment Assemblers | 9 | 32 | +23 | time weighted 22, observed use 66, rated potential 19, ability based 31, ilo tasks 48, market 30, frey osborne 89 | sources partly agree |
| 51-2023.00 | Electromechanical Equipment Assemblers | 7 | 19 | +11 | time weighted 6, observed use 24, rated potential 8, ability based 35, ilo tasks 48, market 30, frey osborne 94 | sources agree |
| 51-2031.00 | Engine and Other Machine Assemblers | 17 | 13 | -5 | time weighted 6, observed use 25, rated potential 12, ability based 19, ilo tasks 44, market 30, frey osborne 68 | sources agree |
| 51-2041.00 | Structural Metal Fabricators and Fitters | 8 | 6 | -3 | time weighted 8, observed use 25, rated potential 8, ability based 15, ilo tasks 4, market 30, frey osborne 44 | sources agree |
| 51-2051.00 | Fiberglass Laminators and Fabricators | 16 | 10 | -6 | time weighted 3, observed use 25, rated potential 13, ability based –, ilo tasks 20, market 30, frey osborne 84 | sources agree |
| 51-2061.00 | Timing Device Assemblers and Adjusters | 26 | 27 | +2 | time weighted 5, observed use 59, rated potential 8, ability based –, ilo tasks 48, market 30, frey osborne 97 | sources partly agree |
| 51-2092.00 | Team Assemblers | 16 | 27 | +11 | time weighted 16, observed use 24, rated potential 24, ability based 24, ilo tasks 59, market 30, frey osborne 94 | sources agree |
| 51-2099.00 | Assemblers and Fabricators, All Other | 16 | 19 | +3 | time weighted 16, observed use 24, rated potential 24, ability based 24, ilo tasks 59, market 30, frey osborne – | sources agree |
| 51-3011.00 | Bakers | 35 | 20 | -16 | time weighted 18, observed use 25, rated potential 29, ability based 37, ilo tasks 17, market 30, frey osborne 77 | sources agree |
| 51-3021.00 | Butchers and Meat Cutters | 19 | 22 | +3 | time weighted 25, observed use 25, rated potential 13, ability based 19, ilo tasks 6, market 30, frey osborne 84 | sources agree |
| 51-3022.00 | Meat, Poultry, and Fish Cutters and Trimmers | 7 | 6 | -1 | time weighted 8, observed use 25, rated potential 3, ability based 14, ilo tasks 6, market 30, frey osborne 87 | sources agree |
| 51-3023.00 | Slaughterers and Meat Packers | 1 | 3 | +1 | time weighted 4, observed use 25, rated potential 3, ability based 1, ilo tasks 6, market 30, frey osborne 51 | sources agree |
| 51-3091.00 | Food and Tobacco Roasting, Baking, and Drying Machine Operators and Tenders | 19 | 15 | -3 | time weighted 17, observed use 25, rated potential 15, ability based 27, ilo tasks 14, market 30, frey osborne 81 | sources agree |
| 51-3092.00 | Food Batchmakers | 28 | 24 | -3 | time weighted 28, observed use 25, rated potential 25, ability based 38, ilo tasks 14, market 30, frey osborne 58 | sources agree |
| 51-3093.00 | Food Cooking Machine Operators and Tenders | 26 | 13 | -12 | time weighted 16, observed use 25, rated potential 17, ability based 33, ilo tasks 14, market 30, frey osborne 52 | sources agree |
| 51-3099.00 | Food Processing Workers, All Other | 28 | 24 | -4 | time weighted 28, observed use 25, rated potential 25, ability based 38, ilo tasks 13, market 30, frey osborne – | sources agree |
| 51-4021.00 | Extruding and Drawing Machine Setters, Operators, and Tenders, Metal and Plastic | 6 | 11 | +5 | time weighted 8, observed use 25, rated potential 12, ability based 9, ilo tasks 31, market 30, frey osborne 81 | sources agree |
| 51-4022.00 | Forging Machine Setters, Operators, and Tenders, Metal and Plastic | 16 | 13 | -3 | time weighted 14, observed use 25, rated potential 11, ability based 25, ilo tasks 17, market 30, frey osborne 84 | sources agree |
| 51-4023.00 | Rolling Machine Setters, Operators, and Tenders, Metal and Plastic | 20 | 19 | -1 | time weighted 21, observed use 25, rated potential 24, ability based 14, ilo tasks 31, market 30, frey osborne 69 | sources agree |
| 51-4031.00 | Cutting, Punching, and Press Machine Setters, Operators, and Tenders, Metal and Plastic | 9 | 10 | +2 | time weighted 14, observed use 25, rated potential 6, ability based 16, ilo tasks 23, market 30, frey osborne 64 | sources agree |
| 51-4032.00 | Drilling and Boring Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 16 | 12 | -3 | time weighted 11, observed use 25, rated potential 6, ability based 26, ilo tasks 23, market 30, frey osborne 87 | sources agree |
| 51-4033.00 | Grinding, Lapping, Polishing, and Buffing Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 13 | 13 | -0 | time weighted 12, observed use 25, rated potential 14, ability based 18, ilo tasks 21, market 30, frey osborne 89 | sources agree |
| 51-4034.00 | Lathe and Turning Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 19 | 17 | -2 | time weighted 20, observed use 25, rated potential 18, ability based 15, ilo tasks 23, market 30, frey osborne 70 | sources agree |
| 51-4035.00 | Milling and Planing Machine Setters, Operators, and Tenders, Metal and Plastic | 26 | 19 | -7 | time weighted 19, observed use 25, rated potential 25, ability based 23, ilo tasks 23, market 30, frey osborne 97 | sources agree |
| 51-4041.00 | Machinists | 26 | 27 | +1 | time weighted 29, observed use 25, rated potential 30, ability based 23, ilo tasks 23, market 30, frey osborne 55 | sources agree |
| 51-4051.00 | Metal-Refining Furnace Operators and Tenders | 13 | 21 | +8 | time weighted 23, observed use 25, rated potential 17, ability based 12, ilo tasks 52, market 30, frey osborne 76 | sources agree |
| 51-4052.00 | Pourers and Casters, Metal | 9 | 10 | +0 | time weighted 3, observed use 25, rated potential 3, ability based 17, ilo tasks 44, market 30, frey osborne 74 | sources agree |
| 51-4061.00 | Model Makers, Metal and Plastic | 25 | 32 | +7 | time weighted 35, observed use 25, rated potential 27, ability based 27, ilo tasks 30, market 30, frey osborne 84 | sources agree |
| 51-4062.00 | Patternmakers, Metal and Plastic | 26 | 28 | +2 | time weighted 31, observed use 25, rated potential 29, ability based 31, ilo tasks 30, market 30, frey osborne 79 | sources agree |
| 51-4071.00 | Foundry Mold and Coremakers | 2 | 2 | +0 | time weighted 3, observed use 25, rated potential 3, ability based 3, ilo tasks 8, market 30, frey osborne 56 | sources agree |
| 51-4072.00 | Molding, Coremaking, and Casting Machine Setters, Operators, and Tenders, Metal and Plastic | 12 | 12 | +0 | time weighted 12, observed use 25, rated potential 15, ability based 13, ilo tasks 20, market 30, frey osborne 89 | sources agree |
| 51-4081.00 | Multiple Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 22 | 19 | -3 | time weighted 18, observed use 25, rated potential 22, ability based 27, ilo tasks 23, market 30, frey osborne 81 | sources agree |
| 51-4111.00 | Tool and Die Makers | 30 | 22 | -8 | time weighted 19, observed use 25, rated potential 33, ability based 33, ilo tasks 30, market 30, frey osborne 70 | sources agree |
| 51-4121.00 | Welders, Cutters, Solderers, and Brazers | 12 | 8 | -4 | time weighted 10, observed use 25, rated potential 14, ability based 11, ilo tasks 7, market 30, frey osborne 87 | sources agree |
| 51-4122.00 | Welding, Soldering, and Brazing Machine Setters, Operators, and Tenders | 13 | 17 | +4 | time weighted 22, observed use 25, rated potential 16, ability based 17, ilo tasks 7, market 30, frey osborne 52 | sources agree |
| 51-4191.00 | Heat Treating Equipment Setters, Operators, and Tenders, Metal and Plastic | 19 | 18 | -1 | time weighted 17, observed use 25, rated potential 22, ability based 14, ilo tasks 34, market 30, frey osborne 81 | sources agree |
| 51-4192.00 | Layout Workers, Metal and Plastic | 23 | 24 | +1 | time weighted 27, observed use 25, rated potential 28, ability based 28, ilo tasks 30, market 30, frey osborne 70 | sources agree |
| 51-4193.00 | Plating Machine Setters, Operators, and Tenders, Metal and Plastic | 19 | 16 | -2 | time weighted 15, observed use 25, rated potential 18, ability based 21, ilo tasks 30, market 30, frey osborne 83 | sources agree |
| 51-4194.00 | Tool Grinders, Filers, and Sharpeners | 13 | 10 | -3 | time weighted 13, observed use 25, rated potential 6, ability based 22, ilo tasks 16, market 30, frey osborne 76 | sources agree |
| 51-4199.00 | Metal Workers and Plastic Workers, All Other | 23 | 23 | +0 | time weighted 27, observed use 25, rated potential 28, ability based 28, ilo tasks 23, market 30, frey osborne – | sources agree |
| 51-5111.00 | Prepress Technicians and Workers | 63 | 59 | -4 | time weighted 43, observed use 75, rated potential 44, ability based 59, ilo tasks 75, market 85, frey osborne 94 | sources partly agree |
| 51-5112.00 | Printing Press Operators | 32 | 28 | -4 | time weighted 30, observed use 25, rated potential 35, ability based 28, ilo tasks 40, market 30, frey osborne 69 | sources agree |
| 51-5113.00 | Print Binding and Finishing Workers | 17 | 18 | +0 | time weighted 16, observed use 25, rated potential 17, ability based 21, ilo tasks 34, market 30, frey osborne 89 | sources agree |
| 51-6011.00 | Laundry and Dry-Cleaning Workers | 11 | 6 | -5 | time weighted 6, observed use 25, rated potential 14, ability based 16, ilo tasks 14, market 30, frey osborne 58 | sources agree |
| 51-6021.00 | Pressers, Textile, Garment, and Related Materials | 1 | 3 | +2 | time weighted 3, observed use 25, rated potential 6, ability based 1, ilo tasks 11, market 30, frey osborne 67 | sources agree |
| 51-6031.00 | Sewing Machine Operators | 16 | 8 | -9 | time weighted 7, observed use 25, rated potential 11, ability based 19, ilo tasks 11, market 30, frey osborne 77 | sources agree |
| 51-6041.00 | Shoe and Leather Workers and Repairers | 13 | 14 | +1 | time weighted 17, observed use 25, rated potential 15, ability based 18, ilo tasks 13, market 30, frey osborne 48 | sources agree |
| 51-6042.00 | Shoe Machine Operators and Tenders | 15 | 10 | -5 | time weighted 8, observed use 25, rated potential 11, ability based 16, ilo tasks 15, market 30, frey osborne 94 | sources agree |
| 51-6051.00 | Sewers, Hand | 19 | 11 | -8 | time weighted 8, observed use 25, rated potential 10, ability based 32, ilo tasks 6, market 30, frey osborne 99 | sources agree |
| 51-6052.00 | Tailors, Dressmakers, and Custom Sewers | 29 | 20 | -9 | time weighted 16, observed use 55, rated potential 15, ability based 37, ilo tasks 11, market 30, frey osborne 70 | sources partly agree |
| 51-6061.00 | Textile Bleaching and Dyeing Machine Operators and Tenders | 24 | 30 | +6 | time weighted 24, observed use 53, rated potential 26, ability based 23, ilo tasks 31, market 30, frey osborne 94 | sources agree |
| 51-6062.00 | Textile Cutting Machine Setters, Operators, and Tenders | 20 | 26 | +6 | time weighted 26, observed use 52, rated potential 28, ability based 17, ilo tasks 16, market 30, frey osborne 89 | sources agree |
| 51-6063.00 | Textile Knitting and Weaving Machine Setters, Operators, and Tenders | 19 | 17 | -2 | time weighted 17, observed use 54, rated potential 25, ability based 9, ilo tasks 15, market 30, frey osborne 60 | sources agree |
| 51-6064.00 | Textile Winding, Twisting, and Drawing Out Machine Setters, Operators, and Tenders | 9 | 12 | +3 | time weighted 14, observed use 25, rated potential 16, ability based 7, ilo tasks 14, market 30, frey osborne 91 | sources agree |
| 51-6091.00 | Extruding and Forming Machine Setters, Operators, and Tenders, Synthetic and Glass Fibers | 17 | 14 | -3 | time weighted 15, observed use 25, rated potential 16, ability based 23, ilo tasks 18, market 30, frey osborne 76 | sources agree |
| 51-6092.00 | Fabric and Apparel Patternmakers | 53 | 37 | -16 | time weighted 41, observed use 25, rated potential 53, ability based 47, ilo tasks 16, market 30, frey osborne 4 | sources agree |
| 51-6093.00 | Upholsterers | 17 | 16 | -1 | time weighted 19, observed use 25, rated potential 26, ability based 8, ilo tasks 20, market 30, frey osborne 43 | sources agree |
| 51-6099.00 | Textile, Apparel, and Furnishings Workers, All Other | 53 | 38 | -16 | time weighted 41, observed use 25, rated potential 53, ability based 47, ilo tasks 12, market 30, frey osborne – | sources agree |
| 51-7011.00 | Cabinetmakers and Bench Carpenters | 12 | 12 | -0 | time weighted 14, observed use 25, rated potential 17, ability based 8, ilo tasks 14, market 30, frey osborne 83 | sources agree |
| 51-7021.00 | Furniture Finishers | 7 | 7 | +0 | time weighted 9, observed use 25, rated potential 12, ability based 11, ilo tasks 14, market 30, frey osborne 74 | sources agree |
| 51-7031.00 | Model Makers, Wood | 25 | 19 | -5 | time weighted 20, observed use 25, rated potential 28, ability based 28, ilo tasks 14, market 30, frey osborne 91 | sources agree |
| 51-7032.00 | Patternmakers, Wood | 26 | 26 | -1 | time weighted 24, observed use 53, rated potential 39, ability based 15, ilo tasks 14, market 30, frey osborne 81 | sources agree |
| 51-7041.00 | Sawing Machine Setters, Operators, and Tenders, Wood | 10 | 5 | -5 | time weighted 6, observed use 25, rated potential 10, ability based 12, ilo tasks 11, market 30, frey osborne 73 | sources agree |
| 51-7042.00 | Woodworking Machine Setters, Operators, and Tenders, Except Sawing | 11 | 15 | +4 | time weighted 14, observed use 25, rated potential 13, ability based 13, ilo tasks 33, market 30, frey osborne 94 | sources agree |
| 51-7099.00 | Woodworkers, All Other | 12 | 11 | -1 | time weighted 14, observed use 25, rated potential 17, ability based 8, ilo tasks 9, market 30, frey osborne – | sources agree |
| 51-8011.00 | Nuclear Power Reactor Operators | 52 | 38 | -14 | time weighted 34, observed use 25, rated potential 36, ability based 66, ilo tasks 47, market 30, frey osborne 89 | sources agree |
| 51-8012.00 | Power Distributors and Dispatchers | 52 | 37 | -15 | time weighted 35, observed use 25, rated potential 49, ability based 60, ilo tasks 47, market 30, frey osborne 54 | sources agree |
| 51-8013.00 | Power Plant Operators | 37 | 40 | +3 | time weighted 28, observed use 60, rated potential 32, ability based 39, ilo tasks 47, market 74, frey osborne 72 | sources partly agree |
| 51-8013.03 | Biomass Plant Technicians | 31 | 31 | -1 | time weighted 28, observed use 40, rated potential 23, ability based 39, ilo tasks 47, market 30, frey osborne 72 | sources agree |
| 51-8013.04 | Hydroelectric Plant Technicians | 30 | 33 | +4 | time weighted 33, observed use 40, rated potential 21, ability based 39, ilo tasks 47, market 30, frey osborne 72 | sources agree |
| 51-8021.00 | Stationary Engineers and Boiler Operators | 29 | 24 | -5 | time weighted 26, observed use 25, rated potential 25, ability based 35, ilo tasks 27, market 30, frey osborne 77 | sources agree |
| 51-8031.00 | Water and Wastewater Treatment Plant and System Operators | 27 | 27 | -1 | time weighted 28, observed use 25, rated potential 25, ability based 37, ilo tasks 44, market 30, frey osborne 52 | sources agree |
| 51-8091.00 | Chemical Plant and System Operators | 30 | 30 | -0 | time weighted 26, observed use 25, rated potential 28, ability based 38, ilo tasks 54, market 30, frey osborne 72 | sources agree |
| 51-8092.00 | Gas Plant Operators | 35 | 40 | +5 | time weighted 27, observed use 70, rated potential 19, ability based 40, ilo tasks 53, market 76, frey osborne 64 | sources partly agree |
| 51-8093.00 | Petroleum Pump System Operators, Refinery Operators, and Gaugers | 37 | 34 | -3 | time weighted 26, observed use 62, rated potential 33, ability based 38, ilo tasks 53, market 30, frey osborne 58 | sources agree |
| 51-8099.00 | Plant and System Operators, All Other | 33 | 30 | -4 | time weighted 32, observed use 25, rated potential 30, ability based 29, ilo tasks 44, market 30, frey osborne 73 | sources agree |
| 51-8099.01 | Biofuels Processing Technicians | 22 | 29 | +7 | time weighted 32, observed use 25, rated potential 23, ability based 29, ilo tasks 39, market 30, frey osborne 73 | sources agree |
| 51-9011.00 | Chemical Equipment Operators and Tenders | 29 | 22 | -6 | time weighted 22, observed use 25, rated potential 22, ability based 35, ilo tasks 39, market 30, frey osborne 62 | sources agree |
| 51-9012.00 | Separating, Filtering, Clarifying, Precipitating, and Still Machine Setters, Operators, and Tenders | 20 | 20 | -0 | time weighted 20, observed use 25, rated potential 22, ability based 20, ilo tasks 39, market 30, frey osborne 76 | sources agree |
| 51-9021.00 | Crushing, Grinding, and Polishing Machine Setters, Operators, and Tenders | 21 | 31 | +10 | time weighted 18, observed use 61, rated potential 20, ability based 16, ilo tasks 33, market 70, frey osborne 94 | sources partly agree |
| 51-9022.00 | Grinding and Polishing Workers, Hand | 8 | 9 | +1 | time weighted 8, observed use 25, rated potential 9, ability based 12, ilo tasks 16, market 30, frey osborne 94 | sources agree |
| 51-9023.00 | Mixing and Blending Machine Setters, Operators, and Tenders | 21 | 29 | +8 | time weighted 16, observed use 42, rated potential 21, ability based 25, ilo tasks 34, market 71, frey osborne 69 | sources partly agree |
| 51-9031.00 | Cutters and Trimmers, Hand | 10 | 7 | -4 | time weighted 10, observed use 25, rated potential 3, ability based 20, ilo tasks 16, market 30, frey osborne 54 | sources agree |
| 51-9032.00 | Cutting and Slicing Machine Setters, Operators, and Tenders | 17 | 21 | +5 | time weighted 14, observed use 57, rated potential 15, ability based 15, ilo tasks 34, market 30, frey osborne 73 | sources partly agree |
| 51-9041.00 | Extruding, Forming, Pressing, and Compacting Machine Setters, Operators, and Tenders | 13 | 17 | +4 | time weighted 21, observed use 25, rated potential 18, ability based 16, ilo tasks 16, market 30, frey osborne 84 | sources agree |
| 51-9051.00 | Furnace, Kiln, Oven, Drier, and Kettle Operators and Tenders | 21 | 16 | -5 | time weighted 20, observed use 25, rated potential 19, ability based 19, ilo tasks 26, market 30, frey osborne 42 | sources agree |
| 51-9061.00 | Inspectors, Testers, Sorters, Samplers, and Weighers | 52 | 47 | -6 | time weighted 35, observed use 55, rated potential 47, ability based 48, ilo tasks 58, market 64, frey osborne 97 | sources agree |
| 51-9071.00 | Jewelers and Precious Stone and Metal Workers | 34 | 26 | -8 | time weighted 23, observed use 25, rated potential 28, ability based 46, ilo tasks 20, market 30, frey osborne 89 | sources agree |
| 51-9071.06 | Gem and Diamond Workers | 36 | 25 | -12 | time weighted 18, observed use 25, rated potential 34, ability based 46, ilo tasks 20, market 30, frey osborne 89 | sources agree |
| 51-9081.00 | Dental Laboratory Technicians | 26 | 17 | -9 | time weighted 11, observed use 25, rated potential 11, ability based 49, ilo tasks 22, market 30, frey osborne 94 | sources agree |
| 51-9082.00 | Medical Appliance Technicians | 28 | 14 | -14 | time weighted 14, observed use 25, rated potential 25, ability based 35, ilo tasks 22, market 30, frey osborne 45 | sources agree |
| 51-9083.00 | Ophthalmic Laboratory Technicians | 23 | 14 | -9 | time weighted 12, observed use 25, rated potential 19, ability based 32, ilo tasks 11, market 30, frey osborne 94 | sources agree |
| 51-9111.00 | Packaging and Filling Machine Operators and Tenders | 10 | 15 | +5 | time weighted 10, observed use 25, rated potential 12, ability based 18, ilo tasks 34, market 30, frey osborne 97 | sources agree |
| 51-9123.00 | Painting, Coating, and Decorating Workers | 10 | 9 | -1 | time weighted 5, observed use 25, rated potential 6, ability based 19, ilo tasks 24, market 30, frey osborne 83 | sources agree |
| 51-9124.00 | Coating, Painting, and Spraying Machine Setters, Operators, and Tenders | 18 | 23 | +5 | time weighted 9, observed use 39, rated potential 9, ability based –, ilo tasks 22, market 64, frey osborne 66 | sources partly agree |
| 51-9141.00 | Semiconductor Processing Technicians | 30 | 33 | +2 | time weighted 36, observed use 25, rated potential 29, ability based 30, ilo tasks –, market 30, frey osborne 76 | sources agree |
| 51-9151.00 | Photographic Process Workers and Processing Machine Operators | 44 | 39 | -5 | time weighted 33, observed use 51, rated potential 46, ability based 39, ilo tasks 46, market 30, frey osborne 99 | sources agree |
| 51-9161.00 | Computer Numerically Controlled Tool Operators | 40 | 46 | +6 | time weighted 50, observed use 52, rated potential 34, ability based –, ilo tasks 23, market 30, frey osborne 73 | sources agree |
| 51-9162.00 | Computer Numerically Controlled Tool Programmers | 91 | 71 | -21 | time weighted 73, observed use 78, rated potential 83, ability based –, ilo tasks 30, market 88, frey osborne 41 | sources partly agree |
| 51-9191.00 | Adhesive Bonding Machine Operators and Tenders | 8 | 14 | +6 | time weighted 17, observed use 25, rated potential 8, ability based 8, ilo tasks 22, market 30, frey osborne 89 | sources agree |
| 51-9192.00 | Cleaning, Washing, and Metal Pickling Equipment Operators and Tenders | 14 | 13 | -2 | time weighted 11, observed use 25, rated potential 15, ability based 13, ilo tasks 38, market 30, frey osborne 67 | sources agree |
| 51-9193.00 | Cooling and Freezing Equipment Operators and Tenders | 16 | 16 | +0 | time weighted 20, observed use 25, rated potential 15, ability based 19, ilo tasks 14, market 30, frey osborne 84 | sources agree |
| 51-9194.00 | Etchers and Engravers | 25 | 21 | -4 | time weighted 19, observed use 25, rated potential 20, ability based 30, ilo tasks 25, market 30, frey osborne 97 | sources agree |
| 51-9195.00 | Molders, Shapers, and Casters, Except Metal and Plastic | 6 | 6 | -1 | time weighted 5, observed use 25, rated potential 5, ability based 11, ilo tasks 20, market 30, frey osborne 79 | sources agree |
| 51-9195.03 | Stone Cutters and Carvers, Manufacturing | 12 | 11 | -1 | time weighted 11, observed use 25, rated potential 15, ability based 11, ilo tasks 24, market 30, frey osborne 79 | sources agree |
| 51-9195.04 | Glass Blowers, Molders, Benders, and Finishers | 14 | 16 | +2 | time weighted 18, observed use 25, rated potential 22, ability based 11, ilo tasks 25, market 30, frey osborne 79 | sources agree |
| 51-9195.05 | Potters, Manufacturing | 12 | 17 | +6 | time weighted 21, observed use 25, rated potential 13, ability based 11, ilo tasks 20, market 30, frey osborne 79 | sources agree |
| 51-9196.00 | Paper Goods Machine Setters, Operators, and Tenders | 12 | 11 | -0 | time weighted 8, observed use 25, rated potential 5, ability based 22, ilo tasks 40, market 30, frey osborne 56 | sources agree |
| 51-9197.00 | Tire Builders | 2 | 6 | +3 | time weighted 5, observed use 25, rated potential 5, ability based 4, ilo tasks 23, market 30, frey osborne 87 | sources agree |
| 51-9198.00 | Helpers--Production Workers | 14 | 17 | +3 | time weighted 12, observed use 59, rated potential 17, ability based 7, ilo tasks 5, market 61, frey osborne 56 | sources partly agree |
| 51-9199.00 | Production Workers, All Other | 0 | 15 | +15 | time weighted 12, observed use 56, rated potential 18, ability based 8, ilo tasks 5, market 61, frey osborne – | sources partly agree |
| 53-1041.00 | Aircraft Cargo Handling Supervisors | 40 | 21 | -20 | time weighted 25, observed use 25, rated potential 26, ability based –, ilo tasks 10, market 30, frey osborne 24 | sources agree |
| 53-1042.00 | First-Line Supervisors of Helpers, Laborers, and Material Movers, Hand | 20 | 41 | +21 | time weighted 44, observed use 55, rated potential 45, ability based –, ilo tasks 10, market 66, frey osborne 44 | sources partly agree |
| 53-1042.01 | Recycling Coordinators | 46 | 56 | +10 | time weighted 62, observed use 24, rated potential 63, ability based –, ilo tasks 10, market 30, frey osborne 44 | sources partly agree |
| 53-1043.00 | First-Line Supervisors of Material-Moving Machine and Vehicle Operators | 46 | 38 | -8 | time weighted 41, observed use 24, rated potential 50, ability based –, ilo tasks 35, market 30, frey osborne 17 | sources agree |
| 53-1044.00 | First-Line Supervisors of Passenger Attendants | 32 | 57 | +25 | time weighted 60, observed use 61, rated potential 45, ability based –, ilo tasks 35, market 63, frey osborne 23 | sources agree |
| 53-1049.00 | First-Line Supervisors of Transportation Workers, All Other | 32 | 57 | +25 | time weighted 60, observed use 61, rated potential 45, ability based –, ilo tasks 35, market 63, frey osborne 17 | sources agree |
| 53-2011.00 | Airline Pilots, Copilots, and Flight Engineers | 43 | 30 | -13 | time weighted 31, observed use 25, rated potential 43, ability based 43, ilo tasks 47, market 30, frey osborne 33 | sources agree |
| 53-2012.00 | Commercial Pilots | 37 | 31 | -6 | time weighted 33, observed use 25, rated potential 36, ability based 45, ilo tasks 47, market 30, frey osborne 49 | sources agree |
| 53-2021.00 | Air Traffic Controllers | 57 | 42 | -15 | time weighted 42, observed use 25, rated potential 51, ability based 82, ilo tasks 58, market 30, frey osborne 29 | sources partly agree |
| 53-2022.00 | Airfield Operations Specialists | 56 | 44 | -12 | time weighted 37, observed use 60, rated potential 53, ability based 60, ilo tasks –, market 30, frey osborne 58 | sources agree |
| 53-2031.00 | Flight Attendants | 34 | 40 | +6 | time weighted 40, observed use 67, rated potential 28, ability based 26, ilo tasks 32, market 70, frey osborne 41 | sources partly agree |
| 53-3011.00 | Ambulance Drivers and Attendants, Except Emergency Medical Technicians | 19 | 14 | -5 | time weighted 13, observed use 25, rated potential 15, ability based 24, ilo tasks 47, market 30, frey osborne 37 | sources agree |
| 53-3031.00 | Driver/Sales Workers | 37 | 44 | +6 | time weighted 40, observed use 55, rated potential 35, ability based 27, ilo tasks 47, market 65, frey osborne 97 | sources agree |
| 53-3032.00 | Heavy and Tractor-Trailer Truck Drivers | 24 | 21 | -3 | time weighted 22, observed use 25, rated potential 33, ability based 12, ilo tasks 39, market 30, frey osborne 65 | sources agree |
| 53-3033.00 | Light Truck Drivers | 29 | 25 | -4 | time weighted 26, observed use 25, rated potential 41, ability based 14, ilo tasks 47, market 30, frey osborne 57 | sources agree |
| 53-3051.00 | Bus Drivers, School | 44 | 22 | -21 | time weighted 23, observed use 25, rated potential 35, ability based –, ilo tasks 22, market 30, frey osborne 77 | sources agree |
| 53-3052.00 | Bus Drivers, Transit and Intercity | 36 | 18 | -18 | time weighted 20, observed use 25, rated potential 28, ability based –, ilo tasks 22, market 30, frey osborne 56 | sources agree |
| 53-3053.00 | Shuttle Drivers and Chauffeurs | 37 | 27 | -10 | time weighted 27, observed use 25, rated potential 32, ability based –, ilo tasks 35, market 30, frey osborne 77 | sources agree |
| 53-3054.00 | Taxi Drivers | 39 | 28 | -12 | time weighted 18, observed use 25, rated potential 35, ability based –, ilo tasks 47, market 30, frey osborne 77 | sources agree |
| 53-3099.00 | Motor Vehicle Operators, All Other | 29 | 23 | -6 | time weighted 26, observed use 25, rated potential 41, ability based 14, ilo tasks 40, market 30, frey osborne – | sources agree |
| 53-4011.00 | Locomotive Engineers | 36 | 31 | -5 | time weighted 30, observed use 25, rated potential 43, ability based 35, ilo tasks 29, market 30, frey osborne 91 | sources agree |
| 53-4013.00 | Rail Yard Engineers, Dinkey Operators, and Hostlers | 25 | 20 | -6 | time weighted 19, observed use 25, rated potential 25, ability based 24, ilo tasks 29, market 30, frey osborne 81 | sources agree |
| 53-4022.00 | Railroad Brake, Signal, and Switch Operators and Locomotive Firers | 31 | 14 | -17 | time weighted 12, observed use 25, rated potential 21, ability based –, ilo tasks 19, market 30, frey osborne 76 | sources agree |
| 53-4031.00 | Railroad Conductors and Yardmasters | 36 | 41 | +5 | time weighted 46, observed use 25, rated potential 41, ability based 36, ilo tasks 19, market 30, frey osborne 69 | sources agree |
| 53-4041.00 | Subway and Streetcar Operators | 40 | 24 | -16 | time weighted 21, observed use 25, rated potential 39, ability based 31, ilo tasks 25, market 30, frey osborne 73 | sources agree |
| 53-4099.00 | Rail Transportation Workers, All Other | 25 | 16 | -10 | time weighted 19, observed use 25, rated potential 25, ability based 24, ilo tasks 19, market 30, frey osborne – | sources agree |
| 53-5011.00 | Sailors and Marine Oilers | 9 | 8 | -2 | time weighted 10, observed use 25, rated potential 8, ability based 12, ilo tasks 10, market 30, frey osborne 69 | sources agree |
| 53-5021.00 | Captains, Mates, and Pilots of Water Vessels | 35 | 31 | -4 | time weighted 32, observed use 25, rated potential 38, ability based 37, ilo tasks 53, market 30, frey osborne 38 | sources agree |
| 53-5022.00 | Motorboat Operators | 11 | 7 | -4 | time weighted 9, observed use 25, rated potential 16, ability based 21, ilo tasks 11, market 30, frey osborne 53 | sources agree |
| 53-5031.00 | Ship Engineers | 29 | 29 | -1 | time weighted 32, observed use 25, rated potential 30, ability based 34, ilo tasks 35, market 30, frey osborne 22 | sources agree |
| 53-6011.00 | Bridge and Lock Tenders | 33 | 24 | -9 | time weighted 23, observed use 25, rated potential 32, ability based 31, ilo tasks 20, market 30, frey osborne 94 | sources agree |
| 53-6021.00 | Parking Attendants | 20 | 23 | +3 | time weighted 17, observed use 25, rated potential 23, ability based 24, ilo tasks 53, market 30, frey osborne 74 | sources agree |
| 53-6031.00 | Automotive and Watercraft Service Attendants | 14 | 18 | +4 | time weighted 21, observed use 25, rated potential 18, ability based 10, ilo tasks 38, market 30, frey osborne 69 | sources agree |
| 53-6032.00 | Aircraft Service Attendants | 6 | 25 | +19 | time weighted 29, observed use 24, rated potential 27, ability based –, ilo tasks 11, market 30, frey osborne – | sources agree |
| 53-6041.00 | Traffic Technicians | 56 | 59 | +3 | time weighted 61, observed use 25, rated potential 64, ability based 58, ilo tasks 42, market 30, frey osborne 79 | sources partly agree |
| 53-6051.00 | Transportation Inspectors | 49 | 53 | +4 | time weighted 56, observed use 25, rated potential 60, ability based 45, ilo tasks 38, market 30, frey osborne 79 | sources agree |
| 53-6051.01 | Aviation Inspectors | 42 | 56 | +13 | time weighted 60, observed use 25, rated potential 48, ability based 45, ilo tasks 38, market 30, frey osborne 79 | sources agree |
| 53-6051.07 | Transportation Vehicle, Equipment and Systems Inspectors, Except Aviation | 51 | 43 | -8 | time weighted 48, observed use 25, rated potential 48, ability based 45, ilo tasks 38, market 30, frey osborne 79 | sources agree |
| 53-6061.00 | Passenger Attendants | 45 | 52 | +6 | time weighted 52, observed use 72, rated potential 35, ability based 38, ilo tasks 35, market 77, frey osborne 61 | sources partly agree |
| 53-6099.00 | Transportation Workers, All Other | 51 | 42 | -10 | time weighted 48, observed use 25, rated potential 48, ability based 45, ilo tasks 11, market 30, frey osborne – | sources agree |
| 53-7011.00 | Conveyor Operators and Tenders | 21 | 21 | -1 | time weighted 18, observed use 25, rated potential 24, ability based 27, ilo tasks –, market 30, frey osborne 84 | sources agree |
| 53-7021.00 | Crane and Tower Operators | 21 | 11 | -10 | time weighted 9, observed use 25, rated potential 17, ability based 16, ilo tasks 20, market 30, frey osborne 79 | sources agree |
| 53-7031.00 | Dredge Operators | 9 | 4 | -5 | time weighted 2, observed use 25, rated potential 3, ability based 17, ilo tasks 8, market 30, frey osborne 83 | sources agree |
| 53-7041.00 | Hoist and Winch Operators | 10 | 7 | -3 | time weighted 8, observed use 25, rated potential 12, ability based 18, ilo tasks 20, market 30, frey osborne 55 | sources agree |
| 53-7051.00 | Industrial Truck and Tractor Operators | 5 | 8 | +3 | time weighted 3, observed use 25, rated potential 8, ability based 7, ilo tasks 29, market 30, frey osborne 84 | sources agree |
| 53-7061.00 | Cleaners of Vehicles and Equipment | 7 | 4 | -4 | time weighted 5, observed use 25, rated potential 9, ability based 4, ilo tasks 2, market 30, frey osborne 42 | sources agree |
| 53-7062.00 | Laborers and Freight, Stock, and Material Movers, Hand | 4 | 15 | +11 | time weighted 18, observed use 25, rated potential 13, ability based 3, ilo tasks 10, market 30, frey osborne 72 | sources agree |
| 53-7062.04 | Recycling and Reclamation Workers | 4 | 5 | +1 | time weighted 8, observed use 25, rated potential 9, ability based 3, ilo tasks 5, market 30, frey osborne 72 | sources agree |
| 53-7063.00 | Machine Feeders and Offbearers | 15 | 12 | -3 | time weighted 15, observed use 25, rated potential 18, ability based 16, ilo tasks 5, market 30, frey osborne 84 | sources agree |
| 53-7064.00 | Packers and Packagers, Hand | 10 | 13 | +3 | time weighted 16, observed use 25, rated potential 19, ability based 5, ilo tasks 29, market 30, frey osborne 42 | sources agree |
| 53-7065.00 | Stockers and Order Fillers | 32 | 30 | -2 | time weighted 33, observed use 25, rated potential 30, ability based –, ilo tasks 44, market 30, frey osborne 54 | sources agree |
| 53-7071.00 | Gas Compressor and Gas Pumping Station Operators | 31 | 32 | +1 | time weighted 34, observed use 25, rated potential 30, ability based 29, ilo tasks 53, market 30, frey osborne 81 | sources agree |
| 53-7072.00 | Pump Operators, Except Wellhead Pumpers | 28 | 34 | +6 | time weighted 35, observed use 25, rated potential 36, ability based 24, ilo tasks 53, market 30, frey osborne 79 | sources agree |
| 53-7073.00 | Wellhead Pumpers | 8 | 10 | +3 | time weighted 13, observed use 25, rated potential 3, ability based 14, ilo tasks 25, market 30, frey osborne 70 | sources agree |
| 53-7081.00 | Refuse and Recyclable Material Collectors | 18 | 14 | -4 | time weighted 15, observed use 25, rated potential 29, ability based 9, ilo tasks 13, market 30, frey osborne 84 | sources agree |
| 53-7121.00 | Tank Car, Truck, and Ship Loaders | 8 | 19 | +11 | time weighted 23, observed use 25, rated potential 22, ability based 7, ilo tasks 10, market 30, frey osborne 59 | sources agree |
| 53-7199.00 | Material Moving Workers, All Other | 15 | 9 | -6 | time weighted 10, observed use 25, rated potential 3, ability based –, ilo tasks 13, market 30, frey osborne 87 | sources agree |
| 55-1011.00 | Air Crew Officers | 43 | 29 | -14 | time weighted 31, observed use 25, rated potential 43, ability based 43, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-1012.00 | Aircraft Launch and Recovery Officers | 56 | 42 | -14 | time weighted 37, observed use 60, rated potential 53, ability based 60, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-1013.00 | Armored Assault Vehicle Officers | 41 | 59 | +18 | time weighted 63, observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-1014.00 | Artillery and Missile Officers | 41 | 59 | +18 | time weighted 63, observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-1015.00 | Command and Control Center Officers | 59 | 81 | +22 | time weighted 85, observed use 25, rated potential 75, ability based 77, ilo tasks –, market 30, frey osborne – | sources disagree |
| 55-1016.00 | Infantry Officers | 41 | 59 | +18 | time weighted 63, observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-1017.00 | Special Forces Officers | 41 | 59 | +18 | time weighted 63, observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-1019.00 | Military Officer Special and Tactical Operations Leaders, All Other | 41 | 59 | +18 | time weighted 63, observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-2011.00 | First-Line Supervisors of Air Crew Members | 40 | 22 | -19 | time weighted 25, observed use 25, rated potential 26, ability based –, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-2012.00 | First-Line Supervisors of Weapons Specialists/Crew Members | 41 | 59 | +18 | time weighted 63, observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-2013.00 | First-Line Supervisors of All Other Tactical Operations Specialists | 41 | 59 | +18 | time weighted 63, observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-3011.00 | Air Crew Members | 43 | 29 | -14 | time weighted 31, observed use 25, rated potential 43, ability based 43, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-3012.00 | Aircraft Launch and Recovery Specialists | 56 | 42 | -14 | time weighted 37, observed use 60, rated potential 53, ability based 60, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-3013.00 | Armored Assault Vehicle Crew Members | 15 | 10 | -6 | time weighted 13, observed use 25, rated potential 15, ability based 22, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-3014.00 | Artillery and Missile Crew Members | 27 | 28 | +1 | time weighted 32, observed use 25, rated potential 26, ability based –, ilo tasks –, market 30, frey osborne – | sources agree |
| 55-3015.00 | Command and Control Center Specialists | 79 | 86 | +8 | time weighted 89, observed use 61, rated potential 94, ability based 71, ilo tasks –, market 30, frey osborne – | sources partly agree |
| 55-3016.00 | Infantry | 42 | 53 | +10 | time weighted 45, observed use 78, rated potential 42, ability based 30, ilo tasks –, market 87, frey osborne – | sources partly agree |
| 55-3018.00 | Special Forces | 42 | 53 | +11 | time weighted 45, observed use 78, rated potential 42, ability based 30, ilo tasks –, market 87, frey osborne – | sources partly agree |
| 55-3019.00 | Military Enlisted Tactical Operations and Air/Weapons Specialists and Crew Members, All Other | 42 | 53 | +11 | time weighted 45, observed use 78, rated potential 42, ability based 30, ilo tasks –, market 87, frey osborne – | sources partly agree |
