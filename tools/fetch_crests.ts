/**
 * Arma src/data/crests.json con la URL del escudo de cada club, sacada de TheSportsDB (API pública).
 * Los escudos pertenecen a sus clubes: se muestran solo para identificarlos (ver /aviso-legal).
 * Uso: npm run crests   (lo corre también la GitHub Action "Actualizar escudos").
 * Solo busca los clubes que todavía no tienen escudo, salvo con --all.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { CLUBS } from "@/lib/clubs";
import { CLUBS_W, INTL_CLUBS, LEAGUES, clubInfo } from "@/lib/career/world";

const OUT = "src/data/crests.json";
const KEY = process.env.SPORTSDB_KEY || "3"; // clave pública gratuita de TheSportsDB
const ALL = process.argv.includes("--all");

const COUNTRY: Record<string, string> = { ARG: "Argentina", BRA: "Brazil", ENG: "England", ESP: "Spain", FRA: "France", GER: "Germany", ITA: "Italy", KSA: "Saudi Arabia", MEX: "Mexico", NED: "Netherlands", POR: "Portugal", URU: "Uruguay", USA: "United States" };

/** Nombre con el que lo conoce la API (y país para desempatar homónimos). */
const ALIAS: Record<string, [string, string?]> = {
  "Bayern Múnich": ["Bayern Munich"], "Olympique de Marsella": ["Marseille"], "Inter": ["Inter Milan"], "Milan": ["AC Milan"], "Roma": ["AS Roma"],
  "Spartak Moscú": ["Spartak Moscow"], "Hamburgo": ["Hamburger SV"], "Colonia": ["FC Koln"], "Copenhague": ["FC Copenhagen"], "Slavia Praga": ["Slavia Prague"],
  "Sparta Praga": ["Sparta Prague"], "Crvena Zvezda": ["Red Star Belgrade"], "Atlético de Madrid": ["Atletico Madrid"], "Deportivo La Coruña": ["Deportivo La Coruna"],
  "Celta": ["Celta Vigo"], "Gimnasia y Esgrima LP": ["Gimnasia La Plata"], "Estudiantes": ["Estudiantes"], "Club América": ["Club America"],
  "Universitario": ["Universitario", "Peru"], "Nacional": ["Nacional", "Uruguay"], "Junior": ["Junior", "Colombia"], "Chivas": ["Guadalajara"], "Pumas": ["Pumas UNAM"],
  "Tigres": ["Tigres UANL"], "León": ["Leon", "Mexico"], "Newcastle": ["Newcastle United"], "Olimpia": ["Olimpia", "Paraguay"], "Olimpia (HON)": ["Olimpia", "Honduras"],
  "Toronto": ["Toronto FC"], "Cincinnati": ["FC Cincinnati"], "Nashville": ["Nashville SC"], "Charlotte": ["Charlotte FC"], "PSV": ["PSV Eindhoven"], "AZ": ["AZ Alkmaar"],
  "NEC": ["NEC Nijmegen"], "Salzburg": ["Red Bull Salzburg"], "Basel": ["FC Basel"], "Wolverhampton": ["Wolverhampton Wanderers"], "Brighton": ["Brighton and Hove Albion"],
  "Libertad": ["Libertad", "Paraguay"], "Barcelona SC": ["Barcelona SC", "Ecuador"], "Cerro": ["Cerro", "Uruguay"], "Atlanta": ["Atlanta", "Argentina"],
  "Mitre": ["Mitre", "Argentina"], "Progreso": ["Progreso", "Uruguay"], "Fénix": ["Fenix", "Uruguay"], "Atlas": ["Atlas", "Mexico"], "Santos": ["Santos", "Brazil"],
  "Bolívar": ["Bolivar"], "The Strongest": ["The Strongest"], "LDU Quito": ["LDU Quito"], "Independiente": ["Independiente", "Argentina"], "Racing Club": ["Racing Club", "Argentina"],
  "Juventud de Las Piedras": ["Juventud", "Uruguay"], "Lyon": ["Lyon"], "Monaco": ["Monaco"], "Paris Saint-Germain": ["Paris SG"], "Sporting CP": ["Sporting CP"],
  "Talleres": ["Talleres", "Argentina"], "Unión": ["Union Santa Fe"], "Colón": ["Colon"], "Al Hilal": ["Al-Hilal"], "Al Nassr": ["Al-Nassr"], "Mainz": ["Mainz"],
  "Ulsan HD": ["Ulsan Hyundai"], "Yokohama F. Marinos": ["Yokohama F Marinos"], "Shanghai Port": ["Shanghai Port"],
};

const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function search(q: string): Promise<any[]> {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(`https://www.thesportsdb.com/api/v1/json/${KEY}/searchteams.php?t=${encodeURIComponent(q)}`);
    if (r.status === 429) { await sleep(20000); continue; }
    if (!r.ok) return [];
    const j: any = await r.json().catch(() => null);
    return (j?.teams ?? []).filter((t: any) => t.strSport === "Soccer");
  }
  return [];
}

async function main() {
  const out: Record<string, string> = JSON.parse(readFileSync(OUT, "utf8") || "{}");
  const names = [...new Set([...Object.keys(CLUBS), ...CLUBS_W.map((c) => c.name), ...INTL_CLUBS.map((c) => c.name)])]
    .filter((n) => !/^Selección/.test(n) && (ALL || !out[n]));
  const miss: string[] = [];
  for (const name of names) {
    const [alias, hint] = ALIAS[name] ?? [];
    const lg = LEAGUES[clubInfo(name).league];
    const country = hint ?? (lg && COUNTRY[lg.country]);
    let teams: any[] = [];
    for (const q of [...new Set([alias, name, strip(name)].filter(Boolean) as string[])]) {
      teams = await search(q);
      await sleep(2200); // la clave gratuita permite ~30 consultas por minuto
      if (teams.length) break;
    }
    const pick = (country && teams.find((t) => t.strCountry === country)) || (teams.length === 1 || !country ? teams[0] : undefined);
    const badge = pick?.strBadge || pick?.strTeamBadge;
    if (badge) { out[name] = badge; console.log("✓", name, "→", pick.strTeam); }
    else { miss.push(name); console.log("✗", name); }
  }
  writeFileSync(OUT, JSON.stringify(Object.fromEntries(Object.entries(out).sort()), null, 1) + "\n");
  console.log(`\n${Object.keys(out).length} escudos. Sin encontrar (${miss.length}): ${miss.join(", ")}`);
}
main();
