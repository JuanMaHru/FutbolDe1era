/**
 * "Hoy en el fútbol": cumpleaños, fundaciones de clubes (Wikidata) y hechos históricos (lista curada, solo fechas seguras).
 */
import data from "@/data/efemerides.json";
import { TIMEZONE } from "./game/daily";

export interface Moment { md: string; year: number; text: string; icon: string; kind: "final" | "goleada" | "hito" | "nacimiento" }
export const HISTORY: Moment[] = [
  { md: "07-30", year: 1930, text: "Uruguay gana el primer Mundial de la historia, 4-2 a Argentina", icon: "🏆", kind: "final" },
  { md: "07-16", year: 1950, text: "El Maracanazo: Uruguay le gana a Brasil en Río y es campeón del mundo", icon: "🤫", kind: "final" },
  { md: "06-29", year: 1958, text: "Brasil gana su primer Mundial con un Pelé de 17 años", icon: "🇧🇷", kind: "final" },
  { md: "06-25", year: 1978, text: "Argentina es campeona del mundo por primera vez: 3-1 a Países Bajos", icon: "🇦🇷", kind: "final" },
  { md: "06-22", year: 1986, text: "La Mano de Dios y el gol del siglo de Maradona a Inglaterra", icon: "✋", kind: "hito" },
  { md: "06-29", year: 1986, text: "Argentina campeona en México: 3-2 a Alemania en el Azteca", icon: "🇦🇷", kind: "final" },
  { md: "12-18", year: 2022, text: "Argentina gana su tercer Mundial en Qatar, por penales ante Francia", icon: "⭐", kind: "final" },
  { md: "07-11", year: 2010, text: "España gana su primer Mundial con el gol de Iniesta", icon: "🇪🇸", kind: "final" },
  { md: "07-08", year: 2014, text: "Alemania le gana 7-1 a Brasil en la semifinal del Mundial", icon: "😱", kind: "goleada" },
  { md: "07-13", year: 2014, text: "Alemania campeona del mundo en el Maracaná, 1-0 a Argentina", icon: "🇩🇪", kind: "final" },
  { md: "07-09", year: 2006, text: "Italia campeona del mundo; Zidane se despide con el cabezazo a Materazzi", icon: "🇮🇹", kind: "final" },
  { md: "06-30", year: 2002, text: "Brasil pentacampeón con dos goles de Ronaldo en la final", icon: "🇧🇷", kind: "final" },
  { md: "07-12", year: 1998, text: "Francia gana su primer Mundial: 3-0 a Brasil en París", icon: "🇫🇷", kind: "final" },
  { md: "07-10", year: 2021, text: "Argentina gana la Copa América en el Maracaná con gol de Di María", icon: "🇦🇷", kind: "final" },
  { md: "07-10", year: 2016, text: "Portugal gana la Eurocopa ante Francia en París", icon: "🇵🇹", kind: "final" },
  { md: "07-14", year: 2024, text: "Argentina bicampeona de América: 1-0 a Colombia con gol de Lautaro", icon: "🇦🇷", kind: "final" },
  { md: "07-04", year: 2004, text: "Grecia, la gran sorpresa, gana la Eurocopa", icon: "🇬🇷", kind: "final" },
  { md: "07-04", year: 2015, text: "Chile gana su primera Copa América, por penales ante Argentina", icon: "🇨🇱", kind: "final" },
  { md: "07-24", year: 2011, text: "Uruguay gana la Copa América en el Monumental: 3-0 a Paraguay", icon: "🇺🇾", kind: "final" },
  { md: "12-09", year: 2018, text: "River le gana la final de la Libertadores a Boca en Madrid", icon: "❤️", kind: "final" },
  { md: "11-28", year: 2000, text: "Boca de Bianchi le gana la Intercontinental al Real Madrid en Tokio", icon: "💙", kind: "final" },
  { md: "06-20", year: 2007, text: "Boca gana su sexta Libertadores con un Riquelme imparable", icon: "💛", kind: "final" },
  { md: "07-15", year: 2009, text: "Estudiantes de Sabella gana su cuarta Libertadores en Brasil", icon: "🏆", kind: "final" },
  { md: "08-13", year: 2014, text: "San Lorenzo gana su primera Copa Libertadores", icon: "🔴", kind: "final" },
  { md: "12-01", year: 1994, text: "Vélez le gana la Intercontinental al Milan en Tokio", icon: "🌍", kind: "final" },
  { md: "10-24", year: 1985, text: "Argentinos Juniors gana la Copa Libertadores", icon: "🏆", kind: "final" },
  { md: "10-29", year: 1986, text: "River gana su primera Copa Libertadores", icon: "❤️", kind: "final" },
  { md: "08-05", year: 2015, text: "River vuelve a ganar la Libertadores después de 19 años", icon: "❤️", kind: "final" },
  { md: "12-27", year: 2001, text: "Racing sale campeón después de 35 años", icon: "💙", kind: "final" },
  { md: "05-25", year: 2005, text: "El milagro de Estambul: el Liverpool remonta un 0-3 al Milan", icon: "🔴", kind: "final" },
  { md: "05-02", year: 2016, text: "El Leicester se consagra campeón de la Premier League", icon: "🦊", kind: "hito" },
  { md: "05-22", year: 2010, text: "El Inter de Mourinho gana la Champions y completa el triplete", icon: "⚫", kind: "final" },
  { md: "05-27", year: 2009, text: "El Barça de Guardiola gana la Champions en Roma", icon: "🔵", kind: "final" },
  { md: "10-16", year: 2004, text: "Messi debuta oficialmente en el Barcelona", icon: "🔟", kind: "hito" },
  { md: "04-18", year: 2007, text: "El gol de Messi al Getafe, calcado al de Maradona", icon: "⚽", kind: "hito" },
  { md: "06-26", year: 2011, text: "River desciende a la B Nacional", icon: "😢", kind: "hito" },
  { md: "12-01", year: 2009, text: "Messi gana su primer Balón de Oro", icon: "🥇", kind: "hito" },
  { md: "07-06", year: 2009, text: "Cristiano Ronaldo es presentado en el Real Madrid ante 80.000 personas", icon: "⚪", kind: "hito" },
  { md: "08-03", year: 2017, text: "Neymar pasa al PSG por 222 millones de euros", icon: "💰", kind: "hito" },
  { md: "08-05", year: 2021, text: "El Barcelona anuncia que Messi no sigue en el club", icon: "💔", kind: "hito" },
  { md: "12-15", year: 1995, text: "La Ley Bosman cambia para siempre el mercado de pases", icon: "📜", kind: "hito" },
  { md: "10-30", year: 1960, text: "Nace Diego Armando Maradona", icon: "🎂", kind: "nacimiento" },
  { md: "10-23", year: 1940, text: "Nace Pelé", icon: "🎂", kind: "nacimiento" },
  { md: "11-25", year: 2020, text: "Muere Diego Maradona", icon: "🕊️", kind: "hito" },
  { md: "12-29", year: 2022, text: "Muere Pelé", icon: "🕊️", kind: "hito" },
  { md: "04-01", year: 2009, text: "Bolivia le gana 6-1 a la Argentina de Maradona en La Paz", icon: "😵", kind: "goleada" },
  { md: "03-08", year: 2017, text: "La remontada: Barcelona 6-1 PSG en la Champions", icon: "🤯", kind: "goleada" },
  { md: "05-07", year: 2019, text: "Liverpool 4-0 Barcelona: remontada histórica en Anfield", icon: "🔴", kind: "goleada" },
  { md: "05-02", year: 2009, text: "Real Madrid 2-6 Barcelona en el Bernabéu", icon: "🔵", kind: "goleada" },
  { md: "08-14", year: 2020, text: "Bayern 8-2 Barcelona en los cuartos de la Champions", icon: "🔴", kind: "goleada" },
  { md: "06-16", year: 2006, text: "Argentina 6-0 Serbia y Montenegro, con el golazo colectivo de Cambiasso", icon: "🎯", kind: "goleada" },
];

export interface Birthday { id: string; name: string; date: string; fame: number }
const D = data as { births: Birthday[]; clubs: { club: string; date: string }[] };

/** Fecha de hoy en Buenos Aires: { md: "MM-DD", year }. */
export function todayBA(now = new Date()) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return { md: f.slice(5), year: Number(f.slice(0, 4)) };
}
const shift = (md: string, d: number, year: number) => {
  const dt = new Date(Date.UTC(year, Number(md.slice(0, 2)) - 1, Number(md.slice(3)) + d));
  return dt.toISOString().slice(5, 10);
};

export function efemerides(now = new Date()) {
  const { md, year } = todayBA(now);
  const births = D.births.filter((b) => b.date.slice(5) === md).sort((a, b) => b.fame - a.fame).map((b) => ({ ...b, age: year - Number(b.date.slice(0, 4)) }));
  const clubs = D.clubs.filter((c) => c.date.slice(5) === md).map((c) => ({ ...c, years: year - Number(c.date.slice(0, 4)) }));
  const events = HISTORY.filter((h) => h.md === md).map((h) => ({ ...h, ago: year - h.year }));
  // Si hoy hay poco, sumamos lo de los próximos días.
  const soon = events.length + clubs.length + Math.min(births.length, 3) < 3
    ? [1, 2, 3, 4, 5, 6].flatMap((d) => HISTORY.filter((h) => h.md === shift(md, d, year)).map((h) => ({ ...h, inDays: d })))
    : [];
  return { md, births, clubs, events, soon };
}
