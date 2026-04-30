/// Seed CRT Administradora — Strata Systems MX
/// Datos reales de CRT, TSR y QHS extraídos del Excel 2026.
/// Idempotente: borra y recrea la org "crt-admin" en cada corrida.

import {
  PrismaClient,
  Entity,
  LocalStatus,
  PaymentStatus,
  ExpenseCategory,
  MaintenancePriority,
  MaintenanceStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEFAULT_PASSWORD = "Admin2026!";

async function main() {
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // ── Limpiar org existente ──────────────────────────────────────────────
  const existing = await db.organization.findUnique({ where: { slug: "crt-admin" } });
  if (existing) {
    // Borrar en orden seguro (cascades deberían manejar, pero explícito)
    await db.maintenance.deleteMany({ where: { organizationId: existing.id } });
    await db.expense.deleteMany({ where: { organizationId: existing.id } });
    await db.budgetLine.deleteMany({ where: { organizationId: existing.id } });
    await db.payment.deleteMany({ where: { organizationId: existing.id } });
    await db.contract.deleteMany({ where: { organizationId: existing.id } });
    await db.local.deleteMany({ where: { organizationId: existing.id } });
    await db.plaza.deleteMany({ where: { organizationId: existing.id } });
    await db.tenant.deleteMany({ where: { organizationId: existing.id } });
    await db.notificationPreference.deleteMany({ where: { organizationId: existing.id } });
    await db.user.deleteMany({ where: { organizationId: existing.id } });
    await db.organization.delete({ where: { id: existing.id } });
  }

  // ── Organización ────────────────────────────────────────────────────────
  const org = await db.organization.create({
    data: {
      name: "CRT Inmobiliaria",
      slug: "crt-admin",
      phone: "+52 662 123 4567",
      email: "admin@crt.mx",
      addressLine: "Blvd. Rodolfo Elias Calles, Hermosillo, Son.",
      primaryColor: "#C9A961",
      profile: "ADMINISTRADORA",
    },
  });

  // ── Usuarios ─────────────────────────────────────────────────────────────
  await db.user.createMany({
    data: [
      {
        organizationId: org.id,
        email: "jc@crt.mx",
        name: "Juan Carlos Terán",
        passwordHash: hash,
        role: "ADMINISTRADOR",
        isActive: true,
      },
      {
        organizationId: org.id,
        email: "asesor@crt.mx",
        name: "Coordinador CRT",
        passwordHash: hash,
        role: "ASESOR",
        isActive: true,
      },
    ],
  });

  // ── Plazas CRT ──────────────────────────────────────────────────────────
  const progreso = await db.plaza.create({
    data: {
      organizationId: org.id,
      entity: Entity.CRT,
      name: "Plaza Progreso",
      code: "CRT-PRG",
      address: "Blvd. Rodolfo Elias Calles esq. Progreso",
      city: "Hermosillo",
    },
  });

  const olivares = await db.plaza.create({
    data: {
      organizationId: org.id,
      entity: Entity.CRT,
      name: "Plaza Olivares",
      code: "CRT-OLV",
      address: "Calle Olivares, Hermosillo",
      city: "Hermosillo",
    },
  });

  const quiroga1 = await db.plaza.create({
    data: {
      organizationId: org.id,
      entity: Entity.CRT,
      name: "Plaza Quiroga 1",
      code: "CRT-Q1",
      address: "Blvd. Quiroga, Hermosillo",
      city: "Hermosillo",
    },
  });

  const quiroga2 = await db.plaza.create({
    data: {
      organizationId: org.id,
      entity: Entity.CRT,
      name: "Plaza Quiroga 2",
      code: "CRT-Q2",
      address: "Blvd. Quiroga (nueva sección), Hermosillo",
      city: "Hermosillo",
    },
  });

  // ── Plaza TSR (propiedades independientes) ─────────────────────────────
  const tsrPlaza = await db.plaza.create({
    data: {
      organizationId: org.id,
      entity: Entity.TSR,
      name: "Propiedades TSR",
      code: "TSR-GEN",
      address: "Blvd. Kino y otros, Hermosillo",
      city: "Hermosillo",
    },
  });

  // ── Inquilinos ──────────────────────────────────────────────────────────
  const tenantData = [
    // Progreso
    { name: "Goyoma", legalName: null },
    { name: "Comex / Servicios Informática", legalName: "Servicios de Informática y Variables S.A." },
    { name: "Tintorería", legalName: "María Hortencia Galaz Ruiz" },
    { name: "Automoney", legalName: "Luis Edmundo Reina Sánchez" },
    { name: "Nikte", legalName: null },
    { name: "Master Cash", legalName: null },
    { name: "Bluecell", legalName: null },
    { name: "Sushi Progreso", legalName: null },
    { name: "ID Gráficos", legalName: null },
    // Olivares
    { name: "Farmacias Benavides", legalName: "Farmacias Benavides S.A.B. de C.V." },
    { name: "Panadería Olivares", legalName: "Vintila Mora Avalos" },
    { name: "Telcel Olivares", legalName: "Oscar Hugo López Alvarado" },
    { name: "Interio", legalName: "Denisse Emilia Peñaflor Castellanos" },
    // Quiroga 1
    { name: "7-Eleven", legalName: "7-Eleven Mexico S.A. de C.V." },
    { name: "Quesos Calza", legalName: null },
    { name: "GI Similares", legalName: "Carlos Alberto Bernal Márquez" },
    // Quiroga 2
    { name: "Sucree", legalName: null },
    { name: "Dentista Q2", legalName: null },
    { name: "Cristianos Q2", legalName: null },
    { name: "Maki Sushi", legalName: null },
    { name: "Frituras Kikin", legalName: null },
    { name: "Puro Pa' Delante", legalName: null },
    { name: "Hitness", legalName: null },
    { name: "Armando Elotes", legalName: "Armando Elotes" },
    { name: "Medios Rubí", legalName: null },
    // TSR
    { name: "Inbursa Blvd. Kino", legalName: null },
    { name: "Garmendia / La Chila", legalName: null },
    { name: "Capilla del Carmen", legalName: null },
    { name: "Oficina Elias 2do Piso", legalName: null },
    { name: "Nayarit 52 / Ferretería", legalName: null },
  ];

  const tenants = await Promise.all(
    tenantData.map((t) =>
      db.tenant.create({ data: { organizationId: org.id, ...t } })
    )
  );

  const t = (name: string) => tenants.find((x) => x.name === name)!;

  // ── Locales & Contratos ─────────────────────────────────────────────────

  async function createLocal(
    plazaId: string,
    code: string,
    nickname: string,
    status: LocalStatus = LocalStatus.RENTADO
  ) {
    return db.local.create({
      data: { organizationId: org.id, plazaId, code, nickname, status },
    });
  }

  async function createContract(
    localId: string,
    tenantId: string,
    monthlyRent: number
  ) {
    return db.contract.create({
      data: {
        organizationId: org.id,
        localId,
        tenantId,
        monthlyRent: monthlyRent,
        startDate: new Date("2025-01-01"),
        isActive: true,
      },
    });
  }

  // Progreso locales
  const lP_L1 = await createLocal(progreso.id, "L1", "GOYOMA");
  const lP_L2 = await createLocal(progreso.id, "L2", "—", LocalStatus.DISPONIBLE);
  const lP_L3 = await createLocal(progreso.id, "L3", "COMEX");
  const lP_L4 = await createLocal(progreso.id, "L4", "TINTORERÍA");
  const lP_L5 = await createLocal(progreso.id, "L5", "AUTOMONEY");
  const lP_L6 = await createLocal(progreso.id, "L6", "NIKTE");
  const lP_L7 = await createLocal(progreso.id, "L7", "MASTER CASH");
  const lP_L8 = await createLocal(progreso.id, "L8", "BLUECELL");
  const lP_L9 = await createLocal(progreso.id, "L9", "SUSHI");
  const lP_E  = await createLocal(progreso.id, "E", "ID GRÁFICOS");

  // Olivares locales
  const lO_LP = await createLocal(olivares.id, "LP", "BENAVIDES");
  const lO_L1 = await createLocal(olivares.id, "L1", "PANADERÍA");
  const lO_L2 = await createLocal(olivares.id, "L2", "TELCEL");
  const lO_L3 = await createLocal(olivares.id, "L3", "INTERIO");
  const lO_L4 = await createLocal(olivares.id, "L4", "INTERIO 2", LocalStatus.DISPONIBLE);

  // Quiroga 1 locales
  const lQ1_LP = await createLocal(quiroga1.id, "LP", "7-ELEVEN");
  const lQ1_LA = await createLocal(quiroga1.id, "L.A", "QUESOS CALZA");
  const lQ1_LB = await createLocal(quiroga1.id, "L.B", "GI SIMILARES");

  // Quiroga 2 locales
  const lQ2_L1 = await createLocal(quiroga2.id, "L1", "SUCREE");
  const lQ2_L2 = await createLocal(quiroga2.id, "L2", "DENTISTA");
  const lQ2_L3 = await createLocal(quiroga2.id, "L3", "CRISTIANOS");
  const lQ2_L4 = await createLocal(quiroga2.id, "L4", "MAKI SUSHI");
  const lQ2_L5 = await createLocal(quiroga2.id, "L5", "FRITURAS KIKIN");
  const lQ2_L6 = await createLocal(quiroga2.id, "L6", "PURO PA' DELANTE");
  const lQ2_L7 = await createLocal(quiroga2.id, "L7", "HITNESS");
  const lQ2_L8 = await createLocal(quiroga2.id, "L8", "ARMANDO ELOTES");
  const lQ2_E  = await createLocal(quiroga2.id, "E", "MEDIOS RUBÍ");

  // TSR locales
  const lT_INB = await createLocal(tsrPlaza.id, "LP-KINO", "INBURSA KINO");
  const lT_GARM = await createLocal(tsrPlaza.id, "OF-GARM", "GARMENDIA/CHILA");
  const lT_CAP = await createLocal(tsrPlaza.id, "LP-CAP", "CAPILLA CARMEN");
  const lT_ELI = await createLocal(tsrPlaza.id, "OF-ELIAS", "OFICINA ELIAS");
  const lT_NAY = await createLocal(tsrPlaza.id, "OF-NAY", "NAYARIT 52");

  // Contratos activos
  const cP_L1  = await createContract(lP_L1.id,  t("Goyoma").id,                     16524.52);
  const cP_L3  = await createContract(lP_L3.id,  t("Comex / Servicios Informática").id, 10050.14);
  const cP_L4  = await createContract(lP_L4.id,  t("Tintorería").id,                  9617.78);
  const cP_L5  = await createContract(lP_L5.id,  t("Automoney").id,                   10771.80);
  const cP_L6  = await createContract(lP_L6.id,  t("Nikte").id,                       9320.65);
  const cP_L7  = await createContract(lP_L7.id,  t("Master Cash").id,                 8976.64);
  const cP_L8  = await createContract(lP_L8.id,  t("Bluecell").id,                    13500.00);
  const cP_L9  = await createContract(lP_L9.id,  t("Sushi Progreso").id,              10530.85);
  const cP_E   = await createContract(lP_E.id,   t("ID Gráficos").id,                  2320.00);

  const cO_LP  = await createContract(lO_LP.id,  t("Farmacias Benavides").id,         37156.17);
  const cO_L1  = await createContract(lO_L1.id,  t("Panadería Olivares").id,          10015.42);
  const cO_L2  = await createContract(lO_L2.id,  t("Telcel Olivares").id,              8095.29);
  const cO_L3  = await createContract(lO_L3.id,  t("Interio").id,                    19755.96);

  const cQ1_LP = await createContract(lQ1_LP.id, t("7-Eleven").id,                   41088.27);
  const cQ1_LA = await createContract(lQ1_LA.id, t("Quesos Calza").id,               11048.32);
  const cQ1_LB = await createContract(lQ1_LB.id, t("GI Similares").id,               11536.00);

  const cQ2_L1 = await createContract(lQ2_L1.id, t("Sucree").id,                     13484.39);
  const cQ2_L2 = await createContract(lQ2_L2.id, t("Dentista Q2").id,                12210.72);
  const cQ2_L3 = await createContract(lQ2_L3.id, t("Cristianos Q2").id,              12586.00);
  const cQ2_L4 = await createContract(lQ2_L4.id, t("Maki Sushi").id,                 13020.00);
  const cQ2_L5 = await createContract(lQ2_L5.id, t("Frituras Kikin").id,             13600.00);
  const cQ2_L6 = await createContract(lQ2_L6.id, t("Puro Pa' Delante").id,           13500.00);
  const cQ2_L7 = await createContract(lQ2_L7.id, t("Hitness").id,                    13496.16);
  const cQ2_L8 = await createContract(lQ2_L8.id, t("Armando Elotes").id,             13746.00);
  const cQ2_E  = await createContract(lQ2_E.id,  t("Medios Rubí").id,                 2320.00);

  const cT_INB  = await createContract(lT_INB.id,  t("Inbursa Blvd. Kino").id,       86028.56);
  const cT_GARM = await createContract(lT_GARM.id, t("Garmendia / La Chila").id,     30740.00);
  const cT_CAP  = await createContract(lT_CAP.id,  t("Capilla del Carmen").id,       19350.12);
  const cT_ELI  = await createContract(lT_ELI.id,  t("Oficina Elias 2do Piso").id,   12500.00);
  const cT_NAY  = await createContract(lT_NAY.id,  t("Nayarit 52 / Ferretería").id,  18560.00);

  // ── Pagos 2026 (Ene–Abr con estados reales del Excel) ─────────────────

  type PaymentRow = { contractId: string; period: string; amount: number; status: PaymentStatus };
  const payments: PaymentRow[] = [];

  function addPayments(
    contractId: string,
    base: number,
    rows: Array<{ period: string; amount?: number; status: PaymentStatus }>
  ) {
    for (const r of rows) {
      payments.push({
        contractId,
        period: r.period,
        amount: r.amount ?? base,
        status: r.status,
      });
    }
  }

  // Progreso
  addPayments(cP_L1.id,  16524.52, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cP_L3.id,  10050.14, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cP_L4.id,  9617.78, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", amount: 9671.78, status: PaymentStatus.PAGADO },
  ]);
  addPayments(cP_L5.id,  10771.80, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cP_L6.id,  9320.65, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cP_L7.id,  8976.64, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cP_L8.id,  13500.00, [
    { period: "2026-01", amount: 13500, status: PaymentStatus.PAGADO },
    { period: "2026-02", amount: 81600, status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cP_L9.id,  10530.85, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", amount: 10586, status: PaymentStatus.PAGADO },
    { period: "2026-03", amount: 6445, status: PaymentStatus.PARCIAL },
    { period: "2026-04", amount: 11531, status: PaymentStatus.PAGADO },
  ]);
  addPayments(cP_E.id,   2320.00, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PENDIENTE },
  ]);

  // Olivares
  addPayments(cO_LP.id,  37156.17, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cO_L1.id,  10015.42, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cO_L2.id,  8095.29, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.VENCIDO },
    { period: "2026-03", amount: 13564.81, status: PaymentStatus.PAGADO },
    { period: "2026-04", amount: 14000, status: PaymentStatus.PAGADO },
  ]);
  addPayments(cO_L3.id,  19755.96, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);

  // Quiroga 1
  addPayments(cQ1_LP.id, 41088.27, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", amount: 49305.91, status: PaymentStatus.PAGADO },
    { period: "2026-04", amount: 49305.91, status: PaymentStatus.PAGADO },
  ]);
  addPayments(cQ1_LA.id, 11048.32, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cQ1_LB.id, 11536.00, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);

  // Quiroga 2
  addPayments(cQ2_L1.id, 13484.39, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cQ2_L2.id, 12210.72, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cQ2_L3.id, 12586.00, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.NO_APLICA },
    { period: "2026-03", status: PaymentStatus.NO_APLICA },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cQ2_L4.id, 13020.00, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", amount: 13020.83, status: PaymentStatus.PAGADO },
    { period: "2026-03", amount: 13020.83, status: PaymentStatus.PAGADO },
    { period: "2026-04", amount: 13020.83, status: PaymentStatus.PAGADO },
  ]);
  addPayments(cQ2_L5.id, 13600.00, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cQ2_L6.id, 13500.00, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cQ2_L7.id, 13496.16, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", amount: 20992.32, status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.VENCIDO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cQ2_L8.id, 13746.00, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cQ2_E.id,  2320.00, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);

  // TSR
  addPayments(cT_INB.id,  86028.56, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cT_GARM.id, 30740.00, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", amount: 23000, status: PaymentStatus.PARCIAL },
    { period: "2026-04", amount: 69220, status: PaymentStatus.PAGADO },
  ]);
  addPayments(cT_CAP.id,  19350.12, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cT_ELI.id,  12500.00, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.NO_APLICA },
    { period: "2026-03", status: PaymentStatus.NO_APLICA },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);
  addPayments(cT_NAY.id,  18560.00, [
    { period: "2026-01", status: PaymentStatus.PAGADO },
    { period: "2026-02", status: PaymentStatus.PAGADO },
    { period: "2026-03", status: PaymentStatus.PAGADO },
    { period: "2026-04", status: PaymentStatus.PAGADO },
  ]);

  await db.payment.createMany({ data: payments.map((p) => ({ ...p, organizationId: org.id })) });

  // ── Presupuesto 2026 — líneas de ingreso ────────────────────────────────
  // Valores de referencia (base mensual normalizada del Presupuesto2026)
  const budgetLines = [];

  // CRT Ingresos por plaza (promedio de los meses reales)
  const crtIngresoPlazas = [
    { plazaId: progreso.id, label: "Plaza Progreso", budget: 91612.38 },
    { plazaId: olivares.id, label: "Plaza Olivares",  budget: 75022.84 },
    { plazaId: quiroga1.id, label: "Plaza Quiroga 1", budget: 63672.59 },
    { plazaId: quiroga2.id, label: "Plaza Quiroga 2", budget: 107963.27 },
  ];

  for (const { plazaId, label, budget } of crtIngresoPlazas) {
    for (let m = 1; m <= 12; m++) {
      budgetLines.push({
        organizationId: org.id,
        plazaId,
        entity: Entity.CRT,
        year: 2026,
        month: m,
        label,
        budgeted: budget,
        isIncome: true,
      });
    }
  }

  // CRT Egresos (categorías del presupuesto)
  const crtEgresosBase = [
    { label: "Nómina Dirección",        budget: 35000,    category: ExpenseCategory.NOMINA_DIRECCION },
    { label: "Nómina General",           budget: 43000,    category: ExpenseCategory.NOMINA_GENERAL },
    { label: "SAT Impuestos",            budget: 24000,    category: ExpenseCategory.IMPUESTOS },
    { label: "IMSS / Infonavit",         budget: 18500,    category: ExpenseCategory.IMPUESTOS },
    { label: "ISRTP 3%",                 budget: 1200,     category: ExpenseCategory.IMPUESTOS },
    { label: "Honorarios Contabilidad",  budget: 5316,     category: ExpenseCategory.HONORARIOS },
    { label: "Comisiones Bancarias",     budget: 405,      category: ExpenseCategory.SERVICIOS },
    { label: "Mant. Plazas / Limpieza",  budget: 10000,    category: ExpenseCategory.MANTENIMIENTO },
    { label: "Consumo Oficina",          budget: 1000,     category: ExpenseCategory.OTROS },
    { label: "Autos (Servicios)",        budget: 1500,     category: ExpenseCategory.VEHICULOS },
    { label: "Toyota Raize (CRT)",       budget: 6644.10,  category: ExpenseCategory.FINANCIAMIENTOS },
    { label: "Expedition (CRT)",         budget: 25711.92, category: ExpenseCategory.FINANCIAMIENTOS },
    { label: "Seguros Inmuebles",        budget: 3939,     category: ExpenseCategory.SEGUROS },
    { label: "Alarma",                   budget: 960,      category: ExpenseCategory.SERVICIOS },
    { label: "SANISO Basura",            budget: 5930.36,  category: ExpenseCategory.SERVICIOS },
    { label: "CFE",                      budget: 8500,     category: ExpenseCategory.SERVICIOS },
    { label: "Agua",                     budget: 5000,     category: ExpenseCategory.SERVICIOS },
    { label: "Telmex / Internet",        budget: 2197,     category: ExpenseCategory.SERVICIOS },
    { label: "Telcel 2 líneas",          budget: 399,      category: ExpenseCategory.SERVICIOS },
    { label: "Gasolina",                 budget: 6000,     category: ExpenseCategory.VEHICULOS },
    { label: "Otros y comisiones",       budget: 5000,     category: ExpenseCategory.OTROS },
  ];

  for (const e of crtEgresosBase) {
    for (let m = 1; m <= 12; m++) {
      budgetLines.push({
        organizationId: org.id,
        plazaId: null,
        entity: Entity.CRT,
        year: 2026,
        month: m,
        label: e.label,
        budgeted: e.budget,
        isIncome: false,
      });
    }
  }

  // TSR Ingresos
  const tsrIngresosBase = [
    { label: "Inbursa Blvd. Kino",      budget: 86028.56 },
    { label: "Garmendia / La Chila",    budget: 30740.00 },
    { label: "Capilla del Carmen",      budget: 19350.12 },
    { label: "Oficina Elias 2do Piso",  budget: 12500.00 },
    { label: "Nayarit 52 / Ferretería", budget: 18560.00 },
  ];

  for (const { label, budget } of tsrIngresosBase) {
    for (let m = 1; m <= 12; m++) {
      budgetLines.push({
        organizationId: org.id,
        plazaId: tsrPlaza.id,
        entity: Entity.TSR,
        year: 2026,
        month: m,
        label,
        budgeted: budget,
        isIncome: true,
      });
    }
  }

  // TSR Egresos
  const tsrEgresosBase = [
    { label: "Nómina Dirección TSR",   budget: 25000 },
    { label: "Nómina General TSR",     budget: 15000 },
    { label: "SAT Impuestos TSR",      budget: 5200 },
    { label: "Honorarios TSR",         budget: 3138.67 },
    { label: "Comisiones Bancarias",   budget: 370 },
    { label: "Mantenimiento TSR",      budget: 1000 },
    { label: "Consumo Oficina TSR",    budget: 2000 },
    { label: "BMW Financiamiento",     budget: 23752.01 },
    { label: "Gasolina TSR",           budget: 4000 },
    { label: "Caja Chica",             budget: 1500 },
    { label: "Otros TSR",              budget: 5000 },
  ];

  for (const { label, budget } of tsrEgresosBase) {
    for (let m = 1; m <= 12; m++) {
      budgetLines.push({
        organizationId: org.id,
        plazaId: null,
        entity: Entity.TSR,
        year: 2026,
        month: m,
        label,
        budgeted: budget,
        isIncome: false,
      });
    }
  }

  // QHS Ingresos/Egresos (pequeño)
  for (let m = 1; m <= 12; m++) {
    budgetLines.push({
      organizationId: org.id,
      plazaId: null,
      entity: Entity.QHS,
      year: 2026,
      month: m,
      label: "Ingresos QHS",
      budgeted: 3000,
      isIncome: true,
    });
    budgetLines.push({
      organizationId: org.id,
      plazaId: null,
      entity: Entity.QHS,
      year: 2026,
      month: m,
      label: "Honorarios Contabilidad QHS",
      budgeted: 1300,
      isIncome: false,
    });
    budgetLines.push({
      organizationId: org.id,
      plazaId: null,
      entity: Entity.QHS,
      year: 2026,
      month: m,
      label: "Comisiones Bancarias QHS",
      budgeted: 655.4,
      isIncome: false,
    });
  }

  await db.budgetLine.createMany({ data: budgetLines });

  // ── Mantenimientos ejemplo ───────────────────────────────────────────────
  await db.maintenance.createMany({
    data: [
      {
        organizationId: org.id,
        localId: lP_L9.id,
        description: "Fuga de agua en área de cocina",
        priority: MaintenancePriority.ALTA,
        status: MaintenanceStatus.EN_PROGRESO,
        cost: 3500,
      },
      {
        organizationId: org.id,
        localId: lQ2_L7.id,
        description: "Puerta de acceso no cierra correctamente",
        priority: MaintenancePriority.MEDIA,
        status: MaintenanceStatus.ABIERTO,
      },
      {
        organizationId: org.id,
        localId: lO_L2.id,
        description: "Aire acondicionado no enfría — revisión requerida",
        priority: MaintenancePriority.URGENTE,
        status: MaintenanceStatus.ABIERTO,
      },
      {
        organizationId: org.id,
        localId: lT_GARM.id,
        description: "Pintura exterior deteriorada",
        priority: MaintenancePriority.BAJA,
        status: MaintenanceStatus.ABIERTO,
      },
    ],
  });

  console.log("✅ Seed completo — CRT Administradora");
  console.log("   🏢 Organización: CRT Inmobiliaria");
  console.log("   👤 Admin:  jc@crt.mx  / Admin2026!");
  console.log("   👤 Asesor: asesor@crt.mx / Admin2026!");
  console.log(`   🏪 Plazas: 4 CRT + 1 TSR`);
  console.log(`   🔑 Locales: ${[lP_L1,lP_L2,lP_L3,lP_L4,lP_L5,lP_L6,lP_L7,lP_L8,lP_L9,lP_E,lO_LP,lO_L1,lO_L2,lO_L3,lO_L4,lQ1_LP,lQ1_LA,lQ1_LB,lQ2_L1,lQ2_L2,lQ2_L3,lQ2_L4,lQ2_L5,lQ2_L6,lQ2_L7,lQ2_L8,lQ2_E,lT_INB,lT_GARM,lT_CAP,lT_ELI,lT_NAY].length} en total`);
  console.log(`   💰 Pagos: ${payments.length} registros 2026`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
