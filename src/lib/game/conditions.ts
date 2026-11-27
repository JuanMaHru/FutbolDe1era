import type { Player } from "./types.ts";
import { COUNTRIES, LEAGUES, POSITIONS, type Line } from "./meta.ts";
import { ageOn } from "./compare.ts";

/** Consigna que un jugador cumple o no (para Armá el 11 y el Bingo). */
export interface Condition {
  id: string;
  label: string;
  icon: string;
  test: (p: Player, today: Date) => boolean;
}

const nat = (code: string, label: string): Condition => ({ id: `nat-${code}`, label, icon: COUNTRIES[code]?.flag ?? "🏳️", test: (p) => p.nationality === code });
const league = (l: string, label = l): Condition => ({ id: `lg-${l}`, label, icon: "🏆", test: (p) => p.league === l });
const club = (c: string, label = c): Condition => ({ id: `club-${c}`, label, icon: "🛡️", test: (p) => p.club === c });
const everIn = (p: Player) => new Set([...(p.clubs ?? []), p.club]);
const ever = (c: string, label: string): Condition => ({ id: `ever-${c}`, label, icon: "🧭", test: (p) => everIn(p).has(c) });
const line = (l: Line, label: string, icon: string): Condition => ({ id: `line-${l}`, label, icon, test: (p) => POSITIONS[p.position]?.line === l });

export const CONDITIONS: Condition[] = [
  nat("ARG", "Argentino"),
  nat("URU", "Uruguayo"),
  nat("COL", "Colombiano"),
  nat("BRA", "Brasileño"),
  { id: "conmebol-no-arg", label: "Sudamericano no argentino", icon: "🌎", test: (p) => COUNTRIES[p.nationality]?.confed === "CONMEBOL" && p.nationality !== "ARG" },
  { id: "uefa", label: "Europeo", icon: "🇪🇺", test: (p) => COUNTRIES[p.nationality]?.confed === "UEFA" },
  league("Liga Profesional", "Juega en Argentina"),
  league("Premier League", "Juega en la Premier"),
  league("LaLiga", "Juega en LaLiga"),
  league("Serie A", "Juega en Serie A"),
  { id: "lg-america-norte", label: "Juega en MLS o México", icon: "🌮", test: (p) => p.league === "MLS" || p.league === "Liga MX" },
  { id: "lg-europa-otra", label: "Bundesliga, Ligue 1 o Portugal", icon: "🏆", test: (p) => ["Bundesliga", "Ligue 1", "Primeira Liga"].includes(p.league) },
  { id: "lg-europa", label: "Juega en Europa", icon: "🏰", test: (p) => LEAGUES[p.league]?.region === "Europa" },
  club("Boca Juniors", "Juega en Boca"),
  club("River Plate", "Juega en River"),
  club("Real Madrid", "Juega en el Real Madrid"),
  club("Atlético de Madrid", "Juega en el Atlético"),
  club("Estudiantes", "Juega en Estudiantes"),
  club("Inter Miami", "Juega en Inter Miami"),
  ever("Boca Juniors", "Jugó en Boca"),
  ever("River Plate", "Jugó en River"),
  ever("Barcelona", "Jugó en el Barcelona"),
  ever("Real Madrid", "Jugó en el Real Madrid"),
  ever("Atlético de Madrid", "Jugó en el Atlético de Madrid"),
  ever("Juventus", "Jugó en la Juventus"),
  ever("Inter", "Jugó en el Inter"),
  ever("Manchester United", "Jugó en el Manchester United"),
  ever("Chelsea", "Jugó en el Chelsea"),
  ever("Benfica", "Jugó en el Benfica"),
  ever("Paris Saint-Germain", "Jugó en el PSG"),
  { id: "clubs-5", label: "Pasó por 5 o más clubes", icon: "🧳", test: (p) => (p.clubs?.length ?? 0) > 0 && everIn(p).size >= 5 },
  { id: "age-35", label: "35 años o más", icon: "👴", test: (p, d) => ageOn(p.birthDate, d) >= 35 },
  { id: "age-25", label: "Menor de 25", icon: "🐣", test: (p, d) => ageOn(p.birthDate, d) < 25 },
  { id: "age-26-30", label: "Entre 26 y 30 años", icon: "🎂", test: (p, d) => { const a = ageOn(p.birthDate, d); return a >= 26 && a <= 30; } },
  { id: "num-10", label: "Usa la 10", icon: "🔟", test: (p) => p.number === 10 },
  { id: "num-9", label: "Usa la 9", icon: "9️⃣", test: (p) => p.number === 9 },
  { id: "num-1-8", label: "Dorsal del 1 al 8", icon: "🔢", test: (p) => p.number >= 1 && p.number <= 8 },
  { id: "num-20", label: "Dorsal 20 o más", icon: "🔢", test: (p) => p.number >= 20 },
  line("ARQ", "Arquero", "🧤"),
  line("DEF", "Defensor", "🛡️"),
  line("MED", "Mediocampista", "🎯"),
  line("DEL", "Delantero", "⚽"),
];

/** Emparejamiento bipartito (Kuhn): ¿cada fila puede tomar un candidato distinto? Devuelve asignación o null. */
export function perfectMatching(candidates: number[][]): number[] | null {
  const owner = new Map<number, number>();
  const tryRow = (r: number, seen: Set<number>): boolean => {
    for (const c of candidates[r]) {
      if (seen.has(c)) continue;
      seen.add(c);
      const o = owner.get(c);
      if (o === undefined || tryRow(o, seen)) {
        owner.set(c, r);
        return true;
      }
    }
    return false;
  };
  for (let r = 0; r < candidates.length; r++) if (!tryRow(r, new Set())) return null;
  const res = Array(candidates.length).fill(-1);
  for (const [c, r] of owner) res[r] = c;
  return res;
}
