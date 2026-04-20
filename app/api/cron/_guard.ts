/// Valida el header de autorización de los endpoints de cron.
/// Todos los endpoints /api/cron/* deben llamar esto antes de procesar.

import { NextRequest } from "next/server";
import { env } from "@/lib/env";

export function guardCron(req: NextRequest): Response | null {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${env.cronSecret}`;
  if (authHeader !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}
