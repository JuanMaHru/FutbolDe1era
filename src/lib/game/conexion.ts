/** "¿Quién jugó con quién?": unir dos jugadores con una cadena de compañeros (mismo club, años que se cruzan). */
import valuesData from "@/data/values.json";
import { CAREERS, type Stint } from "./careers";
import { PLAYERS } from "./games";
import { careerOf } from "./bios";
import { rng } from "./daily";

export interface Person { id: string; name: string; career: Stint[] }
const NOW = 2026;
const byId = new Map<string, Person>();
for (const p of PLAYERS) { const c = careerOf(p.id); if (c.length) byId.set(p.id, { id: p.id, name: p.name, career: c }); }
for (const c of CAREERS) if (c.kind === "jugador" && !byId.has(c.id)) byId.set(c.id, { id: c.id, name: c.name, career: c.career });
export const PEOPLE = [...byId.values()];
export const personOf = (id: string) => byId.get(id);

/** Club y años en que coincidieron (o null). */
export function sharedSpell(a: Person, b: Person): { club: string; from: number; to: number } | null {
  for (const x of a.career) for (const y of b.career) {
    if (x.club !== y.club) continue;
    const from = Math.max(x.from, y.from), to = Math.min(x.to ?? NOW, y.to ?? NOW);
    if (from <= to) return { club: x.club, from, to };
  }
  return null;
}

let graph: Map<string, string[]> | null = null;
function adj() {
  if (graph) return graph;
  graph = new Map(PEOPLE.map((p) => [p.id, [] as string[]]));
  const byClub = new Map<string, Person[]>();
  PEOPLE.forEach((p) => new Set(p.career.map((s) => s.club)).forEach((c) => byClub.set(c, [...(byClub.get(c) ?? []), p])));
  for (const list of byClub.values())
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++)
      if (sharedSpell(list[i], list[j]) && !graph.get(list[i].id)!.includes(list[j].id)) { graph.get(list[i].id)!.push(list[j].id); graph.get(list[j].id)!.push(list[i].id); }
  return graph;
}

export function shortestPath(a: string, b: string): string[] | null {
  const g = adj(); const prev = new Map<string, string>([[a, ""]]); const q = [a];
  while (q.length) {
    const x = q.shift()!;
    if (x === b) { const path = [b]; let c = b; while (prev.get(c)) { c = prev.get(c)!; path.unshift(c); } return path; }
    for (const y of g.get(x) ?? []) if (!prev.has(y)) { prev.set(y, x); q.push(y); }
  }
  return null;
}

/** Par del día: dos figuras conocidas a 2-3 pasos (1 o 2 jugadores en el medio). */
export function dailyPair(seed: number): { a: string; b: string; best: string[] } {
  const famous = Object.keys(valuesData).filter((id) => byId.has(id));
  const r = rng(seed);
  for (let t = 0; t < 500; t++) {
    const a = famous[Math.floor(r() * famous.length)], b = famous[Math.floor(r() * famous.length)];
    if (a === b) continue;
    const p = shortestPath(a, b);
    if (p && (p.length === 3 || p.length === 4)) return { a, b, best: p };
  }
  const a = famous[0]; const b = famous[1]; return { a, b, best: shortestPath(a, b) ?? [a, b] };
}
