# Premium Theme System

## Overview

MPAAP v2 features a premium dark theme system with 4 color variants (1 default + 3 options). Users can toggle themes globally, with preference persisted across sessions.

**Status:** Implementation Phase

---

## Theme Architecture

### CSS Variables Approach

All colors stored as CSS variables in `app/globals.css`:

```css
:root {
  /* Black + Gold (DEFAULT) */
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --text-primary: #f5f5f5;
  --text-secondary: #b0b0b0;
  --accent-primary: #d4a574;
  --accent-secondary: #a87c3f;
  --border: #2a2a2a;
}

[data-theme="sapphire"] {
  /* Dark + Deep Blue */
  --accent-primary: #4a7bdc;
  --accent-secondary: #2c5aa0;
}

[data-theme="emerald"] {
  /* Dark + Green */
  --accent-primary: #3db366;
  --accent-secondary: #2a8f4e;
}

[data-theme="charcoal"] {
  /* Dark + Neutral Gray */
  --accent-primary: #808080;
  --accent-secondary: #606060;
}
```

### State Management (Zustand)

```typescript
// lib/store.ts - themeStore
interface ThemeStore {
  theme: 'default' | 'sapphire' | 'emerald' | 'charcoal'
  setTheme: (theme: ThemeStore['theme']) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'default',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-store' }
  )
)
```

### Theme Provider Component

```typescript
// components/ThemeProvider.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  
  return <>{children}</>
}
```

---

## Color Palettes

### Black + Gold (Default)
```
BG Primary:    #0a0a0a (true black)
BG Secondary:  #1a1a1a (card background)
Text Primary:  #f5f5f5 (main text)
Text Secondary:#b0b0b0 (secondary text)
Accent Primary:#d4a574 (buttons, links, highlights)
Accent Secondary:#a87c3f (hover states)
Border:        #2a2a2a (dividers)
```

### Sapphire
```
Accent Primary:#4a7bdc (deep blue)
Accent Secondary:#2c5aa0 (darker blue)
Everything else same as default
```

### Emerald
```
Accent Primary:#3db366 (forest green)
Accent Secondary:#2a8f4e (darker green)
Everything else same as default
```

### Charcoal
```
Accent Primary:#808080 (neutral gray)
Accent Secondary:#606060 (darker gray)
Everything else same as default
```

---

## Component Implementation

### Theme Toggle Button

Location: Top-right of header (all pages)

```typescript
// components/ThemeToggle.tsx
export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()
  const themes = ['default', 'sapphire', 'emerald', 'charcoal']
  
  return (
    <select 
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="px-3 py-2 bg-bg-secondary text-text-primary rounded-lg border border-border"
    >
      {themes.map(t => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  )
}
```

### Updating Component Styles

Before:
```jsx
<div className="bg-bg-primary text-text-primary border border-border-light">
```

After (uses CSS variables):
```jsx
<div className="bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border)]">
```

OR use Tailwind config to map to CSS variables:

```js
// tailwind.config.js
theme: {
  colors: {
    'bg-primary': 'var(--bg-primary)',
    'bg-secondary': 'var(--bg-secondary)',
    'text-primary': 'var(--text-primary)',
    // ... etc
  }
}
```

Then use as normal:
```jsx
<div className="bg-bg-primary text-text-primary">
```

---

## Implementation Roadmap

### Phase 1: Infrastructure (2 days)
- [ ] Add CSS variables to globals.css
- [ ] Create ThemeProvider component
- [ ] Add themeStore to Zustand
- [ ] Create ThemeToggle button component
- [ ] Add ThemeProvider to root layout

### Phase 2: Assessment Pages (3 days)
- [ ] Update AssessmentInterface.tsx to use CSS variables
- [ ] Update GAD7Interface.tsx
- [ ] Update ResultsPage
- [ ] Test dark theme readability on all pages
- [ ] QA: Eye strain testing with real users

### Phase 3: Admin Dashboard (2 days)
- [ ] Update MPPIItemsTab
- [ ] Update GAD7Tab
- [ ] Update ReportsTab
- [ ] Update SettingsTab

### Phase 4: Global Pages (1 day)
- [ ] Update LoginPage
- [ ] Update DashboardPage
- [ ] Update all common components (Header, Footer, forms)

**Total: ~8 days | ~64 hours**

---

## Testing Checklist

### Design QA
- [ ] All 4 themes display correctly on login page
- [ ] Toggle switches between themes instantly
- [ ] Theme persists after page reload
- [ ] Theme persists across different pages
- [ ] Mobile (portrait/landscape) looks good in all themes

### Accessibility
- [ ] WCAG AA contrast ratio on all text (4.5:1 minimum)
- [ ] Form inputs clearly visible and focused
- [ ] Charts readable in all themes
- [ ] Links underlined or otherwise distinguishable

### User Testing (with 5-10 practitioners)
- [ ] Dark theme reduces eye strain (60+ min assessment)
- [ ] Preferred color variant (likely gold or emerald for Ayurveda)
- [ ] No usability regressions vs light theme

### Regression Testing
- [ ] All 118 MPPI items display correctly
- [ ] GAD-7 assessment flows work
- [ ] Results page charts readable
- [ ] Admin tables sortable and readable
- [ ] PDF export uses correct colors

---

## Future Enhancements

### V2.1 (Optional)
- [ ] Per-component theme overrides (e.g., always light PDF export)
- [ ] Auto dark-mode detection (prefers-color-scheme media query)
- [ ] Theme scheduling (dark evening, light morning)
- [ ] Custom color picker (user-defined accent colors)

### V2.2 (Nice-to-have)
- [ ] High-contrast mode for accessibility
- [ ] Colorblind-friendly themes (deuteranopia, protanopia)
- [ ] Per-user theme preference (if multiple practitioners per device)

---

## Deployment Notes

- No breaking changes (CSS variables fallback to initial values)
- No database changes (localStorage only)
- No new dependencies
- No performance impact (CSS variables are native browser feature)
- Safe to ship alongside other features

---

## References

- CSS Variables: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- Zustand Persist: https://github.com/pmndrs/zustand#persist-middleware
- Tailwind CSS Variables: https://tailwindcss.com/docs/configuration#using-css-variables
- WCAG Contrast Ratio Tool: https://www.tpgi.com/color-contrast-checker/

