"use client";
import { useMemo, useRef, useState } from "react";
import { buildIntruso, ROUNDS } from "@/lib/game/intruso";
import { dayNumber } from "@/lib/game/daily";
import { dailyMeta } from "@/lib/game/daily-games";
import { COUNTRIES, POSITIONS } from "@/lib/game/meta";
import { photoOf } from "@/lib/game/bios";
import { play } from "@/lib/sound";
import { Crest } from "./art/Crest";
import { Confetti } from "./Confetti";
import { GameTop, HelpDialog, ResultCard, fmtKey } from "./GameParts";
import { useDailyGame } from "./useDailyGame";
import { RoundTimer, useLevel, useRoundClock } from "./Difficulty";
import { levelSeed } from "@/lib/difficulty";

interface IState { done: boolean; won: boolean; guesses: string[]; summary?: string }

function Pic({ id, club }: { id: string; club: string }) {
  const ph = photoOf(id);
  const [bad, setBad] = useState(false);
  // eslint-disable-next-line @next/next/no-img-element
  if (ph && !bad) return <img className="in-photo" src={ph.url} alt="" referrerPolicy="no-referrer" onError={() => setBad(true)} />;
  return <span className="in-photo crest"><Crest club={club} size={44} /></span>;
}

export function IntrusoGame({ day }: { day?: number }) {
  const meta = dailyMeta("intruso");
  const g = useDailyGame<IState>("intruso", day, () => ({ done: false, won: false, guesses: [] }));
  const [confetti, setConfetti] = useState(0);
  const [reveal, setReveal] = useState<{ k: number; id: string } | null>(null);
  const lv = useLevel("intruso", g.key, g.state, () => {});
  const rounds = useMemo(() => (g.key && lv.diff.chosen ? buildIntruso(levelSeed(dayNumber(g.key) * 53 + 5, lv.diff.level), lv.diff.level) : []), [g.key, lv.diff.level, lv.diff.chosen]);
  const timeoutRef = useRef<() => void>(() => {});
  const left = useRoundClock(lv.diff.cfg.perRound, `${g.state?.guesses.length}`, !!g.state && !g.state.done && !reveal && lv.diff.chosen, () => timeoutRef.current());
  if (lv.gate) return lv.gate;
  if (!g.state || !g.key || !rounds.length) return <div className="card muted" style={{ marginTop: 24 }}>Cargando el reto…</div>;
  const s = g.state;
  const hits = s.guesses.filter((x, k) => x === rounds[k].intruder).length;
  const k = Math.min(s.guesses.length, rounds.length - 1);

  const pick = (id: string) => {
    if (s.done || reveal) return;
    const ok = id === rounds[k].intruder;
    play(ok ? "hit" : "near");
    setReveal({ k, id });
    setTimeout(() => {
      setReveal(null);
      const guesses = [...s.guesses, id];
      const done = guesses.length >= rounds.length;
      const h = guesses.filter((x, j) => x === rounds[j].intruder).length;
      g.save({ guesses, done, won: done && h >= 3, summary: done ? `${h}/${rounds.length}` : undefined });
      if (done) {
        if (h === rounds.length) { play("win"); setConfetti((n) => n + 1); } else play(h >= 3 ? "win" : "lose");
        g.finish(h >= 3, Math.max(1, rounds.length - h + 1), Math.round(h * 2 * lv.diff.mult));
      }
    }, 1700);
  };
  // Si se acaba el tiempo de la ronda, cuenta como error.
  timeoutRef.current = () => { const wrong = rounds[k].options.find((p) => p.id !== rounds[k].intruder); if (wrong) pick(wrong.id); };
  const R = s.done ? null : rounds[reveal ? reveal.k : k];
  const shareBody = s.guesses.map((x, k) => (x === rounds[k].intruder ? "🟩" : "🟥")).join("") + `\n🕵️ ${hits}/${rounds.length} intrusos`;

  return (
    <>
      <Confetti fire={confetti} />
      <GameTop title="El intruso" mode={g.mode} day={g.day} dateLabel={fmtKey(g.key)} onHelp={() => g.setShowHelp(true)} extra={<><span className="tag">{Math.min(s.guesses.length + 1, rounds.length)}/{rounds.length}</span>{lv.badge}</>} />
      {R && (
        <>
          {lv.diff.cfg.perRound && !reveal ? <RoundTimer left={left} total={lv.diff.cfg.perRound} /> : null}
          <p className="in-ask">¿Quién <b>no</b> encaja con los otros tres?</p>
          <div className="in-grid">
            {R.options.map((p) => {
              const cls = reveal ? (p.id === R.intruder ? "in-right" : reveal.id === p.id ? "in-wrong" : "") : "";
              return (
                <button key={p.id} className={`in-opt ${cls}`} disabled={!!reveal} onClick={() => pick(p.id)}>
                  <Pic id={p.id} club={p.club} />
                  <span className="in-name">{p.name}</span>
                  <span className="muted small">{COUNTRIES[p.nationality]?.flag} {POSITIONS[p.position]?.label} · {p.club}</span>
                </button>
              );
            })}
          </div>
          {reveal && <p className="notice">🔎 Los otros tres: <b>{R.rule.label}</b></p>}
        </>
      )}
      {s.done && (
        <>
          <ol className="in-summary">
            {rounds.map((rd, k) => (
              <li key={k} className={s.guesses[k] === rd.intruder ? "ok" : "bad"}>
                {s.guesses[k] === rd.intruder ? "✅" : "❌"} <b>{rd.rule.label}</b> · intruso: {rd.options.find((p) => p.id === rd.intruder)?.name}
              </li>
            ))}
          </ol>
          <ResultCard
            won={s.won}
            title={hits === rounds.length ? "¡Detective! 🕵️" : hits >= 3 ? "¡Bien visto! 🔎" : "Se te escaparon 😮‍💨"}
            subtitle={<><b style={{ color: "var(--chalk)" }}>{hits}</b> de {rounds.length} intrusos</>}
            mode={g.mode}
            pts={Math.round(hits * 2 * lv.diff.mult)}
            repGain={g.repGain}
            streak={g.stats?.streak}
            shareTitle={`${meta.title} ${hits}/${rounds.length}`}
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
          <>Te mostramos <b>4 jugadores</b>: tres comparten algo (club, país, liga, puesto…).</>,
          <>Tocá al que <b>no encaja</b>. Después te contamos qué tenían en común.</>,
          <>Son <b>{ROUNDS} rondas</b>. Con 3 aciertos ganás el día.</>,
        ]}
      />
    </>
  );
}
