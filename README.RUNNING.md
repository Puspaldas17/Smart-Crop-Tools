Running the project (dev, tests, build) — Windows PowerShell
=========================================================

Quick copy-paste commands for development and deployment.

1) Install dependencies (use npm or pnpm):

PowerShell (npm):
```powershell
npm install
```

Optional (pnpm):
```powershell
# if you prefer pnpm
npm i -g pnpm
pnpm install
```

2) Create a local env file
```powershell
copy .env.example .env
# Edit .env and set MONGODB_URI if you want DB persistence
```

3) Run the dev server (Vite + Express middleware)
```powershell
# Default (Vite picks 8080 or next free port)
npm run dev

# Or force a port (example 8080):
$env:PORT = "8080"; npm run dev
```

4) Run tests and typecheck
```powershell
npm run typecheck
npm test
```

5) Production build and start
```powershell
npm run build
npm start
# npm start runs the server from dist/server/node-build.mjs
```

6) Deploy to Vercel

- Ensure `vercel.json` is present in repo root (it should be). The static build output is `dist/spa`.
- In Vercel project settings:
  - Build Command: npm run build
  - Output Directory: dist/spa
  - Add environment variables (Project Settings → Environment Variables):
    - MONGODB_URI (your Mongo DB connection string) — optional for dev, required for persistence
    - Any other env vars from `.env.example` you use

Deploy (push to the connected branch) or run locally to emulate:
```powershell
npm i -g vercel
vercel dev
# or vercel --prod to deploy
```

Notes and tips
- If you see `[db] MONGODB_URI not set. Using in-memory storage.` that's expected if `MONGODB_URI` is unset. Data will not persist between runs.
- If Vercel shows `404 NOT_FOUND`:
  - Check the Vercel build logs to verify `npm run build` completed and `dist/spa/index.html` exists.
  - Ensure `vercel.json` routes are present and correct.
  - Check function build logs for errors compiling `api/index.ts`.

If you want, I can add a small diagnostic postbuild script that prints `ls -la dist/spa` so Vercel logs clearly show the SPA files after build.