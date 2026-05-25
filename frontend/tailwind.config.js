/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand Colors
        'brand-primary': '#0077B6',
        'brand-secondary': '#0096C7',
        'brand-accent': '#00B4D8',
        
        // Backgrounds & Borders
        'brand-bg': '#FFFFFF',
        'brand-light': '#F4FAFF',
        'brand-border': '#E0F2FF',
        
        // Typography
        'text-main': '#023E8A',
        'text-muted': '#4A6FA5',
        
        // Semantic/Alert Colors
        'status-leak': '#E63946',       // Active leak (Red)
        'status-risk': '#FF9F1C',       // Predicted risk (Orange)
        'status-safe': '#2ECC71',       // Safe/Normal (Green)
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 1.5s linear infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}