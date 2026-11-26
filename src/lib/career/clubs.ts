/** Escalones de clubes para el Modo Carrera (1 = ascenso … 5 = élite mundial). */
export const TIERS: Record<number, { label: string; clubs: string[]; salary: number }> = {
  1: { label: "Primera Nacional", salary: 2, clubs: ["Chacarita Juniors", "Quilmes", "Ferro Carril Oeste", "Nueva Chicago", "Colón", "San Martín de Tucumán"] },
  2: { label: "Liga Profesional", salary: 8, clubs: ["Platense", "Tigre", "Banfield", "Sarmiento", "Barracas Central", "Deportivo Riestra", "Central Córdoba", "Godoy Cruz", "Instituto", "Unión", "Lanús", "Defensa y Justicia", "Huracán", "Gimnasia y Esgrima LP", "Belgrano", "Talleres", "Argentinos Juniors", "Newell's Old Boys", "Rosario Central", "Estudiantes", "Vélez Sarsfield", "Independiente Rivadavia", "Aldosivi", "Atlético Tucumán"] },
  3: { label: "Grande de Sudamérica", salary: 25, clubs: ["Boca Juniors", "River Plate", "Racing Club", "Independiente", "San Lorenzo", "Flamengo", "Palmeiras", "Peñarol", "Nacional"] },
  4: { label: "Europa", salary: 80, clubs: ["Benfica", "Porto", "Sporting CP", "Villarreal", "Sevilla", "Real Betis", "Atalanta", "Roma", "Napoli", "Olympique de Marsella", "Ajax", "Bayer Leverkusen", "Borussia Dortmund", "Aston Villa", "Tottenham"] },
  5: { label: "Élite mundial", salary: 250, clubs: ["Real Madrid", "Barcelona", "Manchester City", "Liverpool", "Arsenal", "Chelsea", "Bayern Múnich", "Paris Saint-Germain", "Inter", "Juventus", "Atlético de Madrid", "Milan"] },
};

export const tierOf = (club: string): number => {
  for (const [t, v] of Object.entries(TIERS)) if (v.clubs.includes(club)) return Number(t);
  return 2;
};

export const NATIONAL: Record<string, string> = {
  ARG: "Selección Argentina", URU: "Selección de Uruguay", BRA: "Selección de Brasil", COL: "Selección de Colombia",
  CHI: "Selección de Chile", PAR: "Selección de Paraguay", ECU: "Selección de Ecuador", PER: "Selección de Perú",
  BOL: "Selección de Bolivia", VEN: "Selección de Venezuela", MEX: "Selección de México", ESP: "Selección de España",
  ITA: "Selección de Italia", FRA: "Selección de Francia",
};
export const CAREER_COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "ARG", name: "Argentina", flag: "🇦🇷" }, { code: "URU", name: "Uruguay", flag: "🇺🇾" }, { code: "BRA", name: "Brasil", flag: "🇧🇷" },
  { code: "COL", name: "Colombia", flag: "🇨🇴" }, { code: "CHI", name: "Chile", flag: "🇨🇱" }, { code: "PAR", name: "Paraguay", flag: "🇵🇾" },
  { code: "ECU", name: "Ecuador", flag: "🇪🇨" }, { code: "PER", name: "Perú", flag: "🇵🇪" }, { code: "BOL", name: "Bolivia", flag: "🇧🇴" },
  { code: "VEN", name: "Venezuela", flag: "🇻🇪" }, { code: "MEX", name: "México", flag: "🇲🇽" }, { code: "ESP", name: "España", flag: "🇪🇸" },
  { code: "ITA", name: "Italia", flag: "🇮🇹" }, { code: "FRA", name: "Francia", flag: "🇫🇷" },
];
