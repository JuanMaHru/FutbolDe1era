/**
 * Apellidos para Palabra Crack (sin tildes ni Ñ). La pista se muestra a partir del 4.º intento.
 * hint: país · puesto · época.
 */
export const WORDS: { word: string; name: string; hint: string }[] = [
  { word: "MESSI", name: "Lionel Messi", hint: "🇦🇷 · Delantero · actual" },
  { word: "TEVEZ", name: "Carlos Tevez", hint: "🇦🇷 · Delantero · 2000s" },
  { word: "AIMAR", name: "Pablo Aimar", hint: "🇦🇷 · Enganche · 2000s" },
  { word: "VERON", name: "Juan Sebastián Verón", hint: "🇦🇷 · Volante · 2000s" },
  { word: "SORIN", name: "Juan Pablo Sorín", hint: "🇦🇷 · Lateral · 2000s" },
  { word: "AYALA", name: "Roberto Ayala", hint: "🇦🇷 · Central · 2000s" },
  { word: "ACUNA", name: "Marcos Acuña", hint: "🇦🇷 · Lateral · actual" },
  { word: "SALAH", name: "Mohamed Salah", hint: "🇪🇬 · Extremo · actual" },
  { word: "HENRY", name: "Thierry Henry", hint: "🇫🇷 · Delantero · 2000s" },
  { word: "PIRLO", name: "Andrea Pirlo", hint: "🇮🇹 · Volante · 2000s" },
  { word: "TOTTI", name: "Francesco Totti", hint: "🇮🇹 · Delantero · 2000s" },
  { word: "PUYOL", name: "Carles Puyol", hint: "🇪🇸 · Central · 2000s" },
  { word: "KROOS", name: "Toni Kroos", hint: "🇩🇪 · Volante · 2010s" },
  { word: "NEUER", name: "Manuel Neuer", hint: "🇩🇪 · Arquero · actual" },
  { word: "KLOSE", name: "Miroslav Klose", hint: "🇩🇪 · Delantero · 2000s" },
  { word: "VIDAL", name: "Arturo Vidal", hint: "🇨🇱 · Volante · 2010s" },
  { word: "BRAVO", name: "Claudio Bravo", hint: "🇨🇱 · Arquero · 2010s" },
  { word: "BORJA", name: "Miguel Borja", hint: "🇨🇴 · Delantero · actual" },
  { word: "ARIAS", name: "Gabriel Arias", hint: "🇨🇱 · Arquero · actual" },
  { word: "CAVANI", name: "Edinson Cavani", hint: "🇺🇾 · Delantero · actual" },
  { word: "SUAREZ", name: "Luis Suárez", hint: "🇺🇾 · Delantero · actual" },
  { word: "FORLAN", name: "Diego Forlán", hint: "🇺🇾 · Delantero · 2000s" },
  { word: "RECOBA", name: "Álvaro Recoba", hint: "🇺🇾 · Enganche · 2000s" },
  { word: "DYBALA", name: "Paulo Dybala", hint: "🇦🇷 · Enganche · actual" },
  { word: "AGUERO", name: "Sergio Agüero", hint: "🇦🇷 · Delantero · 2010s" },
  { word: "CRESPO", name: "Hernán Crespo", hint: "🇦🇷 · Delantero · 2000s" },
  { word: "ORTEGA", name: "Ariel Ortega", hint: "🇦🇷 · Enganche · 90s" },
  { word: "ARMANI", name: "Franco Armani", hint: "🇦🇷 · Arquero · actual" },
  { word: "ROMERO", name: "Cristian Romero", hint: "🇦🇷 · Central · actual" },
  { word: "MOLINA", name: "Nahuel Molina", hint: "🇦🇷 · Lateral · actual" },
  { word: "KEMPES", name: "Mario Kempes", hint: "🇦🇷 · Delantero · 70s" },
  { word: "BANEGA", name: "Ever Banega", hint: "🇦🇷 · Volante · 2010s" },
  { word: "MILITO", name: "Diego Milito", hint: "🇦🇷 · Delantero · 2000s" },
  { word: "NEYMAR", name: "Neymar", hint: "🇧🇷 · Extremo · actual" },
  { word: "MBAPPE", name: "Kylian Mbappé", hint: "🇫🇷 · Delantero · actual" },
  { word: "MODRIC", name: "Luka Modrić", hint: "🇭🇷 · Volante · actual" },
  { word: "FALCAO", name: "Radamel Falcao", hint: "🇨🇴 · Delantero · 2010s" },
  { word: "ZIDANE", name: "Zinedine Zidane", hint: "🇫🇷 · Enganche · 2000s" },
  { word: "BUFFON", name: "Gianluigi Buffon", hint: "🇮🇹 · Arquero · 2000s" },
  { word: "ROONEY", name: "Wayne Rooney", hint: "🏴 · Delantero · 2010s" },
  { word: "DROGBA", name: "Didier Drogba", hint: "🇨🇮 · Delantero · 2000s" },
  { word: "BIELSA", name: "Marcelo Bielsa", hint: "🇦🇷 · DT · actual" },
  { word: "ALVAREZ", name: "Julián Álvarez", hint: "🇦🇷 · Delantero · actual" },
  { word: "PAREDES", name: "Leandro Paredes", hint: "🇦🇷 · Volante · actual" },
  { word: "PALERMO", name: "Martín Palermo", hint: "🇦🇷 · Delantero · 2000s" },
  { word: "SAVIOLA", name: "Javier Saviola", hint: "🇦🇷 · Delantero · 2000s" },
  { word: "ZANETTI", name: "Javier Zanetti", hint: "🇦🇷 · Lateral · 2000s" },
  { word: "LAVEZZI", name: "Ezequiel Lavezzi", hint: "🇦🇷 · Delantero · 2010s" },
  { word: "SIMEONE", name: "Diego Simeone", hint: "🇦🇷 · DT · actual" },
  { word: "SCALONI", name: "Lionel Scaloni", hint: "🇦🇷 · DT · actual" },
  { word: "BILARDO", name: "Carlos Bilardo", hint: "🇦🇷 · DT · 80s" },
  { word: "MENOTTI", name: "César Luis Menotti", hint: "🇦🇷 · DT · 70s" },
  { word: "BIANCHI", name: "Carlos Bianchi", hint: "🇦🇷 · DT · 2000s" },
  { word: "HAALAND", name: "Erling Haaland", hint: "🇳🇴 · Delantero · actual" },
  { word: "ROMARIO", name: "Romário", hint: "🇧🇷 · Delantero · 90s" },
  { word: "RONALDO", name: "Ronaldo / Cristiano Ronaldo", hint: "🇧🇷🇵🇹 · Delantero" },
  { word: "INIESTA", name: "Andrés Iniesta", hint: "🇪🇸 · Volante · 2010s" },
  { word: "GERRARD", name: "Steven Gerrard", hint: "🏴 · Volante · 2000s" },
  { word: "BECKHAM", name: "David Beckham", hint: "🏴 · Volante · 2000s" },
  { word: "VALVERDE", name: "Federico Valverde", hint: "🇺🇾 · Volante · actual" },
  { word: "RIQUELME", name: "Juan Román Riquelme", hint: "🇦🇷 · Enganche · 2000s" },
  { word: "MARADONA", name: "Diego Maradona", hint: "🇦🇷 · Enganche · 80s" },
  { word: "OTAMENDI", name: "Nicolás Otamendi", hint: "🇦🇷 · Central · actual" },
  { word: "GALLARDO", name: "Marcelo Gallardo", hint: "🇦🇷 · DT · actual" },
  { word: "CASILLAS", name: "Iker Casillas", hint: "🇪🇸 · Arquero · 2000s" },
  { word: "BURDISSO", name: "Nicolás Burdisso", hint: "🇦🇷 · Central · 2000s" },
];

/** Colorea un intento estilo Wordle, respetando letras repetidas. */
export function scoreWord(guess: string, target: string): ("hit" | "near" | "miss")[] {
  const res: ("hit" | "near" | "miss")[] = Array(guess.length).fill("miss");
  const left: Record<string, number> = {};
  for (let i = 0; i < target.length; i++) {
    if (guess[i] === target[i]) res[i] = "hit";
    else left[target[i]] = (left[target[i]] ?? 0) + 1;
  }
  for (let i = 0; i < guess.length; i++) {
    if (res[i] === "hit") continue;
    if (left[guess[i]]) {
      res[i] = "near";
      left[guess[i]]--;
    }
  }
  return res;
}
