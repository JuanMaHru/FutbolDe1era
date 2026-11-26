import { NATIONAL, TIERS, tierOf } from "./clubs";
import { EVENTS, type Effect } from "./events";

/** Línea del jugador para los minijuegos (el arquero ataja, el defensor corta, el resto define). */
export type Role = "ARQ" | "DEF" | "MED" | "DEL";
export const ROLE_OF: Record<string, Role> = { ARQ: "ARQ", DFC: "DEF", LAT: "DEF", MC: "MED", MCO: "MED", EXT: "DEL", DC: "DEL" };

export interface SeasonLine {
  season: number;
  year: number;
  club: string;
  pj: number;
  goals: number;
  assists: number;
  avg: number;
  place: number;
  title?: string;
}

export interface MatchResult {
  rival: string;
  home: boolean;
  gf: number;
  ga: number;
  rating: number;
  goals: number;
  assists: number;
  started: boolean;
  note: string;
}

export interface CareerState {
  v: 1;
  name: string;
  nationality: string;
  position: string;
  number: number;
  age: number;
  startYear: number;
  club: string;
  ovr: number;
  form: number; // 0-100
  confidence: number; // 0-100 (del DT)
  fame: number; // 0-100
  money: number; // miles de USD
  salary: number;
  season: number;
  week: number; // fecha actual (0..SEASON_LEN-1)
  injury: number;
  points: number; // puntos del equipo en la temporada
  stats: { pj: number; goals: number; assists: number; ratingSum: number };
  totals: { pj: number; goals: number; assists: number };
  history: SeasonLine[];
  trophies: string[];
  caps: number;
  natGoals: number;
  lastMatch?: MatchResult;
  pendingEvent?: string;
  phase: "event" | "match" | "season-end" | "retired";
  offers?: string[];
  bonusDay?: string; // último día que usó el entrenamiento especial
  log: string[];
}

export const SEASON_LEN = 10;

export function newCareer(input: { name: string; nationality: string; position: string; number: number; age: number; club: string; repBonus: number }): CareerState {
  const tier = tierOf(input.club);
  return {
    v: 1,
    name: input.name.trim() || "Pibe sin nombre",
    nationality: input.nationality,
    position: input.position,
    number: input.number,
    age: input.age,
    startYear: new Date().getFullYear(),
    club: input.club,
    ovr: 56 + input.repBonus,
    form: 60,
    confidence: 45,
    fame: 5 + input.repBonus,
    money: 0,
    salary: TIERS[tier].salary,
    season: 1,
    week: 0,
    injury: 0,
    points: 0,
    stats: { pj: 0, goals: 0, assists: 0, ratingSum: 0 },
    totals: { pj: 0, goals: 0, assists: 0 },
    history: [],
    trophies: [],
    caps: 0,
    natGoals: 0,
    phase: "event",
    pendingEvent: "debut",
    log: [`Firmaste tu primer contrato con ${input.club}.`],
  };
}

const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

export function applyEffect(s: CareerState, e: Effect): CareerState {
  const n = { ...s };
  if (e.ovr) n.ovr = clamp(n.ovr + e.ovr, 40, 99);
  if (e.form) n.form = clamp(n.form + e.form);
  if (e.confidence) n.confidence = clamp(n.confidence + e.confidence);
  if (e.fame) n.fame = clamp(n.fame + e.fame);
  if (e.money) n.money = Math.max(0, n.money + e.money);
  if (e.injury) n.injury += e.injury;
  if (e.text.startsWith("¡Aceptaron!")) n.salary = Math.round(n.salary * 1.5);
  n.log = [e.text, ...n.log].slice(0, 30);
  return n;
}

export function pickEvent(s: CareerState, rand: () => number): string {
  const pool = EVENTS.filter((e) => !e.when || e.when(s));
  return pool[Math.floor(rand() * pool.length)].id;
}

/** ¿Es titular? Depende de OVR vs. exigencia del club, confianza y forma. */
export function startChance(s: CareerState): number {
  const need = 52 + tierOf(s.club) * 7;
  return clamp(50 + (s.ovr - need) * 4 + (s.confidence - 50) * 0.5 + (s.form - 50) * 0.3, 10, 97) / 100;
}

/** Tamaño de la zona buena del minijuego de timing (0.12 – 0.42 del ancho). */
export function timingZone(s: CareerState): number {
  const rel = s.ovr - (52 + tierOf(s.club) * 7);
  return Math.max(0.12, Math.min(0.42, 0.24 + rel * 0.012 + (s.form - 50) * 0.002));
}

/**
 * Resuelve el partido a partir de los momentos del jugador (true = salió bien).
 * Los momentos pesan más en el resultado cuanto más importante es el jugador en el equipo.
 */
export interface Moment {
  kind: "timing" | "trivia";
  ok: boolean;
}

export function playMatch(s: CareerState, plays: Moment[], started: boolean, rival: string, rand: () => number): CareerState {
  const moments = plays.map((m) => m.ok);
  const role = ROLE_OF[s.position] ?? "MED";
  const myTier = tierOf(s.club);
  const rivalTier = tierOf(rival);
  const base = 1.2 + (myTier - rivalTier) * 0.35;
  const poisson = (l: number) => {
    let k = 0, p = Math.exp(-Math.max(l, 0.15)), F = p;
    const u = rand();
    while (u > F && k < 7) { k++; p *= Math.max(l, 0.15) / k; F += p; }
    return k;
  };
  const ok = moments.filter(Boolean).length;
  const bad = moments.length - ok;
  let gf = poisson(base);
  let ga = poisson(1.2 - (myTier - rivalTier) * 0.35);
  let goals = 0, assists = 0;
  if (role === "DEL" || role === "MED") {
    // La definición (timing) es gol; la lectura de juego (trivia) puede terminar en gol o asistencia.
    for (const m of plays) {
      if (!m.ok) continue;
      if (m.kind === "timing") {
        if (role === "DEL" || rand() < 0.5) { gf++; goals++; } else if (rand() < 0.6) { gf++; assists++; }
      } else {
        const r = rand();
        if (r < (role === "DEL" ? 0.25 : 0.15)) { gf++; goals++; } else if (r < 0.6) { gf++; assists++; }
      }
    }
  } else {
    ga = Math.max(0, ga - ok);
    if (bad && rand() < 0.6) ga++;
    if (role === "DEF" && ok === moments.length && rand() < 0.25) { gf++; goals++; }
  }
  if (!started) { goals = Math.min(goals, 1); }
  const won = gf > ga, draw = gf === ga;
  let rating = 6 + ok * 0.9 - bad * 0.7 + (won ? 0.5 : draw ? 0 : -0.5) + (role === "ARQ" && ga === 0 ? 0.6 : 0);
  if (!started) rating -= 0.4;
  rating = Math.round(clamp(rating, 3, 10) * 10) / 10;

  const n = { ...s };
  n.points += won ? 3 : draw ? 1 : 0;
  n.stats = { pj: s.stats.pj + 1, goals: s.stats.goals + goals, assists: s.stats.assists + assists, ratingSum: s.stats.ratingSum + rating };
  n.totals = { pj: s.totals.pj + 1, goals: s.totals.goals + goals, assists: s.totals.assists + assists };
  n.form = clamp(s.form + (rating - 6.5) * 6);
  n.confidence = clamp(s.confidence + (rating - 6.3) * 5 + (won ? 2 : -1));
  n.fame = clamp(s.fame + Math.max(0, rating - 7) * (myTier * 0.5) + goals * 0.6 * myTier);
  n.money += s.salary;
  const note =
    rating >= 8.5 ? "¡Figura de la cancha!" : rating >= 7.3 ? "Gran partido." : rating >= 6 ? "Cumpliste." : "Partido para el olvido.";
  n.lastMatch = { rival, home: rand() < 0.5, gf, ga, rating, goals, assists, started, note };
  n.week = s.week + 1;
  n.log = [`${won ? "Victoria" : draw ? "Empate" : "Derrota"} ${gf}-${ga} vs ${rival}. Nota ${rating}.`, ...s.log].slice(0, 30);
  if (n.week >= SEASON_LEN) return endSeason(n, rand);
  n.phase = "event";
  n.pendingEvent = pickEvent(n, rand);
  return n;
}

/** Partido salteado por lesión: el equipo juega igual. */
export function skipInjured(s: CareerState, rival: string, rand: () => number): CareerState {
  const n = { ...s, injury: s.injury - 1, week: s.week + 1 };
  const won = rand() < 0.45, draw = !won && rand() < 0.4;
  n.points += won ? 3 : draw ? 1 : 0;
  n.confidence = clamp(s.confidence - 2);
  n.lastMatch = { rival, home: true, gf: won ? 2 : 1, ga: won ? 0 : draw ? 1 : 2, rating: 0, goals: 0, assists: 0, started: false, note: "Lo viste desde la tribuna (lesionado)." };
  n.log = [`Lesionado: te perdiste la fecha vs ${rival}.`, ...s.log].slice(0, 30);
  if (n.week >= SEASON_LEN) return endSeason(n, rand);
  n.phase = "event";
  n.pendingEvent = pickEvent(n, rand);
  return n;
}

function endSeason(s: CareerState, rand: () => number): CareerState {
  const n = { ...s };
  const tier = tierOf(s.club);
  // Posición final estimada a partir de los puntos (máx. 30 en 10 fechas).
  const place = Math.max(1, Math.min(20, Math.round(21 - (s.points / 30) * 20 + (rand() - 0.5) * 3)));
  const avg = s.stats.pj ? Math.round((s.stats.ratingSum / s.stats.pj) * 10) / 10 : 0;
  let title: string | undefined;
  if (place === 1) {
    title = `Campeón ${TIERS[tier].label} (${s.club})`;
    n.trophies = [...s.trophies, title];
    n.fame = clamp(n.fame + 8 + tier * 2);
  }
  n.history = [...s.history, { season: s.season, year: s.startYear + s.season - 1, club: s.club, pj: s.stats.pj, goals: s.stats.goals, assists: s.stats.assists, avg, place, title }];

  // Selección: convocatoria si el nivel y la fama alcanzan.
  if (NATIONAL[s.nationality] && s.ovr >= 78 && n.fame >= 55) {
    const caps = 2 + Math.floor(rand() * 5);
    const g = ROLE_OF[s.position] === "DEL" ? Math.floor(rand() * 3) : rand() < 0.3 ? 1 : 0;
    n.caps += caps;
    n.natGoals += g;
    n.log = [`Convocado a la ${NATIONAL[s.nationality]}: ${caps} partidos, ${g} goles.`, ...n.log];
    if (s.ovr >= 86 && rand() < 0.25) n.trophies = [...n.trophies, `Copa América con la ${NATIONAL[s.nationality]}`];
  }

  // Evolución física por edad.
  const age = s.age + 1;
  const growth = age <= 23 ? 2 + Math.floor(rand() * 3) : age <= 28 ? Math.floor(rand() * 2) : age <= 31 ? -Math.floor(rand() * 2) : -(2 + Math.floor(rand() * 2));
  n.age = age;
  n.ovr = clamp(s.ovr + growth + (avg >= 7.3 ? 1 : 0), 40, 99);

  // Ofertas: hasta un escalón arriba si el rendimiento y la fama lo justifican.
  const up = n.ovr >= 52 + (tier + 1) * 7 && n.fame >= tier * 15 ? 1 : 0;
  const offers = new Set<string>();
  for (let i = 0; i < 6 && offers.size < 3; i++) {
    const t = Math.max(1, Math.min(5, tier + up - (rand() < 0.4 ? 1 : 0)));
    const list = TIERS[t].clubs.filter((c) => c !== s.club);
    offers.add(list[Math.floor(rand() * list.length)]);
  }
  n.offers = [...offers];
  n.phase = age >= 38 ? "retired" : "season-end";
  return n;
}

export function startNextSeason(s: CareerState, club: string | null, rand: () => number): CareerState {
  const n = { ...s };
  if (club && club !== s.club) {
    n.club = club;
    n.salary = Math.round(TIERS[tierOf(club)].salary * (1 + n.fame / 200));
    n.confidence = 40;
    n.log = [`¡Nuevo club! Firmaste con ${club}.`, ...n.log];
  } else {
    n.confidence = clamp(n.confidence + 5);
  }
  n.season = s.season + 1;
  n.week = 0;
  n.points = 0;
  n.injury = 0;
  n.form = 60;
  n.stats = { pj: 0, goals: 0, assists: 0, ratingSum: 0 };
  n.offers = undefined;
  n.lastMatch = undefined;
  n.phase = "event";
  n.pendingEvent = pickEvent(n, rand);
  return n;
}

export function rivalFor(s: CareerState, rand: () => number): string {
  const t = tierOf(s.club);
  const tt = Math.max(1, Math.min(5, t + (rand() < 0.2 ? 1 : rand() < 0.2 ? -1 : 0)));
  const list = TIERS[tt].clubs.filter((c) => c !== s.club);
  return list[Math.floor(rand() * list.length)];
}

/** Clubes que te ofrecen una prueba al crear la carrera; la reputación de los retos diarios abre mejores puertas. */
export function startingOffers(reputation: number, rand: () => number): string[] {
  const tiers = reputation >= 300 ? [1, 2, 3] : reputation >= 80 ? [1, 2, 2] : [1, 1, 2];
  const out = new Set<string>();
  for (const t of tiers) {
    const list = TIERS[t].clubs.filter((c) => !out.has(c));
    out.add(list[Math.floor(rand() * list.length)]);
  }
  return [...out];
}

export const repToBonus = (rep: number) => Math.min(5, Math.floor(rep / 60));
