"use client";
import { useEffect, useState } from "react";
import { TIMEZONE } from "@/lib/game/daily";

/** Tiempo hasta la medianoche de Buenos Aires. */
function msToMidnight(): number {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
    .formatToParts(now)
    .reduce<Record<string, number>>((a, p) => (p.type !== "literal" ? { ...a, [p.type]: Number(p.value) } : a), {});
  return (86400 - (parts.hour * 3600 + parts.minute * 60 + parts.second)) * 1000;
}

export function Countdown() {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMs(msToMidnight());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (ms === null) return <span className="countdown">--:--:--</span>;
  const s = Math.floor(ms / 1000);
  const f = (n: number) => String(n).padStart(2, "0");
  return <span className="countdown">{f(Math.floor(s / 3600))}:{f(Math.floor((s % 3600) / 60))}:{f(s % 60)}</span>;
}
