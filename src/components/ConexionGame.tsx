"use client";
import { useMemo, useState } from "react";
import { dailyPair, PEOPLE, personOf, sharedSpell, type Person } from "@/lib/game/conexion";
import { dayNumber } from "@/lib/game/daily";
import { dailyMeta } from "@/lib/game/daily-games";
import { photoOf } from "@/lib/game/bios";
import { play } from "@/lib/sound";
import { Crest } from "./art/Crest";
import { Confetti } from "./Confetti";
import { GameTop, HelpDialog, ResultCard, fmtKey, useToast } from "./GameParts";
import { GuessInput } from "./GuessInput";
import { useDailyGame } from "./useDailyGame";
import { useLevel } from "./Difficulty";
import { levelSeed, poolFor } from "@/lib/difficulty";

interface CState { done: boolean; won: boolean; guesses: string[]; summary?: string; chain: string[]; errors: number; gaveUp?: boolean }

function Avatar({ p }: { p: Person }) {
  const ph = photoOf(p.id);
  const [bad, setBad] = useState(false);
  // eslint-disable-next-line @next/next/no-img-element
  if (ph && !bad) return <img className="cx-photo" src={ph.url} alt="" referrerPolicy="no-referrer" onError={() => setBad(true)} />;
  return <span className="cx-photo">{p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>;
}

function Link({ a, b }: { a: Person; b: Person }) {
  const sp = sharedSpell(a, b);
  return sp ? <div className="cx-link"><Crest club={sp.club} size={22} /> <span>{sp.club} · {sp.from === sp.to ? sp.from : `${sp.from}–${sp.to}`}</span></div> : <div className="cx-link gap">…</div>;
}

export function ConexionGame({ day }: { day?: number }) {
  const meta = dailyMeta("conexion");
  const g = useDailyGame<CState>("conexion", day, () => ({ done: false, won: false, guesses: [], chain: [], errors: 0 }));
  const lv = useLevel("conexion", g.key, g.state as never, () => {
    if (!g.state || g.state.done) return;
    g.save({ ...g.state, done: true, won: false, summary: "⏱ X" });
    g.finish(false, meta.max, 0);
    play("lose");
  });
  const LIVES = lv.diff.cfg.tries || 4;
  const [confetti, setConfetti] = useState(0);
  const toast = useToast();
  const pair = useMemo(() => (g.key ? dailyPair(dayNumber(g.key) * 71 + 3) : null), [g.key]);
  if (!g.state || !g.key || !pair) return <div className="card muted" style={{ marginTop: 24 }}>Cargando el reto…</div>;
  if (lv.gate) return lv.gate;
  const s = g.state;
  const A = personOf(pair.a)!, B = personOf(pair.b)!;
  const chain = [A, ...s.chain.map((id) => personOf(id)!)];
  const end = chain[chain.length - 1];
  const optimal = pair.best.length - 2; // jugadores en el medio

  const onPick = (p: Person) => {
    if (s.done) return;
    if (p.id === B.id) {
      if (sharedSpell(end, B)) return finish([...s.chain], s.errors, true);
      return miss(`${end.name} y ${B.name} no coincidieron en ningún club`);
    }
    if (chain.some((c) => c.id === p.id)) return toast.show("Ya está en la cadena");
    const sp = sharedSpell(end, p);
    if (!sp) return miss(`${p.name} no jugó con ${end.name}`);
    play("hit");
    const next = [...s.chain, p.id];
    if (sharedSpell(p, B)) return finish(next, s.errors, true);
    g.save({ ...s, chain: next, guesses: [...s.guesses, p.id] });
  };
  const miss = (msg: string) => {
    play("near"); toast.show(`❌ ${msg}`);
    const errors = s.errors + 1;
    if (errors >= LIVES) return finish(s.chain, errors, false);
    g.save({ ...s, errors, guesses: [...s.guesses, "x"] });
  };
  const finish = (chainIds: string[], errors: number, won: boolean, gaveUp = false) => {
    const links = chainIds.length;
    g.save({ ...s, chain: chainIds, errors, done: true, won, gaveUp, guesses: [...s.guesses, won ? "ok" : "x"], summary: won ? `${links} en el medio` : "X" });
    if (won) { play("win"); if (links <= optimal) setConfetti((n) => n + 1); } else play("lose");
    const pts = won ? Math.round(Math.max(3, 10 - (links - optimal) * 2 - errors) * lv.diff.mult) : 0;
    g.finish(won, Math.min(meta.max, links + errors + 1), pts);
  };

  const finalChain = s.done && s.won ? [...chain, B] : chain;
  const links = s.chain.length;
  const pts = s.won ? Math.round(Math.max(3, 10 - (links - optimal) * 2 - s.errors) * lv.diff.mult) : 0;
  const shareBody = `🔗 ${A.name} → ${B.name}\n${s.won ? `${"⚽".repeat(links)} ${links} en el medio (mínimo ${optimal})` : "❌"}${s.errors ? ` · ${s.errors} error${s.errors > 1 ? "es" : ""}` : ""}`;

  return (
    <>
      <Confetti fire={confetti} />
      <GameTop title="¿Quién jugó con quién?" mode={g.mode} day={g.day} dateLabel={fmtKey(g.key)} onHelp={() => g.setShowHelp(true)} extra={<><span className="tag">{LIVES - s.errors} ❤️</span>{lv.badge}</>} />
      <p className="cx-goal">Uní a <b>{A.name}</b> con <b>{B.name}</b> usando compañeros de equipo. Se puede en <b>{optimal}</b> {optimal === 1 ? "paso" : "pasos"}.</p>

      <div className="cx-chain">
        {finalChain.map((p, i) => (
          <div key={p.id + i} className="cx-step">
            {i > 0 && <Link a={finalChain[i - 1]} b={p} />}
            <div className={`cx-person ${i === 0 ? "start" : ""}`}><Avatar p={p} /><span>{p.name}</span></div>
          </div>
        ))}
        {!(s.done && s.won) && (
          <div className="cx-step">
            <div className="cx-link gap">{s.done ? "No se pudo unir" : "¿Con quién jugó?"}</div>
            <div className="cx-person end"><Avatar p={B} /><span>{B.name}</span></div>
          </div>
        )}
      </div>

      {!s.done && (
        <>
          <GuessInput items={PEOPLE} used={new Set(chain.map((c) => c.name))} placeholder={`Un compañero de ${end.name}…`} onPick={onPick} />
          <button className="link-btn small" style={{ marginTop: 8 }} onClick={() => finish(s.chain, s.errors, false, true)}>Rendirme y ver una solución</button>
        </>
      )}

      {s.done && (
        <ResultCard
          won={s.won}
          title={s.won ? (links <= optimal ? "¡Conexión perfecta! 🔗" : "¡Conectados! ⚽") : "Se cortó la cadena 😮‍💨"}
          subtitle={<>Una solución: {pair.best.map((id) => personOf(id)!.name).join(" → ")}</>}
          mode={g.mode}
          pts={pts}
          repGain={g.repGain}
          streak={g.stats?.streak}
          shareTitle={`${meta.title}`}
          shareBody={shareBody}
          path={meta.path}
          day={g.day}
        />
      )}
      {toast.node}
      <HelpDialog
        open={g.showHelp}
        onClose={() => g.setShowHelp(false)}
        steps={[
          <>Arrancás con un jugador y tenés que llegar a otro.</>,
          <>Escribí a alguien que haya sido <b>compañero de equipo</b> del último de la cadena (mismo club, años que se cruzan).</>,
          <>Cuando el último de la cadena jugó con el objetivo, ganás. Menos pasos = más puntos. Tenés {LIVES} errores.</>,
        ]}
      />
    </>
  );
}
