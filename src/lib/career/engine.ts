import { CONTINENTAL, LEAGUES, NATIONS, clubInfo, clubsOf, leagueOf, nationalRival, nationalTournament, strengthOf, CLUBS_W } from "./world";
import { pickEvent, type Effect } from "./events";

export type Role = "ARQ" | "DEF" | "MED" | "DEL";
export const ROLE_OF: Record<string, Role> = { ARQ: "ARQ", DFC: "DEF", LAT: "DEF", MC: "MED", MCO: "MED", EXT: "DEL", DC: "DEL" };

/** Perfiles por puesto: cambian qué jugadas te tocan y qué tan bien te salen. */
export const ARCHETYPES: Record<Role, { id: string; name: string; desc: string; signature: MomentKind }[]> = {
  ARQ: [
    { id: "reflejos", name: "Reflejos felinos", desc: "Atajadas imposibles en el mano a mano.", signature: "save" },
    { id: "penales", name: "Especialista en penales", desc: "Leés al pateador. Más chances en penales.", signature: "penalty-save" },
    { id: "libero", name: "Arquero líbero", desc: "Salís jugando: también te tocan pases.", signature: "pass" },
  ],
  DEF: [
    { id: "marcador", name: "Marcador implacable", desc: "Cruces y quites perfectos.", signature: "tackle" },
    { id: "cabeceador", name: "Cabeceador", desc: "Peligroso en las pelotas paradas de ataque.", signature: "header" },
    { id: "lateral", name: "Lateral volante", desc: "Pasás al ataque y das asistencias.", signature: "pass" },
  ],
  MED: [
    { id: "cinco", name: "Cinco de marca", desc: "Recuperás y cortás pases.", signature: "intercept" },
    { id: "organizador", name: "Organizador", desc: "Ves el pase que nadie ve.", signature: "pass" },
    { id: "enganche", name: "Enganche de pegada", desc: "Tiros libres y remates de media distancia.", signature: "freekick" },
  ],
  DEL: [
    { id: "goleador", name: "Goleador de área", desc: "Definís como pocos.", signature: "finish" },
    { id: "extremo", name: "Extremo veloz", desc: "Mano a mano y gambeta.", signature: "placement" },
    { id: "nueve-tecnico", name: "Pateador de penales", desc: "Penales y tiros libres son tuyos.", signature: "penalty" },
  ],
};

export type MomentKind =
  | "finish" | "placement" | "penalty" | "freekick" | "header" | "pass" // ataque
  | "tackle" | "intercept" | "save" | "penalty-save" | "freekick-save" // defensa
  | "trivia" | "ttt"; // lectura de juego

export interface Moment {
  kind: MomentKind;
  ok: boolean;
}

const ATTACK: MomentKind[] = ["finish", "placement", "penalty", "freekick", "header"];
const DEFENSE: MomentKind[] = ["tackle", "intercept", "save", "penalty-save", "freekick-save"];

const POOLS: Record<Role, [MomentKind, number][]> = {
  DEL: [["finish", 3], ["placement", 3], ["penalty", 2], ["freekick", 1], ["header", 1], ["trivia", 2], ["ttt", 1], ["pass", 1]],
  MED: [["pass", 3], ["intercept", 2], ["freekick", 1], ["finish", 1], ["trivia", 2], ["ttt", 1], ["penalty", 1]],
  DEF: [["tackle", 3], ["header", 2], ["intercept", 2], ["trivia", 2], ["ttt", 1], ["pass", 1]],
  ARQ: [["save", 3], ["penalty-save", 2], ["freekick-save", 2], ["trivia", 2], ["ttt", 1]],
};

export type CompKind = "league" | "cup" | "intl" | "national";
export interface Fixture {
  kind: CompKind;
  comp: string;
  round: string;
  knockout: boolean;
  rival?: string;
  result?: { gf: number; ga: number; pens?: [number, number]; rating: number; goals: number; assists: number; played: boolean };
}

export interface MatchResult {
  gf: number;
  ga: number;
  rating: number;
  goals: number;
  assists: number;
  saves: number;
  started: boolean;
  played: boolean;
  note: string;
  pens?: [number, number];
}

export interface SeasonStats { pj: number; goals: number; assists: number; ratingSum: number; cleanSheets: number; penSaves: number }
const emptyStats = (): SeasonStats => ({ pj: 0, goals: 0, assists: 0, ratingSum: 0, cleanSheets: 0, penSaves: 0 });

export interface SeasonLine {
  season: number;
  year: number;
  club: string;
  league: string;
  pj: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  avg: number;
  place: number;
  cup: string;
  intl?: string;
  titles: string[];
}

export interface CareerState {
  v: 2;
  name: string;
  nick: string;
  nationality: string;
  position: string;
  archetype: string;
  foot: "derecho" | "zurdo" | "ambidiestro";
  number: number;
  age: number;
  startYear: number;
  club: string;
  leagueOverride: Record<string, string>; // ascensos/descensos durante la carrera
  ovr: number;
  form: number;
  confidence: number;
  fame: number;
  money: number;
  salary: number;
  season: number;
  fixtures: Fixture[];
  idx: number;
  leaguePts: number;
  leagueGames: number;
  cupAlive: boolean;
  intl?: string; // copa internacional de esta temporada
  intlAlive: boolean;
  groupPts: number;
  nextIntl?: string; // clasificación para la próxima
  injury: number;
  suspension: number;
  boost: number; // ventaja para el próximo partido (eventos)
  stats: SeasonStats;
  totals: SeasonStats;
  history: SeasonLine[];
  trophies: string[];
  caps: number;
  natGoals: number;
  national?: { name: string; fixtures: Fixture[]; idx: number; groupPts: number; alive: boolean };
  lastKinds: MomentKind[];
  lastMatch?: MatchResult & { rival: string; comp: string; round: string };
  pendingEvent?: string;
  recentEvents: string[];
  phase: "event" | "match" | "national" | "season-end" | "retired";
  offers?: string[];
  bonusDay?: string;
  log: string[];
}

export const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const pick = <T,>(arr: T[], rand: () => number) => arr[Math.floor(rand() * arr.length)];

export const currentYear = (s: CareerState) => s.startYear + s.season - 1;
export const role = (s: CareerState): Role => ROLE_OF[s.position] ?? "MED";
export const leagueOfState = (s: CareerState) => leagueOf(s.club, s.leagueOverride);
export const archetypeOf = (s: CareerState) => ARCHETYPES[role(s)].find((a) => a.id === s.archetype) ?? ARCHETYPES[role(s)][0];

export function newCareer(input: {
  name: string; nick: string; nationality: string; position: string; archetype: string; foot: CareerState["foot"]; number: number; age: number; club: string; repBonus: number;
}): CareerState {
  const s: CareerState = {
    v: 2,
    name: input.name.trim() || "Pibe sin nombre",
    nick: input.nick.trim(),
    nationality: input.nationality,
    position: input.position,
    archetype: input.archetype,
    foot: input.foot,
    number: input.number,
    age: input.age,
    startYear: new Date().getFullYear(),
    club: input.club,
    leagueOverride: {},
    ovr: 56 + input.repBonus,
    form: 60,
    confidence: 45,
    fame: 5 + input.repBonus,
    money: 0,
    salary: 1,
    season: 1,
    fixtures: [],
    idx: 0,
    leaguePts: 0,
    leagueGames: 0,
    cupAlive: true,
    intlAlive: false,
    groupPts: 0,
    injury: 0,
    suspension: 0,
    boost: 0,
    stats: emptyStats(),
    totals: emptyStats(),
    history: [],
    trophies: [],
    caps: 0,
    natGoals: 0,
    lastKinds: [],
    recentEvents: [],
    phase: "event",
    pendingEvent: "debut",
    log: [`Firmaste tu primer contrato con ${input.club}.`],
  };
  s.salary = Math.max(1, Math.round(leagueOfState(s).salary * 0.12)); // contrato de juvenil
  // Primera temporada: juega copa internacional si el club es de los fuertes de su liga.
  const lg = leagueOfState(s);
  const rank = clubsOf(lg.id).sort((a, b) => b.strength - a.strength).findIndex((c) => c.name === s.club) + 1;
  const intl = rank >= 1 && lg.top[0] && rank <= lg.top[0] ? CONTINENTAL[lg.continent][0] : rank >= 1 && lg.top[1] && rank <= lg.top[1] && CONTINENTAL[lg.continent][1] ? CONTINENTAL[lg.continent][1] : undefined;
  return buildSeason(s, intl);
}

/** Calendario de la temporada: liga intercalada con copa nacional y copa internacional. */
function buildSeason(s: CareerState, intl?: string): CareerState {
  const lg = leagueOfState(s);
  const L = (n: number): Fixture => ({ kind: "league", comp: lg.name, round: `Fecha ${n}`, knockout: false });
  const Cp = (r: string): Fixture => ({ kind: "cup", comp: lg.cup, round: r, knockout: true });
  const I = (r: string, ko: boolean): Fixture => ({ kind: "intl", comp: intl!, round: r, knockout: ko });
  const f: Fixture[] = [L(1), L(2), Cp("Cuartos de final"), L(3)];
  if (intl) f.push(I("Fase de grupos · Fecha 1", false));
  f.push(L(4));
  if (intl) f.push(I("Fase de grupos · Fecha 2", false));
  f.push(Cp("Semifinal"), L(5));
  if (intl) f.push(I("Cuartos de final", true));
  f.push(L(6), Cp("Final"));
  if (intl) f.push(I("Semifinal", true));
  f.push(L(7));
  if (intl) f.push(I("Final", true));
  return { ...s, fixtures: f, idx: 0, leaguePts: 0, leagueGames: 0, cupAlive: true, intl, intlAlive: !!intl, groupPts: 0, stats: emptyStats() };
}

/** Saltea partidos de copas de las que ya quedaste afuera. */
export function nextFixture(s: CareerState): { fx: Fixture; idx: number } | null {
  if (s.phase === "national" && s.national) {
    const fx = s.national.fixtures[s.national.idx];
    return fx ? { fx, idx: s.national.idx } : null;
  }
  for (let i = s.idx; i < s.fixtures.length; i++) {
    const fx = s.fixtures[i];
    if (fx.kind === "cup" && !s.cupAlive) continue;
    if (fx.kind === "intl" && !s.intlAlive) continue;
    return { fx, idx: i };
  }
  return null;
}

export function rivalFor(s: CareerState, fx: Fixture, rand: () => number): string {
  if (fx.rival) return fx.rival;
  const lg = leagueOfState(s);
  if (fx.kind === "national") return nationalRival(s.nationality, fx.comp, s.national?.fixtures.map((x) => x.rival ?? "") ?? [], rand);
  let pool: string[];
  if (fx.kind === "league") pool = CLUBS_W.filter((c) => leagueOf(c.name, s.leagueOverride).id === lg.id && c.name !== s.club).map((c) => c.name);
  else if (fx.kind === "cup") pool = CLUBS_W.filter((c) => LEAGUES[c.league].country === lg.country && c.name !== s.club).map((c) => c.name);
  else pool = CLUBS_W.filter((c) => LEAGUES[c.league].continent === lg.continent && LEAGUES[c.league].country !== lg.country).map((c) => c.name);
  if (fx.kind !== "league" && fx.knockout) {
    // Cuanto más avanzada la ronda, más fuerte el rival: final contra los mejores.
    const top = fx.round === "Final" ? 4 : fx.round === "Semifinal" ? 7 : 12;
    pool = [...pool].sort((a, b) => clubInfo(b).strength - clubInfo(a).strength).slice(0, fx.kind === "intl" ? top + 4 : top);
  }
  return pick(pool.length ? pool : clubsOf("ARG1").map((c) => c.name), rand);
}

export function myTeam(s: CareerState): string {
  return s.phase === "national" ? NATIONS[s.nationality]?.team ?? s.club : s.club;
}

/** ¿Es titular? Nivel vs. exigencia del equipo, confianza del DT y forma. */
export function startChance(s: CareerState): number {
  const need = strengthOf(myTeam(s)) - 4;
  const base = s.phase === "national" ? 45 : 50;
  return clamp(base + (s.ovr - need) * 4 + (s.confidence - 50) * 0.5 + (s.form - 50) * 0.3, 8, 97) / 100;
}

/** Qué jugadas te tocan: según puesto y perfil, sin repetir dentro del partido ni del partido anterior. */
export function planMoments(s: CareerState, started: boolean, rand: () => number): MomentKind[] {
  // Titular: 2 jugadas. Suplente: a veces entra (1 jugada) y a veces no.
  const n = (started ? 2 : rand() < 0.6 ? 1 : 0) + (s.boost > 0 && started ? 1 : 0);
  const sig = archetypeOf(s).signature;
  const pool = POOLS[role(s)].map(([k, w]) => [k, k === sig ? w + 3 : w] as [MomentKind, number]);
  const out: MomentKind[] = [];
  for (let i = 0; i < n; i++) {
    const avail = pool.filter(([k]) => !out.includes(k) && !(s.lastKinds.includes(k) && rand() < 0.7));
    const list = avail.length ? avail : pool.filter(([k]) => !out.includes(k));
    const total = list.reduce((a, [, w]) => a + w, 0);
    let r = rand() * total;
    for (const [k, w] of list) {
      if ((r -= w) <= 0) { out.push(k); break; }
    }
  }
  return out;
}

/** Dificultad general (0.1 fácil – 0.9 difícil) para los minijuegos. */
export function difficulty(s: CareerState, rival: string): number {
  return clamp(0.5 + (strengthOf(rival) - s.ovr) * 0.02 - (s.form - 50) * 0.003 - s.boost * 0.1, 0.1, 0.9);
}
/** Bonus del perfil cuando la jugada es la suya. */
export const signatureBonus = (s: CareerState, k: MomentKind) => (archetypeOf(s).signature === k ? 0.15 : 0);

function poisson(l: number, rand: () => number) {
  l = Math.max(l, 0.15);
  let k = 0, p = Math.exp(-l), F = p;
  const u = rand();
  while (u > F && k < 7) { k++; p *= l / k; F += p; }
  return k;
}

/** Resultado del partido a partir de las jugadas del jugador. */
export function simMatch(s: CareerState, rival: string, moments: Moment[], started: boolean, rand: () => number): MatchResult {
  const r = role(s);
  const mine = strengthOf(myTeam(s)) + (started ? Math.max(0, s.ovr - strengthOf(myTeam(s))) * 0.3 : 0);
  const theirs = strengthOf(rival);
  const diff = (mine - theirs) * 0.035;
  let gf = poisson(1.25 + diff, rand);
  let ga = poisson(1.15 - diff, rand);
  let goals = 0, assists = 0, saves = 0;
  for (const m of moments) {
    if (ATTACK.includes(m.kind)) {
      if (m.ok) { gf++; goals++; }
    } else if (m.kind === "pass") {
      if (m.ok) { gf++; if (r === "ARQ") { /* salida limpia: arranca la jugada */ } else assists++; }
    } else if (DEFENSE.includes(m.kind)) {
      if (m.kind === "penalty-save") {
        if (m.ok) saves++;
        else ga++;
      } else if (m.ok) ga = Math.max(0, ga - 1);
      else if (rand() < 0.7) ga++;
    } else {
      // trivia / tres en raya: lectura de juego
      if (m.ok) {
        if (r === "DEL" || r === "MED") {
          const x = rand();
          if (x < 0.3) { gf++; goals++; } else if (x < 0.65) { gf++; assists++; }
        } else ga = Math.max(0, ga - 1);
      }
    }
  }
  const ok = moments.filter((m) => m.ok).length;
  const bad = moments.length - ok;
  const won = gf > ga, draw = gf === ga;
  let rating = 6 + ok * 0.8 - bad * 0.6 + goals * 0.3 + (won ? 0.4 : draw ? 0 : -0.4) + ((r === "ARQ" || r === "DEF") && ga === 0 ? 0.6 : 0) + saves * 0.5;
  if (!started) rating -= 0.4;
  rating = Math.round(clamp(rating, 3, 10) * 10) / 10;
  const note = rating >= 8.5 ? "¡Figura de la cancha!" : rating >= 7.3 ? "Gran partido." : rating >= 6 ? "Cumpliste." : "Partido para el olvido.";
  return { gf, ga, rating, goals, assists, saves, started, played: true, note };
}

/** Partido sin jugadas: lesión, suspensión o "simular". */
export function simQuick(s: CareerState, rival: string, rand: () => number, mode: "simulate" | "absent"): MatchResult {
  if (mode === "absent") {
    const r = simMatch({ ...s, ovr: 0 }, rival, [], false, rand);
    return { ...r, rating: 0, goals: 0, assists: 0, saves: 0, played: false, note: s.injury > 0 ? "Lo viste desde la tribuna (lesionado)." : "Cumpliste la suspensión." };
  }
  const started = rand() < startChance(s);
  const p = clamp(0.62 - (difficulty(s, rival) - 0.5) * 0.8, 0.2, 0.85);
  const kinds = planMoments(s, started, rand);
  return simMatch(s, rival, kinds.map((k) => ({ kind: k, ok: rand() < p })), started, rand);
}

/** Definición por penales. `playerOk` = tu penal (o tu atajada si sos arquero). */
export function shootout(s: CareerState, playerOk: boolean, rand: () => number): [number, number] {
  const isGk = role(s) === "ARQ";
  let a = 0, b = 0;
  for (let i = 0; i < 5; i++) {
    a += (i === 0 && !isGk ? playerOk : rand() < 0.76) ? 1 : 0;
    b += (i === 0 && isGk ? !playerOk : rand() < (isGk ? 0.68 : 0.76)) ? 1 : 0;
  }
  let guard = 0;
  while (a === b && guard++ < 20) {
    a += rand() < 0.74 ? 1 : 0;
    b += rand() < 0.74 ? 1 : 0;
  }
  if (a === b) a++;
  return [a, b];
}

/** Aplica el resultado de un partido al estado y avanza el calendario. */
export function applyResult(s: CareerState, idx: number, rival: string, res: MatchResult, rand: () => number): CareerState {
  const n: CareerState = { ...s, log: [...s.log] };
  const national = s.phase === "national" && s.national;
  const fx = national ? s.national!.fixtures[idx] : s.fixtures[idx];
  const won = res.gf > res.ga || (res.pens ? res.pens[0] > res.pens[1] : false);
  const draw = res.gf === res.ga && !res.pens;
  const stored: Fixture = { ...fx, rival, result: { gf: res.gf, ga: res.ga, pens: res.pens, rating: res.rating, goals: res.goals, assists: res.assists, played: res.played } };

  if (res.played) {
    const cs = res.ga === 0 && res.started && (role(s) === "ARQ" || role(s) === "DEF") ? 1 : 0;
    const add = (t: SeasonStats): SeasonStats => ({ pj: t.pj + 1, goals: t.goals + res.goals, assists: t.assists + res.assists, ratingSum: t.ratingSum + res.rating, cleanSheets: t.cleanSheets + cs, penSaves: t.penSaves + res.saves });
    if (!national) n.stats = add(s.stats);
    n.totals = add(s.totals);
    n.form = clamp(s.form + (res.rating - 6.5) * 6);
    n.confidence = clamp(s.confidence + (res.rating - 6.3) * 5 + (won ? 2 : -1));
    const weight = fx.kind === "national" ? 3 : fx.kind === "intl" ? 2 : fx.knockout ? 1.5 : 1;
    n.fame = clamp(s.fame + (Math.max(0, res.rating - 7) * weight + res.goals * 0.25 * weight * (strengthOf(rival) / 75)) * 0.6);
    if (national) n.natGoals = s.natGoals + res.goals;
  } else {
    n.confidence = clamp(s.confidence - 2);
  }
  if (!national) n.money = s.money + s.salary;
  n.boost = 0;
  if (s.injury > 0 && !res.played) n.injury = s.injury - 1;
  else if (s.suspension > 0 && !res.played) n.suspension = s.suspension - 1;

  const score = `${res.gf}-${res.ga}${res.pens ? ` (${res.pens[0]}-${res.pens[1]} pen.)` : ""}`;
  n.log.unshift(`${fx.comp} · ${fx.round}: ${won ? "victoria" : draw ? "empate" : "derrota"} ${score} vs ${rival}.`);
  n.lastMatch = { ...res, rival, comp: fx.comp, round: fx.round };

  if (national) {
    const nat = { ...s.national!, fixtures: [...s.national!.fixtures] };
    nat.fixtures[idx] = stored;
    nat.idx = idx + 1;
    n.caps = s.caps + (res.played ? 1 : 0);
    if (!fx.knockout) nat.groupPts += won ? 3 : draw ? 1 : 0;
    if (fx.round.endsWith("Fecha 3") && nat.groupPts < 4) nat.alive = false;
    if (fx.knockout && !won) nat.alive = false;
    if (fx.round === "Final" && won) {
      n.trophies = [...s.trophies, `${nat.name} con ${NATIONS[s.nationality].name}`];
      n.fame = clamp(n.fame + 15);
      n.log.unshift(`🏆 ¡CAMPEÓN de la ${nat.name}!`);
    }
    n.national = nat;
    if (!nat.alive || nat.idx >= nat.fixtures.length) {
      if (!nat.alive) n.log.unshift(`${NATIONS[s.nationality].name} quedó afuera de la ${nat.name} (${fx.round}).`);
      return toOffers(n, rand);
    }
    n.phase = "event";
    n.pendingEvent = pickEvent(n, rand);
    return n;
  }

  const fixtures = [...s.fixtures];
  fixtures[idx] = stored;
  n.fixtures = fixtures;
  n.idx = idx + 1;
  if (fx.kind === "league") {
    n.leaguePts = s.leaguePts + (won ? 3 : draw ? 1 : 0);
    n.leagueGames = s.leagueGames + 1;
  } else if (fx.kind === "cup") {
    if (!won) n.cupAlive = false;
    else if (fx.round === "Final") {
      n.trophies = [...s.trophies, `${fx.comp} ${currentYear(s)} (${s.club})`];
      n.fame = clamp(n.fame + 6);
      n.log.unshift(`🏆 ¡Campeón de la ${fx.comp}!`);
    }
  } else if (fx.kind === "intl") {
    if (!fx.knockout) {
      n.groupPts = s.groupPts + (won ? 3 : draw ? 1 : 0);
      if (fx.round.endsWith("Fecha 2") && n.groupPts < 3) n.intlAlive = false;
    } else if (!won) n.intlAlive = false;
    else if (fx.round === "Final") {
      n.trophies = [...s.trophies, `${fx.comp} ${currentYear(s)} (${s.club})`];
      n.fame = clamp(n.fame + 14);
      n.log.unshift(`🏆 ¡Campeón de la ${fx.comp}!`);
    }
  }
  if (!nextFixture(n)) return endSeason(n, rand);
  n.phase = "event";
  n.pendingEvent = pickEvent(n, rand);
  return n;
}

function cupResult(s: CareerState): string {
  const cup = s.fixtures.filter((f) => f.kind === "cup" && f.result);
  if (!cup.length) return "—";
  const last = cup[cup.length - 1];
  const won = last.result!.gf > last.result!.ga || (last.result!.pens ? last.result!.pens[0] > last.result!.pens[1] : false);
  return last.round === "Final" && won ? "Campeón" : last.round;
}
function intlResult(s: CareerState): string | undefined {
  if (!s.intl) return undefined;
  const games = s.fixtures.filter((f) => f.kind === "intl" && f.result);
  if (!games.length) return undefined;
  const last = games[games.length - 1];
  const won = last.result!.gf > last.result!.ga || (last.result!.pens ? last.result!.pens[0] > last.result!.pens[1] : false);
  if (last.round === "Final" && won) return `${s.intl}: Campeón`;
  return `${s.intl}: ${last.knockout ? last.round : "Fase de grupos"}`;
}

function endSeason(s: CareerState, rand: () => number): CareerState {
  const n: CareerState = { ...s, log: [...s.log] };
  const lg = leagueOfState(s);
  const year = currentYear(s);
  const ppg = s.leagueGames ? s.leaguePts / s.leagueGames : 1;
  const rankStrength = clubsOf(lg.id).sort((a, b) => b.strength - a.strength).findIndex((c) => c.name === s.club);
  const expected = rankStrength >= 0 ? (rankStrength / Math.max(1, clubsOf(lg.id).length)) * lg.size : lg.size / 2;
  const place = Math.round(clamp(lg.size * (1 - ppg / 3) * 0.75 + expected * 0.35 + (rand() - 0.5) * 3, 1, lg.size));
  const avg = s.stats.pj ? Math.round((s.stats.ratingSum / s.stats.pj) * 10) / 10 : 0;
  const titles: string[] = [];
  if (place === 1) {
    titles.push(`${lg.name} ${year} (${s.club})`);
    n.fame = clamp(n.fame + 10);
  }
  // Ascensos y descensos.
  if (lg.promote && place <= 2) {
    n.leagueOverride = { ...s.leagueOverride, [s.club]: lg.promote };
    titles.push(`Ascenso a ${LEAGUES[lg.promote].name} (${s.club})`);
    n.log.unshift(`⬆️ ¡${s.club} ascendió a la ${LEAGUES[lg.promote].name}!`);
  } else if (lg.relegateTo && place >= lg.size - 1) {
    n.leagueOverride = { ...s.leagueOverride, [s.club]: lg.relegateTo };
    n.log.unshift(`⬇️ ${s.club} descendió a la ${LEAGUES[lg.relegateTo].name}.`);
  }
  n.trophies = [...s.trophies, ...titles];
  // Clasificación internacional para la próxima temporada.
  n.nextIntl = lg.top[0] && place <= lg.top[0] ? CONTINENTAL[lg.continent][0] : lg.top[1] && place <= lg.top[1] && CONTINENTAL[lg.continent][1] ? CONTINENTAL[lg.continent][1] : undefined;
  const seasonTitles = [...s.trophies.filter((t) => t.includes(` ${year} (${s.club})`)), ...titles];
  n.history = [...s.history, { season: s.season, year, club: s.club, league: lg.name, pj: s.stats.pj, goals: s.stats.goals, assists: s.stats.assists, cleanSheets: s.stats.cleanSheets, avg, place, cup: cupResult(s), intl: intlResult(s), titles: [...new Set(seasonTitles)] }];

  // Evolución por edad y rendimiento.
  const age = s.age + 1;
  const growth = age <= 23 ? 2 + Math.floor(rand() * 3) : age <= 28 ? Math.floor(rand() * 2) : age <= 31 ? -Math.floor(rand() * 2) : -(2 + Math.floor(rand() * 2));
  n.age = age;
  n.ovr = clamp(s.ovr + growth + (avg >= 7.3 ? 1 : 0), 40, 99);

  // Selección: llamado según nivel, fama y la fuerza de la selección.
  const nat = NATIONS[s.nationality];
  const need = nat ? nat.strength - 8 : 99;
  const called = !!nat && n.ovr >= need && n.fame >= 45;
  if (called) {
    const caps = 3 + Math.floor(rand() * 4);
    const g = role(s) === "DEL" ? Math.floor(rand() * 3) : rand() < 0.25 ? 1 : 0;
    n.caps = s.caps + caps;
    n.natGoals = s.natGoals + g;
    n.log.unshift(`🎽 Convocado a ${nat.name} en las Eliminatorias y amistosos: ${caps} partidos, ${g} goles.`);
    const t = nationalTournament(s.nationality, year);
    if (t) {
      n.national = { name: t.name, fixtures: t.rounds.map((r) => ({ kind: "national", comp: t.name, round: r, knockout: !r.startsWith("Fase") })), idx: 0, groupPts: 0, alive: true };
      n.phase = "event";
      n.pendingEvent = "national-call";
      return n;
    }
  } else {
    const t = nationalTournament(s.nationality, year);
    if (t && nat) n.log.unshift(`📺 Viste la ${t.name} por TV. ¡El próximo puede ser tuyo!`);
  }
  return toOffers(n, rand);
}

/** Cierre: ofertas de clubes según nivel, fama y la liga actual. */
function toOffers(s: CareerState, rand: () => number): CareerState {
  const n = { ...s, national: undefined as CareerState["national"] };
  const cur = clubInfo(s.club).strength;
  // Te quieren clubes un poco por encima del tuyo solo si tu nivel lo justifica.
  const reach = Math.min(90, s.ovr + 3, cur + (s.ovr >= cur + 2 && s.fame >= 30 ? 7 : 2) + (s.fame >= 70 ? 3 : 0));
  const floor = Math.max(45, Math.min(reach - 14, s.ovr - 18));
  const pool = CLUBS_W.filter((c) => c.name !== s.club && c.strength <= reach && c.strength >= floor);
  const offers = new Set<string>();
  // Coherencia: primero clubes de la liga/país donde jugás, después del continente, y a veces uno de afuera.
  const lg = leagueOfState(s);
  const sameCountry = pool.filter((c) => LEAGUES[c.league].country === lg.country);
  const sameCont = pool.filter((c) => LEAGUES[c.league].continent === lg.continent && LEAGUES[c.league].country !== lg.country);
  const best = (list: typeof pool) => [...list].sort((a, b) => b.strength - a.strength)[Math.floor(rand() * Math.min(4, list.length))];
  if (sameCountry.length) offers.add(best(sameCountry).name);
  if (sameCont.length && rand() < 0.8) offers.add(best(sameCont).name);
  if (sameCountry.length > 1 && rand() < 0.6) offers.add(pick(sameCountry, rand).name);
  for (let i = 0; i < 12 && offers.size < 3 && pool.length; i++) offers.add(pick(pool, rand).name);
  n.offers = [...offers];
  n.phase = s.age >= 38 ? "retired" : "season-end";
  return n;
}

export function startNextSeason(s: CareerState, club: string | null, rand: () => number): CareerState {
  let n: CareerState = { ...s, log: [...s.log] };
  let intl = s.nextIntl;
  if (club && club !== s.club) {
    n.club = club;
    n.confidence = 40;
    n.log.unshift(`✍️ ¡Nuevo club! Firmaste con ${club}.`);
    const lg = leagueOfState(n);
    const rank = clubsOf(lg.id).sort((a, b) => b.strength - a.strength).findIndex((c) => c.name === club) + 1;
    intl = rank >= 1 && lg.top[0] && rank <= lg.top[0] ? CONTINENTAL[lg.continent][0] : rank >= 1 && lg.top[1] && rank <= lg.top[1] && CONTINENTAL[lg.continent][1] ? CONTINENTAL[lg.continent][1] : undefined;
  } else {
    n.confidence = clamp(n.confidence + 5);
  }
  const lg = leagueOfState(n);
  n.salary = Math.max(1, Math.round(lg.salary * (0.5 + clubInfo(n.club).strength / 120) * (1 + n.fame / 150)));
  n.season = s.season + 1;
  n.injury = 0;
  n.suspension = 0;
  n.form = 60;
  n.offers = undefined;
  n.lastMatch = undefined;
  n.nextIntl = undefined;
  n = buildSeason(n, intl);
  n.phase = "event";
  n.pendingEvent = pickEvent(n, rand);
  return n;
}

export function applyEffect(s: CareerState, e: Effect): CareerState {
  const n = { ...s };
  if (e.ovr) n.ovr = clamp(n.ovr + e.ovr, 40, 99);
  if (e.form) n.form = clamp(n.form + e.form);
  if (e.confidence) n.confidence = clamp(n.confidence + e.confidence);
  if (e.fame) n.fame = clamp(n.fame + e.fame);
  if (e.money) n.money = Math.max(0, n.money + e.money);
  if (e.injury) n.injury += e.injury;
  if (e.suspension) n.suspension += e.suspension;
  if (e.boost) n.boost += e.boost;
  if (e.salary) n.salary = Math.max(1, Math.round(n.salary * e.salary));
  n.log = [e.text, ...n.log].slice(0, 40);
  return n;
}

/** Marca un evento como visto (para no repetirlo pronto) y pasa al partido. */
export function afterEvent(s: CareerState, id: string | undefined): CareerState {
  return { ...s, recentEvents: id ? [id, ...s.recentEvents.filter((x) => x !== id)].slice(0, 18) : s.recentEvents, pendingEvent: undefined, phase: s.national ? "national" : "match" };
}

export const repToBonus = (rep: number) => Math.min(5, Math.floor(rep / 60));
