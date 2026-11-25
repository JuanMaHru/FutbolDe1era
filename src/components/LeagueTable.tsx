"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { dateKey } from "@/lib/game/daily";
import { GAME_IDS } from "@/lib/game/games";
import { leagueService } from "@/lib/leagues/local";
import type { League, Standing } from "@/lib/leagues/types";
import { shiftWeek, weekKeys } from "@/lib/leagues/week";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MEDALS = ["🥇", "🥈", "🥉"];

export function LeagueTable({ code }: { code: string }) {
  const router = useRouter();
  const [league, setLeague] = useState<League | null | undefined>(undefined);
  const [weekOf, setWeekOf] = useState("");
  const [rows, setRows] = useState<Standing[]>([]);
  const [toast, setToast] = useState("");
  const today = weekOf ? dateKey() : "";

  useEffect(() => {
    setWeekOf(dateKey());
    leagueService.get(code).then(setLeague);
  }, [code]);

  useEffect(() => {
    if (league && weekOf) leagueService.standings(league.code, weekOf, GAME_IDS).then(setRows);
  }, [league, weekOf]);

  if (league === undefined) return <div className="card muted">Cargando…</div>;
  if (league === null)
    return (
      <div className="card stack">
        <p style={{ margin: 0 }}>No estás en la liga <b>{code}</b>.</p>
        <Link className="btn btn-primary" href="/ligas">Unirme desde Ligas</Link>
      </div>
    );

  const days = weekKeys(weekOf);
  const isCurrentWeek = days.includes(today);

  const invite = async () => {
    const text = `Sumate a mi liga "${league.name}" en Fútbol de Primera ⚽\nCódigo: ${league.code}\n${window.location.origin}/ligas`;
    try {
      await navigator.clipboard.writeText(text);
      setToast("Invitación copiada");
    } catch {
      setToast(`Código: ${league.code}`);
    }
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="stack">
      <div className="card row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{league.name}</div>
          <div className="muted small">Código para invitar</div>
          <div className="code">{league.code}</div>
        </div>
        <button className="btn btn-primary" onClick={invite}>Invitar amigos</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <button className="btn btn-ghost" aria-label="Semana anterior" onClick={() => setWeekOf(shiftWeek(weekOf, -1))}>←</button>
        <span className="small muted">
          Semana del {fmt(days[0])} al {fmt(days[6])}
        </span>
        <button className="btn btn-ghost" disabled={isCurrentWeek} aria-label="Semana siguiente" onClick={() => setWeekOf(shiftWeek(weekOf, 1))}>→</button>
      </div>

      <div className="card table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th className="name">Jugador</th>
              {DAYS.map((d, i) => (
                <th key={i} className="dcol">{d}</th>
              ))}
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.member.id} className={r.member.demo ? "" : "me"}>
                <td>{MEDALS[i] ?? i + 1}</td>
                <td className="name">
                  {r.member.name} {r.member.demo && <span className="tag" style={{ fontSize: 9 }}>demo</span>}
                </td>
                {r.days.map((d, j) => (
                  <td key={j} className={`day dcol ${days[j] === today ? "today" : ""}`}>{d ?? "·"}</td>
                ))}
                <td className="total">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small" style={{ margin: 0 }}>Puntos por día = Jugador + DT (máximo 20). “·” = no jugó.</p>

      {isCurrentWeek && (
        <div className="row">
          <Link className="btn" href="/jugador">Jugar Jugador</Link>
          <Link className="btn" href="/dt">Jugar DT</Link>
        </div>
      )}

      <button
        className="btn btn-ghost small"
        style={{ justifySelf: "start", color: "var(--muted)" }}
        onClick={async () => {
          if (!confirm(`¿Salir de "${league.name}"?`)) return;
          await leagueService.leave(league.code);
          router.push("/ligas");
        }}
      >
        Salir de la liga
      </button>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function fmt(key: string) {
  const [, m, d] = key.split("-");
  return `${Number(d)}/${Number(m)}`;
}
