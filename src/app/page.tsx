import { HomeCards } from "@/components/HomeCards";
import { ClubBanner } from "@/components/ClubBanner";

export default function Home() {
  return (
    <>
      <h1 className="hero-title">El que sabe, <span className="hl">juega.</span></h1>
      <p className="lead">
        Retos diarios iguales para todos. Tu conocimiento de fútbol es tu stat: cada acierto suma para tu liga y para tu carrera.
      </p>
      <ClubBanner />
      <HomeCards />
    </>
  );
}
