/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'fadeInUp': 'fadeInUp 0.6s ease-out',
                'pulse-gentle': 'pulse 2s infinite',
                'slideInLeft': 'slideInFromLeft 0.8s ease-out',
            },
            keyframes: {
                fadeInUp: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(30px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
                slideInFromLeft: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateX(-100px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateX(0)'
                    }
                }
            },
            backdropBlur: {
                'xs': '2px',
            },
        },
    },
    plugins: [],
}
