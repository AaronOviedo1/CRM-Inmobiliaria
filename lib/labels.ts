import type {
  LeadStatus,
  LeadIntent,
  LeadSource,
  PropertyCategory,
  PropertyStatus,
  TransactionType,
  ContractKind,
  ContractStatus,
  RentalStatus,
  RentalPaymentStatus,
  RentalPaymentChannel,
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceCategory,
  ViewingStatus,
  InterestLevel,
  OfferKind,
  OfferPaymentMethod,
  OfferStatus,
  InteractionKind,
  InteractionDirection,
  TaskStatus,
  TaskPriority,
  MatchStatus,
  ClientType,
  UserRole,
  Currency,
  ContactChannel,
  ContactTime,
  ConservationState,
  PropertyDocumentType,
  TagKind,
  NotificationChannel,
  NotificationEvent,
  SubscriptionPlan,
  SubscriptionStatus,
} from "./types";

export type ColorTone =
  | "neutral"
  | "gold"
  | "success"
  | "warning"
  | "danger"
  | "info";

/** Mapa tono → clases Tailwind para pill/badge. */
export const TONE_CLASSES: Record<ColorTone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  gold: "bg-gold-faint text-gold border-gold/30",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  info: "bg-info/10 text-info border-info/30",
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  CALIFICADO: "Calificado",
  VISITA_AGENDADA: "Visita agendada",
  VISITA_REALIZADA: "Visita realizada",
  OFERTA: "Oferta",
  NEGOCIACION: "Negociación",
  GANADO: "Ganado",
  PERDIDO: "Perdido",
  EN_PAUSA: "En pausa",
};

export const LEAD_STATUS_TONE: Record<LeadStatus, ColorTone> = {
  NUEVO: "info",
  CONTACTADO: "info",
  CALIFICADO: "gold",
  VISITA_AGENDADA: "gold",
  VISITA_REALIZADA: "gold",
  OFERTA: "warning",
  NEGOCIACION: "warning",
  GANADO: "success",
  PERDIDO: "danger",
  EN_PAUSA: "neutral",
};

export const LEAD_INTENT_LABEL: Record<LeadIntent, string> = {
  COMPRA: "Comprar",
  RENTA: "Rentar",
  INVERSION: "Inversión",
  AMBOS: "Compra o renta",
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  WEBSITE: "Sitio web",
  INMUEBLES24: "Inmuebles24",
  VIVANUNCIOS: "Vivanuncios",
  LAMUDI: "Lamudi",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  WHATSAPP: "WhatsApp",
  REFERIDO: "Referido",
  LETRERO: "Letrero",
  CAMINANDO: "Caminando",
  LLAMADA_ENTRANTE: "Llamada entrante",
  OTRO: "Otro",
};

export const PROPERTY_CATEGORY_LABEL: Record<PropertyCategory, string> = {
  CASA: "Casa",
  DEPARTAMENTO: "Departamento",
  TOWNHOUSE: "Townhouse",
  TERRENO: "Terreno",
  LOCAL_COMERCIAL: "Local comercial",
  OFICINA: "Oficina",
  BODEGA: "Bodega",
  NAVE_INDUSTRIAL: "Nave industrial",
  EDIFICIO: "Edificio",
  RANCHO: "Rancho",
  OTRO: "Otro",
};

export const PROPERTY_STATUS_LABEL: Record<PropertyStatus, string> = {
  BORRADOR: "Borrador",
  DISPONIBLE: "Disponible",
  APARTADA: "Apartada",
  EN_NEGOCIACION: "En negociación",
  VENDIDA: "Vendida",
  RENTADA: "Rentada",
  PAUSADA: "Pausada",
  NO_DISPONIBLE: "No disponible",
  ARCHIVADA: "Archivada",
};

export const PROPERTY_STATUS_TONE: Record<PropertyStatus, ColorTone> = {
  BORRADOR: "neutral",
  DISPONIBLE: "success",
  APARTADA: "warning",
  EN_NEGOCIACION: "warning",
  VENDIDA: "gold",
  RENTADA: "gold",
  PAUSADA: "neutral",
  NO_DISPONIBLE: "neutral",
  ARCHIVADA: "neutral",
};

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  VENTA: "Venta",
  RENTA: "Renta",
  VENTA_Y_RENTA: "Venta y renta",
  TRASPASO: "Traspaso",
  PREVENTA: "Preventa",
};

export const CONSERVATION_LABEL: Record<ConservationState, string> = {
  NUEVA: "Nueva",
  EXCELENTE: "Excelente",
  BUENA: "Buena",
  REGULAR: "Regular",
  REMODELAR: "Para remodelar",
};

export const PROPERTY_DOCUMENT_TYPE_LABEL: Record<PropertyDocumentType, string> =
  {
    ESCRITURA: "Escritura",
    PLANO: "Plano",
    PREDIAL: "Predial",
    AGUA: "Recibo de agua",
    OTRO: "Otro",
  };

export const CONTRACT_KIND_LABEL: Record<ContractKind, string> = {
  MANDATO_EXCLUSIVA: "Mandato exclusiva",
  MANDATO_NO_EXCLUSIVA: "Mandato no exclusiva",
  MANDATO_COMPARTIDA: "Mandato compartida",
  ARRENDAMIENTO: "Arrendamiento",
  COMPRAVENTA: "Compraventa",
  APARTADO: "Apartado",
  CARTA_OFERTA: "Carta oferta",
};

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  BORRADOR: "Borrador",
  PENDIENTE_FIRMA: "Pendiente firma",
  ACTIVO: "Activo",
  POR_VENCER: "Por vencer",
  VENCIDO: "Vencido",
  RENOVADO: "Renovado",
  TERMINADO: "Terminado",
  CANCELADO: "Cancelado",
};

export const CONTRACT_STATUS_TONE: Record<ContractStatus, ColorTone> = {
  BORRADOR: "neutral",
  PENDIENTE_FIRMA: "warning",
  ACTIVO: "success",
  POR_VENCER: "warning",
  VENCIDO: "danger",
  RENOVADO: "gold",
  TERMINADO: "neutral",
  CANCELADO: "neutral",
};

export const RENTAL_STATUS_LABEL: Record<RentalStatus, string> = {
  ACTIVA: "Activa",
  POR_VENCER: "Por vencer",
  EN_RENOVACION: "En renovación",
  TERMINADA: "Terminada",
  DESALOJO: "Desalojo",
  SUSPENDIDA: "Suspendida",
};

export const RENTAL_STATUS_TONE: Record<RentalStatus, ColorTone> = {
  ACTIVA: "success",
  POR_VENCER: "warning",
  EN_RENOVACION: "gold",
  TERMINADA: "neutral",
  DESALOJO: "danger",
  SUSPENDIDA: "danger",
};

export const RENTAL_PAYMENT_STATUS_LABEL: Record<RentalPaymentStatus, string> =
  {
    PENDIENTE: "Pendiente",
    PAGADO: "Pagado",
    VENCIDO: "Vencido",
    PARCIAL: "Parcial",
    CONDONADO: "Condonado",
  };

export const RENTAL_PAYMENT_STATUS_TONE: Record<RentalPaymentStatus, ColorTone> =
  {
    PENDIENTE: "warning",
    PAGADO: "success",
    VENCIDO: "danger",
    PARCIAL: "info",
    CONDONADO: "neutral",
  };

export const RENTAL_PAYMENT_CHANNEL_LABEL: Record<RentalPaymentChannel, string> =
  {
    DIRECTO_AL_PROPIETARIO: "Directo al propietario",
    VIA_AGENCIA: "Vía agencia",
  };

export const MAINTENANCE_STATUS_LABEL: Record<MaintenanceStatus, string> = {
  REPORTADO: "Reportado",
  EN_REVISION: "En revisión",
  APROBADO_PROPIETARIO: "Aprobado por propietario",
  EN_PROCESO: "En proceso",
  COMPLETADO: "Completado",
  RECHAZADO: "Rechazado",
  CERRADO: "Cerrado",
};

export const MAINTENANCE_STATUS_TONE: Record<MaintenanceStatus, ColorTone> = {
  REPORTADO: "danger",
  EN_REVISION: "warning",
  APROBADO_PROPIETARIO: "info",
  EN_PROCESO: "info",
  COMPLETADO: "success",
  RECHAZADO: "neutral",
  CERRADO: "neutral",
};

export const MAINTENANCE_PRIORITY_LABEL: Record<MaintenancePriority, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENCIA: "Urgencia",
};

export const MAINTENANCE_PRIORITY_TONE: Record<MaintenancePriority, ColorTone> =
  {
    BAJA: "neutral",
    MEDIA: "info",
    ALTA: "warning",
    URGENCIA: "danger",
  };

export const MAINTENANCE_CATEGORY_LABEL: Record<MaintenanceCategory, string> = {
  PLOMERIA: "Plomería",
  ELECTRICO: "Eléctrico",
  AIRE_ACONDICIONADO: "Aire acondicionado",
  ELECTRODOMESTICO: "Electrodomésticos",
  ESTRUCTURAL: "Estructural",
  JARDINERIA: "Jardinería",
  LIMPIEZA: "Limpieza",
  SEGURIDAD: "Seguridad",
  OTRO: "Otro",
};

export const VIEWING_STATUS_LABEL: Record<ViewingStatus, string> = {
  AGENDADA: "Agendada",
  CONFIRMADA: "Confirmada",
  REALIZADA: "Realizada",
  CANCELADA: "Cancelada",
  NO_SHOW: "No asistió",
  REAGENDADA: "Reagendada",
};

export const VIEWING_STATUS_TONE: Record<ViewingStatus, ColorTone> = {
  AGENDADA: "info",
  CONFIRMADA: "gold",
  REALIZADA: "success",
  CANCELADA: "neutral",
  NO_SHOW: "danger",
  REAGENDADA: "warning",
};

export const INTEREST_LEVEL_LABEL: Record<InterestLevel, string> = {
  MUY_ALTO: "Muy alto",
  ALTO: "Alto",
  MEDIO: "Medio",
  BAJO: "Bajo",
  NULO: "Nulo",
};

export const OFFER_KIND_LABEL: Record<OfferKind, string> = {
  CARTA_OFERTA: "Carta oferta",
  APARTADO: "Apartado",
  OFERTA_FIRME: "Oferta firme",
};

export const OFFER_PAYMENT_METHOD_LABEL: Record<OfferPaymentMethod, string> = {
  CONTADO: "Contado",
  CREDITO_BANCARIO: "Crédito bancario",
  CREDITO_INFONAVIT: "Crédito Infonavit",
  CREDITO_FOVISSSTE: "Crédito Fovissste",
  MIXTO: "Mixto",
};

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  ENVIADA: "Enviada",
  EN_REVISION: "En revisión",
  ACEPTADA: "Aceptada",
  CONTRAOFERTA: "Contraoferta",
  RECHAZADA: "Rechazada",
  EXPIRADA: "Expirada",
  CANCELADA: "Cancelada",
};

export const OFFER_STATUS_TONE: Record<OfferStatus, ColorTone> = {
  ENVIADA: "info",
  EN_REVISION: "warning",
  ACEPTADA: "success",
  CONTRAOFERTA: "warning",
  RECHAZADA: "danger",
  EXPIRADA: "neutral",
  CANCELADA: "neutral",
};

export const INTERACTION_KIND_LABEL: Record<InteractionKind, string> = {
  WHATSAPP: "WhatsApp",
  LLAMADA: "Llamada",
  EMAIL: "Email",
  REUNION: "Reunión",
  VISITA_OFICINA: "Visita oficina",
  VISITA_PROPIEDAD: "Visita a propiedad",
  MENSAJE_PORTAL: "Mensaje portal",
  NOTA_INTERNA: "Nota interna",
  TAREA_COMPLETADA: "Tarea completada",
  EVENTO_SISTEMA: "Evento sistema",
};

export const INTERACTION_DIRECTION_LABEL: Record<InteractionDirection, string> =
  {
    ENTRANTE: "Entrante",
    SALIENTE: "Saliente",
    INTERNA: "Interna",
    AUTOMATICA: "Automática",
  };

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  SNOOZED: "Pausada",
};

export const TASK_STATUS_TONE: Record<TaskStatus, ColorTone> = {
  PENDIENTE: "warning",
  EN_PROCESO: "info",
  COMPLETADA: "success",
  CANCELADA: "neutral",
  SNOOZED: "neutral",
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export const TASK_PRIORITY_TONE: Record<TaskPriority, ColorTone> = {
  BAJA: "neutral",
  MEDIA: "info",
  ALTA: "warning",
  URGENTE: "danger",
};

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  PROPUESTO: "Propuesto",
  VISTO_POR_AGENTE: "Visto",
  ENVIADO_AL_LEAD: "Enviado",
  LEAD_INTERESADO: "Interesado",
  LEAD_DESCARTO: "Descartado",
  CONVERTIDO_EN_VISITA: "Convertido en visita",
};

export const MATCH_STATUS_TONE: Record<MatchStatus, ColorTone> = {
  PROPUESTO: "info",
  VISTO_POR_AGENTE: "neutral",
  ENVIADO_AL_LEAD: "gold",
  LEAD_INTERESADO: "success",
  LEAD_DESCARTO: "danger",
  CONVERTIDO_EN_VISITA: "success",
};

export const CLIENT_TYPE_LABEL: Record<ClientType, string> = {
  COMPRADOR: "Comprador",
  INQUILINO: "Inquilino",
  INVERSIONISTA: "Inversionista",
  PROPIETARIO_CLIENTE: "Propietario-cliente",
};

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  AGENCY_ADMIN: "Administrador",
  BROKER: "Broker",
  AGENT: "Agente",
  ASSISTANT: "Asistente",
};

export const CURRENCY_LABEL: Record<Currency, string> = {
  MXN: "Pesos (MXN)",
  USD: "Dólares (USD)",
};

export const CONTACT_CHANNEL_LABEL: Record<ContactChannel, string> = {
  WHATSAPP: "WhatsApp",
  PHONE: "Teléfono",
  EMAIL: "Email",
};

export const CONTACT_TIME_LABEL: Record<ContactTime, string> = {
  MORNING: "Mañana",
  AFTERNOON: "Tarde",
  EVENING: "Noche",
  ANYTIME: "Cualquier hora",
};

export const TAG_KIND_LABEL: Record<TagKind, string> = {
  LEAD: "Lead",
  CLIENT: "Cliente",
  OWNER: "Propietario",
  PROPERTY: "Propiedad",
};

export const NOTIFICATION_CHANNEL_LABEL: Record<NotificationChannel, string> = {
  IN_APP: "En la app",
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  PUSH: "Push",
};

export const NOTIFICATION_EVENT_LABEL: Record<NotificationEvent, string> = {
  NEW_LEAD: "Lead nuevo",
  LEAD_REPLY: "Respuesta de lead",
  VIEWING_REMINDER: "Recordatorio de visita",
  CONTRACT_EXPIRING: "Contrato próximo a vencer",
  PAYMENT_DUE: "Pago de renta pendiente",
  MAINTENANCE_REQUEST: "Nuevo mantenimiento",
  DAILY_DIGEST: "Resumen diario",
};

export const SUBSCRIPTION_PLAN_LABEL: Record<SubscriptionPlan, string> = {
  TRIAL: "Trial",
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  ACTIVE: "Activa",
  PAST_DUE: "Vencida",
  CANCELED: "Cancelada",
  TRIAL: "En trial",
};
