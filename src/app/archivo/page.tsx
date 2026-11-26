import type { Metadata } from "next";
import { Archive } from "@/components/Archive";

export const metadata: Metadata = { title: "Archivo · Fútbol de Primera" };

export default function Page() {
  return (
    <>
      <h1>Archivo de retos</h1>
      <p className="lead">Jugá los días que te perdiste. Suman media reputación y no cuentan para la liga.</p>
      <Archive />
    </>
  );
}
