"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { makeQuestion, type Question } from "@/lib/career/trivia";
import { favoriteShot, keeperRead, type MomentKind, type ShotKind, type ShotRecord } from "@/lib/career/engine";
import { play } from "@/lib/sound";
import { GoalScene, keeperKitOf, kitOf, PitchBall, PitchScene, PlayerToken, type GoalZone, type KeeperPlace } from "./Scenes";

export interface MomentProps {
  /** 0.1 fácil … 0.9 difícil */
  d: number;
  /** +0.15 si es la jugada del perfil del jugador */
  bonus: number;
  foot: string;
  /** Dónde pateaste antes (los arqueros te estudian). */
  shots?: Record<string, string[]>;
  fame?: number;
  /** Tu equipo y el rival (para los colores de las escenas). */
  team?: string;
  rival?: string;
  onDone: (ok: boolean, shot?: ShotRecord) => void;
}

const SHOT_LABEL: Record<string, string> = {
  TL: "al ángulo izquierdo", TR: "al ángulo derecho", BL: "abajo a la izquierda", BR: "abajo a la derecha", C: "al medio", CH: "picados",
  UNDER: "por abajo de la barrera", cruzado: "cruzados", palo: "al primer palo", vaselina: "de vaselina", gambeta: "gambeteando al arquero",
};
const KIND_LABEL: Record<ShotKind, string> = { penalty: "penales", freekick: "tiros libres", placement: "mano a mano" };
/** Aviso de que el arquero ya te tiene estudiado. */
function Scouted({ kind, shots }: { kind: ShotKind; shots?: Record<string, string[]> }) {
  const f = favoriteShot(shots?.[kind]);
  if (!f) return null;
  return <p className="scouted">📋 Te estudiaron: de tus últimos {f.of} {KIND_LABEL[kind]}, {f.count} fueron {SHOT_LABEL[f.choice] ?? f.choice}. Si repetís, te la van a leer.</p>;
}
const ReadNote = ({ on }: { on: boolean }) => (on ? <p className="scouted read">🧤 ¡Te la leyó! Ya sabía a dónde ibas a patear.</p> : null);
const clamp01 = (x: number) => Math.max(0.03, Math.min(0.97, x));
const finish = (ok: boolean, onDone: (ok: boolean) => void, delay = 1300) => {
  play(ok ? "hit" : "near");
  setTimeout(() => onDone(ok), delay);
};

type Zone = GoalZone;

/** Barra de precisión: primero elegís, después le pegás en el momento justo. */
function AimBar({ d, bonus, cta, label = "Ahora la precisión: soltá en la zona verde.", onHit }: { d: number; bonus: number; cta: string; label?: string; onHit: (good: boolean) => void }) {
  const center = useMemo(() => 0.3 + Math.random() * 0.4, []);
  const zone = Math.max(0.1, Math.min(0.42, 0.24 + bonus * 0.6 - (d - 0.5) * 0.15));
  const lo = center - zone / 2, hi = center + zone / 2;
  const [pos, setPos] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef(0);
  const posRef = useRef(0);
  useEffect(() => {
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const x = ((t - t0) / 1000) * (1 + d * 0.8);
      posRef.current = Math.abs((((x % 2) + 2) % 2) - 1);
      setPos(posRef.current);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [d]);
  const hit = () => {
    if (done) return;
    cancelAnimationFrame(raf.current);
    setDone(true);
    onHit(posRef.current >= lo && posRef.current <= hi);
  };
  return (
    <>
      {!done && <p className="muted small scene-hint">{label}</p>}
      <div className="timing" onClick={hit} role="button" aria-label={cta}>
        <div className="timing-zone" style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }} />
        <div className="timing-cursor" style={{ left: `${pos * 100}%` }} />
      </div>
      {!done && <button className="btn btn-primary big-cta" onClick={hit}>{cta}</button>}
    </>
  );
}
const Quality = ({ q, good = "🎯 Le pegaste justo.", bad = "😬 Le pegaste mal." }: { q: boolean | null; good?: string; bad?: string }) =>
  q === null ? null : <p className={`aim-note ${q ? "ok" : "bad"}`}>{q ? good : bad}</p>;

/* ---------- Penal: patear ---------- */
export function PenaltyShoot({ d, bonus, onDone, shots, fame = 50, rival, title = "¡Penal!" }: MomentProps & { title?: string }) {
  const [read, setRead] = useState(false);
  const tendency = useMemo(() => (Math.random() < 0.5 ? "L" : "R") as "L" | "R", []);
  const showHint = useMemo(() => Math.random() < 0.5 + bonus * 2, [bonus]);
  const [aim, setAim] = useState<Zone | null>(null);
  const [shot, setShot] = useState<Zone | null>(null);
  const [q, setQ] = useState<boolean | null>(null);
  const [keeper, setKeeper] = useState<"L" | "C" | "R" | "idle">("idle");
  const [res, setRes] = useState<boolean | null>(null);
  const shoot = (z: Zone, good: boolean) => {
    if (shot) return;
    const r = Math.random();
    const side = z === "TL" || z === "BL" ? "L" : z === "TR" || z === "BR" ? "R" : "C";
    // Si repetís dónde pateás, el arquero te lee y va directo a ese lugar.
    const guessed = Math.random() < keeperRead(shots?.penalty, z, fame);
    const k: "L" | "C" | "R" = guessed ? side : r < 0.18 ? "C" : r < 0.18 + 0.52 ? tendency : tendency === "L" ? "R" : "L";
    setShot(z); setQ(good);
    play("kick");
    setTimeout(() => setKeeper(k), 120);
    const high = z === "TL" || z === "TR";
    let ok: boolean;
    // Mal pegado: la picada queda corta, al medio va mordida y a los ángulos se puede ir afuera.
    if (z === "CH") ok = k !== "C" ? Math.random() < (good ? 0.93 : 0.5) : Math.random() < 0.06;
    else if (side === "C") ok = k !== "C" ? Math.random() < (good ? 0.92 : 0.62) : Math.random() < 0.1;
    else {
      const miss = high ? (good ? 0.04 + d * 0.08 : 0.42) - bonus : good ? 0.01 : 0.15;
      if (Math.random() < miss) ok = false;
      else if (k === side) ok = Math.random() < (guessed ? (high ? 0.45 : 0.18) : high ? 0.62 : 0.28) + bonus - (good ? 0 : 0.15);
      else ok = true;
    }
    setTimeout(() => { setRes(ok); setRead(guessed && !ok); finish(ok, (o) => onDone(o, { kind: "penalty", choice: z }), guessed && !ok ? 1700 : 650); }, 600);
  };
  const choose = (z: Zone) => { if (!aim) { play("click"); setAim(z); } };
  const OPTS: [Zone, string][] = [["TL", "↖ Ángulo izq."], ["CH", "🥄 Picarla"], ["TR", "Ángulo der. ↗"], ["BL", "↙ Abajo izq."], ["C", "Al medio"], ["BR", "Abajo der. ↘"]];
  return (
    <div className="moment">
      <p className="moment-title">⚽ {title}</p>
      <p className="muted small" style={{ margin: 0 }}>
        {showHint ? `👀 Dato: el arquero suele tirarse a su ${tendency === "L" ? "izquierda (tu derecha)" : "derecha (tu izquierda)"}.` : "Elegí dónde patear. Los ángulos son difíciles de atajar pero podés errarlo."}
      </p>
      <Scouted kind="penalty" shots={shots} />
      <GoalScene keeper={keeper} ball={shot ?? undefined} result={res} keeperColor={keeperKitOf(rival)} aim={aim && !shot ? aim : undefined}
        targets={aim ? undefined : ["TL", "CH", "TR", "BL", "C", "BR"]} onTarget={choose} />
      <ReadNote on={read} />
      <Quality q={q} />
      {!aim ? (
        <>
          <p className="muted small scene-hint">Tocá el arco o elegí abajo.</p>
          <div className="zone-grid">
            {OPTS.map(([z, label]) => <button key={z} className="btn zone-btn" onClick={() => choose(z)}>{label}</button>)}
          </div>
        </>
      ) : <AimBar d={d} bonus={bonus} cta="¡Patear!" onHit={(g) => shoot(aim, g)} />}
    </div>
  );
}

/* ---------- Penal: atajar ---------- */
export function PenaltySave({ d, bonus, onDone, team, title = "Penal en contra" }: MomentProps & { title?: string }) {
  const shooter = useMemo(() => {
    const foot = Math.random() < 0.75 ? "derecho" : "zurdo";
    // Un derecho suele abrir el pie hacia la izquierda del arquero, un zurdo al revés.
    const fav: "L" | "R" = foot === "derecho" ? "R" : "L";
    return { foot, fav };
  }, []);
  const [side, setSide] = useState<"L" | "C" | "R" | null>(null);
  const [dive, setDive] = useState<"L" | "C" | "R" | null>(null);
  const [q, setQ] = useState<boolean | null>(null);
  const [ball, setBall] = useState<Zone | undefined>();
  const [res, setRes] = useState<boolean | null>(null);
  const go = (k: "L" | "C" | "R", good: boolean) => {
    if (dive) return;
    setDive(k); setQ(good);
    play("kick");
    const r = Math.random();
    const to: "L" | "C" | "R" = r < 0.14 ? "C" : r < 0.14 + 0.5 ? shooter.fav : shooter.fav === "L" ? "R" : "L";
    const high = Math.random() < 0.35;
    setBall(to === "C" ? "C" : to === "L" ? (high ? "TL" : "BL") : high ? "TR" : "BR");
    let saved: boolean;
    if (Math.random() < 0.07) saved = true; // la tiró afuera
    else if (to === k) saved = Math.random() < (to === "C" ? 0.92 : high ? 0.45 : 0.78) + bonus - (d - 0.5) * 0.2 + (good ? 0.08 : -0.32);
    else saved = false;
    setTimeout(() => { setRes(!saved); finish(saved, onDone, 650); }, 600);
  };
  const pick = (k: "L" | "C" | "R") => { if (!side) { play("click"); setSide(k); } };
  return (
    <div className="moment">
      <p className="moment-title">🧤 {title}</p>
      <p className="muted small" style={{ margin: 0 }}>
        Patea un <b>{shooter.foot}</b>{bonus > 0 ? ` — lo estudiaste: suele patear a tu ${shooter.fav === "L" ? "izquierda" : "derecha"}` : ""}. ¿Para dónde te tirás?
      </p>
      <GoalScene keeper={dive ?? "idle"} ball={ball} result={res} keeperColor={keeperKitOf(team)} />
      <Quality q={q} good="⚡ Reaccionaste a tiempo." bad="🐢 Saliste tarde." />
      {!side ? (
        <div className="zone-grid three">
          <button className="btn zone-btn" onClick={() => pick("L")}>⬅ Izquierda</button>
          <button className="btn zone-btn" onClick={() => pick("C")}>Me quedo</button>
          <button className="btn zone-btn" onClick={() => pick("R")}>Derecha ➡</button>
        </div>
      ) : <AimBar d={d} bonus={bonus} cta="¡Volar!" label="Ahora el reflejo: soltá en la zona verde." onHit={(g) => go(side, g)} />}
    </div>
  );
}

/* ---------- Tiro libre: patear (elegir + potencia) ---------- */
export function FreeKick({ d, bonus, foot, onDone, shots, fame = 50, rival }: MomentProps) {
  const [jumped, setJumped] = useState(false);
  const [read, setRead] = useState(false);
  const [shownKeeper, setShownKeeper] = useState<"L" | "R" | null>(null);
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
    // Si siempre le pegás igual, el arquero (o la barrera) ya te conoce.
    const guessed = Math.random() < keeperRead(shots?.freekick, choice, fame);
    const aim = choice === "TL" ? "L" : choice === "TR" ? "R" : null;
    const kSide = guessed && aim ? aim : keeperSide;
    const jumps = guessed && choice === "UNDER" ? false : wallJumps;
    setShownKeeper(kSide);
    setJumped(jumps);
    const freeSide = kSide === "L" ? "R" : "L";
    let p = choice === "UNDER" ? (jumps ? 0.7 : 0.08) : aim ? (aim === freeSide ? 0.62 : guessed ? 0.22 : 0.3) : 0.35;
    if (foot === "ambidiestro") p += 0.05;
    p += good ? 0.2 : -0.35;
    const ok = Math.random() < clamp01(p);
    const c = choice;
    setTimeout(() => { setRes(ok); setRead(guessed && !ok); finish(ok, (o) => onDone(o, { kind: "freekick", choice: c }), guessed && !ok ? 1700 : 650); }, 500);
  };
  return (
    <div className="moment">
      <p className="moment-title">🎯 Tiro libre al borde del área</p>
      <p className="muted small" style={{ margin: 0 }}>
        El arquero se para cargado a su {keeperSide === "L" ? "izquierda (tu derecha)" : "derecha (tu izquierda)"}. {choice ? "Ahora la potencia: soltá en la zona verde." : "¿A dónde le pegás?"}
      </p>
      <Scouted kind="freekick" shots={shots} />
      <GoalScene keeper={shownKeeper ?? "idle"} place={shownKeeper ? undefined : { x: keeperSide === "L" ? 88 : 112, y: 82 }} ball={shownKeeper && choice ? choice : undefined}
        wall wallJump={jumped} wallKit={kitOf(rival)} result={res} keeperColor={keeperKitOf(rival)} />
      <ReadNote on={read} />
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
export function FreeKickSave({ d, bonus, onDone, team, rival }: MomentProps) {
  const shooterFoot = useMemo(() => (Math.random() < 0.7 ? "derecho" : "zurdo"), []);
  const target = useMemo(() => {
    const r = Math.random();
    return r < 0.45 ? "far" : r < 0.8 ? "wall" : "under";
  }, []);
  const [cover, setCover] = useState<string | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [q, setQ] = useState<boolean | null>(null);
  const [res, setRes] = useState<boolean | null>(null);
  const go = (k: string, good: boolean) => {
    if (pick) return;
    setPick(k); setQ(good);
    play("kick");
    const saved = k === target ? Math.random() < 0.8 + bonus - (d - 0.5) * 0.2 + (good ? 0.05 : -0.35) : Math.random() < (good ? 0.15 : 0.05);
    setTimeout(() => { setRes(!saved); finish(saved, onDone, 650); }, 600);
  };
  const ball: Zone = target === "far" ? "TR" : target === "wall" ? "TL" : "BL";
  return (
    <div className="moment">
      <p className="moment-title">🧤 Tiro libre en contra</p>
      <p className="muted small" style={{ margin: 0 }}>Va a patear un <b>{shooterFoot}</b> de {rival ?? "el rival"}. ¿Qué palo cubrís?</p>
      <GoalScene keeper={pick === "far" ? "R" : pick === "wall" || pick === "under" ? "L" : "idle"} ball={pick ? ball : undefined} wall wallKit={kitOf(team)} result={res} keeperColor={keeperKitOf(team)} />
      <Quality q={q} good="⚡ Reaccionaste a tiempo." bad="🐢 Saliste tarde." />
      {!cover ? (
        <div className="zone-grid three">
          <button className="btn zone-btn" onClick={() => { play("click"); setCover("wall"); }}>Palo de la barrera</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setCover("under"); }}>Abajo (por si pasa por abajo)</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setCover("far"); }}>Mi palo</button>
        </div>
      ) : <AimBar d={d} bonus={bonus} cta="¡Volar!" label="Ahora el reflejo: soltá en la zona verde." onHit={(g) => go(cover, g)} />}
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
const PLACE_OF: Record<string, KeeperPlace> = {
  adelantado: { x: 100, y: 106, scale: 1.35, pose: "ready" },
  linea: { x: 100, y: 82, pose: "ready" },
  cargado: { x: 66, y: 83, pose: "ready" },
  tirado: { x: 114, y: 96, rot: 78, scale: 1.15, pose: "dive" },
};
const FINISH_TO: Record<string, GoalZone> = { cruzado: "BR", palo: "BL", vaselina: "CH", gambeta: "C" };
export function Placement({ d, bonus, onDone, shots, fame = 50, rival }: MomentProps) {
  const [read, setRead] = useState(false);
  const st = useMemo(() => KEEPER_STATES[Math.floor(Math.random() * KEEPER_STATES.length)], []);
  const [res, setRes] = useState<boolean | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [aim, setAim] = useState<keyof typeof st.odds | null>(null);
  const [q, setQ] = useState<boolean | null>(null);
  const go = (k: keyof typeof st.odds, good: boolean) => {
    if (choice) return;
    setChoice(k); setQ(good);
    play("kick");
    // Los arqueros conocen tu definición favorita: repetirla siempre baja las chances.
    const guessed = Math.random() < keeperRead(shots?.placement, k, fame) * 0.8;
    const ok = Math.random() < clamp01((st.odds[k] + bonus - (d - 0.5) * 0.3) * (guessed ? 0.5 : 1) * (good ? 1.12 : 0.55));
    setTimeout(() => { setRes(ok); setRead(guessed && !ok); finish(ok, (o) => onDone(o, { kind: "placement", choice: k }), guessed && !ok ? 1700 : 650); }, 400);
  };
  const place: KeeperPlace = PLACE_OF[st.id];
  const target: GoalZone | [number, number] | undefined = !choice ? undefined
    : res === false ? [place.x + 6, place.y - 34 * (place.scale ?? 1)]
    : res ? FINISH_TO[choice] : undefined;
  return (
    <div className="moment">
      <p className="moment-title">🏃 Mano a mano</p>
      <p className="muted small" style={{ margin: 0 }}>{st.text} ¿Cómo la definís?</p>
      <GoalScene place={place} ball={target} ballFrom={[100, 128]} result={res} keeperColor={keeperKitOf(rival)} />
      <Scouted kind="placement" shots={shots} />
      <ReadNote on={read} />
      <Quality q={q} good="🎯 La definiste justo." bad="😬 Le pegaste mal." />
      {!aim ? (
        <div className="zone-grid two">
          <button className="btn zone-btn" onClick={() => { play("click"); setAim("cruzado"); }}>↘ Cruzado abajo</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setAim("palo"); }}>↗ Al primer palo</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setAim("vaselina"); }}>🌈 Vaselina</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setAim("gambeta"); }}>🌀 Gambeta al arquero</button>
        </div>
      ) : <AimBar d={d} bonus={bonus} cta={aim === "gambeta" ? "¡Encarar!" : "¡Definir!"} onHit={(g) => go(aim, g)} />}
    </div>
  );
}

/* ---------- Pase filtrado / anticipo ---------- */
export function PassMoment({ d, bonus, onDone, mode, team, rival }: MomentProps & { mode: "pass" | "intercept" }) {
  // En el anticipo, la pelota la tiene el rival: los "compañeros" son los de ellos.
  const mine = kitOf(team, ["#22a95b", "#ffffff"]), theirs = kitOf(rival);
  const [us, them] = mode === "pass" ? [mine, theirs] : [theirs, mine];
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
      <PitchScene>
        {layout.defs.map(([x, y], i) => <PlayerToken key={`d${i}`} x={x} y={y} color={them[0]} trim={them[1]} />)}
        {layout.spots.map(([x, y], i) => (
          <PlayerToken key={i} x={x} y={y} color={us[0]} trim={us[1]} label={i + 1} glow={pick === null}
            ring={pick === i ? (i === layout.free ? "#8ff0b6" : "#ff8a7a") : undefined} onClick={pick === null ? () => choose(i) : undefined} />
        ))}
        <PlayerToken x={50} y={64} color={us[0]} trim={us[1]} ring="#fff" />
        {pick !== null && pick >= 0 && <line x1="50" y1="64" x2={layout.spots[layout.free][0]} y2={layout.spots[layout.free][1]} stroke="#fff" strokeOpacity="0.7" strokeDasharray="1.6 1.6" strokeWidth="0.6" />}
        <PitchBall x={pick !== null && pick >= 0 ? layout.spots[pick][0] + 2 : 52} y={pick !== null && pick >= 0 ? layout.spots[pick][1] + 2 : 62} />
      </PitchScene>
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
export function TimingMoment({ kind, d, bonus, onDone, team, rival }: MomentProps & { kind: string }) {
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
      <TimingScene kind={kind} result={result} team={team} rival={rival} />
      <div className="timing" onClick={hit} role="button" aria-label={L.cta}>
        <div className="timing-zone" style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }} />
        <div className="timing-cursor" style={{ left: `${pos * 100}%` }} />
      </div>
      <button className="btn btn-primary big-cta" onClick={hit} disabled={result !== null}>{L.cta}</button>
    </div>
  );
}

/** Escena de las jugadas de precisión: definición, atajada, cabezazo y cruce. */
function TimingScene({ kind, result, team, rival }: { kind: string; result: boolean | null; team?: string; rival?: string }) {
  const side = useMemo(() => (Math.random() < 0.5 ? "L" : "R") as "L" | "R", []);
  const us = kitOf(team, ["#22a95b", "#ffffff"]), them = kitOf(rival);
  if (kind === "save") {
    const z: GoalZone = side === "L" ? "BL" : "BR";
    return <GoalScene small keeper={result === null ? "idle" : result ? side : side === "L" ? "R" : "L"} ball={result === null ? undefined : z} ballFrom={[110, 112]} result={result === null ? null : !result} keeperColor={keeperKitOf(team)} />;
  }
  if (kind === "header") {
    return (
      <PitchScene corner>
        <PlayerToken x={44} y={14} color={them[0]} trim={them[1]} />
        <PlayerToken x={58} y={11} color={them[0]} trim={them[1]} />
        <PlayerToken x={50} y={5} color={keeperKitOf(rival)} />
        <PlayerToken x={51} y={19} color={us[0]} trim={us[1]} ring="#fff" glow={result === null} />
        <PitchBall x={result === null ? 4.5 : result ? 52 : 70} y={result === null ? 5.5 : result ? 1.5 : -6} lofted={result !== null} />
      </PitchScene>
    );
  }
  if (kind === "tackle") {
    return (
      <PitchScene>
        <g className={result === null ? "sc-run" : ""}>
          <PlayerToken x={result === false ? 50 : 54} y={result === false ? 26 : 50} color={them[0]} trim={them[1]} />
        </g>
        <PlayerToken x={result ? 54 : 40} y={result ? 52 : 58} color={us[0]} trim={us[1]} ring="#fff" />
        <PitchBall x={result ? 86 : result === false ? 50 : 54} y={result ? 66 : result === false ? 22 : 46} />
      </PitchScene>
    );
  }
  // Definición
  const z: GoalZone = side === "L" ? "BL" : "TR";
  return <GoalScene small keeper={result === null ? "idle" : result ? (side === "L" ? "R" : "L") : side} ball={result === null ? undefined : result ? z : [side === "L" ? 22 : 178, 40]} ballFrom={[96, 120]} result={result} keeperColor={keeperKitOf(rival)} />;
}

/* ---------- Cabezazo: te tiran el centro (córner o tiro libre de un compañero) ---------- */
const HEAD_SETUPS = [
  { text: "El arquero salió a cortar y quedó a mitad de camino.", place: { x: 100, y: 98, scale: 1.2, pose: "jump" }, odds: { piso: 0.66, palo: 0.34, cruzado: 0.45 } },
  { text: "El arquero se quedó en la línea, pegado al primer palo.", place: { x: 70, y: 82, pose: "ready" }, odds: { piso: 0.36, palo: 0.14, cruzado: 0.66 } },
  { text: "El arquero cubre el segundo palo.", place: { x: 130, y: 82, pose: "ready" }, odds: { piso: 0.36, palo: 0.62, cruzado: 0.18 } },
] as const;
const HEAD_TO: Record<string, GoalZone> = { piso: "C", palo: "BL", cruzado: "BR" };
export function HeaderMoment({ d, bonus, onDone, rival }: MomentProps) {
  const st = useMemo(() => HEAD_SETUPS[Math.floor(Math.random() * HEAD_SETUPS.length)], []);
  const from = useMemo(() => {
    const r = Math.random();
    return r < 0.55 ? `El ${["10", "7", "11"][Math.floor(Math.random() * 3)]} tira el córner` : r < 0.85 ? "Tiro libre lateral de un compañero" : "Centro desde la derecha";
  }, []);
  const [aim, setAim] = useState<keyof typeof st.odds | null>(null);
  const [q, setQ] = useState<boolean | null>(null);
  const [res, setRes] = useState<boolean | null>(null);
  const [ball, setBall] = useState<GoalZone | [number, number] | undefined>();
  const go = (k: keyof typeof st.odds, good: boolean) => {
    setQ(good);
    play("kick");
    const ok = Math.random() < clamp01(st.odds[k] + bonus + (good ? 0.12 : -0.3) - (d - 0.5) * 0.2);
    const saved = !ok && Math.random() < 0.5;
    setBall(ok ? HEAD_TO[k] : saved ? [st.place.x + 4, st.place.y - 36 * ("scale" in st.place ? st.place.scale : 1)] : [k === "palo" ? 24 : 176, k === "piso" ? 24 : 40]);
    setTimeout(() => { setRes(ok); finish(ok, onDone, 650); }, 600);
  };
  return (
    <div className="moment">
      <p className="moment-title">🤕 ¡Te queda para cabecear!</p>
      <p className="muted small" style={{ margin: 0 }}>{from} y la pelota te cae a vos. {st.text} ¿A dónde la mandás?</p>
      <GoalScene small place={st.place as KeeperPlace} ball={ball} ballFrom={[60, 100]} result={res} keeperColor={keeperKitOf(rival)} />
      <Quality q={q} good="💪 Saltaste justo." bad="😬 La agarraste mal." />
      {!aim ? (
        <div className="zone-grid three">
          <button className="btn zone-btn" onClick={() => { play("click"); setAim("piso"); }}>⬇ Abajo, contra el piso</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setAim("palo"); }}>↖ Al primer palo</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setAim("cruzado"); }}>↘ Cruzado</button>
        </div>
      ) : <AimBar d={d} bonus={bonus} cta="¡Cabezazo!" label="Saltá en el momento justo: soltá en la zona verde." onHit={(g) => go(aim, g)} />}
    </div>
  );
}

/* ---------- Córner: elegir a dónde tirarlo y darle bien ---------- */
const CORNER_SETUPS = [
  { text: "Defienden en zona en el área chica.", defs: [[40, 8], [50, 7], [60, 8], [47, 16]], odds: { primer: 0.22, penal: 0.55, segundo: 0.38, corto: 0.4 } },
  { text: "Marcan al hombre y su central más alto cuida el segundo palo.", defs: [[42, 11], [52, 20], [63, 9], [17, 12]], odds: { primer: 0.5, penal: 0.32, segundo: 0.14, corto: 0.3 } },
  { text: "Amontonaron gente en el primer palo.", defs: [[38, 7], [42, 10], [45, 6], [50, 15]], odds: { primer: 0.12, penal: 0.42, segundo: 0.58, corto: 0.32 } },
  { text: "Se metieron todos en el área y dejaron libre al que viene en corto.", defs: [[40, 9], [50, 9], [60, 9], [50, 19], [44, 15]], odds: { primer: 0.24, penal: 0.22, segundo: 0.26, corto: 0.6 } },
] as const;
type CornerTarget = keyof (typeof CORNER_SETUPS)[number]["odds"];
const CORNER_TO: Record<CornerTarget, [number, number]> = { primer: [41, 10], penal: [50, 21], segundo: [61, 10], corto: [14, 11] };
const CORNER_MATE: Record<CornerTarget, [number, number]> = { primer: [41, 12], penal: [50, 23], segundo: [61, 12], corto: [14, 13] };
export function Corner({ d, bonus, onDone, team, rival }: MomentProps) {
  const st = useMemo(() => CORNER_SETUPS[Math.floor(Math.random() * CORNER_SETUPS.length)], []);
  const us = kitOf(team, ["#22a95b", "#ffffff"]), them = kitOf(rival);
  const [choice, setChoice] = useState<CornerTarget | null>(null);
  const [res, setRes] = useState<boolean | null>(null);
  const [ballAt, setBallAt] = useState<[number, number]>([4.5, 5.5]);
  const [pos, setPos] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!choice || res !== null) return;
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const x = ((t - t0) / 1000) * (1 + d * 0.8);
      setPos(Math.abs((((x % 2) + 2) % 2) - 1));
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [choice, res, d]);
  const zone = 0.24 + bonus * 0.6 - (d - 0.5) * 0.15;
  const lo = 0.5 - zone / 2, hi = 0.5 + zone / 2;
  const kick = () => {
    if (!choice || res !== null) return;
    cancelAnimationFrame(raf.current);
    const good = pos >= lo && pos <= hi;
    play("kick");
    const ok = Math.random() < clamp01(st.odds[choice] + bonus + (good ? 0.15 : -0.28) - (d - 0.5) * 0.15);
    setBallAt(good ? CORNER_TO[choice] : [CORNER_TO[choice][0] + 9, CORNER_TO[choice][1] - 7]);
    setTimeout(() => setBallAt(ok ? [50 + (Math.random() - 0.5) * 8, 1.2] : [choice === "corto" ? 30 : 72, choice === "corto" ? 30 : 34]), 650);
    setTimeout(() => { setRes(ok); finish(ok, onDone, 700); }, 1000);
  };
  return (
    <div className="moment">
      <p className="moment-title">🚩 Córner a favor</p>
      <p className="muted small" style={{ margin: 0 }}>{st.text} {choice ? "Ahora el centro: soltá en la zona verde." : "¿A dónde lo tirás?"}</p>
      <PitchScene corner>
        {st.defs.map(([x, y], i) => <PlayerToken key={i} x={x} y={y} color={them[0]} trim={them[1]} />)}
        <PlayerToken x={50} y={5} color={keeperKitOf(rival)} />
        {(Object.keys(CORNER_MATE) as CornerTarget[]).map((k) => (
          <PlayerToken key={k} x={CORNER_MATE[k][0]} y={CORNER_MATE[k][1]} color={us[0]} trim={us[1]} glow={!choice} ring={choice === k ? "#fff" : undefined}
            onClick={!choice ? () => { play("click"); setChoice(k); } : undefined} />
        ))}
        <PlayerToken x={4} y={8.5} color={us[0]} trim={us[1]} ring="#fff" />
        <PitchBall x={ballAt[0]} y={ballAt[1]} lofted={ballAt[0] > 5 && res === null} />
      </PitchScene>
      {!choice ? (
        <div className="zone-grid two">
          <button className="btn zone-btn" onClick={() => { play("click"); setChoice("primer"); }}>Al primer palo</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setChoice("penal"); }}>Al punto penal</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setChoice("segundo"); }}>Al segundo palo</button>
          <button className="btn zone-btn" onClick={() => { play("click"); setChoice("corto"); }}>En corto</button>
        </div>
      ) : (
        <>
          <div className="timing" onClick={kick} role="button" aria-label="Tirar el centro">
            <div className="timing-zone" style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }} />
            <div className="timing-cursor" style={{ left: `${pos * 100}%` }} />
          </div>
          {res === null && <button className="btn btn-primary big-cta" onClick={kick}>¡Centro!</button>}
        </>
      )}
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
    case "corner": return <Corner {...p} />;
    case "header": return <HeaderMoment {...p} />;
    case "trivia": return <TriviaMoment onDone={p.onDone} />;
    default: return <TimingMoment {...p} kind={kind} />;
  }
}
