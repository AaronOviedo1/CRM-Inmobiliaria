import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/// Convierte recursivamente los `Prisma.Decimal` de un payload a `number` para
/// que Server Components puedan pasarlo a Client Components sin que Next.js
/// queje que el objeto no es "plain". Preserva Date, null/undefined y arrays.
export function toPlain<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((v) => toPlain(v)) as unknown as T;
  const v = value as Record<string, unknown> & { toNumber?: () => number };
  if (typeof v.toNumber === "function" && typeof (v as any).s === "number") {
    return v.toNumber() as unknown as T;
  }
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(v)) out[k] = toPlain((v as any)[k]);
  return out as T;
}
