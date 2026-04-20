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
        bg: "#0A0A0B",
        surface: "#141416",
        elevated: "#1C1C1F",
        border: "#2A2A2E",
        input: "#1C1C1F",
        ring: "#C9A961",
        foreground: "#F5F5F7",
        muted: {
          DEFAULT: "#232327",
          foreground: "#8E8E93",
        },
        gold: {
          DEFAULT: "#C9A961",
          hover: "#D4B874",
          muted: "#8A7344",
          faint: "rgba(201, 169, 97, 0.08)",
        },
        success: "#4ADE80",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
        background: "#0A0A0B",
        card: {
          DEFAULT: "#141416",
          foreground: "#F5F5F7",
        },
        popover: {
          DEFAULT: "#1C1C1F",
          foreground: "#F5F5F7",
        },
        primary: {
          DEFAULT: "#C9A961",
          foreground: "#0A0A0B",
        },
        secondary: {
          DEFAULT: "#1C1C1F",
          foreground: "#F5F5F7",
        },
        accent: {
          DEFAULT: "#232327",
          foreground: "#F5F5F7",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#F5F5F7",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia"],
        mono: ["var(--font-geist-mono)", "ui-monospace"],
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
      boxShadow: {
        "gold-glow": "0 0 0 1px rgba(201,169,97,0.25), 0 8px 32px -8px rgba(201,169,97,0.25)",
        soft: "0 8px 24px -12px rgba(0,0,0,0.5)",
        card: "0 1px 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
