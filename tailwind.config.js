/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f5f3',
          100: '#f0f0ed',
          200: '#e8f0eb',
          500: '#3D6B4F',
          600: '#2A4E39',
          900: '#1a1a18',
        },
        accent: {
          100: '#F5E8D6',
          500: '#C4823A',
        },
        bg: {
          primary: '#FAFAF7',
          surface: '#FFFFFF',
          section: '#F5F2EC',
          observer: '#EEF4F0',
        },
        text: {
          primary: '#1A1A18',
          secondary: '#5A5A55',
          tertiary: '#8A8A82',
          inverse: '#FFFFFF',
        },
        border: {
          light: '#E0DDD5',
          strong: '#C8C4BA',
        },
        severity: {
          minimal: '#4A8C6A',
          mild: '#C4A23A',
          moderate: '#C46B3A',
          severe: '#B03A3A',
        },
        category: {
          sattvika: '#3D6B4F',
          rajasika: '#8B5A2B',
          tamasika: '#5A5A7A',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Source Serif 4', 'serif'],
        ui: ['DM Sans', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      maxWidth: {
        content: '720px',
        dashboard: '1200px',
        results: '900px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1440px',
      },
    },
  },
  plugins: [],
}
