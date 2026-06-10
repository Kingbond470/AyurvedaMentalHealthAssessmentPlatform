# Language Localization - Technical Requirements

## Overview

**Goal:** Enable full multilingual assessment (EN/HI/MR) with graceful EN fallback for missing translations.

**Strategy:** Ship with English complete. Add Hindi/Marathi incrementally without code changes or feature gates.

---

## Database Schema Changes

### Item Table - Nullable Language Fields

```sql
-- Core fields (REQUIRED)
itemNumber INT UNIQUE
section INT
predictorSanskrit VARCHAR NOT NULL
predictorDevanagari VARCHAR NOT NULL

-- Multilingual fields (OPTIONAL - fallback to EN if NULL)
coreProbeEn VARCHAR NOT NULL
coreProbeHi VARCHAR NULL  -- If NULL, show coreProbeEn
coreProbeMr VARCHAR NULL  -- If NULL, show coreProbeEn

probe1QuestionEn VARCHAR NOT NULL
probe1QuestionHi VARCHAR NULL
probe1QuestionMr VARCHAR NULL

probe2QuestionEn VARCHAR NOT NULL
probe2QuestionHi VARCHAR NULL
probe2QuestionMr VARCHAR NULL

probe3QuestionEn VARCHAR NOT NULL
probe3QuestionHi VARCHAR NULL
probe3QuestionMr VARCHAR NULL

-- Scoring interpretation labels (OPTIONAL)
probe1Score0En VARCHAR NOT NULL
probe1Score0Hi VARCHAR NULL
probe1Score0Mr VARCHAR NULL
probe1Score1En VARCHAR NOT NULL
probe1Score1Hi VARCHAR NULL
probe1Score1Mr VARCHAR NULL
probe1Score2En VARCHAR NOT NULL
probe1Score2Hi VARCHAR NULL
probe1Score2Mr VARCHAR NULL
probe1Score3En VARCHAR NOT NULL
probe1Score3Hi VARCHAR NULL
probe1Score3Mr VARCHAR NULL
probe1Score4En VARCHAR NOT NULL
probe1Score4Hi VARCHAR NULL
probe1Score4Mr VARCHAR NULL

-- Same pattern for probe2 and probe3
probe2Score0En/Hi/Mr VARCHAR
probe2Score1En/Hi/Mr VARCHAR
probe2Score2En/Hi/Mr VARCHAR
probe2Score3En/Hi/Mr VARCHAR
probe2Score4En/Hi/Mr VARCHAR

probe3Score0En/Hi/Mr VARCHAR
probe3Score1En/Hi/Mr VARCHAR
probe3Score2En/Hi/Mr VARCHAR
probe3Score3En/Hi/Mr VARCHAR
probe3Score4En/Hi/Mr VARCHAR
```

### GAD-7 Questions & Options

**Option 1: Store in Item table (items 119-125)**
```sql
-- For GAD-7 items (119-125)
questionEn VARCHAR NOT NULL
questionHi VARCHAR NULL
questionMr VARCHAR NULL

-- Options are simple: 0-3 scale
option0LabelEn VARCHAR ("Not at all")
option0LabelHi VARCHAR NULL
option0LabelMr VARCHAR NULL
option1LabelEn VARCHAR ("Several days")
option1LabelHi VARCHAR NULL
option1LabelMr VARCHAR NULL
option2LabelEn VARCHAR ("More than half the days")
option2LabelHi VARCHAR NULL
option2LabelMr VARCHAR NULL
option3LabelEn VARCHAR ("Nearly every day")
option3LabelHi VARCHAR NULL
option3LabelMr VARCHAR NULL
```

**Option 2: Separate GAD7Item table**
```sql
CREATE TABLE gad7_item (
  id INT PRIMARY KEY
  itemNumber INT (1-7)
  questionEn VARCHAR NOT NULL
  questionHi VARCHAR NULL
  questionMr VARCHAR NULL
  option0LabelEn VARCHAR NOT NULL
  option0LabelHi VARCHAR NULL
  option0LabelMr VARCHAR NULL
  option1LabelEn VARCHAR NOT NULL
  option1LabelHi VARCHAR NULL
  option1LabelMr VARCHAR NULL
  option2LabelEn VARCHAR NOT NULL
  option2LabelHi VARCHAR NULL
  option2LabelMr VARCHAR NULL
  option3LabelEn VARCHAR NOT NULL
  option3LabelHi VARCHAR NULL
  option3LabelMr VARCHAR NULL
)
```

---

## Frontend Implementation

### 1. Localization Helper Function

```typescript
// lib/localization.ts
export function getLocalizedField(
  item: any,
  fieldName: string,
  language: 'EN' | 'HI' | 'MR'
): string {
  // Try requested language first
  const localizedField = item[`${fieldName}${language}`]

  // If found and not empty, use it
  if (localizedField) {
    return localizedField
  }

  // Fallback to English
  return item[`${fieldName}En`]
}

// Usage
const coreProbe = getLocalizedField(item, 'coreProbe', userLanguage)
const probe1Question = getLocalizedField(item, 'probe1Question', userLanguage)
const probe1Score0Label = getLocalizedField(item, 'probe1Score0', userLanguage)
```

### 2. AssessmentInterface.tsx Updates

```typescript
// Replace hardcoded EN with localized
const coreProbe = getLocalizedField(item, 'coreProbe', sessionLanguage)
const probe1Q = getLocalizedField(item, 'probe1Question', sessionLanguage)
const probe1Score0 = getLocalizedField(item, 'probe1Score0', sessionLanguage)
// ... for all 3 probes, all 5 scores

// In JSX
<p className="font-body text-text-primary italic">
  {coreProbe}
</p>

// Scoring chips
{[0, 1, 2, 3, 4].map((s) => (
  <button key={s}>
    <div>{s}</div>
    <div className="text-xs">{getLocalizedField(item, `probe${probeNum}Score${s}`, sessionLanguage)}</div>
  </button>
))}
```

### 3. GAD7Interface.tsx Updates

```typescript
// Get language from session store
const { gad7Responses, setGAD7Response, setGAD7Impairment } = useSessionStore()
const { sessionLanguage } = useSessionStore()  // Add to store

// Fetch GAD-7 items with language support
const gad7Items = await axios.get(`/api/admin/gad7-items`)

const currentGAD7Item = gad7Items[currentItemIndex]
const question = getLocalizedField(currentGAD7Item, 'question', sessionLanguage)
const options = [
  getLocalizedField(currentGAD7Item, 'option0Label', sessionLanguage),
  getLocalizedField(currentGAD7Item, 'option1Label', sessionLanguage),
  getLocalizedField(currentGAD7Item, 'option2Label', sessionLanguage),
  getLocalizedField(currentGAD7Item, 'option3Label', sessionLanguage),
]

// In JSX
<h2>{question}</h2>
{options.map((label, idx) => (
  <button key={idx}>{label}</button>
))}
```

### 4. Results Page Localization

```typescript
// lib/constants/prakriti.ts
export const PRAKRITI_NAMES = {
  EN: {
    BRAMHA: 'Bramha Sattva',
    ARSHA: 'Arsha Sattva',
    AINDRA: 'Aindra Sattva',
    // ... all 16 subtypes in English
  },
  HI: {
    BRAMHA: 'ब्रह्मा सत्त्व',
    ARSHA: 'ऋषि सत्त्व',
    AINDRA: 'इंद्र सत्त्व',
    // ... all 16 subtypes in Hindi (to be filled in)
  },
  MR: {
    BRAMHA: 'ब्रह्मा सत्त्व',
    ARSHA: 'ऋषि सत्त्व',
    AINDRA: 'इंद्र सत्त्व',
    // ... all 16 subtypes in Marathi (to be filled in)
  },
}

export const GAD7_SEVERITY = {
  EN: {
    MINIMAL: 'Minimal Anxiety',
    MILD: 'Mild Anxiety',
    MODERATE: 'Moderate Anxiety',
    SEVERE: 'Severe Anxiety',
  },
  HI: {
    MINIMAL: 'न्यूनतम चिंता',
    MILD: 'हल्की चिंता',
    MODERATE: 'मध्यम चिंता',
    SEVERE: 'गंभीर चिंता',
  },
  MR: {
    MINIMAL: 'न्यूनतम चिंता',
    MILD: 'हल्की चिंता',
    MODERATE: 'मध्यम चिंता',
    SEVERE: 'गंभीर चिंता',
  },
}

export function getLocalizedName(name: string, language: 'EN' | 'HI' | 'MR', category: 'prakriti' | 'severity'): string {
  const dict = category === 'prakriti' ? PRAKRITI_NAMES : GAD7_SEVERITY
  return dict[language][name] || dict['EN'][name]
}
```

### 5. Results Page Component

```typescript
// pages/results/[sessionId]/page.tsx
const result = await fetchSessionResult(sessionId)
const { sessionLanguage } = useSessionStore()

// Prakriti name
const predominantName = getLocalizedName(
  result.predominantPrakriti,
  sessionLanguage,
  'prakriti'
)

// GAD-7 severity
const severityLabel = getLocalizedName(
  result.gad7Severity,
  sessionLanguage,
  'severity'
)

// In JSX
<h1>{predominantName}</h1>
<p>{severityLabel}</p>
```

### 6. PDF Report Localization

```typescript
// Use same getLocalizedName and getLocalizedField functions
// in PDF generation to respect user's selected language
```

---

## Zustand Store Update

```typescript
// lib/store.ts
interface SessionStore {
  sessionLanguage: 'EN' | 'HI' | 'MR'
  setSessionLanguage: (lang: 'EN' | 'HI' | 'MR') => void
  // ... existing fields
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionLanguage: 'EN',
  setSessionLanguage: (lang) => set({ sessionLanguage: lang }),
  // ...
}))
```

---

## API Endpoints

### GET /api/admin/gad7-items

```json
{
  "items": [
    {
      "itemNumber": 1,
      "questionEn": "Over the last 2 weeks, how often...",
      "questionHi": null,  // To be filled in
      "questionMr": null,  // To be filled in
      "option0LabelEn": "Not at all",
      "option0LabelHi": null,
      "option0LabelMr": null,
      "option1LabelEn": "Several days",
      "option1LabelHi": null,
      "option1LabelMr": null,
      // ... etc
    }
  ]
}
```

---

## Migration Plan

### Phase 1: Ship Now (EN Only)
- ✅ All EN fields populated
- ✅ HI/MR fields NULLABLE
- ✅ Localization helpers in place
- ✅ Frontend uses getLocalizedField (defaults to EN)
- ✅ No feature gates
- ✅ User sees English (acceptable UX)

### Phase 2: Add Hindi (Week 2)
- [ ] Fill in coreProbeHi, probe*QuestionHi for all items
- [ ] Fill in probe*Score*Hi labels
- [ ] Fill in gad7 questionHi + optionHi
- [ ] Fill in PRAKRITI_NAMES[HI] and GAD7_SEVERITY[HI]
- [ ] Zero code changes - data fills in automatically

### Phase 3: Add Marathi (Week 3)
- [ ] Same as Phase 2, but for MR language
- [ ] Zero code changes - data fills in automatically

---

## Fallback Behavior

**If user selects HI but HI field is NULL:**
```
User selects: HI
coreProbe HI is NULL
→ Silently show coreProbe EN
User never knows or sees blank section
```

**Testing**
```
✅ Select EN → all EN shown
✅ Select HI → HI where available, EN fallback elsewhere
✅ Select MR → MR where available, EN fallback elsewhere
✅ No blank fields ever visible
✅ No "Coming Soon" messages
✅ No error logs
```

---

## Files to Modify

- [ ] `prisma/schema.prisma` - Add HI/MR nullable fields
- [ ] `lib/localization.ts` - Create helper functions
- [ ] `lib/constants/prakriti.ts` - Language mappings
- [ ] `components/AssessmentInterface.tsx` - Use getLocalizedField
- [ ] `components/GAD7Interface.tsx` - Use getLocalizedField
- [ ] `app/results/[sessionId]/page.tsx` - Use getLocalizedName
- [ ] `app/results/[sessionId]/report/page.tsx` - Use localization
- [ ] `lib/store.ts` - Add sessionLanguage to Zustand
- [ ] `app/assessment/setup/page.tsx` - Populate sessionLanguage on registration

---

## Summary

**Key Principle:** Better to ship English complete + graceful fallback than to gate Hindi/Marathi behind "Coming Soon".

**User Experience:**
- English speaker: All EN
- Hindi speaker: Hindi where available, EN otherwise (acceptable)
- Marathi speaker: Marathi where available, EN otherwise (acceptable)

**Developer Experience:**
- No conditional rendering logic
- Simple nullable fields
- Fallback is silent + graceful
- Add translations without code changes

---

**Estimated TL effort:** 4-6 hours for Phase 1 setup + helper functions. Phase 2-3 are data entry only (no code).
