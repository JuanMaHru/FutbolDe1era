"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DAILY, dailyMeta } from "@/lib/game/daily-games";
import { dateKey, dayNumber, dayToKey } from "@/lib/game/daily";
import type { GameId } from "@/lib/game/types";
import { loadState, type BaseState } from "@/lib/progress";
import { read, write } from "@/lib/storage";
import { t } from "@/lib/i18n";
import { play } from "@/lib/sound";

const DOW = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export function Archive() {
  const [tab, setTab] = useState<GameId>("jugador");
  const [days, setDays] = useState<{ n: number; key: string; s: BaseState }[] | null>(null);

  useEffect(() => {
    const saved = read<GameId>("archiveTab", "jugador");
    setTab(DAILY.some((d) => d.id === saved) ? saved : "jugador");
  }, []);

  useEffect(() => {
    const todayN = dayNumber(dateKey());
    setDays(
      Array.from({ length: todayN }, (_, i) => {
        const n = todayN - i;
        const key = dayToKey(n);
        return { n, key, s: loadState<BaseState>(tab, key, { done: false, won: false }) };
      }),
    );
  }, [tab]);

  const meta = dailyMeta(tab);
  const played = days?.filter((d) => d.s.done).length ?? 0;
  const wins = days?.filter((d) => d.s.won).length ?? 0;

  return (
    <>
      <div className="tabs tabs-scroll" role="tablist">
        {DAILY.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={tab === g.id}
            className={`tab ${tab === g.id ? "active" : ""}`}
            onClick={() => {
              play("click");
              setTab(g.id);
              write("archiveTab", g.id);
            }}
          >
            <span aria-hidden>{g.icon}</span> {g.short}
          </button>
        ))}
      </div>
      {days && (
        <p className="muted small">
          {meta.title}: jugaste {played} de {days.length} · ganaste {wins}
        </p>
      )}
      <div className="archive-grid">
        {days?.map(({ n, key, s }, i) => {
          const started = s.done || (s.guesses?.length ?? 0) > 0 || !!s.summary;
          const status = s.done ? (s.won ? "won" : "lost") : started ? "playing" : "new";
          const d = new Date(`${key}T12:00:00Z`);
          return (
            <Link
              key={n}
              href={i === 0 ? meta.path : `${meta.path}/${n}`}
              className={`day-tile d-${status}`}
              style={{ animationDelay: `${Math.min(i, 20) * 25}ms` }}
              onClick={() => play("click")}
            >
              <span className="day-n">#{n}</span>
              <span className="day-date">{i === 0 ? t("archive.today") : `${DOW[d.getUTCDay()]} ${d.getUTCDate()}/${d.getUTCMonth() + 1}`}</span>
              <span className="day-status">
                {status === "won" ? `✓ ${s.summary ?? `${s.guesses?.length}/${meta.max}`}` : status === "lost" ? `✗ ${s.summary ?? ""}` : status === "playing" ? "…" : "▶"}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
