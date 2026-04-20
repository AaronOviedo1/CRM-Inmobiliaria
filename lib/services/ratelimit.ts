/// Rate limiter sobre Upstash Redis. Si Upstash no está configurado, cae a un limiter
/// in-memory (válido para dev y single-instance; NO usar en producción multi-instance).

import { env, isUpstashConfigured } from "../env";

type Limiter = {
  limit: (key: string) => Promise<{ success: boolean; reset: number }>;
};

function inMemoryLimiter(max: number, windowMs: number): Limiter {
  const hits = new Map<string, number[]>();
  return {
    async limit(key) {
      const now = Date.now();
      const list = (hits.get(key) ?? []).filter((t) => t > now - windowMs);
      if (list.length >= max) {
        return { success: false, reset: Math.max(...list) + windowMs };
      }
      list.push(now);
      hits.set(key, list);
      return { success: true, reset: now + windowMs };
    },
  };
}

async function upstashLimiter(
  tokens: number,
  windowSec: number,
): Promise<Limiter> {
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: env.upstashUrl!,
    token: env.upstashToken!,
  });
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, `${windowSec} s`),
    analytics: true,
    prefix: "crm/rl",
  });
  return {
    async limit(key) {
      const r = await rl.limit(key);
      return { success: r.success, reset: r.reset };
    },
  };
}

/**
 * Obtiene un limiter nombrado con política fija.
 * Policies comunes:
 *   - public.leadForm:   20 req/min por IP
 *   - public.contact:    10 req/min por IP
 *   - public.feed:       60 req/min por IP
 *   - public.property.view: 120 req/min por IP
 *   - auth.login:        10 req/min por IP
 *   - portal.owner:      30 req/min por token
 *   - portal.tenant:     30 req/min por token
 */
const CONFIGS: Record<string, { max: number; windowSec: number }> = {
  "public.leadForm": { max: 20, windowSec: 60 },
  "public.contact": { max: 10, windowSec: 60 },
  "public.feed": { max: 60, windowSec: 60 },
  "public.property.view": { max: 120, windowSec: 60 },
  "auth.login": { max: 10, windowSec: 60 },
  "portal.owner": { max: 30, windowSec: 60 },
  "portal.tenant": { max: 30, windowSec: 60 },
  "webhook.generic": { max: 300, windowSec: 60 },
};

const CACHE: Record<string, Promise<Limiter>> = {};

export async function limiter(name: keyof typeof CONFIGS): Promise<Limiter> {
  if (Object.prototype.hasOwnProperty.call(CACHE, name)) return CACHE[name];
  const cfg = CONFIGS[name];
  CACHE[name] = isUpstashConfigured()
    ? upstashLimiter(cfg.max, cfg.windowSec)
    : Promise.resolve(inMemoryLimiter(cfg.max, cfg.windowSec * 1000));
  return CACHE[name];
}

export async function rateLimitOr429(
  name: keyof typeof CONFIGS,
  key: string,
): Promise<Response | null> {
  const rl = await limiter(name);
  const r = await rl.limit(key);
  if (!r.success) {
    return new Response(
      JSON.stringify({ error: "RATE_LIMIT", retryAt: r.reset }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)).toString(),
        },
      },
    );
  }
  return null;
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}
