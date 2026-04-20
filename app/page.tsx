import { redirect } from "next/navigation";

export default function HomePage() {
  // TODO(backend): si hay sesión → /dashboard; si no → /login (basado en cookies reales).
  redirect("/dashboard");
}
