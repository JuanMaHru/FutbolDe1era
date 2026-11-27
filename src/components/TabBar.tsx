"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { play } from "@/lib/sound";
import { PackBadge } from "./Album";

const I = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
);
export const TABS = [
  { href: "/", label: "Juegos", icon: I(<><rect x="3" y="7" width="18" height="11" rx="4" /><path d="M8 11v3M6.5 12.5h3" /><circle cx="15.5" cy="11.5" r="1" fill="currentColor" /><circle cx="17.5" cy="13.5" r="1" fill="currentColor" /></>) },
  { href: "/carrera", label: "Carrera", icon: I(<><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" /></>) },
  { href: "/album", label: "Álbum", icon: I(<><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" /><path d="M8 7h6M8 11h6" /><path d="M4 17h14" /></>) },
  { href: "/ligas", label: "Ligas", icon: I(<><path d="M8 4h8v4a4 4 0 0 1-8 0z" /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4" /><path d="M12 12v4M9 20h6M10 16h4v4h-4z" /></>) },
  { href: "/archivo", label: "Archivo", icon: I(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="M8 14h2M14 14h2M8 17h2" /></>) },
];
const tabIndex = (path: string) => TABS.findIndex((t) => (t.href === "/" ? path === "/" : path === t.href));
const activeIndex = (path: string) => TABS.findIndex((t) => (t.href === "/" ? path === "/" : path.startsWith(t.href)));

/** ¿El gesto arrancó en algo que se desplaza de costado (filas con scroll, rangos, campos)? */
function blocksSwipe(el: EventTarget | null): boolean {
  for (let n = el as HTMLElement | null; n && n !== document.body; n = n.parentElement) {
    if (n.matches?.("input, textarea, select, [data-noswipe], dialog")) return true;
    const st = getComputedStyle(n);
    if ((st.overflowX === "auto" || st.overflowX === "scroll") && n.scrollWidth > n.clientWidth + 4) return true;
  }
  return false;
}

/** Barra de navegación inferior (celular) + deslizar de costado entre secciones. */
export function TabBar() {
  const path = usePathname();
  const router = useRouter();
  const start = useRef<{ x: number; y: number; t: number; ok: boolean } | null>(null);
  const active = activeIndex(path);
  const pending = useRef<"left" | "right" | null>(null);

  // La animación se aplica cuando ya cambió la sección (no sobre el contenido viejo).
  useEffect(() => {
    if (!pending.current) return;
    document.body.dataset.swipe = pending.current;
    pending.current = null;
    window.scrollTo({ top: 0 });
    const id = setTimeout(() => { delete document.body.dataset.swipe; }, 400);
    return () => clearTimeout(id);
  }, [path]);

  useEffect(() => {
    const down = (e: TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY, t: Date.now(), ok: tabIndex(path) >= 0 && !blocksSwipe(e.target) };
    };
    const up = (e: TouchEvent) => {
      const s = start.current; start.current = null;
      if (!s?.ok) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s.x, dy = t.clientY - s.y;
      if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6 || Date.now() - s.t > 700) return;
      const i = tabIndex(path); const j = i + (dx < 0 ? 1 : -1);
      if (j < 0 || j >= TABS.length) return;
      pending.current = dx < 0 ? "left" : "right";
      play("click");
      router.push(TABS[j].href);
    };
    window.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchend", up, { passive: true });
    return () => { window.removeEventListener("touchstart", down); window.removeEventListener("touchend", up); };
  }, [path, router]);

  return (
    <nav className="tabbar" aria-label="Secciones">
      {TABS.map((t, i) => (
        <Link key={t.href} href={t.href} className={`tab ${i === active ? "on" : ""}`} aria-current={i === active ? "page" : undefined} onClick={() => play("click")}>
          <span className="tab-ico">{t.icon}{t.href === "/album" && <PackBadge />}</span>
          <span className="tab-label">{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}
