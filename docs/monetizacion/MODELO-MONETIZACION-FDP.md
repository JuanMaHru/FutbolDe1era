# Fútbol de Primera — Modelo de monetización v1.1

Documento actualizado con las decisiones comerciales aprobadas. Precios en ARS como hipótesis iniciales para validar; no constituyen cotización de Mercado Pago ni asesoramiento contable/legal.

## 1. Decisiones aprobadas

- FdP+: membresía mensual y anual con descuento.
- Tienda: cosméticos, coleccionables y personalización.
- Publicidad: discreta para usuarios gratuitos; FdP+ elimina anuncios de terceros.
- Compras: monedas gratuitas + compras directas en pesos. No habrá moneda premium comprable en la primera versión.
- Todos los cosméticos desbloqueados o comprados son permanentes, incluidos los obtenidos mediante FdP+.
- Lanzamiento comercial: FdP+ y tienda se lanzan simultáneamente.
- Todos los juegos principales, desafíos diarios y competencias permanecen gratuitos.
- No pay-to-win: no vender respuestas, pistas competitivas, intentos extra, multiplicadores de XP ni ventajas de ranking.

## 2. Modelo económico

### Capas
1. Gratis: juegos principales, retos diarios, ligas, perfil básico, monedas gratuitas, catálogo de cosméticos gratuitos y publicidad discreta.
2. FdP+: membresía mensual/anual; elimina anuncios de terceros y habilita estadísticas avanzadas, historial ampliado y recompensas cosméticas exclusivas.
3. Tienda: compras puntuales en ARS de cosméticos y coleccionables de contenido definido.
4. Donaciones: aportes voluntarios, separados de compras y sin ventajas competitivas.
5. Patrocinios: desafíos y espacios identificados como patrocinados, a incorporar cuando exista audiencia medible.

### Precios iniciales para testear
| Producto | Precio sugerido |
|---|---:|
| FdP+ mensual | ARS 2.990 |
| FdP+ anual | ARS 29.900 |
| Marco de perfil | ARS 990 |
| Fondo de perfil | ARS 1.490 |
| Insignia especial | ARS 1.490 |
| Tema visual | ARS 1.990 |
| Pack cosmético fijo | ARS 2.490 |
| Colección temática fija | ARS 3.490 |
| Donación única | ARS 1.000 / 2.500 / 5.000 / personalizado |

El precio anual de ARS 29.900 equivale a aproximadamente 10 meses al precio mensual de ARS 2.990 (alrededor de 16,7% de descuento frente a 12 pagos mensuales). Validar precios por inflación, comisiones, impuestos, costos y disposición a pagar. Mostrar siempre precio final, período de facturación, renovación automática y condiciones antes de confirmar.

No lanzar precio anual promocional adicional ni múltiples niveles de membresía en la primera versión.

## 3. FdP+: beneficios y permanencia

### Beneficios activos mientras la suscripción esté vigente
- Experiencia sin anuncios de terceros.
- Estadísticas avanzadas: evolución de precisión, rendimiento por categoría y comparativas temporales.
- Historial ampliado de resultados.
- Acceso a reportes y recapitulaciones premium.
- Insignia FdP+ visible y opcional.

### Cosméticos de FdP+
Los cosméticos que el usuario desbloquee y reclame durante su membresía son permanentes. Al vencer o cancelar la suscripción:
- conserva todos los cosméticos ya reclamados;
- deja de recibir nuevas recompensas exclusivas de suscripción;
- pierde los beneficios de servicio que dependen de una membresía activa, como quitar anuncios y estadísticas premium.

Distinguir en base de datos los `entitlements` temporales de suscripción de los artículos permanentes del inventario. Nunca eliminar cosméticos permanentes al cancelar FdP+.

### No incluye
- Más intentos en desafíos diarios competitivos.
- Pistas adicionales que faciliten respuestas.
- Multiplicadores de XP o puntos de liga.
- Respuestas correctas anticipadas.
- Exclusividad sobre juegos necesarios para competir.

La membresía se puede cancelar. La cancelación detiene la renovación; el acceso permanece hasta el final del período ya abonado, salvo que el proveedor o la normativa aplicable exijan otro tratamiento.

## 4. Catálogo inicial de tienda

### Cosméticos
- Marcos de avatar: clásico, retro, campeón, noche de estadio.
- Fondos de perfil: cancha, tribuna, vestuario, papel de figurita.
- Temas visuales: retro editorial, estadio nocturno, transmisión deportiva.
- Insignias: goleador, estratega, detective, histórico.
- Efectos de celebración en el perfil, no durante el juego competitivo.

### Coleccionables
- Figuritas de jugadores, clubes, selecciones y estadios.
- Álbumes temáticos con progreso.
- Sets gratuitos obtenibles jugando y sets pagos de contenido fijo.
- En la primera versión, no vender sobres aleatorios pagos. Los productos pagos deben informar exactamente qué contenido incluyen. Si en el futuro se evalúa aleatoriedad, publicar probabilidades y reglas y revisar obligaciones legales antes de habilitarla.

### Permanencia y propiedad
- Toda compra individual aprobada concede el cosmético permanentemente.
- Todo cosmético FdP+ que se desbloquee y reclame durante una suscripción activa permanece en el inventario.
- Los cosméticos no se convierten en dinero, no se transfieren ni se revenden en la primera versión.
- Las compras deben estar asociadas a una cuenta autenticada.
- En caso de reembolso o contracargo, revisar el derecho de acceso al artículo y registrar la decisión de forma auditable; no borrar silenciosamente el historial.

## 5. Monedas gratuitas

- Nombre: Monedas FdP.
- Se obtienen por misiones, logros y actividad legítima.
- Se gastan en una selección de cosméticos básicos.
- No se compran con dinero real en la primera versión.
- No se convierten a dinero ni se transfieren.
- Definir límites diarios/semanales y validación server-side para evitar farming automatizado.
- Mantener un ledger inmutable de créditos y débitos.

## 6. Publicidad

Usuarios gratuitos:
- Un bloque no intrusivo en home/catálogo.
- Un bloque al finalizar una sesión, nunca durante una partida ni entre pregunta y respuesta.
- Patrocinios editoriales señalizados como “Patrocinado”.

FdP+:
- Sin anuncios de terceros mientras el entitlement esté activo.
- Los patrocinios integrados a desafíos deben estar claramente identificados; definir su tratamiento en las condiciones de FdP+.

No implementar anuncios recompensados para obtener pistas, intentos o ventajas competitivas.

## 7. Flujos de pago

### A. FdP+ mensual y anual
1. Usuario autenticado elige plan mensual o anual.
2. Backend obtiene plan y precio desde catálogo propio, no desde datos enviados por el cliente.
3. Backend crea el flujo de suscripción usando el producto de Mercado Pago habilitado y documentado para la cuenta.
4. Usuario autoriza el medio de pago en el entorno de Mercado Pago.
5. Frontend muestra estado pendiente; no activa FdP+ por el redirect.
6. Webhook notifica cambio de estado.
7. Backend valida origen/firma según documentación vigente y consulta el estado real de la suscripción/pago.
8. Backend procesa el evento de forma idempotente y actualiza entitlement temporal.
9. Renovaciones aprobadas extienden el período; fallos entran en estado de gracia configurable y luego suspenden beneficios temporales si no se regulariza.
10. Cancelación detiene renovaciones futuras, pero mantiene acceso hasta el final del período abonado.
11. Mostrar en cuenta plan, estado, próximo cobro y forma de cancelar.

La duración anual debe configurarse como período anual real en el producto de suscripción admitido por Mercado Pago; no simular doce cobros mensuales si se está vendiendo una suscripción anual de un solo cobro.

### B. Compra puntual de cosmético
1. Usuario autenticado elige SKU.
2. Backend valida SKU, precio vigente, disponibilidad y propiedad previa.
3. Backend crea checkout por el importe guardado en servidor.
4. Usuario paga.
5. Webhook notifica.
6. Backend consulta y verifica el pago.
7. Backend acredita el cosmético una sola vez.
8. Artículo queda permanente en inventario.

### C. Donación
1. Usuario elige importe fijo o personalizado.
2. Backend crea pago.
3. Webhook confirma.
4. Se registra como donación, separada de compras y sin entitlement automático.
5. Reconocimiento público requiere consentimiento expreso.

### Estados recomendados
- `created`
- `pending`
- `approved`
- `rejected`
- `cancelled`
- `refunded`
- `charged_back`

No conceder artículos ni membresías en estados pendientes, rechazados o cancelados.

## 8. Arquitectura técnica sugerida

Frontend:
- `/premium`
- `/tienda`
- `/mi-cuenta/suscripcion`
- `/mi-cuenta/inventario`
- `/donar`

Backend:
- `POST /api/billing/create-checkout`
- `POST /api/billing/create-subscription`
- `POST /api/webhooks/mercadopago`
- `GET /api/me/entitlements`
- `GET /api/me/purchases`
- `POST /api/subscription/cancel` (si se gestiona desde la app y la API seleccionada lo permite)

Tablas sugeridas:
- `products`: `id`, `sku`, `name`, `type`, `price_ars`, `billing_period`, `active`, `metadata`
- `orders`: `id`, `user_id`, `product_id`, `amount_ars`, `currency`, `status`, `provider`, `provider_payment_id`, `created_at`
- `payment_events`: `id`, `provider_event_id`, `payload_hash`, `processed_at`, `status`
- `subscriptions`: `id`, `user_id`, `plan` (`monthly`/`annual`), `provider_subscription_id`, `status`, `current_period_start`, `current_period_end`, `cancel_at_period_end`
- `entitlements`: `id`, `user_id`, `entitlement_key`, `source`, `starts_at`, `ends_at`, `status`
- `inventory`: `id`, `user_id`, `cosmetic_id`, `source_order_id`, `source` (`purchase`/`fdp_plus_reward`/`free_reward`), `granted_at`, `is_permanent`
- `wallet_ledger`: `id`, `user_id`, `currency` (`fdp_coin`), `amount`, `reason`, `reference_id`, `created_at`
- `donations`: `id`, `user_id` nullable, `amount_ars`, `status`, `provider_payment_id`

Mantener precios y SKU en servidor. Nunca confiar en importe, producto, usuario o entitlement enviados por el navegador.

## 9. Seguridad y confiabilidad

- Access Token solo en variables de entorno del servidor.
- Verificar notificaciones conforme al mecanismo oficial vigente.
- Consultar pago/suscripción en servidor antes de conceder beneficios.
- Idempotencia por ID de evento y de pago.
- Guardar logs sin exponer datos sensibles.
- Validar usuario autenticado y propiedad de compra.
- Rate limiting en checkout y webhook.
- No almacenar datos de tarjetas.
- Gestionar reembolsos y contracargos de forma auditable.
- Probar pagos aprobados, pendientes, rechazados, eventos duplicados/fuera de orden, reembolsos, cancelaciones y renovaciones fallidas en sandbox.
- Revisar términos, impuestos, facturación, protección al consumidor, privacidad y condiciones de suscripción aplicables en Argentina con asesoramiento profesional.

## 10. Plan de implementación por etapas

### Etapa 0 — Auditoría y definición técnica
Entregables:
- Mapa del stack, autenticación, base de datos, hosting y backend.
- Auditoría del flujo actual de donaciones.
- Identificación del producto de Mercado Pago usado y disponibilidad real de Suscripciones mensual/anual.
- Inventario de endpoints, webhooks, variables y migraciones.
- Plan de cambios por archivo y riesgos.

Criterio de salida: diagnóstico aprobado. No cambiar pagos existentes todavía.

### Etapa 1 — Infraestructura comercial común
Entregables:
- Catálogo server-side de productos y planes.
- Modelo de órdenes, eventos de pago y entitlements.
- Webhook robusto e idempotente.
- Historial de compras.
- Migraciones y pruebas.
- Donaciones actuales preservadas.

Criterio de salida: flujos de prueba procesan correctamente eventos repetidos y fuera de orden; no se entregan beneficios por redirect.

### Etapa 2 — Lanzamiento simultáneo de FdP+ y tienda
Implementar ambos en una misma versión comercial, pero habilitar internamente por feature flags y probar primero con cuentas de test.

FdP+:
- Plan mensual ARS 2.990.
- Plan anual ARS 29.900.
- Página comparativa de planes y condiciones.
- Checkout y gestión de suscripción.
- Beneficios temporales: `remove_ads`, `advanced_stats`, `extended_history`.
- Cosméticos de membresía: se reclaman durante la suscripción y son permanentes.
- Cancelación y vencimiento.

Tienda:
- Primer catálogo de 5-8 cosméticos.
- Compra directa en ARS.
- Inventario permanente.
- Equipar/quitar artículos.
- Monedas gratuitas con ledger, sin venta de moneda premium.

Criterio de salida: pruebas completas de compra, suscripción, renovación, cancelación, reembolso y entrega permanente de cosméticos.

### Etapa 3 — Publicidad y experiencia por plan
Entregables:
- Espacios publicitarios discretos para usuarios gratuitos.
- Supresión automática de anuncios para FdP+.
- Patrocinios identificados.
- Pruebas de layout, rendimiento y accesibilidad.

Criterio de salida: anuncios nunca interrumpen partidas y desaparecen para membresías activas.

### Etapa 4 — Optimización comercial
Entregables:
- Dashboard de conversión, MRR, churn, ARPPU, compras, reembolsos y net revenue.
- Pruebas de precio y presentación.
- Análisis de retención de suscriptores.
- Nuevos cosméticos según demanda.

Criterio de salida: decisiones basadas en datos; no lanzar más complejidad económica sin validar uso.

## 11. Métricas económicas

- `pay_conversion`: pagadores / usuarios activos.
- `subscription_conversion`: suscriptores / usuarios activos.
- `MRR`: ingreso recurrente mensual normalizado.
- `ARR`: MRR × 12 como estimación anualizada, no dinero ya cobrado.
- `ARPPU`: ingreso promedio por usuario pagador.
- `subscriber_churn`: cancelaciones / suscriptores al inicio del período.
- `refund_rate`: reembolsos / pagos aprobados.
- `net_revenue`: cobros menos comisiones, impuestos, reembolsos y costos variables.
- `ad_revenue_per_user`: ingreso publicitario / usuarios gratuitos activos.
- `cosmetic_attach_rate`: compradores de cosméticos / usuarios activos.
- `annual_plan_mix`: suscripciones anuales / total de nuevas suscripciones.

No optimizar solo por facturación: vigilar retención, finalización de partidas, confianza y percepción de justicia.

## 12. Decisiones pendientes antes de programar

1. Confirmar proveedor de autenticación y base de datos.
2. Revisar implementación actual de Mercado Pago y webhook.
3. Confirmar en la cuenta qué producto/API admite suscripciones mensuales y anuales y sus condiciones.
4. Confirmar cómo se comportan pagos pendientes/rechazados y reintentos para el producto elegido.
5. Definir facturación, impuestos, política de cancelación/reembolso, términos y privacidad con asesoramiento profesional.
6. Confirmar la política de anuncios y patrocinadores para miembros.

## 13. Criterio de lanzamiento

No habilitar pagos reales hasta que:
- webhook verifique y procese eventos de forma segura;
- no se pueda duplicar una compra;
- frontend no pueda modificar precios;
- cancelaciones y reembolsos se reflejen;
- usuario pueda ver y gestionar sus planes;
- cosméticos reclamados sean permanentes;
- beneficios de servicio expiren correctamente;
- juegos y rankings no favorezcan a clientes pagos;
- términos y política de privacidad estén publicados.
