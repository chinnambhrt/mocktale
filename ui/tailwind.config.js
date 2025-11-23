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
                    DEFAULT: '#7E4F1F', // User requested specific color
                    dark: '#643f19',    // Darker shade for hover
                    light: '#9c6b35',   // Lighter shade
                    yellow: '#f59e0b',  // Amber-500
                    text: '#111827',    // Gray-900
                }
            }
        },
    },
    plugins: [],
}
