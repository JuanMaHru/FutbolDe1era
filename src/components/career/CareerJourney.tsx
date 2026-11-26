"use client";
import { useEffect, useState } from "react";
import type { CareerState, SeasonLine } from "@/lib/career/engine";
import { role, talentOf } from "@/lib/career/engine";
import { ACHIEVEMENTS, achievements, TIER_LABEL } from "@/lib/career/awards";
import { LEAGUES, NATIONS, clubInfo } from "@/lib/career/world";
import { POSITIONS } from "@/lib/game/meta";
import { clubStyle } from "@/lib/clubs";
import { Crest } from "../art/Crest";
import { Kit } from "../art/Kit";
import { Badge } from "./Badge";
import { CareerCard } from "./CareerCard";
import { TrophyIcon } from "./Trophy";

const colorsOf = (club: string): [string, string] => {
  const c = clubStyle(club).colors;
  const a = c[0].toUpperCase() === "#FFFFFF" ? c[1] : c[0];
  return [a, c[1].toUpperCase() === a.toUpperCase() ? (c[2] ?? "#fff") : c[1]];
};

/** Número que cuenta desde 0 (animación corta; el valor final queda visible). */
function CountUp({ to, ms = 1200 }: { to: number; ms?: number }) {
  const [v, setV] = useState(to);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || to === 0) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    setV(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <>{v}</>;
}

interface Chapter { club: string; seasons: SeasonLine[] }
function chapters(h: SeasonLine[]): Chapter[] {
  const out: Chapter[] = [];
  h.forEach((s) => {
    const last = out[out.length - 1];
    if (last && last.club === s.club) last.seasons.push(s);
    else out.push({ club: s.club, seasons: [s] });
  });
  return out;
}

/** Recorrido visual de toda la carrera, al retirarse. */
export function CareerJourney({ s, demo = false }: { s: CareerState; demo?: boolean }) {
  const r = role(s);
  const defensive = r === "ARQ" || r === "DEF";
  const ach = achievements(s);
  const caps = chapters(s.history);
  const first = s.history[0]?.year ?? s.startYear;
  const last = s.history[s.history.length - 1]?.year ?? first;
  const peak = s.peakOvr ?? Math.max(s.ovr, ...s.history.map((h) => h.ovr ?? 0));
  const metric = (h: SeasonLine) => (defensive ? h.cleanSheets : h.goals);
  const maxMetric = Math.max(1, ...s.history.map(metric));
  const best = s.history.reduce((a, b) => (metric(b) > metric(a) ? b : a), s.history[0]);
  const t = talentOf(s);
  const [c1] = colorsOf(caps[caps.length - 1]?.club ?? s.club);

  const groups = new Map<string, string[]>();
  [...s.trophies, ...s.awards].forEach((x) => {
    const k = x.replace(/ \d{4}( \(.*\))?$/, "").replace(/ con .*$/, "").replace(/^(Ascenso a .*?) \d{4}.*$/, "$1");
    groups.set(k, [...(groups.get(k) ?? []), x]);
  });

  return (
    <div className="journey">
      {/* 1. Portada */}
      <section className="j-hero" style={{ "--club": c1 } as React.CSSProperties}>
        <p className="j-kicker">{demo ? "Ejemplo · " : ""}{first}–{last} · {s.history.length} temporadas</p>
        <h2 className="j-name">{s.nick ? `“${s.nick}”` : s.name}</h2>
        {s.nick && <p className="j-real">{s.name}</p>}
        <div className="j-kits">
          {caps.map((c, i) => <span key={i} className="j-kit" style={{ animationDelay: `${i * 120}ms` }}><Kit club={c.club} label={s.number} size={56} /></span>)}
        </div>
        <p className="j-sub">{NATIONS[s.nationality]?.flag} {POSITIONS[s.position]?.label} · nivel máximo <b>{peak}</b> · <span className="stars">{"★".repeat(t.stars)}</span> {t.name}</p>
      </section>

      {/* 2. Números */}
      <section className="j-numbers">
        <div><b><CountUp to={s.totals.pj} /></b><span>partidos</span></div>
        {defensive ? <div><b><CountUp to={s.totals.cleanSheets} /></b><span>vallas invictas</span></div> : <div><b><CountUp to={s.totals.goals} /></b><span>goles</span></div>}
        {r === "ARQ" ? <div><b><CountUp to={s.totals.penSaves} /></b><span>penales atajados</span></div> : <div><b><CountUp to={s.totals.assists} /></b><span>asistencias</span></div>}
        <div className="gold"><b><CountUp to={s.trophies.length} /></b><span>títulos</span></div>
        <div className="gold"><b><CountUp to={s.awards.length} /></b><span>premios</span></div>
        <div><b><CountUp to={s.caps} /></b><span>con {NATIONS[s.nationality]?.name ?? "la selección"}</span></div>
      </section>

      {/* 3. Recorrido por capítulos */}
      <section className="j-section">
        <h3 className="j-title">El recorrido</h3>
        <ol className="j-chapters">
          {caps.map((c, ci) => {
            const [a, b] = colorsOf(c.club);
            const tot = c.seasons.reduce((x, y) => ({ pj: x.pj + y.pj, g: x.g + y.goals, as: x.as + y.assists, cs: x.cs + y.cleanSheets }), { pj: 0, g: 0, as: 0, cs: 0 });
            const titles = c.seasons.flatMap((x) => x.titles);
            const lg = LEAGUES[clubInfo(c.club).league];
            return (
              <li key={ci} className="j-chapter" style={{ "--a": a, "--b": b, animationDelay: `${ci * 100}ms` } as React.CSSProperties}>
                <header className="j-ch-head">
                  <Crest club={c.club} size={54} />
                  <div>
                    <span className="j-ch-n">Capítulo {ci + 1}</span>
                    <b className="j-ch-club">{c.club}</b>
                    <span className="j-ch-meta">{c.seasons[0].year}{c.seasons.length > 1 ? `–${c.seasons[c.seasons.length - 1].year}` : ""} · {lg?.name} · {tot.pj} PJ · {defensive ? `${tot.cs} vallas` : `${tot.g} goles`}{!defensive ? ` · ${tot.as} asist.` : ""}</span>
                  </div>
                  {titles.length > 0 && <div className="j-ch-trophies">{titles.slice(0, 6).map((x, k) => <TrophyIcon key={k} name={x} size={26} />)}{titles.length > 6 && <span>+{titles.length - 6}</span>}</div>}
                </header>
                <ul className="j-seasons">
                  {c.seasons.map((h) => (
                    <li key={h.season} className={`j-season ${h.titles.length || h.awards.length ? "big" : ""}`}>
                      <div className="j-s-year"><b>{h.year}</b><span>{h.age ? `${h.age} años` : ""}</span></div>
                      <div className="j-s-body">
                        <div className="j-s-stats">
                          <span>{h.pj} PJ</span>
                          <span>{defensive ? `${h.cleanSheets} VI` : `${h.goals} G`}</span>
                          {!defensive && <span>{h.assists} A</span>}
                          <span>nota {h.avg}</span>
                          <span>{h.place}º en liga</span>
                          {h.ovr && <span>nivel {h.ovr}</span>}
                        </div>
                        {(h.titles.length > 0 || h.awards.length > 0) && (
                          <div className="j-s-trophies">{[...h.titles, ...h.awards].map((x) => <span key={x} className="j-trophy"><TrophyIcon name={x} size={22} /> {x.replace(/ \(.*\)$/, "")}</span>)}</div>
                        )}
                        {(h.highlights ?? []).filter((x) => !x.startsWith("🏆 Campeón:") && !x.startsWith("🏅")).slice(0, 5).map((x, k) => <p key={k} className="j-hl">{x}</p>)}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 4. Gráfico */}
      {s.history.length > 1 && (
        <section className="j-section">
          <h3 className="j-title">{defensive ? "Vallas invictas" : "Goles"} por temporada</h3>
          <div className="j-chart" role="img" aria-label={`Mejor temporada: ${best.year} con ${metric(best)}`}>
            {s.history.map((h) => {
              const [a] = colorsOf(h.club);
              return (
                <div key={h.season} className="j-bar-wrap" title={`${h.year} · ${h.club}: ${metric(h)}`}>
                  <span className="j-bar-v">{metric(h) || ""}</span>
                  <span className={`j-bar ${h === best ? "best" : ""}`} style={{ height: `${(metric(h) / maxMetric) * 100}%`, background: a }} />
                  <span className="j-bar-y">{String(h.year).slice(2)}</span>
                </div>
              );
            })}
          </div>
          <p className="muted small" style={{ margin: "6px 0 0" }}>Mejor temporada: <b>{best.year}</b> con {best.club} ({metric(best)} {defensive ? "vallas invictas" : "goles"}).</p>
        </section>
      )}

      {/* 5. Vitrina */}
      {groups.size > 0 && (
        <section className="j-section">
          <h3 className="j-title">La vitrina</h3>
          <div className="j-cabinet">
            {[...groups.entries()].map(([k, list], i) => (
              <div key={k} className="j-cup" style={{ animationDelay: `${i * 70}ms` }} title={list.join("\n")}>
                <TrophyIcon name={list[0]} size={60} />
                {list.length > 1 && <span className="j-cup-n">×{list.length}</span>}
                <span className="j-cup-name">{k}</span>
                <span className="j-cup-years">{list.map((x) => x.match(/\d{4}/)?.[0]).filter(Boolean).join(" · ")}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Logros */}
      <section className="j-section">
        <h3 className="j-title">Logros · {ach.length} de {ACHIEVEMENTS.length}</h3>
        {ach.length ? (
          <div className="j-achs">
            {ach.map((a, i) => (
              <div key={a.id} className={`j-ach tier-${a.tier}`} style={{ animationDelay: `${i * 90}ms` }}>
                <Badge icon={a.icon} tier={a.tier} size={78} />
                <span className="j-ach-tier">{TIER_LABEL[a.tier]}</span>
                <b>{a.title}</b>
                <span className="muted small">{a.desc}</span>
              </div>
            ))}
          </div>
        ) : <p className="muted">Esta vez no hubo logros. La próxima carrera puede ser distinta.</p>}
      </section>

      {/* 7. Ficha compacta */}
      <section className="j-section">
        <h3 className="j-title">Tu ficha para compartir</h3>
        <CareerCard s={s} achievements={ach.slice(0, 3).map((a) => `${a.icon} ${a.title}`)} />
      </section>
    </div>
  );
}
