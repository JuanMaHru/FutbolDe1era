import type { Tier } from "@/lib/career/awards";

const RING: Record<Tier, [string, string, string]> = {
  bronce: ["#f0b27a", "#b8733a", "#6e3f17"],
  plata: ["#ffffff", "#c9d3df", "#7d8a99"],
  oro: ["#fff2b0", "#f4c542", "#a8790a"],
  leyenda: ["#e9d5ff", "#a855f7", "#4c1d95"],
};

/** Medalla de logro: anillo según categoría, emoji al centro y cinta. */
export function Badge({ icon, tier, size = 72, locked = false }: { icon: string; tier: Tier; size?: number; locked?: boolean }) {
  const [a, b, c] = RING[tier];
  const id = `bd-${tier}`;
  return (
    <span className={`badge badge-${tier} ${locked ? "locked" : ""}`} style={{ width: size, height: size * 1.15 }}>
      <svg viewBox="0 0 100 115" width={size} height={size * 1.15} aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="0.5" stopColor={b} /><stop offset="1" stopColor={c} /></linearGradient>
        </defs>
        <path d="M30 70 L18 112 L36 104 L44 114 L50 78 Z" fill={c} />
        <path d="M70 70 L82 112 L64 104 L56 114 L50 78 Z" fill={b} />
        <circle cx="50" cy="48" r="44" fill={`url(#${id})`} />
        <circle cx="50" cy="48" r="35" fill="#141a2e" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
        {tier === "leyenda" && [0, 60, 120, 180, 240, 300].map((r) => <circle key={r} cx={50 + 40 * Math.cos((r * Math.PI) / 180)} cy={48 + 40 * Math.sin((r * Math.PI) / 180)} r="3" fill="#fff" />)}
      </svg>
      <span className="badge-icon" style={{ fontSize: size * 0.34, top: size * 0.3 }}>{locked ? "🔒" : icon}</span>
    </span>
  );
}
