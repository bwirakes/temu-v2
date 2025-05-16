import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ["DM Serif Display", "Times New Roman", "serif"],
        montserrat: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        helvetica: ["Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        temu: {
          black: "#000000",
          "light-blue": "#EBF3F9",
          "medium-blue": "#D9E8F3",
          "form-green": "#C5F1E1",
          "form-yellow": "#FFF2C4",
          "form-pink": "#FFDBDB",
          "logo-red": "#E63B2E",
          "logo-green": "#5EB25E",
          "logo-yellow": "#F0B95D",
          "logo-blue": "#5DA8D5",
        },
        notion: {
          text: "#37352f",
          "text-light": "#6b6b6b",
          background: "#ffffff",
          "background-gray": "#f7f6f3",
          "background-hover": "#efefef",
          "primary-button": "#000000",
          "primary-button-text": "#ffffff",
          border: "#e6e6e6",
          "border-dark": "#d3d3d3",
          highlight: "#ffff00",
          "highlight-pink": "#ffd1e3",
          "highlight-blue": "#d3e5ef",
          "highlight-green": "#d1f0e2",
          "highlight-orange": "#ffefd3",
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '4xl': '2rem',
        notion: '3px',
      },
      boxShadow: {
        'notion-card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.05)',
        'notion-button': 'rgba(15, 15, 15, 0.1) 0px 1px 2px',
        'notion-button-hover': 'rgba(15, 15, 15, 0.1) 0px 3px 6px',
        'notion-dropdown': '0 0 0 1px rgba(0, 0, 0, 0.05), 0px 3px 6px rgba(0, 0, 0, 0.1)',
      },
      fontSize: {
        "hero-large": ["1.0rem", { lineHeight: "1.1" }],
        "hero-medium": ["1.0rem", { lineHeight: "1.2" }],
        "notion-title": ["40px", { lineHeight: "1.2", letterSpacing: "-0.025em", fontWeight: "700" }],
        "notion-subtitle": ["24px", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "500" }],
        "notion-body": ["16px", { lineHeight: "1.6" }],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in-left': {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        'fade-in-right': {
          from: { opacity: '0', transform: 'translateX(10px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-left': 'fade-in-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-right': 'fade-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      },
      transitionTimingFunction: {
        notion: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    }
  },
  plugins: [require('tailwindcss-animate')]
} satisfies Config;
