"use client";
import { useEffect, useState } from "react";
import { efemerides } from "@/lib/efemerides";
import { photoOf } from "@/lib/game/bios";
import { Crest } from "./art/Crest";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function Face({ id, name }: { id: string; name: string }) {
  const ph = photoOf(id);
  const [bad, setBad] = useState(false);
  // eslint-disable-next-line @next/next/no-img-element
  if (ph && !bad) return <img className="ef-photo" src={ph.url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} />;
  return <span className="ef-photo ef-ini">{name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>;
}

/** "Hoy en el fútbol": cumpleaños, aniversarios de clubes y hechos históricos del día. */
export function Efemerides() {
  const [e, setE] = useState<ReturnType<typeof efemerides> | null>(null);
  useEffect(() => setE(efemerides()), []);
  if (!e) return null;
  const [mm, dd] = e.md.split("-").map(Number);
  const births = e.births.slice(0, 4);
  const empty = !births.length && !e.clubs.length && !e.events.length && !e.soon.length;
  if (empty) return null;
  return (
    <section className="card efem">
      <h2 className="efem-title">📅 Hoy en el fútbol <span className="muted small">· {dd} de {MESES[mm - 1]}</span></h2>
      {e.events.map((h, i) => (
        <div key={i} className={`ef-item ef-${h.kind}`}>
          <span className="ef-icon">{h.icon}</span>
          <div><b>{h.text}</b><span className="muted small">{h.year} · hace {h.ago} {h.ago === 1 ? "año" : "años"}</span></div>
        </div>
      ))}
      {births.length > 0 && (
        <div className="ef-births">
          <p className="ef-sub">🎂 Cumpleaños</p>
          <div className="ef-row">
            {births.map((b) => (
              <div key={b.id} className="ef-bday">
                <Face id={b.id} name={b.name} />
                <b>{b.name}</b>
                <span className="muted small">{b.age} años</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {e.clubs.map((c) => (
        <div key={c.club} className="ef-item">
          <span className="ef-icon"><Crest club={c.club} size={30} /></span>
          <div><b>{c.club} cumple {c.years} años</b><span className="muted small">Fundado el {Number(c.date.slice(8))} de {MESES[Number(c.date.slice(5, 7)) - 1]} de {c.date.slice(0, 4)}</span></div>
        </div>
      ))}
      {e.soon.length > 0 && (
        <>
          <p className="ef-sub">⏳ Se vienen</p>
          {e.soon.slice(0, 3).map((h, i) => (
            <div key={i} className="ef-item soon">
              <span className="ef-icon">{h.icon}</span>
              <div><b>{h.text}</b><span className="muted small">{h.year} · en {h.inDays} {h.inDays === 1 ? "día" : "días"}</span></div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
