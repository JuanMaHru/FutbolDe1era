"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BRAND, GAMES } from "@/lib/game/games";
import { dateKey, dayNumber, keyToDate, pickDaily, randomPick } from "@/lib/game/daily";
import { points, shareText } from "@/lib/game/scoring";
import type { Cell, Entity, GameId } from "@/lib/game/types";
import { loadDaily, loadStats, recordFinish, saveDaily, type GameStats } from "@/lib/progress";
import { notifyProfileChange } from "@/lib/storage";
import { shareUrl } from "@/lib/site";
import { Countdown } from "./Countdown";
import { GuessInput } from "./GuessInput";

type Mode = "daily" | "practice";

export function GuessGame({ gameId }: { gameId: GameId }) {
  const game = GAMES[gameId];
  const other = gameId === "jugador" ? GAMES.dt : GAMES.jugador;

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("daily");
  const [key, setKey] = useState("");
  const [target, setTarget] = useState<Entity | null>(null);
  const [guessIds, setGuessIds] = useState<string[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [repGain, setRepGain] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const byId = useMemo(() => new Map<string, Entity>(game.items.map((i: Entity) => [i.id, i])), [game]);

  const startDaily = useCallback(() => {
    const k = dateKey();
    const saved = loadDaily(gameId, k);
    setKey(k);
    setMode("daily");
    setTarget(pickDaily(game.items, game.seed, k));
    setGuessIds(saved.guesses);
    setStats(loadStats(gameId, game.maxGuesses));
    setRepGain(null);
  }, [game, gameId]);

  useEffect(() => {
    startDaily();
    setReady(true);
  }, [startDaily]);

  const startPractice = () => {
    setMode("practice");
    setTarget(randomPick(game.items, target ?? undefined));
    setGuessIds([]);
    setRepGain(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const today = key ? keyToDate(key) : new Date();
  const rows: { item: Entity; cells: Cell[] }[] = useMemo(
    () =>
      target
        ? guessIds.flatMap((id) => {
            const item = byId.get(id);
            if (!item) return [];
            return [{ item, cells: game.attributes.map((a: { compare: (g: Entity, t: Entity, d: Date) => Cell }) => a.compare(item, target, today)) }];
          })
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [guessIds, target, byId, game, key],
  );

  const won = !!target && guessIds.includes(target.id);
  const done = won || guessIds.length >= game.maxGuesses;
  const used = useMemo(() => new Set(rows.map((r) => r.item.name)), [rows]);

  const onPick = (item: Entity) => {
    if (done || !target) return;
    const next = [...guessIds, item.id];
    setGuessIds(next);
    if (mode !== "daily") return;
    const isWin = item.id === target.id;
    const finished = isWin || next.length >= game.maxGuesses;
    saveDaily(gameId, key, { guesses: next, done: finished, won: isWin });
    if (finished) {
      const res = recordFinish(gameId, key, isWin, next.length, game.maxGuesses, points(isWin, next.length));
      setStats(res.stats);
      setRepGain(res.repGain);
      notifyProfileChange();
    }
  };

  const share = async () => {
    const text = shareText({
      brand: BRAND,
      title: game.title,
      day: dayNumber(key),
      rows: rows.map((r) => r.cells),
      won,
      maxGuesses: game.maxGuesses,
      url: shareUrl(`/${gameId}`),
    });
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return; // el usuario cerró el menú
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      flash("¡Copiado! Pegalo en el grupo 📋");
    } catch {
      flash("Mantené apretado el texto de arriba para copiarlo");
    }
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  if (!ready || !target) {
    return <div className="card muted" style={{ marginTop: 24 }}>Cargando el reto…</div>;
  }

  const pts = points(won, guessIds.length);
  const shareGrid = rows.map((r) => r.cells.map((c) => (c.status === "hit" ? "🟩" : c.status === "near" ? "🟨" : "⬛")).join("")).join("\n");

  return (
    <>
      <div className="game-head">
        <div>
          <div className="row" style={{ gap: 8, marginBottom: 6 }}>
            {mode === "daily" ? <span className="tag tag-accent">Reto #{dayNumber(key)}</span> : <span className="tag">Práctica · no suma</span>}
          </div>
          <h1>Adiviná el {game.noun}</h1>
        </div>
        <div className="tries">
          <b>{guessIds.length}</b>/{game.maxGuesses}
        </div>
      </div>

      {done && (
        <section className={`card result ${won ? "" : "lost"}`} aria-live="polite">
          <p className="result-title">{won ? (guessIds.length === 1 ? "¡De primera! 🎯" : "¡Golazo! ⚽") : "Esta vez no 😮‍💨"}</p>
          <p className="result-answer">{target.name}</p>
          <p className="muted small" style={{ margin: 0 }}>{game.subtitle(target)}</p>

          {mode === "daily" ? (
            <>
              <div className="reward">
                <div><b>{pts}</b><small>puntos de liga</small></div>
                <div><b>+{repGain ?? pts}</b><small>reputación</small></div>
                <div><b>{stats?.streak ?? 0}🔥</b><small>racha</small></div>
              </div>
              <div className="share-preview" style={{ userSelect: "all" }} aria-label="Vista previa para compartir">{`⚽ ${BRAND} #${dayNumber(key)} · ${game.title} ${won ? guessIds.length : "X"}/${game.maxGuesses}\n${shareGrid}`}</div>
              <div className="row">
                <button className="btn btn-primary" onClick={share}>Compartir resultado</button>
                <Link className="btn" href={`/${other.id}`}>Jugar {other.title} →</Link>
              </div>
              {stats && stats.won > 0 && <Distribution stats={stats} current={won ? guessIds.length : 0} />}
              <p className="muted small" style={{ marginBottom: 0 }}>
                Próximo reto en <Countdown /> · <button className="btn-link" onClick={startPractice} style={linkBtn}>Jugar en modo práctica</button>
              </p>
            </>
          ) : (
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={startPractice}>Otro más</button>
              <button className="btn" onClick={startDaily}>Volver al reto del día</button>
            </div>
          )}
        </section>
      )}

      {!done && (
        <GuessInput items={game.items} used={used} placeholder={`Escribí un ${game.noun}…`} onPick={onPick} />
      )}

      <div className="grid-wrap">
        {rows.length > 0 && (
          <div className="grid-labels" aria-hidden>
            {game.attributes.map((a: { key: string; label: string }) => <div key={a.key}>{a.label}</div>)}
          </div>
        )}
        {[...rows].reverse().map((r) => (
          <div className="guess" key={r.item.id}>
            <p className="guess-name">
              {r.item.name} {target.id === r.item.id && <span className="tag tag-hit">¡Es!</span>}
            </p>
            <div className="guess-cells">
              {r.cells.map((c, i) => (
                <div key={i} className={`cell ${c.status}`} style={{ animationDelay: `${i * 70}ms` }} aria-label={`${game.attributes[i].label}: ${c.display}, ${statusLabel(c)}`}>
                  <span>{c.display}</span>
                  {c.arrow && <span className="arrow">{c.arrow === "up" ? "▲" : "▼"}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="legend">
          <span style={{ "--c": "var(--hit)" } as React.CSSProperties}>Coincide</span>
          <span style={{ "--c": "var(--near)" } as React.CSSProperties}>Cerca</span>
          <span style={{ "--c": "var(--miss)" } as React.CSSProperties}>Nada que ver</span>
          <span>▲▼ más / menos</span>
        </div>
      )}

      <details className="help" open={rows.length === 0 && mode === "daily"}>
        <summary>¿Cómo se juega?</summary>
        <ul>
          <li>Tenés {game.maxGuesses} intentos para adivinar el {game.noun} del día. Es el mismo para todos y cambia a medianoche (hora argentina).</li>
          {gameId === "jugador" ? (
            <>
              <li><b>Club</b> amarillo: juega en la misma liga. <b>Liga</b> amarilla: mismo continente.</li>
              <li><b>País</b> amarillo: misma confederación. <b>Posición</b> amarilla: misma línea (defensa, medio, ataque).</li>
              <li><b>Edad</b> amarilla: ±2 años. <b>Dorsal</b> amarillo: ±3. Las flechas indican si el objetivo es mayor o menor.</li>
            </>
          ) : (
            <>
              <li><b>Equipo</b> amarillo: dirige en la misma liga (o también es DT de una selección).</li>
              <li><b>País</b> amarillo: misma confederación. <b>Esquema</b> amarillo: misma cantidad de defensores.</li>
              <li><b>Edad</b> amarilla: ±3 años. <b>Debut DT</b> amarillo: ±3 años.</li>
            </>
          )}
          <li>Acertar suma puntos para tu liga y <b>reputación</b> para el Modo Carrera.</li>
        </ul>
      </details>

      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}

const linkBtn: React.CSSProperties = { background: "none", border: 0, padding: 0, color: "var(--accent)", cursor: "pointer", textDecoration: "underline", font: "inherit" };

function statusLabel(c: Cell) {
  const base = c.status === "hit" ? "coincide" : c.status === "near" ? "cerca" : "no coincide";
  return c.arrow ? `${base}, el objetivo es ${c.arrow === "up" ? "mayor" : "menor"}` : base;
}

function Distribution({ stats, current }: { stats: GameStats; current: number }) {
  const max = Math.max(...stats.dist, 1);
  return (
    <div style={{ marginTop: 14 }}>
      <div className="row small muted" style={{ gap: 16 }}>
        <span><b style={{ color: "var(--chalk)" }}>{stats.played}</b> jugados</span>
        <span><b style={{ color: "var(--chalk)" }}>{Math.round((stats.won / Math.max(stats.played, 1)) * 100)}%</b> ganados</span>
        <span><b style={{ color: "var(--chalk)" }}>{stats.maxStreak}</b> mejor racha</span>
      </div>
      <div className="dist">
        {stats.dist.map((n, i) => (
          <div className="dist-row" key={i}>
            <span>{i + 1}</span>
            <div className={`dist-bar ${current === i + 1 ? "current" : ""}`} style={{ width: `${Math.max((n / max) * 100, 8)}%` }}>{n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
