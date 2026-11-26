import type { Player } from "./types.ts";
import { POSITIONS, type Line } from "./meta.ts";
import { CONDITIONS, perfectMatching, type Condition } from "./conditions.ts";
import { rng, shuffled } from "./daily.ts";

/** Armá el 11: 4-3-3. Cada casilla pide una línea + una consigna. */
export const FORMATION: { line: Line; x: number; y: number }[] = [
  { line: "DEL", x: 20, y: 17 }, { line: "DEL", x: 50, y: 14 }, { line: "DEL", x: 80, y: 17 },
  { line: "MED", x: 24, y: 40 }, { line: "MED", x: 50, y: 36 }, { line: "MED", x: 76, y: 40 },
  { line: "DEF", x: 12, y: 64 }, { line: "DEF", x: 37, y: 68 }, { line: "DEF", x: 63, y: 68 }, { line: "DEF", x: 88, y: 64 },
  { line: "ARQ", x: 50, y: 88 },
];

const notLine = (c: Condition) => !c.id.startsWith("line-");
export const fitsSlot = (p: Player, line: Line, c: Condition, today: Date) => POSITIONS[p.position]?.line === line && c.test(p, today);

/** Genera consignas del día que tengan solución completa (11 jugadores distintos). */
export function buildOnce(players: Player[], seed: number, today: Date): Condition[] {
  const pool = CONDITIONS.filter(notLine);
  const r = rng(seed);
  for (let attempt = 0; attempt < 400; attempt++) {
    const order = shuffled(pool, Math.floor(r() * 1e9));
    const used = new Set<string>();
    const conds: Condition[] = [];
    for (const slot of FORMATION) {
      const c = order.find((c) => !used.has(c.id) && players.some((p) => fitsSlot(p, slot.line, c, today)));
      if (!c) break;
      used.add(c.id);
      conds.push(c);
    }
    if (conds.length !== FORMATION.length) continue;
    const cand = FORMATION.map((slot, i) => players.flatMap((p, j) => (fitsSlot(p, slot.line, conds[i], today) ? [j] : [])));
    if (perfectMatching(cand)) return conds;
  }
  throw new Error("No se pudo generar un 11 resoluble");
}
