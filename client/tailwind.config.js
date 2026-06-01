/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vortex: {
          bg: "#050816",
          primary: "#7C3AED",
          secondary: "#06B6D4",
          accent: "#A855F7",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
          glass: "rgba(255, 255, 255, 0.03)",
          glassBorder: "rgba(255, 255, 255, 0.08)",
          glassHover: "rgba(255, 255, 255, 0.06)",
        }
      },
      backgroundImage: {
        'vortex-radial': 'radial-gradient(circle at center, rgba(124, 58, 237, 0.15) 0%, rgba(5, 8, 22, 0) 70%)',
        'aurora-glow': 'radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.15) 0%, rgba(168, 85, 247, 0.1) 40%, rgba(5, 8, 22, 0) 70%)',
      },
      boxShadow: {
        'neon-primary': '0 0 15px rgba(124, 58, 237, 0.35)',
        'neon-secondary': '0 0 15px rgba(6, 182, 212, 0.35)',
        'neon-danger': '0 0 15px rgba(239, 68, 68, 0.35)',
        'neon-success': '0 0 15px rgba(34, 197, 94, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'glow-pulse': 'glowPulse 2.5s infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 5px rgba(124, 58, 237, 0.2), inset 0 0 2px rgba(124, 58, 237, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.6), inset 0 0 8px rgba(124, 58, 237, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
