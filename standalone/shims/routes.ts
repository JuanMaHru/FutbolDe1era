/** Rutas de la app <-> hash de la página standalone ("/trayectoria/dt/12" <-> "#trayectoria-dt-12"). */
export function pathToHash(path: string): string {
  if (path === "/" || path === "") return "#inicio";
  return `#${path.replace(/^\//, "").split("/").join("-")}`;
}
export function hashToPath(hash: string): string {
  const h = hash.replace(/^#/, "");
  if (!h || h === "inicio") return "/";
  return `/${h.split("-").join("/")}`;
}
