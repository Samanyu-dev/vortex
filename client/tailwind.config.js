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
          bg: "#05060b",        // Deep matte void black
          surface: "#0c0d16",   // Matte granite slate grey
          surfaceHover: "#121422", // Sleek active dark hover
          border: "rgba(255, 255, 255, 0.035)", // Razor-thin sharp border
          borderHover: "rgba(124, 58, 237, 0.2)", // Minimal violet halo
          primary: "#7C3AED",   // Royal violet
          secondary: "#06B6D4", // Cosmic cyan
          success: "#10B981",   // Emerald green
          warning: "#F59E0B",   // Soft gold
          danger: "#EF4444",    // Muted crimson red
          textMuted: "#64748b", // Muted slate labels
        }
      },
      boxShadow: {
        'razor': '0 1px 2px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.015)',
        'spotlight': '0 24px 64px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(124, 58, 237, 0.05)',
        'earned-primary': '0 0 12px rgba(124, 58, 237, 0.25)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      }
    },
  },
  plugins: [],
}
