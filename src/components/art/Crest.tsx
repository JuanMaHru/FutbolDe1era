import { useId } from "react";
import { clubStyle } from "@/lib/clubs";
import { PatternFill } from "./PatternFill";

const SHAPES = {
  shield: "M50 3 L94 14 L94 48 C94 74 74 90 50 98 C26 90 6 74 6 48 L6 14 Z",
  badge: "M14 4 H86 Q94 4 94 12 V62 C94 82 72 94 50 98 C28 94 6 82 6 62 V12 Q6 4 14 4 Z",
  round: "M50 3 A47 47 0 1 1 49.9 3 Z",
};

/** Escudo ilustrado (propio) a partir de colores, patrón e iniciales del club. */
export function Crest({ club, size = 28, title }: { club: string; size?: number; title?: string }) {
  const s = clubStyle(club);
  const id = useId().replace(/:/g, "");
  const path = SHAPES[s.shape ?? "shield"];
  const [base, accent, ink] = s.colors;
  const text = ink ?? (isLight(base) ? "#111" : "#fff");
  const fs = s.abbr.length >= 4 ? 21 : s.abbr.length === 3 ? 25 : 30;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={title ?? club} className="crest">
      <defs>
        <clipPath id={`c${id}`}>
          <path d={path} />
        </clipPath>
      </defs>
      <g clipPath={`url(#c${id})`}>
        <PatternFill pattern={s.pattern} base={base} accent={accent} />
        <rect x="0" y="60" width="100" height="40" fill="rgba(0,0,0,0.0)" />
      </g>
      <path d={path} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="5" />
      <path d={path} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" transform="translate(50 50) scale(0.88) translate(-50 -50)" />
      <rect x="14" y="60" width="72" height="24" rx="6" fill={text === "#fff" || isLight(text) ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.88)"} />
      <text x="50" y="78.5" textAnchor="middle" fontSize={fs} fontWeight="900" fill={text === "#fff" || isLight(text) ? "#fff" : text} fontFamily="system-ui, sans-serif" letterSpacing="0.5">
        {s.abbr}
      </text>
    </svg>
  );
}

export function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}
