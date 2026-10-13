// Single registry of every published dataset. Paths must never change (frontend reads raw URLs).
module.exports = [
  { name: 'headline_stats', path: 'data/headline_stats.json', schema: 'schemas/headline_stats.schema.json', key: 'records', legacy: false, description: 'Headline workforce x AI/robotics statistics, fully sourced' },
  { name: 'occupations', path: 'data/occupations.json', schema: 'schemas/occupations.schema.json', key: 'records', legacy: false, description: 'Emerging and declining occupations, sourced' },
  { name: 'emerging_skills', path: 'data/emerging_skills.json', schema: 'schemas/emerging_skills.schema.json', key: 'records', legacy: false, description: 'Rising/declining skill signals, sourced' },
  { name: 'agent_platforms', path: 'data/agent_platforms.json', schema: 'schemas/agent_platforms.schema.json', key: 'platforms', legacy: false, description: 'AI agent platforms with sourced facts (incl. restored July-8 list marked restored_unverified)' },
  { name: 'robotics_manufacturers', path: 'data/robotics_manufacturers.json', schema: 'schemas/robotics_manufacturers.schema.json', key: 'manufacturers', legacy: false, description: 'Robot makers with sourced facts' },
  { name: 'skills_export', path: 'skills_export.json', schema: 'schemas/skills_export.schema.json', legacy: true, description: 'Legacy full skills dataset (shape frozen)' },
  { name: 'skills_summary', path: 'skills_summary.json', schema: 'schemas/skills_summary.schema.json', legacy: true, description: 'Legacy skills summary (shape frozen)' },
  { name: 'risk_scoring_overlay', path: 'risk_scoring_overlay.json', schema: 'schemas/risk_scoring_overlay.schema.json', legacy: true, description: 'Legacy risk overlay (shape frozen)' },
  { name: 'agentic_capabilities', path: 'agentic_capabilities.json', schema: 'schemas/agentic_capabilities.schema.json', legacy: true, description: 'Legacy agentic catalog (shape frozen)' },
  { name: 'robotics_capabilities', path: 'robotics_capabilities.json', schema: 'schemas/robotics_capabilities.schema.json', legacy: true, description: 'Legacy robotics catalog (shape frozen)' },
];
