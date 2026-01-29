/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#ff0000",
                secondary: "#c0c0c0",
                dark: "#050505",
                card: "#0f0f0f",
            },
            fontFamily: {
                space: ["'Oswald'", "sans-serif"],
            },
            backgroundImage: {
                'silver-gradient': 'linear-gradient(135deg, #e0e0e0 0%, #808080 50%, #e0e0e0 100%)',
                'red-gradient': 'linear-gradient(135deg, #ff0000 0%, #990000 100%)',
            },
            boxShadow: {
                'red-glow': '0 0 20px rgba(255, 0, 0, 0.5)',
            }
        },
    },
    plugins: [],
}
