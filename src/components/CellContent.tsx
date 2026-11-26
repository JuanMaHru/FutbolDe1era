import type { Cell, Entity } from "@/lib/game/types";
import { COUNTRIES, LEAGUES, LINE_LABEL, POSITIONS } from "@/lib/game/meta";
import { clubStyle } from "@/lib/clubs";
import { Crest } from "./art/Crest";

/** Contenido visual de una celda según el atributo. Los textos son cortos y nunca se cortan a mitad de palabra. */
export function CellContent({ attr, cell, item }: { attr: string; cell: Cell; item: Entity & Record<string, unknown> }) {
  switch (attr) {
    case "club":
    case "team": {
      const name = String(item[attr === "club" ? "club" : "team"]);
      const short = clubStyle(name).short;
      return (
        <>
          <Crest club={name} size={24} />
          <span className={`c-sub ${short.length > 6 ? "tight" : ""}`}>{short}</span>
        </>
      );
    }
    case "league": {
      const short = LEAGUES[String(item.league)]?.short ?? String(item.league);
      return <span className={`c-main ${short.length > 5 ? "tight" : ""}`}>{short}</span>;
    }
    case "nationality": {
      const c = COUNTRIES[String(item.nationality)];
      return (
        <>
          <span className="c-flag" aria-hidden>{c?.flag}</span>
          <span className="c-sub">{String(item.nationality)}</span>
        </>
      );
    }
    case "played":
    case "position": {
      const code = String(attr === "played" ? item.playedAs : item.position);
      const p = POSITIONS[code];
      if (code === "NJ") return <span className="c-main tight">No jugó</span>;
      return (
        <>
          <span className="c-main c-big">{code}</span>
          <span className="c-sub">{p ? LINE_LABEL[p.line] : ""}</span>
        </>
      );
    }
    default:
      return (
        <>
          <span className={`c-main ${cell.display.length > 5 ? "tight" : cell.arrow ? "" : "c-big"}`}>{cell.display}</span>
          {cell.arrow && <span className="arrow" aria-hidden>{cell.arrow === "up" ? "▲" : "▼"}</span>}
        </>
      );
  }
}
