module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}', // Include your source files
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')], // ✅ Add this line
}
