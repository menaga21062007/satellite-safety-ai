/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#fbf9f5',
          100: '#f5f2eb',
          200: '#eae4d8',
          300: '#ded6c5',
          400: '#c5baa4',
          500: '#a89b82',
          600: '#897c64',
          700: '#685c47',
          800: '#4a4131'
        },
        moss: {
          50: '#f4f6f2',
          100: '#e5ebe0',
          200: '#c9d7c0',
          300: '#a6be99',
          400: '#809f70',
          500: '#597445', // Signature Moss Green from reference
          600: '#475e36',
          700: '#384a2a',
          800: '#2a371f',
          900: '#1c2415'
        },
        clay: {
          50: '#fbf5ee',
          100: '#f5e8d8',
          200: '#ebd0b2',
          300: '#dfb286',
          400: '#cf9358',
          500: '#be7b38', // Terracotta safari ticket from reference
          600: '#9e6027',
          700: '#7c491d',
          800: '#5b3414'
        },
        earth: {
          dark: '#1e2418',
          body: '#2b3323',
          muted: '#636c5b',
          subtle: '#8f9886'
        }
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', '"Outfit"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'soft-neumorphic': '0 10px 25px -3px rgba(120, 110, 95, 0.12), 0 4px 10px -2px rgba(120, 110, 95, 0.06)',
        'soft-neumorphic-lg': '0 20px 40px -4px rgba(120, 110, 95, 0.16), 0 8px 16px -4px rgba(120, 110, 95, 0.08)',
        'soft-inner': 'inset 0 2px 4px 0 rgba(120, 110, 95, 0.08)',
        'moss-glow': '0 6px 20px rgba(89, 116, 69, 0.35)',
        'clay-glow': '0 6px 20px rgba(190, 123, 56, 0.35)'
      }
    },
  },
  plugins: [],
}
