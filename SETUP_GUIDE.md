# MPAAP Setup Guide for Non-Technical Users

This guide walks through setting up the platform from scratch for your research team.

## Prerequisites

- Windows/Mac/Linux computer
- Node.js 18+ (download from nodejs.org)
- PostgreSQL database (local or cloud)
- Google account (for Sheets integration)

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
3. Copy credentials from Settings → API:
   - Project URL
   - Publishable Key (anon key)
4. Copy PostgreSQL connection string (for DATABASE_URL)

## Step 4: Environment Configuration

1. Open project folder in text editor (VS Code recommended)
2. Create `.env.local` with Supabase credentials:

```env
# Supabase PostgreSQL connection
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Supabase API (from Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[anon-key]

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Replace placeholders from Supabase dashboard:
- `[password]` - Postgres password
- `[host]` - Database host (e.g., aws-0-us-east-1.pooler.supabase.com)
- `[project-id]` - Your Supabase project ID
- `[anon-key]` - Publishable API key

## Step 5: Initialize Database

In Command Prompt/Terminal (in project folder):

```bash
npm install
npm run prisma:migrate
npm run seed
```

This creates:
- Database structure (Supabase tables)
- 118 placeholder MPPI items + 7 GAD-7 items
- 16 Prakriti subtype configurations

## Step 6: Run Application

```bash
npm run dev
```

Open browser: http://localhost:3000

Auto-redirects to assessment setup (no login required)

## Step 7: Populate Question Content

1. Navigate: http://localhost:3000/admin/items
2. Click first item (Item 1)
3. Fill in:
   - **Predictor (Sanskrit):** From Scoring Format.pdf
   - **Predictor (Devanagari):** From Scoring Format.pdf (transliterated)
   - **Interpretation:** What this trait means
   - **Core Probe (EN):** Question to read aloud
   - **Follow-up Probe 1-3 (EN):** Three scoring questions
   - **Translations (HI/MR):** Translate all text to Hindi/Marathi
   - **Mapped Subtypes:** Select which of 16 subtypes this item measures
   - **Section 14 Variant:** If Section 14, mark as "Male" or "Female" version
   - **Observer-Rated:** If Section 16, check this box

4. Save & move to next item
5. Repeat for all 118 items (this takes time—can be parallelized among team)

## Step 8: Test Assessment Flow

1. Go to http://localhost:3000 (auto-redirects to setup)
2. Enter practitioner name
3. Enter respondent details
4. Select assessment order (MPPI first or GAD-7 first)
5. Complete sample assessment (all 118 MPPI + 7 GAD-7 items)
6. View results → Download PDF + CSV

### Troubleshooting

**"Database connection error"**
- Verify DATABASE_URL in `.env.local` is correct
- Check Supabase project is running (Supabase dashboard)
- Verify PostgreSQL password is correct
- Test: `npm run prisma:migrate` should succeed

**"Items showing as 'placeholder'"**
- Admin panel not yet populated with content
- Items are there, just need text filled in via /admin/items

**"CSV export missing columns"**
- Run complete assessment (all 118 items + GAD-7)
- CSV will show all 118 item scores once session is completed
- Download CSV from Dashboard → "Export as CSV"

## Step 9: Deployment (Production)

### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Signup at Vercel.com, connect GitHub
3. Select this repository
4. Add environment variables:
   - DATABASE_URL (Supabase PostgreSQL)
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
5. Deploy!

### Option B: Self-Hosted (Railway, Render, etc.)

1. Signup at Railway or Render
2. Connect GitHub repository
3. Set environment variables (same as above)
4. Deploy

Both auto-scale. Supabase database is managed separately (no server needed).

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

**Local Database:**
```bash
pg_dump -U postgres manas_prakriti > backup.sql
```

**Google Sheets:**
- Automatic: Google keeps version history
- Manual: File → Download as CSV

## Support

### Common Issues

| Problem | Solution |
|---------|----------|
| "Port 3000 already in use" | Change: `npm run dev -- -p 3001` |
| Forgot admin password | Run: `npm run seed` (resets demo credentials) |
| Items not showing in assessment | Admin panel → Items → Verify content is filled |
| Assessment freezes | Check browser console for errors (F12) |

### Getting Help

- Check README.md for architecture details
- Check individual API endpoints in `/app/api/`
- Review Prisma schema in `prisma/schema.prisma`

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
