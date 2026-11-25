import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Fútbol de Primera · El que sabe, juega",
  description: "Adiviná el jugador y el DT del día, competí con tus amigos y compartí tu resultado. Tu conocimiento de fútbol es tu stat.",
};

export const viewport: Viewport = { themeColor: "#0d1a14", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>
        <Header />
        <main className="container">{children}</main>
        <footer className="footer">
          Fútbol de Primera · Prototipo Fase 1 · Datos públicos, sin escudos ni fotos oficiales.
        </footer>
      </body>
    </html>
  );
}
