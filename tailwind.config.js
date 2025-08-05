module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}',
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    safelist: [
      'font-display',
      'font-body',
    ],
    theme: {
      extend: {
        colors: {
          background: 'var(--background)',
          foreground: 'var(--foreground)',
        },
        fontFamily: {
          display: ['var(--font-tomorrow)', 'sans-serif'],
          body: ['var(--font-jakarta)', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }
  