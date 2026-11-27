"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { CLUBS } from "@/lib/clubs";
import { DEFAULT_THEME, currentTheme, setTheme } from "@/lib/theme";
import { normalize } from "@/lib/game/text";
import { play } from "@/lib/sound";
import { Crest } from "./art/Crest";
import { IconClose } from "./Icons";

const ARG = ["Boca Juniors", "River Plate", "Racing Club", "Independiente", "San Lorenzo", "Huracán", "Vélez Sarsfield", "Estudiantes", "Gimnasia y Esgrima LP", "Rosario Central", "Newell's Old Boys", "Talleres", "Belgrano", "Instituto", "Lanús", "Banfield", "Argentinos Juniors", "Platense", "Tigre", "Colón", "Unión", "Godoy Cruz", "Independiente Rivadavia", "Defensa y Justicia", "Atlético Tucumán", "San Martín de Tucumán", "Central Córdoba", "Sarmiento", "Aldosivi", "Barracas Central", "Deportivo Riestra", "Chacarita Juniors", "Quilmes", "Ferro Carril Oeste", "Nueva Chicago"];

/** Modal para elegir los colores de la página según tu club o selección. */
export function ThemePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(DEFAULT_THEME);

  useEffect(() => setActive(currentTheme()), [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal?.();
    if (!open && d.open) d.close();
  }, [open]);

  const groups = useMemo(() => {
    const all = Object.keys(CLUBS);
    const nat = all.filter((n) => n.startsWith("Selección"));
    const world = all.filter((n) => !n.startsWith("Selección") && !ARG.includes(n)).sort((a, b) => a.localeCompare(b));
    const filt = (list: string[]) => (q ? list.filter((n) => normalize(n).includes(normalize(q))) : list);
    return [
      { title: "Fútbol argentino", items: filt(ARG.filter((n) => CLUBS[n])) },
      { title: "Selecciones", items: filt(nat) },
      { title: "Resto del mundo", items: filt(world) },
    ];
  }, [q]);

  const pick = (theme: string) => {
    setTheme(theme);
    setActive(theme);
    play("click");
  };

  return (
    <dialog ref={ref} className="theme-dialog" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="theme-body">
        <button className="icon-btn howto-close" onClick={onClose} aria-label="Cerrar"><IconClose /></button>
        <h2>Tus colores</h2>
        <p className="muted small" style={{ margin: 0 }}>Elegí tu club o selección y la página se viste con sus colores.</p>
        <input id="theme-search" className="input" placeholder="Buscar club o país…" value={q} onChange={(e) => setQ(e.target.value)} />
        {!q && (
          <div className="theme-grid">
            <button className={`theme-opt ${active === DEFAULT_THEME ? "active" : ""}`} onClick={() => pick(DEFAULT_THEME)}>
              <span className="swatch" style={{ "--a": "#22D169", "--b": "#0B1D3A" } as React.CSSProperties} />
              <span>Fútbol de Primera</span>
            </button>
          </div>
        )}
        {groups.map((g) =>
          g.items.length ? (
            <div key={g.title}>
              <p className="theme-group-title">{g.title}</p>
              <div className="theme-grid">
                {g.items.map((n) => (
                  <button key={n} className={`theme-opt ${active === n ? "active" : ""}`} onClick={() => pick(n)} title={n}>
                    <Crest club={n} size={30} />
                    <span>{CLUBS[n].short}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null,
        )}
        <button className="btn btn-primary" onClick={onClose}>Listo</button>
      </div>
    </dialog>
  );
}
