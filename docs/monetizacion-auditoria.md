# Monetización FdP v1.1 — Etapa 0: auditoría y plan

Diagnóstico pedido por `PROMPT-CLAUDE-MONETIZACION.md` antes de escribir código de pagos. **No se modificó ningún flujo de pago.**

## 1. Estado actual del proyecto

| Pieza | Hoy | Para monetizar hace falta |
|---|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript | Igual |
| Hosting | Vercel (`futbol-de1era.vercel.app`) | Igual: las rutas `src/app/api/*` corren como funciones serverless |
| Backend | **No hay** rutas de API | Endpoints de checkout, webhook y entitlements |
| Autenticación | **No hay**: el perfil vive en el navegador | Cuentas (recomendado: Supabase Auth, con email + Google) |
| Base de datos | **No hay**: `localStorage` con prefijo `primera:v1:` | Postgres (recomendado: Supabase, que ya estaba en el plan) |
| Versión de prueba (artifact) | HTML estático sin servidor | No puede cobrar: solo la versión de Vercel |

## 2. Donaciones actuales (Mercado Pago)

- **Cómo funcionan:** `src/lib/site.ts` (`DONATE`) tiene 3 **links de pago** (`mpago.la/…`, $1.000 / $3.000 / $5.000) creados desde la app de Mercado Pago, y el alias `juanmahru` para transferir. `src/components/Donate.tsx` solo abre los links o copia el alias.
- **Producto:** "Link de pago" de Mercado Pago, que usa la infraestructura de Checkout Pro pero se crea a mano en la app.
- **Lo que no hay:** credenciales (Access Token) en el repo, endpoints, webhooks, registro de donaciones ni vínculo con usuarios.
- **Qué preservar:** los 3 links y el alias tienen que seguir funcionando igual mientras se construye lo nuevo. Más adelante se pueden migrar a Checkout Pro desde el backend para registrar cada donación (opcional y con consentimiento para mostrarla).

## 3. Productos de Mercado Pago a usar (confirmar en la cuenta)

No pude consultar la documentación oficial desde este entorno (sin acceso a la red de Mercado Pago), así que esto **hay que confirmarlo** en developers.mercadopago.com y en la cuenta antes de programar:

| Necesidad | Producto probable | Qué verificar |
|---|---|---|
| FdP+ mensual (ARS 2.990) | **Suscripciones** (plan de suscripción / preaprobación) con frecuencia de 1 mes | Que esté habilitado para la cuenta, medios de pago admitidos, reintentos ante cobro rechazado |
| FdP+ anual (ARS 29.900) | **Suscripciones** con frecuencia de 12 meses (un cobro por año) | Que admita frecuencia anual real; **no** simular 12 cobros mensuales |
| Cosméticos (compra única) | **Checkout Pro** (preferencia creada en el servidor) | Notificaciones de pago y consulta del pago por ID |
| Webhooks | Notificaciones (webhooks) con firma | Mecanismo de validación de firma vigente (encabezado `x-signature` y clave secreta) |
| Reembolsos / contracargos | Eventos de pago y de contracargo | Qué eventos llegan y cómo consultarlos |

## 4. Arquitectura propuesta

**Variables de entorno (solo en Vercel, nunca en el cliente):**
- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `FEATURE_BILLING` (apagado por defecto)

**Archivos nuevos:**
- `src/lib/billing/catalog.ts`: productos, SKU y precios (fuente de verdad del servidor).
- `src/lib/billing/mercadopago.ts`: cliente de la API, crear preferencias y suscripciones, y consultar pagos.
- `src/lib/billing/entitlements.ts`: calcular beneficios activos y otorgar inventario.
- `src/app/api/billing/create-checkout/route.ts`
- `src/app/api/billing/create-subscription/route.ts`
- `src/app/api/webhooks/mercadopago/route.ts`: idempotente, valida la firma y consulta el estado real.
- `src/app/api/me/entitlements/route.ts`
- `src/app/api/me/purchases/route.ts`
- `src/app/api/subscription/cancel/route.ts`
- `src/app/premium`, `src/app/tienda`, `src/app/mi-cuenta/{suscripcion,inventario}`.
- `supabase/migrations/0001_billing.sql`: tablas del documento (`products`, `orders`, `payment_events`, `subscriptions`, `entitlements`, `inventory`, `wallet_ledger`, `donations`), con RLS para que cada usuario lea solo lo suyo y solo el servidor escriba.

**Reglas que respeta el diseño:**
- El precio y el SKU salen siempre del catálogo del servidor.
- Nada se otorga por el redirect del checkout: solo por webhook verificado y una consulta posterior a Mercado Pago.
- `payment_events.provider_event_id` es único, así que un evento repetido no se procesa dos veces.
- Los cosméticos van a `inventory` con `is_permanent = true` y no se borran al vencer FdP+.
- Los beneficios de servicio (`remove_ads`, `advanced_stats`, `extended_history`) van a `entitlements` con `ends_at`.
- Los juegos, puntajes y rankings no leen `entitlements`: imposible el pay-to-win por diseño.

## 5. Plan por fases

| Fase | Contenido | Depende de |
|---|---|---|
| 0 | Esta auditoría | — |
| 1 | Supabase: cuentas y migración del perfil de `localStorage` a la cuenta (sin perder progreso) | Crear proyecto Supabase y cargar claves en Vercel |
| A/B | Catálogo, órdenes, eventos, webhook idempotente, historial. Donaciones intactas | Fase 1 y Access Token **de prueba** |
| C | FdP+ mensual y anual: alta, renovación, cancelación al fin del período, período de gracia | Suscripciones habilitadas en la cuenta |
| D | Tienda de 5-8 cosméticos permanentes, equipar y quitar | A/B |
| E | Monedas FdP gratuitas con registro inmutable y límites diarios | Fase 1 |
| F | Publicidad discreta (no durante partidas) y sin anuncios para FdP+ | Aprobación de una red de anuncios (ej.: AdSense pide política de privacidad y tráfico) |

Todo detrás de `FEATURE_BILLING` y con credenciales **de prueba** hasta pasar las pruebas mínimas del documento: webhooks duplicados y fuera de orden, precio manipulado, renovaciones, cancelaciones, reembolsos y contracargos.

## 6. Riesgos

- **Sin cuentas no hay compras.** Hoy todo es anónimo. La migración a cuentas tiene que conservar el progreso guardado en cada celular.
- **Impuestos y facturación:** cobrar suscripciones implica emitir facturas (monotributo/ARCA) y revisar IVA y retenciones. Hace falta asesoramiento contable antes de cobrar.
- **Escudos reales + ventas:** al haber dinero de por medio, el uso de marcas de clubes queda más expuesto. Los cosméticos tienen que ser 100% propios: nada de escudos ni camisetas oficiales en la tienda.
- **Términos y privacidad:** hay que publicarlos antes de cobrar (suscripción, renovación automática, cancelación, reembolsos y datos personales).
- **Precios en pesos:** con inflación hay que revisarlos seguido. Conviene guardar el precio en la orden para que el historial no cambie.

## 7. Decisiones pendientes del dueño del proyecto

1. Crear el proyecto de Supabase (región São Paulo) y cargar las claves en Vercel.
2. Crear credenciales **de prueba** de Mercado Pago (Tus integraciones → Crear aplicación) y confirmar que Suscripciones está disponible.
3. Revisar con un contador la facturación de suscripciones.
4. Aprobar este plan para empezar con la fase 1.
