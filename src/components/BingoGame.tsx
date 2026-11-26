"use client";
import { useMemo, useState } from "react";
import { playerGame } from "@/lib/game/games";
import { dayNumber, keyToDate } from "@/lib/game/daily";
import { dailyMeta } from "@/lib/game/daily-games";
import { buildBingo, BINGO_DECK, BINGO_SIZE } from "@/lib/game/bingo";
import type { Player } from "@/lib/game/types";
import { play } from "@/lib/sound";
import { Kit } from "./art/Kit";
import { Confetti } from "./Confetti";
import { GameTop, HelpDialog, ResultCard, fmtKey, useToast } from "./GameParts";
import { useDailyGame } from "./useDailyGame";

const MAX_STRIKES = 3;
interface BState { done: boolean; won: boolean; placed: (string | null)[]; idx: number; strikes: number; summary?: string }
const players = playerGame.items as Player[];
const byId = new Map(players.map((p) => [p.id, p]));
const LINES = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
  [0, 5, 10, 15], [3, 6, 9, 12],
];

export function BingoGame({ day }: { day?: number }) {
  const meta = dailyMeta("bingo");
  const g = useDailyGame<BState>("bingo", day, () => ({ done: false, won: false, placed: Array(BINGO_SIZE).fill(null), idx: 0, strikes: 0 }));
  const [flash, setFlash] = useState<{ i: number; ok: boolean } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const toast = useToast();
  const date = g.key ? keyToDate(g.key) : new Date();
  const board = useMemo(() => (g.key ? buildBingo(players, 777 + dayNumber(g.key) * 13, date) : null), [g.key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!g.state || !board) return <div className="card muted" style={{ marginTop: 24 }}>Mezclando el bolillero…</div>;
  const s = g.state;
  const filled = s.placed.filter(Boolean).length;
  const current = s.idx < board.deck.length ? byId.get(board.deck[s.idx])! : null;
  const linesDone = LINES.filter((l) => l.every((i) => s.placed[i])).length;

  const advance = (placed: (string | null)[], strikes: number) => {
    const idx = s.idx + 1;
    const nFilled = placed.filter(Boolean).length;
    const won = nFilled === BINGO_SIZE;
    const done = won || strikes >= MAX_STRIKES || idx >= board.deck.length;
    g.save({ placed, strikes, idx, won, done, summary: `${nFilled}/${BINGO_SIZE}` });
    if (won) setTimeout(() => { play("win"); setConfetti((n) => n + 1); }, 250);
    else if (done) setTimeout(() => play("lose"), 250);
    if (done) g.finish(won, strikes + 1, won ? Math.max(10 - strikes * 2, 5) : Math.floor((nFilled / BINGO_SIZE) * 6));
  };

  const place = (i: number) => {
    if (s.done || !current || s.placed[i]) return;
    const ok = board.cells[i].test(current, date);
    setFlash({ i, ok });
    setTimeout(() => setFlash(null), 600);
    if (ok) {
      const placed = [...s.placed];
      placed[i] = current.id;
      const before = LINES.filter((l) => l.every((k) => s.placed[k])).length;
      const after = LINES.filter((l) => l.every((k) => placed[k])).length;
      play(after > before ? "win" : "hit");
      if (after > before) toast.show("¡Línea! 🎉");
      advance(placed, s.strikes);
    } else {
      const strikes = s.strikes + 1;
      play("near");
      toast.show(strikes >= MAX_STRIKES ? "🟥 Tercer error: se terminó" : `✗ ${current.name} no es “${board.cells[i].label}”`);
      advance(s.placed, strikes);
    }
  };

  const skip = () => {
    if (s.done || !current) return;
    play("flip");
    advance(s.placed, s.strikes);
  };

  const pts = s.won ? Math.max(10 - s.strikes * 2, 5) : Math.floor((filled / BINGO_SIZE) * 6);
  const shareBody = [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => (s.placed[r * 4 + c] ? "🟩" : "⬛")).join("")).join("\n");

  return (
    <>
      <Confetti fire={confetti} />
      <GameTop title="Bingo Futbolero" mode={g.mode} day={g.day} dateLabel={fmtKey(g.key)} onHelp={() => g.setShowHelp(true)} />

      <div className="once-status">
        <span><b>{filled}</b>/{BINGO_SIZE} · {linesDone} línea{linesDone === 1 ? "" : "s"}</span>
        <span className="muted small">Bolilla {Math.min(s.idx + 1, BINGO_DECK)}/{BINGO_DECK}</span>
        <span className="cards">
          {Array.from({ length: MAX_STRIKES }, (_, i) => <span key={i} className={`card-ico ${i < s.strikes ? (i === MAX_STRIKES - 1 ? "red" : "yellow") : ""}`} />)}
        </span>
      </div>

      {!s.done && current && (
        <div className="bingo-ball" key={current.id}>
          <Kit club="" label="?" size={48} hidden />
          <div>
            <span className="muted small">Salió…</span>
            <div className="bingo-name">{current.name}</div>
          </div>
          <button className="btn btn-ghost" onClick={skip}>Pasar ⏭</button>
        </div>
      )}

      <div className="bingo-board" role="grid" aria-label="Cartón">
        {board.cells.map((c, i) => {
          const pid = s.placed[i];
          const p = pid ? byId.get(pid) : null;
          return (
            <button
              key={c.id}
              className={`bingo-cell ${p ? "on" : ""} ${flash?.i === i ? (flash.ok ? "flash-ok" : "flash-bad") : ""}`}
              onClick={() => place(i)}
              disabled={s.done || !!p}
            >
              <span className="b-ico" aria-hidden>{c.icon}</span>
              <span className="b-label">{c.label}</span>
              {p && <span className="b-who">{p.name.split(" ").slice(-1)[0]}</span>}
            </button>
          );
        })}
      </div>

      {s.done && (
        <ResultCard
          won={s.won}
          title={s.won ? "¡BINGO! 🎉" : filled >= 12 ? "¡Casi! 😮‍💨" : "Se terminó la bolilla"}
          subtitle={`${filled}/${BINGO_SIZE} casillas · ${linesDone} línea${linesDone === 1 ? "" : "s"} · ${s.strikes} error${s.strikes === 1 ? "" : "es"}`}
          mode={g.mode}
          pts={pts}
          repGain={g.repGain}
          streak={g.stats?.streak}
          shareTitle={`${meta.title} ${filled}/${BINGO_SIZE}`}
          shareBody={shareBody}
          path={meta.path}
          day={g.day}
        />
      )}

      <HelpDialog
        open={g.showHelp}
        onClose={() => g.setShowHelp(false)}
        steps={[
          <>Sale un jugador por vez (son {BINGO_DECK}).</>,
          <>Tocá la casilla del cartón que <b>cumple</b>: país, liga, club, edad, dorsal o puesto.</>,
          <>Si ninguna te sirve, tocá <b>Pasar</b>. Con <b>3 errores</b> se termina. ¡Llená las {BINGO_SIZE}!</>,
        ]}
      >
        <div className="howto-once">
          <div className="bingo-name small-name">Lionel Messi</div>
          <span className="howto-arrow">→</span>
          <div className="bingo-cell on demo"><span className="b-ico">🌮</span><span className="b-label">Juega en MLS o México</span><span className="b-who">Messi</span></div>
        </div>
      </HelpDialog>
      {toast.node}
    </>
  );
}
