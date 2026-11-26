/**
 * Identidad visual PROPIA de cada equipo: colores, patrón de camiseta e iniciales.
 * No son escudos oficiales: se dibujan con <Crest/> y <Kit/> a partir de estos datos.
 */
export type Pattern = "plain" | "stripes" | "hoops" | "sash" | "band" | "halves" | "chevron" | "centerStripe" | "sleeves";

export interface ClubStyle {
  /** Nombre corto para celdas angostas (≤ 9 caracteres, sin cortar palabras). */
  short: string;
  /** Iniciales para el escudo (≤ 4). */
  abbr: string;
  /** [color base, color del patrón, color de texto/detalle] */
  colors: [string, string, string?];
  pattern: Pattern;
  /** Forma del escudo. */
  shape?: "shield" | "round" | "badge";
}

export const CLUBS: Record<string, ClubStyle> = {
  // Argentina
  "Boca Juniors": { short: "Boca", abbr: "CABJ", colors: ["#123E7C", "#F4B728"], pattern: "band" },
  "River Plate": { short: "River", abbr: "CARP", colors: ["#FFFFFF", "#D62030", "#111111"], pattern: "sash" },
  "Racing Club": { short: "Racing", abbr: "RC", colors: ["#FFFFFF", "#6CB4E4", "#14335C"], pattern: "stripes", shape: "round" },
  "Independiente": { short: "Indep.", abbr: "CAI", colors: ["#D11F2F", "#D11F2F", "#FFFFFF"], pattern: "plain" },
  "Rosario Central": { short: "Central", abbr: "RC", colors: ["#1D3E8F", "#F7D117"], pattern: "stripes" },
  "Estudiantes": { short: "Pincha", abbr: "EDLP", colors: ["#FFFFFF", "#D21E2B", "#111111"], pattern: "stripes" },
  "Lanús": { short: "Lanús", abbr: "CAL", colors: ["#7A1F2B", "#7A1F2B", "#FFFFFF"], pattern: "plain", shape: "round" },
  "Vélez Sarsfield": { short: "Vélez", abbr: "CAVS", colors: ["#FFFFFF", "#1C3F94", "#1C3F94"], pattern: "chevron" },
  "Independiente Rivadavia": { short: "Indep. R.", abbr: "CSIR", colors: ["#0E3B8C", "#FFFFFF"], pattern: "plain" },
  // Europa
  "Atlético de Madrid": { short: "Atlético", abbr: "ATM", colors: ["#FFFFFF", "#CB3524", "#1B2D5B"], pattern: "stripes" },
  "Real Madrid": { short: "R. Madrid", abbr: "RM", colors: ["#FFFFFF", "#E2B33C", "#3D195B"], pattern: "plain", shape: "round" },
  "Barcelona": { short: "Barça", abbr: "FCB", colors: ["#A50044", "#004D98", "#EDBB00"], pattern: "stripes" },
  "Real Betis": { short: "Betis", abbr: "RBB", colors: ["#FFFFFF", "#0BB363", "#0A5C35"], pattern: "stripes" },
  "Inter": { short: "Inter", abbr: "IM", colors: ["#0A2F8C", "#111111", "#FFFFFF"], pattern: "stripes", shape: "round" },
  "Roma": { short: "Roma", abbr: "ASR", colors: ["#8E1F2F", "#F0BC42", "#F0BC42"], pattern: "plain", shape: "badge" },
  "Como": { short: "Como", abbr: "COM", colors: ["#1B3D6D", "#FFFFFF"], pattern: "plain" },
  "Chelsea": { short: "Chelsea", abbr: "CFC", colors: ["#034694", "#034694", "#FFFFFF"], pattern: "plain", shape: "round" },
  "Liverpool": { short: "Liverpool", abbr: "LFC", colors: ["#C8102E", "#C8102E", "#F6EB61"], pattern: "plain" },
  "Arsenal": { short: "Arsenal", abbr: "AFC", colors: ["#EF0107", "#FFFFFF", "#FFFFFF"], pattern: "sleeves" },
  "Aston Villa": { short: "Villa", abbr: "AVFC", colors: ["#670E36", "#95BFE5", "#FEE505"], pattern: "sleeves" },
  "Tottenham": { short: "Spurs", abbr: "THFC", colors: ["#FFFFFF", "#132257", "#132257"], pattern: "plain" },
  "Manchester United": { short: "Man. Utd", abbr: "MUFC", colors: ["#DA291C", "#111111", "#FBE122"], pattern: "plain" },
  "Manchester City": { short: "Man. City", abbr: "MCFC", colors: ["#6CABDD", "#1C2C5B", "#FFFFFF"], pattern: "plain", shape: "round" },
  "Bayern Múnich": { short: "Bayern", abbr: "FCB", colors: ["#DC052D", "#0066B2", "#FFFFFF"], pattern: "plain", shape: "round" },
  "Bayer Leverkusen": { short: "Leverkus.", abbr: "B04", colors: ["#E32221", "#111111", "#FFFFFF"], pattern: "halves" },
  "Paris Saint-Germain": { short: "PSG", abbr: "PSG", colors: ["#004170", "#DA291C", "#FFFFFF"], pattern: "centerStripe", shape: "round" },
  "Olympique de Marsella": { short: "Marsella", abbr: "OM", colors: ["#FFFFFF", "#2FAEE0", "#2FAEE0"], pattern: "plain" },
  "Benfica": { short: "Benfica", abbr: "SLB", colors: ["#E2001A", "#FFFFFF", "#FFFFFF"], pattern: "plain", shape: "round" },
  // América y Asia
  "Inter Miami": { short: "Miami", abbr: "IMCF", colors: ["#F7B5CD", "#231F20", "#231F20"], pattern: "plain", shape: "round" },
  "Atlanta United": { short: "Atlanta", abbr: "ATL", colors: ["#80000A", "#221F1F", "#A19060"], pattern: "stripes", shape: "round" },
  "Tigres": { short: "Tigres", abbr: "UANL", colors: ["#FDB913", "#0B4EA2", "#0B4EA2"], pattern: "plain" },
  "León": { short: "León", abbr: "CL", colors: ["#006A4E", "#FFFFFF", "#F2C100"], pattern: "plain" },
  "Santos": { short: "Santos", abbr: "SFC", colors: ["#FFFFFF", "#111111", "#111111"], pattern: "plain" },
  "Palmeiras": { short: "Palmeiras", abbr: "SEP", colors: ["#006437", "#FFFFFF", "#FFFFFF"], pattern: "plain", shape: "round" },
  "Flamengo": { short: "Flamengo", abbr: "CRF", colors: ["#C3281E", "#111111", "#FFFFFF"], pattern: "hoops" },
  "Atlético Mineiro": { short: "Galo", abbr: "CAM", colors: ["#FFFFFF", "#111111", "#111111"], pattern: "stripes" },
  "Colo-Colo": { short: "Colo-Colo", abbr: "CC", colors: ["#FFFFFF", "#111111", "#111111"], pattern: "plain" },
  "Al Hilal": { short: "Al Hilal", abbr: "HIL", colors: ["#005BAC", "#FFFFFF", "#FFFFFF"], pattern: "plain", shape: "round" },
  "Al Nassr": { short: "Al Nassr", abbr: "NSR", colors: ["#FCD116", "#1B3F8F", "#1B3F8F"], pattern: "plain", shape: "round" },
  // Selecciones
  "Selección Argentina": { short: "Argentina", abbr: "ARG", colors: ["#FFFFFF", "#75AADB", "#1F2A44"], pattern: "stripes", shape: "badge" },
  "Selección de Uruguay": { short: "Uruguay", abbr: "URU", colors: ["#5CBFEB", "#5CBFEB", "#111111"], pattern: "plain", shape: "badge" },
  "Selección de Brasil": { short: "Brasil", abbr: "BRA", colors: ["#FEDF00", "#009C3B", "#002776"], pattern: "plain", shape: "badge" },
  "Selección de Colombia": { short: "Colombia", abbr: "COL", colors: ["#FCD116", "#003893", "#CE1126"], pattern: "plain", shape: "badge" },
  "Selección de Ecuador": { short: "Ecuador", abbr: "ECU", colors: ["#FFD100", "#034EA2", "#034EA2"], pattern: "plain", shape: "badge" },
  "Selección de Paraguay": { short: "Paraguay", abbr: "PAR", colors: ["#FFFFFF", "#D52B1E", "#0038A8"], pattern: "stripes", shape: "badge" },
  "Selección de EE.UU.": { short: "EE.UU.", abbr: "USA", colors: ["#FFFFFF", "#0A3161", "#B31942"], pattern: "plain", shape: "badge" },
  "Selección de Inglaterra": { short: "Inglaterra", abbr: "ENG", colors: ["#FFFFFF", "#CE1124", "#1D2A5D"], pattern: "plain", shape: "badge" },
  "Selección de Alemania": { short: "Alemania", abbr: "GER", colors: ["#FFFFFF", "#111111", "#111111"], pattern: "plain", shape: "badge" },
  "Selección de Francia": { short: "Francia", abbr: "FRA", colors: ["#21304D", "#ED2939", "#FFFFFF"], pattern: "plain", shape: "badge" },
};

const FALLBACK: ClubStyle = { short: "", abbr: "?", colors: ["#2a4a3a", "#9fb8a9"], pattern: "plain" };

export function clubStyle(name: string): ClubStyle {
  const s = CLUBS[name];
  if (s) return s;
  const abbr = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  return { ...FALLBACK, short: name, abbr };
}
