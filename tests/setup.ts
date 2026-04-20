/// Vitest global setup.
/// Asegura que las env vars mínimas estén presentes para los tests.

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://crm:crm@localhost:5434/inmobiliaria_crm?schema=public";
process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "test-secret-for-vitest-only";
process.env.PORTAL_JWT_SECRET =
  process.env.PORTAL_JWT_SECRET ?? "test-portal-secret-for-vitest-only";
process.env.CRON_SECRET = process.env.CRON_SECRET ?? "test-cron-secret";
process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY =
  process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY ??
  "dGVzdC1rZXktMzItYnl0ZXMtZm9yLXZpdGVzdA=="; // 32 bytes base64
