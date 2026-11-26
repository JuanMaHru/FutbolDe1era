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
    if (t.startsWith("Mundial de Clubes")) score += 12;
    else if (t.startsWith("Copa Intercontinental")) score += 6;
    else if (t.startsWith("Mundial")) score += 22;
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
export type Tier = "bronce" | "plata" | "oro" | "leyenda";
export interface Achievement { id: string; icon: string; title: string; desc: string; tier: Tier; personal: boolean }
interface AchDef { id: string; icon: string; title: string; tier: Tier; how: string; test: (s: CareerState) => boolean; detail: (s: CareerState) => string; personal?: boolean }
/** Logros que dependen de tus decisiones fuera de la cancha. */
export const PERSONAL_IDS = new Set(["amigo", "profe", "fiesta", "solid", "picante", "humilde", "cabala", "fiel", "familia", "inversor", "rebelde", "lider", "limpio", "farandula", "fan", "estudioso", "guerrero", "ambicion", "patria", "valija", "barrio"]);

const ch = (s: CareerState, tag: string) => s.choices?.[tag] ?? 0;
/** Veces que se presentó la decisión. */
const op = (s: CareerState, tag: string) => s.chances?.[tag] ?? 0;
/** Proporción elegida sobre las veces que apareció (0 si apareció menos de `min` veces). */
const rate = (s: CareerState, tag: string, min: number) => (op(s, tag) >= min ? ch(s, tag) / op(s, tag) : 0);
const always = (s: CareerState, tag: string, min: number) => rate(s, tag, min) === 1;
const frac = (s: CareerState, tag: string, what: string) => `${ch(s, tag)} de ${op(s, tag)} ${what}.`;
const count = (s: CareerState, re: RegExp) => [...s.trophies, ...s.awards].filter((x) => re.test(x)).length;
const clubsOf = (s: CareerState) => [...new Set(s.history.map((h) => h.club))];
const countriesOf = (s: CareerState) => new Set(s.history.map((h) => LEAGUES[clubInfo(h.club).league]?.country));
const seasonsAt = (s: CareerState) => {
  const m = new Map<string, number>();
  s.history.forEach((h) => m.set(h.club, (m.get(h.club) ?? 0) + 1));
  return m;
};

export const ACHIEVEMENTS: AchDef[] = [
  { id: "g500", icon: "👑", title: "Rey del gol", tier: "leyenda", how: "Hacé 500 goles", test: (s) => s.totals.goals >= 500, detail: (s) => `${s.totals.goals} goles: tu nombre queda en la historia.` },
  { id: "g300", icon: "🔥", title: "Goleador de época", tier: "oro", how: "Hacé 300 goles", test: (s) => s.totals.goals >= 300, detail: (s) => `Metiste ${s.totals.goals} goles en tu carrera.` },
  { id: "g150", icon: "⚽", title: "Cañonero", tier: "plata", how: "Hacé 150 goles", test: (s) => s.totals.goals >= 150, detail: (s) => `${s.totals.goals} goles en tu carrera.` },
  { id: "g50", icon: "🎯", title: "Con el arco entre ceja y ceja", tier: "bronce", how: "Hacé 50 goles", test: (s) => s.totals.goals >= 50, detail: (s) => `${s.totals.goals} goles.` },
  { id: "a150", icon: "🪄", title: "Asistidor serial", tier: "oro", how: "Da 150 asistencias", test: (s) => s.totals.assists >= 150, detail: (s) => `${s.totals.assists} asistencias: los delanteros te deben la carrera.` },
  { id: "a50", icon: "🤝", title: "Socio ideal", tier: "bronce", how: "Da 50 asistencias", test: (s) => s.totals.assists >= 50, detail: (s) => `${s.totals.assists} asistencias.` },
  { id: "cs", icon: "🧱", title: "La muralla", tier: "oro", how: "Logra 150 vallas invictas", test: (s) => s.totals.cleanSheets >= 150, detail: (s) => `${s.totals.cleanSheets} vallas invictas.` },
  { id: "cs50", icon: "🛡️", title: "Cerrojo", tier: "bronce", how: "Logra 50 vallas invictas", test: (s) => s.totals.cleanSheets >= 50, detail: (s) => `${s.totals.cleanSheets} vallas invictas.` },
  { id: "pen", icon: "🧤", title: "Atajapenales", tier: "plata", how: "Atajá 12 penales", test: (s) => s.totals.penSaves >= 12, detail: (s) => `Le atajaste ${s.totals.penSaves} penales a los mejores.` },
  { id: "hat", icon: "🎩", title: "Rey del hat-trick", tier: "plata", how: "Hacé 5 hat-tricks", test: (s) => s.hattricks >= 5, detail: (s) => `${s.hattricks} hat-tricks.` },
  { id: "derby", icon: "😈", title: "Verdugo de clásicos", tier: "plata", how: "Hacé 8 goles en clásicos", test: (s) => s.derbyGoals >= 8, detail: (s) => `${s.derbyGoals} goles en clásicos.` },
  { id: "one", icon: "❤️", title: "Hombre de un solo club", tier: "oro", how: "Jugá 10 temporadas en un solo club", test: (s) => clubsOf(s).length === 1 && s.history.length >= 10, detail: (s) => `${s.history.length} temporadas en ${clubsOf(s)[0]}.` },
  { id: "world", icon: "✈️", title: "Trotamundos", tier: "plata", how: "Jugá en 4 países", test: (s) => countriesOf(s).size >= 4, detail: (s) => `Jugaste en ${countriesOf(s).size} países.` },
  { id: "idol", icon: "🗿", title: "Ídolo eterno", tier: "oro", how: "7 temporadas y un título en el mismo club", test: (s) => [...seasonsAt(s).entries()].some(([c, n]) => n >= 7 && s.trophies.some((x) => x.includes(`(${c})`))), detail: (s) => { const e = [...seasonsAt(s).entries()].find(([c, n]) => n >= 7 && s.trophies.some((x) => x.includes(`(${c})`)))!; return `${e[1]} temporadas y títulos con ${e[0]}.`; } },
  { id: "home", icon: "🏠", title: "Volver a casa", tier: "bronce", how: "Volvé al club donde debutaste", test: (s) => s.history.some((h, i) => i > 0 && h.club === s.firstClub) && clubsOf(s).length > 1, detail: (s) => `Cerraste el círculo en ${s.firstClub}.` },
  { id: "wc", icon: "🌍", title: "Campeón del mundo", tier: "leyenda", how: "Ganá el Mundial", test: (s) => count(s, /^Mundial \d/) > 0, detail: () => "Levantaste la Copa del Mundo." },
  { id: "conti", icon: "🏆", title: "Campeón continental", tier: "oro", how: "Ganá la Copa América o la Eurocopa", test: (s) => count(s, /^(Copa América|Eurocopa)/) > 0, detail: (s) => `${count(s, /^(Copa América|Eurocopa)/)} títulos con tu selección.` },
  { id: "lib", icon: "🦅", title: "Gloria eterna", tier: "oro", how: "Ganá la Copa Libertadores", test: (s) => count(s, /^Copa Libertadores/) > 0, detail: (s) => `${count(s, /^Copa Libertadores/)} Libertadores.` },
  { id: "ucl", icon: "⭐", title: "Rey de Europa", tier: "oro", how: "Ganá la Champions League", test: (s) => count(s, /^Champions League/) > 0, detail: (s) => `${count(s, /^Champions League/)} Champions League.` },
  { id: "col", icon: "🏛️", title: "Coleccionista", tier: "leyenda", how: "Ganá 20 títulos", test: (s) => s.trophies.length >= 20, detail: (s) => `${s.trophies.length} títulos.` },
  { id: "cups", icon: "🥇", title: "Ganador serial", tier: "plata", how: "Ganá 10 títulos", test: (s) => s.trophies.length >= 10, detail: (s) => `${s.trophies.length} títulos.` },
  { id: "first", icon: "🎉", title: "La primera vuelta olímpica", tier: "bronce", how: "Ganá tu primer título", test: (s) => s.trophies.length >= 1, detail: (s) => `Primer título: ${s.trophies[0]}.` },
  { id: "bo", icon: "🌟", title: "El mejor del mundo", tier: "leyenda", how: "Ganá el Balón de Oro", test: (s) => count(s, /^Balón de Oro/) > 0, detail: (s) => `${count(s, /^Balón de Oro/)} Balón${count(s, /^Balón de Oro/) > 1 ? "es" : ""} de Oro.` },
  { id: "boot", icon: "👟", title: "Bota de Oro", tier: "oro", how: "Ganá la Bota de Oro", test: (s) => count(s, /^Bota de Oro/) > 0, detail: (s) => `${count(s, /^Bota de Oro/)} veces máximo goleador de Europa.` },
  { id: "scorer", icon: "🥅", title: "Pichichi", tier: "plata", how: "Salí goleador de tu liga", test: (s) => count(s, /^Goleador/) > 0, detail: (s) => `${count(s, /^Goleador/)} veces goleador del torneo.` },
  { id: "mvp", icon: "🎖️", title: "El mejor de la liga", tier: "plata", how: "Ganá el premio al mejor jugador de la liga", test: (s) => count(s, /^Mejor jugador/) > 0, detail: (s) => `${count(s, /^Mejor jugador/)} veces el mejor de la liga.` },
  { id: "young", icon: "🌱", title: "Golden Boy", tier: "plata", how: "Ganá el Golden Boy", test: (s) => count(s, /^Golden Boy/) > 0, detail: () => "El mejor joven del mundo." },
  { id: "caps", icon: "🎽", title: "Leyenda de la selección", tier: "oro", how: "Jugá 100 partidos con tu selección", test: (s) => s.caps >= 100, detail: (s) => `${s.caps} partidos con ${NATIONS[s.nationality]?.name ?? "tu país"}.` },
  { id: "natg", icon: "🗺️", title: "Goleador de la selección", tier: "oro", how: "Hacé 40 goles con tu selección", test: (s) => s.natGoals >= 40, detail: (s) => `${s.natGoals} goles con la camiseta de tu país.` },
  { id: "cap1", icon: "📞", title: "El llamado", tier: "bronce", how: "Debutá en tu selección", test: (s) => s.caps >= 1, detail: (s) => `${s.caps} partidos con ${NATIONS[s.nationality]?.name ?? "tu país"}.` },
  { id: "rise", icon: "🚀", title: "Del ascenso a la gloria", tier: "leyenda", how: "Empezá en la Primera Nacional y ganá Champions, Libertadores o Mundial", test: (s) => leagueOf(s.firstClub).id === "ARG2" && count(s, /Champions League|Copa Libertadores|^Mundial \d/) > 0, detail: () => "Empezaste en la Primera Nacional y llegaste a la cima." },
  { id: "pj", icon: "🕰️", title: "Hombre récord", tier: "oro", how: "Jugá 650 partidos", test: (s) => s.totals.pj >= 650, detail: (s) => `${s.totals.pj} partidos jugados.` },
  { id: "money", icon: "💎", title: "Millonario", tier: "bronce", how: "Ganá 5 millones de USD", test: (s) => s.money >= 5000, detail: (s) => `${Math.round(s.money / 1000)} millones de USD ganados.` },
  { id: "pens", icon: "🧊", title: "Nervios de acero", tier: "bronce", how: "Ganá 3 definiciones por penales", test: (s) => s.shootoutsWon >= 3, detail: (s) => `Ganaste ${s.shootoutsWon} definiciones por penales.` },
  { id: "finals", icon: "🏟️", title: "Hombre de finales", tier: "oro", how: "Ganá 8 finales", test: (s) => s.finalsWon >= 8, detail: (s) => `Ganaste ${s.finalsWon} finales.` },
  // ---- Por cómo fuiste: tus decisiones fuera de la cancha ----
  { id: "amigo", icon: "🤝", title: "Amigo de oro", tier: "plata", how: "Prestale plata a tus compañeros todas las veces que te lo pidan", test: (s) => always(s, "presta", 3), detail: (s) => `Te pidieron plata ${op(s, "presta")} veces y nunca dijiste que no.` },
  { id: "profe", icon: "📏", title: "Profesional ejemplar", tier: "oro", how: "Elegí el camino profesional casi siempre que puedas (90%) y casi nunca la fiesta", test: (s) => rate(s, "profesional", 10) >= 0.9 && (op(s, "fiesta") ? ch(s, "fiesta") / op(s, "fiesta") : 0) <= 0.15, detail: (s) => frac(s, "profesional", "veces elegiste ser profesional") },
  { id: "fiesta", icon: "🪩", title: "Alma de la fiesta", tier: "bronce", how: "Andá a casi todas las fiestas que te inviten (80%)", test: (s) => rate(s, "fiesta", 4) >= 0.8, detail: (s) => frac(s, "fiesta", "fiestas a las que fuiste") },
  { id: "solid", icon: "❤️‍🩹", title: "Corazón solidario", tier: "plata", how: "Ayudá cada vez que alguien lo necesite (pibes, hinchas, ONG, animales)", test: (s) => rate(s, "solidario", 4) >= 0.9, detail: (s) => frac(s, "solidario", "veces ayudaste") },
  { id: "picante", icon: "🌶️", title: "Lengua filosa", tier: "bronce", how: "Sé picante con la prensa y las redes casi siempre (80%)", test: (s) => rate(s, "picante", 6) >= 0.8, detail: (s) => frac(s, "picante", "veces fuiste picante") },
  { id: "humilde", icon: "🙇", title: "Perfil bajo", tier: "bronce", how: "Elegí la humildad casi siempre (85%)", test: (s) => rate(s, "humilde", 6) >= 0.85, detail: (s) => frac(s, "humilde", "veces elegiste el perfil bajo") },
  { id: "cabala", icon: "🧦", title: "Cabulero", tier: "bronce", how: "Respetá la cábala todas las veces", test: (s) => always(s, "cabala", 2), detail: (s) => `${op(s, "cabala")} de ${op(s, "cabala")}: la cábala no se toca.` },
  { id: "fiel", icon: "🫶", title: "Lealtad eterna", tier: "oro", how: "Rechazá casi todas las ofertas mejores (90%) y la plata por la camiseta", test: (s) => rate(s, "fiel", 3) >= 0.9, detail: (s) => frac(s, "fiel", "veces elegiste la camiseta antes que una oferta") },
  { id: "familia", icon: "👨‍👩‍👧", title: "Hombre de familia", tier: "plata", how: "Poné a tu familia primero cada vez que se pueda", test: (s) => rate(s, "familia", 4) >= 0.9, detail: (s) => frac(s, "familia", "veces la familia fue primero") },
  { id: "inversor", icon: "📈", title: "Lobo de las finanzas", tier: "bronce", how: "Invertí en todos los negocios que te ofrezcan", test: (s) => always(s, "inversor", 3), detail: (s) => `Invertiste en los ${op(s, "inversor")} negocios que te ofrecieron.` },
  { id: "rebelde", icon: "🔥", title: "Rebelde sin causa", tier: "bronce", how: "Enfrentá a la autoridad casi siempre que puedas (80%)", test: (s) => rate(s, "rebelde", 5) >= 0.8, detail: (s) => frac(s, "rebelde", "veces enfrentaste a DTs, árbitros o dirigentes") },
  { id: "lider", icon: "📣", title: "Líder nato", tier: "plata", how: "Ponete el equipo al hombro cada vez que haga falta", test: (s) => rate(s, "lider", 4) >= 0.9, detail: (s) => frac(s, "lider", "veces diste la cara por el grupo") },
  { id: "limpio", icon: "🕊️", title: "Juego limpio", tier: "plata", how: "Hacé siempre lo correcto ante el doping y las apuestas", test: (s) => always(s, "limpio", 3), detail: () => "Nunca te ensuciaste. Un ejemplo de juego limpio." },
  { id: "farandula", icon: "📸", title: "Estrella de la farándula", tier: "bronce", how: "Elegí la fama y los flashes casi siempre (80%)", test: (s) => rate(s, "farandula", 4) >= 0.8, detail: (s) => frac(s, "farandula", "veces elegiste los flashes") },
  { id: "fan", icon: "🙌", title: "Ídolo de la gente", tier: "plata", how: "Dedicale tiempo a los hinchas cada vez que puedas", test: (s) => rate(s, "fan", 4) >= 0.9, detail: (s) => frac(s, "fan", "veces te quedaste con los hinchas") },
  { id: "estudioso", icon: "📚", title: "Estudioso del juego", tier: "bronce", how: "Elegí estudiar y aprender casi siempre (85%)", test: (s) => rate(s, "estudioso", 5) >= 0.85, detail: (s) => frac(s, "estudioso", "veces elegiste aprender") },
  { id: "guerrero", icon: "🩹", title: "Guerrero", tier: "plata", how: "Jugá con dolor o sacrificate por el equipo casi siempre (85%)", test: (s) => rate(s, "sacrificio", 4) >= 0.85, detail: (s) => frac(s, "sacrificio", "veces dejaste todo por el equipo") },
  { id: "ambicion", icon: "🚀", title: "Ambición sin techo", tier: "bronce", how: "Pedí más (sueldo, minutos, representante) casi siempre (85%)", test: (s) => rate(s, "ambicioso", 4) >= 0.85, detail: (s) => frac(s, "ambicioso", "veces fuiste por más") },
  { id: "patria", icon: "🫡", title: "Patriota", tier: "bronce", how: "Elegí tu país por sobre todo, todas las veces", test: (s) => always(s, "patriota", 3), detail: () => "La camiseta de tu país, siempre primero." },
  { id: "valija", icon: "🧳", title: "Valija siempre lista", tier: "bronce", how: "Aceptá casi todas las ofertas para cambiar de club (75%)", test: (s) => rate(s, "aventurero", 5) >= 0.75, detail: (s) => frac(s, "aventurero", "veces armaste la valija") },
  { id: "barrio", icon: "🏘️", title: "Nunca te olvidaste del barrio", tier: "bronce", how: "Volvé al barrio y al potrero todas las veces", test: (s) => always(s, "barrio", 2), detail: () => "La fama no te cambió." },
  // ---- Competencias nuevas ----
  { id: "cwc", icon: "🌐", title: "Campeón del mundo de clubes", tier: "leyenda", how: "Ganá el Mundial de Clubes", test: (s) => count(s, /^Mundial de Clubes/) > 0, detail: (s) => `${count(s, /^Mundial de Clubes/)} Mundial de Clubes.` },
  { id: "inter", icon: "🌎", title: "Rey intercontinental", tier: "oro", how: "Ganá la Copa Intercontinental", test: (s) => count(s, /^Copa Intercontinental/) > 0, detail: (s) => `${count(s, /^Copa Intercontinental/)} Copas Intercontinentales.` },
  { id: "super", icon: "⭐", title: "Rey de las supercopas", tier: "plata", how: "Ganá 3 supercopas o recopas", test: (s) => count(s, /^(Supercopa|Supercoppa|Community Shield|Trophée|Supertaça|Johan Cruijff|Recopa)/) >= 3, detail: (s) => `${count(s, /^(Supercopa|Supercoppa|Community Shield|Trophée|Supertaça|Johan Cruijff|Recopa)/)} supercopas y recopas.` },
  { id: "fenomeno", icon: "💫", title: "Uno cada diez años", tier: "leyenda", how: "Que el ojeador te califique de fenómeno", test: (s) => s.talent === "fenomeno", detail: () => "El ojeador lo vio primero: un fenómeno generacional." },
];

export const TIER_LABEL: Record<Tier, string> = { bronce: "Bronce", plata: "Plata", oro: "Oro", leyenda: "Leyenda" };
const TIER_ORDER: Tier[] = ["leyenda", "oro", "plata", "bronce"];

export function achievements(s: CareerState): Achievement[] {
  // Si cumple varios de la misma escalera (50/150/300 goles), mostrar solo el más alto.
  const ladders = [["g500", "g300", "g150", "g50"], ["a150", "a50"], ["cs", "cs50"], ["col", "cups", "first"], ["caps", "cap1"]];
  const got = new Set(ACHIEVEMENTS.filter((a) => a.test(s)).map((a) => a.id));
  for (const l of ladders) { const top = l.find((id) => got.has(id)); l.forEach((id) => id !== top && got.delete(id)); }
  return ACHIEVEMENTS.filter((a) => got.has(a.id))
    .map((a) => ({ id: a.id, icon: a.icon, title: a.title, tier: a.tier, desc: a.detail(s), personal: PERSONAL_IDS.has(a.id) }))
    .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
}
