"use client";
import { useEffect, useState } from "react";
import { DEFAULT_THEME, currentTheme } from "@/lib/theme";
import { clubStyle } from "@/lib/clubs";
import { Crest } from "./art/Crest";

const CANTOS = ["Te sigo a todas partes", "Esta hinchada te alienta", "Hasta la muerte con vos", "Mi único amor", "Siempre presente", "La banda no te deja"];

/** "Trapo" de hinchada con los colores del club elegido. */
export function ClubBanner() {
  const [theme, setTheme] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => setTheme(currentTheme());
    sync();
    window.addEventListener("primera:theme", sync);
    return () => window.removeEventListener("primera:theme", sync);
  }, []);
  if (theme === null) return null;
  if (theme === DEFAULT_THEME)
    return (
      <div className="trapo-pick">
        <span>🎨 Elegí tu club o selección y la página se viste con sus colores, su trapo y sus festejos.</span>
        <span aria-hidden>↗ botón de colores arriba</span>
      </div>
    );
  const s = clubStyle(theme);
  const canto = CANTOS[[...theme].reduce((a, c) => a + c.charCodeAt(0), 0) % CANTOS.length];
  return (
    <div className="trapo" role="img" aria-label={`Trapo de ${theme}`}>
      <Crest club={theme} size={58} />
      <div className="trapo-text">
        <span className="trapo-small">{canto}</span>
        <span className="trapo-big">{s.short}</span>
      </div>
    </div>
  );
}
