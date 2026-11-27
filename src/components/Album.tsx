"use client";
import { useEffect, useRef, useState } from "react";
import { loadAlbum, openPack, paste, RARITY_LABEL, SECTION_ORDER, STICKERS, stickerOf, type AlbumState, type Sticker } from "@/lib/album";
import { photoOf } from "@/lib/game/bios";
import { COUNTRIES } from "@/lib/game/meta";
import { play } from "@/lib/sound";
import { Crest } from "./art/Crest";
import { Confetti } from "./Confetti";

/** La figurita en sí (común, estrella o leyenda). */
function Face({ s, className = "", style, onClick }: { s: Sticker; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const ph = photoOf(s.id);
  const [bad, setBad] = useState(false);
  return (
    <figure className={`stk stk-${s.rarity} ${className}`} style={style} onClick={onClick} title={ph ? `Foto: ${ph.author} · ${ph.license}` : s.name}>
      <span className="stk-n">{s.n}</span>
      {s.rarity !== "comun" && <span className="stk-tag">{RARITY_LABEL[s.rarity]}</span>}
      {ph && !bad ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ph.url} alt={s.name} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} />
      ) : <span className="stk-crest"><Crest club={s.club} size={48} real={false} /></span>}
      <figcaption>
        <b>{s.name}</b>
        <span>{COUNTRIES[s.nationality]?.flag} {s.note ?? s.club}</span>
        {ph && <a className="stk-credit" href={ph.page} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>📷 {ph.author} · {ph.license}</a>}
      </figcaption>
    </figure>
  );
}

export function Album() {
  const [a, setA] = useState<AlbumState | null>(null);
  const [opened, setOpened] = useState<Sticker[]>([]);
  const [flip, setFlip] = useState(0);
  const [filter, setFilter] = useState<"all" | "missing">("all");
  const [confetti, setConfetti] = useState(0);
  const [fly, setFly] = useState<{ s: Sticker; from: DOMRect; to?: DOMRect } | null>(null);
  const [just, setJust] = useState<string | null>(null);
  const slots = useRef(new Map<string, HTMLElement>());
  useEffect(() => { setA(loadAlbum()); }, []);
  if (!a) return null;

  const pasted = new Set(a.pasted);
  const toPaste = [...new Set(a.tray.filter((id) => !pasted.has(id)))].map((id) => stickerOf(id)!).filter(Boolean);
  const repCount = a.tray.length - toPaste.length;
  const count = (r: Sticker["rarity"]) => [STICKERS.filter((s) => s.rarity === r && pasted.has(s.id)).length, STICKERS.filter((s) => s.rarity === r).length];

  const openOne = () => {
    const got = openPack();
    if (!got.length) return;
    play("win");
    if (got.some((s) => s.rarity !== "comun")) setConfetti((n) => n + 1);
    setOpened(got); setFlip(0); setA(loadAlbum());
    got.forEach((_, i) => setTimeout(() => { setFlip(i + 1); play(got[i].rarity === "comun" ? "flip" : "hit"); }, 450 + i * 550));
  };

  /** Pegado con animación: la figurita vuela desde la pila hasta su lugar. */
  const stick = (s: Sticker, fromEl?: HTMLElement | null) => {
    const slot = slots.current.get(s.id);
    if (!slot || fly) return;
    if (filter === "missing") setFilter("all");
    const from = (fromEl ?? slot).getBoundingClientRect();
    slot.scrollIntoView({ behavior: "smooth", block: "center" });
    setFly({ s, from });
    setTimeout(() => setFly({ s, from, to: slot.getBoundingClientRect() }), 520);
    setTimeout(() => {
      if (paste(s.id)) { play("hit"); setJust(s.id); setTimeout(() => setJust(null), 900); }
      setFly(null); setA(loadAlbum());
      if (STICKERS.every((x) => loadAlbum().pasted.includes(x.id))) setConfetti((n) => n + 1);
    }, 1250);
  };

  const [comun, comunT] = count("comun"), [esp, espT] = count("especial"), [ley, leyT] = count("leyenda");
  return (
    <>
      <Confetti fire={confetti} />
      <section className="card album-top">
        <div className="album-progress">
          <b>{pasted.size}</b>/{STICKERS.length} pegadas
          <div className="album-bar"><span style={{ width: `${(pasted.size / STICKERS.length) * 100}%` }} /></div>
          <div className="album-rar"><span>⚪ Comunes {comun}/{comunT}</span><span className="r-esp">✨ Estrellas {esp}/{espT}</span><span className="r-ley">👑 Leyendas {ley}/{leyT}</span></div>
        </div>
        {a.packs.length > 0 ? (
          <button className="btn btn-primary big-cta pack-btn" onClick={openOne}>🎁 Abrir sobre ({a.packs.length} {a.packs.length === 1 ? "pendiente" : "pendientes"})</button>
        ) : (
          <p className="muted small" style={{ margin: 0 }}>Terminá los retos del día para ganar sobres: 3 figuritas si ganás, 1 si no. Son gratis: no se venden.</p>
        )}
        {opened.length > 0 && (
          <div className="pack-open">
            {opened.map((s, i) => (
              <div key={s.id + i} className={`pack-card ${i < flip ? "shown" : ""}`}>
                <div className="pack-back">FdP</div>
                <Face s={s} className="pack-front" />
              </div>
            ))}
          </div>
        )}
      </section>

      {toPaste.length > 0 && (
        <section className="card tray">
          <h2 style={{ margin: 0 }}>Para pegar ({toPaste.length})</h2>
          <p className="muted small" style={{ margin: "2px 0 8px" }}>Tocá una figurita y se pega sola en su lugar, o buscá su hueco en el álbum.</p>
          <div className="tray-row">
            {toPaste.map((s) => (
              <button key={s.id} className="tray-item" onClick={(e) => stick(s, e.currentTarget)} disabled={!!fly} aria-label={`Pegar a ${s.name}`}>
                <Face s={s} className={fly?.s.id === s.id ? "lifting" : ""} />
              </button>
            ))}
          </div>
        </section>
      )}
      {repCount > 0 && <p className="muted small">🔁 Tenés {repCount} {repCount === 1 ? "repetida" : "repetidas"}: más adelante se van a poder cambiar.</p>}

      <div className="album-filters">
        <button className={`chip-btn ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>Todo el álbum</button>
        <button className={`chip-btn ${filter === "missing" ? "on" : ""}`} onClick={() => setFilter("missing")}>Me faltan</button>
        {SECTION_ORDER.map((sec) => <a key={sec} className="chip-btn" href={`#sec-${sec.replace(/\s/g, "-")}`}>{sec}</a>)}
      </div>

      {SECTION_ORDER.map((sec) => {
        const list = STICKERS.filter((s) => s.section === sec && (filter === "all" || !pasted.has(s.id)));
        if (!list.length) return null;
        const done = STICKERS.filter((s) => s.section === sec && pasted.has(s.id)).length, total = STICKERS.filter((s) => s.section === sec).length;
        return (
          <section key={sec} className="album-page" id={`sec-${sec.replace(/\s/g, "-")}`}>
            <h3 className="album-page-title">{sec} <span className="muted small">{done}/{total}</span></h3>
            <div className="album-grid">
              {list.map((s) => {
                const isPasted = pasted.has(s.id);
                const canPaste = !isPasted && a.tray.includes(s.id);
                return (
                  <div key={s.id} ref={(el) => { if (el) slots.current.set(s.id, el); }} className={`slot-wrap ${just === s.id ? "just" : ""}`}>
                    {isPasted ? <Face s={s} /> : (
                      <button className={`stk missing slot-${s.rarity} ${canPaste ? "can" : ""}`} onClick={() => canPaste && stick(s)} disabled={!canPaste}>
                        <span className="stk-n">{s.n}</span>
                        <span className="stk-q">{s.n}</span>
                        <span className="slot-name">{s.name}</span>
                        {canPaste && <span className="slot-hint">¡La tenés! Tocá para pegar</span>}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      <p className="muted small">Fotos libres de Wikimedia Commons; el autor y la licencia figuran en cada figurita.</p>

      {fly && (
        <div className="fly" style={{
          left: fly.from.left, top: fly.from.top, width: fly.from.width,
          transform: fly.to ? `translate(${fly.to.left - fly.from.left}px, ${fly.to.top - fly.from.top}px) scale(${fly.to.width / fly.from.width}) rotate(0deg)` : "translateY(-24px) scale(1.12) rotate(-6deg)",
          transition: fly.to ? "transform .7s cubic-bezier(.3,.1,.2,1)" : "transform .35s ease-out",
        }}>
          <Face s={fly.s} />
        </div>
      )}
    </>
  );
}

/** Aviso de sobres pendientes o figuritas para pegar, para el encabezado. */
export function PackBadge() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => { const a = loadAlbum(); const p = new Set(a.pasted); setN(a.packs.length + new Set(a.tray.filter((id) => !p.has(id))).size); };
    sync();
    window.addEventListener("primera:album", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("primera:album", sync); window.removeEventListener("storage", sync); };
  }, []);
  return n ? <span className="pack-badge" aria-label={`${n} sobres o figuritas para pegar`}>🎁 {n}</span> : null;
}
