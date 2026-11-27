"use client";
import { useId, useState } from "react";
import { clubStyle, type Pattern } from "@/lib/clubs";
import KITS from "@/data/kits.json";
import LOCAL_IMAGES from "@/data/images-local.json";
import { REAL_CRESTS } from "@/lib/site";
import { PatternFill } from "./PatternFill";
import { isLight } from "./Crest";

const SHIRT = "M30 6 L42 2 Q50 9 58 2 L70 6 L96 22 L86 42 L76 37 L76 96 L24 96 L24 37 L14 42 L4 22 Z";

/** Camiseta ilustrada con el patrón del club y el dorsal (o un texto corto, p. ej. "DT"). */
export function Kit({ club, label, size = 96, hidden = false, real = true, colors, pattern }: { club: string; label: string | number; size?: number; hidden?: boolean; real?: boolean; colors?: [string, string, string?]; pattern?: Pattern }) {
  const id = useId().replace(/:/g, "");
  const [broken, setBroken] = useState(false);
  // Camiseta real (TheSportsDB, copiada al sitio si está disponible).
  const local = (LOCAL_IMAGES as { kits?: Record<string, string> }).kits?.[club];
  const remote = (KITS as Record<string, string>)[club];
  const src = real && REAL_CRESTS && !hidden && !colors ? local ?? remote : undefined;
  if (src && !broken)
    return (
      <span className="kit kit-real" style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
        {label !== "" && <b className="kit-num" style={{ fontSize: Math.max(10, size * 0.18) }}>{label}</b>}
      </span>
    );
  const s0 = clubStyle(club);
  const s = colors ? { ...s0, colors, pattern: pattern ?? s0.pattern } : s0;
  const [base, accent] = hidden ? ["var(--surface-2)", "var(--surface-2)"] : s.colors;
  const numberColor = hidden ? "var(--accent)" : isLight(base) ? (s.colors[2] ?? "#111") : "#fff";
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
        style={{ fill: numberColor }}
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
