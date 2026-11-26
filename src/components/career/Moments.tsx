"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { makeQuestion, type Question } from "@/lib/career/trivia";
import type { MomentKind } from "@/lib/career/engine";
import { play } from "@/lib/sound";

export interface MomentProps {
  /** 0.1 fácil … 0.9 difícil */
  d: number;
  /** +0.15 si es la jugada del perfil del jugador */
  bonus: number;
  foot: string;
  onDone: (ok: boolean) => void;
}
const clamp01 = (x: number) => Math.max(0.03, Math.min(0.97, x));
const finish = (ok: boolean, onDone: (ok: boolean) => void, delay = 1300) => {
  play(ok ? "hit" : "near");
  setTimeout(() => onDone(ok), delay);
};

/* ---------- Arco con arquero (penales y tiros libres) ---------- */
type Zone = "TL" | "TR" | "BL" | "BR" | "C" | "CH" | "UNDER";
const ZONE_XY: Record<Zone, [number, number]> = { TL: [22, 22], TR: [78, 22], BL: [22, 58], BR: [78, 58], C: [50, 58], CH: [50, 20], UNDER: [50, 72] };

function Goal({ keeper, ball, wall, result }: { keeper: "L" | "C" | "R" | "idle"; ball?: Zone; wall?: boolean; result?: boolean | null }) {
  const kx = keeper === "L" ? 28 : keeper === "R" ? 72 : 50;
  const rot = keeper === "L" ? -60 : keeper === "R" ? 60 : 0;
  const [bx, by] = ball ? ZONE_XY[ball] : [50, 94];
  return (
    <svg viewBox="0 0 100 100" className={`goal-svg ${result ? "net-hit" : result === false ? "net-miss" : ""}`} aria-hidden>
      <rect x="0" y="0" width="100" height="100" fill="#1b6d3c" />
      <g className="net" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5">
        {Array.from({ length: 12 }, (_, i) => <line key={`v${i}`} x1={8 + i * 7.7} y1="8" x2={8 + i * 7.7} y2="72" />)}
        {Array.from({ length: 8 }, (_, i) => <line key={`h${i}`} x1="8" y1={8 + i * 9} x2="92" y2={8 + i * 9} />)}
      </g>
      <rect x="6" y="6" width="88" height="68" fill="none" stroke="#fff" strokeWidth="2.6" />
      <line x1="0" y1="74" x2="100" y2="74" stroke="#fff" strokeWidth="0.8" />
      <g className="keeper" style={{ transform: `translate(${kx}px, 48px) rotate(${rot}deg)` }}>
        <rect x="-5" y="-16" width="10" height="20" rx="4" fill="var(--accent)" />
        <circle cx="0" cy="-20" r="4" fill="#f1c9a0" />
        <rect x="-13" y="-14" width="8" height="3" rx="1.5" fill="var(--accent)" />
        <rect x="5" y="-14" width="8" height="3" rx="1.5" fill="var(--accent)" />
        <rect x="-4" y="4" width="3" height="12" fill="#222" /><rect x="1" y="4" width="3" height="12" fill="#222" />
      </g>
      {wall && (
        <g>{[38, 45, 52, 59].map((x) => <g key={x}><rect x={x - 3} y="78" width="6" height="14" rx="2" fill="#c33" /><circle cx={x} cy="75" r="3" fill="#f1c9a0" /></g>)}</g>
      )}
      <circle className="ball" cx={bx} cy={by} r="3.6" fill="#fff" stroke="#111" strokeWidth="0.8" style={{ transition: "cx .5s ease-out, cy .5s ease-out" }} />

    </svg>
  );
}

/* ---------- Penal: patear ---------- */
export function PenaltyShoot({ d, bonus, onDone, title = "¡Penal!" }: MomentProps & { title?: string }) {
  const tendency = useMemo(() => (Math.random() < 0.5 ? "L" : "R") as "L" | "R", []);
  const showHint = useMemo(() => Math.random() < 0.5 + bonus * 2, [bonus]);
  const [shot, setShot] = useState<Zone | null>(null);
  const [keeper, setKeeper] = useState<"L" | "C" | "R" | "idle">("idle");
  const [res, setRes] = useState<boolean | null>(null);
  const shoot = (z: Zone) => {
    if (shot) return;
    const r = Math.random();
    const k: "L" | "C" | "R" = r < 0.18 ? "C" : r < 0.18 + 0.52 ? tendency : tendency === "L" ? "R" : "L";
    setShot(z);
    play("kick");
    setTimeout(() => setKeeper(k), 120);
    const side = z === "TL" || z === "BL" ? "L" : z === "TR" || z === "BR" ? "R" : "C";
    const high = z === "TL" || z === "TR";
    let ok: boolean;
    if (z === "CH") ok = k !== "C" ? Math.random() < 0.95 : Math.random() < 0.08; // picarla
    else if (side === "C") ok = k !== "C" ? Math.random() < 0.9 : Math.random() < 0.1;
    else {
      const miss = high ? 0.1 + d * 0.15 - bonus : 0.03;
      if (Math.random() < miss) ok = false;
      else if (k === side) ok = Math.random() < (high ? 0.62 : 0.28) + bonus;
      else ok = true;
    }
    setTimeout(() => { setRes(ok); finish(ok, onDone, 650); }, 600);
  };
  const OPTS: [Zone, string][] = [["TL", "↖ Ángulo izq."], ["CH", "🥄 Picarla"], ["TR", "Ángulo der. ↗"], ["BL", "↙ Abajo izq."], ["C", "Al medio"], ["BR", "Abajo der. ↘"]];
  return (
    <div className="moment">
      <p className="moment-title">⚽ {title}</p>
      <p className="muted small" style={{ margin: 0 }}>
        {showHint ? `👀 Dato: el arquero suele tirarse a su ${tendency === "L" ? "izquierda (tu derecha)" : "derecha (tu izquierda)"}.` : "Elegí dónde patear. Los ángulos son difíciles de atajar pero podés errarlo."}
      </p>
      <Goal keeper={keeper} ball={shot ?? undefined} result={res} />
      <div className="zone-grid">
        {OPTS.map(([z, label]) => (
          <button key={z} className="btn zone-btn" disabled={!!shot} onClick={() => shoot(z === "TL" ? "TL" : z)}>{label}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Penal: atajar ---------- */
export function PenaltySave({ d, bonus, onDone, title = "Penal en contra" }: MomentProps & { title?: string }) {
  const shooter = useMemo(() => {
    const foot = Math.random() < 0.75 ? "derecho" : "zurdo";
    // Un derecho suele abrir el pie hacia la izquierda del arquero, un zurdo al revés.
    const fav: "L" | "R" = foot === "derecho" ? "R" : "L";
    return { foot, fav };
  }, []);
  const [dive, setDive] = useState<"L" | "C" | "R" | null>(null);
  const [ball, setBall] = useState<Zone | undefined>();
  const [res, setRes] = useState<boolean | null>(null);
  const go = (k: "L" | "C" | "R") => {
    if (dive) return;
    setDive(k);
    play("kick");
    const r = Math.random();
    const to: "L" | "C" | "R" = r < 0.14 ? "C" : r < 0.14 + 0.5 ? shooter.fav : shooter.fav === "L" ? "R" : "L";
    const high = Math.random() < 0.35;
    setBall(to === "C" ? "C" : to === "L" ? (high ? "TL" : "BL") : high ? "TR" : "BR");
    let saved: boolean;
    if (Math.random() < 0.07) saved = true; // la tiró afuera
    else if (to === k) saved = Math.random() < (to === "C" ? 0.92 : high ? 0.45 : 0.78) + bonus - (d - 0.5) * 0.2;
    else saved = false;
    setTimeout(() => { setRes(!saved); finish(saved, onDone, 650); }, 600);
  };
  return (
    <div className="moment">
      <p className="moment-title">🧤 {title}</p>
      <p className="muted small" style={{ margin: 0 }}>
        Patea un <b>{shooter.foot}</b>{bonus > 0 ? ` — lo estudiaste: suele patear a tu ${shooter.fav === "L" ? "izquierda" : "derecha"}` : ""}. ¿Para dónde te tirás?
      </p>
      <Goal keeper={dive ?? "idle"} ball={ball} result={res} />
      <div className="zone-grid three">
        <button className="btn zone-btn" disabled={!!dive} onClick={() => go("L")}>⬅ Izquierda</button>
        <button className="btn zone-btn" disabled={!!dive} onClick={() => go("C")}>Me quedo</button>
        <button className="btn zone-btn" disabled={!!dive} onClick={() => go("R")}>Derecha ➡</button>
      </div>
    </div>
  );
}

/* ---------- Tiro libre: patear (elegir + potencia) ---------- */
export function FreeKick({ d, bonus, foot, onDone }: MomentProps) {
  const keeperSide = useMemo(() => (Math.random() < 0.5 ? "L" : "R") as "L" | "R", []);
  const wallJumps = useMemo(() => Math.random() < 0.5, []);
  const [choice, setChoice] = useState<Zone | null>(null);
  const [res, setRes] = useState<boolean | null>(null);
  const [pos, setPos] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!choice || res !== null) return;
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const x = ((t - t0) / 1000) * (1.1 + d * 0.8);
      setPos(Math.abs((((x % 2) + 2) % 2) - 1));
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [choice, res, d]);
  const zone = 0.22 + bonus * 0.6 - (d - 0.5) * 0.15;
  const lo = 0.7 - zone / 2, hi = 0.7 + zone / 2;
  const kick = () => {
    if (!choice || res !== null) return;
    cancelAnimationFrame(raf.current);
    const good = pos >= lo && pos <= hi;
    play("kick");
    // Calidad según dónde está el arquero y si la barrera salta.
    const freeSide = keeperSide === "L" ? "R" : "L";
    let p = choice === "UNDER" ? (wallJumps ? 0.7 : 0.08) : choice === "TL" || choice === "TR" ? ((choice === "TL" ? "L" : "R") === freeSide ? 0.62 : 0.3) : 0.35;
    if (foot === "ambidiestro") p += 0.05;
    p += good ? 0.2 : -0.35;
    const ok = Math.random() < clamp01(p);
    setTimeout(() => { setRes(ok); finish(ok, onDone, 650); }, 500);
  };
  return (
    <div className="moment">
      <p className="moment-title">🎯 Tiro libre al borde del área</p>
      <p className="muted small" style={{ margin: 0 }}>
        El arquero se para cargado a su {keeperSide === "L" ? "izquierda (tu derecha)" : "derecha (tu izquierda)"}. {choice ? "Ahora la potencia: soltá en la zona verde." : "¿A dónde le pegás?"}
      </p>
      <Goal keeper={res === null ? "idle" : keeperSide} ball={res !== null && choice ? choice : undefined} wall result={res} />
      {!choice ? (
        <div className="zone-grid three">
          <button className="btn zone-btn" onClick={() => { play("click"); setChoice("TL"); }}>↖ Ángulo izq.</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setChoice("UNDER"); }}>⤵ Por abajo de la barrera</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setChoice("TR"); }}>Ángulo der. ↗</button>
        </div>
      ) : (
        <>
          <div className="timing" onClick={kick} role="button" aria-label="Patear">
            <div className="timing-zone" style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }} />
            <div className="timing-cursor" style={{ left: `${pos * 100}%` }} />
          </div>
          {res === null && <button className="btn btn-primary big-cta" onClick={kick}>¡Patear!</button>}
        </>
      )}
    </div>
  );
}

/* ---------- Tiro libre: atajar ---------- */
export function FreeKickSave({ d, bonus, onDone }: MomentProps) {
  const shooterFoot = useMemo(() => (Math.random() < 0.7 ? "derecho" : "zurdo"), []);
  const target = useMemo(() => {
    const r = Math.random();
    return r < 0.45 ? "far" : r < 0.8 ? "wall" : "under";
  }, []);
  const [pick, setPick] = useState<string | null>(null);
  const [res, setRes] = useState<boolean | null>(null);
  const go = (k: string) => {
    if (pick) return;
    setPick(k);
    play("kick");
    const saved = k === target ? Math.random() < 0.8 + bonus - (d - 0.5) * 0.2 : Math.random() < 0.15;
    setTimeout(() => { setRes(!saved); finish(saved, onDone, 650); }, 600);
  };
  const ball: Zone = target === "far" ? "TR" : target === "wall" ? "TL" : "BL";
  return (
    <div className="moment">
      <p className="moment-title">🧤 Tiro libre en contra</p>
      <p className="muted small" style={{ margin: 0 }}>Va a patear un <b>{shooterFoot}</b>. ¿Qué palo cubrís?</p>
      <Goal keeper={pick === "far" ? "R" : pick === "wall" || pick === "under" ? "L" : "idle"} ball={res !== null ? ball : undefined} wall result={res} />
      <div className="zone-grid three">
        <button className="btn zone-btn" disabled={!!pick} onClick={() => go("wall")}>Palo de la barrera</button>
        <button className="btn zone-btn" disabled={!!pick} onClick={() => go("under")}>Abajo (por si pasa por abajo)</button>
        <button className="btn zone-btn" disabled={!!pick} onClick={() => go("far")}>Mi palo</button>
      </div>
    </div>
  );
}

/* ---------- Mano a mano: elegir cómo definir ---------- */
const KEEPER_STATES = [
  { id: "adelantado", text: "El arquero salió a achicar, está adelantado.", odds: { cruzado: 0.45, palo: 0.35, vaselina: 0.85, gambeta: 0.7 } },
  { id: "linea", text: "El arquero se quedó parado en la línea.", odds: { cruzado: 0.78, palo: 0.6, vaselina: 0.15, gambeta: 0.35 } },
  { id: "cargado", text: "El arquero está cargado hacia el primer palo.", odds: { cruzado: 0.85, palo: 0.2, vaselina: 0.4, gambeta: 0.55 } },
  { id: "tirado", text: "El arquero se tiró antes de tiempo.", odds: { cruzado: 0.35, palo: 0.5, vaselina: 0.6, gambeta: 0.85 } },
] as const;
export function Placement({ d, bonus, onDone }: MomentProps) {
  const st = useMemo(() => KEEPER_STATES[Math.floor(Math.random() * KEEPER_STATES.length)], []);
  const [res, setRes] = useState<boolean | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const go = (k: keyof typeof st.odds) => {
    if (choice) return;
    setChoice(k);
    play("kick");
    const ok = Math.random() < clamp01(st.odds[k] + bonus - (d - 0.5) * 0.3);
    setTimeout(() => { setRes(ok); finish(ok, onDone, 650); }, 400);
  };
  const kx = st.id === "cargado" ? 34 : 50, ky = st.id === "adelantado" ? 46 : st.id === "linea" ? 20 : 28;
  return (
    <div className="moment">
      <p className="moment-title">🏃 Mano a mano</p>
      <p className="muted small" style={{ margin: 0 }}>{st.text} ¿Cómo la definís?</p>
      <svg viewBox="0 0 100 80" className="mini-pitch" aria-hidden>
        <rect width="100" height="80" fill="#1b6d3c" />
        <rect x="20" y="0" width="60" height="30" fill="none" stroke="#fff" strokeWidth="0.8" />
        <rect x="36" y="0" width="28" height="10" fill="none" stroke="#fff" strokeWidth="0.8" />
        <rect x="40" y="-1" width="20" height="3" fill="#fff" />
        <g style={{ transform: `translate(${kx}px, ${ky}px) rotate(${st.id === "tirado" ? -70 : 0}deg)`, transition: "transform .3s" }}>
          <circle r="4" fill="var(--accent)" stroke="#111" strokeWidth="0.6" />
        </g>
        <circle cx="50" cy="66" r="4" fill="#fff" stroke="#111" strokeWidth="0.6" />
        <circle cx="54" cy="61" r="1.8" fill="#fff" stroke="#111" strokeWidth="0.4" />
  
      </svg>
      <div className="zone-grid two">
        <button className="btn zone-btn" disabled={!!choice} onClick={() => go("cruzado")}>↘ Cruzado abajo</button>
        <button className="btn zone-btn" disabled={!!choice} onClick={() => go("palo")}>↗ Al primer palo</button>
        <button className="btn zone-btn" disabled={!!choice} onClick={() => go("vaselina")}>🌈 Vaselina</button>
        <button className="btn zone-btn" disabled={!!choice} onClick={() => go("gambeta")}>🌀 Gambeta al arquero</button>
      </div>
    </div>
  );
}

/* ---------- Pase filtrado / anticipo ---------- */
export function PassMoment({ d, bonus, onDone, mode }: MomentProps & { mode: "pass" | "intercept" }) {
  const layout = useMemo(() => {
    const spots = [[18, 26], [50, 18], [82, 26], [30, 40], [70, 40]].sort(() => Math.random() - 0.5).slice(0, 3);
    const free = Math.floor(Math.random() * 3);
    // Los marcadores quedan pegados a los compañeros marcados; con más dificultad, el libre tiene uno cerca.
    const defs = spots.map(([x, y], i) => (i === free ? [x + (d > 0.6 ? 9 : 16) * (Math.random() < 0.5 ? -1 : 1), y + 6] : [x + 3, y + 3]));
    return { spots, free, defs };
  }, [d]);
  const T = Math.round(6 - d * 3 + bonus * 6);
  const [left, setLeft] = useState(T);
  const [pick, setPick] = useState<number | null>(null);
  useEffect(() => {
    if (pick !== null) return;
    if (left <= 0) { setPick(-1); finish(false, onDone); return; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left, pick, onDone]);
  const choose = (i: number) => {
    if (pick !== null) return;
    setPick(i);
    finish(i === layout.free, onDone);
  };
  return (
    <div className="moment">
      <p className="moment-title">{mode === "pass" ? "👟 Pase filtrado" : "🛡️ Anticipo"}</p>
      <p className="muted small" style={{ margin: 0 }}>
        {mode === "pass" ? "Tocá al compañero que quedó libre de marca." : "El rival va a dar el pase al que está libre. Tocá a quién vas a cortar."} ({left}s)
      </p>
      <svg viewBox="0 0 100 70" className="mini-pitch" aria-hidden={false}>
        <rect width="100" height="70" fill="#1b6d3c" />
        <rect x="25" y="0" width="50" height="14" fill="none" stroke="#fff" strokeWidth="0.7" />
        <circle cx="50" cy="62" r="4" fill={mode === "pass" ? "var(--accent)" : "#c33"} stroke="#111" strokeWidth="0.6" />
        <circle cx="53" cy="58" r="1.6" fill="#fff" />
        {layout.defs.map(([x, y], i) => <circle key={`d${i}`} cx={x} cy={y} r="3.4" fill={mode === "pass" ? "#c33" : "var(--accent)"} opacity="0.95" />)}
        {layout.spots.map(([x, y], i) => (
          <g key={i} onClick={() => choose(i)} style={{ cursor: "pointer" }} role="button" aria-label={`Jugador ${i + 1}`}>
            <circle cx={x} cy={y} r="6" fill="transparent" />
            <circle cx={x} cy={y} r="4" fill={mode === "pass" ? "var(--accent)" : "#c33"} stroke={pick === i ? (i === layout.free ? "#8ff0b6" : "#ffb4a8") : "#111"} strokeWidth={pick === i ? 1.6 : 0.6} />
            <text x={x} y={y + 1.5} textAnchor="middle" fontSize="4" fontWeight="900" fill="#111" pointerEvents="none">{i + 1}</text>
          </g>
        ))}
        {pick !== null && pick >= 0 && <line x1="50" y1="62" x2={layout.spots[layout.free][0]} y2={layout.spots[layout.free][1]} stroke="#fff" strokeDasharray="2 2" strokeWidth="0.8" />}
      </svg>
      <div className="zone-grid three">
        {[0, 1, 2].map((i) => <button key={i} className="btn zone-btn" disabled={pick !== null} onClick={() => choose(i)}>Jugador {i + 1}</button>)}
      </div>
    </div>
  );
}

/* ---------- Precisión (definir, cruzar, atajar, cabecear) ---------- */
const TIMING_LABEL: Record<string, { title: string; cta: string; desc: string; ok: string; bad: string }> = {
  finish: { title: "Llegás al área con la pelota", cta: "¡Definir!", desc: "Pateá cuando la marca esté en la zona verde.", ok: "¡GOOOL! ⚽", bad: "Afuera por poco…" },
  tackle: { title: "Contragolpe del rival", cta: "¡Cruzar!", desc: "Tirate al piso cuando esté en la zona verde.", ok: "¡Cruce perfecto! 🛡️", bad: "Te pasó de largo…" },
  save: { title: "Remate a quemarropa", cta: "¡Volar!", desc: "Estirate en el momento justo.", ok: "¡Atajadón! 🧤", bad: "Gol del rival…" },
  header: { title: "Córner a favor", cta: "¡Cabezazo!", desc: "Saltá cuando la marca esté en la zona verde.", ok: "¡GOL DE CABEZA! ⚽", bad: "Se fue alto…" },
};
export function TimingMoment({ kind, d, bonus, onDone }: MomentProps & { kind: string }) {
  const [pos, setPos] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const center = useRef(0.25 + Math.random() * 0.5);
  const raf = useRef(0);
  const speed = 0.8 + d * 0.9;
  const zone = Math.max(0.1, Math.min(0.42, 0.3 - (d - 0.5) * 0.3 + bonus * 0.6));
  useEffect(() => {
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const x = ((t - t0) / 1000) * speed;
      setPos(Math.abs((((x % 2) + 2) % 2) - 1));
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [speed]);
  const lo = Math.max(0, center.current - zone / 2), hi = Math.min(1, center.current + zone / 2);
  const hit = () => {
    if (result !== null) return;
    cancelAnimationFrame(raf.current);
    const ok = pos >= lo && pos <= hi;
    setResult(ok);
    play(ok ? "kick" : "flip");
    setTimeout(() => onDone(ok), 450);
  };
  const L = TIMING_LABEL[kind] ?? TIMING_LABEL.finish;
  return (
    <div className="moment">
      <p className="moment-title">⚡ {L.title}</p>
      <p className="muted small" style={{ margin: 0 }}>{L.desc}</p>
      <div className="timing" onClick={hit} role="button" aria-label={L.cta}>
        <div className="timing-zone" style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }} />
        <div className="timing-cursor" style={{ left: `${pos * 100}%` }} />
      </div>
      <button className="btn btn-primary big-cta" onClick={hit} disabled={result !== null}>{L.cta}</button>
    </div>
  );
}

/* ---------- Trivia ---------- */
export function TriviaMoment({ onDone, seconds = 9, compact = false }: { onDone: (ok: boolean) => void; seconds?: number; compact?: boolean }) {
  const [q] = useState<Question>(() => makeQuestion());
  const [left, setLeft] = useState(seconds);
  const [pick, setPick] = useState<number | null>(null);
  useEffect(() => {
    if (pick !== null) return;
    if (left <= 0) { setPick(-1); play("flip"); setTimeout(() => onDone(false), 1100); return; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left, pick, onDone]);
  const choose = (i: number) => {
    if (pick !== null) return;
    setPick(i);
    finish(i === q.answer, onDone, 1100);
  };
  return (
    <div className={compact ? "trivia-compact" : "moment"}>
      {!compact && <p className="moment-title">🧠 Lectura de juego</p>}
      {!compact && <p className="muted small" style={{ margin: 0 }}>Acertá para ganar la jugada. Tu conocimiento es tu stat.</p>}
      <div className="trivia-timer"><span style={{ width: `${(left / seconds) * 100}%` }} /></div>
      <p className="trivia-q">{q.text}</p>
      <div className="trivia-opts">
        {q.options.map((o, i) => (
          <button key={i} className={`btn trivia-opt ${pick !== null && i === q.answer ? "right" : ""} ${pick === i && i !== q.answer ? "wrong" : ""}`} onClick={() => choose(i)} disabled={pick !== null}>{o}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Tres en raya: cada casilla se gana respondiendo ---------- */
const LINES3 = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const winner = (b: (string | null)[]) => LINES3.find(([a, c, e]) => b[a] && b[a] === b[c] && b[a] === b[e])?.map((i) => i);
function cpuMove(b: (string | null)[]): number {
  const empty = b.map((x, i) => (x ? -1 : i)).filter((i) => i >= 0);
  for (const i of empty) { const t = [...b]; t[i] = "O"; if (winner(t)) return i; }
  if (Math.random() < 0.45) for (const i of empty) { const t = [...b]; t[i] = "X"; if (winner(t)) return i; }
  return empty[Math.floor(Math.random() * empty.length)];
}
export function TicTacToe({ onDone }: MomentProps) {
  // Arrancás vos. El rival no juega perfecto: completa si puede, y a veces se olvida de bloquear.
  const [board, setBoard] = useState<(string | null)[]>(() => Array(9).fill(null));
  const [asking, setAsking] = useState<number | null>(null);
  const [done, setDone] = useState<null | "win" | "lose" | "draw">(null);
  const end = (b: (string | null)[]): "win" | "lose" | "draw" | null => {
    const w = winner(b);
    if (w) return b[w[0]] === "X" ? "win" : "lose";
    if (b.every(Boolean)) return "draw";
    return null;
  };
  const answer = (ok: boolean) => {
    if (asking === null) return;
    let b = [...board];
    b[asking] = ok ? "X" : "O";
    setAsking(null);
    let r = end(b);
    if (!r) {
      b[cpuMove(b)] = "O";
      r = end(b);
    }
    setBoard(b);
    if (r) {
      setDone(r);
      const ok2 = r === "win" || r === "draw";
      play(r === "win" ? "win" : r === "lose" ? "lose" : "flip");
      setTimeout(() => onDone(ok2), 1500);
    }
  };
  const line = winner(board) ?? [];
  return (
    <div className="moment">
      <p className="moment-title">❌⭕ Tres en raya táctico</p>
      <p className="muted small" style={{ margin: 0 }}>Arrancás vos. Para ocupar una casilla, respondé bien; si fallás, es del rival. Tres en línea o empate: jugada ganada.</p>
      <div className="ttt">
        {board.map((c, i) => (
          <button key={i} className={`ttt-cell ${c ? `m-${c}` : ""} ${line.includes(i) ? "win" : ""}`} disabled={!!c || asking !== null || !!done} onClick={() => { play("click"); setAsking(i); }}>
            {c === "X" ? "⚽" : c === "O" ? "⭕" : ""}
          </button>
        ))}
      </div>
      {asking !== null && <TriviaMoment key={asking} onDone={answer} seconds={10} compact />}
      {done && <p className="muted small" style={{ margin: 0 }}>{done === "win" ? "¡Tres en raya!" : done === "lose" ? "El rival hizo la línea…" : "Empate táctico: jugada a favor."}</p>}
    </div>
  );
}

/** Elige el minijuego según el tipo de jugada. */
export function MomentRunner({ kind, ...p }: MomentProps & { kind: MomentKind }) {
  switch (kind) {
    case "penalty": return <PenaltyShoot {...p} />;
    case "penalty-save": return <PenaltySave {...p} />;
    case "freekick": return <FreeKick {...p} />;
    case "freekick-save": return <FreeKickSave {...p} />;
    case "placement": return <Placement {...p} />;
    case "pass": return <PassMoment {...p} mode="pass" />;
    case "intercept": return <PassMoment {...p} mode="intercept" />;
    case "ttt": return <TicTacToe {...p} />;
    case "trivia": return <TriviaMoment onDone={p.onDone} />;
    default: return <TimingMoment {...p} kind={kind} />;
  }
}
