import { ImageResponse } from "next/og";

export const alt = "Fútbol de Primera · El que sabe, juega";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen para cuando se comparte el link (WhatsApp, X, etc.). */
export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "radial-gradient(circle at 70% 20%, #1d2a5c 0%, #0b0f1e 60%)", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 130, height: 130, borderRadius: 30, background: "#ff7a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 70, fontWeight: 900, color: "#0b0f1e" }}>1ª</div>
          <div style={{ fontSize: 86, fontWeight: 900, letterSpacing: -2 }}>Fútbol de Primera</div>
        </div>
        <div style={{ fontSize: 46, marginTop: 36, color: "#ffc23d", fontWeight: 800 }}>El que sabe, juega.</div>
        <div style={{ fontSize: 34, marginTop: 18, color: "#c8cde0", maxWidth: 1000 }}>Adiviná el jugador y el DT del día, armá el 11, jugá tu carrera y competí con tus amigos.</div>
        <div style={{ display: "flex", height: 10, marginTop: 50, width: 1040, background: "repeating-linear-gradient(90deg,#ff7a1a 0 60px,#ffc23d 60px 120px)" }} />
      </div>
    ),
    size,
  );
}
