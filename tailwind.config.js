/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0b0d10',
          900: '#111418',
          850: '#161a1f',
          800: '#1c2127',
          700: '#262c34',
          600: '#333b45',
          500: '#4a5461',
          400: '#6b7684',
          300: '#96a0ac',
          200: '#c2cad2',
          100: '#e6eaee',
        },
        brand: {
          DEFAULT: '#c4ff3d',
          dim: '#9fd62f',
          soft: '#e4ff9c',
        },
        accent: {
          push: '#ff6b57',
          pull: '#4fb0ff',
          legs: '#c4ff3d',
          warning: '#f5a623',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
