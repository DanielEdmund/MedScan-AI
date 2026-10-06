import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        /* ── Primary palette — Authority & Trust ───────────────── */
        midnight: "#07111F",
        navy: "#0B172A",
        panel: "#172033",
        /* Slate scale re-tuned to the MedScan clinical spectrum */
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#172033",
          900: "#0B172A",
          950: "#07111F",
        },
        /* ── Secondary palette — Operations & Status ──────────── */
        cyan: {
          DEFAULT: "#22D3EE",
          400: "#22D3EE",
          300: "#67E8F9",
          500: "#06B6D4",
        },
        blue: {
          DEFAULT: "#3B82F6",
          500: "#3B82F6",
          400: "#60A5FA",
          600: "#2563EB",
        },
        mint: {
          DEFAULT: "#34D399",
          400: "#34D399",
          500: "#10B981",
        },
        amber: {
          DEFAULT: "#FBBF24",
          400: "#FBBF24",
          500: "#F59E0B",
        },
        alert: {
          DEFAULT: "#EF4444",
          500: "#EF4444",
          400: "#F87171",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.14), 0 18px 48px -24px rgba(34,211,238,0.35)",
        "glow-blue": "0 0 0 1px rgba(59,130,246,0.18), 0 18px 48px -24px rgba(59,130,246,0.40)",
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 24px 60px -40px rgba(0,0,0,0.9)",
        "inner-faint": "inset 0 1px 0 0 rgba(255,255,255,0.04)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.82)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "caret-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
        "scan-line": "scan-line 4.5s linear infinite",
        shimmer: "shimmer 2.4s linear infinite",
        "caret-blink": "caret-blink 1.1s step-end infinite",
        "fade-up": "fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse 80% 55% at 50% -20%, rgba(59,130,246,0.28), transparent)",
        "radial-cyan":
          "radial-gradient(ellipse 60% 45% at 82% 8%, rgba(34,211,238,0.16), transparent)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
