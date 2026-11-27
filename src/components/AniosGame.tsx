"use client";
import { useMemo, useRef, useState } from "react";
import { dailyMoments, MAX_YEAR, MIN_YEAR, PER_DAY, scoreYear } from "@/lib/game/anios";
import { dayNumber } from "@/lib/game/daily";
import { dailyMeta } from "@/lib/game/daily-games";
import { play } from "@/lib/sound";
import { Confetti } from "./Confetti";
import { GameTop, HelpDialog, ResultCard, fmtKey } from "./GameParts";
import { useDailyGame } from "./useDailyGame";
import { RoundTimer, useLevel, useRoundClock } from "./Difficulty";
import { levelSeed } from "@/lib/difficulty";

interface AState { done: boolean; won: boolean; guesses: string[]; summary?: string }
const MAXPTS = PER_DAY * 5;

export function AniosGame({ day }: { day?: number }) {
  const meta = dailyMeta("anios");
  const g = useDailyGame<AState>("anios", day, () => ({ done: false, won: false, guesses: [] }));
  const [year, setYear] = useState(2000);
  const [shown, setShown] = useState<number | null>(null); // índice cuya respuesta se está mostrando
  const [confetti, setConfetti] = useState(0);
  const lv = useLevel("anios", g.key, g.state, () => {});
  const moments = useMemo(() => (g.key && lv.diff.chosen ? dailyMoments(levelSeed(dayNumber(g.key) * 41 + 9, lv.diff.level)) : []), [g.key, lv.diff.level, lv.diff.chosen]);
  const timeoutRef = useRef<() => void>(() => {});
  const left = useRoundClock(lv.diff.cfg.perRound, `${g.state?.guesses.length}`, !!g.state && !g.state.done && shown === null && lv.diff.chosen, () => timeoutRef.current());
  if (lv.gate) return lv.gate;
  if (!g.state || !g.key || !moments.length) return <div className="card muted" style={{ marginTop: 24 }}>Cargando el reto…</div>;
  const s = g.state;
  const total = s.guesses.reduce((a, y, k) => a + scoreYear(Number(y), moments[k].year), 0);
  const k = shown ?? s.guesses.length;
  const m = moments[Math.min(k, moments.length - 1)];

  const confirm = () => {
    if (s.done || shown !== null) return;
    const guesses = [...s.guesses, String(year)];
    const pts = scoreYear(year, m.year);
    play(pts >= 3 ? "hit" : pts > 0 ? "near" : "flip");
    g.save({ ...s, guesses });
    setShown(guesses.length - 1);
  };
  // Si se acaba el tiempo, se confirma el año que quedó marcado.
  timeoutRef.current = () => confirm();
  const next = () => {
    const guesses = s.guesses;
    setShown(null);
    if (guesses.length >= moments.length) {
      const t = guesses.reduce((a, y, j) => a + scoreYear(Number(y), moments[j].year), 0);
      const won = t >= 12;
      g.save({ ...s, done: true, won, summary: `${t}/${MAXPTS}` });
      if (t >= 20) { play("win"); setConfetti((n) => n + 1); } else play(won ? "win" : "lose");
      g.finish(won, Math.max(1, Math.min(meta.max, Math.ceil((MAXPTS - t) / 4) + 1)), Math.round((t / 2.5) * lv.diff.mult));
    }
  };
  const bar = (y: string, j: number) => { const p = scoreYear(Number(y), moments[j].year); return p === 5 ? "🟩" : p >= 2 ? "🟨" : p === 1 ? "🟧" : "🟥"; };
  const shareBody = s.guesses.map(bar).join("") + `\n📅 ${total}/${MAXPTS} puntos`;

  return (
    <>
      <Confetti fire={confetti} />
      <GameTop title="¿En qué año?" mode={g.mode} day={g.day} dateLabel={fmtKey(g.key)} onHelp={() => g.setShowHelp(true)} extra={<><span className="tag">{total} pts</span>{lv.badge}</>} />
      {!s.done && (
        <section className="card yr-card">
          <p className="muted small" style={{ margin: 0 }}>Momento {Math.min(k + 1, moments.length)} de {moments.length}</p>
          <p className="yr-text"><span className="yr-icon">{m.icon}</span> {m.text}</p>
          {shown === null ? (
            <>
              <div className="yr-value">
                <button className="btn" onClick={() => setYear((y) => Math.max(MIN_YEAR, y - 1))} aria-label="Un año menos">−</button>
                <span>{year}</span>
                <button className="btn" onClick={() => setYear((y) => Math.min(MAX_YEAR, y + 1))} aria-label="Un año más">+</button>
              </div>
              <input className="yr-range" type="range" min={MIN_YEAR} max={MAX_YEAR} value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Año" />
              {lv.diff.cfg.perRound ? <RoundTimer left={left} total={lv.diff.cfg.perRound} /> : null}
              <button className="btn btn-primary big-cta" onClick={confirm}>Confirmar {year}</button>
            </>
          ) : (
            <div className="yr-reveal">
              <p>Fue en <b className="yr-real">{moments[shown].year}</b> · dijiste {s.guesses[shown]}</p>
              <p className="yr-pts">+{scoreYear(Number(s.guesses[shown]), moments[shown].year)} puntos</p>
              <button className="btn btn-primary big-cta" onClick={next}>{shown + 1 >= moments.length ? "Ver resultado" : "Siguiente →"}</button>
            </div>
          )}
        </section>
      )}
      {s.done && (
        <>
          <ol className="in-summary">
            {moments.map((mo, j) => (
              <li key={j}>{bar(s.guesses[j], j)} <b>{mo.year}</b> · {mo.text} <span className="muted small">(dijiste {s.guesses[j]})</span></li>
            ))}
          </ol>
          <ResultCard
            won={s.won}
            title={total >= 20 ? "¡Memoria de hierro! 📚" : s.won ? "¡Bien ahí! 📅" : "A repasar la historia 😅"}
            subtitle={<><b style={{ color: "var(--chalk)" }}>{total}</b> de {MAXPTS} puntos</>}
            mode={g.mode}
            pts={Math.round((total / 2.5) * lv.diff.mult)}
            repGain={g.repGain}
            streak={g.stats?.streak}
            shareTitle={`${meta.title} ${total}/${MAXPTS}`}
            shareBody={shareBody}
            path={meta.path}
            day={g.day}
          />
        </>
      )}
      <HelpDialog
        open={g.showHelp}
        onClose={() => g.setShowHelp(false)}
        steps={[
          <>Te mostramos <b>{PER_DAY} momentos</b> de la historia del fútbol.</>,
          <>Elegí el año. Exacto: <b>5 puntos</b>; a 1 año: 3; a 3: 2; a 5: 1.</>,
          <>Con 12 puntos o más ganás el día.</>,
        ]}
      />
    </>
  );
}
