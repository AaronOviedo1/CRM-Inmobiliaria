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
  // Solo Administrador
  "user.manage":                ["ADMINISTRADOR"],
  "billing.manage":             ["ADMINISTRADOR"],
  "org.settings":               ["ADMINISTRADOR"],
  "reports.view_global":        ["ADMINISTRADOR"],
  "property.edit_price":        ["ADMINISTRADOR"],
  "property.delete":            ["ADMINISTRADOR"],
  "lead.assign":                ["ADMINISTRADOR"],
  "lead.delete":                ["ADMINISTRADOR"],
  "lead.view_all":              ["ADMINISTRADOR"],
  "rental.terminate":           ["ADMINISTRADOR"],
  "maintenance.approve_spending": ["ADMINISTRADOR"],
  "whatsapp.configure":         ["ADMINISTRADOR"],
  // Ambos roles
  "property.create":            ["ADMINISTRADOR", "ASESOR"],
  "property.edit_status":       ["ADMINISTRADOR", "ASESOR"],
  "rental.create":              ["ADMINISTRADOR", "ASESOR"],
};

export function can(role: UserRole, action: Action): boolean {
  return MATRIX[action].includes(role);
}

export function assertCan(role: UserRole, action: Action): void {
  if (!can(role, action)) {
    throw new Error(`FORBIDDEN: role=${role} cannot perform ${action}`);
  }
}
