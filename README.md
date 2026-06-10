# Manas Prakriti & Anxiety Assessment Platform (MPAAP)

Research-grade clinical assessment tool combining Ayurvedic constitutional analysis (Manas Prakriti) with modern psychiatric anxiety evaluation (GAD-7).

## Overview

**MPAAP** is a practitioner-administered digital platform that:
- Guides practitioners through 118-item Manas Prakriti Personality Inventory (MPPI)
- Administers 7-item GAD-7 anxiety assessment
- Automatically calculates subtype percentages and Prakriti classification
- Generates detailed results with 16 psychological subtypes
- Exports data to Google Sheets for research aggregation
- Produces PDF reports for clinical documentation

**Research Objective:** Establish correlation between Ayurvedic constitutional types and anxiety disorder susceptibility.

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (access + refresh tokens), bcryptjs
- **Reports:** @react-pdf/renderer
- **State:** Zustand (localStorage-synced)
- **Integrations:** Google Sheets API
- **Deployment:** Vercel (or self-hosted)
- **Theme System:** Premium dark theme + 3 color variants (CSS variables + Zustand)

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 2. Clone & Setup

```bash
git clone <repo>
cd AyurvedaMentalHealthAssessmentPlatform
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/manas_prakriti
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

GOOGLE_SHEETS_SPREADSHEET_ID=<your-spreadsheet-id>
GOOGLE_SHEETS_CREDENTIALS_JSON=<JSON string of service account credentials>

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with demo users + placeholder items
npm run seed
```

### 5. Run Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Demo Credentials

After seeding:
- **Practitioner:** demo@example.com / demo1234
- **Admin:** admin@example.com / demo1234

## Project Structure

```
.
├── app/
│   ├── api/                      # API routes
│   │   ├── auth/login            # JWT login
│   │   ├── sessions/             # Session CRUD + item responses
│   │   ├── admin/                # Admin stats & items management
│   │   └── [...]
│   ├── assessment/               # Assessment interface (MPPI + GAD-7)
│   ├── dashboard/                # Practitioner dashboard
│   ├── login/                    # Login page
│   ├── results/[sessionId]/      # Results display + PDF report
│   └── admin/                    # Admin dashboard & item management
├── components/
│   ├── AssessmentInterface.tsx   # MPPI item interface
│   ├── GAD7Interface.tsx         # GAD-7 interface
│   └── [...]
├── lib/
│   ├── scoring.ts                # Scoring engine (16 subtypes)
│   ├── auth.ts                   # JWT + password utilities
│   ├── store.ts                  # Zustand stores (auth + session)
│   ├── googleSheets.ts           # Google Sheets integration
│   ├── schemas.ts                # Zod validation schemas
│   └── [...]
├── prisma/
│   └── schema.prisma             # Database schema
├── scripts/
│   └── seed.js                   # Populate demo data
└── public/
```

## Data Architecture

### Key Models

**User:** Practitioner or Admin account
- Email, password hash, role
- Sessions they've conducted

**Respondent:** Person being assessed
- Demographics (age, gender, education, location, phone)
- Respondent code (auto-generated or manual)
- Language preference (EN/HI/MR)

**Session:** Single assessment instance
- Links respondent + practitioner
- Fixed sequence: MPPI (items 1-118) → GAD-7 (items 1-7) → Results
- Tracks current section + item for progress
- Auto-saves progress to localStorage + server
- Status: IN_PROGRESS | COMPLETED | ABANDONED

**ItemResponse:** Individual probe score (0-4)
- 3 probes per item → max 12 per item
- 118 items total (MPPI Sections 1-16)

**GAD7Response:** Anxiety assessment
- 7 items (0-3 each) + 1 impairment question
- Auto-calculated total (0-21) + severity label

**SessionResult:** Computed scores (auto-generated on completion)
- Raw + max + percentage for all 16 subtypes
- Predominant + secondary Prakriti
- GAD-7 total + severity

**Item:** Question bank entry
- MPPI: 118 items (section, Sanskrit name, 3 follow-up probes, subtype mappings)
- GAD-7: 7 items
- Translations (EN/HI/MR)
- Admin-editable

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

1. **Dashboard**
   - Total/completed/in-progress session counts
   - Prakriti distribution chart (placeholder)
   - GAD-7 severity distribution (placeholder)

2. **Item Bank Management**
   - List all 118 MPPI + 7 GAD-7 items
   - Filter by number/section/name
   - Edit items: Sanskrit name, Devanagari, interpretation, 3 probes
   - Translations (EN/HI/MR)
   - Mark Section 14 gender variants, Section 16 observer-rated
   - Manage subtype mappings

3. **Google Sheets Config**
   - Connect organization spreadsheet
   - Auto-append completed sessions (one row per session)
   - Columns: respondent ID, age, gender, Prakriti, GAD-7, all item responses

4. **Data Export**
   - CSV download of all sessions (anonymized or with demographics)
   - Stats: Prakriti distribution, GAD-7 severity breakdown

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

### Vercel

```bash
npm install -g vercel

# First time
vercel --prod

# Update existing
vercel --prod
```

Set environment variables in Vercel dashboard.

### Self-Hosted (Railway, Render, etc.)

1. Push code to GitHub
2. Connect repo to deployment platform
3. Set environment variables
4. Deploy

Both should auto-detect Next.js + run `npm run build && npm run start`.

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

### Database Connection Issues
```bash
# Check DB running
psql -U user -d manas_prakriti -c "SELECT 1"

# Reset migrations
npm run prisma:migrate reset
npm run seed
```

### Google Sheets Errors
- Verify credentials JSON format
- Check service account has access to spreadsheet
- Ensure spreadsheet ID is correct
- Check quota limits

### Performance
- For 1000+ sessions, consider indexing on respondentCode + createdAt
- Implement pagination on admin sessions list
- Cache subtype config in memory

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

**Built with Next.js + Prisma + Tailwind CSS**
**Clinical-grade assessment platform for Ayurvedic-psychiatric research**
