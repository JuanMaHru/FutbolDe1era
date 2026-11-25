"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "./useProfile";

const LINKS = [
  { href: "/jugador", label: "Jugador" },
  { href: "/dt", label: "DT" },
  { href: "/ligas", label: "Ligas" },
];

export function Header() {
  const path = usePathname();
  const profile = useProfile();
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Fútbol de Primera, inicio">
          <span className="brand-mark">1ª</span>
          <span className="brand-name">
            Fútbol de <em>Primera</em>
          </span>
        </Link>
        <nav className="nav">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={path.startsWith(l.href) ? "active" : ""}>
              {l.label}
            </Link>
          ))}
          <span className="rep-pill" title="Reputación: la vas a usar en el Modo Carrera">
            ⭐ {profile?.reputation ?? 0}
          </span>
        </nav>
      </div>
    </header>
  );
}
