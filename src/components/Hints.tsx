import type { Hint } from "@/lib/game/bios";

/** Pistas que se van abriendo con cada error: el jugador investiga, no solo prueba nombres. */
export function Hints({ hints, misses, done }: { hints: Hint[]; misses: number; done: boolean }) {
  if (!hints.length) return null;
  return (
    <div className="hints" aria-live="polite">
      {hints.map((h) => {
        const open = done || misses >= h.at;
        return (
          <div key={h.label} className={`hint ${open ? "open" : ""}`}>
            <span className="hint-label">{open ? "💡" : "🔒"} {h.label}</span>
            <span className="hint-value">{open ? h.value : `con ${h.at} errores`}</span>
          </div>
        );
      })}
    </div>
  );
}
