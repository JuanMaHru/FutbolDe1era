import type { Arrow, Attribute, Cell, Coach, Player } from "./types.ts";
import { COUNTRIES, LEAGUES, POSITIONS } from "./meta.ts";

export function ageOn(birthDate: string, today: Date): number {
  const [y, m, d] = birthDate.split("-").map(Number);
  let age = today.getUTCFullYear() - y;
  const beforeBirthday =
    today.getUTCMonth() + 1 < m || (today.getUTCMonth() + 1 === m && today.getUTCDate() < d);
  if (beforeBirthday) age--;
  return age;
}

/** Numérico: verde si es igual, amarillo si está dentro de `tolerance`, con flecha hacia el objetivo. */
export function numeric(guess: number, target: number, tolerance: number, display = String(guess)): Cell {
  if (guess === target) return { status: "hit", display };
  const arrow: Arrow = target > guess ? "up" : "down";
  return { status: Math.abs(guess - target) <= tolerance ? "near" : "miss", display, arrow };
}

/** Categórico: verde si es igual, amarillo si comparten un grupo (misma liga, confederación, línea…). */
export function grouped(guess: string, target: string, group: (v: string) => string | undefined, display: string): Cell {
  if (guess === target) return { status: "hit", display };
  const g = group(guess);
  return { status: g !== undefined && g === group(target) ? "near" : "miss", display };
}

const confed = (code: string) => COUNTRIES[code]?.confed;
const region = (league: string) => LEAGUES[league]?.region;
const flag = (code: string) => `${COUNTRIES[code]?.flag ?? ""} ${code}`.trim();

export const playerAttributes: Attribute<Player>[] = [
  {
    key: "club",
    label: "Club",
    // Amarillo: mismo club no, pero misma liga.
    compare: (g, t) =>
      g.club === t.club
        ? { status: "hit", display: g.club }
        : { status: g.league === t.league ? "near" : "miss", display: g.club },
  },
  {
    key: "league",
    label: "Liga",
    compare: (g, t) => grouped(g.league, t.league, region, LEAGUES[g.league]?.short ?? g.league),
  },
  {
    key: "nationality",
    label: "País",
    compare: (g, t) => grouped(g.nationality, t.nationality, confed, flag(g.nationality)),
  },
  {
    key: "position",
    label: "Posición",
    compare: (g, t) =>
      grouped(g.position, t.position, (p) => POSITIONS[p]?.line, POSITIONS[g.position]?.label ?? g.position),
  },
  {
    key: "age",
    label: "Edad",
    compare: (g, t, today) => numeric(ageOn(g.birthDate, today), ageOn(t.birthDate, today), 2),
  },
  {
    key: "number",
    label: "Dorsal",
    compare: (g, t) => numeric(g.number, t.number, 3),
  },
];

/** Línea defensiva del esquema: "4-3-3" -> "4". */
const back = (formation: string) => formation.split("-")[0];

export const coachAttributes: Attribute<Coach>[] = [
  {
    key: "team",
    label: "Equipo",
    compare: (g, t) =>
      g.team === t.team
        ? { status: "hit", display: g.team }
        : { status: g.league === t.league ? "near" : "miss", display: g.team },
  },
  {
    key: "league",
    label: "Liga",
    compare: (g, t) => grouped(g.league, t.league, region, LEAGUES[g.league]?.short ?? g.league),
  },
  {
    key: "nationality",
    label: "País",
    compare: (g, t) => grouped(g.nationality, t.nationality, confed, flag(g.nationality)),
  },
  {
    key: "age",
    label: "Edad",
    compare: (g, t, today) => numeric(ageOn(g.birthDate, today), ageOn(t.birthDate, today), 3),
  },
  {
    key: "formation",
    label: "Esquema",
    // Amarillo: misma cantidad de defensores.
    compare: (g, t) => grouped(g.formation, t.formation, back, g.formation),
  },
  {
    key: "debut",
    label: "Debut DT",
    compare: (g, t) => numeric(g.debutYear, t.debutYear, 3),
  },
];
