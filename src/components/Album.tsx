"use client";
import { useEffect, useState } from "react";
import { loadAlbum, openPack, STICKERS, type AlbumState, type Sticker } from "@/lib/album";
import { photoOf } from "@/lib/game/bios";
import { COUNTRIES } from "@/lib/game/meta";
import { play } from "@/lib/sound";
import { Crest } from "./art/Crest";
import { Confetti } from "./Confetti";

function Card({ s, count, fresh }: { s: Sticker; count: number; fresh?: boolean }) {
  const ph = photoOf(s.id);
  const [bad, setBad] = useState(false);
  if (!count) return <div className="stk missing"><span className="stk-n">{s.n}</span><span className="stk-q">?</span></div>;
  return (
    <figure className={`stk ${fresh ? "fresh" : ""}`} title={ph ? `Foto: ${ph.author} · ${ph.license}` : s.name}>
      <span className="stk-n">{s.n}</span>
      {ph && !bad ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ph.url} alt={s.name} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} />
      ) : <span className="stk-crest"><Crest club={s.club} size={48} /></span>}
      <figcaption>
        <b>{s.name}</b>
        <span>{COUNTRIES[s.nationality]?.flag} {s.club}</span>
        {ph && <a className="stk-credit" href={ph.page} target="_blank" rel="noopener noreferrer">📷 {ph.author} · {ph.license}</a>}
      </figcaption>
      {count > 1 && <span className="stk-rep">×{count}</span>}
    </figure>
  );
}

export function Album() {
  const [a, setA] = useState<AlbumState | null>(null);
  const [opened, setOpened] = useState<Sticker[]>([]);
  const [filter, setFilter] = useState<"all" | "have" | "missing" | "reps">("all");
  const [confetti, setConfetti] = useState(0);
  useEffect(() => { setA(loadAlbum()); }, []);
  if (!a) return null;
  const have = Object.keys(a.have).length;
  const open = () => {
    const got = openPack();
    if (!got.length) return;
    play("win"); setConfetti((n) => n + 1);
    setOpened(got); setA(loadAlbum());
  };
  const list = STICKERS.filter((s) => filter === "all" || (filter === "have" ? a.have[s.id] : filter === "missing" ? !a.have[s.id] : (a.have[s.id] ?? 0) > 1));
  return (
    <>
      <Confetti fire={confetti} />
      <section className="card album-top">
        <div className="album-progress">
          <b>{have}</b>/{STICKERS.length} figuritas
          <div className="album-bar"><span style={{ width: `${(have / STICKERS.length) * 100}%` }} /></div>
        </div>
        {a.packs.length > 0 ? (
          <button className="btn btn-primary big-cta pack-btn" onClick={open}>🎁 Abrir sobre ({a.packs.length} {a.packs.length === 1 ? "pendiente" : "pendientes"})</button>
        ) : (
          <p className="muted small" style={{ margin: 0 }}>Terminá los retos del día para ganar sobres: 3 figuritas si ganás, 1 si no. Son gratis: no se venden.</p>
        )}
        {opened.length > 0 && (
          <div className="pack-open">
            {opened.map((s, i) => <Card key={s.id + i} s={s} count={a.have[s.id] ?? 1} fresh />)}
          </div>
        )}
      </section>
      <div className="album-filters">
        {([["all", "Todas"], ["have", "Tengo"], ["missing", "Me faltan"], ["reps", "Repetidas"]] as const).map(([f, l]) => (
          <button key={f} className={`chip-btn ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{l}</button>
        ))}
      </div>
      <div className="album-grid">
        {list.map((s) => <Card key={s.id} s={s} count={a.have[s.id] ?? 0} />)}
      </div>
      <p className="muted small">Fotos libres de Wikimedia Commons; el autor y la licencia figuran en cada figurita.</p>
    </>
  );
}

/** Aviso de sobres pendientes para el encabezado. */
export function PackBadge() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => setN(loadAlbum().packs.length);
    sync();
    window.addEventListener("primera:album", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("primera:album", sync); window.removeEventListener("storage", sync); };
  }, []);
  return n ? <span className="pack-badge" aria-label={`${n} sobres para abrir`}>🎁 {n}</span> : null;
}
