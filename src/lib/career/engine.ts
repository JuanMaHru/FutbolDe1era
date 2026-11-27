/**
 * Motor del Modo Carrera v3.
 * Temporada con formato real: liga completa (tablas simuladas), Apertura/Clausura con playoffs,
 * copa nacional por rondas, copa continental (grupos / fase liga + ida y vuelta) y torneos de selecciones.
 * Solo los partidos "clave" se juegan con minijuegos; el resto se simula pero cuenta.
 */
import {
  RECOPA, SUPERCUPS, worldElite,
  CONTINENTAL, CONT_FORMAT, LEAGUES, NATIONS, clubInfo, clubsInLeague, continentalPool, isDerby, leagueOf,
  nationalRival, nationalTournament, strengthOf, CLUBS_W, type Round,
} from "./world";
import { pickEvent, type Effect } from "./events";
import { seasonAwards, ballonDor } from "./awards";

export type Role = "ARQ" | "DEF" | "MED" | "DEL";
export const ROLE_OF: Record<string, Role> = { ARQ: "ARQ", DFC: "DEF", LAT: "DEF", MC: "MED", MCO: "MED", EXT: "DEL", DC: "DEL" };

export type MomentKind =
  | "finish" | "placement" | "penalty" | "freekick" | "header" | "pass"
  | "tackle" | "intercept" | "save" | "penalty-save" | "freekick-save"
  | "trivia" | "ttt";
export interface Moment { kind: MomentKind; ok: boolean }

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

/** Potencial: se sortea al crear el jugador. */
export const TALENTS = [
  { id: "oficio", name: "Jugador de oficio", stars: 2, base: 0, growth: 0.85, cap: 79, p: 0.5, desc: "Laburante, de equipo. Va a tener que pelearla." },
  { id: "talento", name: "Talentoso", stars: 3, base: 2, growth: 1.05, cap: 85, p: 0.32, desc: "Tiene condiciones. Con trabajo puede llegar lejos." },
  { id: "crack", name: "Crack", stars: 4, base: 4, growth: 1.25, cap: 91, p: 0.14, desc: "Diferente. Los ojeadores de Europa ya lo siguen." },
  { id: "fenomeno", name: "Fenómeno generacional", stars: 5, base: 6, growth: 1.45, cap: 96, p: 0.04, desc: "Uno cada diez años. Puede marcar una época." },
] as const;
export type TalentId = (typeof TALENTS)[number]["id"];
export function rollTalent(rand: () => number): TalentId {
  let r = rand();
  for (const t of TALENTS) if ((r -= t.p) <= 0) return t.id;
  return "oficio";
}
export const talentOf = (s: { talent: TalentId }) => TALENTS.find((t) => t.id === s.talent) ?? TALENTS[0];

const ATTACK: MomentKind[] = ["finish", "placement", "penalty", "freekick", "header"];
const DEFENSE: MomentKind[] = ["tackle", "intercept", "save", "penalty-save", "freekick-save"];
const POOLS: Record<Role, [MomentKind, number][]> = {
  DEL: [["finish", 3], ["placement", 3], ["penalty", 2], ["freekick", 1], ["header", 1], ["trivia", 2], ["ttt", 1], ["pass", 1]],
  MED: [["pass", 3], ["intercept", 2], ["freekick", 1], ["finish", 1], ["trivia", 2], ["ttt", 1], ["penalty", 1]],
  DEF: [["tackle", 3], ["header", 2], ["intercept", 2], ["trivia", 2], ["ttt", 1], ["pass", 1]],
  ARQ: [["save", 3], ["penalty-save", 2], ["freekick-save", 2], ["trivia", 2], ["ttt", 1]],
};

// ---------------------------------------------------------------- tipos

export interface Row { pj: number; w: number; d: number; l: number; gf: number; ga: number; pts: number }
export interface Table { id: string; name: string; clubs: string[]; rounds: [string, string][][]; played: number; rows: Record<string, Row> }

export type CompKind = "league" | "playoff" | "cup" | "intl" | "national" | "super";
export interface FxResult { gf: number; ga: number; pens?: [number, number]; agg?: [number, number]; rating: number; goals: number; assists: number; played: boolean; key: boolean }
export interface Fixture {
  id: number;
  week: number;
  kind: CompKind;
  comp: string;
  stage: string;
  rival: string;
  home: boolean;
  knockout: boolean;
  key: boolean;
  table?: string;
  round?: number;
  leg?: 1 | 2;
  tie?: string;
  final?: boolean;
  result?: FxResult;
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
  /** Minutos de los goles (propios y en contra) para comentarios. */
  timeline: { min: number; us: boolean; mine?: boolean }[];
}

export interface Stats { pj: number; goals: number; assists: number; ratingSum: number; cleanSheets: number; penSaves: number }
const emptyStats = (): Stats => ({ pj: 0, goals: 0, assists: 0, ratingSum: 0, cleanSheets: 0, penSaves: 0 });

export interface SeasonLine {
  season: number; year: number; club: string; league: string;
  pj: number; goals: number; assists: number; cleanSheets: number; avg: number;
  place: number; cup: string; intl?: string; titles: string[]; awards: string[];
  age?: number; ovr?: number; highlights?: string[];
}

export interface Offer { club: string; tag?: "arabia" | "vuelta" | "salto" | "gigante"; salary: number }

interface CompState {
  cupAlive: boolean;
  cupRound: number; // próxima ronda a crear
  cupFaced: string[];
  intl?: string;
  intlAlive: boolean;
  intlStage: number; // índice en knockout a crear (después de grupos/fase liga)
  intlFaced: string[];
  intlPts: number;
  poAlive: boolean; // playoffs de liga
  poFaced: string[];
  tourn: number; // torneo actual (Apertura=0, Clausura=1)
  champions: string[]; // campeones de torneos en los que no saliste campeón
}

export interface CareerState {
  v: 3;
  name: string; nick: string; nationality: string; position: string; archetype: string;
  foot: "derecho" | "zurdo" | "ambidiestro"; number: number; age: number; talent: TalentId;
  startYear: number; firstClub: string; club: string; leagueOverride: Record<string, string>;
  ovr: number; form: number; confidence: number; fame: number; money: number; salary: number;
  season: number;
  tables: Table[];
  fixtures: Fixture[];
  idx: number;
  comp: CompState;
  nextIntl?: string;
  injury: number; suspension: number; boost: number;
  stats: Stats; lstats: Stats; totals: Stats;
  hattricks: number; derbyGoals: number; finalsWon: number; shootoutsWon: number;
  history: SeasonLine[];
  trophies: string[];
  awards: string[];
  caps: number; natGoals: number;
  /** Torneo especial al final de la temporada: con la selección o el Mundial de Clubes. */
  national?: { name: string; fixtures: Fixture[]; idx: number; table: Table; alive: boolean; kind?: "national" | "clubwc" };
  /** Competencias especiales ganadas para la próxima temporada (supercopa, recopa, intercontinental). */
  nextQual?: string[];
  /** Conteo de decisiones personales (para logros de personalidad). */
  choices?: Record<string, number>;
  /** Cuántas veces se te presentó la oportunidad de cada decisión (para medir proporciones). */
  chances?: Record<string, number>;
  /** Últimas ejecuciones en cada pelota parada (los arqueros te estudian). */
  shots?: Record<string, string[]>;
  lastKinds: MomentKind[];
  autoLog: string[]; // partidos simulados desde el último partido jugado
  pendingEvent?: string;
  recentEvents: string[];
  eventCounts: Record<string, number>;
  phase: "event" | "match" | "national" | "season-end" | "retired";
  offers?: Offer[];
  bonusDay?: string;
  log: string[];
  /** Momentos clave de la temporada en curso (para el recorrido final). */
  seasonHighlights?: string[];
  peakOvr?: number;
}

/** Agrega un momento clave a la temporada en curso. */
function hl(s: CareerState, text: string) {
  s.seasonHighlights = [...(s.seasonHighlights ?? []), text].slice(-14);
}
/** Agrega un momento clave a la última temporada cerrada (torneos de selección, Balón de Oro). */
function hlLast(s: CareerState, text: string) {
  const h = s.history[s.history.length - 1];
  if (h) s.history = [...s.history.slice(0, -1), { ...h, highlights: [...(h.highlights ?? []), text] }];
}

// ---------------------------------------------------------------- utilidades

export const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const pick = <T,>(arr: T[], rand: () => number) => arr[Math.floor(rand() * arr.length)];
const shuffle = <T,>(arr: T[], rand: () => number) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
export const currentYear = (s: CareerState) => s.startYear + s.season - 1;
export const role = (s: CareerState): Role => ROLE_OF[s.position] ?? "MED";
export const leagueOfState = (s: CareerState) => leagueOf(s.club, s.leagueOverride);
export const archetypeOf = (s: CareerState) => ARCHETYPES[role(s)].find((a) => a.id === s.archetype) ?? ARCHETYPES[role(s)][0];
export const isClubWC = (s: CareerState) => s.national?.kind === "clubwc";
export const myTeam = (s: CareerState) => (s.phase === "national" && s.national && !isClubWC(s) ? NATIONS[s.nationality]?.team ?? s.club : s.club);
/** Suma una decisión personal (o del mercado) al perfil del jugador. */
export function addChoice(s: CareerState, tag?: string, offered: (string | undefined)[] = [tag]): CareerState {
  const chances = { ...(s.chances ?? {}) };
  for (const t of new Set(offered)) if (t) chances[t] = (chances[t] ?? 0) + 1;
  if (!tag) return { ...s, chances };
  return { ...s, chances, choices: { ...(s.choices ?? {}), [tag]: (s.choices?.[tag] ?? 0) + 1 } };
}
/* ---------- Los arqueros te estudian ---------- */
export type ShotKind = "penalty" | "freekick" | "placement";
export interface ShotRecord { kind: ShotKind; choice: string }
/** Guarda dónde pateaste (últimas 8 por tipo). */
export function recordShots(s: CareerState, list: ShotRecord[]): CareerState {
  if (!list.length) return s;
  const shots = { ...(s.shots ?? {}) };
  for (const { kind, choice } of list) shots[kind] = [...(shots[kind] ?? []), choice].slice(-8);
  return { ...s, shots };
}
/**
 * Probabilidad de que el arquero adivine esta elección: cuanto más repetís (y más famoso sos, más te estudian), más la lee.
 * Variar baja la lectura casi a cero.
 */
export function keeperRead(history: string[] | undefined, choice: string, fame = 50): number {
  const h = (history ?? []).slice(-6);
  if (h.length < 2) return 0;
  const freq = h.filter((x) => x === choice).length / h.length;
  const streak = h[h.length - 1] === choice ? (h[h.length - 2] === choice ? 0.2 : 0.08) : 0;
  return Math.min(0.8, Math.max(0, freq * 0.85 + streak - 0.15) * (0.75 + fame / 200));
}
/** Lo que más repetís, para el aviso de "te estudiaron". */
export function favoriteShot(history: string[] | undefined): { choice: string; count: number; of: number } | null {
  const h = (history ?? []).slice(-6);
  if (h.length < 3) return null;
  const counts = new Map<string, number>();
  h.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1));
  const [choice, count] = [...counts].sort((a, b) => b[1] - a[1])[0];
  return count / h.length >= 0.5 ? { choice, count, of: h.length } : null;
}

/* ---------- Lesiones: más riesgo con la edad ---------- */
export function injuryRisk(s: CareerState): number {
  const a = s.age;
  const base = a <= 23 ? 0.005 : a <= 27 ? 0.008 : a <= 30 ? 0.013 : a <= 32 ? 0.02 : a <= 34 ? 0.03 : 0.045;
  const prof = (s.chances?.profesional ?? 0) >= 6 ? (s.choices?.profesional ?? 0) / (s.chances?.profesional ?? 1) : 0.5;
  return base * (1.25 - prof * 0.5); // cuidarse (elegir lo profesional) baja el riesgo
}
/** Fechas afuera si te lesionás: los veteranos tardan más en volver. */
export function injuryLength(s: CareerState, rand: () => number): number {
  const severe = rand() < (s.age >= 32 ? 0.22 : s.age >= 29 ? 0.12 : 0.06);
  return severe ? 5 + Math.floor(rand() * (s.age >= 32 ? 8 : 5)) : 1 + Math.floor(rand() * (s.age >= 30 ? 4 : 3));
}

/** Rival para el Mundial de Clubes: los mejores del mundo, sin repetir. */
function clubWorldRival(s: CareerState, used: string[], rand: () => number, top = 24): string {
  const pool = worldElite([s.club, ...used]).slice(0, top);
  return pick(pool.length ? pool : worldElite([s.club]), rand).name;
}
const won = (r: { gf: number; ga: number; pens?: [number, number] }) => r.gf > r.ga || (!!r.pens && r.pens[0] > r.pens[1]);

function poisson(l: number, rand: () => number) {
  l = Math.max(l, 0.12);
  let k = 0, p = Math.exp(-l), F = p;
  const u = rand();
  while (u > F && k < 8) { k++; p *= l / k; F += p; }
  return k;
}
/** Partido entre dos equipos que no incluyen al jugador. */
function simOther(a: string, b: string, rand: () => number): [number, number] {
  const d = (strengthOf(a) - strengthOf(b)) * 0.035;
  return [poisson(1.3 + d, rand), poisson(1.1 - d, rand)];
}

// ---------------------------------------------------------------- tablas

/** Fixture todos contra todos (método del círculo). */
function roundRobin(clubs: string[], double: boolean, rand: () => number): [string, string][][] {
  const list = shuffle(clubs, rand);
  if (list.length % 2) list.push("—");
  const n = list.length;
  const rounds: [string, string][][] = [];
  const arr = [...list];
  for (let r = 0; r < n - 1; r++) {
    const pairs: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i], b = arr[n - 1 - i];
      if (a !== "—" && b !== "—") pairs.push(r % 2 ? [b, a] : [a, b]);
    }
    rounds.push(pairs);
    arr.splice(1, 0, arr.pop()!);
  }
  return double ? [...rounds, ...rounds.map((rd) => rd.map(([a, b]) => [b, a] as [string, string]))] : rounds;
}
function newTable(id: string, name: string, clubs: string[], double: boolean, rand: () => number): Table {
  return { id, name, clubs, rounds: roundRobin(clubs, double, rand), played: 0, rows: Object.fromEntries(clubs.map((c) => [c, { pj: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }])) };
}
function addResult(t: Table, a: string, b: string, ga: number, gb: number) {
  const ra = t.rows[a], rb = t.rows[b];
  if (!ra || !rb) return;
  ra.pj++; rb.pj++; ra.gf += ga; ra.ga += gb; rb.gf += gb; rb.ga += ga;
  if (ga > gb) { ra.w++; rb.l++; ra.pts += 3; } else if (ga < gb) { rb.w++; ra.l++; rb.pts += 3; } else { ra.d++; rb.d++; ra.pts++; rb.pts++; }
}
export function standings(t: Table): [string, Row][] {
  return Object.entries(t.rows).sort(([, a], [, b]) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
}
export const placeIn = (t: Table, club: string) => standings(t).findIndex(([c]) => c === club) + 1;
const tableById = (s: CareerState, id?: string) => s.tables.find((t) => t.id === id) ?? s.national?.table;

// ---------------------------------------------------------------- creación

export function newCareer(input: {
  name: string; nick: string; nationality: string; position: string; archetype: string; foot: CareerState["foot"];
  number: number; age: number; club: string; repBonus: number; talent: TalentId;
}, rand: () => number = Math.random): CareerState {
  const t = TALENTS.find((x) => x.id === input.talent) ?? TALENTS[0];
  const s: CareerState = {
    v: 3, name: input.name.trim() || "Pibe sin nombre", nick: input.nick.trim(), nationality: input.nationality, position: input.position,
    archetype: input.archetype, foot: input.foot, number: input.number, age: input.age, talent: input.talent,
    startYear: new Date().getFullYear(), firstClub: input.club, club: input.club, leagueOverride: {},
    ovr: 54 + t.base + input.repBonus, form: 60, confidence: 45, fame: 5 + input.repBonus, money: 0, salary: 1,
    season: 1, tables: [], fixtures: [], idx: 0,
    comp: { cupAlive: true, cupRound: 0, cupFaced: [], intlAlive: false, intlStage: 0, intlFaced: [], intlPts: 0, poAlive: false, poFaced: [], tourn: 0, champions: [] },
    injury: 0, suspension: 0, boost: 0, stats: emptyStats(), lstats: emptyStats(), totals: emptyStats(),
    hattricks: 0, derbyGoals: 0, finalsWon: 0, shootoutsWon: 0,
    history: [], trophies: [], awards: [], caps: 0, natGoals: 0, lastKinds: [], autoLog: [],
    recentEvents: [], eventCounts: {}, phase: "event", pendingEvent: "debut", log: [`Firmaste tu primer contrato con ${input.club}.`],
  };
  s.salary = Math.max(1, Math.round(leagueOfState(s).salary * 0.12));
  const n = buildSeason(s, firstSeasonIntl(s), rand);
  hl(n, `🌱 Debut profesional en ${input.club} a los ${input.age} años`);
  return n;
}

function firstSeasonIntl(s: CareerState): string | undefined {
  const lg = leagueOfState(s);
  const rank = clubsInLeague(lg.id, s.leagueOverride).sort((a, b) => b.strength - a.strength).findIndex((c) => c.name === s.club) + 1;
  if (rank >= 1 && lg.top[0] && rank <= lg.top[0]) return CONTINENTAL[lg.continent][0];
  if (rank >= 1 && lg.top[1] && rank <= lg.top[1] && CONTINENTAL[lg.continent][1]) return CONTINENTAL[lg.continent][1];
  return undefined;
}

// ---------------------------------------------------------------- calendario

let FX_ID = 1;
const nextId = (s: CareerState) => Math.max(FX_ID, ...s.fixtures.map((f) => f.id + 1), ...(s.national?.fixtures.map((f) => f.id + 1) ?? [1]));

/** Arma la temporada: tablas, fechas de liga y huecos para copas. */
function buildSeason(s0: CareerState, intl: string | undefined, rand: () => number, qual: string[] = []): CareerState {
  const s: CareerState = { ...s0, tables: [], fixtures: [], idx: 0, stats: emptyStats(), lstats: emptyStats(), autoLog: [], seasonHighlights: [] };
  s.comp = { cupAlive: true, cupRound: 0, cupFaced: [], intl, intlAlive: !!intl, intlStage: 0, intlFaced: [], intlPts: 0, poAlive: false, poFaced: [], tourn: 0, champions: [] };
  const lg = leagueOfState(s);
  const clubs = clubsInLeague(lg.id, s.leagueOverride).map((c) => c.name);
  if (!clubs.includes(s.club)) clubs.push(s.club);
  FX_ID = 1;
  let week = 0;
  lg.format.tournaments.forEach((tname, ti) => {
    // Zonas: el club del jugador va en la zona A.
    const zones: string[][] = [];
    if (lg.format.zones === 2) {
      const others = shuffle(clubs.filter((c) => c !== s.club), rand);
      const half = Math.floor(clubs.length / 2);
      zones.push([s.club, ...others.slice(0, half - 1)], others.slice(half - 1));
    } else zones.push(clubs);
    const tables = zones.map((z, zi) =>
      newTable(`${lg.id}-${ti}-${zi}`, `${lg.name}${tname ? ` · ${tname}` : ""}${zones.length > 1 ? ` · Zona ${"AB"[zi]}` : ""}`, z, lg.format.double, rand),
    );
    s.tables.push(...tables);
    const mine = tables[0];
    mine.rounds.forEach((pairs, r) => {
      const p = pairs.find(([a, b]) => a === s.club || b === s.club);
      week += 3;
      if (!p) return; // fecha libre
      s.fixtures.push({ id: FX_ID++, week, kind: "league", comp: tname || lg.name, stage: `Fecha ${r + 1}`, rival: p[0] === s.club ? p[1] : p[0], home: p[0] === s.club, knockout: false, key: false, table: mine.id, round: r });
    });
    week += 2 + (lg.format.playoff?.rounds.length ?? 0) * 3; // espacio para playoffs
  });
  s.fixtures = markKeys(s, s.fixtures);
  // Copa nacional y continental: se agregan a medida que se avanza (primera ronda ya).
  const total = week;
  let n: CareerState = addCupRound(s, rand, total);
  if (intl) n = startIntl(n, rand, total);
  n = addSpecials(n, qual, total, rand);
  n.fixtures.sort((a, b) => a.week - b.week || a.id - b.id);
  return n;
}

const seasonWeeks = (s: CareerState) => Math.max(...s.fixtures.filter((f) => f.kind === "league").map((f) => f.week), 40) + 6;

/** Qué partidos de liga se juegan con minijuegos: clásicos, rivales fuertes, cierre del torneo y uno cada tanto. */
function markKeys(s: CareerState, list: Fixture[]): Fixture[] {
  const lgFx = list.filter((f) => f.kind === "league");
  const strong = new Set(clubsInLeague(leagueOfState(s).id, s.leagueOverride).filter((c) => c.name !== s.club).sort((a, b) => b.strength - a.strength).slice(0, 4).map((c) => c.name));
  const byTable = new Map<string, Fixture[]>();
  lgFx.forEach((f) => byTable.set(f.table!, [...(byTable.get(f.table!) ?? []), f]));
  let since = 0;
  return list.map((f) => {
    if (f.kind !== "league") return f;
    const ofTable = byTable.get(f.table!)!;
    const pos = ofTable.indexOf(f);
    const key = pos === 0 || isDerby(s.club, f.rival) || strong.has(f.rival) || pos >= ofTable.length - 2 || since >= 5;
    since = key ? 0 : since + 1;
    return { ...f, key };
  });
}

function cupWeek(s: CareerState, round: number, rounds: number, total: number) {
  return Math.max(Math.round(4 + ((round + 1) / (rounds + 1)) * (total - 8)) + 1, afterNow(s));
}
/** Semana mínima para un partido nuevo: siempre después del último jugado. */
const afterNow = (s: CareerState) => (s.idx > 0 ? s.fixtures[s.idx - 1].week + 1 : 0);

function addCupRound(s: CareerState, rand: () => number, total = seasonWeeks(s)): CareerState {
  const lg = leagueOfState(s);
  const rounds = lg.cupRounds;
  const r = s.comp.cupRound;
  if (!s.comp.cupAlive || r >= rounds.length) return s;
  const round = rounds[r];
  // Rivales: al principio de cualquier categoría del país; al final, los mejores.
  const country = lg.country;
  let pool = CLUBS_W.filter((c) => LEAGUES[s.leagueOverride[c.name] ?? c.league].country === country && c.name !== s.club && !s.comp.cupFaced.includes(c.name));
  const left = rounds.length - r;
  if (left <= 3) pool = pool.sort((a, b) => b.strength - a.strength).slice(0, left === 1 ? 4 : left === 2 ? 7 : 12);
  const rival = pick(pool.length ? pool : CLUBS_W.filter((c) => c.name !== s.club), rand).name;
  const w = cupWeek(s, r, rounds.length, total);
  const key = left <= 4 || strengthOf(rival) >= strengthOf(s.club);
  const tie = `cup-${r}`;
  const base = { kind: "cup" as const, comp: lg.cup, rival, knockout: true, key, tie, final: round.name.startsWith("Final") };
  const fx: Fixture[] = round.legs
    ? [{ ...base, id: nextId(s), week: w, stage: `${round.name} · Ida`, home: rand() < 0.5, leg: 1, final: false }, { ...base, id: nextId(s) + 1, week: w + 1, stage: `${round.name} · Vuelta`, home: false, leg: 2 }]
    : [{ ...base, id: nextId(s), week: w, stage: round.name, home: rand() < 0.5 }];
  if (round.legs) fx[1].home = !fx[0].home;
  return { ...s, fixtures: [...s.fixtures, ...fx].sort((a, b) => a.week - b.week || a.id - b.id), comp: { ...s.comp, cupRound: r + 1, cupFaced: [...s.comp.cupFaced, rival] } };
}

function startIntl(s: CareerState, rand: () => number, total = seasonWeeks(s)): CareerState {
  const lg = leagueOfState(s);
  const fmt = CONT_FORMAT[lg.continent];
  const name = s.comp.intl!;
  const pool = shuffle(continentalPool(lg.continent, lg.country).filter((c) => c.name !== s.club), rand);
  let fixtures = [...s.fixtures];
  const faced: string[] = [];
  const tables = [...s.tables];
  if (fmt.first === "group") {
    const rivals = pool.slice(0, 3).map((c) => c.name);
    faced.push(...rivals);
    const t = newTable(`intl-group`, `${name} · Grupo`, [s.club, ...rivals], true, rand);
    tables.push(t);
    t.rounds.forEach((pairs, r) => {
      const p = pairs.find(([a, b]) => a === s.club || b === s.club)!;
      fixtures.push({ id: nextId({ ...s, fixtures }), week: Math.round(6 + r * (total * 0.45 / 6)) + 2, kind: "intl", comp: name, stage: `Fase de grupos · Fecha ${r + 1}`, rival: p[0] === s.club ? p[1] : p[0], home: p[0] === s.club, knockout: false, key: r === 0 || r === 5 || strengthOf(p[0] === s.club ? p[1] : p[0]) >= strengthOf(s.club), table: t.id, round: r });
    });
  } else if (fmt.first === "league") {
    const rivals = pool.slice(0, 8).map((c) => c.name);
    faced.push(...rivals);
    rivals.forEach((rv, r) => {
      fixtures.push({ id: nextId({ ...s, fixtures }), week: Math.round(6 + r * (total * 0.5 / 8)) + 2, kind: "intl", comp: name, stage: `Fase liga · Fecha ${r + 1}`, rival: rv, home: r % 2 === 0, knockout: false, key: r === 0 || r === 7 || strengthOf(rv) >= strengthOf(s.club) + 3 });
    });
  }
  let n: CareerState = { ...s, fixtures, tables, comp: { ...s.comp, intlFaced: faced, intlStage: 0 } };
  if (fmt.first === "none") n = addIntlKnockout(n, rand);
  return n;
}

function addIntlKnockout(s: CareerState, rand: () => number): CareerState {
  const lg = leagueOfState(s);
  const fmt = CONT_FORMAT[lg.continent];
  const k = s.comp.intlStage;
  if (!s.comp.intlAlive || k >= fmt.knockout.length) return s;
  const round = fmt.knockout[k];
  const left = fmt.knockout.length - k;
  let pool = continentalPool(lg.continent, lg.country).filter((c) => c.name !== s.club && !s.comp.intlFaced.includes(c.name));
  // Continentes con pocos clubes en el juego: se puede repetir un rival de la fase anterior o cruzar con uno del mismo país.
  if (pool.length < 2) pool = [...pool, ...continentalPool(lg.continent, lg.country).filter((c) => c.name !== s.club && !s.comp.intlFaced.slice(-2).includes(c.name))];
  if (pool.length < 2) pool = [...pool, ...CLUBS_W.filter((c) => c.league === lg.id && c.name !== s.club && !s.comp.intlFaced.includes(c.name))];
  pool = pool.sort((a, b) => b.strength - a.strength).slice(0, left === 1 ? 4 : left === 2 ? 6 : left === 3 ? 10 : 16);
  const rival = pick(pool, rand).name;
  const total = seasonWeeks(s);
  const w = Math.max(Math.round(total * 0.55 + (k / fmt.knockout.length) * total * 0.42) + 2, afterNow(s));
  const base = { kind: "intl" as const, comp: s.comp.intl!, rival, knockout: true, key: true, tie: `intl-${k}`, final: round.name === "Final" };
  const fx: Fixture[] = round.legs
    ? [{ ...base, id: nextId(s), week: w, stage: `${round.name} · Ida`, home: rand() < 0.5, leg: 1, final: false }, { ...base, id: nextId(s) + 1, week: w + 1, stage: `${round.name} · Vuelta`, home: false, leg: 2 }]
    : [{ ...base, id: nextId(s), week: w, stage: round.name, home: false }];
  if (round.legs) fx[1].home = !fx[0].home;
  return { ...s, fixtures: [...s.fixtures, ...fx].sort((a, b) => a.week - b.week || a.id - b.id), comp: { ...s.comp, intlStage: k + 1, intlFaced: [...s.comp.intlFaced, rival] } };
}

/** Supercopa nacional, recopa continental e Intercontinental (según lo ganado la temporada anterior). */
function addSpecials(s: CareerState, qual: string[], total: number, rand: () => number): CareerState {
  const lg = leagueOfState(s);
  const fx: Fixture[] = [];
  let id = nextId(s);
  const mk = (f: Omit<Fixture, "id">) => fx.push({ ...f, id: id++ });
  const domestic = CLUBS_W.filter((c) => LEAGUES[c.league].country === lg.country && c.name !== s.club).sort((a, b) => b.strength - a.strength);
  if (qual.includes("supercup") && SUPERCUPS[lg.country] && domestic.length) {
    mk({ week: 1, kind: "super", comp: SUPERCUPS[lg.country], stage: "Final", rival: pick(domestic.slice(0, 4), rand).name, home: false, knockout: true, key: true, final: true, tie: "sup" });
  }
  const rec = RECOPA[lg.continent];
  if (qual.includes("recopa") && rec) {
    const rival = pick(continentalPool(lg.continent, lg.country).filter((c) => c.name !== s.club).sort((a, b) => b.strength - a.strength).slice(0, 6), rand).name;
    if (rec.legs) {
      mk({ week: 4, kind: "super", comp: rec.name, stage: "Final · Ida", rival, home: false, knockout: true, key: true, leg: 1, tie: "rec" });
      mk({ week: 5, kind: "super", comp: rec.name, stage: "Final · Vuelta", rival, home: true, knockout: true, key: true, leg: 2, final: true, tie: "rec" });
    } else mk({ week: 4, kind: "super", comp: rec.name, stage: "Final", rival, home: false, knockout: true, key: true, final: true, tie: "rec" });
  }
  if (qual.includes("intercont")) {
    const w = Math.round(total * 0.45);
    if (lg.continent === "UEFA") {
      const rival = pick(worldElite([s.club]).filter((c) => LEAGUES[c.league]?.continent === "CONMEBOL" || (c as { continent?: string }).continent === "CONMEBOL").slice(0, 4), rand)?.name ?? "Flamengo";
      mk({ week: w, kind: "super", comp: "Copa Intercontinental", stage: "Final", rival, home: false, knockout: true, key: true, final: true, tie: "ic-f" });
    } else {
      const rival = pick(worldElite([s.club]).filter((c) => (LEAGUES[c.league]?.continent ?? (c as { continent?: string }).continent) !== lg.continent && LEAGUES[c.league]?.continent !== "UEFA").slice(0, 6), rand)?.name ?? "Al Hilal";
      mk({ week: w, kind: "super", comp: "Copa Intercontinental", stage: "Semifinal", rival, home: false, knockout: true, key: true, tie: "ic-s" });
    }
  }
  return fx.length ? { ...s, fixtures: [...s.fixtures, ...fx].sort((a, b) => a.week - b.week || a.id - b.id) } : s;
}

/** Playoffs de liga (Apertura/Clausura, liguilla, MLS Cup). */
function addPlayoffRound(s: CareerState, roundIdx: number, rand: () => number, seedRival?: string): CareerState {
  const lg = leagueOfState(s);
  const po = lg.format.playoff!;
  if (roundIdx >= po.rounds.length) return s;
  const round = po.rounds[roundIdx];
  const tname = lg.format.tournaments[s.comp.tourn];
  const tables = s.tables.filter((t) => t.id.startsWith(`${lg.id}-${s.comp.tourn}-`));
  let rival = seedRival;
  if (!rival) {
    const qualified = tables.flatMap((t) => standings(t).slice(0, po.qualify).map(([c]) => c)).filter((c) => c !== s.club && !s.comp.poFaced.includes(c));
    const left = po.rounds.length - roundIdx;
    rival = pick(qualified.sort((a, b) => strengthOf(b) - strengthOf(a)).slice(0, left === 1 ? 3 : 6), rand) ?? pick(qualified, rand);
  }
  const lastWeek = Math.max(...s.fixtures.filter((f) => f.kind === "league" && f.comp === (tname || lg.name)).map((f) => f.week));
  const w = Math.max(lastWeek + 1 + roundIdx * 3, afterNow(s));
  const comp = tname ? `${tname} · Playoffs` : `${lg.name} · Playoffs`;
  const base = { kind: "playoff" as const, comp, rival: rival!, knockout: true, key: true, tie: `po-${s.comp.tourn}-${roundIdx}`, final: round.name.startsWith("Final") };
  const fx: Fixture[] = round.legs
    ? [{ ...base, id: nextId(s), week: w, stage: `${round.name} · Ida`, home: false, leg: 1, final: false }, { ...base, id: nextId(s) + 1, week: w + 1, stage: `${round.name} · Vuelta`, home: true, leg: 2 }]
    : [{ ...base, id: nextId(s), week: w, stage: round.name, home: true }];
  return { ...s, fixtures: [...s.fixtures, ...fx].sort((a, b) => a.week - b.week || a.id - b.id), comp: { ...s.comp, poAlive: true, poFaced: [...s.comp.poFaced, rival!] } };
}

// ---------------------------------------------------------------- partidos

export function nextFixture(s: CareerState): { fx: Fixture; idx: number } | null {
  if (s.phase === "national" && s.national) {
    const fx = s.national.fixtures[s.national.idx];
    return fx ? { fx, idx: s.national.idx } : null;
  }
  const fx = s.fixtures[s.idx];
  return fx ? { fx, idx: s.idx } : null;
}

export function startChance(s: CareerState): number {
  const need = strengthOf(myTeam(s)) - 4;
  const base = s.phase === "national" && !isClubWC(s) ? 45 : 50;
  return clamp(base + (s.ovr - need) * 4 + (s.confidence - 50) * 0.5 + (s.form - 50) * 0.3, 8, 97) / 100;
}

export function planMoments(s: CareerState, started: boolean, rand: () => number): MomentKind[] {
  const n = (started ? 2 : rand() < 0.6 ? 1 : 0) + (s.boost > 0 && started ? 1 : 0);
  const sig = archetypeOf(s).signature;
  const pool = POOLS[role(s)].map(([k, w]) => [k, k === sig ? w + 3 : w] as [MomentKind, number]);
  const out: MomentKind[] = [];
  for (let i = 0; i < n; i++) {
    const avail = pool.filter(([k]) => !out.includes(k) && !(s.lastKinds.includes(k) && rand() < 0.7));
    const list = avail.length ? avail : pool.filter(([k]) => !out.includes(k));
    let r = rand() * list.reduce((a, [, w]) => a + w, 0);
    for (const [k, w] of list) if ((r -= w) <= 0) { out.push(k); break; }
  }
  return out;
}

export function difficulty(s: CareerState, rival: string): number {
  return clamp(0.5 + (strengthOf(rival) - s.ovr) * 0.02 - (s.form - 50) * 0.003 - s.boost * 0.1, 0.1, 0.9);
}
export const signatureBonus = (s: CareerState, k: MomentKind) => (archetypeOf(s).signature === k ? 0.15 : 0);

/** Plan del partido en vivo: goles "de fondo" con minuto y minutos de tus jugadas. */
export interface LivePlan { kinds: MomentKind[]; minutes: number[]; baseFor: number[]; baseAgainst: number[] }
export function prepareMatch(s: CareerState, rival: string, kinds: MomentKind[], rand: () => number): LivePlan {
  const mine = strengthOf(myTeam(s)) + Math.max(0, s.ovr - strengthOf(myTeam(s))) * 0.3;
  const diff = (mine - strengthOf(rival)) * 0.035;
  const att = kinds.filter((k) => ATTACK.includes(k) || k === "pass").length;
  const def = kinds.filter((k) => DEFENSE.includes(k)).length;
  const gf = poisson(1.25 + diff - att * 0.3, rand);
  const ga = poisson(1.15 - diff - def * 0.3, rand);
  const mins = () => 2 + Math.floor(rand() * 89);
  // Jugadas del jugador: a veces la última es agónica.
  const minutes = kinds.map(() => 8 + Math.floor(rand() * 74)).sort((a, b) => a - b);
  if (minutes.length && rand() < 0.45) minutes[minutes.length - 1] = 85 + Math.floor(rand() * 8);
  return { kinds, minutes, baseFor: Array.from({ length: gf }, mins).sort((a, b) => a - b), baseAgainst: Array.from({ length: ga }, mins).sort((a, b) => a - b) };
}

/** Efecto de cada jugada: +1 nuestro, +1 del rival o nada. Se sortea una vez para que el marcador en vivo sea coherente. */
export function momentEffect(s: CareerState, kind: MomentKind, ok: boolean, rand: () => number): { us: number; them: number; goal: boolean; assist: boolean; save: boolean } {
  const r = role(s);
  if (ATTACK.includes(kind)) return { us: ok ? 1 : 0, them: 0, goal: ok, assist: false, save: false };
  if (kind === "pass") return { us: ok ? 1 : 0, them: 0, goal: false, assist: ok && r !== "ARQ", save: false };
  if (kind === "penalty-save") return { us: 0, them: ok ? 0 : 1, goal: false, assist: false, save: ok };
  if (DEFENSE.includes(kind)) return { us: 0, them: !ok && rand() < 0.75 ? 1 : 0, goal: false, assist: false, save: false };
  // trivia / tres en raya
  if (r === "DEL" || r === "MED") {
    if (!ok) return { us: 0, them: 0, goal: false, assist: false, save: false };
    const x = rand();
    return x < 0.35 ? { us: 1, them: 0, goal: true, assist: false, save: false } : x < 0.7 ? { us: 1, them: 0, goal: false, assist: true, save: false } : { us: 0, them: 0, goal: false, assist: false, save: false };
  }
  return { us: 0, them: !ok && rand() < 0.5 ? 1 : 0, goal: false, assist: false, save: false };
}

export type Effect3 = ReturnType<typeof momentEffect>;
/** Marcador en el minuto de la jugada i (antes de jugarla). */
export function scoreAt(plan: LivePlan, effects: Effect3[], i: number): [number, number] {
  const m = plan.minutes[i] ?? 90;
  let a = plan.baseFor.filter((x) => x < m).length, b = plan.baseAgainst.filter((x) => x < m).length;
  effects.slice(0, i).forEach((e) => { a += e.us; b += e.them; });
  return [a, b];
}

export function resolveMatch(s: CareerState, plan: LivePlan, effects: Effect3[], moments: Moment[], started: boolean): MatchResult {
  const gf = plan.baseFor.length + effects.reduce((a, e) => a + e.us, 0);
  const ga = plan.baseAgainst.length + effects.reduce((a, e) => a + e.them, 0);
  const goals = effects.filter((e) => e.goal).length;
  const assists = effects.filter((e) => e.assist).length;
  const saves = effects.filter((e) => e.save).length;
  const ok = moments.filter((m) => m.ok).length, bad = moments.length - ok;
  const r = role(s);
  const w = gf > ga, d = gf === ga;
  let rating = 6 + ok * 0.8 - bad * 0.6 + goals * 0.3 + (w ? 0.4 : d ? 0 : -0.4) + ((r === "ARQ" || r === "DEF") && ga === 0 ? 0.6 : 0) + saves * 0.5;
  if (!started) rating -= 0.4;
  rating = Math.round(clamp(rating, 3, 10) * 10) / 10;
  const timeline = [
    ...plan.baseFor.map((m) => ({ min: m, us: true })),
    ...plan.baseAgainst.map((m) => ({ min: m, us: false })),
    ...effects.flatMap((e, i) => [...(e.us ? [{ min: plan.minutes[i], us: true, mine: e.goal }] : []), ...(e.them ? [{ min: plan.minutes[i], us: false }] : [])]),
  ].sort((a, b) => a.min - b.min);
  const note = rating >= 8.5 ? "¡Figura de la cancha!" : rating >= 7.3 ? "Gran partido." : rating >= 6 ? "Cumpliste." : "Partido para el olvido.";
  return { gf, ga, rating, goals, assists, saves, started, played: true, note, timeline };
}

/** Partido sin minijuegos (simulado o ausente). */
export function simQuick(s: CareerState, rival: string, rand: () => number, mode: "simulate" | "absent"): MatchResult {
  if (mode === "absent") {
    const plan = prepareMatch({ ...s, ovr: 0 }, rival, [], rand);
    const r = resolveMatch(s, plan, [], [], false);
    return { ...r, rating: 0, goals: 0, assists: 0, saves: 0, played: false, note: s.injury > 0 ? "Lo viste desde la tribuna (lesionado)." : "Cumpliste la suspensión." };
  }
  const started = rand() < startChance(s);
  // Simulado: menos jugadas y éxito según tu nivel contra el rival (sin la ayuda de tus decisiones).
  const p = clamp(0.3 + (s.ovr - strengthOf(rival)) * 0.025 + (s.form - 50) * 0.003, 0.08, 0.72);
  const n = started ? (rand() < 0.75 ? 1 : 0) : rand() < 0.3 ? 1 : 0;
  const kinds = planMoments(s, started, rand).slice(0, n);
  const plan = prepareMatch(s, rival, kinds, rand);
  const moments = kinds.map((k) => ({ kind: k, ok: rand() < p }));
  const effects = moments.map((m) => momentEffect(s, m.kind, m.ok, rand));
  if (!kinds.length && !started) {
    const r = resolveMatch(s, plan, [], [], false);
    return { ...r, rating: 0, played: false, note: "No entraste." };
  }
  const r = resolveMatch(s, plan, effects, moments, started);
  return { ...r, rating: Math.round(Math.min(10, r.rating + 0.3) * 10) / 10 };
}

/** Definición por penales. `playerOk` = tu penal o tu atajada. */
export function shootout(s: CareerState, playerOk: boolean, rand: () => number): [number, number] {
  const isGk = role(s) === "ARQ";
  let a = 0, b = 0;
  for (let i = 0; i < 5; i++) {
    a += (i === 0 && !isGk ? playerOk : rand() < 0.76) ? 1 : 0;
    b += (i === 0 && isGk ? !playerOk : rand() < (isGk ? 0.68 : 0.76)) ? 1 : 0;
  }
  let guard = 0;
  while (a === b && guard++ < 20) { a += rand() < 0.74 ? 1 : 0; b += rand() < 0.74 ? 1 : 0; }
  if (a === b) a++;
  return [a, b];
}

/** Ida y vuelta: global del cruce si es la vuelta. */
export function aggregateBefore(s: CareerState, fx: Fixture): [number, number] | null {
  if (fx.leg !== 2) return null;
  const list = s.phase === "national" && s.national ? s.national.fixtures : s.fixtures;
  const ida = list.find((f) => f.tie === fx.tie && f.leg === 1 && f.comp === fx.comp && f.result);
  return ida ? [ida.result!.gf, ida.result!.ga] : null;
}
/** ¿Se define por penales? (único partido empatado o global empatado en la vuelta). */
export function needsPens(s: CareerState, fx: Fixture, r: { gf: number; ga: number }): boolean {
  if (!fx.knockout || fx.leg === 1) return false;
  const agg = aggregateBefore(s, fx);
  return agg ? agg[0] + r.gf === agg[1] + r.ga : r.gf === r.ga;
}

// ---------------------------------------------------------------- aplicar resultados

function addStats(t: Stats, res: MatchResult, cs: number): Stats {
  return { pj: t.pj + 1, goals: t.goals + res.goals, assists: t.assists + res.assists, ratingSum: t.ratingSum + res.rating, cleanSheets: t.cleanSheets + cs, penSaves: t.penSaves + res.saves };
}

/** Simula el resto de la fecha en las tablas que corresponden. */
function playRound(s: CareerState, fx: Fixture, res: MatchResult, rand: () => number) {
  const t = tableById(s, fx.table);
  if (!t || fx.round === undefined) return;
  const pairs = t.rounds[fx.round] ?? [];
  for (const [a, b] of pairs) {
    if (a === myTeam(s) || b === myTeam(s)) addResult(t, a, b, a === myTeam(s) ? res.gf : res.ga, a === myTeam(s) ? res.ga : res.gf);
    else { const [x, y] = simOther(a, b, rand); addResult(t, a, b, x, y); }
  }
  t.played = Math.max(t.played, fx.round + 1);
  // Otras zonas del mismo torneo juegan la misma fecha.
  if (fx.kind === "league") {
    s.tables.filter((o) => o.id !== t.id && o.id.slice(0, -1) === t.id.slice(0, -1) && o.played <= fx.round!).forEach((o) => {
      for (const [a, b] of o.rounds[fx.round!] ?? []) { const [x, y] = simOther(a, b, rand); addResult(o, a, b, x, y); }
      o.played = fx.round! + 1;
    });
  }
}

/** Aplica un partido (jugado o simulado) y avanza el calendario hasta el próximo partido clave. */
export function applyResult(s0: CareerState, idx: number, res: MatchResult, rand: () => number, simulateAll = false): CareerState {
  let s = applyOne(s0, idx, res, rand, simulateAll);
  if (s.phase === "season-end" || s.phase === "retired" || (s0.phase === "national")) return s;
  // Avanzar simulando partidos no clave.
  const auto: string[] = [];
  let guard = 0;
  while (guard++ < 200) {
    const nx = nextFixture(s);
    if (!nx) return endSeason(s, rand, auto);
    if (nx.fx.key && !simulateAll) break;
    const absent = s.injury > 0 || s.suspension > 0;
    let r = simQuick(s, nx.fx.rival, rand, absent ? "absent" : "simulate");
    if (needsPens(s, nx.fx, r)) r = { ...r, pens: shootout(s, rand() < 0.5, rand) };
    s = applyOne(s, nx.idx, r, rand, true);
    auto.push(fxLine(nx.fx, r));
    if (s.phase === "season-end" || s.phase === "retired") return { ...s, autoLog: auto };
  }
  s.autoLog = auto;
  s.phase = "event";
  s.pendingEvent = pickEvent(s, rand);
  return s;
}

export function fxLine(fx: Fixture, r: { gf: number; ga: number; pens?: [number, number]; goals: number; played: boolean }) {
  const res = won(r) ? "G" : r.gf === r.ga && !r.pens ? "E" : "P";
  return `${res}|${fx.comp} · ${fx.stage}|${fx.rival}|${r.gf}-${r.ga}${r.pens ? ` (${r.pens[0]}-${r.pens[1]} pen.)` : ""}|${r.played ? (r.goals ? "⚽".repeat(Math.min(r.goals, 4)) : "") : "—"}`;
}

function applyOne(s0: CareerState, idx: number, res: MatchResult, rand: () => number, auto = false): CareerState {
  const s: CareerState = { ...s0, tables: s0.tables.map((t) => ({ ...t, rows: Object.fromEntries(Object.entries(t.rows).map(([k, v]) => [k, { ...v }])) })), log: [...s0.log] };
  const national = s0.phase === "national" && !!s0.national;
  if (national) s.national = { ...s0.national!, fixtures: [...s0.national!.fixtures], table: { ...s0.national!.table, rows: Object.fromEntries(Object.entries(s0.national!.table.rows).map(([k, v]) => [k, { ...v }])) } };
  const list = national ? s.national!.fixtures : (s.fixtures = [...s.fixtures]);
  const fx = list[idx];
  const agg = aggregateBefore(s0, fx);
  const stored: Fixture = { ...fx, result: { gf: res.gf, ga: res.ga, pens: res.pens, agg: agg ? [agg[0] + res.gf, agg[1] + res.ga] : undefined, rating: res.rating, goals: res.goals, assists: res.assists, played: res.played, key: fx.key } };
  list[idx] = stored;

  if (res.played) {
    const r = role(s);
    const cs = res.ga === 0 && res.started && (r === "ARQ" || r === "DEF") ? 1 : 0;
    if (!national) s.stats = addStats(s.stats, res, cs);
    if (fx.kind === "league" || fx.kind === "playoff") s.lstats = addStats(s.lstats, res, cs);
    s.totals = addStats(s.totals, res, cs);
    if (res.goals >= 3) { s.hattricks++; hl(s, `🎩 Hat-trick contra ${fx.rival} (${fx.comp})`); }
    if (res.goals && s0.totals.goals === 0) hl(s, `⚽ Primer gol como profesional, contra ${fx.rival}`);
    for (const m of [50, 100, 200, 300, 400, 500]) if (s0.totals.goals < m && s.totals.goals >= m) hl(s, `💯 Gol número ${m} de tu carrera`);
    for (const m of [100, 250, 500, 750]) if (s0.totals.pj < m && s.totals.pj >= m) hl(s, `🏟️ Partido número ${m}`);
    if (res.gf - res.ga >= 4 && fx.key) hl(s, `💥 Goleada ${res.gf}-${res.ga} a ${fx.rival}`);
    if (res.goals && isDerby(myTeam(s), fx.rival) && fx.key) hl(s, `😈 Gol en el clásico contra ${fx.rival}`);
    if (isDerby(myTeam(s), fx.rival)) s.derbyGoals += res.goals;
    if (auto) {
      // Partido simulado: la forma y la confianza vuelven de a poco a valores normales.
      s.form = clamp(s.form + (60 - s.form) * 0.08 + (res.rating - 6.3));
      s.confidence = clamp(s.confidence + (52 - s.confidence) * 0.06 + (res.rating - 6.2) * 0.8 + (won(res) ? 0.5 : 0));
    } else {
      s.form = clamp(s.form + (res.rating - 6.5) * 6);
      s.confidence = clamp(s.confidence + (res.rating - 6.3) * 5 + (won(res) ? 1 : -0.5));
    }
    const weight = fx.kind === "national" ? 3 : fx.kind === "intl" || fx.kind === "super" ? 2 : fx.knockout ? 1.5 : 1;
    s.fame = clamp(s.fame + (Math.max(0, res.rating - 7) * weight + res.goals * 0.25 * weight * (strengthOf(fx.rival) / 75)) * (fx.key ? 0.6 : 0.25));
    if (national && !isClubWC(s)) s.natGoals += res.goals;
  } else s.confidence = clamp(s.confidence - 1);
  if (!national) s.money += s.salary;
  if (fx.key) s.boost = 0;
  if (!res.played) { if (s.injury > 0) s.injury--; else if (s.suspension > 0) s.suspension--; }
  else if (s.injury === 0 && rand() < injuryRisk(s) * (res.started === false ? 0.4 : 1)) {
    s.injury = injuryLength(s, rand);
    s.log = [`🩹 Te lesionaste contra ${fx.rival}: ${s.injury} ${s.injury === 1 ? "fecha" : "fechas"} afuera.`, ...s.log].slice(0, 50);
    if (s.injury >= 5) hl(s, `🩹 Lesión larga a los ${s.age} años: ${s.injury} fechas afuera`);
  }

  if (fx.table) playRound(s, stored, res, rand);

  const fullWin = fx.knockout && (fx.leg === 1 ? null : agg ? agg[0] + res.gf > agg[1] + res.ga || (agg[0] + res.gf === agg[1] + res.ga && !!res.pens && res.pens[0] > res.pens[1]) : won(res));
  const tieDone = fx.knockout && fx.leg !== 1;
  if (tieDone && res.pens && fullWin) s.shootoutsWon++;
  const year = currentYear(s);

  if (national) {
    const nat = s.national!;
    nat.idx = idx + 1;
    const isGroupEnd = !fx.knockout && fx.round === 2;
    if (isGroupEnd && placeIn(nat.table, myTeam(s)) > 2) nat.alive = false;
    if (fx.knockout && !fullWin) nat.alive = false;
    const cwc = nat.kind === "clubwc";
    if (!cwc) s.caps += res.played ? 1 : 0;
    if (fx.final && !fullWin) hlLast(s, `💔 Final perdida ${cwc ? "del" : "de la"} ${nat.name} contra ${fx.rival}`);
    if (fx.final && fullWin) {
      hlLast(s, cwc ? `🌐 ¡Campeón del ${nat.name} con ${s.club}!` : `🏆 ¡Campeón de la ${nat.name} con ${NATIONS[s.nationality].name}!`);
      s.trophies = [...s.trophies, cwc ? `${nat.name} (${s.club})` : `${nat.name} con ${NATIONS[s.nationality].name}`];
      s.finalsWon++;
      s.fame = clamp(s.fame + 15);
      s.log.unshift(`🏆 ¡CAMPEÓN de la ${nat.name}!`);
    }
    if (nat.alive && fx.knockout && !fx.final) nat.fixtures = [...nat.fixtures]; // siguiente ronda ya existe
    if (!nat.alive || nat.idx >= nat.fixtures.length) {
      if (!nat.alive) { s.log.unshift(`${cwc ? s.club : NATIONS[s.nationality].name} quedó afuera ${cwc ? "del" : "de la"} ${nat.name} (${fx.stage}).`); if (!fx.final) hlLast(s, `${cwc ? "🌐" : "🎽"} ${nat.name}: eliminados en ${fx.stage}`); }
      return finishYear(s, rand);
    }
    // Rival de la siguiente ronda.
    const nx = nat.fixtures[nat.idx];
    const used = nat.fixtures.map((f) => f.rival).filter(Boolean);
    if (!nx.rival) nat.fixtures[nat.idx] = { ...nx, rival: cwc ? clubWorldRival(s, used, rand, nx.final ? 5 : nx.stage.startsWith("Semi") ? 8 : 16) : nationalRival(s.nationality, nat.name, used, rand) };
    s.phase = "event";
    s.pendingEvent = pickEvent(s, rand);
    return s;
  }

  s.idx = idx + 1;
  const lg = leagueOfState(s);
  if (fx.kind === "super" && tieDone) {
    if (fullWin && fx.final) {
      s.trophies = [...s.trophies, `${fx.comp} ${year} (${s.club})`];
      s.finalsWon++;
      s.fame = clamp(s.fame + (fx.comp === "Copa Intercontinental" ? 12 : 4));
      hl(s, `🏆 Campeón de la ${fx.comp}${res.pens ? " por penales" : ""}`);
      s.log.unshift(`🏆 ¡Campeón de la ${fx.comp}!`);
    } else if (fullWin && fx.comp === "Copa Intercontinental") {
      // Ganaste la semifinal: en la final espera el campeón de Europa.
      const rival = pick(worldElite([s.club]).filter((c) => LEAGUES[c.league]?.continent === "UEFA").slice(0, 4), rand).name;
      s.fixtures = [...s.fixtures, { id: nextId(s), week: Math.max(fx.week + 1, afterNow(s)), kind: "super" as const, comp: fx.comp, stage: "Final", rival, home: false, knockout: true, key: true, final: true, tie: "ic-f" }].sort((a, b) => a.week - b.week || a.id - b.id);
    } else if (!fullWin && fx.final) hl(s, `💔 Final perdida de la ${fx.comp} contra ${fx.rival}`);
  }
  if (fx.kind === "cup" && tieDone) {
    if (!fullWin) { s.comp = { ...s.comp, cupAlive: false }; if (fx.final) hl(s, `💔 Final perdida de la ${fx.comp} contra ${fx.rival}`); }
    else if (fx.final) {
      hl(s, `🏆 Campeón de la ${fx.comp}${res.pens ? " por penales" : ""}`);
      s.trophies = [...s.trophies, `${fx.comp} ${year} (${s.club})`];
      s.finalsWon++;
      s.fame = clamp(s.fame + 6);
      s.log.unshift(`🏆 ¡Campeón de la ${fx.comp}!`);
    } else Object.assign(s, addCupRound(s, rand));
  }
  if (fx.kind === "intl") {
    const fmt = CONT_FORMAT[lg.continent];
    if (!fx.knockout) {
      s.comp = { ...s.comp, intlPts: s.comp.intlPts + (won(res) ? 3 : res.gf === res.ga ? 1 : 0) };
      const groupEnd = fx.stage.startsWith("Fase de grupos") && fx.round === 5;
      const leagueEnd = fx.stage.startsWith("Fase liga · Fecha 8");
      if (groupEnd) {
        const t = tableById(s, "intl-group")!;
        if (placeIn(t, s.club) <= 2) Object.assign(s, addIntlKnockout(s, rand));
        else { s.comp = { ...s.comp, intlAlive: false }; s.log.unshift(`Eliminados en la fase de grupos de la ${fx.comp}.`); }
      }
      if (leagueEnd) {
        const pts = s.comp.intlPts;
        const direct = lg.continent === "UEFA" ? 16 : 13;
        const playoff = lg.continent === "UEFA" ? 10 : 99;
        if (pts >= direct) { s.comp = { ...s.comp, intlStage: lg.continent === "UEFA" ? 1 : 0 }; Object.assign(s, addIntlKnockout(s, rand)); s.log.unshift(`${pts} puntos en la fase liga: ¡directo a octavos!`); }
        else if (pts >= playoff) Object.assign(s, addIntlKnockout(s, rand));
        else { s.comp = { ...s.comp, intlAlive: false }; s.log.unshift(`${pts} puntos: eliminados en la fase liga de la ${fx.comp}.`); }
      }
    } else if (tieDone) {
      if (!fullWin) { s.comp = { ...s.comp, intlAlive: false }; if (fx.final) hl(s, `💔 Final perdida de la ${fx.comp} contra ${fx.rival}`); else if (fx.stage.startsWith("Semifinal")) hl(s, `🌎 Semifinal de la ${fx.comp}`); }
      else if (fx.final) {
        hl(s, `🏆 ¡Campeón de la ${fx.comp}!`);
        s.trophies = [...s.trophies, `${fx.comp} ${year} (${s.club})`];
        s.finalsWon++;
        s.fame = clamp(s.fame + 14);
        s.log.unshift(`🏆 ¡Campeón de la ${fx.comp}!`);
      } else if (fmt.knockout.length > s.comp.intlStage) Object.assign(s, addIntlKnockout(s, rand));
    }
  }
  if (fx.kind === "league") {
    // ¿Terminó la fase regular de este torneo?
    const t = tableById(s, fx.table)!;
    const lastOfTable = !s.fixtures.slice(s.idx).some((f) => f.table === fx.table);
    if (lastOfTable && lg.format.playoff) {
      // Jugar las fechas restantes de la tabla (fechas libres) y ver si clasifica.
      while (t.played < t.rounds.length) {
        for (const [a, b] of t.rounds[t.played]) { const [x, y] = simOther(a, b, rand); addResult(t, a, b, x, y); }
        t.played++;
      }
      const pos = placeIn(t, s.club);
      if (pos <= lg.format.playoff.qualify) {
        const zones = s.tables.filter((o) => o.id.startsWith(`${lg.id}-${s.comp.tourn}-`));
        const other = zones.find((z) => z.id !== t.id) ?? t;
        const seed = standings(other)[Math.max(0, lg.format.playoff.qualify - pos)]?.[0];
        Object.assign(s, addPlayoffRound({ ...s, comp: { ...s.comp, poFaced: [] } }, 0, rand, seed && seed !== s.club ? seed : undefined));
        s.log.unshift(`Clasificaron a los playoffs (${pos}º).`);
      } else {
        s.comp = { ...s.comp, champions: [...s.comp.champions, pick(standings(t).slice(0, 4).map(([c]) => c), rand)] };
        s.log.unshift(`Terminaron ${pos}º: afuera de los playoffs.`);
        s.comp = { ...s.comp, tourn: s.comp.tourn + 1 };
      }
    }
  }
  if (fx.kind === "playoff" && tieDone) {
    const po = lg.format.playoff!;
    const roundIdx = po.rounds.findIndex((r) => fx.stage.startsWith(r.name));
    const tname = lg.format.tournaments[s.comp.tourn];
    if (!fullWin) {
      if (fx.final) hl(s, `💔 Final perdida del ${tname || lg.name} contra ${fx.rival}`);
      s.comp = { ...s.comp, poAlive: false, tourn: s.comp.tourn + 1, champions: [...s.comp.champions, fx.rival] };
    } else if (fx.final) {
      hl(s, `🏆 Campeón del ${tname || lg.name}`);
      const title = `${tname || lg.name} ${year} (${s.club})`;
      s.trophies = [...s.trophies, title];
      s.finalsWon++;
      s.fame = clamp(s.fame + 9);
      s.log.unshift(`🏆 ¡Campeón del ${tname || lg.name}!`);
      s.comp = { ...s.comp, poAlive: false, tourn: s.comp.tourn + 1 };
    } else Object.assign(s, addPlayoffRound(s, roundIdx + 1, rand));
  }
  return s;
}

// ---------------------------------------------------------------- fin de temporada

/** Tabla anual (Apertura + Clausura) o tabla única. */
export function annualPlace(s: CareerState): { place: number; size: number } {
  const lg = leagueOfState(s);
  const rows: Record<string, Row> = {};
  s.tables.filter((t) => t.id.startsWith(`${lg.id}-`)).forEach((t) => Object.entries(t.rows).forEach(([c, r]) => {
    const x = (rows[c] ??= { pj: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
    x.pj += r.pj; x.pts += r.pts; x.gf += r.gf; x.ga += r.ga;
  }));
  const sorted = Object.entries(rows).sort(([, a], [, b]) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga));
  return { place: sorted.findIndex(([c]) => c === s.club) + 1, size: sorted.length };
}

function cupResult(s: CareerState): string {
  const cup = s.fixtures.filter((f) => f.kind === "cup" && f.result);
  if (!cup.length) return "—";
  const last = cup[cup.length - 1];
  if (last.final && last.result && (won(last.result) || (last.result.agg && last.result.agg[0] > last.result.agg[1]))) return "Campeón";
  return last.stage.replace(" · Ida", "").replace(" · Vuelta", "");
}
function intlResult(s: CareerState): string | undefined {
  if (!s.comp.intl) return undefined;
  const games = s.fixtures.filter((f) => f.kind === "intl" && f.result);
  if (!games.length) return undefined;
  const last = games[games.length - 1];
  if (s.trophies.includes(`${s.comp.intl} ${currentYear(s)} (${s.club})`)) return `${s.comp.intl}: Campeón`;
  return `${s.comp.intl}: ${last.knockout ? last.stage.replace(" · Ida", "").replace(" · Vuelta", "") : last.stage.split(" · ")[0]}`;
}

function endSeason(s0: CareerState, rand: () => number, auto: string[] = []): CareerState {
  const s: CareerState = { ...s0, log: [...s0.log], autoLog: auto };
  const lg = leagueOfState(s);
  const year = currentYear(s);
  const titles: string[] = [];
  const { place, size } = annualPlace(s);
  if (lg.format.type === "rr" && !lg.format.playoff && place === 1) {
    titles.push(`${lg.name} ${year} (${s.club})`);
    s.fame = clamp(s.fame + 10);
  }
  if (lg.format.type === "rr" && lg.format.playoff && place === 1) titles.push(`Supporters' Shield ${year} (${s.club})`);
  if (lg.promote && place <= 2) {
    s.leagueOverride = { ...s.leagueOverride, [s.club]: lg.promote };
    titles.push(`Ascenso a ${LEAGUES[lg.promote].name} ${year} (${s.club})`);
    s.log.unshift(`⬆️ ¡${s.club} ascendió a la ${LEAGUES[lg.promote].name}!`);
  } else if (lg.relegateTo && place >= size) {
    s.leagueOverride = { ...s.leagueOverride, [s.club]: lg.relegateTo };
    s.log.unshift(`⬇️ ${s.club} descendió a la ${LEAGUES[lg.relegateTo].name}.`);
  }
  s.trophies = [...s.trophies, ...titles];
  titles.forEach((t) => hl(s, t.startsWith("Ascenso") ? `⬆️ ${t.replace(/ \d{4} \(.*\)$/, "")}` : `🏆 Campeón: ${t.replace(/ \(.*\)$/, "")}`));
  if (lg.relegateTo && place >= size) hl(s, `⬇️ Descenso a la ${LEAGUES[lg.relegateTo].name}`);
  const wonTourn = s.trophies.some((t) => t.includes(` ${year} (${s.club})`) && lg.format.tournaments.some((n) => n && t.startsWith(n)));
  s.nextIntl = (lg.top[0] && place <= lg.top[0]) || wonTourn ? CONTINENTAL[lg.continent][0] : lg.top[1] && place <= lg.top[1] && CONTINENTAL[lg.continent][1] ? CONTINENTAL[lg.continent][1] : undefined;

  // Competencias especiales para la próxima temporada (las gana el club, no el jugador).
  const wonT = (re: RegExp) => s.trophies.some((t) => re.test(t) && t.includes(` ${year} (${s.club})`));
  const q: string[] = [];
  if (wonT(new RegExp(`^(${lg.name}|${lg.cup}|${lg.format.tournaments.filter(Boolean).join("|") || "-"})`))) q.push("supercup");
  if (wonT(/^(Copa Libertadores|Copa Sudamericana|Champions League|Europa League)/)) q.push("recopa");
  if (wonT(/^(Copa Libertadores|Champions League|Concacaf Champions Cup|AFC Champions League)/)) q.push("intercont");
  s.nextQual = q;

  // Premios individuales de la liga.
  const aw = seasonAwards(s, place, rand);
  s.awards = [...s.awards, ...aw];
  aw.forEach((a) => { s.log.unshift(`🏅 ${a}`); hl(s, `🏅 ${a}`); });

  const avg = s.stats.pj ? Math.round((s.stats.ratingSum / s.stats.pj) * 10) / 10 : 0;
  const seasonTitles = [...new Set([...s0.trophies.filter((t) => t.includes(` ${year} (${s.club})`)), ...titles])];
  s.history = [...s.history, { season: s.season, year, club: s.club, league: lg.name, pj: s.stats.pj, goals: s.stats.goals, assists: s.stats.assists, cleanSheets: s.stats.cleanSheets, avg, place, cup: cupResult(s), intl: intlResult(s), titles: seasonTitles, awards: aw, age: s.age, ovr: s.ovr, highlights: s.seasonHighlights ?? [] }];

  // Evolución: potencial, edad y rendimiento.
  const t = talentOf(s);
  const age = s.age + 1;
  const g = age <= 23 ? (2 + rand() * 3) * t.growth : age <= 28 ? rand() * 2 * t.growth : age <= 31 ? -rand() * 1.5 : -(2 + rand() * 2);
  let ovr = s.ovr + Math.round(g) + (avg >= 7.3 ? 1 : 0);
  if (ovr > t.cap && g > 0) ovr = Math.max(s.ovr, t.cap + (rand() < 0.1 ? 1 : 0));
  s.age = age;
  s.ovr = clamp(ovr, 40, 99);
  s.peakOvr = Math.max(s.peakOvr ?? 0, s.ovr);

  // Selección.
  const nat = NATIONS[s.nationality];
  const need = nat ? nat.strength - 8 : 99;
  if (nat && s.ovr >= need && s.fame >= 45) {
    const caps = 3 + Math.floor(rand() * 4);
    const gg = role(s) === "DEL" ? Math.floor(rand() * 3) : rand() < 0.25 ? 1 : 0;
    s.caps += caps;
    s.natGoals += gg;
    s.log.unshift(`🎽 Convocado a ${nat.name} en Eliminatorias y amistosos: ${caps} partidos, ${gg} goles.`);
    if (s0.caps === 0) hlLast(s, `🎽 Primera convocatoria a ${nat.name}`);
    const tour = nationalTournament(s.nationality, year);
    if (tour) {
      const rivals: string[] = [];
      for (let i = 0; i < 3; i++) rivals.push(nationalRival(s.nationality, tour.name, rivals, rand));
      const table = newTable("nat-group", `${tour.name} · Grupo`, [nat.team, ...rivals], false, rand);
      const fixtures: Fixture[] = [];
      table.rounds.forEach((pairs, r) => {
        const p = pairs.find(([a, b]) => a === nat.team || b === nat.team)!;
        fixtures.push({ id: 900 + r, week: r, kind: "national", comp: tour.name, stage: `Fase de grupos · Fecha ${r + 1}`, rival: p[0] === nat.team ? p[1] : p[0], home: true, knockout: false, key: true, table: "nat-group", round: r });
      });
      tour.rounds.filter((r) => !r.startsWith("Fase")).forEach((r, i) => fixtures.push({ id: 910 + i, week: 3 + i, kind: "national", comp: tour.name, stage: r, rival: "", home: true, knockout: true, key: true, final: r === "Final", tie: `nat-${i}` }));
      s.national = { name: tour.name, fixtures, idx: 0, table, alive: true };
      s.phase = "event";
      s.pendingEvent = "national-call";
      return s;
    }
  } else {
    const tour = nationalTournament(s.nationality, year);
    if (tour && nat) s.log.unshift(`📺 Viste la ${tour.name} por TV. ¡El próximo puede ser tuyo!`);
  }
  // Mundial de Clubes cada 4 años (2029, 2033…): campeones continentales recientes y los mejores del ranking.
  if (year % 4 === 1 && !nationalTournament(s.nationality, year)) {
    const champ = [0, 1, 2, 3].some((k) => s.trophies.some((t) => /^(Copa Libertadores|Champions League|Concacaf Champions Cup|AFC Champions League)/.test(t) && t.includes(` ${year - k} (${s.club})`)));
    if (champ || clubInfo(s.club).strength >= 82) {
      const name = `Mundial de Clubes ${year}`;
      const rivals: string[] = [];
      for (let i = 0; i < 3; i++) rivals.push(clubWorldRival(s, rivals, rand, 30));
      const table = newTable("nat-group", `${name} · Grupo`, [s.club, ...rivals], false, rand);
      const fixtures: Fixture[] = [];
      table.rounds.forEach((pairs, r) => {
        const p = pairs.find(([a, b]) => a === s.club || b === s.club)!;
        fixtures.push({ id: 900 + r, week: r, kind: "national", comp: name, stage: `Fase de grupos · Fecha ${r + 1}`, rival: p[0] === s.club ? p[1] : p[0], home: true, knockout: false, key: true, table: "nat-group", round: r });
      });
      ["Octavos de final", "Cuartos de final", "Semifinal", "Final"].forEach((r, i) => fixtures.push({ id: 910 + i, week: 3 + i, kind: "national", comp: name, stage: r, rival: "", home: true, knockout: true, key: true, final: r === "Final", tie: `cwc-${i}` }));
      s.national = { name, fixtures, idx: 0, table, alive: true, kind: "clubwc" };
      s.phase = "event";
      s.pendingEvent = "clubwc-call";
      return s;
    }
  }
  return finishYear(s, rand);
}

/** Balón de Oro y ofertas. */
function finishYear(s0: CareerState, rand: () => number): CareerState {
  const s: CareerState = { ...s0, national: undefined, log: [...s0.log] };
  const bo = ballonDor(s, rand);
  if (bo.award) {
    s.awards = [...s.awards, bo.award];
    s.fame = clamp(s.fame + 10);
    s.log.unshift(`🏆 ${bo.award}`);
    const h = s.history[s.history.length - 1];
    if (h) s.history = [...s.history.slice(0, -1), { ...h, awards: [...h.awards, bo.award], highlights: [...(h.highlights ?? []), `🌟 ¡Ganaste el ${bo.award}!`] }];
  } else if (bo.rank) s.log.unshift(`🗳️ Quedaste ${bo.rank}º en la votación del Balón de Oro.`);
  s.offers = makeOffers(s, rand);
  s.phase = s.age >= 38 ? "retired" : "season-end";
  return s;
}

export function makeOffers(s: CareerState, rand: () => number): Offer[] {
  const cur = clubInfo(s.club).strength;
  // Si tu nivel supera mucho al de tu club, te buscan clubes a tu altura.
  const jump = s.ovr >= cur + 2 ? Math.max(s.fame >= 30 ? 7 : 4, s.ovr - cur - 2) : 2;
  const reach = Math.min(90, s.ovr + 3, cur + jump + (s.fame >= 70 ? 3 : 0));
  // Un crack no recibe ofertas de equipos chicos.
  const floor = Math.max(45, Math.min(reach - 14, s.ovr - 18), s.ovr >= 84 ? Math.min(78, s.ovr - 12) : 0);
  const pool = CLUBS_W.filter((c) => c.name !== s.club && c.strength <= reach && c.strength >= floor && c.league !== "ARG2");
  const lg = leagueOfState(s);
  const sal = (club: string, mult = 1) => Math.round(LEAGUES[clubInfo(club).league].salary * (0.5 + clubInfo(club).strength / 120) * (1 + s.fame / 150) * mult);
  const out = new Map<string, Offer>();
  const add = (club: string, tag?: Offer["tag"], mult = 1) => { if (!out.has(club) && club !== s.club) out.set(club, { club, tag, salary: sal(club, mult) }); };
  const best = (list: typeof pool) => [...list].sort((a, b) => b.strength - a.strength)[Math.floor(rand() * Math.min(4, list.length))];
  const sameCountry = pool.filter((c) => LEAGUES[c.league].country === lg.country);
  const sameCont = pool.filter((c) => LEAGUES[c.league].continent === lg.continent && LEAGUES[c.league].country !== lg.country);
  const up = pool.filter((c) => c.strength >= cur + 4);
  // Si tu media está muy por encima de tu club (o sos un crack), los grandes del mundo vienen por vos.
  const gap = s.ovr - cur;
  if (gap >= 6 || s.ovr >= 85) {
    const top = CLUBS_W.filter((c) => c.name !== s.club && c.strength > cur && c.strength >= Math.min(84, s.ovr - 6) && c.strength <= s.ovr + 6 && c.league !== "ARG2")
      .sort((a, b) => b.strength - a.strength).slice(0, 10);
    const n = s.ovr >= 88 || gap >= 12 ? 3 : 2;
    for (let i = 0; i < 12 && top.length && [...out.values()].filter((o) => o.tag === "gigante" || o.tag === "salto").length < n; i++) {
      const c = pick(top, rand);
      add(c.name, c.strength >= 84 ? "gigante" : "salto", c.strength >= 84 ? 1.25 : 1);
    }
  }
  if (up.length && rand() < 0.7) add(best(up).name, "salto");
  if (sameCountry.length) add(best(sameCountry).name);
  if (sameCont.length && rand() < 0.7) add(best(sameCont).name);
  // Petrodólares: Arabia aparece con ofertas millonarias para jugadores consagrados.
  if (s.age >= 27 && s.fame >= 30 && lg.id !== "KSA" && rand() < 0.45) {
    const ksa = CLUBS_W.filter((c) => c.league === "KSA").sort((a, b) => b.strength - a.strength).slice(0, 4);
    add(pick(ksa, rand).name, "arabia", 4);
  }
  // Volver al club de origen para cerrar la carrera.
  const homeCountry = LEAGUES[clubInfo(s.firstClub).league]?.country;
  if (s.age >= 29 && lg.country !== homeCountry && s.club !== s.firstClub && rand() < 0.55) add(s.firstClub, "vuelta", 0.7);
  for (let i = 0; i < 12 && out.size < 4 && pool.length; i++) add(pick(pool, rand).name);
  return [...out.values()].slice(0, 5);
}

export function startNextSeason(s: CareerState, offer: Offer | null, rand: () => number): CareerState {
  let n: CareerState = { ...s, log: [...s.log] };
  let intl = s.nextIntl;
  let qual = s.nextQual ?? [];
  // Decisiones de mercado: quedarse rechazando ofertas mejores suma lealtad.
  const better = (s.offers ?? []).some((o) => clubInfo(o.club).strength > clubInfo(s.club).strength);
  const moved = !!offer && offer.club !== s.club;
  const offered = [better ? "fiel" : undefined, (s.offers ?? []).some((o) => o.club !== s.club) ? "aventurero" : undefined];
  n = addChoice(n, moved ? "aventurero" : !offer && better ? "fiel" : undefined, offered);
  if (offer && offer.club !== s.club) {
    qual = [];
    n.club = offer.club;
    n.confidence = 40;
    n.salary = offer.salary;
    n.log.unshift(offer.tag === "vuelta" ? `🏠 ¡Volviste a ${offer.club}! La hinchada te recibe como un ídolo.` : offer.tag === "arabia" ? `💰 Firmaste un contrato millonario con ${offer.club}.` : `✍️ ¡Nuevo club! Firmaste con ${offer.club}.`);
    if (offer.tag === "vuelta") n.fame = clamp(n.fame + 5);
    intl = firstSeasonIntl(n);
  } else {
    n.confidence = clamp(n.confidence + 5);
    n.salary = Math.max(n.salary, Math.round(leagueOfState(n).salary * (0.5 + clubInfo(n.club).strength / 120) * (1 + n.fame / 150)));
  }
  n.season = s.season + 1;
  n.injury = 0; n.suspension = 0; n.form = 60;
  n.offers = undefined; n.nextIntl = undefined; n.nextQual = undefined;
  n = buildSeason(n, intl, rand, qual);
  if (offer && offer.club !== s.club) hl(n, offer.tag === "vuelta" ? `🏠 Vuelta a casa: ${offer.club}` : offer.tag === "arabia" ? `💰 Contrato millonario con ${offer.club}` : `✍️ Fichaje por ${offer.club}`);
  n.phase = "event";
  // Si la primera fecha no es clave, simular hasta la primera que sí.
  if (!n.fixtures[0]?.key) n.fixtures[0] = { ...n.fixtures[0], key: true };
  n.pendingEvent = pickEvent(n, rand);
  return n;
}

/** Simula el resto de la temporada (o del torneo de selecciones) sin jugar. */
export function simulateRest(s0: CareerState, rand: () => number): CareerState {
  let s = s0;
  let guard = 0;
  while ((s.phase === "event" || s.phase === "match" || s.phase === "national") && guard++ < 300) {
    if (s.phase === "event") {
      s = { ...s, pendingEvent: undefined, phase: s.national ? "national" : "match" };
      continue;
    }
    const nx = nextFixture(s);
    if (!nx) break;
    let rival = nx.fx.rival;
    if (!rival && s.national) rival = isClubWC(s) ? clubWorldRival(s, s.national.fixtures.map((f) => f.rival).filter(Boolean), rand) : nationalRival(s.nationality, s.national.name, s.national.fixtures.map((f) => f.rival).filter(Boolean), rand);
    const absent = s.injury > 0 || s.suspension > 0;
    let r = simQuick(s, rival, rand, absent ? "absent" : "simulate");
    if (needsPens(s, nx.fx, r)) r = { ...r, pens: shootout(s, rand() < 0.5, rand) };
    if (s.phase === "national" && !nx.fx.rival) s = { ...s, national: { ...s.national!, fixtures: s.national!.fixtures.map((f, i) => (i === nx.idx ? { ...f, rival } : f)) } };
    s = applyResult(s, nx.idx, r, rand, true);
    if (s.phase === "event" && (s.pendingEvent === "national-call" || s.pendingEvent === "clubwc-call")) s = { ...s, pendingEvent: undefined, phase: "event" };
  }
  return s;
}

export function applyEffect(s: CareerState, e: Effect): CareerState {
  const n = { ...s };
  if (e.ovr) n.ovr = clamp(n.ovr + e.ovr, 40, Math.max(n.ovr, talentOf(n).cap + 2));
  if (e.form) n.form = clamp(n.form + e.form);
  if (e.confidence) n.confidence = clamp(n.confidence + e.confidence);
  if (e.fame) n.fame = clamp(n.fame + e.fame);
  if (e.money) n.money = Math.max(0, n.money + e.money);
  if (e.injury) n.injury += e.injury;
  if (e.suspension) n.suspension += e.suspension;
  if (e.boost) n.boost += e.boost;
  if (e.salary) n.salary = Math.max(1, Math.round(n.salary * e.salary));
  n.log = [e.text, ...n.log].slice(0, 50);
  return n;
}

export function afterEvent(s: CareerState, id: string | undefined): CareerState {
  return {
    ...s,
    recentEvents: id ? [id, ...s.recentEvents.filter((x) => x !== id)].slice(0, 25) : s.recentEvents,
    eventCounts: id ? { ...s.eventCounts, [id]: (s.eventCounts[id] ?? 0) + 1 } : s.eventCounts,
    pendingEvent: undefined,
    phase: s.national ? "national" : "match",
    autoLog: [],
  };
}

export const repToBonus = (rep: number) => Math.min(5, Math.floor(rep / 60));
