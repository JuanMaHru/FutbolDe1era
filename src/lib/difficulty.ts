/**
 * Niveles por juego.
 * Fácil: más conocidos, más intentos, sin reloj. Medio: conocidos, menos intentos y reloj. Difícil: a veces menos conocidos, reloj más corto.
 * Los puntos de liga se multiplican según el nivel (más difícil, más puntos).
 */
import fameData from "@/data/fame.json";
import type { GameId } from "./game/types";
import { read, write } from "./storage";

export type Level = "facil" | "medio" | "dificil";
export const LEVELS: Level[] = ["facil", "medio", "dificil"];
export const LEVEL_LABEL: Record<Level, string> = { facil: "Fácil", medio: "Medio", dificil: "Difícil" };
export const LEVEL_ICON: Record<Level, string> = { facil: "🟢", medio: "🟡", dificil: "🔴" };
export const MULT: Record<Level, number> = { facil: 0.6, medio: 1, dificil: 1.4 };

/** tries: intentos/vidas/tarjetas según el juego. time: segundos totales (0 = sin reloj). perRound: segundos por jugada. */
export interface LevelCfg { tries: number; time: number; perRound?: number }
type Cfg = Record<Level, LevelCfg>;
const c = (f: LevelCfg, m: LevelCfg, d: LevelCfg): Cfg => ({ facil: f, medio: m, dificil: d });
export const DIFF: Partial<Record<GameId, Cfg & { unit: string }>> = {
  jugador: { ...c({ tries: 10, time: 0 }, { tries: 7, time: 180 }, { tries: 7, time: 120 }), unit: "intentos" },
  dt: { ...c({ tries: 10, time: 0 }, { tries: 7, time: 180 }, { tries: 7, time: 120 }), unit: "intentos" },
  tray: { ...c({ tries: 8, time: 0 }, { tries: 6, time: 150 }, { tries: 6, time: 100 }), unit: "intentos" },
  traydt: { ...c({ tries: 5, time: 0 }, { tries: 3, time: 120 }, { tries: 3, time: 80 }), unit: "vidas" },
  palabra: { ...c({ tries: 8, time: 0 }, { tries: 6, time: 180 }, { tries: 6, time: 120 }), unit: "intentos" },
  once: { ...c({ tries: 5, time: 0 }, { tries: 3, time: 300 }, { tries: 3, time: 210 }), unit: "tarjetas" },
  bingo: { ...c({ tries: 5, time: 0 }, { tries: 3, time: 300 }, { tries: 3, time: 210 }), unit: "errores" },
  club: { ...c({ tries: 8, time: 0 }, { tries: 6, time: 150 }, { tries: 6, time: 100 }), unit: "intentos" },
  conexion: { ...c({ tries: 6, time: 0 }, { tries: 4, time: 240 }, { tries: 4, time: 150 }), unit: "vidas" },
  masomenos: { ...c({ tries: 0, time: 0 }, { tries: 0, time: 0, perRound: 15 }, { tries: 0, time: 0, perRound: 8 }), unit: "" },
  intruso: { ...c({ tries: 0, time: 0 }, { tries: 0, time: 0, perRound: 25 }, { tries: 0, time: 0, perRound: 15 }), unit: "" },
  anios: { ...c({ tries: 0, time: 0 }, { tries: 0, time: 0, perRound: 25 }, { tries: 0, time: 0, perRound: 15 }), unit: "" },
};
export const cfgOf = (game: GameId, level: Level): LevelCfg => DIFF[game]?.[level] ?? { tries: 0, time: 0 };

/** Descripción corta para el selector. */
export function describe(game: GameId, level: Level): string {
  const d = DIFF[game]; if (!d) return "";
  const x = d[level]; const parts: string[] = [];
  if (game === "club") parts.push(level === "dificil" ? "Todos los clubes" : level === "facil" ? "Clubes grandes" : "Clubes conocidos");
  else if (game !== "palabra" && game !== "anios") parts.push(level === "dificil" ? "A veces menos conocidos" : level === "facil" ? "Los más conocidos" : "Jugadores conocidos");
  if (x.tries) parts.push(`${x.tries} ${d.unit}`);
  if (x.perRound) parts.push(`${x.perRound} s por jugada`);
  else parts.push(x.time ? `${Math.floor(x.time / 60)}:${String(x.time % 60).padStart(2, "0")} min` : "sin reloj");
  return parts.join(" · ");
}

/** Lo que eligió el jugador para este juego y día. start = cuándo arrancó el reloj (ms). */
export interface DiffState { level: Level; start: number | null }
export const loadDiff = (game: GameId, key: string) => read<DiffState | null>(`diff:${game}:${key}`, null);
export const lastLevel = (game: GameId): Level => read<Level>(`diff:last:${game}`, "medio");
export function chooseLevel(game: GameId, key: string, level: Level): DiffState {
  const s = { level, start: Date.now() };
  write(`diff:${game}:${key}`, s); write(`diff:last:${game}`, level);
  return s;
}

/** Popularidad (cantidad de Wikipedias con artículo). "Conocido" = el 55% más popular. */
const FAME = fameData as Record<string, number>;
const sorted = Object.values(FAME).sort((a, b) => b - a);
const CUT = sorted[Math.floor(sorted.length * 0.55)] ?? 0;
export const fameOf = (id: string) => FAME[id] ?? 0;
export const isKnown = (id: string) => fameOf(id) >= CUT;
/** Filtra el pool según el nivel (difícil usa todos). Si queda muy chico, devuelve el original. */
export function poolFor<T extends { id: string }>(items: T[], level: Level): T[] {
  if (level === "dificil") return items;
  const known = items.filter((x) => isKnown(x.id));
  const top = level === "facil" ? known.filter((x) => fameOf(x.id) >= (sorted[Math.floor(sorted.length * 0.3)] ?? 0)) : known;
  return top.length >= 15 ? top : known.length >= 15 ? known : items;
}
/** Semilla distinta por nivel: cada nivel tiene su propio reto del día (igual para todos los que eligen ese nivel). */
export const levelSeed = (seed: number, level: Level) => seed + (level === "facil" ? 0 : level === "medio" ? 7919 : 15887);
