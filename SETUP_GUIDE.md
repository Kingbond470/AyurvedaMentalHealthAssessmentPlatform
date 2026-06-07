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

## Step 3: Setup Database

### Option A: Local PostgreSQL (Recommended for Development)

1. Download PostgreSQL from postgresql.org
2. Run installer, set password = `postgres`
3. Accept default port 5432
4. After install, verify: Open Command Prompt → `psql -U postgres` → type password

### Option B: Cloud PostgreSQL (Recommended for Production)

1. Sign up for Neon, Railway, or Render
2. Create new PostgreSQL database
3. Copy connection string (looks like: `postgresql://user:password@host:5432/db`)

## Step 4: Environment Configuration

1. Open project folder in text editor (VS Code recommended)
2. Copy `.env.example` to `.env.local`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/manas_prakriti
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_CREDENTIALS_JSON=

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### For Google Sheets (Optional, Can Add Later)

1. Go to Google Cloud Console (console.cloud.google.com)
2. Create new project
3. Enable "Google Sheets API"
4. Create Service Account
5. Download credentials as JSON
6. Copy entire JSON into `GOOGLE_SHEETS_CREDENTIALS_JSON` (keep as single-line JSON)
7. Share your Sheets spreadsheet with the service account email

## Step 5: Initialize Database

In Command Prompt/Terminal (in project folder):

```bash
npm install
npm run prisma:migrate
npm run seed
```

This creates:
- Database structure
- Demo practitioner: demo@example.com / demo1234
- Demo admin: admin@example.com / demo1234
- 118 placeholder MPPI items + 7 GAD-7 items

## Step 6: Run Application

```bash
npm run dev
```

Open browser: http://localhost:3000

Login with: demo@example.com / demo1234

## Step 7: Populate Question Content

### As Admin

1. Login: admin@example.com / demo1234
2. Navigate: Admin Dashboard → Manage Item Bank
3. Click first item (Item 1)
4. Fill in:
   - **Predictor (Sanskrit):** From Scoring Format.pdf
   - **Predictor (Devanagari):** From Scoring Format.pdf (transliterated)
   - **Interpretation:** What this trait means
   - **Core Probe (EN):** Question to read aloud
   - **Follow-up Probe 1-3 (EN):** Three scoring questions
   - **Translations (HI/MR):** Translate all text to Hindi/Marathi
   - **Mapped Subtypes:** Select which of 16 subtypes this item measures
   - **Section 14 Variant:** If Section 14, mark as "Male" or "Female" version
   - **Observer-Rated:** If Section 16, check this box

5. Save & move to next item
6. Repeat for all 118 items (this takes time—can be parallelized among team)

### Bulk Import Option

If you have items in CSV or Excel:
- TBD: Implement bulk import endpoint
- For now: Admin panel supports manual entry

## Step 8: Test Assessment Flow

### As Practitioner (demo@example.com)

1. Dashboard → "Start New Assessment"
2. Enter respondent details
3. Select assessment order (MPPI first or GAD-7 first)
4. Complete sample assessment (just for testing)
5. View results → Download PDF

### Troubleshooting

**"Database connection error"**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`
- Try: `psql -U postgres -d manas_prakriti -c "SELECT 1"`

**"Items showing as 'placeholder'"**
- Admin panel not yet populated with content
- Items are there, just need text filled in

**"Google Sheets not syncing"**
- Verify service account JSON is valid
- Check spreadsheet is shared with service account email
- Test: POST to `/api/sessions/[id]/calculate` endpoint

## Step 9: Deployment (Production)

### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Signup at Vercel.com, connect GitHub
3. Select this repository
4. Add environment variables (same as `.env.local`)
5. Deploy!

### Option B: Self-Hosted (Railway, Render, etc.)

1. Signup at Railway or Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy & auto-scales

Both handle database setup automatically.

## Step 10: Launch to Practitioners

1. Create practitioner accounts (Admin Dashboard → Users)
2. Each practitioner gets: email + password
3. Send them login link
4. They can immediately start assessments

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
