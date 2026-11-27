import { Kit } from "./Kit";
import { Crest } from "./Crest";

export type ModeId = "jugador" | "dt" | "tray" | "traydt" | "ligas" | "archivo" | "carrera" | "wordle" | "bingo" | "once" | "masomenos";

const G = "#22a95b", Y = "#e4a91c", M = "var(--miss)", CH = "#eef4ef", AC = "var(--accent)";

/** Ilustraciones propias para cada tarjeta de modo (SVG, sin imágenes externas). */
export function ModeArt({ mode }: { mode: ModeId }) {
  switch (mode) {
    case "jugador":
      return (
        <div className="art art-jugador">
          <div className="art-float"><Kit club="" label="?" size={66} hidden /></div>
          <div className="art-tiles">
            {[G, Y, M, G, Y, G].map((c, i) => <span key={i} style={{ background: c, animationDelay: `${i * 90}ms` }} />)}
          </div>
        </div>
      );
    case "dt":
      return (
        <svg className="art" viewBox="0 0 160 110" aria-hidden>
          <rect x="44" y="8" width="72" height="96" rx="8" fill="#c9a36b" />
          <rect x="66" y="3" width="28" height="12" rx="4" fill="#8d8d8d" />
          <rect x="51" y="18" width="58" height="80" rx="3" fill="#1f5a3c" />
          <g stroke={CH} strokeWidth="1.4" fill="none" opacity="0.8">
            <rect x="55" y="22" width="50" height="72" />
            <line x1="55" y1="58" x2="105" y2="58" />
            <circle cx="80" cy="58" r="8" />
            <rect x="68" y="22" width="24" height="10" />
            <rect x="68" y="84" width="24" height="10" />
          </g>
          <g style={{ fill: AC }}>{[[64, 44], [80, 40], [96, 44], [70, 70], [90, 70]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.4" />)}</g>
          <g stroke="#e06c5a" strokeWidth="2.4" strokeLinecap="round">
            <path d="M62 52l6 6M68 52l-6 6" /><path d="M92 52l6 6M98 52l-6 6" />
          </g>
          <path d="M70 70 Q80 50 93 46" stroke={AC} strokeWidth="1.6" fill="none" strokeDasharray="3 3" markerEnd="" />
        </svg>
      );
    case "tray":
    case "traydt": {
      const clubs = mode === "tray" ? ["River Plate", "Manchester City", "Atlético de Madrid"] : ["Newell's Old Boys", "Selección de Chile", "Leeds United"];
      return (
        <div className="art art-tray">
          {clubs.map((c, i) => (
            <div key={c} className="tray-step" style={{ animationDelay: `${i * 160}ms` }}>
              <Crest club={c} size={30} />
              <span className="tray-line" />
            </div>
          ))}
          <div className="tray-step tray-q"><span>?</span></div>
        </div>
      );
    }
    case "ligas":
      return (
        <svg className="art" viewBox="0 0 160 110" aria-hidden>
          <rect x="30" y="64" width="32" height="34" rx="3" fill="#9fb8a9" />
          <rect x="64" y="50" width="32" height="48" rx="3" style={{ fill: AC }} />
          <rect x="98" y="74" width="32" height="24" rx="3" fill="#c08a5a" />
          <text x="46" y="86" textAnchor="middle" fontSize="16" fontWeight="900" fill="#0d1a14">2</text>
          <text x="80" y="78" textAnchor="middle" fontSize="18" fontWeight="900" fill="#1b1400">1</text>
          <text x="114" y="92" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0d1a14">3</text>
          <g transform="translate(80 26)">
            <path d="M-14 -16 H14 V-4 C14 8 6 14 0 14 C-6 14 -14 8 -14 -4 Z" style={{ fill: AC }} />
            <path d="M-14 -12 C-24 -12 -24 2 -12 4 M14 -12 C24 -12 24 2 12 4" stroke={AC} strokeWidth="3" fill="none" />
            <rect x="-4" y="14" width="8" height="6" style={{ fill: AC }} /><rect x="-10" y="19" width="20" height="5" rx="2" style={{ fill: AC }} />
          </g>
        </svg>
      );
    case "archivo":
      return (
        <svg className="art" viewBox="0 0 160 110" aria-hidden>
          <rect x="34" y="14" width="92" height="86" rx="10" style={{ fill: "var(--surface-2)", stroke: "var(--line)" }} />
          <rect x="34" y="14" width="92" height="20" rx="10" style={{ fill: AC }} />
          <rect x="34" y="26" width="92" height="8" style={{ fill: AC }} />
          {Array.from({ length: 15 }, (_, i) => {
            const x = 42 + (i % 5) * 16, y = 42 + Math.floor(i / 5) * 18;
            const c = i < 11 ? (i % 4 === 2 ? "#e06c5a" : G) : M;
            return <rect key={i} x={x} y={y} width="12" height="12" rx="3" style={{ fill: c }} />;
          })}
        </svg>
      );
    case "carrera":
      return (
        <svg className="art" viewBox="0 0 160 110" aria-hidden>
          <path d="M14 96 C50 96 40 60 80 62 S120 26 146 18" stroke="#9fb8a9" strokeWidth="3" fill="none" strokeDasharray="5 5" />
          {[[22, 95, "var(--muted)"], [62, 66, G], [104, 46, G], [146, 18, AC]].map(([x, y, c], i) => (
            <circle key={i} cx={x as number} cy={y as number} r={i === 3 ? 10 : 7} style={{ fill: c as string }} stroke="#0d1a14" strokeWidth="2" />
          ))}
          <text x="146" y="22" textAnchor="middle" fontSize="11" fontWeight="900" fill="#1b1400">★</text>
          <g transform="translate(30 30) scale(0.42)"><Kit club="Boca Juniors" label="10" size={100} /></g>
        </svg>
      );
    case "wordle":
      return (
        <div className="art art-word">
          {["G", "O", "L", "E", "S"].map((l, i) => (
            <span key={i} style={{ background: [G, Y, M, G, G][i], animationDelay: `${i * 110}ms` }}>{l}</span>
          ))}
        </div>
      );
    case "masomenos":
      return (
        <div className="art art-mm">
          <span className="mm-a">≈ 90 M€</span>
          <span className="mm-arrows"><b>▲</b><b>▼</b></span>
          <span className="mm-b">?</span>
        </div>
      );
    case "bingo":
      return (
        <div className="art art-bingo">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={[0, 4, 8, 2].includes(i) ? "on" : ""}>{[0, 4, 8, 2].includes(i) ? "✓" : ""}</span>
          ))}
        </div>
      );
    case "once":
      return (
        <svg className="art" viewBox="0 0 160 110" aria-hidden>
          <rect x="20" y="6" width="120" height="98" rx="6" fill="#1f5a3c" />
          <g stroke={CH} strokeWidth="1.2" fill="none" opacity="0.55">
            <rect x="24" y="10" width="112" height="90" /><line x1="24" y1="55" x2="136" y2="55" /><circle cx="80" cy="55" r="11" />
          </g>
          {[[80, 92], [44, 74], [66, 76], [94, 76], [116, 74], [56, 52], [80, 48], [104, 52], [46, 26], [80, 20], [114, 26]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" style={{ fill: i % 3 === 0 ? AC : "rgba(255,255,255,0.25)" }} stroke={i % 3 === 0 ? "#1b1400" : CH} strokeDasharray={i % 3 === 0 ? "" : "2 2"} />
          ))}
        </svg>
      );
  }
}

export function MiniCrests() {
  return (
    <span className="mini-crests" aria-hidden>
      <Crest club="Boca Juniors" size={20} />
      <Crest club="River Plate" size={20} />
      <Crest club="Racing Club" size={20} />
    </span>
  );
}
