"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DAILY } from "@/lib/game/daily-games";
import { dateKey, dayNumber } from "@/lib/game/daily";
import { loadState, loadStats, type BaseState } from "@/lib/progress";
import { t, type TKey } from "@/lib/i18n";
import { play } from "@/lib/sound";
import { Countdown } from "./Countdown";
import { ModeArt, type ModeId } from "./art/ModeArt";
import { useProfile } from "./useProfile";
import { DonateButton } from "./Donate";
import { Efemerides } from "./Efemerides";

interface Mode {
  id: ModeId;
  href?: string;
  badge?: "daily" | "new" | "soon";
  desc: string;
}

const MODES: Mode[] = [
  { id: "jugador", href: "/jugador", badge: "daily", desc: "Club, liga, país, posición, edad y dorsal" },
  { id: "dt", href: "/dt", badge: "daily", desc: "Equipo, liga, país, edad y cómo jugaba" },
  { id: "tray", href: "/trayectoria", badge: "new", desc: "Cada error revela un club de su carrera" },
  { id: "traydt", href: "/trayectoria/dt", badge: "new", desc: "Los equipos que dirigió, de a uno" },
  { id: "once", href: "/once", badge: "new", desc: "Completá el 11 con consignas" },
  { id: "wordle", href: "/palabra", badge: "new", desc: "Adiviná el apellido letra por letra" },
  { id: "bingo", href: "/bingo", badge: "new", desc: "Ubicá a cada jugador en su casilla" },
  { id: "intruso", href: "/intruso", badge: "new", desc: "Tres comparten algo. ¿Quién no encaja?" },
  { id: "club", href: "/club", badge: "new", desc: "Colores, estadio, fundación… ¿qué club es?" },
  { id: "anios", href: "/en-que-anio", badge: "new", desc: "Momentos históricos: ¿en qué año fue?" },
  { id: "conexion", href: "/conexion", badge: "new", desc: "Uní dos jugadores con compañeros de equipo" },
  { id: "masomenos", href: "/mas-o-menos", badge: "new", desc: "¿Vale más o menos? Valores, goles, estadios…" },
  { id: "carrera", href: "/carrera", badge: "new", desc: "Creá tu jugador y llegá a la Selección" },
  { id: "ligas", href: "/ligas", desc: "Tabla semanal con tu grupo" },
  { id: "archivo", href: "/archivo", desc: "Jugá los días que te perdiste" },
];

type Status = "new" | "playing" | "won" | "lost";
const statusOf = (d: BaseState): Status =>
  d.done ? (d.won ? "won" : "lost") : (d.guesses?.length ?? 0) > 0 || d.summary ? "playing" : "new";

export function HomeCards() {
  const [state, setState] = useState<Record<string, { daily: BaseState; streak: number }> | null>(null);
  const [key, setKey] = useState("");
  const profile = useProfile();

  useEffect(() => {
    const k = dateKey();
    setKey(k);
    setState(Object.fromEntries(DAILY.map((g) => [g.id, { daily: loadState<BaseState>(g.id, k, { done: false, won: false }), streak: loadStats(g.id, g.max).streak }])));
  }, []);

  return (
    <>
      <section className="board" aria-label={t("home.today")}>
        <div className="board-head">
          <span className="board-title">{t("home.today")} {key && <span className="board-num">#{dayNumber(key)}</span>}</span>
          <span className="board-clock">{t("home.changesIn")} <Countdown /></span>
        </div>
        <div className="board-rows">
          {DAILY.map((g) => {
            const s = state?.[g.id];
            const st = s ? statusOf(s.daily) : null;
            return (
              <Link key={g.id} href={g.path} className="board-row" onClick={() => play("click")}>
                <span className="board-icon" aria-hidden>{g.icon}</span>
                <span className="board-name">{g.short}</span>
                <span className={`chip chip-${st ?? "new"}`}>
                  {st ? (st === "won" || st === "lost") && s?.daily.summary ? s.daily.summary : t(`status.${st}` as TKey) : "…"}
                  {st === "won" && !s?.daily.summary && ` · ${s!.daily.guesses?.length}/${g.max}`}
                </span>
                {s && s.streak > 0 && <span className="board-streak" title="Racha">🔥{s.streak}</span>}
                <span className="board-go" aria-hidden>▶</span>
              </Link>
            );
          })}
        </div>
      </section>

      <Efemerides />

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
      <div style={{ marginTop: 22 }}><DonateButton variant="card" /></div>
    </>
  );
}
