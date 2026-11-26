import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { GuessGame } from "@/components/GuessGame";
import { HomeCards } from "@/components/HomeCards";
import { LeaguesHome } from "@/components/LeaguesHome";
import { LeagueTable } from "@/components/LeagueTable";
import { Archive } from "@/components/Archive";

function Page({ path }: { path: string }) {
  const game = path.match(/^\/(jugador|dt)(?:\/(\d+))?$/);
  if (game) {
    const id = game[1] as "jugador" | "dt";
    const day = game[2] ? Number(game[2]) : undefined;
    return <GuessGame key={path} gameId={id} day={day} />;
  }
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
      <footer className="footer">Fútbol de Primera · Prototipo Fase 1 · Datos públicos, sin escudos ni fotos oficiales.</footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
