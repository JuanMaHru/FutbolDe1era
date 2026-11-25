import { HomeCards } from "@/components/HomeCards";

export default function Home() {
  return (
    <>
      <h1>El que sabe, juega.</h1>
      <p className="lead">
        Dos retos por día, iguales para todos. Tu conocimiento de fútbol es tu stat: cada acierto suma para tu liga y para tu
        carrera.
      </p>
      <HomeCards />
    </>
  );
}
