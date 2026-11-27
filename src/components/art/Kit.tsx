"use client";
import { useId } from "react";
import { clubStyle, type Pattern } from "@/lib/clubs";
import { PatternFill } from "./PatternFill";
import { Crest, isLight } from "./Crest";

/** Silueta de frente: hombros, mangas cortas y cuerpo levemente entallado. */
const BODY = "M33 9 L41 5.5 Q50 11 59 5.5 L67 9 L89 20 Q91 21 90.5 23 L84.5 38.5 Q84 40 82.5 39.4 L74 36 L74.5 91 Q74.5 94 71.5 94.4 Q50 97 28.5 94.4 Q25.5 94 25.5 91 L26 36 L17.5 39.4 Q16 40 15.5 38.5 L9.5 23 Q9 21 11 20 Z";
const SLEEVE_L = "M9.5 23 L15.5 38.5 L26 34.5 L26 22 L11 20 Z";
const SLEEVE_R = "M90.5 23 L84.5 38.5 L74 34.5 L74 22 L89 20 Z";

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 11);

/**
 * Camiseta dibujada (estilo propio, sin marcas): patrón del club, cuello y puños en el color de detalle
 * y sombras de la tela. Con `label` se ve de espalda con el dorsal; sin él, de frente con el escudo en el pecho. `hidden` = silueta sin colores (para adivinar).
 */
export function Kit({ club, label, size = 96, hidden = false, colors, pattern, crest = true }: { club: string; label: string | number; size?: number; hidden?: boolean; real?: boolean; colors?: [string, string, string?]; pattern?: Pattern; crest?: boolean }) {
  const id = useId().replace(/:/g, "");
  const s0 = clubStyle(club);
  const s = colors ? { ...s0, colors, pattern: pattern ?? s0.pattern } : s0;
  const [base, accent, detail] = hidden ? ["var(--surface-2)", "var(--surface-2)", undefined] : s.colors;
  // Color de cuello y puños: el de detalle, o el acento si la camiseta es lisa.
  const trim = hidden ? "var(--line)" : detail && detail.toLowerCase() !== base.toLowerCase() ? detail : accent.toLowerCase() !== base.toLowerCase() ? accent : isLight(base) ? "#1b1f2a" : "#f4f7fa";
  const numberColor = hidden ? "var(--accent)" : isLight(base) ? (detail && !isLight(detail) ? detail : "#14161c") : "#fff";
  const h = hash(club || "x");
  const vneck = h % 3 === 0;
  const str = String(label);
  // Con número se ve la espalda (como las reales: el escudo va adelante, el dorsal atrás).
  const back = str !== "";
  const showCrest = !back && crest && !hidden && !!club && !colors;
  return (
    <span className="kit kit-draw" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
        <defs>
          <clipPath id={`k${id}`}><path d={BODY} /></clipPath>
          <linearGradient id={`sh${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.28" /><stop offset="0.22" stopColor="#000" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.10" /><stop offset="0.78" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={`v${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.08" /><stop offset="1" stopColor="#000" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <g clipPath={`url(#k${id})`}>
          <PatternFill pattern={hidden ? "plain" : s.pattern} base={base} accent={accent} />
          {!hidden && s.pattern === "sleeves" && <><path d={SLEEVE_L} fill={accent} /><path d={SLEEVE_R} fill={accent} /></>}
          {/* Puños */}
          <path d="M9.5 23 L15.5 38.5 L19 37.1 L13 21.4 Z" fill={trim} />
          <path d="M90.5 23 L84.5 38.5 L81 37.1 L87 21.4 Z" fill={trim} />
          {/* Costuras de las mangas y paneles laterales */}
          <path d="M26 22 L26 36 M74 22 L74 36" stroke="rgba(0,0,0,0.22)" strokeWidth="0.9" fill="none" />
          <path d="M29 40 L28.5 92 M71 40 L71.5 92" stroke="rgba(0,0,0,0.12)" strokeWidth="2.2" fill="none" />
          {/* Pliegues de la tela */}
          <path d="M38 52 Q42 62 39 78 M62 50 Q57 64 61 80" stroke="rgba(0,0,0,0.10)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <rect x="0" y="0" width="100" height="100" fill={`url(#sh${id})`} />
          <rect x="0" y="0" width="100" height="100" fill={`url(#v${id})`} />
          {/* Ruedo */}
          <path d="M25.5 90.5 Q50 93.5 74.5 90.5" stroke={trim} strokeWidth="1.6" fill="none" opacity="0.85" />
        </g>
        {/* Cuello */}
        {back ? (
          <path d="M41 5.5 Q50 9.5 59 5.5 L57.6 4.3 Q50 7.4 42.4 4.3 Z" fill={trim} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
        ) : vneck ? (
          <path d="M41 5.5 L50 17 L59 5.5 L56.5 4.6 L50 12.6 L43.5 4.6 Z" fill={trim} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
        ) : (
          <path d="M41 5.5 Q50 13.5 59 5.5 L57 4.2 Q50 10 43 4.2 Z" fill={trim} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
        )}
        <path d={BODY} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.6" strokeLinejoin="round" />
        {str !== "" && (
          <text x="50" y={68} textAnchor="middle" fontSize={str.length > 2 ? 22 : 36} fontWeight="900" fontStyle="italic"
            style={{ fill: numberColor, fontFamily: "var(--display), Impact, sans-serif" }}
            stroke={hidden ? "none" : isLight(base) ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.4)"} strokeWidth="1.4" paintOrder="stroke">
            {str}
          </text>
        )}
      </svg>
      {showCrest && size >= 34 && (
        <span className="kit-crest" style={{ width: size * 0.2, height: size * 0.2 }}><Crest club={club} size={Math.round(size * 0.2)} /></span>
      )}
    </span>
  );
}
