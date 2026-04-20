import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";

import { getLocale, getMessages } from "@/lib/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Inmobiliaria CRM",
    template: "%s · Inmobiliaria CRM",
  },
  description:
    "CRM multi-tenant premium para inmobiliarias en Hermosillo, Sonora",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} dark`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-bg text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1C1C1F",
                border: "1px solid #2A2A2E",
                color: "#F5F5F7",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
