"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GAMES, GAME_IDS } from "@/lib/game/games";
import { dateKey, dayNumber } from "@/lib/game/daily";
import { loadDaily, loadStats, type DailyState } from "@/lib/progress";
import type { GameId } from "@/lib/game/types";
import { t, type TKey } from "@/lib/i18n";
import { play } from "@/lib/sound";
import { Countdown } from "./Countdown";
import { Kit } from "./art/Kit";
import { ModeArt, type ModeId } from "./art/ModeArt";
import { useProfile } from "./useProfile";

interface Mode {
  id: ModeId;
  href?: string;
  badge?: "daily" | "new" | "soon";
  desc: string;
}

const MODES: Mode[] = [
  { id: "jugador", href: "/jugador", badge: "daily", desc: "Club, liga, país, posición, edad y dorsal" },
  { id: "dt", href: "/dt", badge: "daily", desc: "Equipo, liga, país, edad, esquema y debut" },
  { id: "ligas", href: "/ligas", desc: "Tabla semanal con tu grupo" },
  { id: "archivo", href: "/archivo", badge: "new", desc: "Jugá los días que te perdiste" },
  { id: "carrera", badge: "soon", desc: "Creá tu jugador y llegá a la Selección" },
  { id: "once", badge: "soon", desc: "Completá el 11 con consignas" },
  { id: "wordle", badge: "soon", desc: "Adiviná el apellido letra por letra" },
  { id: "bingo", badge: "soon", desc: "Cantá bingo con jugadores" },
];

type Status = "new" | "playing" | "won" | "lost";
const statusOf = (d: DailyState): Status => (d.done ? (d.won ? "won" : "lost") : d.guesses.length ? "playing" : "new");

export function HomeCards() {
  const [state, setState] = useState<Record<string, { daily: DailyState; streak: number }> | null>(null);
  const [key, setKey] = useState("");
  const profile = useProfile();

  useEffect(() => {
    const k = dateKey();
    setKey(k);
    setState(Object.fromEntries(GAME_IDS.map((g) => [g, { daily: loadDaily(g, k), streak: loadStats(g, GAMES[g].maxGuesses).streak }])));
  }, []);

  return (
    <>
      <section className="board" aria-label={t("home.today")}>
        <div className="board-head">
          <span className="board-title">{t("home.today")} {key && <span className="board-num">#{dayNumber(key)}</span>}</span>
          <span className="board-clock">{t("home.changesIn")} <Countdown /></span>
        </div>
        {GAME_IDS.map((g: GameId) => {
          const s = state?.[g];
          const st = s ? statusOf(s.daily) : null;
          return (
            <Link key={g} href={`/${g}`} className="board-row" onClick={() => play("click")}>
              <Kit club="" label={g === "dt" ? "DT" : "?"} size={40} hidden />
              <span className="board-name">{GAMES[g].title}</span>
              <span className={`chip chip-${st ?? "new"}`}>
                {st ? t(`status.${st}` as TKey) : "…"}
                {st === "won" && ` · ${s!.daily.guesses.length}/${GAMES[g].maxGuesses}`}
              </span>
              {s && s.streak > 0 && <span className="board-streak" title="Racha">🔥{s.streak}</span>}
              <span className="board-go" aria-hidden>▶</span>
            </Link>
          );
        })}
      </section>

      <h2 className="section-title">{t("home.pick")}</h2>
      <div className="modes">
        {MODES.map((m, i) => {
          const inner = (
            <>
              {m.badge && <span className={`mode-badge b-${m.badge}`}>{t(`badge.${m.badge}` as TKey)}</span>}
              <div className="mode-art"><ModeArt mode={m.id} /></div>
              <div className="mode-foot">
                <span className="mode-cta">{m.href ? "Jugar" : t("badge.soon")}</span>
                <span className="mode-name">{t(`mode.${m.id}` as TKey)}</span>
                <span className="mode-desc">{m.id === "carrera" && profile ? `Ya tenés ⭐ ${profile.reputation} de reputación` : m.desc}</span>
              </div>
            </>
          );
          return m.href ? (
            <Link key={m.id} href={m.href} className="mode" style={{ animationDelay: `${i * 50}ms` }} onClick={() => play("click")}>
              {inner}
            </Link>
          ) : (
            <div key={m.id} className="mode mode-soon" style={{ animationDelay: `${i * 50}ms` }} aria-disabled>
              {inner}
            </div>
          );
        })}
      </div>
    </>
  );
}
