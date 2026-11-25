/** Acceso a localStorage que nunca rompe (modo privado, SSR, cuota llena). */
const PREFIX = "primera:v1:";

export function read<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento: el juego sigue funcionando en memoria */
  }
}

/** Evento para que el header y otras vistas se enteren de cambios de perfil. */
export const PROFILE_EVENT = "primera:profile";
export function notifyProfileChange() {
  try {
    window.dispatchEvent(new Event(PROFILE_EVENT));
  } catch {
    /* noop */
  }
}
