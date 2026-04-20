import { cookies } from "next/headers";
import es from "@/messages/es.json";
import en from "@/messages/en.json";

export type Locale = "es" | "en";
export const defaultLocale: Locale = "es";
export const locales: Locale[] = ["es", "en"];

export async function getLocale(): Promise<Locale> {
  // TODO(backend): obtener locale desde preferencia de usuario en DB.
  const cookieStore = await cookies();
  const stored = cookieStore.get("locale")?.value as Locale | undefined;
  if (stored && locales.includes(stored)) return stored;
  return defaultLocale;
}

export async function getMessages(locale: Locale) {
  return locale === "en" ? en : es;
}
