"use client";
import { useId } from "react";

/** Íconos propios (SVG) para cada tipo de título o premio. Inspirados en los reales, sin copiar diseños oficiales. */
export type TrophyKind =
  | "league" | "premier" | "plate" | "cup" | "libertadores" | "champions" | "continental" | "world" | "clubwc" | "intercont" | "america" | "euro"
  | "supercup" | "promotion" | "ballon" | "boot" | "glove" | "scorer" | "mvp" | "young" | "shield";

export function trophyKind(name: string): TrophyKind {
  if (/^Balón de Oro/.test(name)) return "ballon";
  if (/^Bota de Oro/.test(name)) return "boot";
  if (/^Guante de Oro/.test(name)) return "glove";
  if (/^Goleador/.test(name)) return "scorer";
  if (/^Mejor jugador/.test(name)) return "mvp";
  if (/^Golden Boy/.test(name)) return "young";
  if (/^Mundial de Clubes/.test(name)) return "clubwc";
  if (/^Copa Intercontinental/.test(name)) return "intercont";
  if (/^Mundial/.test(name)) return "world";
  if (/^Copa América/.test(name)) return "america";
  if (/^Eurocopa/.test(name)) return "euro";
  if (/^Champions League|^AFC Champions/.test(name)) return "champions";
  if (/^Copa Libertadores/.test(name)) return "libertadores";
  if (/^(Recopa|Supercopa|Supercoppa|Community Shield|Trophée|Supertaça|Johan Cruijff)/.test(name)) return "supercup";
  if (/Europa League|Sudamericana|Concacaf/.test(name)) return "continental";
  if (/^Ascenso/.test(name)) return "promotion";
  if (/^Supporters/.test(name)) return "shield";
  if (/^Premier League/.test(name)) return "premier";
  if (/^Bundesliga/.test(name)) return "plate";
  if (/^(Liga Profesional|Torneo Apertura|Torneo Clausura|Apertura|Clausura|Primera Nacional|Premier League|LaLiga|Serie A|Bundesliga|Ligue 1|Primeira Liga|Eredivisie|Brasileirão|Liga Uruguaya|Liga MX|MLS|Saudi Pro League)/.test(name)) return "league";
  return "cup";
}

/** Colores de cinta según el país de la competencia. */
function ribbon(name: string): [string, string] {
  const r: [RegExp, [string, string]][] = [
    [/Liga Profesional|Apertura|Clausura|Primera Nacional|Copa Argentina|Supercopa Argentina/, ["#6cace4", "#ffffff"]],
    [/Premier|FA Cup|Community/, ["#3d195b", "#ffffff"]],
    [/LaLiga|Copa del Rey|Supercopa de España/, ["#c60b1e", "#ffc400"]],
    [/Serie A|Coppa|Supercoppa/, ["#008c45", "#cd212a"]],
    [/Bundesliga|DFB|Alemania/, ["#111111", "#dd0000"]],
    [/Ligue 1|Coupe de France|Trophée/, ["#0055a4", "#ef4135"]],
    [/Primeira|Taça|Supertaça/, ["#006600", "#ff0000"]],
    [/Eredivisie|KNVB|Cruijff/, ["#ff7f00", "#21468b"]],
    [/Brasileirão|Copa do Brasil|Supercopa do Brasil/, ["#009c3b", "#ffdf00"]],
    [/Uruguaya|AUF/, ["#5cbfeb", "#ffffff"]],
    [/Liga MX|Leagues Cup/, ["#006847", "#ce1126"]],
    [/MLS|US Open|Supporters/, ["#0a3161", "#b31942"]],
    [/Saudi|King's|Arabia/, ["#006c35", "#ffffff"]],
  ];
  return r.find(([re]) => re.test(name))?.[1] ?? ["#1f4fa8", "#ffffff"];
}

const GOLD = ["#5c3d02", "#a87708", "#f2c84b", "#fff3b0", "#d9a520", "#7a5404"];
const SILVER = ["#4b545d", "#8a96a3", "#d7dee5", "#ffffff", "#b9c3cc", "#5c6670"];

export function TrophyIcon({ name, size = 28 }: { name: string; size?: number }) {
  const k = trophyKind(name);
  const uid = useId().replace(/:/g, "");
  const silver = ["premier", "plate", "champions", "continental", "euro", "libertadores", "america", "cup"].includes(k) || (k === "supercup" && /Recopa|Europa/.test(name));
  const pal = silver ? SILVER : GOLD;
  const GC = `url(#c${uid})`, M = `url(#m${uid})`, MV = `url(#v${uid})`, SH = `url(#s${uid})`, W = `url(#w${uid})`, MB = `url(#b${uid})`;
  const [r1, r2] = ribbon(name);

  const Shadow = <ellipse cx="50" cy="106" rx="30" ry="3.5" fill="rgba(0,0,0,0.35)" />;
  const Base = ({ tall = false, marble = false }: { tall?: boolean; marble?: boolean }) => (
    <g>
      <rect x="26" y={tall ? 76 : 86} width="48" height={tall ? 28 : 18} rx="2" fill={marble ? MB : W} />
      <rect x="23" y={tall ? 74 : 84} width="54" height="4" rx="1.5" fill={marble ? "#2b2f38" : "#4a2c14"} />
      <rect x="23" y="102" width="54" height="3" rx="1.5" fill={marble ? "#1a1c22" : "#2a170a"} />
      <rect x="38" y={tall ? 94 : 92} width="24" height="7" rx="1" fill={MV} />
      <path d={`M41 ${tall ? 97.5 : 95.5} H59`} stroke="rgba(90,60,5,0.6)" strokeWidth="0.8" />
    </g>
  );
  const Shine = ({ d }: { d: string }) => <path d={d} fill={SH} opacity="0.85" />;
  const Ribbons = ({ y = 30, x1 = 26, x2 = 74 }: { y?: number; x1?: number; x2?: number }) => (
    <g>
      <path d={`M${x1} ${y} q-6 10 -2 22 l4 -4 l3 5 q-3 -12 0 -22 z`} fill={r1} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
      <path d={`M${x1 + 2} ${y} q-2 12 3 20 l2 -5 l4 3 q-5 -8 -4 -18 z`} fill={r2} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
      <path d={`M${x2} ${y} q6 10 2 22 l-4 -4 l-3 5 q3 -12 0 -22 z`} fill={r1} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
      <path d={`M${x2 - 2} ${y} q2 12 -3 20 l-2 -5 l-4 3 q5 -8 4 -18 z`} fill={r2} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
    </g>
  );
  const Sparkle = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
    <path d={`M${x} ${y - 5 * s} L${x + 1.2 * s} ${y - 1.2 * s} L${x + 5 * s} ${y} L${x + 1.2 * s} ${y + 1.2 * s} L${x} ${y + 5 * s} L${x - 1.2 * s} ${y + 1.2 * s} L${x - 5 * s} ${y} L${x - 1.2 * s} ${y - 1.2 * s} Z`} fill="#fff" opacity="0.9" />
  );

  let body: React.ReactNode;
  switch (k) {
    case "league":
      body = (<>
        {Shadow}<Base />
        <path d="M44 72 H56 L58 84 H42 Z" fill={M} />
        <ellipse cx="50" cy="72" rx="9" ry="2.5" fill={MV} />
        <path d="M28 24 C28 50 36 62 50 66 C64 62 72 50 72 24 Z" fill={M} />
        <path d="M28 28 C14 26 14 48 33 52" fill="none" stroke={M} strokeWidth="3.5" />
        <path d="M72 28 C86 26 86 48 67 52" fill="none" stroke={M} strokeWidth="3.5" />
        <ellipse cx="50" cy="24" rx="22" ry="5" fill={MV} />
        <path d="M30 23 C32 11 68 11 70 23 Z" fill={M} />
        <circle cx="50" cy="8" r="4.5" fill={MV} />
        <path d="M36 40 H64" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        <Shine d="M33 27 C34 44 39 54 44 60 C40 52 37 42 37 27 Z" />
        <Ribbons y={30} x1={30} x2={70} />
        <Sparkle x={68} y={14} s={0.8} />
      </>);
      break;
    case "premier":
      body = (<>
        {Shadow}<Base marble />
        <path d="M44 66 H56 L59 84 H41 Z" fill={M} />
        <path d="M28 26 H72 C72 48 64 62 50 66 C36 62 28 48 28 26 Z" fill={M} />
        {/* asas con forma de garra */}
        <path d="M28 30 C16 28 14 40 20 46 C24 50 30 50 34 54 M72 30 C84 28 86 40 80 46 C76 50 70 50 66 54" fill="none" stroke={M} strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="18" cy="38" r="3.4" fill={MV} /><circle cx="82" cy="38" r="3.4" fill={MV} />
        <ellipse cx="50" cy="26" rx="22" ry="4.5" fill={MV} />
        <path d="M36 25 C38 18 62 18 64 25 Z" fill={M} />
        {/* corona dorada */}
        <path d="M37 18 L36 6 L43 11 L50 2 L57 11 L64 6 L63 18 Z" fill={GC} stroke="#7a5404" strokeWidth="0.8" />
        <rect x="36" y="16" width="28" height="3.5" rx="1" fill={GC} stroke="#7a5404" strokeWidth="0.6" />
        <circle cx="43" cy="17.7" r="1" fill="#c62828" /><circle cx="50" cy="17.7" r="1" fill="#1e63b8" /><circle cx="57" cy="17.7" r="1" fill="#c62828" />
        <Shine d="M32 29 C33 44 38 55 44 60 C39 52 36 42 36 29 Z" />
        <Ribbons y={32} x1={30} x2={70} />
      </>);
      break;
    case "plate":
      body = (<>
        {Shadow}<Base marble />
        <path d="M44 70 H56 L58 84 H42 Z" fill={M} />
        <circle cx="50" cy="42" r="36" fill={M} stroke="rgba(60,70,80,0.7)" strokeWidth="1.5" />
        <circle cx="50" cy="42" r="30" fill="none" stroke="rgba(60,70,80,0.55)" strokeWidth="1.2" />
        {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <circle key={i} cx={50 + Math.cos(a) * 33} cy={42 + Math.sin(a) * 33} r="1.9" fill="#2e8b57" stroke={GC} strokeWidth="0.8" />; })}
        <circle cx="50" cy="42" r="20" fill={MV} stroke="rgba(60,70,80,0.55)" strokeWidth="1" />
        {Array.from({ length: 5 }, (_, i) => <circle key={i} cx="50" cy="42" r={18 - i * 3.5} fill="none" stroke="rgba(60,70,80,0.3)" strokeWidth="0.6" />)}
        <circle cx="50" cy="42" r="5" fill={GC} />
        <path d="M24 26 C30 14 42 8 54 8 C42 12 32 20 27 32 Z" fill={SH} opacity="0.8" />
      </>);
      break;
    case "cup":
    case "supercup":
      body = (<>
        {Shadow}<Base />
        <path d="M45 66 H55 L58 84 H42 Z" fill={M} />
        <path d="M24 22 H76 C76 46 66 62 50 64 C34 62 24 46 24 22 Z" fill={M} />
        <path d="M24 26 C6 24 6 52 32 52" fill="none" stroke={M} strokeWidth="5" strokeLinecap="round" />
        <path d="M76 26 C94 24 94 52 68 52" fill="none" stroke={M} strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="50" cy="22" rx="26" ry="5" fill={MV} />
        {k === "supercup" ? <path d="M50 6 l2.6 5.4 6 .8-4.3 4.2 1 5.9-5.3-2.8-5.3 2.8 1-5.9-4.3-4.2 6-.8z" fill={MV} /> : <><path d="M36 21 C38 12 62 12 64 21 Z" fill={M} /><circle cx="50" cy="9" r="3.5" fill={MV} /></>}
        <Shine d="M29 25 C30 42 36 54 42 59 C37 50 33 40 33 25 Z" />
        <Ribbons y={28} x1={24} x2={76} />
      </>);
      break;
    case "libertadores":
      body = (<>
        {Shadow}
        <rect x="30" y="64" width="40" height="40" rx="2" fill={W} />
        <rect x="27" y="62" width="46" height="4" rx="1.5" fill="#3a2210" />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={33 + (i % 4) * 9} y={69 + Math.floor(i / 4) * 8} width="7" height="5" rx="0.6" fill={MV} opacity="0.95" />)}
        <path d="M46 50 H54 L56 62 H44 Z" fill={M} />
        <ellipse cx="50" cy="51" rx="7" ry="1.8" fill={MV} />
        <path d="M33 20 H67 L63 40 C61 46 56 50 50 50 C44 50 39 46 37 40 Z" fill={M} />
        <path d="M33 23 C24 22 24 38 38 40 M67 23 C76 22 76 38 62 40" fill="none" stroke={M} strokeWidth="3" />
        <ellipse cx="50" cy="20" rx="17" ry="3.5" fill={MV} />
        <path d="M40 19 C42 14 58 14 60 19 Z" fill={M} />
        {/* jugador pateando sobre la tapa */}
        <circle cx="49" cy="2.8" r="2.2" fill={MV} />
        <path d="M47.5 5 H50.5 L51.5 9.5 L55.5 12.5 L54.5 13.8 L50.5 11.2 L48.6 15 L46.8 14.4 L47.8 9.6 L45 8.6 L45.6 7.4 Z" fill={MV} />
        <circle cx="57" cy="14" r="1.6" fill={MV} />
        <Shine d="M37 23 C38 33 41 41 45 46 C42 39 40 31 40 23 Z" />
        <Sparkle x={72} y={10} s={0.8} />
      </>);
      break;
    case "champions":
      body = (<>
        {Shadow}
        <ellipse cx="50" cy="100" rx="17" ry="4" fill={MV} />
        <path d="M34 100 C38 92 45 88 46 80 H54 C55 88 62 92 66 100 Z" fill={M} />
        <rect x="45" y="66" width="10" height="15" fill={M} />
        <ellipse cx="50" cy="66" rx="8" ry="2.2" fill={MV} />
        <path d="M37 10 H63 C64 30 61 50 50 64 C39 50 36 30 37 10 Z" fill={M} />
        {/* las "orejas": asas enormes de arriba hasta abajo */}
        <path d="M38 14 C12 2 2 36 18 54 C24 61 36 64 43 58" fill="none" stroke={M} strokeWidth="6.5" strokeLinecap="round" />
        <path d="M62 14 C88 2 98 36 82 54 C76 61 64 64 57 58" fill="none" stroke={M} strokeWidth="6.5" strokeLinecap="round" />
        <path d="M38 14 C14 4 6 34 20 51" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" />
        <ellipse cx="50" cy="10" rx="13" ry="3.2" fill={MV} />
        <ellipse cx="50" cy="10" rx="10" ry="2" fill="#5c6670" opacity="0.6" />
        <Shine d="M40 13 C40 30 43 44 48 56 C44 44 43 30 43 13 Z" />
        <Sparkle x={86} y={8} s={0.8} />
      </>);
      break;
    case "continental":
      body = (<>
        {Shadow}<Base />
        <path d="M46 62 H54 L57 84 H43 Z" fill={M} />
        <path d="M38 8 C30 16 32 26 36 32 C34 44 40 58 50 62 C60 58 66 44 64 32 C68 26 70 16 62 8 Z" fill={M} />
        {[40, 45, 50, 55, 60].map((x) => <path key={x} d={`M${x} 12 C${x - 1} 30 ${x} 46 ${x === 50 ? 50 : x + (x < 50 ? 2 : -2)} 58`} stroke="rgba(0,0,0,0.18)" strokeWidth="0.9" fill="none" />)}
        <ellipse cx="50" cy="8" rx="12" ry="3" fill={MV} />
        <Shine d="M38 14 C37 28 40 44 46 56 C42 44 41 28 42 14 Z" />
      </>);
      break;
    case "world":
      body = (<>
        {Shadow}
        <ellipse cx="50" cy="100" rx="17" ry="4.5" fill={MV} />
        <rect x="33" y="86" width="34" height="14" fill={M} />
        <rect x="33" y="88" width="34" height="3.2" fill="#1d7a3c" /><rect x="33" y="94" width="34" height="3.2" fill="#1d7a3c" />
        <ellipse cx="50" cy="86" rx="17" ry="4.5" fill={MV} />
        {/* dos figuras en espiral que sostienen el mundo */}
        <path d="M37 86 C37 76 43 68 43 60 C43 52 34 48 31 40 C30 35 34 31 38 33 C42 40 46 43 50 43 C54 43 58 40 62 33 C66 31 70 35 69 40 C66 48 57 52 57 60 C57 68 63 76 63 86 Z" fill={M} />
        <path d="M40 84 C44 72 56 66 54 54 C52 46 43 43 38 35 M60 84 C56 72 44 66 46 54 C48 46 57 43 62 35" stroke="rgba(90,60,5,0.6)" strokeWidth="1.5" fill="none" />
        <path d="M44 80 C47 72 52 70 51 62" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
        <circle cx="50" cy="22" r="17" fill={M} />
        <path d="M35 17 C40 14 44 18 47 15 C50 12 54 16 58 13 M38 29 C42 26 47 30 51 26 C55 23 60 27 64 25 M42 10 C44 13 48 11 50 9 M44 36 C47 33 52 35 56 33" stroke="rgba(90,60,5,0.7)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="22" r="17" fill="none" stroke="rgba(90,60,5,0.5)" strokeWidth="1" />
        <Shine d="M38 13 C40 9 44 6 48 6 C43 10 41 16 41 23 C38 20 37 16 38 13 Z" />
        <Sparkle x={74} y={10} s={0.9} />
      </>);
      break;
    case "clubwc":
      body = (<>
        {Shadow}<Base marble />
        <path d="M30 84 C30 50 40 30 50 10 C60 30 70 50 70 84 Z" fill="none" stroke={M} strokeWidth="5" />
        <path d="M38 84 C40 60 45 44 50 30 C55 44 60 60 62 84" fill="none" stroke={M} strokeWidth="3" />
        <circle cx="50" cy="58" r="11" fill={M} />
        <path d="M39 58 H61 M50 47 C44 52 44 64 50 69 M50 47 C56 52 56 64 50 69" stroke="rgba(90,60,5,0.55)" strokeWidth="1" fill="none" />
        <Shine d="M33 78 C33 56 39 38 47 20 C42 36 37 54 36 78 Z" />
        <Sparkle x={74} y={20} s={0.9} />
      </>);
      break;
    case "intercont":
      body = (<>
        {Shadow}<Base />
        <path d="M44 62 H56 L58 84 H42 Z" fill={M} />
        <path d="M30 40 C30 54 38 62 50 62 C62 62 70 54 70 40 Z" fill={M} />
        <circle cx="50" cy="24" r="16" fill={M} />
        <path d="M34 24 H66 M50 8 C41 14 41 34 50 40 M50 8 C59 14 59 34 50 40" stroke="rgba(90,60,5,0.55)" strokeWidth="1" fill="none" />
        <path d="M28 38 C22 26 26 14 34 10 M72 38 C78 26 74 14 66 10" stroke="#3f8f4a" strokeWidth="3" fill="none" strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => <g key={i}><ellipse cx={27 + i} cy={34 - i * 7} rx="3" ry="1.6" fill="#3f8f4a" /><ellipse cx={73 - i} cy={34 - i * 7} rx="3" ry="1.6" fill="#3f8f4a" /></g>)}
        <Shine d="M40 16 C42 12 45 10 48 10 C44 14 43 20 43 26 C41 22 39 19 40 16 Z" />
      </>);
      break;
    case "america":
      body = (<>
        {Shadow}
        <rect x="24" y="80" width="52" height="24" rx="2" fill={W} />
        <rect x="29" y="70" width="42" height="11" rx="1.5" fill={W} />
        <rect x="22" y="78" width="56" height="3" rx="1" fill="#3a2210" /><rect x="27" y="68" width="46" height="3" rx="1" fill="#3a2210" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={27 + (i % 5) * 9.5} y={84 + Math.floor(i / 5) * 8} width="7" height="5" rx="0.5" fill={MV} opacity="0.95" />)}
        <path d="M45 56 H55 L57 68 H43 Z" fill={M} />
        <path d="M30 22 H70 C70 42 63 54 50 57 C37 54 30 42 30 22 Z" fill={M} />
        <path d="M30 26 C16 26 16 46 36 47 M70 26 C84 26 84 46 64 47" fill="none" stroke={M} strokeWidth="4" />
        <path d="M33 36 H67" stroke="rgba(60,70,80,0.4)" strokeWidth="1.2" />
        <ellipse cx="50" cy="22" rx="20" ry="4" fill={MV} />
        <path d="M36 21 C38 11 62 11 64 21 Z" fill={M} />
        <circle cx="50" cy="7" r="3" fill={MV} /><path d="M48 9 h4 l1 4 h-6z" fill={MV} />
        <Shine d="M34 25 C35 38 40 48 45 53 C41 46 38 36 38 25 Z" />
      </>);
      break;
    case "euro":
      body = (<>
        {Shadow}
        <ellipse cx="50" cy="101" rx="19" ry="4" fill={MV} />
        <rect x="31" y="92" width="38" height="9" fill={M} />
        <ellipse cx="50" cy="92" rx="19" ry="4" fill={MV} />
        <path d="M38 92 C42 86 46 84 46 78 H54 C54 84 58 86 62 92 Z" fill={M} />
        {/* jarrón alto y esbelto, boca ancha y asas chicas arriba */}
        <path d="M33 6 H67 C66 14 60 20 58 30 C56 44 56 60 54 78 H46 C44 60 44 44 42 30 C40 20 34 14 33 6 Z" fill={M} />
        <path d="M39 14 C30 14 29 26 41 28 M61 14 C70 14 71 26 59 28" fill="none" stroke={M} strokeWidth="2.6" />
        <ellipse cx="50" cy="6" rx="17" ry="3.2" fill={MV} />
        <ellipse cx="50" cy="6" rx="13" ry="1.8" fill="#5c6670" opacity="0.6" />
        <Shine d="M40 9 C43 22 46 40 47 72 C49 46 47 24 44 9 Z" />
        <Sparkle x={74} y={14} s={0.8} />
      </>);
      break;
    case "promotion":
      body = (<>
        <path d="M34 4 L50 36 L66 4 L58 4 L50 20 L42 4 Z" fill="#1f7a3a" />
        <path d="M40 4 L50 26 L60 4" fill="none" stroke="#ffffff" strokeWidth="2" />
        <circle cx="50" cy="66" r="32" fill={M} stroke="rgba(90,60,5,0.6)" strokeWidth="2" />
        <circle cx="50" cy="66" r="25" fill="none" stroke="rgba(90,60,5,0.5)" strokeWidth="1.5" />
        <path d="M50 44 L68 64 H57 V86 H43 V64 H32 Z" fill="#1f7a3a" stroke="#0f4d22" strokeWidth="1" />
        <Shine d="M28 58 C30 46 38 38 48 36 C40 42 34 50 32 62 Z" />
      </>);
      break;
    case "ballon":
      body = (<>
        {Shadow}<Base marble />
        <path d="M44 74 H56 L58 84 H42 Z" fill={M} />
        <circle cx="50" cy="42" r="32" fill={M} />
        <path d="M50 26 l12 8.7 -4.6 14.1 h-14.8 l-4.6-14.1z" fill="rgba(90,60,5,0.65)" />
        <path d="M50 26 V12 M62 34.7 l13-5 M57.4 48.8 l8 11.5 M42.6 48.8 l-8 11.5 M38 34.7 l-13-5" stroke="rgba(90,60,5,0.6)" strokeWidth="2" />
        <path d="M36 14 l-6 -2 M64 14 l6 -2 M76 50 l4 4 M24 50 l-4 4" stroke="rgba(90,60,5,0.4)" strokeWidth="1.5" />
        <circle cx="38" cy="28" r="9" fill="#fff" opacity="0.35" /><circle cx="36" cy="26" r="4" fill="#fff" opacity="0.6" />
        <Sparkle x={78} y={14} s={1} />
      </>);
      break;
    case "boot":
      body = (<>
        {Shadow}<Base marble />
        {/* botín de perfil, apuntando a la derecha */}
        <path d="M16 22 C22 19 32 19 40 22 C42 34 46 42 54 46 C66 50 80 52 86 58 C91 63 89 72 82 74 H20 C15 74 13 69 14 63 C16 52 16 36 16 22 Z" fill={M} stroke="rgba(90,60,5,0.65)" strokeWidth="1.4" />
        <path d="M16 22 C22 19 32 19 40 22 L39 27 C32 25 23 25 16 27 Z" fill={MV} />
        <path d="M38 30 L32 34 M42 36 L36 40 M46 41 L40 45 M51 45 L45 49 M57 48 L52 52" stroke="rgba(90,60,5,0.75)" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 66 C40 68 64 68 88 66" stroke="rgba(90,60,5,0.55)" strokeWidth="1.6" fill="none" />
        <path d="M20 54 C30 50 36 56 44 60" stroke="rgba(90,60,5,0.4)" strokeWidth="1.2" fill="none" />
        {[24, 36, 58, 70, 80].map((x) => <path key={x} d={`M${x - 3} 74 h6 l-1 7 h-4 z`} fill={MV} stroke="rgba(90,60,5,0.5)" strokeWidth="0.6" />)}
        <Shine d="M19 28 C19 42 18 54 17 64 C21 54 22 42 22 28 Z" />
        <Sparkle x={76} y={40} s={0.9} />
      </>);
      break;
    case "glove":
      body = (<>
        {Shadow}<Base marble />
        <path d="M28 52 V24 C28 18 36 18 36 24 V44 V14 C36 8 44 8 44 14 V44 V12 C44 6 52 6 52 12 V44 V16 C52 10 60 10 60 16 V50 L70 40 C75 35 82 41 78 47 L62 72 C58 79 52 82 44 82 C34 82 28 74 28 66 Z" fill={M} stroke="rgba(60,70,80,0.6)" strokeWidth="1.5" />
        <path d="M30 66 H62" stroke="rgba(0,0,0,0.2)" strokeWidth="5" />
        <Shine d="M31 26 V60 C33 50 34 38 34 26 Z" />
      </>);
      break;
    case "scorer":
      body = (<>
        {Shadow}<Base />
        <path d="M44 72 H56 L58 84 H42 Z" fill={M} />
        <path d="M22 58 C14 40 20 20 34 12 M78 58 C86 40 80 20 66 12" stroke="#3f8f4a" strokeWidth="3" fill="none" />
        {[0, 1, 2, 3, 4].map((i) => <g key={i}><ellipse cx={22 - i * 0.6 + (i > 2 ? 2 : 0)} cy={52 - i * 9} rx="4" ry="2" fill="#4caf50" transform={`rotate(-40 ${22} ${52 - i * 9})`} /><ellipse cx={78 + i * 0.6 - (i > 2 ? 2 : 0)} cy={52 - i * 9} rx="4" ry="2" fill="#4caf50" transform={`rotate(40 78 ${52 - i * 9})`} /></g>)}
        <circle cx="50" cy="44" r="24" fill="#f4f4f4" stroke="#222" strokeWidth="1.5" />
        <path d="M50 32 l9 6.5-3.4 10.5h-11.2l-3.4-10.5z" fill="#222" />
        <path d="M50 32 V20 M59 38.5 l10-4 M55.6 49 l6 9 M44.4 49 l-6 9 M41 38.5 l-10-4" stroke="#222" strokeWidth="1.6" />
        <circle cx="42" cy="34" r="5" fill="#fff" opacity="0.8" />
      </>);
      break;
    case "mvp":
    case "young":
      body = (<>
        <path d="M32 2 L50 40 L68 2 L58 2 L50 22 L42 2 Z" fill={k === "mvp" ? "#c62828" : "#1e63b8"} />
        <path d="M38 2 L50 30 L62 2" fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
        <circle cx="50" cy="66" r="30" fill={M} stroke={silver ? "rgba(60,70,80,0.6)" : "rgba(90,60,5,0.6)"} strokeWidth="2" />
        <circle cx="50" cy="66" r="23" fill="none" stroke={silver ? "rgba(60,70,80,0.5)" : "rgba(90,60,5,0.5)"} strokeWidth="1.5" />
        <path d="M50 48 l5.5 11.6 12.7 1.6-9.3 8.8 2.4 12.6-11.3-6.2-11.3 6.2 2.4-12.6-9.3-8.8 12.7-1.6z" fill={MV} stroke={silver ? "rgba(60,70,80,0.6)" : "rgba(90,60,5,0.6)"} strokeWidth="1" />
        {k === "young" && <text x="50" y="104" textAnchor="middle" fontSize="11" fontWeight="900" fill="#5cc3ff" fontFamily="system-ui">U21</text>}
        <Shine d="M26 58 C28 46 36 40 46 38 C38 44 32 50 30 62 Z" />
      </>);
      break;
    case "shield":
      body = (<>
        {Shadow}
        <path d="M50 4 L90 16 V48 C90 74 72 90 50 100 C28 90 10 74 10 48 V16 Z" fill={M} stroke="rgba(90,60,5,0.6)" strokeWidth="2" />
        <path d="M50 14 L80 23 V48 C80 68 66 81 50 89 C34 81 20 68 20 48 V23 Z" fill="none" stroke="rgba(90,60,5,0.5)" strokeWidth="1.5" />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={30 + (i % 3) * 14} y={32 + Math.floor(i / 3) * 14} width="11" height="8" rx="1" fill={MV} stroke="rgba(90,60,5,0.4)" strokeWidth="0.6" />)}
        <Shine d="M16 22 V48 C16 62 22 72 30 80 C22 68 20 58 20 46 V24 Z" />
      </>);
      break;
  }

  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 100 110" className="trophy" role="img" aria-label={name}>
      <defs>
        <linearGradient id={`m${uid}`} x1="0" y1="0" x2="1" y2="0">
          {pal.map((c, i) => <stop key={i} offset={i / (pal.length - 1)} stopColor={c} />)}
        </linearGradient>
        <linearGradient id={`v${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal[3]} /><stop offset="0.5" stopColor={pal[2]} /><stop offset="1" stopColor={pal[1]} />
        </linearGradient>
        <linearGradient id={`s${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.9" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`w${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3518" /><stop offset="1" stopColor="#2b1609" />
        </linearGradient>
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a3f4b" /><stop offset="0.5" stopColor="#1b1e25" /><stop offset="1" stopColor="#2a2e38" />
        </linearGradient>
        <linearGradient id={`c${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff3b0" /><stop offset="0.5" stopColor="#e0b030" /><stop offset="1" stopColor="#8a6008" /></linearGradient>
      </defs>
      {body}
    </svg>
  );
}
