-- Migration: backend v2 — WhatsApp, portal sessions, Stripe fields on Organization
-- Applies schema extensions added for phase 2.

-- Organization: Stripe fields + timezone
ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "stripeCustomerId"              TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId"         TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "subscriptionCurrentPeriodEnd" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "timezone"                     TEXT DEFAULT 'America/Hermosillo';

-- WhatsApp enums
DO $$ BEGIN
  CREATE TYPE "WhatsappTemplateStatus" AS ENUM ('DRAFT','PENDING','APPROVED','REJECTED','PAUSED','DISABLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "WhatsappTemplateCategory" AS ENUM ('UTILITY','MARKETING','AUTHENTICATION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "WhatsappHeaderMediaType" AS ENUM ('NONE','TEXT','IMAGE','VIDEO','DOCUMENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- WhatsappAccount
CREATE TABLE IF NOT EXISTS "WhatsappAccount" (
  "id"                   TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "organizationId"       TEXT NOT NULL UNIQUE,
  "phoneNumberId"        TEXT NOT NULL,
  "wabaId"               TEXT,
  "displayPhoneNumber"   TEXT,
  "accessTokenEncrypted" TEXT NOT NULL,
  "webhookVerifyToken"   TEXT NOT NULL UNIQUE,
  "isActive"             BOOLEAN NOT NULL DEFAULT TRUE,
  "connectedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastMessageAt"        TIMESTAMP(3),
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WhatsappAccount_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE
);

-- WhatsappTemplate
CREATE TABLE IF NOT EXISTS "WhatsappTemplate" (
  "id"              TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "organizationId"  TEXT NOT NULL,
  "name"            TEXT NOT NULL,
  "category"        "WhatsappTemplateCategory" NOT NULL,
  "status"          "WhatsappTemplateStatus" NOT NULL DEFAULT 'DRAFT',
  "language"        TEXT NOT NULL DEFAULT 'es_MX',
  "headerMediaType" "WhatsappHeaderMediaType" NOT NULL DEFAULT 'NONE',
  "headerText"      TEXT,
  "bodyText"        TEXT NOT NULL,
  "footerText"      TEXT,
  "variables"       TEXT[] NOT NULL DEFAULT '{}',
  "metaPayload"     JSONB,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WhatsappTemplate_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "WhatsappTemplate_org_name_lang" ON "WhatsappTemplate"("organizationId","name","language");
CREATE INDEX IF NOT EXISTS "WhatsappTemplate_orgId" ON "WhatsappTemplate"("organizationId");
CREATE INDEX IF NOT EXISTS "WhatsappTemplate_orgId_status" ON "WhatsappTemplate"("organizationId","status");

-- PortalSession
DO $$ BEGIN
  CREATE TYPE "PortalKind" AS ENUM ('OWNER','TENANT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "PortalSession" (
  "id"             TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "organizationId" TEXT NOT NULL,
  "kind"           "PortalKind" NOT NULL,
  "subjectId"      TEXT NOT NULL,
  "token"          TEXT NOT NULL UNIQUE,
  "expiresAt"      TIMESTAMP(3) NOT NULL,
  "lastUsedAt"     TIMESTAMP(3),
  "ipAddress"      TEXT,
  "userAgent"      TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PortalSession_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "PortalSession_orgId" ON "PortalSession"("organizationId");
CREATE INDEX IF NOT EXISTS "PortalSession_kind_subject" ON "PortalSession"("kind","subjectId");
CREATE INDEX IF NOT EXISTS "PortalSession_expiresAt" ON "PortalSession"("expiresAt");
