"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BRAND, GAMES, type GuessGameId } from "@/lib/game/games";
import { dateKey, dayNumber, dayToKey, keyToDate, pickDaily, randomPick } from "@/lib/game/daily";
import { EMOJI, points, shareText } from "@/lib/game/scoring";
import type { Attribute, Cell, Entity } from "@/lib/game/types";
import { loadDaily, loadStats, recordArchive, recordFinish, saveDaily, type GameStats } from "@/lib/progress";
import { notifyProfileChange, read, write } from "@/lib/storage";
import { shareUrl } from "@/lib/site";
import { t } from "@/lib/i18n";
import { play } from "@/lib/sound";
import { CellContent } from "./CellContent";
import { Confetti } from "./Confetti";
import { Countdown } from "./Countdown";
import { GuessInput } from "./GuessInput";
import { HowTo } from "./HowTo";
import { IconHelp } from "./Icons";
import { MysteryCard } from "./MysteryCard";
import { DonateButton } from "./Donate";
import { Hints } from "./Hints";
import { BioCard } from "./BioCard";
import { hintsFor } from "@/lib/game/bios";

type Mode = "daily" | "archive" | "practice";
type Item = Entity & Record<string, unknown>;

export function GuessGame({ gameId, day }: { gameId: GuessGameId; day?: number }) {
  const game = GAMES[gameId];
  const attrs = game.attributes as Attribute<Entity>[];
  const other = gameId === "jugador" ? GAMES.dt : GAMES.jugador;

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("daily");
  const [key, setKey] = useState("");
  const [target, setTarget] = useState<Item | null>(null);
  const [guessIds, setGuessIds] = useState<string[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [repGain, setRepGain] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [shake, setShake] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null); // id del último intento (para animarlo)
  const timers = useRef<number[]>([]);

  const byId = useMemo(() => new Map<string, Item>(game.items.map((i: Item) => [i.id, i])), [game]);

  const load = useCallback(() => {
    const today = dateKey();
    const todayN = dayNumber(today);
    const isArchive = day !== undefined && day >= 1 && day < todayN;
    const k = isArchive ? dayToKey(day!) : today;
    setKey(k);
    setMode(isArchive ? "archive" : "daily");
    setTarget(pickDaily(game.targets, game.seed, k));
    setGuessIds(loadDaily(gameId, k).guesses);
    setStats(loadStats(gameId, game.maxGuesses));
    setRepGain(null);
    setFresh(null);
  }, [game, gameId, day]);

  useEffect(() => {
    load();
    setReady(true);
    if (!read<boolean>(`seenHelp:${gameId}`, false)) {
      setHelp(true);
      write(`seenHelp:${gameId}`, true);
    }
    return () => timers.current.forEach(clearTimeout);
  }, [load, gameId]);

  const startPractice = () => {
    setMode("practice");
    setTarget(randomPick(game.targets, target ?? undefined));
    setGuessIds([]);
    setRepGain(null);
    setFresh(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const today = key ? keyToDate(key) : new Date();
  const rows = useMemo(
    () =>
      target
        ? guessIds.flatMap((id) => {
            const item = byId.get(id);
            return item ? [{ item, cells: attrs.map((a) => a.compare(item, target, today)) }] : [];
          })
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [guessIds, target, byId, key],
  );

  const won = !!target && guessIds.includes(target.id);
  const done = won || guessIds.length >= game.maxGuesses;
  const used = useMemo(() => new Set(rows.map((r) => r.item.name)), [rows]);

  /** Sonidos escalonados al dar vuelta las casillas, y el desenlace. */
  const animateReveal = (cells: Cell[], isWin: boolean, finished: boolean) => {
    play("kick");
    cells.forEach((c, i) => {
      timers.current.push(window.setTimeout(() => play(c.status === "hit" ? "hit" : c.status === "near" ? "near" : "flip"), 180 + i * 90));
    });
    const end = 180 + cells.length * 90 + 120;
    timers.current.push(
      window.setTimeout(() => {
        if (isWin) {
          play("win");
          setConfetti((n) => n + 1);
        } else if (finished) {
          play("lose");
        } else {
          setShake(true);
          timers.current.push(window.setTimeout(() => setShake(false), 450));
        }
      }, end),
    );
  };

  const onPick = (item: Item) => {
    if (done || !target) return;
    const next = [...guessIds, item.id];
    const isWin = item.id === target.id;
    const finished = isWin || next.length >= game.maxGuesses;
    setGuessIds(next);
    setFresh(item.id);
    animateReveal(attrs.map((a) => a.compare(item, target, today)), isWin, finished);
    if (mode === "practice") return;
    saveDaily(gameId, key, { guesses: next, done: finished, won: isWin });
    if (!finished) return;
    const pts = points(isWin, next.length);
    if (mode === "daily") {
      const res = recordFinish(gameId, key, isWin, next.length, game.maxGuesses, pts);
      setStats(res.stats);
      setRepGain(res.repGain);
    } else {
      setRepGain(recordArchive(gameId, key, pts).repGain);
    }
    notifyProfileChange();
  };

  const flash = (msg: string) => {
    setToast(msg);
    timers.current.push(window.setTimeout(() => setToast(""), 2200));
  };

  const share = async () => {
    play("click");
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
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      flash(t("result.copied"));
    } catch {
      flash(t("result.copyFail"));
    }
  };

  if (!ready || !target) return <div className="card muted" style={{ marginTop: 24 }}>Cargando el reto…</div>;

  const pts = points(won, guessIds.length);
  const n = dayNumber(key);
  const shareGrid = rows.map((r) => r.cells.map((c) => EMOJI[c.status]).join("")).join("\n");

  return (
    <>
      <Confetti fire={confetti} />
      <div className="game-head">
        <div style={{ minWidth: 0 }}>
          <div className="row" style={{ gap: 8, marginBottom: 6 }}>
            {mode === "daily" && <span className="tag tag-accent">Reto #{n} · Hoy</span>}
            {mode === "archive" && <span className="tag">{t("game.archiveTag")} · #{n} · {fmt(key)}</span>}
            {mode === "practice" && <span className="tag">{t("game.practiceTag")}</span>}
          </div>
          <h1>{t("game.guessThe")} {game.title}</h1>
        </div>
        <div className="head-actions">
          <button className="icon-btn big" onClick={() => { play("click"); setHelp(true); }} aria-label={t("game.howto")} title={t("game.howto")}>
            <IconHelp />
          </button>
        </div>
      </div>

      <div className="tries-bar" aria-label={`${guessIds.length} de ${game.maxGuesses} intentos`}>
        {Array.from({ length: game.maxGuesses }, (_, i) => {
          const r = rows[i];
          const cls = !r ? "" : r.item.id === target.id ? "t-win" : "t-used";
          return <span key={i} className={`try ${cls}`} />;
        })}
        <span className="tries-text"><b>{guessIds.length}</b>/{game.maxGuesses}</span>
      </div>

      <MysteryCard gameId={gameId} rows={rows} attributes={attrs} revealed={done ? target : undefined} />

      <Hints hints={hintsFor(gameId, target as never)} misses={guessIds.filter((x) => x !== target.id).length} done={done} />

      {done && (
        <section className={`card result ${won ? "" : "lost"}`} aria-live="polite">
          <p className="result-title">{won ? (guessIds.length === 1 ? `${t("result.first")} 🎯` : `${t("result.win")} ⚽`) : `${t("result.lose")} 😮‍💨`}</p>
          <BioCard id={target.id} name={target.name} subtitle={game.subtitle(target)} />

          {mode !== "practice" ? (
            <>
              <div className="reward">
                {mode === "daily" && <div><b>{pts}</b><small>{t("result.points")}</small></div>}
                <div><b>+{repGain ?? (mode === "daily" ? pts : Math.floor(pts / 2))}</b><small>{t("result.rep")}</small></div>
                {mode === "daily" && <div><b>{stats?.streak ?? 0}🔥</b><small>{t("result.streak")}</small></div>}
              </div>
              {mode === "archive" && <p className="notice">{t("result.archiveNote")}</p>}
              <div className="share-preview" style={{ userSelect: "all" }}>{`⚽ ${BRAND} #${n} · ${game.title} ${won ? guessIds.length : "X"}/${game.maxGuesses}\n${shareGrid}`}</div>
              <div className="row">
                <button className="btn btn-primary" onClick={share}>{t("result.share")}</button>
                {mode === "daily" ? (
                  <Link className="btn" href={`/${other.id}`}>Jugar {other.title} →</Link>
                ) : (
                  <Link className="btn" href="/archivo">← {t("nav.archive")}</Link>
                )}
              </div>
              <DonateButton variant="link" />
              {mode === "daily" && stats && stats.won > 0 && <Distribution stats={stats} current={won ? guessIds.length : 0} />}
              <p className="muted small" style={{ marginBottom: 0 }}>
                {mode === "daily" && <>{t("result.next")} <Countdown /> · </>}
                <button onClick={startPractice} className="link-btn">{t("result.practice")}</button>
              </p>
            </>
          ) : (
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={startPractice}>{t("result.another")}</button>
              <button className="btn" onClick={load}>{t("result.back")}</button>
            </div>
          )}
        </section>
      )}

      {!done && <GuessInput items={game.items} used={used} placeholder={`${t("game.placeholder")} ${game.noun}…`} onPick={onPick} />}

      <div className={`grid-wrap ${shake ? "shake" : ""}`}>
        {rows.length > 0 && (
          <div className="grid-labels" aria-hidden>
            {attrs.map((a) => <div key={a.key}>{a.label}</div>)}
          </div>
        )}
        {[...rows].reverse().map((r) => (
          <div className={`guess ${fresh === r.item.id ? "fresh" : ""}`} key={r.item.id}>
            <p className="guess-name">
              {r.item.name} {target.id === r.item.id && <span className="tag tag-hit">¡Es!</span>}
            </p>
            <div className="guess-cells">
              {r.cells.map((c, i) => (
                <div
                  key={i}
                  className={`cell ${c.status}`}
                  style={{ animationDelay: fresh === r.item.id ? `${180 + i * 90}ms` : "0ms" }}
                  aria-label={`${attrs[i].label}: ${c.display}, ${statusLabel(c)}`}
                >
                  <CellContent attr={attrs[i].key} cell={c} item={r.item} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 && !done && (
        <button className="howto-teaser" onClick={() => setHelp(true)}>
          <span className="sw hit" /><span className="sw near" /><span className="sw miss" />
          <span>Verde igual · Amarillo cerca · <u>Ver ejemplo</u></span>
        </button>
      )}

      <HowTo game={game} open={help} onClose={() => setHelp(false)} today={key} />
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}

function fmt(key: string) {
  const [, m, d] = key.split("-");
  return `${Number(d)}/${Number(m)}`;
}

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
        {stats.dist.map((v, i) => (
          <div className="dist-row" key={i}>
            <span>{i + 1}</span>
            <div className={`dist-bar ${current === i + 1 ? "current" : ""}`} style={{ width: `${Math.max((v / max) * 100, 8)}%` }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
