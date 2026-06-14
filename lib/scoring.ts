// Item to Subtype Mapping - from PRD Appendix
export const ITEM_SUBTYPE_MAP: Record<number, string[]> = {
  1: ['AINDRA'],
  2: ['KAUBERA', 'GANDHARVA'],
  3: ['VARUNA', 'MATSYA'],
  4: ['VARUNA'],
  5: ['GANDHARVA'],
  6: ['GANDHARVA'],
  7: ['KAUBERA'],
  8: ['KAUBERA'],
  9: ['BRAMHA', 'PRETA'],
  10: ['BRAMHA'],
  11: ['BRAMHA', 'ARSHA'],
  12: ['AINDRA'],
  13: ['BRAMHA'],
  14: ['YAAMYA'],
  15: ['KAUBERA'],
  16: ['GANDHARVA', 'RAKSHAS', 'PRETA', 'ASURA'],
  17: ['MATSYA'],
  18: ['VANASPATYA'],
  19: ['BRAMHA', 'YAAMYA'],
  20: ['ARSHA'],
  21: ['ARSHA'],
  22: ['BRAMHA', 'ARSHA'],
  23: ['AINDRA', 'SHAKUNA'],
  24: ['BRAMHA', 'ARSHA'],
  25: ['AINDRA'],
  26: ['AINDRA'],
  27: ['YAAMYA'],
  28: ['AINDRA'],
  29: ['GANDHARVA'],
  30: ['AINDRA', 'VARUNA', 'ASURA'],
  31: ['VARUNA'],
  32: ['YAAMYA'],
  33: ['YAAMYA'],
  34: ['AINDRA'],
  35: ['KAUBERA'],
  36: ['YAAMYA'],
  37: ['VARUNA', 'KAUBERA'],
  38: ['VANASPATYA'],
  39: ['AINDRA', 'ASURA'],
  40: ['AINDRA', 'VARUNA'],
  41: ['KAUBERA'],
  42: ['BRAMHA'],
  43: ['BRAMHA'],
  44: ['BRAMHA', 'AINDRA', 'VARUNA'],
  45: ['AINDRA', 'KAUBERA', 'VANASPATYA'],
  46: ['BRAMHA', 'ARSHA'],
  47: ['BRAMHA', 'YAAMYA', 'KAUBERA'],
  48: ['VARUNA'],
  49: ['BRAMHA'],
  50: ['AINDRA', 'VARUNA'],
  51: ['VARUNA'],
  52: ['YAAMYA'],
  53: ['BRAMHA'],
  54: ['KAUBERA'],
  55: ['VARUNA'],
  56: ['YAAMYA'],
  57: ['BRAMHA', 'ARSHA', 'YAAMYA'],
  58: ['PAISHACH', 'SHAKUNA', 'MATSYA'],
  59: ['SARPA'],
  60: ['SARPA'],
  61: ['SARPA'],
  62: ['PAISHACH', 'SHAKUNA'],
  63: ['PASHAVA'],
  64: ['SHAKUNA', 'MATSYA'],
  65: ['SHAKUNA', 'PASHAVA'],
  66: ['MATSYA'],
  67: ['VANASPATYA'],
  68: ['PASHAVA'],
  69: ['ASURA'],
  70: ['PRETA'],
  71: ['PAISHACH'],
  72: ['RAKSHAS'],
  73: ['VANASPATYA'],
  74: ['SHAKUNA'],
  75: ['ASURA', 'SARPA'],
  76: ['ASURA', 'RAKSHAS'],
  77: ['RAKSHAS', 'PAISHACH'],
  78: ['PAISHACH', 'SARPA'],
  79: ['ASURA', 'MATSYA'],
  80: ['PRETA'],
  81: ['RAKSHAS', 'SHAKUNA'],
  82: ['RAKSHAS'],
  83: ['RAKSHAS'],
  84: ['RAKSHAS'],
  85: ['RAKSHAS', 'PRETA', 'SARPA'],
  86: ['RAKSHAS'],
  87: ['PAISHACH'],
  88: ['MATSYA'],
  89: ['MATSYA'],
  90: ['RAKSHAS', 'SARPA', 'PRETA'],
  91: ['VANASPATYA'],
  92: ['RAKSHAS'],
  93: ['SARPA'],
  94: ['ASURA', 'PRETA', 'SHAKUNA', 'VANASPATYA'],
  95: ['RAKSHAS', 'SARPA', 'PAISHACH', 'MATSYA'],
  96: ['PAISHACH', 'SHAKUNA', 'PASHAVA'],
  97: ['RAKSHAS', 'PAISHACH'],
  98: ['ASURA'],
  99: ['PRETA'],
  100: ['PASHAVA'],
  101: ['GANDHARVA', 'PAISHACH', 'SARPA'],
  102: ['PASHAVA', 'SHAKUNA'],
  103: ['PASHAVA'],
  104: ['KAUBERA', 'MATSYA'],
  105: ['RAKSHAS'],
  106: ['ASURA', 'RAKSHAS', 'MATSYA'],
  107: ['ASURA'],
  108: ['MATSYA'],
  109: ['PRETA'],
  // Section 16 - Observer Rated
  110: ['VARUNA'],
  111: ['VARUNA'],
  112: ['PRETA'],
  113: ['PRETA'],
  114: ['AINDRA'],
  115: ['SARPA'],
  116: ['AINDRA'],
  117: ['VARUNA'],
  118: ['PRETA'],
}

// Subtype Configuration
export const SUBTYPE_CONFIG: Record<string, { total_items: number; max_score: number }> = {
  BRAMHA: { total_items: 15, max_score: 180 },
  ARSHA: { total_items: 7, max_score: 84 },
  AINDRA: { total_items: 15, max_score: 180 },
  YAAMYA: { total_items: 12, max_score: 144 },
  VARUNA: { total_items: 14, max_score: 168 },
  KAUBERA: { total_items: 11, max_score: 132 },
  GANDHARVA: { total_items: 7, max_score: 84 },
  ASURA: { total_items: 11, max_score: 132 },
  RAKSHAS: { total_items: 16, max_score: 192 },
  PAISHACH: { total_items: 12, max_score: 144 },
  SARPA: { total_items: 11, max_score: 132 },
  PRETA: { total_items: 13, max_score: 156 },
  SHAKUNA: { total_items: 11, max_score: 132 },
  PASHAVA: { total_items: 7, max_score: 84 },
  MATSYA: { total_items: 12, max_score: 144 },
  VANASPATYA: { total_items: 7, max_score: 84 },
}

// Prakriti Category Mapping
export const PRAKRITI_CATEGORY: Record<string, string> = {
  BRAMHA: 'SATTVIKA',
  ARSHA: 'SATTVIKA',
  AINDRA: 'SATTVIKA',
  YAAMYA: 'SATTVIKA',
  VARUNA: 'SATTVIKA',
  KAUBERA: 'SATTVIKA',
  GANDHARVA: 'SATTVIKA',
  ASURA: 'RAJASIKA',
  RAKSHAS: 'RAJASIKA',
  PAISHACH: 'RAJASIKA',
  SARPA: 'RAJASIKA',
  PRETA: 'RAJASIKA',
  SHAKUNA: 'RAJASIKA',
  PASHAVA: 'TAMASIKA',
  MATSYA: 'TAMASIKA',
  VANASPATYA: 'TAMASIKA',
}

export interface ItemResponseData {
  itemNumber: number
  probe1Score: number
  probe2Score: number
  probe3Score: number
}

export interface SubtypeScore {
  [subtype: string]: number
}

export interface ScoringResult {
  subtypeRawScores: SubtypeScore
  subtypeMaxScores: SubtypeScore
  subtypePercentages: SubtypeScore
  predominantPrakriti: string
  secondaryPrakriti: string
  primaryCategory: string
}

export function calculateItemTotal(
  probe1Score: number,
  probe2Score: number,
  probe3Score: number
): number {
  return probe1Score + probe2Score + probe3Score
}

export interface ItemConfig {
  subtypes: string[]
  reverseScored?: boolean
  isVisible?: boolean
}

export function calculateSubtypeScores(
  itemResponses: ItemResponseData[],
  itemConfigMap?: Record<number, ItemConfig>
): ScoringResult {
  // Initialize raw scores for all subtypes
  const subtypeRawScores: SubtypeScore = {}
  Object.keys(SUBTYPE_CONFIG).forEach((subtype) => {
    subtypeRawScores[subtype] = 0
  })

  // Aggregate item scores by subtype
  itemResponses.forEach((response) => {
    const itemTotal = calculateItemTotal(
      response.probe1Score,
      response.probe2Score,
      response.probe3Score
    )

    // Use DB config when available; fall back to hardcoded ITEM_SUBTYPE_MAP per item
    const dbConfig = itemConfigMap?.[response.itemNumber]
    const mappedSubtypes =
      (dbConfig?.subtypes?.length ? dbConfig.subtypes : null) ??
      ITEM_SUBTYPE_MAP[response.itemNumber] ??
      []

    // Add itemTotal to all mapped subtypes
    mappedSubtypes.forEach((subtype) => {
      subtypeRawScores[subtype] = (subtypeRawScores[subtype] || 0) + itemTotal
    })
  })

  // Compute max scores dynamically from visible items.
  // Uses DB config subtypes when available, falls back to ITEM_SUBTYPE_MAP.
  const subtypeMaxScores: SubtypeScore = {}
  Object.keys(SUBTYPE_CONFIG).forEach((subtype) => { subtypeMaxScores[subtype] = 0 })

  const itemNumbers = Object.keys(ITEM_SUBTYPE_MAP).map(Number)
  itemNumbers.forEach((itemNum) => {
    const dbConfig = itemConfigMap?.[itemNum]
    // Skip hidden items (excluded from scoring)
    if (dbConfig && dbConfig.isVisible === false) return
    const subtypes =
      (dbConfig?.subtypes?.length ? dbConfig.subtypes : null) ??
      ITEM_SUBTYPE_MAP[itemNum] ??
      []
    subtypes.forEach((subtype) => {
      subtypeMaxScores[subtype] = (subtypeMaxScores[subtype] || 0) + 12
    })
  })

  // Calculate percentages
  const subtypePercentages: SubtypeScore = {}
  Object.keys(SUBTYPE_CONFIG).forEach((subtype) => {
    const maxScore = subtypeMaxScores[subtype] || SUBTYPE_CONFIG[subtype].max_score
    subtypePercentages[subtype] =
      maxScore > 0 ? (subtypeRawScores[subtype] / maxScore) * 100 : 0
  })

  // Sort and find predominant and secondary prakriti
  const sortedSubtypes = Object.entries(subtypePercentages)
    .sort(([, a], [, b]) => b - a)
    .map(([subtype]) => subtype)

  const predominantPrakriti = sortedSubtypes[0]
  const secondaryPrakriti = sortedSubtypes[1]
  const primaryCategory = PRAKRITI_CATEGORY[predominantPrakriti]

  return {
    subtypeRawScores,
    subtypeMaxScores,
    subtypePercentages,
    predominantPrakriti,
    secondaryPrakriti,
    primaryCategory,
  }
}

export function calculateGAD7Score(itemScores: number[]): {
  total: number
  severity: 'MINIMAL' | 'MILD' | 'MODERATE' | 'SEVERE'
} {
  const total = itemScores.reduce((sum, score) => sum + score, 0)

  let severity: 'MINIMAL' | 'MILD' | 'MODERATE' | 'SEVERE'
  if (total <= 4) severity = 'MINIMAL'
  else if (total <= 9) severity = 'MILD'
  else if (total <= 14) severity = 'MODERATE'
  else severity = 'SEVERE'

  return { total, severity }
}

export function getPrakritiFullName(subtypeCode: string): string {
  const names: Record<string, string> = {
    BRAMHA: 'Bramha Sattva',
    ARSHA: 'Arsha Sattva',
    AINDRA: 'Aindra Sattva',
    YAAMYA: 'Yaamya Sattva',
    VARUNA: 'Varuna Sattva',
    KAUBERA: 'Kaubera Sattva',
    GANDHARVA: 'Gandharva Sattva',
    ASURA: 'Asura Sattva',
    RAKSHAS: 'Rakshas Sattva',
    PAISHACH: 'Paishach Sattva',
    SARPA: 'Sarpa Sattva',
    PRETA: 'Preta Sattva',
    SHAKUNA: 'Shakuna Sattva',
    PASHAVA: 'Pashava Sattva',
    MATSYA: 'Matsya Sattva',
    VANASPATYA: 'Vanaspatya Sattva',
  }
  return names[subtypeCode] || subtypeCode
}

export const ALL_SUBTYPES = Object.keys(SUBTYPE_CONFIG)
