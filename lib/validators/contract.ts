import { z } from "zod";
import { ContractKind, ContractStatus } from "../enums";
import { cuid, money, moneyOpt, pagination } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const ContractCreateSchema = z
  .object({
    propertyId: cuid,
    contractKind: z.enum(ev(ContractKind)),
    status: z.enum(ev(ContractStatus)).default("BORRADOR"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    ownerId: cuid.optional(),
    clientId: cuid.optional(),
    agentId: cuid.optional(),
    commissionPct: z.coerce.number().min(0).max(100).optional(),
    agreedPrice: money,
    depositAmount: moneyOpt,
    notes: z.string().max(4000).optional(),
    externalDocumentUrl: z.string().url().optional(),
    reminderDaysBeforeEnd: z.coerce.number().int().min(0).max(365).default(30),
  })
  .refine(
    (v) => (v.endDate ? v.endDate >= v.startDate : true),
    { message: "endDate debe ser >= startDate", path: ["endDate"] },
  );

export const ContractUpdateSchema = z.object({
  status: z.enum(ev(ContractStatus)).optional(),
  endDate: z.coerce.date().optional(),
  agreedPrice: moneyOpt,
  commissionPct: z.coerce.number().min(0).max(100).optional(),
  depositAmount: moneyOpt,
  notes: z.string().max(4000).optional(),
  externalDocumentUrl: z.string().url().optional(),
  reminderDaysBeforeEnd: z.coerce.number().int().min(0).max(365).optional(),
});

export const ContractRenewSchema = z.object({
  contractId: cuid,
  newEndDate: z.coerce.date(),
  newPrice: moneyOpt,
});

export const ContractFiltersSchema = pagination.extend({
  status: z.enum(ev(ContractStatus)).optional(),
  kind: z.enum(ev(ContractKind)).optional(),
  propertyId: cuid.optional(),
  ownerId: cuid.optional(),
  clientId: cuid.optional(),
  expiringBefore: z.coerce.date().optional(),
});
