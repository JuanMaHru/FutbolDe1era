/**
 * Álbum de figuritas GRATIS: se consiguen jugando los retos del día (sin compras ni sobres pagos).
 * Cada reto diario terminado da un sobre (3 figuritas si ganaste, 1 si no). Determinístico por día y juego.
 */
import photosData from "@/data/photos.json";
import playersData from "@/data/players.json";
import { rng } from "./game/daily";
import { read, write } from "./storage";

export interface Sticker { id: string; name: string; club: string; nationality: string; n: number }
const PH = photosData as Record<string, unknown>;
export const STICKERS: Sticker[] = (playersData as { id: string; name: string; club: string; nationality: string; check?: boolean }[])
  .filter((p) => !p.check && PH[p.id])
  .map((p, i) => ({ id: p.id, name: p.name, club: p.club, nationality: p.nationality, n: i + 1 }));

export interface AlbumState { have: Record<string, number>; packs: { from: string; size: number }[]; claimed: string[] }
const EMPTY: AlbumState = { have: {}, packs: [], claimed: [] };
export const loadAlbum = () => read<AlbumState>("album", EMPTY);
const save = (a: AlbumState) => { write("album", a); if (typeof window !== "undefined") window.dispatchEvent(new Event("primera:album")); };

/** Al terminar un reto del día: deja un sobre para abrir (una sola vez por juego y día). */
export function grantPack(game: string, key: string, won: boolean) {
  const a = loadAlbum(); const tag = `${key}:${game}`;
  if (a.claimed.includes(tag)) return;
  save({ ...a, claimed: [...a.claimed, tag].slice(-400), packs: [...a.packs, { from: tag, size: won ? 3 : 1 }] });
}

/** Abre el próximo sobre. Prioriza figuritas nuevas (para que el álbum avance), pero puede haber repetidas. */
export function openPack(): Sticker[] {
  const a = loadAlbum(); const pack = a.packs[0];
  if (!pack) return [];
  let seed = 0; for (const ch of pack.from) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const r = rng(seed); const got: Sticker[] = [];
  for (let i = 0; i < pack.size; i++) {
    const missing = STICKERS.filter((s) => !a.have[s.id] && !got.includes(s));
    const pool = missing.length && r() < 0.7 ? missing : STICKERS;
    got.push(pool[Math.floor(r() * pool.length)]);
  }
  const have = { ...a.have };
  got.forEach((s) => { have[s.id] = (have[s.id] ?? 0) + 1; });
  save({ ...a, have, packs: a.packs.slice(1) });
  return got;
}
