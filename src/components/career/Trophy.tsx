/** Íconos propios (SVG) para cada tipo de título o premio. */
export type TrophyKind =
  | "league" | "cup" | "libertadores" | "champions" | "continental" | "world" | "america" | "euro"
  | "promotion" | "ballon" | "boot" | "glove" | "scorer" | "mvp" | "young" | "shield";

export function trophyKind(name: string): TrophyKind {
  if (/^Balón de Oro/.test(name)) return "ballon";
  if (/^Bota de Oro/.test(name)) return "boot";
  if (/^Guante de Oro/.test(name)) return "glove";
  if (/^Goleador/.test(name)) return "scorer";
  if (/^Mejor jugador/.test(name)) return "mvp";
  if (/^Golden Boy/.test(name)) return "young";
  if (/^Mundial/.test(name)) return "world";
  if (/^Copa América/.test(name)) return "america";
  if (/^Eurocopa/.test(name)) return "euro";
  if (/^Champions League|^AFC Champions/.test(name)) return "champions";
  if (/^Copa Libertadores/.test(name)) return "libertadores";
  if (/Europa League|Sudamericana|Concacaf/.test(name)) return "continental";
  if (/^Ascenso/.test(name)) return "promotion";
  if (/^Supporters/.test(name)) return "shield";
  if (/^(Liga Profesional|Torneo Apertura|Torneo Clausura|Apertura|Clausura|Primera Nacional|Premier League|LaLiga|Serie A|Bundesliga|Ligue 1|Primeira Liga|Eredivisie|Brasileirão|Liga Uruguaya|Liga MX|MLS|Saudi Pro League)/.test(name)) return "league";
  return "cup";
}

const GOLD = ["#fff2b0", "#f4c542", "#b8860b"];
const SILVER = ["#ffffff", "#cfd8e3", "#7f8c9b"];

function Grad({ id, c }: { id: string; c: string[] }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={c[0]} />
      <stop offset="0.5" stopColor={c[1]} />
      <stop offset="1" stopColor={c[2]} />
    </linearGradient>
  );
}

export function TrophyIcon({ name, size = 28 }: { name: string; size?: number }) {
  const k = trophyKind(name);
  const silver = ["champions", "continental", "euro", "libertadores", "glove", "young"].includes(k);
  const id = `tg-${k}`;
  const f = `url(#${id})`;
  const base = <rect x="34" y="84" width="32" height="10" rx="2" fill="#5a3b1c" />;
  let body: React.ReactNode;
  switch (k) {
    case "league":
      body = <><circle cx="50" cy="44" r="34" fill={f} stroke="#8a6a12" strokeWidth="3" /><circle cx="50" cy="44" r="24" fill="none" stroke="#8a6a12" strokeWidth="2" /><path d="M50 28 l5 11 12 1-9 8 3 12-11-7-11 7 3-12-9-8 12-1z" fill="#8a6a12" /><rect x="42" y="78" width="16" height="8" fill={f} />{base}</>;
      break;
    case "shield":
      body = <path d="M50 6 L88 18 V48 C88 72 70 86 50 94 C30 86 12 72 12 48 V18 Z" fill={f} stroke="#8a6a12" strokeWidth="3" />;
      break;
    case "champions":
      body = <><path d="M30 18 H70 L66 58 C64 68 56 72 50 72 C44 72 36 68 34 58 Z" fill={f} /><path d="M30 20 C2 20 4 62 34 56" fill="none" stroke={f} strokeWidth="7" /><path d="M70 20 C98 20 96 62 66 56" fill="none" stroke={f} strokeWidth="7" /><rect x="45" y="70" width="10" height="12" fill={f} />{base}</>;
      break;
    case "libertadores":
      body = <><path d="M36 8 H64 L60 50 C58 60 54 64 50 64 C46 64 42 60 40 50 Z" fill={f} /><circle cx="50" cy="8" r="5" fill="#f4c542" /><rect x="44" y="62" width="12" height="20" fill={f} /><rect x="34" y="80" width="32" height="14" rx="2" fill="#2a2f3a" /><rect x="38" y="84" width="24" height="3" fill="#f4c542" /></>;
      break;
    case "world":
      body = <><circle cx="50" cy="22" r="17" fill={f} stroke="#8a6a12" strokeWidth="2" /><path d="M38 34 C30 50 44 56 40 74 H60 C56 56 70 50 62 34" fill={f} stroke="#8a6a12" strokeWidth="2" /><rect x="36" y="74" width="28" height="8" fill="#2f7a3a" /><rect x="34" y="82" width="32" height="10" rx="2" fill={f} /></>;
      break;
    case "america":
    case "euro":
      body = <><path d="M34 14 H66 L62 56 C60 66 55 70 50 70 C45 70 40 66 38 56 Z" fill={f} />{k === "euro" && <path d="M36 14 C36 4 64 4 64 14 Z" fill={f} />}<path d="M34 22 C20 24 22 44 37 46 M66 22 C80 24 78 44 63 46" fill="none" stroke={f} strokeWidth="5" /><rect x="45" y="68" width="10" height="14" fill={f} />{base}</>;
      break;
    case "promotion":
      body = <><circle cx="50" cy="52" r="34" fill={f} stroke="#8a6a12" strokeWidth="3" /><path d="M50 26 L70 50 H58 V74 H42 V50 H30 Z" fill="#2f7a3a" /></>;
      break;
    case "ballon":
      body = <><circle cx="50" cy="44" r="34" fill={f} stroke="#8a6a12" strokeWidth="2" /><path d="M50 26 l12 9-5 14H43l-5-14z" fill="#8a6a12" /><path d="M50 26V12M62 35l13-5M57 49l9 12M43 49l-9 12M38 35l-13-5" stroke="#8a6a12" strokeWidth="2.5" />{base}</>;
      break;
    case "boot":
      body = <><path d="M24 20 H52 V50 L84 60 C92 63 92 76 82 78 H22 C16 78 16 70 18 66 Z" fill={f} stroke="#8a6a12" strokeWidth="2.5" /><path d="M28 78 v8 M44 78 v8 M62 78 v8 M76 78 v8" stroke="#8a6a12" strokeWidth="4" /><path d="M30 30 H48 M30 40 H48" stroke="#8a6a12" strokeWidth="2" /></>;
      break;
    case "glove":
      body = <><path d="M30 46 V22 C30 16 38 16 38 22 V40 V14 C38 8 46 8 46 14 V40 V12 C46 6 54 6 54 12 V40 V16 C54 10 62 10 62 16 V46 L72 36 C77 32 83 38 79 44 L62 70 C58 78 52 82 44 82 C34 82 30 74 30 66 Z" fill={f} stroke="#5e6b7a" strokeWidth="2.5" /></>;
      break;
    case "scorer":
      body = <><circle cx="50" cy="50" r="30" fill="#fff" stroke="#222" strokeWidth="3" /><path d="M50 34 l12 9-5 14H43l-5-14z" fill="#222" /><path d="M24 22 L34 10 L42 20 L50 6 L58 20 L66 10 L76 22 Z" fill={f} stroke="#8a6a12" strokeWidth="2" /></>;
      break;
    case "mvp":
    case "young":
      body = <><path d="M34 4 L50 30 L66 4" fill="none" stroke={k === "mvp" ? "#c33" : "#2b6cb0"} strokeWidth="8" /><circle cx="50" cy="58" r="30" fill={f} stroke={silver ? "#5e6b7a" : "#8a6a12"} strokeWidth="3" /><path d="M50 40 l6 13 14 1-11 9 4 14-13-8-13 8 4-14-11-9 14-1z" fill={silver ? "#5e6b7a" : "#8a6a12"} />{k === "young" && <text x="50" y="99" textAnchor="middle" fontSize="10" fontWeight="900" fill="#5cc3ff">U21</text>}</>;
      break;
    case "continental":
      body = <><path d="M40 10 H60 L58 54 C57 62 54 66 50 66 C46 66 43 62 42 54 Z" fill={f} /><path d="M40 16 C26 18 28 40 42 42 M60 16 C74 18 72 40 58 42" fill="none" stroke={f} strokeWidth="4" /><rect x="45" y="64" width="10" height="18" fill={f} />{base}</>;
      break;
    default: // copa nacional
      body = <><path d="M28 14 H72 L68 46 C66 58 58 64 50 64 C42 64 34 58 32 46 Z" fill={f} /><path d="M28 20 C12 20 14 44 33 46 M72 20 C88 20 86 44 67 46" fill="none" stroke={f} strokeWidth="6" /><rect x="44" y="62" width="12" height="16" fill={f} /><rect x="36" y="76" width="28" height="8" rx="2" fill={f} />{base}</>;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="trophy" role="img" aria-label={name}>
      <defs><Grad id={id} c={silver ? SILVER : GOLD} /></defs>
      {body}
    </svg>
  );
}
