# Production Setup — Vercel + Supabase

## Required Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Source |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `eyJ...` | Supabase → Settings → API → Anon/Public Key |
| `ADMIN_USERNAME` | your username | Your choice |
| `ADMIN_PASSWORD` | your password | Your choice (keep secure) |

**`DATABASE_URL` is NOT required.** All runtime database access uses Supabase REST API. Direct PostgreSQL connections are not used in production (incompatible with Vercel serverless).

Optional (Google Sheets export):

| Variable | Value |
|----------|-------|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Spreadsheet ID from URL |
| `GOOGLE_SHEETS_CREDENTIALS_JSON` | Service account JSON (stringified) |

---

## Database Setup

### 1. Create Supabase Project

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Copy credentials from Settings → API

### 2. Run Migrations

Go to Supabase Dashboard → SQL Editor → New Query. Run each file in `supabase/migrations/` in order:

```
20250612000000_create_enums.sql
20250612000001_create_tables.sql
(any additional migrations)
```

### 3. Verify Tables

After migrations, these tables should exist:
- `respondent`, `session`, `item_response`, `gad7_response`, `session_result`
- `Item` (MPPI question bank — note PascalCase), `gad7_item`

Check: Supabase Dashboard → Table Editor

---

## Deploy to Vercel

```bash
# Option 1: Push to GitHub (auto-deploy if connected)
git push origin master

# Option 2: Vercel CLI
npm install -g vercel
vercel --prod
```

Vercel auto-detects Next.js. No build config required.

---

## Post-Deploy Verification

```bash
# Health check — should return {"status":"ok","items":125}
curl https://your-domain.vercel.app/api/health

# Test admin login
open https://your-domain.vercel.app/admin/login
```

If items show 0: migrations not run, or env vars incorrect.

---

## Deployment Protection

Vercel may enable deployment protection by default (blocks API access without auth). To disable:

1. Vercel Dashboard → Project → Settings → Deployment Protection
2. Disable deployment protection
3. Wait 30 seconds and refresh

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Admin shows 0 items | Env vars wrong or tables missing | Check SUPABASE_URL + run migrations |
| 500 errors on all API routes | Supabase project paused (free tier) | Go to Supabase dashboard, resume project |
| Login fails | ADMIN_USERNAME/PASSWORD not set | Add env vars in Vercel dashboard, redeploy |
| PDF blank page | react-pdf loading | Wait for "Preparing PDF..." — it's client-side |
| Results not found | session_result missing for old sessions | Click "Compute Results" on results page |
