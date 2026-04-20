# Inmobiliaria CRM

CRM multi-tenant para inmobiliarias en Hermosillo, Sonora. Gestiona propiedades (venta y renta), captación de propietarios y leads, matching automático, contratos, rentas activas con pagos y mantenimientos, y comunicación unificada (WhatsApp-first).

**Alcance del backend:** tracking y comunicación. No genera documentos fiscales (SAT/CFDI), contratos legales, firmas digitales vinculantes, ni procesa pagos bancarios directos.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript strict |
| Base de datos | PostgreSQL 16 + Prisma ORM 6 |
| Auth | Auth.js v5 (Credentials + JWT) |
| Validación | Zod — schemas en `lib/validators/` |
| Comunicación | WhatsApp Cloud API (Meta), Resend (email) |
| Uploads | UploadThing |
| Geocoding | Mapbox o Google Maps |
| Rate limit / Cola | Upstash Redis |
| Observabilidad | Sentry |
| Billing | Stripe Subscriptions |
| Tests | Vitest |
| Contenedor local | Docker Compose (Postgres 16) |

---

## Variables de entorno

Copiá `.env.example` a `.env` y completá los secretos:

```bash
cp .env.example .env
```

### Requeridas para que la app arranque

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Secret de Auth.js — mínimo 48 chars. `openssl rand -base64 48` |
| `PORTAL_JWT_SECRET` | Secret separado para magic-links de portales. `openssl rand -base64 48` |
| `CRON_SECRET` | Secreto que Vercel Cron / tu scheduler envía en `Authorization: Bearer` |

### Opcionales pero necesarias para el producto completo

| Variable | Servicio | Descripción |
|---|---|---|
| `RESEND_API_KEY` | Resend | Emails transaccionales. Sin esta, los emails solo se loguean. |
| `RESEND_FROM` | Resend | Dirección de remitente, ej. `CRM <no-reply@tu-dominio.mx>` |
| `WHATSAPP_APP_ID` | Meta | App ID de tu app en developers.facebook.com |
| `WHATSAPP_APP_SECRET` | Meta | Para validar firma HMAC del webhook |
| `WHATSAPP_VERIFY_TOKEN` | Meta | Token de verificación del webhook (cualquier string) |
| `WHATSAPP_TOKEN_ENCRYPTION_KEY` | — | 32 bytes base64 para cifrar tokens de WhatsApp at-rest. `openssl rand -base64 32` |
| `UPLOADTHING_SECRET` | UploadThing | Para subida de imágenes y documentos |
| `UPLOADTHING_APP_ID` | UploadThing | App ID |
| `MAPBOX_ACCESS_TOKEN` | Mapbox | Geocoding de propiedades. Alternativa: `GOOGLE_MAPS_API_KEY` |
| `UPSTASH_REDIS_REST_URL` | Upstash | Rate limiting. Sin esto usa limiter in-memory (solo dev) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | |
| `SENTRY_DSN` | Sentry | Observabilidad en producción |
| `STRIPE_SECRET_KEY` | Stripe | Billing de suscripciones |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Para validar webhooks de Stripe |
| `STRIPE_PRICE_STARTER` | Stripe | Price ID del plan Starter |
| `STRIPE_PRICE_PROFESSIONAL` | Stripe | Price ID del plan Professional |
| `STRIPE_PRICE_ENTERPRISE` | Stripe | Price ID del plan Enterprise |
| `RECAPTCHA_SECRET_KEY` | Google | Para el form público de leads. Sin esto se skipea. |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Google | Site key pública |

---

## Setup en 5 pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar y configurar env
cp .env.example .env
# Editar .env con al menos DATABASE_URL, AUTH_SECRET, PORTAL_JWT_SECRET, CRON_SECRET

# 3. Levantar Postgres (requiere Docker Desktop)
npm run db:up

# 4. Aplicar migraciones
npm run db:migrate

# 5. Seed de datos (2 orgs con datos de Hermosillo)
npm run db:seed
```

Arrancar la app:

```bash
npm run dev      # http://localhost:3000
```

---

## Crear la primera organización real

### Opción A: Script interactivo

```bash
npm run create:org
```

Te pide nombre, slug, email y contraseña del admin vía terminal.

### Opción B: Registro desde la UI

Ir a `/register-org` y completar el wizard.

### Credenciales de seed

Dos organizaciones de prueba (creadas con `npm run db:seed`):

| Org | Slug | Admin email | Contraseña |
|---|---|---|---|
| Inmobiliaria Hermosillo | `inmobiliaria-hermosillo` | `admin@inmohermosillo.mx` | Ver seed.ts |
| Sonora Propiedades | `sonora-propiedades` | `admin@sonoraprops.mx` | Ver seed.ts |

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Next.js en modo desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (unit + integration) |
| `npm run db:up` | Levanta Postgres 16 en Docker (puerto 5434) |
| `npm run db:down` | Detiene Postgres |
| `npm run db:migrate` | Aplica migraciones pendientes |
| `npm run db:reset` | **Destructivo.** Resetea DB completa y re-seedea |
| `npm run db:seed` | Ejecuta `prisma/seed.ts` |
| `npm run db:studio` | Abre Prisma Studio en `localhost:5555` |
| `npm run db:generate` | Regenera el cliente Prisma |
| `npm run create:org` | Script interactivo para crear la primera org |

---

## Conectar WhatsApp Cloud API (guía paso a paso)

### 1. Crear App en Meta

1. Ir a [developers.facebook.com](https://developers.facebook.com) → **Mis apps** → **Crear app**.
2. Tipo: **Negocios**.
3. Agregar producto **WhatsApp**.

### 2. Configurar la cuenta de WhatsApp Business

1. En tu app de Meta, ir a **WhatsApp → Configuración de API**.
2. Crear o conectar una **WhatsApp Business Account (WABA)**.
3. Añadir un número de teléfono (o usar el número de prueba de Meta para dev).
4. Copiar el **Phone Number ID** y un **Token de acceso** (System User token para producción, token temporal para dev).

### 3. Configurar el webhook

1. En Meta, ir a **WhatsApp → Configuración → Webhook**.
2. URL del callback: `https://tu-dominio.com/api/webhooks/whatsapp`.
3. **Verify token**: el mismo valor que ponés en `WHATSAPP_VERIFY_TOKEN` en `.env`.
4. Suscribir a: `messages`.

### 4. Conectar en el CRM

- Ir a **Ajustes → WhatsApp** en la UI.
- Ingresar el **Phone Number ID** y el **Access Token**.
- El CRM cifra el token y guarda las credenciales por organización.
- O vía server action `connectWhatsappAction` en `app/_actions/whatsapp.ts`.

### 5. Plantillas

Las plantillas pre-aprobadas requeridas por el producto están en el schema `WhatsappTemplate`. Para envíos fuera de la ventana de 24h, deben estar **APPROVED** por Meta.

Plantillas mínimas recomendadas:
- `bienvenida_lead` — UTILITY
- `recordatorio_visita` — UTILITY
- `match_propiedad` — MARKETING
- `recordatorio_pago_renta` — UTILITY
- `solicitud_mantenimiento_recibida` — UTILITY
- `reporte_mensual_propietario` — UTILITY
- `vencimiento_contrato` — UTILITY
- `acceso_portal` — UTILITY
- `nuevo_lead_agente` — UTILITY
- `cumpleanos_cliente` — MARKETING
- `aniversario_operacion` — MARKETING
- `nps_post_operacion` — UTILITY
- `pago_vencido_agente` — UTILITY

---

## Configurar Resend

1. Crear cuenta en [resend.com](https://resend.com).
2. Verificar tu dominio.
3. Crear una API key.
4. Poner en `.env`:
   ```
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM=CRM <no-reply@tu-dominio.mx>
   ```

---

## Configurar UploadThing

1. Crear cuenta en [uploadthing.com](https://uploadthing.com).
2. Crear una app.
3. Copiar `UPLOADTHING_SECRET` y `UPLOADTHING_APP_ID`.
4. El router está en `lib/uploadthing/router.ts`.

---

## Configurar Upstash (rate limit)

1. Crear cuenta en [upstash.com](https://upstash.com).
2. Crear una database **Redis**.
3. Copiar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
4. Sin esto, el rate limiter corre en memoria (no apto para producción multi-instance).

---

## Configurar Mapbox (geocoding)

1. Crear cuenta en [mapbox.com](https://mapbox.com).
2. Crear un **Access Token** con scopes de búsqueda.
3. Poner en `.env`: `MAPBOX_ACCESS_TOKEN=pk.xxxxxx`

Alternativa: `GOOGLE_MAPS_API_KEY` (habilitar Geocoding API en Google Cloud).

---

## Cron jobs en producción (Vercel)

Los crons están definidos en `vercel.json`. Todos los endpoints requieren `Authorization: Bearer $CRON_SECRET`.

| Endpoint | Horario (UTC) | Hora Hermosillo (UTC-7) | Descripción |
|---|---|---|---|
| `/api/cron/rental-payments` | `0 15 * * *` | 8:00 am | Genera RentalPayments del mes |
| `/api/cron/rental-reminders` | `0 14 * * *` | 7:00 am | Recordatorios de pago + marcar vencidos |
| `/api/cron/contracts-expiring` | `0 13 * * *` | 6:00 am | Contratos por vencer → tareas + notif |
| `/api/cron/viewing-reminders` | `*/60 * * * *` | Cada hora | Confirmación 2h antes de cada visita |
| `/api/cron/matching` | `0 14 * * *` | 7:00 am | Matching diario para leads activos |
| `/api/cron/daily-digest` | `0 13 * * *` | 6:00 am | Digest diario para admins |
| `/api/cron/retention` | `0 14 * * *` | 7:00 am | Cumpleaños, NPS, leads fríos, aniversarios |

---

## Arquitectura

Ver `ARCHITECTURE.md` para el diagrama completo.

### Multi-tenancy

- Cada inmobiliaria es una `Organization`.
- Todo modelo de negocio lleva `organizationId` (NOT NULL) + índice compuesto.
- Las queries **siempre** pasan por `withTenant(ctx, fn)` en `lib/repos/tenant.ts`.
- Tests en `tests/tenant-isolation.test.ts` verifican que el contexto sea obligatorio.

### Server Actions

Toda mutación desde formularios de la UI usa Server Actions en `app/_actions/`. Cada action:
1. Llama `requireSession()` o `requireRole(role)`.
2. Valida con el schema Zod correspondiente de `lib/validators/`.
3. Delega al servicio o repo con el contexto de tenant.
4. Llama `revalidatePath` o `revalidateTag` al final.
5. Devuelve `{ ok: true }` o `{ ok: false, error: string }`.

### Route Handlers

`app/api/` organizado en:
- `webhooks/` — WhatsApp, Stripe, UploadThing
- `cron/` — jobs periódicos, protegidos con `CRON_SECRET`
- `public/` — endpoints abiertos (leads form, property view count)
- `owner-portal/` — endpoints del portal propietario (auth: `crm_portal_session`)
- `tenant-portal/` — endpoints del portal inquilino
- `feed/` — XML para portales inmobiliarios
- `export/` — CSV (propiedades, leads)
- `dashboard/` — agregados principales
- `properties/bbox/` — búsqueda por bounding box (mapa)

### Servicios en `lib/services/`

| Servicio | Descripción |
|---|---|
| `property.ts` | Creación, slug, código, geocoding, status |
| `matching.ts` | Motor de scoring propiedad↔lead (0-100) |
| `lead-routing.ts` | Round-robin con zone/type preference |
| `rental-schedule.ts` | Generación de pagos, recordatorios, validación |
| `contract-expiry.ts` | Detección de vencimientos, renovación |
| `retention.ts` | Cumpleaños, NPS, aniversarios, leads fríos |
| `whatsapp.ts` | Cliente Meta Cloud API + webhook parser + crypto |
| `email.ts` | Wrapper Resend + plantillas inline |
| `notify.ts` | Dispatcher multi-canal por usuario |
| `geocode.ts` | Mapbox/Google geocoding |
| `feed.ts` | Generación XML Inmuebles24 |
| `portal-sessions.ts` | Magic links + sesiones 30d para portales |
| `organization.ts` | Bootstrap, registro, suspensión |
| `stripe.ts` | Suscripciones, webhooks de billing |
| `ratelimit.ts` | Upstash Ratelimit con fallback in-memory |
| `crypto.ts` | AES-256-GCM para tokens at-rest + masking de PII |
| `audit.ts` | Audit log no bloqueante |

---

## Tests

```bash
npm test          # todos los tests
npm run test:watch  # modo watch
```

Tests en `tests/`:
- `matching.test.ts` — scoring del motor de matching (puro, sin DB)
- `rental-schedule.test.ts` — lógica de programación de pagos (puro)
- `tenant-isolation.test.ts` — aislación de tenant, JWT de portales, crypto

Para tests de integración que requieren DB:
```bash
npm run db:up
npm run db:migrate
npm test
```

---

## RBAC

| Rol | Permisos |
|---|---|
| `AGENCY_ADMIN` | Todo dentro de su org |
| `BROKER` | Todo excepto gestión de usuarios/billing |
| `AGENT` | CRUD leads/clientes asignados, propiedades (precio bloqueado), visitas/ofertas/tareas/interacciones, upload imágenes. Sin reportes globales. |
| `ASSISTANT` | Lectura general + crear leads + registrar interacciones + agendar visitas. Sin precios ni status de propiedad. |

Ver `lib/auth/rbac.ts` para la matriz completa.

---

## Portales externos

### Portal Propietario (`/portal-propietario/*`)
- Login: magic link JWT firmado válido 24h → se canjea por cookie de 30d.
- Genera link: `generateOwnerPortalLinkAction(ownerId)` en `app/_actions/owners.ts`.
- Auth en cada request: cookie `crm_portal_session` validada en `lib/services/portal-sessions.ts`.
- **Aislamiento estricto**: los queries filtran por `ownerId = session.subjectId`.

### Portal Inquilino (`/portal-inquilino/*`)
- Mismo mecanismo de sesión, `kind = TENANT`.
- Genera link: acción del agente desde el módulo de rentas.

---

## Seguridad

- **Tenant isolation**: `withTenant` en todos los repos. Test explícito.
- **CSRF**: automático en Server Actions de Next.js.
- **Rate limiting**: Upstash en endpoints públicos y login.
- **Firma de webhook WhatsApp**: HMAC-SHA256 validada en cada POST entrante.
- **Tokens at-rest**: cifrados AES-256-GCM con `WHATSAPP_TOKEN_ENCRYPTION_KEY`.
- **PII en logs**: `maskPhone`/`maskEmail` en `lib/services/crypto.ts`.
- **Audit log**: cambios de precio, status, asignaciones, borrados, exports.
- **CORS**: solo en `/api/public/*` y `/api/feed/*` (con `Access-Control-Allow-Origin: *`).

---

## Puertos

- **Postgres:** `localhost:5434`
- **App:** `localhost:3000`
- **Prisma Studio:** `localhost:5555`
