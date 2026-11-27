import careersData from "@/data/careers.json";
import biosData from "@/data/bios.json";
import playersData from "@/data/players.json";

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

const CURATED = careersData as CareerEntry[];
/** Trayectorias de Wikidata para jugadores de la base (verificados y con al menos 4 clubes distintos). */
const DERIVED: CareerEntry[] = (playersData as { id: string; name: string; nationality: string; position: string; check?: boolean }[])
  .filter((p) => !p.check && !CURATED.some((c) => c.id === p.id))
  .flatMap((p) => {
    const career = (biosData as Record<string, { career: Stint[] }>)[p.id]?.career;
    if (!career || new Set(career.map((s) => s.club)).size < 4) return [];
    return [{ id: p.id, kind: "jugador" as const, name: p.name, nationality: p.nationality, position: p.position, career }];
  });
export const CAREERS = [...CURATED, ...DERIVED];
export const careersOf = (kind: "jugador" | "dt") => CAREERS.filter((c) => c.kind === kind);

export const yearsLabel = (s: Stint) => (s.to === null ? `${s.from}–hoy` : s.from === s.to ? `${s.from}` : `${s.from}–${s.to}`);

/** Orden cronológico estable (los préstamos quedan en su año). */
export const sortedCareer = (c: CareerEntry) => [...c.career].sort((a, b) => a.from - b.from);

/** Cuántos clubes se muestran tras `wrong` errores: arranca con 1 y reparte el resto en los intentos. */
export function revealedCount(total: number, wrong: number, maxGuesses: number): number {
  const step = Math.max(1, Math.ceil((total - 1) / (maxGuesses - 1)));
  return Math.min(total, 1 + wrong * step);
}
