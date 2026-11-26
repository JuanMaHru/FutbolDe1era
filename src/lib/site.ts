/** URL pública para textos compartibles. En la versión standalone (sin dominio propio) no se incluye link. */
export function shareUrl(path: string): string | undefined {
  if (process.env.NEXT_PUBLIC_STANDALONE === "1" || typeof window === "undefined") return undefined;
  return `${window.location.origin}${path}`;
}

/** Redes del proyecto: completar con la URL y el ícono pasa a estar activo. */
export const SOCIAL: { id: "instagram" | "x" | "tiktok"; label: string; url: string }[] = [
  { id: "instagram", label: "Instagram", url: "" },
  { id: "x", label: "X", url: "" },
  { id: "tiktok", label: "TikTok", url: "" },
];
