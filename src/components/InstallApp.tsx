"use client";
import { useEffect, useState } from "react";
import { read, write } from "@/lib/storage";
import { play } from "@/lib/sound";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Registra el service worker (solo en el sitio real) y ofrece instalar la app. */
export function InstallApp({ variant = "banner" }: { variant?: "banner" | "button" }) {
  const [evt, setEvt] = useState<BIP | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("/sw.js").catch(() => {});
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
    setInstalled(!!standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setHidden(read<boolean>("install:dismissed", false));
    const on = (e: Event) => { e.preventDefault(); setEvt(e as BIP); };
    window.addEventListener("beforeinstallprompt", on);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", on);
  }, []);
  if (installed || (!evt && !ios)) return null;
  const install = async () => {
    play("click");
    if (evt) { await evt.prompt(); const r = await evt.userChoice; if (r.outcome === "accepted") setInstalled(true); setEvt(null); }
    else setHelp(true);
  };
  if (variant === "button") return (
    <>
      <button className="btn btn-primary" onClick={install}>📲 Instalar la app</button>
      {help && <p className="muted small">En iPhone: tocá <b>Compartir</b> <span aria-hidden>⬆️</span> y después <b>Agregar a inicio</b>.</p>}
    </>
  );
  if (hidden) return null;
  return (
    <div className="install-banner">
      <img src="/icons/icon-192.png" alt="" width={44} height={44} />
      <div><b>Instalá Fútbol de Primera</b><span className="muted small">{help ? "En iPhone: Compartir ⬆️ → Agregar a inicio." : "Abrila como una app, más rápida y sin conexión."}</span></div>
      <button className="btn btn-primary small" onClick={install}>Instalar</button>
      <button className="icon-btn" aria-label="Ahora no" onClick={() => { write("install:dismissed", true); setHidden(true); }}>✕</button>
    </div>
  );
}
