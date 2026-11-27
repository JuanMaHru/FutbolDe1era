"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as E from "@/lib/career/engine";
import type { CareerState, Fixture, MatchResult, Moment, MomentKind, Offer } from "@/lib/career/engine";
import { CAREER_COUNTRIES, LEAGUES, NATIONS, clubInfo, isDerby, startingOffers, strengthOf } from "@/lib/career/world";
import { eventById, resolveChoice, type Effect } from "@/lib/career/events";
import { matchComments, situation } from "@/lib/career/comments";
import { POSITIONS, COUNTRIES } from "@/lib/game/meta";
import { dateKey } from "@/lib/game/daily";
import { loadProfile } from "@/lib/progress";
import { read, write } from "@/lib/storage";
import { clubStyle } from "@/lib/clubs";
import { play } from "@/lib/sound";
import { Crest } from "../art/Crest";
import { Kit } from "../art/Kit";
import { Confetti } from "../Confetti";
import { CareerJourney } from "./CareerJourney";
import { MomentRunner, PenaltySave, PenaltyShoot } from "./Moments";
import { Burst } from "./Burst";
import { TrophyIcon } from "./Trophy";

const KEY = "career";
const POS_OPTS = ["ARQ", "DFC", "LAT", "MC", "MCO", "EXT", "DC"];
const R = Math.random;
const plural = (n: number, a: string, b: string) => `${n} ${n === 1 ? a : b}`;
const COMP_ICON: Record<string, string> = { league: "🏟️", playoff: "⚔️", cup: "🏆", intl: "🌎", national: "🎽", super: "⭐" };
/** Colores de un club para festejos (el blanco se reemplaza por el segundo color). */
export const clubColors = (club: string): [string, string] => {
  const c = clubStyle(club).colors;
  const a = c[0].toUpperCase() === "#FFFFFF" ? c[1] : c[0];
  const b = c[1].toUpperCase() === a.toUpperCase() ? (c[2] ?? "#ffffff") : c[1];
  return [a, b];
};

export function CareerApp() {
  const [s, setS] = useState<CareerState | null | undefined>(undefined);
  const [migrated, setMigrated] = useState(false);
  useEffect(() => {
    const saved = read<CareerState | { v: number } | null>(KEY, null);
    if (saved && saved.v !== 3) { setMigrated(true); setS(null); } else setS(saved as CareerState | null);
  }, []);
  const save = (n: CareerState | null) => { setS(n); write(KEY, n); };
  if (s === undefined) return <div className="card muted" style={{ marginTop: 24 }}>Cargando tu carrera…</div>;
  if (!s) return <Create onCreate={save} migrated={migrated} />;
  return <Hub s={s} save={save} />;
}

/* ================= Creación ================= */

function Stars({ n }: { n: number }) {
  return <span className="stars" aria-label={`${n} estrellas`}>{"★".repeat(n)}<span className="dim">{"★".repeat(5 - n)}</span></span>;
}

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
  const [talent, setTalent] = useState<E.TalentId | null>(null);
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(0);
  const offers = useMemo(() => startingOffers(rep, nat, R), [rep, nat]);
  useEffect(() => setRep(loadProfile().reputation), []);
  useEffect(() => setClub(null), [nat]);
  const role = E.ROLE_OF[pos];
  useEffect(() => setArche(E.ARCHETYPES[role][0].id), [role]);
  const bonus = E.repToBonus(rep);
  const ready = name.trim().length >= 2 && club && talent;
  const t = talent ? E.TALENTS.find((x) => x.id === talent)! : null;
  const [demo, setDemo] = useState<CareerState | null>(null);

  const roll = () => {
    if (talent || rolling) return;
    setRolling(true);
    play("click");
    let i = 0;
    const id = setInterval(() => { setFace((f) => (f + 1) % 4); play("flip"); if (++i > 14) { clearInterval(id); const r = E.rollTalent(R); setTalent(r); setRolling(false); play(r === "crack" || r === "fenomeno" ? "win" : "hit"); } }, 110);
  };

  return (
    <div className="career-create">
      <h1 className="hero-title" style={{ fontSize: "clamp(28px,7vw,44px)" }}>Modo <span className="hl">Carrera</span></h1>
      <p className="lead">Creá tu jugador y viví toda su carrera: liga completa, copas, torneos internacionales y la selección. Los partidos importantes los jugás vos; el resto se simula pero cuenta.</p>
      <Link className="btn btn-ghost demo-btn" href="/vitrina">🏆 Ver todos los títulos, premios y logros</Link>
      <button className="btn btn-ghost demo-btn" onClick={() => { play("click"); setDemo(demo ? null : demoCareer()); }}>{demo ? "✕ Cerrar ejemplo" : "👀 Ver un final de carrera de ejemplo"}</button>
      {demo && (
        <div className="demo-box">
          <CareerJourney s={demo} demo />
          <button className="btn big-cta" onClick={() => { setDemo(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Cerrar el ejemplo y crear mi jugador</button>
        </div>
      )}
      {migrated && <p className="notice">Actualizamos el Modo Carrera (formatos reales, ida y vuelta, premios y logros). Tu carrera anterior no es compatible: empezá una nueva.</p>}
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
        <div className="chips">{CAREER_COUNTRIES.map((c) => <button key={c.code} className={`chip-btn ${nat === c.code ? "on" : ""}`} onClick={() => { play("click"); setNat(c.code); }}>{c.flag} {c.name}</button>)}</div>
      </section>
      <section className="create-step">
        <h2>3 · Puesto</h2>
        <div className="chips">{POS_OPTS.map((p) => <button key={p} className={`chip-btn ${pos === p ? "on" : ""}`} onClick={() => { play("click"); setPos(p); }}><b>{p}</b> {POSITIONS[p].label}</button>)}</div>
      </section>
      <section className="create-step">
        <h2>4 · Tu estilo de juego</h2>
        <div className="arche-grid">{E.ARCHETYPES[role].map((a) => <button key={a.id} className={`arche ${arche === a.id ? "on" : ""}`} onClick={() => { play("click"); setArche(a.id); }}><b>{a.name}</b><span className="muted small">{a.desc}</span></button>)}</div>
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
          <div className="chips">{[17, 18, 19].map((a) => <button key={a} className={`chip-btn ${age === a ? "on" : ""}`} onClick={() => { play("click"); setAge(a); }}>{a} años</button>)}</div>
          <div className="chips" style={{ marginTop: 6 }}>{(["derecho", "zurdo", "ambidiestro"] as const).map((f) => <button key={f} className={`chip-btn ${foot === f ? "on" : ""}`} onClick={() => { play("click"); setFoot(f); }}>🦶 {f}</button>)}</div>
        </div>
      </section>
      <section className="create-step">
        <h2>7 · ¿Dónde debutás?</h2>
        <div className="offers">
          {offers.map((c) => (
            <button key={c} className={`offer ${club === c ? "on" : ""}`} onClick={() => { play("click"); setClub(c); }}>
              <Crest club={c} size={46} /><span className="offer-name">{c}</span><span className="muted small">{LEAGUES[clubInfo(c).league].name}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="create-step">
        <h2>8 · Informe del ojeador</h2>
        <div className={`talent-card ${t ? `t-${t.id}` : ""}`}>
          {!t ? (
            <>
              <div className={`dice ${rolling ? "rolling" : ""}`} aria-hidden>{["⚽", "🎲", "⭐", "👟"][face]}</div>
              <p className="muted small" style={{ margin: 0 }}>El talento no se elige: lo decide la suerte. Puede salir un jugador de oficio… o un fenómeno.</p>
              <button className="btn btn-primary" onClick={roll} disabled={rolling}>{rolling ? "Mirando videos…" : "🎲 Ver mi potencial"}</button>
            </>
          ) : (
            <>
              <Stars n={t.stars} />
              <b className="talent-name">{t.name}</b>
              <span className="muted small">{t.desc}</span>
            </>
          )}
        </div>
      </section>
      <button className="btn btn-primary big-cta" disabled={!ready} onClick={() => { play("win"); onCreate(E.newCareer({ name, nick, nationality: nat, position: pos, archetype: arche, foot, number: num, age, club: club!, repBonus: bonus, talent: talent! }, R)); }}>
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

function Hub({ s, save }: { s: CareerState; save: (s: CareerState | null) => void }) {
  const [confirm, setConfirm] = useState<"" | "reset" | "sim">("");
  const [wonToday, setWonToday] = useState(false);
  useEffect(() => { const r = loadProfile().results[dateKey()] ?? {}; setWonToday(Object.values(r).some((p) => (p ?? 0) > 0)); }, []);
  const today = dateKey();
  const canBonus = wonToday && s.bonusDay !== today && s.phase !== "retired";
  const team = E.myTeam(s);
  const [c1] = clubColors(s.club);
  const r = E.role(s);
  const lg = E.leagueOfState(s);
  const t = E.talentOf(s);
  const inSeason = s.phase === "event" || s.phase === "match" || s.phase === "national";
  const next = inSeason && s.pendingEvent !== "national-call" ? E.nextFixture(s.national && s.phase !== "national" ? { ...s, phase: "national" } : s) : null;
  const myTable = s.tables.find((x) => x.rows[s.club] && x.played > 0 && x.played < x.rounds.length) ?? s.tables.filter((x) => x.rows[s.club] && x.played > 0).slice(-1)[0];

  return (
    <div className="career">
      <section className="career-head" style={{ "--club": c1 } as React.CSSProperties}>
        <Kit club={team} label={s.number} size={88} />
        <div className="ch-main">
          <div className="ch-name">{s.nick ? `“${s.nick}”` : s.name}</div>
          {s.nick && <div className="ch-real">{s.name}</div>}
          <div className="ch-sub"><Crest club={s.club} size={20} /> {clubStyle(s.club).short} · {POSITIONS[s.position]?.label} · {NATIONS[s.nationality]?.flag ?? COUNTRIES[s.nationality]?.flag} · {s.age} años</div>
          <div className="ch-season">Temporada {s.season} ({E.currentYear(s)}) · {lg.name} · <Stars n={t.stars} /></div>
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
        {s.awards.length > 0 && <span>🏅 {s.awards.length}</span>}
        <span>💰 {s.money >= 1000 ? `${(s.money / 1000).toFixed(1)} M` : `${s.money} mil`} USD</span>
        {s.caps > 0 && <span>{NATIONS[s.nationality]?.flag} {s.caps} PJ · {s.natGoals} G</span>}
      </div>

      {canBonus && (
        <button className="bonus" onClick={() => { play("hit"); save({ ...E.applyEffect(s, { ovr: 1, form: 5, text: "Entrenamiento especial desbloqueado por tus retos de hoy: +1 de nivel." }), bonusDay: today }); }}>
          ⚡ <b>Entrenamiento especial</b> · desbloqueado por ganar un reto diario hoy (+1 nivel)
        </button>
      )}

      {next && (
        <div className="next-fx">
          <span>{COMP_ICON[next.fx.kind]}</span> Próximo: <b>{next.fx.comp}</b> · {next.fx.stage}
          {next.fx.rival && <> · vs <Crest club={next.fx.rival} size={16} /> <b>{clubStyle(next.fx.rival).short}</b></>}
          {next.fx.rival && isDerby(team, next.fx.rival) && <span className="derby-tag">CLÁSICO</span>}
        </div>
      )}

      {s.phase === "event" && <EventStep s={s} save={save} />}
      {(s.phase === "match" || s.phase === "national") && <MatchStep key={`${s.season}-${s.idx}-${s.national?.idx ?? ""}`} s={s} save={save} />}
      {s.phase === "season-end" && <SeasonEnd s={s} save={save} />}
      {s.phase === "retired" && <Retired s={s} save={save} />}

      {inSeason && (
        <div className="row" style={{ marginTop: 10 }}>
          {confirm === "sim" ? (
            <>
              <span className="small">¿Simular {s.national ? "el resto del torneo" : "el resto de la temporada"} sin jugar?</span>
              <button className="btn btn-primary" onClick={() => { play("whistle"); setConfirm(""); save(E.simulateRest(s, R)); }}>Sí, simular</button>
              <button className="btn btn-ghost" onClick={() => setConfirm("")}>Cancelar</button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={() => setConfirm("sim")}>⏩ Simular {s.national ? "torneo" : "temporada"}</button>
          )}
        </div>
      )}

      {myTable && s.phase !== "retired" && (
        <details className="history">
          <summary>Tabla · {myTable.name}</summary>
          <TableView table={myTable} me={s.club} />
        </details>
      )}
      {s.fixtures.some((f) => f.result) && s.phase !== "season-end" && (
        <details className="history">
          <summary>Partidos de la temporada ({s.fixtures.filter((f) => f.result).length})</summary>
          <ul className="fx-list">{s.fixtures.filter((f) => f.result).slice().reverse().map((f) => <FxRow key={f.id} f={f} />)}</ul>
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
                    <td className="name"><Crest club={h.club} size={18} /> {clubStyle(h.club).short} {[...h.titles, ...h.awards].slice(0, 4).map((x) => <TrophyIcon key={x} name={x} size={16} />)}</td>
                    <td>{h.pj}</td><td>{r === "ARQ" || r === "DEF" ? h.cleanSheets : h.goals}</td><td>{r === "ARQ" ? h.goals : h.assists}</td><td>{h.avg}</td><td>{h.place}º</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      <Link className="link-btn" href="/vitrina" style={{ display: "inline-block", marginTop: 10 }}>🏆 Ver todos los logros posibles</Link>
      {(s.trophies.length > 0 || s.awards.length > 0) && (
        <details className="history">
          <summary>Vitrina ({s.trophies.length} títulos · {s.awards.length} premios)</summary>
          <Showcase s={s} />
        </details>
      )}

      {s.phase !== "retired" && (
        <div className="row" style={{ marginTop: 14 }}>
          {confirm === "reset" ? (
            <>
              <span className="small">¿Borrar esta carrera y empezar otra?</span>
              <button className="btn" style={{ borderColor: "var(--danger)", color: "var(--danger)" }} onClick={() => save(null)}>Sí, borrar</button>
              <button className="btn btn-ghost" onClick={() => setConfirm("")}>Cancelar</button>
            </>
          ) : (
            <button className="btn btn-ghost small" style={{ color: "var(--muted)" }} onClick={() => setConfirm("reset")}>Empezar otra carrera</button>
          )}
        </div>
      )}
    </div>
  );
}

function TableView({ table, me }: { table: E.Table; me: string }) {
  const rows = E.standings(table);
  const pos = rows.findIndex(([c]) => c === me);
  const shown = rows.filter((_, i) => i < 6 || Math.abs(i - pos) <= 1);
  return (
    <div className="table-scroll">
      <table className="table mini">
        <thead><tr><th>#</th><th className="name">Equipo</th><th>PJ</th><th>DG</th><th>Pts</th></tr></thead>
        <tbody>
          {shown.map(([c, r]) => {
            const i = rows.findIndex(([x]) => x === c);
            return <tr key={c} className={c === me ? "me" : ""}><td>{i + 1}</td><td className="name"><Crest club={c} size={16} /> {clubStyle(c).short}</td><td>{r.pj}</td><td>{r.gf - r.ga}</td><td className="total">{r.pts}</td></tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

function Showcase({ s }: { s: CareerState }) {
  const groups = new Map<string, number>();
  [...s.trophies, ...s.awards].forEach((t) => {
    const k = t.replace(/ \d{4}( \(.*\))?$/, "").replace(/ con .*$/, "").replace(/^(Ascenso a .*?) \d{4}.*$/, "$1");
    groups.set(k, (groups.get(k) ?? 0) + 1);
  });
  const all = [...s.trophies, ...s.awards];
  return (
    <div className="showcase">
      {[...groups.entries()].map(([k, n]) => {
        const sample = all.find((t) => t.startsWith(k))!;
        return (
          <div key={k} className="show-item" title={all.filter((t) => t.startsWith(k)).join("\n")}>
            <TrophyIcon name={sample} size={42} />
            <span className="show-n">{n > 1 ? `×${n}` : ""}</span>
            <span className="show-name">{k}</span>
          </div>
        );
      })}
    </div>
  );
}

function FxRow({ f }: { f: Fixture }) {
  const r = f.result!;
  const won = r.gf > r.ga || (!!r.pens && r.pens[0] > r.pens[1]);
  const draw = r.gf === r.ga && !r.pens;
  return (
    <li className={`fx ${won ? "w" : draw ? "d" : "l"} ${r.key ? "" : "sim"}`}>
      <span className="fx-comp">{COMP_ICON[f.kind]} {f.stage}</span>
      <span className="fx-rival"><Crest club={f.rival} size={16} /> {clubStyle(f.rival).short}</span>
      <span className="fx-score">{r.gf}-{r.ga}{r.pens ? ` (${r.pens[0]}-${r.pens[1]})` : ""}</span>
      <span className="fx-rating">{r.played ? (r.goals ? "⚽".repeat(Math.min(r.goals, 3)) : r.rating) : "—"}</span>
    </li>
  );
}

/* ================= Evento ================= */

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

function AutoLog({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  const goals = lines.reduce((a, l) => a + (l.split("|")[4]?.length ?? 0) / 2, 0);
  const w = lines.filter((l) => l.startsWith("G")).length, d = lines.filter((l) => l.startsWith("E")).length, p = lines.filter((l) => l.startsWith("P")).length;
  return (
    <details className="autolog" open={lines.length <= 4}>
      <summary>Mientras tanto: {lines.length} partidos simulados · {w}G {d}E {p}P{goals ? ` · ${Math.round(goals)} gol${Math.round(goals) === 1 ? "" : "es"} tuyos` : ""}</summary>
      <ul>
        {lines.map((l, i) => {
          const [res, comp, rival, score, mine] = l.split("|");
          return <li key={i} className={`al-${res}`}><span>{comp}</span><span><Crest club={rival} size={14} /> {clubStyle(rival).short}</span><b>{score}</b><span>{mine}</span></li>;
        })}
      </ul>
    </details>
  );
}

function EventStep({ s, save }: { s: CareerState; save: (s: CareerState) => void }) {
  const [effect, setEffect] = useState<Effect | null>(null);
  const [next, setNext] = useState<CareerState | null>(null);
  const go = (n: CareerState) => { play("kick"); save(E.afterEvent(n, s.pendingEvent)); };
  const log = <AutoLog lines={s.autoLog} />;
  if (s.pendingEvent === "debut") {
    return (<>{log}<section className="event card"><div className="event-icon">🏟️</div><h2>¡Te citaron!</h2><p>El DT de {s.club} te incluye en la lista para la primera fecha. Tu familia ya sacó entradas.</p><button className="btn btn-primary big-cta" onClick={() => go(s)}>Ir al partido →</button></section></>);
  }
  if (s.pendingEvent === "national-call" && s.national) {
    return (<>{log}<section className="event card national"><div className="event-icon">{NATIONS[s.nationality]?.flag}</div><h2>¡Convocado para la {s.national.name}!</h2><p>El DT de {NATIONS[s.nationality]?.name} te incluyó en la lista. Vas a defender la camiseta de tu país.</p><button className="btn btn-primary big-cta" onClick={() => go(s)}>Viajar con la selección ✈️</button></section></>);
  }
  if (s.pendingEvent === "clubwc-call" && s.national) {
    return (<>{log}<section className="event card national"><div className="event-icon">🌐</div><h2>¡{s.club} juega el {s.national.name}!</h2><p>Los mejores clubes del planeta, un solo trofeo. Fase de grupos y eliminación directa hasta la final.</p><button className="btn btn-primary big-cta" onClick={() => go(s)}>Viajar al Mundial de Clubes ✈️</button></section></>);
  }
  const ev = eventById(s.pendingEvent ?? "") ?? eventById("asado")!;
  if (effect && next) {
    return (<>{log}<section className="event card"><div className="event-icon">{ev.icon}</div><h2>{ev.title}</h2><p className="effect-text">{effect.text}</p><EffectChips e={effect} /><button className="btn btn-primary big-cta" onClick={() => go(next)}>Ir al partido →</button></section></>);
  }
  return (
    <>
      {log}
      <section className="event card">
        <div className="event-icon">{ev.icon}</div>
        <h2>{ev.title}</h2>
        <p>{ev.body(s)}</p>
        <div className="choices">{ev.choices.map((c, i) => <button key={i} className="btn choice" onClick={() => { play("click"); const e = resolveChoice(c, s, R); setEffect(e); setNext(E.addChoice(E.applyEffect(s, e), c.tag, ev.choices.map((x) => x.tag))); }}>{c.label}</button>)}</div>
      </section>
    </>
  );
}

/* ================= Partido en vivo ================= */

function MatchStep({ s, save }: { s: CareerState; save: (s: CareerState) => void }) {
  const nx = useMemo(() => E.nextFixture(s), [s]);
  const fx = nx?.fx;
  const team = E.myTeam(s);
  const rival = fx?.rival ?? "";
  const [started] = useState(() => R() < E.startChance(s));
  const [plan] = useState(() => E.prepareMatch(s, rival, E.planMoments(s, started, R), R, started));
  // Pelotas paradas que patean otros: se cuentan en el relato. Si simulás, el partido es otro y no se muestran.
  const [feed] = useState(() => E.setPieceFeed(s, plan, rival, R));
  const [showFeed, setShowFeed] = useState(true);
  const [phase, setPhase] = useState<"pre" | "play" | "burst" | "pens" | "post">("pre");
  const [moments, setMoments] = useState<Moment[]>([]);
  const [effects, setEffects] = useState<E.Effect3[]>([]);
  const [res, setRes] = useState<MatchResult | null>(null);
  const [after, setAfter] = useState<CareerState | null>(null);
  const [confetti, setConfetti] = useState(0);
  const shots = useRef<E.ShotRecord[]>([]);
  if (!nx || !fx) return null;
  const colors = clubColors(team);
  const agg = E.aggregateBefore(s, fx);
  const derby = isDerby(team, rival);
  const absent = s.injury > 0 || s.suspension > 0;
  const d = E.difficulty(s, rival);

  const finishMatch = (r: MatchResult) => {
    if (E.needsPens(s, fx, r) && !r.pens) { setRes(r); setPhase("pens"); return; }
    const n = E.recordShots(E.applyResult({ ...s, lastKinds: plan.kinds }, nx.idx, r, R), shots.current);
    setRes(r); setAfter(n); setPhase("post");
    const tot = agg ? [agg[0] + r.gf, agg[1] + r.ga] : null;
    const won = r.gf > r.ga || (!!r.pens && r.pens[0] > r.pens[1]) || (!!tot && tot[0] > tot[1] && fx.leg === 2);
    if (won) { play("win"); setConfetti((x) => x + 1); } else if (r.gf < r.ga) play("lose"); else play("flip");
  };
  const onMoment = (ok: boolean, shot?: E.ShotRecord) => {
    if (shot) shots.current.push(shot);
    const k = plan.kinds[moments.length] as MomentKind;
    const e = E.momentEffect(s, k, ok, R);
    const ms = [...moments, { kind: k, ok }];
    const es = [...effects, e];
    setMoments(ms); setEffects(es);
    setPhase("burst");
    if (e.us) { play("win"); setConfetti((x) => x + 1); } else if (e.them) play("lose");
    setTimeout(() => {
      if (ms.length >= plan.kinds.length) finishMatch(E.resolveMatch(s, plan, es, ms, started));
      else setPhase("play");
    }, 1700);
  };

  const i = Math.min(moments.length, Math.max(0, plan.kinds.length - 1));
  const [us, them] = phase === "post" && res ? [res.gf, res.ga] : E.scoreAt(plan, effects, phase === "burst" ? moments.length : i);
  const minuteNow = phase === "pre" ? 0 : phase === "post" ? 90 : plan.minutes[phase === "burst" ? moments.length - 1 : i];

  const header = (
    <>
      <p className="comp-badge"><span>{COMP_ICON[fx.kind]}</span> {fx.comp} · {fx.stage}</p>
      {derby && <p className="derby-banner">🔥 CLÁSICO 🔥</p>}
      <div className="scoreboard live" style={{ "--b1": colors[0], "--b2": colors[1] } as React.CSSProperties}>
        <div className="sb-team"><Crest club={team} size={50} /><span>{clubStyle(team).short}</span></div>
        <div className="sb-center">
          {phase === "pre" ? <div className="sb-vs">VS</div> : <div className="sb-score">{us} <span>-</span> {them}</div>}
          {phase !== "pre" && phase !== "post" && <div className="sb-min">⏱️ {minuteNow > 90 ? `90+${minuteNow - 90}` : minuteNow}&apos;</div>}
          {agg && <div className="sb-agg">Ida: {agg[0]}-{agg[1]}</div>}
        </div>
        <div className="sb-team"><Crest club={rival} size={50} /><span>{clubStyle(rival).short}</span></div>
      </div>
    </>
  );

  if (phase === "post" && res && after) {
    const tot: [number, number] | null = agg ? [agg[0] + res.gf, agg[1] + res.ga] : null;
    const comments = matchComments(s, fx, res, tot);
    const won = res.gf > res.ga || (!!res.pens && res.pens[0] > res.pens[1]);
    const fresh = after.log.slice(0, Math.max(0, after.log.indexOf(s.log[0])));
    const injuryNote = fresh.find((l) => l.startsWith("🩹"));
    return (
      <section className="match card">
        <Confetti fire={won ? confetti + 1000 : 0} colors={colors} />
        {header}
        {res.pens && <p className="match-note">Penales: {res.pens[0]} - {res.pens[1]}</p>}
        {injuryNote && <p className="match-note injury-note">{injuryNote}{s.age >= 30 ? " Con los años, el cuerpo pide más cuidado." : ""}</p>}
        <p className="match-note">{won ? "¡Victoria!" : res.gf === res.ga && !res.pens ? "Empate" : "Derrota"} · {res.note}</p>
        <ul className="comments">{comments.map((c, k) => <li key={k} style={{ animationDelay: `${k * 120}ms` }}>{c}</li>)}</ul>
        {showFeed && <Feed items={feed} title="Pelota parada" />}
        {res.timeline.length > 0 && (
          <div className="goals-line">{res.timeline.map((g, k) => <span key={k} className={g.us ? "us" : "them"}>{g.mine ? "⚽" : g.us ? "•" : "○"} {g.min}&apos;</span>)}</div>
        )}
        {res.played && (
          <div className="reward">
            <div><b>{res.rating}</b><small>tu nota</small></div>
            {E.role(s) === "ARQ" ? <div><b>{res.saves}</b><small>penales atajados</small></div> : <div><b>{res.goals}</b><small>{res.goals === 1 ? "gol" : "goles"}</small></div>}
            <div><b>{res.assists}</b><small>{res.assists === 1 ? "asistencia" : "asistencias"}</small></div>
          </div>
        )}
        <button className="btn btn-primary big-cta" onClick={() => { play("click"); save(after); }}>
          {after.phase === "season-end" || after.phase === "retired" ? "Ver cierre de temporada →" : "Seguir →"}
        </button>
      </section>
    );
  }

  if (phase === "pens" && res) {
    const isGk = E.role(s) === "ARQ";
    const p = { d, bonus: E.signatureBonus(s, isGk ? "penalty-save" : "penalty"), foot: s.foot, shots: s.shots, fame: s.fame, team, rival };
    const done = (ok: boolean, shot?: E.ShotRecord) => { if (shot) shots.current.push(shot); finishMatch({ ...res, pens: E.shootout(s, ok, R) }); };
    return (
      <section className="match card">
        {header}
        <p className="match-note">{agg ? "¡Global empatado!" : "¡Empate!"} Se define por penales.</p>
        {!res.played ? <button className="btn btn-primary big-cta" onClick={() => done(R() < 0.5)}>Ver la tanda desde afuera</button>
          : isGk ? <PenaltySave {...p} onDone={done} title="Tanda de penales: atajá el primero" />
          : <PenaltyShoot {...p} onDone={done} title="Tanda de penales: pateás el primero" />}
      </section>
    );
  }

  if (absent) {
    return (
      <section className="match card">
        {header}
        <h2>{s.injury > 0 ? "🩹 Estás lesionado" : "🟥 Estás suspendido"}</h2>
        <p>{s.injury > 0 ? `Te quedan ${plural(s.injury, "fecha", "fechas")} de recuperación.` : `Te quedan ${plural(s.suspension, "fecha", "fechas")} de suspensión.`}</p>
        <button className="btn btn-primary big-cta" onClick={() => { setShowFeed(false); finishMatch(E.simQuick(s, rival, R, "absent")); }}>Ver el partido desde la tribuna →</button>
      </section>
    );
  }

  if (phase === "pre") {
    return (
      <section className="match card">
        {header}
        <p className="muted small" style={{ margin: 0 }}>Fuerza {Math.round(strengthOf(team))} vs {Math.round(strengthOf(rival))}{fx.knockout ? (fx.leg === 1 ? " · Partido de ida" : " · Eliminación: si empatan, penales") : ""}</p>
        <p className={`starter ${started ? "yes" : "no"}`}>{started ? `✅ Sos titular: vas a tener ${plan.kinds.length} jugadas.` : plan.kinds.length ? "🪑 Arrancás en el banco: entrás en el segundo tiempo y vas a tener 1 jugada." : "🪑 Arrancás en el banco y no se sabe si vas a entrar."}</p>
        {plan.kinds.length > 0 ? (
          <>
            <button className="btn btn-primary big-cta" onClick={() => { play("whistle"); setTimeout(() => setPhase("play"), 50); }}>¡Que ruede la pelota! 🟢</button>
            <button className="btn btn-ghost" style={{ width: "100%", marginTop: 6 }} onClick={() => { setShowFeed(false); finishMatch(E.simQuick(s, rival, R, "simulate")); }}>⏩ Simular partido</button>
          </>
        ) : (
          <button className="btn btn-primary big-cta" onClick={() => finishMatch(E.resolveMatch(s, plan, [], [], false))}>Ver el partido desde el banco →</button>
        )}
      </section>
    );
  }

  const kind = plan.kinds[i] as MomentKind;
  const defensive = ["tackle", "intercept", "save", "penalty-save", "freekick-save"].includes(kind) || ((kind === "trivia" || kind === "ttt") && (E.role(s) === "ARQ" || E.role(s) === "DEF"));
  const [sa, sb] = E.scoreAt(plan, effects, i);
  const sit = situation(fx, plan.minutes[i], sa, sb, agg, defensive, derby);
  return (
    <section className="match card live-card">
      {header}
      {phase === "burst" && effects.length ? (
        <Burst kind={moments[moments.length - 1].kind} ok={moments[moments.length - 1].ok} effect={effects[effects.length - 1]} colors={colors} />
      ) : (
        <>
          <Feed items={feed.filter((f) => f.min < minuteNow)} />
          <div className={`situation ${plan.minutes[i] >= 85 ? "late" : ""}`}>
            <div className="sit-top"><span className="sit-min">{sit.minute}</span>{sit.tags.map((t) => <span key={t} className="sit-tag">{t}</span>)}</div>
            <p className="sit-head">{sit.headline}</p>
          </div>
          <div className="moment-progress">
            {plan.kinds.map((_, k) => <span key={k} className={k < moments.length ? (moments[k].ok ? "ok" : "bad") : k === moments.length ? "cur" : ""} />)}
            <span className="muted small">Jugada {i + 1}/{plan.kinds.length}</span>
          </div>
          <MomentRunner key={i} kind={kind} d={d} bonus={E.signatureBonus(s, kind)} foot={s.foot} shots={s.shots} fame={s.fame} team={team} rival={rival} onDone={onMoment} />
        </>
      )}
      <Confetti fire={confetti} colors={colors} />
    </section>
  );
}

/** Relato de las pelotas paradas que patearon otros. */
function Feed({ items, title = "Lo que pasó" }: { items: E.FeedItem[]; title?: string }) {
  if (!items.length) return null;
  return (
    <div className="feed">
      <p className="feed-title">{title}</p>
      <ul>
        {items.map((f, k) => (
          <li key={k} className={`${f.us ? "us" : "them"} ${f.goal ? "goal" : ""}`}><b>{f.min}&apos;</b> {f.text}</li>
        ))}
      </ul>
    </div>
  );
}

/* ================= Fin de temporada ================= */

const TAG: Record<string, string> = { arabia: "💰 Oferta millonaria", vuelta: "🏠 Volver a casa", salto: "🚀 Salto de calidad", gigante: "🌟 Un gigante te quiere" };

function SeasonEnd({ s, save }: { s: CareerState; save: (s: CareerState) => void }) {
  const h = s.history[s.history.length - 1];
  const [confetti] = useState(h?.titles.length || h?.awards.length ? 1 : 0);
  useEffect(() => { if (h?.titles.length || h?.awards.length) play("win"); }, [h?.titles.length, h?.awards.length]);
  const natNews = s.log.find((l) => l.startsWith("🎽") || l.startsWith("📺") || l.includes("CAMPEÓN de la") || l.includes("quedó afuera de la"));
  const bo = s.log.find((l) => l.startsWith("🗳️"));
  const { place, size } = E.annualPlace(s);
  return (
    <>
      <AutoLog lines={s.autoLog} />
      <section className="event card">
        <Confetti fire={confetti} colors={clubColors(s.club)} />
        <div className="event-icon">{h?.titles.length ? "🏆" : "📊"}</div>
        <h2>Fin de la temporada {h?.year}</h2>
        {[...(h?.titles ?? []), ...(h?.awards ?? [])].length > 0 && (
          <div className="season-trophies">{[...(h?.titles ?? []), ...(h?.awards ?? [])].map((t) => <div key={t} className="st-item"><TrophyIcon name={t} size={48} /><span>{t}</span></div>)}</div>
        )}
        <div className="season-sum">
          <div><span>🏟️ {h?.league} (tabla anual)</span><b>{place}º de {size}</b></div>
          <div><span>🏆 Copa</span><b>{h?.cup}</b></div>
          {h?.intl && <div><span>🌎 Internacional</span><b>{h.intl.split(": ")[1]}</b></div>}
        </div>
        <div className="reward">
          <div><b>{h?.pj}</b><small>partidos</small></div>
          <div><b>{E.role(s) === "ARQ" || E.role(s) === "DEF" ? h?.cleanSheets : h?.goals}</b><small>{E.role(s) === "ARQ" || E.role(s) === "DEF" ? "vallas invictas" : "goles"}</small></div>
          <div><b>{h?.avg}</b><small>nota media</small></div>
        </div>
        {natNews && <p className="notice">{natNews}</p>}
        {bo && <p className="notice">{bo}</p>}
        {s.nextIntl && <p className="notice">🌎 ¡Clasificaron a la {s.nextIntl}!</p>}
        <p>Cumpliste {s.age} años. Tu nivel ahora es <b>{s.ovr}</b>.</p>
        <h3 className="offers-title">Ofertas para la próxima temporada</h3>
        <div className="offers">
          <button className="offer on" onClick={() => { play("click"); save(E.startNextSeason(s, null, R)); }}>
            <Crest club={s.club} size={46} /><span className="offer-name">Quedarme en {clubStyle(s.club).short}</span><span className="muted small">{s.nextIntl ? `Jugás ${s.nextIntl}` : "Más confianza del DT"}</span>
          </button>
          {(s.offers ?? []).map((o: Offer) => (
            <button key={o.club} className={`offer ${o.tag ? `tag-${o.tag}` : ""}`} onClick={() => { play("win"); save(E.startNextSeason(s, o, R)); }}>
              {o.tag && <span className="offer-tag">{TAG[o.tag]}</span>}
              <Crest club={o.club} size={46} />
              <span className="offer-name">{o.club}</span>
              <span className="muted small">{LEAGUES[clubInfo(o.club).league].name} · fuerza {clubInfo(o.club).strength}</span>
              <span className="offer-salary">💰 {o.salary >= 1000 ? `${(o.salary / 1000).toFixed(1)} M` : `${o.salary} mil`} USD/partido</span>
            </button>
          ))}
        </div>
        {s.age >= 30 && <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => { play("lose"); save({ ...s, phase: "retired" }); }}>Colgar los botines 👟</button>}
      </section>
    </>
  );
}

function Retired({ s, save }: { s: CareerState; save: (s: CareerState | null) => void }) {
  return (
    <section className="retired">
      <div className="event-icon" style={{ textAlign: "center" }}>👟</div>
      <h2 className="j-big-title">Fin de una carrera</h2>
      <CareerJourney s={s} />
      <button className="btn btn-primary big-cta" onClick={() => save(null)}>Empezar una nueva carrera</button>
    </section>
  );
}

/** Carrera simulada completa para mostrar cómo se ve el final. */
export function demoCareer(): CareerState {
  const nats = ["ARG", "URU", "BRA", "ESP", "COL"];
  const pos = ["DC", "EXT", "MCO", "MC", "DFC", "ARQ"][Math.floor(R() * 6)];
  const nat = nats[Math.floor(R() * nats.length)];
  const talents: E.TalentId[] = ["talento", "crack", "crack", "fenomeno"];
  let s = E.newCareer({ name: "Juan Ejemplo", nick: "El Ejemplo", nationality: nat, position: pos, archetype: E.ARCHETYPES[E.ROLE_OF[pos]][0].id, foot: "zurdo", number: 10, age: 18, club: startingOffers(150, nat, R)[0], repBonus: 3, talent: talents[Math.floor(R() * talents.length)] }, R);
  for (let i = 0; i < 25 && s.phase !== "retired"; i++) {
    s = E.simulateRest(s, R);
    if (s.phase === "season-end") {
      const best = [...(s.offers ?? [])].sort((a, b) => clubInfo(b.club).strength - clubInfo(a.club).strength)[0];
      const pickOffer = best && clubInfo(best.club).strength > clubInfo(s.club).strength + 2 && R() < 0.75 ? best : null;
      s = s.age >= 35 && R() < 0.5 ? { ...s, phase: "retired" } : E.startNextSeason(s, pickOffer, R);
    }
  }
  return { ...s, phase: "retired" };
}
