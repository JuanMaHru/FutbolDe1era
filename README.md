# Fútbol de Primera

**Jugar:** https://futbol-de1era.vercel.app

Minijuegos diarios de fútbol conectados a un modo carrera. *Tu conocimiento real de fútbol es tu stat.*

## Qué hay hoy
**Retos diarios** (iguales para todos, cambian a las 00:00 de Buenos Aires, con archivo de días anteriores):
- **Adiviná el Jugador**: club, liga, país, puesto, edad y dorsal.
- **Adiviná el DT**: equipo, liga, país, edad, cómo jugaba y año de debut.
- **Trayectoria** / **Trayectoria DT**: cada error revela el siguiente club de la carrera.
- **Armá el 11**: cada posición tiene una consigna (país, liga, club, edad, dorsal); 3 errores y roja.
- **Palabra Crack**: el apellido letra por letra.
- **Bingo Futbolero**: ubicá a cada jugador que sale en la casilla que cumple.
- **Más o Menos**: higher or lower con temáticas (valor de mercado aprox., edad, altura, partidos y goles con la selección, clubes, fundación y estadio), más modo libre.
- **El intruso**: 4 jugadores, tres comparten algo; ¿quién no encaja?
- **¿Quién jugó con quién?**: uní dos jugadores con una cadena de compañeros de equipo.
- **¿En qué año?**: cinco momentos históricos para ubicar en el tiempo.
- **¿De qué club es?**: colores, liga, fundación, estadio y un jugador que pasó por ahí.

**Álbum de figuritas** (`/album`): cada reto terminado da un sobre gratis; fotos libres de Wikimedia Commons con crédito.
**Datos**: verificados contra Wikidata (`tools/resolve_ids.py`, `verify_data.py`, `apply_fixes.py`, `build_bios.py`, `build_hol.py`, `fetch_photos.py`).

**Modo Carrera**: creás un jugador (puesto, estilo, pie, apodo, dorsal) y la suerte decide su potencial
(de "jugador de oficio" a "fenómeno generacional"). Temporadas con formato real: ligas completas con tabla
(38 fechas en Europa, Apertura/Clausura con playoffs en Argentina y México), copas nacionales por rondas,
copas continentales con fase de grupos o fase liga e ida y vuelta, ascensos/descensos y Mundial, Copa América
o Eurocopa con tu selección. Los partidos clave se juegan con minijuegos (con minuto, marcador y situación);
el resto se simula pero cuenta. ~90 eventos con resultados variables y tope de repeticiones. Premios
(Balón de Oro, Bota de Oro, goleador y mejor jugador de la liga, Guante de Oro, Golden Boy), logros de carrera,
ofertas millonarias de Arabia y vuelta al club de origen. Se puede simular una temporada entera.

**Ligas entre amigos** (simuladas en local), **resultado compartible**, **sonidos**, **temas por club**
(la página toma los colores de tu club o selección).

## Correr
```bash
npm install
npm run dev     # http://localhost:3000
npm test        # tests de la lógica (node --test)
npm run build
```

## Estructura
```
src/
  data/                players.json, coaches.json, careers.json (trayectorias) ← base editable
  lib/
    game/              lógica pura y testeable, sin React
      types.ts         Entity, Attribute, Cell, GameDefinition
      meta.ts          países→confederación, ligas→región, posiciones→línea
      compare.ts       reglas de verde/amarillo por atributo
      daily.ts         reto del día determinístico (sin repetir hasta completar la lista)
      scoring.ts       puntos y texto para compartir
      games.ts         registro de juegos (agregar un juego = un GameDefinition)
      daily-games.ts   catálogo de retos diarios (rutas, ids, íconos)
      conditions.ts    consignas + emparejamiento (garantiza 11 y bingo resolubles)
      once.ts, bingo.ts, words.ts, careers.ts
    career/            Modo Carrera: world.ts (ligas, clubes, selecciones), engine.ts (calendario,
                       partidos, temporadas), events.ts (eventos), trivia.ts (preguntas)
    clubs.ts           colores y diseño PROPIOS de cada club (para escudos/camisetas ilustrados)
    theme.ts           temas por club
    sound.ts           efectos sintetizados con Web Audio
    progress.ts        estado diario, estadísticas, perfil/reputación
    storage.ts         localStorage seguro
    leagues/
      types.ts         interfaz LeagueService  ← contrato para el backend
      local.ts         implementación local con rivales "demo"
      week.ts          semanas y códigos
  components/          GuessGame (genérico), GuessInput, LeagueTable…
  app/                 rutas: /, /jugador, /dt, /ligas, /ligas/[code]
tests/
```

## Cómo agregar un juego nuevo con la misma mecánica
Definí un `GameDefinition` (items + atributos con su `compare`) en `lib/game/games.ts` y creá la ruta `app/<id>/page.tsx` con `<GuessGame gameId="<id>" />`.

## Próximos pasos
1. **Datos**: todo está escrito de memoria. Lo marcado con `"check": true` en `players.json` / `coaches.json`
   es lo más dudoso: se puede adivinar pero nunca es la respuesta del día ni entra en la trivia. Al verificarlo,
   borrá la marca. Revisar también `careers.json`. Los scripts de `tools/` muestran cómo se cargaron.
2. **Supabase**: implementar `SupabaseLeagueService` con la interfaz de `lib/leagues/types.ts` y migrar `progress.ts` a las tablas `profiles` y `daily_results`. Para evitar trampas, el objetivo del día y la validación tienen que pasar al servidor.
3. **Fase 2**: el Modo Carrera consume `profile.reputation` y `profile.results`.

## Legal
Usamos nombres y datos públicos. Los escudos de clubes (TheSportsDB) se muestran solo para identificarlos, con aviso legal y contacto para bajas; se apagan con `REAL_CRESTS` en `src/lib/site.ts`. Trofeos e ilustraciones son propios. No usamos fotos.

## Marca
Ver `docs/marca.md` y `public/brand/`. Colores: azul noche `#0B1D3A`, verde cancha `#22D169`, blanco humo `#F4F7FA`. Tipografías: Barlow Condensed y Montserrat.
