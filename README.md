# Fútbol de Primera

Minijuegos diarios de fútbol conectados a un modo carrera. *Tu conocimiento real de fútbol es tu stat.*

## Fase 1 (este prototipo)
- **Adiviná el jugador**: club, liga, país, posición, edad y dorsal. 8 intentos.
- **Adiviná el DT**: equipo, liga, país, edad, esquema y año de debut. 8 intentos.
- El reto diario es el mismo para todos y cambia a medianoche de Buenos Aires.
- Resultado compartible con emojis, rachas, distribución de intentos y modo práctica.
- **Ligas entre amigos** con código de 6 caracteres y tabla semanal (de lunes a domingo).
- **Reputación**: la moneda que conecta con el Modo Carrera de la Fase 2.

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
  data/                players.json, coaches.json   ← base editable (JSON)
  lib/
    game/              lógica pura y testeable, sin React
      types.ts         Entity, Attribute, Cell, GameDefinition
      meta.ts          países→confederación, ligas→región, posiciones→línea
      compare.ts       reglas de verde/amarillo por atributo
      daily.ts         reto del día determinístico (sin repetir hasta completar la lista)
      scoring.ts       puntos y texto para compartir
      games.ts         registro de juegos (agregar un juego = un GameDefinition)
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
1. **Datos**: revisar clubes y dorsales (cambian en cada mercado de pases) y ampliar la base. Las fechas de nacimiento son estables.
2. **Supabase**: implementar `SupabaseLeagueService` con la interfaz de `lib/leagues/types.ts` y migrar `progress.ts` a las tablas `profiles` y `daily_results`. Para evitar trampas, el objetivo del día y la validación tienen que pasar al servidor.
3. **Fase 2**: el Modo Carrera consume `profile.reputation` y `profile.results`.

## Legal
Solo usamos nombres y datos públicos. No usamos escudos, fotos ni marcas oficiales.
