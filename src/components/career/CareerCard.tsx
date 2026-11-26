"use client";
import { useEffect, useRef, useState } from "react";
import type { CareerState } from "@/lib/career/engine";
import { clubStyle } from "@/lib/clubs";
import { COUNTRIES, POSITIONS } from "@/lib/game/meta";

const SHIRT = "M30 6 L42 2 Q50 9 58 2 L70 6 L96 22 L86 42 L76 37 L76 96 L24 96 L24 37 L14 42 L4 22 Z";

/** Ficha final dibujada en canvas para guardar o compartir como imagen. */
export function CareerCard({ s }: { s: CareerState }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const W = 1080, H = 1350;
    cv.width = W;
    cv.height = H;
    const g = cv.getContext("2d")!;
    const clubs = [...new Set(s.history.map((h) => h.club))];
    const main = clubs.length ? clubs.reduce((a, b) => (s.history.filter((h) => h.club === b).length > s.history.filter((h) => h.club === a).length ? b : a)) : s.club;
    const cs = clubStyle(main);
    const [c1, c2] = cs.colors;
    const bgc = c1.toUpperCase() === "#FFFFFF" ? c2 : c1;

    const grd = g.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, "#0b0f1e");
    grd.addColorStop(1, "#151b33");
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    g.fillStyle = bgc;
    g.globalAlpha = 0.85;
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, 380); g.lineTo(0, 520); g.closePath();
    g.fill();
    g.globalAlpha = 1;

    // camiseta
    g.save();
    g.translate(700, 90);
    g.scale(3.4, 3.4);
    const p = new Path2D(SHIRT);
    g.fillStyle = c1;
    g.fill(p);
    if (cs.pattern === "stripes") {
      g.save(); g.clip(p); g.fillStyle = c2;
      for (const x of [10, 34, 58, 82]) g.fillRect(x, 0, 12, 100);
      g.restore();
    } else if (cs.pattern === "band" || cs.pattern === "sash") {
      g.save(); g.clip(p); g.fillStyle = c2; g.fillRect(0, 38, 100, 22); g.restore();
    }
    g.lineWidth = 2; g.strokeStyle = "rgba(0,0,0,0.4)"; g.stroke(p);
    g.fillStyle = c1.toUpperCase() === "#FFFFFF" ? "#111" : "#fff";
    g.font = "900 34px system-ui, sans-serif"; g.textAlign = "center";
    g.fillText(String(s.number), 50, 74);
    g.restore();

    g.textAlign = "left";
    g.fillStyle = "#fff";
    g.font = "900 30px system-ui, sans-serif";
    g.fillText("FÚTBOL DE PRIMERA · MODO CARRERA", 60, 90);
    g.font = "900 92px system-ui, sans-serif";
    const words = s.name.toUpperCase().split(" ");
    g.fillText(words.slice(0, -1).join(" ") || words[0], 60, 210);
    if (words.length > 1) g.fillText(words.slice(-1)[0], 60, 305);
    g.font = "700 36px system-ui, sans-serif";
    g.fillText(`${COUNTRIES[s.nationality]?.name ?? s.nationality} · ${POSITIONS[s.position]?.label ?? s.position} · ${s.age} años`, 60, 370);

    // números grandes
    const stats = [["PJ", s.totals.pj], ["GOLES", s.totals.goals], ["ASIST.", s.totals.assists], ["TÍTULOS", s.trophies.length]] as const;
    stats.forEach(([label, v], i) => {
      const x = 60 + i * 250;
      g.fillStyle = "rgba(255,255,255,0.06)";
      g.fillRect(x, 560, 220, 170);
      g.fillStyle = "#ff7a1a";
      g.font = "900 84px system-ui, sans-serif";
      g.fillText(String(v), x + 24, 665);
      g.fillStyle = "#c9cfe6";
      g.font = "800 28px system-ui, sans-serif";
      g.fillText(label, x + 24, 710);
    });
    g.fillStyle = "#c9cfe6";
    g.font = "700 32px system-ui, sans-serif";
    g.fillText(`Selección: ${s.caps} partidos · ${s.natGoals} goles`, 60, 800);

    g.fillStyle = "#fff";
    g.font = "900 34px system-ui, sans-serif";
    g.fillText("TRAYECTORIA", 60, 880);
    const stints: { club: string; from: number; to: number }[] = [];
    for (const h of s.history) {
      const last = stints[stints.length - 1];
      if (last && last.club === h.club) last.to = h.year;
      else stints.push({ club: h.club, from: h.year, to: h.year });
    }
    g.font = "700 32px system-ui, sans-serif";
    stints.slice(-8).forEach((st, i) => {
      const y = 935 + i * 46;
      g.fillStyle = clubStyle(st.club).colors[0] === "#FFFFFF" ? clubStyle(st.club).colors[1] : clubStyle(st.club).colors[0];
      g.fillRect(60, y - 26, 14, 32);
      g.fillStyle = "#fff";
      g.fillText(st.club, 90, y);
      g.fillStyle = "#c9cfe6";
      g.fillText(st.from === st.to ? `${st.from}` : `${st.from}–${st.to}`, 760, y);
    });
    g.fillStyle = "#ff7a1a";
    g.font = "800 28px system-ui, sans-serif";
    g.fillText("¿Podés superarla? futboldeprimera", 60, H - 50);
    setUrl(cv.toDataURL("image/png"));
  }, [s]);

  const share = async () => {
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], "mi-carrera.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: `Mi carrera en Fútbol de Primera: ${s.totals.goals} goles y ${s.trophies.length} títulos.` });
    } catch {
      /* el usuario puede mantener apretada la imagen para guardarla */
    }
  };

  return (
    <div className="career-card">
      <canvas ref={ref} hidden />
      {url && <img src={url} alt={`Ficha de la carrera de ${s.name}`} className="career-img" />}
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn btn-primary" onClick={share}>Compartir ficha</button>
        {url && <a className="btn" href={url} download="mi-carrera.png">Descargar</a>}
      </div>
      <p className="muted small" style={{ textAlign: "center", margin: 0 }}>En el celular también podés mantener apretada la imagen para guardarla.</p>
    </div>
  );
}
