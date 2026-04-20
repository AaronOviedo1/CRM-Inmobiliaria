/// Reglas de RBAC finas a nivel acción.
/// El chequeo grueso lo hace requireRole en session.ts; este archivo expone
/// matrices específicas para operaciones que no encajan en jerarquía pura.

import { UserRole } from "../enums";

type Action =
  | "user.manage"
  | "billing.manage"
  | "org.settings"
  | "reports.view_global"
  | "property.create"
  | "property.edit_price"
  | "property.edit_status"
  | "property.delete"
  | "lead.assign"
  | "lead.delete"
  | "lead.view_all"
  | "rental.create"
  | "rental.terminate"
  | "maintenance.approve_spending"
  | "whatsapp.configure";

const MATRIX: Record<Action, UserRole[]> = {
  "user.manage": ["SUPER_ADMIN", "AGENCY_ADMIN"],
  "billing.manage": ["SUPER_ADMIN", "AGENCY_ADMIN"],
  "org.settings": ["SUPER_ADMIN", "AGENCY_ADMIN"],
  "reports.view_global": ["SUPER_ADMIN", "AGENCY_ADMIN", "BROKER"],
  "property.create": ["SUPER_ADMIN", "AGENCY_ADMIN", "BROKER", "AGENT"],
  "property.edit_price": ["SUPER_ADMIN", "AGENCY_ADMIN", "BROKER"],
  "property.edit_status": ["SUPER_ADMIN", "AGENCY_ADMIN", "BROKER", "AGENT"],
  "property.delete": ["SUPER_ADMIN", "AGENCY_ADMIN", "BROKER"],
  "lead.assign": ["SUPER_ADMIN", "AGENCY_ADMIN", "BROKER"],
  "lead.delete": ["SUPER_ADMIN", "AGENCY_ADMIN", "BROKER"],
  "lead.view_all": ["SUPER_ADMIN", "AGENCY_ADMIN", "BROKER"],
  "rental.create": ["SUPER_ADMIN", "AGENCY_ADMIN", "BROKER", "AGENT"],
  "rental.terminate": ["SUPER_ADMIN", "AGENCY_ADMIN", "BROKER"],
  "maintenance.approve_spending": ["SUPER_ADMIN", "AGENCY_ADMIN", "BROKER"],
  "whatsapp.configure": ["SUPER_ADMIN", "AGENCY_ADMIN"],
};

export function can(role: UserRole, action: Action): boolean {
  return MATRIX[action].includes(role);
}

export function assertCan(role: UserRole, action: Action): void {
  if (!can(role, action)) {
    throw new Error(`FORBIDDEN: role=${role} cannot perform ${action}`);
  }
}
