/**
 * Álbum de figuritas GRATIS: se consiguen jugando los retos del día (sin compras ni sobres pagos).
 * Cada reto diario terminado da un sobre (3 figuritas si ganaste, 1 si no). Determinístico por día y juego.
 * Las figuritas nuevas quedan "para pegar" hasta que las pegás en su lugar del álbum.
 */
import photosData from "@/data/photos.json";
import playersData from "@/data/players.json";
import coachesData from "@/data/coaches.json";
import careersData from "@/data/careers.json";
import valuesData from "@/data/values.json";
import { rng } from "./game/daily";
import { read, write } from "./storage";

export type Rarity = "comun" | "especial" | "leyenda";
export interface Sticker { id: string; name: string; club: string; nationality: string; n: number; rarity: Rarity; section: string; note?: string }
export const RARITY_LABEL: Record<Rarity, string> = { comun: "Común", especial: "Estrella", leyenda: "Leyenda" };

const PH = photosData as Record<string, unknown>;
const VAL = valuesData as unknown as Record<string, [number, number]>;
type P = { id: string; name: string; club: string; nationality: string; league: string; check?: boolean };
const PLAYERS = (playersData as P[]).filter((p) => !p.check && PH[p.id]);

/** Ex jugadores que hoy son DT y fueron figuras: van como leyendas. */
const COACH_LEGENDS = ["diego-simeone", "marcelo-gallardo", "xabi-alonso", "didier-deschamps", "hernan-crespo", "cesc-fabregas", "gennaro-gattuso", "ronald-koeman",
  "pep-guardiola", "luis-enrique", "carlo-ancelotti", "filipe-luis", "vincent-kompany", "mauricio-pochettino", "guillermo-barros-schelotto"];

const SECTIONS: { title: string; test: (p: P) => boolean }[] = [
  { title: "Liga Profesional", test: (p) => p.league === "Liga Profesional" },
  { title: "Sudamérica", test: (p) => ["Brasileirão", "Liga Uruguaya", "Primera Chile", "Liga Colombiana"].includes(p.league) },
  { title: "Premier League", test: (p) => p.league === "Premier League" },
  { title: "LaLiga", test: (p) => p.league === "LaLiga" },
  { title: "Serie A", test: (p) => p.league === "Serie A" },
  { title: "Bundesliga y Ligue 1", test: (p) => ["Bundesliga", "Ligue 1"].includes(p.league) },
  { title: "Resto de Europa", test: (p) => ["Primeira Liga", "Eredivisie", "Süper Lig", "Liga Belga", "Liga Rusa"].includes(p.league) },
  { title: "América del Norte", test: (p) => ["MLS", "Liga MX"].includes(p.league) },
  { title: "Arabia y Asia", test: () => true },
];

function build(): Sticker[] {
  const out: Omit<Sticker, "n">[] = [];
  // Leyendas: retirados de las trayectorias curadas + ex cracks que hoy dirigen.
  const playerIds = new Set((playersData as P[]).map((p) => p.id));
  for (const c of careersData as { id: string; kind: string; name: string; nationality: string; career: { club: string }[] }[])
    if (c.kind === "jugador" && !playerIds.has(c.id) && PH[c.id]) out.push({ id: c.id, name: c.name, club: c.career[c.career.length - 1]?.club ?? "", nationality: c.nationality, rarity: "leyenda", section: "Leyendas", note: "Retirado" });
  for (const c of coachesData as { id: string; name: string; team: string; nationality: string }[])
    if (COACH_LEGENDS.includes(c.id) && PH[c.id]) out.push({ id: c.id, name: c.name, club: c.team, nationality: c.nationality, rarity: "leyenda", section: "Leyendas", note: `Hoy DT de ${c.team}` });
  // Estrellas: los de mayor valor de mercado actual.
  const stars = new Set(PLAYERS.filter((p) => (VAL[p.id]?.[0] ?? 0) >= 80).map((p) => p.id));
  PLAYERS.filter((p) => stars.has(p.id)).forEach((p) => out.push({ id: p.id, name: p.name, club: p.club, nationality: p.nationality, rarity: "especial", section: "Estrellas" }));
  // Comunes, por liga.
  const rest = PLAYERS.filter((p) => !stars.has(p.id));
  const used = new Set<string>();
  for (const s of SECTIONS)
    for (const p of rest) if (!used.has(p.id) && s.test(p)) { used.add(p.id); out.push({ id: p.id, name: p.name, club: p.club, nationality: p.nationality, rarity: "comun", section: s.title }); }
  return out.map((s, i) => ({ ...s, n: i + 1 }));
}
export const STICKERS = build();
export const SECTION_ORDER = [...new Set(STICKERS.map((s) => s.section))];
const BY_ID = new Map(STICKERS.map((s) => [s.id, s]));
export const stickerOf = (id: string) => BY_ID.get(id);

/** pasted: pegadas en el álbum. tray: figuritas sueltas (nuevas para pegar o repetidas). */
export interface AlbumState { pasted: string[]; tray: string[]; packs: { from: string; size: number }[]; claimed: string[] }
const EMPTY: AlbumState = { pasted: [], tray: [], packs: [], claimed: [] };

export function loadAlbum(): AlbumState {
  const a = read<AlbumState & { have?: Record<string, number> }>("album", EMPTY);
  // Migración del álbum anterior (todo pegado, repetidas a la pila).
  if (a.have && !a.pasted) {
    const pasted = Object.keys(a.have).filter((id) => BY_ID.has(id));
    const tray = Object.entries(a.have).flatMap(([id, n]) => (BY_ID.has(id) ? Array(Math.max(0, n - 1)).fill(id) : []));
    return { pasted, tray, packs: a.packs ?? [], claimed: a.claimed ?? [] };
  }
  return { ...EMPTY, ...a };
}
const save = (a: AlbumState) => {
  write("album", { pasted: a.pasted, tray: a.tray, packs: a.packs, claimed: a.claimed });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("primera:album"));
};

/** Al terminar un reto del día: deja un sobre para abrir (una sola vez por juego y día). */
export function grantPack(game: string, key: string, won: boolean) {
  const a = loadAlbum(); const tag = `${key}:${game}`;
  if (a.claimed.includes(tag)) return;
  save({ ...a, claimed: [...a.claimed, tag].slice(-400), packs: [...a.packs, { from: tag, size: won ? 3 : 1 }] });
}

/** Abre el próximo sobre: 6% leyenda, 16% estrella, el resto comunes. Suele traer figuritas que te faltan. */
export function openPack(): Sticker[] {
  const a = loadAlbum(); const pack = a.packs[0];
  if (!pack) return [];
  let seed = 0; for (const ch of pack.from) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const r = rng(seed); const got: Sticker[] = [];
  const owned = new Set([...a.pasted, ...a.tray]);
  for (let i = 0; i < pack.size; i++) {
    const x = r();
    const rarity: Rarity = x < 0.06 ? "leyenda" : x < 0.22 ? "especial" : "comun";
    const tier = STICKERS.filter((s) => s.rarity === rarity);
    const missing = tier.filter((s) => !owned.has(s.id) && !got.includes(s));
    const pool = missing.length && r() < 0.7 ? missing : tier;
    const s = pool[Math.floor(r() * pool.length)];
    got.push(s); owned.add(s.id);
  }
  save({ ...a, tray: [...a.tray, ...got.map((s) => s.id)], packs: a.packs.slice(1) });
  return got;
}

/** Pega una figurita de la pila en su lugar. Devuelve false si no la tenés o ya estaba pegada. */
export function paste(id: string): boolean {
  const a = loadAlbum();
  const i = a.tray.indexOf(id);
  if (i < 0 || a.pasted.includes(id)) return false;
  const tray = [...a.tray]; tray.splice(i, 1);
  save({ ...a, pasted: [...a.pasted, id], tray });
  return true;
}
