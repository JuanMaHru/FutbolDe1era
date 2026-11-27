import type { GameId } from "./types";

/** Catálogo de retos diarios: título, ruta, intentos máximos (para estadísticas) y emoji. */
export interface DailyMeta {
  id: GameId;
  title: string;
  short: string;
  path: string;
  max: number;
  icon: string;
}

export const DAILY: DailyMeta[] = [
  { id: "jugador", title: "Adiviná el Jugador", short: "Jugador", path: "/jugador", max: 8, icon: "👟" },
  { id: "dt", title: "Adiviná el DT", short: "DT", path: "/dt", max: 8, icon: "📋" },
  { id: "tray", title: "Trayectoria", short: "Trayectoria", path: "/trayectoria", max: 6, icon: "🧭" },
  { id: "traydt", title: "Trayectoria DT", short: "Tray. DT", path: "/trayectoria/dt", max: 6, icon: "🗺️" },
  { id: "once", title: "Armá el 11", short: "El 11", path: "/once", max: 11, icon: "🟩" },
  { id: "palabra", title: "Palabra Crack", short: "Palabra", path: "/palabra", max: 6, icon: "🔤" },
  { id: "bingo", title: "Bingo Futbolero", short: "Bingo", path: "/bingo", max: 16, icon: "🎱" },
  { id: "masomenos", title: "Más o Menos", short: "Más o Menos", path: "/mas-o-menos", max: 20, icon: "⚖️" },
];
export const DAILY_IDS = DAILY.map((d) => d.id);
export const dailyMeta = (id: GameId) => DAILY.find((d) => d.id === id)!;
export const dayPath = (id: GameId, day: number) => `${dailyMeta(id).path}/${day}`;
