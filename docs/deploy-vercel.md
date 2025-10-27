# Deploying to Vercel (short guide)

This doc covers the minimal Vercel settings and common troubleshooting steps for this repo.

Before you deploy

- Ensure `vercel.json` is present in the repo root. This repo includes a `vercel.json` configured to:
  - Route `/api/*` to `api/index.ts` (serverless function)
  - Use `{ "handle": "filesystem" }` and fallback to `/index.html` for SPA routing
- Ensure your project builds locally (`npm run build`) and that `dist/spa/index.html` is present.

Recommended Vercel project settings

- Build Command: `npm run build`
- Output Directory: `dist/spa`

Environment variables (set in Vercel → Project → Settings → Environment Variables)

- `MONGODB_URI` — your Mongo connection string (optional for local dev; required for persistence in prod)
- `OPENWEATHER_API_KEY`, `MARKET_API_URL`, `HF_TOKEN` etc — set as needed per your project usage

Troubleshooting 404 (NOT_FOUND)

1. Check the Build logs
   - Confirm `npm run build` completed successfully.
   - Look for the `---- dist/spa listing ----` diagnostic output included by the build script — you should see `index.html` listed.

2. Check Function logs
   - If the serverless function fails to build or throws at runtime, Vercel will show compile/runtime errors in the function logs.
   - Common issues: ESM/CJS mismatches, missing runtime deps, or TypeScript transform errors. The repo's `api/index.ts` tries to import the compiled server bundle from `dist/server/node-build.mjs` when present and falls back to the source createServer, which reduces but doesn't eliminate runtime mismatch risk.

3. Verify Routes
   - `vercel.json` should contain the filesystem handler and SPA fallback; incorrect routes can cause 404s.

Local emulation (recommended for debugging)

```powershell
npm i -g vercel
vercel dev
```

`vercel dev` runs your static build and serverless functions locally and matches Vercel's runtime closely — useful when tracking down deployment-only failures.

If you share the failing deployment logs (build + functions), I can diagnose the exact cause and propose a targeted fix.
