/** Rutas de la app <-> hash de la página standalone ("/trayectoria/dt/12" <-> "#trayectoria-dt-12"). */
export function pathToHash(path: string): string {
  if (path === "/" || path === "") return "#inicio";
  return `#${path.replace(/^\//, "").split("/").join("-")}`;
}
/** Rutas cuyo nombre tiene guiones: no se parten en "/". */
const HYPHENATED = ["mas-o-menos", "en-que-anio", "aviso-legal"];
export function hashToPath(hash: string): string {
  let h = hash.replace(/^#/, "");
  if (!h || h === "inicio") return "/";
  HYPHENATED.forEach((slug, i) => { h = h.replace(new RegExp(`(^|-)${slug}(?=-|$)`), `$1@${i}@`); });
  return `/${h.split("-").map((seg) => seg.replace(/@(\d+)@/, (_, i) => HYPHENATED[Number(i)])).join("/")}`;
}
