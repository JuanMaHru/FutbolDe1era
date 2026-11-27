"use client";
import { useEffect, useMemo, useState } from "react";
import { buildRounds, MAX_ROUNDS, themeOf, usableThemes, type HolItem, type Round } from "@/lib/game/masomenos";
import { dayNumber, keyToDate } from "@/lib/game/daily";
import { dailyMeta } from "@/lib/game/daily-games";
import { photoOf } from "@/lib/game/bios";
import { read, write } from "@/lib/storage";
import { play } from "@/lib/sound";
import { Crest } from "./art/Crest";
import { Confetti } from "./Confetti";
import { GameTop, HelpDialog, ResultCard, fmtKey } from "./GameParts";
import { useDailyGame } from "./useDailyGame";

interface MState { done: boolean; won: boolean; guesses: string[]; summary?: string }
const ptsOf = (streak: number) => Math.min(10, Math.ceil(streak / 2));

function Face({ item }: { item: HolItem }) {
  const photo = item.kind === "jugador" ? photoOf(item.id) : undefined;
  const [broken, setBroken] = useState(false);
  if (photo && !broken)
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="mm-photo" src={photo.url} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} />;
  return <span className="mm-crest"><Crest club={item.kind === "club" ? item.name : item.sub} size={64} /></span>;
}

function Card({ item, value, hidden, result, tag }: { item: HolItem; value: string; hidden?: boolean; result?: "ok" | "bad" | null; tag: string }) {
  return (
    <div className={`mm-card ${result ? `mm-${result}` : ""}`}>
      <span className="mm-tag">{tag}</span>
      <Face item={item} />
      <div className="mm-info">
        <span className="mm-name">{item.name}</span>
        <span className="muted small">{item.kind === "jugador" ? item.sub : item.sub}</span>
        <span className={`mm-value ${hidden ? "hidden" : ""}`}>{hidden ? "?" : value}</span>
      </div>
    </div>
  );
}

/** Apellido (o nombre corto) para los botones. */
const short = (n: string) => (n.split(" ").length > 1 && n.length > 12 ? n.split(" ").slice(-1)[0] : n);

/** Una partida (diaria o libre) sobre una lista de rondas. */
function Board({ rounds, answers, onAnswer, done }: { rounds: Round[]; answers: string[]; onAnswer: (a: "up" | "down") => void; done: boolean }) {
  const i = Math.min(answers.length, rounds.length - 1);
  const r = rounds[i];
  const [reveal, setReveal] = useState<null | "ok" | "bad">(null);
  if (!r) return null;
  const th = themeOf(r.theme);
  const correct: "up" | "down" = r.b.value > r.a.value ? "up" : "down";
  const pick = (a: "up" | "down") => {
    if (reveal || done) return;
    const ok = a === correct;
    play(ok ? "hit" : "near");
    setReveal(ok ? "ok" : "bad");
    setTimeout(() => { setReveal(null); onAnswer(a); }, ok ? 1100 : 1500);
  };
  const lastWrong = done && answers.length > 0 && answers.length <= rounds.length && answers[answers.length - 1] !== (rounds[answers.length - 1].b.value > rounds[answers.length - 1].a.value ? "up" : "down");
  const shownRound = done && lastWrong ? rounds[answers.length - 1] : r;
  return (
    <div className="mm-board">
      <p className="mm-theme"><b>{themeOf(shownRound.theme).label}</b>{themeOf(shownRound.theme).approx && <span className="muted small"> · valores aproximados</span>}</p>
      <Card item={shownRound.a} value={themeOf(shownRound.theme).fmt(shownRound.a.value)} tag="📌 Referencia" />
      <div className="mm-vs">VS</div>
      <Card item={shownRound.b} value={themeOf(shownRound.theme).fmt(shownRound.b.value)} hidden={!reveal && !done} result={done && lastWrong ? "bad" : reveal} tag={`¿Más o menos que ${short(shownRound.a.name)}?`} />
      {!done && (
        <>
          <p className="mm-ask">{th.ask.replace("{a}", r.a.name).replace("{b}", r.b.name)}</p>
          <div className="mm-buttons">
            <button className="btn btn-primary" disabled={!!reveal} onClick={() => pick("up")}>▲ {th.more} que {short(r.a.name)}</button>
            <button className="btn" disabled={!!reveal} onClick={() => pick("down")}>▼ {th.less} que {short(r.a.name)}</button>
          </div>
        </>
      )}
    </div>
  );
}

export function MasOMenosGame({ day }: { day?: number }) {
  const meta = dailyMeta("masomenos");
  const g = useDailyGame<MState>("masomenos", day, () => ({ done: false, won: false, guesses: [] }));
  const [confetti, setConfetti] = useState(0);
  const [free, setFree] = useState<null | { theme: string; seed: number; answers: string[]; done: boolean }>(null);
  const [best, setBest] = useState<Record<string, number>>({});
  useEffect(() => setBest(read<Record<string, number>>("masomenos:best", {})), []);

  const date = g.key ? keyToDate(g.key) : new Date();
  const rounds = useMemo(() => (g.key ? buildRounds(dayNumber(g.key) * 97 + 13, date) : []), [g.key]); // eslint-disable-line react-hooks/exhaustive-deps
  const freeRounds = useMemo(() => (free ? buildRounds(free.seed, new Date(), free.theme) : []), [free?.seed, free?.theme]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!g.state || !g.key || !rounds.length) return <div className="card muted" style={{ marginTop: 24 }}>Cargando el reto…</div>;
  const s = g.state;
  const isRight = (rs: Round[], a: string, k: number) => a === (rs[k].b.value > rs[k].a.value ? "up" : "down");
  const streak = s.guesses.filter((a, k) => isRight(rounds, a, k)).length;

  const answer = (a: "up" | "down") => {
    const guesses = [...s.guesses, a];
    const ok = isRight(rounds, a, guesses.length - 1);
    const st = guesses.filter((x, k) => isRight(rounds, x, k)).length;
    const done = !ok || guesses.length >= rounds.length;
    const won = st >= 5;
    g.save({ guesses, done, won, summary: done ? `${st} seguidas` : undefined });
    if (done) {
      if (st >= 10) { play("win"); setConfetti((n) => n + 1); } else play(won ? "win" : "lose");
      g.finish(won, Math.max(1, Math.min(meta.max, MAX_ROUNDS - st)), ptsOf(st));
    }
  };

  const freeAnswer = (a: "up" | "down") => {
    if (!free) return;
    const answers = [...free.answers, a];
    const ok = isRight(freeRounds, a, answers.length - 1);
    const done = !ok || answers.length >= freeRounds.length;
    const st = answers.filter((x, k) => isRight(freeRounds, x, k)).length;
    if (done && st > (best[free.theme] ?? 0)) { const b = { ...best, [free.theme]: st }; setBest(b); write("masomenos:best", b); }
    setFree({ ...free, answers, done });
  };
  const freeStreak = free ? free.answers.filter((x, k) => isRight(freeRounds, x, k)).length : 0;

  const shareBody = s.guesses.map((a, k) => (isRight(rounds, a, k) ? "🟩" : "🟥")).join("") + `\n🔥 ${streak} seguidas`;

  return (
    <>
      <Confetti fire={confetti} />
      <GameTop title="Más o Menos" mode={g.mode} day={g.day} dateLabel={fmtKey(g.key)} onHelp={() => g.setShowHelp(true)} extra={<span className="tag">🔥 {streak}</span>} />

      {!free && (
        <>
          <Board rounds={rounds} answers={s.guesses} onAnswer={answer} done={s.done} />
          {s.done && (
            <ResultCard
              won={s.won}
              title={streak >= MAX_ROUNDS ? "¡Perfecto! 🏆" : streak >= 10 ? "¡Enciclopedia! 📚" : streak >= 5 ? "¡Bien ahí! ⚖️" : "Te la jugaste 😮‍💨"}
              subtitle={<><b style={{ color: "var(--chalk)" }}>{streak}</b> seguidas de {rounds.length}</>}
              mode={g.mode}
              pts={ptsOf(streak)}
              repGain={g.repGain}
              streak={g.stats?.streak}
              shareTitle={`${meta.title}: ${streak} seguidas`}
              shareBody={shareBody}
              path={meta.path}
              day={g.day}
            />
          )}
        </>
      )}

      <section className="card mm-free">
        <h2 style={{ margin: "0 0 6px" }}>Modo libre</h2>
        <p className="muted small" style={{ marginTop: 0 }}>Elegí una temática y jugá sin límite. No suma a la liga.</p>
        {free ? (
          <>
            <p className="small">Temática: <b>{themeOf(free.theme).label}</b> · Racha: <b>{freeStreak}</b> · Récord: <b>{best[free.theme] ?? 0}</b></p>
            <Board key={`${free.theme}-${free.seed}`} rounds={freeRounds} answers={free.answers} onAnswer={freeAnswer} done={free.done} />
            <div className="row" style={{ marginTop: 10 }}>
              {free.done && <button className="btn btn-primary" onClick={() => setFree({ ...free, seed: Math.floor(Math.random() * 1e9), answers: [], done: false })}>Otra vez</button>}
              <button className="btn" onClick={() => setFree(null)}>Cambiar temática</button>
            </div>
          </>
        ) : (
          <div className="mm-themes">
            {usableThemes(new Date()).map((t) => (
              <button key={t.id} className="btn" onClick={() => { play("click"); setFree({ theme: t.id, seed: Math.floor(Math.random() * 1e9), answers: [], done: false }); }}>
                {t.kind === "club" ? "🏟️" : "👟"} {t.label}{best[t.id] ? ` · ${best[t.id]}🔥` : ""}
              </button>
            ))}
          </div>
        )}
      </section>

      <HelpDialog
        open={g.showHelp}
        onClose={() => g.setShowHelp(false)}
        steps={[
          <>Arriba está la <b>referencia</b>, con su dato a la vista (valor, edad, goles, estadio…).</>,
          <>Decidí si el de <b>abajo</b> tiene <b>más o menos que el de arriba</b>.</>,
          <>Si acertás, sigue la racha. Un error y se termina. La temática cambia cada 4 rondas.</>,
        ]}
      />
    </>
  );
}
