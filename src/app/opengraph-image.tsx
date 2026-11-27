import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Fútbol de Primera · El que sabe, juega";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen para cuando se comparte el link (WhatsApp, X, etc.). */
export default async function OG() {
  // Barlow Condensed 900 itálica (la de la marca), desde el paquete local: no depende de la red al compilar.
  const barlow = await readFile(join(process.cwd(), "node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-900-italic.woff"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "radial-gradient(circle at 75% 15%, #173563 0%, #0B1D3A 60%)", color: "#F4F7FA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="190" height="171" viewBox="62 10 266 240">
            <circle cx="226" cy="146" r="58" fill="#F4F7FA" />
            <clipPath id="ball"><circle cx="226" cy="146" r="58" /></clipPath>
            <g clipPath="url(#ball)" fill="#0B1D3A">
              <path d="M240.6 129.6 L255 146.7 L243.1 165.6 L221.4 160.2 L219.9 137.9 Z" />
              <path d="M254 118.3 L264 101 L283.6 105.2 L285.7 125.1 L267.4 133.2 Z" />
              <path d="M269.8 156 L289.3 160.1 L291.4 180 L273.2 188.1 L259.8 173.3 Z" />
              <path d="M238.9 182.6 L241 202.5 L222.7 210.6 L209.3 195.7 L219.3 178.4 Z" />
              <path d="M204 161.4 L185.7 169.5 L172.4 154.7 L182.3 137.4 L201.9 141.5 Z" />
              <path d="M213.3 121.7 L200 106.8 L210 89.5 L229.5 93.7 L231.6 113.6 Z" />
            </g>
            <path d="M240.6 129.6 L244 116 M255 146.7 L268.9 145.7 M243.1 165.6 L248.4 178.6 M221.4 160.2 L210.7 169.2 M219.9 137.9 L208 130.5" stroke="#0B1D3A" strokeWidth="5" strokeLinecap="round" />
            <path d="M132 40 L210 16 L172 236 L106 236 L136 98 L84 118 L76 76 Z" fill="#F4F7FA" stroke="#0B1D3A" strokeWidth="8" strokeLinejoin="round" />
            <path d="M60.2 197 L58.6 201.4 L58.1 206.1 L58.5 210.7 L59.8 215.4 L61.9 219.9 L64.8 224.2 L68.5 228.1 L72.8 231.8 L77.8 235 L83.3 237.9 L89.4 240.3 L96 242.4 L103 244 L110.4 245.3 L118.1 246.1 L126.3 246.6 L134.7 246.7 L143.4 246.4 L152.2 244.9 L161.1 243.1 L170.1 240.9 L179.2 238.4 L188.3 235.6 L197.5 232.4 L206.6 229 L215.6 225.3 L224.5 221.3 L233.2 217 L241.7 212.6 L250 207.9 L258.1 203 L265.8 198 L273.2 192.8 L280.3 187.4 L286.9 182 L293.1 176.4 L298.9 170.8 L304.1 165.1 L308.9 159.4 L313.1 153.7 L316.8 148 L319.9 142.3 L322.4 136.7 L324.2 131.1 L325.4 125.6 L325.9 120.2 L325.7 115 L324.8 110.1 L323.1 105.4 L320.8 101.2 L317.8 97.3 L314.3 93.9 L310.3 91 L305.7 88.5 L300.8 86.4 L295.4 84.7 L289.6 83.4 L283.5 82.6 L276.9 82.2 L270 82.4 L270 82.4 L276.7 83.8 L282.9 85.4 L288.6 87.2 L293.8 89.2 L298.4 91.5 L302.5 94.1 L305.9 96.8 L308.7 99.7 L310.8 102.7 L312.4 105.8 L313.5 108.9 L314 112.2 L314.1 115.6 L313.7 119.1 L312.7 122.9 L311.3 126.8 L309.4 130.9 L306.9 135.1 L303.9 139.5 L300.3 144 L296.2 148.6 L291.7 153.2 L286.6 157.9 L281.1 162.5 L275.1 167.2 L268.7 171.7 L261.9 176.2 L254.8 180.5 L247.3 184.7 L239.6 188.8 L231.6 192.7 L223.5 196.4 L215.2 199.8 L206.7 203.1 L198.2 206 L189.6 208.7 L181.1 211.2 L172.6 213.3 L164.2 215.1 L155.9 216.6 L147.8 217.8 L140 218.6 L132.5 220 L125.3 221 L118.3 221.7 L111.7 222.1 L105.4 222.2 L99.6 222 L94.1 221.5 L89.1 220.8 L84.5 219.7 L80.3 218.5 L76.5 217 L73.2 215.2 L70.2 213.2 L67.6 210.8 L65.3 208.1 L63.4 204.9 L61.8 201.2 L60.2 197 Z" fill="#22D169" />
          </svg>
          <div style={{ width: 7, height: 130, background: "#22D169", borderRadius: 4 }} />
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Barlow", fontStyle: "italic", fontWeight: 900, lineHeight: 0.95 }}><span style={{ fontSize: 72 }}>FÚTBOL DE</span><span style={{ fontSize: 116 }}>PRIMERA</span></div>
        </div>
        <div style={{ fontSize: 56, marginTop: 30, color: "#22D169", fontFamily: "Barlow", fontStyle: "italic", fontWeight: 900 }}>El que sabe, juega.</div>
        <div style={{ fontSize: 34, marginTop: 18, color: "#c9d3e3", maxWidth: 1000 }}>Adiviná el jugador y el DT del día, armá el 11, jugá tu carrera y competí con tus amigos.</div>
        <div style={{ display: "flex", height: 10, marginTop: 50, width: 1040, background: "#22D169", borderRadius: 5 }} />
      </div>
    ),
    { ...size, fonts: [{ name: "Barlow", data: barlow, style: "italic", weight: 900 }] },
  );
}
