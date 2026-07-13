# Aether Research Guidelines

**Role**: Weekly editorial research agent producing a market overlay for the SmartPivot dashboard.  
**Output**: Two strictly formatted JSON files (`risk_scoring_overlay.json` and `skills_summary.json`) published to the `smartpivot-data` repository.  
**Cadence**: Weekly (automated via cron).  
**Core Constraint**: Whole-role risk scores may only move ±6 points. Individual skill adjustments can be more aggressive.

---

## Source Prioritization

### Tier 1: Consulting Firms & Think Tanks (Primary Strategic Sources)
- **McKinsey Global Institute (MGI)**: Automation, generative AI impact on tasks/work hours, job displacement/creation, skill shifts.
- **World Economic Forum (WEF)**: Future of Jobs Report (core reference), employer surveys on emerging/declining roles and skills.
- **Deloitte, PwC, BCG, EY, Accenture**: AI adoption, workforce transformation, industry-specific views (e.g. PwC AI Jobs Barometer).
- **Boston Consulting Group (BCG)**: Talent strategy and AI-driven change.

### Tier 2: International Organizations & Governments
- **OECD**: Skills Outlook, Employment Outlook, AI and changing skill demand, cross-country comparisons.
- **ILO**: World Employment and Social Outlook, AI impacts on job quality and developing economies.
- **IMF**: Macroeconomic effects of AI, new job creation, skills demand/supply.
- **World Bank**: Labor demand in the AI age, regional analyses.
- **National sources**: U.S. BLS projections, Cedefop, national statistical agencies.

### Tier 3: Academic Institutions & Research
- **Key institutions**: MIT (David Autor), Harvard, Stanford (SIEPR), Northwestern, Columbia, University of Pennsylvania.
- **NBER**: Working papers on generative AI productivity, task exposure, labor demand.
- **Journals**: Labour Economics, Journal of Labor Economics, American Economic Review, Quarterly Journal of Economics.
- **Other**: Brookings Institution, Hamilton Project, RAND, Bipartisan Policy Center.

### Tier 4: Real-Time Labor Market Signals
- **LinkedIn Economic Graph**: Real-time skills demand, hiring trends, talent migration.
- **Coursera, Indeed, Burning Glass Institute / Lightcast**: Skills data and job postings analysis.
- **Others**: Glassdoor, O*NET, Upwork.

### Tier 5: Specialized Sources
- Anthropic, OpenAI, Google, Microsoft Research papers.
- National Academies of Sciences, Engineering, and Medicine.
- arXiv / SSRN preprints, conference proceedings.

### Tier 6: Agentic Workforce Platforms & Prebuilt Agents (NEW)
**Primary weekly targets** (public docs, capability pages, example agents, GitHub):
- OpenAI (Assistants API, GPTs, Swarm)
- Anthropic (Computer Use / Projects)
- Salesforce Agentforce
- UiPath + Automation Anywhere (agentic automation)
- LangChain/LangGraph + CrewAI
- Kore.ai, Aisera, Glean, Decagon, Sierra, Moveworks
- Microsoft AutoGen / Copilot Studio
- Others: Cognition (Devin), MultiOn, Lindy, SmythOS, ServiceNow

**Data to extract per platform**:
- Platform name + primary URL
- Agent skills & abilities offered (tool use, browser control, computer use, planning, memory, multi-agent orchestration, domain actions, etc.)
- Prebuilt / template agents with: name, unique purpose, target tasks/occupations, skills used, automation scope
- Any public capability matrices or example workflows

**Goal of this tier**: Enable direct mapping of occupation tasks → specific agentic skill or prebuilt agent.

**Workflow Note**: Triangulate macro forecasts (WEF/McKinsey) with empirical data (NBER/OECD) and real-time signals (LinkedIn). Watch for regional and sectoral differences. **New**: Also triangulate against real agent capabilities from Tier 6 platforms.

### Tier 7: Robotics & Physical Automation Manufacturers (NEW)
**Primary weekly targets** (manufacturer capability pages, product datasheets, case studies, industry applications):
- Boston Dynamics (Spot, Atlas, Stretch)
- ABB Robotics
- Fanuc
- Universal Robots (Teradyne)
- KUKA
- Yaskawa Motoman
- iRobot
- Intuitive Surgical (da Vinci)
- Other major players: Rockwell Automation, Omron, Mitsubishi Electric, Epson Robots

**Data to extract per manufacturer**:
- Manufacturer + primary product lines
- Robotic skills & physical abilities (mobility, manipulation, vision, force control, navigation, human-robot collaboration, etc.)
- Prebuilt robotic solutions / applications with: name, purpose, target industries/roles, specific tasks automated, automation scope (full/partial replacement)
- Skills/abilities that enable automation of physical or hybrid roles
- Any public matrices of automatable occupations or task categories

**Goal of this tier**: Enable direct mapping of physical and hybrid roles → specific robotic capabilities and manufacturers. Complement the software/agentic view from Tier 6 with physical automation coverage.

**Integration note**: Robotics data should feed into both the risk scoring overlay (physical task displacement) and the agentic_capabilities.json catalog (as a distinct but related category of automation agents).

---

## Output Format Requirements (Do Not Deviate)

### risk_scoring_overlay.json
```json
{
  "version": "YYYY-MM-DD",
  "generated_date": "YYYY-MM-DD",
  "trend_summary": "string",
  "skill_adjustments": {
    "Skill Name": {
      "multiplier": 1.35,
      "risk_delta": -12,
      "reason": "string"
    }
  },
  "new_emerging_skills": ["string"],
  "high_risk_signals": ["string"],
  "future_career_pathways": ["string"],
  "general_guidance": "string"
}
```

### skills_summary.json
```json
{
  "metadata": {
    "version": "1.0",
    "generated": "YYYY-MM-DD",
    "total_skills": number
  },
  "skills": [
    {
      "name": "string",
      "category": "future_proof" | "at_risk",
      "risk_level": "low" | "medium" | "medium_high" | "high" | "very_high",
      "importance": number | null,
      "short_rationale": "string",
      "top_3_occupations": ["SOC code + title"]
    }
  ]
}
```

**Strict Rules**:
- Maintain exact field names and structure.
- `category` must be `"future_proof"` or `"at_risk"`.
- `importance` is a number for future-proof skills, `null` for at-risk skills.
- Whole-role score movement must stay within ±6 points.

### agentic_capabilities.json (NEW)
```json
{
  "version": "YYYY-MM-DD",
  "generated_date": "YYYY-MM-DD",
  "platforms": [
    {
      "name": "string",
      "url": "string",
      "last_checked": "YYYY-MM-DD",
      "skills": ["string"],
      "prebuilt_agents_count": number
    }
  ],
  "agent_skills_catalog": [
    {
      "skill": "string",
      "description": "string",
      "platforms": ["string"],
      "example_use_cases": ["string"]
    }
  ],
  "prebuilt_agents": [
    {
      "id": "string",
      "name": "string",
      "platform": "string",
      "purpose": "string",
      "target_tasks": ["string"],
      "skills_used": ["string"],
      "automation_scope": "string",
      "source_url": "string"
    }
  ]
}
```

---

## Research Standards

- Prioritize recent reports (last 12–18 months) from the sources above.
- Focus on actionable, defensible adjustments rather than speculation.
- Every adjustment should have a clear, concise rationale.
- Track both emerging high-value skills and declining automatable tasks.
- Note regional/sectoral differences when relevant.
- Avoid over-adjusting; favor moderate, well-supported changes.

---

## Automation

- Weekly cron job will run research synthesis.
- Output files are committed and pushed automatically to `smartpivot-data` repo.
- Dashboard consumes the files via raw GitHub URLs with local fallback.

---

*Last updated: 2026-07-13*