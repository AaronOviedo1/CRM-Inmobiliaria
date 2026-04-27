/// Espejo en TypeScript de los enums definidos en prisma/schema.prisma.
/// Mantener en sincronía 1:1. El frontend consume estos `as const` arrays para populars selects y filtros;
/// los labels visuales viven en `messages/*.json`, NO aquí.

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
  ADMINISTRADOR: "ADMINISTRADOR",
  ASESOR: "ASESOR",
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
export type RentalPaymentChannel =
  (typeof RentalPaymentChannel)[keyof typeof RentalPaymentChannel];

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
export type MaintenanceCategory =
  (typeof MaintenanceCategory)[keyof typeof MaintenanceCategory];

export const MaintenancePriority = {
  BAJA: "BAJA",
  MEDIA: "MEDIA",
  ALTA: "ALTA",
  URGENCIA: "URGENCIA",
} as const;
export type MaintenancePriority =
  (typeof MaintenancePriority)[keyof typeof MaintenancePriority];

export const MaintenanceStatus = {
  REPORTADO: "REPORTADO",
  EN_REVISION: "EN_REVISION",
  APROBADO_PROPIETARIO: "APROBADO_PROPIETARIO",
  EN_PROCESO: "EN_PROCESO",
  COMPLETADO: "COMPLETADO",
  RECHAZADO: "RECHAZADO",
  CERRADO: "CERRADO",
} as const;
export type MaintenanceStatus =
  (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

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
export type OfferPaymentMethod =
  (typeof OfferPaymentMethod)[keyof typeof OfferPaymentMethod];

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
export type InteractionDirection =
  (typeof InteractionDirection)[keyof typeof InteractionDirection];

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
export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationEvent = {
  NEW_LEAD: "NEW_LEAD",
  LEAD_REPLY: "LEAD_REPLY",
  VIEWING_REMINDER: "VIEWING_REMINDER",
  CONTRACT_EXPIRING: "CONTRACT_EXPIRING",
  PAYMENT_DUE: "PAYMENT_DUE",
  MAINTENANCE_REQUEST: "MAINTENANCE_REQUEST",
  DAILY_DIGEST: "DAILY_DIGEST",
} as const;
export type NotificationEvent =
  (typeof NotificationEvent)[keyof typeof NotificationEvent];

export const AuditAction = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  STATUS_CHANGE: "STATUS_CHANGE",
  ASSIGN: "ASSIGN",
  EXPORT: "EXPORT",
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
