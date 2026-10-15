# Aether Weekly Research Runbook (unattended, direct to main)

**Purpose:** Every week, refresh SmartPivot's sourced data on how AI, AI agents and robotics are affecting every occupation.
**Mode:** Unattended. The routine commits **straight to `main`**, as Drew authorized on 2026-10-13. It **never force-pushes**, never rewrites history, and never changes the path or top-level shape of a legacy file. `npm test` must pass before every push.

## Golden rules
1. **No invented numbers.** Every figure comes from a bulk file or page retrieved in this run, with its source name, URL and `retrieved_at`.
2. **Merge, never overwrite.** Bulk datasets are rebuilt by `scripts/refresh.js`. Curated datasets change only through `scripts/update.js` patches. Nothing is deleted; mark it `deprecated` instead.
3. **Dates move only when data moves.** refresh.js skips writing any file whose content is unchanged, ignoring `generated` and `retrieved_at`.
4. **Legacy files:** additive edits only. Whole-role risk scores move at most ±6 per week.

## Weekly steps
```
cd smartpivot-data && git pull --ff-only origin main
npm ci
npm run refresh            # downloads O*NET, BLS OEWS + projections, Eloundou, AIOE, Anthropic EI (exposure, task penetration, robot exposure); rebuilds data/occupations, data/exposure, data/robotics, data/signals; verifies agent + robot homepages; rebuilds index.json
npm test                   # MUST pass; if it fails, fix or `git checkout -- .` and stop (do not push)
```
Then do the curated research pass (30–60 min):
1. **Check for new releases** and update `scripts/sources.js` if any of these appeared:
   - a new O*NET database (onetcenter.org/database.html, e.g. 31.1)
   - a new OEWS May release (oesmYYnat.zip)
   - new BLS projections
   - new Anthropic Economic Index files on Hugging Face
   - any new occupation-level exposure dataset

   After updating, re-run refresh.
2. **Search the last 7 days** for: "AI jobs report", "AI exposure occupations study", "AI agents launch enterprise", "humanoid robot deployment", "industrial robot installations". Prefer the tier 1–2 sources: WEF, McKinsey, OECD, ILO, IMF, BLS, NBER, IFR, LinkedIn/Lightcast/Indeed, and the AI labs.
3. **Record new figures** as patches to `headline_stats`, `occupations` (curated) or `emerging_skills`. Each needs a stable id, source{name,url,publication_date,tier}, `retrieved_at` and confidence. Apply each patch with `node scripts/update.js patch.json`.
4. **Add new products to the catalog:** new agent platforms or robot makers go into `scripts/catalog.js` with name, URL and category. The next refresh verifies them.
5. **Re-check `needs_review` and `unreachable` platforms.** Fix the URL in `data/agent_platforms.json` (for example, the product page instead of the root domain), or deprecate the entry.
6. Run `npm test` again.

## Commit and push (direct to main)
```
git add -A
git diff --cached --quiet && exit 0          # nothing changed: commit nothing
git commit -m "Weekly refresh YYYY-MM-DD: <sources changed>, <n records added/updated>"
git push origin main                          # never --force; if rejected: git pull --rebase origin main, npm test, push again
```
Log a summary of the run in the commit message (sources whose version changed, counts). `CHANGELOG.md` is updated automatically for curated patches. For bulk refreshes, add a one-line entry by hand.

## Failure handling
- Download failure (for example, BLS returns 403): BLS requires the contact User-Agent that is already set in refresh.js. Retry once, then run `npm run refresh -- --offline` from cache and note "stale <source>" in the commit.
- Schema failure: do not push. Fix the cause in the script, or revert the files.
- Never push secrets, `.cache/` or `node_modules/` (all are gitignored).

- `trend_summary` in `risk_scoring_overlay.json` is shown to users verbatim: plain sentences with sources only, never file paths or internal notes.
