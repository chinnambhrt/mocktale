/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#6366f1', // Indigo-500
                    dark: '#4f46e5',    // Indigo-600
                    light: '#818cf8',   // Indigo-400
                    yellow: '#fbbf24',  // Amber-400
                    text: '#1f2937',    // Gray-800
                }
            }
        },
    },
    plugins: [],
}
