import { Album } from "@/components/Album";
export const metadata = { title: "Álbum de figuritas · Fútbol de Primera" };
export default function Page() {
  return (
    <>
      <h1 className="hero-title" style={{ fontSize: "clamp(28px,7vw,44px)" }}>El <span className="hl">álbum</span></h1>
      <p className="lead">Juntá las figuritas de los cracks jugando los retos del día.</p>
      <Album />
    </>
  );
}
