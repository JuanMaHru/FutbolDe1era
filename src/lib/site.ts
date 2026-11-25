/** URL pública para textos compartibles. En la versión standalone (sin dominio propio) no se incluye link. */
export function shareUrl(path: string): string | undefined {
  if (process.env.NEXT_PUBLIC_STANDALONE === "1" || typeof window === "undefined") return undefined;
  return `${window.location.origin}${path}`;
}
