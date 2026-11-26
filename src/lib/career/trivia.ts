import playersData from "@/data/players.json";
import coachesData from "@/data/coaches.json";
import careersData from "@/data/careers.json";
import type { Coach, Player } from "../game/types";
import type { CareerEntry } from "../game/careers";
import { COUNTRIES, LEAGUES as GAME_LEAGUES, POSITIONS } from "../game/meta";
import { ageOn } from "../game/compare";
import { clubStyle } from "../clubs";
import { read, write } from "../storage";

/** Preguntas generadas desde la base: tu conocimiento real decide las jugadas. */
export interface Question {
  key: string;
  text: string;
  options: string[];
  answer: number;
}

// Solo datos confiables (sin marca de revisión).
const players = (playersData as Player[]).filter((p) => !p.check);
const coaches = (coachesData as Coach[]).filter((c) => !c.check);
const careers = careersData as CareerEntry[];

const pick = <T,>(arr: T[], r: () => number) => arr[Math.floor(r() * arr.length)];
function pickN<T>(arr: T[], n: number, r: () => number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
}
const uniq = <T,>(a: T[]) => [...new Set(a)];
function build(key: string, text: string, correct: string, wrongs: string[], r: () => number): Question | null {
  const w = uniq(wrongs.filter((x) => x !== correct));
  if (w.length < 2) return null;
  const options = [correct, ...pickN(w, 2, r)];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { key, text, options, answer: options.indexOf(correct) };
}
const flag = (c: string) => `${COUNTRIES[c]?.flag ?? ""} ${COUNTRIES[c]?.name ?? c}`.trim();
const short = (c: string) => clubStyle(c).short;
const today = () => new Date();

type Gen = (r: () => number) => Question | null;
const GENERATORS: Gen[] = [
  (r) => { const p = pick(players, r); return build(`club:${p.id}`, `¿En qué club juega ${p.name}?`, short(p.club), players.filter((x) => x.league === p.league).map((x) => short(x.club)), r); },
  (r) => { const p = pick(players, r); return build(`nat:${p.id}`, `¿De qué país es ${p.name}?`, flag(p.nationality), players.map((x) => flag(x.nationality)), r); },
  (r) => { const p = pick(players, r); return build(`num:${p.id}`, `¿Qué número usa ${p.name}?`, String(p.number), ["1", "2", "4", "5", "6", "7", "8", "9", "10", "11", "14", "17", "19", "20", "22", "23"], r); },
  (r) => { const p = pick(players, r); return build(`pos:${p.id}`, `¿En qué puesto juega ${p.name}?`, POSITIONS[p.position].label, Object.entries(POSITIONS).filter(([k]) => k !== "NJ").map(([, v]) => v.label), r); },
  (r) => { const p = pick(players, r); return build(`lg:${p.id}`, `¿En qué liga juega ${p.name}?`, GAME_LEAGUES[p.league]?.short ?? p.league, Object.values(GAME_LEAGUES).map((l) => l.short).filter((x) => x !== "Nacional"), r); },
  (r) => {
    const p = pick(players, r);
    const a = ageOn(p.birthDate, today());
    return build(`age:${p.id}`, `¿Cuántos años tiene ${p.name}?`, `${a} años`, [a - 4, a - 2, a + 2, a + 3, a + 5].map((x) => `${x} años`), r);
  },
  (r) => { const c = pick(coaches, r); return build(`dt:${c.id}`, `¿Quién dirige a ${c.team}?`, c.name, coaches.map((x) => x.name), r); },
  (r) => { const c = pick(coaches, r); return build(`dtnat:${c.id}`, `¿De qué país es el DT ${c.name}?`, flag(c.nationality), coaches.map((x) => flag(x.nationality)), r); },
  (r) => {
    const c = pick(coaches.filter((x) => x.playedAs !== "NJ"), r);
    return build(`dtpos:${c.id}`, `¿De qué jugaba ${c.name} cuando era futbolista?`, POSITIONS[c.playedAs].label, ["Arquero", "Central", "Lateral", "Volante", "Enganche", "Extremo", "Centrodelantero"], r);
  },
  (r) => {
    const e = pick(careers.filter((x) => x.career.length >= 3), r);
    const mine = new Set(e.career.map((s) => s.club));
    const others = careers.flatMap((x) => x.career.map((s) => s.club)).filter((c) => !mine.has(c));
    const notClub = pick(others, r);
    return build(`notin:${e.id}`, `¿En cuál de estos ${e.kind === "dt" ? "equipos NO dirigió" : "clubes NO jugó"} ${e.name}?`, short(notClub), [...mine].map(short), r);
  },
  (r) => {
    const e = pick(careers.filter((x) => x.kind === "jugador"), r);
    const first = [...e.career].sort((a, b) => a.from - b.from)[0];
    return build(`first:${e.id}`, `¿En qué club debutó ${e.name}?`, short(first.club), careers.flatMap((x) => x.career.map((s) => short(s.club))), r);
  },
  (r) => {
    const e = pick(careers.filter((x) => x.career.length >= 2), r);
    const [a, b] = pickN(e.career, 2, r);
    if (!a || !b || a.club === b.club) return null;
    const others = careers.filter((x) => x.kind === e.kind && x.id !== e.id && !(x.career.some((s) => s.club === a.club) && x.career.some((s) => s.club === b.club)));
    return build(`both:${e.id}:${a.club}`, `¿Quién ${e.kind === "dt" ? "dirigió" : "jugó"} en ${short(a.club)} y en ${short(b.club)}?`, e.name, others.map((x) => x.name), r);
  },
  (r) => {
    // ¿Quién es de X y juega en Y?
    const p = pick(players, r);
    const others = players.filter((x) => !(x.nationality === p.nationality && x.club === p.club) && (x.club === p.club || x.nationality === p.nationality));
    return build(`combo:${p.id}`, `¿Quién es ${COUNTRIES[p.nationality]?.name.toLowerCase() === "argentina" ? "argentino" : `de ${COUNTRIES[p.nationality]?.name}`} y juega en ${short(p.club)}?`, p.name, others.map((x) => x.name), r);
  },
];

const RECENT_KEY = "career:recentQ";

/** Pregunta nueva que no se haya hecho en las últimas ~80. */
export function makeQuestion(r: () => number = Math.random): Question {
  const recent = new Set(read<string[]>(RECENT_KEY, []));
  for (let i = 0; i < 60; i++) {
    const q = pick(GENERATORS, r)(r);
    if (q && !recent.has(q.key)) {
      write(RECENT_KEY, [q.key, ...recent].slice(0, 80));
      return q;
    }
  }
  return pick(GENERATORS, r)(r) ?? makeQuestion(r);
}
