import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  exchangePortalToken,
  validatePortalSession,
  PORTAL_COOKIE_NAME,
  PORTAL_COOKIE_MAX_AGE,
} from "@/lib/services/portal-sessions";
import { KeyRound } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function OwnerPortalLoginPage({ searchParams }: Props) {
  const { token } = await searchParams;

  const jar = await cookies();
  const existing = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (existing) {
    const session = await validatePortalSession(existing);
    if (session?.kind === "OWNER") redirect("/portal-propietario/dashboard");
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-bg">
        <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-gold/40 bg-gold-faint">
              <KeyRound className="h-5 w-5 text-gold" />
            </div>
          </div>
          <h1 className="mt-4 font-serif text-2xl">Portal propietario</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Para acceder, solicitá un link de acceso a tu agente. Te llega por
            WhatsApp o email y es válido 24 horas.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link href="/login" className="text-gold hover:text-gold-hover">
              ¿Eres agente? Entra aquí
            </Link>
          </p>
        </div>
      </div>
    );
  }

  try {
    const { sessionToken, kind } = await exchangePortalToken(token);
    if (kind !== "OWNER") redirect("/portal-propietario/login");

    const jar2 = await cookies();
    jar2.set(PORTAL_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: PORTAL_COOKIE_MAX_AGE,
      path: "/portal-propietario",
    });
    redirect("/portal-propietario/dashboard");
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-bg">
        <div className="w-full max-w-md text-center">
          <h1 className="font-serif text-2xl text-red-400">Link expirado</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            El link ya no es válido. Pedí a tu agente que te envíe uno nuevo.
          </p>
        </div>
      </div>
    );
  }
}
