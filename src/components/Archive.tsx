"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GAMES, GAME_IDS } from "@/lib/game/games";
import { dateKey, dayNumber, dayToKey } from "@/lib/game/daily";
import type { GameId } from "@/lib/game/types";
import { loadDaily, type DailyState } from "@/lib/progress";
import { read, write } from "@/lib/storage";
import { t } from "@/lib/i18n";
import { play } from "@/lib/sound";

const DOW = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export function Archive() {
  const [tab, setTab] = useState<GameId>("jugador");
  const [days, setDays] = useState<{ n: number; key: string; s: DailyState }[] | null>(null);

  useEffect(() => {
    setTab(read<GameId>("archiveTab", "jugador"));
  }, []);

  useEffect(() => {
    const todayN = dayNumber(dateKey());
    setDays(
      Array.from({ length: todayN }, (_, i) => {
        const n = todayN - i;
        const key = dayToKey(n);
        return { n, key, s: loadDaily(tab, key) };
      }),
    );
  }, [tab]);

  const played = days?.filter((d) => d.s.done).length ?? 0;
  const wins = days?.filter((d) => d.s.won).length ?? 0;

  return (
    <>
      <div className="tabs" role="tablist">
        {GAME_IDS.map((g) => (
          <button
            key={g}
            role="tab"
            aria-selected={tab === g}
            className={`tab ${tab === g ? "active" : ""}`}
            onClick={() => {
              play("click");
              setTab(g);
              write("archiveTab", g);
            }}
          >
            {GAMES[g].title}
          </button>
        ))}
      </div>
      {days && (
        <p className="muted small">
          Jugaste {played} de {days.length} · acertaste {wins}
        </p>
      )}
      <div className="archive-grid">
        {days?.map(({ n, key, s }, i) => {
          const status = s.done ? (s.won ? "won" : "lost") : s.guesses.length ? "playing" : "new";
          const d = new Date(`${key}T12:00:00Z`);
          return (
            <Link
              key={n}
              href={i === 0 ? `/${tab}` : `/${tab}/${n}`}
              className={`day-tile d-${status}`}
              style={{ animationDelay: `${Math.min(i, 20) * 25}ms` }}
              onClick={() => play("click")}
            >
              <span className="day-n">#{n}</span>
              <span className="day-date">{i === 0 ? t("archive.today") : `${DOW[d.getUTCDay()]} ${d.getUTCDate()}/${d.getUTCMonth() + 1}`}</span>
              <span className="day-status" aria-label={status}>
                {status === "won" ? `✓ ${s.guesses.length}/${GAMES[tab].maxGuesses}` : status === "lost" ? "✗" : status === "playing" ? "…" : "▶"}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
