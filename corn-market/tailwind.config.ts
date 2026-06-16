import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        corn: {
          50:  '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFE44D',
          300: '#FFD700',
          400: '#FFC107',
          500: '#E6A800',
          600: '#C8960C',
          green: '#52B788',
          'green-light': '#74C69D',
          'green-dark': '#40916C',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
