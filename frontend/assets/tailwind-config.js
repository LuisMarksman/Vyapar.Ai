/* Tailwind CDN config & utilities */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neutral: { 950: '#0a0a0a' }
      },
      animation: { in: 'fadeIn 0.5s ease-in' },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.animate-in': { animation: 'fadeIn 0.5s ease-in' },
        '.table-input': {
          '@apply w-full rounded-md border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:bg-neutral-50 dark:disabled:bg-neutral-800': {}
        },
        '.table-text': { '@apply w-full px-2 py-1 text-sm truncate': {} }
      })
    }
  ]
};
