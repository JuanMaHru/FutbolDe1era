"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/game/games";
import { t } from "@/lib/i18n";
import { shareUrl } from "@/lib/site";
import { play } from "@/lib/sound";
import { Countdown } from "./Countdown";
import { IconClose, IconHelp } from "./Icons";
import { DonateButton } from "./Donate";
import type { DailyMode } from "./useDailyGame";

export function GameTop({ title, mode, day, dateLabel, onHelp, extra }: { title: string; mode: DailyMode | "practice"; day: number; dateLabel?: string; onHelp: () => void; extra?: React.ReactNode }) {
  return (
    <div className="game-head">
      <div style={{ minWidth: 0 }}>
        <div className="row" style={{ gap: 8, marginBottom: 6 }}>
          {mode === "daily" && <span className="tag tag-accent">Reto #{day} · Hoy</span>}
          {mode === "archive" && <span className="tag">Archivo · #{day}{dateLabel ? ` · ${dateLabel}` : ""}</span>}
          {mode === "practice" && <span className="tag">Práctica · no suma</span>}
          {extra}
        </div>
        <h1>{title}</h1>
      </div>
      <div className="head-actions">
        <button className="icon-btn big" onClick={() => { play("click"); onHelp(); }} aria-label="Cómo se juega" title="Cómo se juega">
          <IconHelp />
        </button>
      </div>
    </div>
  );
}

/** Modal de ayuda genérico: pasos numerados + contenido visual libre. */
export function HelpDialog({ open, onClose, steps, children }: { open: boolean; onClose: () => void; steps: React.ReactNode[]; children?: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal?.();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="howto" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="howto-body">
        <button className="icon-btn howto-close" onClick={onClose} aria-label="Cerrar"><IconClose /></button>
        <h2>Cómo se juega</h2>
        <ol className="howto-steps">
          {steps.map((s, i) => (
            <li key={i}><span className="step-n">{i + 1}</span><span>{s}</span></li>
          ))}
        </ol>
        {children}
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={onClose}>¡A jugar!</button>
      </div>
    </dialog>
  );
}

export function useToast() {
  const [msg, setMsg] = useState("");
  const show = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2200);
  };
  return { show, node: msg ? <div className="toast" role="status">{msg}</div> : null };
}

export async function shareResult(text: string, toast: (m: string) => void) {
  play("click");
  if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
    try {
      await navigator.share({ text });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast(t("result.copied"));
  } catch {
    toast(t("result.copyFail"));
  }
}

/** Tarjeta de resultado común a los juegos nuevos. */
export function ResultCard({
  won,
  title,
  subtitle,
  mode,
  pts,
  repGain,
  streak,
  shareTitle,
  shareBody,
  path,
  day,
  children,
}: {
  won: boolean;
  title: string;
  subtitle?: React.ReactNode;
  mode: DailyMode;
  pts: number;
  repGain: number | null;
  streak?: number;
  shareTitle: string;
  shareBody: string;
  path: string;
  day: number;
  children?: React.ReactNode;
}) {
  const toast = useToast();
  const text = [`⚽ ${BRAND} #${day} · ${shareTitle}`, shareBody, shareUrl(path)].filter(Boolean).join("\n");
  return (
    <section className={`card result ${won ? "" : "lost"}`} aria-live="polite">
      <p className="result-title">{title}</p>
      {subtitle && <div className="muted small" style={{ marginTop: 2 }}>{subtitle}</div>}
      {children}
      <div className="reward">
        {mode === "daily" && <div><b>{pts}</b><small>{t("result.points")}</small></div>}
        <div><b>+{repGain ?? (mode === "daily" ? pts : Math.floor(pts / 2))}</b><small>{t("result.rep")}</small></div>
        {mode === "daily" && <div><b>{streak ?? 0}🔥</b><small>{t("result.streak")}</small></div>}
      </div>
      {mode === "archive" && <p className="notice">{t("result.archiveNote")}</p>}
      <div className="share-preview" style={{ userSelect: "all" }}>{`⚽ ${BRAND} #${day} · ${shareTitle}\n${shareBody}`}</div>
      <div className="row">
        <button className="btn btn-primary" onClick={() => shareResult(text, toast.show)}>{t("result.share")}</button>
        <Link className="btn" href={mode === "daily" ? "/" : "/archivo"}>{mode === "daily" ? "Más juegos →" : `← ${t("nav.archive")}`}</Link>
      </div>
      {mode === "daily" && (
        <p className="muted small" style={{ marginBottom: 0 }}>
          {t("result.next")} <Countdown />
        </p>
      )}
      <DonateButton variant="link" />
      {toast.node}
    </section>
  );
}

export function fmtKey(key: string) {
  const [, m, d] = key.split("-");
  return `${Number(d)}/${Number(m)}`;
}
