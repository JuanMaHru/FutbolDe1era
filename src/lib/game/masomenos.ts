/**
 * "Más o Menos" (higher or lower): ¿el siguiente tiene más o menos que el anterior?
 * Temáticas de jugadores (valor de mercado, edad, altura, selección, clubes) y de clubes (fundación, estadio).
 */
import playersData from "@/data/players.json";
import holData from "@/data/hol.json";
import valuesData from "@/data/values.json";
import { ageOn } from "./compare";
import { rng, shuffled } from "./daily";

export interface HolItem { id: string; name: string; kind: "jugador" | "club"; value: number; sub: string }
export interface Theme {
  id: string;
  kind: "jugador" | "club";
  label: string;
  /** Cómo se muestra el valor. */
  fmt: (v: number) => string;
  /** Pregunta con {a} (referencia, arriba) y {b} (el de abajo). */
  ask: string;
  more: string;
  less: string;
  approx?: boolean;
  items: (today: Date) => HolItem[];
}

type P = { id: string; name: string; club: string; nationality: string; birthDate: string; check?: boolean };
const PL = (playersData as P[]).filter((p) => !p.check);
const HP = (holData as unknown as { players: Record<string, Record<string, number>> }).players;
const HC = (holData as unknown as { clubs: Record<string, { fundacion?: number; capacidad?: number; estadio?: string }> }).clubs;
const VAL = valuesData as unknown as Record<string, [number, number]>;

const fromPlayers = (key: string) => (): HolItem[] =>
  PL.flatMap((p) => (HP[p.id]?.[key] ? [{ id: p.id, name: p.name, kind: "jugador" as const, value: HP[p.id][key], sub: p.club }] : []));

export const THEMES: Theme[] = [
  { id: "valor", kind: "jugador", label: "Valor de mercado actual", fmt: (v) => `≈ ${v} M€`, ask: "¿{b} vale más o menos que {a}?", more: "Vale más", less: "Vale menos", approx: true,
    items: () => PL.flatMap((p) => (VAL[p.id] ? [{ id: p.id, name: p.name, kind: "jugador" as const, value: VAL[p.id][0], sub: p.club }] : [])) },
  { id: "valormax", kind: "jugador", label: "Valor de mercado máximo de su carrera", fmt: (v) => `≈ ${v} M€`, ask: "¿{b} llegó a valer más o menos que {a}?", more: "Más", less: "Menos", approx: true,
    items: () => PL.flatMap((p) => (VAL[p.id] ? [{ id: p.id, name: p.name, kind: "jugador" as const, value: VAL[p.id][1], sub: p.club }] : [])) },
  { id: "edad", kind: "jugador", label: "Edad", fmt: (v) => `${v} años`, ask: "¿{b} es más grande o más joven que {a}?", more: "Más grande", less: "Más joven",
    items: (d) => PL.map((p) => ({ id: p.id, name: p.name, kind: "jugador" as const, value: ageOn(p.birthDate, d), sub: p.club })) },
  { id: "altura", kind: "jugador", label: "Altura", fmt: (v) => `${(v / 100).toFixed(2).replace(".", ",")} m`, ask: "¿{b} es más alto o más bajo que {a}?", more: "Más alto", less: "Más bajo", items: fromPlayers("altura") },
  { id: "partidos", kind: "jugador", label: "Partidos con su selección", fmt: (v) => `${v} partidos`, ask: "¿{b} jugó más o menos partidos con su selección que {a}?", more: "Más", less: "Menos", items: fromPlayers("partidosSeleccion") },
  { id: "goles", kind: "jugador", label: "Goles con su selección", fmt: (v) => `${v} goles`, ask: "¿{b} hizo más o menos goles con su selección que {a}?", more: "Más", less: "Menos", items: fromPlayers("golesSeleccion") },
  { id: "clubes", kind: "jugador", label: "Clubes en su carrera", fmt: (v) => `${v} clubes`, ask: "¿{b} pasó por más o menos clubes que {a}?", more: "Más", less: "Menos", items: fromPlayers("clubes") },
  { id: "fundacion", kind: "club", label: "Año de fundación", fmt: (v) => String(v), ask: "¿{b} se fundó antes o después que {a}?", more: "Después", less: "Antes",
    items: () => Object.entries(HC).flatMap(([n, c]) => (c.fundacion ? [{ id: n, name: n, kind: "club" as const, value: c.fundacion, sub: "Fundación" }] : [])) },
  { id: "estadio", kind: "club", label: "Capacidad de su estadio", fmt: (v) => v.toLocaleString("es-AR"), ask: "¿El estadio de {b} tiene más o menos capacidad que el de {a}?", more: "Más", less: "Menos",
    items: () => Object.entries(HC).flatMap(([n, c]) => (c.capacidad ? [{ id: n, name: n, kind: "club" as const, value: c.capacidad, sub: c.estadio ?? "Estadio" }] : [])) },
];
export const usableThemes = (today: Date) => THEMES.filter((t) => t.items(today).length >= 12);

export interface Round { theme: string; a: HolItem; b: HolItem }
export const MAX_ROUNDS = 20;

/**
 * Secuencia del día: tramos de 4 rondas por temática; dentro del tramo se encadena (el B pasa a ser el A).
 * Nunca hay empates.
 */
export function buildRounds(seed: number, today: Date, only?: string): Round[] {
  const r = rng(seed);
  const themes = usableThemes(today).filter((t) => !only || t.id === only);
  const order = shuffled(themes, Math.floor(r() * 1e9));
  const rounds: Round[] = [];
  for (let k = 0; rounds.length < MAX_ROUNDS && themes.length; k++) {
    const th = order[k % order.length];
    const pool = shuffled(th.items(today), Math.floor(r() * 1e9));
    let a = pool[0];
    const seg = only ? MAX_ROUNDS : 4;
    for (let i = 1, n = 0; i < pool.length && n < seg && rounds.length < MAX_ROUNDS; i++) {
      const b = pool[i];
      if (b.value === a.value) continue;
      // Evita comparaciones demasiado parejas en valores aproximados.
      if (th.approx && Math.abs(b.value - a.value) / Math.max(a.value, b.value) < 0.12) continue;
      rounds.push({ theme: th.id, a, b });
      a = b; n++;
    }
  }
  return rounds;
}
export const themeOf = (id: string) => THEMES.find((t) => t.id === id)!;
