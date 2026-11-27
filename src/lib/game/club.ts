/** "¿De qué club es?": pistas que se van abriendo (colores, liga, fundación, estadio, un jugador, iniciales). */
import holData from "@/data/hol.json";
import { CLUBS } from "@/lib/clubs";
import { BY_NAME_LEAGUE } from "@/lib/career/world";
import { PEOPLE } from "./conexion";

export interface ClubTarget { id: string; name: string; league?: string; fundacion?: number; estadio?: string; capacidad?: number; player?: string }
const HC = (holData as unknown as { clubs: Record<string, { fundacion?: number; capacidad?: number; estadio?: string }> }).clubs;

/** Clubes con identidad visual propia y datos suficientes para dar pistas. */
export const CLUB_TARGETS: ClubTarget[] = Object.keys(CLUBS)
  .filter((n) => HC[n]?.fundacion && HC[n]?.estadio)
  .map((n) => {
    const famous = PEOPLE.find((p) => p.career.some((s) => s.club === n));
    return { id: n, name: n, league: BY_NAME_LEAGUE(n), ...HC[n], player: famous?.name };
  });
/** Todos los clubes que se pueden escribir como respuesta. */
export const CLUB_OPTIONS = [...new Set([...Object.keys(CLUBS), ...Object.keys(HC)])].map((n) => ({ id: n, name: n }));
export const MAX = 6;
