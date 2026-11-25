"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GAMES, GAME_IDS } from "@/lib/game/games";
import { dateKey, dayNumber } from "@/lib/game/daily";
import { loadDaily, loadStats, type DailyState } from "@/lib/progress";
import type { GameId } from "@/lib/game/types";
import { useProfile } from "./useProfile";

const ICON: Record<GameId, string> = { jugador: "👟", dt: "📋" };
const BLURB: Record<GameId, string> = {
  jugador: "Club, liga, país, posición, edad y dorsal. 8 intentos.",
  dt: "Equipo, liga, país, edad, esquema y año de debut. 8 intentos.",
};

export function HomeCards() {
  const [state, setState] = useState<Record<string, { daily: DailyState; streak: number }> | null>(null);
  const [key, setKey] = useState("");
  const profile = useProfile();

  useEffect(() => {
    const k = dateKey();
    setKey(k);
    setState(
      Object.fromEntries(GAME_IDS.map((g) => [g, { daily: loadDaily(g, k), streak: loadStats(g, GAMES[g].maxGuesses).streak }])),
    );
  }, []);

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ margin: "8px 0" }}>Retos de hoy {key && <span className="muted small">#{dayNumber(key)}</span>}</h2>
      </div>
      <div className="game-cards">
        {GAME_IDS.map((g) => {
          const s = state?.[g];
          const status = !s ? null : s.daily.done ? (s.daily.won ? "won" : "lost") : s.daily.guesses.length ? "playing" : "new";
          return (
            <Link key={g} href={`/${g}`} className="card game-card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="icon" aria-hidden>{ICON[g]}</span>
                {status === "won" && <span className="tag tag-hit">Acertado · {s!.daily.guesses.length}/{GAMES[g].maxGuesses}</span>}
                {status === "lost" && <span className="tag tag-miss">Fallado</span>}
                {status === "playing" && <span className="tag tag-accent">En juego</span>}
                {status === "new" && <span className="tag">Nuevo</span>}
              </div>
              <span className="big">Adiviná el {GAMES[g].title}</span>
              <span className="muted small">{BLURB[g]}</span>
              <span className="go">
                {status === "won" || status === "lost" ? "Ver resultado →" : "Jugar →"}
                {s && s.streak > 0 && <span className="muted small"> · racha {s.streak}🔥</span>}
              </span>
            </Link>
          );
        })}
      </div>

      <h2>Tu temporada</h2>
      <div className="game-cards">
        <Link href="/ligas" className="card game-card">
          <span className="icon" aria-hidden>🏆</span>
          <span className="big">Ligas entre amigos</span>
          <span className="muted small">Armá una liga, pasá el código al grupo y peleen la tabla semanal con los retos diarios.</span>
          <span className="go">Ir a ligas →</span>
        </Link>
        <div className="card game-card locked" aria-disabled>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="icon" aria-hidden>📖</span>
            <span className="tag">Fase 2</span>
          </div>
          <span className="big">Modo Carrera</span>
          <span className="muted small">
            Tu historia como jugador o DT. Lo que acertás en los retos diarios te abre puertas: reputación, scouting y fichajes.
          </span>
          <span className="go" style={{ color: "var(--chalk)" }}>
            Ya juntaste ⭐ {profile?.reputation ?? 0} de reputación
          </span>
        </div>
      </div>
    </>
  );
}
