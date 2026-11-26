import type { Pattern } from "@/lib/clubs";

/** Dibuja el patrón de camiseta dentro de un área 0..100 x 0..100 (se recorta afuera con clipPath). */
export function PatternFill({ pattern, base, accent }: { pattern: Pattern; base: string; accent: string }) {
  const bg = <rect x="0" y="0" width="100" height="100" style={{ fill: base }} />;
  switch (pattern) {
    case "stripes":
      return (
        <>
          {bg}
          {[10, 34, 58, 82].map((x) => <rect key={x} x={x} y="0" width="12" height="100" fill={accent} />)}
        </>
      );
    case "hoops":
      return (
        <>
          {bg}
          {[8, 32, 56, 80].map((y) => <rect key={y} x="0" y={y} width="100" height="12" fill={accent} />)}
        </>
      );
    case "sash":
      return (
        <>
          {bg}
          <polygon points="0,18 18,0 100,82 82,100" fill={accent} transform="scale(-1,1) translate(-100,0)" />
        </>
      );
    case "band":
      return (
        <>
          {bg}
          <rect x="0" y="38" width="100" height="22" fill={accent} />
        </>
      );
    case "halves":
      return (
        <>
          {bg}
          <rect x="50" y="0" width="50" height="100" fill={accent} />
        </>
      );
    case "chevron":
      return (
        <>
          {bg}
          <polygon points="12,10 30,10 50,52 70,10 88,10 50,78" fill={accent} />
        </>
      );
    case "centerStripe":
      return (
        <>
          {bg}
          <rect x="36" y="0" width="28" height="100" fill={accent} />
          <rect x="33" y="0" width="3" height="100" fill="#fff" />
          <rect x="64" y="0" width="3" height="100" fill="#fff" />
        </>
      );
    case "sleeves":
    case "plain":
    default:
      return bg;
  }
}
