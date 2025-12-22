/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--bg-body)",
                foreground: "var(--text-main)",
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "#ffffff",
                    hover: "var(--primary-hover)"
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "#ffffff"
                },
                muted: "var(--text-muted)",
                border: "var(--border-color)",
            },
            fontFamily: {
                sans: "var(--font-family)",
            }
        },
    },
    plugins: [],
}
