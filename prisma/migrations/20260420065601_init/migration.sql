-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIAL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'AGENCY_ADMIN', 'BROKER', 'AGENT', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "ContactChannel" AS ENUM ('WHATSAPP', 'PHONE', 'EMAIL');

-- CreateEnum
CREATE TYPE "ContactTime" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('MXN', 'USD');

-- CreateEnum
CREATE TYPE "LeadIntent" AS ENUM ('COMPRA', 'RENTA', 'INVERSION', 'AMBOS');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'INMUEBLES24', 'VIVANUNCIOS', 'LAMUDI', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'WHATSAPP', 'REFERIDO', 'LETRERO', 'CAMINANDO', 'LLAMADA_ENTRANTE', 'OTRO');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NUEVO', 'CONTACTADO', 'CALIFICADO', 'VISITA_AGENDADA', 'VISITA_REALIZADA', 'OFERTA', 'NEGOCIACION', 'GANADO', 'PERDIDO', 'EN_PAUSA');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('COMPRADOR', 'INQUILINO', 'INVERSIONISTA', 'PROPIETARIO_CLIENTE');

-- CreateEnum
CREATE TYPE "PropertyCategory" AS ENUM ('CASA', 'DEPARTAMENTO', 'TOWNHOUSE', 'TERRENO', 'LOCAL_COMERCIAL', 'OFICINA', 'BODEGA', 'NAVE_INDUSTRIAL', 'EDIFICIO', 'RANCHO', 'OTRO');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('VENTA', 'RENTA', 'VENTA_Y_RENTA', 'TRASPASO', 'PREVENTA');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('BORRADOR', 'DISPONIBLE', 'APARTADA', 'EN_NEGOCIACION', 'VENDIDA', 'RENTADA', 'PAUSADA', 'NO_DISPONIBLE', 'ARCHIVADA');

-- CreateEnum
CREATE TYPE "ConservationState" AS ENUM ('NUEVA', 'EXCELENTE', 'BUENA', 'REGULAR', 'REMODELAR');

-- CreateEnum
CREATE TYPE "PropertyDocumentType" AS ENUM ('ESCRITURA', 'PLANO', 'PREDIAL', 'AGUA', 'OTRO');

-- CreateEnum
CREATE TYPE "ContractKind" AS ENUM ('MANDATO_EXCLUSIVA', 'MANDATO_NO_EXCLUSIVA', 'MANDATO_COMPARTIDA', 'ARRENDAMIENTO', 'COMPRAVENTA', 'APARTADO', 'CARTA_OFERTA');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('BORRADOR', 'PENDIENTE_FIRMA', 'ACTIVO', 'POR_VENCER', 'VENCIDO', 'RENOVADO', 'TERMINADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('ACTIVA', 'POR_VENCER', 'EN_RENOVACION', 'TERMINADA', 'DESALOJO', 'SUSPENDIDA');

-- CreateEnum
CREATE TYPE "RentalPaymentStatus" AS ENUM ('PENDIENTE', 'PAGADO', 'VENCIDO', 'PARCIAL', 'CONDONADO');

-- CreateEnum
CREATE TYPE "RentalPaymentChannel" AS ENUM ('DIRECTO_AL_PROPIETARIO', 'VIA_AGENCIA');

-- CreateEnum
CREATE TYPE "MaintenanceCategory" AS ENUM ('PLOMERIA', 'ELECTRICO', 'AIRE_ACONDICIONADO', 'ELECTRODOMESTICO', 'ESTRUCTURAL', 'JARDINERIA', 'LIMPIEZA', 'SEGURIDAD', 'OTRO');

-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENCIA');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('REPORTADO', 'EN_REVISION', 'APROBADO_PROPIETARIO', 'EN_PROCESO', 'COMPLETADO', 'RECHAZADO', 'CERRADO');

-- CreateEnum
CREATE TYPE "ViewingStatus" AS ENUM ('AGENDADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'NO_SHOW', 'REAGENDADA');

-- CreateEnum
CREATE TYPE "InterestLevel" AS ENUM ('MUY_ALTO', 'ALTO', 'MEDIO', 'BAJO', 'NULO');

-- CreateEnum
CREATE TYPE "OfferKind" AS ENUM ('CARTA_OFERTA', 'APARTADO', 'OFERTA_FIRME');

-- CreateEnum
CREATE TYPE "OfferPaymentMethod" AS ENUM ('CONTADO', 'CREDITO_BANCARIO', 'CREDITO_INFONAVIT', 'CREDITO_FOVISSSTE', 'MIXTO');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('ENVIADA', 'EN_REVISION', 'ACEPTADA', 'CONTRAOFERTA', 'RECHAZADA', 'EXPIRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "InteractionKind" AS ENUM ('WHATSAPP', 'LLAMADA', 'EMAIL', 'REUNION', 'VISITA_OFICINA', 'VISITA_PROPIEDAD', 'MENSAJE_PORTAL', 'NOTA_INTERNA', 'TAREA_COMPLETADA', 'EVENTO_SISTEMA');

-- CreateEnum
CREATE TYPE "InteractionDirection" AS ENUM ('ENTRANTE', 'SALIENTE', 'INTERNA', 'AUTOMATICA');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA', 'SNOOZED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PROPUESTO', 'VISTO_POR_AGENTE', 'ENVIADO_AL_LEAD', 'LEAD_INTERESADO', 'LEAD_DESCARTO', 'CONVERTIDO_EN_VISITA');

-- CreateEnum
CREATE TYPE "TagKind" AS ENUM ('LEAD', 'CLIENT', 'OWNER', 'PROPERTY');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'WHATSAPP', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationEvent" AS ENUM ('NEW_LEAD', 'LEAD_REPLY', 'VIEWING_REMINDER', 'CONTRACT_EXPIRING', 'PAYMENT_DUE', 'MAINTENANCE_REQUEST', 'DAILY_DIGEST');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'ASSIGN', 'EXPORT');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#C9A961',
    "phone" TEXT,
    "email" TEXT,
    "addressLine" TEXT,
    "city" TEXT DEFAULT 'Hermosillo',
    "state" TEXT DEFAULT 'Sonora',
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'TRIAL',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AGENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "commissionDefaultPct" DECIMAL(5,2) NOT NULL DEFAULT 50.0,
    "specialties" "PropertyCategory"[],
    "workingZones" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "rfc" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "preferredContactChannel" "ContactChannel" NOT NULL DEFAULT 'WHATSAPP',
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "bankName" TEXT,
    "accountLast4" TEXT,
    "notes" TEXT,
    "portalAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
    "portalAccessToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "preferredContactChannel" "ContactChannel" NOT NULL DEFAULT 'WHATSAPP',
    "preferredContactTime" "ContactTime" NOT NULL DEFAULT 'ANYTIME',
    "intent" "LeadIntent" NOT NULL,
    "propertyTypeInterests" "PropertyCategory"[],
    "budgetMin" DECIMAL(12,2),
    "budgetMax" DECIMAL(12,2),
    "currency" "Currency" NOT NULL DEFAULT 'MXN',
    "desiredZones" TEXT[],
    "minBedrooms" INTEGER,
    "minBathrooms" INTEGER,
    "minParkingSpaces" INTEGER,
    "minAreaM2" INTEGER,
    "mustHaves" TEXT[],
    "niceToHaves" TEXT[],
    "source" "LeadSource" NOT NULL,
    "sourceDetail" TEXT,
    "utmCampaign" TEXT,
    "utmMedium" TEXT,
    "utmContent" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NUEVO',
    "lostReason" TEXT,
    "lostReasonDetail" TEXT,
    "qualificationScore" INTEGER,
    "assignedAgentId" TEXT,
    "firstContactAt" TIMESTAMP(3),
    "lastContactAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "convertedToClientId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "leadId" TEXT,
    "type" "ClientType" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "birthday" TIMESTAMP(3),
    "totalOperations" INTEGER NOT NULL DEFAULT 0,
    "lifetimeValueMxn" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "portalAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
    "portalAccessToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "category" "PropertyCategory" NOT NULL,
    "subcategory" TEXT,
    "status" "PropertyStatus" NOT NULL DEFAULT 'BORRADOR',
    "priceSale" DECIMAL(12,2),
    "priceRent" DECIMAL(12,2),
    "maintenanceFee" DECIMAL(12,2),
    "currency" "Currency" NOT NULL DEFAULT 'MXN',
    "areaTotalM2" DECIMAL(10,2),
    "areaBuiltM2" DECIMAL(10,2),
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "halfBathrooms" INTEGER,
    "parkingSpaces" INTEGER,
    "floors" INTEGER,
    "yearBuilt" INTEGER,
    "isFurnished" BOOLEAN NOT NULL DEFAULT false,
    "acceptsPets" BOOLEAN NOT NULL DEFAULT false,
    "hasPool" BOOLEAN NOT NULL DEFAULT false,
    "hasGarden" BOOLEAN NOT NULL DEFAULT false,
    "hasStudy" BOOLEAN NOT NULL DEFAULT false,
    "hasServiceRoom" BOOLEAN NOT NULL DEFAULT false,
    "amenities" TEXT[],
    "conservation" "ConservationState",
    "addressStreet" TEXT,
    "addressNumber" TEXT,
    "addressInterior" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "hideExactAddress" BOOLEAN NOT NULL DEFAULT true,
    "videoUrl" TEXT,
    "virtualTourUrl" TEXT,
    "coverImageUrl" TEXT,
    "ownerId" TEXT NOT NULL,
    "captureContractId" TEXT,
    "publishedToPortals" TEXT[],
    "publishedAt" TIMESTAMP(3),
    "daysOnMarket" INTEGER,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "inquiriesCount" INTEGER NOT NULL DEFAULT 0,
    "assignedAgentId" TEXT,
    "internalNotes" TEXT,
    "publicDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyDocument" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "PropertyDocumentType" NOT NULL,
    "isPublicToOwnerPortal" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyContract" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "contractKind" "ContractKind" NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'BORRADOR',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "durationMonths" INTEGER,
    "ownerId" TEXT,
    "clientId" TEXT,
    "agentId" TEXT,
    "commissionPct" DECIMAL(5,2),
    "commissionAmount" DECIMAL(12,2),
    "agreedPrice" DECIMAL(12,2) NOT NULL,
    "depositAmount" DECIMAL(12,2),
    "notes" TEXT,
    "externalDocumentUrl" TEXT,
    "reminderDaysBeforeEnd" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "tenantClientId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "managingAgentId" TEXT,
    "monthlyRent" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'MXN',
    "paymentDueDay" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "RentalStatus" NOT NULL DEFAULT 'ACTIVA',
    "depositHeld" DECIMAL(12,2),
    "inventoryList" JSONB,
    "utilitiesIncluded" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalPayment" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "periodMonth" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amountDue" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "status" "RentalPaymentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "paymentReference" TEXT,
    "receivedBy" "RentalPaymentChannel" NOT NULL DEFAULT 'DIRECTO_AL_PROPIETARIO',
    "remindersSentCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "reportedByClientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "MaintenanceCategory" NOT NULL,
    "priority" "MaintenancePriority" NOT NULL DEFAULT 'MEDIA',
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'REPORTADO',
    "images" TEXT[],
    "assignedToId" TEXT,
    "estimatedCost" DECIMAL(10,2),
    "actualCost" DECIMAL(10,2),
    "paidByOwner" BOOLEAN NOT NULL DEFAULT false,
    "paidByTenant" BOOLEAN NOT NULL DEFAULT false,
    "splitDetails" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "ownerNotifiedAt" TIMESTAMP(3),
    "ownerApprovedAt" TIMESTAMP(3),
    "internalNotes" TEXT,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Viewing" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "leadId" TEXT,
    "clientId" TEXT,
    "agentId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,
    "status" "ViewingStatus" NOT NULL DEFAULT 'AGENDADA',
    "leadInterestLevel" "InterestLevel",
    "leadFeedback" TEXT,
    "agentNotes" TEXT,
    "meetingPoint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Viewing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "leadId" TEXT,
    "clientId" TEXT,
    "offerKind" "OfferKind" NOT NULL,
    "offeredAmount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'MXN',
    "offeredPaymentMethod" "OfferPaymentMethod" NOT NULL,
    "conditions" TEXT,
    "apartadoAmount" DECIMAL(12,2),
    "status" "OfferStatus" NOT NULL DEFAULT 'ENVIADA',
    "counterofferFromOwner" DECIMAL(12,2),
    "expiresAt" TIMESTAMP(3),
    "agentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kind" "InteractionKind" NOT NULL,
    "direction" "InteractionDirection" NOT NULL,
    "relatedLeadId" TEXT,
    "relatedClientId" TEXT,
    "relatedOwnerId" TEXT,
    "relatedPropertyId" TEXT,
    "summary" TEXT NOT NULL,
    "body" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "durationSeconds" INTEGER,
    "createdById" TEXT,
    "channelMessageId" TEXT,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "relatedLeadId" TEXT,
    "relatedClientId" TEXT,
    "relatedPropertyId" TEXT,
    "relatedRentalId" TEXT,
    "assignedToId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIA',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDIENTE',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchSuggestion" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "matchReasons" TEXT[],
    "status" "MatchStatus" NOT NULL DEFAULT 'PROPUESTO',
    "viewedByAgentAt" TIMESTAMP(3),
    "sentToLeadAt" TIMESTAMP(3),
    "leadRespondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#64748b',
    "kind" "TagKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadTag" (
    "leadId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "LeadTag_pkey" PRIMARY KEY ("leadId","tagId")
);

-- CreateTable
CREATE TABLE "ClientTag" (
    "clientId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ClientTag_pkey" PRIMARY KEY ("clientId","tagId")
);

-- CreateTable
CREATE TABLE "OwnerTag" (
    "ownerId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "OwnerTag_pkey" PRIMARY KEY ("ownerId","tagId")
);

-- CreateTable
CREATE TABLE "PropertyTag" (
    "propertyId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PropertyTag_pkey" PRIMARY KEY ("propertyId","tagId")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "event" "NotificationEvent" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_organizationId_role_idx" ON "User"("organizationId", "role");

-- CreateIndex
CREATE INDEX "User_organizationId_isActive_idx" ON "User"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_portalAccessToken_key" ON "Owner"("portalAccessToken");

-- CreateIndex
CREATE INDEX "Owner_organizationId_idx" ON "Owner"("organizationId");

-- CreateIndex
CREATE INDEX "Owner_organizationId_deletedAt_idx" ON "Owner"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "Owner_organizationId_lastName_firstName_idx" ON "Owner"("organizationId", "lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_convertedToClientId_key" ON "Lead"("convertedToClientId");

-- CreateIndex
CREATE INDEX "Lead_organizationId_idx" ON "Lead"("organizationId");

-- CreateIndex
CREATE INDEX "Lead_organizationId_status_idx" ON "Lead"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Lead_organizationId_assignedAgentId_idx" ON "Lead"("organizationId", "assignedAgentId");

-- CreateIndex
CREATE INDEX "Lead_organizationId_nextFollowUpAt_idx" ON "Lead"("organizationId", "nextFollowUpAt");

-- CreateIndex
CREATE INDEX "Lead_organizationId_deletedAt_idx" ON "Lead"("organizationId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Client_portalAccessToken_key" ON "Client"("portalAccessToken");

-- CreateIndex
CREATE INDEX "Client_organizationId_idx" ON "Client"("organizationId");

-- CreateIndex
CREATE INDEX "Client_organizationId_type_idx" ON "Client"("organizationId", "type");

-- CreateIndex
CREATE INDEX "Client_organizationId_deletedAt_idx" ON "Client"("organizationId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Property_captureContractId_key" ON "Property"("captureContractId");

-- CreateIndex
CREATE INDEX "Property_organizationId_idx" ON "Property"("organizationId");

-- CreateIndex
CREATE INDEX "Property_organizationId_status_idx" ON "Property"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Property_organizationId_assignedAgentId_idx" ON "Property"("organizationId", "assignedAgentId");

-- CreateIndex
CREATE INDEX "Property_organizationId_ownerId_idx" ON "Property"("organizationId", "ownerId");

-- CreateIndex
CREATE INDEX "Property_organizationId_transactionType_status_idx" ON "Property"("organizationId", "transactionType", "status");

-- CreateIndex
CREATE INDEX "Property_organizationId_category_status_idx" ON "Property"("organizationId", "category", "status");

-- CreateIndex
CREATE INDEX "Property_organizationId_deletedAt_idx" ON "Property"("organizationId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Property_organizationId_code_key" ON "Property"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Property_organizationId_slug_key" ON "Property"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "PropertyImage_propertyId_idx" ON "PropertyImage"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyImage_propertyId_order_idx" ON "PropertyImage"("propertyId", "order");

-- CreateIndex
CREATE INDEX "PropertyDocument_propertyId_idx" ON "PropertyDocument"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyDocument_propertyId_type_idx" ON "PropertyDocument"("propertyId", "type");

-- CreateIndex
CREATE INDEX "PropertyContract_organizationId_idx" ON "PropertyContract"("organizationId");

-- CreateIndex
CREATE INDEX "PropertyContract_organizationId_status_idx" ON "PropertyContract"("organizationId", "status");

-- CreateIndex
CREATE INDEX "PropertyContract_organizationId_propertyId_idx" ON "PropertyContract"("organizationId", "propertyId");

-- CreateIndex
CREATE INDEX "PropertyContract_organizationId_endDate_idx" ON "PropertyContract"("organizationId", "endDate");

-- CreateIndex
CREATE INDEX "PropertyContract_organizationId_contractKind_status_idx" ON "PropertyContract"("organizationId", "contractKind", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Rental_contractId_key" ON "Rental"("contractId");

-- CreateIndex
CREATE INDEX "Rental_organizationId_idx" ON "Rental"("organizationId");

-- CreateIndex
CREATE INDEX "Rental_organizationId_status_idx" ON "Rental"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Rental_organizationId_endDate_idx" ON "Rental"("organizationId", "endDate");

-- CreateIndex
CREATE INDEX "Rental_organizationId_tenantClientId_idx" ON "Rental"("organizationId", "tenantClientId");

-- CreateIndex
CREATE INDEX "Rental_organizationId_ownerId_idx" ON "Rental"("organizationId", "ownerId");

-- CreateIndex
CREATE INDEX "RentalPayment_rentalId_idx" ON "RentalPayment"("rentalId");

-- CreateIndex
CREATE INDEX "RentalPayment_rentalId_status_idx" ON "RentalPayment"("rentalId", "status");

-- CreateIndex
CREATE INDEX "RentalPayment_dueDate_status_idx" ON "RentalPayment"("dueDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RentalPayment_rentalId_periodMonth_key" ON "RentalPayment"("rentalId", "periodMonth");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_organizationId_idx" ON "MaintenanceRequest"("organizationId");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_organizationId_status_idx" ON "MaintenanceRequest"("organizationId", "status");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_organizationId_rentalId_idx" ON "MaintenanceRequest"("organizationId", "rentalId");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_organizationId_priority_status_idx" ON "MaintenanceRequest"("organizationId", "priority", "status");

-- CreateIndex
CREATE INDEX "Viewing_organizationId_idx" ON "Viewing"("organizationId");

-- CreateIndex
CREATE INDEX "Viewing_organizationId_status_idx" ON "Viewing"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Viewing_organizationId_scheduledAt_idx" ON "Viewing"("organizationId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Viewing_organizationId_agentId_scheduledAt_idx" ON "Viewing"("organizationId", "agentId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Viewing_propertyId_idx" ON "Viewing"("propertyId");

-- CreateIndex
CREATE INDEX "Offer_organizationId_idx" ON "Offer"("organizationId");

-- CreateIndex
CREATE INDEX "Offer_organizationId_status_idx" ON "Offer"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Offer_organizationId_propertyId_idx" ON "Offer"("organizationId", "propertyId");

-- CreateIndex
CREATE INDEX "Offer_organizationId_expiresAt_idx" ON "Offer"("organizationId", "expiresAt");

-- CreateIndex
CREATE INDEX "Interaction_organizationId_idx" ON "Interaction"("organizationId");

-- CreateIndex
CREATE INDEX "Interaction_organizationId_occurredAt_idx" ON "Interaction"("organizationId", "occurredAt");

-- CreateIndex
CREATE INDEX "Interaction_organizationId_relatedLeadId_occurredAt_idx" ON "Interaction"("organizationId", "relatedLeadId", "occurredAt");

-- CreateIndex
CREATE INDEX "Interaction_organizationId_relatedClientId_occurredAt_idx" ON "Interaction"("organizationId", "relatedClientId", "occurredAt");

-- CreateIndex
CREATE INDEX "Interaction_organizationId_relatedPropertyId_occurredAt_idx" ON "Interaction"("organizationId", "relatedPropertyId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Interaction_organizationId_channelMessageId_key" ON "Interaction"("organizationId", "channelMessageId");

-- CreateIndex
CREATE INDEX "Task_organizationId_idx" ON "Task"("organizationId");

-- CreateIndex
CREATE INDEX "Task_organizationId_status_idx" ON "Task"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Task_organizationId_assignedToId_status_idx" ON "Task"("organizationId", "assignedToId", "status");

-- CreateIndex
CREATE INDEX "Task_organizationId_dueAt_idx" ON "Task"("organizationId", "dueAt");

-- CreateIndex
CREATE INDEX "MatchSuggestion_organizationId_idx" ON "MatchSuggestion"("organizationId");

-- CreateIndex
CREATE INDEX "MatchSuggestion_organizationId_leadId_score_idx" ON "MatchSuggestion"("organizationId", "leadId", "score");

-- CreateIndex
CREATE INDEX "MatchSuggestion_organizationId_status_idx" ON "MatchSuggestion"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchSuggestion_leadId_propertyId_key" ON "MatchSuggestion"("leadId", "propertyId");

-- CreateIndex
CREATE INDEX "Tag_organizationId_kind_idx" ON "Tag"("organizationId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_organizationId_kind_name_key" ON "Tag"("organizationId", "kind", "name");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_channel_event_key" ON "NotificationPreference"("userId", "channel", "event");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_entity_entityId_idx" ON "AuditLog"("organizationId", "entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_userId_idx" ON "AuditLog"("organizationId", "userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedToClientId_fkey" FOREIGN KEY ("convertedToClientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_captureContractId_fkey" FOREIGN KEY ("captureContractId") REFERENCES "PropertyContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyContract" ADD CONSTRAINT "PropertyContract_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyContract" ADD CONSTRAINT "PropertyContract_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyContract" ADD CONSTRAINT "PropertyContract_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyContract" ADD CONSTRAINT "PropertyContract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyContract" ADD CONSTRAINT "PropertyContract_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "PropertyContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_tenantClientId_fkey" FOREIGN KEY ("tenantClientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_managingAgentId_fkey" FOREIGN KEY ("managingAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPayment" ADD CONSTRAINT "RentalPayment_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_reportedByClientId_fkey" FOREIGN KEY ("reportedByClientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viewing" ADD CONSTRAINT "Viewing_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viewing" ADD CONSTRAINT "Viewing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viewing" ADD CONSTRAINT "Viewing_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viewing" ADD CONSTRAINT "Viewing_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viewing" ADD CONSTRAINT "Viewing_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_relatedLeadId_fkey" FOREIGN KEY ("relatedLeadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_relatedClientId_fkey" FOREIGN KEY ("relatedClientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_relatedOwnerId_fkey" FOREIGN KEY ("relatedOwnerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_relatedPropertyId_fkey" FOREIGN KEY ("relatedPropertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_relatedLeadId_fkey" FOREIGN KEY ("relatedLeadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_relatedClientId_fkey" FOREIGN KEY ("relatedClientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_relatedPropertyId_fkey" FOREIGN KEY ("relatedPropertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_relatedRentalId_fkey" FOREIGN KEY ("relatedRentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSuggestion" ADD CONSTRAINT "MatchSuggestion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSuggestion" ADD CONSTRAINT "MatchSuggestion_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSuggestion" ADD CONSTRAINT "MatchSuggestion_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTag" ADD CONSTRAINT "LeadTag_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTag" ADD CONSTRAINT "LeadTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTag" ADD CONSTRAINT "ClientTag_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTag" ADD CONSTRAINT "ClientTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerTag" ADD CONSTRAINT "OwnerTag_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerTag" ADD CONSTRAINT "OwnerTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyTag" ADD CONSTRAINT "PropertyTag_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyTag" ADD CONSTRAINT "PropertyTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
