import Link from "next/link";
import { CONTACT_EMAIL, REAL_CRESTS } from "@/lib/site";

/** Pie de página con el aviso sobre escudos y el contacto para bajas. */
export function Footer() {
  return (
    <footer className="footer">
      <span>Fútbol de Primera · Proyecto de fans, sin relación con clubes, ligas ni federaciones.</span>
      <span>
        {REAL_CRESTS ? "Los escudos pertenecen a sus clubes y se muestran solo para identificarlos. " : "Escudos y trofeos ilustrados por nosotros, no oficiales. "}
        <Link href="/aviso-legal">Aviso legal</Link> · <a href={`mailto:${CONTACT_EMAIL}?subject=Pedido%20de%20baja%20-%20F%C3%BAtbol%20de%20Primera`}>Pedidos de baja</a>
      </span>
    </footer>
  );
}

export function LegalNotice() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}?subject=Pedido%20de%20baja%20-%20F%C3%BAtbol%20de%20Primera`}>{CONTACT_EMAIL}</a>;
  return (
    <div className="legal">
      <h1>Aviso legal</h1>
      <p className="lead">Fútbol de Primera es un proyecto de fans, independiente y sin fines comerciales más allá de donaciones voluntarias.</p>
      <h2>Sin relación oficial</h2>
      <p>No tenemos relación, patrocinio ni aval de ningún club, liga, federación ni confederación (AFA, CONMEBOL, UEFA, FIFA u otras). Los nombres de clubes, competencias y futbolistas se usan solo para identificarlos.</p>
      <h2>Escudos</h2>
      <p>
        {REAL_CRESTS
          ? <>Los escudos son marcas de sus respectivos clubes y les pertenecen. Los usamos para identificar a cada equipo, sin modificarlos ni usarlos en publicidad. Las imágenes se cargan desde TheSportsDB, una base de datos deportiva pública. Cuando un escudo no está disponible, usamos uno ilustrado por nosotros.</>
          : <>Los escudos que se ven son ilustraciones propias hechas con los colores de cada club; no son los escudos oficiales.</>}
      </p>
      <h2>Trofeos y premios</h2>
      <p>Los íconos de copas y premios son ilustraciones propias, inspiradas en los trofeos reales pero no son reproducciones de los diseños oficiales.</p>
      <h2>Datos</h2>
      <p>Las trayectorias, planteles y estadísticas salen de información pública. Pueden tener errores: si ves alguno, avisanos.</p>
      <h2>Pedidos de baja</h2>
      <p>Si sos titular de una marca, escudo o imagen y querés que la saquemos, escribinos a {mail} indicando qué contenido es. Lo retiramos a la brevedad.</p>
    </div>
  );
}
