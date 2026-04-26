/// Seed del CRM Inmobiliario.
/// Genera datos realistas de Hermosillo: colonias reales, rangos de precio de mercado,
/// agentes, propiedades, leads en varias etapas, contratos y rentas activas con historial.
///
/// Idempotente por `Organization.slug`: borra y recrea las orgs cuyos slugs usa el seed.

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Contraseña por defecto para todos los usuarios del seed: Admin2026!
const DEFAULT_PASSWORD = "Admin2026!";
let _passwordHash: string | null = null;
async function getPasswordHash(): Promise<string> {
  if (!_passwordHash) _passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  return _passwordHash;
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
function pickN<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]!);
  }
  return out;
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomDecimal(min: number, max: number, step = 1): Prisma.Decimal {
  const raw = randInt(min / step, max / step) * step;
  return new Prisma.Decimal(raw);
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Catálogos reales de Hermosillo
// ---------------------------------------------------------------------------

const ZONAS_PREMIUM = [
  "Country Club",
  "Las Quintas",
  "Proyecto Río Sonora",
  "Vado del Río",
  "Pitic",
  "Valle del Sol",
  "Lomas Pitic",
];
const ZONAS_MEDIAS = [
  "Colinas del Bachoco",
  "Puerta Real",
  "Cumbres del Pedregal",
  "Villas del Pedregal",
  "Paseo Real",
  "El Cortijo",
  "Villa Satélite",
];
const ZONAS_POPULARES = [
  "Misión del Sol",
  "Floresta",
  "Fuentes del Mezquital",
  "Luis Orcí",
  "Real del Carmen",
  "Café Combate",
];
const ZONAS_TODAS = [...ZONAS_PREMIUM, ...ZONAS_MEDIAS, ...ZONAS_POPULARES];

const NOMBRES = [
  "Ana",
  "Carlos",
  "María",
  "Jorge",
  "Sofía",
  "Luis",
  "Fernanda",
  "Ricardo",
  "Paola",
  "Miguel",
  "Daniela",
  "Alejandro",
  "Gabriela",
  "Roberto",
  "Valeria",
  "Andrés",
  "Lucía",
  "Javier",
  "Regina",
  "Eduardo",
];
const APELLIDOS = [
  "García",
  "Hernández",
  "López",
  "Martínez",
  "Ramírez",
  "Torres",
  "Soto",
  "Valenzuela",
  "Bustamante",
  "Encinas",
  "Rodríguez",
  "Moreno",
  "Flores",
  "Gómez",
  "Núñez",
  "Ibarra",
  "Quijada",
  "Ochoa",
];

function fakePhone(): string {
  return `+52 662 ${randInt(100, 999)} ${randInt(1000, 9999)}`;
}
function fakeName(): { first: string; last: string } {
  return { first: pick(NOMBRES), last: `${pick(APELLIDOS)} ${pick(APELLIDOS)}` };
}

// ---------------------------------------------------------------------------
// Plantillas de propiedad — rango de precios Hermosillo 2026
// ---------------------------------------------------------------------------

type PropTemplate = {
  category: "CASA" | "DEPARTAMENTO" | "TOWNHOUSE" | "TERRENO" | "LOCAL_COMERCIAL" | "OFICINA";
  transaction: "VENTA" | "RENTA" | "VENTA_Y_RENTA";
  zones: readonly string[];
  priceSale?: [number, number];
  priceRent?: [number, number];
  bedrooms?: [number, number];
  bathrooms?: [number, number];
  parking?: [number, number];
  areaBuilt?: [number, number];
  areaTotal?: [number, number];
  amenities: string[];
  conservation: "NUEVA" | "EXCELENTE" | "BUENA" | "REGULAR";
};

const PLANTILLAS: PropTemplate[] = [
  {
    category: "CASA",
    transaction: "VENTA",
    zones: ZONAS_PREMIUM,
    priceSale: [4_500_000, 8_000_000],
    bedrooms: [3, 5],
    bathrooms: [3, 5],
    parking: [2, 4],
    areaBuilt: [220, 380],
    areaTotal: [280, 500],
    amenities: ["alberca", "jardín", "seguridad 24/7", "cuarto de servicio"],
    conservation: "EXCELENTE",
  },
  {
    category: "CASA",
    transaction: "VENTA",
    zones: ZONAS_MEDIAS,
    priceSale: [2_500_000, 4_500_000],
    bedrooms: [3, 4],
    bathrooms: [2, 3],
    parking: [2, 3],
    areaBuilt: [160, 240],
    areaTotal: [200, 320],
    amenities: ["jardín", "patio trasero"],
    conservation: "BUENA",
  },
  {
    category: "CASA",
    transaction: "RENTA",
    zones: ZONAS_PREMIUM,
    priceRent: [28_000, 45_000],
    bedrooms: [3, 4],
    bathrooms: [3, 4],
    parking: [2, 3],
    areaBuilt: [200, 320],
    areaTotal: [250, 400],
    amenities: ["alberca", "jardín", "amueblado", "pet-friendly"],
    conservation: "EXCELENTE",
  },
  {
    category: "CASA",
    transaction: "RENTA",
    zones: ZONAS_MEDIAS,
    priceRent: [15_000, 28_000],
    bedrooms: [3, 4],
    bathrooms: [2, 3],
    parking: [2, 2],
    areaBuilt: [140, 220],
    areaTotal: [180, 280],
    amenities: ["jardín", "patio"],
    conservation: "BUENA",
  },
  {
    category: "DEPARTAMENTO",
    transaction: "RENTA",
    zones: [...ZONAS_PREMIUM, "Proyecto Río Sonora"],
    priceRent: [10_000, 25_000],
    bedrooms: [1, 3],
    bathrooms: [1, 2],
    parking: [1, 2],
    areaBuilt: [65, 140],
    amenities: ["gym", "alberca común", "seguridad 24/7", "roof top"],
    conservation: "NUEVA",
  },
  {
    category: "DEPARTAMENTO",
    transaction: "VENTA",
    zones: ["Proyecto Río Sonora", "Vado del Río", "Pitic"],
    priceSale: [2_800_000, 5_500_000],
    bedrooms: [2, 3],
    bathrooms: [2, 3],
    parking: [1, 2],
    areaBuilt: [90, 150],
    amenities: ["gym", "alberca común", "lobby", "elevador"],
    conservation: "NUEVA",
  },
  {
    category: "TOWNHOUSE",
    transaction: "VENTA",
    zones: ["Puerta Real", "Valle del Sol", "Colinas del Bachoco"],
    priceSale: [3_200_000, 4_800_000],
    bedrooms: [3, 3],
    bathrooms: [2, 3],
    parking: [2, 2],
    areaBuilt: [170, 220],
    areaTotal: [180, 240],
    amenities: ["casa club", "alberca común", "seguridad"],
    conservation: "NUEVA",
  },
  {
    category: "TERRENO",
    transaction: "VENTA",
    zones: ["Vado del Río", "Lomas Pitic", "Fuentes del Mezquital"],
    priceSale: [1_200_000, 3_500_000],
    areaTotal: [250, 700],
    amenities: [],
    conservation: "NUEVA",
  },
  {
    category: "LOCAL_COMERCIAL",
    transaction: "RENTA",
    zones: ["Pitic", "Vado del Río", "Periférico"],
    priceRent: [22_000, 65_000],
    areaBuilt: [80, 220],
    amenities: ["aire acondicionado", "estacionamiento compartido"],
    conservation: "BUENA",
  },
  {
    category: "OFICINA",
    transaction: "RENTA",
    zones: ["Pitic", "Vado del Río"],
    priceRent: [12_000, 35_000],
    areaBuilt: [50, 150],
    amenities: ["ejecutiva", "recepción", "aire central"],
    conservation: "EXCELENTE",
  },
];

const TITULOS_POR_TIPO: Record<string, string[]> = {
  CASA: [
    "Residencia en",
    "Casa con alberca en",
    "Casa familiar en",
    "Hermosa casa en",
    "Casa remodelada en",
  ],
  DEPARTAMENTO: [
    "Departamento de lujo en",
    "Depto con vista en",
    "Departamento equipado en",
    "Depto céntrico en",
  ],
  TOWNHOUSE: ["Townhouse moderno en", "Casa en privada en", "Residencia en condominio"],
  TERRENO: ["Terreno en", "Lote residencial en", "Predio en"],
  LOCAL_COMERCIAL: ["Local comercial sobre", "Local en plaza", "Local a pie de calle en"],
  OFICINA: ["Oficina ejecutiva en", "Despacho en", "Oficina corporativa en"],
};

function hashId(seed: number): string {
  return seed.toString(36).padStart(8, "0");
}

function uniqueToken(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

// ---------------------------------------------------------------------------
// SEED
// ---------------------------------------------------------------------------

async function resetOrgBySlug(slug: string) {
  // onDelete: Cascade hace el trabajo en todas las relaciones con organizationId
  await db.organization.deleteMany({ where: { slug } });
}

async function seedOrg(slug: string, name: string, plan: "STARTER" | "PROFESSIONAL") {
  await resetOrgBySlug(slug);

  const org = await db.organization.create({
    data: {
      slug,
      name,
      primaryColor: "#C9A961",
      email: `contacto@${slug}.mx`,
      phone: "+52 662 100 0000",
      addressLine: "Blvd. Kino #123, Pitic",
      city: "Hermosillo",
      state: "Sonora",
      subscriptionPlan: plan,
      subscriptionStatus: "ACTIVE",
      trialEndsAt: daysFromNow(30),
    },
  });

  // -------------------------------------------------------------------------
  // Users — 4 por org (admin + broker + 2 agentes)
  // -------------------------------------------------------------------------
  const userDefs = [
    {
      role: "ADMINISTRADOR" as const,
      name: "Laura Bustamante",
      email: `admin@${slug}.mx`,
      zones: ZONAS_PREMIUM.slice(0, 3),
      specialties: ["CASA" as const, "DEPARTAMENTO" as const],
    },
    {
      role: "ADMINISTRADOR" as const,
      name: "Roberto Encinas",
      email: `admin2@${slug}.mx`,
      zones: [...ZONAS_PREMIUM.slice(0, 3), ...ZONAS_MEDIAS.slice(0, 2)],
      specialties: ["CASA" as const, "TOWNHOUSE" as const],
    },
    {
      role: "ASESOR" as const,
      name: "Paola Valenzuela",
      email: `asesor1@${slug}.mx`,
      zones: ZONAS_PREMIUM,
      specialties: ["DEPARTAMENTO" as const],
    },
    {
      role: "ASESOR" as const,
      name: "Javier Soto",
      email: `asesor2@${slug}.mx`,
      zones: ZONAS_MEDIAS,
      specialties: ["CASA" as const, "TERRENO" as const],
    },
  ];

  const passwordHash = await getPasswordHash();
  const users = [];
  for (const u of userDefs) {
    const user = await db.user.create({
      data: {
        organizationId: org.id,
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        avatarUrl: null,
        phone: fakePhone(),
        isActive: true,
        commissionDefaultPct: new Prisma.Decimal(u.role === "ADMINISTRADOR" ? 60 : 50),
        specialties: u.specialties,
        workingZones: u.zones,
        lastLoginAt: daysAgo(randInt(0, 5)),
      },
    });
    users.push(user);
  }
  const [admin, broker, agent1, agent2] = users as [typeof users[0], typeof users[0], typeof users[0], typeof users[0]];
  const agents = [broker, agent1, agent2];

  // -------------------------------------------------------------------------
  // Tags
  // -------------------------------------------------------------------------
  const tagsData: { name: string; color: string; kind: "LEAD" | "PROPERTY" | "OWNER" | "CLIENT" }[] = [
    { name: "Hot Lead", color: "#EF4444", kind: "LEAD" },
    { name: "Pre-aprobado crédito", color: "#10B981", kind: "LEAD" },
    { name: "Tocar en 48h", color: "#F59E0B", kind: "LEAD" },
    { name: "VIP", color: "#C9A961", kind: "CLIENT" },
    { name: "Referido", color: "#8B5CF6", kind: "CLIENT" },
    { name: "Destacada", color: "#C9A961", kind: "PROPERTY" },
    { name: "Exclusiva", color: "#0EA5E9", kind: "PROPERTY" },
    { name: "Requiere remodelación", color: "#F97316", kind: "PROPERTY" },
    { name: "Propietario frecuente", color: "#C9A961", kind: "OWNER" },
  ];
  const tags = await Promise.all(
    tagsData.map((t) => db.tag.create({ data: { ...t, organizationId: org.id } })),
  );
  const tagByKind = (kind: "LEAD" | "PROPERTY" | "OWNER" | "CLIENT") =>
    tags.filter((t) => t.kind === kind);

  // -------------------------------------------------------------------------
  // Owners — 15
  // -------------------------------------------------------------------------
  const owners = [];
  for (let i = 0; i < 15; i++) {
    const n = fakeName();
    const owner = await db.owner.create({
      data: {
        organizationId: org.id,
        firstName: n.first,
        lastName: n.last,
        rfc: `${n.last.substring(0, 4).toUpperCase()}${randInt(700101, 991231)}XXX`,
        email: `${slugify(n.first)}.${slugify(n.last.split(" ")[0]!)}@mail.com`,
        phone: fakePhone(),
        whatsapp: fakePhone(),
        preferredContactChannel: pick(["WHATSAPP", "PHONE", "EMAIL"] as const),
        addressLine: `Calle ${randInt(100, 999)}`,
        city: "Hermosillo",
        state: "Sonora",
        postalCode: `8${randInt(3000, 3500)}`,
        bankName: pick(["BBVA", "Banorte", "Santander", "Banamex", "HSBC"]),
        accountLast4: `${randInt(1000, 9999)}`,
        notes: i < 3 ? "Propietario con múltiples inmuebles — requiere reporte mensual por correo." : null,
        portalAccessEnabled: i < 8,
        portalAccessToken: i < 8 ? uniqueToken("own") : null,
      },
    });
    owners.push(owner);
  }
  // Tag: propietario frecuente a los primeros 3
  const ownerFreqTag = tagByKind("OWNER")[0];
  if (ownerFreqTag) {
    for (const o of owners.slice(0, 3)) {
      await db.ownerTag.create({ data: { ownerId: o.id, tagId: ownerFreqTag.id } });
    }
  }

  // -------------------------------------------------------------------------
  // Properties — 40
  // -------------------------------------------------------------------------
  const properties = [];
  for (let i = 0; i < 40; i++) {
    const tpl = pick(PLANTILLAS);
    const zone = pick(tpl.zones);
    const category = tpl.category;
    const transaction = tpl.transaction;
    const priceSale = tpl.priceSale
      ? randomDecimal(tpl.priceSale[0], tpl.priceSale[1], 50_000)
      : null;
    const priceRent = tpl.priceRent
      ? randomDecimal(tpl.priceRent[0], tpl.priceRent[1], 500)
      : null;
    const title = `${pick(TITULOS_POR_TIPO[category] ?? ["Inmueble en"])} ${zone}`;
    const code = `INM-2026-${String(i + 1).padStart(4, "0")}`;
    const ownerId = pick(owners).id;
    const agentId = pick(agents).id;
    const daysListed = randInt(1, 120);

    // distribuimos status: 70% disponibles, 10% apartada, 8% vendida, 5% rentada, 5% pausada, 2% en_negociacion
    const statusRoll = Math.random();
    const status =
      statusRoll < 0.7
        ? "DISPONIBLE"
        : statusRoll < 0.8
        ? "APARTADA"
        : statusRoll < 0.88
        ? "VENDIDA"
        : statusRoll < 0.93
        ? "RENTADA"
        : statusRoll < 0.98
        ? "PAUSADA"
        : "EN_NEGOCIACION";

    const property = await db.property.create({
      data: {
        organizationId: org.id,
        code,
        title,
        slug: `${slugify(title)}-${code.toLowerCase()}`,
        description: `Excelente ${category.toLowerCase()} ubicada en ${zone}, Hermosillo. ${tpl.amenities.length > 0 ? "Cuenta con " + tpl.amenities.join(", ") + "." : ""} Ideal para familias que buscan tranquilidad y excelente plusvalía.`,
        publicDescription: `${category.toLowerCase()} en ${zone}. ${tpl.amenities.slice(0, 3).join(", ")}. Excelente ubicación.`,
        internalNotes: i % 5 === 0 ? "Propietario abierto a negociar hasta 5% abajo del listado." : null,
        transactionType: transaction,
        category,
        subcategory: category === "CASA" ? "casa en fraccionamiento" : null,
        status,
        priceSale,
        priceRent,
        maintenanceFee: category === "DEPARTAMENTO" ? randomDecimal(1500, 4500, 100) : null,
        currency: "MXN",
        areaTotalM2: tpl.areaTotal ? new Prisma.Decimal(randInt(tpl.areaTotal[0], tpl.areaTotal[1])) : null,
        areaBuiltM2: tpl.areaBuilt ? new Prisma.Decimal(randInt(tpl.areaBuilt[0], tpl.areaBuilt[1])) : null,
        bedrooms: tpl.bedrooms ? randInt(tpl.bedrooms[0], tpl.bedrooms[1]) : null,
        bathrooms: tpl.bathrooms ? randInt(tpl.bathrooms[0], tpl.bathrooms[1]) : null,
        halfBathrooms: tpl.bedrooms ? randInt(0, 1) : null,
        parkingSpaces: tpl.parking ? randInt(tpl.parking[0], tpl.parking[1]) : null,
        floors: category === "CASA" ? randInt(1, 2) : 1,
        yearBuilt: randInt(2005, 2025),
        isFurnished: tpl.amenities.includes("amueblado"),
        acceptsPets: tpl.amenities.includes("pet-friendly") || Math.random() < 0.3,
        hasPool: tpl.amenities.includes("alberca") || tpl.amenities.includes("alberca común"),
        hasGarden: tpl.amenities.includes("jardín"),
        hasStudy: Math.random() < 0.3,
        hasServiceRoom: tpl.amenities.includes("cuarto de servicio"),
        amenities: tpl.amenities,
        conservation: tpl.conservation,
        addressStreet: `Calle ${pick(["Del Sol", "De los Álamos", "Reforma", "Progreso", "Miguel Hidalgo"])}`,
        addressNumber: String(randInt(100, 9999)),
        neighborhood: zone,
        city: "Hermosillo",
        state: "Sonora",
        postalCode: `8${randInt(3000, 3500)}`,
        latitude: new Prisma.Decimal((29.05 + Math.random() * 0.15).toFixed(7)),
        longitude: new Prisma.Decimal((-110.95 - Math.random() * 0.15).toFixed(7)),
        hideExactAddress: true,
        coverImageUrl: `https://picsum.photos/seed/${code}/1200/800`,
        ownerId,
        assignedAgentId: agentId,
        publishedToPortals: ["INMUEBLES24", "VIVANUNCIOS", "FACEBOOK_MARKETPLACE"].slice(
          0,
          randInt(0, 3),
        ),
        publishedAt: status === "BORRADOR" ? null : daysAgo(daysListed),
        daysOnMarket: daysListed,
        viewsCount: randInt(20, 3000),
        inquiriesCount: randInt(0, 50),
      },
    });

    // Imágenes (3 por propiedad)
    await db.propertyImage.createMany({
      data: Array.from({ length: 3 }).map((_, idx) => ({
        propertyId: property.id,
        url: `https://picsum.photos/seed/${code}-${idx}/1600/1000`,
        thumbnailUrl: `https://picsum.photos/seed/${code}-${idx}/400/260`,
        altText: `${title} foto ${idx + 1}`,
        order: idx,
        isCover: idx === 0,
        isPublic: true,
      })),
    });

    // Tag aleatorio en algunas
    if (i % 4 === 0) {
      const propTag = pick(tagByKind("PROPERTY"));
      await db.propertyTag.create({
        data: { propertyId: property.id, tagId: propTag.id },
      });
    }

    properties.push(property);
  }

  // -------------------------------------------------------------------------
  // Leads — 25 en distintas etapas
  // -------------------------------------------------------------------------
  const leadStatusDist: ("NUEVO" | "CONTACTADO" | "CALIFICADO" | "VISITA_AGENDADA" | "VISITA_REALIZADA" | "OFERTA" | "NEGOCIACION" | "GANADO" | "PERDIDO" | "EN_PAUSA")[] = [
    "NUEVO",
    "NUEVO",
    "NUEVO",
    "CONTACTADO",
    "CONTACTADO",
    "CONTACTADO",
    "CONTACTADO",
    "CALIFICADO",
    "CALIFICADO",
    "CALIFICADO",
    "VISITA_AGENDADA",
    "VISITA_AGENDADA",
    "VISITA_REALIZADA",
    "VISITA_REALIZADA",
    "VISITA_REALIZADA",
    "OFERTA",
    "OFERTA",
    "NEGOCIACION",
    "NEGOCIACION",
    "GANADO",
    "GANADO",
    "PERDIDO",
    "PERDIDO",
    "PERDIDO",
    "EN_PAUSA",
  ];

  const leads = [];
  for (let i = 0; i < 25; i++) {
    const n = fakeName();
    const status = leadStatusDist[i]!;
    const intent = pick(["COMPRA", "RENTA", "INVERSION", "AMBOS"] as const);
    const source = pick([
      "WEBSITE",
      "INMUEBLES24",
      "FACEBOOK",
      "INSTAGRAM",
      "WHATSAPP",
      "REFERIDO",
      "LETRERO",
      "LLAMADA_ENTRANTE",
    ] as const);
    const lost = status === "PERDIDO";
    const createdDaysAgo = randInt(1, 90);
    const lead = await db.lead.create({
      data: {
        organizationId: org.id,
        firstName: n.first,
        lastName: n.last,
        email: `${slugify(n.first)}${i}@mail.com`,
        phone: fakePhone(),
        whatsapp: fakePhone(),
        preferredContactChannel: "WHATSAPP",
        preferredContactTime: pick(["MORNING", "AFTERNOON", "EVENING", "ANYTIME"] as const),
        intent,
        propertyTypeInterests: pickN(
          ["CASA", "DEPARTAMENTO", "TOWNHOUSE", "TERRENO"] as const,
          randInt(1, 2),
        ),
        budgetMin:
          intent === "RENTA"
            ? randomDecimal(10_000, 18_000, 1000)
            : randomDecimal(2_000_000, 4_000_000, 100_000),
        budgetMax:
          intent === "RENTA"
            ? randomDecimal(20_000, 45_000, 1000)
            : randomDecimal(4_500_000, 9_000_000, 100_000),
        currency: "MXN",
        desiredZones: pickN(ZONAS_TODAS, randInt(1, 3)),
        minBedrooms: randInt(2, 4),
        minBathrooms: randInt(1, 3),
        minParkingSpaces: randInt(1, 2),
        minAreaM2: randInt(80, 200),
        mustHaves: pickN(
          ["alberca", "jardín", "pet-friendly", "amueblado", "seguridad 24/7", "gym"],
          randInt(0, 2),
        ),
        niceToHaves: pickN(["roof top", "estudio", "cuarto de servicio", "vista"], randInt(0, 2)),
        source,
        sourceDetail: source === "WEBSITE" ? "landing de ventas" : null,
        utmCampaign: source === "FACEBOOK" || source === "INSTAGRAM" ? `${slug}-prospecting-q2` : null,
        utmMedium: source === "FACEBOOK" || source === "INSTAGRAM" ? "social-paid" : null,
        status,
        lostReason: lost
          ? pick(["PRECIO", "ZONA", "NO_CALIFICA_CREDITO", "PERDIO_INTERES", "COMPRO_OTRA"])
          : null,
        lostReasonDetail: lost ? "El prospecto mencionó que se decidió por otra opción." : null,
        qualificationScore:
          status === "NUEVO"
            ? null
            : status === "GANADO"
            ? randInt(85, 100)
            : status === "PERDIDO"
            ? randInt(20, 50)
            : randInt(50, 85),
        assignedAgentId: pick(agents).id,
        firstContactAt:
          status === "NUEVO" ? null : daysAgo(createdDaysAgo - randInt(0, 2)),
        lastContactAt: status === "NUEVO" ? null : daysAgo(randInt(0, 5)),
        nextFollowUpAt:
          ["NUEVO", "CONTACTADO", "CALIFICADO", "VISITA_AGENDADA", "NEGOCIACION"].includes(status)
            ? daysFromNow(randInt(1, 7))
            : null,
        notes: "Prospecto importado desde " + source,
        createdAt: daysAgo(createdDaysAgo),
      },
    });

    // tags para algunos leads
    if (i % 5 === 0) {
      const t = pick(tagByKind("LEAD"));
      await db.leadTag.create({ data: { leadId: lead.id, tagId: t.id } });
    }

    leads.push(lead);
  }

  // Convertir los 2 leads GANADO a Clients
  const wonLeads = leads.filter((l) => l.status === "GANADO");
  const clientsFromLeads: { leadId: string; clientId: string }[] = [];
  for (const wl of wonLeads) {
    const client = await db.client.create({
      data: {
        organizationId: org.id,
        leadId: wl.id,
        type: wl.intent === "RENTA" ? "INQUILINO" : "COMPRADOR",
        firstName: wl.firstName,
        lastName: wl.lastName,
        email: wl.email,
        phone: wl.phone,
        whatsapp: wl.whatsapp,
        birthday: new Date(1985 + randInt(0, 15), randInt(0, 11), randInt(1, 28)),
        totalOperations: 1,
        lifetimeValueMxn: new Prisma.Decimal(randInt(200_000, 800_000)),
        portalAccessEnabled: true,
        portalAccessToken: uniqueToken("cli"),
      },
    });
    await db.lead.update({ where: { id: wl.id }, data: { convertedToClientId: client.id } });
    clientsFromLeads.push({ leadId: wl.id, clientId: client.id });
  }

  // Además creamos clientes extra para inquilinos de rentas activas (aparte de leads ganados)
  const extraTenants = [];
  for (let i = 0; i < 5; i++) {
    const n = fakeName();
    const c = await db.client.create({
      data: {
        organizationId: org.id,
        type: "INQUILINO",
        firstName: n.first,
        lastName: n.last,
        email: `${slugify(n.first)}.tenant${i}@mail.com`,
        phone: fakePhone(),
        whatsapp: fakePhone(),
        birthday: new Date(1980 + randInt(0, 20), randInt(0, 11), randInt(1, 28)),
        totalOperations: 1,
        lifetimeValueMxn: randomDecimal(50_000, 300_000, 10_000),
        portalAccessEnabled: true,
        portalAccessToken: uniqueToken("cli"),
      },
    });
    extraTenants.push(c);
  }

  // -------------------------------------------------------------------------
  // CONTRATOS
  // Pedido: 5 arrendamientos activos + 3 compraventas cerradas + 2 mandatos firmados
  // -------------------------------------------------------------------------

  // Mandatos (2)
  const rentProps = properties.filter((p) => p.transactionType === "RENTA" || p.transactionType === "VENTA_Y_RENTA");
  const saleProps = properties.filter((p) => p.transactionType === "VENTA" || p.transactionType === "VENTA_Y_RENTA");

  const mandatos = [];
  for (let i = 0; i < 2; i++) {
    const p = saleProps[i] ?? properties[i]!;
    const m = await db.propertyContract.create({
      data: {
        organizationId: org.id,
        propertyId: p.id,
        contractKind: i === 0 ? "MANDATO_EXCLUSIVA" : "MANDATO_NO_EXCLUSIVA",
        status: "ACTIVO",
        startDate: daysAgo(60),
        endDate: daysFromNow(120),
        durationMonths: 6,
        ownerId: p.ownerId,
        agentId: p.assignedAgentId,
        commissionPct: new Prisma.Decimal(5.0),
        commissionAmount: p.priceSale
          ? new Prisma.Decimal(Number(p.priceSale) * 0.05)
          : null,
        agreedPrice: p.priceSale ?? new Prisma.Decimal(3_500_000),
        externalDocumentUrl: `https://drive.example.com/mandato-${p.code}.pdf`,
        notes: "Firmado en oficina. PDF en Drive.",
        reminderDaysBeforeEnd: 30,
      },
    });
    await db.property.update({ where: { id: p.id }, data: { captureContractId: m.id } });
    mandatos.push(m);
  }

  // Compraventas cerradas (3)
  const compraventas = [];
  for (let i = 0; i < 3; i++) {
    const p = saleProps[i + 2] ?? properties[i + 2]!;
    const buyer =
      clientsFromLeads[i % clientsFromLeads.length]?.clientId ??
      (await db.client
        .create({
          data: {
            organizationId: org.id,
            type: "COMPRADOR",
            firstName: pick(NOMBRES),
            lastName: `${pick(APELLIDOS)} ${pick(APELLIDOS)}`,
            email: `buyer${i}@mail.com`,
            phone: fakePhone(),
            whatsapp: fakePhone(),
            totalOperations: 1,
            lifetimeValueMxn: new Prisma.Decimal(0),
          },
        })
        .then((c) => c.id));
    const cv = await db.propertyContract.create({
      data: {
        organizationId: org.id,
        propertyId: p.id,
        contractKind: "COMPRAVENTA",
        status: "TERMINADO",
        startDate: daysAgo(150),
        endDate: daysAgo(120),
        durationMonths: 1,
        ownerId: p.ownerId,
        clientId: buyer,
        agentId: p.assignedAgentId,
        commissionPct: new Prisma.Decimal(5.0),
        commissionAmount: p.priceSale
          ? new Prisma.Decimal(Number(p.priceSale) * 0.05)
          : new Prisma.Decimal(200_000),
        agreedPrice: p.priceSale ?? new Prisma.Decimal(3_200_000),
        externalDocumentUrl: `https://drive.example.com/cv-${p.code}.pdf`,
        notes: "Operación concretada. Escrituración completada.",
      },
    });
    // dejar propiedad como VENDIDA
    await db.property.update({ where: { id: p.id }, data: { status: "VENDIDA" } });
    compraventas.push(cv);
  }

  // Arrendamientos activos (5)
  const tenants = [
    ...clientsFromLeads.map((c) => c.clientId),
    ...extraTenants.map((t) => t.id),
  ];
  const rentalsCreated = [];
  for (let i = 0; i < 5; i++) {
    const p = rentProps[i] ?? properties[i]!;
    const tenantClientId = tenants[i % tenants.length]!;
    const startDate = daysAgo(randInt(60, 300));
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // 12 meses típico

    const monthlyRent = p.priceRent ?? new Prisma.Decimal(randInt(15_000, 28_000));

    const contract = await db.propertyContract.create({
      data: {
        organizationId: org.id,
        propertyId: p.id,
        contractKind: "ARRENDAMIENTO",
        status: "ACTIVO",
        startDate,
        endDate,
        durationMonths: 12,
        ownerId: p.ownerId,
        clientId: tenantClientId,
        agentId: p.assignedAgentId,
        commissionPct: new Prisma.Decimal(100), // 1 mes de renta como comisión
        commissionAmount: monthlyRent,
        agreedPrice: monthlyRent,
        depositAmount: monthlyRent,
        externalDocumentUrl: `https://drive.example.com/arr-${p.code}.pdf`,
        notes: "Arrendamiento 12 meses. Depósito entregado.",
        reminderDaysBeforeEnd: 45,
      },
    });

    const rental = await db.rental.create({
      data: {
        organizationId: org.id,
        propertyId: p.id,
        contractId: contract.id,
        tenantClientId,
        ownerId: p.ownerId,
        managingAgentId: p.assignedAgentId,
        monthlyRent,
        currency: "MXN",
        paymentDueDay: pick([1, 5, 10, 15]),
        startDate,
        endDate,
        status: "ACTIVA",
        depositHeld: monthlyRent,
        inventoryList: {
          llaves: 2,
          controles: 1,
          electrodomesticos: ["refrigerador", "estufa", "lavadora"],
          estado_general: "BUENO",
        },
        utilitiesIncluded: pickN(["AGUA", "GAS", "INTERNET"], randInt(0, 2)),
        notes: "Inquilino entregó referencias laborales.",
      },
    });

    await db.property.update({ where: { id: p.id }, data: { status: "RENTADA" } });

    // Generar pagos mensuales: desde startDate hasta hoy. Usamos primero-de-mes para evitar
    // overflow cuando startDate.getDate() es 31 y el mes siguiente no tiene día 31.
    const monthsElapsed = Math.max(
      1,
      Math.floor((Date.now() - startDate.getTime()) / (30 * 24 * 3600 * 1000)),
    );
    const firstPeriod = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    for (let m = 0; m < monthsElapsed; m++) {
      const period = new Date(firstPeriod.getFullYear(), firstPeriod.getMonth() + m, 1);
      const periodMonth = `${period.getFullYear()}-${String(period.getMonth() + 1).padStart(2, "0")}`;
      const dueDate = new Date(period.getFullYear(), period.getMonth(), rental.paymentDueDay);
      const isLatest = m === monthsElapsed - 1;
      const willPay = !isLatest || Math.random() > 0.3;
      await db.rentalPayment.create({
        data: {
          rentalId: rental.id,
          periodMonth,
          dueDate,
          amountDue: monthlyRent,
          amountPaid: willPay ? monthlyRent : new Prisma.Decimal(0),
          paidAt: willPay ? new Date(dueDate.getTime() + randInt(-2, 5) * 24 * 3600 * 1000) : null,
          status: willPay ? "PAGADO" : isLatest ? "PENDIENTE" : "VENCIDO",
          paymentReference: willPay ? `SPEI-${randInt(10000000, 99999999)}` : null,
          receivedBy: i % 2 === 0 ? "DIRECTO_AL_PROPIETARIO" : "VIA_AGENCIA",
          remindersSentCount: willPay ? 0 : randInt(1, 3),
        },
      });
    }

    // Maintenance: a 2 de las 5 rentas le metemos un reporte
    if (i < 2) {
      await db.maintenanceRequest.create({
        data: {
          organizationId: org.id,
          rentalId: rental.id,
          propertyId: p.id,
          reportedByClientId: tenantClientId,
          title: i === 0 ? "Fuga en llave de cocina" : "Aire acondicionado no enfría",
          description:
            i === 0
              ? "Desde hace 3 días está goteando la llave del fregadero. Ya puse un cubo pero el agua no para."
              : "El aire del cuarto principal sopla tibio. Probamos bajar a 18° pero sigue igual.",
          category: i === 0 ? "PLOMERIA" : "AIRE_ACONDICIONADO",
          priority: i === 0 ? "MEDIA" : "ALTA",
          status: i === 0 ? "EN_PROCESO" : "APROBADO_PROPIETARIO",
          images: [`https://picsum.photos/seed/maint-${i}/800/600`],
          assignedToId: pick(agents).id,
          estimatedCost: new Prisma.Decimal(i === 0 ? 1_200 : 3_500),
          paidByOwner: true,
          ownerNotifiedAt: daysAgo(2),
          ownerApprovedAt: i === 0 ? null : daysAgo(1),
          internalNotes: i === 0 ? "Esperando cotización del plomero." : "Programado técnico para mañana.",
        },
      });
    }

    rentalsCreated.push(rental);
  }

  // -------------------------------------------------------------------------
  // Viewings — algunas en futuro y pasado para los leads activos
  // -------------------------------------------------------------------------
  const activeLeads = leads.filter((l) =>
    ["VISITA_AGENDADA", "VISITA_REALIZADA", "OFERTA", "NEGOCIACION"].includes(l.status),
  );
  for (const lead of activeLeads) {
    const prop = pick(properties);
    const agent = pick(agents);
    const past = lead.status !== "VISITA_AGENDADA";
    await db.viewing.create({
      data: {
        organizationId: org.id,
        propertyId: prop.id,
        leadId: lead.id,
        agentId: agent.id,
        scheduledAt: past ? daysAgo(randInt(3, 20)) : daysFromNow(randInt(1, 7)),
        durationMinutes: 45,
        status: past ? "REALIZADA" : "CONFIRMADA",
        leadInterestLevel: past ? pick(["MUY_ALTO", "ALTO", "MEDIO", "BAJO"] as const) : null,
        leadFeedback: past ? "Le gustó la cocina y el jardín; le preocupa la distancia al trabajo." : null,
        agentNotes: "Confirmar una hora antes por WhatsApp.",
        meetingPoint: "En la entrada del fraccionamiento",
      },
    });
  }

  // -------------------------------------------------------------------------
  // Offers — para leads en OFERTA/NEGOCIACION
  // -------------------------------------------------------------------------
  const offerLeads = leads.filter((l) => l.status === "OFERTA" || l.status === "NEGOCIACION");
  for (const lead of offerLeads) {
    const prop = pick(saleProps.length > 0 ? saleProps : properties);
    const offered = prop.priceSale
      ? new Prisma.Decimal(Math.floor(Number(prop.priceSale) * (0.88 + Math.random() * 0.08)))
      : new Prisma.Decimal(3_000_000);
    await db.offer.create({
      data: {
        organizationId: org.id,
        propertyId: prop.id,
        leadId: lead.id,
        offerKind: pick(["CARTA_OFERTA", "OFERTA_FIRME"] as const),
        offeredAmount: offered,
        currency: "MXN",
        offeredPaymentMethod: pick(["CONTADO", "CREDITO_BANCARIO", "CREDITO_INFONAVIT", "MIXTO"] as const),
        conditions:
          "Sujeto a peritaje bancario. Solicita dejar todos los aires acondicionados y lavadora-secadora.",
        status: lead.status === "NEGOCIACION" ? "CONTRAOFERTA" : "EN_REVISION",
        counterofferFromOwner:
          lead.status === "NEGOCIACION"
            ? new Prisma.Decimal(Math.floor(Number(offered) * 1.04))
            : null,
        expiresAt: daysFromNow(10),
        agentId: pick(agents).id,
      },
    });
  }

  // -------------------------------------------------------------------------
  // Interactions — timeline por lead (últimas 3-5 interacciones)
  // -------------------------------------------------------------------------
  for (const lead of leads) {
    const count = randInt(1, 5);
    for (let k = 0; k < count; k++) {
      const direction: "ENTRANTE" | "SALIENTE" | "INTERNA" | "AUTOMATICA" = k === 0 ? "ENTRANTE" : pick(["SALIENTE", "ENTRANTE", "INTERNA"] as const);
      const kind: "WHATSAPP" | "LLAMADA" | "EMAIL" | "NOTA_INTERNA" | "EVENTO_SISTEMA" =
        direction === "INTERNA" ? "NOTA_INTERNA" : pick(["WHATSAPP", "LLAMADA", "EMAIL"] as const);
      await db.interaction.create({
        data: {
          organizationId: org.id,
          kind,
          direction,
          relatedLeadId: lead.id,
          relatedPropertyId: k === 0 ? pick(properties).id : null,
          summary:
            kind === "WHATSAPP"
              ? direction === "ENTRANTE"
                ? "Pregunta si la casa sigue disponible"
                : "Enviamos ficha técnica y 3 fotos"
              : kind === "LLAMADA"
              ? direction === "ENTRANTE"
                ? "Llamada de 3 min — interesado en agendar visita"
                : "Llamada no contestada, se mandó WhatsApp"
              : kind === "EMAIL"
              ? "Envío de presentación PDF"
              : "Nota interna del agente",
          body:
            kind === "NOTA_INTERNA"
              ? "Lead con buen nivel de pre-calificación de crédito. Vale la pena invertir tiempo."
              : null,
          occurredAt: daysAgo(randInt(0, 30)),
          durationSeconds: kind === "LLAMADA" ? randInt(45, 300) : null,
          createdById: direction === "AUTOMATICA" ? null : pick(agents).id,
          channelMessageId: kind === "WHATSAPP" ? `wa_${lead.id}_${k}` : null,
        },
      });
    }
  }

  // -------------------------------------------------------------------------
  // Matches — sugerencias propiedad↔lead generadas por heurística simple
  // -------------------------------------------------------------------------
  const leadsLookingToBuyOrRent = leads.filter((l) =>
    ["CONTACTADO", "CALIFICADO", "VISITA_AGENDADA", "NUEVO"].includes(l.status),
  );
  for (const lead of leadsLookingToBuyOrRent) {
    const candidates = properties.filter((p) => {
      if (p.status !== "DISPONIBLE") return false;
      const catOk =
        lead.propertyTypeInterests.length === 0 ||
        lead.propertyTypeInterests.includes(p.category);
      const zoneOk =
        lead.desiredZones.length === 0 ||
        (p.neighborhood && lead.desiredZones.includes(p.neighborhood));
      const priceOk =
        lead.intent === "RENTA"
          ? p.priceRent &&
            (!lead.budgetMin || Number(p.priceRent) >= Number(lead.budgetMin) * 0.8) &&
            (!lead.budgetMax || Number(p.priceRent) <= Number(lead.budgetMax) * 1.2)
          : p.priceSale &&
            (!lead.budgetMin || Number(p.priceSale) >= Number(lead.budgetMin) * 0.8) &&
            (!lead.budgetMax || Number(p.priceSale) <= Number(lead.budgetMax) * 1.2);
      return catOk && (zoneOk || priceOk);
    });

    const picks = pickN(candidates, Math.min(3, candidates.length));
    for (const p of picks) {
      const reasons: string[] = [];
      if (lead.propertyTypeInterests.includes(p.category)) reasons.push("CATEGORY_FIT");
      if (p.neighborhood && lead.desiredZones.includes(p.neighborhood)) reasons.push("ZONE_FIT");
      if (lead.intent === "RENTA" && p.priceRent) reasons.push("PRICE_FIT");
      if (lead.intent !== "RENTA" && p.priceSale) reasons.push("PRICE_FIT");
      if (lead.minBedrooms && p.bedrooms && p.bedrooms >= lead.minBedrooms) reasons.push("BEDROOMS_FIT");
      if (lead.mustHaves.some((m) => p.amenities.includes(m))) reasons.push("MUST_HAVES_FIT");
      const score = Math.min(100, 40 + reasons.length * 12 + randInt(0, 10));
      try {
        await db.matchSuggestion.create({
          data: {
            organizationId: org.id,
            leadId: lead.id,
            propertyId: p.id,
            score: new Prisma.Decimal(score),
            matchReasons: reasons,
            status: pick(["PROPUESTO", "VISTO_POR_AGENTE", "ENVIADO_AL_LEAD"] as const),
            viewedByAgentAt: daysAgo(randInt(1, 7)),
            sentToLeadAt: Math.random() > 0.5 ? daysAgo(randInt(0, 5)) : null,
          },
        });
      } catch {
        // unique (leadId, propertyId) puede chocar si pickN repite — ignoramos
      }
    }
  }

  // -------------------------------------------------------------------------
  // Tasks — pendientes por agente
  // -------------------------------------------------------------------------
  const taskTemplates = [
    { title: "Llamar para confirmar visita", priority: "ALTA" as const },
    { title: "Enviar ficha técnica por WhatsApp", priority: "MEDIA" as const },
    { title: "Seguimiento post-visita", priority: "MEDIA" as const },
    { title: "Pedir documentos del crédito", priority: "ALTA" as const },
    { title: "Actualizar fotos de la propiedad", priority: "BAJA" as const },
    { title: "Renovar publicación en Inmuebles24", priority: "MEDIA" as const },
  ];
  for (let i = 0; i < 10; i++) {
    const t = pick(taskTemplates);
    const lead = pick(leads);
    await db.task.create({
      data: {
        organizationId: org.id,
        title: t.title,
        description: `Auto-generada para follow-up de ${lead.firstName} ${lead.lastName}`,
        relatedLeadId: lead.id,
        assignedToId: lead.assignedAgentId ?? pick(agents).id,
        createdById: admin.id,
        dueAt: daysFromNow(randInt(0, 5)),
        priority: t.priority,
        status: i < 7 ? "PENDIENTE" : "COMPLETADA",
        completedAt: i >= 7 ? daysAgo(randInt(0, 3)) : null,
      },
    });
  }

  // -------------------------------------------------------------------------
  // Notification preferences (default para admin)
  // -------------------------------------------------------------------------
  const events = ["NEW_LEAD", "LEAD_REPLY", "VIEWING_REMINDER", "CONTRACT_EXPIRING", "PAYMENT_DUE", "MAINTENANCE_REQUEST"] as const;
  for (const ev of events) {
    await db.notificationPreference.create({
      data: { userId: admin.id, channel: "EMAIL", event: ev, enabled: true },
    });
    await db.notificationPreference.create({
      data: { userId: admin.id, channel: "IN_APP", event: ev, enabled: true },
    });
  }

  // -------------------------------------------------------------------------
  // Audit log — ejemplos de eventos recientes
  // -------------------------------------------------------------------------
  await db.auditLog.createMany({
    data: [
      {
        organizationId: org.id,
        userId: admin.id,
        entity: "Property",
        entityId: properties[0]!.id,
        action: "CREATE",
        changes: { title: properties[0]!.title },
        ipAddress: "187.237.100.10",
        userAgent: "Mozilla/5.0",
      },
      {
        organizationId: org.id,
        userId: broker.id,
        entity: "Lead",
        entityId: leads[0]!.id,
        action: "STATUS_CHANGE",
        changes: { from: "NUEVO", to: "CONTACTADO" },
      },
      {
        organizationId: org.id,
        userId: admin.id,
        entity: "PropertyContract",
        entityId: mandatos[0]!.id,
        action: "CREATE",
        changes: { kind: "MANDATO_EXCLUSIVA" },
      },
    ],
  });

  console.log(
    `  ✔ ${name}: ${users.length} usuarios, ${owners.length} propietarios, ${properties.length} propiedades, ${leads.length} leads, ${rentalsCreated.length} rentas activas, ${mandatos.length + compraventas.length + rentalsCreated.length} contratos.`,
  );
}

async function main() {
  console.log("🌱 Seeding Inmobiliaria CRM...");
  await seedOrg("inmobiliaria-hermosillo", "Inmobiliaria Hermosillo", "PROFESSIONAL");
  await seedOrg("sonora-propiedades", "Sonora Propiedades", "STARTER");
  console.log("✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
