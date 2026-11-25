import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { GuessGame } from "@/components/GuessGame";
import { HomeCards } from "@/components/HomeCards";
import { LeaguesHome } from "@/components/LeaguesHome";
import { LeagueTable } from "@/components/LeagueTable";

function Page({ path }: { path: string }) {
  if (path === "/jugador") return <GuessGame key="jugador" gameId="jugador" />;
  if (path === "/dt") return <GuessGame key="dt" gameId="dt" />;
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
      <h1>El que sabe, juega.</h1>
      <p className="lead">
        Dos retos por día, iguales para todos. Tu conocimiento de fútbol es tu stat: cada acierto suma para tu liga y para tu carrera.
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
