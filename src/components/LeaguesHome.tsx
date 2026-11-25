"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { leagueService } from "@/lib/leagues/local";
import type { League } from "@/lib/leagues/types";
import { normalizeCode } from "@/lib/leagues/week";
import { loadProfile, saveProfile } from "@/lib/progress";
import { notifyProfileChange } from "@/lib/storage";

export function LeaguesHome() {
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[] | null>(null);
  const [name, setName] = useState("");
  const [nick, setNick] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    leagueService.myLeagues().then(setLeagues);
    setNick(loadProfile().name);
  }, []);

  const saveNick = (v: string) => {
    setNick(v);
    const p = loadProfile();
    p.name = v.slice(0, 20);
    saveProfile(p);
    notifyProfileChange();
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const l = await leagueService.create(name);
    router.push(`/ligas/${l.code}`);
  };

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const l = await leagueService.join(code);
      router.push(`/ligas/${l.code}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="stack">
      {leagueService.mode === "local" && (
        <p className="notice">
          Prototipo: las ligas se guardan en este dispositivo y los rivales marcados como <i>demo</i> son simulados. Con el backend
          (Supabase) el código va a funcionar entre celulares de verdad.
        </p>
      )}

      <div className="card stack">
        <label className="small muted" htmlFor="nick">Tu apodo en las tablas</label>
        <input id="nick" className="input" value={nick} maxLength={20} placeholder="Ej: El Mago de Lanús" onChange={(e) => saveNick(e.target.value)} />
      </div>

      {leagues && leagues.length > 0 && (
        <>
          <h2 style={{ marginBottom: 0 }}>Mis ligas</h2>
          {leagues.map((l) => (
            <Link key={l.code} href={`/ligas/${l.code}`} className="card league-item">
              <div>
                <div style={{ fontWeight: 800 }}>{l.name}</div>
                <div className="muted small">{l.members.length} participantes · código {l.code}</div>
              </div>
              <span style={{ color: "var(--accent)", fontWeight: 700 }}>Tabla →</span>
            </Link>
          ))}
        </>
      )}

      <h2 style={{ marginBottom: 0 }}>Crear una liga</h2>
      <form className="card stack" onSubmit={create}>
        <input className="input" value={name} maxLength={40} placeholder="Nombre (ej: Los del Fulbito de los Jueves)" onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-primary" type="submit">Crear y obtener código</button>
      </form>

      <h2 style={{ marginBottom: 0 }}>Unirme con un código</h2>
      <form className="card stack" onSubmit={join}>
        <input
          className="input"
          value={code}
          placeholder="ABC234"
          style={{ textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}
          onChange={(e) => setCode(normalizeCode(e.target.value))}
        />
        {error && <span className="small" style={{ color: "var(--danger)" }}>{error}</span>}
        <button className="btn" type="submit" disabled={code.length !== 6}>Unirme</button>
      </form>
    </div>
  );
}
