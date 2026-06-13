# MPPI Item Import Guide

## Format

Provide 20 items as JSON array. Template: `scripts/items-batch-template.json`

Each item structure:
```json
{
  "itemNumber": 1,
  "section": 1,
  "predictorSanskrit": "Name (Sanskrit)",
  "predictorDevanagari": "देवनागरी",
  "interpretation": "What this trait means",
  "coreProbeEn": "Question in English",
  "coreProbeHi": "प्रश्न हिंदी में",
  "coreProbeMr": "प्रश्न मराठीत",
  "probe1QuestionEn": "First follow-up question",
  "probe1QuestionHi": "हिंदी में",
  "probe1QuestionMr": "मराठीत",
  "probe1Score0En": "Score 0 interpretation",
  "probe1Score1En": "Score 1 interpretation",
  "probe1Score2En": "Score 2 interpretation",
  "probe1Score3En": "Score 3 interpretation",
  "probe1Score4En": "Score 4 interpretation",
  "probe2QuestionEn": "Second follow-up question",
  "probe2QuestionHi": "हिंदी में",
  "probe2QuestionMr": "मराठीत",
  "probe2Score0En": "Score 0 interpretation",
  "probe2Score1En": "Score 1 interpretation",
  "probe2Score2En": "Score 2 interpretation",
  "probe2Score3En": "Score 3 interpretation",
  "probe2Score4En": "Score 4 interpretation",
  "probe3QuestionEn": "Third follow-up question",
  "probe3QuestionHi": "हिंदी में",
  "probe3QuestionMr": "मराठीत",
  "probe3Score0En": "Score 0 interpretation",
  "probe3Score1En": "Score 1 interpretation",
  "probe3Score2En": "Score 2 interpretation",
  "probe3Score3En": "Score 3 interpretation",
  "probe3Score4En": "Score 4 interpretation",
  "mappedSubtypes": ["BRAMHA", "ARSHA"],
  "isObserverRated": false
}
```

## Steps

1. **Prepare JSON** - Create file with 20 items (use template above)
2. **Save to** `items-batch-1.json` (or batch-2, batch-3, etc.)
3. **Run import**:
   ```bash
   cat scripts/items-batch-1.json | node scripts/import-mppi-items.js
   ```
4. **Verify** - Check output:
   ```
   ✅ Item 1: Ojaswin (ओजस्विनं)
   ✅ Item 2: ...
   ...
   📊 Results:
     ✅ Success: 20
     ❌ Errors: 0
   
   Total items in DB: 20
   ```

## Notes

- `mappedSubtypes`: Array of subtype codes (16 options):
  - Sattvika: BRAMHA, ARSHA, AINDRA, YAAMYA, VARUNA, KAUBERA, GANDHARVA
  - Rajasika: ASURA, RAKSHAS, PAISHACH, SARPA, PRETA, SHAKUNA
  - Tamasika: PASHAVA, MATSYA, VANASPATYA
  
- `isObserverRated`: true only for Section 16 items
- All 3 language versions required (EN, HI, MR)
- All probe questions + scoring required (3 probes × 5 scores = 15 fields per item)

## Workflow

1. You paste 20 items as JSON
2. I create batch file
3. You run import locally
4. Verify in DB (check `/admin/items` page or Supabase Table Editor)
5. Repeat for next 20 items
