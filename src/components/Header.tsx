"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LANGS, getLang, initLang, setLang, t, type Lang } from "@/lib/i18n";
import { SOCIAL } from "@/lib/site";
import { isMuted, play, setMuted } from "@/lib/sound";
import { IconInstagram, IconSound, IconTikTok, IconX } from "./Icons";
import { ThemePicker } from "./ThemePicker";
import { Crest } from "./art/Crest";
import { DEFAULT_THEME, currentTheme, setTheme } from "@/lib/theme";
import { useProfile } from "./useProfile";

const ICONS = { instagram: IconInstagram, x: IconX, tiktok: IconTikTok };

export function Header() {
  const path = usePathname();
  const profile = useProfile();
  const [muted, setM] = useState(false);
  const [lang, setL] = useState<Lang>("es");
  const [langMsg, setLangMsg] = useState("");
  const [themeOpen, setThemeOpen] = useState(false);
  const [theme, setThemeName] = useState(DEFAULT_THEME);

  useEffect(() => {
    initLang();
    setL(getLang());
    setM(isMuted());
    const th = currentTheme();
    setThemeName(th);
    setTheme(th); // re-aplica por si cambió la fórmula de colores
  }, []);

  const links = [
    { href: "/", label: t("nav.games"), active: path === "/" },
    { href: "/archivo", label: t("nav.archive"), active: path.startsWith("/archivo") },
    { href: "/ligas", label: t("nav.leagues"), active: path.startsWith("/ligas") },
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="socials">
            <span className="topbar-label">{t("top.follow")}</span>
            {SOCIAL.map((s) => {
              const I = ICONS[s.id];
              return s.url ? (
                <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} className="icon-btn"><I /></a>
              ) : (
                <span key={s.id} className="icon-btn disabled" title={`${s.label} · ${t("top.soon")}`} aria-label={`${s.label} (${t("top.soon")})`}><I /></span>
              );
            })}
          </div>
          <div className="topbar-right">
            <div className="langs" role="group" aria-label="Idioma">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  className={`lang ${lang === l.code ? "active" : ""} ${l.ready ? "" : "soon"}`}
                  aria-pressed={lang === l.code}
                  title={l.ready ? l.name : `${l.name} · ${t("top.soon")}`}
                  onClick={() => {
                    if (!l.ready) {
                      setLangMsg(`${l.name}: ${t("top.soon").toLowerCase()} 🚧`);
                      setTimeout(() => setLangMsg(""), 1800);
                      return;
                    }
                    setLang(l.code);
                    setL(l.code);
                  }}
                >
                  <span aria-hidden>{l.flag}</span> {l.label}
                </button>
              ))}
            </div>
            <button className="theme-btn" onClick={() => { play("click"); setThemeOpen(true); }} aria-label="Elegir colores de tu club" title="Tus colores">
              {theme === DEFAULT_THEME ? <span className="swatch" style={{ width: 20, height: 20, "--a": "var(--accent)", "--b": "var(--bg)" } as React.CSSProperties} /> : <Crest club={theme} size={22} />}
              <span>Colores</span>
            </button>
            <button
              className="icon-btn"
              aria-label={muted ? t("top.sound.off") : t("top.sound.on")}
              title={muted ? t("top.sound.off") : t("top.sound.on")}
              onClick={() => {
                setMuted(!muted);
                setM(!muted);
                if (muted) play("click");
              }}
            >
              <IconSound on={!muted} />
            </button>
          </div>
        </div>
      </div>
      <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Fútbol de Primera, inicio">
          <span className="brand-mark">1ª</span>
          <span className="brand-name">
            Fútbol de <em>Primera</em>
          </span>
        </Link>
        <nav className="nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={l.active ? "active" : ""}>
              {l.label}
            </Link>
          ))}
          <span className="rep-pill" title="Reputación: la vas a usar en el Modo Carrera">
            ⭐ {profile?.reputation ?? 0}
          </span>
        </nav>
      </div>
      </header>
      {langMsg && <div className="toast" role="status">{langMsg}</div>}
      <ThemePicker open={themeOpen} onClose={() => { setThemeOpen(false); setThemeName(currentTheme()); }} />
    </>
  );
}
