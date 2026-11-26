"use client";
import { useEffect, useRef } from "react";

/** Explosión breve de papelitos (colores de la app). Respeta prefers-reduced-motion. */
export function Confetti({ fire }: { fire: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!fire) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = window.innerWidth * dpr;
    cv.height = window.innerHeight * dpr;
    const g = cv.getContext("2d");
    if (!g) return;
    g.scale(dpr, dpr);
    const colors = ["#f4c542", "#2e9e5b", "#eef4ef", "#6cb4e4", "#d6a019"];
    const W = window.innerWidth;
    const parts = Array.from({ length: 140 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 80,
      y: window.innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 14 - 4,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      w: 6 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      g.clearRect(0, 0, W, window.innerHeight);
      for (const p of parts) {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.fillStyle = p.c;
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        g.restore();
      }
      if (now - start < 2600) raf = requestAnimationFrame(step);
      else g.clearRect(0, 0, W, window.innerHeight);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [fire]);
  return <canvas ref={ref} className="confetti" aria-hidden />;
}
