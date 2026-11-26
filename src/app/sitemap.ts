import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const PAGES = ["", "/jugador", "/dt", "/trayectoria", "/trayectoria/dt", "/once", "/palabra", "/bingo", "/carrera", "/vitrina", "/ligas", "/archivo", "/aviso-legal"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: p === "" || /jugador|dt|trayectoria|once|palabra|bingo/.test(p) ? "daily" : "weekly", priority: p === "" ? 1 : 0.7 }));
}
