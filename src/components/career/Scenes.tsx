"use client";
import { useEffect, useId, useState } from "react";
import { clubStyle } from "@/lib/clubs";

/* Escenas ilustradas de los minijuegos: arco con tribuna, arquero, barrera, pelota y cancha vista de arriba. */

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 5);
const KEEPER_KITS = ["#c8f03c", "#ff8a1c", "#22c9e0", "#ff4f9a", "#ffd21f", "#9b6bff"];

/** Colores de un club (camiseta, detalle). Si no hay club, colores neutros. */
export function kitOf(club?: string, fallback: [string, string] = ["#d23a3a", "#ffffff"]): [string, string] {
  if (!club) return fallback;
  const c = clubStyle(club).colors;
  return [c[0], c[1] ?? c[0]];
}
/** El arquero rival usa un color fuerte que no se confunda con su equipo. */
export function keeperKitOf(club?: string): string {
  const base = kitOf(club)[0].toLowerCase();
  const list = KEEPER_KITS.filter((k) => k !== base);
  return list[hash(club ?? "x") % list.length];
}

/* ---------- Pelota ---------- */
const PENT = "M0 -2.3 L2.19 -0.71 L1.35 1.86 L-1.35 1.86 L-2.19 -0.71 Z";
const OUTER: [number, number][] = [[0, -5.7], [5.42, -1.76], [3.35, 4.61], [-3.35, 4.61], [-5.42, -1.76]];
export function BallShape({ id, r = 6 }: { id: string; r?: number }) {
  return (
    <g transform={`scale(${r / 6})`}>
      <circle r="6" fill="#fdfdfd" />
      <g clipPath={`url(#bc${id})`} fill="#16181d">
        <path d={PENT} />
        {OUTER.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.9" />)}
        <g stroke="#16181d" strokeWidth="0.45">
          {OUTER.map(([x, y], i) => {
            const p = PENT.match(/-?\d+(\.\d+)?/g)!.map(Number);
            return <line key={i} x1={p[i * 2]} y1={p[i * 2 + 1]} x2={x * 0.8} y2={y * 0.8} />;
          })}
        </g>
      </g>
      <circle r="6" fill={`url(#bs${id})`} />
      <circle r="6" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="0.5" />
    </g>
  );
}
function BallDefs({ id }: { id: string }) {
  return (
    <>
      <clipPath id={`bc${id}`}><circle r="6" /></clipPath>
      <radialGradient id={`bs${id}`} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.38" />
      </radialGradient>
    </>
  );
}

/* ---------- Arquero (de frente) ---------- */
export type KeeperPose = "ready" | "dive" | "jump";
export function KeeperFigure({ color, pose = "ready", trim = "#14161c" }: { color: string; pose?: KeeperPose; trim?: string }) {
  const up = pose !== "ready";
  const arm = (side: 1 | -1) =>
    up ? `M${side * 8} -41 L${side * 9} -51 L${side * 7} -60` : `M${side * 8.5} -40 L${side * 16} -33 L${side * 19.5} -25`;
  const hand = (side: 1 | -1): [number, number] => (up ? [side * 7, -61.5] : [side * 20, -23.5]);
  const legs = pose === "dive" ? ["M-3 -19 L-4 -10 L-2.5 -2", "M3 -19 L5 -10 L7 -3"] : ["M-4 -19 L-8 -10 L-10 -2", "M4 -19 L8 -10 L10 -2"];
  return (
    <g>
      {/* piernas: medias y botines */}
      {legs.map((d, i) => <path key={i} d={d} fill="none" stroke="#1d2129" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />)}
      {legs.map((d, i) => {
        const end = d.split(" L").pop()!.split(" ").map(Number);
        return <ellipse key={`b${i}`} cx={end[0] + (i ? 1 : -1)} cy={end[1] + 1} rx="3.4" ry="1.8" fill="#0b0c10" />;
      })}
      {/* short */}
      <path d="M-8.6 -27 H8.6 L9.6 -18 H1.2 L0 -20.5 L-1.2 -18 H-9.6 Z" fill={trim} />
      {/* brazos */}
      {[-1, 1].map((sd) => <path key={sd} d={arm(sd as 1 | -1)} fill="none" stroke={color} strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />)}
      {[-1, 1].map((sd) => <path key={`s${sd}`} d={arm(sd as 1 | -1)} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="0 6 30" />)}
      {/* torso */}
      <path d="M-9.5 -42 Q0 -45.5 9.5 -42 L10 -26.5 Q0 -25 -10 -26.5 Z" fill={color} />
      <path d="M-9.5 -42 Q-6 -34 -10 -26.5 L-7.5 -26.3 Q-5 -34 -7 -42.6 Z M9.5 -42 Q6 -34 10 -26.5 L7.5 -26.3 Q5 -34 7 -42.6 Z" fill="rgba(0,0,0,0.2)" />
      <path d="M-9.5 -36 H9.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.1" />
      <path d="M-3.2 -43.8 Q0 -40.5 3.2 -43.8" fill="none" stroke={trim} strokeWidth="1.4" />
      {/* guantes */}
      {[-1, 1].map((sd) => {
        const [x, y] = hand(sd as 1 | -1);
        return <g key={`g${sd}`}><circle cx={x} cy={y} r="3.6" fill="#f6f7f9" stroke="#9aa3b2" strokeWidth="0.6" /><path d={`M${x - 2} ${y + 1.4} H${x + 2}`} stroke={color} strokeWidth="1.1" /></g>;
      })}
      {/* cabeza */}
      <rect x="-1.8" y="-47.5" width="3.6" height="3.5" fill="#d9a77c" />
      <circle cx="0" cy="-50.5" r="5" fill="#e8b88f" />
      <path d="M-5.1 -51 Q-5 -57 0 -56.6 Q5 -57 5.1 -51 Q3 -54 0 -54 Q-3 -54 -5.1 -51 Z" fill="#3a2617" />
    </g>
  );
}

/* ---------- Jugador de la barrera (de frente, manos cubriendo) ---------- */
function WallPlayer({ color, trim }: { color: string; trim: string }) {
  return (
    <g>
      <path d="M-2.6 -9 L-3 -1 M2.6 -9 L3 -1" stroke="#1d2129" strokeWidth="3.4" strokeLinecap="round" />
      <ellipse cx="-3.3" cy="0" rx="2.6" ry="1.3" fill="#0b0c10" /><ellipse cx="3.3" cy="0" rx="2.6" ry="1.3" fill="#0b0c10" />
      <path d="M-6 -14.5 H6 L6.6 -8 H-6.6 Z" fill={trim} />
      <path d="M-7 -27 Q0 -29.5 7 -27 L6.6 -14 Q0 -13 -6.6 -14 Z" fill={color} />
      <path d="M-7 -27 L-9 -19 L-3 -14.5 M7 -27 L9 -19 L3 -14.5" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M-7 -27 L-9 -19 L-3 -14.5 M7 -27 L9 -19 L3 -14.5" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0 8 40" />
      <circle cx="-1.6" cy="-14" r="2" fill="#e2b089" /><circle cx="1.6" cy="-14" r="2" fill="#e2b089" />
      <circle cx="0" cy="-32" r="4.3" fill="#e2b089" />
      <path d="M-4.4 -32.5 Q-4.2 -37.4 0 -37 Q4.2 -37.4 4.4 -32.5 Q2.5 -35 0 -35 Q-2.5 -35 -4.4 -32.5 Z" fill="#2a1d14" />
    </g>
  );
}

/* ---------- Arco con tribuna ---------- */
export type GoalZone = "TL" | "TR" | "BL" | "BR" | "C" | "CH" | "UNDER";
export const GOAL_XY: Record<GoalZone, [number, number]> = {
  TL: [50, 30], TR: [150, 30], BL: [52, 73], BR: [148, 73], C: [100, 70], CH: [100, 38], UNDER: [100, 79],
};
export type KeeperSide = "idle" | "L" | "C" | "R";
export interface KeeperPlace { x: number; y: number; rot?: number; scale?: number; pose?: KeeperPose }

function keeperPlace(side: KeeperSide, high: boolean): KeeperPlace {
  if (side === "idle") return { x: 100, y: 82, pose: "ready" };
  if (side === "C") return high ? { x: 100, y: 74, pose: "jump" } : { x: 100, y: 82, pose: "ready" };
  const s = side === "L" ? -1 : 1;
  return high ? { x: 100 + s * 16, y: 70, rot: s * 52, pose: "dive" } : { x: 100 + s * 12, y: 83, rot: s * 78, pose: "dive" };
}

export function GoalScene({
  keeper = "idle", place, ball, ballFrom = [100, 122], result, wall, wallJump, keeperColor = "#c8f03c", wallKit, targets, onTarget, small, aim, run,
}: {
  /** Mano a mano: sin punto penal y con líneas de velocidad. */
  run?: boolean;
  /** Mira sobre la zona elegida (antes de patear). */
  aim?: GoalZone;
  keeper?: KeeperSide;
  /** Posición libre del arquero (mano a mano). */
  place?: KeeperPlace;
  /** A dónde va la pelota (undefined = en el punto). */
  ball?: GoalZone | [number, number];
  ballFrom?: [number, number];
  result?: boolean | null;
  wall?: boolean;
  wallJump?: boolean;
  keeperColor?: string;
  wallKit?: [string, string];
  /** Zonas tocables del arco. */
  targets?: GoalZone[];
  onTarget?: (z: GoalZone) => void;
  small?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const to = ball ? (Array.isArray(ball) ? ball : GOAL_XY[ball]) : null;
  const high = !!to && to[1] < 50;
  const kp = place ?? keeperPlace(keeper, high);
  // La pelota sale después de un instante para que se vea el recorrido.
  const [fly, setFly] = useState(false);
  useEffect(() => { if (!to) { setFly(false); return; } const t = setTimeout(() => setFly(true), 30); return () => clearTimeout(t); }, [to?.[0], to?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  const [bx, by] = fly && to ? to : ballFrom;
  const bscale = fly && to ? 0.5 : 1;
  const wk = wallKit ?? ["#d23a3a", "#ffffff"];
  return (
    <svg viewBox="0 0 200 140" className={`scene goal-scene ${small ? "small" : ""} ${result === true ? "sc-goal" : result === false ? "sc-miss" : ""}`} aria-hidden={!targets}>
      <defs>
        <linearGradient id={`st${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070a12" /><stop offset="1" stopColor="#1a2236" /></linearGradient>
        <pattern id={`cr${id}`} width="7" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.6" cy="1.6" r="1.25" fill="#9aa6c2" fillOpacity="0.28" />
          <circle cx="5.1" cy="3.8" r="1.25" fill="var(--accent)" fillOpacity="0.35" />
          <circle cx="5.2" cy="1.2" r="0.9" fill="#fff" fillOpacity="0.12" />
        </pattern>
        <radialGradient id={`fl${id}`} cx="0.5" cy="0" r="0.9"><stop offset="0" stopColor="#fff" stopOpacity="0.32" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <linearGradient id={`ad${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="var(--accent)" /><stop offset="0.5" stopColor="#ffffff" stopOpacity="0.85" /><stop offset="1" stopColor="var(--accent)" /></linearGradient>
        <pattern id={`net${id}`} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 2.5 L2.5 0 L5 2.5 L2.5 5 Z" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.35" /></pattern>
        <linearGradient id={`gr${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0.25" /><stop offset="0.4" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.15" /></linearGradient>
        <BallDefs id={id} />
      </defs>
      {/* Tribuna */}
      <rect width="200" height="46" fill={`url(#st${id})`} />
      <rect width="200" height="38" fill={`url(#cr${id})`} />
      <ellipse cx="18" cy="0" rx="55" ry="34" fill={`url(#fl${id})`} />
      <ellipse cx="182" cy="0" rx="55" ry="34" fill={`url(#fl${id})`} />
      {/* Cartel LED */}
      <rect y="37" width="200" height="8" fill="#0c111c" />
      <rect y="38" width="200" height="6" fill={`url(#ad${id})`} opacity="0.85" />
      <text x="100" y="42.9" textAnchor="middle" fontSize="4.4" fontWeight="900" fill="#0c111c" letterSpacing="2.2" style={{ fontFamily: "var(--display), Impact, sans-serif" }}>FÚTBOL DE PRIMERA · FÚTBOL DE PRIMERA · FÚTBOL DE PRIMERA</text>
      {/* Césped con franjas en perspectiva */}
      <rect y="45" width="200" height="95" fill="#1f7f45" />
      {[[45, 53], [62, 73], [86, 102], [121, 140]].map(([a, b]) => <rect key={a} y={a} width="200" height={b - a} fill="#24914f" />)}
      <rect y="45" width="200" height="95" fill={`url(#gr${id})`} />
      <line x1="0" y1="82.5" x2="200" y2="82.5" stroke="#fff" strokeOpacity="0.9" strokeWidth="1" />
      <path d="M14 82.5 L4 98 H196 L186 82.5" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.9" />
      {!run && <ellipse cx="100" cy="124" rx="3" ry="1.1" fill="#fff" opacity="0.85" />}
      {!run && <path d="M70 140 Q100 128 130 140" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.9" />}
      {run && !fly && (
        <g className="sc-speed" stroke="#fff" strokeLinecap="round" strokeOpacity="0.7">
          <line x1="86" y1="136" x2="92" y2="130" strokeWidth="1.2" /><line x1="114" y1="136" x2="108" y2="130" strokeWidth="1.2" />
          <line x1="80" y1="128" x2="88" y2="124" strokeWidth="1" /><line x1="120" y1="128" x2="112" y2="124" strokeWidth="1" />
        </g>
      )}
      {/* Sombra del arco */}
      <ellipse cx="100" cy="84" rx="72" ry="3" fill="#000" opacity="0.22" />
      {/* Red */}
      <g className="sc-net">
        <path d="M34 18 H166 V82 H34 Z" fill={`url(#net${id})`} />
        <path d="M42 25 H158 V76 H42 Z" fill="rgba(0,0,0,0.22)" />
        <path d="M42 25 H158 V76 H42 Z" fill={`url(#net${id})`} />
        <path d="M34 18 L42 25 M166 18 L158 25 M34 82 L42 76 M166 82 L158 76" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.5" />
        <path d="M34 18 L42 25 V76 L34 82 Z M166 18 L158 25 V76 L166 82 Z" fill="rgba(0,0,0,0.18)" />
      </g>
      {/* Palos */}
      <path d="M35.2 83 V19.2 H167.2 V83" fill="none" stroke="#8d97a6" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M34 83 V18 H166 V83" fill="none" stroke="#fdfdfd" strokeWidth="3.2" strokeLinejoin="round" />
      {/* Arquero */}
      <ellipse className="sc-keeper" cx="0" cy="0" rx="12" ry="2.4" fill="#000" opacity="0.3" style={{ transform: `translate(${kp.x}px, ${(kp.y > 80 ? kp.y : 83) + 1}px) scale(${kp.scale ?? 1})` }} />
      <g className="sc-keeper" style={{ transform: `translate(${kp.x}px, ${kp.y}px) rotate(${kp.rot ?? 0}deg) scale(${kp.scale ?? 1})` }}>
        <KeeperFigure color={keeperColor} pose={kp.pose} />
      </g>
      {/* Barrera */}
      {wall && (
        <g>
          {[84, 94.5, 105, 115.5].map((x, i) => (
            <g key={x} className="sc-wall" style={{ transform: `translate(${x}px, ${wallJump ? 96 : 106}px)`, transitionDelay: `${i * 30}ms` }}>
              <ellipse cx="0" cy={wallJump ? 10 : 0} rx="7" ry="1.6" fill="#000" opacity="0.28" />
              <WallPlayer color={wk[0]} trim={wk[1] === wk[0] ? "#14161c" : wk[1]} />
            </g>
          ))}
        </g>
      )}
      {/* Pelota */}
      {!fly && <ellipse cx={ballFrom[0]} cy={ballFrom[1] + 5.5} rx="5.6" ry="1.6" fill="#000" opacity="0.35" />}
      <g className="sc-ball" style={{ transform: `translate(${bx}px, ${by}px) scale(${bscale})` }}>
        <g className={fly ? "sc-spin" : ""}><BallShape id={id} /></g>
      </g>
      {aim && (
        <g className="sc-aim" style={{ transform: `translate(${GOAL_XY[aim][0]}px, ${GOAL_XY[aim][1]}px)` }}>
          <circle r="7" fill="none" stroke="#fff" strokeWidth="1.2" />
          <circle r="2" fill="#ff4d4d" />
          <path d="M-11 0 H-4 M4 0 H11 M0 -11 V-4 M0 4 V11" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}
      {/* Zonas tocables */}
      {targets && onTarget && targets.map((z) => {
        const [x, y] = GOAL_XY[z];
        return (
          <g key={z} className="sc-target" role="button" aria-label={`Patear a ${z}`} onClick={() => onTarget(z)}>
            <circle cx={x} cy={y} r="10" fill="transparent" />
            <circle cx={x} cy={y} r="5" fill="none" stroke="#fff" strokeWidth="0.9" strokeDasharray="2 1.6" />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Cancha vista de arriba ---------- */
export function PlayerToken({ x, y, color, trim = "#14161c", label, ring, faded, onClick, glow }: { x: number; y: number; color: string; trim?: string; label?: string | number; ring?: string; faded?: boolean; onClick?: () => void; glow?: boolean }) {
  return (
    <g className={`sc-token ${onClick ? "tap" : ""} ${glow ? "glow" : ""}`} style={{ transform: `translate(${x}px, ${y}px)`, opacity: faded ? 0.5 : 1 }} onClick={onClick} role={onClick ? "button" : undefined}>
      {onClick && <circle r="7" fill="transparent" />}
      {glow && <circle className="sc-pulse" r="5.5" fill="none" stroke="#fff" strokeWidth="0.8" />}
      <ellipse cx="0.7" cy="1.2" rx="4.2" ry="3.6" fill="#000" opacity="0.32" />
      <circle r="3.8" fill={trim} />
      <circle r="2.9" fill={color} />
      <path d="M-2.9 0 A2.9 2.9 0 0 1 2.9 0" fill="#fff" opacity="0.16" />
      <circle r="3.8" fill="none" stroke={ring ?? "rgba(0,0,0,0.55)"} strokeWidth={ring ? 1 : 0.4} />
      {label !== undefined && (
        <g transform="translate(0 -6.2)">
          <circle r="2.6" fill="#fff" stroke="#111" strokeWidth="0.4" />
          <text y="1.1" textAnchor="middle" fontSize="3.2" fontWeight="900" fill="#111">{label}</text>
        </g>
      )}
    </g>
  );
}

/** Media cancha de ataque (arco arriba). viewBox 0 0 100 80. */
export function PitchScene({ children, corner }: { children?: React.ReactNode; corner?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 -1 100 73" className="scene pitch-scene">
      <defs>
        <pattern id={`net${id}`} width="1.6" height="1.6" patternUnits="userSpaceOnUse"><path d="M0 0.8 H1.6 M0.8 0 V1.6" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.2" /></pattern>
        <radialGradient id={`vg${id}`} cx="0.5" cy="0.4" r="0.8"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.35" /></radialGradient>
      </defs>
      <rect width="100" height="80" fill="#1f7f45" />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={i * 20} width="10" height="80" fill="#24914f" />)}
      <g stroke="#fff" strokeOpacity="0.85" strokeWidth="0.55" fill="none">
        <rect x="1.5" y="3" width="97" height="90" />
        <path d="M30 80 A20 20 0 0 1 70 80" />
        <rect x="20" y="3" width="60" height="28" />
        <rect x="36" y="3" width="28" height="10" />
        <path d="M40 31 A12 12 0 0 0 60 31" />
        {corner && <path d="M1.5 6 A3 3 0 0 0 4.5 3" />}
      </g>
      <circle cx="50" cy="22" r="0.7" fill="#fff" />
      <rect x="43" y="0" width="14" height="3" fill={`url(#net${id})`} />
      <path d="M43 3 V0.2 H57 V3" fill="none" stroke="#fff" strokeWidth="0.9" />
      <rect width="100" height="80" fill={`url(#vg${id})`} pointerEvents="none" />
      {children}
    </svg>
  );
}

/** Pelota que se mueve por la cancha de arriba (con efecto de altura). */
export function PitchBall({ x, y, lofted, size = 1.7 }: { x: number; y: number; lofted?: boolean; size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <g className="sc-pball" style={{ transform: `translate(${x}px, ${y}px)` }}>
      <defs><BallDefs id={id} /></defs>
      <ellipse cx="0.5" cy="1" rx={size} ry={size * 0.6} fill="#000" opacity="0.3" />
      <g className={lofted ? "sc-loft" : ""}><BallShape id={id} r={size} /></g>
    </g>
  );
}
