/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#000000',
          secondary: '#1d1d1f',
          tertiary: '#2d2d2f',
        },
        text: {
          primary: '#f5f5f7',
          secondary: '#86868b',
          tertiary: '#6e6e73',
        },
        border: {
          DEFAULT: '#3d3d3f',
          hover: '#0a84ff',
        },
        accent: {
          blue: '#0a84ff',
          green: '#30d158',
          yellow: '#ffd60a',
          red: '#ff453a',
          purple: '#bf5af2',
        },
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'xxl': '32px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
