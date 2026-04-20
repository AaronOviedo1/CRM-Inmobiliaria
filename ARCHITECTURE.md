# Arquitectura del CRM Inmobiliario

## Diagrama de alto nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Next.js 15 (App Router)                        │
│                                                                     │
│   ┌───────────────┐   ┌──────────────┐   ┌──────────────────────┐  │
│   │   App Route   │   │  Auth Route  │   │   Public Routes      │  │
│   │  /(app)/*     │   │  /(auth)/*   │   │  /(public)/*         │  │
│   │  Server Comp  │   │  Login/Reg   │   │  /p/[slug]           │  │
│   └───────┬───────┘   └──────┬───────┘   │  /a/[orgSlug]        │  │
│           │                  │           └──────────────────────┘  │
│           │                  │                                     │
│   ┌───────▼──────────────────▼──────────────────────────────────┐  │
│   │              app/_actions/  (Server Actions)                 │  │
│   │   properties | leads | owners | rentals | maintenance        │  │
│   │   viewings | offers | tasks | contracts | interactions       │  │
│   │   organization | whatsapp | billing                          │  │
│   └───────────────────────────┬─────────────────────────────────┘  │
│                                │                                    │
│   ┌────────────────────────────▼────────────────────────────────┐  │
│   │                      app/api/                                │  │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │  │
│   │  │ webhooks/│  │  cron/   │  │ public/  │  │  portals/  │  │  │
│   │  │ whatsapp │  │ 7 crons  │  │ leads    │  │ owner      │  │  │
│   │  │ stripe   │  │          │  │ feed/xml │  │ tenant     │  │  │
│   │  │ ut       │  │          │  │ export/  │  │            │  │  │
│   │  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │  │
│   └────────────────────────────┬────────────────────────────────┘  │
│                                │                                    │
│   ┌────────────────────────────▼────────────────────────────────┐  │
│   │                   lib/services/                              │  │
│   │  property  matching  lead-routing  rental-schedule           │  │
│   │  contract-expiry  retention  notify  whatsapp  email         │  │
│   │  geocode  feed  portal-sessions  organization  stripe        │  │
│   │  ratelimit  crypto  audit                                    │  │
│   └────────────────────────────┬────────────────────────────────┘  │
│                                │                                    │
│   ┌────────────────────────────▼────────────────────────────────┐  │
│   │                     lib/repos/                               │  │
│   │   withTenant (isolation)  properties  leads  entities        │  │
│   └────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   PostgreSQL 16 + Prisma │
                    │   (via Docker o Neon)    │
                    └─────────────────────────┘
```

## Flujos principales

### 1. Lead entrante desde portal público

```
Visitante /p/[propSlug] → llena form
  → POST /api/public/leads/:orgSlug
  → Rate limit + honeypot + reCAPTCHA
  → Valida Zod (PublicLeadFormSchema)
  → pickAgentForLead() → round-robin con zone preference
  → prisma.lead.create()
  → incrementPropertyInquiries()
  → notify(agentId, NEW_LEAD) → [in-app, email, whatsapp]
  → HTTP 201 { ok: true, leadId }
```

### 2. Mensaje WhatsApp entrante

```
Meta Cloud API → POST /api/webhooks/whatsapp
  → verifyMetaSignature (HMAC-SHA256)
  → parseWhatsappWebhook → mensajes planos
  → orgByPhoneNumberId → resuelve tenant
  → busca Lead / Client / Owner por número
  → interaction.upsert() (dedupe por channelMessageId)
  → si lead con agente → crea Task "nuevo WhatsApp"
```

### 3. Matching diario

```
Vercel Cron 7am → POST /api/cron/matching
  → leads activos últimos 30 días
  → per lead: matchLeadToProperties()
    → carga propiedades DISPONIBLE
    → scoreLeadProperty() por cada una (0-100)
    → filtra ≥ 40, top-10
    → matchSuggestion.upsert()
  → si score ≥ 80 → notify agente
```

### 4. Recordatorio de renta

```
Vercel Cron 7am → POST /api/cron/rental-reminders
  → rentalPayment.status = PENDIENTE
  → calcula daysOverdue por payment
  → -3 días: primer recordatorio WhatsApp al inquilino
  → 0 días: segundo recordatorio
  → +3 días: status → VENCIDO + notifica agencia + propietario
```

### 5. Portal propietario

```
Agente genera link → generateOwnerPortalLink(ownerId)
  → signPortalToken (JWT HS256, 24h)
  → sendTemplate(whatsapp) + sendEmail()

Propietario abre link → /portal-propietario/login?token=...
  → exchangePortalToken(jwt)
  → PortalSession.create (30 días)
  → cookie crm_portal_session (httpOnly)
  → redirect /portal-propietario/dashboard

Dashboard carga → validatePortalSession(cookie)
  → filtra datos por session.subjectId (ownerId) SIEMPRE
```

## Multi-tenancy y seguridad

```
Request →
  middleware.ts (JWT check, redirect si no autenticado)
  → Server Action o Route Handler
  → requireSession() → SessionUser { id, organizationId, role }
  → withTenant({ organizationId }) → PrismaClient extendido
    → injectOrgFilter en CADA query (findMany, findFirst, create, update, delete)
    → si organizationId ausente → throw TENANT_CONTEXT_MISSING
  → lógica de negocio
  → audit(ctx, ...) asíncrono no bloqueante
```

## Estructura de archivos

```
.
├── app/
│   ├── (app)/              # Rutas internas (requieren sesión)
│   │   ├── propiedades/
│   │   ├── leads/
│   │   ├── rentas/
│   │   ├── ...
│   ├── (auth)/             # Login, register-org
│   ├── (public)/           # Páginas públicas /p/[slug], /a/[orgSlug]
│   ├── portal-propietario/ # Portal propietario (auth: cookie)
│   ├── portal-inquilino/   # Portal inquilino (auth: cookie)
│   ├── _actions/           # Server Actions
│   └── api/                # Route Handlers
│       ├── webhooks/
│       ├── cron/
│       ├── public/
│       ├── owner-portal/
│       ├── tenant-portal/
│       ├── feed/
│       ├── export/
│       ├── dashboard/
│       └── properties/
├── lib/
│   ├── auth/               # Config Auth.js, session, RBAC, portal tokens
│   ├── repos/              # Repositorios con tenant enforcement
│   ├── services/           # Lógica de negocio pura
│   ├── validators/         # Schemas Zod por entidad
│   ├── uploadthing/        # Router de UploadThing
│   ├── env.ts              # Variables de entorno tipadas
│   ├── prisma.ts           # Cliente Prisma + TenantContext
│   ├── enums.ts            # Mirror de enums de Prisma
│   └── ...
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── matching.test.ts
│   ├── rental-schedule.test.ts
│   └── tenant-isolation.test.ts
├── scripts/
│   └── create-org.ts
├── vercel.json             # Cron schedule
├── next.config.ts
└── vitest.config.ts
```

## Decisiones de diseño

| Decisión | Razón |
|---|---|
| Server Actions para mutaciones | CSRF gratis, colocación con componentes, tipado end-to-end |
| `withTenant` como Prisma extension | Fuerza el filtro de tenant en tiempo de desarrollo; imposible olvidarlo |
| JWT stateless para portales | Cero sesiones server-side en el happy path; 30d de cookie post-exchange |
| WhatsApp Cloud API por org | Cada inmobiliaria tiene su propio número de negocio |
| AES-256-GCM para tokens de WA | Los tokens son PII sensible; cifrarlos at-rest cumple buenas prácticas |
| MatchSuggestion con `upsert` | El matcher puede correr N veces; `(leadId, propertyId)` unique evita duplicados |
| `date-fns` para fechas | Sin dependencia de timezone del proceso; operaciones locales explícitas |
| `nanoid` para session tokens | 48 chars → entropía más que suficiente para tokens de sesión |
