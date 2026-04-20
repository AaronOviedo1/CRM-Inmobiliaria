/**
 * Generador pseudo-aleatorio determinístico para mantener mock data consistente
 * entre SSR y CSR y evitar mismatches de hidratación.
 */

export function createRng(seed = 42) {
  let state = seed >>> 0;
  return function next() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export function pickOne<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

export function pickSome<T>(
  rng: () => number,
  arr: readonly T[],
  min = 1,
  max = 3
): T[] {
  const n = Math.floor(rng() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

export function rangeInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function rangeFloat(
  rng: () => number,
  min: number,
  max: number,
  decimals = 2
): number {
  const v = rng() * (max - min) + min;
  return Math.round(v * 10 ** decimals) / 10 ** decimals;
}

export function chance(rng: () => number, pct: number): boolean {
  return rng() < pct;
}

export function cuid(rng: () => number, prefix = "c"): string {
  const hex = Math.floor(rng() * 0xffffffff).toString(16).padStart(8, "0");
  const hex2 = Math.floor(rng() * 0xffffffff).toString(16).padStart(8, "0");
  return `${prefix}${hex}${hex2}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function shiftDate(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}
