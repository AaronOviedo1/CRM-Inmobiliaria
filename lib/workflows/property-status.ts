/// Matriz de transiciones válidas entre PropertyStatus.
///
/// Reglas de negocio:
/// - Una propiedad en BORRADOR solo puede publicarse (→ DISPONIBLE) o
///   descartarse (→ ARCHIVADA).
/// - DISPONIBLE es el "hub": puede moverse a cualquier estado operativo.
/// - APARTADA / EN_NEGOCIACION pueden volver a DISPONIBLE si se cae el
///   trato, cruzarse entre sí, cerrar venta/renta o archivarse.
/// - VENDIDA es terminal: solo → ARCHIVADA.
/// - RENTADA puede volver a DISPONIBLE cuando el inquilino se va.
/// - PAUSADA / NO_DISPONIBLE vuelven a DISPONIBLE al reactivarse.
/// - ARCHIVADA es terminal absoluto (soft delete).

import { PropertyStatus } from "../enums";
import type { PropertyStatus as PropertyStatusType } from "../enums";

export const ALLOWED_PROPERTY_STATUS_TRANSITIONS: Record<
  PropertyStatusType,
  PropertyStatusType[]
> = {
  [PropertyStatus.BORRADOR]: [
    PropertyStatus.DISPONIBLE,
    PropertyStatus.ARCHIVADA,
  ],
  [PropertyStatus.DISPONIBLE]: [
    PropertyStatus.APARTADA,
    PropertyStatus.EN_NEGOCIACION,
    PropertyStatus.VENDIDA,
    PropertyStatus.RENTADA,
    PropertyStatus.PAUSADA,
    PropertyStatus.NO_DISPONIBLE,
    PropertyStatus.ARCHIVADA,
  ],
  [PropertyStatus.APARTADA]: [
    PropertyStatus.DISPONIBLE,
    PropertyStatus.EN_NEGOCIACION,
    PropertyStatus.VENDIDA,
    PropertyStatus.RENTADA,
    PropertyStatus.ARCHIVADA,
  ],
  [PropertyStatus.EN_NEGOCIACION]: [
    PropertyStatus.DISPONIBLE,
    PropertyStatus.APARTADA,
    PropertyStatus.VENDIDA,
    PropertyStatus.RENTADA,
    PropertyStatus.ARCHIVADA,
  ],
  [PropertyStatus.VENDIDA]: [PropertyStatus.ARCHIVADA],
  [PropertyStatus.RENTADA]: [
    PropertyStatus.DISPONIBLE,
    PropertyStatus.ARCHIVADA,
  ],
  [PropertyStatus.PAUSADA]: [
    PropertyStatus.DISPONIBLE,
    PropertyStatus.ARCHIVADA,
  ],
  [PropertyStatus.NO_DISPONIBLE]: [
    PropertyStatus.DISPONIBLE,
    PropertyStatus.ARCHIVADA,
  ],
  [PropertyStatus.ARCHIVADA]: [],
};

export function canTransitionPropertyStatus(
  from: PropertyStatusType,
  to: PropertyStatusType,
): boolean {
  if (from === to) return true;
  return ALLOWED_PROPERTY_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export class PropertyStatusTransitionError extends Error {
  code = "INVALID_TRANSITION" as const;
  constructor(
    public from: PropertyStatusType,
    public to: PropertyStatusType,
  ) {
    super(`Transición inválida: ${from} → ${to}`);
    this.name = "PropertyStatusTransitionError";
  }
}
