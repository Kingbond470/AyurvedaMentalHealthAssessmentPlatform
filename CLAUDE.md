# CLAUDE.md - Architecture & Development Guide

This file documents key architectural decisions, data structures, and development patterns for the MPAAP platform. Read this before making changes.

## Core Architecture

### Assessment Flow

1. **Respondent Registration** → Create respondent record (demographics)
2. **Session Start** → Create session (links respondent + practitioner)
3. **Assessment Phase 1: MPPI** → Manas Prakriti Personality Inventory
   - 118 items across 16 sections (60-90 min duration)
   - 1-item-at-a-time interface
   - 3 follow-up probes per item (0-4 scoring, no live score display)
   - Auto-save after each item to `ItemResponse` table
   - Store locally in Zustand + localStorage for offline resilience
   - Progress bar shows % completion (not score)
4. **Assessment Phase 2: GAD-7** → General Anxiety Disorder Assessment
   - 7 items + 1 impairment question (2-3 min duration)
   - Single question with 4-option cards (0-3 scoring, no live score display)
   - Auto-save each response
5. **Completion & Scoring** → POST `/api/sessions/[id]/calculate`
   - Triggers scoring engine (MPPI 16 subtypes + GAD-7 severity)
   - Creates `SessionResult` record with computed percentages
   - Marks session as COMPLETED
6. **Results Display** → Show final Prakriti + GAD-7 results
   - Predominant & secondary subtypes with percentages
   - GAD-7 total score & severity classification
   - Bar chart of all 16 subtype percentages
7. **PDF Export** → @react-pdf/renderer generates report with all scores

### Why This Design

- **Fixed sequence (MPPI → GAD-7):** No selection friction. Clear UX flow.
- **One item at a time:** Avoids overwhelming practitioners/respondents. Maintains focus.
- **No live scores:** Prevents response bias & anxiety. Pure assessment data. Scores shown only at end.
- **Auto-save:** Network resilience (localStorage fallback). No lost data if browser closes.
- **Dual scoring:** MPPI (16 subtypes, complex mapping) + GAD-7 (simple 0-21 severity).
- **Google Sheets:** Org-wide append-only. No risk of overwriting. Easy data aggregation.

## Data Model

### Key Relationships

```
User (Practitioner/Admin)
  ├─ sessions (1:many)
  └─ (created/updated timestamps)

Respondent
  ├─ sessions (1:many)
  ├─ demographics (age, gender, education, location, phone)
  └─ language preference (EN/HI/MR)

Session
  ├─ respondent_id (FK)
  ├─ practitioner_id (FK)
  ├─ item_responses (1:many)
  ├─ gad7_response (1:1)
  ├─ result (1:1, computed on completion)
  └─ status (IN_PROGRESS | COMPLETED | ABANDONED)

ItemResponse
  ├─ session_id (FK)
  ├─ item_number (1-118)
  ├─ probe1/2/3_score (0-4)
  └─ unique constraint: (session_id, item_number)

GAD7Response
  ├─ session_id (FK, unique)
  ├─ item1-7_score (0-3)
  ├─ impairment_score (0-3)
  ├─ total_score (computed)
  └─ severity (MINIMAL/MILD/MODERATE/SEVERE)

SessionResult (computed at session end)
  ├─ session_id (FK, unique)
  ├─ subtype_percentages (JSON: {BRAMHA: 66.7, ...})
  ├─ predominant_prakriti (best subtype)
  ├─ secondary_prakriti (2nd best)
  ├─ primary_category (SATTVIKA/RAJASIKA/TAMASIKA)
  ├─ gad7_total, gad7_severity, gad7_impairment
  └─ computed_at (timestamp)

Item (Question Bank)
  ├─ item_number (1-125: 118 MPPI + 7 GAD-7)
  ├─ section (1-16)
  ├─ predictor_sanskrit, predictor_devanagari
  ├─ core_probe_en/hi/mr (NULLABLE - fallback to EN)
  ├─ probe1/2/3_question_en/hi/mr (NULLABLE - fallback to EN)
  ├─ probe1/2/3_score_0/1/2/3/4_en/hi/mr (NULLABLE - fallback to EN)
  ├─ mapped_subtypes (string[]) [e.g., ["BRAMHA", "YAAMYA"]]
  ├─ is_observer_rated (Section 16 only)
  └─ section14_gender_variant (null | "male" | "female")

Language Localization
  ├─ All question fields (core_probe, probe*_question) nullable
  ├─ All scoring labels (probe*_score_0/1/2/3/4) nullable
  ├─ GAD-7 fields nullable
  ├─ Missing translations fallback to EN silently
  ├─ No feature gates - ship with EN complete, add HI/MR gradually
  └─ Prakriti + GAD-7 labels stored in constants with EN fallback
```

### Why JSON for Scores?

`subtype_percentages` is stored as JSON (not normalized table) because:
- 16 subtypes per session is small enough
- Read-only after computation (no partial updates)
- Avoids 16 JOINs on every session query
- Makes results export to CSV/Sheets trivial

## Scoring Engine (`lib/scoring.ts`)

### Algorithm

```typescript
// Initialize raw scores for all 16 subtypes
subtypeRawScores = {BRAMHA: 0, ARSHA: 0, ...}

// For each of 118 items in session
for item in itemResponses:
  itemTotal = probe1 + probe2 + probe3  // 0-12
  mappedSubtypes = ITEM_SUBTYPE_MAP[item.itemNumber]
  
  // Special case: Item 9 reverse-scored for PRETA
  if item.itemNumber == 9:
    invertedScore = 12 - itemTotal
    subtypeRawScores['PRETA'] += invertedScore
  
  // Add to all mapped subtypes
  for subtype in mappedSubtypes:
    subtypeRawScores[subtype] += itemTotal

// Normalize to percentages
for subtype in SUBTYPE_CONFIG:
  maxScore = SUBTYPE_CONFIG[subtype].max_score
  percentage = (rawScore / maxScore) * 100

// Find top 2
predominant = max(percentages)
secondary = 2nd max(percentages)
```

### Item-to-Subtype Mapping

Stored in `ITEM_SUBTYPE_MAP` constant (not DB):
- 118 entries (one per MPPI item)
- Each item maps to 1-4 subtypes
- Example: Item 2 → ["KAUBERA", "GANDHARVA"]
- If item maps to multiple subtypes, score counts toward ALL

### Why This Works

- **Multi-scoring:** Some traits appear in multiple subtypes (intentional overlap)
- **Percentage normalization:** Subtypes have unequal item counts (7-16 items each). Percentage makes them comparable.
- **No decimals:** All math is integer until final percentage calc

## Authentication

### Static Username/Password + Session Cookies

```typescript
// Admin Login
POST /api/admin/auth/login
  → verify username + password against env vars (ADMIN_USERNAME, ADMIN_PASSWORD)
  → set httpOnly session cookie (admin_session, 24h expiry)
  → redirect to /admin/manage

// Protected Routes
middleware.ts checks:
  → if route /admin/* (UI): require admin_session cookie
  → if route /api/admin/*: allow (API routes don't check auth yet)
  → if route /api/*: allow (public endpoints)

// Logout
POST /api/admin/auth/logout
  → clear admin_session cookie
  → redirect to /admin/login
```

### Design Rationale

- **No user database:** Single org, no self-registration → env var credentials sufficient
- **httpOnly cookies:** Secure against XSS (cannot be read by JavaScript)
- **Middleware:** Protects UI pages while allowing API routes through (future: add API auth)
- **No JWT complexity:** Not multi-tenant, not multi-user → simple credential check works

## Database Access Pattern

### Supabase-Native Architecture (Production)

**All routes use Supabase REST API via @supabase/supabase-js**
- Vercel serverless cannot maintain TCP connections to PostgreSQL (ports 5432/6543)
- REST API provides built-in error handling, retries, rate limiting
- Zero connection pooling overhead
- Scales to 10k+ concurrent requests

**Prisma Removed (v1.1.0+):**
- Deleted `/prisma` directory, `lib/prisma.ts`, removed `@prisma/client` dependency
- Supabase migrations now managed in `/supabase/migrations/*.sql`
- Generated TypeScript types in `types/database.ts` from Supabase schema

**Implementation Pattern:**
```typescript
// All routes follow this pattern
const supabase = getSupabaseClient()
const { data, error } = await supabase
  .from('table_name')              // snake_case table names
  .select('col1, col2')            // all columns snake_case
  .eq('column_name', value)        // filters
  .order('created_at')             // sorting
  .single() / .limit(10)           // fetch mode

if (error) throw error
return NextResponse.json(data)
```

**Key Routes (All Migrated):**
- `POST /api/respondents` → create respondent (auto-generates respondent_code)
- `POST /api/sessions` → create session (finds respondent by respondent_code)
- `GET /api/sessions/[id]` → fetch session with progress
- `PUT /api/sessions/[id]/items/[num]` → save MPPI item response, auto-transitions at item 118
- `PUT /api/sessions/[id]/gad7` → save GAD-7 response, auto-scores on impairment
- `POST /api/sessions/[id]/calculate` → manual scoring endpoint
- `GET /api/admin/stats` → session statistics
- `GET/POST /api/admin/items` → MPPI item CRUD
- `GET/POST /api/admin/gad7-items` → GAD-7 item CRUD
- `GET /api/export/csv` → export all sessions + responses as CSV

## Frontend State Management (Zustand)

### Two Stores

**useAuthStore:**
```typescript
{
  token: string | null,          // JWT access token
  user: { id, email, name, role },
  setToken, setUser, logout
}
```
→ Persists to localStorage (`auth-store`)

**useSessionStore:**
```typescript
{
  sessionId: string,
  currentSection: 1-16,
  currentItem: 1-118,
  itemResponses: {1: {probe1, probe2, probe3}, ...},
  gad7Responses: {item1: 0, ..., item7: 2, impairment: 1},
  isAssessmentPhaseGAD7: boolean,
  setCurrentItem, setItemResponse, setGAD7Response, ...
}
```
→ Persists to localStorage (`session-store`)

### Why Client State + DB?

- **Client:** Fast UX (no server round-trip), offline support, keyboard shortcuts
- **DB:** Audit trail, recovery if browser closes, multi-device consistency
- **Pattern:** Every item save → Zustand + API POST simultaneously

## Google Sheets Integration

### Architecture

```typescript
// Triggered after session.status = COMPLETED

appendSessionToSheet(sessionData):
  1. Auth via service account (credentials in env var)
  2. Check if "Sessions" sheet exists (create if not)
  3. Append row: [respondent_id, age, gender, date, prakriti, gad7_score, ...]
  4. No overwrite, no delete (append-only = safe for research)
```

### Why Service Account?

- No user interaction required
- Credentials stored in env vars (secure)
- Scales to 1000s of sessions
- Alternative (OAuth) would require each practitioner to login to Google

### Data Row Structure

```
Respondent ID | Age | Gender | Date | Practitioner | Status | 
Predominant Prakriti | Secondary Prakriti | GAD7 Score | GAD7 Severity |
Item 1 Score | Item 2 Score | ... | Item 118 Score
```

→ Admin can pivot/analyze in Sheets itself (no separate export needed)

## Frontend Components

### Key Components

**AssessmentInterface.tsx**
- Displays one MPPI item at a time
- 3 follow-up probes with 0-4 scoring chips
- Auto-saves after each item
- Next/Previous navigation
- Progress bar + section header

**GAD7Interface.tsx**
- 7 items + 1 impairment question
- 4-option cards (not at all → nearly every day)
- One at a time (same UX pattern as MPPI)
- Saves via PUT `/api/sessions/[id]/gad7`

### Why One Item Per Screen?

- Reduces cognitive load for practitioners
- Matches clinical interview pattern (natural conversation flow)
- Full-screen focus = fewer distractions
- Mobile-responsive (single column)

## API Route Organization

```
/api/auth/login                           POST (create tokens)
/api/respondents                          POST (create respondent)
/api/sessions                             GET, POST (list + create)
/api/sessions/[sessionId]                 GET, PATCH (fetch + update status)
/api/sessions/[sessionId]/items/[num]     PUT (save item response)
/api/sessions/[sessionId]/gad7            PUT (save + calculate GAD7)
/api/sessions/[sessionId]/calculate       POST (score entire session)
/api/admin/stats                          GET (session counts, prakriti breakdown)
/api/admin/items                          GET, POST (item CRUD)
```

### Response Pattern

```typescript
// Success
200 OK, { data }

// Client Error
400 Bad Request, { error: "message" }
401 Unauthorized, { error: "no token" }
403 Forbidden, { error: "not admin" }
404 Not Found, { error: "session not found" }

// Server Error
500 Internal, { error: "database error" }
```

## Design System

### Color Palette (Tailwind Extended)

```
Primary: #3D6B4F (forest green - Ayurvedic earth)
Accent: #C4823A (amber - sacred/classical)
BG Primary: #FAFAF7 (warm off-white)
BG Section: #F5F2EC (parchment)
Text Primary: #1A1A18
Text Secondary: #5A5A55
Text Tertiary: #8A8A82
Border: #E0DDD5

Category Colors:
  SATTVIKA: #3D6B4F (forest green)
  RAJASIKA: #8B5A2B (earth brown)
  TAMASIKA: #5A5A7A (muted indigo)

GAD7 Severity:
  MINIMAL: #4A8C6A
  MILD: #C4A23A
  MODERATE: #C46B3A
  SEVERE: #B03A3A
```

### Typography

```
Display: Cormorant Garamond (headings, results)
Body: Source Serif 4 (prose, questions)
UI: DM Sans (buttons, labels)
Devanagari: Noto Sans Devanagari (Hindi/Marathi questions)
```

## Premium Theme System (V2)

### Architecture

**CSS Variables + Zustand Storage**
- Variables stored in `app/globals.css`
- Zustand `useThemeStore()` manages theme state + localStorage persistence
- `<ThemeProvider>` wraps root layout, applies `data-theme` attr on change
- Theme toggle button in header (all pages)

### Color Variants

1. **Default (Black + Gold)** - Primary theme
   - BG: #0a0a0a, Text: #f5f5f5, Accent: #d4a574
   
2. **Sapphire** - Deep blue variant
   - Accent: #4a7bdc
   
3. **Emerald** - Forest green variant  
   - Accent: #3db366
   
4. **Charcoal** - Neutral gray variant
   - Accent: #808080

### Implementation Details

See `THEME_SYSTEM.md` for:
- Full CSS variable definitions
- Component update patterns
- Tailwind config integration
- Testing checklist
- Rollout roadmap (Phase 1-4, ~8 days)

### Status

✅ **Phase 1 (Infrastructure)** - COMPLETE
- [x] CSS variables in globals.css (4 theme variants defined)
- [x] ThemeProvider component (syncs store to DOM data-theme)
- [x] useThemeStore Zustand hook (localStorage persistence)
- [x] ThemeToggle button (available on all pages)
- [x] Deployed to production (all pages using CSS variables)

## Implementation Status

### Production Ready (V1.1 - Supabase-Native)
- ✅ Core assessment + scoring (118 MPPI + 7 GAD-7 items)
- ✅ PDF reports (@react-pdf/renderer)
- ✅ Google Sheets export (append-only, service account auth)
- ✅ Admin item management (4-tab dashboard with language tabs)
- ✅ Supabase-native architecture (REST API all endpoints)
- ✅ Prisma removed - pure Supabase migrations
- ✅ Complete REST API migration:
  - Respondent creation with auto-generated code
  - Session create/read/update with progress tracking
  - MPPI item response save with auto-transition at item 118
  - GAD-7 response save with auto-scoring on impairment
  - Auto-completion to RESULTS phase on final score
- ✅ Static admin authentication (env var credentials + session cookies)
- ✅ Premium theme system (4 color variants, persistent)
- ✅ Assessment setup with scrollable form (sticky header/footer)
- ✅ Multilingual modals (EN/HI/MR for questions)
- ✅ Full end-to-end flow verified (respondent → session → items → GAD-7 → results)
- ✅ Vercel deployment (production URL working)

### In Progress / TODO (V1.2+)
- 🚧 Respondent registration UI (demographics collection flow - form built, flow needs wiring)
- 🚧 Results display page (fetch SessionResult, show Prakriti + GAD-7)
- ⬜ Multi-language UI labels (currently: EN only, questions: EN/HI/MR)
- ⬜ Bulk item import (CSV/Excel)
- ⬜ Recommendations engine (prakriti-based lifestyle advice)
- ⬜ Statistical analysis module (ANOVA, correlation testing)
- ⬜ Mobile native app (iOS/Android)
- ⬜ Real-time sync across devices
- ⬜ Video interview integration
- ⬜ Hospital EMR integration

### Performance Notes

- For 10k+ sessions, add indexes on:
  - `session(respondent_id, created_at)`
  - `session(practitioner_id, status)`
  - `item_response(session_id, item_number)`
- Consider caching subtype config in-memory
- Paginate admin session list (currently no pagination)

## Development Workflow

### Adding a New Feature

1. **Plan:** Sketch scope (data model changes? API additions? UI changes?)
2. **Database:** Update Supabase schema via SQL editor (no Prisma needed)
3. **API:** Add routes in `/app/api/` using `getSupabaseClient()` from `lib/supabase.ts`
4. **Frontend:** Add components + pages in `/app/`
5. **Test:** Manual flow test (login → assess → results)
6. **Commit:** Descriptive message with "Co-Authored-By" footer
7. **Deploy:** Push to GitHub → Vercel auto-deploys (no manual build needed)

### Changing the Scoring Algorithm

⚠️ **High-impact change.** Affects all future + past sessions.

1. Update `lib/scoring.ts`
2. Document why (research finding? bug fix? methodology change?)
3. Consider: recalculate past sessions? Versioned scores?
4. Coordinate with research team before deploying

### Adding a New Language

1. Add translation columns to Supabase `Item` table (if not already present)
   - `core_probe_XX`, `probe1_question_XX`, `probe1_score_0_XX`, etc.
2. Add translation fonts to Tailwind (if needed)
   - Example: `Noto Sans Devanagari` for Hindi/Marathi
3. Update admin panel item edit form (add language selection dropdowns)
4. Populate translations via admin dashboard
5. Frontend: Update question display logic to fallback to EN if translation missing

## Current Deployment Status

**Production URL:** https://ayurveda-mental-health.vercel.app

✅ **Verified Working:**
- Health endpoint: `/api/health` → 125 items, 3 sessions
- Items API: `/api/admin/items` → returns all 125 MPPI items
- GAD-7 API: `/api/admin/gad7-items` → returns 7 items
- Admin login: `/admin/login` (credentials: ADMIN_USERNAME + ADMIN_PASSWORD env vars)
- Admin dashboard: `/admin/manage` (4 tabs: MPPI, GAD-7, Reports, Settings)
- Theme system: All pages using CSS variables (4 themes available)

**Environment Variables (Vercel):**
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- ✅ ADMIN_USERNAME
- ✅ ADMIN_PASSWORD

**Recent Fixes:**
- Fixed Supabase client lazy initialization (prevents build-time errors)
- Migrated `/api/health`, `/api/admin/items`, `/api/admin/gad7-items` to REST API
- Deployment successful with 0 errors

## Production Checklist

Pre-launch to practitioners:

- [x] Database backend (Supabase PostgreSQL + REST API)
- [x] Admin authentication (static credentials in env vars)
- [x] All 118 MPPI items populated
- [x] 7 GAD-7 items populated
- [x] Health endpoint verified (items + sessions querying)
- [ ] Google Sheets credentials tested
- [ ] Demo sessions completed + results verified
- [ ] Practitioners trained on system
- [ ] Troubleshooting doc shared
- [ ] Error logging configured (e.g., Sentry)
- [ ] Complete REST API migration (respondents, sessions routes)

## References

- **Scoring logic:** `lib/scoring.ts` (item-subtype map + algorithm)
- **Data schema:** `prisma/schema.prisma`
- **Assessment UX:** `components/AssessmentInterface.tsx`, `components/GAD7Interface.tsx`
- **Endpoints:** `/app/api/`
- **Styling:** `tailwind.config.js`, `app/globals.css`

---

**Last Updated:** [Deployment date]
**Maintained By:** [Team name]
