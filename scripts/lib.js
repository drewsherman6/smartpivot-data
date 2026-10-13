const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

function ajv() {
  const a = new Ajv({ allErrors: true, strict: false });
  addFormats(a);
  a.addSchema(readJson('schemas/common.schema.json'));
  return a;
}
// Strict parse: JSON.parse rejects trailing commas / mismatched closers (the July 8 bug class).
function readJson(rel) {
  const txt = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  try { return JSON.parse(txt); } catch (e) { throw new Error(`${rel}: invalid JSON - ${e.message}`); }
}
// Atomic, validated write: serialize -> re-parse -> schema-check -> write tmp -> rename.
function writeJsonValidated(rel, obj, schemaRel) {
  const txt = JSON.stringify(obj, null, 2) + '\n';
  JSON.parse(txt);
  if (schemaRel) {
    const v = ajv().compile(readJson(schemaRel));
    if (!v(obj)) throw new Error(`${rel} fails ${schemaRel}: ${JSON.stringify(v.errors, null, 1)}`);
  }
  const abs = path.join(ROOT, rel);
  fs.writeFileSync(abs + '.tmp', txt);
  fs.renameSync(abs + '.tmp', abs);
}
const today = () => new Date().toLocaleDateString('en-CA');
module.exports = { ROOT, ajv, readJson, writeJsonValidated, today };
