/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
        display: ['"Sora Variable"', '"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
      },
      colors: { ink: '#0a0a0b', brand: { cyan: '#06c3ff', violet: '#a855f7', blue: '#2563eb' } },
      backgroundImage: { 'brand-grad': 'linear-gradient(90deg,#06c3ff,#7c5cff 60%,#a855f7)' },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'none' } },
        float: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(30px,-24px) scale(1.08)' } },
        shine: { '0%': { transform: 'translateX(-120%) skewX(-20deg)' }, '100%': { transform: 'translateX(320%) skewX(-20deg)' } },
        pop: { '0%': { opacity: 0, transform: 'scale(.92) translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: {
        'fade-up': 'fadeUp .7s ease both',
        'fade-in': 'fadeIn 1s ease both',
        float: 'float 14s ease-in-out infinite',
        shine: 'shine 2.6s ease-in-out infinite',
        pop: 'pop .35s ease both',
      },
    },
  },
  plugins: [],
}
