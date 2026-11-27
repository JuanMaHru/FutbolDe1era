import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Fútbol de Primera",
    short_name: "Fútbol de 1era",
    description: "Retos diarios de fútbol, Modo Carrera, álbum de figuritas y ligas con amigos. El que sabe, juega.",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B1D3A",
    theme_color: "#0B1D3A",
    lang: "es-AR",
    categories: ["games", "sports", "entertainment"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Retos del día", url: "/", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Modo Carrera", url: "/carrera", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Álbum", url: "/album", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
