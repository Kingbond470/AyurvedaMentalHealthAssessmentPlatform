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

### JWT Pattern

```typescript
// Login
POST /api/auth/login
  → verify email + password
  → generate accessToken (exp: 7d) + refreshToken (exp: 30d)
  → return both tokens

// Protected routes
Authorization: Bearer <accessToken>
  → verifyToken() extracts payload (userId, email, role)
  → middleware checks role (PRACTITIONER | ADMIN)

// Token refresh
POST /api/auth/refresh
  → validate refreshToken
  → issue new accessToken
```

### Why Not OAuth?

- OAuth adds complexity (Google/Apple login setup)
- For research platform, simple email/password sufficient
- Admin creates accounts (no self-registration)
- Single org, not multi-tenant

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

## Known Limitations & TODOs

### Current (V1)
- ✅ Core assessment + scoring
- ✅ PDF reports
- ✅ Google Sheets export
- ✅ Admin item management

### Missing (V2 candidates)
- ⬜ Bulk item import (CSV/Excel)
- ⬜ Recommendations engine (prakriti-based lifestyle advice)
- ⬜ Statistical analysis module (ANOVA, correlation testing)
- ⬜ Multi-language UI labels (currently: EN only, questions: EN/HI/MR)
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
2. **Database:** Update `prisma/schema.prisma` if needed → `npm run prisma:migrate`
3. **API:** Add routes in `/api/`
4. **Frontend:** Add components + pages in `/app/`
5. **Test:** Manual flow test (login → assess → results)
6. **Commit:** Descriptive message with "Co-Authored-By" footer

### Changing the Scoring Algorithm

⚠️ **High-impact change.** Affects all future + past sessions.

1. Update `lib/scoring.ts`
2. Document why (research finding? bug fix? methodology change?)
3. Consider: recalculate past sessions? Versioned scores?
4. Coordinate with research team before deploying

### Adding a New Language

1. Add language code to `Language` enum in `prisma/schema.prisma`
2. Update Item schema: add `probe1QuestionXX`, `probe1Score0XX`, etc. for each probe
3. Add translation fonts to Tailwind (if needed)
4. Admin panel: add language selection to item edit form
5. Update i18next config (if using)

## Production Checklist

Before launching to practitioners:

- [ ] JWT_SECRET changed from dev value
- [ ] Database backed up
- [ ] Google Sheets credentials tested
- [ ] All 118 items populated with content
- [ ] Demo sessions completed + results verified
- [ ] Practitioners trained on system
- [ ] Troubleshooting doc shared
- [ ] Error logging configured (e.g., Sentry)
- [ ] Database connection pooling configured (for high load)

## References

- **Scoring logic:** `lib/scoring.ts` (item-subtype map + algorithm)
- **Data schema:** `prisma/schema.prisma`
- **Assessment UX:** `components/AssessmentInterface.tsx`, `components/GAD7Interface.tsx`
- **Endpoints:** `/app/api/`
- **Styling:** `tailwind.config.js`, `app/globals.css`

---

**Last Updated:** [Deployment date]
**Maintained By:** [Team name]
