import type { GameId } from "./game/types";
import { read, write } from "./storage";

/**
 * Progreso del usuario. Hoy vive en localStorage; la forma de los datos está
 * pensada para migrar tal cual a Supabase (tablas: daily_results, profiles).
 */

export interface DailyState {
  guesses: string[]; // ids, en orden
  done: boolean;
  won: boolean;
}

export interface GameStats {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  lastPlayed?: string; // dateKey del último reto terminado
  dist: number[]; // dist[i] = victorias en i+1 intentos
}

export interface Profile {
  name: string;
  /** Moneda puente con el Modo Carrera (Fase 2). */
  reputation: number;
  /** Puntos por día y juego: results["2026-11-25"].jugador = 8 */
  results: Record<string, Partial<Record<GameId, number>>>;
}

const emptyStats = (max: number): GameStats => ({ played: 0, won: 0, streak: 0, maxStreak: 0, dist: Array(max).fill(0) });

export const loadDaily = (game: GameId, key: string) =>
  read<DailyState>(`daily:${game}:${key}`, { guesses: [], done: false, won: false });
export const saveDaily = (game: GameId, key: string, s: DailyState) => write(`daily:${game}:${key}`, s);

/** Estado diario genérico para juegos con forma propia (bingo, 11, palabra…). Siempre incluye done/won. */
export interface BaseState {
  done: boolean;
  won: boolean;
  /** Texto corto para el archivo/inicio, p. ej. "9/11" o "3/6". */
  summary?: string;
  guesses?: string[];
}
export const loadState = <S extends BaseState>(game: GameId, key: string, fallback: S) => read<S>(`daily:${game}:${key}`, fallback);
export const saveState = <S extends BaseState>(game: GameId, key: string, s: S) => write(`daily:${game}:${key}`, s);

export const loadStats = (game: GameId, max: number) => read<GameStats>(`stats:${game}`, emptyStats(max));

export const loadProfile = () => read<Profile>("profile", { name: "", reputation: 0, results: {} });
export const saveProfile = (p: Profile) => write("profile", p);

function previousKey(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Registra el final de un reto diario. Idempotente por (juego, día). */
export function recordFinish(game: GameId, key: string, won: boolean, guesses: number, max: number, pts: number) {
  const stats = loadStats(game, max);
  if (stats.lastPlayed === key) return { stats, profile: loadProfile(), repGain: 0 };

  stats.played++;
  if (won) {
    stats.won++;
    stats.dist[guesses - 1] = (stats.dist[guesses - 1] ?? 0) + 1;
    stats.streak = stats.lastPlayed === previousKey(key) || stats.streak === 0 ? stats.streak + 1 : 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
  } else {
    stats.streak = 0;
  }
  stats.lastPlayed = key;
  write(`stats:${game}`, stats);

  // Reputación: puntos del reto + bonus por racha. Perder no resta en la Fase 1;
  // en la Fase 2 una derrota bajará la "confianza" del club dentro de la carrera.
  const repGain = pts + (won ? Math.min(stats.streak, 5) : 0);
  const profile = loadProfile();
  profile.reputation += repGain;
  profile.results[key] = { ...profile.results[key], [game]: pts };
  saveProfile(profile);
  return { stats, profile, repGain };
}

/**
 * Final de un reto de archivo (día anterior): suma media reputación, no toca racha
 * ni puntos de liga. Idempotente por (juego, día).
 */
export function recordArchive(game: GameId, key: string, pts: number) {
  const done = read<string[]>(`archive:${game}`, []);
  if (done.includes(key)) return { profile: loadProfile(), repGain: 0 };
  write(`archive:${game}`, [...done, key]);
  const repGain = Math.floor(pts / 2);
  const profile = loadProfile();
  profile.reputation += repGain;
  saveProfile(profile);
  return { profile, repGain };
}
