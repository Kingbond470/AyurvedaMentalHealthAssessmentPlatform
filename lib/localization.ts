export type Language = 'EN' | 'HI' | 'MR'

export function getLocalizedField(
  item: any,
  fieldName: string,
  language: Language
): string {
  if (!item) return ''

  // Try requested language first
  const localizedField = item[`${fieldName}${language}`]

  // If found and not empty, use it
  if (localizedField && localizedField.trim()) {
    return localizedField
  }

  // Fallback to English
  const englishField = item[`${fieldName}En`]
  return englishField || ''
}

export function getLocalizedLabel(
  labels: Record<Language, string>,
  language: Language
): string {
  // Try requested language first
  if (labels[language] && labels[language].trim()) {
    return labels[language]
  }

  // Fallback to English
  return labels['EN'] || ''
}
