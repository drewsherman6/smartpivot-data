#!/usr/bin/env node
/**
 * scripts/notify-app.js — run after the weekly refresh is pushed to main.
 * Waits for raw.githubusercontent.com to serve the new commit (its CDN caches ~5 min), then asks the
 * SmartPivot app to revalidate every page so the new data shows without a redeploy.
 * Secret: $SMARTPIVOT_REVALIDATE_SECRET or /workspace/.smartpivot-secrets/revalidate. Never printed.
 * The app also revalidates hourly and via a daily cron, so a failure here only delays the update.
 */
const fs = require('fs');
const { execSync } = require('child_process');
const APP = process.env.SMARTPIVOT_APP_URL || 'https://launchpad.smartpivot.xyz';
const secret = process.env.SMARTPIVOT_REVALIDATE_SECRET || (fs.existsSync('/workspace/.smartpivot-secrets/revalidate') ? fs.readFileSync('/workspace/.smartpivot-secrets/revalidate', 'utf8').trim() : '');
if (!secret) { console.error('notify-app: no revalidate secret; skipping (app will update within an hour)'); process.exit(0); }
const local = fs.readFileSync(require('path').join(__dirname, '..', 'data/history/changes.jsonl'), 'utf8');
(async () => {
  for (let i = 0; i < 20; i++) {
    const r = await fetch(`https://raw.githubusercontent.com/drewsherman6/smartpivot-data/main/data/history/changes.jsonl?t=${Date.now()}`).catch(() => null);
    if (r && r.ok && (await r.text()) === local) break;
    await new Promise((s) => setTimeout(s, 30000));
  }
  const res = await fetch(`${APP}/api/revalidate`, { method: 'POST', headers: { Authorization: `Bearer ${secret}` } });
  console.log('notify-app:', res.status, await res.text(), 'local HEAD', execSync('git rev-parse --short HEAD').toString().trim());
  process.exit(res.ok ? 0 : 1);
})();
