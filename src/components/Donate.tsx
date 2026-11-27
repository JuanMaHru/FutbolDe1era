"use client";
import { useEffect, useRef, useState } from "react";
import { DONATE, donationsReady } from "@/lib/site";
import { play } from "@/lib/sound";
import { IconClose } from "./Icons";

/** Botón "Apoyá el proyecto" con donaciones por Mercado Pago. */
export function DonateButton({ variant = "pill" }: { variant?: "pill" | "card" | "link" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {variant === "card" ? (
        <button className="donate-card" onClick={() => { play("click"); setOpen(true); }}>
          <span className="donate-heart" aria-hidden>💙</span>
          <span><b>¿Te gusta Fútbol de Primera?</b><span className="muted small"> Bancá el proyecto con Mercado Pago: es gratis y sin apuestas gracias a vos.</span></span>
          <span className="donate-go">Apoyar →</span>
        </button>
      ) : variant === "link" ? (
        <button className="link-btn" onClick={() => setOpen(true)}>💙 Apoyá el proyecto</button>
      ) : (
        <button className="donate-pill" onClick={() => { play("click"); setOpen(true); }} aria-label="Apoyá el proyecto"><span aria-hidden>⚽</span><span className="donate-txt">Apoyar</span></button>
      )}
      <DonateDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function DonateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState("");
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal?.();
    if (!open && d.open) d.close();
  }, [open]);
  const ready = donationsReady();
  const copy = async (amount?: string) => {
    play("win");
    const msg = amount ? `Alias copiado: transferí ${amount} desde Mercado Pago 💙` : "¡Alias copiado!";
    try { await navigator.clipboard.writeText(DONATE.alias); setCopied(msg); } catch { setCopied(`Alias: ${DONATE.alias}${amount ? ` · ${amount}` : ""}`); }
    setTimeout(() => setCopied(""), 3500);
  };
  return (
    <dialog ref={ref} className="howto" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="howto-body donate-body">
        <button className="icon-btn howto-close" onClick={onClose} aria-label="Cerrar"><IconClose /></button>
        <h2>Apoyá el proyecto 💙</h2>
        <p className="muted" style={{ margin: 0 }}>Fútbol de Primera es gratis, sin apuestas y hecho a pulmón. Si te divierte, podés bancarlo con lo que quieras.</p>
        {!ready ? (
          <p className="notice">Las donaciones se habilitan muy pronto. ¡Gracias por querer sumar!</p>
        ) : (
          <>
            <div className="donate-grid">
              {DONATE.links.map((l) =>
                l.url ? (
                  <a key={l.amount} className="donate-opt" href={l.url} target="_blank" rel="noreferrer" onClick={() => play("win")}>
                    <b>{l.amount}</b><span>{l.label}</span>
                  </a>
                ) : DONATE.alias ? (
                  <button key={l.amount} className="donate-opt" onClick={() => copy(l.amount)}>
                    <b>{l.amount}</b><span>{l.label}</span>
                  </button>
                ) : null,
              )}
              {DONATE.freeAmountUrl && <a className="donate-opt" href={DONATE.freeAmountUrl} target="_blank" rel="noreferrer"><b>Otro monto</b><span>Elegís vos</span></a>}
            </div>
            {DONATE.alias && (
              <div className="donate-alias">
                <span className="muted small">Elegí una opción (copia el alias) o transferí lo que quieras por Mercado Pago al alias:</span>
                <code style={{ userSelect: "all" }}>{DONATE.alias}</code>
                <button className="btn" onClick={() => copy()}>Copiar alias</button>
                {copied && <span className="donate-ok" role="status">{copied}</span>}
              </div>
            )}
            <p className="muted small" style={{ margin: 0 }}>La transferencia la hacés desde tu app de Mercado Pago; nosotros no vemos tus datos.</p>
          </>
        )}
      </div>
    </dialog>
  );
}
