"use client";
import { useCallback, useEffect, useState } from "react";
import { dateKey, dayNumber, dayToKey } from "@/lib/game/daily";
import type { GameId } from "@/lib/game/types";
import { loadState, loadStats, recordArchive, recordFinish, saveState, type BaseState, type GameStats } from "@/lib/progress";
import { notifyProfileChange, read, write } from "@/lib/storage";
import { dailyMeta } from "@/lib/game/daily-games";

export type DailyMode = "daily" | "archive";

/**
 * Lógica común de un reto diario: clave del día (hoy o archivo), estado guardado,
 * y registro del final (puntos de liga + reputación, o media reputación si es archivo).
 */
export function useDailyGame<S extends BaseState>(game: GameId, day: number | undefined, init: (key: string) => S) {
  const [key, setKey] = useState("");
  const [mode, setMode] = useState<DailyMode>("daily");
  const [state, setState] = useState<S | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [repGain, setRepGain] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const today = dateKey();
    const isArchive = day !== undefined && day >= 1 && day < dayNumber(today);
    const k = isArchive ? dayToKey(day!) : today;
    setKey(k);
    setMode(isArchive ? "archive" : "daily");
    setState(loadState<S>(game, k, init(k)));
    setStats(loadStats(game, dailyMeta(game).max));
    setRepGain(null);
    if (!read<boolean>(`seenHelp:${game}`, false)) {
      setShowHelp(true);
      write(`seenHelp:${game}`, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, day]);

  const save = useCallback(
    (s: S) => {
      setState(s);
      if (key) saveState(game, key, s);
    },
    [game, key],
  );

  /** Llamar una sola vez al terminar. `tries` se usa para la distribución de estadísticas. */
  const finish = useCallback(
    (won: boolean, tries: number, pts: number) => {
      if (mode === "daily") {
        const r = recordFinish(game, key, won, tries, dailyMeta(game).max, pts);
        setStats(r.stats);
        setRepGain(r.repGain);
      } else {
        setRepGain(recordArchive(game, key, pts).repGain);
      }
      notifyProfileChange();
    },
    [game, key, mode],
  );

  return { key, mode, state, save, finish, stats, repGain, day: key ? dayNumber(key) : 0, showHelp, setShowHelp };
}
