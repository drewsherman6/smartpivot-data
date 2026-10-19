#!/usr/bin/env node
/**
 * Verifies agent platforms + robot makers by fetching each homepage and recording its <title>/meta description
 * as evidence; maps agent categories to O*NET Generalized Work Activities and top occupations (from O*NET
 * work_activities importance). Merge-only: existing entries keep their ids; nothing is deleted.
 */
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { parse } = require('csv-parse/sync');
const { ROOT, readJson, writeJsonValidated, today } = require('./lib');
const C = require('./catalog');
const SRC = require('./sources');
const TODAY = today();
const BROWSER_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

async function probe(url) {
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 15000);
    const res = await fetch(url, { headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html' }, redirect: 'follow', signal: ctl.signal });
    clearTimeout(t);
    const html = (await res.text()).slice(0, 400000);
    const title = (html.match(/<title[^>]*>([^<]{1,300})<\/title>/i) || [])[1];
    const desc = (html.match(/<meta[^>]+(?:name|property)=["'](?:og:)?description["'][^>]*content=["']([^"']{1,600})/i) || html.match(/<meta[^>]+content=["']([^"']{1,600})["'][^>]*(?:name|property)=["'](?:og:)?description/i) || [])[1];
    return { http_status: res.status, final_url: res.url, title: title ? decode(title) : null, description: desc ? decode(desc) : null, checked_at: TODAY };
  } catch (e) { return { http_status: null, error: String(e.name || e.message), checked_at: TODAY }; }
}
// Evidence counts only if the page is reachable, not an interstitial, and mentions the product's key token.
function evidenceMatches(name, ev) {
  if (!ev.http_status || ev.http_status >= 400) return false;
  const text = `${ev.title || ''} ${ev.description || ''} ${ev.final_url || ''}`.toLowerCase();
  if (!text.trim() || /redirecting|just a moment|one moment, please|access denied|attention required/.test(text)) return false;
  if (C.evidenceTokens && C.evidenceTokens[name]) return text.includes(C.evidenceTokens[name]);
  const token = name.toLowerCase().replace(/[^a-z0-9 .]/g, ' ').split(/\s+/).find((w) => w.length > 2 && !['the', 'and', 'ai', 'agents', 'agent'].includes(w)) || '';
  return text.includes(token.replace(/\.(ai|tt|com|io)$/, ''));
}
// Dates move only when data moves: compare without volatile fields and skip the write if nothing else changed.
const VOLATILE = ['generated', 'retrieved_at', 'checked_at', 'updated'];
const stripVolatile = (o) => JSON.stringify(o, (k, v) => (VOLATILE.includes(k) ? undefined : v));
function writeIfChanged(rel, obj, before, schemaRel) {
  if (stripVolatile(obj) === before) return false;
  obj.updated = TODAY;
  writeJsonValidated(rel, obj, schemaRel);
  return true;
}
async function pool(items, n, fn) { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } })); return out; }

function gwaOccupations() {
  const zip = new AdmZip(path.join(ROOT, '.cache', SRC.onet.file));
  const e = zip.getEntries().find((x) => x.entryName.endsWith('/work_activities.csv'));
  const rows = parse(e.getData().toString('utf8'), { columns: true });
  const byG = new Map(); const names = {};
  for (const r of rows) { if (r['Scale ID'] !== 'IM') continue; names[r['Element ID']] = r['Element Name']; const m = byG.get(r['Element ID']) || new Map(); m.set(r['O*NET-SOC Code'], { title: r.Title, im: Number(r['Data Value']) }); byG.set(r['Element ID'], m); }
  return (gwas) => {
    const acc = new Map();
    for (const g of gwas) for (const [code, v] of byG.get(g) || []) { const a = acc.get(code) || { code, title: v.title, sum: 0 }; a.sum += v.im; acc.set(code, a); }
    return { activities: gwas.map((g) => ({ id: g, name: names[g] })), top_occupations: [...acc.values()].map((a) => ({ code: a.code, title: a.title, mean_activity_importance: Math.round((a.sum / gwas.length) * 100) / 100 })).sort((a, b) => b.mean_activity_importance - a.mean_activity_importance).slice(0, 25) };
  };
}

async function run() {
  const map = gwaOccupations();
  const src = (name, ev, url) => ({ name: `${name} official website (fetched)`, url: ev.final_url || url, publication_date: null, tier: 5 });
  // ---- agents ----
  const ap = readJson('data/agent_platforms.json');
  const apBefore = stripVolatile(ap);
  for (const [name, url, cat] of C.agentPlatforms) if (!ap.platforms.find((p) => p.name === name)) ap.platforms.push({ id: slug(name), name, url, category: cat, skills: [], facts: [], status: 'restored_unverified', source: { name: 'scripts/catalog.js (pending verification)', url, publication_date: null, tier: 0 }, retrieved_at: TODAY, confidence: 'low' });
  const evs = await pool(ap.platforms, 8, (p) => probe(p.url));
  ap.platforms.forEach((p, i) => {
    const ev = evs[i];
    if (C.categoryOverrides[p.name]) p.categories = C.categoryOverrides[p.name];
    else { if (!C.agentCategories[p.category]) p.category = (C.categoryRules.find(([re]) => re.test(p.name + ' ' + p.skills.join(' '))) || [null, 'general_assistant'])[1]; p.categories = [p.category]; }
    p.category = p.categories[0];
    p.evidence = ev;
    const ok = evidenceMatches(p.name, ev);
    if (p.status === 'deprecated') { /* deprecated entries keep their status; evidence is still recorded */ }
    else if (ok) {
      if (p.status !== 'verified') { p.status = 'verified'; p.confidence = 'medium'; p.source = src(p.name, ev, p.url); }
      p.retrieved_at = TODAY;
    } else if (!p.facts.length) { p.status = ev.http_status && ev.http_status < 400 ? 'needs_review' : 'unreachable'; p.confidence = 'low'; }
    p.onet_mapping = { ...(p.onet_mapping || {}), activities: map([...new Set(p.categories.flatMap((c) => C.agentCategories[c]))]).activities };
    delete p.onet_mapping.top_occupations;
  });
  writeIfChanged('data/agent_platforms.json', ap, apBefore, 'schemas/agent_platforms.schema.json');
  // ---- robot makers ----
  const rm = readJson('data/robotics_manufacturers.json');
  const rmBefore = stripVolatile(rm);
  let plats = []; try { plats = readJson('data/robotics/platforms.json').platforms; } catch {}
  for (const [name, url, seg] of C.robotMakers) {
    let m = rm.manufacturers.find((x) => x.name === name || x.id === slug(name) || slug(x.name).startsWith(slug(name).split('-')[0]) && x.url && new URL(x.url).hostname === new URL(url).hostname);
    if (!m) { m = { id: slug(name), name, url, product_lines: [], facts: [], source: { name: 'scripts/catalog.js (pending verification)', url, publication_date: null, tier: 0 }, retrieved_at: TODAY, confidence: 'low' }; rm.manufacturers.push(m); }
    m.segment = seg;
  }
  const rev = await pool(rm.manufacturers, 8, (m) => probe(m.url));
  rm.manufacturers.forEach((m, i) => {
    m.evidence = rev[i];
    const ok = evidenceMatches(m.name, rev[i]);
    if (ok && !m.facts.length) { m.source = src(m.name, rev[i], m.url); m.confidence = 'medium'; m.retrieved_at = TODAY; }
    const key = m.name.split(/[ (]/)[0].toLowerCase();
    const hits = plats.filter((p) => p.developer.toLowerCase().includes(key));
    m.robot_exposure_citations = hits.length ? { developers: hits.map((h) => h.developer), cited_task_count: hits.reduce((s, h) => s + h.cited_task_count, 0), occupations: [...new Set(hits.flatMap((h) => h.occupations))].sort(), source: 'data/robotics/platforms.json (Anthropic robot exposure task citations)' } : null;
  });
  writeIfChanged('data/robotics_manufacturers.json', rm, rmBefore, 'schemas/robotics_manufacturers.schema.json');
  const cnt = (a, f) => a.filter(f).length;
  console.log(`agents: ${ap.platforms.length} (verified ${cnt(ap.platforms, (p) => p.status === 'verified')}, unreachable ${cnt(ap.platforms, (p) => p.status === 'unreachable')}, unverified ${cnt(ap.platforms, (p) => p.status === 'restored_unverified')}); robot makers: ${rm.manufacturers.length} (homepage ok ${cnt(rm.manufacturers, (m) => m.evidence.http_status && m.evidence.http_status < 400)})`);
}
module.exports = { run };
if (require.main === module) run().catch((e) => { console.error(e); process.exit(1); });
