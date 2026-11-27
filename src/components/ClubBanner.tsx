"use client";
import { useEffect, useState } from "react";
import { DEFAULT_THEME, currentTheme } from "@/lib/theme";
import { clubStyle } from "@/lib/clubs";
import { Crest } from "./art/Crest";

const CANTOS = ["Te sigo a todas partes", "Esta hinchada te alienta", "Hasta la muerte con vos", "Mi único amor", "Siempre presente", "La banda no te deja"];

/** Frases propias de cada club (apodos, lemas o títulos de cantos, no letras completas). */
const FRASES: Record<string, string[]> = {
  "Boca Juniors": ["Jugador N° 12", "La Mitad + 1", "Xeneize de corazón"],
  "River Plate": ["Rojo y blanco como mi corazón", "El Más Grande", "Millonario de ley", "Todos menos algunos", "Vivir y jugar con Grandeza"],
  "Racing Club": ["La Academia", "Racing es un sentimiento", "Primer grande"],
  "Independiente": ["Rey de Copas", "Diablo de corazón"],
  "San Lorenzo": ["El Ciclón", "Cuervo de alma"],
  "Huracán": ["El Globo", "Quemero de ley"],
  "Vélez Sarsfield": ["El Fortín", "Fortinero de corazón"],
  "Estudiantes": ["Pincharrata de corazón", "El León"],
  "Gimnasia y Esgrima LP": ["El Lobo", "Mens sana in corpore sano"],
  "Rosario Central": ["Canalla de corazón", "La Academia rosarina"],
  "Newell's Old Boys": ["La Lepra", "Leproso de corazón"],
  "Talleres": ["La T", "El Matador"],
  "Belgrano": ["El Pirata", "Celeste de Alberdi"],
  "Lanús": ["El Granate", "Granate de ley"],
  "Banfield": ["El Taladro"],
  "Argentinos Juniors": ["El Semillero del Mundo", "El Bicho"],
  "Platense": ["El Calamar"],
  "Tigre": ["El Matador de Victoria"],
  "Colón": ["El Sabalero"],
  "Unión": ["El Tatengue"],
  "Chacarita Juniors": ["El Funebrero"],
  "Ferro Carril Oeste": ["Verdolaga de corazón"],
  "Quilmes": ["El Cervecero"],
  "Barcelona": ["Siempre culé", "Més que un club", "Visca el Barça"],
  "Real Madrid": ["¡Hala Madrid!", "Merengue de corazón"],
  "Atlético de Madrid": ["Nunca dejes de creer", "Colchonero de corazón"],
  "Athletic Club": ["Aupa Athletic", "Con cantera y afición"],
  "Real Betis": ["Viva er Betis manque pierda"],
  "Sevilla": ["Sevillista hasta la muerte"],
  "Valencia": ["Amunt Valencia"],
  "Liverpool": ["You'll Never Walk Alone", "This is Anfield"],
  "Manchester United": ["Glory Glory Man United", "Diablos Rojos"],
  "Manchester City": ["Blue Moon", "Citizen de corazón"],
  "Chelsea": ["Keep the blue flag flying high"],
  "Arsenal": ["Victoria Concordia Crescit", "North London is red"],
  "Tottenham": ["To Dare Is To Do", "Come on you Spurs"],
  "Juventus": ["Fino alla fine", "Bianconeri per sempre"],
  "Inter": ["Pazza Inter amala", "Nerazzurri per sempre"],
  "Milan": ["Rossoneri per sempre", "Forza Milan"],
  "Napoli": ["Forza Napoli sempre", "Un giorno all'improvviso"],
  "Roma": ["Forza Roma", "Giallorossi per sempre"],
  "Bayern Múnich": ["Mia san mia"],
  "Borussia Dortmund": ["Echte Liebe", "Die Gelbe Wand"],
  "Paris Saint-Germain": ["Ici c'est Paris"],
  "Olympique de Marsella": ["Droit au but"],
  "Benfica": ["E pluribus unum", "Glorioso"],
  "Porto": ["Somos Porto"],
  "Ajax": ["Wij zijn Ajax"],
  "Flamengo": ["Uma vez Flamengo, sempre Flamengo", "Mengão"],
  "Palmeiras": ["Avanti Palestra", "Verdão"],
  "Corinthians": ["Fiel Torcida", "Timão"],
  "Peñarol": ["Manya de corazón", "Carbonero"],
  "Nacional": ["Bolso de corazón", "El Decano"],
  "Colo-Colo": ["El Cacique", "Popular"],
  "Inter Miami": ["Freedom to dream"],
  "Selección Argentina": ["Vamos, vamos, Argentina", "Muchachos", "Tres estrellas"],
  "Selección de Uruguay": ["Garra charrúa", "La Celeste"],
  "Selección de Brasil": ["Verde-amarela", "Pentacampeão"],
  "Selección de España": ["La Roja", "A por ellos"],
  "Selección de Italia": ["Forza Azzurri"],
  "Selección de Francia": ["Allez les Bleus"],
  "Selección de Alemania": ["Die Mannschaft"],
  "Selección de Inglaterra": ["Three Lions", "It's coming home"],
  "Selección de Colombia": ["La Tricolor"],
  "Selección de México": ["El Tri", "Cielito lindo"],
  "Selección de Chile": ["La Roja de todos"],
  "Selección de Portugal": ["Força Portugal"],
  "Selección de Países Bajos": ["Hup Holland Hup", "La Naranja Mecánica"],
};

/** "Trapo" de hinchada con los colores del club elegido. */
export function ClubBanner() {
  const [theme, setTheme] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => setTheme(currentTheme());
    sync();
    window.addEventListener("primera:theme", sync);
    return () => window.removeEventListener("primera:theme", sync);
  }, []);
  if (theme === null) return null;
  if (theme === DEFAULT_THEME)
    return (
      <div className="trapo-pick">
        <span>🎨 Elegí tu club o selección y la página se viste con sus colores, su trapo y sus festejos.</span>
        <span aria-hidden>↗ botón de colores arriba</span>
      </div>
    );
  const s = clubStyle(theme);
  // Frase propia del club (va rotando por día); si no tiene, una genérica.
  const own = FRASES[theme];
  const day = Math.floor(Date.now() / 86400000);
  const canto = own ? own[day % own.length] : CANTOS[[...theme].reduce((a, c) => a + c.charCodeAt(0), 0) % CANTOS.length];
  return (
    <div className="trapo" role="img" aria-label={`Trapo de ${theme}`}>
      <Crest club={theme} size={58} />
      <div className="trapo-text">
        <span className="trapo-small">{canto}</span>
        <span className="trapo-big">{s.short}</span>
      </div>
    </div>
  );
}
