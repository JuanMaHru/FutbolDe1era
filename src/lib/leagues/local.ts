import type { GameId } from "../game/types";
import { dateKey, rng } from "../game/daily";
import { loadProfile } from "../progress";
import { read, write } from "../storage";
import type { League, LeagueService, Member, Standing } from "./types";
import { makeCode, normalizeCode, weekKeys } from "./week";

const ME: Member = { id: "me", name: "Vos" };
const RIVAL_NAMES = ["El Bichi", "Tota", "Pelado Díaz", "Chino", "La Pulga del barrio", "Ruso", "Colo", "Flaco", "Mudo", "Turco"];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** 3-5 rivales simulados, siempre los mismos para un código dado. */
function demoMembers(code: string): Member[] {
  const r = rng(hash(code));
  const pool = [...RIVAL_NAMES];
  const n = 3 + Math.floor(r() * 3);
  return Array.from({ length: n }, (_, i) => {
    const name = pool.splice(Math.floor(r() * pool.length), 1)[0];
    return { id: `demo-${i}`, name, demo: true };
  });
}

/** Puntaje determinístico de un rival simulado para un día y juego. */
function demoPoints(code: string, member: Member, day: string, game: GameId): number | null {
  const r = rng(hash(`${code}|${member.id}|${day}|${game}`));
  const skill = 0.35 + (hash(code + member.id) % 50) / 100; // 0.35..0.84
  if (r() > 0.85) return null; // a veces no juega
  if (r() > skill + 0.15) return 0;
  return Math.max(11 - (1 + Math.floor(r() * 7)), 3);
}

export class LocalLeagueService implements LeagueService {
  readonly mode = "local" as const;

  private all(): League[] {
    return read<League[]>("leagues", []);
  }
  private save(ls: League[]) {
    write("leagues", ls);
  }

  async myLeagues() {
    return this.all();
  }

  async create(name: string) {
    const existing = new Set(this.all().map((l) => l.code));
    let code = makeCode();
    while (existing.has(code)) code = makeCode();
    const league: League = {
      code,
      name: name.trim() || "Liga sin nombre",
      createdAt: dateKey(),
      members: [ME, ...demoMembers(code)],
    };
    this.save([...this.all(), league]);
    return league;
  }

  async join(raw: string) {
    const code = normalizeCode(raw);
    if (code.length !== 6) throw new Error("El código tiene 6 caracteres.");
    const ls = this.all();
    const found = ls.find((l) => l.code === code);
    if (found) return found;
    // En modo local no hay servidor: simulamos la liga que creó tu amigo.
    const league: League = { code, name: `Liga ${code}`, createdAt: dateKey(), members: [ME, ...demoMembers(code)] };
    this.save([...ls, league]);
    return league;
  }

  async leave(code: string) {
    this.save(this.all().filter((l) => l.code !== code));
  }

  async get(code: string) {
    return this.all().find((l) => l.code === normalizeCode(code)) ?? null;
  }

  async standings(code: string, weekOf: string, games: GameId[]): Promise<Standing[]> {
    const league = await this.get(code);
    if (!league) return [];
    const today = dateKey();
    const days = weekKeys(weekOf);
    const profile = loadProfile();

    const rows = league.members.map((member): Standing => {
      const perDay = days.map((day) => {
        if (day > today || day < league.createdAt) return null;
        let total: number | null = null;
        for (const g of games) {
          const p = member.demo
            ? // Los rivales de hoy "juegan" de a poco para que la tabla se mueva.
              day === today && hash(member.id + g) % 2 === 0 ? null : demoPoints(code, member, day, g)
            : (profile.results[day]?.[g] ?? null);
          if (p !== null) total = (total ?? 0) + p;
        }
        return total;
      });
      return {
        member: member.demo ? member : { ...member, name: profile.name || "Vos" },
        days: perDay,
        total: perDay.reduce<number>((a, b) => a + (b ?? 0), 0),
        played: perDay.filter((d) => d !== null).length,
      };
    });
    return rows.sort((a, b) => b.total - a.total || b.played - a.played);
  }
}

export const leagueService: LeagueService = new LocalLeagueService();
