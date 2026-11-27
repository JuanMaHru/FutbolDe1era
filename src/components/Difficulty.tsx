"use client";
import { useEffect, useRef, useState } from "react";
import { chooseLevel, cfgOf, describe, lastLevel, LEVEL_ICON, LEVEL_LABEL, LEVELS, loadDiff, MULT, type DiffState, type Level } from "@/lib/difficulty";
import type { GameId } from "@/lib/game/types";
import { play } from "@/lib/sound";
import { dailyMeta } from "@/lib/game/daily-games";

/**
 * Nivel del reto del día. Si el juego ya arrancó (sin nivel guardado), queda en "medio" sin reloj.
 * `started`: si ya hay jugadas (para no pedir nivel a mitad de partida).
 */
export function useDifficulty(game: GameId, key: string, started: boolean) {
  const [st, setSt] = useState<DiffState | null | undefined>(undefined);
  useEffect(() => {
    if (!key) return;
    const s = loadDiff(game, key);
    setSt(s ?? (started ? { level: "medio", start: null } : null));
  }, [game, key]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = (l: Level) => setSt(chooseLevel(game, key, l));
  const level: Level = st?.level ?? "medio";
  return { ready: st !== undefined, chosen: !!st, level, start: st?.start ?? null, cfg: cfgOf(game, level), mult: MULT[level], choose };
}

/** Selector de nivel, antes de arrancar. */
export function DifficultyPicker({ game, onChoose }: { game: GameId; onChoose: (l: Level) => void }) {
  const [pref, setPref] = useState<Level>("medio");
  useEffect(() => setPref(lastLevel(game)), [game]);
  return (
    <section className="card diff-pick">
      <h2 style={{ margin: 0 }}>Elegí el nivel</h2>
      <p className="muted small" style={{ margin: "2px 0 10px" }}>Cada nivel tiene su propio reto del día. Más difícil, más puntos para la liga.</p>
      <div className="diff-options">
        {LEVELS.map((l) => (
          <button key={l} className={`diff-opt diff-${l} ${pref === l ? "pref" : ""}`} onClick={() => { play("click"); onChoose(l); }}>
            <span className="diff-name">{LEVEL_ICON[l]} {LEVEL_LABEL[l]}</span>
            <span className="diff-desc">{describe(game, l)}</span>
            <span className="diff-mult">×{MULT[l]} puntos</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/** Reloj de cuenta regresiva desde `start`. Llama a onEnd una sola vez al llegar a 0. */
export function useClock(start: number | null, seconds: number, active: boolean, onEnd: () => void) {
  const [now, setNow] = useState(() => Date.now());
  const ended = useRef(false);
  useEffect(() => { ended.current = false; }, [start, seconds]);
  useEffect(() => {
    if (!active || !start || !seconds) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [active, start, seconds]);
  const left = start && seconds ? Math.max(0, seconds - (now - start) / 1000) : Infinity;
  useEffect(() => {
    if (active && left <= 0 && !ended.current) { ended.current = true; onEnd(); }
  }, [left, active]); // eslint-disable-line react-hooks/exhaustive-deps
  return left;
}

export function ClockBadge({ left, total, level }: { left: number; total: number; level: Level }) {
  const urgent = left < Math.min(15, total * 0.2);
  return (
    <span className={`tag clock ${urgent ? "urgent" : ""}`} aria-live="off">
      {LEVEL_ICON[level]} {isFinite(left) ? `⏱ ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, "0")}` : LEVEL_LABEL[level]}
    </span>
  );
}

/** Barra de tiempo para una jugada (Más o Menos, Intruso, Año). */
export function RoundTimer({ left, total }: { left: number; total: number }) {
  if (!isFinite(left)) return null;
  return <div className={`round-timer ${left < total * 0.3 ? "urgent" : ""}`}><span style={{ width: `${(left / total) * 100}%` }} /></div>;
}

/**
 * Todo junto para un reto diario: nivel elegido, reloj total y la pantalla para elegir nivel (gate).
 * onTimeout se llama si se termina el tiempo antes de terminar el reto.
 */
export function useLevel(game: GameId, key: string, state: { done: boolean; guesses?: string[] } | null, onTimeout: () => void) {
  const diff = useDifficulty(game, key, (state?.guesses?.length ?? 0) > 0);
  const left = useClock(diff.start, diff.cfg.time, !!state && !state.done && diff.chosen, onTimeout);
  const gate = !diff.ready ? <div className="card muted" style={{ marginTop: 24 }}>Cargando el reto…</div> : !diff.chosen ? (
    <>
      <div className="game-head"><h1>{dailyMeta(game).title}</h1></div>
      <DifficultyPicker game={game} onChoose={diff.choose} />
    </>
  ) : null;
  return { diff, left, gate, badge: diff.chosen ? <ClockBadge left={state?.done ? Infinity : left} total={diff.cfg.time} level={diff.level} /> : null };
}

/** Reloj por jugada: se reinicia cada vez que cambia `roundKey`. */
export function useRoundClock(seconds: number | undefined, roundKey: string, active: boolean, onEnd: () => void) {
  const [start, setStart] = useState<number | null>(null);
  useEffect(() => { setStart(seconds && active ? Date.now() : null); }, [roundKey, seconds, active]);
  return useClock(start, seconds ?? 0, active && !!seconds, onEnd);
}
