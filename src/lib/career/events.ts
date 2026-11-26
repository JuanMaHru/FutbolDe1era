import type { CareerState } from "./engine";
import { clubInfo, leagueOf, LEAGUES } from "./world";

/** Efecto de una decisión. El texto se muestra después de elegir. */
export interface Effect {
  ovr?: number;
  form?: number;
  confidence?: number;
  fame?: number;
  money?: number;
  injury?: number; // fechas afuera
  suspension?: number;
  boost?: number; // ventaja en el próximo partido
  salary?: number; // multiplicador
  text: string;
}
type W = number | ((s: CareerState) => number);
export interface Outcome { w: W; e: Effect }
export interface Choice { label: string; outcomes: Outcome[] }
export interface CareerEvent {
  id: string;
  icon: string;
  title: string;
  body: (s: CareerState) => string;
  when?: (s: CareerState) => boolean;
  choices: Choice[];
}

// Contexto
const ROLES: Record<string, string> = { ARQ: "ARQ", DFC: "DEF", LAT: "DEF", MC: "MED", MCO: "MED", EXT: "DEL", DC: "DEL" };
const role = (s: CareerState): string => ROLES[s.position] ?? "MED";
const country = (s: CareerState) => LEAGUES[leagueOf(s.club, s.leagueOverride).id].country;
const abroad = (s: CareerState) => country(s) !== s.nationality;
const big = (s: CareerState) => clubInfo(s.club).strength >= 74;
const small = (s: CareerState) => clubInfo(s.club).strength < 58;
const inArg = (s: CareerState) => country(s) === "ARG";
const o = (w: W, e: Effect): Outcome => ({ w, e });

export const EVENTS: CareerEvent[] = [
  // ---------- Vestuario ----------
  { id: "asado", icon: "🥩", title: "Asado del plantel", body: () => "Los referentes organizan un asado el día antes del partido. Va a terminar tarde.",
    choices: [
      { label: "Voy, hay que hacer grupo", outcomes: [
        o(5, { confidence: 6, form: -4, text: "Te ganaste al vestuario, pero dormiste poco." }),
        o(3, { confidence: 8, boost: 1, text: "Noche inolvidable: el grupo está más unido que nunca. Llegás con todo." }),
        o(2, { confidence: 3, form: -8, text: "Te tocó lavar los platos y te acostaste a las 3. Fundido para el partido." }),
        o(1, { fame: -2, confidence: 4, text: "Alguien subió un video cantando. Los hinchas se ríen, el grupo te adora." }) ] },
      { label: "Paso, me quedo descansando", outcomes: [
        o(5, { form: 6, confidence: -3, text: "Llegás descansado. Alguno te miró de reojo." }),
        o(2, { form: 4, text: "Nadie se dio cuenta. Dormiste como un bebé." }),
        o(1, { confidence: -7, text: "El capitán te lo marcó delante de todos: 'acá se tira para el mismo lado'." }) ] },
    ] },
  { id: "fiesta", icon: "🎉", title: "Cumpleaños de un amigo", body: () => "Es la noche anterior al partido y no para de llegarte la invitación.",
    choices: [
      { label: "Voy un rato nomás", outcomes: [
        o((s) => 2 + s.fame / 25, { fame: -4, confidence: -8, form: -6, text: "Te sacaron una foto a las 4 AM. Se armó lío en las redes." }),
        o(4, { form: -3, text: "Volviste temprano. Zafaste." }),
        o(2, { form: 2, confidence: 2, text: "Tu amigo te agradeció el gesto y te relajaste. Llegás suelto al partido." }),
        o(1, { injury: 1, text: "Te torciste el tobillo bailando cumbia. Una fecha afuera y una excusa difícil de explicar." }),
        o(1, { fame: 3, text: "Un influencer te filmó firmando autógrafos en la puerta. Buena prensa." }) ] },
      { label: "Le mando un audio y me acuesto", outcomes: [
        o(5, { form: 3, text: "Profesionalismo puro." }),
        o(1, { form: 3, confidence: -1, text: "Tu amigo se ofendió un poco, pero ya se le va a pasar." }) ] },
    ] },
  { id: "idolo", icon: "⭐", title: "Visita de un ídolo", body: () => "Un ídolo del club pasa por el predio y se ofrece a darte una mano.",
    choices: [
      { label: "Le pido que me corrija la técnica", outcomes: [
        o(5, { ovr: 1, text: "Un detalle que te cambió la pegada. +1." }),
        o(3, { form: 2, text: "Buena charla, mucho para aprender." }),
        o(1, { ovr: 1, fame: 3, text: "Se quedó una hora con vos y lo contó en la tele: 'este pibe tiene algo'." }) ] },
      { label: "Le pido una foto", outcomes: [
        o(4, { fame: 1, text: "Linda foto para el recuerdo." }),
        o(1, { fame: 4, text: "La subió él a sus redes. ¡Explotó!" }) ] },
      { label: "Le pregunto por la presión de jugar acá", outcomes: [
        o(1, { confidence: 4, form: 2, text: "'Disfrutalo, pibe'. Te quedó grabado." }) ] },
    ] },
  { id: "pelea", icon: "😤", title: "Roce en el entrenamiento", body: () => "Un compañero te mete una patada fuerte en un picadito. Todos miran.",
    choices: [
      { label: "Lo encaro", outcomes: [
        o(3, { confidence: -6, text: "Se armó un tumulto. El DT los separó y te sacó del entrenamiento." }),
        o(2, { confidence: 3, text: "Se pidieron disculpas y terminaron riéndose. Hay códigos." }),
        o(1, { suspension: 1, confidence: -8, text: "El club los sancionó a los dos: una fecha sin jugar." }) ] },
      { label: "Lo dejo pasar", outcomes: [
        o(3, { confidence: 3, text: "El DT valoró tu cabeza fría." }),
        o(1, { form: -3, text: "Te quedó doliendo la pierna toda la semana." }) ] },
    ] },
  { id: "capitan", icon: "🎖️", title: "La cinta de capitán", when: (s) => s.age >= 26 && s.confidence >= 55, body: () => "El DT te ofrece ser el capitán del equipo.",
    choices: [
      { label: "Acepto con orgullo", outcomes: [
        o(4, { confidence: 6, fame: 4, text: "Ahora sos la voz del vestuario." }),
        o(1, { form: -4, fame: 4, text: "La presión de la cinta te pesó en el partido siguiente." }) ] },
      { label: "Prefiero que la lleve otro", outcomes: [ o(1, { form: 3, text: "Te enfocás en lo tuyo." }) ] },
    ] },
  { id: "pibe", icon: "🧒", title: "Un pibe de inferiores", body: () => "Un juvenil te pide consejos después del entrenamiento.",
    choices: [
      { label: "Me quedo a practicar con él", outcomes: [
        o(3, { fame: 2, confidence: 3, form: -1, text: "El club lo publicó en redes. Linda imagen." }),
        o(1, { ovr: 1, text: "Enseñando también aprendés: te fue bárbaro en esa práctica extra." }) ] },
      { label: "Hoy no puedo", outcomes: [ o(1, { text: "Otra vez será." }) ] },
    ] },
  { id: "truco", icon: "🃏", title: "Torneo de truco en la concentración", when: (s) => inArg(s) || s.nationality === "ARG" || s.nationality === "URU", body: () => "En el hotel se arma un torneo de truco por parejas.",
    choices: [
      { label: "Me anoto con el utilero", outcomes: [
        o(2, { confidence: 4, text: "¡Campeones! El utilero te va a contar la anécdota por años." }),
        o(2, { confidence: 2, text: "Perdieron en la primera, pero se rieron un montón." }),
        o(1, { form: -2, confidence: 3, text: "La final terminó a las 2 AM. Valió la pena." }) ] },
      { label: "Prefiero ver videos del rival", outcomes: [ o(1, { boost: 1, text: "Te sabés de memoria cómo sale jugando el rival." }) ] },
    ] },
  { id: "videojuego", icon: "🎮", title: "Tu media en el videojuego", body: () => "Salió la nueva edición del videojuego de fútbol y te pusieron una media bajísima.",
    choices: [
      { label: "Me quejo en redes", outcomes: [
        o(2, { fame: 4, text: "Se hizo viral y los hinchas te apoyaron." }),
        o(1, { fame: 2, confidence: -2, text: "Algunos te bardearon: 'demostralo en la cancha'." }) ] },
      { label: "Lo uso de motivación", outcomes: [ o(1, { form: 4, boost: 1, text: "Lo pegaste en el vestuario. Salís a demostrar." }) ] },
    ] },
  { id: "cabala", icon: "🧦", title: "Cábala", body: () => "Ganaron los últimos partidos usando las mismas medias. Ya están rotas.",
    choices: [
      { label: "Las sigo usando", outcomes: [
        o(2, { confidence: 3, boost: 1, text: "La cábala no se toca. Te sentís invencible." }),
        o(1, { form: -2, text: "Te sacaron una ampolla. Pero la cábala es la cábala." }) ] },
      { label: "Las tiro: soy profesional", outcomes: [
        o(1, { text: "El utilero te miró con terror." }),
        o(1, { confidence: -3, text: "Los compañeros te culpan por adelantado si pierden." }) ] },
    ] },
  { id: "psicologo", icon: "🧠", title: "Psicólogo deportivo", body: () => "El club suma un psicólogo deportivo y te ofrece sesiones.",
    choices: [
      { label: "Voy a todas", outcomes: [
        o(3, { form: 5, confidence: 3, text: "Aprendiste a manejar la presión." }),
        o(1, { boost: 1, form: 3, text: "Una técnica de respiración te cambió los penales." }) ] },
      { label: "No lo necesito", outcomes: [ o(1, { text: "Seguís con tu rutina." }) ] },
    ] },
  { id: "dieta", icon: "🥗", title: "El nutricionista", body: () => "El nutricionista te arma un plan: nada de harinas, ni dulce de leche.",
    choices: [
      { label: "Lo cumplo al pie de la letra", outcomes: [
        o(3, { form: 6, text: "Te sentís liviano como nunca." }),
        o(1, { ovr: 1, form: 3, text: "Bajaste dos kilos y ganaste aceleración." }) ] },
      { label: "Lo cumplo… más o menos", outcomes: [
        o(2, { text: "Un alfajorcito no le hace mal a nadie." }),
        o(1, { form: -4, confidence: -2, text: "Te pesaron en la semana y saltó todo." }) ] },
    ] },
  // ---------- Entrenamiento y físico ----------
  { id: "doble-turno", icon: "🏋️", title: "Doble turno", body: () => "El preparador físico ofrece un doble turno voluntario esta semana.",
    choices: [
      { label: "Me anoto", outcomes: [
        o((s) => 3 + (s.age < 28 ? 2 : 0), { ovr: 1, form: -4, text: "Mejoraste un punto. Las piernas pesan." }),
        o((s) => (s.age >= 30 ? 3 : 1), { injury: 1, text: "Te sobrecargaste: una fecha afuera." }),
        o(2, { form: 3, confidence: 3, text: "El DT te vio y te felicitó delante de todos." }) ] },
      { label: "Entreno lo normal", outcomes: [ o(1, { form: 2, text: "Semana tranquila." }) ] },
    ] },
  { id: "lesion", icon: "🩹", title: "Molestia muscular", body: () => "Sentís un pinchazo en el isquio. El médico dice que es leve.",
    choices: [
      { label: "Juego infiltrado", outcomes: [
        o(3, { confidence: 5, form: -3, text: "Aguantaste. El DT valora el sacrificio." }),
        o((s) => (s.age >= 30 ? 3 : 2), { injury: 3, text: "Se agravó: tres fechas afuera." }),
        o(1, { fame: 3, confidence: 6, text: "Jugaste con dolor y fuiste de los mejores. Los hinchas te ovacionaron." }) ] },
      { label: "Descanso una fecha", outcomes: [
        o(3, { injury: 1, form: 4, text: "Volvés al 100 %." }),
        o(1, { injury: 1, confidence: -4, text: "Tu reemplazo la rompió. Vas a tener que pelear el puesto." }) ] },
    ] },
  { id: "pretemporada", icon: "⛰️", title: "Pretemporada en la montaña", when: (s) => s.leagueGames <= 1, body: () => "La pretemporada es en la altura, con médanos y subidas.",
    choices: [
      { label: "La doy toda", outcomes: [
        o(3, { form: 8, text: "Volviste hecho un avión." }),
        o(1, { injury: 1, form: 4, text: "Un esguince en el último día. Igual llegaste fuerte." }) ] },
      { label: "Dosifico", outcomes: [ o(1, { form: 3, confidence: -2, text: "El profe anotó que no te vio tan metido." }) ] },
    ] },
  { id: "practica-especial", icon: "🎯", title: "Práctica extra de pelota parada", body: (s) => (role(s) === "ARQ" ? "El entrenador de arqueros te propone una tanda extra de penales." : "Te quedás después del entrenamiento a practicar tiros libres."),
    choices: [
      { label: "100 repeticiones", outcomes: [
        o(3, { boost: 1, text: "Le agarraste la mano. Se nota." }),
        o(1, { ovr: 1, text: "Algo hizo clic. +1 de nivel." }),
        o(1, { form: -3, text: "Terminaste con el aductor cargado." }) ] },
      { label: "Con 20 alcanza", outcomes: [ o(1, { form: 1, text: "Lo justo y necesario." }) ] },
    ] },
  { id: "arquero-error", icon: "🧤", title: "Blooper en el entrenamiento", when: (s) => role(s) === "ARQ", body: () => "Se te pasó una pelota boba entre las piernas y alguien la filmó.",
    choices: [
      { label: "Me río y sigo", outcomes: [
        o(2, { confidence: 2, text: "Los compañeros te bancan. Momento olvidado." }),
        o(1, { fame: -2, text: "El video llegó a un programa de TV. Te lo van a recordar un tiempo." }) ] },
      { label: "Me quedo una hora más practicando", outcomes: [ o(1, { form: 4, boost: 1, text: "No te va a volver a pasar." }) ] },
    ] },
  { id: "delantero-sequia", icon: "🥅", title: "Sequía goleadora", when: (s) => role(s) === "DEL" && s.stats.pj >= 3 && s.stats.goals === 0, body: () => "Llevás varios partidos sin convertir y la prensa empieza a hablar.",
    choices: [
      { label: "Hablo con el DT", outcomes: [
        o(2, { confidence: 5, text: "'Vos seguí así, el gol va a llegar'. Te dio tranquilidad." }),
        o(1, { confidence: -3, text: "Te dijo que si no convertís, juega otro." }) ] },
      { label: "Me encierro a definir mil veces", outcomes: [ o(1, { boost: 1, form: 2, text: "Te vas a cansar de hacer goles." }) ] },
    ] },
  { id: "defensor-roja", icon: "🟥", title: "Expulsión polémica", when: (s) => role(s) === "DEF" || role(s) === "MED", body: () => "En el último partido te echaron por una plancha que no fue. Podés apelar.",
    choices: [
      { label: "Apelo la sanción", outcomes: [
        o(2, { text: "¡Te sacaron la sanción! Jugás el próximo partido." }),
        o(2, { suspension: 2, text: "No solo no prosperó: te dieron dos fechas." }) ] },
      { label: "La cumplo y me callo", outcomes: [ o(1, { suspension: 1, confidence: 2, text: "Una fecha afuera. El DT valoró tu conducta." }) ] },
    ] },
  { id: "posicion", icon: "🔁", title: "El DT te prueba en otro puesto", when: (s) => role(s) !== "ARQ", body: () => "Faltan jugadores y te pide que cubras otra posición este fin de semana.",
    choices: [
      { label: "Lo que necesite el equipo", outcomes: [
        o(3, { confidence: 8, form: -2, text: "Sumaste muchos puntos con el DT." }),
        o(1, { confidence: 6, ovr: 1, text: "Aprendiste cosas nuevas del juego. +1." }) ] },
      { label: "Le explico que rindo en mi puesto", outcomes: [
        o(2, { confidence: -5, text: "Lo entendió… a medias." }),
        o(1, { confidence: 2, text: "Le pareció bien que fueras sincero." }) ] },
    ] },
  // ---------- Prensa y redes ----------
  { id: "radio", icon: "🎙️", title: "Entrevista en la radio", body: () => "Un programa partidario te invita a hablar del próximo rival.",
    choices: [
      { label: "Respuesta de manual: 'partido a partido'", outcomes: [ o(1, { fame: 1, confidence: 2, text: "Nadie se enoja, nadie se acuerda." }) ] },
      { label: "Picante: '¡los vamos a bailar!'", outcomes: [
        o(2, { fame: 6, boost: 1, text: "Explotaron las redes. Salís a la cancha con todo." }),
        o(2, { fame: 3, confidence: -6, text: "Al DT no le gustó nada." }),
        o(1, { fame: 5, form: -3, text: "El rival pegó tu frase en su vestuario. Te van a marcar de cerca." }) ] },
    ] },
  { id: "viral", icon: "📱", title: "Video viral", body: () => "Una jugada tuya en el entrenamiento se hizo viral.",
    choices: [
      { label: "Lo comparto y me agrando", outcomes: [
        o(2, { fame: 5, confidence: -2, text: "Tus seguidores se duplicaron." }),
        o(1, { fame: 8, text: "¡Lo compartió una estrella mundial!" }) ] },
      { label: "Le resto importancia", outcomes: [ o(1, { fame: 2, confidence: 2, text: "Perfil bajo, como le gusta al DT." }) ] },
    ] },
  { id: "polemica", icon: "🐦", title: "Polémica en redes", when: (s) => s.fame >= 20, body: () => "Desenterraron un posteo tuyo de hace años bardeando al clásico rival.",
    choices: [
      { label: "Pido disculpas", outcomes: [
        o(2, { fame: -1, text: "Se calmó rápido." }),
        o(1, { fame: -4, text: "No te creyeron. Te silbaron en la cancha." }) ] },
      { label: "No digo nada", outcomes: [
        o(2, { text: "Al tercer día nadie se acordaba." }),
        o(1, { fame: 3, text: "Los hinchas propios lo amaron." }) ] },
    ] },
  { id: "tele", icon: "📺", title: "Invitación a la tele", when: (s) => s.fame >= 30, body: () => "Te invitan a un programa de chimentos del fútbol.",
    choices: [
      { label: "Voy", outcomes: [
        o(2, { fame: 5, money: 5, text: "Contaste anécdotas y caíste re bien." }),
        o(1, { fame: 3, confidence: -4, text: "Te sacaron un tema del vestuario. Al DT no le gustó." }) ] },
      { label: "No, foco en la cancha", outcomes: [ o(1, { form: 2, text: "El fútbol primero." }) ] },
    ] },
  { id: "comparacion", icon: "🆚", title: "Te comparan con un ídolo", when: (s) => s.fame >= 35, body: () => "Un diario titula: '¿El nuevo ídolo?'. La comparación es enorme.",
    choices: [
      { label: "Me encanta la presión", outcomes: [
        o(2, { fame: 4, boost: 1, text: "Salís a confirmar el título." }),
        o(1, { form: -5, text: "La mochila te pesó. Jugaste nervioso." }) ] },
      { label: "'No me comparen con nadie'", outcomes: [ o(1, { confidence: 3, text: "Respuesta madura. Te ganaste respeto." }) ] },
    ] },
  // ---------- Plata y negocios ----------
  { id: "representante", icon: "🤝", title: "Un representante te llama", body: () => "Promete moverte a un club más grande a cambio del 20 % de tus ingresos.",
    choices: [
      { label: "Firmo con él", outcomes: [
        o(3, { fame: 4, salary: 0.9, text: "Tu nombre empieza a sonar en otros clubes." }),
        o(1, { money: -10, text: "Era un chanta. Desapareció con un adelanto." }),
        o(1, { fame: 7, text: "¡Un club grande pidió informes por vos!" }) ] },
      { label: "Sigo solo", outcomes: [ o(1, { text: "Preferís que hable la pelota." }) ] },
    ] },
  { id: "renovacion", icon: "✍️", title: "Charla de renovación", when: (s) => s.leagueGames >= 3, body: (s) => `El club quiere renovarte. Hoy cobrás ${s.salary} mil USD por partido.`,
    choices: [
      { label: "Pido un aumento fuerte", outcomes: [
        o((s) => 1 + s.fame / 30 + (s.form > 60 ? 1 : 0), { salary: 1.5, confidence: -2, text: "¡Aceptaron! Te suben el sueldo un 50 %." }),
        o(2, { confidence: -8, text: "No les gustó el planteo." }),
        o(1, { salary: 1.2, text: "Te ofrecieron un 20 %. Algo es algo." }) ] },
      { label: "Firmo lo que ofrecen", outcomes: [ o(1, { salary: 1.1, confidence: 5, text: "Renovaste. El club te lo agradece." }) ] },
    ] },
  { id: "botines", icon: "👟", title: "Contrato con una marca", when: (s) => s.fame >= 25, body: () => "Una marca de botines te quiere como imagen.",
    choices: [
      { label: "Firmo", outcomes: [
        o(3, { money: 30, fame: 3, text: "Sesión de fotos y botines personalizados con tu apodo." }),
        o(1, { money: 15, form: -3, text: "Los botines nuevos te sacaron ampollas." }) ] },
      { label: "Sigo con mis botines de siempre", outcomes: [ o(1, { confidence: 2, text: "Fiel a tus raíces." }) ] },
    ] },
  { id: "negocio", icon: "💼", title: "Una inversión", when: (s) => s.money >= 40, body: () => "Un amigo te propone invertir en una cadena de canchas de fútbol 5.",
    choices: [
      { label: "Pongo plata", outcomes: [
        o(2, { money: 30, text: "¡Funcionó! Ahora tenés un negocio que crece." }),
        o(2, { money: -30, text: "Cerró a los seis meses. Lección aprendida." }),
        o(1, { money: 5, fame: 2, text: "Le pusieron tu nombre a una cancha. Algo ganaste." }) ] },
      { label: "Ahorro", outcomes: [ o(1, { text: "Mejor no arriesgar." }) ] },
    ] },
  { id: "prestamo-companero", icon: "💸", title: "Un compañero te pide plata", when: (s) => s.money >= 15, body: () => "Un compañero con problemas te pide un préstamo.",
    choices: [
      { label: "Lo ayudo", outcomes: [
        o(2, { money: -10, confidence: 4, text: "Te lo devolvió y quedaron amigos para siempre." }),
        o(1, { money: -15, text: "Nunca te lo devolvió." }) ] },
      { label: "Le digo que no puedo", outcomes: [ o(1, { confidence: -2, text: "Quedó un poco de tensión." }) ] },
    ] },
  // ---------- Club e hinchas ----------
  { id: "clasico", icon: "🔥", title: "Se viene el clásico", body: () => "Toda la semana se habla del clásico. La presión se siente.",
    choices: [
      { label: "Me encierro a ver videos del rival", outcomes: [ o(2, { form: 4, confidence: 2, text: "Llegás con la lección aprendida." }), o(1, { boost: 1, text: "Le encontraste una debilidad al rival." }) ] },
      { label: "Salgo a calentar la previa en redes", outcomes: [
        o(2, { fame: 4, confidence: -3, text: "La hinchada te banca. El rival también te tiene marcado." }),
        o(1, { fame: 6, boost: 1, text: "La hinchada se enloqueció. Salís a la cancha flotando." }) ] },
    ] },
  { id: "hinchas-aeropuerto", icon: "✈️", title: "Hinchas en el aeropuerto", body: () => "Al volver de un partido hay cientos de hinchas esperando al plantel.",
    choices: [
      { label: "Me quedo sacándome fotos con todos", outcomes: [ o(3, { fame: 3, form: -1, text: "Una hora de fotos. Te quieren." }), o(1, { fame: 5, text: "Un nene se puso a llorar con tu camiseta. Momento hermoso." }) ] },
      { label: "Saludo y me voy", outcomes: [ o(1, { form: 2, text: "Llegás a casa a descansar." }) ] },
    ] },
  { id: "barra", icon: "🥁", title: "Visita de la barra", when: (s) => inArg(s) && s.confidence < 60, body: () => "Después de una derrota, unos barras aparecen en el predio a 'hablar' con el plantel.",
    choices: [
      { label: "Pongo la cara", outcomes: [ o(2, { confidence: 3, text: "Hablaste con respeto. Se fueron tranquilos." }), o(1, { form: -4, text: "Fue tenso. Te quedaste mal toda la semana." }) ] },
      { label: "Me quedo en el vestuario", outcomes: [ o(1, { text: "Los referentes se encargaron." }) ] },
    ] },
  { id: "sueldos", icon: "😬", title: "El club no paga los sueldos", when: (s) => small(s), body: () => "Hace dos meses que no cobran. El plantel evalúa no entrenar.",
    choices: [
      { label: "Me sumo al reclamo", outcomes: [ o(2, { money: 4, confidence: -2, text: "Pagaron una parte. El presidente quedó molesto." }), o(1, { form: -3, text: "Una semana sin entrenar. Se nota." }) ] },
      { label: "Entreno igual", outcomes: [ o(1, { confidence: 5, text: "El DT valoró el compromiso." }) ] },
    ] },
  { id: "micro", icon: "🚌", title: "Viaje en micro de 14 horas", when: (s) => small(s) && inArg(s), body: () => "El partido es lejos y el club viaja en micro toda la noche.",
    choices: [
      { label: "Duermo como puedo", outcomes: [ o(2, { form: -4, text: "Llegaste con contractura en el cuello." }), o(1, { form: -1, confidence: 3, text: "Guitarreada en el micro. El grupo, un lujo." }) ] },
      { label: "Pago un pasaje de avión", outcomes: [ o(1, { money: -3, form: 2, confidence: -3, text: "Llegaste fresco, pero los compañeros no lo vieron bien." }) ] },
    ] },
  { id: "cambio-dt", icon: "🔄", title: "Cambio de DT", when: (s) => s.leagueGames >= 3, body: () => "Echaron al DT. El nuevo llega con ideas distintas.",
    choices: [
      { label: "Me presento y le pregunto qué necesita", outcomes: [ o(2, { confidence: 6, text: "Le caíste bien desde el primer día." }), o(1, { confidence: -3, text: "Ya tenía su equipo armado en la cabeza." }) ] },
      { label: "Espero a ver qué pasa", outcomes: [ o(1, { confidence: -2, text: "Tenés que ganarte el lugar de nuevo." }), o(1, { confidence: 3, text: "Te puso de titular en su primer partido." }) ] },
    ] },
  { id: "ascenso-presion", icon: "⬆️", title: "Pelea por el ascenso", when: (s) => leagueOf(s.club, s.leagueOverride).id === "ARG2", body: () => "El presidente promete un premio especial si ascienden.",
    choices: [
      { label: "'Vamos a dejar todo'", outcomes: [ o(2, { boost: 1, text: "El vestuario está encendido." }), o(1, { form: -2, confidence: 3, text: "Mucha ansiedad, pero el grupo está unido." }) ] },
      { label: "'Pensemos partido a partido'", outcomes: [ o(1, { form: 2, text: "Tranquilidad ante todo." }) ] },
    ] },
  // ---------- Vida afuera / extranjero ----------
  { id: "idioma", icon: "🗣️", title: "Clases de idioma", when: (s) => abroad(s), body: () => "El club te ofrece clases intensivas del idioma local.",
    choices: [
      { label: "Voy todos los días", outcomes: [ o(2, { confidence: 5, text: "Ya entendés las charlas técnicas." }), o(1, { fame: 3, text: "Diste tu primera entrevista en el idioma. ¡Furor!" }) ] },
      { label: "Me arreglo con señas", outcomes: [ o(1, { confidence: -3, text: "No entendiste una indicación táctica clave." }) ] },
    ] },
  { id: "extranar", icon: "🧉", title: "Extrañás tu casa", when: (s) => abroad(s), body: () => "Se cumplen meses lejos de tu familia. El mate no sabe igual.",
    choices: [
      { label: "Traigo a mi familia unas semanas", outcomes: [ o(2, { money: -8, form: 6, text: "Volvió la sonrisa." }), o(1, { form: 3, text: "Visita corta pero reparadora." }) ] },
      { label: "Videollamada y a seguir", outcomes: [ o(2, { form: -2, text: "Cuesta, pero se sigue." }), o(1, { text: "Un asado con otros sudamericanos del equipo te salvó el finde." }) ] },
    ] },
  { id: "nacionalizar", icon: "🛂", title: "Te ofrecen nacionalizarte", when: (s) => abroad(s) && s.ovr >= 72 && s.caps === 0, body: () => "La federación local te sondea para jugar con su selección.",
    choices: [
      { label: "Lo pienso, sería un sueño jugar un Mundial", outcomes: [ o(1, { fame: 3, text: "Por ahora seguís esperando el llamado de tu país." }) ] },
      { label: "Solo juego para mi país", outcomes: [ o(1, { fame: 4, confidence: 2, text: "En tu país lo valoraron muchísimo." }) ] },
    ] },
  { id: "clima", icon: "🥶", title: "Clima extremo", body: () => "Se viene un partido con frío polar (o calor infernal).",
    choices: [
      { label: "Me preparo especialmente", outcomes: [ o(2, { form: 2, text: "Llegaste adaptado." }) ] },
      { label: "Es fútbol, se juega igual", outcomes: [ o(2, { form: -3, text: "Lo sufriste." }), o(1, { text: "Ni lo notaste." }) ] },
    ] },
  // ---------- Vida personal ----------
  { id: "hijo", icon: "👶", title: "¡Vas a ser papá!", when: (s) => s.age >= 23, body: () => "Te enterás de que vas a tener un hijo. Estás feliz.",
    choices: [
      { label: "Si hago un gol, se lo dedico", outcomes: [ o(2, { boost: 1, confidence: 3, text: "Te pusiste la pelota bajo la camiseta en el entrenamiento. Motivación extra." }), o(1, { form: 4, text: "Andás con una sonrisa que no te entra en la cara." }) ] },
      { label: "Lo festejo en privado", outcomes: [ o(1, { form: 3, text: "Una alegría enorme." }) ] },
    ] },
  { id: "estudios", icon: "📚", title: "Terminar los estudios", when: (s) => s.age <= 23, body: () => "Tu vieja insiste con que termines el secundario a distancia.",
    choices: [
      { label: "Lo termino", outcomes: [ o(2, { form: -1, confidence: 2, text: "¡Título en mano! Tu vieja, feliz." }) ] },
      { label: "Ahora no tengo tiempo", outcomes: [ o(1, { text: "Algún día." }) ] },
    ] },
  { id: "curso-dt", icon: "📋", title: "Curso de entrenador", when: (s) => s.age >= 30, body: () => "Te proponen hacer el curso de DT mientras seguís jugando.",
    choices: [
      { label: "Me anoto", outcomes: [ o(2, { confidence: 4, text: "Empezás a ver el juego como un DT." }), o(1, { boost: 1, text: "Le encontrás la vuelta a cada partido." }) ] },
      { label: "Primero quiero jugar", outcomes: [ o(1, { form: 2, text: "La cabeza en la cancha." }) ] },
    ] },
  { id: "retiro-dudas", icon: "🤔", title: "Pensás en el retiro", when: (s) => s.age >= 33, body: () => "El cuerpo ya no responde igual. ¿Hasta cuándo?",
    choices: [
      { label: "Me cuido más que nunca", outcomes: [ o(2, { form: 5, text: "Kinesiólogo, pileta y nada de excesos." }), o(1, { ovr: 1, text: "Te sentís como a los 25." }) ] },
      { label: "Disfruto cada partido como el último", outcomes: [ o(1, { confidence: 3, fame: 2, text: "La hinchada te despide en cada cancha." }) ] },
    ] },
  { id: "solidario", icon: "❤️", title: "Partido solidario", body: () => "Te invitan a un partido a beneficio en tu barrio.",
    choices: [
      { label: "Voy y llevo camisetas firmadas", outcomes: [ o(2, { fame: 3, money: -2, text: "El barrio entero vino a verte." }), o(1, { fame: 5, form: -1, text: "Juntaron un montón de donaciones gracias a vos." }) ] },
      { label: "Mando una camiseta", outcomes: [ o(1, { fame: 1, text: "Lo agradecieron igual." }) ] },
    ] },
  { id: "potrero", icon: "⚽", title: "Picado en el potrero", body: () => "Tus amigos del barrio te invitan a un picado el día libre.",
    choices: [
      { label: "Voy, no me lo pierdo", outcomes: [ o(3, { confidence: 3, text: "Volviste a ser un pibe. Recargaste energía." }), o(1, { injury: 1, text: "Una patada de un amigo te dejó una fecha afuera. Típico." }) ] },
      { label: "Me quedo, hay que cuidarse", outcomes: [ o(1, { form: 2, text: "Descanso total." }) ] },
    ] },
  { id: "mascota", icon: "🐶", title: "Un perro en el predio", body: () => "Un perro callejero se mete siempre en los entrenamientos.",
    choices: [
      { label: "Lo adopto", outcomes: [ o(2, { fame: 3, form: 2, text: "Se convirtió en la mascota del club. Las redes, enloquecidas." }) ] },
      { label: "Le doy de comer y listo", outcomes: [ o(1, { text: "Te sigue a todos lados igual." }) ] },
    ] },
  { id: "auto", icon: "🏎️", title: "Auto nuevo", when: (s) => s.money >= 25, body: () => "Cobraste bien y te tienta un auto deportivo.",
    choices: [
      { label: "Me lo compro", outcomes: [ o(2, { money: -20, fame: 1, text: "Lindo auto. El DT te miró raro." }), o(1, { money: -20, confidence: -3, text: "Llegaste tarde al entrenamiento por pasear. Multa." }) ] },
      { label: "Le compro una casa a mi vieja", outcomes: [ o(1, { money: -20, confidence: 4, fame: 2, text: "El mejor gol de tu vida." }) ] },
    ] },
  // ---------- Grande y Europa ----------
  { id: "estrella", icon: "🌟", title: "Llegó una estrella al plantel", when: (s) => big(s), body: () => "El club fichó a un crack de tu mismo puesto.",
    choices: [
      { label: "Lo veo como competencia sana", outcomes: [ o(2, { form: 4, confidence: -2, text: "Te exigís más que nunca." }), o(1, { ovr: 1, text: "Entrenar con él te hizo mejor." }) ] },
      { label: "Pido explicaciones", outcomes: [ o(1, { confidence: -6, text: "El DT no tiene que explicarte nada." }), o(1, { confidence: 3, text: "Te aseguró que seguís siendo importante." }) ] },
    ] },
  { id: "rotacion", icon: "🔃", title: "Rotación por la seguidilla", when: (s) => s.intlAlive, body: () => "Se juega cada tres días. El DT habla de rotar.",
    choices: [
      { label: "Pido jugar todo", outcomes: [ o(2, { form: -5, confidence: 3, text: "Jugás, pero llegás fundido." }), o(1, { injury: 1, text: "Las piernas dijeron basta." }) ] },
      { label: "Acepto descansar uno", outcomes: [ o(1, { form: 6, text: "Volvés con energía para el partido grande." }) ] },
    ] },
  { id: "noche-copera", icon: "🏟️", title: "Noche copera", when: (s) => s.intlAlive, body: (s) => `Se viene un partido de ${s.intl ?? "copa"}. El estadio va a explotar.`,
    choices: [
      { label: "Me concentro solo", outcomes: [ o(2, { boost: 1, text: "Modo copa activado." }) ] },
      { label: "Le pregunto a los experimentados", outcomes: [ o(2, { confidence: 4, text: "'Las copas se juegan con el corazón'." }) ] },
    ] },
];

/** Eventos de concentración con la selección. */
export const NATIONAL_EVENTS: CareerEvent[] = [
  { id: "nat-concentracion", icon: "🏨", title: "Concentración de la selección", body: () => "Compartís habitación con una figura del equipo.",
    choices: [
      { label: "Le pido consejos", outcomes: [ o(2, { ovr: 1, text: "Te contó secretos que no se ven en la tele." }), o(1, { confidence: 4, text: "Te dijo: 'vos tenés que jugar'." }) ] },
      { label: "Me hago el tranquilo", outcomes: [ o(1, { form: 2, text: "Descanso y foco." }) ] },
    ] },
  { id: "nat-himno", icon: "🎶", title: "El himno", body: () => "En la previa, la hinchada canta el himno a capela. Se te pone la piel de gallina.",
    choices: [
      { label: "Lo canto con todo", outcomes: [ o(2, { boost: 1, fame: 2, text: "La foto con los ojos llenos de lágrimas recorre el país." }), o(1, { form: -2, text: "Te emocionaste tanto que tardaste en entrar al partido." }) ] },
      { label: "Me concentro en el partido", outcomes: [ o(1, { form: 2, text: "Cabeza fría." }) ] },
    ] },
  { id: "nat-prensa", icon: "🎤", title: "Conferencia de prensa", body: () => "Te mandan a hablar en la conferencia previa.",
    choices: [
      { label: "'Vamos a pelear hasta el final'", outcomes: [ o(2, { fame: 2, text: "Bien ahí." }) ] },
      { label: "'Venimos a ser campeones'", outcomes: [ o(1, { fame: 5, text: "El país se ilusiona." }), o(1, { confidence: -3, text: "El DT te pidió más prudencia." }) ] },
    ] },
  { id: "nat-familia", icon: "👨‍👩‍👧", title: "Tu familia viajó a verte", body: () => "Tus viejos llegaron al hotel con una bandera con tu nombre.",
    choices: [
      { label: "Me escapo a verlos un rato", outcomes: [ o(2, { form: 4, text: "Un abrazo que vale una Copa." }), o(1, { confidence: -3, text: "El DT se enteró y no le gustó." }) ] },
      { label: "Los veo después del partido", outcomes: [ o(1, { boost: 1, text: "Les vas a dedicar algo grande." }) ] },
    ] },
  { id: "nat-camiseta", icon: "👕", title: "Intercambio de camisetas", body: () => "Al rival de hoy lo admirás desde chico. ¿Le pedís la camiseta?",
    choices: [
      { label: "Se la pido al final", outcomes: [ o(2, { fame: 1, text: "Te la dio con un abrazo. Va al cuadro." }), o(1, { confidence: -2, text: "Te ignoró. Lo vas a recordar." }) ] },
      { label: "Ni loco, hoy es el rival", outcomes: [ o(1, { boost: 1, text: "Hoy no hay amigos." }) ] },
    ] },
  { id: "nat-mate", icon: "🧉", title: "Ronda de mate en el micro", body: () => "En el micro al estadio, los históricos arrancan con las canciones de cancha.",
    choices: [
      { label: "Me prendo a cantar", outcomes: [ o(2, { confidence: 4, text: "El grupo está encendido." }), o(1, { boost: 1, text: "Llegaste con la sangre caliente." }) ] },
      { label: "Auriculares y concentración", outcomes: [ o(1, { form: 2, text: "Tu ritual de siempre." }) ] },
    ] },
  { id: "nat-lesion", icon: "🩼", title: "Molestia en la concentración", body: () => "Te despertaste con el gemelo cargado.",
    choices: [
      { label: "No digo nada, quiero jugar", outcomes: [ o(2, { form: -3, text: "Aguantaste con hielo." }), o(1, { injury: 1, text: "El médico lo descubrió y te bajó un partido." }) ] },
      { label: "Aviso al cuerpo médico", outcomes: [ o(1, { form: 2, confidence: 2, text: "Te trataron a tiempo." }) ] },
    ] },
  { id: "nat-video", icon: "🎬", title: "Video motivacional", body: () => "El cuerpo técnico pasa un video con mensajes de las familias.",
    choices: [
      { label: "Lo miro hasta el final", outcomes: [ o(2, { boost: 1, text: "No quedó nadie sin llorar. Salen a comerse la cancha." }) ] },
      { label: "Prefiero no emocionarme antes", outcomes: [ o(1, { form: 2, text: "Cada uno tiene su manera." }) ] },
    ] },
];

const ALL = [...EVENTS, ...NATIONAL_EVENTS];
export const eventById = (id: string) => ALL.find((e) => e.id === id);

const weightOf = (w: W, s: CareerState) => Math.max(0, typeof w === "function" ? w(s) : w);

export function resolveChoice(c: Choice, s: CareerState, rand: () => number): Effect {
  const total = c.outcomes.reduce((a, x) => a + weightOf(x.w, s), 0);
  let r = rand() * total;
  for (const x of c.outcomes) if ((r -= weightOf(x.w, s)) <= 0) return x.e;
  return c.outcomes[c.outcomes.length - 1].e;
}

/** Próximo evento: válido para la situación y que no se haya visto en los últimos ~18. */
export function pickEvent(s: CareerState, rand: () => number): string {
  const base = s.national ? NATIONAL_EVENTS : EVENTS;
  const valid = base.filter((e) => !e.when || e.when(s));
  const fresh = valid.filter((e) => !s.recentEvents.includes(e.id));
  const list = fresh.length ? fresh : valid;
  return list[Math.floor(rand() * list.length)].id;
}
