export type Confederation = "CONMEBOL" | "UEFA" | "CONCACAF" | "CAF" | "AFC";

export const COUNTRIES: Record<string, { name: string; flag: string; confed: Confederation }> = {
  ARG: { name: "Argentina", flag: "🇦🇷", confed: "CONMEBOL" },
  URU: { name: "Uruguay", flag: "🇺🇾", confed: "CONMEBOL" },
  BRA: { name: "Brasil", flag: "🇧🇷", confed: "CONMEBOL" },
  COL: { name: "Colombia", flag: "🇨🇴", confed: "CONMEBOL" },
  CHI: { name: "Chile", flag: "🇨🇱", confed: "CONMEBOL" },
  PAR: { name: "Paraguay", flag: "🇵🇾", confed: "CONMEBOL" },
  ECU: { name: "Ecuador", flag: "🇪🇨", confed: "CONMEBOL" },
  FRA: { name: "Francia", flag: "🇫🇷", confed: "UEFA" },
  ESP: { name: "España", flag: "🇪🇸", confed: "UEFA" },
  ITA: { name: "Italia", flag: "🇮🇹", confed: "UEFA" },
  GER: { name: "Alemania", flag: "🇩🇪", confed: "UEFA" },
  POR: { name: "Portugal", flag: "🇵🇹", confed: "UEFA" },
  NED: { name: "Países Bajos", flag: "🇳🇱", confed: "UEFA" },
  BEL: { name: "Bélgica", flag: "🇧🇪", confed: "UEFA" },
  NOR: { name: "Noruega", flag: "🇳🇴", confed: "UEFA" },
  EGY: { name: "Egipto", flag: "🇪🇬", confed: "CAF" },
};

export type Region = "Sudamérica" | "Europa" | "Norteamérica" | "Asia" | "Selecciones";

export const LEAGUES: Record<string, { region: Region; short: string }> = {
  "Liga Profesional": { region: "Sudamérica", short: "LPF" },
  "Brasileirão": { region: "Sudamérica", short: "Brasileirão" },
  "Primera Chile": { region: "Sudamérica", short: "Chile" },
  "Premier League": { region: "Europa", short: "Premier" },
  "LaLiga": { region: "Europa", short: "LaLiga" },
  "Serie A": { region: "Europa", short: "Serie A" },
  "Bundesliga": { region: "Europa", short: "Bundesliga" },
  "Ligue 1": { region: "Europa", short: "Ligue 1" },
  "Primeira Liga": { region: "Europa", short: "Portugal" },
  "MLS": { region: "Norteamérica", short: "MLS" },
  "Liga MX": { region: "Norteamérica", short: "Liga MX" },
  "Saudi Pro League": { region: "Asia", short: "Arabia" },
  "Selecciones": { region: "Selecciones", short: "Nacional" },
};

export type Line = "ARQ" | "DEF" | "MED" | "DEL";

export const LINE_LABEL: Record<Line, string> = { ARQ: "Arquero", DEF: "Defensa", MED: "Medio", DEL: "Ataque" };

export const POSITIONS: Record<string, { label: string; line: Line }> = {
  ARQ: { label: "Arquero", line: "ARQ" },
  DFC: { label: "Central", line: "DEF" },
  LAT: { label: "Lateral", line: "DEF" },
  MC: { label: "Volante", line: "MED" },
  MCO: { label: "Enganche", line: "MED" },
  EXT: { label: "Extremo", line: "DEL" },
  DC: { label: "Centrodelantero", line: "DEL" },
};
