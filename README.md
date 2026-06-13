# Manas Prakriti & Anxiety Assessment Platform (MPAAP)

Research-grade clinical assessment tool combining Ayurvedic constitutional analysis (Manas Prakriti) with modern psychiatric anxiety evaluation (GAD-7). Production-ready platform deployed on Vercel with Supabase backend.

## Overview

**MPAAP** is a practitioner-administered digital platform that:
- Guides practitioners through 118-item Manas Prakriti Personality Inventory (MPPI)
- Administers 7-item GAD-7 anxiety assessment  
- Automatically calculates subtype percentages and Prakriti classification
- Generates detailed results with 16 psychological subtypes
- Exports data to Google Sheets for research aggregation
- Produces PDF reports for clinical documentation
- Premium dark theme with 4 color variants (configurable per session)

**Research Objective:** Establish correlation between Ayurvedic constitutional types and anxiety disorder susceptibility.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** Supabase PostgreSQL + REST API (@supabase/supabase-js)
- **Auth:** Static username/password (environment variables) with httpOnly session cookies
- **State:** Zustand (localStorage-synced for assessment + theme)
- **Reports:** @react-pdf/renderer (PDF generation)
- **Integrations:** Google Sheets API (append-only data export)
- **Deployment:** Vercel (serverless, zero-config)
- **Theme System:** Premium dark theme + 4 color variants (CSS variables + Zustand)

## Quick Start

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier sufficient)

### 2. Clone & Setup

```bash
git clone <repo>
cd AyurvedaMentalHealthAssessmentPlatform
npm install
```

### 3. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Run database schema (use SQL editor in Supabase dashboard)
3. Get credentials: Settings → API
   - Project URL
   - Anon/Public Key

### 4. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin authentication (static)
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password

# App URLs (local dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Google Sheets (optional)
GOOGLE_SHEETS_SPREADSHEET_ID=<your-spreadsheet-id>
GOOGLE_SHEETS_CREDENTIALS_JSON=<service-account-json>
```

### 5. Run Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000`
- **Admin Panel:** `/admin/login` (use credentials from `.env.local`)

### Production Deployment

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard (Project Settings → Environment Variables)

## Project Structure

```
.
├── app/
│   ├── api/                      # REST API routes
│   │   ├── respondents/          # Respondent creation
│   │   ├── sessions/             # Session CRUD + item responses
│   │   ├── admin/                # Admin stats & items management
│   │   └── [...]
│   ├── assessment/               # Assessment interface (MPPI + GAD-7)
│   ├── dashboard/                # Practitioner dashboard
│   ├── admin/                    # Admin dashboard & item management
│   ├── results/[sessionId]/      # Results display + PDF report
│   └── admin/login/              # Static auth login
├── components/
│   ├── AssessmentInterface.tsx   # MPPI item interface
│   ├── GAD7Interface.tsx         # GAD-7 interface
│   └── [...]
├── lib/
│   ├── scoring.ts                # Scoring engine (16 subtypes)
│   ├── supabase.ts               # Supabase REST client
│   ├── store.ts                  # Zustand stores (auth + session + theme)
│   ├── googleSheets.ts           # Google Sheets integration
│   ├── schemas.ts                # Zod validation schemas
│   └── [...]
├── types/
│   └── database.ts               # TypeScript types from Supabase schema
├── supabase/
│   ├── config.json               # Supabase project configuration
│   └── migrations/               # SQL migrations (enums, tables, schema)
├── scripts/
│   ├── push-migrations.js        # Apply Supabase migrations
│   ├── test-flow.js              # End-to-end assessment flow test
│   └── apply-single.js           # Apply individual migrations
└── public/
```

## Data Architecture (Supabase-Native)

### Database Schema

All tables use **snake_case** column naming. Schema managed via SQL migrations in `supabase/migrations/`.

**respondent:** Person being assessed
- `respondent_code` (auto-generated unique identifier)
- `age`, `gender` (ENUM), `education`, `occupation`, `name`, `phone`, `city`, `state`, `country`
- `language` (ENUM: EN/HI/MR)
- Created via `POST /api/respondents`

**session:** Single assessment instance
- `respondent_id` (FK)
- `practitioner_name` (string, no user account required)
- `status` (ENUM: IN_PROGRESS | COMPLETED | ABANDONED)
- `phase` (ENUM: MPPI | GAD7 | RESULTS)
- `current_section`, `current_item` (progress tracking)
- `started_at`, `completed_at`, `last_activity_at`

**item_response:** Individual probe score for MPPI
- `session_id` (FK)
- `item_number` (1-118)
- `probe1_score`, `probe2_score`, `probe3_score` (0-4 each)
- `item_total` (computed: sum of 3 probes)
- Unique constraint on (session_id, item_number)

**gad7_response:** Anxiety assessment responses
- `session_id` (FK, unique)
- `item1_score` through `item7_score` (0-3 each)
- `impairment_score` (0-3, optional on first save)
- `total_score`, `severity` (ENUM: MINIMAL | MILD | MODERATE | SEVERE)

**session_result:** Computed scores (auto-generated on completion)
- `session_id` (FK, unique)
- `subtype_percentages` (JSONB: {BRAMHA: 66.7, ARSHA: 100, ...})
- `predominant_prakriti`, `secondary_prakriti` (subtype codes)
- `primary_category` (SATTVIKA | RAJASIKA | TAMASIKA)
- `gad7_total`, `gad7_severity`, `gad7_impairment`

**item:** Question bank entry
- MPPI: 118 items (one per row)
  - `item_number`, `section`, `predictor_sanskrit`, `predictor_devanagari`, `interpretation`
  - `core_probe_en/hi/mr`, `probe1_question_en/hi/mr`, `probe1_score0_en/hi/mr`, ... (all optional, fallback to EN)
  - `mapped_subtypes` (text array: ["BRAMHA", "YAAMYA"])
- Translations nullable (fallback mechanism)

**gad7_item:** GAD-7 question bank
- `item_number` (1-7)
- `question_en/hi/mr`, `option0_en/hi/mr` through `option3_en/hi/mr`
- `is_impairment_item` (boolean)

### Scoring Engine

```
For each item (1-118):
  itemTotal = probe1 + probe2 + probe3  (max 12)
  for each mapped subtype:
    subtypeRawScore += itemTotal

For each subtype:
  percentage = (rawScore / maxScore) * 100

Predominant = highest percentage
Secondary = second highest percentage
```

**Special:** Item 9 is reverse-scored for PRETA subtype.

## Features

### Practitioner View

1. **Login & Dashboard**
   - View all sessions (in-progress, completed)
   - Filter by date, Prakriti, GAD-7 severity
   - Resume incomplete sessions

2. **Assessment Setup**
   - Enter mandatory respondent demographics (Name, Age, Gender, Education, Occupation, Phone, City, State)
   - Auto-generate unique respondent code (no user input required)
   - Select assessment language (EN/HI/MR) → applies to all questions + results
   - Assessment flow fixed: MPPI → GAD-7 (no selection)

3. **Assessment Interface - MPPI (Items 1-118)**
   - One item at a time, full-screen
   - Core probe (read aloud, not scored)
   - 3 follow-up probes with 0-4 scoring chips
   - **NO score display during assessment** (prevents response bias)
   - Progress bar shows % complete (not numeric score)
   - Auto-save after each item
   - Auto-advance to next item
   - Section transitions visible

4. **Assessment Interface - GAD-7 (Items 1-7 + Impairment)**
   - One item at a time, full-screen
   - 4-option cards: Not at all → Nearly every day
   - **NO score display during assessment**
   - Progress bar shows % complete
   - Auto-save after each item
   - Auto-advance after item 7 to impairment question

5. **Results Page**
   - **All scores now visible** (first time after completion)
   - Predominant Prakriti display (with Sattvika/Rajasika/Tamasika color)
   - Secondary Prakriti influence
   - Bar chart: all 16 subtypes ranked by percentage
   - GAD-7 score + severity + impairment
   - Expandable detailed breakdown

5. **PDF Report**
   - Download clinical-grade PDF
   - Metadata + respondent demographics
   - Full score table (all subtypes)
   - Prakriti classification + GAD-7 result
   - Timestamp + confidentiality notice

### Admin View

**Unified Admin Dashboard** (`/admin/login`) with 4 tabs:

1. **MPPI Items Tab**
   - View all 118 items with search/filter by section
   - Edit any item: probes, translations (EN/HI/MR), subtype mappings
   - Update item interpretations
   - Mark Section 14 gender variants (male/female)
   - Real-time DB sync via Supabase REST API

2. **GAD-7 Items Tab**
   - View all 7 anxiety assessment items
   - Edit question text + option labels (EN/HI/MR)
   - Configure impairment question
   - Real-time updates

3. **Reports Tab**
   - View all completed sessions
   - Download session results as PDF
   - Filter by date range/practitioner
   - Export data to Google Sheets

4. **Settings Tab**
   - Configure Google Sheets integration
   - Manage system settings
   - Logout

## Premium Theme System

**Design:** Premium black theme with 3 color variants (Gold, Sapphire, Emerald)
- Default: Black background (#0a0a0a) + warm white text
- User-switchable: Theme toggle available on all pages
- Persistent: Theme preference saved to localStorage
- Global: Applied across login, assessment, results, dashboard, and admin pages

**Color Variants:**
- **Default (Black Gold):** Dark background + amber accents
- **Sapphire:** Dark background + deep blue accents  
- **Emerald:** Dark background + green accents
- **Charcoal:** Dark background + neutral gray accents

**Technical:** CSS variables + Zustand store, no performance impact, WCAG AA compliant

## Google Sheets Integration

**Setup:**
1. Create service account in Google Cloud Console
2. Share target spreadsheet with service account email
3. Paste credentials JSON into `GOOGLE_SHEETS_CREDENTIALS_JSON` env var
4. Set spreadsheet ID in `GOOGLE_SHEETS_SPREADSHEET_ID`

**Behavior:**
- After session completion, automatically appends row to "Sessions" sheet
- Columns: respondent_code, age, gender, date, practitioner, status, prakriti, gad7_score, gad7_severity
- Optional: include all 118 item scores as additional columns

## Item Bank Population

### From PDFs
1. Extract MPPI items from `Scoring Format.pdf`
   - Item number, Sanskrit name (Devanagari), interpretation
   - Core probe + 3 follow-up probes (EN)
   - Subtype mapping from scoring reference

2. Extract GAD-7 items from `GAD-7_Anxiety-updated_0.pdf`
   - 7 standard questions
   - 4 options (Not at all → Nearly every day)

3. Translate to Hindi (HI) and Marathi (MR)

4. Admin panel > Item Bank > Add/Edit each item

### Workflow
- Admin creates item (itemNumber, section, predictor name, etc.)
- Uploads question text (EN/HI/MR)
- Configures 3 follow-up probes + score interpretation
- Sets mapped subtypes
- Marks Section 14 gender variants (male/female) if applicable
- Marks Section 16 as observer-rated
- Saves & test-run assessment

## Deployment

### Production (Vercel)

Platform is configured for **Vercel serverless deployment**:

1. **Prerequisites:**
   - GitHub repo (push code)
   - Vercel account (free tier sufficient)
   - Supabase project (with credentials)

2. **Deploy:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Environment Variables in Vercel Dashboard:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`

4. **Current Status:**
   - ✅ Production URL: https://ayurveda-mental-health.vercel.app
   - ✅ Health endpoint: 125 items, 3 sessions connected
   - ✅ Admin dashboard: fully functional
   - ✅ All API routes working

## Testing

### Manual Test Flow
1. Login as demo practitioner
2. Create new session
3. Complete MPPI (118 items, ~60-90 min)
4. Complete GAD-7 (7 items, ~2 min)
5. View results
6. Download PDF
7. Check data in Google Sheets

### Automated Tests
- TODO: Add Jest unit tests for scoring engine
- TODO: Add Cypress E2E tests for full assessment flow

## Troubleshooting

### Supabase Connection Issues
```bash
# Test REST API health endpoint
curl https://your-project.supabase.co/rest/v1/health

# Check credentials in .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

# Verify tables exist in Supabase SQL editor
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
```

### Database Schema Issues
```bash
# Check migration status
ls supabase/migrations/

# Re-apply migrations to fresh Supabase project
PGPASSWORD=your-password psql -h db.xxx.supabase.co -U postgres -d postgres -f migration-file.sql

# Or use Node script
DATABASE_URL=postgresql://... node scripts/push-migrations.js
```

### API Route 404 Errors
- Clear Next.js cache: `rm -rf .next`
- Restart dev server: `npm run dev`
- Verify table names are lowercase in Supabase (respondent not Respondent)
- Check env vars are loaded: `echo $NEXT_PUBLIC_SUPABASE_URL`

### Google Sheets Errors
- Verify credentials JSON format
- Check service account has access to spreadsheet
- Ensure spreadsheet ID is correct
- Check quota limits

### Performance
- For 10k+ sessions, add indexes on `session(respondent_id, created_at)` and `session(practitioner_id, status)`
- Consider pagination on admin sessions list (currently no limit)
- Implement caching for subtype config

## Roadmap (V2+)

- [ ] Multi-language UI (currently: labels in EN, questions in EN/HI/MR)
- [ ] Recommendations engine (Prakriti-based lifestyle/diet advice)
- [ ] Statistical analysis module (hypothesis testing, correlation)
- [ ] Practitioner notes & follow-up scheduling
- [ ] Mobile native app (iOS/Android)
- [ ] Real-time multi-practitioner collaboration
- [ ] Video interview integration
- [ ] Hospital EMR integration

## Contributing

1. Create feature branch from `main`
2. Make changes
3. Test locally
4. Commit with descriptive messages
5. Push + create PR

## License

Proprietary research project. Contact for licensing details.

## Support

Issues? Questions? Reach out to the engineering team.

---

**Built with Next.js + Supabase + Tailwind CSS**
**Supabase-native architecture (REST API, no ORM)**
**Clinical-grade assessment platform for Ayurvedic-psychiatric research**
