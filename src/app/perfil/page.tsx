import { Perfil } from "@/components/Perfil";
export const metadata = { title: "Tu perfil · Fútbol de Primera" };
export default function Page() {
  return (
    <>
      <h1 className="hero-title" style={{ fontSize: "clamp(28px,7vw,44px)" }}>Tu <span className="hl">perfil</span></h1>
      <Perfil />
    </>
  );
}
