"use client";
import { useEffect, useMemo, useState } from "react";
import {
  applyEffect, newCareer, playMatch, repToBonus, rivalFor, ROLE_OF, SEASON_LEN, skipInjured, startChance,
  startingOffers, startNextSeason, timingZone, type CareerState,
} from "@/lib/career/engine";
import type { Moment } from "@/lib/career/engine";
import { CAREER_COUNTRIES, NATIONAL, TIERS, tierOf } from "@/lib/career/clubs";
import { EVENTS, type Effect } from "@/lib/career/events";
import { POSITIONS, COUNTRIES } from "@/lib/game/meta";
import { dateKey } from "@/lib/game/daily";
import { loadProfile } from "@/lib/progress";
import { read, write } from "@/lib/storage";
import { clubStyle } from "@/lib/clubs";
import { play } from "@/lib/sound";
import { Crest } from "../art/Crest";
import { Kit } from "../art/Kit";
import { Confetti } from "../Confetti";
import { CareerCard } from "./CareerCard";
import { TimingMoment, TriviaMoment } from "./Moments";

const KEY = "career";
const POS_OPTS = ["ARQ", "DFC", "LAT", "MC", "MCO", "EXT", "DC"];

export function CareerApp() {
  const [s, setS] = useState<CareerState | null | undefined>(undefined);
  useEffect(() => setS(read<CareerState | null>(KEY, null)), []);
  const save = (n: CareerState | null) => {
    setS(n);
    write(KEY, n);
  };
  if (s === undefined) return <div className="card muted" style={{ marginTop: 24 }}>Cargando tu carrera…</div>;
  if (!s) return <Create onCreate={save} />;
  return <Hub s={s} save={save} />;
}

/* ---------------- Creación ---------------- */

function Create({ onCreate }: { onCreate: (s: CareerState) => void }) {
  const [rep, setRep] = useState(0);
  const [name, setName] = useState("");
  const [nat, setNat] = useState("ARG");
  const [pos, setPos] = useState("DC");
  const [num, setNum] = useState(9);
  const [age, setAge] = useState(18);
  const [offers, setOffers] = useState<string[]>([]);
  const [club, setClub] = useState<string | null>(null);

  useEffect(() => {
    const r = loadProfile().reputation;
    setRep(r);
    setOffers(startingOffers(r, Math.random));
  }, []);

  const bonus = repToBonus(rep);
  const ready = name.trim().length >= 2 && club;

  return (
    <div className="career-create">
      <h1 className="hero-title" style={{ fontSize: "clamp(28px,7vw,44px)" }}>Modo <span className="hl">Carrera</span></h1>
      <p className="lead">Creá tu jugador, elegí dónde debutar y tomá las decisiones de toda tu carrera. En cada partido, tu conocimiento de fútbol define las jugadas.</p>

      <div className="rep-note">
        <span className="rep-big">⭐ {rep}</span>
        <span>
          Tu reputación de los retos diarios te da <b>+{bonus} de nivel inicial</b>
          {rep >= 80 ? " y pruebas en clubes de Primera" : ". Jugá los retos para abrir mejores pruebas"}.
        </span>
      </div>

      <section className="create-step">
        <h2>1 · Tu nombre</h2>
        <input id="career-name" className="input" maxLength={24} placeholder="Ej.: Tomás Benítez" value={name} onChange={(e) => setName(e.target.value)} />
      </section>

      <section className="create-step">
        <h2>2 · Nacionalidad</h2>
        <div className="chips">
          {CAREER_COUNTRIES.map((c) => (
            <button key={c.code} className={`chip-btn ${nat === c.code ? "on" : ""}`} onClick={() => { play("click"); setNat(c.code); }}>
              {c.flag} {c.name}
            </button>
          ))}
        </div>
      </section>

      <section className="create-step">
        <h2>3 · Puesto</h2>
        <div className="chips">
          {POS_OPTS.map((p) => (
            <button key={p} className={`chip-btn ${pos === p ? "on" : ""}`} onClick={() => { play("click"); setPos(p); }}>
              <b>{p}</b> {POSITIONS[p].label}
            </button>
          ))}
        </div>
      </section>

      <section className="create-step two">
        <div>
          <h2>4 · Dorsal</h2>
          <div className="dorsal">
            <button className="btn" onClick={() => setNum((n) => Math.max(1, n - 1))} aria-label="Bajar dorsal">−</button>
            <Kit club={club ?? ""} label={num} size={84} hidden={!club} />
            <button className="btn" onClick={() => setNum((n) => Math.min(99, n + 1))} aria-label="Subir dorsal">+</button>
          </div>
        </div>
        <div>
          <h2>5 · Edad</h2>
          <div className="chips">
            {[17, 18, 19].map((a) => (
              <button key={a} className={`chip-btn ${age === a ? "on" : ""}`} onClick={() => { play("click"); setAge(a); }}>{a} años</button>
            ))}
          </div>
        </div>
      </section>

      <section className="create-step">
        <h2>6 · ¿Dónde debutás?</h2>
        <div className="offers">
          {offers.map((c) => (
            <button key={c} className={`offer ${club === c ? "on" : ""}`} onClick={() => { play("click"); setClub(c); }}>
              <Crest club={c} size={46} />
              <span className="offer-name">{c}</span>
              <span className="muted small">{TIERS[tierOf(c)].label}</span>
            </button>
          ))}
        </div>
      </section>

      <button
        className="btn btn-primary big-cta"
        disabled={!ready}
        onClick={() => {
          play("win");
          onCreate(newCareer({ name, nationality: nat, position: pos, number: num, age, club: club!, repBonus: bonus }));
        }}
      >
        Firmar mi primer contrato ✍️
      </button>
    </div>
  );
}

/* ---------------- Centro de la carrera ---------------- */

function Bar({ label, v, icon }: { label: string; v: number; icon: string }) {
  return (
    <div className="stat-bar">
      <span className="sb-label">{icon} {label}</span>
      <span className="sb-track"><span style={{ width: `${v}%` }} className={v < 35 ? "low" : v > 70 ? "high" : ""} /></span>
      <span className="sb-v">{Math.round(v)}</span>
    </div>
  );
}

function Hub({ s, save }: { s: CareerState; save: (s: CareerState | null) => void }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [wonToday, setWonToday] = useState(false);
  useEffect(() => {
    const r = loadProfile().results[dateKey()] ?? {};
    setWonToday(Object.values(r).some((p) => (p ?? 0) > 0));
  }, []);
  const today = dateKey();
  const canBonus = wonToday && s.bonusDay !== today && s.phase !== "retired";
  const cs = clubStyle(s.club);

  return (
    <div className="career">
      <section className="career-head" style={{ "--club": cs.colors[0].toUpperCase() === "#FFFFFF" ? cs.colors[1] : cs.colors[0] } as React.CSSProperties}>
        <Kit club={s.club} label={s.number} size={88} />
        <div className="ch-main">
          <div className="ch-name">{s.name}</div>
          <div className="ch-sub">
            <Crest club={s.club} size={22} /> {cs.short} · {POSITIONS[s.position]?.label} · {COUNTRIES[s.nationality]?.flag ?? ""} · {s.age} años
          </div>
          <div className="ch-season">Temporada {s.season} · Fecha {Math.min(s.week + 1, SEASON_LEN)}/{SEASON_LEN} · {s.points} pts</div>
        </div>
        <div className="ovr"><b>{s.ovr}</b><span>NIVEL</span></div>
      </section>

      <div className="bars">
        <Bar label="Forma" v={s.form} icon="💪" />
        <Bar label="Confianza DT" v={s.confidence} icon="🧢" />
        <Bar label="Fama" v={s.fame} icon="📣" />
      </div>
      <div className="career-mini">
        <span>⚽ {s.totals.goals} gol{s.totals.goals === 1 ? "" : "es"}</span>
        <span>🅰️ {s.totals.assists}</span>
        <span>🏟️ {s.totals.pj} PJ</span>
        <span>🏆 {s.trophies.length}</span>
        <span>💰 {s.money} mil USD</span>
        {s.caps > 0 && <span>{COUNTRIES[s.nationality]?.flag} {s.caps} partidos</span>}
      </div>

      {canBonus && (
        <button
          className="bonus"
          onClick={() => {
            play("hit");
            save({ ...applyEffect(s, { ovr: 1, form: 5, text: "Entrenamiento especial desbloqueado por tus retos de hoy: +1 de nivel." }), bonusDay: today });
          }}
        >
          ⚡ <b>Entrenamiento especial</b> · desbloqueado por ganar un reto diario hoy (+1 nivel)
        </button>
      )}

      {s.phase === "event" && <EventStep s={s} save={save} />}
      {s.phase === "match" && <MatchStep s={s} save={save} />}
      {s.phase === "season-end" && <SeasonEnd s={s} save={save} />}
      {s.phase === "retired" && <Retired s={s} save={save} />}

      {s.history.length > 0 && (
        <details className="history">
          <summary>Historial de temporadas</summary>
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Año</th><th className="name">Club</th><th>PJ</th><th>G</th><th>A</th><th>Nota</th><th>Pos.</th></tr></thead>
              <tbody>
                {s.history.map((h) => (
                  <tr key={h.season}>
                    <td>{h.year}</td>
                    <td className="name"><Crest club={h.club} size={18} /> {clubStyle(h.club).short} {h.title && "🏆"}</td>
                    <td>{h.pj}</td><td>{h.goals}</td><td>{h.assists}</td><td>{h.avg}</td><td>{h.place}º</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {s.phase !== "retired" && (
        <div className="row" style={{ marginTop: 14 }}>
          {confirmReset ? (
            <>
              <span className="small">¿Borrar esta carrera y empezar otra?</span>
              <button className="btn" style={{ borderColor: "var(--danger)", color: "var(--danger)" }} onClick={() => save(null)}>Sí, borrar</button>
              <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>Cancelar</button>
            </>
          ) : (
            <button className="btn btn-ghost small" style={{ color: "var(--muted)" }} onClick={() => setConfirmReset(true)}>Empezar otra carrera</button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Evento entre partidos ---------------- */

function EventStep({ s, save }: { s: CareerState; save: (s: CareerState) => void }) {
  const [effect, setEffect] = useState<Effect | null>(null);
  const [next, setNext] = useState<CareerState | null>(null);
  if (s.pendingEvent === "debut") {
    return (
      <section className="event card">
        <div className="event-icon">🏟️</div>
        <h2>¡Te citaron!</h2>
        <p>El DT de {s.club} te incluye en la lista para la primera fecha. Tu familia ya sacó entradas.</p>
        <button className="btn btn-primary big-cta" onClick={() => { play("kick"); save({ ...s, phase: "match", pendingEvent: undefined }); }}>Ir al partido →</button>
      </section>
    );
  }
  const ev = EVENTS.find((e) => e.id === s.pendingEvent) ?? EVENTS[0];
  if (effect && next) {
    return (
      <section className="event card">
        <div className="event-icon">{ev.icon}</div>
        <h2>{ev.title}</h2>
        <p className="effect-text">{effect.text}</p>
        <div className="effect-chips">
          {effect.ovr ? <span className={`ef ${effect.ovr > 0 ? "up" : "down"}`}>Nivel {effect.ovr > 0 ? "+" : ""}{effect.ovr}</span> : null}
          {effect.form ? <span className={`ef ${effect.form > 0 ? "up" : "down"}`}>Forma {effect.form > 0 ? "▲" : "▼"}</span> : null}
          {effect.confidence ? <span className={`ef ${effect.confidence > 0 ? "up" : "down"}`}>Confianza {effect.confidence > 0 ? "▲" : "▼"}</span> : null}
          {effect.fame ? <span className={`ef ${effect.fame > 0 ? "up" : "down"}`}>Fama {effect.fame > 0 ? "▲" : "▼"}</span> : null}
          {effect.injury ? <span className="ef down">🩹 {effect.injury} fecha{effect.injury > 1 ? "s" : ""} afuera</span> : null}
        </div>
        <button className="btn btn-primary big-cta" onClick={() => { play("kick"); save({ ...next, phase: "match", pendingEvent: undefined }); }}>Ir al partido →</button>
      </section>
    );
  }
  return (
    <section className="event card">
      <div className="event-icon">{ev.icon}</div>
      <h2>{ev.title}</h2>
      <p>{ev.body(s)}</p>
      <div className="choices">
        {ev.choices.map((c, i) => (
          <button
            key={i}
            className="btn choice"
            onClick={() => {
              play("click");
              const e = c.resolve(s, Math.random);
              setEffect(e);
              setNext(applyEffect(s, e));
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Partido ---------------- */

function MatchStep({ s, save }: { s: CareerState; save: (s: CareerState) => void }) {
  const role = ROLE_OF[s.position] ?? "MED";
  const rival = useMemo(() => rivalFor(s, Math.random), [s.week, s.season]); // eslint-disable-line react-hooks/exhaustive-deps
  const [started] = useState(() => Math.random() < startChance(s));
  const plan = useMemo<("timing" | "trivia")[]>(() => {
    const n = started ? 2 : 1;
    const first = Math.random() < 0.5 ? "timing" : "trivia";
    return Array.from({ length: n }, (_, i) => (i === 0 ? first : first === "timing" ? "trivia" : "timing"));
  }, [started]);
  const [phase, setPhase] = useState<"pre" | "play" | "post">("pre");
  const [results, setResults] = useState<Moment[]>([]);
  const [after, setAfter] = useState<CareerState | null>(null);
  const [confetti, setConfetti] = useState(0);

  const injured = s.injury > 0;
  const done = (ok: boolean) => {
    const r = [...results, { kind: plan[results.length], ok }];
    setResults(r);
    if (r.length >= plan.length) {
      const n = playMatch(s, r, started, rival, Math.random);
      setAfter(n);
      setPhase("post");
      const m = n.lastMatch!;
      if (m.gf > m.ga) { play("win"); setConfetti((x) => x + 1); } else if (m.gf < m.ga) play("lose"); else play("flip");
    }
  };

  if (phase === "post" && after?.lastMatch) {
    const m = after.lastMatch;
    return (
      <section className="match card">
        <Confetti fire={confetti} />
        <div className="scoreboard">
          <div className="sb-team"><Crest club={s.club} size={48} /><span>{clubStyle(s.club).short}</span></div>
          <div className="sb-score">{m.gf} <span>-</span> {m.ga}</div>
          <div className="sb-team"><Crest club={rival} size={48} /><span>{clubStyle(rival).short}</span></div>
        </div>
        <p className="match-note">{m.gf > m.ga ? "¡Victoria!" : m.gf === m.ga ? "Empate" : "Derrota"} · {m.note}</p>
        <div className="reward">
          <div><b>{m.rating}</b><small>tu nota</small></div>
          <div><b>{m.goals}</b><small>{m.goals === 1 ? "gol" : "goles"}</small></div>
          <div><b>{m.assists}</b><small>{m.assists === 1 ? "asistencia" : "asistencias"}</small></div>
        </div>
        <p className="muted small">{m.started ? "Fuiste titular." : "Entraste desde el banco."} Jugadas ganadas: {results.filter((x) => x.ok).length}/{results.length}</p>
        <button className="btn btn-primary big-cta" onClick={() => { play("click"); save(after); }}>
          {after.phase === "season-end" || after.phase === "retired" ? "Ver cierre de temporada →" : "Seguir →"}
        </button>
      </section>
    );
  }

  if (injured) {
    return (
      <section className="match card">
        <h2>🩹 Estás lesionado</h2>
        <p>Te quedan {s.injury} fecha{s.injury > 1 ? "s" : ""} de recuperación. El equipo juega contra {rival}.</p>
        <button className="btn btn-primary big-cta" onClick={() => save(skipInjured(s, rival, Math.random))}>Ver el partido desde la tribuna →</button>
      </section>
    );
  }

  if (phase === "pre") {
    return (
      <section className="match card">
        <p className="muted small" style={{ margin: 0 }}>Fecha {s.week + 1} · {TIERS[tierOf(s.club)].label}</p>
        <div className="scoreboard">
          <div className="sb-team"><Crest club={s.club} size={56} /><span>{clubStyle(s.club).short}</span></div>
          <div className="sb-vs">VS</div>
          <div className="sb-team"><Crest club={rival} size={56} /><span>{clubStyle(rival).short}</span></div>
        </div>
        <p className={`starter ${started ? "yes" : "no"}`}>{started ? "✅ Sos titular: vas a tener 2 jugadas." : "🪑 Arrancás en el banco: vas a tener 1 jugada."}</p>
        <button className="btn btn-primary big-cta" onClick={() => { play("whistle"); setTimeout(() => setPhase("play"), 50); }}>¡Que ruede la pelota! 🟢</button>
      </section>
    );
  }

  const kind = plan[results.length];
  return (
    <section className="match card">
      <div className="moment-progress">
        {plan.map((_, i) => <span key={i} className={i < results.length ? (results[i].ok ? "ok" : "bad") : i === results.length ? "cur" : ""} />)}
        <span className="muted small">Jugada {results.length + 1}/{plan.length} · min {Math.round(((results.length + 1) / (plan.length + 1)) * 90)}&apos;</span>
      </div>
      {kind === "timing" ? (
        <TimingMoment key={results.length} role={role} zone={timingZone(s)} speed={0.8 + tierOf(rival) * 0.15} onDone={done} />
      ) : (
        <TriviaMoment key={results.length} onDone={done} />
      )}
    </section>
  );
}

/* ---------------- Fin de temporada ---------------- */

function SeasonEnd({ s, save }: { s: CareerState; save: (s: CareerState) => void }) {
  const h = s.history[s.history.length - 1];
  const [confetti] = useState(h?.title ? 1 : 0);
  useEffect(() => { if (h?.title) play("win"); }, [h?.title]);
  return (
    <section className="event card">
      <Confetti fire={confetti} />
      <div className="event-icon">{h?.title ? "🏆" : "📊"}</div>
      <h2>Fin de la temporada {s.season}</h2>
      {h?.title && <p className="title-won">{h.title}</p>}
      <div className="reward">
        <div><b>{h?.place}º</b><small>posición</small></div>
        <div><b>{h?.goals}</b><small>goles</small></div>
        <div><b>{h?.avg}</b><small>nota media</small></div>
      </div>
      {s.log[0]?.startsWith("Convocado") && <p className="notice">🎽 {s.log[0]}</p>}
      <p>Cumpliste {s.age} años. Tu nivel ahora es <b>{s.ovr}</b>.</p>
      <h3 className="offers-title">Ofertas para la próxima temporada</h3>
      <div className="offers">
        <button className="offer on" onClick={() => { play("click"); save(startNextSeason(s, null, Math.random)); }}>
          <Crest club={s.club} size={46} />
          <span className="offer-name">Quedarme en {clubStyle(s.club).short}</span>
          <span className="muted small">Más confianza del DT</span>
        </button>
        {(s.offers ?? []).map((c) => (
          <button key={c} className="offer" onClick={() => { play("win"); save(startNextSeason(s, c, Math.random)); }}>
            <Crest club={c} size={46} />
            <span className="offer-name">{c}</span>
            <span className="muted small">{TIERS[tierOf(c)].label} · {TIERS[tierOf(c)].salary} mil/fecha</span>
          </button>
        ))}
      </div>
      {s.age >= 30 && (
        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => { play("lose"); save({ ...s, phase: "retired" }); }}>
          Colgar los botines 👟
        </button>
      )}
    </section>
  );
}

function Retired({ s, save }: { s: CareerState; save: (s: CareerState | null) => void }) {
  return (
    <section className="event card">
      <div className="event-icon">👟</div>
      <h2>Fin de una carrera</h2>
      <p>
        {s.totals.pj} partidos, {s.totals.goals} goles, {s.trophies.length} títulos
        {s.caps ? ` y ${s.caps} partidos con la ${NATIONAL[s.nationality] ?? "selección"}` : ""}.
      </p>
      {s.trophies.length > 0 && (
        <ul className="trophies">{s.trophies.map((t, i) => <li key={i}>🏆 {t}</li>)}</ul>
      )}
      <CareerCard s={s} />
      <button className="btn btn-primary big-cta" onClick={() => save(null)}>Empezar una nueva carrera</button>
    </section>
  );
}

