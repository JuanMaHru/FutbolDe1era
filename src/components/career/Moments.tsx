"use client";
import { useEffect, useRef, useState } from "react";
import { makeQuestion, type Question } from "@/lib/career/trivia";
import { play } from "@/lib/sound";
import type { Role } from "@/lib/career/engine";

const TIMING_LABEL: Record<Role, { title: string; cta: string; desc: string }> = {
  DEL: { title: "Mano a mano con el arquero", cta: "¡Definir!", desc: "Pateá cuando la marca esté en la zona verde." },
  MED: { title: "Llegás al borde del área", cta: "¡Remate!", desc: "Soltá el remate en el momento justo." },
  DEF: { title: "Contragolpe del rival", cta: "¡Cruzar!", desc: "Tirate al piso cuando esté en la zona verde." },
  ARQ: { title: "Penal en contra", cta: "¡Volar!", desc: "Tirate cuando la marca llegue a la zona verde." },
};

/** Minijuego de precisión: una marca va y viene; tocá cuando esté en la zona verde. */
export function TimingMoment({ role, zone, speed, onDone }: { role: Role; zone: number; speed: number; onDone: (ok: boolean) => void }) {
  const [pos, setPos] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const center = useRef(0.25 + Math.random() * 0.5);
  const raf = useRef(0);
  const t0 = useRef(0);
  useEffect(() => {
    const step = (t: number) => {
      if (!t0.current) t0.current = t;
      const x = ((t - t0.current) / 1000) * speed;
      setPos(Math.abs(((x % 2) + 2) % 2 - 1)); // triángulo 0..1..0
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
    setTimeout(() => onDone(ok), 900);
  };
  const L = TIMING_LABEL[role];
  return (
    <div className="moment">
      <p className="moment-title">⚡ {L.title}</p>
      <p className="muted small" style={{ margin: 0 }}>{L.desc}</p>
      <div className="timing" onClick={hit} role="button" aria-label={L.cta}>
        <div className="timing-zone" style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }} />
        <div className="timing-cursor" style={{ left: `${pos * 100}%` }} />
      </div>
      {result === null ? (
        <button className="btn btn-primary big-cta" onClick={hit}>{L.cta}</button>
      ) : (
        <p className={`moment-result ${result ? "ok" : "bad"}`}>{result ? (role === "ARQ" ? "¡La sacaste! 🧤" : role === "DEF" ? "¡Cruce perfecto! 🛡️" : "¡GOOOL! ⚽") : role === "ARQ" ? "Gol del rival…" : "Afuera por poco…"}</p>
      )}
    </div>
  );
}

/** Momento de lectura de juego: una pregunta real de fútbol con 8 segundos. */
export function TriviaMoment({ onDone }: { onDone: (ok: boolean) => void }) {
  const [q] = useState<Question>(() => makeQuestion());
  const [left, setLeft] = useState(8);
  const [pick, setPick] = useState<number | null>(null);
  useEffect(() => {
    if (pick !== null) return;
    if (left <= 0) {
      setPick(-1);
      play("flip");
      setTimeout(() => onDone(false), 1100);
      return;
    }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left, pick, onDone]);
  const choose = (i: number) => {
    if (pick !== null) return;
    setPick(i);
    const ok = i === q.answer;
    play(ok ? "hit" : "near");
    setTimeout(() => onDone(ok), 1100);
  };
  return (
    <div className="moment">
      <p className="moment-title">🧠 Lectura de juego</p>
      <p className="muted small" style={{ margin: 0 }}>Acertá para ganar la jugada. Tu conocimiento es tu stat.</p>
      <div className="trivia-timer"><span style={{ width: `${(left / 8) * 100}%` }} /></div>
      <p className="trivia-q">{q.text}</p>
      <div className="trivia-opts">
        {q.options.map((o, i) => (
          <button
            key={i}
            className={`btn trivia-opt ${pick !== null && i === q.answer ? "right" : ""} ${pick === i && i !== q.answer ? "wrong" : ""}`}
            onClick={() => choose(i)}
            disabled={pick !== null}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
