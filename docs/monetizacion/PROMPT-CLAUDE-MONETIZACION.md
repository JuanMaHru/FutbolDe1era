# Prompt para Claude Code — Monetización FdP v1.1

Implementá por etapas el modelo aprobado en `MODELO-MONETIZACION-FDP.md`.

## Decisiones comerciales ya aprobadas
- FdP+ mensual: ARS 2.990.
- FdP+ anual: ARS 29.900, aproximadamente 16,7% de descuento respecto de doce pagos mensuales.
- Lanzar FdP+ y tienda en la misma versión comercial.
- Todos los cosméticos comprados o reclamados como recompensa FdP+ son permanentes.
- Los beneficios de servicio de FdP+ (sin anuncios, estadísticas avanzadas e historial ampliado) solo duran mientras la suscripción esté activa.
- Monedas FdP gratuitas; no vender moneda premium en esta primera versión.
- Publicidad discreta para usuarios gratuitos y sin anuncios de terceros para FdP+.
- Todos los juegos y rankings siguen siendo gratuitos y justos.

## Antes de programar: auditoría obligatoria
1. Inspeccioná framework, estructura, backend, base de datos, autenticación y hosting.
2. Localizá la integración actual de donaciones de Mercado Pago: endpoints, credenciales, webhooks, modelos y flujo completo.
3. Identificá si utiliza Checkout Pro, Checkout API, Orders o Suscripciones.
4. Verificá con documentación oficial vigente qué producto de Mercado Pago está habilitado y soporta el ciclo mensual y anual requerido. No supongas capacidades de la cuenta.
5. Presentá diagnóstico, archivos a modificar, migraciones, riesgos y plan.
6. No escribas ni modifiques código de pagos hasta entregar el diagnóstico y recibir aprobación.

## Implementación por fases
A. Auditoría y preservación de donaciones existentes.
B. Infraestructura común: catálogo server-side, órdenes, eventos, entitlements, historial y webhook idempotente.
C. FdP+ mensual y anual, cancelación, renovación, estados y período de gracia.
D. Tienda de 5-8 cosméticos, checkout, inventario permanente y equipar/quitar.
E. Monedas gratuitas y ledger.
F. Publicidad discreta para usuarios gratuitos y exclusión automática para FdP+.

Aunque FdP+ y tienda se lanzan simultáneamente al público, desarrollá y probá internamente por fases/feature flags. No habilites pagos reales hasta que ambas estén probadas de punta a punta.

## Reglas de negocio
- Los precios, SKU, user_id y beneficios se validan exclusivamente en servidor.
- Nunca activar FdP+ ni entregar cosméticos por el redirect del checkout.
- Validar notificación y consultar el pago/suscripción desde backend.
- Procesar webhooks de forma idempotente.
- Un cosmético comprado o reclamado durante FdP+ queda permanentemente en inventario.
- Al vencer FdP+, conservar cosméticos; desactivar solo beneficios de servicio.
- Cancelar significa detener futuras renovaciones, conservando acceso hasta el fin del período abonado.
- Gestionar pagos pendientes, rechazados, aprobados, renovaciones, cancelaciones, reembolsos y contracargos.
- Access Token y secretos solo en backend.
- No almacenar información de tarjetas.
- No introducir sobres aleatorios pagos ni moneda premium comprable.
- No modificar juegos, puntuaciones, rankings ni oportunidades competitivas para favorecer a suscriptores.

## Pruebas mínimas
- Checkout de producto y suscripción mensual/anual.
- Pago aprobado, pendiente y rechazado.
- Webhook duplicado y fuera de orden.
- Precio manipulado desde cliente.
- Usuario intentando comprar para otro usuario.
- Renovación aprobada y fallida.
- Cancelación y vencimiento.
- Reembolso y contracargo.
- Compra repetida del mismo cosmético.
- Cosmético reclamado por FdP+ que debe permanecer tras vencimiento.
- Donación anónima y asociada a usuario.
- Usuario gratuito ve anuncios y usuario FdP+ activo no ve anuncios de terceros.

## Entrega después de cada fase
- Archivos modificados.
- Migraciones ejecutadas.
- Variables de entorno nuevas.
- Tests y resultados.
- Pasos para probar en sandbox.
- Riesgos y decisiones pendientes.

No desplegar ni activar cobros reales sin aprobación explícita.
