"use client";
import { useMemo, useState } from "react";
import { CAREERS, careersOf, revealedCount, sortedCareer, yearsLabel, type CareerEntry } from "@/lib/game/careers";
import { pickDaily } from "@/lib/game/daily";
import { dailyMeta } from "@/lib/game/daily-games";
import { COUNTRIES, LINE_LABEL, POSITIONS } from "@/lib/game/meta";
import { points } from "@/lib/game/scoring";
import { clubStyle } from "@/lib/clubs";
import { play } from "@/lib/sound";
import { Crest } from "./art/Crest";
import { Confetti } from "./Confetti";
import { GameTop, HelpDialog, ResultCard, fmtKey } from "./GameParts";
import { GuessInput } from "./GuessInput";
import { useDailyGame } from "./useDailyGame";

const MAX = 6;
interface TState { done: boolean; won: boolean; guesses: string[]; summary?: string }

export function TrayectoriaGame({ kind, day }: { kind: "jugador" | "dt"; day?: number }) {
  const id = kind === "jugador" ? "tray" : "traydt";
  const meta = dailyMeta(id);
  const pool = useMemo(() => careersOf(kind), [kind]);
  const g = useDailyGame<TState>(id, day, () => ({ done: false, won: false, guesses: [] }));
  const [confetti, setConfetti] = useState(0);
  const [shake, setShake] = useState(false);

  if (!g.state || !g.key) return <div className="card muted" style={{ marginTop: 24 }}>Cargando el reto…</div>;

  const target = pickDaily(pool, kind === "jugador" ? 7331 : 9173, g.key);
  const steps = sortedCareer(target);
  const s = g.state;
  const wrong = s.guesses.filter((x) => x !== target.id).length;
  const shown = s.done ? steps.length : revealedCount(steps.length, wrong, MAX);
  // Pistas extra cuando ya se ven todos los clubes.
  const extraHints = Math.max(0, 1 + wrong * Math.max(1, Math.ceil((steps.length - 1) / (MAX - 1))) - steps.length);

  const onPick = (item: CareerEntry) => {
    if (s.done) return;
    const guesses = [...s.guesses, item.id];
    const won = item.id === target.id;
    const done = won || guesses.length >= MAX;
    play("kick");
    const next: TState = { guesses, won, done, summary: done ? `${won ? guesses.length : "X"}/${MAX}` : undefined };
    g.save(next);
    if (won) {
      setTimeout(() => { play("win"); setConfetti((n) => n + 1); }, 250);
    } else if (done) {
      setTimeout(() => play("lose"), 250);
    } else {
      setTimeout(() => play("flip"), 200);
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }
    if (done) g.finish(won, guesses.length, points(won, guesses.length));
  };

  const used = new Set(s.guesses.map((gid) => CAREERS.find((c) => c.id === gid)?.name ?? ""));
  const pts = points(s.won, s.guesses.length);
  const shareBody = s.guesses.map((x) => (x === target.id ? "✅" : "🟥")).join("") + (s.won ? "" : "") + `\n🏟️ ${shown}/${steps.length} clubes vistos`;

  return (
    <>
      <Confetti fire={confetti} />
      <GameTop title={kind === "jugador" ? "Trayectoria" : "Trayectoria DT"} mode={g.mode} day={g.day} dateLabel={fmtKey(g.key)} onHelp={() => g.setShowHelp(true)} />

      <div className="tries-bar">
        {Array.from({ length: MAX }, (_, i) => {
          const x = s.guesses[i];
          return <span key={i} className={`try ${!x ? "" : x === target.id ? "t-win" : "t-used"}`} />;
        })}
        <span className="tries-text"><b>{s.guesses.length}</b>/{MAX}</span>
      </div>

      <ol className={`timeline ${shake ? "shake" : ""}`} aria-label="Trayectoria">
        {steps.map((st, i) => {
          const visible = i < shown;
          const cs = clubStyle(st.club);
          return (
            <li key={i} className={`tl-item ${visible ? "on" : "off"}`} style={visible ? ({ "--club": cs.colors[0] === "#FFFFFF" ? cs.colors[1] : cs.colors[0], animationDelay: `${(i % 3) * 80}ms` } as React.CSSProperties) : undefined}>
              <span className="tl-dot" aria-hidden />
              {visible ? (
                <>
                  <Crest club={st.club} size={40} />
                  <div className="tl-text">
                    <span className="tl-club">{st.club}</span>
                    <span className="tl-years">{yearsLabel(st)} {st.loan && <span className="tag">préstamo</span>}</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="tl-lock" aria-hidden>?</span>
                  <div className="tl-text"><span className="tl-club muted">Club oculto</span><span className="tl-years muted">Se revela si fallás</span></div>
                </>
              )}
            </li>
          );
        })}
      </ol>

      {(extraHints > 0 || s.done) && (
        <div className="hint-row">
          <span className="hint-chip">{COUNTRIES[target.nationality]?.flag} {COUNTRIES[target.nationality]?.name ?? target.nationality}</span>
          {kind === "jugador" && target.position && (extraHints > 1 || s.done) && (
            <span className="hint-chip">{POSITIONS[target.position]?.label} · {LINE_LABEL[POSITIONS[target.position]?.line]}</span>
          )}
          {(extraHints > 2 || s.done) && <span className="hint-chip">Iniciales: {target.name.split(" ").map((w) => w[0]).join(". ")}.</span>}
        </div>
      )}

      {s.done && (
        <ResultCard
          won={s.won}
          title={s.won ? (s.guesses.length === 1 ? "¡De primera! 🎯" : "¡Golazo! ⚽") : "Esta vez no 😮‍💨"}
          subtitle={<><b style={{ color: "var(--chalk)", fontSize: 18 }}>{target.name}</b> · {steps.length} {kind === "jugador" ? "clubes" : "equipos"}</>}
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
        <GuessInput items={pool} used={used} placeholder={kind === "jugador" ? "¿De quién es esta carrera?" : "¿Qué DT es?"} onPick={onPick} />
      )}

      {s.guesses.length > 0 && (
        <ul className="wrong-list" aria-label="Intentos">
          {s.guesses.map((x, i) => {
            const c = CAREERS.find((e) => e.id === x);
            return <li key={i} className={x === target.id ? "ok" : ""}>{x === target.id ? "✅" : "✗"} {c?.name}</li>;
          })}
        </ul>
      )}

      <HelpDialog
        open={g.showHelp}
        onClose={() => g.setShowHelp(false)}
        steps={[
          <>Mirá el primer {kind === "jugador" ? "club" : "equipo"} de la carrera.</>,
          <>Escribí quién creés que es. Si fallás, aparece <b>el siguiente club</b>.</>,
          <>Tenés <b>{MAX} intentos</b>. Al final llegan pistas: país e iniciales.</>,
        ]}
      >
        <div className="howto-tray">
          <div className="tl-item on mini"><Crest club="Racing Club" size={30} /><div className="tl-text"><span className="tl-club">Racing Club</span><span className="tl-years">2015–2018</span></div></div>
          <div className="howto-arrow">✗ “Agüero” → aparece:</div>
          <div className="tl-item on mini"><Crest club="Inter" size={30} /><div className="tl-text"><span className="tl-club">Inter</span><span className="tl-years">2018–hoy</span></div></div>
          <div className="howto-arrow">✓ “Lautaro Martínez” 🎯</div>
        </div>
      </HelpDialog>
    </>
  );
}
