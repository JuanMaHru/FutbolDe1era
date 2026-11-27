/**
 * Datos extra de cada persona: trayectoria (de careers.json, curada, o de Wikidata) y foto libre (Wikimedia Commons).
 * bios.json y photos.json se generan con tools/build_bios.py y tools/fetch_photos.py.
 */
import biosData from "@/data/bios.json";
import photosData from "@/data/photos.json";
import localImages from "@/data/images-local.json";
import { CAREERS, type Stint } from "./careers";

export interface Photo { url: string; author: string; license: string; page: string }
const BIOS = biosData as Record<string, { career: Stint[] }>;
const PHOTOS = photosData as Record<string, Photo>;

/** Trayectoria por clubes (sin selecciones), en orden. Prioriza la curada. */
export function careerOf(id: string): Stint[] {
  const curated = CAREERS.find((c) => c.id === id);
  const list = curated?.career ?? BIOS[id]?.career ?? [];
  return [...list].sort((a, b) => a.from - b.from);
}
/** Si la foto ya está descargada en el sitio, se usa esa copia (más confiable que cargarla de Wikimedia). */
const LOCAL = (localImages as { photos: Record<string, string> }).photos;
export const photoOf = (id: string): Photo | undefined => (PHOTOS[id] ? { ...PHOTOS[id], url: LOCAL[id] ?? PHOTOS[id].url } : undefined);

export interface Hint { label: string; value: string; at: number }

const initials = (name: string) => {
  const parts = name.split(" ");
  const last = parts[parts.length - 1];
  return parts.length > 1 ? `${parts[0][0]}. ${last[0]}…` : `${name[0]}…`;
};

/**
 * Pistas que se desbloquean con los errores (`at` = errores necesarios).
 * Agregan información que la grilla no da: primer club, recorrido, iniciales.
 */
export function hintsFor(kind: "jugador" | "dt", item: { id: string; name: string; club?: string; team?: string; birthDate?: string; debutYear?: number }): Hint[] {
  const car = careerOf(item.id);
  const current = kind === "jugador" ? item.club : item.team;
  const past = car.filter((s) => s.club !== current);
  const out: Hint[] = [];
  if (kind === "jugador") {
    if (car.length) out.push({ label: "Primer club", value: `${car[0].club} (${car[0].from})`, at: 2 });
    else if (item.birthDate) out.push({ label: "Nació en", value: item.birthDate.slice(0, 4), at: 2 });
    if (past.length >= 2) out.push({ label: "También jugó en", value: past[past.length - 1].club === car[0].club ? past[1].club : past[past.length - 1].club, at: 4 });
    else if (car.length) out.push({ label: "Clubes en su carrera", value: String(new Set(car.map((s) => s.club)).size), at: 4 });
  } else {
    if (item.debutYear) out.push({ label: "Dirige desde", value: String(item.debutYear), at: 2 });
    if (car.length) out.push({ label: "Como jugador pasó por", value: car[Math.floor(car.length / 2)].club, at: 4 });
    else if (item.birthDate) out.push({ label: "Nació en", value: item.birthDate.slice(0, 4), at: 4 });
  }
  out.push({ label: "Iniciales", value: initials(item.name), at: 6 });
  return out;
}
