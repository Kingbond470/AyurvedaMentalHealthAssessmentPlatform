# Seeding MPPI Items

## Overview
Seeds the `item` table with all 118 MPPI items + 7 GAD-7 items into Supabase.

## Prerequisites
- Supabase project created and configured
- Environment variables set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Usage

### 1. Seed MPPI Items (118 items)
```bash
npm run seed:items
```

This will:
- Create 118 items (item numbers 1-118)
- Assign to correct sections (1-16)
- Set observer-rated flag for Section 16
- Mark item 9 as reverse-scored
- Map subtypes for each item
- Insert English question content

### 2. Add Translations (Optional)
After seeding, add Hindi (HI) and Marathi (MR) translations:
- Use Admin panel Item Editor
- Edit each item and add translations for:
  - `core_probe_hi`, `core_probe_mr`
  - `probe1_question_hi`, `probe1_question_mr`
  - All score labels: `probe1_score0_hi`, etc.

### 3. Verify Data
Check Admin panel → MPPI Items (118):
- Should show all 118 items grouped by section
- Toggle language filter to verify translations

## Data Structure

Each item includes:
```
{
  item_number: 1-118,
  section: 1-16,
  section_name: "...",
  predictor_sanskrit: "...",
  predictor_devanagari: "...",
  interpretation: "...",
  core_probe_en: "...",
  probe1_question_en: "...",
  probe1_score0_en through probe1_score4_en,
  probe2_question_en: "...",
  probe2_score0_en through probe2_score4_en,
  probe3_question_en: "...",
  probe3_score0_en through probe3_score4_en,
  mapped_subtypes: ["BRAMHA", "YAAMYA", ...],
  is_observer_rated: boolean,
  reverse_scored: boolean,
}
```

## Notes

- Seed is idempotent if items don't exist (will fail if duplicates)
- Predictor names and questions are placeholders - update with actual content
- Subtype mappings use defaults - verify against MPPI documentation
- Only English content is seeded initially
- CSV export is for respondent assessment data, not item import

## Next Steps

1. ✅ Run seed script
2. ⬜ Add actual question content (if using placeholders)
3. ⬜ Add HI/MR translations via admin editor
4. ⬜ Verify subtype mappings against assessment documentation
5. ⬜ Test assessment flow with populated items
