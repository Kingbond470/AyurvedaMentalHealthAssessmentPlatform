#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Section mapping
const SECTION_MAP = {
  1: [1, 8],
  2: [9, 18],
  3: [19, 29],
  4: [30, 38],
  5: [39, 41],
  6: [42, 46],
  7: [47, 52],
  8: [53, 57],
  9: [58, 64],
  10: [65, 68],
  11: [69, 74],
  12: [75, 89],
  13: [90, 100],
  14: [101, 104],
  15: [105, 109],
  16: [110, 118],
}

const SECTION_NAMES = {
  1: 'Lifestyle & Sensory Preferences',
  2: 'Social Harmony & Compassion',
  3: 'Cognitive Strengths, Learning & Intellectual Functioning',
  4: 'Leadership, Courage & Resilience',
  5: 'Prosperity & Material Orientation',
  6: 'Spirituality, Dharma & Values',
  7: 'Morality, Ethics & Self-Discipline',
  8: 'Emotional Regulation & Personality Balance',
  9: 'Fearfulness & Emotional Vulnerability',
  10: 'Reduced Adaptive Cognitive Functioning',
  11: 'Social Withdrawal & Rigidity',
  12: 'Aggression, Hostility & Antisocial Reactivity',
  13: 'Lifestyle Dysregulation & Lethargy',
  14: 'Sexuality & Intimacy',
  15: 'Moral/Spiritual Deviation',
  16: 'Observer-Rated Traits',
}

// Subtype mappings for each item (simplified - adjust based on actual data)
const ITEM_SUBTYPE_MAP = {
  1: ['BRAMHA', 'GANDHARVA'],
  2: ['KAUBERA', 'GANDHARVA'],
  3: ['BRAMHA', 'YAAMYA'],
  4: ['PRETA', 'MRITYU'],
  5: ['ARSHA', 'PISHACHA'],
  // Add mappings for items 6-118 based on actual item definitions
}

function getSection(itemNumber) {
  for (const [section, [start, end]] of Object.entries(SECTION_MAP)) {
    if (itemNumber >= start && itemNumber <= end) {
      return parseInt(section)
    }
  }
  return 1
}

function getSubtypesForItem(itemNumber) {
  return ITEM_SUBTYPE_MAP[itemNumber] || ['BRAMHA'] // Default fallback
}

async function seedMppiItems() {
  console.log('Starting MPPI items seed...\n')

  const items = []

  // Generate 118 MPPI items
  for (let i = 1; i <= 118; i++) {
    const section = getSection(i)
    const subtypes = getSubtypesForItem(i)
    const isObserverRated = section === 16

    items.push({
      item_number: i,
      section: section,
      section_name: SECTION_NAMES[section],
      predictor_sanskrit: `Predictor ${i} (Sanskrit)`,
      predictor_devanagari: `Predictor ${i} (Devanagari)`,
      interpretation: `Interpretation for item ${i}`,
      // Core probe - English only (translations can be added later)
      core_probe_en: `Core probe question for item ${i} - Read this aloud to respondent`,
      // Probe 1
      probe1_question_en: `Follow-up probe 1 for item ${i}?`,
      probe1_score0_en: 'Not at all',
      probe1_score1_en: 'Slightly',
      probe1_score2_en: 'Moderately',
      probe1_score3_en: 'Considerably',
      probe1_score4_en: 'Extremely',
      // Probe 2
      probe2_question_en: `Follow-up probe 2 for item ${i}?`,
      probe2_score0_en: 'Not at all',
      probe2_score1_en: 'Slightly',
      probe2_score2_en: 'Moderately',
      probe2_score3_en: 'Considerably',
      probe2_score4_en: 'Extremely',
      // Probe 3
      probe3_question_en: `Follow-up probe 3 for item ${i}?`,
      probe3_score0_en: 'Not at all',
      probe3_score1_en: 'Slightly',
      probe3_score2_en: 'Moderately',
      probe3_score3_en: 'Considerably',
      probe3_score4_en: 'Extremely',
      mapped_subtypes: subtypes,
      is_observer_rated: isObserverRated,
      reverse_scored: i === 9, // Item 9 is reverse scored (PRETA)
    })
  }

  try {
    console.log(`Inserting ${items.length} MPPI items...`)

    // Insert items in batches to avoid payload size limits
    const BATCH_SIZE = 50
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE)
      const { error } = await supabase.from('item').insert(batch)

      if (error) {
        console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message)
        throw error
      }

      console.log(`✓ Inserted items ${i + 1}-${Math.min(i + BATCH_SIZE, items.length)}`)
    }

    console.log('\n✅ MPPI items seeded successfully!')
    console.log(`Total items inserted: ${items.length}`)
    console.log('\nNext steps:')
    console.log('1. Add question content translations (HI/MR) to each item')
    console.log('2. Verify section groupings and subtype mappings')
    console.log('3. Update interpretation text for each item')
  } catch (error) {
    console.error('❌ Seed failed:', error.message)
    process.exit(1)
  }
}

seedMppiItems()
