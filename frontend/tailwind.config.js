/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Noto Sans SC', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
          50: '#eef2ff',
        },
        accent: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        success: {
          DEFAULT: '#10b981',
          light: '#34d399',
        },
        warning: '#f59e0b',
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171',
        },
        bg: {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
          card: '#1e293b',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        border: {
          DEFAULT: '#334155',
          light: '#475569',
        },
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'glow': '0 0 20px rgb(99 102 241 / 0.3)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
        'bounce': '500ms',
      },
    },
  },
  plugins: [],
}
