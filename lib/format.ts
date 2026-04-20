import { format, formatDistanceToNowStrict, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import type { Currency } from "./types";

type MoneyValue = number | null | undefined | { toNumber(): number };

function toNum(v: MoneyValue): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "object" && "toNumber" in v) return v.toNumber();
  return v as number;
}

export function formatMoney(
  value: MoneyValue,
  currency: Currency = "MXN"
): string {
  const n = toNum(value);
  if (n === null) return "—";
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return formatter.format(n);
}

export function formatMoneyCompact(
  value: MoneyValue,
  currency: Currency = "MXN"
): string {
  const n = toNum(value);
  if (n === null) return "—";
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return formatter.format(n);
}

export function formatNumber(value: MoneyValue): string {
  const n = toNum(value);
  if (n === null) return "—";
  return new Intl.NumberFormat("es-MX").format(n);
}

export function formatArea(m2: MoneyValue): string {
  const n = toNum(m2);
  if (n === null) return "—";
  return `${new Intl.NumberFormat("es-MX").format(n)} m²`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "d MMM yyyy", { locale: es });
}

export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "EEEE d 'de' MMMM, yyyy", { locale: es });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "d MMM yyyy HH:mm", { locale: es });
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "HH:mm", { locale: es });
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNowStrict(new Date(date), {
    addSuffix: true,
    locale: es,
  });
}

export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  return differenceInDays(new Date(date), new Date());
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10)
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  if (digits.length === 12 && digits.startsWith("52"))
    return `+52 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  return phone;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(1)}%`;
}
