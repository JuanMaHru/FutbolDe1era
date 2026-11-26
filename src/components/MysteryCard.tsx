import type { Attribute, Cell, Entity, GameId } from "@/lib/game/types";
import { COUNTRIES, LEAGUES, LINE_LABEL, POSITIONS } from "@/lib/game/meta";
import { clubStyle } from "@/lib/clubs";
import { Crest } from "./art/Crest";
import { Kit } from "./art/Kit";

type Row = { item: Entity & Record<string, unknown>; cells: Cell[] };

/**
 * Ficha del objetivo que se completa sola con lo que ya descubriste:
 * verdes revelan el dato, amarillos dejan una pista, y las flechas acotan los números.
 */
export function MysteryCard({
  gameId,
  rows,
  attributes,
  revealed,
}: {
  gameId: GameId;
  rows: Row[];
  attributes: Attribute<Entity>[];
  revealed?: Entity & Record<string, unknown>;
}) {
  const know = (key: string) => {
    const i = attributes.findIndex((a) => a.key === key);
    if (revealed) return { hit: true as const, item: revealed, cell: undefined };
    const r = rows.find((r) => r.cells[i]?.status === "hit");
    if (r) return { hit: true as const, item: r.item, cell: r.cells[i] };
    const n = rows.find((r) => r.cells[i]?.status === "near");
    return n ? { hit: false as const, item: n.item, cell: n.cells[i] } : null;
  };

  const range = (key: string) => {
    const i = attributes.findIndex((a) => a.key === key);
    let lo = -Infinity, hi = Infinity;
    for (const r of rows) {
      const c = r.cells[i];
      const v = Number(c?.display);
      if (!c || Number.isNaN(v)) continue;
      if (c.status === "hit") return String(v);
      if (c.arrow === "up") lo = Math.max(lo, v + 1);
      if (c.arrow === "down") hi = Math.min(hi, v - 1);
    }
    if (lo === -Infinity && hi === Infinity) return "?";
    if (lo === -Infinity) return `≤ ${hi}`;
    if (hi === Infinity) return `≥ ${lo}`;
    return lo === hi ? String(lo) : `${lo}–${hi}`;
  };

  const clubKey = gameId === "jugador" ? "club" : "team";
  const club = know(clubKey);
  const clubName = club?.hit ? String(club.item[clubKey]) : "";
  const num = gameId === "jugador" ? range("number") : "DT";
  const kitLabel = revealed ? (gameId === "jugador" ? String(revealed.number) : "DT") : num.match(/^\d+$/) ? num : gameId === "dt" ? "DT" : "?";

  const league = know("league");
  const nat = know("nationality");
  const pos = gameId === "jugador" ? know("position") : null;

  const facts: { label: string; value: React.ReactNode; state: "hit" | "near" | "none" }[] = [
    {
      label: gameId === "jugador" ? "Club" : "Equipo",
      value: club?.hit ? <><Crest club={clubName} size={18} /> {clubStyle(clubName).short}</> : club ? "Misma liga" : "?",
      state: club ? (club.hit ? "hit" : "near") : "none",
    },
    {
      label: "Liga",
      value: league?.hit ? LEAGUES[String(league.item.league)]?.short : league ? LEAGUES[String(league.item.league)]?.region : "?",
      state: league ? (league.hit ? "hit" : "near") : "none",
    },
    {
      label: "País",
      value: nat?.hit ? `${COUNTRIES[String(nat.item.nationality)]?.flag} ${String(nat.item.nationality)}` : nat ? COUNTRIES[String(nat.item.nationality)]?.confed : "?",
      state: nat ? (nat.hit ? "hit" : "near") : "none",
    },
    ...(gameId === "jugador"
      ? [
          {
            label: "Puesto",
            value: pos?.hit ? String(pos.item.position) : pos ? LINE_LABEL[POSITIONS[String(pos.item.position)]?.line] : "?",
            state: (pos ? (pos.hit ? "hit" : "near") : "none") as "hit" | "near" | "none",
          },
          { label: "Edad", value: range("age"), state: (range("age").match(/^\d+$/) ? "hit" : range("age") === "?" ? "none" : "near") as "hit" | "near" | "none" },
          { label: "Dorsal", value: num, state: (num.match(/^\d+$/) ? "hit" : num === "?" ? "none" : "near") as "hit" | "near" | "none" },
        ]
      : [
          { label: "Edad", value: range("age"), state: (range("age").match(/^\d+$/) ? "hit" : range("age") === "?" ? "none" : "near") as "hit" | "near" | "none" },
          (() => {
            const k = know("played");
            const code = k ? String(k.item.playedAs) : "";
            return { label: "Jugó de", value: k?.hit ? (code === "NJ" ? "No jugó" : code) : k ? LINE_LABEL[POSITIONS[code]?.line] : "?", state: (k ? (k.hit ? "hit" : "near") : "none") as "hit" | "near" | "none" };
          })(),
          { label: "Debut", value: range("debut"), state: (range("debut").match(/^\d+$/) ? "hit" : range("debut") === "?" ? "none" : "near") as "hit" | "near" | "none" },
        ]),
  ];

  return (
    <div className={`mystery ${revealed ? "revealed" : ""}`}>
      <div className="mystery-kit">
        <Kit club={clubName} label={kitLabel} size={84} hidden={!clubName} />
        <span className="mystery-name">{revealed ? revealed.name : "¿Quién es?"}</span>
      </div>
      <dl className="mystery-facts">
        {facts.map((f) => (
          <div key={f.label} className={`fact fact-${f.state}`}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
