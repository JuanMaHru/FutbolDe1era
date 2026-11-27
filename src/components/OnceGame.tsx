"use client";
import { useMemo, useState } from "react";
import { playerGame } from "@/lib/game/games";
import { dayNumber, keyToDate } from "@/lib/game/daily";
import { dailyMeta } from "@/lib/game/daily-games";
import { buildOnce, fitsSlot, FORMATION } from "@/lib/game/once";
import { perfectMatching } from "@/lib/game/conditions";
import { LINE_LABEL } from "@/lib/game/meta";
import type { Player } from "@/lib/game/types";
import { play } from "@/lib/sound";
import { Kit } from "./art/Kit";
import { Confetti } from "./Confetti";
import { GameTop, HelpDialog, ResultCard, fmtKey, useToast } from "./GameParts";
import { GuessInput } from "./GuessInput";
import { useDailyGame } from "./useDailyGame";
import { OnceCard } from "./OnceCard";

const MAX_STRIKES = 3;
interface OState { done: boolean; won: boolean; slots: (string | null)[]; strikes: number; summary?: string }
const players = playerGame.items as Player[];
const reliable = players.filter((p) => !p.check);
const byId = new Map(players.map((p) => [p.id, p]));
const last = (n: string) => n.split(" ").slice(-1)[0];
const lastCount = new Map<string, number>();
for (const p of players) lastCount.set(last(p.name), (lastCount.get(last(p.name)) ?? 0) + 1);
/** Apellido, o inicial + apellido si hay más de uno con ese apellido (Martínez, Álvarez…). */
const surname = (n: string) => ((lastCount.get(last(n)) ?? 0) > 1 ? `${n[0]}. ${last(n)}` : last(n));

export function OnceGame({ day }: { day?: number }) {
  const meta = dailyMeta("once");
  const g = useDailyGame<OState>("once", day, () => ({ done: false, won: false, slots: Array(11).fill(null), strikes: 0 }));
  const [sel, setSel] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ i: number; ok: boolean } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const toast = useToast();

  const date = g.key ? keyToDate(g.key) : new Date();
  const conds = useMemo(() => (g.key ? buildOnce(reliable, 31337 + dayNumber(g.key), date) : []), [g.key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!g.state || !g.key || !conds.length) return <div className="card muted" style={{ marginTop: 24 }}>Armando la cancha…</div>;
  const s = g.state;
  const filled = s.slots.filter(Boolean).length;
  const used = new Set(s.slots.filter(Boolean).map((id) => byId.get(id!)!.name));
  const current = sel ?? s.slots.findIndex((x) => x === null);

  const onPick = (p: Player) => {
    if (s.done || current < 0) return;
    const ok = fitsSlot(p, FORMATION[current].line, conds[current], date);
    const slots = [...s.slots];
    let strikes = s.strikes;
    if (ok) {
      slots[current] = p.id;
      play("hit");
    } else {
      strikes++;
      play(strikes >= MAX_STRIKES ? "lose" : "near");
      toast.show(strikes >= MAX_STRIKES ? "🟥 ¡Roja! Se terminó el partido" : `🟨 ${p.name} no cumple la consigna`);
    }
    setFlash({ i: current, ok });
    setTimeout(() => setFlash(null), 600);
    const nFilled = slots.filter(Boolean).length;
    const won = nFilled === 11;
    const done = won || strikes >= MAX_STRIKES;
    g.save({ slots, strikes, won, done, summary: `${nFilled}/11` });
    setSel(null);
    if (won) setTimeout(() => { play("win"); setConfetti((n) => n + 1); }, 300);
    if (done) g.finish(won, strikes + 1, won ? Math.max(10 - strikes * 2, 5) : Math.floor(nFilled / 2));
  };

  // Ejemplos para las casillas vacías al terminar.
  const examples = s.done
    ? (() => {
        const taken = new Set(s.slots.filter(Boolean) as string[]);
        const free = reliable.filter((p) => !taken.has(p.id));
        const empty = FORMATION.map((_, i) => i).filter((i) => !s.slots[i]);
        const m = perfectMatching(empty.map((i) => free.flatMap((p, j) => (fitsSlot(p, FORMATION[i].line, conds[i], date) ? [j] : []))));
        return new Map(empty.map((i, k) => [i, m ? free[m[k]]?.name : undefined]));
      })()
    : new Map<number, string | undefined>();

  const pts = s.won ? Math.max(10 - s.strikes * 2, 5) : Math.floor(filled / 2);
  const lines = [[10], [6, 7, 8, 9], [3, 4, 5], [0, 1, 2]];
  const shareBody = lines.map((l) => l.map((i) => (s.slots[i] ? "🟩" : "⬛")).join("")).reverse().join("\n") + `\n${"🟨".repeat(Math.min(s.strikes, 2))}${s.strikes >= 3 ? "🟥" : ""}`;

  return (
    <>
      <Confetti fire={confetti} />
      <GameTop title="Armá el 11" mode={g.mode} day={g.day} dateLabel={fmtKey(g.key)} onHelp={() => g.setShowHelp(true)} />
      <div className="once-status">
        <span><b>{filled}</b>/11 en cancha</span>
        <span className="cards" aria-label={`${s.strikes} tarjetas`}>
          {Array.from({ length: MAX_STRIKES }, (_, i) => (
            <span key={i} className={`card-ico ${i < s.strikes ? (i === MAX_STRIKES - 1 ? "red" : "yellow") : ""}`} />
          ))}
        </span>
      </div>

      <div className="pitch" role="group" aria-label="Cancha">
        <svg className="pitch-lines" viewBox="0 0 100 130" preserveAspectRatio="none" aria-hidden>
          <rect x="2" y="2" width="96" height="126" rx="2" />
          <line x1="2" y1="65" x2="98" y2="65" />
          <circle cx="50" cy="65" r="11" />
          <rect x="25" y="2" width="50" height="20" />
          <rect x="25" y="108" width="50" height="20" />
          <rect x="38" y="2" width="24" height="8" />
          <rect x="38" y="120" width="24" height="8" />
        </svg>
        {FORMATION.map((slot, i) => {
          const pid = s.slots[i];
          const p = pid ? byId.get(pid) : null;
          const isSel = !s.done && i === current;
          return (
            <button
              key={i}
              className={`slot ${p ? "filled" : ""} ${isSel ? "sel" : ""} ${flash?.i === i ? (flash.ok ? "flash-ok" : "flash-bad") : ""}`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              onClick={() => { if (!s.done && !p) { play("click"); setSel(i); } }}
              disabled={s.done || !!p}
              aria-label={`${LINE_LABEL[slot.line]}: ${conds[i].label}${p ? `, ${p.name}` : ""}`}
            >
              {p ? (
                <>
                  <Kit club={p.club} label={p.number} size={46} />
                  <span className="slot-name">{surname(p.name)}</span>
                </>
              ) : (
                <>
                  <span className="slot-badge"><span aria-hidden>{conds[i].icon}</span></span>
                  <span className="slot-cond">{conds[i].label}</span>
                  {s.done && examples.get(i) && <span className="slot-ex">ej: {surname(examples.get(i)!)}</span>}
                </>
              )}
            </button>
          );
        })}
      </div>

      {!s.done && current >= 0 && (
        <div className="once-ask card">
          <div className="once-ask-text">
            <span className="tag tag-accent">{LINE_LABEL[FORMATION[current].line]}</span>
            <b>{conds[current].icon} {conds[current].label}</b>
          </div>
          <GuessInput items={players} used={used} placeholder={`Un ${LINE_LABEL[FORMATION[current].line].toLowerCase()} que cumpla…`} onPick={onPick} />
        </div>
      )}

      {s.done && (
        <ResultCard
          won={s.won}
          title={s.won ? "¡Once completo! 🏆" : "Expulsado 🟥"}
          subtitle={s.won ? `Con ${s.strikes} tarjeta${s.strikes === 1 ? "" : "s"}` : `Llegaste a ${filled}/11. En las casillas vacías te dejamos un ejemplo.`}
          mode={g.mode}
          pts={pts}
          repGain={g.repGain}
          streak={g.stats?.streak}
          shareTitle={`${meta.title} ${filled}/11`}
          shareBody={shareBody}
          path={meta.path}
          day={g.day}
        >
          {filled >= 6 && <OnceCard names={s.slots.map((id) => (id ? surname(byId.get(id)!.name) : null))} day={g.day} />}
        </ResultCard>
      )}

      <HelpDialog
        open={g.showHelp}
        onClose={() => g.setShowHelp(false)}
        steps={[
          <>Tocá una posición de la cancha: cada una tiene una <b>consigna</b>.</>,
          <>Escribí un jugador de <b>esa línea</b> que la cumpla (ej.: un delantero que “Juega en la Premier”).</>,
          <>No se repiten jugadores. Con <b>3 errores</b> te sacan la roja.</>,
        ]}
      >
        <div className="howto-once">
          <div className="slot demo"><span className="slot-badge">🇺🇾</span><span className="slot-cond">Uruguayo</span></div>
          <span className="howto-arrow">+ Delantero →</span>
          <div className="slot demo filled"><Kit club="Boca Juniors" label={10} size={40} /><span className="slot-name">Cavani</span></div>
        </div>
      </HelpDialog>
      {toast.node}
    </>
  );
}
