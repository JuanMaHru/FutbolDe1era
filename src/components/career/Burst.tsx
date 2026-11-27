"use client";
import type { Effect3, MomentKind } from "@/lib/career/engine";

/** Pantalla grande de resultado de cada jugada, con los colores del club. */
export function Burst({ kind, ok, effect, colors }: { kind: MomentKind; ok: boolean; effect: Effect3; colors: [string, string] }) {
  let big: string, small: string, good: boolean;
  if (effect.us && effect.goal) {
    good = true;
    big = "¡GOOOOL!";
    small = { penalty: "Penal a la red", freekick: "¡Golazo de tiro libre!", header: "¡Testazo al gol!", placement: "Definición de crack", finish: "La clavaste", trivia: "Leíste la jugada y la mandaste a guardar", ttt: "Jugada perfecta" }[kind as string] ?? "¡Adentro!";
  } else if (effect.us) {
    good = true;
    big = kind === "corner" ? "¡GOL DE CÓRNER!" : kind === "pass" || effect.assist ? "¡PASE GOL!" : "¡GOL!";
    small = kind === "corner" ? "Centro perfecto y cabezazo a la red" : "Asistencia de lujo";
  } else if (effect.save) {
    good = true; big = "¡ATAJADÓN!"; small = "Penal contenido";
  } else if (effect.them) {
    good = false; big = "GOL DEL RIVAL"; small = "Te ganaron la jugada";
  } else if (ok) {
    good = true;
    big = { tackle: "¡CRUCE MILAGROSO!", intercept: "¡LO CORTASTE!", save: "¡QUÉ ATAJADA!", "freekick-save": "¡VOLASTE!", "penalty-save": "¡ATAJADÓN!", trivia: "¡BIEN LEÍDO!", ttt: "¡JUGADA GANADA!" }[kind as string] ?? "¡BIEN!";
    small = "La tribuna te ovaciona";
  } else {
    good = false;
    big = { finish: "¡AFUERA!", placement: "¡LA ATAJÓ!", penalty: "¡LO ERRASTE!", freekick: "¡EN LA BARRERA!", header: "¡POR ARRIBA!", pass: "PASE CORTADO", corner: "¡LA DESPEJARON!" }[kind as string] ?? "¡UFFF!";
    small = "Se salvaron por poco";
  }
  return (
    <div className={`burst ${good ? "good" : "bad"}`} style={{ "--b1": colors[0], "--b2": colors[1] } as React.CSSProperties} role="status">
      <div className="burst-stripes" aria-hidden />
      <div className="burst-big">{big.split("").map((ch, i) => <span key={i} style={{ animationDelay: `${i * 35}ms` }}>{ch === " " ? " " : ch}</span>)}</div>
      <div className="burst-small">{small}</div>
    </div>
  );
}
