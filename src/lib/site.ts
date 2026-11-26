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

/**
 * Donaciones por Mercado Pago. Completar con tus links de pago (uno por monto) y/o tu alias.
 * Cómo crear un link: app de Mercado Pago → Cobrar → Link de pago → monto y descripción "Apoyo a Fútbol de Primera".
 * Mientras esté vacío, el botón muestra "Próximamente".
 */
export const DONATE: { links: { amount: string; label: string; url: string }[]; alias: string; freeAmountUrl: string } = {
  links: [
    { amount: "$1.000", label: "Un sobre de figuritas 🃏", url: "" },
    { amount: "$3.000", label: "El chori de la previa 🌭", url: "" },
    { amount: "$5.000", label: "Una entrada a la cancha 🎟️", url: "" },
  ],
  /** Alias de Mercado Pago para transferir cualquier monto (ej.: futbol.de.primera.mp). */
  alias: "juanmahru",
  /** Opcional: link con monto libre (p. ej. un link.mercadopago.com.ar/tuusuario). */
  freeAmountUrl: "",
};
export const donationsReady = () => DONATE.links.some((l) => l.url) || !!DONATE.alias || !!DONATE.freeAmountUrl;
