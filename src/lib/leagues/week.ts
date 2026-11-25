/** Las 7 claves (lun..dom) de la semana que contiene `key`. */
export function weekKeys(key: string): string[] {
  const d = new Date(`${key}T00:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // lunes = 0
  d.setUTCDate(d.getUTCDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setUTCDate(d.getUTCDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

export function shiftWeek(key: string, weeks: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

/** Código de liga legible: sin 0/O/1/I para dictarlo por WhatsApp sin errores. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeCode(rand: () => number = Math.random): string {
  return Array.from({ length: 6 }, () => ALPHABET[Math.floor(rand() * ALPHABET.length)]).join("");
}
export function normalizeCode(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}
