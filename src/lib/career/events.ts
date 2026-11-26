import type { CareerState } from "./engine";

/** Efecto de una decisión: cambios en atributos + texto que se muestra después de elegir. */
export interface Effect {
  ovr?: number;
  form?: number;
  confidence?: number;
  fame?: number;
  money?: number;
  injury?: number; // fechas afuera
  text: string;
}
export interface Choice {
  label: string;
  /** Algunas decisiones tienen azar: se resuelven al elegir. */
  resolve: (s: CareerState, rand: () => number) => Effect;
}
export interface CareerEvent {
  id: string;
  title: string;
  body: (s: CareerState) => string;
  icon: string;
  when?: (s: CareerState) => boolean;
  choices: Choice[];
}

const chance = (rand: () => number, p: number) => rand() < p;

export const EVENTS: CareerEvent[] = [
  {
    id: "asado",
    icon: "🥩",
    title: "Asado del plantel",
    body: () => "Los referentes organizan un asado el día antes del partido. Va a terminar tarde.",
    choices: [
      { label: "Voy, hay que hacer grupo", resolve: () => ({ confidence: 6, form: -5, text: "Te ganaste al vestuario, pero dormiste poco." }) },
      { label: "Paso, me quedo descansando", resolve: () => ({ form: 6, confidence: -3, text: "Llegás descansado. Alguno te miró de reojo." }) },
    ],
  },
  {
    id: "doble-turno",
    icon: "🏋️",
    title: "Doble turno",
    body: () => "El preparador físico ofrece un doble turno voluntario esta semana.",
    choices: [
      { label: "Me anoto", resolve: (_s, r) => (chance(r, 0.75) ? { ovr: 1, form: -4, text: "Mejoraste un punto. Las piernas pesan." } : { injury: 1, text: "Te sobrecargaste: una fecha afuera." }) },
      { label: "Entreno lo normal", resolve: () => ({ form: 2, text: "Semana tranquila." }) },
    ],
  },
  {
    id: "radio",
    icon: "🎙️",
    title: "Entrevista en la radio",
    body: () => "Un programa partidario te invita a hablar del próximo rival.",
    choices: [
      { label: "Respuesta de manual: 'partido a partido'", resolve: () => ({ fame: 1, confidence: 2, text: "Nadie se enoja, nadie se acuerda." }) },
      { label: "Picante: '¡los vamos a bailar!'", resolve: (_s, r) => (chance(r, 0.5) ? { fame: 6, text: "Explotaron las redes. Ahora hay que cumplir." } : { fame: 3, confidence: -6, text: "Al DT no le gustó nada." }) },
    ],
  },
  {
    id: "representante",
    icon: "🤝",
    title: "Un representante te llama",
    body: () => "Promete moverte a un club más grande a cambio del 20 % de tus ingresos.",
    choices: [
      { label: "Firmo con él", resolve: () => ({ fame: 4, money: -5, text: "Tu nombre empieza a sonar en otros clubes." }) },
      { label: "Sigo solo", resolve: () => ({ text: "Preferís que hable la pelota." }) },
    ],
  },
  {
    id: "lesion",
    icon: "🩹",
    title: "Molestia muscular",
    body: () => "Sentís un pinchazo en el isquio. El médico dice que es leve.",
    choices: [
      { label: "Juego infiltrado", resolve: (_s, r) => (chance(r, 0.6) ? { confidence: 5, form: -3, text: "Aguantaste. El DT valora el sacrificio." } : { injury: 3, text: "Se agravó: tres fechas afuera." }) },
      { label: "Descanso una fecha", resolve: () => ({ injury: 1, form: 4, text: "Volvés al 100 %." }) },
    ],
  },
  {
    id: "posicion",
    icon: "🔁",
    title: "El DT te prueba en otro puesto",
    body: () => "Faltan jugadores y te pide que cubras otra posición este fin de semana.",
    choices: [
      { label: "Lo que necesite el equipo", resolve: () => ({ confidence: 8, form: -2, text: "Sumaste muchos puntos con el DT." }) },
      { label: "Le explico que rindo en mi puesto", resolve: () => ({ confidence: -5, text: "Lo entendió… a medias." }) },
    ],
  },
  {
    id: "fiesta",
    icon: "🎉",
    title: "Cumpleaños de un amigo",
    body: () => "Es la noche anterior al partido y no para de llegarte la invitación.",
    choices: [
      { label: "Voy un rato nomás", resolve: (_s, r) => (chance(r, 0.35) ? { fame: -4, confidence: -8, form: -6, text: "Te sacaron una foto a las 4 AM. Se armó lío." } : { form: -3, text: "Volviste temprano. Zafaste." }) },
      { label: "Le mando un audio y me acuesto", resolve: () => ({ form: 3, text: "Profesionalismo puro." }) },
    ],
  },
  {
    id: "pibe",
    icon: "🧒",
    title: "Un pibe de inferiores",
    body: () => "Un juvenil te pide consejos después del entrenamiento.",
    choices: [
      { label: "Me quedo a practicar con él", resolve: () => ({ fame: 2, confidence: 3, form: -1, text: "El club lo publicó en redes. Linda imagen." }) },
      { label: "Hoy no puedo", resolve: () => ({ text: "Otra vez será." }) },
    ],
  },
  {
    id: "renovacion",
    icon: "✍️",
    title: "Charla de renovación",
    when: (s) => s.week >= 4,
    body: (s) => `El club quiere renovarte. Hoy cobrás ${s.salary} mil USD por fecha.`,
    choices: [
      { label: "Pido un aumento fuerte", resolve: (s, r) => (chance(r, Math.min(0.2 + s.fame / 120, 0.85)) ? { money: 0, confidence: -2, text: "¡Aceptaron! Te suben el sueldo un 50 %." } : { confidence: -8, text: "No les gustó el planteo." }) },
      { label: "Firmo lo que ofrecen", resolve: () => ({ confidence: 5, text: "Renovaste. El club te lo agradece." }) },
    ],
  },
  {
    id: "viral",
    icon: "📱",
    title: "Video viral",
    body: () => "Un caño tuyo en el entrenamiento se hizo viral.",
    choices: [
      { label: "Lo comparto y me agrando", resolve: () => ({ fame: 5, confidence: -2, text: "Tus seguidores se duplicaron." }) },
      { label: "Le resto importancia", resolve: () => ({ fame: 2, confidence: 2, text: "Perfil bajo, como le gusta al DT." }) },
    ],
  },
  {
    id: "idolo",
    icon: "⭐",
    title: "Visita de un ídolo",
    body: () => "Un ídolo del club pasa por el predio y se ofrece a darte una mano.",
    choices: [
      { label: "Le pido que me corrija la técnica", resolve: (_s, r) => (chance(r, 0.6) ? { ovr: 1, text: "Un detalle que te cambió la pegada. +1." } : { form: 2, text: "Buena charla, mucho para aprender." }) },
      { label: "Le pido una foto", resolve: () => ({ fame: 1, text: "Linda foto para el recuerdo." }) },
    ],
  },
  {
    id: "clasico",
    icon: "🔥",
    title: "Se viene el clásico",
    body: () => "Toda la semana se habla del clásico. La presión se siente.",
    choices: [
      { label: "Me encierro a ver videos del rival", resolve: () => ({ form: 4, confidence: 2, text: "Llegás con la lección aprendida." }) },
      { label: "Salgo a calentar la previa en redes", resolve: () => ({ fame: 4, confidence: -3, text: "La hinchada te banca. El rival también te tiene marcado." }) },
    ],
  },
];
