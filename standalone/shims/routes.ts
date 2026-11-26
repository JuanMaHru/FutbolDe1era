/** Rutas de la app <-> hash de la página standalone ("/ligas/ABC234" <-> "#ligas-ABC234", "/jugador/12" <-> "#jugador-12"). */
export function pathToHash(path: string): string {
  if (path === "/" || path === "") return "#inicio";
  return `#${path.replace(/^\//, "").replace("/", "-")}`;
}
export function hashToPath(hash: string): string {
  const h = hash.replace(/^#/, "");
  if (!h || h === "inicio") return "/";
  return `/${h.replace("-", "/")}`;
}
