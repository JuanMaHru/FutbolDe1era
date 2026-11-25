/** Rutas de la app <-> hash de la página standalone ("/ligas/ABC234" <-> "#liga-ABC234"). */
export function pathToHash(path: string): string {
  if (path === "/" || path === "") return "#inicio";
  const liga = path.match(/^\/ligas\/([A-Za-z0-9]+)$/);
  if (liga) return `#liga-${liga[1]}`;
  return `#${path.replace(/^\//, "")}`;
}
export function hashToPath(hash: string): string {
  const h = hash.replace(/^#/, "");
  if (!h || h === "inicio") return "/";
  if (h.startsWith("liga-")) return `/ligas/${h.slice(5)}`;
  return `/${h}`;
}
