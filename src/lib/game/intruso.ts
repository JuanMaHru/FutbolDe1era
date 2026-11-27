/** "El intruso": 4 jugadores, 3 comparten algo y uno no. */
import { PLAYERS } from "./games";
import { COUNTRIES, POSITIONS } from "./meta";
import { rng, shuffled } from "./daily";
import { poolFor, type Level } from "../difficulty";
import type { Player } from "./types";

export interface Rule { id: string; label: string; test: (p: Player) => boolean }
export interface IntrusoRound { rule: Rule; options: Player[]; intruder: string }
export const ROUNDS = 5;

const ALL = PLAYERS.filter((p) => !p.check);
const pool = ALL;
const ever = (p: Player) => new Set([...(p.clubs ?? []), p.club]);

function rules(): Rule[] {
  const out: Rule[] = [];
  const clubCount = new Map<string, number>();
  pool.forEach((p) => ever(p).forEach((c) => clubCount.set(c, (clubCount.get(c) ?? 0) + 1)));
  for (const [c, n] of clubCount) if (n >= 5) out.push({ id: `ever-${c}`, label: `Jugaron en ${c}`, test: (p) => ever(p).has(c) });
  const nats = new Map<string, number>();
  pool.forEach((p) => nats.set(p.nationality, (nats.get(p.nationality) ?? 0) + 1));
  for (const [n, k] of nats) if (k >= 5) out.push({ id: `nat-${n}`, label: `Son de ${COUNTRIES[n]?.name ?? n} ${COUNTRIES[n]?.flag ?? ""}`, test: (p) => p.nationality === n });
  const leagues = new Set(pool.map((p) => p.league));
  for (const l of leagues) out.push({ id: `lg-${l}`, label: `Juegan en ${l}`, test: (p) => p.league === l });
  for (const line of ["ARQ", "DEF", "MED", "DEL"]) out.push({ id: `line-${line}`, label: { ARQ: "Son arqueros", DEF: "Son defensores", MED: "Son mediocampistas", DEL: "Son delanteros" }[line]!, test: (p) => POSITIONS[p.position]?.line === line });
  out.push({ id: "num-10", label: "Usan la 10", test: (p) => p.number === 10 });
  return out;
}
const RULES = rules();

/** Rondas del día. El intruso se parece a los otros (misma nacionalidad o liga) para que no sea obvio. */
export function buildIntruso(seed: number, level: Level = "medio"): IntrusoRound[] {
  const pool = poolFor(ALL, level);
  const r = rng(seed);
  const rounds: IntrusoRound[] = [];
  const typeCount = new Map<string, number>(); const used = new Set<string>();
  for (let attempt = 0; rounds.length < ROUNDS && attempt < 400; attempt++) {
    const rule = RULES[Math.floor(r() * RULES.length)];
    const type = rule.id.split("-")[0];
    if (used.has(rule.id) || (typeCount.get(type) ?? 0) >= 2) continue;
    const yes = shuffled(pool.filter(rule.test), Math.floor(r() * 1e9));
    const no = pool.filter((p) => !rule.test(p));
    if (yes.length < 3 || !no.length) continue;
    const three = yes.slice(0, 3);
    // Intruso "parecido": comparte nacionalidad o liga con alguno de los tres, y no cumple la regla.
    const similar = shuffled(no.filter((p) => three.some((t) => t.nationality === p.nationality || t.league === p.league)), Math.floor(r() * 1e9));
    const intruder = similar[0] ?? no[Math.floor(r() * no.length)];
    // Respuesta única: si sacamos a cualquier otro, los tres restantes no deben compartir ninguna regla.
    const four = [...three, intruder];
    const ambiguous = four.some((x) => x.id !== intruder.id && RULES.some((rl) => four.filter((p) => p.id !== x.id).every(rl.test)));
    if (ambiguous) continue;
    rounds.push({ rule, options: shuffled([...three, intruder], Math.floor(r() * 1e9)), intruder: intruder.id });
    used.add(rule.id); typeCount.set(type, (typeCount.get(type) ?? 0) + 1);
  }
  return rounds;
}
