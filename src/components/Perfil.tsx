"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CLUBS } from "@/lib/clubs";
import { DAILY } from "@/lib/game/daily-games";
import { loadProfile, loadStats, saveProfile, type GameStats } from "@/lib/progress";
import { loadAlbum, STICKERS } from "@/lib/album";
import { currentTheme, setTheme, DEFAULT_THEME } from "@/lib/theme";
import { notifyProfileChange, read, write } from "@/lib/storage";
import { play } from "@/lib/sound";
import { Crest } from "./art/Crest";
import { InstallApp } from "./InstallApp";

interface Extra { photo?: string; club?: string }

/** Achica la foto elegida a 160 px para guardarla en el celu. */
function resize(file: File): Promise<string> {
  return new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => {
      const s = 160, c = document.createElement("canvas"); c.width = c.height = s;
      const ctx = c.getContext("2d")!; const m = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s);
      ok(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = fail;
    img.src = URL.createObjectURL(file);
  });
}

export function Perfil() {
  const [name, setName] = useState("");
  const [extra, setExtra] = useState<Extra>({});
  const [rep, setRep] = useState(0);
  const [stats, setStats] = useState<Record<string, GameStats>>({});
  const [album, setAlbum] = useState({ have: 0, total: STICKERS.length });
  const [levels, setLevels] = useState({ leyenda: 0 });
  const [career, setCareer] = useState<{ retired: boolean; titles: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = loadProfile(); setName(p.name ?? ""); setRep(p.reputation);
    const ex = read<Extra>("perfil:extra", {}); setExtra({ club: currentTheme() !== DEFAULT_THEME ? currentTheme() : ex.club, ...ex });
    setStats(Object.fromEntries(DAILY.map((g) => [g.id, loadStats(g.id, g.max)])));
    setAlbum({ have: loadAlbum().pasted.length, total: STICKERS.length });
    let ley = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i) ?? ""; if (k.includes(":diff:") && !k.includes(":last:") && localStorage.getItem(k)?.includes("dificil")) ley++; }
    setLevels({ leyenda: ley });
    const c = read<{ phase?: string; titles?: string[]; history?: { titles: string[] }[] } | null>("career", null);
    if (c) setCareer({ retired: c.phase === "retired", titles: (c.history ?? []).reduce((a, h) => a + (h.titles?.length ?? 0), 0) });
  }, []);

  const saveName = (n: string) => { setName(n); const p = loadProfile(); saveProfile({ ...p, name: n }); notifyProfileChange(); };
  const saveExtra = (e: Extra) => { setExtra(e); write("perfil:extra", e); };
  const pickPhoto = async (f?: File) => { if (!f) return; try { saveExtra({ ...extra, photo: await resize(f) }); play("hit"); } catch { /* imagen inválida */ } };
  const pickClub = (club: string) => { saveExtra({ ...extra, club }); setTheme(club); play("click"); };

  const all = Object.values(stats);
  const played = all.reduce((a, s) => a + s.played, 0), won = all.reduce((a, s) => a + s.won, 0);
  const best = Math.max(0, ...all.map((s) => s.maxStreak));
  const allGames = DAILY.every((g) => (stats[g.id]?.played ?? 0) > 0);
  const LOGROS: { icon: string; title: string; desc: string; ok: boolean }[] = [
    { icon: "👟", title: "Debut", desc: "Jugá tu primer reto", ok: played > 0 },
    { icon: "⚽", title: "Primer gol", desc: "Ganá un reto", ok: won > 0 },
    { icon: "🔥", title: "Racha de 3", desc: "3 días seguidos ganando un mismo reto", ok: best >= 3 },
    { icon: "📅", title: "Semana perfecta", desc: "Racha de 7 días", ok: best >= 7 },
    { icon: "🗓️", title: "Un mes de primera", desc: "Racha de 30 días", ok: best >= 30 },
    { icon: "🧭", title: "Todoterreno", desc: "Jugá todos los retos al menos una vez", ok: allGames },
    { icon: "📚", title: "Enciclopedia", desc: "Ganá 50 retos", ok: won >= 50 },
    { icon: "🧠", title: "Sabelotodo", desc: "Ganá 200 retos", ok: won >= 200 },
    { icon: "👑", title: "Nivel Leyenda", desc: "Animate al nivel Leyenda", ok: levels.leyenda > 0 },
    { icon: "📒", title: "Coleccionista", desc: "Pegá 50 figuritas", ok: album.have >= 50 },
    { icon: "🏆", title: "Álbum lleno", desc: "Completá el álbum", ok: album.have >= album.total },
    { icon: "⭐", title: "Reputado", desc: "Juntá 500 de reputación", ok: rep >= 500 },
    { icon: "🎽", title: "Profesional", desc: "Empezá una carrera", ok: !!career },
    { icon: "🥇", title: "Leyenda del club", desc: "Ganá 10 títulos en el Modo Carrera", ok: (career?.titles ?? 0) >= 10 },
  ];
  const clubs = Object.keys(CLUBS);
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <section className="card pf-head">
        <button className="pf-avatar" onClick={() => file.current?.click()} aria-label="Cambiar foto">
          {extra.photo ? <img src={extra.photo} alt="" /> : <span>{initials}</span>}
          <span className="pf-cam">📷</span>
          {extra.club && <span className="pf-crest"><Crest club={extra.club} size={26} /></span>}
        </button>
        <input ref={file} type="file" accept="image/*" hidden onChange={(e) => pickPhoto(e.target.files?.[0])} />
        <div className="pf-id">
          {editing ? (
            <input className="input" autoFocus defaultValue={name} maxLength={24} placeholder="Tu nombre" onBlur={(e) => { saveName(e.target.value.trim()); setEditing(false); }} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
          ) : (
            <button className="pf-name" onClick={() => setEditing(true)}>{name || "Poné tu nombre"} ✏️</button>
          )}
          <label className="pf-club">
            <span>Hincha de</span>
            <select value={extra.club ?? ""} onChange={(e) => pickClub(e.target.value)}>
              <option value="">Elegí tu club</option>
              {clubs.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <span className="muted small">⭐ {rep} de reputación</span>
        </div>
      </section>

      <section className="pf-stats">
        {[["Retos jugados", played], ["Ganados", won], ["% de aciertos", played ? `${Math.round((won / played) * 100)}%` : "—"], ["Mejor racha", `${best}🔥`], ["Figuritas", `${album.have}/${album.total}`], ["Títulos en carrera", career?.titles ?? 0]].map(([l, v]) => (
          <div key={String(l)} className="pf-stat"><b>{v}</b><span>{l}</span></div>
        ))}
      </section>

      <h2 className="section-title">Logros</h2>
      <div className="pf-logros">
        {LOGROS.map((l) => (
          <div key={l.title} className={`pf-logro ${l.ok ? "ok" : ""}`}>
            <span className="pf-logro-ico">{l.ok ? l.icon : "🔒"}</span>
            <b>{l.title}</b>
            <span className="muted small">{l.desc}</span>
          </div>
        ))}
      </div>

      <h2 className="section-title">Tus retos</h2>
      <div className="pf-games">
        {DAILY.map((g) => {
          const s = stats[g.id];
          return (
            <Link key={g.id} href={g.path} className="pf-game">
              <span>{g.icon} {g.short}</span>
              <span className="muted small">{s?.played ? `${s.won}/${s.played} ganados · racha ${s.streak}🔥` : "Sin jugar"}</span>
            </Link>
          );
        })}
      </div>

      <section className="card pf-account">
        <b>☁️ Tu cuenta</b>
        <span className="muted small">Muy pronto vas a poder crear tu cuenta para no perder nada al cambiar de celu, jugar ligas online y cambiar figuritas con amigos. Por ahora tu perfil se guarda en este dispositivo.</span>
        <InstallApp variant="button" />
      </section>
      <Backup />
    </>
  );
}

const BK_PREFIX = "primera:v1:";

/** Copia de seguridad de todo lo guardado (carrera, perfil, álbum, rachas) en un archivo. */
function Backup() {
  const [msg, setMsg] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const download = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(BK_PREFIX)) data[k] = localStorage.getItem(k) ?? "";
    }
    const blob = new Blob([JSON.stringify({ app: "futbol-de-primera", date: new Date().toISOString(), data })], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `futbol-de-primera-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setMsg(`Listo: se descargó tu copia (${Object.keys(data).length} datos).`);
  };
  const restore = async (f: File) => {
    try {
      const j = JSON.parse(await f.text());
      if (j?.app !== "futbol-de-primera" || typeof j.data !== "object") throw new Error();
      const entries = Object.entries(j.data as Record<string, string>).filter(([k, v]) => k.startsWith(BK_PREFIX) && typeof v === "string");
      if (!entries.length) throw new Error();
      if (!confirm("Esto reemplaza lo guardado en este dispositivo por lo de la copia. ¿Seguimos?")) return;
      entries.forEach(([k, v]) => localStorage.setItem(k, v));
      setMsg("¡Restaurado! Recargando…");
      setTimeout(() => location.reload(), 700);
    } catch {
      setMsg("Ese archivo no es una copia válida de Fútbol de Primera.");
    }
  };
  return (
    <section className="card pf-account">
      <b>💾 Copia de seguridad</b>
      <span className="muted small">Descargá un archivo con tu carrera, perfil, álbum y rachas. Si cambiás de celu o borrás el navegador, lo restaurás desde acá.</span>
      <div className="row">
        <button className="btn btn-primary" onClick={download}>Descargar copia</button>
        <button className="btn" onClick={() => file.current?.click()}>Restaurar</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) restore(f); e.target.value = ""; }} />
      </div>
      {msg && <span className="small" role="status">{msg}</span>}
    </section>
  );
}
