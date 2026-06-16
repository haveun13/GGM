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
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // 캐릭터가 통통 튀며 살랑살랑 흔들리는 모션
        'corn-dance': {
          '0%, 100%': { transform: 'translateY(0) rotate(-6deg)' },
          '25%':      { transform: 'translateY(-12px) rotate(3deg)' },
          '50%':      { transform: 'translateY(0) rotate(6deg)' },
          '75%':      { transform: 'translateY(-6px) rotate(-3deg)' },
        },
        // 배경 옥수수가 둥실둥실 떠다니는 모션
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
      },
      animation: {
        'bounce-slow': 'bounce-slow 2.5s ease-in-out infinite',
        'corn-dance': 'corn-dance 3s ease-in-out infinite',
        'float-1': 'float 4s ease-in-out infinite',
        'float-2': 'float 5s ease-in-out infinite 0.6s',
        'float-3': 'float 4.5s ease-in-out infinite 1.2s',
      },
    },
  },
  plugins: [],
}

export default config
