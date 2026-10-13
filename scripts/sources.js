// Bulk public sources used by scripts/refresh.js. Bump URLs here when new releases appear
// (refresh.js also auto-detects newer O*NET / OEWS releases, see detect* functions).
module.exports = {
  onet: {
    name: 'O*NET 31.0 Database (CSV)', version: '31.0', release: '2026-08',
    url: 'https://www.onetcenter.org/dl_files/database/db_31_0_csv.zip',
    page: 'https://www.onetcenter.org/database.html', license: 'CC BY 4.0', file: 'onet.zip',
  },
  oews: {
    name: 'BLS Occupational Employment and Wage Statistics, May 2025 national', version: 'May 2025',
    url: 'https://www.bls.gov/oes/special-requests/oesm25nat.zip', page: 'https://www.bls.gov/oes/tables.htm', file: 'oews.zip',
  },
  ep: {
    name: 'BLS Employment Projections 2025-35, Occupation table 1.2', version: '2025-35',
    url: 'https://www.bls.gov/emp/ind-occ-matrix/occupation.xlsx', page: 'https://www.bls.gov/emp/tables.htm', file: 'ep.xlsx',
  },
  eloundou: {
    name: 'Eloundou, Manning, Mishkin & Rock (2023/2024) "GPTs are GPTs", occupation-level exposure', version: 'github main',
    url: 'https://raw.githubusercontent.com/openai/GPTs-are-GPTs/main/data/occ_level.csv', page: 'https://arxiv.org/abs/2303.10130', file: 'eloundou.csv',
  },
  aioe: {
    name: 'Felten, Raj & Seamans (2021) AI Occupational Exposure (AIOE), Data Appendix A', version: 'github main',
    url: 'https://raw.githubusercontent.com/AIOE-Data/AIOE/main/AIOE_DataAppendix.xlsx', page: 'https://github.com/AIOE-Data/AIOE', file: 'aioe.xlsx',
  },
  aei_exposure: {
    name: 'Anthropic Economic Index - Labor market impacts: observed job exposure', version: 'HF main',
    url: 'https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/main/labor_market_impacts/job_exposure.csv',
    page: 'https://www.anthropic.com/research/labor-market-impacts', file: 'aei_job_exposure.csv',
  },
  aei_task: {
    name: 'Anthropic Economic Index - Labor market impacts: task penetration', version: 'HF main',
    url: 'https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/main/labor_market_impacts/task_penetration.csv',
    page: 'https://www.anthropic.com/research/labor-market-impacts', file: 'aei_task_penetration.csv',
  },
  robot_occ: {
    name: 'Anthropic Economic Index - "What work can robots do?" robot exposure (occupations)', version: 'HF main',
    url: 'https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/main/robot_exposure/robot_exposure_occupations.csv',
    page: 'https://huggingface.co/datasets/Anthropic/EconomicIndex/blob/main/robot_exposure/README.md', file: 'robot_occ.csv',
  },
  robot_tasks: {
    name: 'Anthropic Economic Index - "What work can robots do?" robot exposure (tasks, with cited robot systems)', version: 'HF main',
    url: 'https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/main/robot_exposure/robot_exposure_tasks.csv',
    page: 'https://huggingface.co/datasets/Anthropic/EconomicIndex/blob/main/robot_exposure/README.md', file: 'robot_tasks.csv',
  },
};
