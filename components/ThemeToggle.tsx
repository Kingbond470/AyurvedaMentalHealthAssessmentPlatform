'use client'

import { useThemeStore } from '@/lib/store'

const THEME_LABELS = {
  default: '🌙 Gold',
  sapphire: '💙 Sapphire',
  emerald: '💚 Emerald',
  charcoal: '🩶 Charcoal',
} as const

type Theme = keyof typeof THEME_LABELS

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()

  const themes: Theme[] = ['default', 'sapphire', 'emerald', 'charcoal']

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as Theme)}
      className="px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg border border-[var(--border-light)] font-ui text-sm cursor-pointer hover:border-[var(--accent-primary)] transition"
    >
      {themes.map((t) => (
        <option key={t} value={t}>
          {THEME_LABELS[t]}
        </option>
      ))}
    </select>
  )
}
