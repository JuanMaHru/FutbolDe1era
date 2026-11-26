"use client";
import { useEffect, useRef } from "react";
import type { Cell, Entity, GameDefinition } from "@/lib/game/types";
import { keyToDate } from "@/lib/game/daily";
import { CellContent } from "./CellContent";
import { IconClose } from "./Icons";

/** Instrucciones visuales: un ejemplo real dibujado, con la explicación debajo de cada casilla. */
export function HowTo({ game, open, onClose, today }: { game: GameDefinition<Entity>; open: boolean; onClose: () => void; today: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal?.();
    if (!open && d.open) d.close();
  }, [open]);

  // Ejemplo armado con datos reales para que siempre sea correcto.
  const ex = game.id === "jugador" ? ["luis-suarez", "lionel-messi"] : ["pep-guardiola", "lionel-scaloni"];
  const guess = game.items.find((i) => i.id === ex[0])!;
  const target = game.items.find((i) => i.id === ex[1])!;
  const date = keyToDate(today || "2026-11-26");
  const cells: Cell[] = game.attributes.map((a) => a.compare(guess, target, date));

  const explain = (c: Cell, i: number) =>
    c.status === "hit" ? "¡Igual!" : c.status === "near" ? game.attributes[i].nearShort : "No";

  return (
    <dialog ref={ref} className="howto" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="howto-body">
        <button className="icon-btn howto-close" onClick={onClose} aria-label="Cerrar"><IconClose /></button>
        <h2>Cómo se juega</h2>

        <ol className="howto-steps">
          <li><span className="step-n">1</span><span>Escribí un {game.noun} y elegilo de la lista.</span></li>
          <li><span className="step-n">2</span><span>Cada casilla te dice qué tan cerca estás.</span></li>
          <li><span className="step-n">3</span><span>Tenés <b>{game.maxGuesses} intentos</b>. Cambia a las 00:00 🇦🇷.</span></li>
        </ol>

        <p className="howto-ex-title">Ejemplo: buscás a <b>{target.name}</b> y probás con <b>{guess.name}</b></p>
        <div className="howto-grid">
          {game.attributes.map((a, i) => (
            <div key={a.key} className="howto-col">
              <span className="howto-label">{a.label}</span>
              <div className={`cell ${cells[i].status}`}>
                <CellContent attr={a.key} cell={cells[i]} item={guess as Entity & Record<string, unknown>} />
              </div>
              <span className={`howto-explain e-${cells[i].status}`}>{explain(cells[i], i)}</span>
            </div>
          ))}
        </div>

        <div className="howto-legend">
          <div><span className="sw hit" /> <b>Verde</b>: es igual</div>
          <div><span className="sw near" /> <b>Amarillo</b>: estás cerca</div>
          <div><span className="sw miss" /> <b>Oscuro</b>: no coincide</div>
          <div><span className="sw arrow">▲▼</span> El número buscado es <b>mayor / menor</b></div>
        </div>

        <details className="howto-more">
          <summary>¿Qué es “cerca” en cada casilla?</summary>
          <ul>
            {game.attributes.map((a) => (
              <li key={a.key}><b>{a.label}</b> · {a.nearHint}</li>
            ))}
          </ul>
        </details>

        <p className="howto-tip">💡 La ficha de arriba se completa sola con lo que vas descubriendo.</p>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={onClose}>¡A jugar!</button>
      </div>
    </dialog>
  );
}
