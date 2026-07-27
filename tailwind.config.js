/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        deep: '#0A0A0A',
        graphite: '#2D2D2D',
        'graphite-light': '#3D3D3D',
        sport: '#E30613',
        'sport-dark': '#B00510',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-right': 'slideRight 0.8s ease-out',
        'glow-red': 'glowRed 2s ease-in-out infinite',
        'lava-1': 'lava1 18s ease-in-out infinite',
        'lava-2': 'lava2 25s ease-in-out infinite',
        'lava-3': 'lava3 22s ease-in-out infinite',
        'lava-4': 'lava4 30s ease-in-out infinite',
        'lava-5': 'lava5 20s ease-in-out infinite',
        'lava-6': 'lava6 16s ease-in-out infinite',
        'lava-7': 'lava7 28s ease-in-out infinite',
        'lava-8': 'lava8 35s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowRed: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(227, 6, 19, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(227, 6, 19, 0.6)' },
        },
        lava1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1, 1)', borderRadius: '40% 60% 30% 70% / 50% 40% 60% 50%' },
          '20%': { transform: 'translate(60px, -80px) scale(1.15, 0.85)', borderRadius: '60% 40% 70% 30% / 40% 60% 40% 60%' },
          '40%': { transform: 'translate(-40px, 40px) scale(0.9, 1.1)', borderRadius: '50% 50% 40% 60% / 60% 40% 60% 40%' },
          '60%': { transform: 'translate(30px, -50px) scale(1.05, 0.95)', borderRadius: '70% 30% 50% 50% / 30% 70% 40% 60%' },
          '80%': { transform: 'translate(-20px, 30px) scale(0.95, 1.05)', borderRadius: '30% 70% 60% 40% / 50% 30% 70% 50%' },
        },
        lava2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1, 1)', borderRadius: '50% 50% 60% 40% / 40% 60% 50% 50%' },
          '25%': { transform: 'translate(-70px, 50px) scale(0.85, 1.15)', borderRadius: '60% 40% 30% 70% / 60% 40% 60% 40%' },
          '50%': { transform: 'translate(50px, -60px) scale(1.2, 0.8)', borderRadius: '40% 60% 70% 30% / 30% 70% 40% 60%' },
          '75%': { transform: 'translate(-30px, 20px) scale(0.95, 1.05)', borderRadius: '70% 30% 50% 50% / 50% 50% 70% 30%' },
        },
        lava3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1, 1)', borderRadius: '30% 70% 50% 50% / 50% 40% 60% 50%' },
          '20%': { transform: 'translate(45px, 60px) scale(1.1, 0.9)', borderRadius: '70% 30% 40% 60% / 30% 70% 50% 50%' },
          '40%': { transform: 'translate(-55px, -35px) scale(0.85, 1.15)', borderRadius: '40% 60% 60% 40% / 60% 30% 70% 40%' },
          '60%': { transform: 'translate(25px, 45px) scale(1.15, 0.85)', borderRadius: '50% 50% 30% 70% / 40% 60% 40% 60%' },
          '80%': { transform: 'translate(-15px, -20px) scale(0.95, 1.05)', borderRadius: '60% 40% 70% 30% / 50% 50% 30% 70%' },
        },
        lava4: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1, 1)', borderRadius: '60% 40% 30% 70% / 70% 30% 50% 50%' },
          '25%': { transform: 'translate(-35px, -45px) scale(0.9, 1.1)', borderRadius: '30% 70% 60% 40% / 40% 60% 70% 30%' },
          '50%': { transform: 'translate(65px, 55px) scale(1.15, 0.85)', borderRadius: '50% 50% 40% 60% / 60% 40% 30% 70%' },
          '75%': { transform: 'translate(-20px, -30px) scale(1.05, 0.95)', borderRadius: '70% 30% 50% 50% / 30% 70% 60% 40%' },
        },
        lava5: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1, 1)', borderRadius: '40% 60% 70% 30% / 50% 60% 40% 50%' },
          '20%': { transform: 'translate(55px, -35px) scale(1.1, 0.9)', borderRadius: '60% 40% 30% 70% / 60% 40% 50% 50%' },
          '40%': { transform: 'translate(-45px, 50px) scale(0.85, 1.15)', borderRadius: '30% 70% 60% 40% / 40% 60% 60% 40%' },
          '60%': { transform: 'translate(40px, -20px) scale(1.15, 0.85)', borderRadius: '70% 30% 40% 60% / 50% 50% 40% 60%' },
          '80%': { transform: 'translate(-25px, 15px) scale(0.95, 1.05)', borderRadius: '40% 60% 50% 50% / 60% 40% 70% 30%' },
        },
        lava6: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1, 1)', borderRadius: '50% 50% 40% 60% / 30% 70% 50% 50%' },
          '25%': { transform: 'translate(40px, 70px) scale(1.05, 0.95)', borderRadius: '40% 60% 50% 50% / 60% 40% 30% 70%' },
          '50%': { transform: 'translate(-60px, -30px) scale(0.9, 1.1)', borderRadius: '60% 40% 70% 30% / 40% 60% 60% 40%' },
          '75%': { transform: 'translate(35px, -40px) scale(1.1, 0.9)', borderRadius: '30% 70% 60% 40% / 50% 30% 70% 50%' },
        },
        lava7: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1, 1)', borderRadius: '60% 40% 50% 50% / 50% 50% 40% 60%' },
          '20%': { transform: 'translate(-30px, -60px) scale(0.95, 1.05)', borderRadius: '50% 50% 40% 60% / 40% 60% 50% 50%' },
          '40%': { transform: 'translate(45px, 30px) scale(1.1, 0.9)', borderRadius: '40% 60% 60% 40% / 60% 40% 50% 50%' },
          '60%': { transform: 'translate(-55px, 45px) scale(0.85, 1.15)', borderRadius: '30% 70% 50% 50% / 50% 50% 60% 40%' },
          '80%': { transform: 'translate(20px, -25px) scale(1.05, 0.95)', borderRadius: '60% 40% 30% 70% / 40% 60% 60% 40%' },
        },
        lava8: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1, 1)', borderRadius: '30% 70% 60% 40% / 60% 40% 50% 50%' },
          '25%': { transform: 'translate(-45px, -30px) scale(1.15, 0.85)', borderRadius: '60% 40% 50% 50% / 30% 70% 40% 60%' },
          '50%': { transform: 'translate(35px, 55px) scale(0.9, 1.1)', borderRadius: '50% 50% 70% 30% / 50% 30% 70% 50%' },
          '75%': { transform: 'translate(-20px, -40px) scale(1.05, 0.95)', borderRadius: '40% 60% 30% 70% / 60% 50% 40% 60%' },
        },
      },
    },
  },
  plugins: [],
};
