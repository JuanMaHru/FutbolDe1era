# Fútbol de Primera | Brand Kit

## Concepto
Identidad deportiva/editorial con guiños a la cultura futbolera y al coleccionismo. El símbolo combina:
- **Número 1:** representa “Primera”, jerarquía y competencia.
- **Balón geométrico:** comunica fútbol sin recurrir a un escudo de club.
- **Órbita verde:** aporta sensación de movimiento, velocidad y juego.

La identidad debe funcionar como marca de una plataforma de juegos y desafíos de conocimiento futbolero, no como identidad de un club. Evitar escudos de equipos, camisetas, trofeos específicos o colores asociados a un club.

## Sistema de marca
- `01-logotipo.svg`: logotipo tipográfico. Para piezas donde el nombre sea el protagonista.
- `02-isotipo.svg`: símbolo independiente. Para avatar, favicon y espacios pequeños.
- `03-isologo.svg`: símbolo y nombre integrados en una insignia.
- `04-imagotipo.svg`: símbolo separado del nombre. Versión principal recomendada para el encabezado.
- `04b-imagotipo-claro.svg`: versión clara para fondos oscuros.
- `05-icono-cuadrado.svg`: icono cuadrado listo para adaptar a favicon/app.

Los SVG son vectoriales y escalables. El texto usa fuentes del sistema con preferencia por Barlow Condensed; cargar la fuente en la web para que la composición se vea como fue diseñada. Para un master de imprenta, conviene convertir los textos a contornos en Figma/Illustrator/Inkscape.

## Paleta oficial
| Token | HEX | Uso |
|---|---|---|
| Azul noche | `#0B1D3A` | Color institucional, texto y fondos |
| Verde cancha | `#22D169` | Acentos, movimiento, estados activos |
| Blanco humo | `#F4F7FA` | Texto sobre fondos oscuros y superficies claras |

Reglas:
- No recolorear el logo automáticamente con el tema de cada club/usuario.
- Mantener el verde como acento, no como fondo dominante.
- Sobre fondo claro, usar el imagotipo oscuro.
- Sobre fondo oscuro, usar `04b-imagotipo-claro.svg`.
- No aplicar sombras, biseles, degradados ni contornos extra al logo.

## Tipografía
- **Titulares / marca:** Barlow Condensed, peso 800 o 900, estilo itálico cuando corresponda.
- **Interfaz / textos:** Montserrat, pesos 400–700.
- Fallbacks: `Impact, sans-serif` para titulares; `Arial, sans-serif` para texto.

Google Fonts:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

## Eslogan
**El que sabe, juega.**
Usarlo en portada, secciones promocionales y redes. No es obligatorio incluirlo en el navbar ni en el favicon.

## Recomendaciones de implementación
1. Usar `04-imagotipo.svg` en el navbar, con `04b-imagotipo-claro.svg` cuando el fondo sea oscuro.
2. Usar `05-icono-cuadrado.svg` o `02-isotipo.svg` para favicon y avatar.
3. Mantener un área de seguridad alrededor del logo equivalente al ancho del trazo verde del isotipo.
4. No reducir el imagotipo hasta que el texto sea ilegible. En móvil, cambiar al isotipo.
5. Usar `#0B1D3A` y `#22D169` como tokens de marca; respetar los colores dinámicos de los clubes solo en las zonas de personalización de producto.
6. No modificar funcionalidades, rutas, lógica de juego, datos ni comportamiento responsive al integrar el branding.

## Archivos redibujados
Los SVG de `public/brand/` se redibujaron siguiendo la lámina de identidad (el "1" itálico, la pelota con paneles y la órbita verde afinada). El símbolo y el imagotipo que usa la web están en `src/components/Brand.tsx` (en línea, para usar la fuente cargada). El favicon (`src/app/icon.svg`) es la versión simple sin pelota, que se lee mejor a 16 px. Para imprenta, abrir los SVG y convertir los textos a contornos.

## Nota de producción
Estos archivos son una primera vectorización funcional del concepto aprobado. Son editables y escalables, pero deben considerarse una base de trabajo: antes de publicar, revisar kerning, proporciones y alineación en el editor vectorial y generar versiones finales optimizadas para los tamaños reales del sitio.
