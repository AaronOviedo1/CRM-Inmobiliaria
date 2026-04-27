-- Migración: simplificar UserRole de 5 valores a 2 (ADMINISTRADOR, ASESOR)

-- 1. Crear nuevo enum
CREATE TYPE "UserRole_new" AS ENUM ('ADMINISTRADOR', 'ASESOR');

-- 2. Quitar DEFAULT de la columna antes de cambiar el tipo
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

-- 3. Cambiar columna mapeando roles anteriores
ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "UserRole_new"
  USING (
    CASE "role"::text
      WHEN 'SUPER_ADMIN'   THEN 'ADMINISTRADOR'
      WHEN 'AGENCY_ADMIN'  THEN 'ADMINISTRADOR'
      WHEN 'BROKER'        THEN 'ADMINISTRADOR'
      WHEN 'AGENT'         THEN 'ASESOR'
      WHEN 'ASSISTANT'     THEN 'ASESOR'
    END
  )::"UserRole_new";

-- 3. Reemplazar enum
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
