"use client";
import { useEffect, useMemo, useState } from "react";
import * as E from "@/lib/career/engine";
import type { CareerState, Fixture, MatchResult, Moment, MomentKind } from "@/lib/career/engine";
import { CAREER_COUNTRIES, LEAGUES, NATIONS, clubInfo, startingOffers, strengthOf } from "@/lib/career/world";
import { eventById, resolveChoice, type Effect } from "@/lib/career/events";
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
import { MomentRunner, PenaltySave, PenaltyShoot } from "./Moments";

const KEY = "career";
const POS_OPTS = ["ARQ", "DFC", "LAT", "MC", "MCO", "EXT", "DC"];
const R = Math.random;

export function CareerApp() {
  const [s, setS] = useState<CareerState | null | undefined>(undefined);
  const [migrated, setMigrated] = useState(false);
  useEffect(() => {
    const saved = read<CareerState | { v: number } | null>(KEY, null);
    if (saved && saved.v !== 2) {
      setMigrated(true);
      setS(null);
    } else setS(saved as CareerState | null);
  }, []);
  const save = (n: CareerState | null) => {
    setS(n);
    write(KEY, n);
  };
  if (s === undefined) return <div className="card muted" style={{ marginTop: 24 }}>Cargando tu carrera…</div>;
  if (!s) return <Create onCreate={save} migrated={migrated} />;
  return <Hub s={s} save={save} />;
}

/* ================= Creación ================= */

function Create({ onCreate, migrated }: { onCreate: (s: CareerState) => void; migrated: boolean }) {
  const [rep, setRep] = useState(0);
  const [name, setName] = useState("");
  const [nick, setNick] = useState("");
  const [nat, setNat] = useState("ARG");
  const [pos, setPos] = useState("DC");
  const [arche, setArche] = useState(E.ARCHETYPES.DEL[0].id);
  const [foot, setFoot] = useState<CareerState["foot"]>("derecho");
  const [num, setNum] = useState(9);
  const [age, setAge] = useState(18);
  const [club, setClub] = useState<string | null>(null);
  const offers = useMemo(() => startingOffers(rep, nat, R), [rep, nat]);

  useEffect(() => setRep(loadProfile().reputation), []);
  useEffect(() => setClub(null), [nat]);
  const role = E.ROLE_OF[pos];
  useEffect(() => setArche(E.ARCHETYPES[role][0].id), [role]);

  const bonus = E.repToBonus(rep);
  const ready = name.trim().length >= 2 && club;

  return (
    <div className="career-create">
      <h1 className="hero-title" style={{ fontSize: "clamp(28px,7vw,44px)" }}>Modo <span className="hl">Carrera</span></h1>
      <p className="lead">Creá tu jugador y viví toda su carrera: liga, copas, torneos internacionales y la selección. En cada partido, tus decisiones y tu conocimiento definen las jugadas.</p>
      {migrated && <p className="notice">Actualizamos el Modo Carrera con copas, selecciones y nuevos minijuegos. Tu carrera anterior no es compatible: empezá una nueva.</p>}

      <div className="rep-note">
        <span className="rep-big">⭐ {rep}</span>
        <span>Tu reputación de los retos diarios te da <b>+{bonus} de nivel inicial</b>{rep >= 80 ? " y pruebas en clubes de Primera" : ". Jugá los retos para abrir mejores pruebas"}.</span>
      </div>

      <section className="create-step">
        <h2>1 · Tu nombre y apodo</h2>
        <div className="two-inputs">
          <input id="career-name" className="input" maxLength={24} placeholder="Nombre (ej.: Tomás Benítez)" value={name} onChange={(e) => setName(e.target.value)} />
          <input id="career-nick" className="input" maxLength={16} placeholder="Apodo (opcional, ej.: El Tanque)" value={nick} onChange={(e) => setNick(e.target.value)} />
        </div>
      </section>

      <section className="create-step">
        <h2>2 · Nacionalidad</h2>
        <div className="chips">
          {CAREER_COUNTRIES.map((c) => (
            <button key={c.code} className={`chip-btn ${nat === c.code ? "on" : ""}`} onClick={() => { play("click"); setNat(c.code); }}>{c.flag} {c.name}</button>
          ))}
        </div>
      </section>

      <section className="create-step">
        <h2>3 · Puesto</h2>
        <div className="chips">
          {POS_OPTS.map((p) => (
            <button key={p} className={`chip-btn ${pos === p ? "on" : ""}`} onClick={() => { play("click"); setPos(p); }}><b>{p}</b> {POSITIONS[p].label}</button>
          ))}
        </div>
      </section>

      <section className="create-step">
        <h2>4 · Tu estilo de juego</h2>
        <div className="arche-grid">
          {E.ARCHETYPES[role].map((a) => (
            <button key={a.id} className={`arche ${arche === a.id ? "on" : ""}`} onClick={() => { play("click"); setArche(a.id); }}>
              <b>{a.name}</b>
              <span className="muted small">{a.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="create-step two">
        <div>
          <h2>5 · Dorsal</h2>
          <div className="dorsal">
            <button className="btn" onClick={() => setNum((n) => Math.max(1, n - 1))} aria-label="Bajar dorsal">−</button>
            <Kit club={club ?? ""} label={num} size={84} hidden={!club} />
            <button className="btn" onClick={() => setNum((n) => Math.min(99, n + 1))} aria-label="Subir dorsal">+</button>
          </div>
        </div>
        <div>
          <h2>6 · Edad y pie</h2>
          <div className="chips">
            {[17, 18, 19].map((a) => <button key={a} className={`chip-btn ${age === a ? "on" : ""}`} onClick={() => { play("click"); setAge(a); }}>{a} años</button>)}
          </div>
          <div className="chips" style={{ marginTop: 6 }}>
            {(["derecho", "zurdo", "ambidiestro"] as const).map((f) => <button key={f} className={`chip-btn ${foot === f ? "on" : ""}`} onClick={() => { play("click"); setFoot(f); }}>🦶 {f}</button>)}
          </div>
        </div>
      </section>

      <section className="create-step">
        <h2>7 · ¿Dónde debutás?</h2>
        <div className="offers">
          {offers.map((c) => (
            <button key={c} className={`offer ${club === c ? "on" : ""}`} onClick={() => { play("click"); setClub(c); }}>
              <Crest club={c} size={46} />
              <span className="offer-name">{c}</span>
              <span className="muted small">{LEAGUES[clubInfo(c).league].name}</span>
            </button>
          ))}
        </div>
      </section>

      <button className="btn btn-primary big-cta" disabled={!ready} onClick={() => { play("win"); onCreate(E.newCareer({ name, nick, nationality: nat, position: pos, archetype: arche, foot, number: num, age, club: club!, repBonus: bonus })); }}>
        Firmar mi primer contrato ✍️
      </button>
    </div>
  );
}

/* ================= Centro de la carrera ================= */

function Bar({ label, v, icon }: { label: string; v: number; icon: string }) {
  return (
    <div className="stat-bar">
      <span className="sb-label">{icon} {label}</span>
      <span className="sb-track"><span style={{ width: `${v}%` }} className={v < 35 ? "low" : v > 70 ? "high" : ""} /></span>
      <span className="sb-v">{Math.round(v)}</span>
    </div>
  );
}

const COMP_ICON: Record<string, string> = { league: "🏟️", cup: "🏆", intl: "🌎", national: "🎽" };
const plural = (n: number, a: string, b: string) => `${n} ${n === 1 ? a : b}`;

function Hub({ s, save }: { s: CareerState; save: (s: CareerState | null) => void }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [wonToday, setWonToday] = useState(false);
  useEffect(() => {
    const r = loadProfile().results[dateKey()] ?? {};
    setWonToday(Object.values(r).some((p) => (p ?? 0) > 0));
  }, []);
  const today = dateKey();
  const canBonus = wonToday && s.bonusDay !== today && s.phase !== "retired";
  const team = E.myTeam(s);
  const cs = clubStyle(team);
  const r = E.role(s);
  const lg = E.leagueOfState(s);
  const arche = E.archetypeOf(s);
  const next = s.phase === "event" || s.phase === "match" || s.phase === "national" ? E.nextFixture(s.pendingEvent === "national-call" ? s : s) : null;

  return (
    <div className="career">
      <section className="career-head" style={{ "--club": cs.colors[0].toUpperCase() === "#FFFFFF" ? cs.colors[1] : cs.colors[0] } as React.CSSProperties}>
        <Kit club={team} label={s.number} size={88} />
        <div className="ch-main">
          <div className="ch-name">{s.nick ? `“${s.nick}”` : s.name}</div>
          {s.nick && <div className="ch-real">{s.name}</div>}
          <div className="ch-sub"><Crest club={s.club} size={20} /> {clubStyle(s.club).short} · {POSITIONS[s.position]?.label} · {COUNTRIES[s.nationality]?.flag ?? NATIONS[s.nationality]?.flag} · {s.age} años</div>
          <div className="ch-season">Temporada {s.season} ({E.currentYear(s)}) · {lg.name} · {arche.name}</div>
        </div>
        <div className="ovr"><b>{s.ovr}</b><span>NIVEL</span></div>
      </section>

      <div className="bars">
        <Bar label="Forma" v={s.form} icon="💪" />
        <Bar label="Confianza DT" v={s.confidence} icon="🧢" />
        <Bar label="Fama" v={s.fame} icon="📣" />
      </div>
      <div className="career-mini">
        <span>🏟️ {s.totals.pj} PJ</span>
        {r === "ARQ" ? <><span>🧤 {plural(s.totals.cleanSheets, "valla invicta", "vallas invictas")}</span><span>🥅 {plural(s.totals.penSaves, "penal atajado", "penales atajados")}</span></> : null}
        {r === "DEF" ? <><span>🛡️ {plural(s.totals.cleanSheets, "valla invicta", "vallas invictas")}</span><span>⚽ {plural(s.totals.goals, "gol", "goles")}</span></> : null}
        {r === "MED" ? <><span>🅰️ {plural(s.totals.assists, "asistencia", "asistencias")}</span><span>⚽ {plural(s.totals.goals, "gol", "goles")}</span></> : null}
        {r === "DEL" ? <><span>⚽ {plural(s.totals.goals, "gol", "goles")}</span><span>🅰️ {s.totals.assists}</span></> : null}
        <span>🏆 {s.trophies.length}</span>
        <span>💰 {s.money} mil USD</span>
        {s.caps > 0 && <span>{NATIONS[s.nationality]?.flag} {s.caps} PJ · {s.natGoals} G</span>}
      </div>

      {canBonus && (
        <button className="bonus" onClick={() => { play("hit"); save({ ...E.applyEffect(s, { ovr: 1, form: 5, text: "Entrenamiento especial desbloqueado por tus retos de hoy: +1 de nivel." }), bonusDay: today }); }}>
          ⚡ <b>Entrenamiento especial</b> · desbloqueado por ganar un reto diario hoy (+1 nivel)
        </button>
      )}

      {next && s.phase !== "national" && s.pendingEvent !== "national-call" && !s.national && (
        <div className="next-fx"><span>{COMP_ICON[next.fx.kind]}</span> Próximo: <b>{next.fx.comp}</b> · {next.fx.round}</div>
      )}

      {s.phase === "event" && <EventStep s={s} save={save} />}
      {(s.phase === "match" || s.phase === "national") && <MatchStep key={`${s.season}-${s.idx}-${s.national?.idx ?? ""}`} s={s} save={save} />}
      {s.phase === "season-end" && <SeasonEnd s={s} save={save} />}
      {s.phase === "retired" && <Retired s={s} save={save} />}

      {s.fixtures.some((f) => f.result) && s.phase !== "season-end" && (
        <details className="history" open={false}>
          <summary>Partidos de la temporada</summary>
          <ul className="fx-list">
            {s.fixtures.filter((f) => f.result).map((f, i) => <FxRow key={i} f={f} />)}
          </ul>
        </details>
      )}

      {s.history.length > 0 && (
        <details className="history">
          <summary>Historial de temporadas</summary>
          <div className="table-scroll">
            <table className="table">
              <thead><tr><th>Año</th><th className="name">Club</th><th>PJ</th><th>{r === "ARQ" || r === "DEF" ? "VI" : "G"}</th><th>{r === "ARQ" ? "G" : "A"}</th><th>Nota</th><th>Pos.</th></tr></thead>
              <tbody>
                {s.history.map((h) => (
                  <tr key={h.season}>
                    <td>{h.year}</td>
                    <td className="name"><Crest club={h.club} size={18} /> {clubStyle(h.club).short} {h.titles.length > 0 && "🏆".repeat(Math.min(3, h.titles.length))}</td>
                    <td>{h.pj}</td><td>{r === "ARQ" || r === "DEF" ? h.cleanSheets : h.goals}</td><td>{r === "ARQ" ? h.goals : h.assists}</td><td>{h.avg}</td><td>{h.place}º</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      {s.trophies.length > 0 && (
        <details className="history"><summary>Vitrina ({s.trophies.length})</summary><ul className="trophies">{s.trophies.map((t, i) => <li key={i}>🏆 {t}</li>)}</ul></details>
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

function FxRow({ f }: { f: Fixture }) {
  const r = f.result!;
  const won = r.gf > r.ga || (r.pens ? r.pens[0] > r.pens[1] : false);
  const draw = r.gf === r.ga && !r.pens;
  return (
    <li className={`fx ${won ? "w" : draw ? "d" : "l"}`}>
      <span className="fx-comp">{COMP_ICON[f.kind]} {f.round}</span>
      <span className="fx-rival"><Crest club={f.rival ?? ""} size={16} /> {clubStyle(f.rival ?? "").short}</span>
      <span className="fx-score">{r.gf}-{r.ga}{r.pens ? ` (${r.pens[0]}-${r.pens[1]})` : ""}</span>
      <span className="fx-rating">{r.played ? r.rating : "—"}</span>
    </li>
  );
}

/* ================= Evento entre partidos ================= */

function EffectChips({ e }: { e: Effect }) {
  const up = (v?: number) => (v ? (v > 0 ? "up" : "down") : "");
  return (
    <div className="effect-chips">
      {e.ovr ? <span className={`ef ${up(e.ovr)}`}>Nivel {e.ovr > 0 ? "+" : ""}{e.ovr}</span> : null}
      {e.form ? <span className={`ef ${up(e.form)}`}>Forma {e.form > 0 ? "▲" : "▼"}</span> : null}
      {e.confidence ? <span className={`ef ${up(e.confidence)}`}>Confianza {e.confidence > 0 ? "▲" : "▼"}</span> : null}
      {e.fame ? <span className={`ef ${up(e.fame)}`}>Fama {e.fame > 0 ? "▲" : "▼"}</span> : null}
      {e.money ? <span className={`ef ${up(e.money)}`}>💰 {e.money > 0 ? "+" : ""}{e.money} mil</span> : null}
      {e.salary ? <span className={`ef ${e.salary >= 1 ? "up" : "down"}`}>Sueldo {e.salary >= 1 ? "▲" : "▼"}</span> : null}
      {e.boost ? <span className="ef up">⚡ Jugada extra en el próximo partido</span> : null}
      {e.injury ? <span className="ef down">🩹 {plural(e.injury, "fecha", "fechas")} afuera</span> : null}
      {e.suspension ? <span className="ef down">🟥 {plural(e.suspension, "fecha", "fechas")} de suspensión</span> : null}
    </div>
  );
}

function EventStep({ s, save }: { s: CareerState; save: (s: CareerState) => void }) {
  const [effect, setEffect] = useState<Effect | null>(null);
  const [next, setNext] = useState<CareerState | null>(null);
  const go = (n: CareerState) => { play("kick"); save(E.afterEvent(n, s.pendingEvent)); };

  if (s.pendingEvent === "debut") {
    return (
      <section className="event card">
        <div className="event-icon">🏟️</div>
        <h2>¡Te citaron!</h2>
        <p>El DT de {s.club} te incluye en la lista para la primera fecha. Tu familia ya sacó entradas.</p>
        <button className="btn btn-primary big-cta" onClick={() => go(s)}>Ir al partido →</button>
      </section>
    );
  }
  if (s.pendingEvent === "national-call" && s.national) {
    return (
      <section className="event card national">
        <div className="event-icon">{NATIONS[s.nationality]?.flag}</div>
        <h2>¡Convocado para la {s.national.name}!</h2>
        <p>El DT de {NATIONS[s.nationality]?.name} te incluyó en la lista. Vas a defender la camiseta de tu país.</p>
        <button className="btn btn-primary big-cta" onClick={() => go(s)}>Viajar con la selección ✈️</button>
      </section>
    );
  }
  const ev = eventById(s.pendingEvent ?? "") ?? eventById("asado")!;
  if (effect && next) {
    return (
      <section className="event card">
        <div className="event-icon">{ev.icon}</div>
        <h2>{ev.title}</h2>
        <p className="effect-text">{effect.text}</p>
        <EffectChips e={effect} />
        <button className="btn btn-primary big-cta" onClick={() => go(next)}>Ir al partido →</button>
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
          <button key={i} className="btn choice" onClick={() => { play("click"); const e = resolveChoice(c, s, R); setEffect(e); setNext(E.applyEffect(s, e)); }}>{c.label}</button>
        ))}
      </div>
    </section>
  );
}

/* ================= Partido ================= */

function MatchStep({ s, save }: { s: CareerState; save: (s: CareerState) => void }) {
  const nx = useMemo(() => E.nextFixture(s), [s]);
  const rival = useMemo(() => (nx ? E.rivalFor(s, nx.fx, R) : ""), [nx]); // eslint-disable-line react-hooks/exhaustive-deps
  const [started] = useState(() => R() < E.startChance(s));
  const plan = useMemo(() => E.planMoments(s, started, R), [started]); // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState<"pre" | "play" | "pens" | "post">("pre");
  const [results, setResults] = useState<Moment[]>([]);
  const [res, setRes] = useState<MatchResult | null>(null);
  const [after, setAfter] = useState<CareerState | null>(null);
  const [confetti, setConfetti] = useState(0);
  if (!nx) return null;
  const fx = nx.fx;
  const team = E.myTeam(s);
  const absent = s.injury > 0 || s.suspension > 0;
  const d = E.difficulty(s, rival);

  const finishMatch = (r: MatchResult) => {
    if (fx.knockout && r.gf === r.ga && !r.pens) {
      setRes(r);
      setPhase("pens");
      return;
    }
    const n = E.applyResult({ ...s, lastKinds: plan }, nx.idx, rival, r, R);
    setRes(r);
    setAfter(n);
    setPhase("post");
    const won = r.gf > r.ga || (r.pens ? r.pens[0] > r.pens[1] : false);
    if (won) { play("win"); setConfetti((x) => x + 1); } else if (r.gf < r.ga || r.pens) play("lose"); else play("flip");
  };
  const onMoment = (ok: boolean) => {
    const list = [...results, { kind: plan[results.length], ok }];
    setResults(list);
    if (list.length >= plan.length) finishMatch(E.simMatch(s, rival, list, started, R));
  };

  const header = (
    <>
      <p className="comp-badge"><span>{COMP_ICON[fx.kind]}</span> {fx.comp} · {fx.round}</p>
      <div className="scoreboard">
        <div className="sb-team"><Crest club={team} size={52} /><span>{clubStyle(team).short}</span></div>
        {res ? <div className="sb-score">{res.gf} <span>-</span> {res.ga}</div> : <div className="sb-vs">VS</div>}
        <div className="sb-team"><Crest club={rival} size={52} /><span>{clubStyle(rival).short}</span></div>
      </div>
    </>
  );

  if (phase === "post" && res && after) {
    const won = res.gf > res.ga || (res.pens ? res.pens[0] > res.pens[1] : false);
    return (
      <section className="match card">
        <Confetti fire={confetti} />
        {header}
        {res.pens && <p className="match-note">Penales: {res.pens[0]} - {res.pens[1]}</p>}
        <p className="match-note">{won ? "¡Victoria!" : res.gf === res.ga && !res.pens ? "Empate" : "Derrota"} · {res.note}</p>
        {res.played && (
          <div className="reward">
            <div><b>{res.rating}</b><small>tu nota</small></div>
            {E.role(s) === "ARQ" ? <div><b>{res.saves}</b><small>penales atajados</small></div> : <div><b>{res.goals}</b><small>{res.goals === 1 ? "gol" : "goles"}</small></div>}
            <div><b>{res.assists}</b><small>{res.assists === 1 ? "asistencia" : "asistencias"}</small></div>
          </div>
        )}
        {res.played && <p className="muted small">{res.started ? "Fuiste titular." : plan.length ? "Entraste desde el banco." : "No entraste: te quedaste en el banco."}{results.length ? ` Jugadas ganadas: ${results.filter((x) => x.ok).length}/${results.length}` : ""}</p>}
        <button className="btn btn-primary big-cta" onClick={() => { play("click"); save(after); }}>
          {after.phase === "season-end" || after.phase === "retired" ? "Ver cierre de temporada →" : "Seguir →"}
        </button>
      </section>
    );
  }

  if (phase === "pens" && res) {
    const isGk = E.role(s) === "ARQ";
    const p = { d, bonus: E.signatureBonus(s, isGk ? "penalty-save" : "penalty"), foot: s.foot };
    const done = (ok: boolean) => finishMatch({ ...res, pens: E.shootout(s, ok, R) });
    return (
      <section className="match card">
        {header}
        <p className="match-note">¡Empate! Se define por penales.</p>
        {!res.played ? (
          <button className="btn btn-primary big-cta" onClick={() => done(R() < 0.5)}>Ver la tanda desde afuera</button>
        ) : isGk ? (
          <PenaltySave {...p} onDone={done} title="Tanda de penales: atajá el primero" />
        ) : (
          <PenaltyShoot {...p} onDone={done} title="Tanda de penales: pateás el primero" />
        )}
      </section>
    );
  }

  if (absent) {
    return (
      <section className="match card">
        {header}
        <h2>{s.injury > 0 ? "🩹 Estás lesionado" : "🟥 Estás suspendido"}</h2>
        <p>{s.injury > 0 ? `Te quedan ${plural(s.injury, "fecha", "fechas")} de recuperación.` : `Te quedan ${plural(s.suspension, "fecha", "fechas")} de suspensión.`}</p>
        <button className="btn btn-primary big-cta" onClick={() => finishMatch(E.simQuick(s, rival, R, "absent"))}>Ver el partido desde la tribuna →</button>
      </section>
    );
  }

  if (phase === "pre") {
    return (
      <section className="match card">
        {header}
        <p className="muted small" style={{ margin: 0 }}>Fuerza {Math.round(strengthOf(team))} vs {Math.round(strengthOf(rival))}{fx.knockout ? " · Eliminación directa: si empatan, penales" : ""}</p>
        <p className={`starter ${started ? "yes" : "no"}`}>{started ? `✅ Sos titular: vas a tener ${plan.length} jugadas.` : plan.length ? "🪑 Arrancás en el banco: vas a tener 1 jugada." : "🪑 Arrancás en el banco y no se sabe si vas a entrar."}</p>
        {plan.length > 0 ? (
          <>
            <button className="btn btn-primary big-cta" onClick={() => { play("whistle"); setTimeout(() => setPhase("play"), 50); }}>¡Que ruede la pelota! 🟢</button>
            <button className="btn btn-ghost" style={{ width: "100%", marginTop: 6 }} onClick={() => finishMatch(E.simQuick(s, rival, R, "simulate"))}>⏩ Simular partido</button>
          </>
        ) : (
          <button className="btn btn-primary big-cta" onClick={() => finishMatch(E.simMatch(s, rival, [], false, R))}>Ver el partido desde el banco →</button>
        )}
      </section>
    );
  }

  const kind = plan[results.length] as MomentKind;
  return (
    <section className="match card">
      <p className="comp-badge"><span>{COMP_ICON[fx.kind]}</span> {fx.comp} · {fx.round}</p>
      <div className="moment-progress">
        {plan.map((_, i) => <span key={i} className={i < results.length ? (results[i].ok ? "ok" : "bad") : i === results.length ? "cur" : ""} />)}
        <span className="muted small">Jugada {results.length + 1}/{plan.length} · min {Math.round(((results.length + 1) / (plan.length + 1)) * 90)}&apos; · vs {clubStyle(rival).short}</span>
      </div>
      <MomentRunner key={results.length} kind={kind} d={d} bonus={E.signatureBonus(s, kind)} foot={s.foot} onDone={onMoment} />
    </section>
  );
}

/* ================= Fin de temporada ================= */

function SeasonEnd({ s, save }: { s: CareerState; save: (s: CareerState) => void }) {
  const h = s.history[s.history.length - 1];
  const [confetti] = useState(h?.titles.length ? 1 : 0);
  useEffect(() => { if (h?.titles.length) play("win"); }, [h?.titles.length]);
  const natNews = s.log.find((l) => l.startsWith("🎽") || l.startsWith("📺") || l.includes("CAMPEÓN de la") || l.includes("quedó afuera de la"));
  return (
    <section className="event card">
      <Confetti fire={confetti} />
      <div className="event-icon">{h?.titles.length ? "🏆" : "📊"}</div>
      <h2>Fin de la temporada {h?.year}</h2>
      {h?.titles.map((t) => <p key={t} className="title-won">🏆 {t}</p>)}
      <div className="season-sum">
        <div><span>🏟️ {h?.league}</span><b>{h?.place}º</b></div>
        <div><span>🏆 Copa</span><b>{h?.cup}</b></div>
        {h?.intl && <div><span>🌎 Internacional</span><b>{h.intl.split(": ")[1]}</b></div>}
      </div>
      <div className="reward">
        <div><b>{h?.pj}</b><small>partidos</small></div>
        <div><b>{E.role(s) === "ARQ" || E.role(s) === "DEF" ? h?.cleanSheets : h?.goals}</b><small>{E.role(s) === "ARQ" || E.role(s) === "DEF" ? "vallas invictas" : "goles"}</small></div>
        <div><b>{h?.avg}</b><small>nota media</small></div>
      </div>
      {natNews && <p className="notice">{natNews}</p>}
      {s.nextIntl && <p className="notice">🌎 ¡Clasificaron a la {s.nextIntl}!</p>}
      <p>Cumpliste {s.age} años. Tu nivel ahora es <b>{s.ovr}</b>.</p>
      <h3 className="offers-title">Ofertas para la próxima temporada</h3>
      <div className="offers">
        <button className="offer on" onClick={() => { play("click"); save(E.startNextSeason(s, null, R)); }}>
          <Crest club={s.club} size={46} />
          <span className="offer-name">Quedarme en {clubStyle(s.club).short}</span>
          <span className="muted small">{s.nextIntl ? `Jugás ${s.nextIntl}` : "Más confianza del DT"}</span>
        </button>
        {(s.offers ?? []).map((c) => (
          <button key={c} className="offer" onClick={() => { play("win"); save(E.startNextSeason(s, c, R)); }}>
            <Crest club={c} size={46} />
            <span className="offer-name">{c}</span>
            <span className="muted small">{LEAGUES[clubInfo(c).league].name} · fuerza {clubInfo(c).strength}</span>
          </button>
        ))}
      </div>
      {s.age >= 30 && <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => { play("lose"); save({ ...s, phase: "retired" }); }}>Colgar los botines 👟</button>}
    </section>
  );
}

function Retired({ s, save }: { s: CareerState; save: (s: CareerState | null) => void }) {
  return (
    <section className="event card">
      <div className="event-icon">👟</div>
      <h2>Fin de una carrera</h2>
      <p>{s.totals.pj} partidos, {plural(s.totals.goals, "gol", "goles")}, {plural(s.trophies.length, "título", "títulos")}{s.caps ? ` y ${s.caps} partidos con ${NATIONS[s.nationality]?.name ?? "la selección"}` : ""}.</p>
      {s.trophies.length > 0 && <ul className="trophies">{s.trophies.map((t, i) => <li key={i}>🏆 {t}</li>)}</ul>}
      <CareerCard s={s} />
      <button className="btn btn-primary big-cta" onClick={() => save(null)}>Empezar una nueva carrera</button>
    </section>
  );
}
