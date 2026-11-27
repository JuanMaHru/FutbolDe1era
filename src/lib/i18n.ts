/**
 * Textos de la interfaz. Para sumar un idioma: copiar `es`, traducir y marcarlo `ready` en LANGS.
 * Los textos nuevos se agregan acá en vez de escribirse sueltos en los componentes.
 */
import { read, write } from "./storage";

export const LANGS = [
  { code: "es", label: "ES", name: "Español", flag: "🇦🇷", ready: true },
  { code: "pt", label: "PT", name: "Português", flag: "🇧🇷", ready: false },
  { code: "en", label: "EN", name: "English", flag: "🇬🇧", ready: false },
] as const;
export type Lang = (typeof LANGS)[number]["code"];

const es = {
  "nav.games": "Juegos",
  "nav.archive": "Archivo",
  "nav.leagues": "Ligas",
  "top.follow": "Seguinos",
  "top.soon": "Pronto",
  "top.sound.on": "Sonido activado",
  "top.sound.off": "Sonido apagado",
  "home.title": "El que sabe, juega.",
  "home.lead": "Retos diarios iguales para todos. Tu conocimiento de fútbol es tu stat: cada acierto suma para tu liga y para tu carrera.",
  "home.today": "Del día",
  "home.changesIn": "Cambia en",
  "home.pick": "Elegí tu modo",
  "badge.daily": "Diario",
  "badge.new": "Nuevo",
  "badge.soon": "Pronto",
  "status.new": "Sin jugar",
  "status.playing": "En juego",
  "status.won": "Acertado",
  "status.lost": "Fallado",
  "mode.jugador": "Adiviná el Jugador",
  "mode.tray": "Trayectoria",
  "mode.traydt": "Trayectoria DT",
  "mode.dt": "Adiviná el DT",
  "mode.ligas": "Ligas con amigos",
  "mode.archivo": "Archivo",
  "mode.carrera": "Modo Carrera",
  "mode.wordle": "Palabra Crack",
  "mode.bingo": "Bingo Futbolero",
  "mode.once": "Armá el 11",
  "mode.masomenos": "Más o Menos",
  "mode.intruso": "El intruso",
  "mode.anios": "¿En qué año?",
  "mode.club": "¿De qué club es?",
  "mode.conexion": "¿Quién jugó con quién?",
  "game.guessThe": "Adiviná el",
  "game.placeholder": "Escribí un",
  "game.notFound": "No está en la base (todavía).",
  "game.howto": "Cómo se juega",
  "game.archiveTag": "Archivo",
  "game.practiceTag": "Práctica · no suma",
  "result.first": "¡De primera!",
  "result.win": "¡Golazo!",
  "result.lose": "Esta vez no",
  "result.points": "puntos de liga",
  "result.rep": "reputación",
  "result.streak": "racha",
  "result.share": "Compartir resultado",
  "result.next": "Próximo reto en",
  "result.practice": "Jugar en modo práctica",
  "result.another": "Otro más",
  "result.back": "Volver al reto del día",
  "result.copied": "¡Copiado! Pegalo en el grupo 📋",
  "result.copyFail": "Mantené apretado el texto para copiarlo",
  "result.archiveNote": "Los días anteriores suman media reputación y no cuentan para la liga ni la racha.",
  "archive.title": "Archivo de retos",
  "archive.lead": "Jugá los días que te perdiste. Suman media reputación, no cuentan para la liga.",
  "archive.today": "Hoy",
};
export type TKey = keyof typeof es;

const DICTS: Record<Lang, Partial<Record<TKey, string>>> = { es, pt: {}, en: {} };

let current: Lang = "es";
export function getLang(): Lang {
  return current;
}
export function initLang() {
  const saved = read<Lang>("lang", "es");
  current = LANGS.find((l) => l.code === saved && l.ready) ? saved : "es";
}
export function setLang(l: Lang) {
  current = l;
  write("lang", l);
}

export function t(key: TKey, vars?: Record<string, string | number>): string {
  let s = DICTS[current][key] ?? es[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
