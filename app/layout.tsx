import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { getLocale, getMessages } from "@/lib/i18n/server";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces  = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "CRT Admin", template: "%s · CRT Admin" },
  description: "Sistema administrativo de plazas comerciales — Strata Systems MX",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale   = await getLocale();
  const messages = await getMessages(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-bg text-foreground">
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{ className: "font-sans text-sm" }}
            />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
