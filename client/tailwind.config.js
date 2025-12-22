/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            colors: {
                background: "#0f172a", // Slate 900
                surface: "#1e293b",    // Slate 800 (Card bg)
                primary: {
                    DEFAULT: "#6366f1", // Indigo 500
                    hover: "#4f46e5",   // Indigo 600
                    glow: "rgba(99, 102, 241, 0.5)"
                },
                accent: {
                    lime: "#bef264",    // Lime 300
                    cyan: "#22d3ee",    // Cyan 400
                    purple: "#c084fc",  // Purple 400
                },
                muted: "#94a3b8",       // Slate 400
                border: "rgba(255, 255, 255, 0.1)",
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'neon': '0 0 10px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)',
                'card-hover': '0 20px 40px -5px rgba(0, 0, 0, 0.4)',
            },
            backgroundImage: {
                'gradient-mesh': "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(190, 242, 100, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(34, 211, 238, 0.1) 0px, transparent 50%)",
            }
        },
    },
    plugins: [],
}
