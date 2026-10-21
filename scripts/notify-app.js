#!/usr/bin/env node
/**
 * scripts/notify-app.js — run after a refresh is pushed to main.
 * 1. Checks that origin/main is the local HEAD and that raw files fetched BY COMMIT SHA (immutable, no branch CDN cache)
 *    match the local files.
 * 2. Asks the app to revalidate (/api/revalidate re-resolves main's SHA; the app reads raw files pinned to that SHA).
 * 3. Verifies: /api/data-version reports the same SHA, and a canary results page renders with data-smartpivot-sha=<SHA>.
 * Success is reported only after step 3; otherwise exits 1 with what didn't match.
 * Secret: $SMARTPIVOT_REVALIDATE_SECRET or /workspace/.smartpivot-secrets/revalidate. Never printed.
 */
const fs = require('fs'); const path = require('path');
const { execSync } = require('child_process');
const APP = process.env.SMARTPIVOT_APP_URL || 'https://launchpad.smartpivot.xyz';
const REPO = 'drewsherman6/smartpivot-data';
const CANARY = process.env.SMARTPIVOT_CANARY || '/results/53-3032.00';
const sleep = (ms) => new Promise((s) => setTimeout(s, ms));
const sh = (c) => execSync(c, { cwd: path.join(__dirname, '..') }).toString().trim();
const secret = process.env.SMARTPIVOT_REVALIDATE_SECRET || (fs.existsSync('/workspace/.smartpivot-secrets/revalidate') ? fs.readFileSync('/workspace/.smartpivot-secrets/revalidate', 'utf8').trim() : '');
const fail = (m) => { console.error('notify-app: FAILED -', m); process.exit(1); };
async function poll(what, fn, tries, wait) { for (let i = 0; i < tries; i++) { const r = await fn().catch(() => false); if (r) return r; await sleep(wait); } fail(what); }
(async () => {
  const sha = sh('git rev-parse HEAD');
  const remote = sh('git ls-remote origin refs/heads/main').split(/\s+/)[0];
  if (remote !== sha) fail(`origin/main is ${remote.slice(0, 7)}, local HEAD ${sha.slice(0, 7)} (push first)`);
  for (const rel of ['data/history/changes.jsonl', 'data/agent_platforms.json']) {
    const local = fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
    await poll(`raw ${rel} at ${sha.slice(0, 7)} differs from local`, async () => { const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${sha}/${rel}`); return r.ok && (await r.text()) === local; }, 6, 10000);
  }
  if (!secret) { console.error('notify-app: no revalidate secret; skipping (app re-resolves the SHA within ~5 min and pages within an hour)'); process.exit(0); }
  const res = await fetch(`${APP}/api/revalidate?sha=${sha}`, { method: 'POST', headers: { Authorization: `Bearer ${secret}` } });
  if (!res.ok) fail(`revalidate ${res.status}`);
  const rv = await res.json();
  await poll(`app /api/data-version never reported ${sha.slice(0, 7)}`, async () => { const r = await fetch(`${APP}/api/data-version?t=${Date.now()}`, { cache: 'no-store' }); const j = await r.json(); return j.sha === sha && j; }, 20, 15000);
  // ISR serves the old page once while regenerating, so request until the canary renders the new SHA.
  await poll(`canary ${CANARY} still renders an older data commit`, async () => { const r = await fetch(`${APP}${CANARY}`, { cache: 'no-store' }); return r.ok && (await r.text()).includes(`data-smartpivot-sha="${sha}"`); }, 20, 15000);
  console.log(`notify-app: OK - app is serving data ${sha.slice(0, 7)} (raw-by-SHA verified, /api/data-version and ${CANARY} match; revalidated at ${rv.at})`);
})();
