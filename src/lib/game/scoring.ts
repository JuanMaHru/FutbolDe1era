import type { Cell } from "./types.ts";

export const EMOJI = { hit: "🟩", near: "🟨", miss: "⬛" } as const;

/** Puntos de un reto: 10 si acertás al primero, baja 1 por intento (mínimo 3), 0 si no acertás. */
export function points(won: boolean, guesses: number): number {
  if (!won) return 0;
  return Math.max(11 - guesses, 3);
}

export function shareText(opts: {
  brand: string;
  title: string;
  day: number;
  rows: Cell[][];
  won: boolean;
  maxGuesses: number;
  url?: string;
}): string {
  const score = opts.won ? `${opts.rows.length}/${opts.maxGuesses}` : `X/${opts.maxGuesses}`;
  const grid = opts.rows.map((r) => r.map((c) => EMOJI[c.status]).join("")).join("\n");
  return [`⚽ ${opts.brand} #${opts.day} · ${opts.title} ${score}`, grid, opts.url].filter(Boolean).join("\n");
}
