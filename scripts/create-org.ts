#!/usr/bin/env tsx
/// Bootstrap manual para crear la primera organización + admin desde CLI.
///
/// Uso:
///   npx tsx scripts/create-org.ts
///   (o: npm run create:org)

import { PrismaClient } from "@prisma/client";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const rl = readline.createInterface({ input, output });

  console.log("\n=== Crear organización en Casa Dorada CRM ===\n");

  const orgName = await rl.question("Nombre de la inmobiliaria: ");
  const slug = await rl.question("Slug (ej: casa-dorada, sin espacios): ");
  const adminEmail = await rl.question("Email del administrador: ");
  const adminName = await rl.question("Nombre del administrador: ");
  const adminPwd = await rl.question("Contraseña del administrador (min 8 chars): ");

  rl.close();

  if (!orgName || !slug || !adminEmail || !adminPwd) {
    console.error("Todos los campos son requeridos.");
    process.exit(1);
  }

  if (adminPwd.length < 8) {
    console.error("La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const slugClean = slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-");

  const existing = await db.organization.findUnique({ where: { slug: slugClean } });
  if (existing) {
    console.error(`Error: ya existe una org con slug "${slugClean}"`);
    process.exit(1);
  }

  const emailLower = adminEmail.toLowerCase();
  const existingUser = await db.user.findUnique({ where: { email: emailLower } });
  if (existingUser) {
    console.error(`Error: ya existe un usuario con email "${emailLower}"`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(adminPwd, 12);
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  const org = await db.organization.create({
    data: {
      name: orgName,
      slug: slugClean,
      subscriptionPlan: "TRIAL",
      subscriptionStatus: "TRIAL",
      trialEndsAt: trialEnd,
      users: {
        create: {
          email: emailLower,
          name: adminName || adminEmail.split("@")[0]!,
          passwordHash: hash,
          role: "AGENCY_ADMIN",
        },
      },
    },
    include: { users: true },
  });

  console.log(`\n✅ Organización creada:`);
  console.log(`   ID:     ${org.id}`);
  console.log(`   Slug:   ${org.slug}`);
  console.log(`   Admin:  ${org.users[0]!.email}`);
  console.log(`   Trial:  hasta ${trialEnd.toLocaleDateString("es-MX")}`);
  console.log(`\n   → Inicia sesión en: http://localhost:3000/login\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
