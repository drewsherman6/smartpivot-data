#!/usr/bin/env node
// Regenerates index.json. last_updated comes from each dataset's own date field, so it only moves when data changed.
const { readJson, writeJsonValidated } = require('./lib');
const datasets = require('./datasets');
const dateOf = (d) => d.updated || d.generated || d.generated_date || (d.last_updated || '').slice(0, 10) || d.metadata?.generated || null;
const out = {
  manifest_version: '1.0.0',
  generated: null,
  base_raw_url: 'https://raw.githubusercontent.com/drewsherman6/smartpivot-data/main/',
  datasets: datasets.map((ds) => {
    const d = readJson(ds.path);
    return { name: ds.name, path: ds.path, schema: ds.schema, schema_version: d.schema_version || 'legacy-1', last_updated: dateOf(d), legacy: ds.legacy, record_count: ds.key ? d[ds.key].length : ds.countKey ? d[ds.countKey].length : undefined, description: ds.description };
  }),
  docs: ['README.md', 'aether-research.md', 'future_proof_skills.md', 'at_risk_skills.md', 'CHANGELOG.md'],
};
out.generated = out.datasets.map((d) => d.last_updated).filter(Boolean).sort().pop();
writeJsonValidated('index.json', out, 'schemas/index.schema.json');
console.log('index.json written');
