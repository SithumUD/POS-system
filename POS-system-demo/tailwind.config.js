export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#7f8cff',
          500: '#3B5BFF',
          600: '#2f49e0',
          700: '#2739b8',
          800: '#233193',
          900: '#1f2c74',
        },
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        pop: '0 12px 32px -8px rgba(15, 23, 42, 0.16)',
      },
    },
  },
}
