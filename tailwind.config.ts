import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        bg:         "var(--bg)",
        surface:    "var(--surface)",
        elevated:   "var(--elevated)",
        border:     "var(--border)",
        foreground: "var(--foreground)",
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-fg)",
        },
        gold: {
          DEFAULT: "#C9A961",
          hover:   "#D4B874",
          muted:   "#8A7344",
          faint:   "rgba(201,169,97,0.10)",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger:  "#EF4444",
        info:    "#3B82F6",
        // shadcn / Radix aliases
        background: "var(--bg)",
        card: {
          DEFAULT:    "var(--surface)",
          foreground: "var(--foreground)",
        },
        popover: {
          DEFAULT:    "var(--elevated)",
          foreground: "var(--foreground)",
        },
        primary: {
          DEFAULT:    "#C9A961",
          foreground: "#0A0A0B",
        },
        secondary: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--foreground)",
        },
        accent: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--foreground)",
        },
        destructive: {
          DEFAULT:    "#EF4444",
          foreground: "#FFFFFF",
        },
        input: "var(--border)",
        ring:  "#C9A961",
      },
      fontFamily: {
        sans:  ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia"],
        mono:  ["var(--font-geist-mono)", "ui-monospace"],
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
      boxShadow: {
        "gold-glow": "0 0 0 1px rgba(201,169,97,0.25), 0 8px 32px -8px rgba(201,169,97,0.2)",
        soft:        "0 4px 16px -4px rgba(0,0,0,0.08)",
        card:        "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in":        { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
