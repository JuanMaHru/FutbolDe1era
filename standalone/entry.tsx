import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { GuessGame } from "@/components/GuessGame";
import { HomeCards } from "@/components/HomeCards";
import { ClubBanner } from "@/components/ClubBanner";
import { LeaguesHome } from "@/components/LeaguesHome";
import { LeagueTable } from "@/components/LeagueTable";
import { Archive } from "@/components/Archive";
import { TrayectoriaGame } from "@/components/TrayectoriaGame";
import { OrderGame } from "@/components/OrderGame";
import { MasOMenosGame } from "@/components/MasOMenosGame";
import { IntrusoGame } from "@/components/IntrusoGame";
import { AniosGame } from "@/components/AniosGame";
import { ClubGame } from "@/components/ClubGame";
import { ConexionGame } from "@/components/ConexionGame";
import { OnceGame } from "@/components/OnceGame";
import { PalabraGame } from "@/components/PalabraGame";
import { BingoGame } from "@/components/BingoGame";
import { CareerApp } from "@/components/career/CareerApp";
import { Catalog } from "@/components/career/Catalog";
import { Footer, LegalNotice } from "@/components/LegalNotice";
import { FONTS_URL } from "@/lib/site";
import { Album } from "@/components/Album";
import { TabBar } from "@/components/TabBar";

function Page({ path }: { path: string }) {
  const game = path.match(/^\/(jugador|dt)(?:\/(\d+))?$/);
  if (game) {
    const id = game[1] as "jugador" | "dt";
    const day = game[2] ? Number(game[2]) : undefined;
    return <GuessGame key={path} gameId={id} day={day} />;
  }
  const tray = path.match(/^\/trayectoria(\/dt)?(?:\/(\d+))?$/);
  if (tray) return tray[1] ? <OrderGame key={path} day={tray[2] ? Number(tray[2]) : undefined} /> : <TrayectoriaGame key={path} kind="jugador" day={tray[2] ? Number(tray[2]) : undefined} />;
  const cl = path.match(/^\/club(?:\/(\d+))?$/);
  if (cl) return <ClubGame key={path} day={cl[1] ? Number(cl[1]) : undefined} />;
  const yr = path.match(/^\/en-que-anio(?:\/(\d+))?$/);
  if (yr) return <AniosGame key={path} day={yr[1] ? Number(yr[1]) : undefined} />;
  const ic = path.match(/^\/(intruso|conexion)(?:\/(\d+))?$/);
  if (ic) return ic[1] === "intruso" ? <IntrusoGame key={path} day={ic[2] ? Number(ic[2]) : undefined} /> : <ConexionGame key={path} day={ic[2] ? Number(ic[2]) : undefined} />;
  const mm = path.match(/^\/mas-o-menos(?:\/(\d+))?$/);
  if (mm) return <MasOMenosGame key={path} day={mm[1] ? Number(mm[1]) : undefined} />;
  const other = path.match(/^\/(once|palabra|bingo)(?:\/(\d+))?$/);
  if (other) {
    const day = other[2] ? Number(other[2]) : undefined;
    if (other[1] === "once") return <OnceGame key={path} day={day} />;
    if (other[1] === "palabra") return <PalabraGame key={path} day={day} />;
    return <BingoGame key={path} day={day} />;
  }
  if (path === "/carrera") return <CareerApp />;
  if (path === "/aviso-legal") return <LegalNotice />;
  if (path === "/album") return <><h1 className="hero-title" style={{ fontSize: "clamp(28px,7vw,44px)" }}>El <span className="hl">álbum</span></h1><Album /></>;
  if (path === "/vitrina")
    return (
      <>
        <h1 className="hero-title" style={{ fontSize: "clamp(28px,7vw,44px)" }}>La <span className="hl">vitrina</span></h1>
        <p className="lead">Todo lo que podés ganar en el Modo Carrera: títulos, premios individuales y logros.</p>
        <Catalog />
      </>
    );
  if (path === "/archivo")
    return (
      <>
        <h1>Archivo de retos</h1>
        <p className="lead">Jugá los días que te perdiste. Suman media reputación y no cuentan para la liga.</p>
        <Archive />
      </>
    );
  if (path === "/ligas")
    return (
      <>
        <h1>Ligas entre amigos</h1>
        <p className="lead">Cada reto diario suma puntos (10 si la clavás al primero, 0 si no sale). La tabla se reinicia cada lunes.</p>
        <LeaguesHome />
      </>
    );
  const liga = path.match(/^\/ligas\/([A-Za-z0-9]+)$/);
  if (liga)
    return (
      <>
        <h1>Tabla semanal</h1>
        <LeagueTable key={liga[1]} code={liga[1].toUpperCase()} />
      </>
    );
  return (
    <>
      <h1 className="hero-title">El que sabe, <span className="hl">juega.</span></h1>
      <p className="lead">
        Retos diarios iguales para todos. Tu conocimiento de fútbol es tu stat: cada acierto suma para tu liga y para tu carrera.
      </p>
      <ClubBanner />
      <HomeCards />
    </>
  );
}

function App() {
  const path = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);
  return (
    <>
      <Header />
      <main className="container">
        <Page path={path} />
      </main>
      <Footer />
      <TabBar />
    </>
  );
}

// Tipografías de la marca.
{ const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONTS_URL; document.head.appendChild(l); }
createRoot(document.getElementById("root")!).render(<App />);
