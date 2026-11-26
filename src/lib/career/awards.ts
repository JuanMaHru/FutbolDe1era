import type { CareerState } from "./engine";
import { LEAGUES, NATIONS, clubInfo, leagueOf } from "./world";

const roleOf = (p: string) => ({ ARQ: "ARQ", DFC: "DEF", LAT: "DEF", MC: "MED", MCO: "MED", EXT: "DEL", DC: "DEL" } as Record<string, string>)[p] ?? "MED";

/** Premios de la liga local al terminar la temporada. */
export function seasonAwards(s: CareerState, place: number, rand: () => number): string[] {
  const lg = leagueOf(s.club, s.leagueOverride);
  const year = s.startYear + s.season - 1;
  const fechas = s.tables.filter((t) => t.id.startsWith(`${lg.id}-`) && t.rows[s.club]).reduce((a, t) => a + t.rounds.length, 0) || 30;
  const L = s.lstats;
  const out: string[] = [];
  const r = roleOf(s.position);
  // Goleador: el máximo artillero "del resto" se estima por la cantidad de fechas.
  const topRival = Math.round(fechas * 0.6 * (0.85 + rand() * 0.3));
  if (L.goals >= topRival && L.goals >= 6) out.push(`Goleador de la ${lg.name} ${year}`);
  const avg = L.pj ? L.ratingSum / L.pj : 0;
  if (L.pj >= fechas * 0.45 && avg >= 6.9 && (place <= 3 || L.goals >= topRival * 0.8) && rand() < 0.28) out.push(`Mejor jugador de la ${lg.name} ${year}`);
  if (r === "ARQ" && L.cleanSheets >= fechas * 0.33) out.push(`Guante de Oro de la ${lg.name} ${year}`);
  if (s.age <= 21 && s.ovr >= 72 && avg >= 6.6 && rand() < 0.6) out.push(`Golden Boy ${year}`);
  // Bota de Oro: goles de liga ponderados por la dificultad de la liga.
  const pts = L.goals * (LEAGUES[lg.id]?.coef ?? 1);
  if (pts >= 52 + rand() * 12) out.push(`Bota de Oro ${year}`);
  return out;
}

/** Balón de Oro (después de los torneos de selecciones del año). */
export function ballonDor(s: CareerState, rand: () => number): { award?: string; rank?: number } {
  const year = s.startYear + s.season - 1;
  if (s.ovr < 85 || s.fame < 70) return {};
  const h = s.history[s.history.length - 1];
  const titles = s.trophies.filter((t) => t.includes(String(year)));
  let score = (s.ovr - 80) * 4 + s.fame * 0.25;
  const r = roleOf(s.position);
  score += r === "DEL" || r === "MED" ? (h?.goals ?? 0) * 0.3 + (h?.assists ?? 0) * 0.2 : (h?.cleanSheets ?? 0) * 0.35;
  for (const t of titles) {
    if (t.startsWith("Mundial")) score += 22;
    else if (t.startsWith("Champions League")) score += 16;
    else if (t.startsWith("Copa América") || t.startsWith("Eurocopa")) score += 12;
    else if (t.startsWith("Copa Libertadores")) score += 8;
    else if (/Ligue 1|LaLiga|Premier League|Serie A|Bundesliga/.test(t)) score += 7;
    else score += 2;
  }
  if (s.awards.includes(`Bota de Oro ${year}`)) score += 6;
  if (s.awards.some((a) => a.startsWith("Mejor jugador") && a.endsWith(String(year)))) score += 4;
  if (clubInfo(s.club).strength < 70) score -= 8;
  if (r === "ARQ") score -= 8; // a los arqueros les cuesta más
  const threshold = 100 + rand() * 16;
  if (score >= threshold) return { award: `Balón de Oro ${year}` };
  if (score >= threshold - 30) return { rank: Math.max(2, Math.round(2 + (threshold - score) / 2.5)) };
  return {};
}

/** Logros de toda la carrera: lo que hace única a cada historia. */
export interface Achievement { id: string; icon: string; title: string; desc: string }
export function achievements(s: CareerState): Achievement[] {
  const out: Achievement[] = [];
  const t = s.totals;
  const add = (id: string, icon: string, title: string, desc: string) => out.push({ id, icon, title, desc });
  const clubs = [...new Set(s.history.map((h) => h.club))];
  const countries = new Set(s.history.map((h) => LEAGUES[clubInfo(h.club).league]?.country));
  const count = (re: RegExp) => [...s.trophies, ...s.awards].filter((x) => re.test(x)).length;
  if (t.goals >= 500) add("g500", "👑", "Goleador de época", `Metiste ${t.goals} goles. Tu nombre queda en la historia.`);
  else if (t.goals >= 300) add("g300", "🔥", "Goleador de época", `Metiste ${t.goals} goles en tu carrera.`);
  else if (t.goals >= 150) add("g150", "⚽", "Cañonero", `${t.goals} goles en tu carrera.`);
  if (t.assists >= 150) add("a150", "🎯", "Asistidor serial", `${t.assists} asistencias: los delanteros te deben la carrera.`);
  if (t.cleanSheets >= 150) add("cs", "🧱", "La muralla", `${t.cleanSheets} vallas invictas.`);
  if (t.penSaves >= 12) add("pen", "🧤", "Atajapenales", `Le atajaste ${t.penSaves} penales a los mejores.`);
  if (s.hattricks >= 5) add("hat", "🎩", "Rey del hat-trick", `${s.hattricks} hat-tricks.`);
  if (s.derbyGoals >= 8) add("derby", "😈", "Verdugo de clásicos", `${s.derbyGoals} goles en clásicos.`);
  if (clubs.length === 1 && s.history.length >= 10) add("one", "❤️", "Hombre de un solo club", `${s.history.length} temporadas en ${clubs[0]}.`);
  if (countries.size >= 4) add("world", "✈️", "Trotamundos", `Jugaste en ${countries.size} países.`);
  const byClub = new Map<string, number>();
  s.history.forEach((h) => byClub.set(h.club, (byClub.get(h.club) ?? 0) + 1));
  const idol = [...byClub.entries()].find(([c, n]) => n >= 7 && s.trophies.some((x) => x.includes(`(${c})`)));
  if (idol) add("idol", "🗿", "Ídolo eterno", `${idol[1]} temporadas y títulos con ${idol[0]}.`);
  if (s.history.some((h, i) => i > 0 && h.club === s.firstClub) && clubs.length > 1) add("home", "🏠", "Volver a casa", `Cerraste el círculo en ${s.firstClub}.`);
  if (count(/^Mundial/)) add("wc", "🌍", "Campeón del mundo", "Levantaste la Copa del Mundo.");
  if (count(/Copa Libertadores/)) add("lib", "🏆", "Gloria eterna", `${count(/Copa Libertadores/)} Libertadores.`);
  if (count(/^Champions League/)) add("ucl", "⭐", "Rey de Europa", `${count(/^Champions League/)} Champions League.`);
  if (s.trophies.length >= 20) add("col", "🏛️", "Coleccionista", `${s.trophies.length} títulos.`);
  else if (s.trophies.length >= 10) add("cups", "🥇", "Ganador serial", `${s.trophies.length} títulos.`);
  if (count(/^Balón de Oro/)) add("bo", "🌟", count(/^Balón de Oro/) > 1 ? `${count(/^Balón de Oro/)} Balones de Oro` : "Balón de Oro", "El mejor jugador del mundo.");
  if (count(/^Bota de Oro/)) add("boot", "👟", "Bota de Oro", `${count(/^Bota de Oro/)} veces máximo goleador de Europa.`);
  if (s.caps >= 100) add("caps", "🎽", "Leyenda de la selección", `${s.caps} partidos con ${NATIONS[s.nationality]?.name ?? "tu país"}.`);
  if (s.natGoals >= 40) add("natg", "🇺🇳", "Goleador de la selección", `${s.natGoals} goles con la camiseta de tu país.`);
  if (leagueOf(s.firstClub).id === "ARG2" && (count(/Champions League|Copa Libertadores|^Mundial/) > 0)) add("rise", "🚀", "Del ascenso a la gloria", "Empezaste en la Primera Nacional y llegaste a la cima.");
  if (t.pj >= 650) add("pj", "🕰️", "Hombre récord", `${t.pj} partidos jugados.`);
  if (s.money >= 5000) add("money", "💎", "Millonario", `${Math.round(s.money / 1000)} millones de USD ganados.`);
  if (s.shootoutsWon >= 3) add("pens", "🎯", "Nervios de acero", `Ganaste ${s.shootoutsWon} definiciones por penales.`);
  if (s.finalsWon >= 8) add("finals", "🏟️", "Hombre de finales", `Ganaste ${s.finalsWon} finales.`);
  return out;
}
