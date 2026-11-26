import type { Player } from "./types.ts";
import { CONDITIONS, perfectMatching, type Condition } from "./conditions.ts";
import { rng, shuffled } from "./daily.ts";

export const BINGO_SIZE = 16; // 4x4
export const BINGO_DECK = 22;

/** Cartón de 16 consignas + mazo de 22 jugadores, con al menos una forma de completar todo. */
export function buildBingo(players: Player[], seed: number, today: Date): { cells: Condition[]; deck: string[] } {
  const r = rng(seed);
  for (let attempt = 0; attempt < 400; attempt++) {
    const deck = shuffled(players, Math.floor(r() * 1e9)).slice(0, BINGO_DECK);
    const conds = shuffled(CONDITIONS, Math.floor(r() * 1e9)).filter((c) => {
      const n = deck.filter((p) => c.test(p, today)).length;
      return n >= 1 && n <= 9; // ni imposible ni regalada
    });
    if (conds.length < BINGO_SIZE) continue;
    const cells = conds.slice(0, BINGO_SIZE);
    const cand = cells.map((c) => deck.flatMap((p, j) => (c.test(p, today) ? [j] : [])));
    if (perfectMatching(cand)) return { cells, deck: deck.map((p) => p.id) };
  }
  throw new Error("No se pudo generar un bingo resoluble");
}
