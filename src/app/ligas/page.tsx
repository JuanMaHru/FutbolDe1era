import type { Metadata } from "next";
import { LeaguesHome } from "@/components/LeaguesHome";

export const metadata: Metadata = { title: "Ligas · Fútbol de Primera" };

export default function Page() {
  return (
    <>
      <h1>Ligas entre amigos</h1>
      <p className="lead">Cada reto diario suma puntos (10 si la clavás al primero, 0 si no sale). La tabla se reinicia cada lunes.</p>
      <LeaguesHome />
    </>
  );
}
