# Registration Flow - Technical Requirements

## Overview

**Goal:** Simplified, streamlined registration with mandatory demographics and auto-generated respondent codes.

---

## Form Fields (Mandatory)

### Respondent Demographics (Required)
- **Name** - Full name of respondent
- **Age** - Numeric age (required for assessment)
- **Gender** - MALE / FEMALE / OTHER
- **Education** - Primary / Secondary / Graduate / Postgraduate / Doctoral / Other
- **Occupation** - Text field (job title/role)
- **Phone** - Contact number
- **City** - City of residence
- **State** - State of residence

### Practitioner Info
- **Practitioner Name** - Name of conducting practitioner

### Assessment Selection
- **Language** - EN / HI / MR (determines all UI text during assessment)

---

## Respondent Code - Auto-Generation

**DO NOT ask user for Respondent Code.**

Generate automatically:
```typescript
const respondentCode = `RESP-${Date.now()}`
// Example: RESP-1717855200000

// Alternative: UUID-based
const respondentCode = `RESP-${crypto.randomUUID()}`
// Example: RESP-550e8400-e29b-41d4-a716-446655440000
```

**Why:** 
- Zero friction (user doesn't need to remember/understand it)
- Unique by default (timestamp or UUID)
- Works for offline-first scenarios
- Respondent doesn't need to know it

---

## Backend Changes

### POST /api/respondents

```typescript
// Input validation - ALL fields required
{
  respondentCode: string,        // AUTO-GENERATED (not from user input)
  name: string,                  // REQUIRED
  age: number,                   // REQUIRED
  gender: 'MALE' | 'FEMALE' | 'OTHER',  // REQUIRED
  education: string,             // REQUIRED
  occupation: string,            // REQUIRED
  phone: string,                 // REQUIRED
  city: string,                  // REQUIRED
  state: string,                 // REQUIRED
  country?: string,              // OPTIONAL (can default)
  language: 'EN' | 'HI' | 'MR',  // REQUIRED
}

// If any required field is missing → 400 Bad Request
// If valid → create Respondent + return respondentCode
```

### POST /api/sessions

```typescript
// Input
{
  respondentCode: string,        // Just the code
  practitionerName: string,      // Practitioner name
  // NO language field - use respondent's language preference
}

// Output
{
  sessionId: string,
  respondentId: string,
  respondentCode: string,
  practitionerName: string,
  status: 'IN_PROGRESS',
  phase: 'MPPI',
  currentItem: 1,
  respondentLanguage: 'EN' | 'HI' | 'MR',  // From respondent
}
```

---

## Frontend Changes

### app/assessment/setup/page.tsx

**Remove:**
```typescript
// DELETE: Respondent Code input field
// Users don't enter or see it
```

**Keep (Mandatory):**
```typescript
<Input label="Practitioner Name" required />
<Input label="Name" required />
<NumberInput label="Age" required />
<Select label="Gender" options={['MALE', 'FEMALE', 'OTHER']} required />
<Select label="Education" options={[...]} required />
<Input label="Occupation" required />
<Input label="Phone" required />
<Input label="City" required />
<Input label="State" required />
<Input label="Country" optional />
<RadioGroup label="Language" options={['EN', 'HI', 'MR']} required />
```

**Session Setup:**
```typescript
const handleSubmit = async () => {
  // Validate all required fields
  if (!practitionerName || !name || !age || !gender || !education || !occupation || !phone || !city || !state || !language) {
    setError('All fields are required')
    return
  }

  // 1. Create Respondent with AUTO-GENERATED code
  const respondentRes = await axios.post('/api/respondents', {
    respondentCode: `RESP-${Date.now()}`,  // AUTO-GENERATE HERE
    name,
    age: parseInt(age),
    gender,
    education,
    occupation,
    phone,
    city,
    state,
    language,
  })

  // 2. Create Session
  const sessionRes = await axios.post('/api/sessions', {
    respondentCode: respondentRes.data.respondentCode,
    practitionerName,
  })

  // 3. Store session info + language in Zustand
  setSessionId(sessionRes.data.sessionId)
  setSessionLanguage(language)  // NEW: store for assessment

  // 4. Redirect to assessment
  router.push(`/assessment/${sessionRes.data.sessionId}`)
}
```

---

## Zustand Store

```typescript
interface SessionStore {
  sessionId: string | null
  respondentCode: string | null
  sessionLanguage: 'EN' | 'HI' | 'MR'  // NEW
  
  setSessionId: (id: string) => void
  setRespondentCode: (code: string) => void
  setSessionLanguage: (lang: 'EN' | 'HI' | 'MR') => void  // NEW
  
  // ... existing fields
}
```

---

## Validation Rules

| Field | Type | Rules | Error Message |
|-------|------|-------|----------------|
| Name | Text | Required, 1-100 chars | "Name is required" |
| Age | Number | Required, 1-120 | "Age must be 1-120" |
| Gender | Select | Required (MALE/FEMALE/OTHER) | "Gender is required" |
| Education | Select | Required | "Education is required" |
| Occupation | Text | Required, 1-100 chars | "Occupation is required" |
| Phone | Text | Required, valid format | "Phone is required" |
| City | Text | Required, 1-50 chars | "City is required" |
| State | Text | Required, 1-50 chars | "State is required" |
| Language | Radio | Required (EN/HI/MR) | "Language is required" |

---

## User Flow

```
1. User clicks "New Assessment"
   ↓
2. Registration Form appears
   ├─ Practitioner Name: "Dr. Sharma"
   ├─ Name: "Raj Kumar"
   ├─ Age: 35
   ├─ Gender: MALE
   ├─ Education: Graduate
   ├─ Occupation: Software Engineer
   ├─ Phone: +91-9999999999
   ├─ City: Delhi
   ├─ State: Delhi
   └─ Language: HI (selected)
   ↓
3. User clicks "Begin Assessment"
   ↓
4. Backend generates: respondentCode = "RESP-1717855200000"
   ↓
5. Session created with:
   ├─ respondentCode = RESP-1717855200000
   ├─ sessionLanguage = HI
   └─ phase = MPPI, currentItem = 1
   ↓
6. Assessment starts (all questions in HI)
   ├─ MPPI Item 1: "कोर प्रश्न हिंदी में" (if available, else English)
   └─ Probes: हिंदी में (if available, else English)
```

---

## What Changed vs Before

| Aspect | Before | After | Benefit |
|--------|--------|-------|---------|
| Respondent Code | User enters manually | Auto-generated | No friction, always unique |
| Required Fields | 9 optional, 3 required | 8 required, 1 optional | Clear expectations |
| Form Steps | 2 steps (setup + config) | 1 step (merged) | Faster registration |
| Language Effect | Selected but ignored | Used for all assessment text | Actually useful |
| Demographics | Optional | Required | Better data quality |

---

## Files to Modify

- [ ] `app/assessment/setup/page.tsx` - Remove respondent code field, auto-generate
- [ ] `app/api/respondents/route.ts` - Validate all required fields
- [ ] `app/api/sessions/route.ts` - Initialize phase + currentItem
- [ ] `lib/store.ts` - Add sessionLanguage to Zustand
- [ ] `supabase/migrations` - Ensure language field on respondent table
- [ ] Validation schema - Update to require all demographic fields

---

## Summary

**Key Changes:**
1. Remove Respondent Code from UI → auto-generate
2. Keep all demographics mandatory → better data
3. Language selection actually affects assessment → no UX theater

**User Impact:**
- Registration faster (less cognitive load)
- Assessment in their language (all text respects selection)
- Better data quality (demographics required)

**Dev Effort:** ~2 hours to implement Phase 1 (EN complete), Phase 2-3 are data entry only
