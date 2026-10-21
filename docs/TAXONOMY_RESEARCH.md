# Taxonomy research: building a multi-source skills crosswalk (Oct 21, 2026)

Status: research only, no live-site changes. ESCO numbers below were computed live from the ESCO API (scripts/esco_sample_counts.py); other facts are from publisher pages listed, and should be re-verified at ingest time.

## Candidates

| Source | Owner | License / commercial | Size | Format / URL | Cadence | Crosswalk to O*NET-SOC |
|---|---|---|---|---|---|---|
| **ESCO v1.2** | European Commission | Free incl. commercial (EC reuse decision 2011/833/EU, attribution) | ~3,039 occupations, ~13,939 skills/competences, essential vs optional links per occupation, 28 languages | CSV/RDF download + REST API https://esco.ec.europa.eu/en/use-esco/download , https://ec.europa.eu/esco/api | ~yearly minor versions | **Yes – official ESCO–O*NET crosswalk** (EC, 2022) https://esco.ec.europa.eu/en/about-esco/data-science-and-esco/crosswalk-between-esco-and-onet ; also ISCO-08 codes on every occupation |
| **ISCO-08** | ILO | Free | 436 unit groups, task descriptions per group | https://ilostat.ilo.org/methods/concepts-and-definitions/classification-occupation/ | static | **BLS ISCO-08↔SOC 2018 crosswalk** https://www.bls.gov/soc/soccrosswalks.htm |
| **ILO GenAI exposure (2023, refined 2025 index)** | ILO | Free (research) | ~3,000+ ISCO-08 task scores, 4-digit ISCO exposure gradients | https://www.ilo.org/publications (WP 96 2023; WP 140 2025 "Generative AI and Jobs: A Refined Global Index") | ad hoc | via ISCO→SOC |
| **Canada OaSIS / NOC 2021** | ESDC / StatCan | Open Government Licence – Canada (commercial OK) | 516 NOC unit groups, ~900 OaSIS profiles; skills, abilities, work activities, main duties, interests (O*NET-derived structure) | CSV at open.canada.ca; https://noc.esdc.gc.ca/Oasis | yearly | StatCan NOC 2021↔SOC 2018 concordance; OaSIS descriptors modeled on O*NET |
| **Canada Skills & Competencies Taxonomy** | ESDC | OGL-Canada | ~ skills, work activities, knowledge, tools, linked to NOC | open.canada.ca | periodic | via NOC |
| **Australia OSCA 2024 / ANZSCO + ASC** | ABS / Jobs and Skills Australia | CC BY 4.0 | ~1,000+ occupations; ASC: ~2,000 specialist tasks, ~15,000 occupation-task links, core competencies, technology tools | https://www.jobsandskills.gov.au/data/australian-skills-classification | yearly | ANZSCO/OSCA↔ISCO-08 concordance (ABS) → SOC; JSA also published a GenAI exposure study (2025) on ASC tasks |
| **UK SOC 2020 + ONS / NOS** | ONS; Skills England | OGL v3 (commercial OK) | 412 unit groups; NOS ~20k standards | https://www.ons.gov.uk/methodology/classificationsandstandards ; https://www.ukstandards.org.uk | SOC decennial | ONS SOC2020↔ISCO-08 |
| **Singapore Skills Framework / Jobs-Skills Map** | SkillsFuture SG | SG Open Data Licence (commercial OK) | ~1,600+ job roles across 38 sectors, ~2,500 TSCs, critical work functions & key tasks | https://www.skillsfuture.gov.sg/skills-framework (Excel) | yearly | none official |
| **Lightcast Open Skills** | Lightcast (private) | Free API but **license restricts redistribution / commercial resale; needs agreement** | ~33k skills | https://lightcast.io/open-skills | 2-week | Lightcast SOC mappings (proprietary) |
| **US DOL Competency Models** | DOL ETA | public domain | ~25 industry models | careeronestop.org/CompetencyModel | stale | sector-level only |
| **NICE Framework (cyber)** | NIST | public domain | ~41 work roles, ~2,000 TKS statements | https://www.nist.gov/itl/applied-cybersecurity/nice | yearly | DoD/NICE→SOC informal |
| RAPIDS / apprenticeship work processes | DOL OA | public domain | per-program work-process lists | apprenticeship.gov | ad hoc | RAPIDS codes ~SOC |
| Eurofound / OECD | EU / OECD | free research | task-content indices, AI exposure by ISCO-2/3 digit | eurofound.europa.eu, oecd.org | ad hoc | via ISCO |

## Measured ESCO density (live API, Oct 21 2026; ISCO children only)

| SOC | ISCO | ESCO occupations | avg skills/occ | skill links total |
|---|---|---|---|---|
| 43-4051 customer service | 4222 | 1 | 29 | 29 |
| 15-1252 software devs | 2512 | 4 | 88 | 353 |
| 53-3032 heavy truck | 8332 | 8 | 28 | 223 |
| 29-1141 registered nurse | 2221 | 3 | 77 | 232 |
| 47-2111 electrician | 7411 | 1 | 52 | 52 |

Using the official ESCO–O*NET crosswalk (which maps directly, not just via ISCO), a typical job gains ~30–90 ESCO skill statements vs ~15–25 O*NET tasks. Adding Australia ASC (~15 specialist tasks/occupation) and Canada OaSIS main duties (~10–15) gives an estimated **70–150 de-duplicated task/skill statements per job** before dedupe of ~20–30%.

## Recommendation – add first
1. **ESCO + official ESCO↔O*NET crosswalk** (best size, license, direct SOC mapping).
2. **ILO 2025 GenAI exposure index** via BLS ISCO↔SOC (second independent, task-level AI exposure source).
3. **Australia ASC specialist tasks** (CC BY; task-level, technology tools; JSA GenAI study).
4. **Canada OaSIS** (OGL; O*NET-like descriptors, NOC↔SOC concordance).
5. **NICE** for cyber roles (vertical depth). Skip Lightcast unless a license is signed.

## Merge plan
- Crosswalk chain: SOC ⇄ (ESCO crosswalk direct) ; SOC ⇄ ISCO (BLS) ⇄ ANZSCO/OSCA (ABS) ; SOC ⇄ NOC (StatCan). Store crosswalk weight (1.0 direct, split evenly for many-to-many).
- Dedupe: embed every statement, cluster at cosine ≥0.85 within a job, keep one canonical statement with `sources[]`; cross-job canonical skill IDs map to ESCO skill URIs where possible.
- Supabase schema: `taxonomy_source(id, name, version, license, url)`, `source_occupation(id, source_id, code, title)`, `occupation_crosswalk(soc_code, source_occupation_id, weight, method)`, `work_statement(id, canonical_text, kind task|skill|knowledge|tool, esco_uri)`, `statement_source(statement_id, source_occupation_id, original_text, importance, essential bool)`, `occupation_statement(soc_code, statement_id, weight, n_sources)`, `statement_exposure(statement_id, method eloundou|aioe|aei|ilo|robotics, score, version)`.
- Exposure: score each canonical statement (LLM rubric like Eloundou, calibrated against ILO task scores where they overlap; robotics rubric reused); job exposure = weighted mean over statements (importance × crosswalk weight × source agreement). Results page lists the actual exposed statements grouped by AI vs robotics, with source badges. Keep O*NET-only score as a reference during rollout and report deltas for all 1,016 jobs.
