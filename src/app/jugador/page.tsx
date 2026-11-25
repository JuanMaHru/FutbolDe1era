import type { Metadata } from "next";
import { GuessGame } from "@/components/GuessGame";

export const metadata: Metadata = { title: "Adiviná el jugador · Fútbol de Primera" };

export default function Page() {
  return <GuessGame gameId="jugador" />;
}
