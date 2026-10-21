# Taxonomy research: multi-source skills crosswalk

Verified against live primary pages on **Oct 21, 2026**, and superseding the first draft from earlier the same day. Every row below was checked by downloading the file or reading the publisher page. The implementation is in `scripts/multisource.js`, its output is `data/multisource/`, and the score comparison is in `docs/BLEND_COMPARISON.md`.

## Verified sources

| Source | Owner | Licence (commercial use?) | Verified size | Format / URL | Cadence | Path to O*NET-SOC | Status |
|---|---|---|---|---|---|---|---|
| **ESCO** | European Commission (DG EMPL) | EC reuse policy (Decision 2011/833/EU): free, commercial use allowed with attribution | Current version **v1.2.1** (portal: "Last update 10/12/2025"). About 3,000 occupations and 13,900 skills. Each occupation has essential and optional skill/knowledge links. | Download form: https://esco.ec.europa.eu/en/use-esco/download (CSV/RDF/TTL by emailed link). REST API: https://ec.europa.eu/esco/api/resource/occupation (used here, no key) | Minor releases roughly yearly | Official crosswalk, see next row | **Ingested** (via API, cached and refetched when the portal version changes) |
| **ESCO–O*NET crosswalk** | ESCO Secretariat with US DOL/ETA | Same as ESCO | v1, Sep 2022. **4,253 rows**: 2,053 broadMatch, 1,432 closeMatch, 498 exactMatch, 227 narrowMatch, 43 exactISCO. Covers 940 O*NET-SOC 2019 codes and 2,652 ESCO concepts. Built against ESCO v1.1.0. | CSV: https://esco.ec.europa.eu/system/files/2023-08/ONET_%28Occupations%29_0_updated.csv (page: https://esco.ec.europa.eu/en/use-esco/other-crosswalks; mirrored as XLSX at https://www.onetcenter.org/crosswalks.html) | Ad hoc | Direct | **Ingested.** The version with "related" matches is excluded because DOL did not validate it. |
| **ILO GenAI exposure index 2025** (WP140, Gmyrek et al.) | ILO, with NASK-PIB | **CC BY 4.0**. Must credit the ILO and add the ILO adaptation disclaimer; ILO logo may not be used. | **3,265 ISCO-08 task statements** across **427** 4-digit groups, each with `score_2025` from 0 to 1 (3,219 predicted, 46 expert-reconciled) | https://github.com/pgmyrek/2025_GenAI_scores_ISCO08 (`Final_Scores_ISCO08_Gmyrek_et_al_2025.xlsx`). Paper: https://doi.org/10.54394/HETP0387 | Ad hoc (2023, 2025) | ISCO-08 → BLS crosswalk | **Ingested.** This is the second independent task-level AI score. |
| **BLS ISCO-08 ↔ 2010 SOC crosswalk** | BLS for the SOC Policy Committee | US public domain | Aug 2012, updated Jun 2015. 1,125 SOC→ISCO rows. | https://www.bls.gov/soc/ISCO_SOC_Crosswalk.xls (page: https://www.bls.gov/soc/soccrosswalks.htm). Requires a contact User-Agent. | Static | SOC 2010, then the **BLS 2010→2018 SOC crosswalk** (https://www.bls.gov/soc/2018/soc_2010_to_2018_crosswalk.xlsx) | **Ingested** |
| **Canada OaSIS 2025 v1.0** (NOC 2021) | ESDC | **Open Government Licence – Canada** (confirmed via the CKAN API) | **900 profiles**. Main Duties has 4,991 statements. Also skills, abilities, work activities and work context, rated on O*NET-style scales. | https://open.canada.ca/data/en/dataset/10ce43bd-fb58-4969-806b-4bffebc87bec (semicolon-delimited CSV). Data corrected Mar 20, 2026; metadata updated Oct 4, 2026. | Yearly | NOC 2021 ← NOC 2016 ← SOC 2018, see next row | **Ingested** (main duties) |
| **StatCan NOC 2016 V1.3 ↔ SOC 2018 (US)**, plus **NOC 2016 V1.3 → NOC 2021 V1.0** | Statistics Canada | Statistics Canada Open Licence | 1,250 and 587 rows | https://www.statcan.gc.ca/en/statistical-programs/document/noc2016v1_3-soc2018us-eng.csv, https://www.statcan.gc.ca/en/statistical-programs/document/noc2016v1_3-noc2021v1_0-eng.csv | Static | Official. There is **no direct NOC 2021↔SOC table**, so it is bridged through NOC 2016. | **Ingested** |
| **NIST NICE Framework v2.2.0** (SP 800-181r1) | NIST | US Government work, not subject to US copyright | 42 work roles, 962 tasks, 693 knowledge and 556 skill statements, 11 competency areas, 40 OPM codes | JSON: https://csrc.nist.gov/csrc/media/Projects/cprt/documents/nice/v2-2-0_nf_components.json (page: https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/nice-framework-current-versions) | About yearly | **No official SOC crosswalk** (maps to OPM federal codes only) | **Ingested, with a curated mapping to 13 O*NET codes** (weight 0.5, labelled "curated"). **Needs sign-off.** |
| **Australian Skills Classification (ASC)** | Jobs and Skills Australia | Was CC BY 4.0 | Last version Dec 2023 | **Decommissioned.** JSA removed it from its website in Jan 2025 (https://www.jobsandskills.gov.au/legacy/AustralianSkillsClassification). Access is now for research only, under a data access agreement (nationalskillstaxonomy@jobsandskills.gov.au). The successor, the National Skills Taxonomy, is still in development. | None | ANZSCO→ISCO (ABS) | **Not ingested.** Third-party mirrors exist (Kaggle, `strayr`), but none is an official download. **Needs sign-off** to request access or to use a CC BY 2023 mirror. The ABS ANZSCO→ISCO concordance is therefore also not needed yet. |
| UK SOC 2020 / NOS | ONS / Skills England | OGL v3 | 412 unit groups | ons.gov.uk, ukstandards.org.uk | Decennial | ONS SOC2020↔ISCO-08 | Later phase |
| Singapore Skills Framework | SkillsFuture SG | SG Open Data Licence | About 38 sectors | skillsfuture.gov.sg | Yearly | None official | Later phase |
| Lightcast Open Skills | Lightcast (private) | Free API, but redistribution is restricted | About 33k skills | lightcast.io/open-skills | Biweekly | Proprietary | **Skip** unless licensed |

## What was built (phase 2)
`scripts/multisource.js` is self-contained and runs at the end of `scripts/refresh.js` every Monday. Downloads are cached in `.cache/multisource/`.

**Crosswalk chain and weights for each O*NET-SOC code:**
- **ESCO:** occupations come from the official crosswalk. Weights by match type: exact 1.0, close 0.8, narrow 0.6, broad 0.5. Optional skills count ×0.5.
- **ILO:** 2018 SOC → 2010 SOC (BLS) → ISCO-08 (BLS). That ISCO list is intersected with the ISCO groups of the mapped ESCO occupations when the overlap is non-empty. The crosswalk's `exactISCO` rows override both. Weight is 1/n of the ISCO groups.
- **OaSIS:** SOC 2018 → NOC 2016 → NOC 2021 (StatCan). Weight is 1/n of the NOC units.
- **NICE:** curated mapping, weight 0.5.
- **O*NET:** tasks are weighted by Anthropic time share divided by the occupation's maximum.

**Removing duplicates.** The method is deterministic, runs offline and uses no embeddings.
1. Match on ESCO skill URI.
2. Match on identical normalized text. Normalizing means lowercasing, removing punctuation and stopwords, light suffix stemming, and sorting the token set.
3. Merge statements in the same occupation whose token-set Jaccard similarity is 0.6 or higher. Knowledge items merge only by URI or identical text.

**Exposure.** Only published values are used.
- **Direct AI scores** are the Anthropic Economic Index task penetration (on O*NET tasks) and the ILO 2025 task score (on ISCO tasks).
- **Direct robotics scores** are the Anthropic robot tier E0–E3 on O*NET tasks.
- **Transferred scores:** an ESCO, OaSIS or NICE statement takes the score of the most similar directly scored statement in the same job, if their Jaccard similarity is 0.34 or higher. It records the donor text and the similarity. Otherwise its score is null.
- **Calibration:** each AI source is converted to its own percentile (the share of that source's statements scoring strictly lower).

**Blend (experimental).** It averages two independent task-level AI sources, O*NET/Anthropic and ISCO/ILO, each weighted over its directly scored statements. Transferred scores are shown in the app but do not count toward the blend. The current O*NET composite stays the primary score.

**Supabase (phase 3):** all tables are in the `sp` schema.
- `ms_source`
- `ms_occupation_crosswalk`
- `ms_statement`
- `ms_statement_source`
- `ms_statement_exposure`
- `ms_occupation_blend`

## Remaining sign-offs
1. Whether to switch the primary score to the blend. See `docs/BLEND_COMPARISON.md`.
2. The curated NICE mapping, which has no official crosswalk.
3. Australia's ASC: email JSA for a data agreement, use the CC BY 2023 mirror, or skip it.
