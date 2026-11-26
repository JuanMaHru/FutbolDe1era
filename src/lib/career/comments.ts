import type { CareerState, Fixture, MatchResult } from "./engine";
import { isDerby } from "./world";

/** Titular antes de cada jugada según minuto, marcador y contexto. */
export function situation(fx: Fixture, minute: number, us: number, them: number, agg: [number, number] | null, defensive: boolean, derby: boolean): { minute: string; headline: string; tags: string[] } {
  const d = us - them + (agg ? agg[0] - agg[1] : 0);
  const late = minute >= 85;
  const tags: string[] = [];
  if (fx.final) tags.push("🏆 Es la final");
  if (derby) tags.push("🔥 Clásico");
  if (agg) tags.push(`Global ${agg[0] + us}-${agg[1] + them}`);
  let headline: string;
  if (late) {
    if (d === 0) headline = defensive ? "¡Último minuto y empate! Si no la parás, se termina todo." : "¡Último minuto y empate! La pelota es tuya: queda todo en vos.";
    else if (d === -1) headline = defensive ? "Pierden por uno y el rival va por el golpe final." : "¡Se termina y pierden por uno! Es ahora o nunca.";
    else if (d === 1) headline = defensive ? "¡Ganan por uno en el final! Hay que aguantar como sea." : "¡Ganan por uno! Un gol más y lo liquidan.";
    else if (d >= 2) headline = "Partido liquidado: es para lucirse.";
    else headline = "Ya no hay nada que perder: por el honor.";
  } else if (minute >= 70) {
    headline = d === 0 ? "Se viene el final y está todo igual. Pesa cada pelota." : d < 0 ? "El tiempo se acaba y hay que remontarlo." : "Van ganando, pero el rival se viene encima.";
  } else if (minute <= 15) {
    headline = defensive ? "El rival arranca a toda velocidad." : "Primeros minutos: la primera que tengas, adentro.";
  } else {
    headline = d === 0 ? "Partido parejo, cerrado." : d < 0 ? "Van perdiendo: hay que reaccionar." : "Ganan, pero no está terminado.";
  }
  const min = minute > 90 ? `90+${minute - 90}'` : `${minute}'`;
  return { minute: min, headline, tags };
}

/** Comentarios del cierre del partido. */
export function matchComments(s: CareerState, fx: Fixture, r: MatchResult, aggTotal: [number, number] | null): string[] {
  const out: string[] = [];
  const won = r.gf > r.ga || (!!r.pens && r.pens[0] > r.pens[1]);
  const diff = r.gf - r.ga;
  if (diff >= 5) out.push(`¡Goleada histórica! ${r.gf}-${r.ga}: se va a hablar de esto durante años.`);
  else if (diff >= 3) out.push(`Paliza: ${r.gf}-${r.ga} y baile.`);
  if (diff <= -4) out.push("Una noche para el olvido. A levantar la cabeza.");
  // Remontadas y finales agónicos.
  let a = 0, b = 0, trailed = false;
  for (const g of r.timeline) { if (g.us) a++; else b++; if (a < b) trailed = true; }
  if (trailed && diff > 0) out.push("¡Remontada épica! Lo dieron vuelta.");
  else if (trailed && diff === 0) out.push("Lo empataron con el corazón.");
  const last = r.timeline[r.timeline.length - 1];
  if (last && last.min >= 85) {
    if (last.us && diff === 1) out.push(`¡Agónico! Gol en el ${last.min}' para ganarlo.`);
    if (last.us && diff === 0) out.push(`Empate sobre la hora (${last.min}').`);
    if (!last.us && diff === -1) out.push(`Duele: el gol del rival llegó en el ${last.min}'.`);
    if (!last.us && diff === 0) out.push(`Se les escapó en el ${last.min}'.`);
  }
  if (r.pens) out.push(won ? `Se definió por penales (${r.pens[0]}-${r.pens[1]}) y ganaron.` : `Penales (${r.pens[0]}-${r.pens[1]}): la moneda cayó del otro lado.`);
  if (aggTotal && fx.leg === 2) out.push(won || aggTotal[0] > aggTotal[1] ? `Global ${aggTotal[0]}-${aggTotal[1]}: ¡pasaron de ronda!` : aggTotal[0] < aggTotal[1] ? `Global ${aggTotal[0]}-${aggTotal[1]}: eliminados.` : "");
  if (fx.final) out.push(won ? "🏆 ¡CAMPEONES!" : "Se escapó la final. Duele en el alma.");
  // Lo personal.
  const before = s.totals.goals;
  if (r.goals >= 3) out.push(`¡Hat-trick! Te llevás la pelota a casa.`);
  else if (r.goals === 2) out.push("Doblete: noche soñada.");
  if (r.goals && before === 0) out.push("¡Tu primer gol como profesional! Nunca lo vas a olvidar.");
  for (const m of [50, 100, 150, 200, 250, 300, 400, 500]) if (before < m && before + r.goals >= m) out.push(`¡Llegaste a los ${m} goles en tu carrera!`);
  if (r.goals && isDerby(fx.rival, s.club)) out.push("Gol en el clásico: ya sos ídolo de la hinchada.");
  if (r.saves) out.push(r.saves > 1 ? `Atajaste ${r.saves} penales. ¡Héroe!` : "Atajaste un penal clave.");
  if (r.ga === 0 && r.started && (s.position === "ARQ" || s.position === "DFC")) out.push("Valla invicta.");
  if (r.rating >= 9) out.push("El partido de tu vida. Todos hablan de vos.");
  if (s.totals.pj === 0 && r.played) out.push("Debut profesional: el sueño cumplido.");
  if (!out.length) out.push(won ? "Triunfo trabajado." : diff === 0 ? "Empate sin brillo." : "Derrota. A dar vuelta la página.");
  return out.filter(Boolean);
}
