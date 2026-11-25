/** Zona horaria de referencia: el reto cambia a medianoche de Buenos Aires para todos. */
export const TIMEZONE = "America/Argentina/Buenos_Aires";
/** Día del reto #1. */
export const EPOCH = "2026-11-01";

/** "YYYY-MM-DD" en la zona de referencia. */
export function dateKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Fecha UTC a medianoche que representa un dateKey (sirve para calcular edades de forma estable). */
export function keyToDate(key: string): Date {
  return new Date(`${key}T00:00:00Z`);
}

export function dayNumber(key: string): number {
  return Math.round((keyToDate(key).getTime() - keyToDate(EPOCH).getTime()) / 86_400_000) + 1;
}

/** PRNG determinístico (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  const r = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Objetivo del día: recorre una permutación fija de la lista, así no se repite
 * nadie hasta completar el ciclo. Cada ciclo usa una permutación distinta.
 */
export function pickDaily<T extends { id: string }>(items: readonly T[], seed: number, key: string): T {
  const n = Math.max(dayNumber(key), 1) - 1;
  const cycle = Math.floor(n / items.length);
  const sorted = [...items].sort((a, b) => a.id.localeCompare(b.id));
  return shuffled(sorted, seed + cycle * 7919)[n % items.length];
}

export function randomPick<T>(items: readonly T[], exclude?: T): T {
  const pool = items.filter((i) => i !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}
