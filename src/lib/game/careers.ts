import careersData from "@/data/careers.json";

export interface Stint {
  club: string;
  from: number;
  to: number | null;
  loan?: boolean;
}
export interface CareerEntry {
  id: string;
  kind: "jugador" | "dt";
  name: string;
  nationality: string;
  position?: string;
  career: Stint[];
}

export const CAREERS = careersData as CareerEntry[];
export const careersOf = (kind: "jugador" | "dt") => CAREERS.filter((c) => c.kind === kind);

export const yearsLabel = (s: Stint) => (s.to === null ? `${s.from}–hoy` : s.from === s.to ? `${s.from}` : `${s.from}–${s.to}`);

/** Orden cronológico estable (los préstamos quedan en su año). */
export const sortedCareer = (c: CareerEntry) => [...c.career].sort((a, b) => a.from - b.from);

/** Cuántos clubes se muestran tras `wrong` errores: arranca con 1 y reparte el resto en los intentos. */
export function revealedCount(total: number, wrong: number, maxGuesses: number): number {
  const step = Math.max(1, Math.ceil((total - 1) / (maxGuesses - 1)));
  return Math.min(total, 1 + wrong * step);
}
