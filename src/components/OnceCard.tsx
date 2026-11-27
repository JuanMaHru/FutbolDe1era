"use client";
import { useEffect, useRef, useState } from "react";
import { FORMATION } from "@/lib/game/once";

/** Imagen del 11 armado (para descargar o compartir en redes). */
export function OnceCard({ names, day }: { names: (string | null)[]; day: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const W = 1080, H = 1350, ctx = cv.getContext("2d")!;
    cv.width = W; cv.height = H;
    ctx.fillStyle = "#0B1D3A"; ctx.fillRect(0, 0, W, H);
    // Cancha
    const px = 70, py = 190, pw = W - 140, ph = H - 330;
    const g = ctx.createLinearGradient(0, py, 0, py + ph);
    g.addColorStop(0, "#1f7a43"); g.addColorStop(1, "#14592f");
    ctx.fillStyle = g; ctx.fillRect(px, py, pw, ph);
    for (let i = 0; i < 8; i++) if (i % 2) { ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fillRect(px, py + (ph / 8) * i, pw, ph / 8); }
    ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 4;
    ctx.strokeRect(px, py, pw, ph);
    ctx.beginPath(); ctx.moveTo(px, py + ph / 2); ctx.lineTo(px + pw, py + ph / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, py + ph / 2, 90, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(W / 2 - 200, py, 400, 150); ctx.strokeRect(W / 2 - 200, py + ph - 150, 400, 150);
    // Título
    ctx.fillStyle = "#F4F7FA"; ctx.font = "italic 900 72px 'Barlow Condensed', Impact, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("MI 11 DEL DÍA", 70, 110);
    ctx.fillStyle = "#22D169"; ctx.font = "italic 800 40px 'Barlow Condensed', Impact, sans-serif";
    ctx.fillText(`#${day} · FÚTBOL DE PRIMERA`, 70, 160);
    // Jugadores
    FORMATION.forEach((slot, i) => {
      const x = px + (slot.x / 100) * pw, y = py + (slot.y / 100) * ph;
      const name = names[i];
      ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2);
      ctx.fillStyle = name ? "#22D169" : "rgba(255,255,255,0.15)"; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = "#F4F7FA"; ctx.stroke();
      ctx.fillStyle = "#0B1D3A"; ctx.font = "900 30px 'Barlow Condensed', Impact, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(slot.line === "ARQ" ? "1" : name ? "✓" : "?", x, y + 11);
      if (name) {
        ctx.font = "800 30px Montserrat, Arial, sans-serif";
        const w = ctx.measureText(name).width + 24;
        ctx.fillStyle = "rgba(11,29,58,0.85)"; ctx.beginPath(); ctx.roundRect(x - w / 2, y + 44, w, 44, 10); ctx.fill();
        ctx.fillStyle = "#F4F7FA"; ctx.fillText(name, x, y + 76);
      }
    });
    ctx.fillStyle = "#c9d3e3"; ctx.font = "600 30px Montserrat, Arial, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("El que sabe, juega.", W / 2, H - 70);
    setUrl(cv.toDataURL("image/png"));
  }, [names, day]);

  const share = async () => {
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], `mi-11-${day}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text: "Mi 11 del día en Fútbol de Primera ⚽" }); return; }
    } catch { /* sigue con descarga */ }
    const a = document.createElement("a"); a.href = url; a.download = `mi-11-${day}.png`; a.click();
  };

  return (
    <div className="once-card">
      <canvas ref={ref} hidden />
      {url && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Tu 11 del día" />
          <button className="btn" onClick={share}>📸 Compartir imagen de mi 11</button>
        </>
      )}
    </div>
  );
}
