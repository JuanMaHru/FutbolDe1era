/** Normaliza para búsqueda: sin tildes, minúsculas. */
export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function search<T extends { name: string }>(items: readonly T[], query: string, exclude: Set<string>, limit = 6): T[] {
  const q = normalize(query);
  if (!q) return [];
  const scored: [number, T][] = [];
  for (const it of items) {
    if (exclude.has(it.name)) continue;
    const n = normalize(it.name);
    const idx = n.indexOf(q);
    if (idx === -1) continue;
    // Prioriza coincidencias al inicio del nombre o del apellido.
    const score = idx === 0 ? 0 : n[idx - 1] === " " ? 1 : 2;
    scored.push([score, it]);
  }
  return scored.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name)).slice(0, limit).map((s) => s[1]);
}
