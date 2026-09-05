/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand: CampusConnect (BrandGuidelines.MD) ─────────────────
        primary: {
          DEFAULT: '#3730A3',   // Deep Indigo — navbars, primary buttons, headings
          light:   '#6366F1',  // Indigo Tint — hover states, secondary buttons
          50:      '#eef2ff',
          100:     '#e0e7ff',
        },
        accent:  '#10B981',   // Emerald — success, Selected/Offered status, match score
        warning: '#F59E0B',   // Amber — Pending / Under Review
        danger:  '#E11D48',   // Rose — Rejected, errors
        neutral: {
          dark:   '#1E293B',  // Slate-800 — body text
          light:  '#F1F5F9',  // Slate-100 — page backgrounds, cards
        },
      },
      fontFamily: {
        sans:  ['Inter', 'ui-sans-serif', 'system-ui'],
        mono:  ['IBM Plex Mono', 'ui-monospace'],
      },
      fontSize: {
        'h1': ['2rem',   { lineHeight: '2.4rem',  fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '2rem',    fontWeight: '600' }],
        'h3': ['1.25rem',{ lineHeight: '1.75rem', fontWeight: '600' }],
        'caption': ['0.875rem', { lineHeight: '1.25rem' }],
      },
      borderRadius: {
        btn: '7px',   // 6–8px per brand guidelines
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
}
