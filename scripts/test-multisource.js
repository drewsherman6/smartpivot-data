#!/usr/bin/env node
// Invariants for data/multisource: full coverage, no invented scores, provenance on every transferred score, legacy untouched.
const assert = require('assert'); const { readJson, ajv } = require('./lib'); const v = ajv().compile(readJson('schemas/multisource.schema.json')); const { toks, jac } = require('./multisource');
const idx = readJson('data/multisource/index.json'); const occ = readJson('data/occupations/index.json');
assert.strictEqual(idx.count, occ.count, 'every O*NET occupation has a multisource record');
let n = 0;
for (const e of idx.occupations) { const o = readJson(e.file); assert(v(o), e.file + ' schema: ' + JSON.stringify(v.errors));
  assert.strictEqual(o.blend.primary, 'current', 'blend must not be primary without sign-off');
  assert(o.statements.some((s) => s.sources.some((z) => z.source === 'onet')), o.code + ' keeps O*NET tasks');
  const ids = new Set();
  for (const s of o.statements) { n++; assert(!ids.has(s.id)); ids.add(s.id);
    if (s.ai?.basis === 'direct') assert(s.ai.anthropic_penetration != null || s.ai.ilo_2025 != null, 'direct AI score must come from a published value');
    if (s.ai?.basis === 'transferred') assert(s.ai.from && s.ai.similarity >= 0.34, 'transferred AI score needs donor + similarity');
    if (s.robotics?.basis === 'transferred') assert(s.robotics.from, 'transferred robotics needs donor');
    for (const z of s.sources) assert(z.w > 0 && z.w <= 1, 'crosswalk weight in range ' + o.code);
  }
}
assert(jac(toks('Answer customer questions'), toks('answering customers question')) === 1, 'normalization stems');
const SAMPLE = { '43-4051.00': 40, '15-1252.00': 60, '53-3032.00': 40 };
for (const [c, min] of Object.entries(SAMPLE)) { const o = idx.occupations.find((x) => x.code === c); assert(o.statements >= min, `${c} has ${o.statements} statements (< ${min})`); }
console.log(`multisource OK: ${idx.count} occupations, ${n} statements`);
