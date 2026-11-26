import { Catalog } from "@/components/career/Catalog";
export const metadata = { title: "Vitrina · Fútbol de Primera" };
export default function Page() {
  return (
    <>
      <h1 className="hero-title" style={{ fontSize: "clamp(28px,7vw,44px)" }}>La <span className="hl">vitrina</span></h1>
      <p className="lead">Todo lo que podés ganar en el Modo Carrera: títulos, premios individuales y logros.</p>
      <Catalog />
    </>
  );
}
