"use client";
import { useMemo, useState } from "react";
import { careersOf, sortedCareer, yearsLabel } from "@/lib/game/careers";
import { dayNumber, pickDaily, shuffled } from "@/lib/game/daily";
import { dailyMeta } from "@/lib/game/daily-games";
import { COUNTRIES } from "@/lib/game/meta";
import { points } from "@/lib/game/scoring";
import { photoOf } from "@/lib/game/bios";
import { play } from "@/lib/sound";
import { Crest } from "./art/Crest";
import { Confetti } from "./Confetti";
import { GameTop, HelpDialog, ResultCard, fmtKey } from "./GameParts";
import { useDailyGame } from "./useDailyGame";

/** Errores permitidos antes de perder. */
const LIVES = 3;
interface OState { done: boolean; won: boolean; guesses: string[]; summary?: string; taps: string[] }

/**
 * Trayectoria DT como desafío de orden: se ven los equipos que dirigió, mezclados,
 * y hay que tocarlos en orden cronológico. Distinto de adivinar: se trata de reconstruir la historia.
 */
export function OrderGame({ day }: { day?: number }) {
  const meta = dailyMeta("traydt");
  const pool = useMemo(() => careersOf("dt").filter((c) => c.career.length >= 3), []);
  const g = useDailyGame<OState>("traydt", day, () => ({ done: false, won: false, guesses: [], taps: [] }));
  const [confetti, setConfetti] = useState(0);
  const [bad, setBad] = useState<number | null>(null);

  if (!g.state || !g.key) return <div className="card muted" style={{ marginTop: 24 }}>Cargando el reto…</div>;

  const target = pickDaily(pool, 9173, g.key);
  const steps = sortedCareer(target);
  const s = g.state;
  // Fichas mezcladas (estables por día). Cada ficha es un índice en `steps`.
  const tiles = shuffled(steps.map((_, i) => i), dayNumber(g.key) * 31 + 7);
  // "ok:<ficha>" = ficha bien ubicada (en orden), "x<ficha>" = error.
  const okTiles = s.taps.filter((x) => x.startsWith("ok:")).map((x) => Number(x.slice(3)));
  const placed = okTiles;
  const errors = s.taps.filter((x) => x.startsWith("x")).length;
  const nextIdx = placed.length;
  const photo = photoOf(target.id);

  const tap = (i: number) => {
    if (s.done || okTiles.includes(i)) return;
    // Vale cualquier ficha del mismo club que el siguiente paso (por si volvió a dirigir ahí).
    const ok = steps[i].club === steps[nextIdx].club;
    const taps = [...s.taps, ok ? `ok:${i}` : `x${i}`];
    const newPlaced = taps.filter((x) => x.startsWith("ok:")).length;
    const newErrors = taps.filter((x) => x.startsWith("x")).length;
    const won = newPlaced === steps.length;
    const done = won || newErrors >= LIVES;
    if (ok) play(won ? "win" : "hit");
    else { play("near"); setBad(i); setTimeout(() => setBad(null), 450); }
    if (won) setConfetti((n) => n + 1);
    else if (done) setTimeout(() => play("lose"), 200);
    g.save({ ...s, taps, done, won, guesses: taps, summary: done ? (won ? `${newErrors} errores` : "X") : undefined });
    if (done) g.finish(won, Math.min(newErrors + 1, meta.max), won ? points(true, newErrors + 1) : 0);
  };

  const tileUsed = (i: number) => okTiles.includes(i) || s.done;
  const shareBody = s.taps.map((x) => (x.startsWith("ok") ? "🟩" : "🟥")).join("") + `\n📋 ${placed.length}/${steps.length} en orden`;

  return (
    <>
      <Confetti fire={confetti} />
      <GameTop title="Trayectoria DT" mode={g.mode} day={g.day} dateLabel={fmtKey(g.key)} onHelp={() => g.setShowHelp(true)} />

      <div className="order-head card">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="order-photo" src={photo.url} alt={target.name} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        )}
        <div>
          <p className="muted small" style={{ margin: 0 }}>Ordená la carrera de</p>
          <p className="order-name">{target.name} {COUNTRIES[target.nationality]?.flag}</p>
          <p className="muted small" style={{ margin: 0 }}>Tocá los equipos del primero al último. Tenés {LIVES} errores.</p>
        </div>
      </div>

      <div className="tries-bar">
        {Array.from({ length: LIVES }, (_, i) => <span key={i} className={`try ${i < errors ? "t-used" : ""}`} />)}
        <span className="tries-text">{LIVES - errors} ❤️</span>
      </div>

      <ol className="timeline order-line" aria-label="Orden armado">
        {steps.map((st, i) => {
          const on = i < nextIdx || s.done;
          return (
            <li key={i} className={`tl-item ${on ? "on" : "off"} ${s.done && i >= nextIdx ? "missed" : ""}`}>
              <span className="tl-dot" aria-hidden />
              {on ? (
                <>
                  <Crest club={st.club} size={34} />
                  <div className="tl-text"><span className="tl-club">{st.club}</span><span className="tl-years">{yearsLabel(st)}</span></div>
                </>
              ) : (
                <><span className="tl-lock" aria-hidden>{i + 1}</span><div className="tl-text"><span className="tl-club muted">{i === nextIdx ? "¿Cuál sigue?" : "…"}</span></div></>
              )}
            </li>
          );
        })}
      </ol>

      {!s.done && (
        <div className="order-tiles">
          {tiles.map((i) => (
            <button key={i} className={`order-tile ${tileUsed(i) ? "used" : ""} ${bad === i ? "shake" : ""}`} disabled={tileUsed(i)} onClick={() => tap(i)}>
              <Crest club={steps[i].club} size={30} />
              <span>{steps[i].club}</span>
            </button>
          ))}
        </div>
      )}

      {s.done && (
        <ResultCard
          won={s.won}
          title={s.won ? (errors === 0 ? "¡Perfecto! 🎯" : "¡Ordenada! 📋") : "Se te mezcló 😮‍💨"}
          subtitle={<><b style={{ color: "var(--chalk)" }}>{target.name}</b> · {steps.length} equipos · {errors} {errors === 1 ? "error" : "errores"}</>}
          mode={g.mode}
          pts={s.won ? points(true, errors + 1) : 0}
          repGain={g.repGain}
          streak={g.stats?.streak}
          shareTitle={`${meta.title} ${s.won ? `${errors} err.` : "X"}`}
          shareBody={shareBody}
          path={meta.path}
          day={g.day}
        />
      )}

      <HelpDialog
        open={g.showHelp}
        onClose={() => g.setShowHelp(false)}
        steps={[
          <>Te mostramos a un DT y los equipos que dirigió, <b>mezclados</b>.</>,
          <>Tocalos <b>en orden cronológico</b>: del primero al último.</>,
          <>Si te equivocás perdés una vida. Con <b>{LIVES} errores</b> se termina.</>,
        ]}
      />
    </>
  );
}
