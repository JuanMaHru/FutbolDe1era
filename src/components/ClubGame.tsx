"use client";
import { useState } from "react";
import { CLUB_OPTIONS, CLUB_TARGETS, MAX } from "@/lib/game/club";
import { pickDaily } from "@/lib/game/daily";
import { dailyMeta } from "@/lib/game/daily-games";
import { points } from "@/lib/game/scoring";
import { clubStyle } from "@/lib/clubs";
import { play } from "@/lib/sound";
import { Crest } from "./art/Crest";
import { Kit } from "./art/Kit";
import { Confetti } from "./Confetti";
import { GameTop, HelpDialog, ResultCard, fmtKey } from "./GameParts";
import { GuessInput } from "./GuessInput";
import { useDailyGame } from "./useDailyGame";

interface CState { done: boolean; won: boolean; guesses: string[]; summary?: string }

export function ClubGame({ day }: { day?: number }) {
  const meta = dailyMeta("club");
  const g = useDailyGame<CState>("club", day, () => ({ done: false, won: false, guesses: [] }));
  const [confetti, setConfetti] = useState(0);
  if (!g.state || !g.key) return <div className="card muted" style={{ marginTop: 24 }}>Cargando el reto…</div>;
  const s = g.state;
  const t = pickDaily(CLUB_TARGETS, 6061, g.key);
  const wrong = s.guesses.filter((x) => x !== t.id).length;
  const clues: { label: string; value: React.ReactNode }[] = [
    { label: "Colores", value: <span className="cl-kit"><Kit club={t.name} label="" size={56} /> <span className="muted small">{clubStyle(t.name).pattern === "plain" ? "lisa" : "con diseño"}</span></span> },
    { label: "Liga", value: t.league ?? "—" },
    { label: "Fundación", value: t.fundacion },
    { label: "Estadio", value: t.estadio?.replace(/^Estadio\s+/i, "Estadio ") },
    { label: "Jugó ahí", value: t.player ?? "—" },
    { label: "Iniciales", value: clubStyle(t.name).abbr },
  ];
  const open = s.done ? clues.length : Math.min(clues.length, 1 + wrong);

  const onPick = (o: { id: string; name: string }) => {
    if (s.done) return;
    const guesses = [...s.guesses, o.id];
    const won = o.id === t.id;
    const done = won || guesses.length >= MAX;
    g.save({ guesses, won, done, summary: done ? `${won ? guesses.length : "X"}/${MAX}` : undefined });
    if (won) { play("win"); setConfetti((n) => n + 1); } else play(done ? "lose" : "near");
    if (done) g.finish(won, guesses.length, points(won, guesses.length));
  };
  const shareBody = s.guesses.map((x) => (x === t.id ? "✅" : "🟥")).join("") + `\n🏟️ ${open} pistas`;

  return (
    <>
      <Confetti fire={confetti} />
      <GameTop title="¿De qué club es?" mode={g.mode} day={g.day} dateLabel={fmtKey(g.key)} onHelp={() => g.setShowHelp(true)} extra={<span className="tag">{s.guesses.length}/{MAX}</span>} />
      <div className="cl-clues">
        {clues.map((c, i) => (
          <div key={c.label} className={`hint ${i < open ? "open" : ""}`}>
            <span className="hint-label">{i < open ? "💡" : "🔒"} {c.label}</span>
            <span className="hint-value">{i < open ? c.value : `con ${i} ${i === 1 ? "error" : "errores"}`}</span>
          </div>
        ))}
      </div>
      {s.done && (
        <ResultCard
          won={s.won}
          title={s.won ? (s.guesses.length === 1 ? "¡De primera! 🎯" : "¡Ese es! 🏟️") : "Era otro 😮‍💨"}
          subtitle={<span className="cl-answer"><Crest club={t.name} size={28} /> <b style={{ color: "var(--chalk)" }}>{t.name}</b>{t.capacidad ? ` · ${t.capacidad.toLocaleString("es-AR")} lugares` : ""}</span>}
          mode={g.mode}
          pts={points(s.won, s.guesses.length)}
          repGain={g.repGain}
          streak={g.stats?.streak}
          shareTitle={`${meta.title} ${s.won ? s.guesses.length : "X"}/${MAX}`}
          shareBody={shareBody}
          path={meta.path}
          day={g.day}
        />
      )}
      {!s.done && <GuessInput items={CLUB_OPTIONS} used={new Set(s.guesses)} placeholder="¿Qué club es?" onPick={onPick} />}
      {s.guesses.length > 0 && (
        <ul className="wrong-list">{s.guesses.map((x, i) => <li key={i} className={x === t.id ? "ok" : ""}>{x === t.id ? "✅" : "✗"} {x}</li>)}</ul>
      )}
      <HelpDialog
        open={g.showHelp}
        onClose={() => g.setShowHelp(false)}
        steps={[
          <>Arrancás con los <b>colores de la camiseta</b>.</>,
          <>Cada error abre otra pista: liga, fundación, estadio, un jugador que pasó por ahí e iniciales.</>,
          <>Tenés <b>{MAX} intentos</b>.</>,
        ]}
      />
    </>
  );
}
