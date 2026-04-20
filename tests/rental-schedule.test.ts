import { describe, it, expect } from "vitest";

/**
 * Tests de lógica pura de programación de rentas.
 * Estos no necesitan DB — validan el comportamiento de las funciones auxiliares.
 */

function computeDueDate(year: number, month: number, dueDay: number): Date {
  return new Date(year, month - 1, dueDay);
}

function periodMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function daysOverdue(dueDate: Date, today: Date): number {
  const diff = today.getTime() - dueDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

type ReminderAction = "first_reminder" | "second_reminder" | "mark_overdue" | null;

function computeReminderAction(daysOverdueVal: number): ReminderAction {
  if (daysOverdueVal >= 3) return "mark_overdue";
  if (daysOverdueVal === 0) return "second_reminder";
  if (daysOverdueVal <= -3 && daysOverdueVal >= -3) return "first_reminder";
  return null;
}

describe("rental schedule", () => {
  it("debe generar el periodMonth correcto", () => {
    expect(periodMonth(2026, 4)).toBe("2026-04");
    expect(periodMonth(2026, 12)).toBe("2026-12");
    expect(periodMonth(2027, 1)).toBe("2027-01");
  });

  it("debe calcular la dueDate correcta para paymentDueDay=5", () => {
    const due = computeDueDate(2026, 4, 5);
    expect(due.getDate()).toBe(5);
    expect(due.getMonth()).toBe(3); // 0-indexed April
    expect(due.getFullYear()).toBe(2026);
  });

  it("daysOverdue = 0 en la fecha de vencimiento", () => {
    const due = new Date(2026, 3, 5);
    const today = new Date(2026, 3, 5);
    expect(daysOverdue(due, today)).toBe(0);
  });

  it("daysOverdue = -3 tres días antes del vencimiento", () => {
    const due = new Date(2026, 3, 5);
    const today = new Date(2026, 3, 2);
    expect(daysOverdue(due, today)).toBe(-3);
  });

  it("daysOverdue = 3 tres días después del vencimiento", () => {
    const due = new Date(2026, 3, 5);
    const today = new Date(2026, 3, 8);
    expect(daysOverdue(due, today)).toBe(3);
  });

  describe("computeReminderAction", () => {
    it("debe marcar VENCIDO a +3 días", () => {
      expect(computeReminderAction(3)).toBe("mark_overdue");
    });
    it("debe marcar VENCIDO a +5 días", () => {
      expect(computeReminderAction(5)).toBe("mark_overdue");
    });
    it("debe enviar segundo recordatorio en día 0", () => {
      expect(computeReminderAction(0)).toBe("second_reminder");
    });
    it("debe enviar primer recordatorio a -3 días", () => {
      expect(computeReminderAction(-3)).toBe("first_reminder");
    });
    it("no debe hacer nada a -10 días", () => {
      expect(computeReminderAction(-10)).toBeNull();
    });
  });
});
