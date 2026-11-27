"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dayNumber, pickDaily } from "@/lib/game/daily";
import { dailyMeta } from "@/lib/game/daily-games";
import { points } from "@/lib/game/scoring";
import { CAT_CYCLE, CAT_LABEL, scoreWord, WORDS, type WordCat } from "@/lib/game/words";
import { play } from "@/lib/sound";
import { Confetti } from "./Confetti";
import { GameTop, HelpDialog, ResultCard, fmtKey, useToast } from "./GameParts";
import { useDailyGame } from "./useDailyGame";

const MAX = 6;
const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const POOL = WORDS.map((w) => ({ ...w, cat: w.cat ?? ("jugador" as WordCat), id: w.word }));
interface PState { done: boolean; won: boolean; guesses: string[]; summary?: string; hint?: boolean }
const RANK = { miss: 0, near: 1, hit: 2 } as const;

export function PalabraGame({ day }: { day?: number }) {
  const meta = dailyMeta("palabra");
  const g = useDailyGame<PState>("palabra", day, () => ({ done: false, won: false, guesses: [] }));
  const [cur, setCur] = useState("");
  const [shake, setShake] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const toast = useToast();
  const cat: WordCat = g.key ? CAT_CYCLE[dayNumber(g.key) % CAT_CYCLE.length] : "jugador";
  const target = g.key ? pickDaily(POOL.filter((w) => w.cat === cat), 424242, g.key) : null;
  const N = target?.word.length ?? 5;

  const keyState = useMemo(() => {
    const m: Record<string, "hit" | "near" | "miss"> = {};
    if (!target || !g.state) return m;
    for (const gs of g.state.guesses) {
      scoreWord(gs, target.word).forEach((st, i) => {
        const l = gs[i];
        if (!m[l] || RANK[st] > RANK[m[l]]) m[l] = st;
      });
    }
    return m;
  }, [g.state, target]);

  const submit = useCallback(() => {
    if (!g.state || !target || g.state.done) return;
    if (cur.length !== N) {
      setShake(true);
      play("near");
      setTimeout(() => setShake(false), 450);
      toast.show(`Tiene ${N} letras`);
      return;
    }
    const guesses = [...g.state.guesses, cur];
    const won = cur === target.word;
    const done = won || guesses.length >= MAX;
    play("kick");
    scoreWord(cur, target.word).forEach((st, i) => setTimeout(() => play(st === "hit" ? "hit" : st === "near" ? "near" : "flip"), 150 + i * 110));
    g.save({ ...g.state, guesses, won, done, summary: done ? `${won ? guesses.length : "X"}/${MAX}` : undefined });
    setCur("");
    const end = 150 + N * 110 + 150;
    if (won) setTimeout(() => { play("win"); setConfetti((n) => n + 1); }, end);
    else if (done) setTimeout(() => play("lose"), end);
    if (done) g.finish(won, guesses.length, points(won, guesses.length));
  }, [cur, g, target, N, toast]);

  const press = useCallback(
    (k: string) => {
      if (!g.state || g.state.done) return;
      if (k === "ENTER") return submit();
      if (k === "DEL") return setCur((c) => c.slice(0, -1));
      if (/^[A-Z]$/.test(k)) setCur((c) => (c.length < N ? c + k : c));
    },
    [g.state, submit, N],
  );

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "Enter") press("ENTER");
      else if (e.key === "Backspace") press("DEL");
      else if (/^[a-zñ]$/i.test(e.key)) press(e.key.toUpperCase() === "Ñ" ? "N" : e.key.toUpperCase());
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [press]);

  if (!g.state || !target) return <div className="card muted" style={{ marginTop: 24 }}>Cargando el reto…</div>;
  const s = g.state;
  const rows = Array.from({ length: MAX }, (_, i) => s.guesses[i] ?? (i === s.guesses.length && !s.done ? cur : ""));
  const wrong = s.guesses.filter((x) => x !== target.word).length;
  const canHint = wrong >= 3 || s.done;
  const pts = points(s.won, s.guesses.length);
  const em = { hit: "🟩", near: "🟨", miss: "⬛" };
  const shareBody = s.guesses.map((gs) => scoreWord(gs, target.word).map((x) => em[x]).join("")).join("\n");

  return (
    <>
      <Confetti fire={confetti} />
      <GameTop title="Palabra Crack" mode={g.mode} day={g.day} dateLabel={fmtKey(g.key)} onHelp={() => g.setShowHelp(true)} extra={<><span className="tag tag-accent">{CAT_LABEL[cat]}</span><span className="tag">{N} letras</span></>} />

      <div className="wordle" style={{ "--n": N } as React.CSSProperties}>
        {rows.map((w, r) => {
          const scored = r < s.guesses.length ? scoreWord(s.guesses[r], target.word) : null;
          const isCur = r === s.guesses.length && !s.done;
          return (
            <div key={r} className={`w-row ${isCur && shake ? "shake" : ""}`}>
              {Array.from({ length: N }, (_, i) => (
                <span
                  key={i}
                  className={`w-tile ${scored ? `${scored[i]} rev` : w[i] ? "typed" : ""}`}
                  style={scored ? { animationDelay: `${i * 110}ms` } : undefined}
                >
                  {w[i] ?? ""}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      {!s.done && (
        <div className="row" style={{ justifyContent: "center", margin: "6px 0 10px" }}>
          {canHint ? (
            s.hint ? <span className="hint-chip">💡 {target.hint}</span> : (
              <button className="btn btn-ghost small" onClick={() => { play("click"); g.save({ ...s, hint: true }); }}>💡 Ver pista</button>
            )
          ) : (
            <span className="muted small">La pista se habilita después del 3.er error</span>
          )}
        </div>
      )}

      {s.done && (
        <ResultCard
          won={s.won}
          title={s.won ? "¡Crack! ⚽" : "Se te escapó 😮‍💨"}
          subtitle={<><b style={{ color: "var(--chalk)", fontSize: 18, letterSpacing: "0.1em" }}>{target.word}</b> · {target.name} · {target.hint}</>}
          mode={g.mode}
          pts={pts}
          repGain={g.repGain}
          streak={g.stats?.streak}
          shareTitle={`${meta.title} ${s.won ? s.guesses.length : "X"}/${MAX}`}
          shareBody={shareBody}
          path={meta.path}
          day={g.day}
        />
      )}

      {!s.done && (
        <div className="kb" aria-label="Teclado">
          {ROWS.map((row, i) => (
            <div key={i} className="kb-row">
              {i === 2 && <button className="kb-key wide" onClick={() => press("ENTER")}>ENVIAR</button>}
              {row.split("").map((k) => (
                <button key={k} className={`kb-key ${keyState[k] ?? ""}`} onClick={() => press(k)}>{k}</button>
              ))}
              {i === 2 && <button className="kb-key wide" onClick={() => press("DEL")} aria-label="Borrar">⌫</button>}
            </div>
          ))}
        </div>
      )}

      <HelpDialog
        open={g.showHelp}
        onClose={() => g.setShowHelp(false)}
        steps={[
          <>Adiviná el <b>apellido</b> de un jugador o DT. Las casillas te dicen cuántas letras tiene.</>,
          <>Tenés <b>{MAX} intentos</b>. Después de cada uno, las letras se pintan.</>,
          <>Desde el 4.º intento podés pedir una <b>pista</b> (país, puesto y época).</>,
        ]}
      >
        <div className="howto-word">
          {["T", "E", "V", "E", "Z"].map((l, i) => (
            <span key={i} className={`w-tile ${["hit", "miss", "near", "miss", "miss"][i]}`}>{l}</span>
          ))}
        </div>
        <div className="howto-legend">
          <div><span className="sw hit" /> Letra en su lugar</div>
          <div><span className="sw near" /> Está, en otro lugar</div>
          <div><span className="sw miss" /> No está</div>
        </div>
      </HelpDialog>
      {toast.node}
    </>
  );
}
