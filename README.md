# Manas Prakriti & Anxiety Assessment Platform (MPAAP)

Research-grade clinical assessment tool combining Ayurvedic constitutional analysis (Manas Prakriti) with modern psychiatric anxiety evaluation (GAD-7). Production-deployed on Vercel with Supabase backend.

**Production URL:** https://ayurveda-mental-health.vercel.app

---

## Overview

MPAAP is a practitioner-administered digital platform that:

- Guides practitioners through 118-item Manas Prakriti Personality Inventory (MPPI)
- Administers 7-item GAD-7 anxiety assessment with functional impairment question
- Automatically scores 16 psychological subtypes and Prakriti classification
- Displays results with bar chart, PDF report, and CSV export
- Supports multilingual assessment: English, Hindi, Marathi (EN/HI/MR)
- Mobile-responsive across all patient-facing and admin pages

**Research Objective:** Establish correlation between Ayurvedic constitutional types and anxiety disorder susceptibility.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | Supabase PostgreSQL via REST API (`@supabase/supabase-js`) |
| Auth | Static env-var credentials + httpOnly session cookies |
| State | Zustand (localStorage-persisted: session + theme) |
| PDF | `@react-pdf/renderer` (browser-side, dynamic import) |
| Charts | Recharts |
| i18n | Hard-coded constants (`lib/localization.ts`) — no i18n library |
| Deployment | Vercel (serverless, auto-deploy from GitHub) |

**No ORM.** All DB access via Supabase REST API. No Prisma, no direct PostgreSQL connections.

---

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase project (free tier sufficient)

### 1. Clone & Install

```bash
git clone <repo>
cd AyurvedaMentalHealthAssessmentPlatform
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
# Supabase REST API (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin authentication — static username/password only
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password

# Optional: Google Sheets export
GOOGLE_SHEETS_SPREADSHEET_ID=<spreadsheet-id>
GOOGLE_SHEETS_CREDENTIALS_JSON=<service-account-json>
```

> **Security note:** Admin auth uses env-var static credentials + httpOnly cookies only. No OAuth, no IP allowlist, no JWT.

### 3. Initialize Database

Run SQL migrations in Supabase Dashboard → SQL Editor (in order):

```
supabase/migrations/20250612000000_create_enums.sql
supabase/migrations/20250612000001_create_tables.sql
supabase/migrations/...
```

Or via script (requires PostgreSQL connection):
```bash
node scripts/push-migrations.js
```

### 4. Seed Items (Optional)

Seed placeholder MPPI item structure (118 items):
```bash
npm run seed:items
```

Then populate real content via Admin Panel → MPPI Items.

### 5. Run Dev Server

```bash
npm run dev
```

- App: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── respondents/                  POST — create respondent
│   │   ├── sessions/                     GET (list), POST (create)
│   │   │   └── [sessionId]/
│   │   │       ├── route.ts              GET (with respondent+result), PATCH
│   │   │       ├── items/[num]/          PUT — save MPPI item response
│   │   │       ├── gad7/                 PUT — save GAD-7, auto-scores on impairment
│   │   │       └── calculate/            POST — manual recalculate scoring
│   │   ├── items/[itemNumber]/           GET — fetch single MPPI item for assessment
│   │   ├── admin/
│   │   │   ├── auth/login|logout/        POST — session cookie auth
│   │   │   ├── stats/                    GET — dashboard statistics
│   │   │   └── items|gad7-items/         GET, POST — item CRUD
│   │   ├── export/csv/                   GET — full CSV export
│   │   └── health/                       GET — system health check
│   ├── admin/
│   │   ├── login/                        Static credential login
│   │   └── manage/                       5-tab admin dashboard
│   ├── assessment/
│   │   ├── setup/                        Respondent registration form
│   │   └── [sessionId]/                  Assessment controller (MPPI → GAD-7)
│   └── results/[sessionId]/
│       ├── page.tsx                      Results display + chart
│       └── report/                       PDF download page
├── components/
│   ├── AssessmentInterface.tsx           MPPI one-item-at-a-time UI
│   ├── GAD7Interface.tsx                 GAD-7 one-item-at-a-time UI
│   ├── ReportPDFDocument.tsx             react-pdf document (browser-only)
│   ├── ThemeProvider.tsx                 CSS variable theme switcher
│   ├── ThemeToggle.tsx                   Theme toggle button
│   └── admin/
│       ├── MPPIItemsTab.tsx              Item list + edit (mobile card + desktop table)
│       ├── GAD7Tab.tsx                   GAD-7 item editor
│       ├── SessionsTab.tsx               Sessions list (mobile cards + desktop table)
│       ├── ReportsTab.tsx                Stats charts + data export
│       └── SettingsTab.tsx               Google Sheets + system config
├── lib/
│   ├── scoring.ts                        MPPI scoring engine (16 subtypes + GAD-7)
│   ├── supabase.ts                       Supabase client (lazy singleton)
│   ├── store.ts                          Zustand: session + theme stores
│   ├── localization.ts                   UI labels EN/HI/MR (hard-coded constants)
│   ├── schemas.ts                        Zod validation
│   └── constants/prakriti.ts             Prakriti/category/severity label maps
├── supabase/migrations/                  SQL schema (source of truth)
├── scripts/
│   ├── seed-mppi-items.js               Seed 118 MPPI placeholder items
│   ├── seed-dummy-data.js               Seed test sessions
│   ├── push-migrations.js               Apply SQL migrations via psql
│   └── *.json                           Section-by-section item batch data
└── types/database.ts                     TypeScript types from Supabase schema
```

---

## Data Architecture

### Database Tables (snake_case, Supabase PostgreSQL)

**respondent** — Person being assessed
- `respondent_code` (auto-generated: `RESP-{timestamp}`)
- `name`, `age`, `gender`, `education`, `occupation`, `phone`, `city`, `state`, `country`
- `language` (ENUM: EN | HI | MR)

**session** — Single assessment instance
- `respondent_id` (FK → respondent)
- `practitioner_name` (string, no user account required)
- `status` (ENUM: IN_PROGRESS | COMPLETED | ABANDONED)
- `phase` (ENUM: MPPI | GAD7 | RESULTS)
- `current_section`, `current_item` (progress tracking, 1-indexed)
- `started_at`, `completed_at`, `last_activity_at`

**item_response** — MPPI probe scores
- `session_id` (FK), `item_number` (1–118)
- `probe1_score`, `probe2_score`, `probe3_score` (0–4 each)
- Unique constraint on `(session_id, item_number)`

**gad7_response** — Anxiety assessment
- `session_id` (FK, unique), `item1_score`…`item7_score` (0–3)
- `impairment_score` (0–3), `total_score`, `severity` (ENUM)

**session_result** — Computed on completion (auto or manual recalculate)
- `session_id` (FK, unique)
- `subtype_percentages` (JSONB: `{"BRAMHA": 66.7, ...}`)
- `predominant_prakriti`, `secondary_prakriti`, `primary_category`
- `gad7_total`, `gad7_severity`, `gad7_impairment`

**Item** — MPPI question bank (118 items)
- `itemNumber`, `section` (1–16), `predictor_sanskrit`, `predictor_devanagari`, `interpretation`
- `core_probe_en/hi/mr`, `probe1_question_en/hi/mr`, `probe1_score0_en/hi/mr`…`probe3_score4_en/hi/mr`
- `mapped_subtypes` (text array: `["BRAMHA", "YAAMYA"]`)
- `is_observer_rated` (Section 16), `section14_gender_variant` (null | "male" | "female")
- **Nullable translations** — all non-EN fields optional, fallback to EN silently

**gad7_item** — GAD-7 question bank (7 items)
- `item_number`, `question_en/hi/mr`, `option0_en/hi/mr`…`option3_en/hi/mr`
- `is_impairment_item` (boolean)

### Critical: snake_case vs camelCase Boundary

Supabase REST API returns **snake_case** field names. Frontend components and Zustand stores use **camelCase**. Always map at the API boundary:

```typescript
// In GET route responses — always explicit mapping, never spread raw DB row
return NextResponse.json({
  id: session.id,
  respondentCode: respondentData.respondent_code,
  currentItem: session.current_item,
  // ...
})

// In component fetches — use ?? fallback for resilience
const code = data.respondent_code ?? data.respondentCode
```

---

## Scoring Engine

```
MPPI (16 subtypes):
  for each item (1–118):
    itemTotal = probe1 + probe2 + probe3        (max 12)
    for each mapped_subtype:
      subtypeRawScore[subtype] += itemTotal

  Special: item 9 is REVERSE-SCORED for PRETA subtype
    preta_contribution = 12 - itemTotal

  for each subtype:
    percentage = (rawScore / maxPossibleScore) × 100

  predominant = argmax(percentages)
  secondary   = 2nd argmax(percentages)

GAD-7:
  total = sum(item1…item7)          (0–21)
  severity: 0–4 MINIMAL, 5–9 MILD, 10–14 MODERATE, 15–21 SEVERE
```

Scoring triggered automatically when GAD-7 impairment score is saved. Manual recalculate available at `POST /api/sessions/[id]/calculate` and via "Compute Results" button on results page.

---

## Assessment Flow

```
/assessment/setup
  → POST /api/respondents  (create respondent, get respondent_code)
  → POST /api/sessions     (create session IN_PROGRESS/MPPI)

/assessment/[sessionId]   (AssessmentInterface — items 1–118)
  → GET  /api/items/[num] (fetch item from Item table)
  → PUT  /api/sessions/[id]/items/[num]  (save probe scores, auto-transition at 118)

  [phase transition: MPPI → GAD7]

/assessment/[sessionId]   (GAD7Interface — items 1–7 + impairment)
  → PUT  /api/sessions/[id]/gad7  (save scores; on impairment: auto-score → COMPLETED)

/results/[sessionId]      (show Prakriti + GAD-7 + chart)
  → GET  /api/sessions/[id]  (returns session + respondent + result)
  → POST /api/sessions/[id]/calculate  (if result missing, recalculate on demand)

/results/[sessionId]/report  (PDF download)
  → same GET, then react-pdf renders client-side
```

---

## Features

### Patient / Practitioner Flow

1. **Assessment Setup** — Enter demographics (Name, Age, Gender, Education, Occupation, Phone, City, State, Country) + practitioner name + language (EN/HI/MR). Auto-generates unique respondent code.

2. **MPPI Assessment** (118 items, ~60–90 min)
   - One item per screen, full-focus
   - Core probe read aloud (not scored)
   - 3 follow-up probes with 0–4 scoring chips
   - No scores visible during assessment (prevents response bias)
   - Auto-save after every item
   - Section name + item count in progress header

3. **GAD-7 Assessment** (7 items + impairment, ~2–3 min)
   - One item per screen
   - 4-option cards: Not at all → Nearly every day
   - Auto-triggers scoring when impairment saved

4. **Results**
   - Predominant + secondary Prakriti with category color
   - Bar chart of all 16 subtypes (sorted by percentage)
   - GAD-7 total score + severity + impairment label
   - Expandable detailed breakdown
   - "Compute Results" button if result was not saved (edge case recovery)

5. **PDF Report** — Practitioner-grade PDF with respondent metadata, Prakriti profile, full subtype table, GAD-7 result. Downloads client-side.

### Admin Dashboard (`/admin/manage`) — 5 Tabs

| Tab | Function |
|-----|----------|
| MPPI Items (118) | View/edit all items. Desktop table + mobile cards. Search by section. 3-language editor (EN/HI/MR). |
| GAD-7 | Edit 7 anxiety items + impairment question. 3-language support. |
| Sessions | List all sessions with respondent info + Prakriti + GAD-7 score. Filter by status + date. Mobile card view. |
| Reports | Session stats cards, Prakriti distribution bar chart, GAD-7 severity pie chart. CSV export. |
| Settings | Google Sheets integration config. System settings. |

---

## Multilingual Support (V1.1 — Complete)

All UI labels translated to EN / HI / MR:
- Admin login, admin dashboard (all tabs), session filters, chart titles
- Assessment setup page field labels
- Language selection persists via Zustand → localStorage

Question content (core probes, probe questions, score labels) stored per-language in Supabase `Item` table. Missing translations fall back to EN silently.

---

## Theme System

4 CSS-variable themes, switchable on any page, persisted to localStorage:

| Theme | Background | Accent |
|-------|-----------|--------|
| Default (Black Gold) | #0a0a0a | #d4a574 (amber) |
| Sapphire | #0a0a0a | #4a7bdc (blue) |
| Emerald | #0a0a0a | #3db366 (green) |
| Charcoal | #0a0a0a | #808080 (gray) |

---

## Mobile Responsiveness

All pages updated for mobile (375px+):
- Assessment interface: touch-sized option chips, scaled headings, compact padding
- GAD-7 interface: same treatment
- Results: stacked layout, smaller chart, column action buttons
- Admin sessions: mobile card view (`md:hidden`) + desktop table (`hidden md:block`)
- Admin reports: 2-column stats grid on mobile, scaled charts
- Admin header: wraps on narrow screens
- Viewport meta set: no iOS auto-zoom on input focus

---

## Google Sheets Integration

After session completion, auto-appends row to "Sessions" sheet:

```
respondent_code | age | gender | date | practitioner | prakriti | gad7_score | gad7_severity
```

**Setup:**
1. Create service account in Google Cloud Console
2. Share target spreadsheet with service account email
3. Set `GOOGLE_SHEETS_CREDENTIALS_JSON` + `GOOGLE_SHEETS_SPREADSHEET_ID` env vars

---

## Deployment (Vercel)

```bash
# Push to GitHub → Vercel auto-deploys
git push origin master
```

**Required Vercel env vars (Settings → Environment Variables):**

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API → Anon/Public Key |
| `ADMIN_USERNAME` | Your choice |
| `ADMIN_PASSWORD` | Your choice (keep secure) |

No `DATABASE_URL` needed. All runtime DB access via Supabase REST API.

---

## Troubleshooting

### Admin panel shows 0 items
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in env vars
- Check `Item` table exists: Supabase Dashboard → Table Editor → `Item`
- Run `GET /api/health` — should return `{"status":"ok","items":125}`

### "Results not found" after completing assessment
- Open results page → click **Compute Results** button
- This triggers `POST /api/sessions/[id]/calculate` using stored item responses

### Assessment shows placeholder questions
- MPPI content not entered yet
- Go to Admin → MPPI Items → Edit each item → fill in probes and score labels

### API 500 errors
- Check Supabase project is active (not paused on free tier)
- Verify env vars match the correct Supabase project
- Check Supabase dashboard logs: Logs → Edge Functions

### PDF download blank
- React-pdf loads client-side only; wait for "Preparing PDF..." to resolve
- If page is blank: hard refresh (Ctrl+Shift+R)

### Performance (10k+ sessions)
- Add indexes: `session(respondent_id, created_at)`, `session(status)`
- Add pagination to admin sessions list (currently no limit)

---

## Roadmap

### V1.3 (Next)
- [ ] Results page localization (Prakriti + GAD-7 labels in selected language)
- [ ] Assessment interface static labels localization (MPPI/GAD-7 pages)
- [ ] Offline resilience: queue failed saves in localStorage, retry on reconnect
- [ ] Resume by phone number: detect existing respondent, resume from last saved item

### V2+
- [ ] Recommendations engine (Prakriti-based lifestyle/diet advice)
- [ ] Statistical analysis module (ANOVA, correlation)
- [ ] Bulk item import (CSV/Excel)
- [ ] Mobile native app (iOS/Android)
- [ ] Hospital EMR integration
- [ ] Real-time multi-practitioner collaboration

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Supabase REST (no ORM) | Vercel serverless can't maintain TCP connections to PostgreSQL |
| Static admin auth (env vars) | Single-org, no self-registration; JWT/OAuth is unnecessary complexity |
| No live scores during assessment | Prevents response bias; clinical best practice |
| Fixed MPPI → GAD-7 sequence | No selection friction; always the same clinical workflow |
| Hard-coded i18n constants | No library overhead; healthcare terminology needs exact control |
| JSON for subtype_percentages | 16 values, read-only after compute, avoids 16 JOINs per result |

---

## License

Proprietary research project. Contact for licensing details.

---

*Built with Next.js 14 + Supabase + Tailwind CSS. Supabase-native REST API architecture, no ORM.*
