# MPPI Item Import Guide

Items are managed via the **Admin Panel** at `/admin/manage` → MPPI Items tab.

## Option A: Manual Entry (Recommended for small batches)

1. Login: `/admin/login`
2. Go to **MPPI Items** tab
3. Click **View** on any item
4. Click **Edit**
5. Fill in all fields across EN / HI / MR language tabs:
   - Predictor Sanskrit + Devanagari + Interpretation
   - Core Probe (read aloud, not scored)
   - Probe 1 / 2 / 3 questions + score labels (0–4)
   - Mapped Subtypes (select from 16 options)
   - Section 14 gender variant (if applicable)
   - Observer-rated flag (Section 16 only)
6. Click **Save**

## Option B: Seed Script (initial structure only)

Seeds all 118 item rows with placeholder content (no real questions):

```bash
npm run seed:items
```

Then populate real content via Option A above.

## Option C: Batch JSON via scripts/push-migrations.js (advanced)

Batch JSON files are stored in `scripts/section*-batch.json`. Format:

```json
[
  {
    "itemNumber": 1,
    "section": 1,
    "predictorSanskrit": "Name (Sanskrit)",
    "predictorDevanagari": "देवनागरी",
    "interpretation": "What this trait measures",
    "coreProbeEn": "Question to read aloud",
    "coreProbeHi": "प्रश्न हिंदी में",
    "coreProbeMr": "प्रश्न मराठीत",
    "probe1QuestionEn": "First follow-up question",
    "probe1Score0En": "Never / Not at all",
    "probe1Score1En": "Rarely",
    "probe1Score2En": "Sometimes",
    "probe1Score3En": "Often",
    "probe1Score4En": "Always / Completely",
    "probe2QuestionEn": "...",
    "probe2Score0En": "...",
    "probe3QuestionEn": "...",
    "probe3Score0En": "...",
    "mappedSubtypes": ["BRAMHA", "ARSHA"],
    "isObserverRated": false
  }
]
```

Apply via Supabase REST API using the admin items endpoint:

```bash
# POST each item to admin API
curl -X POST https://your-domain.vercel.app/api/admin/items \
  -H "Content-Type: application/json" \
  -d @scripts/section1-batch.json
```

## Subtype Reference

16 subtypes across 3 categories:

| Category | Subtypes |
|----------|----------|
| Sattvika | BRAMHA, ARSHA, AINDRA, YAAMYA, VARUNA, KAUBERA, GANDHARVA |
| Rajasika | ASURA, RAKSHAS, PAISHACH, SARPA, PRETA, SHAKUNA |
| Tamasika | PASHAVA, MATSYA, VANASPATYA |

Special cases:
- `isObserverRated: true` — Section 16 items only
- Item 9 is **reverse-scored** for PRETA subtype (handled in scoring engine, not item data)
- Section 14 items have gender variants (`section14_gender_variant: "male" | "female"`)

## Verify

After importing:
- Admin → MPPI Items — should show 118 items grouped by section
- Language tab toggle verifies EN/HI/MR content loaded
- Run assessment flow end-to-end to confirm items display correctly
