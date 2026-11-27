import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { THEME_BOOT } from "@/lib/theme";
import { Footer } from "@/components/LegalNotice";
import { FONTS_URL, SITE_URL } from "@/lib/site";

const DESCRIPTION = "Adiviná el jugador y el DT del día, competí con tus amigos y compartí tu resultado. Tu conocimiento de fútbol es tu stat.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Fútbol de Primera · El que sabe, juega",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "es_AR", url: SITE_URL, siteName: "Fútbol de Primera", title: "Fútbol de Primera · El que sabe, juega", description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: "Fútbol de Primera · El que sabe, juega", description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#0B1D3A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS_URL} />
      </head>
      <body>
        <Header />
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
