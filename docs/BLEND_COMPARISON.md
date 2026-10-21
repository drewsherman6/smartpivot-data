# Multi-source exposure score vs current score (all 1016 occupations)

Generated 2026-10-21 by `scripts/multisource.js` and `scripts/blend.js`. **This is a secondary "multi-source score". The current O*NET composite stays primary and drives the risk level until Drew signs off.**

## Method
1. **Every available measure is used.** Each is converted to a mid-rank percentile across the 1016 occupations, so measures on different scales become comparable. That puts a β share, a 0–1 ILO score, an AIOE z-score, a 1–5 automation rating and a time share all on the same 0–1 scale.
2. **Measures are grouped into independent families** (below), so that one research group is not counted several times for producing several numbers. The family score is the mean of the members the job has.
3. **The blend is the mean of the families the job has.** Missing measures are removed and the rest re-weighted. They are never counted as 0, so thin coverage cannot drag a score down.
4. **Jobs O*NET does not rate directly** take job-level measures from the related role the current composite already uses (`inferred_from`). Their task-level measures use the job's own task list.
5. **Agreement** is the standard deviation of the family scores: below 0.15 "sources agree", 0.15–0.25 "partly agree", 0.25 and above "disagree". Counts: sources agree 752, sources partly agree 238, sources disagree 26, single source 0.
6. **Weighting rationale:** each independent family gets equal weight (scheme A). That follows the standard practice of averaging standardized indicators when no family is known to be more valid; see OECD/JRC, *Handbook on Constructing Composite Indicators* (2008). Schemes B and C below show how sensitive the result is to that choice.
7. **Not included:** Frey & Osborne (2013) automation probabilities. SmartPivot does not use them today, and they are coded to SOC 2010 with only 702 occupations. They can be added as another family if wanted.

| AI family | Measures (coverage = number of occupations) |
|---|---|
| Observed AI use (Anthropic Economic Index) | Anthropic observed exposure (job) (960); Anthropic task penetration, time-weighted (tasks) (1016) |
| Rated LLM exposure (Eloundou et al. 2023) | Eloundou β, GPT-4 rated (job) (989); Eloundou β, human rated (job) (989); Eloundou β from task labels, E1=1, E2=0.5 (tasks) (1016) |
| Ability-based AI exposure (Felten, Raj & Seamans AIOE) | Felten AIOE (job) (860) |
| ILO 2025 GenAI task scores (ISCO-08) | ILO 2025 mean task score via ISCO-08 (tasks) (987) |
| Work already targeted by verified AI products (SmartPivot weekly) | Share of work time in AI-used tasks targeted by verified products (1016) |

| Robotics family | Measures (coverage) |
|---|---|
| Anthropic robot exposure | Anthropic robot exposure index (job) (1016); Anthropic robot tier, time-weighted (tasks) (1016) |
| O*NET Degree of Automation (work context) | O*NET Degree of Automation 1-5 (job) (1004) |
| Work covered by commercial/deployed robots (SmartPivot weekly) | Share of work time covered by commercial/deployed robots (1016) |

## Headline (scheme A vs current)
- **AI:** rank correlation with the current composite **0.955** (Spearman). Mean absolute rank change 6 points; 35 jobs move 20 or more points. The Low/Moderate/High tercile changes for **161** of 1016 jobs (79 up, 82 down).
- **Robotics:** rank correlation with the current Anthropic robot index **0.855**. The tercile changes for 288 jobs (145 up, 143 down). Many jobs share the robot index value 0, so tercile moves at the low end are partly tie-breaking.
- Statements per job (the work-statement layer): min 23, median 136, max 742. Coverage: onet 1016, esco 935, ilo 987, oasis 1016, nice 13.

## Sensitivity to the weighting scheme
| Scheme | AI ρ vs current | AI ρ vs scheme A | AI tercile changes vs current | Robotics ρ vs current | Robotics tercile changes |
|---|---|---|---|---|---|
| A. Equal weight per family (primary) | 0.955 | 1.000 | 161 (79 up / 82 down) | 0.855 | 288 |
| B. Equal weight per measure | 0.968 | 0.994 | 137 (68 up / 69 down) | 0.930 | 182 |
| C. Equal families, without the market signal | 0.970 | 0.988 | 128 (64 up / 64 down) | 0.738 | 440 |

## Calibration: how the AI measures agree with each other (Spearman on percentiles)
| Pair | n | ρ |
|---|---|---|
| eloundou_gpt4_beta vs eloundou_task_beta | 989 | 0.95 |
| eloundou_human_beta vs eloundou_task_beta | 989 | 0.95 |
| eloundou_gpt4_beta vs eloundou_human_beta | 989 | 0.90 |
| eloundou_task_beta vs felten_aioe | 860 | 0.88 |
| aei_task_penetration vs ai_targeted_share | 1016 | 0.86 |
| eloundou_gpt4_beta vs felten_aioe | 839 | 0.85 |
| eloundou_human_beta vs felten_aioe | 839 | 0.85 |
| eloundou_task_beta vs ilo_task_score | 987 | 0.83 |
| aei_observed_exposure vs aei_task_penetration | 960 | 0.83 |
| eloundou_gpt4_beta vs ilo_task_score | 961 | 0.82 |
| eloundou_human_beta vs ilo_task_score | 961 | 0.81 |
| felten_aioe vs ilo_task_score | 834 | 0.81 |
| aei_observed_exposure vs eloundou_task_beta | 960 | 0.71 |
| aei_observed_exposure vs eloundou_gpt4_beta | 937 | 0.70 |
| aei_observed_exposure vs ai_targeted_share | 960 | 0.69 |
| aei_task_penetration vs eloundou_task_beta | 1016 | 0.68 |
| aei_observed_exposure vs eloundou_human_beta | 937 | 0.68 |
| aei_observed_exposure vs ilo_task_score | 932 | 0.67 |
| aei_task_penetration vs eloundou_gpt4_beta | 989 | 0.66 |
| aei_task_penetration vs felten_aioe | 860 | 0.66 |
| aei_task_penetration vs eloundou_human_beta | 989 | 0.64 |
| aei_observed_exposure vs felten_aioe | 837 | 0.63 |
| ai_targeted_share vs eloundou_task_beta | 1016 | 0.62 |
| aei_task_penetration vs ilo_task_score | 987 | 0.62 |
| ai_targeted_share vs eloundou_gpt4_beta | 989 | 0.60 |
| ai_targeted_share vs felten_aioe | 860 | 0.60 |
| ai_targeted_share vs eloundou_human_beta | 989 | 0.58 |
| ai_targeted_share vs ilo_task_score | 987 | 0.57 |

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
Current composite rank 79, multi-source rank 69 (-10; the first version of the blend had it far lower). Job-level measures are taken from 43-5031.00, the same related role the current composite uses. Agreement: sources partly agree (SD 0.229).

| Family | Score (pct) | Measures (raw → pct) |
|---|---|---|
| Observed AI use (Anthropic Economic Index) | 61 | Anthropic observed exposure (job): 0.047 → 63; Anthropic task penetration, time-weighted (tasks): 0.045 → 59 |
| Rated LLM exposure (Eloundou et al. 2023) | 94 | Eloundou β, GPT-4 rated (job): 0.656 → 94; Eloundou β, human rated (job): 0.594 → 92; Eloundou β from task labels, E1=1, E2=0.5 (tasks): 0.707 → 97 |
| Ability-based AI exposure (Felten, Raj & Seamans AIOE) | 71 | Felten AIOE (job): 0.907 → 71 |
| ILO 2025 GenAI task scores (ISCO-08) | – | ILO 2025 mean task score via ISCO-08 (tasks): n/a → – |
| Work already targeted by verified AI products (SmartPivot weekly) | 30 | Share of work time in AI-used tasks targeted by verified products: 0 → 30 |

### 19-2099.00 Physical Scientists, All Other
Current composite rank 70, multi-source rank 72 (+2; the first version of the blend had it far lower). Agreement: sources agree (SD 0.085).

| Family | Score (pct) | Measures (raw → pct) |
|---|---|---|
| Observed AI use (Anthropic Economic Index) | 60 | Anthropic observed exposure (job): 0.038 → 60; Anthropic task penetration, time-weighted (tasks): 0.046 → 59 |
| Rated LLM exposure (Eloundou et al. 2023) | 61 | Eloundou β, GPT-4 rated (job): n/a → –; Eloundou β, human rated (job): n/a → –; Eloundou β from task labels, E1=1, E2=0.5 (tasks): 0.403 → 61 |
| Ability-based AI exposure (Felten, Raj & Seamans AIOE) | 81 | Felten AIOE (job): 1.14 → 81 |
| ILO 2025 GenAI task scores (ISCO-08) | – | ILO 2025 mean task score via ISCO-08 (tasks): n/a → – |
| Work already targeted by verified AI products (SmartPivot weekly) | 70 | Share of work time in AI-used tasks targeted by verified products: 0.047 → 70 |

### 19-2099.01 Remote Sensing Scientists and Technologists
Current composite rank 67, multi-source rank 73 (+6; the first version of the blend had it far lower). Agreement: sources agree (SD 0.077).

| Family | Score (pct) | Measures (raw → pct) |
|---|---|---|
| Observed AI use (Anthropic Economic Index) | 60 | Anthropic observed exposure (job): 0.038 → 60; Anthropic task penetration, time-weighted (tasks): 0.046 → 59 |
| Rated LLM exposure (Eloundou et al. 2023) | 66 | Eloundou β, GPT-4 rated (job): 0.457 → 65; Eloundou β, human rated (job): 0.446 → 72; Eloundou β from task labels, E1=1, E2=0.5 (tasks): 0.403 → 61 |
| Ability-based AI exposure (Felten, Raj & Seamans AIOE) | 81 | Felten AIOE (job): 1.14 → 81 |
| ILO 2025 GenAI task scores (ISCO-08) | – | ILO 2025 mean task score via ISCO-08 (tasks): n/a → – |
| Work already targeted by verified AI products (SmartPivot weekly) | 70 | Share of work time in AI-used tasks targeted by verified products: 0.047 → 70 |

## Top 15 AI increases (multi-source ranks the job as more exposed)
| Code | Title | Current | Multi-source | Δ | Families that drove it | Agreement |
|---|---|---|---|---|---|---|
| 25-2055.00 | Special Education Teachers, Kindergarten | 25 | 65 | +40 | observed use (77), market (70) | sources agree |
| 51-2022.00 | Electrical and Electronic Equipment Assemblers | 9 | 40 | +31 | observed use (66), ilo tasks (48) | sources partly agree |
| 29-1212.00 | Cardiologists | 40 | 70 | +30 | market (89), observed use (80) | sources partly agree |
| 31-1122.00 | Personal Care Aides | 20 | 49 | +29 | market (62), observed use (50) | sources agree |
| 25-2056.00 | Special Education Teachers, Elementary School | 35 | 64 | +29 | observed use (75), market (63) | sources agree |
| 25-9043.00 | Teaching Assistants, Special Education | 27 | 55 | +28 | observed use (74), market (62) | sources partly agree |
| 25-9049.00 | Teaching Assistants, All Other | 27 | 55 | +28 | observed use (74), market (62) | sources partly agree; inferred from 25-9043.00 |
| 29-2011.00 | Medical and Clinical Laboratory Technologists | 38 | 66 | +28 | observed use (81), market (73) | sources partly agree |
| 51-9199.00 | Production Workers, All Other | 0 | 26 | +26 | market (61), observed use (56) | sources partly agree |
| 29-2012.00 | Medical and Clinical Laboratory Technicians | 30 | 55 | +26 | market (72), observed use (61) | sources agree |
| 53-1042.00 | First-Line Supervisors of Helpers, Laborers, and Material Movers, Hand | 20 | 45 | +25 | market (66), observed use (55) | sources partly agree |
| 41-2011.00 | Cashiers | 44 | 68 | +24 | market (81), ilo tasks (79) | sources partly agree |
| 41-9011.00 | Demonstrators and Product Promoters | 43 | 67 | +23 | ilo tasks (82), market (69) | sources agree |
| 31-1121.00 | Home Health Aides | 0 | 23 | +23 | ilo tasks (40), market (30) | sources agree |
| 39-6011.00 | Baggage Porters and Bellhops | 23 | 44 | +22 | observed use (71), ilo tasks (71) | sources partly agree |

## Top 15 AI decreases
| Code | Title | Current | Multi-source | Δ | Families that drove it | Agreement |
|---|---|---|---|---|---|---|
| 27-2091.00 | Disc Jockeys, Except Radio | 84 | 41 | -43 | observed use (24), market (30) | sources partly agree |
| 27-2099.00 | Entertainers and Performers, Sports and Related Workers, All Other | 84 | 46 | -37 | observed use (24), market (30) | sources partly agree; inferred from 27-2091.00 |
| 19-4044.00 | Hydrologic Technicians | 78 | 43 | -36 | observed use (24), market (30) | sources partly agree |
| 13-2022.00 | Appraisers of Personal and Business Property | 91 | 61 | -31 | observed use (24), market (30) | sources disagree |
| 15-1299.07 | Blockchain Engineers | 99 | 72 | -27 | market (30), observed use (58) | sources disagree |
| 15-1299.04 | Penetration Testers | 98 | 72 | -26 | market (30), observed use (58) | sources disagree |
| 15-1299.06 | Digital Forensics Analysts | 97 | 72 | -25 | market (30), observed use (58) | sources disagree |
| 53-1041.00 | Aircraft Cargo Handling Supervisors | 40 | 16 | -25 | ilo tasks (10), observed use (25) | sources agree |
| 29-1229.02 | Hospitalists | 74 | 50 | -24 | market (30), observed use (41) | sources agree |
| 53-6099.00 | Transportation Workers, All Other | 51 | 29 | -22 | ilo tasks (11), observed use (25) | sources agree; inferred from 53-6051.07 |
| 51-6099.00 | Textile, Apparel, and Furnishings Workers, All Other | 53 | 32 | -22 | ilo tasks (12), observed use (25) | sources partly agree; inferred from 51-6092.00 |
| 13-1021.00 | Buyers and Purchasing Agents, Farm Products | 75 | 53 | -22 | observed use (24), market (30) | sources partly agree |
| 31-9099.01 | Speech-Language Pathology Assistants | 64 | 42 | -22 | observed use (25), market (30) | sources agree |
| 21-2099.00 | Religious Workers, All Other | 75 | 55 | -21 | ilo tasks (5), market (30) | sources disagree; inferred from 21-2021.00 |
| 51-6092.00 | Fabric and Apparel Patternmakers | 53 | 33 | -20 | ilo tasks (16), observed use (25) | sources agree |

## Top 15 robotics movers
| Code | Title | Current | Multi-source | Δ | Families that drove it | AI agreement |
|---|---|---|---|---|---|---|
| 49-3022.00 | Automotive Glass Installers and Repairers | 71 | 19 | -51 | onet automation (1), deployed (16) | sources agree |
| 17-1022.01 | Geodetic Surveyors | 14 | 64 | +50 | onet automation (92), deployed (69) | sources partly agree |
| 35-2013.00 | Cooks, Private Household | 78 | 32 | -45 | deployed (16), onet automation (18) | sources agree |
| 27-1012.00 | Craft Artists | 71 | 26 | -45 | onet automation (14), deployed (16) | sources partly agree |
| 27-1019.00 | Artists and Related Workers, All Other | 71 | 26 | -45 | onet automation (14), deployed (16) | sources partly agree; inferred from 27-1012.00 |
| 49-9061.00 | Camera and Photographic Equipment Repairers | 58 | 15 | -44 | onet automation (3), deployed (16) | sources partly agree |
| 45-4021.00 | Fallers | 66 | 22 | -44 | onet automation (14), deployed (16) | sources agree |
| 29-1041.00 | Optometrists | 14 | 57 | +43 | deployed (73), onet automation (71) | sources agree |
| 49-3052.00 | Motorcycle Mechanics | 55 | 12 | -43 | onet automation (0), deployed (16) | sources agree |
| 49-3091.00 | Bicycle Repairers | 54 | 12 | -42 | onet automation (1), deployed (16) | sources agree |
| 47-2132.00 | Insulation Workers, Mechanical | 61 | 19 | -42 | onet automation (9), deployed (16) | sources partly agree |
| 49-3053.00 | Outdoor Power Equipment and Other Small Engine Mechanics | 58 | 16 | -41 | onet automation (8), deployed (16) | sources agree |
| 51-9195.04 | Glass Blowers, Molders, Benders, and Finishers | 77 | 37 | -40 | onet automation (5), deployed (37) | sources agree |
| 49-9064.00 | Watch and Clock Repairers | 62 | 23 | -40 | onet automation (0), deployed (33) | sources agree |
| 49-9094.00 | Locksmiths and Safe Repairers | 66 | 27 | -39 | deployed (16), onet automation (20) | sources agree |

## Full AI table
| Code | Title | Current rank | Multi-source rank | Δ | Family scores (pct) | Agreement |
|---|---|---|---|---|---|---|
| 11-1011.00 | Chief Executives | 71 | 73 | +2 | observed use 61, rated potential 59, ability based 90, ilo tasks 73, market 62 | sources agree |
| 11-1011.03 | Chief Sustainability Officers | 81 | 63 | -18 | observed use 41, rated potential 73, ability based 90, ilo tasks 61, market 30 | sources partly agree |
| 11-1021.00 | General and Operations Managers | 70 | 77 | +7 | observed use 77, rated potential 66, ability based 62, ilo tasks 73, market 85 | sources agree |
| 11-1031.00 | Legislators | 50 | 48 | -2 | observed use 25, rated potential 72, ability based –, ilo tasks 59, market 30 | sources partly agree |
| 11-2011.00 | Advertising and Promotions Managers | 82 | 88 | +6 | observed use 82, rated potential 79, ability based 87, ilo tasks 77, market 91 | sources agree |
| 11-2021.00 | Marketing Managers | 89 | 92 | +3 | observed use 92, rated potential 78, ability based 88, ilo tasks 81, market 92 | sources agree |
| 11-2022.00 | Sales Managers | 69 | 78 | +9 | observed use 62, rated potential 72, ability based 85, ilo tasks 81, market 72 | sources agree |
| 11-2032.00 | Public Relations Managers | 89 | 87 | -1 | observed use 84, rated potential 85, ability based –, ilo tasks 77, market 85 | sources agree |
| 11-2033.00 | Fundraising Managers | 89 | 78 | -12 | observed use 70, rated potential 81, ability based –, ilo tasks 81, market 66 | sources agree |
| 11-3012.00 | Administrative Services Managers | 49 | 52 | +3 | observed use 25, rated potential 68, ability based –, ilo tasks 82, market 30 | sources partly agree |
| 11-3013.00 | Facilities Managers | 59 | 54 | -5 | observed use 52, rated potential 46, ability based –, ilo tasks 82, market 30 | sources partly agree |
| 11-3013.01 | Security Managers | 75 | 84 | +9 | observed use 80, rated potential 79, ability based –, ilo tasks 82, market 79 | sources agree |
| 11-3021.00 | Computer and Information Systems Managers | 82 | 82 | -0 | observed use 78, rated potential 83, ability based 78, ilo tasks 84, market 65 | sources agree |
| 11-3031.00 | Financial Managers | 92 | 89 | -3 | observed use 91, rated potential 71, ability based 98, ilo tasks 72, market 87 | sources agree |
| 11-3031.01 | Treasurers and Controllers | 91 | 87 | -4 | observed use 89, rated potential 70, ability based 98, ilo tasks 72, market 84 | sources agree |
| 11-3031.03 | Investment Fund Managers | 94 | 93 | -0 | observed use 97, rated potential 81, ability based 98, ilo tasks 84, market 86 | sources agree |
| 11-3051.00 | Industrial Production Managers | 60 | 55 | -5 | observed use 38, rated potential 63, ability based 61, ilo tasks 74, market 30 | sources partly agree |
| 11-3051.01 | Quality Control Systems Managers | 62 | 62 | +0 | observed use 51, rated potential 77, ability based 61, ilo tasks 74, market 30 | sources partly agree |
| 11-3051.02 | Geothermal Production Managers | 60 | 56 | -4 | observed use 38, rated potential 64, ability based 61, ilo tasks 74, market 30 | sources partly agree |
| 11-3051.03 | Biofuels Production Managers | 48 | 50 | +2 | observed use 38, rated potential 39, ability based 61, ilo tasks 74, market 30 | sources partly agree |
| 11-3051.04 | Biomass Power Plant Managers | 51 | 65 | +14 | observed use 57, rated potential 48, ability based 61, ilo tasks 74, market 63 | sources agree |
| 11-3051.06 | Hydroelectric Production Managers | 51 | 52 | +0 | observed use 38, rated potential 50, ability based 61, ilo tasks 74, market 30 | sources partly agree |
| 11-3061.00 | Purchasing Managers | 93 | 89 | -4 | observed use 83, rated potential 82, ability based 97, ilo tasks 82, market 78 | sources agree |
| 11-3071.00 | Transportation, Storage, and Distribution Managers | 71 | 75 | +5 | observed use 77, rated potential 73, ability based 70, ilo tasks 76, market 63 | sources agree |
| 11-3071.04 | Supply Chain Managers | 72 | 64 | -8 | observed use 49, rated potential 73, ability based 70, ilo tasks 76, market 30 | sources partly agree |
| 11-3111.00 | Compensation and Benefits Managers | 73 | 60 | -14 | observed use 25, rated potential 74, ability based 88, ilo tasks 64, market 30 | sources partly agree |
| 11-3121.00 | Human Resources Managers | 69 | 59 | -10 | observed use 25, rated potential 71, ability based 89, ilo tasks 64, market 30 | sources partly agree |
| 11-3131.00 | Training and Development Managers | 89 | 85 | -4 | observed use 95, rated potential 76, ability based 86, ilo tasks 64, market 79 | sources agree |
| 11-9013.00 | Farmers, Ranchers, and Other Agricultural Managers | 45 | 35 | -11 | observed use 25, rated potential 46, ability based 46, ilo tasks 33, market 30 | sources agree |
| 11-9021.00 | Construction Managers | 70 | 65 | -5 | observed use 75, rated potential 61, ability based 76, ilo tasks 61, market 30 | sources partly agree |
| 11-9031.00 | Education and Childcare Administrators, Preschool and Daycare | 64 | 68 | +4 | observed use 63, rated potential 68, ability based 69, ilo tasks 54, market 63 | sources agree |
| 11-9032.00 | Education Administrators, Kindergarten through Secondary | 64 | 71 | +7 | observed use 60, rated potential 62, ability based 78, ilo tasks 65, market 65 | sources agree |
| 11-9033.00 | Education Administrators, Postsecondary | 78 | 77 | -1 | observed use 66, rated potential 68, ability based 99, ilo tasks 65, market 69 | sources agree |
| 11-9039.00 | Education Administrators, All Other | 56 | 69 | +13 | observed use 64, rated potential 66, ability based 58, ilo tasks 65, market 69 | sources agree |
| 11-9041.00 | Architectural and Engineering Managers | 63 | 64 | +1 | observed use 57, rated potential 64, ability based 68, ilo tasks 80, market 30 | sources partly agree |
| 11-9041.01 | Biofuels/Biodiesel Technology and Product Development Managers | 59 | 57 | -2 | observed use 41, rated potential 54, ability based 68, ilo tasks 80, market 30 | sources partly agree |
| 11-9051.00 | Food Service Managers | 48 | 50 | +3 | observed use 43, rated potential 58, ability based 46, ilo tasks 65, market 30 | sources agree |
| 11-9071.00 | Gambling Managers | 69 | 69 | +0 | observed use 43, rated potential 76, ability based 68, ilo tasks 60, market 74 | sources agree |
| 11-9072.00 | Entertainment and Recreation Managers, Except Gambling | 42 | 44 | +3 | observed use 24, rated potential 59, ability based –, ilo tasks 60, market 30 | sources partly agree |
| 11-9081.00 | Lodging Managers | 65 | 73 | +8 | observed use 75, rated potential 64, ability based 59, ilo tasks 72, market 75 | sources agree |
| 11-9111.00 | Medical and Health Services Managers | 70 | 72 | +2 | observed use 66, rated potential 59, ability based 85, ilo tasks 64, market 69 | sources agree |
| 11-9121.00 | Natural Sciences Managers | 85 | 87 | +2 | observed use 72, rated potential 86, ability based 90, ilo tasks 80, market 81 | sources agree |
| 11-9121.01 | Clinical Research Coordinators | 82 | 78 | -4 | observed use 60, rated potential 76, ability based 90, ilo tasks 80, market 64 | sources agree |
| 11-9121.02 | Water Resource Specialists | 81 | 68 | -12 | observed use 46, rated potential 73, ability based 90, ilo tasks 80, market 30 | sources partly agree |
| 11-9131.00 | Postmasters and Mail Superintendents | 65 | 73 | +8 | observed use 46, rated potential 77, ability based 68, ilo tasks 82, market 76 | sources agree |
| 11-9141.00 | Property, Real Estate, and Community Association Managers | 76 | 77 | +1 | observed use 78, rated potential 65, ability based 83, ilo tasks 64, market 72 | sources agree |
| 11-9151.00 | Social and Community Service Managers | 72 | 79 | +8 | observed use 81, rated potential 62, ability based 82, ilo tasks 67, market 85 | sources agree |
| 11-9161.00 | Emergency Management Directors | 59 | 59 | -0 | observed use 25, rated potential 75, ability based 77, ilo tasks 73, market 30 | sources partly agree |
| 11-9171.00 | Funeral Home Managers | 54 | 72 | +18 | observed use 54, rated potential 70, ability based –, ilo tasks 82, market 69 | sources agree |
| 11-9179.00 | Personal Service Managers, All Other | 80 | 77 | -3 | observed use 79, rated potential 63, ability based –, ilo tasks 72, market 81 | sources agree |
| 11-9179.01 | Fitness and Wellness Coordinators | 62 | 56 | -7 | observed use 72, rated potential 52, ability based –, ilo tasks 60, market 30 | sources partly agree |
| 11-9179.02 | Spa Managers | 81 | 81 | -0 | observed use 83, rated potential 71, ability based –, ilo tasks 60, market 92 | sources agree |
| 11-9199.00 | Managers, All Other | 71 | 74 | +3 | observed use 67, rated potential 68, ability based 72, ilo tasks 76, market 70 | sources agree |
| 11-9199.01 | Regulatory Affairs Managers | 78 | 84 | +5 | observed use 77, rated potential 86, ability based 72, ilo tasks 72, market 91 | sources agree |
| 11-9199.02 | Compliance Managers | 75 | 76 | +1 | observed use 69, rated potential 82, ability based 72, ilo tasks 65, market 72 | sources agree |
| 11-9199.08 | Loss Prevention Managers | 66 | 63 | -2 | observed use 64, rated potential 58, ability based 72, ilo tasks 72, market 30 | sources partly agree |
| 11-9199.09 | Wind Energy Operations Managers | 66 | 60 | -6 | observed use 47, rated potential 59, ability based 72, ilo tasks 72, market 30 | sources partly agree |
| 11-9199.10 | Wind Energy Development Managers | 76 | 68 | -8 | observed use 64, rated potential 81, ability based 72, ilo tasks 72, market 30 | sources partly agree |
| 11-9199.11 | Brownfield Redevelopment Specialists and Site Managers | 68 | 62 | -6 | observed use 47, rated potential 71, ability based 72, ilo tasks 72, market 30 | sources partly agree |
| 13-1011.00 | Agents and Business Managers of Artists, Performers, and Athletes | 82 | 83 | +1 | observed use 78, rated potential 73, ability based 79, ilo tasks 85, market 77 | sources agree |
| 13-1021.00 | Buyers and Purchasing Agents, Farm Products | 75 | 53 | -22 | observed use 24, rated potential 59, ability based 66, ilo tasks 78, market 30 | sources partly agree |
| 13-1022.00 | Wholesale and Retail Buyers, Except Farm Products | 65 | 55 | -9 | observed use 24, rated potential 64, ability based 68, ilo tasks 79, market 30 | sources partly agree |
| 13-1023.00 | Purchasing Agents, Except Wholesale, Retail, and Farm Products | 86 | 83 | -3 | observed use 74, rated potential 64, ability based 100, ilo tasks 78, market 75 | sources agree |
| 13-1031.00 | Claims Adjusters, Examiners, and Investigators | 81 | 85 | +4 | observed use 71, rated potential 80, ability based 85, ilo tasks 86, market 78 | sources agree |
| 13-1032.00 | Insurance Appraisers, Auto Damage | 62 | 59 | -3 | observed use 25, rated potential 75, ability based 63, ilo tasks 86, market 30 | sources partly agree |
| 13-1041.00 | Compliance Officers | 82 | 90 | +9 | observed use 87, rated potential 94, ability based 65, ilo tasks 83, market 97 | sources agree |
| 13-1041.01 | Environmental Compliance Inspectors | 67 | 63 | -4 | observed use 51, rated potential 72, ability based 65, ilo tasks 76, market 30 | sources partly agree |
| 13-1041.03 | Equal Opportunity Representatives and Officers | 80 | 82 | +2 | observed use 75, rated potential 87, ability based 65, ilo tasks 76, market 85 | sources agree |
| 13-1041.04 | Government Property Inspectors and Investigators | 66 | 79 | +13 | observed use 77, rated potential 67, ability based 65, ilo tasks 76, market 88 | sources agree |
| 13-1041.06 | Coroners | 61 | 72 | +11 | observed use 67, rated potential 62, ability based 65, ilo tasks 76, market 73 | sources agree |
| 13-1041.07 | Regulatory Affairs Specialists | 76 | 79 | +3 | observed use 72, rated potential 91, ability based 65, ilo tasks 76, market 74 | sources agree |
| 13-1041.08 | Customs Brokers | 81 | 81 | +0 | observed use 82, rated potential 93, ability based 65, ilo tasks 76, market 67 | sources agree |
| 13-1051.00 | Cost Estimators | 76 | 66 | -10 | observed use 25, rated potential 75, ability based 94, ilo tasks 85, market 30 | sources disagree |
| 13-1071.00 | Human Resources Specialists | 97 | 97 | -1 | observed use 95, rated potential 91, ability based 93, ilo tasks 86, market 97 | sources agree |
| 13-1074.00 | Farm Labor Contractors | 29 | 36 | +7 | observed use 25, rated potential 17, ability based 37, ilo tasks 77, market 30 | sources partly agree |
| 13-1075.00 | Labor Relations Specialists | 78 | 66 | -12 | observed use 25, rated potential 76, ability based 91, ilo tasks 86, market 30 | sources disagree |
| 13-1081.00 | Logisticians | 85 | 74 | -11 | observed use 74, rated potential 73, ability based 87, ilo tasks 87, market 30 | sources partly agree |
| 13-1081.01 | Logistics Engineers | 85 | 92 | +6 | observed use 83, rated potential 88, ability based 87, ilo tasks 87, market 87 | sources agree |
| 13-1081.02 | Logistics Analysts | 88 | 89 | +1 | observed use 77, rated potential 91, ability based 87, ilo tasks 87, market 81 | sources agree |
| 13-1082.00 | Project Management Specialists | 88 | 70 | -18 | observed use 74, rated potential 75, ability based –, ilo tasks 81, market 30 | sources partly agree |
| 13-1111.00 | Management Analysts | 83 | 78 | -5 | observed use 89, rated potential 67, ability based 98, ilo tasks 87, market 30 | sources partly agree |
| 13-1121.00 | Meeting, Convention, and Event Planners | 67 | 68 | +1 | observed use 75, rated potential 66, ability based 58, ilo tasks 88, market 30 | sources partly agree |
| 13-1131.00 | Fundraisers | 77 | 78 | +1 | observed use 63, rated potential 78, ability based 84, ilo tasks 83, market 63 | sources agree |
| 13-1141.00 | Compensation, Benefits, and Job Analysis Specialists | 81 | 82 | +1 | observed use 66, rated potential 71, ability based 98, ilo tasks 86, market 68 | sources agree |
| 13-1151.00 | Training and Development Specialists | 89 | 79 | -9 | observed use 89, rated potential 90, ability based 83, ilo tasks 84, market 30 | sources partly agree |
| 13-1161.00 | Market Research Analysts and Marketing Specialists | 95 | 99 | +4 | observed use 100, rated potential 84, ability based 97, ilo tasks 94, market 100 | sources agree |
| 13-1161.01 | Search Marketing Strategists | 97 | 98 | +1 | observed use 99, rated potential 83, ability based 97, ilo tasks 94, market 96 | sources agree |
| 13-1199.00 | Business Operations Specialists, All Other | 82 | 86 | +3 | observed use 79, rated potential 84, ability based 78, ilo tasks 83, market 80 | sources agree |
| 13-1199.04 | Business Continuity Planners | 85 | 84 | -2 | observed use 75, rated potential 83, ability based 78, ilo tasks 83, market 77 | sources agree |
| 13-1199.05 | Sustainability Specialists | 86 | 83 | -3 | observed use 69, rated potential 93, ability based 78, ilo tasks 83, market 67 | sources agree |
| 13-1199.06 | Online Merchants | 87 | 91 | +4 | observed use 86, rated potential 87, ability based 78, ilo tasks 83, market 94 | sources agree |
| 13-1199.07 | Security Management Specialists | 82 | 83 | +1 | observed use 82, rated potential 74, ability based 78, ilo tasks 83, market 75 | sources agree |
| 13-2011.00 | Accountants and Auditors | 97 | 96 | -1 | observed use 90, rated potential 83, ability based 99, ilo tasks 91, market 95 | sources agree |
| 13-2022.00 | Appraisers of Personal and Business Property | 91 | 61 | -31 | observed use 24, rated potential 88, ability based –, ilo tasks 86, market 30 | sources disagree |
| 13-2023.00 | Appraisers and Assessors of Real Estate | 72 | 90 | +19 | observed use 86, rated potential 74, ability based –, ilo tasks 86, market 94 | sources agree |
| 13-2031.00 | Budget Analysts | 86 | 90 | +4 | observed use 67, rated potential 87, ability based 100, ilo tasks 91, market 80 | sources agree |
| 13-2041.00 | Credit Analysts | 90 | 95 | +5 | observed use 83, rated potential 87, ability based 92, ilo tasks 99, market 93 | sources agree |
| 13-2051.00 | Financial and Investment Analysts | 89 | 97 | +8 | observed use 99, rated potential 74, ability based 95, ilo tasks 98, market 99 | sources agree |
| 13-2052.00 | Personal Financial Advisors | 92 | 97 | +4 | observed use 93, rated potential 87, ability based 96, ilo tasks 97, market 89 | sources agree |
| 13-2053.00 | Insurance Underwriters | 85 | 76 | -9 | observed use 64, rated potential 86, ability based 89, ilo tasks 92, market 30 | sources partly agree |
| 13-2054.00 | Financial Risk Specialists | 89 | 96 | +8 | observed use 87, rated potential 86, ability based –, ilo tasks 99, market 95 | sources agree |
| 13-2061.00 | Financial Examiners | 83 | 87 | +3 | observed use 60, rated potential 83, ability based 100, ilo tasks 99, market 71 | sources partly agree |
| 13-2071.00 | Credit Counselors | 95 | 94 | -1 | observed use 85, rated potential 94, ability based 95, ilo tasks 98, market 77 | sources agree |
| 13-2072.00 | Loan Officers | 93 | 95 | +2 | observed use 81, rated potential 91, ability based 95, ilo tasks 98, market 85 | sources agree |
| 13-2081.00 | Tax Examiners and Collectors, and Revenue Agents | 84 | 85 | +2 | observed use 56, rated potential 92, ability based 94, ilo tasks 90, market 71 | sources agree |
| 13-2082.00 | Tax Preparers | 88 | 89 | +1 | observed use 77, rated potential 92, ability based 87, ilo tasks 91, market 76 | sources agree |
| 13-2099.00 | Financial Specialists, All Other | 93 | 94 | +1 | observed use 86, rated potential 95, ability based 93, ilo tasks 85, market 90 | sources agree |
| 13-2099.01 | Financial Quantitative Analysts | 96 | 97 | +1 | observed use 91, rated potential 96, ability based 93, ilo tasks 85, market 95 | sources agree |
| 13-2099.04 | Fraud Examiners, Investigators and Analysts | 85 | 88 | +3 | observed use 79, rated potential 81, ability based 93, ilo tasks 85, market 79 | sources agree |
| 15-1211.00 | Computer Systems Analysts | 97 | 92 | -5 | observed use 91, rated potential 88, ability based –, ilo tasks 90, market 81 | sources agree |
| 15-1211.01 | Health Informatics Specialists | 83 | 88 | +6 | observed use 84, rated potential 85, ability based –, ilo tasks 89, market 75 | sources agree |
| 15-1212.00 | Information Security Analysts | 99 | 98 | -0 | observed use 98, rated potential 90, ability based –, ilo tasks 89, market 98 | sources agree |
| 15-1221.00 | Computer and Information Research Scientists | 97 | 79 | -17 | observed use 93, rated potential 88, ability based –, ilo tasks 89, market 30 | sources disagree |
| 15-1231.00 | Computer Network Support Specialists | 94 | 93 | -2 | observed use 89, rated potential 88, ability based –, ilo tasks 83, market 96 | sources agree |
| 15-1232.00 | Computer User Support Specialists | 98 | 99 | +1 | observed use 98, rated potential 94, ability based –, ilo tasks 87, market 98 | sources agree |
| 15-1241.00 | Computer Network Architects | 92 | 91 | -1 | observed use 83, rated potential 91, ability based –, ilo tasks 92, market 80 | sources agree |
| 15-1241.01 | Telecommunications Engineering Specialists | 91 | 91 | -0 | observed use 82, rated potential 87, ability based –, ilo tasks 92, market 83 | sources agree |
| 15-1242.00 | Database Administrators | 99 | 99 | -0 | observed use 95, rated potential 97, ability based –, ilo tasks 96, market 90 | sources agree |
| 15-1243.00 | Database Architects | 100 | 99 | -0 | observed use 99, rated potential 96, ability based –, ilo tasks 96, market 96 | sources agree |
| 15-1243.01 | Data Warehousing Specialists | 100 | 100 | 0 | observed use 99, rated potential 99, ability based –, ilo tasks 96, market 97 | sources agree |
| 15-1244.00 | Network and Computer Systems Administrators | 98 | 97 | -1 | observed use 91, rated potential 91, ability based –, ilo tasks 96, market 94 | sources agree |
| 15-1251.00 | Computer Programmers | 100 | 100 | 0 | observed use 100, rated potential 99, ability based –, ilo tasks 97, market 100 | sources agree |
| 15-1252.00 | Software Developers | 98 | 96 | -2 | observed use 90, rated potential 89, ability based –, ilo tasks 92, market 93 | sources agree |
| 15-1253.00 | Software Quality Assurance Analysts and Testers | 100 | 95 | -5 | observed use 96, rated potential 97, ability based –, ilo tasks 93, market 75 | sources agree |
| 15-1254.00 | Web Developers | 100 | 100 | -0 | observed use 99, rated potential 98, ability based –, ilo tasks 95, market 98 | sources agree |
| 15-1255.00 | Web and Digital Interface Designers | 97 | 99 | +2 | observed use 89, rated potential 97, ability based –, ilo tasks 98, market 93 | sources agree |
| 15-1255.01 | Video Game Designers | 95 | 77 | -18 | observed use 77, rated potential 92, ability based –, ilo tasks 93, market 30 | sources disagree |
| 15-1299.00 | Computer Occupations, All Other | 96 | 92 | -4 | observed use 86, rated potential 95, ability based –, ilo tasks 89, market 77 | sources agree |
| 15-1299.01 | Web Administrators | 98 | 92 | -6 | observed use 90, rated potential 98, ability based –, ilo tasks 89, market 78 | sources agree |
| 15-1299.02 | Geographic Information Systems Technologists and Technicians | 94 | 95 | +1 | observed use 88, rated potential 91, ability based –, ilo tasks 89, market 95 | sources agree |
| 15-1299.03 | Document Management Specialists | 95 | 94 | -2 | observed use 92, rated potential 94, ability based –, ilo tasks 89, market 84 | sources agree |
| 15-1299.04 | Penetration Testers | 98 | 72 | -26 | observed use 58, rated potential 95, ability based –, ilo tasks 89, market 30 | sources disagree |
| 15-1299.05 | Information Security Engineers | 97 | 85 | -12 | observed use 73, rated potential 94, ability based –, ilo tasks 89, market 66 | sources agree |
| 15-1299.06 | Digital Forensics Analysts | 97 | 72 | -25 | observed use 58, rated potential 95, ability based –, ilo tasks 89, market 30 | sources disagree |
| 15-1299.07 | Blockchain Engineers | 99 | 72 | -27 | observed use 58, rated potential 94, ability based –, ilo tasks 89, market 30 | sources disagree |
| 15-1299.08 | Computer Systems Engineers/Architects | 98 | 94 | -4 | observed use 91, rated potential 93, ability based –, ilo tasks 89, market 87 | sources agree |
| 15-1299.09 | Information Technology Project Managers | 93 | 88 | -5 | observed use 90, rated potential 79, ability based –, ilo tasks 89, market 74 | sources agree |
| 15-2011.00 | Actuaries | 84 | 79 | -6 | observed use 65, rated potential 84, ability based 100, ilo tasks 95, market 30 | sources disagree |
| 15-2021.00 | Mathematicians | 99 | 99 | -0 | observed use 93, rated potential 99, ability based 99, ilo tasks 95, market 89 | sources agree |
| 15-2031.00 | Operations Research Analysts | 98 | 95 | -3 | observed use 93, rated potential 93, ability based 96, ilo tasks 95, market 76 | sources agree |
| 15-2041.00 | Statisticians | 96 | 98 | +1 | observed use 86, rated potential 97, ability based 95, ilo tasks 95, market 94 | sources agree |
| 15-2041.01 | Biostatisticians | 95 | 95 | +0 | observed use 80, rated potential 97, ability based 95, ilo tasks 95, market 87 | sources agree |
| 15-2051.00 | Data Scientists | 99 | 91 | -8 | observed use 80, rated potential 94, ability based –, ilo tasks 96, market 75 | sources agree |
| 15-2051.01 | Business Intelligence Analysts | 99 | 100 | +1 | observed use 99, rated potential 94, ability based –, ilo tasks 96, market 100 | sources agree |
| 15-2051.02 | Clinical Data Managers | 98 | 97 | -1 | observed use 91, rated potential 92, ability based –, ilo tasks 96, market 92 | sources agree |
| 15-2099.00 | Mathematical Science Occupations, All Other | 99 | 99 | 0 | observed use 96, rated potential 98, ability based –, ilo tasks 96, market 96 | sources agree |
| 15-2099.01 | Bioinformatics Technicians | 99 | 99 | 0 | observed use 96, rated potential 97, ability based –, ilo tasks 96, market 96 | sources agree |
| 17-1011.00 | Architects, Except Landscape and Naval | 74 | 74 | +0 | observed use 69, rated potential 69, ability based 78, ilo tasks 71, market 66 | sources agree |
| 17-1012.00 | Landscape Architects | 60 | 54 | -5 | observed use 25, rated potential 58, ability based 77, ilo tasks 71, market 30 | sources partly agree |
| 17-1021.00 | Cartographers and Photogrammetrists | 74 | 79 | +6 | observed use 72, rated potential 75, ability based 68, ilo tasks 84, market 79 | sources agree |
| 17-1022.00 | Surveyors | 57 | 57 | +0 | observed use 37, rated potential 70, ability based 53, ilo tasks 84, market 30 | sources partly agree |
| 17-1022.01 | Geodetic Surveyors | 61 | 58 | -3 | observed use 37, rated potential 72, ability based 53, ilo tasks 84, market 30 | sources partly agree |
| 17-2011.00 | Aerospace Engineers | 87 | 82 | -5 | observed use 71, rated potential 85, ability based 91, ilo tasks 60, market 81 | sources agree |
| 17-2021.00 | Agricultural Engineers | 59 | 51 | -8 | observed use 25, rated potential 58, ability based 72, ilo tasks 60, market 30 | sources partly agree |
| 17-2031.00 | Bioengineers and Biomedical Engineers | 84 | 81 | -2 | observed use 77, rated potential 89, ability based 73, ilo tasks 56, market 88 | sources agree |
| 17-2041.00 | Chemical Engineers | 68 | 56 | -12 | observed use 25, rated potential 61, ability based 91, ilo tasks 63, market 30 | sources partly agree |
| 17-2051.00 | Civil Engineers | 65 | 57 | -8 | observed use 37, rated potential 62, ability based 86, ilo tasks 55, market 30 | sources partly agree |
| 17-2051.01 | Transportation Engineers | 72 | 64 | -8 | observed use 50, rated potential 77, ability based 86, ilo tasks 55, market 30 | sources partly agree |
| 17-2051.02 | Water/Wastewater Engineers | 72 | 61 | -11 | observed use 37, rated potential 78, ability based 86, ilo tasks 55, market 30 | sources partly agree |
| 17-2061.00 | Computer Hardware Engineers | 88 | 83 | -5 | observed use 77, rated potential 75, ability based 81, ilo tasks 82, market 79 | sources agree |
| 17-2071.00 | Electrical Engineers | 80 | 66 | -14 | observed use 66, rated potential 73, ability based 80, ilo tasks 59, market 30 | sources partly agree |
| 17-2072.00 | Electronics Engineers, Except Computer | 77 | 84 | +7 | observed use 81, rated potential 85, ability based 64, ilo tasks 82, market 88 | sources agree |
| 17-2072.01 | Radio Frequency Identification Device Specialists | 80 | 66 | -14 | observed use 50, rated potential 80, ability based 64, ilo tasks 86, market 30 | sources partly agree |
| 17-2081.00 | Environmental Engineers | 82 | 71 | -11 | observed use 57, rated potential 81, ability based 92, ilo tasks 74, market 30 | sources partly agree |
| 17-2111.00 | Health and Safety Engineers, Except Mining Safety Engineers and Inspectors | 62 | 54 | -9 | observed use 25, rated potential 75, ability based 74, ilo tasks 56, market 30 | sources partly agree |
| 17-2111.02 | Fire-Prevention and Protection Engineers | 69 | 58 | -11 | observed use 25, rated potential 91, ability based 74, ilo tasks 56, market 30 | sources disagree |
| 17-2112.00 | Industrial Engineers | 74 | 65 | -9 | observed use 42, rated potential 85, ability based 81, ilo tasks 66, market 30 | sources partly agree |
| 17-2112.01 | Human Factors Engineers and Ergonomists | 72 | 67 | -5 | observed use 57, rated potential 82, ability based 81, ilo tasks 66, market 30 | sources partly agree |
| 17-2112.02 | Validation Engineers | 81 | 74 | -7 | observed use 56, rated potential 88, ability based 81, ilo tasks 66, market 63 | sources agree |
| 17-2112.03 | Manufacturing Engineers | 68 | 66 | -2 | observed use 60, rated potential 73, ability based 81, ilo tasks 66, market 30 | sources partly agree |
| 17-2121.00 | Marine Engineers and Naval Architects | 57 | 67 | +9 | observed use 62, rated potential 65, ability based 62, ilo tasks 60, market 63 | sources agree |
| 17-2131.00 | Materials Engineers | 65 | 51 | -13 | observed use 25, rated potential 63, ability based 77, ilo tasks 54, market 30 | sources partly agree |
| 17-2141.00 | Mechanical Engineers | 68 | 64 | -4 | observed use 73, rated potential 62, ability based 74, ilo tasks 60, market 30 | sources partly agree |
| 17-2141.01 | Fuel Cell Engineers | 71 | 62 | -10 | observed use 48, rated potential 75, ability based 74, ilo tasks 60, market 30 | sources partly agree |
| 17-2141.02 | Automotive Engineers | 83 | 80 | -3 | observed use 73, rated potential 93, ability based 74, ilo tasks 60, market 80 | sources agree |
| 17-2151.00 | Mining and Geological Engineers, Including Mining Safety Engineers | 71 | 59 | -12 | observed use 25, rated potential 77, ability based 92, ilo tasks 54, market 30 | sources disagree |
| 17-2161.00 | Nuclear Engineers | 77 | 59 | -17 | observed use 25, rated potential 82, ability based 88, ilo tasks 56, market 30 | sources disagree |
| 17-2171.00 | Petroleum Engineers | 73 | 70 | -2 | observed use 41, rated potential 77, ability based 85, ilo tasks 54, market 73 | sources partly agree |
| 17-2199.00 | Engineers, All Other | 67 | 71 | +4 | observed use 68, rated potential 70, ability based 67, ilo tasks 56, market 73 | sources agree |
| 17-2199.03 | Energy Engineers, Except Wind and Solar | 75 | 72 | -3 | observed use 65, rated potential 82, ability based 67, ilo tasks 56, market 71 | sources agree |
| 17-2199.05 | Mechatronics Engineers | 73 | 55 | -18 | observed use 47, rated potential 64, ability based 67, ilo tasks 56, market 30 | sources agree |
| 17-2199.06 | Microsystems Engineers | 71 | 72 | +1 | observed use 68, rated potential 78, ability based 67, ilo tasks 56, market 74 | sources agree |
| 17-2199.07 | Photonics Engineers | 67 | 67 | +0 | observed use 70, rated potential 57, ability based 67, ilo tasks 56, market 66 | sources agree |
| 17-2199.08 | Robotics Engineers | 77 | 77 | +0 | observed use 76, rated potential 82, ability based 67, ilo tasks 56, market 86 | sources agree |
| 17-2199.09 | Nanosystems Engineers | 77 | 76 | -1 | observed use 74, rated potential 82, ability based 67, ilo tasks 56, market 83 | sources agree |
| 17-2199.10 | Wind Energy Engineers | 66 | 58 | -8 | observed use 47, rated potential 76, ability based 67, ilo tasks 56, market 30 | sources partly agree |
| 17-2199.11 | Solar Energy Systems Engineers | 65 | 56 | -9 | observed use 47, rated potential 69, ability based 67, ilo tasks 56, market 30 | sources agree |
| 17-3011.00 | Architectural and Civil Drafters | 68 | 57 | -11 | observed use 25, rated potential 82, ability based 71, ilo tasks 62, market 30 | sources partly agree |
| 17-3012.00 | Electrical and Electronics Drafters | 79 | 75 | -4 | observed use 71, rated potential 81, ability based 71, ilo tasks 62, market 73 | sources agree |
| 17-3013.00 | Mechanical Drafters | 64 | 54 | -10 | observed use 25, rated potential 74, ability based 69, ilo tasks 62, market 30 | sources partly agree |
| 17-3019.00 | Drafters, All Other | 64 | 54 | -10 | observed use 25, rated potential 74, ability based 69, ilo tasks 62, market 30 | sources partly agree |
| 17-3021.00 | Aerospace Engineering and Operations Technologists and Technicians | 48 | 41 | -8 | observed use 25, rated potential 44, ability based 58, ilo tasks 43, market 30 | sources agree |
| 17-3022.00 | Civil Engineering Technologists and Technicians | 80 | 74 | -6 | observed use 72, rated potential 83, ability based 71, ilo tasks 48, market 80 | sources agree |
| 17-3023.00 | Electrical and Electronic Engineering Technologists and Technicians | 54 | 53 | -1 | observed use 54, rated potential 53, ability based 57, ilo tasks 64, market 30 | sources agree |
| 17-3024.00 | Electro-Mechanical and Mechatronics Technologists and Technicians | 41 | 35 | -6 | observed use 25, rated potential 44, ability based 40, ilo tasks 44, market 30 | sources agree |
| 17-3024.01 | Robotics Technicians | 46 | 37 | -9 | observed use 25, rated potential 49, ability based 40, ilo tasks 44, market 30 | sources agree |
| 17-3025.00 | Environmental Engineering Technologists and Technicians | 58 | 53 | -6 | observed use 72, rated potential 63, ability based 50, ilo tasks 42, market 30 | sources agree |
| 17-3026.00 | Industrial Engineering Technologists and Technicians | 57 | 46 | -11 | observed use 25, rated potential 64, ability based 63, ilo tasks 42, market 30 | sources partly agree |
| 17-3026.01 | Nanotechnology Engineering Technologists and Technicians | 54 | 44 | -10 | observed use 25, rated potential 54, ability based 63, ilo tasks 42, market 30 | sources agree |
| 17-3027.00 | Mechanical Engineering Technologists and Technicians | 60 | 52 | -8 | observed use 70, rated potential 66, ability based 47, ilo tasks 43, market 30 | sources agree |
| 17-3027.01 | Automotive Engineering Technicians | 48 | 49 | +1 | observed use 73, rated potential 41, ability based 47, ilo tasks 43, market 30 | sources agree |
| 17-3028.00 | Calibration Technologists and Technicians | 51 | 38 | -13 | observed use 24, rated potential 48, ability based –, ilo tasks 49, market 30 | sources agree |
| 17-3029.00 | Engineering Technologists and Technicians, Except Drafters, All Other | 51 | 39 | -13 | observed use 25, rated potential 41, ability based 54, ilo tasks 42, market 30 | sources agree |
| 17-3029.01 | Non-Destructive Testing Specialists | 46 | 41 | -4 | observed use 25, rated potential 45, ability based 54, ilo tasks 48, market 30 | sources agree |
| 17-3029.08 | Photonics Technicians | 41 | 37 | -4 | observed use 25, rated potential 38, ability based 54, ilo tasks 42, market 30 | sources agree |
| 17-3031.00 | Surveying and Mapping Technicians | 58 | 46 | -12 | observed use 25, rated potential 71, ability based 51, ilo tasks 48, market 30 | sources partly agree |
| 19-1011.00 | Animal Scientists | 69 | 65 | -4 | observed use 25, rated potential 93, ability based 77, ilo tasks 79, market 30 | sources disagree |
| 19-1012.00 | Food Scientists and Technologists | 54 | 56 | +2 | observed use 25, rated potential 65, ability based 68, ilo tasks 79, market 30 | sources partly agree |
| 19-1013.00 | Soil and Plant Scientists | 65 | 64 | -1 | observed use 69, rated potential 86, ability based 63, ilo tasks 52, market 30 | sources partly agree |
| 19-1021.00 | Biochemists and Biophysicists | 67 | 76 | +9 | observed use 70, rated potential 69, ability based 70, ilo tasks 79, market 72 | sources agree |
| 19-1022.00 | Microbiologists | 62 | 63 | +1 | observed use 70, rated potential 54, ability based 64, ilo tasks 79, market 30 | sources partly agree |
| 19-1023.00 | Zoologists and Wildlife Biologists | 61 | 66 | +5 | observed use 63, rated potential 78, ability based 57, ilo tasks 79, market 30 | sources partly agree |
| 19-1029.00 | Biological Scientists, All Other | 84 | 84 | -0 | observed use 85, rated potential 81, ability based 75, ilo tasks 79, market 78 | sources agree |
| 19-1029.01 | Bioinformatics Scientists | 89 | 91 | +2 | observed use 90, rated potential 92, ability based 75, ilo tasks 79, market 93 | sources agree |
| 19-1029.02 | Molecular and Cellular Biologists | 80 | 70 | -10 | observed use 72, rated potential 71, ability based 75, ilo tasks 79, market 30 | sources partly agree |
| 19-1029.03 | Geneticists | 82 | 86 | +4 | observed use 91, rated potential 79, ability based 75, ilo tasks 79, market 84 | sources agree |
| 19-1029.04 | Biologists | 79 | 70 | -9 | observed use 74, rated potential 69, ability based 75, ilo tasks 79, market 30 | sources partly agree |
| 19-1031.00 | Conservation Scientists | 52 | 52 | 0 | observed use 25, rated potential 73, ability based 51, ilo tasks 75, market 30 | sources partly agree |
| 19-1031.02 | Range Managers | 47 | 50 | +3 | observed use 25, rated potential 59, ability based 51, ilo tasks 75, market 30 | sources partly agree |
| 19-1031.03 | Park Naturalists | 59 | 53 | -6 | observed use 25, rated potential 78, ability based 51, ilo tasks 75, market 30 | sources partly agree |
| 19-1032.00 | Foresters | 45 | 43 | -2 | observed use 25, rated potential 58, ability based 45, ilo tasks 52, market 30 | sources agree |
| 19-1041.00 | Epidemiologists | 70 | 69 | -0 | observed use 40, rated potential 77, ability based 98, ilo tasks 79, market 30 | sources disagree |
| 19-1042.00 | Medical Scientists, Except Epidemiologists | 77 | 71 | -6 | observed use 57, rated potential 85, ability based 86, ilo tasks 79, market 30 | sources partly agree |
| 19-1099.00 | Life Scientists, All Other | 69 | 65 | -4 | observed use 25, rated potential 93, ability based 77, ilo tasks 79, market 30 | sources disagree |
| 19-2011.00 | Astronomers | 86 | 89 | +3 | observed use 93, rated potential 67, ability based 94, ilo tasks 74, market 92 | sources agree |
| 19-2012.00 | Physicists | 97 | 92 | -4 | observed use 87, rated potential 96, ability based 92, ilo tasks 74, market 93 | sources agree |
| 19-2021.00 | Atmospheric and Space Scientists | 84 | 78 | -6 | observed use 64, rated potential 89, ability based 94, ilo tasks 93, market 30 | sources partly agree |
| 19-2031.00 | Chemists | 65 | 67 | +2 | observed use 86, rated potential 60, ability based 60, ilo tasks 76, market 30 | sources partly agree |
| 19-2032.00 | Materials Scientists | 78 | 80 | +2 | observed use 80, rated potential 80, ability based 77, ilo tasks 61, market 80 | sources agree |
| 19-2041.00 | Environmental Scientists and Specialists, Including Health | 72 | 84 | +12 | observed use 75, rated potential 87, ability based 76, ilo tasks 75, market 87 | sources agree |
| 19-2041.01 | Climate Change Policy Analysts | 76 | 68 | -8 | observed use 45, rated potential 92, ability based 76, ilo tasks 75, market 30 | sources partly agree |
| 19-2041.02 | Environmental Restoration Planners | 74 | 67 | -7 | observed use 45, rated potential 87, ability based 76, ilo tasks 75, market 30 | sources partly agree |
| 19-2041.03 | Industrial Ecologists | 75 | 70 | -4 | observed use 58, rated potential 91, ability based 76, ilo tasks 75, market 30 | sources partly agree |
| 19-2042.00 | Geoscientists, Except Hydrologists and Geographers | 63 | 61 | -2 | observed use 59, rated potential 67, ability based 65, ilo tasks 65, market 30 | sources agree |
| 19-2043.00 | Hydrologists | 70 | 62 | -8 | observed use 48, rated potential 82, ability based 63, ilo tasks 65, market 30 | sources partly agree |
| 19-2099.00 | Physical Scientists, All Other | 70 | 72 | +2 | observed use 60, rated potential 61, ability based 81, ilo tasks –, market 70 | sources agree |
| 19-2099.01 | Remote Sensing Scientists and Technologists | 67 | 73 | +6 | observed use 60, rated potential 66, ability based 81, ilo tasks –, market 70 | sources agree |
| 19-3011.00 | Economists | 91 | 95 | +4 | observed use 91, rated potential 74, ability based 96, ilo tasks 94, market 96 | sources agree |
| 19-3011.01 | Environmental Economists | 95 | 96 | +1 | observed use 84, rated potential 95, ability based 96, ilo tasks 94, market 91 | sources agree |
| 19-3022.00 | Survey Researchers | 98 | 99 | +1 | observed use 95, rated potential 96, ability based 97, ilo tasks 95, market 96 | sources agree |
| 19-3032.00 | Industrial-Organizational Psychologists | 86 | 86 | -0 | observed use 81, rated potential 82, ability based 96, ilo tasks 77, market 67 | sources agree |
| 19-3033.00 | Clinical and Counseling Psychologists | 56 | 62 | +5 | observed use 61, rated potential 62, ability based –, ilo tasks 77, market 30 | sources partly agree |
| 19-3034.00 | School Psychologists | 56 | 75 | +19 | observed use 61, rated potential 75, ability based –, ilo tasks 77, market 71 | sources agree |
| 19-3039.00 | Psychologists, All Other | 76 | 76 | +1 | observed use 46, rated potential 64, ability based 96, ilo tasks 77, market 79 | sources partly agree |
| 19-3039.02 | Neuropsychologists | 70 | 76 | +6 | observed use 47, rated potential 61, ability based 96, ilo tasks 77, market 81 | sources partly agree |
| 19-3039.03 | Clinical Neuropsychologists | 69 | 76 | +7 | observed use 47, rated potential 60, ability based 96, ilo tasks 77, market 82 | sources partly agree |
| 19-3041.00 | Sociologists | 96 | 98 | +2 | observed use 95, rated potential 90, ability based 97, ilo tasks 88, market 96 | sources agree |
| 19-3051.00 | Urban and Regional Planners | 76 | 78 | +2 | observed use 63, rated potential 80, ability based 84, ilo tasks 81, market 64 | sources agree |
| 19-3091.00 | Anthropologists and Archeologists | 66 | 84 | +17 | observed use 81, rated potential 77, ability based 64, ilo tasks 88, market 88 | sources agree |
| 19-3092.00 | Geographers | 87 | 89 | +2 | observed use 76, rated potential 72, ability based 98, ilo tasks 88, market 85 | sources agree |
| 19-3093.00 | Historians | 66 | 69 | +4 | observed use 55, rated potential 73, ability based 79, ilo tasks 87, market 30 | sources partly agree |
| 19-3094.00 | Political Scientists | 92 | 90 | -2 | observed use 95, rated potential 80, ability based 97, ilo tasks 87, market 67 | sources agree |
| 19-3099.00 | Social Scientists and Related Workers, All Other | 77 | 76 | -0 | observed use 56, rated potential 90, ability based 90, ilo tasks 98, market 30 | sources disagree |
| 19-3099.01 | Transportation Planners | 79 | 75 | -4 | observed use 56, rated potential 89, ability based 90, ilo tasks 92, market 30 | sources partly agree |
| 19-4012.00 | Agricultural Technicians | 43 | 50 | +7 | observed use 50, rated potential 40, ability based –, ilo tasks 43, market 61 | sources agree |
| 19-4012.01 | Precision Agriculture Technicians | 63 | 48 | -15 | observed use 37, rated potential 75, ability based –, ilo tasks 43, market 30 | sources partly agree |
| 19-4013.00 | Food Science Technicians | 64 | 52 | -12 | observed use 81, rated potential 50, ability based –, ilo tasks 43, market 30 | sources partly agree |
| 19-4021.00 | Biological Technicians | 58 | 69 | +11 | observed use 65, rated potential 51, ability based 57, ilo tasks 74, market 73 | sources agree |
| 19-4031.00 | Chemical Technicians | 63 | 71 | +7 | observed use 92, rated potential 59, ability based 50, ilo tasks 43, market 88 | sources partly agree |
| 19-4042.00 | Environmental Science and Protection Technicians, Including Health | 71 | 80 | +9 | observed use 79, rated potential 65, ability based –, ilo tasks 74, market 86 | sources agree |
| 19-4043.00 | Geological Technicians, Except Hydrologic Technicians | 67 | 70 | +2 | observed use 84, rated potential 50, ability based –, ilo tasks 46, market 79 | sources partly agree |
| 19-4044.00 | Hydrologic Technicians | 78 | 43 | -36 | observed use 24, rated potential 69, ability based –, ilo tasks 44, market 30 | sources partly agree |
| 19-4051.00 | Nuclear Technicians | 36 | 36 | -0 | observed use 25, rated potential 35, ability based 54, ilo tasks 42, market 30 | sources agree |
| 19-4051.02 | Nuclear Monitoring Technicians | 40 | 39 | -0 | observed use 25, rated potential 43, ability based 54, ilo tasks 42, market 30 | sources agree |
| 19-4061.00 | Social Science Research Assistants | 95 | 97 | +2 | observed use 96, rated potential 94, ability based 83, ilo tasks 96, market 96 | sources agree |
| 19-4071.00 | Forest and Conservation Technicians | 47 | 54 | +8 | observed use 57, rated potential 50, ability based –, ilo tasks 31, market 72 | sources agree |
| 19-4092.00 | Forensic Science Technicians | 51 | 41 | -9 | observed use 25, rated potential 49, ability based 56, ilo tasks 42, market 30 | sources agree |
| 19-4099.00 | Life, Physical, and Social Science Technicians, All Other | 65 | 68 | +3 | observed use 72, rated potential 72, ability based 59, ilo tasks 42, market 73 | sources agree |
| 19-4099.01 | Quality Control Analysts | 70 | 58 | -13 | observed use 69, rated potential 75, ability based 59, ilo tasks 42, market 30 | sources partly agree |
| 19-4099.03 | Remote Sensing Technicians | 73 | 71 | -2 | observed use 73, rated potential 79, ability based 59, ilo tasks 43, market 82 | sources agree |
| 19-5011.00 | Occupational Health and Safety Specialists | 45 | 40 | -5 | observed use 25, rated potential 53, ability based –, ilo tasks 49, market 30 | sources agree |
| 19-5012.00 | Occupational Health and Safety Technicians | 50 | 39 | -11 | observed use 25, rated potential 61, ability based –, ilo tasks 38, market 30 | sources agree |
| 21-1011.00 | Substance Abuse and Behavioral Disorder Counselors | 49 | 51 | +2 | observed use 51, rated potential 40, ability based 77, ilo tasks 50, market 30 | sources partly agree |
| 21-1012.00 | Educational, Guidance, and Career Counselors and Advisors | 62 | 65 | +3 | observed use 80, rated potential 54, ability based 73, ilo tasks 65, market 30 | sources partly agree |
| 21-1013.00 | Marriage and Family Therapists | 53 | 49 | -4 | observed use 25, rated potential 35, ability based 94, ilo tasks 50, market 30 | sources partly agree |
| 21-1014.00 | Mental Health Counselors | 62 | 56 | -5 | observed use 56, rated potential 41, ability based 91, ilo tasks 50, market 30 | sources partly agree |
| 21-1015.00 | Rehabilitation Counselors | 51 | 48 | -3 | observed use 25, rated potential 67, ability based 60, ilo tasks 50, market 30 | sources partly agree |
| 21-1019.00 | Counselors, All Other | 62 | 61 | -0 | observed use 80, rated potential 54, ability based 73, ilo tasks 50, market 30 | sources partly agree |
| 21-1021.00 | Child, Family, and School Social Workers | 47 | 47 | -0 | observed use 37, rated potential 45, ability based 66, ilo tasks 50, market 30 | sources agree |
| 21-1022.00 | Healthcare Social Workers | 62 | 71 | +9 | observed use 73, rated potential 60, ability based 71, ilo tasks 50, market 82 | sources agree |
| 21-1023.00 | Mental Health and Substance Abuse Social Workers | 54 | 67 | +13 | observed use 50, rated potential 47, ability based 80, ilo tasks 50, market 85 | sources partly agree |
| 21-1029.00 | Social Workers, All Other | 47 | 47 | -0 | observed use 37, rated potential 45, ability based 66, ilo tasks 50, market 30 | sources agree |
| 21-1091.00 | Health Education Specialists | 77 | 74 | -2 | observed use 77, rated potential 80, ability based 64, ilo tasks 49, market 84 | sources agree |
| 21-1092.00 | Probation Officers and Correctional Treatment Specialists | 54 | 47 | -7 | observed use 25, rated potential 62, ability based 62, ilo tasks 50, market 30 | sources partly agree |
| 21-1093.00 | Social and Human Service Assistants | 53 | 49 | -4 | observed use 25, rated potential 59, ability based 59, ilo tasks 61, market 30 | sources partly agree |
| 21-1094.00 | Community Health Workers | 44 | 39 | -5 | observed use 25, rated potential 54, ability based 49, ilo tasks 34, market 30 | sources agree |
| 21-1099.00 | Community and Social Service Specialists, All Other | 44 | 42 | -2 | observed use 25, rated potential 54, ability based 49, ilo tasks 50, market 30 | sources agree |
| 21-2011.00 | Clergy | 68 | 62 | -6 | observed use 76, rated potential 44, ability based 86, ilo tasks 15, market 68 | sources disagree |
| 21-2021.00 | Directors, Religious Activities and Education | 75 | 57 | -18 | observed use 79, rated potential 66, ability based 83, ilo tasks 15, market 30 | sources disagree |
| 21-2099.00 | Religious Workers, All Other | 75 | 55 | -21 | observed use 79, rated potential 66, ability based 83, ilo tasks 5, market 30 | sources disagree |
| 23-1011.00 | Lawyers | 78 | 80 | +2 | observed use 79, rated potential 68, ability based 90, ilo tasks 65, market 78 | sources agree |
| 23-1012.00 | Judicial Law Clerks | 89 | 91 | +2 | observed use 82, rated potential 78, ability based 99, ilo tasks 78, market 95 | sources agree |
| 23-1021.00 | Administrative Law Judges, Adjudicators, and Hearing Officers | 91 | 86 | -5 | observed use 90, rated potential 69, ability based 95, ilo tasks 58, market 95 | sources agree |
| 23-1022.00 | Arbitrators, Mediators, and Conciliators | 91 | 87 | -4 | observed use 87, rated potential 69, ability based 98, ilo tasks 72, market 87 | sources agree |
| 23-1023.00 | Judges, Magistrate Judges, and Magistrates | 85 | 84 | -2 | observed use 89, rated potential 54, ability based 99, ilo tasks 58, market 95 | sources partly agree |
| 23-2011.00 | Paralegals and Legal Assistants | 89 | 85 | -4 | observed use 83, rated potential 77, ability based 87, ilo tasks 78, market 78 | sources agree |
| 23-2093.00 | Title Examiners, Abstractors, and Searchers | 79 | 68 | -10 | observed use 39, rated potential 86, ability based 86, ilo tasks 78, market 30 | sources partly agree |
| 23-2099.00 | Legal Support Workers, All Other | 79 | 68 | -10 | observed use 39, rated potential 86, ability based 86, ilo tasks 78, market 30 | sources partly agree |
| 25-1011.00 | Business Teachers, Postsecondary | 88 | 87 | -1 | observed use 92, rated potential 70, ability based 92, ilo tasks 69, market 90 | sources agree |
| 25-1021.00 | Computer Science Teachers, Postsecondary | 86 | 86 | -0 | observed use 88, rated potential 71, ability based 85, ilo tasks 69, market 91 | sources agree |
| 25-1022.00 | Mathematical Science Teachers, Postsecondary | 94 | 88 | -6 | observed use 96, rated potential 78, ability based 91, ilo tasks 69, market 82 | sources agree |
| 25-1031.00 | Architecture Teachers, Postsecondary | 67 | 78 | +10 | observed use 55, rated potential 70, ability based 84, ilo tasks 69, market 91 | sources agree |
| 25-1032.00 | Engineering Teachers, Postsecondary | 92 | 90 | -2 | observed use 94, rated potential 74, ability based 93, ilo tasks 69, market 95 | sources agree |
| 25-1041.00 | Agricultural Sciences Teachers, Postsecondary | 63 | 78 | +15 | observed use 59, rated potential 84, ability based 66, ilo tasks 69, market 94 | sources agree |
| 25-1042.00 | Biological Science Teachers, Postsecondary | 83 | 85 | +2 | observed use 91, rated potential 67, ability based 84, ilo tasks 69, market 92 | sources agree |
| 25-1043.00 | Forestry and Conservation Science Teachers, Postsecondary | 69 | 82 | +14 | observed use 72, rated potential 71, ability based 85, ilo tasks 69, market 92 | sources agree |
| 25-1051.00 | Atmospheric, Earth, Marine, and Space Sciences Teachers, Postsecondary | 73 | 84 | +11 | observed use 79, rated potential 68, ability based 88, ilo tasks 69, market 94 | sources agree |
| 25-1052.00 | Chemistry Teachers, Postsecondary | 81 | 85 | +5 | observed use 91, rated potential 63, ability based 90, ilo tasks 69, market 90 | sources agree |
| 25-1053.00 | Environmental Science Teachers, Postsecondary | 78 | 85 | +6 | observed use 74, rated potential 74, ability based 92, ilo tasks 69, market 92 | sources agree |
| 25-1054.00 | Physics Teachers, Postsecondary | 60 | 76 | +16 | observed use 61, rated potential 61, ability based 78, ilo tasks 69, market 91 | sources agree |
| 25-1061.00 | Anthropology and Archeology Teachers, Postsecondary | 77 | 84 | +8 | observed use 76, rated potential 72, ability based 89, ilo tasks 69, market 93 | sources agree |
| 25-1062.00 | Area, Ethnic, and Cultural Studies Teachers, Postsecondary | 73 | 80 | +7 | observed use 59, rated potential 72, ability based 88, ilo tasks 69, market 92 | sources agree |
| 25-1063.00 | Economics Teachers, Postsecondary | 69 | 81 | +12 | observed use 58, rated potential 72, ability based 89, ilo tasks 69, market 94 | sources agree |
| 25-1064.00 | Geography Teachers, Postsecondary | 69 | 80 | +11 | observed use 57, rated potential 73, ability based 89, ilo tasks 69, market 92 | sources agree |
| 25-1065.00 | Political Science Teachers, Postsecondary | 71 | 81 | +10 | observed use 59, rated potential 68, ability based 94, ilo tasks 69, market 94 | sources agree |
| 25-1066.00 | Psychology Teachers, Postsecondary | 87 | 87 | -0 | observed use 94, rated potential 68, ability based 90, ilo tasks 69, market 90 | sources agree |
| 25-1067.00 | Sociology Teachers, Postsecondary | 66 | 79 | +13 | observed use 59, rated potential 65, ability based 92, ilo tasks 69, market 91 | sources agree |
| 25-1069.00 | Social Sciences Teachers, Postsecondary, All Other | 71 | 81 | +10 | observed use 59, rated potential 68, ability based 94, ilo tasks 69, market 94 | sources agree |
| 25-1071.00 | Health Specialties Teachers, Postsecondary | 79 | 82 | +3 | observed use 90, rated potential 67, ability based 71, ilo tasks 69, market 91 | sources agree |
| 25-1072.00 | Nursing Instructors and Teachers, Postsecondary | 64 | 73 | +9 | observed use 83, rated potential 57, ability based 61, ilo tasks 69, market 76 | sources agree |
| 25-1081.00 | Education Teachers, Postsecondary | 84 | 85 | +1 | observed use 89, rated potential 73, ability based 83, ilo tasks 69, market 89 | sources agree |
| 25-1082.00 | Library Science Teachers, Postsecondary | 78 | 86 | +8 | observed use 73, rated potential 73, ability based 95, ilo tasks 69, market 94 | sources agree |
| 25-1111.00 | Criminal Justice and Law Enforcement Teachers, Postsecondary | 76 | 79 | +3 | observed use 56, rated potential 70, ability based 96, ilo tasks 69, market 84 | sources agree |
| 25-1112.00 | Law Teachers, Postsecondary | 68 | 84 | +16 | observed use 60, rated potential 80, ability based 93, ilo tasks 69, market 97 | sources agree |
| 25-1113.00 | Social Work Teachers, Postsecondary | 65 | 81 | +16 | observed use 58, rated potential 74, ability based 92, ilo tasks 69, market 92 | sources agree |
| 25-1121.00 | Art, Drama, and Music Teachers, Postsecondary | 70 | 80 | +10 | observed use 85, rated potential 77, ability based 66, ilo tasks 69, market 82 | sources agree |
| 25-1122.00 | Communications Teachers, Postsecondary | 81 | 87 | +6 | observed use 88, rated potential 77, ability based 92, ilo tasks 69, market 88 | sources agree |
| 25-1123.00 | English Language and Literature Teachers, Postsecondary | 94 | 91 | -3 | observed use 95, rated potential 84, ability based 97, ilo tasks 69, market 86 | sources agree |
| 25-1124.00 | Foreign Language and Literature Teachers, Postsecondary | 90 | 89 | -1 | observed use 92, rated potential 86, ability based 90, ilo tasks 69, market 85 | sources agree |
| 25-1125.00 | History Teachers, Postsecondary | 87 | 90 | +3 | observed use 82, rated potential 86, ability based 98, ilo tasks 69, market 90 | sources agree |
| 25-1126.00 | Philosophy and Religion Teachers, Postsecondary | 88 | 90 | +2 | observed use 90, rated potential 85, ability based 94, ilo tasks 69, market 89 | sources agree |
| 25-1192.00 | Family and Consumer Sciences Teachers, Postsecondary | 74 | 80 | +7 | observed use 56, rated potential 91, ability based 83, ilo tasks 69, market 82 | sources agree |
| 25-1193.00 | Recreation and Fitness Studies Teachers, Postsecondary | 84 | 88 | +4 | observed use 86, rated potential 90, ability based 82, ilo tasks 69, market 88 | sources agree |
| 25-1194.00 | Career/Technical Education Teachers, Postsecondary | 67 | 63 | -3 | observed use 80, rated potential 72, ability based 53, ilo tasks 63, market 30 | sources partly agree |
| 25-1199.00 | Postsecondary Teachers, All Other | 74 | 80 | +7 | observed use 56, rated potential 91, ability based 83, ilo tasks 69, market 82 | sources agree |
| 25-2011.00 | Preschool Teachers, Except Special Education | 38 | 47 | +9 | observed use 46, rated potential 41, ability based 49, ilo tasks 31, market 61 | sources agree |
| 25-2012.00 | Kindergarten Teachers, Except Special Education | 42 | 51 | +9 | observed use 48, rated potential 41, ability based 58, ilo tasks 31, market 69 | sources agree |
| 25-2021.00 | Elementary School Teachers, Except Special Education | 61 | 65 | +3 | observed use 76, rated potential 47, ability based 70, ilo tasks 43, market 65 | sources agree |
| 25-2022.00 | Middle School Teachers, Except Special and Career/Technical Education | 76 | 73 | -3 | observed use 94, rated potential 57, ability based 87, ilo tasks 43, market 66 | sources partly agree |
| 25-2023.00 | Career/Technical Education Teachers, Middle School | 49 | 62 | +13 | observed use 51, rated potential 49, ability based 62, ilo tasks 63, market 69 | sources agree |
| 25-2031.00 | Secondary School Teachers, Except Special and Career/Technical Education | 72 | 75 | +3 | observed use 92, rated potential 57, ability based 83, ilo tasks 54, market 73 | sources agree |
| 25-2032.00 | Career/Technical Education Teachers, Secondary School | 49 | 62 | +13 | observed use 51, rated potential 50, ability based 58, ilo tasks 63, market 70 | sources agree |
| 25-2051.00 | Special Education Teachers, Preschool | 40 | 59 | +18 | observed use 60, rated potential 40, ability based 58, ilo tasks 51, market 67 | sources agree |
| 25-2055.00 | Special Education Teachers, Kindergarten | 25 | 65 | +40 | observed use 77, rated potential 45, ability based –, ilo tasks 51, market 70 | sources agree |
| 25-2056.00 | Special Education Teachers, Elementary School | 35 | 64 | +29 | observed use 75, rated potential 50, ability based –, ilo tasks 51, market 63 | sources agree |
| 25-2057.00 | Special Education Teachers, Middle School | 58 | 67 | +9 | observed use 82, rated potential 50, ability based –, ilo tasks 51, market 66 | sources agree |
| 25-2058.00 | Special Education Teachers, Secondary School | 56 | 66 | +11 | observed use 80, rated potential 50, ability based –, ilo tasks 51, market 66 | sources agree |
| 25-2059.00 | Special Education Teachers, All Other | 38 | 50 | +12 | observed use 53, rated potential 41, ability based 30, ilo tasks 51, market 64 | sources agree |
| 25-2059.01 | Adapted Physical Education Specialists | 48 | 51 | +3 | observed use 53, rated potential 51, ability based 30, ilo tasks 51, market 64 | sources agree |
| 25-3011.00 | Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors | 72 | 75 | +3 | observed use 73, rated potential 64, ability based 92, ilo tasks 62, market 65 | sources agree |
| 25-3021.00 | Self-Enrichment Teachers | 58 | 65 | +7 | observed use 72, rated potential 54, ability based 62, ilo tasks 39, market 77 | sources agree |
| 25-3031.00 | Substitute Teachers, Short-Term | 44 | 59 | +15 | observed use 55, rated potential 38, ability based –, ilo tasks 61, market 68 | sources agree |
| 25-3041.00 | Tutors | 93 | 78 | -16 | observed use 95, rated potential 72, ability based –, ilo tasks 61, market 68 | sources agree |
| 25-3099.00 | Teachers and Instructors, All Other | 93 | 76 | -17 | observed use 78, rated potential 66, ability based 89, ilo tasks 62, market 65 | sources agree |
| 25-4011.00 | Archivists | 74 | 83 | +9 | observed use 77, rated potential 80, ability based 64, ilo tasks 88, market 82 | sources agree |
| 25-4012.00 | Curators | 82 | 86 | +4 | observed use 96, rated potential 81, ability based 66, ilo tasks 88, market 78 | sources agree |
| 25-4013.00 | Museum Technicians and Conservators | 38 | 43 | +5 | observed use 25, rated potential 40, ability based 47, ilo tasks 71, market 30 | sources partly agree |
| 25-4022.00 | Librarians and Media Collections Specialists | 87 | 91 | +4 | observed use 83, rated potential 83, ability based –, ilo tasks 94, market 84 | sources agree |
| 25-4031.00 | Library Technicians | 66 | 74 | +8 | observed use 61, rated potential 86, ability based 50, ilo tasks 87, market 69 | sources agree |
| 25-9021.00 | Farm and Home Management Educators | 55 | 50 | -5 | observed use 25, rated potential 68, ability based 69, ilo tasks 52, market 30 | sources partly agree |
| 25-9031.00 | Instructional Coordinators | 87 | 90 | +3 | observed use 90, rated potential 80, ability based 88, ilo tasks 78, market 89 | sources agree |
| 25-9042.00 | Teaching Assistants, Preschool, Elementary, Middle, and Secondary School, Except Special Education | 45 | 62 | +17 | observed use 85, rated potential 48, ability based –, ilo tasks 38, market 62 | sources partly agree |
| 25-9043.00 | Teaching Assistants, Special Education | 27 | 55 | +28 | observed use 74, rated potential 38, ability based –, ilo tasks 38, market 62 | sources partly agree |
| 25-9044.00 | Teaching Assistants, Postsecondary | 81 | 75 | -5 | observed use 73, rated potential 67, ability based –, ilo tasks 69, market 75 | sources agree |
| 25-9049.00 | Teaching Assistants, All Other | 27 | 55 | +28 | observed use 74, rated potential 38, ability based –, ilo tasks 38, market 62 | sources partly agree |
| 25-9099.00 | Educational Instruction and Library Workers, All Other | 87 | 86 | -1 | observed use 90, rated potential 80, ability based 88, ilo tasks 61, market 89 | sources agree |
| 27-1011.00 | Art Directors | 81 | 81 | +0 | observed use 81, rated potential 74, ability based 76, ilo tasks 66, market 86 | sources agree |
| 27-1012.00 | Craft Artists | 32 | 31 | -1 | observed use 62, rated potential 36, ability based 20, ilo tasks 16, market 30 | sources partly agree |
| 27-1013.00 | Fine Artists, Including Painters, Sculptors, and Illustrators | 60 | 63 | +3 | observed use 94, rated potential 54, ability based 33, ilo tasks 31, market 84 | sources disagree |
| 27-1014.00 | Special Effects Artists and Animators | 83 | 89 | +6 | observed use 93, rated potential 79, ability based 65, ilo tasks 90, market 92 | sources agree |
| 27-1019.00 | Artists and Related Workers, All Other | 32 | 36 | +4 | observed use 62, rated potential 36, ability based 20, ilo tasks –, market 30 | sources partly agree |
| 27-1021.00 | Commercial and Industrial Designers | 64 | 70 | +6 | observed use 60, rated potential 68, ability based 70, ilo tasks 63, market 67 | sources agree |
| 27-1022.00 | Fashion Designers | 59 | 66 | +7 | observed use 61, rated potential 58, ability based 62, ilo tasks 63, market 63 | sources agree |
| 27-1023.00 | Floral Designers | 33 | 25 | -8 | observed use 25, rated potential 37, ability based 41, ilo tasks 11, market 30 | sources agree |
| 27-1024.00 | Graphic Designers | 81 | 86 | +5 | observed use 91, rated potential 72, ability based 65, ilo tasks 90, market 88 | sources agree |
| 27-1025.00 | Interior Designers | 68 | 56 | -12 | observed use 25, rated potential 66, ability based 80, ilo tasks 67, market 30 | sources partly agree |
| 27-1026.00 | Merchandise Displayers and Window Trimmers | 28 | 35 | +8 | observed use 25, rated potential 45, ability based 17, ilo tasks 67, market 30 | sources partly agree |
| 27-1027.00 | Set and Exhibit Designers | 47 | 47 | -0 | observed use 25, rated potential 58, ability based 48, ilo tasks 67, market 30 | sources partly agree |
| 27-1029.00 | Designers, All Other | 33 | 40 | +7 | observed use 25, rated potential 37, ability based 41, ilo tasks 63, market 30 | sources agree |
| 27-2011.00 | Actors | 49 | 58 | +8 | observed use 71, rated potential 30, ability based 53, ilo tasks 59, market 62 | sources agree |
| 27-2012.00 | Producers and Directors | 69 | 75 | +5 | observed use 76, rated potential 69, ability based 71, ilo tasks 66, market 72 | sources agree |
| 27-2012.03 | Media Programming Directors | 72 | 67 | -5 | observed use 62, rated potential 83, ability based 71, ilo tasks 66, market 30 | sources partly agree |
| 27-2012.04 | Talent Directors | 75 | 64 | -11 | observed use 67, rated potential 64, ability based 71, ilo tasks 66, market 30 | sources agree |
| 27-2012.05 | Media Technical Directors/Managers | 66 | 56 | -9 | observed use 49, rated potential 54, ability based 71, ilo tasks 66, market 30 | sources agree |
| 27-2021.00 | Athletes and Sports Competitors | 1 | 8 | +7 | observed use 25, rated potential 3, ability based 2, ilo tasks 35, market 30 | sources agree |
| 27-2022.00 | Coaches and Scouts | 45 | 45 | -0 | observed use 25, rated potential 38, ability based 52, ilo tasks 73, market 30 | sources partly agree |
| 27-2023.00 | Umpires, Referees, and Other Sports Officials | 43 | 43 | +0 | observed use 25, rated potential 37, ability based 48, ilo tasks 73, market 30 | sources partly agree |
| 27-2031.00 | Dancers | 1 | 7 | +6 | observed use 25, rated potential 8, ability based 0, ilo tasks 26, market 30 | sources agree |
| 27-2032.00 | Choreographers | 28 | 30 | +2 | observed use 66, rated potential 35, ability based 5, ilo tasks 26, market 30 | sources partly agree |
| 27-2041.00 | Music Directors and Composers | 77 | 59 | -18 | observed use 59, rated potential 72, ability based 70, ilo tasks 49, market 30 | sources partly agree |
| 27-2042.00 | Musicians and Singers | 49 | 39 | -10 | observed use 25, rated potential 41, ability based 49, ilo tasks 49, market 30 | sources agree |
| 27-2091.00 | Disc Jockeys, Except Radio | 84 | 41 | -43 | observed use 24, rated potential 71, ability based –, ilo tasks 35, market 30 | sources partly agree |
| 27-2099.00 | Entertainers and Performers, Sports and Related Workers, All Other | 84 | 46 | -37 | observed use 24, rated potential 71, ability based –, ilo tasks 54, market 30 | sources partly agree |
| 27-3011.00 | Broadcast Announcers and Radio Disc Jockeys | 79 | 72 | -7 | observed use 65, rated potential 89, ability based 69, ilo tasks 87, market 30 | sources partly agree |
| 27-3023.00 | News Analysts, Reporters, and Journalists | 92 | 89 | -3 | observed use 78, rated potential 93, ability based –, ilo tasks 93, market 75 | sources agree |
| 27-3031.00 | Public Relations Specialists | 95 | 96 | +1 | observed use 97, rated potential 95, ability based 87, ilo tasks 84, market 95 | sources agree |
| 27-3041.00 | Editors | 90 | 92 | +2 | observed use 85, rated potential 95, ability based 80, ilo tasks 93, market 82 | sources agree |
| 27-3042.00 | Technical Writers | 96 | 98 | +2 | observed use 98, rated potential 96, ability based 82, ilo tasks 93, market 98 | sources agree |
| 27-3043.00 | Writers and Authors | 90 | 94 | +4 | observed use 87, rated potential 99, ability based 74, ilo tasks 94, market 95 | sources agree |
| 27-3043.05 | Poets, Lyricists and Creative Writers | 91 | 93 | +2 | observed use 85, rated potential 99, ability based 74, ilo tasks 93, market 93 | sources agree |
| 27-3091.00 | Interpreters and Translators | 95 | 99 | +4 | observed use 97, rated potential 99, ability based 79, ilo tasks 98, market 99 | sources agree |
| 27-3092.00 | Court Reporters and Simultaneous Captioners | 99 | 98 | -1 | observed use 92, rated potential 94, ability based –, ilo tasks 93, market 96 | sources agree |
| 27-3099.00 | Media and Communication Workers, All Other | 95 | 97 | +2 | observed use 97, rated potential 99, ability based 79, ilo tasks 87, market 99 | sources agree |
| 27-4011.00 | Audio and Video Technicians | 52 | 59 | +6 | observed use 51, rated potential 54, ability based 48, ilo tasks 63, market 61 | sources agree |
| 27-4012.00 | Broadcast Technicians | 61 | 60 | -1 | observed use 52, rated potential 56, ability based 52, ilo tasks 63, market 61 | sources agree |
| 27-4014.00 | Sound Engineering Technicians | 55 | 48 | -7 | observed use 25, rated potential 53, ability based 60, ilo tasks 63, market 30 | sources partly agree |
| 27-4015.00 | Lighting Technicians | 10 | 22 | +12 | observed use 24, rated potential 25, ability based –, ilo tasks –, market 30 | sources agree |
| 27-4021.00 | Photographers | 58 | 61 | +3 | observed use 83, rated potential 50, ability based 45, ilo tasks 77, market 30 | sources partly agree |
| 27-4031.00 | Camera Operators, Television, Video, and Film | 56 | 54 | -3 | observed use 81, rated potential 48, ability based 37, ilo tasks 63, market 30 | sources partly agree |
| 27-4032.00 | Film and Video Editors | 83 | 77 | -6 | observed use 86, rated potential 77, ability based 73, ilo tasks 66, market 64 | sources agree |
| 27-4099.00 | Media and Communication Equipment Workers, All Other | 83 | 77 | -6 | observed use 86, rated potential 77, ability based 73, ilo tasks 63, market 64 | sources agree |
| 29-1011.00 | Chiropractors | 50 | 49 | -1 | observed use 42, rated potential 54, ability based 44, ilo tasks 27, market 70 | sources agree |
| 29-1021.00 | Dentists, General | 40 | 36 | -4 | observed use 60, rated potential 37, ability based 45, ilo tasks 12, market 30 | sources partly agree |
| 29-1022.00 | Oral and Maxillofacial Surgeons | 24 | 20 | -4 | observed use 25, rated potential 16, ability based 42, ilo tasks 12, market 30 | sources agree |
| 29-1023.00 | Orthodontists | 45 | 45 | -0 | observed use 44, rated potential 38, ability based 53, ilo tasks 12, market 74 | sources partly agree |
| 29-1024.00 | Prosthodontists | 25 | 24 | -1 | observed use 25, rated potential 18, ability based 46, ilo tasks 22, market 30 | sources agree |
| 29-1029.00 | Dentists, All Other Specialists | 40 | 36 | -4 | observed use 60, rated potential 37, ability based 45, ilo tasks 12, market 30 | sources partly agree |
| 29-1031.00 | Dietitians and Nutritionists | 88 | 83 | -4 | observed use 76, rated potential 76, ability based 91, ilo tasks 81, market 68 | sources agree |
| 29-1041.00 | Optometrists | 48 | 35 | -13 | observed use 25, rated potential 29, ability based 61, ilo tasks 36, market 30 | sources agree |
| 29-1051.00 | Pharmacists | 63 | 61 | -1 | observed use 72, rated potential 61, ability based 62, ilo tasks 61, market 30 | sources agree |
| 29-1071.00 | Physician Assistants | 48 | 42 | -7 | observed use 44, rated potential 41, ability based 52, ilo tasks 36, market 30 | sources agree |
| 29-1071.01 | Anesthesiologist Assistants | 37 | 32 | -5 | observed use 25, rated potential 27, ability based 52, ilo tasks 36, market 30 | sources agree |
| 29-1081.00 | Podiatrists | 49 | 37 | -12 | observed use 25, rated potential 43, ability based 63, ilo tasks 27, market 30 | sources agree |
| 29-1122.00 | Occupational Therapists | 45 | 42 | -4 | observed use 37, rated potential 57, ability based 52, ilo tasks 27, market 30 | sources agree |
| 29-1122.01 | Low Vision Therapists, Orientation and Mobility Specialists, and Vision Rehabilitation Therapists | 43 | 42 | -1 | observed use 54, rated potential 45, ability based 52, ilo tasks 27, market 30 | sources agree |
| 29-1123.00 | Physical Therapists | 33 | 44 | +11 | observed use 51, rated potential 44, ability based 39, ilo tasks 51, market 30 | sources agree |
| 29-1124.00 | Radiation Therapists | 39 | 32 | -7 | observed use 25, rated potential 37, ability based 42, ilo tasks 33, market 30 | sources agree |
| 29-1125.00 | Recreational Therapists | 46 | 37 | -9 | observed use 25, rated potential 52, ability based 55, ilo tasks 27, market 30 | sources agree |
| 29-1126.00 | Respiratory Therapists | 34 | 38 | +4 | observed use 25, rated potential 35, ability based 44, ilo tasks 57, market 30 | sources agree |
| 29-1127.00 | Speech-Language Pathologists | 63 | 49 | -14 | observed use 25, rated potential 63, ability based 81, ilo tasks 37, market 30 | sources partly agree |
| 29-1128.00 | Exercise Physiologists | 39 | 41 | +2 | observed use 25, rated potential 48, ability based 48, ilo tasks 51, market 30 | sources agree |
| 29-1129.00 | Therapists, All Other | 61 | 54 | -7 | observed use 56, rated potential 64, ability based –, ilo tasks 27, market 62 | sources agree |
| 29-1129.01 | Art Therapists | 48 | 50 | +3 | observed use 56, rated potential 50, ability based –, ilo tasks 27, market 61 | sources agree |
| 29-1129.02 | Music Therapists | 59 | 57 | -2 | observed use 56, rated potential 72, ability based –, ilo tasks 27, market 61 | sources partly agree |
| 29-1131.00 | Veterinarians | 50 | 40 | -10 | observed use 69, rated potential 38, ability based 47, ilo tasks 10, market 30 | sources partly agree |
| 29-1141.00 | Registered Nurses | 54 | 64 | +10 | observed use 69, rated potential 56, ability based 55, ilo tasks 41, market 80 | sources agree |
| 29-1141.01 | Acute Care Nurses | 53 | 49 | -4 | observed use 59, rated potential 50, ability based 55, ilo tasks 41, market 30 | sources agree |
| 29-1141.02 | Advanced Practice Psychiatric Nurses | 61 | 55 | -6 | observed use 65, rated potential 73, ability based 55, ilo tasks 41, market 30 | sources partly agree |
| 29-1141.03 | Critical Care Nurses | 55 | 60 | +5 | observed use 68, rated potential 43, ability based 55, ilo tasks 41, market 74 | sources agree |
| 29-1141.04 | Clinical Nurse Specialists | 60 | 61 | +1 | observed use 64, rated potential 57, ability based 55, ilo tasks 41, market 67 | sources agree |
| 29-1151.00 | Nurse Anesthetists | 39 | 34 | -4 | observed use 25, rated potential 26, ability based 56, ilo tasks 41, market 30 | sources agree |
| 29-1161.00 | Nurse Midwives | 55 | 62 | +7 | observed use 62, rated potential 49, ability based 54, ilo tasks 54, market 73 | sources agree |
| 29-1171.00 | Nurse Practitioners | 64 | 54 | -10 | observed use 73, rated potential 63, ability based 54, ilo tasks 41, market 30 | sources partly agree |
| 29-1181.00 | Audiologists | 57 | 45 | -12 | observed use 25, rated potential 66, ability based 63, ilo tasks 37, market 30 | sources partly agree |
| 29-1211.00 | Anesthesiologists | 37 | 34 | -3 | observed use 25, rated potential 40, ability based –, ilo tasks 45, market 30 | sources agree |
| 29-1212.00 | Cardiologists | 40 | 70 | +30 | observed use 80, rated potential 48, ability based –, ilo tasks 45, market 89 | sources partly agree |
| 29-1213.00 | Dermatologists | 49 | 61 | +12 | observed use 48, rated potential 51, ability based –, ilo tasks 45, market 84 | sources partly agree |
| 29-1214.00 | Emergency Medicine Physicians | 59 | 53 | -6 | observed use 65, rated potential 65, ability based –, ilo tasks 45, market 30 | sources agree |
| 29-1215.00 | Family Medicine Physicians | 54 | 69 | +15 | observed use 54, rated potential 62, ability based –, ilo tasks 52, market 89 | sources agree |
| 29-1216.00 | General Internal Medicine Physicians | 66 | 73 | +7 | observed use 78, rated potential 62, ability based –, ilo tasks 52, market 88 | sources agree |
| 29-1217.00 | Neurologists | 56 | 48 | -8 | observed use 46, rated potential 64, ability based –, ilo tasks 45, market 30 | sources agree |
| 29-1218.00 | Obstetricians and Gynecologists | 60 | 70 | +10 | observed use 77, rated potential 49, ability based –, ilo tasks 45, market 90 | sources partly agree |
| 29-1221.00 | Pediatricians, General | 59 | 67 | +8 | observed use 50, rated potential 63, ability based –, ilo tasks 52, market 84 | sources agree |
| 29-1222.00 | Physicians, Pathologists | 74 | 70 | -4 | observed use 83, rated potential 61, ability based –, ilo tasks 46, market 71 | sources agree |
| 29-1223.00 | Psychiatrists | 58 | 69 | +11 | observed use 52, rated potential 74, ability based –, ilo tasks 45, market 88 | sources partly agree |
| 29-1224.00 | Radiologists | 80 | 81 | +1 | observed use 91, rated potential 79, ability based –, ilo tasks 45, market 91 | sources partly agree |
| 29-1229.00 | Physicians, All Other | 57 | 65 | +9 | observed use 62, rated potential 58, ability based –, ilo tasks 53, market 71 | sources agree |
| 29-1229.01 | Allergists and Immunologists | 58 | 71 | +12 | observed use 73, rated potential 63, ability based –, ilo tasks 45, market 83 | sources agree |
| 29-1229.02 | Hospitalists | 74 | 50 | -24 | observed use 41, rated potential 69, ability based –, ilo tasks 52, market 30 | sources agree |
| 29-1229.03 | Urologists | 51 | 66 | +16 | observed use 67, rated potential 50, ability based –, ilo tasks 45, market 86 | sources partly agree |
| 29-1229.04 | Physical Medicine and Rehabilitation Physicians | 43 | 39 | -4 | observed use 41, rated potential 37, ability based –, ilo tasks 45, market 30 | sources agree |
| 29-1229.05 | Preventive Medicine Physicians | 61 | 48 | -12 | observed use 41, rated potential 63, ability based –, ilo tasks 53, market 30 | sources agree |
| 29-1229.06 | Sports Medicine Physicians | 53 | 46 | -7 | observed use 41, rated potential 61, ability based –, ilo tasks 45, market 30 | sources agree |
| 29-1241.00 | Ophthalmologists, Except Pediatric | 53 | 59 | +6 | observed use 44, rated potential 54, ability based –, ilo tasks 45, market 77 | sources agree |
| 29-1242.00 | Orthopedic Surgeons, Except Pediatric | 45 | 34 | -10 | observed use 25, rated potential 42, ability based –, ilo tasks 45, market 30 | sources agree |
| 29-1243.00 | Pediatric Surgeons | 47 | 35 | -12 | observed use 25, rated potential 43, ability based –, ilo tasks 45, market 30 | sources agree |
| 29-1249.00 | Surgeons, All Other | 53 | 59 | +6 | observed use 44, rated potential 54, ability based –, ilo tasks 45, market 77 | sources agree |
| 29-1291.00 | Acupuncturists | 31 | 44 | +13 | observed use 42, rated potential 40, ability based –, ilo tasks 61, market 30 | sources agree |
| 29-1292.00 | Dental Hygienists | 32 | 41 | +9 | observed use 43, rated potential 27, ability based –, ilo tasks 15, market 76 | sources partly agree |
| 29-1299.00 | Healthcare Diagnosing or Treating Practitioners, All Other | 55 | 58 | +2 | observed use 56, rated potential 62, ability based –, ilo tasks 35, market 66 | sources agree |
| 29-1299.01 | Naturopathic Physicians | 59 | 42 | -16 | observed use 39, rated potential 56, ability based –, ilo tasks 41, market 30 | sources agree |
| 29-1299.02 | Orthoptists | 68 | 64 | -3 | observed use 62, rated potential 70, ability based –, ilo tasks 35, market 74 | sources partly agree |
| 29-2011.00 | Medical and Clinical Laboratory Technologists | 38 | 66 | +28 | observed use 81, rated potential 36, ability based 56, ilo tasks 58, market 73 | sources partly agree |
| 29-2011.01 | Cytogenetic Technologists | 55 | 51 | -4 | observed use 49, rated potential 54, ability based 56, ilo tasks 58, market 30 | sources agree |
| 29-2011.02 | Cytotechnologists | 54 | 60 | +6 | observed use 92, rated potential 45, ability based 56, ilo tasks 58, market 30 | sources partly agree |
| 29-2011.04 | Histotechnologists | 42 | 46 | +4 | observed use 53, rated potential 28, ability based 56, ilo tasks 58, market 30 | sources agree |
| 29-2012.00 | Medical and Clinical Laboratory Technicians | 30 | 55 | +26 | observed use 61, rated potential 29, ability based 46, ilo tasks 58, market 72 | sources agree |
| 29-2012.01 | Histology Technicians | 22 | 33 | +11 | observed use 24, rated potential 14, ability based 46, ilo tasks 58, market 30 | sources partly agree |
| 29-2031.00 | Cardiovascular Technologists and Technicians | 45 | 58 | +13 | observed use 48, rated potential 44, ability based 47, ilo tasks 57, market 81 | sources agree |
| 29-2032.00 | Diagnostic Medical Sonographers | 39 | 33 | -6 | observed use 25, rated potential 44, ability based 41, ilo tasks 33, market 30 | sources agree |
| 29-2033.00 | Nuclear Medicine Technologists | 50 | 57 | +7 | observed use 66, rated potential 44, ability based 51, ilo tasks 33, market 76 | sources agree |
| 29-2034.00 | Radiologic Technologists and Technicians | 39 | 36 | -3 | observed use 37, rated potential 51, ability based 33, ilo tasks 33, market 30 | sources agree |
| 29-2035.00 | Magnetic Resonance Imaging Technologists | 47 | 54 | +7 | observed use 63, rated potential 44, ability based 48, ilo tasks 33, market 72 | sources agree |
| 29-2036.00 | Medical Dosimetrists | 60 | 44 | -17 | observed use 24, rated potential 60, ability based –, ilo tasks 57, market 30 | sources partly agree |
| 29-2042.00 | Emergency Medical Technicians | 33 | 28 | -5 | observed use 25, rated potential 35, ability based –, ilo tasks 32, market 30 | sources agree |
| 29-2043.00 | Paramedics | 29 | 28 | -2 | observed use 25, rated potential 35, ability based –, ilo tasks 32, market 30 | sources agree |
| 29-2051.00 | Dietetic Technicians | 73 | 63 | -10 | observed use 88, rated potential 74, ability based 46, ilo tasks 57, market 30 | sources partly agree |
| 29-2052.00 | Pharmacy Technicians | 57 | 68 | +11 | observed use 71, rated potential 67, ability based 49, ilo tasks 55, market 78 | sources agree |
| 29-2053.00 | Psychiatric Technicians | 30 | 39 | +9 | observed use 25, rated potential 39, ability based 42, ilo tasks 57, market 30 | sources agree |
| 29-2055.00 | Surgical Technologists | 23 | 29 | +6 | observed use 25, rated potential 10, ability based 35, ilo tasks 57, market 30 | sources partly agree |
| 29-2056.00 | Veterinary Technologists and Technicians | 31 | 22 | -9 | observed use 25, rated potential 29, ability based 39, ilo tasks 10, market 30 | sources agree |
| 29-2057.00 | Ophthalmic Medical Technicians | 46 | 60 | +14 | observed use 48, rated potential 38, ability based 51, ilo tasks 62, market 83 | sources partly agree |
| 29-2061.00 | Licensed Practical and Licensed Vocational Nurses | 33 | 31 | -2 | observed use 25, rated potential 42, ability based 35, ilo tasks 33, market 30 | sources agree |
| 29-2072.00 | Medical Records Specialists | 98 | 98 | +0 | observed use 99, rated potential 86, ability based –, ilo tasks 92, market 100 | sources agree |
| 29-2081.00 | Opticians, Dispensing | 44 | 37 | -6 | observed use 25, rated potential 45, ability based 52, ilo tasks 38, market 30 | sources agree |
| 29-2091.00 | Orthotists and Prosthetists | 42 | 31 | -11 | observed use 25, rated potential 37, ability based 50, ilo tasks 22, market 30 | sources agree |
| 29-2092.00 | Hearing Aid Specialists | 43 | 44 | +2 | observed use 40, rated potential 23, ability based 62, ilo tasks 22, market 70 | sources partly agree |
| 29-2099.00 | Health Technologists and Technicians, All Other | 50 | 62 | +12 | observed use 66, rated potential 57, ability based 40, ilo tasks 57, market 69 | sources agree |
| 29-2099.01 | Neurodiagnostic Technologists | 47 | 43 | -3 | observed use 43, rated potential 42, ability based 40, ilo tasks 57, market 30 | sources agree |
| 29-2099.05 | Ophthalmic Medical Technologists | 48 | 58 | +10 | observed use 63, rated potential 38, ability based 40, ilo tasks 57, market 78 | sources agree |
| 29-2099.08 | Patient Representatives | 60 | 69 | +9 | observed use 72, rated potential 87, ability based 40, ilo tasks 57, market 68 | sources partly agree |
| 29-9021.00 | Health Information Technologists and Medical Registrars | 96 | 96 | -0 | observed use 91, rated potential 86, ability based –, ilo tasks 92, market 97 | sources agree |
| 29-9091.00 | Athletic Trainers | 44 | 58 | +14 | observed use 67, rated potential 51, ability based 39, ilo tasks 39, market 79 | sources partly agree |
| 29-9092.00 | Genetic Counselors | 79 | 74 | -5 | observed use 61, rated potential 84, ability based 100, ilo tasks 27, market 81 | sources disagree |
| 29-9093.00 | Surgical Assistants | 17 | 27 | +9 | observed use 25, rated potential 9, ability based –, ilo tasks 57, market 30 | sources partly agree |
| 29-9099.00 | Healthcare Practitioners and Technical Workers, All Other | 52 | 40 | -12 | observed use 25, rated potential 50, ability based 56, ilo tasks 37, market 30 | sources agree |
| 29-9099.01 | Midwives | 50 | 37 | -13 | observed use 25, rated potential 49, ability based 56, ilo tasks 28, market 30 | sources agree |
| 31-1121.00 | Home Health Aides | 0 | 23 | +23 | observed use 24, rated potential 15, ability based –, ilo tasks 40, market 30 | sources agree |
| 31-1122.00 | Personal Care Aides | 20 | 49 | +29 | observed use 50, rated potential 39, ability based –, ilo tasks 37, market 62 | sources agree |
| 31-1131.00 | Nursing Assistants | 24 | 15 | -9 | observed use 25, rated potential 24, ability based –, ilo tasks 10, market 30 | sources agree |
| 31-1132.00 | Orderlies | 15 | 8 | -7 | observed use 25, rated potential 7, ability based –, ilo tasks 12, market 30 | sources agree |
| 31-1133.00 | Psychiatric Aides | 26 | 17 | -10 | observed use 25, rated potential 27, ability based –, ilo tasks 10, market 30 | sources agree |
| 31-2011.00 | Occupational Therapy Assistants | 37 | 38 | +2 | observed use 25, rated potential 40, ability based 40, ilo tasks 57, market 30 | sources agree |
| 31-2012.00 | Occupational Therapy Aides | 36 | 42 | +6 | observed use 64, rated potential 29, ability based 26, ilo tasks 12, market 72 | sources partly agree |
| 31-2021.00 | Physical Therapist Assistants | 28 | 22 | -6 | observed use 25, rated potential 28, ability based 34, ilo tasks 17, market 30 | sources agree |
| 31-2022.00 | Physical Therapist Aides | 23 | 32 | +9 | observed use 38, rated potential 32, ability based 22, ilo tasks 12, market 65 | sources partly agree |
| 31-9011.00 | Massage Therapists | 8 | 12 | +4 | observed use 25, rated potential 24, ability based 7, ilo tasks 17, market 30 | sources agree |
| 31-9091.00 | Dental Assistants | 34 | 23 | -11 | observed use 25, rated potential 32, ability based 34, ilo tasks 15, market 30 | sources agree |
| 31-9092.00 | Medical Assistants | 53 | 61 | +7 | observed use 60, rated potential 42, ability based 53, ilo tasks 62, market 68 | sources agree |
| 31-9093.00 | Medical Equipment Preparers | 22 | 14 | -8 | observed use 25, rated potential 14, ability based 27, ilo tasks 12, market 30 | sources agree |
| 31-9094.00 | Medical Transcriptionists | 96 | 93 | -3 | observed use 99, rated potential 73, ability based 79, ilo tasks 92, market 100 | sources agree |
| 31-9095.00 | Pharmacy Aides | 47 | 47 | +0 | observed use 57, rated potential 41, ability based 46, ilo tasks 12, market 73 | sources partly agree |
| 31-9096.00 | Veterinary Assistants and Laboratory Animal Caretakers | 28 | 36 | +8 | observed use 53, rated potential 32, ability based 26, ilo tasks 9, market 65 | sources partly agree |
| 31-9097.00 | Phlebotomists | 32 | 23 | -10 | observed use 25, rated potential 28, ability based 41, ilo tasks 12, market 30 | sources agree |
| 31-9099.00 | Healthcare Support Workers, All Other | 51 | 46 | -5 | observed use 37, rated potential 38, ability based 53, ilo tasks 36, market 60 | sources agree |
| 31-9099.01 | Speech-Language Pathology Assistants | 64 | 42 | -22 | observed use 25, rated potential 63, ability based 53, ilo tasks 36, market 30 | sources agree |
| 31-9099.02 | Endoscopy Technicians | 34 | 40 | +6 | observed use 37, rated potential 10, ability based 53, ilo tasks 36, market 61 | sources partly agree |
| 33-1011.00 | First-Line Supervisors of Correctional Officers | 38 | 49 | +11 | observed use 67, rated potential 44, ability based 33, ilo tasks 9, market 83 | sources disagree |
| 33-1012.00 | First-Line Supervisors of Police and Detectives | 41 | 37 | -4 | observed use 25, rated potential 53, ability based 43, ilo tasks 36, market 30 | sources agree |
| 33-1021.00 | First-Line Supervisors of Firefighting and Prevention Workers | 40 | 52 | +12 | observed use 47, rated potential 58, ability based 32, ilo tasks 39, market 79 | sources partly agree |
| 33-1091.00 | First-Line Supervisors of Security Workers | 52 | 32 | -20 | observed use 24, rated potential 51, ability based –, ilo tasks 29, market 30 | sources agree |
| 33-1099.00 | First-Line Supervisors of Protective Service Workers, All Other | 52 | 32 | -20 | observed use 24, rated potential 51, ability based –, ilo tasks 29, market 30 | sources agree |
| 33-2011.00 | Firefighters | 13 | 15 | +2 | observed use 25, rated potential 25, ability based 8, ilo tasks 24, market 30 | sources agree |
| 33-2021.00 | Fire Inspectors and Investigators | 43 | 41 | -1 | observed use 25, rated potential 53, ability based 50, ilo tasks 44, market 30 | sources agree |
| 33-2022.00 | Forest Fire Inspectors and Prevention Specialists | 35 | 37 | +2 | observed use 25, rated potential 48, ability based 42, ilo tasks 42, market 30 | sources agree |
| 33-3011.00 | Bailiffs | 20 | 37 | +17 | observed use 25, rated potential 21, ability based 35, ilo tasks 78, market 30 | sources partly agree |
| 33-3012.00 | Correctional Officers and Jailers | 27 | 20 | -6 | observed use 25, rated potential 41, ability based 21, ilo tasks 9, market 30 | sources agree |
| 33-3021.00 | Detectives and Criminal Investigators | 50 | 60 | +10 | observed use 62, rated potential 53, ability based 55, ilo tasks 36, market 78 | sources agree |
| 33-3021.02 | Police Identification and Records Officers | 52 | 45 | -7 | observed use 42, rated potential 54, ability based 55, ilo tasks 36, market 30 | sources agree |
| 33-3021.06 | Intelligence Analysts | 64 | 64 | +1 | observed use 64, rated potential 75, ability based 55, ilo tasks 36, market 71 | sources agree |
| 33-3031.00 | Fish and Game Wardens | 36 | 29 | -8 | observed use 25, rated potential 37, ability based 36, ilo tasks 28, market 30 | sources agree |
| 33-3041.00 | Parking Enforcement Workers | 35 | 31 | -4 | observed use 25, rated potential 52, ability based 31, ilo tasks 28, market 30 | sources agree |
| 33-3051.00 | Police and Sheriff's Patrol Officers | 42 | 51 | +9 | observed use 78, rated potential 42, ability based 30, ilo tasks 9, market 87 | sources disagree |
| 33-3051.04 | Customs and Border Protection Officers | 55 | 55 | +0 | observed use 83, rated potential 62, ability based 30, ilo tasks 59, market 30 | sources partly agree |
| 33-3052.00 | Transit and Railroad Police | 29 | 44 | +16 | observed use 47, rated potential 54, ability based 25, ilo tasks 9, market 81 | sources partly agree |
| 33-9011.00 | Animal Control Workers | 38 | 28 | -9 | observed use 25, rated potential 40, ability based 32, ilo tasks 28, market 30 | sources agree |
| 33-9021.00 | Private Detectives and Investigators | 55 | 55 | -0 | observed use 25, rated potential 65, ability based 66, ilo tasks 78, market 30 | sources partly agree |
| 33-9031.00 | Gambling Surveillance Officers and Gambling Investigators | 57 | 49 | -8 | observed use 25, rated potential 55, ability based 66, ilo tasks 59, market 30 | sources partly agree |
| 33-9032.00 | Security Guards | 31 | 29 | -2 | observed use 25, rated potential 36, ability based 37, ilo tasks 30, market 30 | sources agree |
| 33-9091.00 | Crossing Guards and Flaggers | 25 | 26 | +1 | observed use 25, rated potential 32, ability based 33, ilo tasks 28, market 30 | sources agree |
| 33-9092.00 | Lifeguards, Ski Patrol, and Other Recreational Protective Service Workers | 24 | 27 | +3 | observed use 25, rated potential 33, ability based 36, ilo tasks 28, market 30 | sources agree |
| 33-9093.00 | Transportation Security Screeners | 34 | 37 | +3 | observed use 25, rated potential 39, ability based 35, ilo tasks 59, market 30 | sources agree |
| 33-9094.00 | School Bus Monitors | 12 | 24 | +12 | observed use 24, rated potential 29, ability based –, ilo tasks 28, market 30 | sources agree |
| 33-9099.00 | Protective Service Workers, All Other | 57 | 57 | -0 | observed use 68, rated potential 53, ability based 51, ilo tasks 28, market 71 | sources partly agree |
| 33-9099.02 | Retail Loss Prevention Specialists | 54 | 57 | +3 | observed use 68, rated potential 54, ability based 51, ilo tasks 28, market 71 | sources partly agree |
| 35-1011.00 | Chefs and Head Cooks | 37 | 45 | +8 | observed use 38, rated potential 38, ability based 41, ilo tasks 40, market 62 | sources agree |
| 35-1012.00 | First-Line Supervisors of Food Preparation and Serving Workers | 61 | 58 | -3 | observed use 66, rated potential 58, ability based 42, ilo tasks 34, market 76 | sources partly agree |
| 35-2011.00 | Cooks, Fast Food | 16 | 16 | 0 | observed use 25, rated potential 5, ability based 28, ilo tasks 23, market 30 | sources agree |
| 35-2012.00 | Cooks, Institution and Cafeteria | 24 | 21 | -3 | observed use 25, rated potential 19, ability based 31, ilo tasks 24, market 30 | sources agree |
| 35-2013.00 | Cooks, Private Household | 28 | 25 | -3 | observed use 25, rated potential 38, ability based 25, ilo tasks 24, market 30 | sources agree |
| 35-2014.00 | Cooks, Restaurant | 22 | 28 | +6 | observed use 51, rated potential 20, ability based 27, ilo tasks 24, market 30 | sources agree |
| 35-2015.00 | Cooks, Short Order | 18 | 17 | -1 | observed use 25, rated potential 3, ability based 32, ilo tasks 26, market 30 | sources agree |
| 35-2019.00 | Cooks, All Other | 16 | 16 | +0 | observed use 25, rated potential 5, ability based 28, ilo tasks 24, market 30 | sources agree |
| 35-2021.00 | Food Preparation Workers | 7 | 5 | -2 | observed use 25, rated potential 11, ability based 10, ilo tasks 7, market 30 | sources agree |
| 35-3011.00 | Bartenders | 29 | 28 | -0 | observed use 25, rated potential 27, ability based 31, ilo tasks 43, market 30 | sources agree |
| 35-3023.00 | Fast Food and Counter Workers | 20 | 23 | +3 | observed use 25, rated potential 17, ability based –, ilo tasks 37, market 30 | sources agree |
| 35-3023.01 | Baristas | 27 | 25 | -2 | observed use 25, rated potential 23, ability based –, ilo tasks 37, market 30 | sources agree |
| 35-3031.00 | Waiters and Waitresses | 22 | 29 | +6 | observed use 25, rated potential 34, ability based 20, ilo tasks 49, market 30 | sources agree |
| 35-3041.00 | Food Servers, Nonrestaurant | 23 | 28 | +5 | observed use 25, rated potential 22, ability based 28, ilo tasks 49, market 30 | sources agree |
| 35-9011.00 | Dining Room and Cafeteria Attendants and Bartender Helpers | 1 | 5 | +4 | observed use 25, rated potential 3, ability based 1, ilo tasks 26, market 30 | sources agree |
| 35-9021.00 | Dishwashers | 2 | 2 | -0 | observed use 25, rated potential 3, ability based 3, ilo tasks 7, market 30 | sources agree |
| 35-9031.00 | Hosts and Hostesses, Restaurant, Lounge, and Coffee Shop | 46 | 55 | +9 | observed use 69, rated potential 41, ability based 48, ilo tasks 32, market 75 | sources partly agree |
| 35-9099.00 | Food Preparation and Serving Related Workers, All Other | 2 | 2 | -0 | observed use 25, rated potential 3, ability based 3, ilo tasks 7, market 30 | sources agree |
| 37-1011.00 | First-Line Supervisors of Housekeeping and Janitorial Workers | 38 | 46 | +8 | observed use 59, rated potential 39, ability based 32, ilo tasks 32, market 63 | sources agree |
| 37-1012.00 | First-Line Supervisors of Landscaping, Lawn Service, and Groundskeeping Workers | 50 | 50 | +0 | observed use 74, rated potential 44, ability based 33, ilo tasks 25, market 66 | sources partly agree |
| 37-2011.00 | Janitors and Cleaners, Except Maids and Housekeeping Cleaners | 3 | 9 | +5 | observed use 25, rated potential 6, ability based 6, ilo tasks 28, market 30 | sources agree |
| 37-2012.00 | Maids and Housekeeping Cleaners | 3 | 4 | +0 | observed use 25, rated potential 7, ability based 6, ilo tasks 8, market 30 | sources agree |
| 37-2019.00 | Building Cleaning Workers, All Other | 3 | 2 | -1 | observed use 25, rated potential 6, ability based 6, ilo tasks 2, market 30 | sources agree |
| 37-2021.00 | Pest Control Workers | 35 | 32 | -3 | observed use 66, rated potential 37, ability based 28, ilo tasks 8, market 30 | sources partly agree |
| 37-3011.00 | Landscaping and Groundskeeping Workers | 2 | 2 | +0 | observed use 25, rated potential 7, ability based 1, ilo tasks 4, market 30 | sources agree |
| 37-3012.00 | Pesticide Handlers, Sprayers, and Applicators, Vegetation | 15 | 10 | -5 | observed use 25, rated potential 12, ability based 22, ilo tasks 8, market 30 | sources agree |
| 37-3013.00 | Tree Trimmers and Pruners | 5 | 9 | +4 | observed use 25, rated potential 12, ability based 3, ilo tasks 25, market 30 | sources agree |
| 37-3019.00 | Grounds Maintenance Workers, All Other | 2 | 1 | -1 | observed use 25, rated potential 7, ability based 1, ilo tasks 3, market 30 | sources agree |
| 39-1013.00 | First-Line Supervisors of Gambling Services Workers | 53 | 51 | -2 | observed use 25, rated potential 58, ability based –, ilo tasks 85, market 30 | sources partly agree |
| 39-1014.00 | First-Line Supervisors of Entertainment and Recreation Workers, Except Gambling Services | 55 | 58 | +3 | observed use 61, rated potential 53, ability based –, ilo tasks 39, market 67 | sources agree |
| 39-1022.00 | First-Line Supervisors of Personal Service Workers | 57 | 59 | +2 | observed use 62, rated potential 56, ability based –, ilo tasks 34, market 69 | sources agree |
| 39-2011.00 | Animal Trainers | 18 | 13 | -5 | observed use 25, rated potential 23, ability based 21, ilo tasks 9, market 30 | sources agree |
| 39-2021.00 | Animal Caretakers | 28 | 19 | -9 | observed use 25, rated potential 36, ability based 21, ilo tasks 9, market 30 | sources agree |
| 39-3011.00 | Gambling Dealers | 34 | 44 | +10 | observed use 25, rated potential 25, ability based 50, ilo tasks 85, market 30 | sources partly agree |
| 39-3012.00 | Gambling and Sports Book Writers and Runners | 46 | 50 | +4 | observed use 25, rated potential 45, ability based 59, ilo tasks 85, market 30 | sources partly agree |
| 39-3019.00 | Gambling Service Workers, All Other | 34 | 44 | +10 | observed use 25, rated potential 25, ability based 50, ilo tasks 85, market 30 | sources partly agree |
| 39-3021.00 | Motion Picture Projectionists | 32 | 34 | +2 | observed use 25, rated potential 28, ability based 38, ilo tasks 53, market 30 | sources agree |
| 39-3031.00 | Ushers, Lobby Attendants, and Ticket Takers | 31 | 35 | +4 | observed use 25, rated potential 30, ability based 42, ilo tasks 53, market 30 | sources agree |
| 39-3091.00 | Amusement and Recreation Attendants | 38 | 47 | +8 | observed use 66, rated potential 43, ability based 34, ilo tasks 53, market 30 | sources agree |
| 39-3092.00 | Costume Attendants | 35 | 30 | -4 | observed use 25, rated potential 39, ability based 36, ilo tasks –, market 30 | sources agree |
| 39-3093.00 | Locker Room, Coatroom, and Dressing Room Attendants | 25 | 33 | +8 | observed use 25, rated potential 23, ability based 39, ilo tasks 54, market 30 | sources agree |
| 39-3099.00 | Entertainment Attendants and Related Workers, All Other | 35 | 30 | -4 | observed use 25, rated potential 39, ability based 36, ilo tasks –, market 30 | sources agree |
| 39-4011.00 | Embalmers | 17 | 14 | -3 | observed use 25, rated potential 11, ability based 27, ilo tasks 16, market 30 | sources agree |
| 39-4012.00 | Crematory Operators | 0 | 20 | +20 | observed use 24, rated potential 18, ability based –, ilo tasks 28, market 30 | sources agree |
| 39-4021.00 | Funeral Attendants | 29 | 40 | +11 | observed use 41, rated potential 35, ability based 33, ilo tasks 16, market 69 | sources partly agree |
| 39-4031.00 | Morticians, Undertakers, and Funeral Arrangers | 33 | 25 | -8 | observed use 25, rated potential 27, ability based 44, ilo tasks 16, market 30 | sources agree |
| 39-5011.00 | Barbers | 25 | 19 | -7 | observed use 25, rated potential 22, ability based 27, ilo tasks 17, market 30 | sources agree |
| 39-5012.00 | Hairdressers, Hairstylists, and Cosmetologists | 23 | 34 | +11 | observed use 56, rated potential 14, ability based 29, ilo tasks 14, market 65 | sources partly agree |
| 39-5091.00 | Makeup Artists, Theatrical and Performance | 39 | 29 | -9 | observed use 25, rated potential 44, ability based 36, ilo tasks 24, market 30 | sources agree |
| 39-5092.00 | Manicurists and Pedicurists | 31 | 42 | +12 | observed use 45, rated potential 17, ability based 49, ilo tasks 24, market 74 | sources partly agree |
| 39-5093.00 | Shampooers | 21 | 17 | -4 | observed use 25, rated potential 17, ability based 21, ilo tasks 24, market 30 | sources agree |
| 39-5094.00 | Skincare Specialists | 33 | 26 | -7 | observed use 25, rated potential 26, ability based 41, ilo tasks 24, market 30 | sources agree |
| 39-6011.00 | Baggage Porters and Bellhops | 23 | 44 | +22 | observed use 71, rated potential 34, ability based 9, ilo tasks 71, market 30 | sources partly agree |
| 39-6012.00 | Concierges | 73 | 86 | +13 | observed use 85, rated potential 84, ability based 69, ilo tasks 91, market 75 | sources agree |
| 39-7011.00 | Tour Guides and Escorts | 42 | 60 | +18 | observed use 50, rated potential 52, ability based 58, ilo tasks 59, market 62 | sources agree |
| 39-7012.00 | Travel Guides | 55 | 61 | +6 | observed use 77, rated potential 57, ability based 63, ilo tasks 59, market 30 | sources partly agree |
| 39-9011.00 | Childcare Workers | 31 | 45 | +14 | observed use 53, rated potential 38, ability based 38, ilo tasks 26, market 65 | sources agree |
| 39-9011.01 | Nannies | 30 | 32 | +2 | observed use 38, rated potential 37, ability based 38, ilo tasks 26, market 30 | sources agree |
| 39-9031.00 | Exercise Trainers and Group Fitness Instructors | 1 | 18 | +17 | observed use 25, rated potential 25, ability based 0, ilo tasks 39, market 30 | sources agree |
| 39-9032.00 | Recreation Workers | 35 | 31 | -4 | observed use 25, rated potential 38, ability based 42, ilo tasks 32, market 30 | sources agree |
| 39-9041.00 | Residential Advisors | 52 | 54 | +2 | observed use 65, rated potential 40, ability based 60, ilo tasks 32, market 64 | sources agree |
| 39-9099.00 | Personal Care and Service Workers, All Other | 30 | 33 | +3 | observed use 38, rated potential 37, ability based 38, ilo tasks 28, market 30 | sources agree |
| 41-1011.00 | First-Line Supervisors of Retail Sales Workers | 69 | 75 | +7 | observed use 90, rated potential 66, ability based 49, ilo tasks 65, market 87 | sources partly agree |
| 41-1012.00 | First-Line Supervisors of Non-Retail Sales Workers | 89 | 88 | -1 | observed use 86, rated potential 76, ability based 88, ilo tasks 90, market 77 | sources agree |
| 41-2011.00 | Cashiers | 44 | 68 | +24 | observed use 72, rated potential 43, ability based 42, ilo tasks 79, market 81 | sources partly agree |
| 41-2012.00 | Gambling Change Persons and Booth Cashiers | 39 | 47 | +7 | observed use 25, rated potential 45, ability based 48, ilo tasks 79, market 30 | sources partly agree |
| 41-2021.00 | Counter and Rental Clerks | 73 | 68 | -5 | observed use 81, rated potential 90, ability based 51, ilo tasks –, market 30 | sources partly agree |
| 41-2022.00 | Parts Salespersons | 44 | 48 | +4 | observed use 25, rated potential 53, ability based 47, ilo tasks 76, market 30 | sources partly agree |
| 41-2031.00 | Retail Salespersons | 62 | 74 | +12 | observed use 92, rated potential 52, ability based 52, ilo tasks 76, market 80 | sources partly agree |
| 41-3011.00 | Advertising Sales Agents | 84 | 90 | +6 | observed use 80, rated potential 91, ability based 82, ilo tasks 85, market 89 | sources agree |
| 41-3021.00 | Insurance Sales Agents | 94 | 95 | +0 | observed use 91, rated potential 86, ability based 91, ilo tasks 92, market 90 | sources agree |
| 41-3031.00 | Securities, Commodities, and Financial Services Sales Agents | 94 | 94 | -0 | observed use 96, rated potential 87, ability based 85, ilo tasks 99, market 83 | sources agree |
| 41-3041.00 | Travel Agents | 91 | 93 | +2 | observed use 96, rated potential 85, ability based 80, ilo tasks 91, market 93 | sources agree |
| 41-3091.00 | Sales Representatives of Services, Except Advertising, Insurance, Financial Services, and Travel | 96 | 98 | +3 | observed use 99, rated potential 89, ability based –, ilo tasks 90, market 99 | sources agree |
| 41-4011.00 | Sales Representatives, Wholesale and Manufacturing, Technical and Scientific Products | 84 | 92 | +8 | observed use 94, rated potential 84, ability based 70, ilo tasks 91, market 97 | sources agree |
| 41-4011.07 | Solar Sales Representatives and Assessors | 76 | 74 | -2 | observed use 78, rated potential 82, ability based 70, ilo tasks 90, market 30 | sources partly agree |
| 41-4012.00 | Sales Representatives, Wholesale and Manufacturing, Except Technical and Scientific Products | 89 | 95 | +5 | observed use 100, rated potential 95, ability based 68, ilo tasks 90, market 99 | sources agree |
| 41-9011.00 | Demonstrators and Product Promoters | 43 | 67 | +23 | observed use 64, rated potential 43, ability based 52, ilo tasks 82, market 69 | sources agree |
| 41-9012.00 | Models | 22 | 28 | +6 | observed use 25, rated potential 47, ability based 13, ilo tasks 40, market 30 | sources agree |
| 41-9021.00 | Real Estate Brokers | 85 | 71 | -13 | observed use 89, rated potential 73, ability based 82, ilo tasks 64, market 30 | sources partly agree |
| 41-9022.00 | Real Estate Sales Agents | 74 | 77 | +2 | observed use 89, rated potential 65, ability based 69, ilo tasks 64, market 76 | sources agree |
| 41-9031.00 | Sales Engineers | 86 | 91 | +5 | observed use 93, rated potential 81, ability based 81, ilo tasks 91, market 85 | sources agree |
| 41-9041.00 | Telemarketers | 92 | 97 | +5 | observed use 94, rated potential 91, ability based 80, ilo tasks 98, market 99 | sources agree |
| 41-9091.00 | Door-to-Door Sales Workers, News and Street Vendors, and Related Workers | 63 | 75 | +12 | observed use 80, rated potential 56, ability based 79, ilo tasks 61, market 83 | sources agree |
| 41-9099.00 | Sales and Related Workers, All Other | 63 | 82 | +18 | observed use 80, rated potential 56, ability based 79, ilo tasks 87, market 83 | sources agree |
| 43-1011.00 | First-Line Supervisors of Office and Administrative Support Workers | 79 | 87 | +8 | observed use 82, rated potential 78, ability based 77, ilo tasks 83, market 90 | sources agree |
| 43-2011.00 | Switchboard Operators, Including Answering Service | 90 | 93 | +3 | observed use 96, rated potential 86, ability based 73, ilo tasks 93, market 98 | sources agree |
| 43-2021.00 | Telephone Operators | 77 | 83 | +6 | observed use 47, rated potential 95, ability based 76, ilo tasks 93, market 80 | sources partly agree |
| 43-2099.00 | Communications Equipment Operators, All Other | 90 | 91 | +0 | observed use 96, rated potential 86, ability based 73, ilo tasks 74, market 98 | sources agree |
| 43-3011.00 | Bill and Account Collectors | 94 | 89 | -4 | observed use 89, rated potential 83, ability based 85, ilo tasks 83, market 84 | sources agree |
| 43-3021.00 | Billing and Posting Clerks | 94 | 97 | +4 | observed use 90, rated potential 87, ability based 90, ilo tasks 100, market 98 | sources agree |
| 43-3031.00 | Bookkeeping, Accounting, and Auditing Clerks | 92 | 88 | -4 | observed use 88, rated potential 78, ability based 77, ilo tasks 95, market 80 | sources agree |
| 43-3041.00 | Gambling Cage Workers | 59 | 73 | +13 | observed use 65, rated potential 64, ability based 59, ilo tasks 85, market 72 | sources agree |
| 43-3051.00 | Payroll and Timekeeping Clerks | 86 | 87 | +1 | observed use 64, rated potential 90, ability based 85, ilo tasks 98, market 75 | sources agree |
| 43-3061.00 | Procurement Clerks | 96 | 94 | -2 | observed use 87, rated potential 84, ability based 99, ilo tasks 98, market 83 | sources agree |
| 43-3071.00 | Tellers | 65 | 72 | +6 | observed use 52, rated potential 68, ability based 60, ilo tasks 97, market 62 | sources partly agree |
| 43-3099.00 | Financial Clerks, All Other | 96 | 94 | -3 | observed use 87, rated potential 84, ability based 99, ilo tasks 95, market 83 | sources agree |
| 43-4011.00 | Brokerage Clerks | 89 | 95 | +6 | observed use 82, rated potential 98, ability based 81, ilo tasks 99, market 93 | sources agree |
| 43-4021.00 | Correspondence Clerks | 93 | 98 | +5 | observed use 92, rated potential 99, ability based 82, ilo tasks 99, market 98 | sources agree |
| 43-4031.00 | Court, Municipal, and License Clerks | 87 | 88 | +1 | observed use 74, rated potential 94, ability based 82, ilo tasks 83, market 82 | sources agree |
| 43-4041.00 | Credit Authorizers, Checkers, and Clerks | 93 | 94 | +1 | observed use 77, rated potential 90, ability based 98, ilo tasks 99, market 86 | sources agree |
| 43-4051.00 | Customer Service Representatives | 90 | 97 | +7 | observed use 100, rated potential 94, ability based 72, ilo tasks 97, market 100 | sources agree |
| 43-4061.00 | Eligibility Interviewers, Government Programs | 85 | 85 | +0 | observed use 65, rated potential 94, ability based 84, ilo tasks 86, market 74 | sources agree |
| 43-4071.00 | File Clerks | 81 | 81 | +1 | observed use 81, rated potential 89, ability based 57, ilo tasks 67, market 90 | sources agree |
| 43-4081.00 | Hotel, Motel, and Resort Desk Clerks | 75 | 83 | +9 | observed use 81, rated potential 72, ability based 62, ilo tasks 91, market 89 | sources agree |
| 43-4111.00 | Interviewers, Except Eligibility and Loan | 96 | 93 | -3 | observed use 94, rated potential 86, ability based 87, ilo tasks 94, market 86 | sources agree |
| 43-4121.00 | Library Assistants, Clerical | 70 | 74 | +4 | observed use 72, rated potential 72, ability based 55, ilo tasks 87, market 70 | sources agree |
| 43-4131.00 | Loan Interviewers and Clerks | 93 | 92 | -0 | observed use 82, rated potential 86, ability based 94, ilo tasks 99, market 79 | sources agree |
| 43-4141.00 | New Accounts Clerks | 74 | 80 | +6 | observed use 40, rated potential 90, ability based 82, ilo tasks 99, market 68 | sources partly agree |
| 43-4151.00 | Order Clerks | 81 | 89 | +8 | observed use 76, rated potential 95, ability based 69, ilo tasks 99, market 86 | sources agree |
| 43-4161.00 | Human Resources Assistants, Except Payroll and Timekeeping | 97 | 98 | +1 | observed use 96, rated potential 84, ability based 93, ilo tasks 98, market 99 | sources agree |
| 43-4171.00 | Receptionists and Information Clerks | 87 | 95 | +7 | observed use 95, rated potential 87, ability based 75, ilo tasks 97, market 97 | sources agree |
| 43-4181.00 | Reservation and Transportation Ticket Agents and Travel Clerks | 68 | 83 | +15 | observed use 85, rated potential 81, ability based 55, ilo tasks 94, market 76 | sources agree |
| 43-4199.00 | Information and Record Clerks, All Other | 87 | 93 | +6 | observed use 95, rated potential 87, ability based 75, ilo tasks 90, market 97 | sources agree |
| 43-5011.00 | Cargo and Freight Agents | 73 | 69 | -4 | observed use 39, rated potential 60, ability based 97, ilo tasks 97, market 30 | sources disagree |
| 43-5011.01 | Freight Forwarders | 83 | 79 | -5 | observed use 61, rated potential 91, ability based 97, ilo tasks 97, market 30 | sources disagree |
| 43-5021.00 | Couriers and Messengers | 33 | 39 | +6 | observed use 58, rated potential 36, ability based 19, ilo tasks 49, market 30 | sources agree |
| 43-5031.00 | Public Safety Telecommunicators | 79 | 60 | -18 | observed use 61, rated potential 94, ability based 71, ilo tasks 28, market 30 | sources partly agree |
| 43-5032.00 | Dispatchers, Except Police, Fire, and Ambulance | 92 | 81 | -10 | observed use 84, rated potential 96, ability based 84, ilo tasks 90, market 30 | sources partly agree |
| 43-5041.00 | Meter Readers, Utilities | 36 | 41 | +5 | observed use 25, rated potential 55, ability based 18, ilo tasks 73, market 30 | sources partly agree |
| 43-5051.00 | Postal Service Clerks | 37 | 48 | +11 | observed use 25, rated potential 46, ability based 34, ilo tasks 97, market 30 | sources disagree |
| 43-5052.00 | Postal Service Mail Carriers | 22 | 38 | +16 | observed use 25, rated potential 38, ability based 15, ilo tasks 81, market 30 | sources partly agree |
| 43-5053.00 | Postal Service Mail Sorters, Processors, and Processing Machine Operators | 13 | 32 | +20 | observed use 25, rated potential 23, ability based 11, ilo tasks 81, market 30 | sources partly agree |
| 43-5061.00 | Production, Planning, and Expediting Clerks | 78 | 78 | +1 | observed use 70, rated potential 85, ability based 65, ilo tasks 84, market 68 | sources agree |
| 43-5071.00 | Shipping, Receiving, and Inventory Clerks | 49 | 43 | -5 | observed use 25, rated potential 64, ability based 27, ilo tasks 67, market 30 | sources partly agree |
| 43-5111.00 | Weighers, Measurers, Checkers, and Samplers, Recordkeeping | 40 | 43 | +3 | observed use 25, rated potential 45, ability based 44, ilo tasks 67, market 30 | sources agree |
| 43-6011.00 | Executive Secretaries and Executive Administrative Assistants | 88 | 94 | +5 | observed use 85, rated potential 96, ability based 79, ilo tasks 93, market 94 | sources agree |
| 43-6012.00 | Legal Secretaries and Administrative Assistants | 75 | 82 | +7 | observed use 46, rated potential 97, ability based 76, ilo tasks 94, market 77 | sources partly agree |
| 43-6013.00 | Medical Secretaries and Administrative Assistants | 94 | 96 | +2 | observed use 93, rated potential 93, ability based 84, ilo tasks 92, market 97 | sources agree |
| 43-6014.00 | Secretaries and Administrative Assistants, Except Legal, Medical, and Executive | 93 | 97 | +4 | observed use 97, rated potential 91, ability based 79, ilo tasks 97, market 97 | sources agree |
| 43-9021.00 | Data Entry Keyers | 88 | 93 | +5 | observed use 99, rated potential 90, ability based 57, ilo tasks 100, market 99 | sources partly agree |
| 43-9022.00 | Word Processors and Typists | 85 | 91 | +6 | observed use 85, rated potential 90, ability based 63, ilo tasks 100, market 91 | sources agree |
| 43-9031.00 | Desktop Publishers | 86 | 88 | +2 | observed use 98, rated potential 86, ability based 57, ilo tasks 75, market 99 | sources partly agree |
| 43-9041.00 | Insurance Claims and Policy Processing Clerks | 91 | 92 | +1 | observed use 78, rated potential 92, ability based 84, ilo tasks 99, market 81 | sources agree |
| 43-9051.00 | Mail Clerks and Mail Machine Operators, Except Postal Service | 26 | 39 | +13 | observed use 25, rated potential 31, ability based 25, ilo tasks 81, market 30 | sources partly agree |
| 43-9061.00 | Office Clerks, General | 90 | 95 | +5 | observed use 97, rated potential 86, ability based 74, ilo tasks 98, market 98 | sources agree |
| 43-9071.00 | Office Machine Operators, Except Computer | 44 | 48 | +3 | observed use 54, rated potential 45, ability based 34, ilo tasks 67, market 30 | sources agree |
| 43-9081.00 | Proofreaders and Copy Markers | 93 | 82 | -11 | observed use 84, rated potential 97, ability based 87, ilo tasks 91, market 30 | sources partly agree |
| 43-9111.00 | Statistical Assistants | 99 | 100 | +1 | observed use 98, rated potential 98, ability based 96, ilo tasks 96, market 99 | sources agree |
| 43-9199.00 | Office and Administrative Support Workers, All Other | 90 | 95 | +6 | observed use 97, rated potential 86, ability based 74, ilo tasks 99, market 98 | sources agree |
| 45-1011.00 | First-Line Supervisors of Farming, Fishing, and Forestry Workers | 36 | 24 | -12 | observed use 25, rated potential 37, ability based 36, ilo tasks 14, market 30 | sources agree |
| 45-2011.00 | Agricultural Inspectors | 45 | 41 | -4 | observed use 25, rated potential 42, ability based 54, ilo tasks 51, market 30 | sources agree |
| 45-2021.00 | Animal Breeders | 20 | 18 | -2 | observed use 25, rated potential 25, ability based 16, ilo tasks 25, market 30 | sources agree |
| 45-2041.00 | Graders and Sorters, Agricultural Products | 10 | 22 | +12 | observed use 25, rated potential 14, ability based 7, ilo tasks 57, market 30 | sources partly agree |
| 45-2091.00 | Agricultural Equipment Operators | 7 | 4 | -3 | observed use 25, rated potential 3, ability based 13, ilo tasks 6, market 30 | sources agree |
| 45-2092.00 | Farmworkers and Laborers, Crop, Nursery, and Greenhouse | 13 | 24 | +11 | observed use 51, rated potential 19, ability based 4, ilo tasks 4, market 60 | sources partly agree |
| 45-2093.00 | Farmworkers, Farm, Ranch, and Aquacultural Animals | 11 | 6 | -4 | observed use 25, rated potential 16, ability based 14, ilo tasks 4, market 30 | sources agree |
| 45-2099.00 | Agricultural Workers, All Other | 7 | 3 | -4 | observed use 25, rated potential 3, ability based 13, ilo tasks 4, market 30 | sources agree |
| 45-3031.00 | Fishing and Hunting Workers | 0 | 7 | +7 | observed use 24, rated potential 10, ability based –, ilo tasks 8, market 30 | sources agree |
| 45-4011.00 | Forest and Conservation Workers | 11 | 6 | -5 | observed use 25, rated potential 13, ability based 15, ilo tasks 3, market 30 | sources agree |
| 45-4021.00 | Fallers | 2 | 4 | +2 | observed use 25, rated potential 17, ability based 2, ilo tasks 5, market 30 | sources agree |
| 45-4022.00 | Logging Equipment Operators | 22 | 9 | -12 | observed use 25, rated potential 19, ability based 17, ilo tasks 6, market 30 | sources agree |
| 45-4023.00 | Log Graders and Scalers | 32 | 21 | -11 | observed use 25, rated potential 35, ability based 36, ilo tasks 5, market 30 | sources agree |
| 45-4029.00 | Logging Workers, All Other | 22 | 8 | -13 | observed use 25, rated potential 19, ability based 17, ilo tasks 3, market 30 | sources agree |
| 47-1011.00 | First-Line Supervisors of Construction Trades and Extraction Workers | 47 | 47 | -0 | observed use 61, rated potential 47, ability based 40, ilo tasks 49, market 30 | sources agree |
| 47-1011.03 | Solar Energy Installation Managers | 50 | 43 | -7 | observed use 41, rated potential 51, ability based 40, ilo tasks 52, market 30 | sources agree |
| 47-2011.00 | Boilermakers | 8 | 13 | +4 | observed use 25, rated potential 6, ability based 14, ilo tasks 30, market 30 | sources agree |
| 47-2021.00 | Brickmasons and Blockmasons | 3 | 1 | -3 | observed use 25, rated potential 6, ability based 2, ilo tasks 0, market 30 | sources agree |
| 47-2022.00 | Stonemasons | 2 | 1 | -1 | observed use 25, rated potential 3, ability based 3, ilo tasks 3, market 30 | sources agree |
| 47-2031.00 | Carpenters | 14 | 7 | -7 | observed use 25, rated potential 22, ability based 8, ilo tasks 7, market 30 | sources agree |
| 47-2041.00 | Carpet Installers | 6 | 3 | -3 | observed use 25, rated potential 10, ability based 5, ilo tasks 2, market 30 | sources agree |
| 47-2042.00 | Floor Layers, Except Carpet, Wood, and Hard Tiles | 5 | 2 | -2 | observed use 25, rated potential 3, ability based 8, ilo tasks 2, market 30 | sources agree |
| 47-2043.00 | Floor Sanders and Finishers | 6 | 2 | -4 | observed use 25, rated potential 8, ability based 3, ilo tasks 2, market 30 | sources agree |
| 47-2044.00 | Tile and Stone Setters | 11 | 5 | -6 | observed use 25, rated potential 16, ability based 10, ilo tasks 2, market 30 | sources agree |
| 47-2051.00 | Cement Masons and Concrete Finishers | 1 | 0 | -1 | observed use 25, rated potential 3, ability based 2, ilo tasks 3, market 30 | sources agree |
| 47-2053.00 | Terrazzo Workers and Finishers | 1 | 1 | -1 | observed use 25, rated potential 5, ability based 2, ilo tasks 3, market 30 | sources agree |
| 47-2061.00 | Construction Laborers | 8 | 10 | +3 | observed use 54, rated potential 9, ability based 4, ilo tasks 0, market 30 | sources partly agree |
| 47-2071.00 | Paving, Surfacing, and Tamping Equipment Operators | 6 | 4 | -3 | observed use 25, rated potential 3, ability based 11, ilo tasks 8, market 30 | sources agree |
| 47-2072.00 | Pile Driver Operators | 5 | 4 | -2 | observed use 25, rated potential 3, ability based 10, ilo tasks 8, market 30 | sources agree |
| 47-2073.00 | Operating Engineers and Other Construction Equipment Operators | 15 | 11 | -5 | observed use 25, rated potential 15, ability based 22, ilo tasks 8, market 30 | sources agree |
| 47-2081.00 | Drywall and Ceiling Tile Installers | 4 | 3 | -1 | observed use 25, rated potential 10, ability based 4, ilo tasks 4, market 30 | sources agree |
| 47-2082.00 | Tapers | 3 | 1 | -2 | observed use 25, rated potential 3, ability based 5, ilo tasks 4, market 30 | sources agree |
| 47-2111.00 | Electricians | 23 | 22 | -1 | observed use 25, rated potential 28, ability based 26, ilo tasks 26, market 30 | sources agree |
| 47-2121.00 | Glaziers | 9 | 6 | -4 | observed use 25, rated potential 15, ability based 7, ilo tasks 9, market 30 | sources agree |
| 47-2131.00 | Insulation Workers, Floor, Ceiling, and Wall | 5 | 5 | -0 | observed use 25, rated potential 16, ability based 4, ilo tasks 7, market 30 | sources agree |
| 47-2132.00 | Insulation Workers, Mechanical | 13 | 16 | +3 | observed use 57, rated potential 10, ability based 9, ilo tasks 7, market 30 | sources partly agree |
| 47-2141.00 | Painters, Construction and Maintenance | 5 | 4 | -1 | observed use 25, rated potential 11, ability based 4, ilo tasks 6, market 30 | sources agree |
| 47-2142.00 | Paperhangers | 2 | 3 | +0 | observed use 25, rated potential 5, ability based 3, ilo tasks 6, market 30 | sources agree |
| 47-2151.00 | Pipelayers | 7 | 5 | -1 | observed use 25, rated potential 6, ability based 10, ilo tasks 13, market 30 | sources agree |
| 47-2152.00 | Plumbers, Pipefitters, and Steamfitters | 15 | 31 | +15 | observed use 53, rated potential 17, ability based 14, ilo tasks 13, market 67 | sources partly agree |
| 47-2152.04 | Solar Thermal Installers and Technicians | 11 | 14 | +3 | observed use 38, rated potential 14, ability based 14, ilo tasks 13, market 30 | sources agree |
| 47-2161.00 | Plasterers and Stucco Masons | 6 | 3 | -3 | observed use 25, rated potential 11, ability based 2, ilo tasks 4, market 30 | sources agree |
| 47-2171.00 | Reinforcing Iron and Rebar Workers | 5 | 2 | -2 | observed use 25, rated potential 9, ability based 0, ilo tasks 4, market 30 | sources agree |
| 47-2181.00 | Roofers | 4 | 11 | +6 | observed use 53, rated potential 7, ability based 2, ilo tasks 6, market 30 | sources partly agree |
| 47-2211.00 | Sheet Metal Workers | 10 | 14 | +4 | observed use 25, rated potential 12, ability based 12, ilo tasks 30, market 30 | sources agree |
| 47-2221.00 | Structural Iron and Steel Workers | 8 | 12 | +4 | observed use 62, rated potential 6, ability based 2, ilo tasks 4, market 30 | sources partly agree |
| 47-2231.00 | Solar Photovoltaic Installers | 18 | 15 | -3 | observed use 25, rated potential 21, ability based 20, ilo tasks 15, market 30 | sources agree |
| 47-3011.00 | Helpers--Brickmasons, Blockmasons, Stonemasons, and Tile and Marble Setters | 1 | 0 | -1 | observed use 25, rated potential 3, ability based 1, ilo tasks 1, market 30 | sources agree |
| 47-3012.00 | Helpers--Carpenters | 4 | 1 | -3 | observed use 25, rated potential 3, ability based 6, ilo tasks 1, market 30 | sources agree |
| 47-3013.00 | Helpers--Electricians | 4 | 1 | -3 | observed use 25, rated potential 5, ability based 5, ilo tasks 1, market 30 | sources agree |
| 47-3014.00 | Helpers--Painters, Paperhangers, Plasterers, and Stucco Masons | 1 | 0 | -0 | observed use 25, rated potential 3, ability based 0, ilo tasks 1, market 30 | sources agree |
| 47-3015.00 | Helpers--Pipelayers, Plumbers, Pipefitters, and Steamfitters | 2 | 0 | -2 | observed use 25, rated potential 3, ability based 4, ilo tasks 1, market 30 | sources agree |
| 47-3016.00 | Helpers--Roofers | 1 | 0 | -1 | observed use 25, rated potential 3, ability based 1, ilo tasks 1, market 30 | sources agree |
| 47-3019.00 | Helpers, Construction Trades, All Other | 4 | 1 | -2 | observed use 25, rated potential 3, ability based 6, ilo tasks 2, market 30 | sources agree |
| 47-4011.00 | Construction and Building Inspectors | 48 | 49 | +1 | observed use 67, rated potential 33, ability based 57, ilo tasks 48, market 30 | sources agree |
| 47-4011.01 | Energy Auditors | 58 | 50 | -7 | observed use 44, rated potential 65, ability based 57, ilo tasks 48, market 30 | sources agree |
| 47-4021.00 | Elevator and Escalator Installers and Repairers | 24 | 19 | -5 | observed use 25, rated potential 25, ability based 23, ilo tasks 19, market 30 | sources agree |
| 47-4031.00 | Fence Erectors | 4 | 2 | -1 | observed use 25, rated potential 12, ability based 1, ilo tasks 1, market 30 | sources agree |
| 47-4041.00 | Hazardous Materials Removal Workers | 21 | 10 | -11 | observed use 25, rated potential 13, ability based 29, ilo tasks 1, market 30 | sources agree |
| 47-4051.00 | Highway Maintenance Workers | 5 | 2 | -2 | observed use 25, rated potential 4, ability based 9, ilo tasks 0, market 30 | sources agree |
| 47-4061.00 | Rail-Track Laying and Maintenance Equipment Operators | 4 | 1 | -3 | observed use 25, rated potential 3, ability based 7, ilo tasks 0, market 30 | sources agree |
| 47-4071.00 | Septic Tank Servicers and Sewer Pipe Cleaners | 10 | 6 | -5 | observed use 25, rated potential 19, ability based 10, ilo tasks 2, market 30 | sources agree |
| 47-4091.00 | Segmental Pavers | 0 | 7 | +7 | observed use 24, rated potential 14, ability based 18, ilo tasks 3, market 30 | sources agree |
| 47-4099.00 | Construction and Related Workers, All Other | 7 | 13 | +6 | observed use 24, rated potential 28, ability based 22, ilo tasks 1, market 30 | sources agree |
| 47-4099.03 | Weatherization Installers and Technicians | 12 | 15 | +3 | observed use 24, rated potential 32, ability based 22, ilo tasks 1, market 30 | sources agree |
| 47-5011.00 | Derrick Operators, Oil and Gas | 4 | 7 | +3 | observed use 25, rated potential 3, ability based 6, ilo tasks 25, market 30 | sources agree |
| 47-5012.00 | Rotary Drill Operators, Oil and Gas | 17 | 17 | +0 | observed use 25, rated potential 12, ability based 26, ilo tasks 25, market 30 | sources agree |
| 47-5013.00 | Service Unit Operators, Oil and Gas | 14 | 19 | +5 | observed use 25, rated potential 23, ability based 18, ilo tasks 25, market 30 | sources agree |
| 47-5022.00 | Excavating and Loading Machine and Dragline Operators, Surface Mining | 15 | 5 | -10 | observed use 25, rated potential 3, ability based –, ilo tasks 8, market 30 | sources agree |
| 47-5023.00 | Earth Drillers, Except Oil and Gas | 27 | 21 | -7 | observed use 25, rated potential 23, ability based –, ilo tasks 25, market 30 | sources agree |
| 47-5032.00 | Explosives Workers, Ordnance Handling Experts, and Blasters | 27 | 13 | -14 | observed use 25, rated potential 26, ability based –, ilo tasks 5, market 30 | sources agree |
| 47-5041.00 | Continuous Mining Machine Operators | 7 | 8 | +1 | observed use 25, rated potential 9, ability based 12, ilo tasks 17, market 30 | sources agree |
| 47-5043.00 | Roof Bolters, Mining | 15 | 8 | -6 | observed use 25, rated potential 3, ability based –, ilo tasks 17, market 30 | sources agree |
| 47-5044.00 | Loading and Moving Machine Operators, Underground Mining | 16 | 13 | -3 | observed use 25, rated potential 13, ability based –, ilo tasks 17, market 30 | sources agree |
| 47-5049.00 | Underground Mining Machine Operators, All Other | 16 | 13 | -3 | observed use 25, rated potential 13, ability based –, ilo tasks 17, market 30 | sources agree |
| 47-5051.00 | Rock Splitters, Quarry | 6 | 7 | +1 | observed use 25, rated potential 16, ability based 2, ilo tasks 17, market 30 | sources agree |
| 47-5071.00 | Roustabouts, Oil and Gas | 3 | 6 | +3 | observed use 25, rated potential 3, ability based 5, ilo tasks 25, market 30 | sources agree |
| 47-5081.00 | Helpers--Extraction Workers | 3 | 3 | +1 | observed use 25, rated potential 11, ability based 5, ilo tasks 3, market 30 | sources agree |
| 47-5099.00 | Extraction Workers, All Other | 3 | 5 | +2 | observed use 25, rated potential 11, ability based 5, ilo tasks 11, market 30 | sources agree |
| 49-1011.00 | First-Line Supervisors of Mechanics, Installers, and Repairers | 58 | 46 | -12 | observed use 74, rated potential 50, ability based 48, ilo tasks 21, market 30 | sources partly agree |
| 49-2011.00 | Computer, Automated Teller, and Office Machine Repairers | 53 | 46 | -7 | observed use 74, rated potential 43, ability based 39, ilo tasks 39, market 30 | sources partly agree |
| 49-2021.00 | Radio, Cellular, and Tower Equipment Installers and Repairers | 24 | 25 | +2 | observed use 25, rated potential 22, ability based 31, ilo tasks 37, market 30 | sources agree |
| 49-2022.00 | Telecommunications Equipment Installers and Repairers, Except Line Installers | 33 | 44 | +11 | observed use 55, rated potential 37, ability based 23, ilo tasks 37, market 61 | sources agree |
| 49-2091.00 | Avionics Technicians | 37 | 33 | -4 | observed use 25, rated potential 33, ability based 45, ilo tasks 40, market 30 | sources agree |
| 49-2092.00 | Electric Motor, Power Tool, and Related Repairers | 21 | 16 | -5 | observed use 25, rated potential 14, ability based 25, ilo tasks 19, market 30 | sources agree |
| 49-2093.00 | Electrical and Electronics Installers and Repairers, Transportation Equipment | 27 | 28 | +1 | observed use 25, rated potential 35, ability based 24, ilo tasks 39, market 30 | sources agree |
| 49-2094.00 | Electrical and Electronics Repairers, Commercial and Industrial Equipment | 38 | 31 | -7 | observed use 25, rated potential 42, ability based 36, ilo tasks 33, market 30 | sources agree |
| 49-2095.00 | Electrical and Electronics Repairers, Powerhouse, Substation, and Relay | 38 | 30 | -8 | observed use 25, rated potential 40, ability based 33, ilo tasks 33, market 30 | sources agree |
| 49-2096.00 | Electronic Equipment Installers and Repairers, Motor Vehicles | 25 | 24 | -1 | observed use 25, rated potential 25, ability based 25, ilo tasks 33, market 30 | sources agree |
| 49-2097.00 | Audiovisual Equipment Installers and Repairers | 31 | 27 | -4 | observed use 25, rated potential 28, ability based 32, ilo tasks 37, market 30 | sources agree |
| 49-2098.00 | Security and Fire Alarm Systems Installers | 29 | 40 | +11 | observed use 55, rated potential 30, ability based 29, ilo tasks 19, market 64 | sources partly agree |
| 49-3011.00 | Aircraft Mechanics and Service Technicians | 25 | 23 | -2 | observed use 25, rated potential 23, ability based 30, ilo tasks 27, market 30 | sources agree |
| 49-3021.00 | Automotive Body and Related Repairers | 9 | 11 | +2 | observed use 25, rated potential 13, ability based 12, ilo tasks 21, market 30 | sources agree |
| 49-3022.00 | Automotive Glass Installers and Repairers | 6 | 7 | +1 | observed use 25, rated potential 3, ability based 10, ilo tasks 21, market 30 | sources agree |
| 49-3023.00 | Automotive Service Technicians and Mechanics | 17 | 17 | -0 | observed use 25, rated potential 20, ability based 20, ilo tasks 21, market 30 | sources agree |
| 49-3031.00 | Bus and Truck Mechanics and Diesel Engine Specialists | 9 | 9 | +0 | observed use 25, rated potential 3, ability based 17, ilo tasks 21, market 30 | sources agree |
| 49-3041.00 | Farm Equipment Mechanics and Service Technicians | 14 | 16 | +2 | observed use 25, rated potential 29, ability based 10, ilo tasks 18, market 30 | sources agree |
| 49-3042.00 | Mobile Heavy Equipment Mechanics, Except Engines | 13 | 14 | +1 | observed use 25, rated potential 24, ability based 12, ilo tasks 18, market 30 | sources agree |
| 49-3043.00 | Rail Car Repairers | 10 | 10 | +1 | observed use 25, rated potential 20, ability based 6, ilo tasks 18, market 30 | sources agree |
| 49-3051.00 | Motorboat Mechanics and Service Technicians | 17 | 16 | -1 | observed use 25, rated potential 15, ability based 22, ilo tasks 21, market 30 | sources agree |
| 49-3052.00 | Motorcycle Mechanics | 14 | 12 | -2 | observed use 25, rated potential 3, ability based 26, ilo tasks 21, market 30 | sources agree |
| 49-3053.00 | Outdoor Power Equipment and Other Small Engine Mechanics | 23 | 19 | -4 | observed use 25, rated potential 28, ability based 21, ilo tasks 19, market 30 | sources agree |
| 49-3091.00 | Bicycle Repairers | 18 | 11 | -7 | observed use 25, rated potential 19, ability based 20, ilo tasks 7, market 30 | sources agree |
| 49-3092.00 | Recreational Vehicle Service Technicians | 14 | 17 | +2 | observed use 25, rated potential 19, ability based 20, ilo tasks 21, market 30 | sources agree |
| 49-3093.00 | Tire Repairers and Changers | 3 | 5 | +3 | observed use 25, rated potential 3, ability based 5, ilo tasks 21, market 30 | sources agree |
| 49-9011.00 | Mechanical Door Repairers | 13 | 12 | -1 | observed use 25, rated potential 22, ability based 7, ilo tasks 19, market 30 | sources agree |
| 49-9012.00 | Control and Valve Installers and Repairers, Except Mechanical Door | 22 | 19 | -4 | observed use 25, rated potential 22, ability based 26, ilo tasks 19, market 30 | sources agree |
| 49-9021.00 | Heating, Air Conditioning, and Refrigeration Mechanics and Installers | 21 | 30 | +9 | observed use 52, rated potential 26, ability based 24, ilo tasks 31, market 30 | sources agree |
| 49-9031.00 | Home Appliance Repairers | 20 | 18 | -2 | observed use 25, rated potential 27, ability based 19, ilo tasks 19, market 30 | sources agree |
| 49-9041.00 | Industrial Machinery Mechanics | 26 | 26 | +0 | observed use 52, rated potential 33, ability based 13, ilo tasks 18, market 30 | sources agree |
| 49-9043.00 | Maintenance Workers, Machinery | 20 | 17 | -3 | observed use 25, rated potential 26, ability based 18, ilo tasks 18, market 30 | sources agree |
| 49-9044.00 | Millwrights | 5 | 8 | +2 | observed use 25, rated potential 10, ability based 9, ilo tasks 18, market 30 | sources agree |
| 49-9045.00 | Refractory Materials Repairers, Except Brickmasons | 5 | 1 | -4 | observed use 25, rated potential 3, ability based 9, ilo tasks 0, market 30 | sources agree |
| 49-9051.00 | Electrical Power-Line Installers and Repairers | 8 | 6 | -2 | observed use 25, rated potential 3, ability based 15, ilo tasks 14, market 30 | sources agree |
| 49-9052.00 | Telecommunications Line Installers and Repairers | 9 | 17 | +8 | observed use 25, rated potential 11, ability based 15, ilo tasks 37, market 30 | sources agree |
| 49-9061.00 | Camera and Photographic Equipment Repairers | 45 | 48 | +4 | observed use 59, rated potential 24, ability based 50, ilo tasks 32, market 68 | sources partly agree |
| 49-9062.00 | Medical Equipment Repairers | 39 | 33 | -6 | observed use 25, rated potential 44, ability based 41, ilo tasks 32, market 30 | sources agree |
| 49-9063.00 | Musical Instrument Repairers and Tuners | 19 | 12 | -7 | observed use 25, rated potential 6, ability based 34, ilo tasks 9, market 30 | sources agree |
| 49-9064.00 | Watch and Clock Repairers | 34 | 30 | -5 | observed use 25, rated potential 32, ability based 42, ilo tasks 32, market 30 | sources agree |
| 49-9069.00 | Precision Instrument and Equipment Repairers, All Other | 19 | 20 | +1 | observed use 25, rated potential 6, ability based 34, ilo tasks 32, market 30 | sources agree |
| 49-9071.00 | Maintenance and Repair Workers, General | 18 | 10 | -9 | observed use 25, rated potential 22, ability based 17, ilo tasks 3, market 30 | sources agree |
| 49-9081.00 | Wind Turbine Service Technicians | 12 | 11 | -1 | observed use 25, rated potential 10, ability based 19, ilo tasks 19, market 30 | sources agree |
| 49-9091.00 | Coin, Vending, and Amusement Machine Servicers and Repairers | 34 | 40 | +6 | observed use 25, rated potential 37, ability based 28, ilo tasks 73, market 30 | sources partly agree |
| 49-9092.00 | Commercial Divers | 11 | 11 | -0 | observed use 25, rated potential 19, ability based 14, ilo tasks 14, market 30 | sources agree |
| 49-9094.00 | Locksmiths and Safe Repairers | 18 | 19 | +2 | observed use 25, rated potential 17, ability based 23, ilo tasks 30, market 30 | sources agree |
| 49-9095.00 | Manufactured Building and Mobile Home Installers | 8 | 5 | -3 | observed use 25, rated potential 20, ability based 6, ilo tasks 1, market 30 | sources agree |
| 49-9096.00 | Riggers | 5 | 4 | -1 | observed use 25, rated potential 9, ability based 10, ilo tasks 6, market 30 | sources agree |
| 49-9097.00 | Signal and Track Switch Repairers | 18 | 15 | -3 | observed use 25, rated potential 14, ability based 23, ilo tasks 19, market 30 | sources agree |
| 49-9098.00 | Helpers--Installation, Maintenance, and Repair Workers | 5 | 3 | -3 | observed use 25, rated potential 6, ability based 8, ilo tasks 3, market 30 | sources agree |
| 49-9099.00 | Installation, Maintenance, and Repair Workers, All Other | 36 | 20 | -15 | observed use 25, rated potential 35, ability based 32, ilo tasks 5, market 30 | sources agree |
| 49-9099.01 | Geothermal Technicians | 30 | 21 | -9 | observed use 25, rated potential 39, ability based 32, ilo tasks 5, market 30 | sources agree |
| 51-1011.00 | First-Line Supervisors of Production and Operating Workers | 47 | 46 | -1 | observed use 38, rated potential 46, ability based 47, ilo tasks 62, market 30 | sources agree |
| 51-2011.00 | Aircraft Structure, Surfaces, Rigging, and Systems Assemblers | 19 | 33 | +14 | observed use 65, rated potential 10, ability based 23, ilo tasks 44, market 30 | sources partly agree |
| 51-2021.00 | Coil Winders, Tapers, and Finishers | 26 | 42 | +16 | observed use 39, rated potential 28, ability based 25, ilo tasks 48, market 67 | sources partly agree |
| 51-2022.00 | Electrical and Electronic Equipment Assemblers | 9 | 40 | +31 | observed use 66, rated potential 19, ability based 31, ilo tasks 48, market 30 | sources partly agree |
| 51-2023.00 | Electromechanical Equipment Assemblers | 7 | 25 | +18 | observed use 24, rated potential 8, ability based 35, ilo tasks 48, market 30 | sources agree |
| 51-2031.00 | Engine and Other Machine Assemblers | 17 | 21 | +4 | observed use 25, rated potential 12, ability based 19, ilo tasks 44, market 30 | sources agree |
| 51-2041.00 | Structural Metal Fabricators and Fitters | 8 | 4 | -4 | observed use 25, rated potential 8, ability based 15, ilo tasks 4, market 30 | sources agree |
| 51-2051.00 | Fiberglass Laminators and Fabricators | 16 | 14 | -2 | observed use 25, rated potential 13, ability based –, ilo tasks 20, market 30 | sources agree |
| 51-2061.00 | Timing Device Assemblers and Adjusters | 26 | 35 | +9 | observed use 59, rated potential 8, ability based –, ilo tasks 48, market 30 | sources partly agree |
| 51-2092.00 | Team Assemblers | 16 | 30 | +14 | observed use 24, rated potential 24, ability based 24, ilo tasks 59, market 30 | sources agree |
| 51-2099.00 | Assemblers and Fabricators, All Other | 16 | 30 | +14 | observed use 24, rated potential 24, ability based 24, ilo tasks 59, market 30 | sources agree |
| 51-3011.00 | Bakers | 35 | 24 | -12 | observed use 25, rated potential 29, ability based 37, ilo tasks 17, market 30 | sources agree |
| 51-3021.00 | Butchers and Meat Cutters | 19 | 8 | -11 | observed use 25, rated potential 13, ability based 19, ilo tasks 6, market 30 | sources agree |
| 51-3022.00 | Meat, Poultry, and Fish Cutters and Trimmers | 7 | 4 | -3 | observed use 25, rated potential 3, ability based 14, ilo tasks 6, market 30 | sources agree |
| 51-3023.00 | Slaughterers and Meat Packers | 1 | 1 | -0 | observed use 25, rated potential 3, ability based 1, ilo tasks 6, market 30 | sources agree |
| 51-3091.00 | Food and Tobacco Roasting, Baking, and Drying Machine Operators and Tenders | 19 | 15 | -4 | observed use 25, rated potential 15, ability based 27, ilo tasks 14, market 30 | sources agree |
| 51-3092.00 | Food Batchmakers | 28 | 21 | -6 | observed use 25, rated potential 25, ability based 38, ilo tasks 14, market 30 | sources agree |
| 51-3093.00 | Food Cooking Machine Operators and Tenders | 26 | 18 | -8 | observed use 25, rated potential 17, ability based 33, ilo tasks 14, market 30 | sources agree |
| 51-3099.00 | Food Processing Workers, All Other | 28 | 21 | -7 | observed use 25, rated potential 25, ability based 38, ilo tasks 13, market 30 | sources agree |
| 51-4021.00 | Extruding and Drawing Machine Setters, Operators, and Tenders, Metal and Plastic | 6 | 14 | +8 | observed use 25, rated potential 12, ability based 9, ilo tasks 31, market 30 | sources agree |
| 51-4022.00 | Forging Machine Setters, Operators, and Tenders, Metal and Plastic | 16 | 14 | -3 | observed use 25, rated potential 11, ability based 25, ilo tasks 17, market 30 | sources agree |
| 51-4023.00 | Rolling Machine Setters, Operators, and Tenders, Metal and Plastic | 20 | 19 | -0 | observed use 25, rated potential 24, ability based 14, ilo tasks 31, market 30 | sources agree |
| 51-4031.00 | Cutting, Punching, and Press Machine Setters, Operators, and Tenders, Metal and Plastic | 9 | 11 | +2 | observed use 25, rated potential 6, ability based 16, ilo tasks 23, market 30 | sources agree |
| 51-4032.00 | Drilling and Boring Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 16 | 15 | -1 | observed use 25, rated potential 6, ability based 26, ilo tasks 23, market 30 | sources agree |
| 51-4033.00 | Grinding, Lapping, Polishing, and Buffing Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 13 | 14 | +1 | observed use 25, rated potential 14, ability based 18, ilo tasks 21, market 30 | sources agree |
| 51-4034.00 | Lathe and Turning Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 19 | 15 | -4 | observed use 25, rated potential 18, ability based 15, ilo tasks 23, market 30 | sources agree |
| 51-4035.00 | Milling and Planing Machine Setters, Operators, and Tenders, Metal and Plastic | 26 | 20 | -7 | observed use 25, rated potential 25, ability based 23, ilo tasks 23, market 30 | sources agree |
| 51-4041.00 | Machinists | 26 | 21 | -5 | observed use 25, rated potential 30, ability based 23, ilo tasks 23, market 30 | sources agree |
| 51-4051.00 | Metal-Refining Furnace Operators and Tenders | 13 | 23 | +9 | observed use 25, rated potential 17, ability based 12, ilo tasks 52, market 30 | sources agree |
| 51-4052.00 | Pourers and Casters, Metal | 9 | 18 | +9 | observed use 25, rated potential 3, ability based 17, ilo tasks 44, market 30 | sources agree |
| 51-4061.00 | Model Makers, Metal and Plastic | 25 | 24 | -1 | observed use 25, rated potential 27, ability based 27, ilo tasks 30, market 30 | sources agree |
| 51-4062.00 | Patternmakers, Metal and Plastic | 26 | 25 | -1 | observed use 25, rated potential 29, ability based 31, ilo tasks 30, market 30 | sources agree |
| 51-4071.00 | Foundry Mold and Coremakers | 2 | 2 | +1 | observed use 25, rated potential 3, ability based 3, ilo tasks 8, market 30 | sources agree |
| 51-4072.00 | Molding, Coremaking, and Casting Machine Setters, Operators, and Tenders, Metal and Plastic | 12 | 11 | -1 | observed use 25, rated potential 15, ability based 13, ilo tasks 20, market 30 | sources agree |
| 51-4081.00 | Multiple Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 22 | 20 | -1 | observed use 25, rated potential 22, ability based 27, ilo tasks 23, market 30 | sources agree |
| 51-4111.00 | Tool and Die Makers | 30 | 27 | -3 | observed use 25, rated potential 33, ability based 33, ilo tasks 30, market 30 | sources agree |
| 51-4121.00 | Welders, Cutters, Solderers, and Brazers | 12 | 6 | -5 | observed use 25, rated potential 14, ability based 11, ilo tasks 7, market 30 | sources agree |
| 51-4122.00 | Welding, Soldering, and Brazing Machine Setters, Operators, and Tenders | 13 | 9 | -4 | observed use 25, rated potential 16, ability based 17, ilo tasks 7, market 30 | sources agree |
| 51-4191.00 | Heat Treating Equipment Setters, Operators, and Tenders, Metal and Plastic | 19 | 20 | +0 | observed use 25, rated potential 22, ability based 14, ilo tasks 34, market 30 | sources agree |
| 51-4192.00 | Layout Workers, Metal and Plastic | 23 | 24 | +1 | observed use 25, rated potential 28, ability based 28, ilo tasks 30, market 30 | sources agree |
| 51-4193.00 | Plating Machine Setters, Operators, and Tenders, Metal and Plastic | 19 | 19 | +1 | observed use 25, rated potential 18, ability based 21, ilo tasks 30, market 30 | sources agree |
| 51-4194.00 | Tool Grinders, Filers, and Sharpeners | 13 | 11 | -2 | observed use 25, rated potential 6, ability based 22, ilo tasks 16, market 30 | sources agree |
| 51-4199.00 | Metal Workers and Plastic Workers, All Other | 23 | 22 | -1 | observed use 25, rated potential 28, ability based 28, ilo tasks 23, market 30 | sources agree |
| 51-5111.00 | Prepress Technicians and Workers | 63 | 72 | +8 | observed use 75, rated potential 44, ability based 59, ilo tasks 75, market 85 | sources agree |
| 51-5112.00 | Printing Press Operators | 32 | 29 | -3 | observed use 25, rated potential 35, ability based 28, ilo tasks 40, market 30 | sources agree |
| 51-5113.00 | Print Binding and Finishing Workers | 17 | 20 | +3 | observed use 25, rated potential 17, ability based 21, ilo tasks 34, market 30 | sources agree |
| 51-6011.00 | Laundry and Dry-Cleaning Workers | 11 | 10 | -1 | observed use 25, rated potential 14, ability based 16, ilo tasks 14, market 30 | sources agree |
| 51-6021.00 | Pressers, Textile, Garment, and Related Materials | 1 | 3 | +2 | observed use 25, rated potential 6, ability based 1, ilo tasks 11, market 30 | sources agree |
| 51-6031.00 | Sewing Machine Operators | 16 | 9 | -7 | observed use 25, rated potential 11, ability based 19, ilo tasks 11, market 30 | sources agree |
| 51-6041.00 | Shoe and Leather Workers and Repairers | 13 | 11 | -2 | observed use 25, rated potential 15, ability based 18, ilo tasks 13, market 30 | sources agree |
| 51-6042.00 | Shoe Machine Operators and Tenders | 15 | 10 | -5 | observed use 25, rated potential 11, ability based 16, ilo tasks 15, market 30 | sources agree |
| 51-6051.00 | Sewers, Hand | 19 | 12 | -8 | observed use 25, rated potential 10, ability based 32, ilo tasks 6, market 30 | sources agree |
| 51-6052.00 | Tailors, Dressmakers, and Custom Sewers | 29 | 26 | -3 | observed use 55, rated potential 15, ability based 37, ilo tasks 11, market 30 | sources partly agree |
| 51-6061.00 | Textile Bleaching and Dyeing Machine Operators and Tenders | 24 | 31 | +7 | observed use 53, rated potential 26, ability based 23, ilo tasks 31, market 30 | sources agree |
| 51-6062.00 | Textile Cutting Machine Setters, Operators, and Tenders | 20 | 25 | +4 | observed use 52, rated potential 28, ability based 17, ilo tasks 16, market 30 | sources agree |
| 51-6063.00 | Textile Knitting and Weaving Machine Setters, Operators, and Tenders | 19 | 22 | +3 | observed use 54, rated potential 25, ability based 9, ilo tasks 15, market 30 | sources partly agree |
| 51-6064.00 | Textile Winding, Twisting, and Drawing Out Machine Setters, Operators, and Tenders | 9 | 8 | -1 | observed use 25, rated potential 16, ability based 7, ilo tasks 14, market 30 | sources agree |
| 51-6091.00 | Extruding and Forming Machine Setters, Operators, and Tenders, Synthetic and Glass Fibers | 17 | 15 | -2 | observed use 25, rated potential 16, ability based 23, ilo tasks 18, market 30 | sources agree |
| 51-6092.00 | Fabric and Apparel Patternmakers | 53 | 33 | -20 | observed use 25, rated potential 53, ability based 47, ilo tasks 16, market 30 | sources agree |
| 51-6093.00 | Upholsterers | 17 | 14 | -3 | observed use 25, rated potential 26, ability based 8, ilo tasks 20, market 30 | sources agree |
| 51-6099.00 | Textile, Apparel, and Furnishings Workers, All Other | 53 | 32 | -22 | observed use 25, rated potential 53, ability based 47, ilo tasks 12, market 30 | sources partly agree |
| 51-7011.00 | Cabinetmakers and Bench Carpenters | 12 | 9 | -3 | observed use 25, rated potential 17, ability based 8, ilo tasks 14, market 30 | sources agree |
| 51-7021.00 | Furniture Finishers | 7 | 8 | +1 | observed use 25, rated potential 12, ability based 11, ilo tasks 14, market 30 | sources agree |
| 51-7031.00 | Model Makers, Wood | 25 | 20 | -5 | observed use 25, rated potential 28, ability based 28, ilo tasks 14, market 30 | sources agree |
| 51-7032.00 | Patternmakers, Wood | 26 | 28 | +1 | observed use 53, rated potential 39, ability based 15, ilo tasks 14, market 30 | sources agree |
| 51-7041.00 | Sawing Machine Setters, Operators, and Tenders, Wood | 10 | 6 | -4 | observed use 25, rated potential 10, ability based 12, ilo tasks 11, market 30 | sources agree |
| 51-7042.00 | Woodworking Machine Setters, Operators, and Tenders, Except Sawing | 11 | 16 | +5 | observed use 25, rated potential 13, ability based 13, ilo tasks 33, market 30 | sources agree |
| 51-7099.00 | Woodworkers, All Other | 12 | 6 | -6 | observed use 25, rated potential 17, ability based 8, ilo tasks 9, market 30 | sources agree |
| 51-8011.00 | Nuclear Power Reactor Operators | 52 | 42 | -10 | observed use 25, rated potential 36, ability based 66, ilo tasks 47, market 30 | sources agree |
| 51-8012.00 | Power Distributors and Dispatchers | 52 | 43 | -9 | observed use 25, rated potential 49, ability based 60, ilo tasks 47, market 30 | sources agree |
| 51-8013.00 | Power Plant Operators | 37 | 52 | +15 | observed use 60, rated potential 32, ability based 39, ilo tasks 47, market 74 | sources partly agree |
| 51-8013.03 | Biomass Plant Technicians | 31 | 35 | +3 | observed use 40, rated potential 23, ability based 39, ilo tasks 47, market 30 | sources agree |
| 51-8013.04 | Hydroelectric Plant Technicians | 30 | 34 | +5 | observed use 40, rated potential 21, ability based 39, ilo tasks 47, market 30 | sources agree |
| 51-8021.00 | Stationary Engineers and Boiler Operators | 29 | 25 | -4 | observed use 25, rated potential 25, ability based 35, ilo tasks 27, market 30 | sources agree |
| 51-8031.00 | Water and Wastewater Treatment Plant and System Operators | 27 | 30 | +2 | observed use 25, rated potential 25, ability based 37, ilo tasks 44, market 30 | sources agree |
| 51-8091.00 | Chemical Plant and System Operators | 30 | 34 | +3 | observed use 25, rated potential 28, ability based 38, ilo tasks 54, market 30 | sources agree |
| 51-8092.00 | Gas Plant Operators | 35 | 53 | +19 | observed use 70, rated potential 19, ability based 40, ilo tasks 53, market 76 | sources partly agree |
| 51-8093.00 | Petroleum Pump System Operators, Refinery Operators, and Gaugers | 37 | 44 | +7 | observed use 62, rated potential 33, ability based 38, ilo tasks 53, market 30 | sources agree |
| 51-8099.00 | Plant and System Operators, All Other | 33 | 29 | -4 | observed use 25, rated potential 30, ability based 29, ilo tasks 44, market 30 | sources agree |
| 51-8099.01 | Biofuels Processing Technicians | 22 | 26 | +4 | observed use 25, rated potential 23, ability based 29, ilo tasks 39, market 30 | sources agree |
| 51-9011.00 | Chemical Equipment Operators and Tenders | 29 | 27 | -2 | observed use 25, rated potential 22, ability based 35, ilo tasks 39, market 30 | sources agree |
| 51-9012.00 | Separating, Filtering, Clarifying, Precipitating, and Still Machine Setters, Operators, and Tenders | 20 | 23 | +3 | observed use 25, rated potential 22, ability based 20, ilo tasks 39, market 30 | sources agree |
| 51-9021.00 | Crushing, Grinding, and Polishing Machine Setters, Operators, and Tenders | 21 | 41 | +19 | observed use 61, rated potential 20, ability based 16, ilo tasks 33, market 70 | sources partly agree |
| 51-9022.00 | Grinding and Polishing Workers, Hand | 8 | 8 | -0 | observed use 25, rated potential 9, ability based 12, ilo tasks 16, market 30 | sources agree |
| 51-9023.00 | Mixing and Blending Machine Setters, Operators, and Tenders | 21 | 40 | +19 | observed use 42, rated potential 21, ability based 25, ilo tasks 34, market 71 | sources partly agree |
| 51-9031.00 | Cutters and Trimmers, Hand | 10 | 8 | -2 | observed use 25, rated potential 3, ability based 20, ilo tasks 16, market 30 | sources agree |
| 51-9032.00 | Cutting and Slicing Machine Setters, Operators, and Tenders | 17 | 27 | +10 | observed use 57, rated potential 15, ability based 15, ilo tasks 34, market 30 | sources partly agree |
| 51-9041.00 | Extruding, Forming, Pressing, and Compacting Machine Setters, Operators, and Tenders | 13 | 12 | -1 | observed use 25, rated potential 18, ability based 16, ilo tasks 16, market 30 | sources agree |
| 51-9051.00 | Furnace, Kiln, Oven, Drier, and Kettle Operators and Tenders | 21 | 18 | -3 | observed use 25, rated potential 19, ability based 19, ilo tasks 26, market 30 | sources agree |
| 51-9061.00 | Inspectors, Testers, Sorters, Samplers, and Weighers | 52 | 57 | +5 | observed use 55, rated potential 47, ability based 48, ilo tasks 58, market 64 | sources agree |
| 51-9071.00 | Jewelers and Precious Stone and Metal Workers | 34 | 26 | -8 | observed use 25, rated potential 28, ability based 46, ilo tasks 20, market 30 | sources agree |
| 51-9071.06 | Gem and Diamond Workers | 36 | 28 | -8 | observed use 25, rated potential 34, ability based 46, ilo tasks 20, market 30 | sources agree |
| 51-9081.00 | Dental Laboratory Technicians | 26 | 23 | -3 | observed use 25, rated potential 11, ability based 49, ilo tasks 22, market 30 | sources agree |
| 51-9082.00 | Medical Appliance Technicians | 28 | 23 | -5 | observed use 25, rated potential 25, ability based 35, ilo tasks 22, market 30 | sources agree |
| 51-9083.00 | Ophthalmic Laboratory Technicians | 23 | 17 | -6 | observed use 25, rated potential 19, ability based 32, ilo tasks 11, market 30 | sources agree |
| 51-9111.00 | Packaging and Filling Machine Operators and Tenders | 10 | 18 | +8 | observed use 25, rated potential 12, ability based 18, ilo tasks 34, market 30 | sources agree |
| 51-9123.00 | Painting, Coating, and Decorating Workers | 10 | 12 | +2 | observed use 25, rated potential 6, ability based 19, ilo tasks 24, market 30 | sources agree |
| 51-9124.00 | Coating, Painting, and Spraying Machine Setters, Operators, and Tenders | 18 | 32 | +13 | observed use 39, rated potential 9, ability based –, ilo tasks 22, market 64 | sources partly agree |
| 51-9141.00 | Semiconductor Processing Technicians | 30 | 25 | -5 | observed use 25, rated potential 29, ability based 30, ilo tasks –, market 30 | sources agree |
| 51-9151.00 | Photographic Process Workers and Processing Machine Operators | 44 | 43 | -1 | observed use 51, rated potential 46, ability based 39, ilo tasks 46, market 30 | sources agree |
| 51-9161.00 | Computer Numerically Controlled Tool Operators | 40 | 34 | -6 | observed use 52, rated potential 34, ability based –, ilo tasks 23, market 30 | sources agree |
| 51-9162.00 | Computer Numerically Controlled Tool Programmers | 91 | 73 | -18 | observed use 78, rated potential 83, ability based –, ilo tasks 30, market 88 | sources partly agree |
| 51-9191.00 | Adhesive Bonding Machine Operators and Tenders | 8 | 8 | +0 | observed use 25, rated potential 8, ability based 8, ilo tasks 22, market 30 | sources agree |
| 51-9192.00 | Cleaning, Washing, and Metal Pickling Equipment Operators and Tenders | 14 | 18 | +4 | observed use 25, rated potential 15, ability based 13, ilo tasks 38, market 30 | sources agree |
| 51-9193.00 | Cooling and Freezing Equipment Operators and Tenders | 16 | 12 | -4 | observed use 25, rated potential 15, ability based 19, ilo tasks 14, market 30 | sources agree |
| 51-9194.00 | Etchers and Engravers | 25 | 21 | -4 | observed use 25, rated potential 20, ability based 30, ilo tasks 25, market 30 | sources agree |
| 51-9195.00 | Molders, Shapers, and Casters, Except Metal and Plastic | 6 | 7 | +1 | observed use 25, rated potential 5, ability based 11, ilo tasks 20, market 30 | sources agree |
| 51-9195.03 | Stone Cutters and Carvers, Manufacturing | 12 | 13 | +1 | observed use 25, rated potential 15, ability based 11, ilo tasks 24, market 30 | sources agree |
| 51-9195.04 | Glass Blowers, Molders, Benders, and Finishers | 14 | 16 | +2 | observed use 25, rated potential 22, ability based 11, ilo tasks 25, market 30 | sources agree |
| 51-9195.05 | Potters, Manufacturing | 12 | 11 | -1 | observed use 25, rated potential 13, ability based 11, ilo tasks 20, market 30 | sources agree |
| 51-9196.00 | Paper Goods Machine Setters, Operators, and Tenders | 12 | 19 | +7 | observed use 25, rated potential 5, ability based 22, ilo tasks 40, market 30 | sources agree |
| 51-9197.00 | Tire Builders | 2 | 6 | +4 | observed use 25, rated potential 5, ability based 4, ilo tasks 23, market 30 | sources agree |
| 51-9198.00 | Helpers--Production Workers | 14 | 26 | +12 | observed use 59, rated potential 17, ability based 7, ilo tasks 5, market 61 | sources partly agree |
| 51-9199.00 | Production Workers, All Other | 0 | 26 | +26 | observed use 56, rated potential 18, ability based 8, ilo tasks 5, market 61 | sources partly agree |
| 53-1041.00 | Aircraft Cargo Handling Supervisors | 40 | 16 | -25 | observed use 25, rated potential 26, ability based –, ilo tasks 10, market 30 | sources agree |
| 53-1042.00 | First-Line Supervisors of Helpers, Laborers, and Material Movers, Hand | 20 | 45 | +25 | observed use 55, rated potential 45, ability based –, ilo tasks 10, market 66 | sources partly agree |
| 53-1042.01 | Recycling Coordinators | 46 | 29 | -17 | observed use 24, rated potential 63, ability based –, ilo tasks 10, market 30 | sources partly agree |
| 53-1043.00 | First-Line Supervisors of Material-Moving Machine and Vehicle Operators | 46 | 34 | -12 | observed use 24, rated potential 50, ability based –, ilo tasks 35, market 30 | sources agree |
| 53-1044.00 | First-Line Supervisors of Passenger Attendants | 32 | 53 | +21 | observed use 61, rated potential 45, ability based –, ilo tasks 35, market 63 | sources agree |
| 53-1049.00 | First-Line Supervisors of Transportation Workers, All Other | 32 | 52 | +20 | observed use 61, rated potential 45, ability based –, ilo tasks 35, market 63 | sources agree |
| 53-2011.00 | Airline Pilots, Copilots, and Flight Engineers | 43 | 37 | -6 | observed use 25, rated potential 43, ability based 43, ilo tasks 47, market 30 | sources agree |
| 53-2012.00 | Commercial Pilots | 37 | 35 | -2 | observed use 25, rated potential 36, ability based 45, ilo tasks 47, market 30 | sources agree |
| 53-2021.00 | Air Traffic Controllers | 57 | 51 | -6 | observed use 25, rated potential 51, ability based 82, ilo tasks 58, market 30 | sources partly agree |
| 53-2022.00 | Airfield Operations Specialists | 56 | 52 | -4 | observed use 60, rated potential 53, ability based 60, ilo tasks –, market 30 | sources agree |
| 53-2031.00 | Flight Attendants | 34 | 46 | +11 | observed use 67, rated potential 28, ability based 26, ilo tasks 32, market 70 | sources partly agree |
| 53-3011.00 | Ambulance Drivers and Attendants, Except Emergency Medical Technicians | 19 | 25 | +5 | observed use 25, rated potential 15, ability based 24, ilo tasks 47, market 30 | sources agree |
| 53-3031.00 | Driver/Sales Workers | 37 | 48 | +10 | observed use 55, rated potential 35, ability based 27, ilo tasks 47, market 65 | sources agree |
| 53-3032.00 | Heavy and Tractor-Trailer Truck Drivers | 24 | 24 | +0 | observed use 25, rated potential 33, ability based 12, ilo tasks 39, market 30 | sources agree |
| 53-3033.00 | Light Truck Drivers | 29 | 29 | -0 | observed use 25, rated potential 41, ability based 14, ilo tasks 47, market 30 | sources agree |
| 53-3051.00 | Bus Drivers, School | 44 | 24 | -20 | observed use 25, rated potential 35, ability based –, ilo tasks 22, market 30 | sources agree |
| 53-3052.00 | Bus Drivers, Transit and Intercity | 36 | 21 | -15 | observed use 25, rated potential 28, ability based –, ilo tasks 22, market 30 | sources agree |
| 53-3053.00 | Shuttle Drivers and Chauffeurs | 37 | 27 | -10 | observed use 25, rated potential 32, ability based –, ilo tasks 35, market 30 | sources agree |
| 53-3054.00 | Taxi Drivers | 39 | 33 | -6 | observed use 25, rated potential 35, ability based –, ilo tasks 47, market 30 | sources agree |
| 53-3099.00 | Motor Vehicle Operators, All Other | 29 | 27 | -2 | observed use 25, rated potential 41, ability based 14, ilo tasks 40, market 30 | sources agree |
| 53-4011.00 | Locomotive Engineers | 36 | 30 | -6 | observed use 25, rated potential 43, ability based 35, ilo tasks 29, market 30 | sources agree |
| 53-4013.00 | Rail Yard Engineers, Dinkey Operators, and Hostlers | 25 | 22 | -4 | observed use 25, rated potential 25, ability based 24, ilo tasks 29, market 30 | sources agree |
| 53-4022.00 | Railroad Brake, Signal, and Switch Operators and Locomotive Firers | 31 | 18 | -13 | observed use 25, rated potential 21, ability based –, ilo tasks 19, market 30 | sources agree |
| 53-4031.00 | Railroad Conductors and Yardmasters | 36 | 27 | -9 | observed use 25, rated potential 41, ability based 36, ilo tasks 19, market 30 | sources agree |
| 53-4041.00 | Subway and Streetcar Operators | 40 | 27 | -13 | observed use 25, rated potential 39, ability based 31, ilo tasks 25, market 30 | sources agree |
| 53-4099.00 | Rail Transportation Workers, All Other | 25 | 19 | -6 | observed use 25, rated potential 25, ability based 24, ilo tasks 19, market 30 | sources agree |
| 53-5011.00 | Sailors and Marine Oilers | 9 | 6 | -4 | observed use 25, rated potential 8, ability based 12, ilo tasks 10, market 30 | sources agree |
| 53-5021.00 | Captains, Mates, and Pilots of Water Vessels | 35 | 35 | +0 | observed use 25, rated potential 38, ability based 37, ilo tasks 53, market 30 | sources agree |
| 53-5022.00 | Motorboat Operators | 11 | 12 | +0 | observed use 25, rated potential 16, ability based 21, ilo tasks 11, market 30 | sources agree |
| 53-5031.00 | Ship Engineers | 29 | 28 | -1 | observed use 25, rated potential 30, ability based 34, ilo tasks 35, market 30 | sources agree |
| 53-6011.00 | Bridge and Lock Tenders | 33 | 24 | -10 | observed use 25, rated potential 32, ability based 31, ilo tasks 20, market 30 | sources agree |
| 53-6021.00 | Parking Attendants | 20 | 28 | +8 | observed use 25, rated potential 23, ability based 24, ilo tasks 53, market 30 | sources agree |
| 53-6031.00 | Automotive and Watercraft Service Attendants | 14 | 18 | +4 | observed use 25, rated potential 18, ability based 10, ilo tasks 38, market 30 | sources agree |
| 53-6032.00 | Aircraft Service Attendants | 6 | 17 | +11 | observed use 24, rated potential 27, ability based –, ilo tasks 11, market 30 | sources agree |
| 53-6041.00 | Traffic Technicians | 56 | 45 | -11 | observed use 25, rated potential 64, ability based 58, ilo tasks 42, market 30 | sources partly agree |
| 53-6051.00 | Transportation Inspectors | 49 | 40 | -9 | observed use 25, rated potential 60, ability based 45, ilo tasks 38, market 30 | sources agree |
| 53-6051.01 | Aviation Inspectors | 42 | 36 | -6 | observed use 25, rated potential 48, ability based 45, ilo tasks 38, market 30 | sources agree |
| 53-6051.07 | Transportation Vehicle, Equipment and Systems Inspectors, Except Aviation | 51 | 36 | -15 | observed use 25, rated potential 48, ability based 45, ilo tasks 38, market 30 | sources agree |
| 53-6061.00 | Passenger Attendants | 45 | 53 | +8 | observed use 72, rated potential 35, ability based 38, ilo tasks 35, market 77 | sources partly agree |
| 53-6099.00 | Transportation Workers, All Other | 51 | 29 | -22 | observed use 25, rated potential 48, ability based 45, ilo tasks 11, market 30 | sources agree |
| 53-7011.00 | Conveyor Operators and Tenders | 21 | 22 | +0 | observed use 25, rated potential 24, ability based 27, ilo tasks –, market 30 | sources agree |
| 53-7021.00 | Crane and Tower Operators | 21 | 13 | -8 | observed use 25, rated potential 17, ability based 16, ilo tasks 20, market 30 | sources agree |
| 53-7031.00 | Dredge Operators | 9 | 5 | -4 | observed use 25, rated potential 3, ability based 17, ilo tasks 8, market 30 | sources agree |
| 53-7041.00 | Hoist and Winch Operators | 10 | 13 | +3 | observed use 25, rated potential 12, ability based 18, ilo tasks 20, market 30 | sources agree |
| 53-7051.00 | Industrial Truck and Tractor Operators | 5 | 10 | +6 | observed use 25, rated potential 8, ability based 7, ilo tasks 29, market 30 | sources agree |
| 53-7061.00 | Cleaners of Vehicles and Equipment | 7 | 3 | -5 | observed use 25, rated potential 9, ability based 4, ilo tasks 2, market 30 | sources agree |
| 53-7062.00 | Laborers and Freight, Stock, and Material Movers, Hand | 4 | 5 | +1 | observed use 25, rated potential 13, ability based 3, ilo tasks 10, market 30 | sources agree |
| 53-7062.04 | Recycling and Reclamation Workers | 4 | 3 | -1 | observed use 25, rated potential 9, ability based 3, ilo tasks 5, market 30 | sources agree |
| 53-7063.00 | Machine Feeders and Offbearers | 15 | 9 | -6 | observed use 25, rated potential 18, ability based 16, ilo tasks 5, market 30 | sources agree |
| 53-7064.00 | Packers and Packagers, Hand | 10 | 14 | +4 | observed use 25, rated potential 19, ability based 5, ilo tasks 29, market 30 | sources agree |
| 53-7065.00 | Stockers and Order Fillers | 32 | 30 | -2 | observed use 25, rated potential 30, ability based –, ilo tasks 44, market 30 | sources agree |
| 53-7071.00 | Gas Compressor and Gas Pumping Station Operators | 31 | 31 | 0 | observed use 25, rated potential 30, ability based 29, ilo tasks 53, market 30 | sources agree |
| 53-7072.00 | Pump Operators, Except Wellhead Pumpers | 28 | 32 | +4 | observed use 25, rated potential 36, ability based 24, ilo tasks 53, market 30 | sources agree |
| 53-7073.00 | Wellhead Pumpers | 8 | 10 | +2 | observed use 25, rated potential 3, ability based 14, ilo tasks 25, market 30 | sources agree |
| 53-7081.00 | Refuse and Recyclable Material Collectors | 18 | 13 | -5 | observed use 25, rated potential 29, ability based 9, ilo tasks 13, market 30 | sources agree |
| 53-7121.00 | Tank Car, Truck, and Ship Loaders | 8 | 9 | +1 | observed use 25, rated potential 22, ability based 7, ilo tasks 10, market 30 | sources agree |
| 53-7199.00 | Material Moving Workers, All Other | 15 | 6 | -8 | observed use 25, rated potential 3, ability based –, ilo tasks 13, market 30 | sources agree |
| 55-1011.00 | Air Crew Officers | 43 | 34 | -9 | observed use 25, rated potential 43, ability based 43, ilo tasks –, market 30 | sources agree |
| 55-1012.00 | Aircraft Launch and Recovery Officers | 56 | 52 | -4 | observed use 60, rated potential 53, ability based 60, ilo tasks –, market 30 | sources agree |
| 55-1013.00 | Armored Assault Vehicle Officers | 41 | 38 | -3 | observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30 | sources agree |
| 55-1014.00 | Artillery and Missile Officers | 41 | 38 | -3 | observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30 | sources agree |
| 55-1015.00 | Command and Control Center Officers | 59 | 53 | -6 | observed use 25, rated potential 75, ability based 77, ilo tasks –, market 30 | sources partly agree |
| 55-1016.00 | Infantry Officers | 41 | 38 | -3 | observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30 | sources agree |
| 55-1017.00 | Special Forces Officers | 41 | 38 | -3 | observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30 | sources agree |
| 55-1019.00 | Military Officer Special and Tactical Operations Leaders, All Other | 41 | 38 | -3 | observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30 | sources agree |
| 55-2011.00 | First-Line Supervisors of Air Crew Members | 40 | 22 | -18 | observed use 25, rated potential 26, ability based –, ilo tasks –, market 30 | sources agree |
| 55-2012.00 | First-Line Supervisors of Weapons Specialists/Crew Members | 41 | 38 | -3 | observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30 | sources agree |
| 55-2013.00 | First-Line Supervisors of All Other Tactical Operations Specialists | 41 | 38 | -3 | observed use 25, rated potential 53, ability based 43, ilo tasks –, market 30 | sources agree |
| 55-3011.00 | Air Crew Members | 43 | 34 | -9 | observed use 25, rated potential 43, ability based 43, ilo tasks –, market 30 | sources agree |
| 55-3012.00 | Aircraft Launch and Recovery Specialists | 56 | 52 | -4 | observed use 60, rated potential 53, ability based 60, ilo tasks –, market 30 | sources agree |
| 55-3013.00 | Armored Assault Vehicle Crew Members | 15 | 16 | +1 | observed use 25, rated potential 15, ability based 22, ilo tasks –, market 30 | sources agree |
| 55-3014.00 | Artillery and Missile Crew Members | 27 | 22 | -5 | observed use 25, rated potential 26, ability based –, ilo tasks –, market 30 | sources agree |
| 55-3015.00 | Command and Control Center Specialists | 79 | 69 | -10 | observed use 61, rated potential 94, ability based 71, ilo tasks –, market 30 | sources partly agree |
| 55-3016.00 | Infantry | 42 | 63 | +21 | observed use 78, rated potential 42, ability based 30, ilo tasks –, market 87 | sources partly agree |
| 55-3018.00 | Special Forces | 42 | 63 | +21 | observed use 78, rated potential 42, ability based 30, ilo tasks –, market 87 | sources partly agree |
| 55-3019.00 | Military Enlisted Tactical Operations and Air/Weapons Specialists and Crew Members, All Other | 42 | 63 | +21 | observed use 78, rated potential 42, ability based 30, ilo tasks –, market 87 | sources partly agree |
