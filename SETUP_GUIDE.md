# MPAAP Setup Guide for Non-Technical Users

This guide walks through setting up the platform from scratch for your research team.

## Prerequisites

- Windows / Mac / Linux
- Node.js 18+ (download from nodejs.org)
- Supabase account (free tier at supabase.com)
- Google account (optional, for Sheets integration)

> No `DATABASE_URL` or direct PostgreSQL access needed. All runtime DB access uses Supabase REST API. `DATABASE_URL` is only needed if running migration scripts locally (optional).

## Step 1: Install Dependencies

### Windows

1. Download Node.js from nodejs.org (LTS version)
2. Run installer, accept defaults
3. Open Command Prompt or PowerShell
4. Verify installation: `node --version`

### Mac/Linux

```bash
# Install Node using Homebrew (Mac) or apt (Linux)
brew install node          # Mac
sudo apt install nodejs    # Ubuntu/Debian
```

## Step 2: Clone Project

```bash
cd C:\Users\YourName\Documents  (or your preferred location)
git clone <repository-url>
cd AyurvedaMentalHealthAssessmentPlatform
```

## Step 3: Setup Supabase Database

1. Sign up at supabase.com (free tier included)
2. Create new project
3. Go to Settings → API, copy:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Publishable Key / Anon Key** (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
4. **Optional:** For running migrations locally, also get:
   - PostgreSQL connection string (for DATABASE_URL)

## Step 4: Environment Configuration

1. Open project folder in text editor (VS Code recommended)
2. Create `.env.local`:

```env
# Supabase API (from Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[anon-key]

# Admin authentication (static username/password)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# App URLs (local dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: PostgreSQL connection (for running migrations locally)
DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true
```

Copy from Supabase dashboard → Settings → API:
- `[project-id]` = Your Supabase project ID
- `[anon-key]` = Publishable/Anonymous Key

For DATABASE_URL:
- `[password]` = Your Supabase Postgres password
- `[host]` = Database host (e.g., db.zixydcrxwdpshefagxpn.supabase.co)

## Step 5: Initialize Database

In Command Prompt/Terminal (in project folder):

```bash
npm install
```

**Option A: Migrations via Supabase UI (Recommended)**
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy-paste SQL from `supabase/migrations/*.sql` files (starting with 20250612000000_create_enums.sql)
4. Execute each migration in order

**Option B: Migrations via Node Script** (requires DATABASE_URL)
```bash
node scripts/push-migrations.js
```

This creates all necessary Supabase tables:
- respondent, session, item_response, gad7_response, session_result
- item (question bank), gad7_item, subtype_config
- Enums: gender, language, session_status, assessment_phase, gad7_severity

## Step 6: Run Application

```bash
npm run dev
```

Open browser: http://localhost:3000

**Assessment Flow:** Respondent registration → MPPI assessment → GAD-7 assessment → Results

**Admin Panel:** http://localhost:3000/admin/login
- Username: (from ADMIN_USERNAME in .env.local)
- Password: (from ADMIN_PASSWORD in .env.local)

## Step 7: Populate Question Content

1. Login to Admin Panel: http://localhost:3000/admin/login
2. Navigate to **MPPI Items** tab
3. Click **View** on Item 1
4. Click **Edit** button to open editor
5. Fill in all fields:
   - **Predictor Sanskrit:** From Scoring Format.pdf
   - **Predictor Devanagari:** Transliterated Sanskrit
   - **Interpretation:** What this trait measures
   - **Language Tabs (EN/HI/MR):**
     - Core Probe: Question to read aloud
     - Probe 1 Question + Scores 0-4: First follow-up probe options
     - Probe 2 Question + Scores 0-4: Second follow-up probe options
     - Probe 3 Question + Scores 0-4: Third follow-up probe options
   - **Mapped Subtypes:** Select which of 16 Prakriti subtypes this item measures (multi-select)
   - **Section 14 Variant:** If Section 14, mark as "male" or "female" version
   - **Observer-Rated:** If Section 16, check this box
   - **Reverse Scored:** If Item 9 (PRETA subtype only), check this box

6. Click **Save**
7. Repeat for all 118 items
   - *Tip:* Can be parallelized among team members editing different sections
   - *Estimated time:* 5-10 minutes per item (with translations)

## Step 8: Test Assessment Flow

1. Go to http://localhost:3000
2. **Assessment Setup Page:**
   - Enter practitioner name (e.g., "Dr. Test")
   - Enter respondent details:
     - Name, Age, Gender, Education, Occupation, Phone, City, State, Country
     - Language preference (EN/HI/MR) - applies to all questions
   - Click **Begin Assessment**
3. **MPPI Assessment** (Items 1-118):
   - One item per screen
   - Read core probe aloud (not scored)
   - Select 0-4 for each of 3 follow-up probes
   - Click Next
   - No scores displayed during assessment (prevents bias)
4. **GAD-7 Assessment** (Items 1-7 + Impairment):
   - One item per screen
   - Select option from 4 cards: "Not at all" → "Nearly every day"
   - Answer impairment question (0-3)
   - Auto-completes session
5. **Results Page:**
   - View Prakriti classification (predominant + secondary subtypes)
   - View GAD-7 score + severity
   - See bar chart of all 16 subtype percentages
   - Download PDF report
   - Admin: View in Admin Dashboard

### Troubleshooting

**"Respondent creation fails (400 error)"**
- Check all required fields filled: name, age, gender, education, occupation, phone, city, state, country
- Verify Supabase respondent table exists: `SELECT * FROM respondent LIMIT 1;`
- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local

**"MPPI items not showing (empty list)"**
- Items table not populated yet
- Use Admin Panel → MPPI Items to add content OR
- Check migrations were applied: `SELECT COUNT(*) FROM item;` should return 0 (initially)

**"Assessment freezes or 404 error"**
- Clear browser cache: Ctrl+Shift+Delete (Chrome)
- Restart dev server: `npm run dev`
- Check browser console (F12) for error messages
- Verify all migrations applied in Supabase SQL editor

## Step 9: Deployment (Production)

### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Signup at Vercel.com, connect GitHub
3. Select this repository
4. In Vercel Dashboard → Project Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL` (from Supabase Settings → API)
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (from Supabase Settings → API)
   - `ADMIN_USERNAME` (your admin username)
   - `ADMIN_PASSWORD` (your admin password)
5. Click Deploy!

### Option B: Self-Hosted (Railway, Render, Fly, etc.)

1. Signup at hosting platform
2. Connect GitHub repository
3. Set same environment variables
4. Deploy

**Note:** Vercel (serverless) is recommended because:
- PostgreSQL direct connections (port 5432) don't work on serverless platforms
- Supabase REST API works perfectly on serverless
- Zero database server management needed

## Step 10: Launch to Practitioners

1. Share application URL (e.g., https://mpaap.vercel.app)
2. No login required—practitioners just enter their name
3. They can immediately start assessments
4. Results + CSV export available on dashboard

## Maintenance

### Regular Tasks

**Weekly:**
- Monitor sessions in Admin Dashboard
- Check for errors in logs

**Monthly:**
- Export data from Google Sheets for analysis
- Backup database (if self-hosted)

**As Needed:**
- Add new practitioners
- Update assessment questions
- Generate research reports

### Backing Up Data

**Supabase Database:**
- Automatic: Supabase keeps daily backups (paid plans) or weekly (free)
- Manual: Use Supabase Dashboard → Backups tab
- Export: Use Admin Panel → Export CSV (downloads all session + item response data)

**Google Sheets:**
- Automatic: Google keeps version history
- Manual: File → Download as CSV

## Support

### Common Issues

| Problem | Solution |
|---------|----------|
| "Port 3000 already in use" | Change: `npm run dev -- -p 3001` |
| Forgot admin password | Update `ADMIN_PASSWORD` in `.env.local`, restart dev server |
| Items not showing in assessment | Admin panel → MPPI Items → verify content filled |
| Assessment freezes | Check browser console for errors (F12) |
| Results not found after assessment | Open results page → click **Compute Results** button |

### Getting Help

- Check README.md for architecture details
- Check individual API endpoints in `/app/api/`
- Review TypeScript types in `types/database.ts` for schema
- Check Supabase SQL Editor for table structure

## Next Steps

1. ✅ Complete setup above
2. ⬜ Populate 118 MPPI items (item bank)
3. ⬜ Configure Google Sheets for data export
4. ⬜ Create practitioner accounts
5. ⬜ Conduct pilot assessments (3-5 test sessions)
6. ⬜ Launch to full practitioner team
7. ⬜ Begin data collection

---

**Questions?** Review README.md or contact the engineering team.
