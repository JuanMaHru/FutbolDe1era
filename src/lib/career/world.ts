/**
 * El mundo del Modo Carrera: ligas con sus clubes (y una "fuerza" 40-90), copas nacionales,
 * copas continentales y selecciones. Los partidos siempre son contra rivales coherentes:
 * liga → misma liga; copa → mismo país; internacional → mismo continente.
 */
export type Continent = "CONMEBOL" | "UEFA" | "CONCACAF" | "AFC";

export interface Round { name: string; legs: boolean }
export interface LeagueFormat {
  /** rr: todos contra todos. ac: Apertura y Clausura con playoffs. */
  type: "rr" | "ac";
  double: boolean;
  zones: number;
  tournaments: string[];
  playoff?: { rounds: Round[]; qualify: number };
}

export interface League {
  id: string;
  name: string;
  country: string;
  cup: string;
  continent: Continent;
  size: number; // equipos de la liga real (para estimar la posición final)
  /** Hasta qué puesto clasifica a la copa principal / secundaria. 0 = no clasifica. */
  top: [number, number];
  promote?: string; // liga a la que asciende
  relegateTo?: string;
  salary: number; // miles de USD por partido para un club medio
  format: LeagueFormat;
  cupRounds: Round[];
  /** Coeficiente para la Bota de Oro. */
  coef: number;
}

const one = (name: string): Round => ({ name, legs: false });
const two = (name: string): Round => ({ name, legs: true });
const RR: LeagueFormat = { type: "rr", double: true, zones: 1, tournaments: [""] };
const CUP_SINGLE = (names: string[]) => names.map(one);

export const LEAGUES: Record<string, League> = {
  ARG2: { id: "ARG2", name: "Primera Nacional", country: "ARG", cup: "Copa Argentina", continent: "CONMEBOL", size: 18, top: [0, 0], promote: "ARG1", salary: 2, format: RR, coef: 1,
    cupRounds: CUP_SINGLE(["32avos de final", "16avos de final", "Octavos de final", "Cuartos de final", "Semifinal", "Final"]) },
  ARG1: { id: "ARG1", name: "Liga Profesional", country: "ARG", cup: "Copa Argentina", continent: "CONMEBOL", size: 30, top: [4, 10], relegateTo: "ARG2", salary: 9, coef: 1.5,
    format: { type: "ac", double: false, zones: 2, tournaments: ["Torneo Apertura", "Torneo Clausura"], playoff: { qualify: 8, rounds: CUP_SINGLE(["Octavos de final", "Cuartos de final", "Semifinal", "Final"]) } },
    cupRounds: CUP_SINGLE(["32avos de final", "16avos de final", "Octavos de final", "Cuartos de final", "Semifinal", "Final"]) },
  BRA: { id: "BRA", name: "Brasileirão", country: "BRA", cup: "Copa do Brasil", continent: "CONMEBOL", size: 20, top: [6, 12], salary: 22, format: RR, coef: 1.5,
    cupRounds: [two("Tercera fase"), two("Octavos de final"), two("Cuartos de final"), two("Semifinal"), two("Final")] },
  URU: { id: "URU", name: "Liga Uruguaya", country: "URU", cup: "Copa AUF Uruguay", continent: "CONMEBOL", size: 16, top: [3, 6], salary: 5, format: RR, coef: 1,
    cupRounds: CUP_SINGLE(["16avos de final", "Octavos de final", "Cuartos de final", "Semifinal", "Final"]) },
  ESP: { id: "ESP", name: "LaLiga", country: "ESP", cup: "Copa del Rey", continent: "UEFA", size: 20, top: [4, 6], salary: 90, format: RR, coef: 2,
    cupRounds: [one("Segunda ronda"), one("16avos de final"), one("Octavos de final"), one("Cuartos de final"), two("Semifinal"), one("Final")] },
  ENG: { id: "ENG", name: "Premier League", country: "ENG", cup: "FA Cup", continent: "UEFA", size: 20, top: [4, 6], salary: 130, format: RR, coef: 2,
    cupRounds: CUP_SINGLE(["Tercera ronda", "Cuarta ronda", "Quinta ronda", "Cuartos de final", "Semifinal", "Final"]) },
  ITA: { id: "ITA", name: "Serie A", country: "ITA", cup: "Coppa Italia", continent: "UEFA", size: 20, top: [4, 6], salary: 70, format: RR, coef: 2,
    cupRounds: [one("16avos de final"), one("Octavos de final"), one("Cuartos de final"), two("Semifinal"), one("Final")] },
  GER: { id: "GER", name: "Bundesliga", country: "GER", cup: "DFB-Pokal", continent: "UEFA", size: 18, top: [4, 6], salary: 75, format: RR, coef: 2,
    cupRounds: CUP_SINGLE(["Primera ronda", "Segunda ronda", "Octavos de final", "Cuartos de final", "Semifinal", "Final"]) },
  FRA: { id: "FRA", name: "Ligue 1", country: "FRA", cup: "Coupe de France", continent: "UEFA", size: 18, top: [3, 5], salary: 55, format: RR, coef: 2,
    cupRounds: CUP_SINGLE(["32avos de final", "16avos de final", "Octavos de final", "Cuartos de final", "Semifinal", "Final"]) },
  POR: { id: "POR", name: "Primeira Liga", country: "POR", cup: "Taça de Portugal", continent: "UEFA", size: 18, top: [2, 4], salary: 30, format: RR, coef: 1.5,
    cupRounds: [one("Cuarta ronda"), one("Octavos de final"), one("Cuartos de final"), two("Semifinal"), one("Final")] },
  NED: { id: "NED", name: "Eredivisie", country: "NED", cup: "KNVB Beker", continent: "UEFA", size: 18, top: [2, 4], salary: 25, format: RR, coef: 1.5,
    cupRounds: CUP_SINGLE(["Segunda ronda", "Octavos de final", "Cuartos de final", "Semifinal", "Final"]) },
  MEX: { id: "MEX", name: "Liga MX", country: "MEX", cup: "Leagues Cup", continent: "CONCACAF", size: 18, top: [4, 0], salary: 20, coef: 1,
    format: { type: "ac", double: false, zones: 1, tournaments: ["Apertura", "Clausura"], playoff: { qualify: 8, rounds: [two("Cuartos de final"), two("Semifinal"), two("Final")] } },
    cupRounds: CUP_SINGLE(["Fase de grupos", "16avos de final", "Octavos de final", "Cuartos de final", "Semifinal", "Final"]) },
  USA: { id: "USA", name: "MLS", country: "USA", cup: "US Open Cup", continent: "CONCACAF", size: 16, top: [3, 0], salary: 30, coef: 1,
    format: { type: "rr", double: true, zones: 1, tournaments: [""], playoff: { qualify: 8, rounds: CUP_SINGLE(["Cuartos de final", "Semifinal", "Final de la MLS Cup"]) } },
    cupRounds: CUP_SINGLE(["Tercera ronda", "Octavos de final", "Cuartos de final", "Semifinal", "Final"]) },
  KSA: { id: "KSA", name: "Saudi Pro League", country: "KSA", cup: "King's Cup", continent: "AFC", size: 18, top: [3, 0], salary: 120, format: RR, coef: 1,
    cupRounds: CUP_SINGLE(["Octavos de final", "Cuartos de final", "Semifinal", "Final"]) },
};

/** Formatos continentales. group: grupo de 4 ida y vuelta. league: fase liga de 8 partidos. */
export interface ContinentalFormat { first: "group" | "league" | "none"; knockout: Round[] }
export const CONT_FORMAT: Record<Continent, ContinentalFormat> = {
  CONMEBOL: { first: "group", knockout: [two("Octavos de final"), two("Cuartos de final"), two("Semifinal"), one("Final")] },
  UEFA: { first: "league", knockout: [two("Playoffs"), two("Octavos de final"), two("Cuartos de final"), two("Semifinal"), one("Final")] },
  CONCACAF: { first: "none", knockout: [two("Primera ronda"), two("Octavos de final"), two("Cuartos de final"), two("Semifinal"), one("Final")] },
  AFC: { first: "league", knockout: [two("Octavos de final"), one("Cuartos de final"), one("Semifinal"), one("Final")] },
};

export const CONTINENTAL: Record<Continent, [string, string]> = {
  CONMEBOL: ["Copa Libertadores", "Copa Sudamericana"],
  UEFA: ["Champions League", "Europa League"],
  CONCACAF: ["Concacaf Champions Cup", ""],
  AFC: ["AFC Champions League", ""],
};

/** [club, liga, fuerza] */
const C: [string, string, number][] = [
  // Primera Nacional
  ["Chacarita Juniors", "ARG2", 50], ["Quilmes", "ARG2", 50], ["Ferro Carril Oeste", "ARG2", 49], ["Nueva Chicago", "ARG2", 48],
  ["Colón", "ARG2", 53], ["San Martín de Tucumán", "ARG2", 52],
  // Liga Profesional
  ["Boca Juniors", "ARG1", 74], ["River Plate", "ARG1", 75], ["Racing Club", "ARG1", 71], ["Independiente", "ARG1", 66],
  ["San Lorenzo", "ARG1", 64], ["Estudiantes", "ARG1", 68], ["Vélez Sarsfield", "ARG1", 66], ["Talleres", "ARG1", 66],
  ["Rosario Central", "ARG1", 66], ["Newell's Old Boys", "ARG1", 61], ["Lanús", "ARG1", 65], ["Huracán", "ARG1", 62],
  ["Argentinos Juniors", "ARG1", 63], ["Belgrano", "ARG1", 61], ["Gimnasia y Esgrima LP", "ARG1", 60], ["Defensa y Justicia", "ARG1", 61],
  ["Godoy Cruz", "ARG1", 60], ["Unión", "ARG1", 59], ["Instituto", "ARG1", 58], ["Platense", "ARG1", 59], ["Tigre", "ARG1", 58],
  ["Banfield", "ARG1", 58], ["Sarmiento", "ARG1", 56], ["Barracas Central", "ARG1", 57], ["Deportivo Riestra", "ARG1", 56],
  ["Central Córdoba", "ARG1", 57], ["Independiente Rivadavia", "ARG1", 58], ["Aldosivi", "ARG1", 55], ["Atlético Tucumán", "ARG1", 58],
  // Brasil
  ["Flamengo", "BRA", 77], ["Palmeiras", "BRA", 77], ["Botafogo", "BRA", 74], ["São Paulo", "BRA", 70], ["Fluminense", "BRA", 70],
  ["Corinthians", "BRA", 70], ["Atlético Mineiro", "BRA", 71], ["Internacional", "BRA", 70], ["Grêmio", "BRA", 69],
  ["Cruzeiro", "BRA", 71], ["Santos", "BRA", 66], ["Vasco da Gama", "BRA", 67],
  // Uruguay
  ["Peñarol", "URU", 64], ["Nacional", "URU", 64], ["Danubio", "URU", 55], ["Defensor Sporting", "URU", 56],
  ["Liverpool Montevideo", "URU", 56], ["Montevideo Wanderers", "URU", 53],
  // España
  ["Real Madrid", "ESP", 88], ["Barcelona", "ESP", 88], ["Atlético de Madrid", "ESP", 84], ["Athletic Club", "ESP", 79],
  ["Villarreal", "ESP", 79], ["Real Sociedad", "ESP", 77], ["Real Betis", "ESP", 77], ["Sevilla", "ESP", 75], ["Valencia", "ESP", 73],
  ["Celta", "ESP", 72], ["Getafe", "ESP", 71], ["Rayo Vallecano", "ESP", 71], ["Espanyol", "ESP", 70], ["Girona", "ESP", 72],
  // Inglaterra
  ["Manchester City", "ENG", 88], ["Liverpool", "ENG", 89], ["Arsenal", "ENG", 88], ["Chelsea", "ENG", 85], ["Manchester United", "ENG", 80],
  ["Tottenham", "ENG", 81], ["Newcastle", "ENG", 81], ["Aston Villa", "ENG", 80], ["Brighton", "ENG", 77], ["West Ham", "ENG", 75],
  ["Everton", "ENG", 74], ["Crystal Palace", "ENG", 77], ["Fulham", "ENG", 75], ["Nottingham Forest", "ENG", 76],
  // Italia
  ["Inter", "ITA", 86], ["Milan", "ITA", 82], ["Juventus", "ITA", 82], ["Napoli", "ITA", 84], ["Roma", "ITA", 79], ["Atalanta", "ITA", 80],
  ["Lazio", "ITA", 77], ["Fiorentina", "ITA", 76], ["Bologna", "ITA", 77], ["Como", "ITA", 74], ["Torino", "ITA", 72], ["Genoa", "ITA", 70], ["Udinese", "ITA", 70],
  // Alemania
  ["Bayern Múnich", "GER", 89], ["Bayer Leverkusen", "GER", 82], ["Borussia Dortmund", "GER", 82], ["RB Leipzig", "GER", 80],
  ["Stuttgart", "GER", 78], ["Eintracht Frankfurt", "GER", 78], ["Wolfsburg", "GER", 73], ["Mainz", "GER", 72], ["Werder Bremen", "GER", 72],
  // Francia
  ["Paris Saint-Germain", "FRA", 88], ["Olympique de Marsella", "FRA", 80], ["Monaco", "FRA", 79], ["Lyon", "FRA", 77],
  ["Lille", "FRA", 77], ["Lens", "FRA", 75], ["Nice", "FRA", 74], ["Rennes", "FRA", 74],
  // Portugal
  ["Benfica", "POR", 80], ["Porto", "POR", 80], ["Sporting CP", "POR", 81], ["Braga", "POR", 75], ["Vitória de Guimarães", "POR", 70], ["Rio Ave", "POR", 66],
  // Países Bajos
  ["Ajax", "NED", 77], ["PSV", "NED", 79], ["Feyenoord", "NED", 78], ["AZ", "NED", 72], ["Twente", "NED", 71], ["Utrecht", "NED", 70],
  // México
  ["Club América", "MEX", 70], ["Monterrey", "MEX", 70], ["Tigres", "MEX", 70], ["Cruz Azul", "MEX", 69], ["Toluca", "MEX", 68], ["León", "MEX", 66], ["Chivas", "MEX", 66],
  // MLS
  ["Inter Miami", "USA", 70], ["LA Galaxy", "USA", 66], ["LAFC", "USA", 68], ["Atlanta United", "USA", 64], ["Columbus Crew", "USA", 66],
  // Arabia
  ["Al Hilal", "KSA", 78], ["Al Nassr", "KSA", 77], ["Al-Ittihad", "KSA", 76], ["Al-Ahli", "KSA", 76], ["Al-Shabab", "KSA", 68], ["Al-Ettifaq", "KSA", 67],
];

/** Clubes para completar cada liga a su tamaño real (sin estilo propio: escudo genérico). */
const FILL: [string, string, number][] = [
  ...(["All Boys", "Almirante Brown", "Atlanta", "Agropecuario", "Deportivo Morón", "Defensores de Belgrano", "Estudiantes de Buenos Aires", "Gimnasia de Jujuy", "Mitre", "Patronato", "Racing de Córdoba", "Temperley"].map((n, i) => [n, "ARG2", 47 + (i % 4)]) as [string, string, number][]),
  ["San Martín de San Juan", "ARG1", 55],
  ...(["Bahia", "Fortaleza", "Bragantino", "Athletico Paranaense", "Vitória", "Juventude", "Sport Recife", "Ceará"].map((n, i) => [n, "BRA", 70 - i]) as [string, string, number][]),
  ...(["Cerro", "Boston River", "Plaza Colonia", "Progreso", "Cerro Largo", "Deportivo Maldonado", "Juventud de Las Piedras", "Racing de Montevideo", "Fénix", "Miramar Misiones"].map((n, i) => [n, "URU", 54 - Math.floor(i / 2)]) as [string, string, number][]),
  ...(["Mallorca", "Osasuna", "Alavés", "Elche", "Levante", "Real Oviedo"].map((n, i) => [n, "ESP", 70 - i]) as [string, string, number][]),
  ...(["Bournemouth", "Brentford", "Wolverhampton", "Leeds United", "Sunderland", "Burnley"].map((n, i) => [n, "ENG", 76 - i]) as [string, string, number][]),
  ...(["Cagliari", "Sassuolo", "Parma", "Lecce", "Hellas Verona", "Cremonese", "Pisa"].map((n, i) => [n, "ITA", 69 - Math.floor(i / 2)]) as [string, string, number][]),
  ...(["Freiburg", "Hoffenheim", "Union Berlin", "Borussia Mönchengladbach", "Augsburg", "Hamburgo", "Colonia", "Heidenheim", "St. Pauli"].map((n, i) => [n, "GER", 75 - Math.floor(i * 0.9)]) as [string, string, number][]),
  ...(["Strasbourg", "Toulouse", "Brest", "Nantes", "Paris FC", "Auxerre", "Angers", "Le Havre", "Lorient", "Metz"].map((n, i) => [n, "FRA", 74 - Math.floor(i * 0.9)]) as [string, string, number][]),
  ...(["Famalicão", "Santa Clara", "Gil Vicente", "Estoril", "Moreirense", "Casa Pia", "Arouca", "Estrela Amadora", "Tondela", "AVS", "Alverca", "Boavista"].map((n, i) => [n, "POR", 66 - Math.floor(i / 2)]) as [string, string, number][]),
  ...(["Go Ahead Eagles", "Heerenveen", "NEC", "Sparta Rotterdam", "Groningen", "Fortuna Sittard", "PEC Zwolle", "Heracles", "NAC Breda", "Excelsior", "Telstar", "Volendam"].map((n, i) => [n, "NED", 68 - Math.floor(i / 2)]) as [string, string, number][]),
  ...(["Pachuca", "Pumas", "Tijuana", "Atlas", "Santos Laguna", "Necaxa", "Juárez", "San Luis", "Puebla", "Querétaro", "Mazatlán"].map((n, i) => [n, "MEX", 66 - Math.floor(i / 2)]) as [string, string, number][]),
  ...(["Seattle Sounders", "Philadelphia Union", "Cincinnati", "Orlando City", "New York City FC", "Nashville", "Charlotte", "New York Red Bulls", "Chicago Fire", "Toronto", "CF Montréal"].map((n, i) => [n, "USA", 66 - Math.floor(i / 2)]) as [string, string, number][]),
  ...(["Al-Qadsiah", "Al-Taawoun", "Neom", "Al-Fateh", "Al-Khaleej", "Al-Fayha", "Damac", "Al-Riyadh", "Al-Kholood", "Al-Okhdood", "Al-Hazem", "Al-Najma"].map((n, i) => [n, "KSA", 70 - Math.floor(i * 1.1)]) as [string, string, number][]),
];

/** Clubes que solo aparecen como rivales en copas continentales. */
const INTL: [string, string, number][] = [
  ...(["Independiente del Valle", "LDU Quito", "Atlético Nacional", "Olimpia", "Cerro Porteño", "Libertad", "Millonarios", "Junior", "Colo-Colo", "Universidad de Chile", "Universidad Católica", "Barcelona SC", "Bolívar", "The Strongest", "Universitario", "Alianza Lima", "Sporting Cristal"].map((n, i) => [n, "INT-SA", 66 - Math.floor(i / 2)]) as [string, string, number][]),
  ...(["Galatasaray", "Fenerbahçe", "Club Brugge", "Celtic", "Olympiacos", "Rangers", "Shakhtar Donetsk", "Slavia Praga", "Salzburg", "Copenhague", "Dinamo Zagreb", "Crvena Zvezda", "Young Boys", "Sparta Praga"].map((n, i) => [n, "INT-EU", 76 - Math.floor(i / 1.6)]) as [string, string, number][]),
  ...(["Saprissa", "Alajuelense", "Herediano", "Olimpia (HON)", "Real Salt Lake"].map((n, i) => [n, "INT-NA", 58 - i]) as [string, string, number][]),
  ...(["Al Sadd", "Al Ain", "Urawa Reds", "Yokohama F. Marinos", "Ulsan HD", "Shanghai Port", "Al-Duhail", "Shabab Al-Ahli", "Johor Darul Ta'zim", "Buriram United"].map((n, i) => [n, "INT-AS", 67 - Math.floor(i / 2)]) as [string, string, number][]),
];
const INTL_CONT: Record<string, Continent> = { "INT-SA": "CONMEBOL", "INT-EU": "UEFA", "INT-NA": "CONCACAF", "INT-AS": "AFC" };

/** Clásicos: partidos con más presión y más premio. */
const DERBIES: [string, string][] = [
  ["Boca Juniors", "River Plate"], ["Racing Club", "Independiente"], ["Rosario Central", "Newell's Old Boys"], ["Estudiantes", "Gimnasia y Esgrima LP"],
  ["San Lorenzo", "Huracán"], ["Talleres", "Belgrano"], ["Colón", "Unión"], ["Lanús", "Banfield"], ["Vélez Sarsfield", "Ferro Carril Oeste"],
  ["Peñarol", "Nacional"], ["Flamengo", "Fluminense"], ["Corinthians", "Palmeiras"], ["Grêmio", "Internacional"], ["Atlético Mineiro", "Cruzeiro"],
  ["Real Madrid", "Barcelona"], ["Real Madrid", "Atlético de Madrid"], ["Sevilla", "Real Betis"], ["Athletic Club", "Real Sociedad"],
  ["Manchester United", "Manchester City"], ["Manchester United", "Liverpool"], ["Liverpool", "Everton"], ["Arsenal", "Tottenham"],
  ["Inter", "Milan"], ["Roma", "Lazio"], ["Juventus", "Torino"], ["Bayern Múnich", "Borussia Dortmund"], ["Paris Saint-Germain", "Olympique de Marsella"],
  ["Benfica", "Sporting CP"], ["Benfica", "Porto"], ["Ajax", "Feyenoord"], ["Club América", "Chivas"], ["Tigres", "Monterrey"],
  ["Al Hilal", "Al Nassr"], ["LA Galaxy", "LAFC"],
];
export const isDerby = (a: string, b: string) => DERBIES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
export const derbyRival = (club: string) => DERBIES.find(([x, y]) => x === club || y === club)?.find((c) => c !== club);

export interface WorldClub {
  name: string;
  league: string;
  strength: number;
}
export const CLUBS_W: WorldClub[] = [...C, ...FILL].map(([name, league, strength]) => ({ name, league, strength }));
export const INTL_CLUBS: (WorldClub & { continent: Continent })[] = INTL.map(([name, league, strength]) => ({ name, league, strength, continent: INTL_CONT[league] }));
/** Clubes que se pueden fichar (excluye relleno de ascenso de otras zonas). */
export const SIGNABLE = CLUBS_W;
const BY_NAME = new Map<string, WorldClub>([...CLUBS_W, ...INTL_CLUBS].map((c) => [c.name, c]));
export const clubInfo = (name: string): WorldClub => BY_NAME.get(name) ?? { name, league: "ARG1", strength: 60 };
export const clubsOf = (league: string) => CLUBS_W.filter((c) => c.league === league);
export const leagueOf = (club: string, override?: Record<string, string>) => LEAGUES[override?.[club] ?? clubInfo(club).league] ?? LEAGUES.ARG1;
/** Clubes de una liga teniendo en cuenta ascensos/descensos de la carrera. */
export const clubsInLeague = (league: string, override: Record<string, string>) =>
  CLUBS_W.filter((c) => (override[c.name] ?? c.league) === league);
/** Rivales posibles en copas continentales (de otros países del mismo continente). */
export const continentalPool = (cont: Continent, country: string) => [
  ...CLUBS_W.filter((c) => LEAGUES[c.league].continent === cont && LEAGUES[c.league].country !== country),
  ...INTL_CLUBS.filter((c) => c.continent === cont),
];

/** Supercopas nacionales (campeón de liga vs campeón de copa, al comienzo de la temporada). */
export const SUPERCUPS: Record<string, string> = {
  ARG: "Supercopa Argentina", BRA: "Supercopa do Brasil", ESP: "Supercopa de España", ENG: "Community Shield", ITA: "Supercoppa Italiana",
  GER: "Supercopa de Alemania", FRA: "Trophée des Champions", POR: "Supertaça", NED: "Johan Cruijff Schaal", KSA: "Supercopa de Arabia",
};
/** Recopa del continente (campeón de la copa principal vs. campeón de la secundaria). */
export const RECOPA: Partial<Record<Continent, { name: string; legs: boolean }>> = {
  CONMEBOL: { name: "Recopa Sudamericana", legs: true },
  UEFA: { name: "Supercopa de Europa", legs: false },
};
/** Los mejores clubes del mundo (para la Intercontinental y el Mundial de Clubes). */
export const worldElite = (exclude: string[]) =>
  [...CLUBS_W, ...INTL_CLUBS].filter((c) => !exclude.includes(c.name) && c.strength >= 66).sort((a, b) => b.strength - a.strength);

/** Selecciones: nombre del equipo (con estilo en clubs.ts) y fuerza. */
export const NATIONS: Record<string, { team: string; strength: number; name: string; flag: string; confed: Continent | "CAF" }> = {
  ARG: { team: "Selección Argentina", strength: 88, name: "Argentina", flag: "🇦🇷", confed: "CONMEBOL" },
  BRA: { team: "Selección de Brasil", strength: 86, name: "Brasil", flag: "🇧🇷", confed: "CONMEBOL" },
  URU: { team: "Selección de Uruguay", strength: 81, name: "Uruguay", flag: "🇺🇾", confed: "CONMEBOL" },
  COL: { team: "Selección de Colombia", strength: 81, name: "Colombia", flag: "🇨🇴", confed: "CONMEBOL" },
  ECU: { team: "Selección de Ecuador", strength: 77, name: "Ecuador", flag: "🇪🇨", confed: "CONMEBOL" },
  PAR: { team: "Selección de Paraguay", strength: 75, name: "Paraguay", flag: "🇵🇾", confed: "CONMEBOL" },
  CHI: { team: "Selección de Chile", strength: 72, name: "Chile", flag: "🇨🇱", confed: "CONMEBOL" },
  PER: { team: "Selección de Perú", strength: 72, name: "Perú", flag: "🇵🇪", confed: "CONMEBOL" },
  VEN: { team: "Selección de Venezuela", strength: 71, name: "Venezuela", flag: "🇻🇪", confed: "CONMEBOL" },
  BOL: { team: "Selección de Bolivia", strength: 66, name: "Bolivia", flag: "🇧🇴", confed: "CONMEBOL" },
  MEX: { team: "Selección de México", strength: 76, name: "México", flag: "🇲🇽", confed: "CONCACAF" },
  USA: { team: "Selección de EE.UU.", strength: 76, name: "Estados Unidos", flag: "🇺🇸", confed: "CONCACAF" },
  CAN: { team: "Selección de Canadá", strength: 73, name: "Canadá", flag: "🇨🇦", confed: "CONCACAF" },
  ESP: { team: "Selección de España", strength: 88, name: "España", flag: "🇪🇸", confed: "UEFA" },
  FRA: { team: "Selección de Francia", strength: 88, name: "Francia", flag: "🇫🇷", confed: "UEFA" },
  ENG: { team: "Selección de Inglaterra", strength: 86, name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", confed: "UEFA" },
  POR: { team: "Selección de Portugal", strength: 85, name: "Portugal", flag: "🇵🇹", confed: "UEFA" },
  NED: { team: "Selección de Países Bajos", strength: 84, name: "Países Bajos", flag: "🇳🇱", confed: "UEFA" },
  GER: { team: "Selección de Alemania", strength: 84, name: "Alemania", flag: "🇩🇪", confed: "UEFA" },
  ITA: { team: "Selección de Italia", strength: 82, name: "Italia", flag: "🇮🇹", confed: "UEFA" },
  BEL: { team: "Selección de Bélgica", strength: 82, name: "Bélgica", flag: "🇧🇪", confed: "UEFA" },
  CRO: { team: "Selección de Croacia", strength: 80, name: "Croacia", flag: "🇭🇷", confed: "UEFA" },
  NOR: { team: "Selección de Noruega", strength: 78, name: "Noruega", flag: "🇳🇴", confed: "UEFA" },
  MAR: { team: "Selección de Marruecos", strength: 80, name: "Marruecos", flag: "🇲🇦", confed: "CAF" },
  SEN: { team: "Selección de Senegal", strength: 78, name: "Senegal", flag: "🇸🇳", confed: "CAF" },
  JPN: { team: "Selección de Japón", strength: 78, name: "Japón", flag: "🇯🇵", confed: "AFC" },
  KOR: { team: "Selección de Corea del Sur", strength: 76, name: "Corea del Sur", flag: "🇰🇷", confed: "AFC" },
};

/** Países que se pueden elegir al crear el jugador. */
export const CAREER_COUNTRIES = ["ARG", "URU", "BRA", "COL", "CHI", "PAR", "ECU", "PER", "BOL", "VEN", "MEX", "USA", "ESP", "ITA", "FRA", "POR", "ENG", "GER", "NED", "JPN"]
  .map((code) => ({ code, name: NATIONS[code].name, flag: NATIONS[code].flag }));

/** Torneo de selecciones que se juega al final de la temporada del año `year` (si corresponde). */
export function nationalTournament(nat: string, year: number): { name: string; rounds: string[] } | null {
  const conf = NATIONS[nat]?.confed;
  if (year % 4 === 2) return { name: `Mundial ${year}`, rounds: ["Fase de grupos · Fecha 1", "Fase de grupos · Fecha 2", "Fase de grupos · Fecha 3", "Octavos de final", "Cuartos de final", "Semifinal", "Final"] };
  if (year % 4 === 0 && (conf === "CONMEBOL" || nat === "MEX" || nat === "USA" || nat === "CAN"))
    return { name: `Copa América ${year}`, rounds: ["Fase de grupos · Fecha 1", "Fase de grupos · Fecha 2", "Fase de grupos · Fecha 3", "Cuartos de final", "Semifinal", "Final"] };
  if (year % 4 === 0 && conf === "UEFA")
    return { name: `Eurocopa ${year}`, rounds: ["Fase de grupos · Fecha 1", "Fase de grupos · Fecha 2", "Fase de grupos · Fecha 3", "Octavos de final", "Cuartos de final", "Semifinal", "Final"] };
  return null;
}

export function nationalRival(nat: string, tournament: string, used: string[], rand: () => number): string {
  const conf = NATIONS[nat]?.confed;
  const pool = Object.entries(NATIONS)
    .filter(([code, n]) => code !== nat && !used.includes(n.team))
    .filter(([code, n]) => tournament.startsWith("Mundial") || n.confed === conf || (tournament.startsWith("Copa América") && ["MEX", "USA", "CAN"].includes(code)))
    .map(([, n]) => n.team);
  const list = pool.length ? pool : Object.values(NATIONS).map((n) => n.team).filter((t) => t !== NATIONS[nat]?.team);
  return list[Math.floor(rand() * list.length)];
}

export const strengthOf = (team: string): number => {
  const n = Object.values(NATIONS).find((x) => x.team === team);
  return n ? n.strength : clubInfo(team).strength;
};

/** Clubes de pruebas al crear la carrera: la reputación de los retos abre mejores puertas. */
export function startingOffers(reputation: number, nat: string, rand: () => number): string[] {
  let low: WorldClub[], mid: WorldClub[], big: WorldClub[];
  const home = Object.values(LEAGUES).find((l) => l.country === nat && l.id !== "ARG2" && l.id !== "ARG1");
  if (home) {
    // Debuta en la liga de su país: tercio inferior, medio y superior por fuerza.
    const list = clubsOf(home.id).sort((a, b) => a.strength - b.strength);
    const k = Math.max(1, Math.floor(list.length / 3));
    [low, mid, big] = [list.slice(0, k), list.slice(k, 2 * k), list.slice(2 * k)];
  } else {
    // Argentina y países sin liga en el juego: ascenso argentino y Liga Profesional.
    low = clubsOf("ARG2");
    mid = clubsOf("ARG1").filter((c) => c.strength < 64);
    big = clubsOf("ARG1").filter((c) => c.strength >= 64);
  }
  const pools = reputation >= 300 ? [low, mid, big] : reputation >= 80 ? [low, mid, mid] : [low, low, mid];
  const out = new Set<string>();
  for (const pool of pools) {
    const list = pool.filter((c) => !out.has(c.name));
    if (list.length) out.add(list[Math.floor(rand() * list.length)].name);
  }
  return [...out];
}

/** Nombre de la liga de un club (si está en el mundo de la carrera). */
export const BY_NAME_LEAGUE = (name: string): string | undefined => {
  const c = BY_NAME.get(name);
  return c ? LEAGUES[c.league]?.name ?? undefined : undefined;
};
