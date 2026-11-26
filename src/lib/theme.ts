/**
 * Temas: la página toma los colores del club o la selección que elige cada usuario.
 * El fondo se tiñe con el tono del club y el acento pasa a ser su color fuerte.
 * Verde/amarillo de los juegos (acierto/cerca) NO cambian: son información, no decoración.
 */
import { CLUBS } from "./clubs";
import { read, write } from "./storage";

export type Tokens = Record<string, string>;

/** "Noche de estadio": azul noche + naranja bengala. */
export const DEFAULT_THEME = "default";

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
}
const hsl = (h: number, s: number, l: number) => `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;

function base(h: number, sat: number): Tokens {
  // sat: cuánto se tiñe el fondo (0 = grafito neutro)
  return {
    "--bg": hsl(h, sat, 6.5),
    "--bg-2": hsl(h, sat * 0.9, 9.5),
    "--surface": hsl(h, sat * 0.8, 13),
    "--surface-2": hsl(h, sat * 0.75, 17.5),
    "--line": hsl(h, sat * 0.6, 25),
    "--chalk": hsl(h, Math.min(sat, 20), 96),
    "--muted": hsl(h, Math.min(sat * 0.6, 18), 70),
    "--miss": hsl(h, sat * 0.5, 21),
    "--glow": hsl(h, Math.min(sat + 10, 60), 18),
    "--topbar": hsl(h, sat, 4.5),
    "--header": `hsl(${Math.round(h)} ${Math.round(sat)}% 6.5% / 0.88)`,
  };
}

export function defaultTokens(): Tokens {
  return { ...base(228, 38), "--accent": "#ff7a1a", "--accent-ink": "#1d0b00", "--accent-2": "#ffc23d" };
}

/** Elige el color "fuerte" del club y lo hace legible sobre fondo oscuro. */
export function clubTokens(colors: string[]): Tokens {
  const hs = colors.filter(Boolean).map(hexToHsl);
  const isColor = (c: [number, number, number]) => c[1] >= 15 && c[2] > 8 && c[2] < 92;
  // Fondo: el primer color "de verdad" del club (Boca → azul, River → rojo).
  const primary = hs.find(isColor);
  // Acento: el más vivo y legible (Boca → oro).
  const vivid = hs.filter(isColor).sort((a, b) => b[1] * (1 - Math.abs(b[2] - 55) / 70) - a[1] * (1 - Math.abs(a[2] - 55) / 70));
  const neutral = !primary; // club blanco y negro
  const t = base(neutral ? 220 : primary![0], neutral ? 6 : 36);
  let [ah, as, al] = neutral ? [0, 0, 94] : vivid[0];
  if (!neutral) {
    al = Math.max(Math.min(al, 68), 52); // ni muy oscuro ni lavado
    as = Math.max(as, 55);
  }
  const accent = hsl(ah, as, al);
  const second = vivid.find((c) => c !== vivid[0]);
  return {
    ...t,
    "--accent": accent,
    "--accent-ink": al > 60 || neutral ? "#111111" : "#ffffff",
    "--accent-2": second ? hsl(second[0], Math.max(second[1], 50), Math.max(Math.min(second[2], 70), 55)) : accent,
  };
}

export function tokensFor(theme: string): Tokens {
  if (theme === DEFAULT_THEME || !CLUBS[theme]) return defaultTokens();
  return clubTokens(CLUBS[theme].colors as string[]);
}

export function applyTokens(t: Tokens) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(t)) root.style.setProperty(k, v);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t["--bg"]);
}

export function currentTheme(): string {
  return read<string>("theme", DEFAULT_THEME);
}

export function setTheme(theme: string) {
  const t = tokensFor(theme);
  write("theme", theme);
  write("themeTokens", t); // lo lee el script de arranque para pintar sin parpadeo
  applyTokens(t);
}

/** Script inline para <head>: aplica el tema guardado antes del primer pintado. */
export const THEME_BOOT = `try{var t=JSON.parse(localStorage.getItem("primera:v1:themeTokens")||"null");if(t){var r=document.documentElement;for(var k in t)r.style.setProperty(k,t[k]);}}catch(e){}`;
