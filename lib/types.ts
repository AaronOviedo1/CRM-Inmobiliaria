/**
 * Tipos frontend que reflejan `prisma/schema.prisma`. Se usan mientras no corra
 * `prisma generate`; una vez generado `@prisma/client`, pueden re-exportarse
 * desde él en este archivo manteniendo el mismo shape.
 *
 * TODO(backend): reemplazar por `export * from "@prisma/client"` en fase 3.
 */

// ─── Enums ────────────────────────────────────────────────────────────

export const SubscriptionPlan = {
  TRIAL: "TRIAL",
  STARTER: "STARTER",
  PROFESSIONAL: "PROFESSIONAL",
  ENTERPRISE: "ENTERPRISE",
} as const;
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
  TRIAL: "TRIAL",
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  AGENCY_ADMIN: "AGENCY_ADMIN",
  BROKER: "BROKER",
  AGENT: "AGENT",
  ASSISTANT: "ASSISTANT",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ContactChannel = {
  WHATSAPP: "WHATSAPP",
  PHONE: "PHONE",
  EMAIL: "EMAIL",
} as const;
export type ContactChannel = (typeof ContactChannel)[keyof typeof ContactChannel];

export const ContactTime = {
  MORNING: "MORNING",
  AFTERNOON: "AFTERNOON",
  EVENING: "EVENING",
  ANYTIME: "ANYTIME",
} as const;
export type ContactTime = (typeof ContactTime)[keyof typeof ContactTime];

export const Currency = { MXN: "MXN", USD: "USD" } as const;
export type Currency = (typeof Currency)[keyof typeof Currency];

export const LeadIntent = {
  COMPRA: "COMPRA",
  RENTA: "RENTA",
  INVERSION: "INVERSION",
  AMBOS: "AMBOS",
} as const;
export type LeadIntent = (typeof LeadIntent)[keyof typeof LeadIntent];

export const LeadSource = {
  WEBSITE: "WEBSITE",
  INMUEBLES24: "INMUEBLES24",
  VIVANUNCIOS: "VIVANUNCIOS",
  LAMUDI: "LAMUDI",
  FACEBOOK: "FACEBOOK",
  INSTAGRAM: "INSTAGRAM",
  TIKTOK: "TIKTOK",
  WHATSAPP: "WHATSAPP",
  REFERIDO: "REFERIDO",
  LETRERO: "LETRERO",
  CAMINANDO: "CAMINANDO",
  LLAMADA_ENTRANTE: "LLAMADA_ENTRANTE",
  OTRO: "OTRO",
} as const;
export type LeadSource = (typeof LeadSource)[keyof typeof LeadSource];

export const LeadStatus = {
  NUEVO: "NUEVO",
  CONTACTADO: "CONTACTADO",
  CALIFICADO: "CALIFICADO",
  VISITA_AGENDADA: "VISITA_AGENDADA",
  VISITA_REALIZADA: "VISITA_REALIZADA",
  OFERTA: "OFERTA",
  NEGOCIACION: "NEGOCIACION",
  GANADO: "GANADO",
  PERDIDO: "PERDIDO",
  EN_PAUSA: "EN_PAUSA",
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

/** Orden canónico para el Kanban (excluye EN_PAUSA porque se vuelve filtro lateral). */
export const LEAD_KANBAN_ORDER: LeadStatus[] = [
  "NUEVO",
  "CONTACTADO",
  "CALIFICADO",
  "VISITA_AGENDADA",
  "VISITA_REALIZADA",
  "OFERTA",
  "NEGOCIACION",
  "GANADO",
  "PERDIDO",
];

export const ClientType = {
  COMPRADOR: "COMPRADOR",
  INQUILINO: "INQUILINO",
  INVERSIONISTA: "INVERSIONISTA",
  PROPIETARIO_CLIENTE: "PROPIETARIO_CLIENTE",
} as const;
export type ClientType = (typeof ClientType)[keyof typeof ClientType];

export const PropertyCategory = {
  CASA: "CASA",
  DEPARTAMENTO: "DEPARTAMENTO",
  TOWNHOUSE: "TOWNHOUSE",
  TERRENO: "TERRENO",
  LOCAL_COMERCIAL: "LOCAL_COMERCIAL",
  OFICINA: "OFICINA",
  BODEGA: "BODEGA",
  NAVE_INDUSTRIAL: "NAVE_INDUSTRIAL",
  EDIFICIO: "EDIFICIO",
  RANCHO: "RANCHO",
  OTRO: "OTRO",
} as const;
export type PropertyCategory = (typeof PropertyCategory)[keyof typeof PropertyCategory];

export const TransactionType = {
  VENTA: "VENTA",
  RENTA: "RENTA",
  VENTA_Y_RENTA: "VENTA_Y_RENTA",
  TRASPASO: "TRASPASO",
  PREVENTA: "PREVENTA",
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const PropertyStatus = {
  BORRADOR: "BORRADOR",
  DISPONIBLE: "DISPONIBLE",
  APARTADA: "APARTADA",
  EN_NEGOCIACION: "EN_NEGOCIACION",
  VENDIDA: "VENDIDA",
  RENTADA: "RENTADA",
  PAUSADA: "PAUSADA",
  NO_DISPONIBLE: "NO_DISPONIBLE",
  ARCHIVADA: "ARCHIVADA",
} as const;
export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus];

export const ConservationState = {
  NUEVA: "NUEVA",
  EXCELENTE: "EXCELENTE",
  BUENA: "BUENA",
  REGULAR: "REGULAR",
  REMODELAR: "REMODELAR",
} as const;
export type ConservationState = (typeof ConservationState)[keyof typeof ConservationState];

export const PropertyDocumentType = {
  ESCRITURA: "ESCRITURA",
  PLANO: "PLANO",
  PREDIAL: "PREDIAL",
  AGUA: "AGUA",
  OTRO: "OTRO",
} as const;
export type PropertyDocumentType = (typeof PropertyDocumentType)[keyof typeof PropertyDocumentType];

export const ContractKind = {
  MANDATO_EXCLUSIVA: "MANDATO_EXCLUSIVA",
  MANDATO_NO_EXCLUSIVA: "MANDATO_NO_EXCLUSIVA",
  MANDATO_COMPARTIDA: "MANDATO_COMPARTIDA",
  ARRENDAMIENTO: "ARRENDAMIENTO",
  COMPRAVENTA: "COMPRAVENTA",
  APARTADO: "APARTADO",
  CARTA_OFERTA: "CARTA_OFERTA",
} as const;
export type ContractKind = (typeof ContractKind)[keyof typeof ContractKind];

export const ContractStatus = {
  BORRADOR: "BORRADOR",
  PENDIENTE_FIRMA: "PENDIENTE_FIRMA",
  ACTIVO: "ACTIVO",
  POR_VENCER: "POR_VENCER",
  VENCIDO: "VENCIDO",
  RENOVADO: "RENOVADO",
  TERMINADO: "TERMINADO",
  CANCELADO: "CANCELADO",
} as const;
export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus];

export const RentalStatus = {
  ACTIVA: "ACTIVA",
  POR_VENCER: "POR_VENCER",
  EN_RENOVACION: "EN_RENOVACION",
  TERMINADA: "TERMINADA",
  DESALOJO: "DESALOJO",
  SUSPENDIDA: "SUSPENDIDA",
} as const;
export type RentalStatus = (typeof RentalStatus)[keyof typeof RentalStatus];

export const RentalPaymentStatus = {
  PENDIENTE: "PENDIENTE",
  PAGADO: "PAGADO",
  VENCIDO: "VENCIDO",
  PARCIAL: "PARCIAL",
  CONDONADO: "CONDONADO",
} as const;
export type RentalPaymentStatus = (typeof RentalPaymentStatus)[keyof typeof RentalPaymentStatus];

export const RentalPaymentChannel = {
  DIRECTO_AL_PROPIETARIO: "DIRECTO_AL_PROPIETARIO",
  VIA_AGENCIA: "VIA_AGENCIA",
} as const;
export type RentalPaymentChannel = (typeof RentalPaymentChannel)[keyof typeof RentalPaymentChannel];

export const MaintenanceCategory = {
  PLOMERIA: "PLOMERIA",
  ELECTRICO: "ELECTRICO",
  AIRE_ACONDICIONADO: "AIRE_ACONDICIONADO",
  ELECTRODOMESTICO: "ELECTRODOMESTICO",
  ESTRUCTURAL: "ESTRUCTURAL",
  JARDINERIA: "JARDINERIA",
  LIMPIEZA: "LIMPIEZA",
  SEGURIDAD: "SEGURIDAD",
  OTRO: "OTRO",
} as const;
export type MaintenanceCategory = (typeof MaintenanceCategory)[keyof typeof MaintenanceCategory];

export const MaintenancePriority = {
  BAJA: "BAJA",
  MEDIA: "MEDIA",
  ALTA: "ALTA",
  URGENCIA: "URGENCIA",
} as const;
export type MaintenancePriority = (typeof MaintenancePriority)[keyof typeof MaintenancePriority];

export const MaintenanceStatus = {
  REPORTADO: "REPORTADO",
  EN_REVISION: "EN_REVISION",
  APROBADO_PROPIETARIO: "APROBADO_PROPIETARIO",
  EN_PROCESO: "EN_PROCESO",
  COMPLETADO: "COMPLETADO",
  RECHAZADO: "RECHAZADO",
  CERRADO: "CERRADO",
} as const;
export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

export const ViewingStatus = {
  AGENDADA: "AGENDADA",
  CONFIRMADA: "CONFIRMADA",
  REALIZADA: "REALIZADA",
  CANCELADA: "CANCELADA",
  NO_SHOW: "NO_SHOW",
  REAGENDADA: "REAGENDADA",
} as const;
export type ViewingStatus = (typeof ViewingStatus)[keyof typeof ViewingStatus];

export const InterestLevel = {
  MUY_ALTO: "MUY_ALTO",
  ALTO: "ALTO",
  MEDIO: "MEDIO",
  BAJO: "BAJO",
  NULO: "NULO",
} as const;
export type InterestLevel = (typeof InterestLevel)[keyof typeof InterestLevel];

export const OfferKind = {
  CARTA_OFERTA: "CARTA_OFERTA",
  APARTADO: "APARTADO",
  OFERTA_FIRME: "OFERTA_FIRME",
} as const;
export type OfferKind = (typeof OfferKind)[keyof typeof OfferKind];

export const OfferPaymentMethod = {
  CONTADO: "CONTADO",
  CREDITO_BANCARIO: "CREDITO_BANCARIO",
  CREDITO_INFONAVIT: "CREDITO_INFONAVIT",
  CREDITO_FOVISSSTE: "CREDITO_FOVISSSTE",
  MIXTO: "MIXTO",
} as const;
export type OfferPaymentMethod = (typeof OfferPaymentMethod)[keyof typeof OfferPaymentMethod];

export const OfferStatus = {
  ENVIADA: "ENVIADA",
  EN_REVISION: "EN_REVISION",
  ACEPTADA: "ACEPTADA",
  CONTRAOFERTA: "CONTRAOFERTA",
  RECHAZADA: "RECHAZADA",
  EXPIRADA: "EXPIRADA",
  CANCELADA: "CANCELADA",
} as const;
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

export const InteractionKind = {
  WHATSAPP: "WHATSAPP",
  LLAMADA: "LLAMADA",
  EMAIL: "EMAIL",
  REUNION: "REUNION",
  VISITA_OFICINA: "VISITA_OFICINA",
  VISITA_PROPIEDAD: "VISITA_PROPIEDAD",
  MENSAJE_PORTAL: "MENSAJE_PORTAL",
  NOTA_INTERNA: "NOTA_INTERNA",
  TAREA_COMPLETADA: "TAREA_COMPLETADA",
  EVENTO_SISTEMA: "EVENTO_SISTEMA",
} as const;
export type InteractionKind = (typeof InteractionKind)[keyof typeof InteractionKind];

export const InteractionDirection = {
  ENTRANTE: "ENTRANTE",
  SALIENTE: "SALIENTE",
  INTERNA: "INTERNA",
  AUTOMATICA: "AUTOMATICA",
} as const;
export type InteractionDirection = (typeof InteractionDirection)[keyof typeof InteractionDirection];

export const TaskPriority = {
  BAJA: "BAJA",
  MEDIA: "MEDIA",
  ALTA: "ALTA",
  URGENTE: "URGENTE",
} as const;
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TaskStatus = {
  PENDIENTE: "PENDIENTE",
  EN_PROCESO: "EN_PROCESO",
  COMPLETADA: "COMPLETADA",
  CANCELADA: "CANCELADA",
  SNOOZED: "SNOOZED",
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const MatchStatus = {
  PROPUESTO: "PROPUESTO",
  VISTO_POR_AGENTE: "VISTO_POR_AGENTE",
  ENVIADO_AL_LEAD: "ENVIADO_AL_LEAD",
  LEAD_INTERESADO: "LEAD_INTERESADO",
  LEAD_DESCARTO: "LEAD_DESCARTO",
  CONVERTIDO_EN_VISITA: "CONVERTIDO_EN_VISITA",
} as const;
export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const TagKind = {
  LEAD: "LEAD",
  CLIENT: "CLIENT",
  OWNER: "OWNER",
  PROPERTY: "PROPERTY",
} as const;
export type TagKind = (typeof TagKind)[keyof typeof TagKind];

export const NotificationChannel = {
  IN_APP: "IN_APP",
  EMAIL: "EMAIL",
  WHATSAPP: "WHATSAPP",
  PUSH: "PUSH",
} as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationEvent = {
  NEW_LEAD: "NEW_LEAD",
  LEAD_REPLY: "LEAD_REPLY",
  VIEWING_REMINDER: "VIEWING_REMINDER",
  CONTRACT_EXPIRING: "CONTRACT_EXPIRING",
  PAYMENT_DUE: "PAYMENT_DUE",
  MAINTENANCE_REQUEST: "MAINTENANCE_REQUEST",
  DAILY_DIGEST: "DAILY_DIGEST",
} as const;
export type NotificationEvent = (typeof NotificationEvent)[keyof typeof NotificationEvent];

// ─── Models ──────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
  commissionDefaultPct: number;
  specialties: PropertyCategory[];
  workingZones: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Owner {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  rfc?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  preferredContactChannel: ContactChannel;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  bankName?: string | null;
  accountLast4?: string | null;
  notes?: string | null;
  portalAccessEnabled: boolean;
  portalAccessToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Lead {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  preferredContactChannel: ContactChannel;
  preferredContactTime: ContactTime;
  intent: LeadIntent;
  propertyTypeInterests: PropertyCategory[];
  budgetMin?: number | null;
  budgetMax?: number | null;
  currency: Currency;
  desiredZones: string[];
  minBedrooms?: number | null;
  minBathrooms?: number | null;
  minParkingSpaces?: number | null;
  minAreaM2?: number | null;
  mustHaves: string[];
  niceToHaves: string[];
  source: LeadSource;
  sourceDetail?: string | null;
  status: LeadStatus;
  lostReason?: string | null;
  lostReasonDetail?: string | null;
  qualificationScore?: number | null;
  assignedAgentId?: string | null;
  firstContactAt?: Date | null;
  lastContactAt?: Date | null;
  nextFollowUpAt?: Date | null;
  convertedToClientId?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  // Derived
  assignedAgent?: User | null;
}

export interface Client {
  id: string;
  organizationId: string;
  leadId?: string | null;
  type: ClientType;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  birthday?: Date | null;
  totalOperations: number;
  lifetimeValueMxn: number;
  notes?: string | null;
  portalAccessEnabled: boolean;
  portalAccessToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  order: number;
  isCover: boolean;
  isPublic: boolean;
  createdAt: Date;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  label: string;
  url: string;
  type: PropertyDocumentType;
  isPublicToOwnerPortal: boolean;
  uploadedAt: Date;
}

export interface Property {
  id: string;
  organizationId: string;
  code: string;
  title: string;
  slug: string;
  description: string;
  transactionType: TransactionType;
  category: PropertyCategory;
  subcategory?: string | null;
  status: PropertyStatus;

  priceSale?: number | null;
  priceRent?: number | null;
  maintenanceFee?: number | null;
  currency: Currency;

  areaTotalM2?: number | null;
  areaBuiltM2?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  halfBathrooms?: number | null;
  parkingSpaces?: number | null;
  floors?: number | null;
  yearBuilt?: number | null;

  isFurnished: boolean;
  acceptsPets: boolean;
  hasPool: boolean;
  hasGarden: boolean;
  hasStudy: boolean;
  hasServiceRoom: boolean;
  amenities: string[];
  conservation?: ConservationState | null;

  addressStreet?: string | null;
  addressNumber?: string | null;
  addressInterior?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hideExactAddress: boolean;

  videoUrl?: string | null;
  virtualTourUrl?: string | null;
  coverImageUrl?: string | null;

  ownerId: string;
  captureContractId?: string | null;

  publishedToPortals: string[];
  publishedAt?: Date | null;
  daysOnMarket?: number | null;
  viewsCount: number;
  inquiriesCount: number;

  assignedAgentId?: string | null;
  internalNotes?: string | null;
  publicDescription?: string | null;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  // Derived
  images: PropertyImage[];
  documents?: PropertyDocument[];
  owner?: Owner | null;
  assignedAgent?: User | null;
}

export interface PropertyContract {
  id: string;
  organizationId: string;
  propertyId: string;
  contractKind: ContractKind;
  status: ContractStatus;
  startDate: Date;
  endDate?: Date | null;
  durationMonths?: number | null;
  ownerId?: string | null;
  clientId?: string | null;
  agentId?: string | null;
  commissionPct?: number | null;
  commissionAmount?: number | null;
  agreedPrice: number;
  depositAmount?: number | null;
  notes?: string | null;
  externalDocumentUrl?: string | null;
  reminderDaysBeforeEnd: number;
  createdAt: Date;
  updatedAt: Date;
  // Derived
  property?: Property;
  owner?: Owner | null;
  client?: Client | null;
  agent?: User | null;
}

export interface Rental {
  id: string;
  organizationId: string;
  propertyId: string;
  contractId: string;
  tenantClientId: string;
  ownerId: string;
  managingAgentId?: string | null;
  monthlyRent: number;
  currency: Currency;
  paymentDueDay: number;
  startDate: Date;
  endDate: Date;
  status: RentalStatus;
  depositHeld?: number | null;
  inventoryList?: Record<string, unknown> | null;
  utilitiesIncluded: string[];
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Derived
  property?: Property;
  tenant?: Client;
  owner?: Owner;
  agent?: User | null;
  payments?: RentalPayment[];
}

export interface RentalPayment {
  id: string;
  rentalId: string;
  periodMonth: string; // "YYYY-MM"
  dueDate: Date;
  amountDue: number;
  amountPaid: number;
  paidAt?: Date | null;
  status: RentalPaymentStatus;
  paymentReference?: string | null;
  receivedBy: RentalPaymentChannel;
  remindersSentCount: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRequest {
  id: string;
  organizationId: string;
  rentalId: string;
  propertyId: string;
  reportedByClientId: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  images: string[];
  assignedToId?: string | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  paidByOwner: boolean;
  paidByTenant: boolean;
  splitDetails?: string | null;
  resolvedAt?: Date | null;
  ownerNotifiedAt?: Date | null;
  ownerApprovedAt?: Date | null;
  internalNotes?: string | null;
  resolutionNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Derived
  property?: Property;
  reporter?: Client;
  rental?: Rental;
  assignedTo?: User | null;
}

export interface Viewing {
  id: string;
  organizationId: string;
  propertyId: string;
  leadId?: string | null;
  clientId?: string | null;
  agentId: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: ViewingStatus;
  leadInterestLevel?: InterestLevel | null;
  leadFeedback?: string | null;
  agentNotes?: string | null;
  meetingPoint?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Derived
  property?: Property;
  lead?: Lead | null;
  client?: Client | null;
  agent?: User;
}

export interface Offer {
  id: string;
  organizationId: string;
  propertyId: string;
  leadId?: string | null;
  clientId?: string | null;
  offerKind: OfferKind;
  offeredAmount: number;
  currency: Currency;
  offeredPaymentMethod: OfferPaymentMethod;
  conditions?: string | null;
  apartadoAmount?: number | null;
  status: OfferStatus;
  counterofferFromOwner?: number | null;
  expiresAt?: Date | null;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
  // Derived
  property?: Property;
  lead?: Lead | null;
  client?: Client | null;
  agent?: User;
}

export interface Interaction {
  id: string;
  organizationId: string;
  kind: InteractionKind;
  direction: InteractionDirection;
  relatedLeadId?: string | null;
  relatedClientId?: string | null;
  relatedOwnerId?: string | null;
  relatedPropertyId?: string | null;
  summary: string;
  body?: string | null;
  occurredAt: Date;
  durationSeconds?: number | null;
  createdById?: string | null;
  channelMessageId?: string | null;
  attachments: string[];
  createdAt: Date;
  createdBy?: User | null;
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  relatedLeadId?: string | null;
  relatedClientId?: string | null;
  relatedPropertyId?: string | null;
  relatedRentalId?: string | null;
  assignedToId: string;
  createdById: string;
  dueAt?: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: User;
  relatedLead?: Lead | null;
  relatedProperty?: Property | null;
}

export interface MatchSuggestion {
  id: string;
  organizationId: string;
  leadId: string;
  propertyId: string;
  score: number;
  matchReasons: string[];
  status: MatchStatus;
  viewedByAgentAt?: Date | null;
  sentToLeadAt?: Date | null;
  leadRespondedAt?: Date | null;
  createdAt: Date;
  property?: Property;
  lead?: Lead;
}

export interface Tag {
  id: string;
  organizationId: string;
  name: string;
  color: string;
  kind: TagKind;
  createdAt: Date;
}

// Convenience derived shapes (frontend-only).

export interface Conversation {
  id: string;
  contactId: string;
  contactType: "LEAD" | "CLIENT" | "OWNER";
  contactName: string;
  avatarUrl?: string | null;
  channel: "WHATSAPP" | "EMAIL" | "SMS";
  lastMessageAt: Date;
  lastMessage: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: InteractionDirection;
  body: string;
  createdAt: Date;
  channel: "WHATSAPP" | "EMAIL" | "SMS";
  status?: "SENT" | "DELIVERED" | "READ";
}
