/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,tsx,ts}'],
  theme: {
    extend: {
      boxShadow: {
        normal: '2px 2px 6px rgba(0,0,0,.5)',
        active: '4px 4px 8px rgba(0,0,0,0.8)'
      }
    }
  },
  plugins: []
}
