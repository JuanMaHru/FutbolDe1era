"use client";
import { useId } from "react";

/** Íconos propios (SVG) para cada tipo de título o premio. Inspirados en los reales, sin copiar diseños oficiales. */
export type TrophyKind =
  | "league" | "cup" | "libertadores" | "champions" | "continental" | "world" | "clubwc" | "intercont" | "america" | "euro"
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
  const silver = ["champions", "continental", "euro", "libertadores", "america", "cup"].includes(k) || (k === "supercup" && /Recopa|Europa/.test(name));
  const pal = silver ? SILVER : GOLD;
  const M = `url(#m${uid})`, MV = `url(#v${uid})`, SH = `url(#s${uid})`, W = `url(#w${uid})`, MB = `url(#b${uid})`;
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
        <rect x="30" y="64" width="40" height="40" rx="2" fill="#1c1d22" />
        <rect x="27" y="62" width="46" height="4" rx="1.5" fill="#2c2d33" />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={33 + (i % 4) * 9} y={69 + Math.floor(i / 4) * 8} width="7" height="5" rx="0.6" fill={`url(#v${uid})`} opacity="0.95" />)}
        <path d="M46 48 H54 L56 62 H44 Z" fill={M} />
        <path d="M34 14 H66 L62 40 C60 46 55 49 50 49 C45 49 40 46 38 40 Z" fill={M} />
        <path d="M34 18 C26 18 26 34 38 36 M66 18 C74 18 74 34 62 36" fill="none" stroke={M} strokeWidth="3" />
        <ellipse cx="50" cy="14" rx="16" ry="3.5" fill={MV} />
        <circle cx="50" cy="6" r="3" fill={MV} /><path d="M47 9 h6 l-1 5 h-4z" fill={M} />
        <Shine d="M38 17 C39 30 42 38 45 44 C42 36 41 28 41 17 Z" />
        <Sparkle x={70} y={10} s={0.8} />
      </>);
      break;
    case "champions":
      body = (<>
        {Shadow}<Base marble />
        <path d="M45 62 H55 L59 84 H41 Z" fill={M} />
        <path d="M36 10 H64 C66 30 62 50 50 62 C38 50 34 30 36 10 Z" fill={M} />
        <path d="M37 14 C10 4 4 52 41 56" fill="none" stroke={M} strokeWidth="6" strokeLinecap="round" />
        <path d="M63 14 C90 4 96 52 59 56" fill="none" stroke={M} strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="50" cy="10" rx="14" ry="3.5" fill={MV} />
        <Shine d="M39 13 C39 30 42 44 47 54 C43 44 42 30 42 13 Z" />
        <path d="M50 88 l1.6 3.2 3.6.5-2.6 2.5.6 3.5-3.2-1.7-3.2 1.7.6-3.5-2.6-2.5 3.6-.5z" fill="#fff" opacity="0.8" />
        <Sparkle x={20} y={14} s={0.8} />
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
        <ellipse cx="50" cy="98" rx="18" ry="5" fill={MV} />
        <rect x="32" y="84" width="36" height="14" fill={M} />
        <rect x="32" y="86" width="36" height="3" fill="#1f7a3a" /><rect x="32" y="92" width="36" height="3" fill="#1f7a3a" />
        <ellipse cx="50" cy="84" rx="18" ry="5" fill={MV} />
        <path d="M38 84 C34 70 40 60 36 50 C33 42 38 34 44 32 L56 32 C62 34 67 42 64 50 C60 60 66 70 62 84 Z" fill={M} />
        <path d="M40 80 C44 64 52 58 50 46 M60 80 C56 64 48 58 50 46 M38 52 C44 50 50 54 56 44" stroke="rgba(90,60,5,0.55)" strokeWidth="1.4" fill="none" />
        <circle cx="50" cy="20" r="15" fill={M} />
        <path d="M35 20 H65 M50 5 C42 12 42 28 50 35 M50 5 C58 12 58 28 50 35 M38 12 C46 15 54 15 62 12 M38 28 C46 25 54 25 62 28" stroke="rgba(90,60,5,0.55)" strokeWidth="1" fill="none" />
        <Shine d="M39 12 C40 9 44 7 47 7 C42 10 41 16 41 22 C39 19 38 15 39 12 Z" />
        <Sparkle x={72} y={10} s={0.9} />
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
    case "euro":
      body = (<>
        {Shadow}{k === "america" ? <Base tall /> : <Base marble />}
        <path d={k === "america" ? "M45 58 H55 L57 74 H43 Z" : "M45 62 H55 L57 84 H43 Z"} fill={M} />
        <path d={k === "america" ? "M32 18 H68 C68 38 62 54 50 58 C38 54 32 38 32 18 Z" : "M36 14 H64 C64 38 60 56 50 62 C40 56 36 38 36 14 Z"} fill={M} />
        <path d={k === "america" ? "M32 22 C18 22 18 42 36 44 M68 22 C82 22 82 42 64 44" : "M36 20 C28 20 28 34 38 36 M64 20 C72 20 72 34 62 36"} fill="none" stroke={M} strokeWidth="3.5" />
        <ellipse cx="50" cy={k === "america" ? 18 : 14} rx={k === "america" ? 18 : 14} ry="4" fill={MV} />
        <path d={k === "america" ? "M38 17 C40 8 60 8 62 17 Z" : "M38 13 C40 2 60 2 62 13 Z"} fill={M} />
        {k === "america" ? <><circle cx="50" cy="3.5" r="2.5" fill={MV} /><path d="M48 6 h4 l1 4 h-6z" fill={MV} /></> : <circle cx="50" cy="1.5" r="2" fill={MV} />}
        <Shine d={k === "america" ? "M36 21 C37 36 41 47 46 54 C42 46 40 36 40 21 Z" : "M39 18 C40 34 43 48 47 57 C44 48 43 34 43 18 Z"} />
        {k === "america" && Array.from({ length: 8 }, (_, i) => <rect key={i} x={30 + (i % 4) * 10} y={80 + Math.floor(i / 4) * 7} width="7" height="4" rx="0.5" fill={MV} opacity="0.9" />)}
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
        <path d="M22 18 H50 V48 L78 56 C90 60 90 76 80 78 H20 C14 78 14 70 16 64 Z" fill={M} stroke="rgba(90,60,5,0.6)" strokeWidth="1.5" />
        <path d="M22 18 H50 V24 H22 Z" fill={MV} />
        <path d="M28 30 L46 34 M28 38 L46 42 M30 46 L48 50" stroke="rgba(90,60,5,0.7)" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 70 H86" stroke="rgba(90,60,5,0.5)" strokeWidth="1.5" />
        {[26, 40, 56, 72].map((x) => <rect key={x} x={x - 2.5} y="78" width="5" height="6" rx="1.5" fill={MV} />)}
        <Shine d="M24 26 C24 40 22 52 20 62 C25 52 27 40 27 26 Z" />
        <Sparkle x={74} y={36} s={0.9} />
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
      </defs>
      {body}
    </svg>
  );
}
