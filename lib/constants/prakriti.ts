import { Language } from '@/lib/localization'

export const PRAKRITI_NAMES: Record<Language, Record<string, string>> = {
  EN: {
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
  },
  HI: {
    BRAMHA: 'ब्रह्मा सत्त्व',
    ARSHA: 'ऋषि सत्त्व',
    AINDRA: 'इंद्र सत्त्व',
    YAAMYA: 'यम सत्त्व',
    VARUNA: 'वरुण सत्त्व',
    KAUBERA: 'कुबेर सत्त्व',
    GANDHARVA: 'गंधर्व सत्त्व',
    ASURA: 'असुर सत्त्व',
    RAKSHAS: 'राक्षस सत्त्व',
    PAISHACH: 'पैशाच सत्त्व',
    SARPA: 'सर्प सत्त्व',
    PRETA: 'प्रेत सत्त्व',
    SHAKUNA: 'शकुन सत्त्व',
    PASHAVA: 'पशु सत्त्व',
    MATSYA: 'मत्स्य सत्त्व',
    VANASPATYA: 'वनस्पति सत्त्व',
  },
  MR: {
    BRAMHA: 'ब्रह्मा सत्त्व',
    ARSHA: 'ऋषि सत्त्व',
    AINDRA: 'इंद्र सत्त्व',
    YAAMYA: 'यम सत्त्व',
    VARUNA: 'वरुण सत्त्व',
    KAUBERA: 'कुबेर सत्त्व',
    GANDHARVA: 'गंधर्व सत्त्व',
    ASURA: 'असुर सत्त्व',
    RAKSHAS: 'राक्षस सत्त्व',
    PAISHACH: 'पैशाच सत्त्व',
    SARPA: 'सर्प सत्त्व',
    PRETA: 'प्रेत सत्त्व',
    SHAKUNA: 'शकुन सत्त्व',
    PASHAVA: 'पशु सत्त्व',
    MATSYA: 'मत्स्य सत्त्व',
    VANASPATYA: 'वनस्पति सत्त्व',
  },
}

export const GAD7_SEVERITY: Record<Language, Record<string, string>> = {
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

export const IMPAIRMENT_LABELS: Record<Language, Record<number, string>> = {
  EN: {
    0: 'Not difficult at all',
    1: 'Somewhat difficult',
    2: 'Very difficult',
    3: 'Extremely difficult',
  },
  HI: {
    0: 'बिल्कुल मुश्किल नहीं',
    1: 'कुछ मुश्किल',
    2: 'बहुत मुश्किल',
    3: 'बेहद मुश्किल',
  },
  MR: {
    0: 'बिल्कुल कठीण नाही',
    1: 'काहीसे कठीण',
    2: 'खूप कठीण',
    3: 'अत्यंत कठीण',
  },
}

export const PRAKRITI_CATEGORIES: Record<Language, Record<string, string>> = {
  EN: {
    SATTVIKA: 'Sattvika (Balanced & Pure)',
    RAJASIKA: 'Rajasika (Active & Passionate)',
    TAMASIKA: 'Tamasika (Heavy & Dark)',
  },
  HI: {
    SATTVIKA: 'सात्विक (संतुलित और शुद्ध)',
    RAJASIKA: 'राजसिक (सक्रिय और भावुक)',
    TAMASIKA: 'तामसिक (भारी और अंधकारपूर्ण)',
  },
  MR: {
    SATTVIKA: 'सात्विक (संतुलित आणि शुद्ध)',
    RAJASIKA: 'राजसिक (सक्रिय आणि भावुक)',
    TAMASIKA: 'तामसिक (भारी आणि अंधकार)',
  },
}

export function getLocalizedName(
  name: string,
  language: Language,
  category: 'prakriti' | 'severity' | 'category'
): string {
  let dict: Record<string, string> | undefined

  switch (category) {
    case 'prakriti':
      dict = PRAKRITI_NAMES[language]
      break
    case 'severity':
      dict = GAD7_SEVERITY[language]
      break
    case 'category':
      dict = PRAKRITI_CATEGORIES[language]
      break
  }

  if (!dict) {
    // Fallback to English if category not found
    dict = category === 'prakriti' ? PRAKRITI_NAMES['EN'] : category === 'severity' ? GAD7_SEVERITY['EN'] : PRAKRITI_CATEGORIES['EN']
  }

  return (dict && dict[name]) || name
}
