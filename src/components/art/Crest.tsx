"use client";
import { useEffect, useId, useRef, useState } from "react";
import CRESTS from "@/data/crests.json";
import LOCAL_IMAGES from "@/data/images-local.json";
import { REAL_CRESTS } from "@/lib/site";
import { clubStyle } from "@/lib/clubs";
import { PatternFill } from "./PatternFill";

/** Siluetas de escudo. Las inner son la misma forma achicada (para el ribete). */
const SHAPES: Record<string, string> = {
  // Escudo clásico, puntas arriba y punta abajo.
  shield: "M50 4 C62 9 78 10 92 8 V44 C92 70 74 88 50 97 C26 88 8 70 8 44 V8 C22 10 38 9 50 4 Z",
  // Escudo "heater": arriba recto, lados curvos hasta la punta.
  heater: "M8 8 H92 V40 C92 66 76 86 50 97 C24 86 8 66 8 40 Z",
  // Escudo español: arriba recto, abajo redondeado.
  spanish: "M8 6 H92 V58 C92 82 72 96 50 96 C28 96 8 82 8 58 Z",
  // Placa con esquinas redondeadas y punta suave.
  badge: "M16 5 H84 Q93 5 93 14 V60 C93 80 72 92 50 97 C28 92 7 80 7 60 V14 Q7 5 16 5 Z",
  round: "M50 4 A46 46 0 1 1 49.9 4 Z",
};
const AUTO = ["shield", "heater", "spanish"] as const;

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/**
 * Escudo ilustrado PROPIO (no oficial): forma, ribete dorado, franjas con los colores del club,
 * monograma con serifa y, en los redondos, el nombre alrededor. Determinístico por nombre.
 */
export function Crest({ club, size = 28, title, real = true }: { club: string; size?: number; title?: string; real?: boolean }) {
  const remote = real && REAL_CRESTS ? (CRESTS as Record<string, string>)[club] : undefined;
  // Copia descargada al sitio si existe; si no, la imagen de TheSportsDB.
  const localUrl = real && REAL_CRESTS ? (LOCAL_IMAGES as { crests: Record<string, string> }).crests[club] : undefined;
  const url = localUrl ?? remote;
  const [broken, setBroken] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // Si la imagen falló antes de hidratar, onError no llega: lo revisamos al montar.
  useEffect(() => { const el = img.current; if (el && el.complete && el.naturalWidth === 0) setBroken(true); }, [url]);
  if (url && !broken)
    return (
      // Escudo real, solo para identificar al club (ver /aviso-legal). Si no carga, vuelve al escudo propio.
      // eslint-disable-next-line @next/next/no-img-element
      <img ref={img} src={localUrl ?? `${remote}/${size > 60 ? "small" : "tiny"}`} width={size} height={size} alt={title ?? club} title={title ?? club} className="crest crest-real" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
    );
  return <OwnCrest club={club} size={size} title={title} />;
}

/** Escudo ilustrado propio (respaldo, y para usos decorativos). */
export function OwnCrest({ club, size = 28, title }: { club: string; size?: number; title?: string }) {
  const s = clubStyle(club);
  const id = useId().replace(/:/g, "");
  const h = hash(club);
  const shape = s.shape ?? AUTO[h % AUTO.length];
  const path = SHAPES[shape];
  const [base, accent, ink] = s.colors;
  const plain = s.pattern === "plain" || base.toLowerCase() === accent.toLowerCase();
  const contrast = isLight(base) ? (ink && !isLight(ink) ? ink : "#14161c") : "#ffffff";
  const textFill = plain ? (ink ?? contrast) : "#ffffff";
  const textStroke = plain ? (isLight(textFill) ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)") : "rgba(0,0,0,0.75)";
  const crown = /^Real\b|Royal|Rey/.test(club);
  const abbr = s.abbr;
  const big = size >= 36;
  const inner = "translate(50 50) scale(0.84) translate(-50 -50)";

  if (shape === "round") {
    const ring = ink && ink.toLowerCase() !== base.toLowerCase() ? ink : isLight(base) ? accent : base;
    const ringText = isLight(ring) ? "#14161c" : "#ffffff";
    const name = club.toUpperCase();
    const fs = abbr.length >= 4 ? 17 : abbr.length === 3 ? 21 : 25;
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={title ?? club} className="crest">
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1b0" /><stop offset="0.45" stopColor="#d9a520" /><stop offset="1" stopColor="#7a5404" /></linearGradient>
          <clipPath id={`c${id}`}><circle cx="50" cy="50" r="29" /></clipPath>
          <path id={`t${id}`} d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
          <radialGradient id={`l${id}`} cx="0.35" cy="0.25" r="0.8"><stop offset="0" stopColor="#fff" stopOpacity="0.35" /><stop offset="0.6" stopColor="#fff" stopOpacity="0" /></radialGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill={`url(#g${id})`} />
        <circle cx="50" cy="50" r="43.5" fill={ring} />
        {big && (
          <text fontSize="10" fontWeight="800" fill={ringText} fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="1.5">
            <textPath href={`#t${id}`} startOffset="25%" textAnchor="middle">{name.length > 26 ? name.slice(0, 26) : name}</textPath>
          </text>
        )}
        {!big && <circle cx="50" cy="50" r="37" fill="none" stroke={ringText} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="2 4" />}
        <circle cx="50" cy="50" r="31" fill={`url(#g${id})`} />
        <g clipPath={`url(#c${id})`}><PatternFill pattern={s.pattern} base={base} accent={accent} /></g>
        <text x="50" y={50 + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight="900" fill={textFill} stroke={textStroke} strokeWidth="2.2" paintOrder="stroke" fontFamily="Georgia, 'Times New Roman', serif">{abbr}</text>
        <circle cx="50" cy="50" r="46" fill={`url(#l${id})`} />
      </svg>
    );
  }

  const fs = abbr.length >= 4 ? 23 : abbr.length === 3 ? 28 : 34;
  const ty = shape === "spanish" ? 60 : 56;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={title ?? club} className="crest">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1b0" /><stop offset="0.45" stopColor="#d9a520" /><stop offset="1" stopColor="#7a5404" /></linearGradient>
        <clipPath id={`c${id}`}><path d={path} transform={inner} /></clipPath>
        <linearGradient id={`l${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.32" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.18" /></linearGradient>
      </defs>
      <path d={path} fill={`url(#g${id})`} stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" />
      <path d={path} fill={contrast === "#ffffff" ? "#0f1115" : "#ffffff"} transform="translate(50 50) scale(0.9) translate(-50 -50)" />
      <g clipPath={`url(#c${id})`}>
        <PatternFill pattern={s.pattern} base={base} accent={accent} />
        {!plain && <path d="M0 0 H100 V22 H0 Z" fill={base} />}
      </g>
      {crown && <path d="M34 22 L38 10 L44 17 L50 7 L56 17 L62 10 L66 22 Z" fill={`url(#g${id})`} stroke="rgba(0,0,0,0.45)" strokeWidth="1" />}
      <text x="50" y={ty + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight="900" fill={textFill} stroke={textStroke} strokeWidth="2.4" paintOrder="stroke" fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="0.5">{abbr}</text>
      <path d={path} fill={`url(#l${id})`} />
    </svg>
  );
}

export function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}
