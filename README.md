# Fútbol de Primera

Minijuegos diarios de fútbol conectados a un modo carrera. *Tu conocimiento real de fútbol es tu stat.*

## Qué hay hoy
**Retos diarios** (iguales para todos, cambian a las 00:00 de Buenos Aires, con archivo de días anteriores):
- **Adiviná el Jugador**: club, liga, país, puesto, edad y dorsal.
- **Adiviná el DT**: equipo, liga, país, edad, cómo jugaba y año de debut.
- **Trayectoria** / **Trayectoria DT**: cada error revela el siguiente club de la carrera.
- **Armá el 11**: cada posición tiene una consigna (país, liga, club, edad, dorsal); 3 errores y roja.
- **Palabra Crack**: el apellido letra por letra.
- **Bingo Futbolero**: ubicá a cada jugador que sale en la casilla que cumple.

**Modo Carrera**: creás un jugador, debutás, tomás decisiones entre partidos y en cada partido jugás
momentos (precisión + trivia real). La reputación de los retos diarios da nivel inicial y mejores pruebas,
y ganar un reto hoy desbloquea un entrenamiento especial. Ficha final como imagen.

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
    career/            motor del Modo Carrera (eventos, partidos, temporadas, trivia)
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
1. **Datos**: revisar clubes, dorsales, trayectorias (`careers.json`) y el puesto de los DTs (`playedAs`). Están escritos de memoria.
2. **Supabase**: implementar `SupabaseLeagueService` con la interfaz de `lib/leagues/types.ts` y migrar `progress.ts` a las tablas `profiles` y `daily_results`. Para evitar trampas, el objetivo del día y la validación tienen que pasar al servidor.
3. **Fase 2**: el Modo Carrera consume `profile.reputation` y `profile.results`.

## Legal
Solo usamos nombres y datos públicos. No usamos escudos, fotos ni marcas oficiales.
