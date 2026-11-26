import playersData from "@/data/players.json";
import coachesData from "@/data/coaches.json";
import type { Coach, Player } from "../game/types";
import { COUNTRIES, POSITIONS } from "../game/meta";
import { clubStyle } from "../clubs";

/** Preguntas generadas desde la base: tu conocimiento real decide los momentos del partido. */
export interface Question {
  text: string;
  options: string[];
  answer: number;
}

const players = playersData as Player[];
const coaches = coachesData as Coach[];

function pickN<T>(arr: T[], n: number, rand: () => number, exclude?: (x: T) => boolean): T[] {
  const pool = arr.filter((x) => !exclude?.(x));
  const out: T[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  return out;
}

function build(correct: string, wrongs: string[], rand: () => number, text: string): Question {
  const options = [correct, ...wrongs];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { text, options, answer: options.indexOf(correct) };
}

export function makeQuestion(rand: () => number = Math.random): Question {
  const kind = Math.floor(rand() * 5);
  const p = players[Math.floor(rand() * players.length)];
  if (kind === 0) {
    const clubs = [...new Set(players.map((x) => x.club))].filter((c) => c !== p.club);
    return build(clubStyle(p.club).short, pickN(clubs, 2, rand).map((c) => clubStyle(c).short), rand, `¿En qué club juega ${p.name}?`);
  }
  if (kind === 1) {
    const nats = [...new Set(players.map((x) => x.nationality))].filter((n) => n !== p.nationality);
    const f = (c: string) => `${COUNTRIES[c]?.flag} ${COUNTRIES[c]?.name}`;
    return build(f(p.nationality), pickN(nats, 2, rand).map(f), rand, `¿De qué país es ${p.name}?`);
  }
  if (kind === 2) {
    const nums = pickN([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 16, 17, 19, 20, 21, 22, 23, 25, 30], 6, rand).filter((n) => n !== p.number).slice(0, 2);
    return build(String(p.number), nums.map(String), rand, `¿Qué número usa ${p.name}?`);
  }
  if (kind === 3) {
    const lines = ["ARQ", "DFC", "MC", "DC", "EXT", "LAT", "MCO"].filter((x) => x !== p.position);
    const lab = (c: string) => POSITIONS[c].label;
    return build(lab(p.position), pickN(lines, 2, rand).map(lab), rand, `¿En qué puesto juega ${p.name}?`);
  }
  const c = coaches[Math.floor(rand() * coaches.length)];
  const others = coaches.filter((x) => x.team !== c.team);
  return build(c.name, pickN(others, 2, rand).map((x) => x.name), rand, `¿Quién dirige a ${c.team}?`);
}
