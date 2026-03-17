import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        board: {
          bg: '#0a1a0a',
          surface: '#0d2810',
          chalk: '#c8ffc8',
          chalkDim: 'rgba(200,255,200,0.5)',
        },
        brand: {
          primary: '#6c63ff',
          glow: 'rgba(108,99,255,0.3)',
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave1': 'wave 0.8s ease-in-out infinite',
        'wave2': 'wave 0.8s ease-in-out 0.1s infinite',
        'wave3': 'wave 0.8s ease-in-out 0.2s infinite',
        'wave4': 'wave 0.8s ease-in-out 0.3s infinite',
        'wave5': 'wave 0.8s ease-in-out 0.4s infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in-left': 'fadeInLeft 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-15px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
