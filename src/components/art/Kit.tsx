import { useId } from "react";
import { clubStyle } from "@/lib/clubs";
import { PatternFill } from "./PatternFill";
import { isLight } from "./Crest";

const SHIRT = "M30 6 L42 2 Q50 9 58 2 L70 6 L96 22 L86 42 L76 37 L76 96 L24 96 L24 37 L14 42 L4 22 Z";

/** Camiseta ilustrada con el patrón del club y el dorsal (o un texto corto, p. ej. "DT"). */
export function Kit({ club, label, size = 96, hidden = false }: { club: string; label: string | number; size?: number; hidden?: boolean }) {
  const s = clubStyle(club);
  const id = useId().replace(/:/g, "");
  const [base, accent] = hidden ? ["#1d3b2d", "#24473a"] : s.colors;
  const numberColor = hidden ? "#f4c542" : isLight(base) ? (s.colors[2] ?? "#111") : "#fff";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="kit" aria-hidden>
      <defs>
        <clipPath id={`k${id}`}>
          <path d={SHIRT} />
        </clipPath>
      </defs>
      <g clipPath={`url(#k${id})`}>
        <PatternFill pattern={hidden ? "plain" : s.pattern} base={base} accent={accent} />
        {!hidden && s.pattern === "sleeves" && (
          <>
            <polygon points="0,0 30,6 24,40 0,40" fill={accent} />
            <polygon points="100,0 70,6 76,40 100,40" fill={accent} />
          </>
        )}
        <path d="M42 2 Q50 9 58 2 L58 6 Q50 14 42 6 Z" fill="rgba(0,0,0,0.25)" />
      </g>
      <path d={SHIRT} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" strokeLinejoin="round" />
      <text
        x="50"
        y="72"
        textAnchor="middle"
        fontSize={String(label).length > 2 ? 22 : 34}
        fontWeight="900"
        fill={numberColor}
        stroke={hidden ? "none" : isLight(base) ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.35)"}
        strokeWidth="1.5"
        paintOrder="stroke"
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}
