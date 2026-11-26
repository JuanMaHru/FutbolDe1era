"use client";
import { useEffect, useState } from "react";
import type { CareerState } from "@/lib/career/engine";
import { ACHIEVEMENTS, PERSONAL_IDS, TIER_LABEL, achievements } from "@/lib/career/awards";
import { read } from "@/lib/storage";
import { Badge } from "./Badge";
import { TrophyIcon } from "./Trophy";

const TITLES: [string, string, string][] = [
  ["Liga Profesional 2027", "Ligas", "Liga Profesional, Apertura, Clausura, LaLiga, Serie A, Brasileirão…"],
  ["Premier League 2027", "Premier League", "Plateada y con la corona arriba"],
  ["Bundesliga 2027", "Bundesliga", "La ensaladera: un plato de plata"],
  ["Copa Argentina 2027", "Copas nacionales", "Copa Argentina, FA Cup, Copa del Rey, Copa do Brasil…"],
  ["Copa Libertadores 2027", "Copa Libertadores", "La gloria eterna de Sudamérica"],
  ["Champions League 2027", "Champions League", "La orejona: el título de clubes más grande"],
  ["Copa Sudamericana 2027", "Otras copas continentales", "Sudamericana, Europa League, Concacaf, AFC"],
  ["Mundial 2030", "Mundial", "La Copa del Mundo con tu selección"],
  ["Copa América 2028", "Copa América", "El torneo de selecciones de América"],
  ["Eurocopa 2028", "Eurocopa", "El torneo de selecciones de Europa"],
  ["Ascenso a Liga Profesional 2027", "Ascenso", "Subir de categoría con tu club"],
  ["Supporters' Shield 2027", "Supporters' Shield", "Mejor equipo de la temporada regular de la MLS"],
  ["Mundial de Clubes 2029 (River Plate)", "Mundial de Clubes", "Cada 4 años, los mejores clubes del planeta"],
  ["Copa Intercontinental 2027", "Copa Intercontinental", "Los campeones continentales, por el título del mundo"],
  ["Recopa Sudamericana 2027", "Recopa y Supercopa de Europa", "Campeón de la copa principal contra el de la secundaria"],
  ["Supercopa Argentina 2027", "Supercopas nacionales", "Supercopa Argentina, Community Shield, Supercopa de España…"],
];
const AWARDS: [string, string, string][] = [
  ["Balón de Oro 2031", "Balón de Oro", "El mejor jugador del mundo del año"],
  ["Bota de Oro 2031", "Bota de Oro", "Máximo goleador de Europa (goles × dificultad de la liga)"],
  ["Goleador de la Premier League 2031", "Goleador del torneo", "Máximo goleador de tu liga"],
  ["Mejor jugador de la LaLiga 2031", "Mejor jugador de la liga", "La figura de la temporada en tu liga"],
  ["Guante de Oro de la Serie A 2031", "Guante de Oro", "Para arqueros con muchas vallas invictas"],
  ["Golden Boy 2028", "Golden Boy", "El mejor jugador joven (21 años o menos)"],
];

/** Catálogo de todo lo que se puede ganar en el Modo Carrera. */
export function Catalog() {
  const [got, setGot] = useState<Set<string> | null>(null);
  useEffect(() => {
    const s = read<CareerState | null>("career", null);
    if (s && s.v === 3) setGot(new Set(achievements(s).map((a) => a.id)));
  }, []);
  const tiers = ["leyenda", "oro", "plata", "bronce"] as const;
  return (
    <div className="catalog">
      <section>
        <h2 className="j-title">Títulos</h2>
        <div className="cat-grid">
          {TITLES.map(([n, t, d]) => <div key={t} className="cat-item"><TrophyIcon name={n} size={64} /><b>{t}</b><span className="muted small">{d}</span></div>)}
        </div>
      </section>
      <section>
        <h2 className="j-title">Premios individuales</h2>
        <div className="cat-grid">
          {AWARDS.map(([n, t, d]) => <div key={t} className="cat-item"><TrophyIcon name={n} size={64} /><b>{t}</b><span className="muted small">{d}</span></div>)}
        </div>
      </section>
      <section>
        <h2 className="j-title">Logros en la cancha · {ACHIEVEMENTS.filter((a) => !PERSONAL_IDS.has(a.id)).length}{got ? ` · tenés ${[...got].filter((id) => !PERSONAL_IDS.has(id)).length}` : ""}</h2>
        {tiers.map((tier) => (
          <div key={tier}>
            <p className={`cat-tier t-${tier}`}>{TIER_LABEL[tier]}</p>
            <div className="cat-grid">
              {ACHIEVEMENTS.filter((a) => a.tier === tier && !PERSONAL_IDS.has(a.id)).map((a) => (
                <div key={a.id} className={`cat-item ach-item tier-${tier} ${got && !got.has(a.id) ? "is-locked" : ""}`}>
                  <Badge icon={a.icon} tier={a.tier} size={64} locked={!!got && !got.has(a.id)} />
                  <b>{a.title}</b>
                  <span className="muted small">{a.how}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      <section>
        <h2 className="j-title">Logros por cómo fuiste · {PERSONAL_IDS.size}</h2>
        <p className="muted small" style={{ marginTop: -4 }}>Dependen de lo que decidas en los eventos entre partidos y en el mercado de pases.</p>
        <div className="cat-grid">
          {ACHIEVEMENTS.filter((a) => PERSONAL_IDS.has(a.id)).map((a) => (
            <div key={a.id} className={`cat-item ach-item tier-${a.tier} ${got && !got.has(a.id) ? "is-locked" : ""}`}>
              <Badge icon={a.icon} tier={a.tier} size={64} locked={!!got && !got.has(a.id)} />
              <b>{a.title}</b>
              <span className="muted small">{a.how}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
