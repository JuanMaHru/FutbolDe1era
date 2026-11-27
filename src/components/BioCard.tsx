"use client";
import { careerOf, photoOf } from "@/lib/game/bios";
import { yearsLabel } from "@/lib/game/careers";
import { Crest } from "./art/Crest";

/** Ficha al terminar: foto libre (con crédito), datos y trayectoria con escudos. */
export function BioCard({ id, name, subtitle, career = true }: { id: string; name: string; subtitle: string; career?: boolean }) {
  const photo = photoOf(id);
  const car = career ? careerOf(id) : [];
  return (
    <div className="bio">
      <div className="bio-head">
        {photo ? (
          <figure className="bio-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
            <figcaption><a href={photo.page} target="_blank" rel="noopener noreferrer">Foto: {photo.author} · {photo.license}</a></figcaption>
          </figure>
        ) : null}
        <div>
          <p className="bio-name">{name}</p>
          <p className="muted small" style={{ margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      {car.length > 0 && (
        <ol className="bio-career">
          {car.map((s, i) => (
            <li key={i}>
              <Crest club={s.club} size={22} />
              <span className="bio-club">{s.club}{s.loan ? " (préstamo)" : ""}</span>
              <span className="muted small">{yearsLabel(s)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
