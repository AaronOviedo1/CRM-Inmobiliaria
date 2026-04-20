import {
  ContactChannel,
  ContactTime,
  ClientType,
  ConservationState,
  ContractKind,
  ContractStatus,
  Currency,
  InteractionDirection,
  InteractionKind,
  InterestLevel,
  LeadIntent,
  LeadSource,
  LeadStatus,
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus,
  MatchStatus,
  OfferKind,
  OfferPaymentMethod,
  OfferStatus,
  PropertyCategory,
  PropertyStatus,
  RentalPaymentChannel,
  RentalPaymentStatus,
  RentalStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  TaskPriority,
  TaskStatus,
  TransactionType,
  UserRole,
  ViewingStatus,
  type Client,
  type Interaction,
  type Lead,
  type MaintenanceRequest,
  type MatchSuggestion,
  type Message,
  type Offer,
  type Organization,
  type Owner,
  type Property,
  type PropertyContract,
  type PropertyDocument,
  type PropertyImage,
  type Rental,
  type RentalPayment,
  type Task,
  type User,
  type Viewing,
  type Conversation,
  type Tag,
} from "@/lib/types";
import {
  AMENITIES_POOL,
  AVATARS,
  FIRST_NAMES,
  HERMOSILLO_ZONES,
  LAST_NAMES,
  PROPERTY_IMAGES,
  STREET_NAMES,
} from "./fixtures";
import {
  chance,
  createRng,
  cuid,
  pickOne,
  pickSome,
  rangeFloat,
  rangeInt,
  shiftDate,
  slugify,
} from "./seed";

const NOW = new Date("2026-04-19T12:00:00Z");
const rng = createRng(2026);

// ─── Organization ────────────────────────────────────────────────────

export const MOCK_ORG: Organization = {
  id: "org_premium",
  name: "Casa Dorada Bienes Raíces",
  slug: "casa-dorada",
  logoUrl: null,
  primaryColor: "#C9A961",
  phone: "6621234567",
  email: "contacto@casadorada.mx",
  addressLine: "Blvd. Navarrete 128, Col. Pitic",
  city: "Hermosillo",
  state: "Sonora",
  subscriptionPlan: SubscriptionPlan.PROFESSIONAL,
  subscriptionStatus: SubscriptionStatus.ACTIVE,
  trialEndsAt: null,
  createdAt: shiftDate(NOW, -420),
  updatedAt: shiftDate(NOW, -2),
};

// ─── Users ───────────────────────────────────────────────────────────

const AGENT_PROFILES = [
  { name: "Mariana Bringas", role: UserRole.AGENCY_ADMIN },
  { name: "Rodrigo Encinas", role: UserRole.BROKER },
  { name: "Fernanda Corral", role: UserRole.AGENT },
  { name: "Alejandro Bours", role: UserRole.AGENT },
  { name: "Paola Salazar", role: UserRole.AGENT },
  { name: "Carlos Valenzuela", role: UserRole.ASSISTANT },
];

export const MOCK_USERS: User[] = AGENT_PROFILES.map((p, i) => ({
  id: `user_${i + 1}`,
  organizationId: MOCK_ORG.id,
  email: `${slugify(p.name).replace(/-/g, ".")}@casadorada.mx`,
  name: p.name,
  avatarUrl: AVATARS[i]!,
  phone: `66212${(34500 + i * 17).toString().padStart(5, "0")}`,
  role: p.role,
  isActive: true,
  lastLoginAt: shiftDate(NOW, -rangeInt(rng, 0, 2)),
  commissionDefaultPct: 50,
  specialties: pickSome(
    rng,
    [
      PropertyCategory.CASA,
      PropertyCategory.DEPARTAMENTO,
      PropertyCategory.TERRENO,
      PropertyCategory.LOCAL_COMERCIAL,
      PropertyCategory.OFICINA,
    ],
    1,
    3
  ),
  workingZones: pickSome(
    rng,
    HERMOSILLO_ZONES.map((z) => z.name),
    2,
    4
  ),
  createdAt: shiftDate(NOW, -rangeInt(rng, 60, 400)),
  updatedAt: shiftDate(NOW, -5),
}));

export const CURRENT_USER = MOCK_USERS[0]!;

// ─── Owners ──────────────────────────────────────────────────────────

export const MOCK_OWNERS: Owner[] = Array.from({ length: 18 }, (_, i) => {
  const first = pickOne(rng, FIRST_NAMES);
  const last = pickOne(rng, LAST_NAMES);
  return {
    id: `owner_${i + 1}`,
    organizationId: MOCK_ORG.id,
    firstName: first,
    lastName: `${last} ${pickOne(rng, LAST_NAMES)}`,
    rfc: chance(rng, 0.5) ? `${last.slice(0, 4).toUpperCase()}850${rangeInt(rng, 100, 999)}XY1` : null,
    email: `${slugify(first)}.${slugify(last)}@mail.com`,
    phone: `66218${(10000 + i * 131).toString().padStart(5, "0")}`,
    whatsapp: `52662188${(20000 + i * 131).toString().padStart(5, "0")}`,
    preferredContactChannel: pickOne(rng, [
      ContactChannel.WHATSAPP,
      ContactChannel.PHONE,
      ContactChannel.EMAIL,
    ]),
    addressLine: `${pickOne(rng, STREET_NAMES)} #${rangeInt(rng, 100, 999)}`,
    city: "Hermosillo",
    state: "Sonora",
    postalCode: `${rangeInt(rng, 83000, 83299)}`,
    bankName: chance(rng, 0.6) ? pickOne(rng, ["BBVA", "Santander", "Banorte", "HSBC"]) : null,
    accountLast4: chance(rng, 0.6)
      ? `${rangeInt(rng, 1000, 9999)}`
      : null,
    notes: chance(rng, 0.25)
      ? "Prefiere comunicación por las mañanas. Tiene otro inmueble en consideración para captación."
      : null,
    portalAccessEnabled: chance(rng, 0.6),
    portalAccessToken: chance(rng, 0.6) ? cuid(rng, "ptk") : null,
    createdAt: shiftDate(NOW, -rangeInt(rng, 30, 500)),
    updatedAt: shiftDate(NOW, -rangeInt(rng, 0, 30)),
    deletedAt: null,
  };
});

// ─── Properties ──────────────────────────────────────────────────────

const PROP_STATUSES: PropertyStatus[] = [
  PropertyStatus.DISPONIBLE,
  PropertyStatus.DISPONIBLE,
  PropertyStatus.DISPONIBLE,
  PropertyStatus.DISPONIBLE,
  PropertyStatus.DISPONIBLE,
  PropertyStatus.APARTADA,
  PropertyStatus.EN_NEGOCIACION,
  PropertyStatus.RENTADA,
  PropertyStatus.VENDIDA,
  PropertyStatus.PAUSADA,
];

function makePropertyTitle(
  rng: () => number,
  category: PropertyCategory,
  transaction: TransactionType,
  zone: string
): string {
  const categoryLabel: Record<PropertyCategory, string> = {
    CASA: "Casa",
    DEPARTAMENTO: "Departamento",
    TOWNHOUSE: "Townhouse",
    TERRENO: "Terreno",
    LOCAL_COMERCIAL: "Local",
    OFICINA: "Oficina",
    BODEGA: "Bodega",
    NAVE_INDUSTRIAL: "Nave industrial",
    EDIFICIO: "Edificio",
    RANCHO: "Rancho",
    OTRO: "Inmueble",
  };
  const vibes = [
    "con vista al cerro",
    "remodelada a detalle",
    "en privada cerrada",
    "con alberca climatizada",
    "lista para estrenar",
    "con amplio jardín",
    "en condominio premium",
    "con acabados de lujo",
    "de arquitectura contemporánea",
    "impecable",
  ];
  const vibe = pickOne(rng, vibes);
  const tt = transaction === TransactionType.RENTA ? "en renta" : "en venta";
  return `${categoryLabel[category]} ${vibe} en ${zone} ${tt}`;
}

function makePropertyImages(
  propertyId: string,
  startIdx: number,
  count: number
): PropertyImage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${propertyId}_img_${i}`,
    propertyId,
    url: PROPERTY_IMAGES[(startIdx + i) % PROPERTY_IMAGES.length]!,
    thumbnailUrl: PROPERTY_IMAGES[(startIdx + i) % PROPERTY_IMAGES.length]!,
    altText: `Foto ${i + 1}`,
    order: i,
    isCover: i === 0,
    isPublic: true,
    createdAt: NOW,
  }));
}

function makePropertyDocs(propertyId: string, count: number): PropertyDocument[] {
  const kinds = ["ESCRITURA", "PLANO", "PREDIAL", "AGUA"] as const;
  return Array.from({ length: count }, (_, i) => ({
    id: `${propertyId}_doc_${i}`,
    propertyId,
    label:
      kinds[i % kinds.length] === "ESCRITURA"
        ? "Escritura pública"
        : kinds[i % kinds.length] === "PLANO"
          ? "Plano arquitectónico"
          : kinds[i % kinds.length] === "PREDIAL"
            ? "Recibo predial 2026"
            : "Recibo de agua",
    url: "#",
    type: kinds[i % kinds.length]!,
    isPublicToOwnerPortal: i % 2 === 0,
    uploadedAt: shiftDate(NOW, -rangeInt(rng, 10, 120)),
  }));
}

export const MOCK_PROPERTIES: Property[] = Array.from({ length: 40 }, (_, i) => {
  const zone = HERMOSILLO_ZONES[i % HERMOSILLO_ZONES.length]!;
  const category = pickOne(rng, [
    PropertyCategory.CASA,
    PropertyCategory.CASA,
    PropertyCategory.CASA,
    PropertyCategory.DEPARTAMENTO,
    PropertyCategory.DEPARTAMENTO,
    PropertyCategory.TERRENO,
    PropertyCategory.LOCAL_COMERCIAL,
    PropertyCategory.OFICINA,
    PropertyCategory.TOWNHOUSE,
  ]);
  const transaction = pickOne(rng, [
    TransactionType.VENTA,
    TransactionType.VENTA,
    TransactionType.RENTA,
    TransactionType.RENTA,
    TransactionType.VENTA_Y_RENTA,
  ]);
  const status = PROP_STATUSES[i % PROP_STATUSES.length]!;
  const owner = MOCK_OWNERS[i % MOCK_OWNERS.length]!;
  const agent = MOCK_USERS[(i % 4) + 2]!;
  const id = `prop_${(i + 1).toString().padStart(3, "0")}`;
  const code = `CD-2026-${(i + 1).toString().padStart(4, "0")}`;
  const title = makePropertyTitle(rng, category, transaction, zone.name);
  const images = makePropertyImages(id, i * 2, rangeInt(rng, 5, 9));
  const salePriceBase =
    category === PropertyCategory.TERRENO
      ? rangeInt(rng, 1800000, 9500000)
      : category === PropertyCategory.DEPARTAMENTO
        ? rangeInt(rng, 2200000, 8500000)
        : rangeInt(rng, 3200000, 18000000);
  const hasSale =
    transaction === TransactionType.VENTA ||
    transaction === TransactionType.VENTA_Y_RENTA ||
    (transaction as string) === TransactionType.PREVENTA;
  const hasRent =
    transaction === TransactionType.RENTA ||
    transaction === TransactionType.VENTA_Y_RENTA;
  const publishedAt = (status as string) === PropertyStatus.BORRADOR ? null : shiftDate(NOW, -rangeInt(rng, 1, 180));

  return {
    id,
    organizationId: MOCK_ORG.id,
    code,
    title,
    slug: slugify(`${title}-${code}`),
    description:
      "Hermoso inmueble ubicado en una de las mejores zonas de Hermosillo. Acabados de primera calidad, amplios espacios, excelente iluminación natural y vialidades principales a minutos. Cuenta con privilegiada ubicación, cerca de plazas, escuelas y servicios.",
    transactionType: transaction,
    category,
    subcategory: null,
    status,

    priceSale: hasSale ? salePriceBase : null,
    priceRent: hasRent ? rangeInt(rng, 14000, 65000) : null,
    maintenanceFee: category === PropertyCategory.DEPARTAMENTO ? rangeInt(rng, 1500, 5500) : null,
    currency: Currency.MXN,

    areaTotalM2:
      category === PropertyCategory.TERRENO
        ? rangeInt(rng, 200, 1200)
        : rangeInt(rng, 180, 650),
    areaBuiltM2:
      category === PropertyCategory.TERRENO ? null : rangeInt(rng, 90, 520),
    bedrooms: category === PropertyCategory.TERRENO ? null : rangeInt(rng, 2, 5),
    bathrooms: category === PropertyCategory.TERRENO ? null : rangeInt(rng, 1, 4),
    halfBathrooms: category === PropertyCategory.TERRENO ? null : rangeInt(rng, 0, 2),
    parkingSpaces: rangeInt(rng, 1, 4),
    floors: category === PropertyCategory.DEPARTAMENTO ? 1 : rangeInt(rng, 1, 2),
    yearBuilt: rangeInt(rng, 2005, 2025),

    isFurnished: chance(rng, 0.25),
    acceptsPets: chance(rng, 0.5),
    hasPool: chance(rng, 0.3),
    hasGarden: chance(rng, 0.55),
    hasStudy: chance(rng, 0.4),
    hasServiceRoom: chance(rng, 0.45),
    amenities: pickSome(rng, AMENITIES_POOL, 3, 7),
    conservation: pickOne(rng, [
      ConservationState.NUEVA,
      ConservationState.EXCELENTE,
      ConservationState.BUENA,
      ConservationState.REGULAR,
    ]),

    addressStreet: pickOne(rng, STREET_NAMES),
    addressNumber: `${rangeInt(rng, 100, 999)}`,
    addressInterior: chance(rng, 0.2) ? `${rangeInt(rng, 1, 14)}` : null,
    neighborhood: zone.name,
    city: "Hermosillo",
    state: "Sonora",
    postalCode: `${rangeInt(rng, 83000, 83299)}`,
    latitude: zone.lat + rangeFloat(rng, -0.006, 0.006, 5),
    longitude: zone.lng + rangeFloat(rng, -0.006, 0.006, 5),
    hideExactAddress: true,

    videoUrl: chance(rng, 0.2) ? "https://youtu.be/example" : null,
    virtualTourUrl: chance(rng, 0.25) ? "https://my.matterport.com/show/?m=example" : null,
    coverImageUrl: images[0]?.url ?? null,

    ownerId: owner.id,
    captureContractId: null,

    publishedToPortals: chance(rng, 0.6)
      ? pickSome(rng, ["INMUEBLES24", "VIVANUNCIOS", "FACEBOOK", "WEBSITE"], 1, 3)
      : [],
    publishedAt,
    daysOnMarket: publishedAt
      ? Math.floor((NOW.getTime() - publishedAt.getTime()) / 86400000)
      : null,
    viewsCount: rangeInt(rng, 12, 1200),
    inquiriesCount: rangeInt(rng, 0, 35),

    assignedAgentId: agent.id,
    internalNotes: chance(rng, 0.3) ? "Propietario algo flexible en precio si hay oferta inmediata." : null,
    publicDescription: null,

    createdAt: shiftDate(NOW, -rangeInt(rng, 10, 400)),
    updatedAt: shiftDate(NOW, -rangeInt(rng, 0, 20)),
    deletedAt: null,

    images,
    documents: makePropertyDocs(id, rangeInt(rng, 2, 4)),
    owner,
    assignedAgent: agent,
  };
});

// Build a quick sparkline for PropertyCard (deterministic)
export function viewsSparkline(propertyId: string): number[] {
  const localRng = createRng(
    propertyId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  );
  return Array.from({ length: 14 }, () => rangeInt(localRng, 3, 40));
}

// ─── Leads ───────────────────────────────────────────────────────────

export const MOCK_LEADS: Lead[] = Array.from({ length: 25 }, (_, i) => {
  const first = pickOne(rng, FIRST_NAMES);
  const last = pickOne(rng, LAST_NAMES);
  const statuses: LeadStatus[] = [
    LeadStatus.NUEVO,
    LeadStatus.NUEVO,
    LeadStatus.CONTACTADO,
    LeadStatus.CONTACTADO,
    LeadStatus.CALIFICADO,
    LeadStatus.VISITA_AGENDADA,
    LeadStatus.VISITA_AGENDADA,
    LeadStatus.VISITA_REALIZADA,
    LeadStatus.VISITA_REALIZADA,
    LeadStatus.OFERTA,
    LeadStatus.NEGOCIACION,
    LeadStatus.GANADO,
    LeadStatus.PERDIDO,
  ];
  const status = statuses[i % statuses.length]!;
  const intent = pickOne(rng, [
    LeadIntent.COMPRA,
    LeadIntent.COMPRA,
    LeadIntent.RENTA,
    LeadIntent.RENTA,
    LeadIntent.INVERSION,
    LeadIntent.AMBOS,
  ]);
  const source = pickOne(rng, [
    LeadSource.INMUEBLES24,
    LeadSource.FACEBOOK,
    LeadSource.WHATSAPP,
    LeadSource.REFERIDO,
    LeadSource.INSTAGRAM,
    LeadSource.WEBSITE,
    LeadSource.LETRERO,
    LeadSource.LLAMADA_ENTRANTE,
  ]);
  const agent = MOCK_USERS[(i % 4) + 2]!;
  const budgetMin =
    intent === LeadIntent.RENTA
      ? rangeInt(rng, 12000, 25000)
      : rangeInt(rng, 1500000, 5000000);
  const budgetMax =
    intent === LeadIntent.RENTA
      ? budgetMin + rangeInt(rng, 5000, 25000)
      : budgetMin + rangeInt(rng, 1000000, 4000000);
  const createdAt = shiftDate(NOW, -rangeInt(rng, 1, 90));
  const overdue = chance(rng, 0.3);
  const nextFollowUp = shiftDate(NOW, overdue ? -rangeInt(rng, 1, 5) : rangeInt(rng, 1, 10));

  return {
    id: `lead_${(i + 1).toString().padStart(3, "0")}`,
    organizationId: MOCK_ORG.id,
    firstName: first,
    lastName: last,
    email: `${slugify(first)}.${slugify(last)}${i}@mail.com`,
    phone: `66211${(45000 + i * 97).toString().padStart(5, "0")}`,
    whatsapp: `52662114${(45000 + i * 97).toString().padStart(5, "0")}`,
    preferredContactChannel: pickOne(rng, [
      ContactChannel.WHATSAPP,
      ContactChannel.WHATSAPP,
      ContactChannel.PHONE,
      ContactChannel.EMAIL,
    ]),
    preferredContactTime: pickOne(rng, [
      ContactTime.MORNING,
      ContactTime.AFTERNOON,
      ContactTime.EVENING,
      ContactTime.ANYTIME,
    ]),
    intent,
    propertyTypeInterests: pickSome(
      rng,
      [
        PropertyCategory.CASA,
        PropertyCategory.DEPARTAMENTO,
        PropertyCategory.TERRENO,
        PropertyCategory.TOWNHOUSE,
      ],
      1,
      2
    ),
    budgetMin,
    budgetMax,
    currency: Currency.MXN,
    desiredZones: pickSome(rng, HERMOSILLO_ZONES.map((z) => z.name), 1, 3),
    minBedrooms: intent === LeadIntent.RENTA ? rangeInt(rng, 1, 3) : rangeInt(rng, 2, 4),
    minBathrooms: rangeInt(rng, 1, 3),
    minParkingSpaces: rangeInt(rng, 1, 3),
    minAreaM2: rangeInt(rng, 90, 250),
    mustHaves: pickSome(rng, ["Alberca", "Pet-friendly", "Amueblado", "Seguridad 24/7"], 0, 2),
    niceToHaves: pickSome(rng, ["Roof garden", "Gimnasio", "Jardín", "Estudio"], 0, 2),
    source,
    sourceDetail: null,
    status,
    lostReason: status === LeadStatus.PERDIDO ? "Se fue con otra agencia" : null,
    lostReasonDetail: null,
    qualificationScore: rangeInt(rng, 35, 95),
    assignedAgentId: agent.id,
    firstContactAt: shiftDate(createdAt, rangeInt(rng, 0, 2)),
    lastContactAt: shiftDate(NOW, -rangeInt(rng, 0, 10)),
    nextFollowUpAt: status === LeadStatus.GANADO || status === LeadStatus.PERDIDO ? null : nextFollowUp,
    convertedToClientId: null,
    notes: chance(rng, 0.35)
      ? "Muy interesado, pidió mandar más fotos y un tour virtual si existe."
      : null,
    createdAt,
    updatedAt: shiftDate(NOW, -rangeInt(rng, 0, 5)),
    deletedAt: null,
    assignedAgent: agent,
  };
});

// ─── Clients ─────────────────────────────────────────────────────────

export const MOCK_CLIENTS: Client[] = Array.from({ length: 14 }, (_, i) => {
  const first = pickOne(rng, FIRST_NAMES);
  const last = pickOne(rng, LAST_NAMES);
  const type = pickOne(rng, [
    ClientType.INQUILINO,
    ClientType.INQUILINO,
    ClientType.COMPRADOR,
    ClientType.PROPIETARIO_CLIENTE,
    ClientType.INVERSIONISTA,
  ]);
  return {
    id: `client_${(i + 1).toString().padStart(3, "0")}`,
    organizationId: MOCK_ORG.id,
    leadId: null,
    type,
    firstName: first,
    lastName: last,
    email: `${slugify(first)}.${slugify(last)}${i}@mail.com`,
    phone: `66217${(34000 + i * 73).toString().padStart(5, "0")}`,
    whatsapp: `526621734${(i + 100).toString().padStart(3, "0")}`,
    birthday: chance(rng, 0.5)
      ? new Date(`198${rangeInt(rng, 0, 9)}-${rangeInt(rng, 1, 12).toString().padStart(2, "0")}-${rangeInt(rng, 1, 28).toString().padStart(2, "0")}`)
      : null,
    totalOperations: rangeInt(rng, 1, 6),
    lifetimeValueMxn: rangeInt(rng, 150000, 2800000),
    notes: null,
    portalAccessEnabled: type === ClientType.INQUILINO ? chance(rng, 0.7) : chance(rng, 0.3),
    portalAccessToken: chance(rng, 0.6) ? cuid(rng, "ctk") : null,
    createdAt: shiftDate(NOW, -rangeInt(rng, 30, 500)),
    updatedAt: shiftDate(NOW, -rangeInt(rng, 0, 30)),
    deletedAt: null,
  };
});

// ─── Contracts ────────────────────────────────────────────────────────

export const MOCK_CONTRACTS: PropertyContract[] = Array.from(
  { length: 14 },
  (_, i) => {
    const property = MOCK_PROPERTIES[i]!;
    const kind = pickOne(rng, [
      ContractKind.MANDATO_EXCLUSIVA,
      ContractKind.MANDATO_EXCLUSIVA,
      ContractKind.MANDATO_NO_EXCLUSIVA,
      ContractKind.ARRENDAMIENTO,
      ContractKind.ARRENDAMIENTO,
      ContractKind.COMPRAVENTA,
    ]);
    const startDate = shiftDate(NOW, -rangeInt(rng, 10, 400));
    const duration = rangeInt(rng, 6, 24);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);
    const daysToEnd = Math.floor((endDate.getTime() - NOW.getTime()) / 86400000);
    const status: ContractStatus =
      daysToEnd < 0
        ? ContractStatus.VENCIDO
        : daysToEnd < 60
          ? ContractStatus.POR_VENCER
          : ContractStatus.ACTIVO;
    const agreedPrice =
      kind === ContractKind.ARRENDAMIENTO
        ? property.priceRent ?? 18000
        : property.priceSale ?? 4500000;

    const ownerId = property.ownerId;
    const owner = MOCK_OWNERS.find((o) => o.id === ownerId);

    return {
      id: `contract_${i + 1}`,
      organizationId: MOCK_ORG.id,
      propertyId: property.id,
      contractKind: kind,
      status,
      startDate,
      endDate,
      durationMonths: duration,
      ownerId,
      clientId: kind === ContractKind.ARRENDAMIENTO ? MOCK_CLIENTS[i % MOCK_CLIENTS.length]!.id : null,
      agentId: MOCK_USERS[2]!.id,
      commissionPct: rangeFloat(rng, 3, 8, 2),
      commissionAmount: Math.round(agreedPrice * 0.05),
      agreedPrice,
      depositAmount:
        kind === ContractKind.ARRENDAMIENTO ? agreedPrice * 2 : null,
      notes: null,
      externalDocumentUrl: chance(rng, 0.4) ? "#" : null,
      reminderDaysBeforeEnd: 30,
      createdAt: startDate,
      updatedAt: shiftDate(NOW, -rangeInt(rng, 1, 30)),
      property,
      owner: owner ?? null,
      client: null,
      agent: MOCK_USERS[2]!,
    };
  }
);

// ─── Rentals ─────────────────────────────────────────────────────────

function buildPayments(
  rentalId: string,
  startDate: Date,
  monthlyRent: number,
  months = 12
): RentalPayment[] {
  const payments: RentalPayment[] = [];
  for (let m = 0; m < months; m++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + m);
    const period = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const inPast = dueDate < NOW;
    const currentMonth =
      dueDate.getMonth() === NOW.getMonth() && dueDate.getFullYear() === NOW.getFullYear();
    let status: RentalPaymentStatus;
    let amountPaid = 0;
    let paidAt: Date | null = null;
    if (inPast && !currentMonth) {
      if (chance(rng, 0.9)) {
        status = RentalPaymentStatus.PAGADO;
        amountPaid = monthlyRent;
        paidAt = shiftDate(dueDate, rangeInt(rng, -2, 5));
      } else {
        status = RentalPaymentStatus.VENCIDO;
      }
    } else if (currentMonth) {
      if (chance(rng, 0.55)) {
        status = RentalPaymentStatus.PAGADO;
        amountPaid = monthlyRent;
        paidAt = shiftDate(dueDate, -rangeInt(rng, 0, 3));
      } else if (chance(rng, 0.4)) {
        status = RentalPaymentStatus.PENDIENTE;
      } else {
        status = RentalPaymentStatus.VENCIDO;
      }
    } else {
      status = RentalPaymentStatus.PENDIENTE;
    }
    payments.push({
      id: `${rentalId}_pay_${period}`,
      rentalId,
      periodMonth: period,
      dueDate,
      amountDue: monthlyRent,
      amountPaid,
      paidAt,
      status,
      paymentReference: paidAt ? `REF-${rangeInt(rng, 100000, 999999)}` : null,
      receivedBy: RentalPaymentChannel.VIA_AGENCIA,
      remindersSentCount: status === RentalPaymentStatus.PENDIENTE ? 0 : rangeInt(rng, 0, 3),
      notes: null,
      createdAt: dueDate,
      updatedAt: paidAt ?? dueDate,
    });
  }
  return payments;
}

export const MOCK_RENTALS: Rental[] = Array.from({ length: 10 }, (_, i) => {
  const property = MOCK_PROPERTIES[20 + i]!;
  const tenant = MOCK_CLIENTS[i % MOCK_CLIENTS.length]!;
  const owner = MOCK_OWNERS.find((o) => o.id === property.ownerId)!;
  const agent = MOCK_USERS[2]!;
  const contract = MOCK_CONTRACTS[i]!;
  const monthlyRent = property.priceRent ?? rangeInt(rng, 16000, 42000);
  const startDate = shiftDate(NOW, -rangeInt(rng, 30, 365));
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 12);
  const id = `rental_${(i + 1).toString().padStart(3, "0")}`;
  const payments = buildPayments(id, startDate, monthlyRent, 12);
  const daysToEnd = Math.floor((endDate.getTime() - NOW.getTime()) / 86400000);
  const status: RentalStatus =
    daysToEnd < 0
      ? RentalStatus.TERMINADA
      : daysToEnd < 60
        ? RentalStatus.POR_VENCER
        : RentalStatus.ACTIVA;
  return {
    id,
    organizationId: MOCK_ORG.id,
    propertyId: property.id,
    contractId: contract.id,
    tenantClientId: tenant.id,
    ownerId: owner.id,
    managingAgentId: agent.id,
    monthlyRent,
    currency: Currency.MXN,
    paymentDueDay: pickOne(rng, [1, 5, 10, 15]),
    startDate,
    endDate,
    status,
    depositHeld: monthlyRent * 2,
    inventoryList: {
      llaves: 3,
      muebles: ["Cama king", "Refrigerador Samsung", "Comedor 6 personas"],
      observaciones: "Inmueble entregado en excelentes condiciones.",
    },
    utilitiesIncluded: pickSome(rng, ["AGUA", "GAS", "INTERNET"], 0, 2),
    notes: null,
    createdAt: startDate,
    updatedAt: shiftDate(NOW, -rangeInt(rng, 0, 20)),
    property,
    tenant,
    owner,
    agent,
    payments,
  };
});

// ─── Maintenance ─────────────────────────────────────────────────────

const MAINTENANCE_TITLES: Record<MaintenanceCategory, string[]> = {
  PLOMERIA: ["Fuga debajo del lavabo", "Tubería obstruida en regadera"],
  ELECTRICO: ["Apagador principal no responde", "Parpadeo en iluminación de sala"],
  AIRE_ACONDICIONADO: ["Minisplit no enfría", "Goteo en unidad evaporadora"],
  ELECTRODOMESTICO: ["Lavadora no gira", "Refrigerador no enfría"],
  ESTRUCTURAL: ["Fisura visible en muro", "Puerta principal desnivelada"],
  JARDINERIA: ["Sistema de riego sin presión", "Pasto seco en jardín frontal"],
  LIMPIEZA: ["Limpieza profunda post-salida"],
  SEGURIDAD: ["Chapa principal atorada", "Cámara de acceso fuera de línea"],
  OTRO: ["Solicitud varios"],
};

export const MOCK_MAINTENANCE: MaintenanceRequest[] = Array.from(
  { length: 8 },
  (_, i) => {
    const rental = MOCK_RENTALS[i % MOCK_RENTALS.length]!;
    const property = rental.property!;
    const category = pickOne(rng, [
      MaintenanceCategory.PLOMERIA,
      MaintenanceCategory.ELECTRICO,
      MaintenanceCategory.AIRE_ACONDICIONADO,
      MaintenanceCategory.ELECTRODOMESTICO,
      MaintenanceCategory.ESTRUCTURAL,
      MaintenanceCategory.JARDINERIA,
    ]);
    const priority = pickOne(rng, [
      MaintenancePriority.BAJA,
      MaintenancePriority.MEDIA,
      MaintenancePriority.MEDIA,
      MaintenancePriority.ALTA,
      MaintenancePriority.URGENCIA,
    ]);
    const status = pickOne(rng, [
      MaintenanceStatus.REPORTADO,
      MaintenanceStatus.EN_REVISION,
      MaintenanceStatus.APROBADO_PROPIETARIO,
      MaintenanceStatus.EN_PROCESO,
      MaintenanceStatus.COMPLETADO,
    ]);
    const title = pickOne(rng, MAINTENANCE_TITLES[category]);
    return {
      id: `maint_${(i + 1).toString().padStart(3, "0")}`,
      organizationId: MOCK_ORG.id,
      rentalId: rental.id,
      propertyId: property.id,
      reportedByClientId: rental.tenantClientId,
      title,
      description:
        "El inquilino reporta el problema desde hace 2 días. Solicita atención pronta. Adjuntó fotos y mencionó que afecta el uso diario.",
      category,
      priority,
      status,
      images: [PROPERTY_IMAGES[i % PROPERTY_IMAGES.length]!],
      assignedToId: MOCK_USERS[2]!.id,
      estimatedCost: rangeInt(rng, 800, 12000),
      actualCost:
        status === MaintenanceStatus.COMPLETADO ? rangeInt(rng, 800, 12000) : null,
      paidByOwner: chance(rng, 0.6),
      paidByTenant: chance(rng, 0.25),
      splitDetails: null,
      resolvedAt:
        status === MaintenanceStatus.COMPLETADO
          ? shiftDate(NOW, -rangeInt(rng, 1, 20))
          : null,
      ownerNotifiedAt: shiftDate(NOW, -rangeInt(rng, 1, 10)),
      ownerApprovedAt:
        status !== MaintenanceStatus.REPORTADO && status !== MaintenanceStatus.EN_REVISION
          ? shiftDate(NOW, -rangeInt(rng, 1, 8))
          : null,
      internalNotes: null,
      resolutionNotes: null,
      createdAt: shiftDate(NOW, -rangeInt(rng, 1, 30)),
      updatedAt: shiftDate(NOW, -rangeInt(rng, 0, 5)),
      property,
      rental,
      reporter: MOCK_CLIENTS.find((c) => c.id === rental.tenantClientId),
      assignedTo: MOCK_USERS[2]!,
    };
  }
);

// ─── Viewings ────────────────────────────────────────────────────────

export const MOCK_VIEWINGS: Viewing[] = Array.from({ length: 16 }, (_, i) => {
  const property = MOCK_PROPERTIES[i % MOCK_PROPERTIES.length]!;
  const lead = MOCK_LEADS[i % MOCK_LEADS.length]!;
  const agent = MOCK_USERS[(i % 4) + 2]!;
  const offset = i - 5;
  const scheduledAt = shiftDate(NOW, offset);
  scheduledAt.setHours(9 + ((i * 2) % 8), 0, 0, 0);
  const isPast = scheduledAt < NOW;
  const status = isPast
    ? pickOne(rng, [
        ViewingStatus.REALIZADA,
        ViewingStatus.REALIZADA,
        ViewingStatus.NO_SHOW,
        ViewingStatus.CANCELADA,
      ])
    : pickOne(rng, [ViewingStatus.AGENDADA, ViewingStatus.CONFIRMADA]);
  return {
    id: `view_${i + 1}`,
    organizationId: MOCK_ORG.id,
    propertyId: property.id,
    leadId: lead.id,
    clientId: null,
    agentId: agent.id,
    scheduledAt,
    durationMinutes: 45,
    status,
    leadInterestLevel:
      status === ViewingStatus.REALIZADA
        ? pickOne(rng, [
            InterestLevel.ALTO,
            InterestLevel.MEDIO,
            InterestLevel.BAJO,
            InterestLevel.MUY_ALTO,
          ])
        : null,
    leadFeedback:
      status === ViewingStatus.REALIZADA
        ? "Mostró mucho interés en la terraza y la zona; pidió info de colegiaturas cerca."
        : null,
    agentNotes: null,
    meetingPoint: "En la propiedad",
    createdAt: shiftDate(scheduledAt, -rangeInt(rng, 1, 5)),
    updatedAt: shiftDate(NOW, -rangeInt(rng, 0, 2)),
    property,
    lead,
    agent,
  };
});

// ─── Offers ──────────────────────────────────────────────────────────

export const MOCK_OFFERS: Offer[] = Array.from({ length: 6 }, (_, i) => {
  const property = MOCK_PROPERTIES[i]!;
  const lead = MOCK_LEADS[i]!;
  const agent = MOCK_USERS[3]!;
  const base = property.priceSale ?? 3500000;
  return {
    id: `offer_${i + 1}`,
    organizationId: MOCK_ORG.id,
    propertyId: property.id,
    leadId: lead.id,
    clientId: null,
    offerKind: pickOne(rng, [
      OfferKind.CARTA_OFERTA,
      OfferKind.APARTADO,
      OfferKind.OFERTA_FIRME,
    ]),
    offeredAmount: Math.round(base * rangeFloat(rng, 0.85, 0.98, 2)),
    currency: Currency.MXN,
    offeredPaymentMethod: pickOne(rng, [
      OfferPaymentMethod.CONTADO,
      OfferPaymentMethod.CREDITO_BANCARIO,
      OfferPaymentMethod.CREDITO_INFONAVIT,
      OfferPaymentMethod.MIXTO,
    ]),
    conditions: "Sujeto a avalúo bancario y entrega libre de gravámenes.",
    apartadoAmount: 50000,
    status: pickOne(rng, [
      OfferStatus.ENVIADA,
      OfferStatus.EN_REVISION,
      OfferStatus.CONTRAOFERTA,
      OfferStatus.ACEPTADA,
      OfferStatus.RECHAZADA,
    ]),
    counterofferFromOwner: chance(rng, 0.5) ? Math.round(base * 0.93) : null,
    expiresAt: shiftDate(NOW, rangeInt(rng, 3, 14)),
    agentId: agent.id,
    createdAt: shiftDate(NOW, -rangeInt(rng, 1, 10)),
    updatedAt: shiftDate(NOW, -rangeInt(rng, 0, 2)),
    property,
    lead,
    agent,
  };
});

// ─── Interactions ────────────────────────────────────────────────────

const INTERACTION_SUMMARIES = [
  "Llamada para confirmar visita",
  "WhatsApp enviando carrusel de 3 propiedades",
  "Cliente confirmó que revisará los planos",
  "Mensaje recibido pidiendo más fotos del patio",
  "Email con ficha técnica enviado",
  "Reunión en oficina para revisar oferta",
];

export const MOCK_INTERACTIONS: Interaction[] = Array.from(
  { length: 40 },
  (_, i) => {
    const lead = MOCK_LEADS[i % MOCK_LEADS.length]!;
    const user = MOCK_USERS[(i % 4) + 2]!;
    const kind = pickOne(rng, [
      InteractionKind.WHATSAPP,
      InteractionKind.WHATSAPP,
      InteractionKind.LLAMADA,
      InteractionKind.EMAIL,
      InteractionKind.REUNION,
      InteractionKind.VISITA_PROPIEDAD,
      InteractionKind.NOTA_INTERNA,
    ]);
    return {
      id: `int_${i + 1}`,
      organizationId: MOCK_ORG.id,
      kind,
      direction: pickOne(rng, [
        InteractionDirection.ENTRANTE,
        InteractionDirection.SALIENTE,
        InteractionDirection.SALIENTE,
        InteractionDirection.INTERNA,
      ]),
      relatedLeadId: lead.id,
      relatedClientId: null,
      relatedOwnerId: null,
      relatedPropertyId: MOCK_PROPERTIES[i % MOCK_PROPERTIES.length]!.id,
      summary: pickOne(rng, INTERACTION_SUMMARIES),
      body: null,
      occurredAt: shiftDate(NOW, -rangeInt(rng, 0, 30)),
      durationSeconds: kind === InteractionKind.LLAMADA ? rangeInt(rng, 60, 900) : null,
      createdById: user.id,
      channelMessageId: null,
      attachments: [],
      createdAt: shiftDate(NOW, -rangeInt(rng, 0, 30)),
      createdBy: user,
    };
  }
);

// ─── Tasks ───────────────────────────────────────────────────────────

const TASK_TITLES = [
  "Enviar ficha técnica de 3 opciones",
  "Llamar para confirmar visita del sábado",
  "Subir fotos nuevas a Inmuebles24",
  "Pedir comprobante de ingresos",
  "Revisar carta oferta con propietario",
  "Actualizar letrero con nuevo precio",
  "Seguimiento post-visita",
  "Solicitar presupuesto a plomero",
];

export const MOCK_TASKS: Task[] = Array.from({ length: 18 }, (_, i) => {
  const assigned = MOCK_USERS[(i % 4) + 2]!;
  const creator = MOCK_USERS[0]!;
  const status = pickOne(rng, [
    TaskStatus.PENDIENTE,
    TaskStatus.PENDIENTE,
    TaskStatus.EN_PROCESO,
    TaskStatus.COMPLETADA,
  ]);
  const dueAt = shiftDate(NOW, rangeInt(rng, -3, 12));
  return {
    id: `task_${i + 1}`,
    organizationId: MOCK_ORG.id,
    title: pickOne(rng, TASK_TITLES),
    description: null,
    relatedLeadId: chance(rng, 0.6) ? MOCK_LEADS[i % MOCK_LEADS.length]!.id : null,
    relatedClientId: null,
    relatedPropertyId: chance(rng, 0.4)
      ? MOCK_PROPERTIES[i % MOCK_PROPERTIES.length]!.id
      : null,
    relatedRentalId: null,
    assignedToId: assigned.id,
    createdById: creator.id,
    dueAt,
    priority: pickOne(rng, [
      TaskPriority.BAJA,
      TaskPriority.MEDIA,
      TaskPriority.MEDIA,
      TaskPriority.ALTA,
      TaskPriority.URGENTE,
    ]),
    status,
    completedAt: status === TaskStatus.COMPLETADA ? shiftDate(NOW, -rangeInt(rng, 0, 5)) : null,
    createdAt: shiftDate(NOW, -rangeInt(rng, 0, 12)),
    updatedAt: NOW,
    assignedTo: assigned,
    relatedLead: null,
    relatedProperty: null,
  };
});

// ─── Matches ─────────────────────────────────────────────────────────

export const MOCK_MATCHES: MatchSuggestion[] = MOCK_LEADS.slice(0, 8).flatMap(
  (lead, li) => {
    return Array.from({ length: 3 }, (_, pi) => {
      const property = MOCK_PROPERTIES[(li * 3 + pi) % MOCK_PROPERTIES.length]!;
      const score = rangeFloat(rng, 62, 97, 1);
      return {
        id: `match_${lead.id}_${property.id}`,
        organizationId: MOCK_ORG.id,
        leadId: lead.id,
        propertyId: property.id,
        score,
        matchReasons: pickSome(
          rng,
          [
            "PRECIO_EN_RANGO",
            "ZONA_DESEADA",
            "RECAMARAS_SUFICIENTES",
            "PET_FRIENDLY",
            "METROS_OK",
            "AMUEBLADA",
            "ESTACIONAMIENTO_OK",
          ],
          2,
          4
        ),
        status:
          pi === 0
            ? MatchStatus.PROPUESTO
            : pi === 1
              ? MatchStatus.ENVIADO_AL_LEAD
              : MatchStatus.VISTO_POR_AGENTE,
        viewedByAgentAt: pi > 0 ? shiftDate(NOW, -1) : null,
        sentToLeadAt: pi === 1 ? shiftDate(NOW, -1) : null,
        leadRespondedAt: null,
        createdAt: shiftDate(NOW, -rangeInt(rng, 1, 7)),
        property,
        lead,
      } satisfies MatchSuggestion;
    });
  }
);

// ─── Tags ────────────────────────────────────────────────────────────

export const MOCK_TAGS: Tag[] = [
  { id: "tag_1", organizationId: MOCK_ORG.id, name: "Cliente VIP", color: "#C9A961", kind: "LEAD", createdAt: NOW },
  { id: "tag_2", organizationId: MOCK_ORG.id, name: "Infonavit", color: "#3B82F6", kind: "LEAD", createdAt: NOW },
  { id: "tag_3", organizationId: MOCK_ORG.id, name: "Listo para cerrar", color: "#4ADE80", kind: "LEAD", createdAt: NOW },
  { id: "tag_4", organizationId: MOCK_ORG.id, name: "Exclusiva", color: "#C9A961", kind: "PROPERTY", createdAt: NOW },
  { id: "tag_5", organizationId: MOCK_ORG.id, name: "Para remodelar", color: "#F59E0B", kind: "PROPERTY", createdAt: NOW },
];

// ─── Conversations (frontend-only) ───────────────────────────────────

export const MOCK_CONVERSATIONS: Conversation[] = MOCK_LEADS.slice(0, 12).map(
  (lead, i) => ({
    id: `conv_${lead.id}`,
    contactId: lead.id,
    contactType: "LEAD" as const,
    contactName: `${lead.firstName} ${lead.lastName}`,
    avatarUrl: AVATARS[i % AVATARS.length]!,
    channel: "WHATSAPP" as const,
    lastMessageAt: shiftDate(NOW, -rangeInt(rng, 0, 60) / 24),
    lastMessage: pickOne(rng, [
      "¿Podrías mandarme el link público de la casa en Las Quintas?",
      "Gracias, estaré el sábado a las 11am",
      "¿Aceptan crédito Infonavit?",
      "Necesito más fotos del patio trasero",
      "Ok, lo pensamos y te aviso mañana",
    ]),
    unreadCount: i < 4 ? rangeInt(rng, 1, 4) : 0,
  })
);

export const MOCK_MESSAGES: Record<string, Message[]> = Object.fromEntries(
  MOCK_CONVERSATIONS.map((conv) => [
    conv.id,
    Array.from({ length: 12 }, (_, i) => ({
      id: `msg_${conv.id}_${i}`,
      conversationId: conv.id,
      direction:
        i % 2 === 0 ? InteractionDirection.ENTRANTE : InteractionDirection.SALIENTE,
      body:
        i % 2 === 0
          ? pickOne(rng, [
              "Hola, vi la propiedad en Inmuebles24",
              "¿Sigue disponible?",
              "¿Cuánto pide de enganche?",
              "Me interesa agendar visita",
              "Gracias por la info",
            ])
          : pickOne(rng, [
              "¡Hola! Claro, sigue disponible. Te paso ficha.",
              "¿Qué día te queda mejor para agendar?",
              "Sí, acepta Infonavit y crédito bancario.",
              "Aquí la info: link público incluido",
              "Perfecto, queda agendado. Te confirmo una hora antes.",
            ]),
      createdAt: shiftDate(NOW, -i / 2),
      channel: "WHATSAPP" as const,
      status: i % 2 === 0 ? undefined : "READ",
    })),
  ])
);

// ─── Helpers ─────────────────────────────────────────────────────────

export function getProperty(id: string) {
  return MOCK_PROPERTIES.find((p) => p.id === id || p.slug === id || p.code === id);
}

export function getLead(id: string) {
  return MOCK_LEADS.find((l) => l.id === id);
}

export function getOwner(id: string) {
  return MOCK_OWNERS.find((o) => o.id === id);
}

export function getClient(id: string) {
  return MOCK_CLIENTS.find((c) => c.id === id);
}

export function getRental(id: string) {
  return MOCK_RENTALS.find((r) => r.id === id);
}

export function getContract(id: string) {
  return MOCK_CONTRACTS.find((c) => c.id === id);
}

export function getMaintenance(id: string) {
  return MOCK_MAINTENANCE.find((m) => m.id === id);
}

export function getUser(id: string) {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getViewingsForProperty(propertyId: string) {
  return MOCK_VIEWINGS.filter((v) => v.propertyId === propertyId);
}

export function getOffersForProperty(propertyId: string) {
  return MOCK_OFFERS.filter((o) => o.propertyId === propertyId);
}

export function getMatchesForLead(leadId: string) {
  return MOCK_MATCHES.filter((m) => m.leadId === leadId);
}

export function getInteractionsForLead(leadId: string) {
  return MOCK_INTERACTIONS.filter((i) => i.relatedLeadId === leadId);
}

export function getTasksForUser(userId: string) {
  return MOCK_TASKS.filter((t) => t.assignedToId === userId);
}

export function getPropertiesForOwner(ownerId: string) {
  return MOCK_PROPERTIES.filter((p) => p.ownerId === ownerId);
}

export function getRentalsForOwner(ownerId: string) {
  return MOCK_RENTALS.filter((r) => r.ownerId === ownerId);
}

export function getRentalsForTenant(clientId: string) {
  return MOCK_RENTALS.filter((r) => r.tenantClientId === clientId);
}

export function getMaintenanceForRental(rentalId: string) {
  return MOCK_MAINTENANCE.filter((m) => m.rentalId === rentalId);
}

export function getTenantCurrent() {
  return MOCK_CLIENTS[0]!;
}

export function getOwnerCurrent() {
  return MOCK_OWNERS[0]!;
}
