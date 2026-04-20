import { z } from "zod";
import {
  RentalStatus,
  RentalPaymentStatus,
  RentalPaymentChannel,
  Currency,
} from "../enums";
import { cuid, money, moneyOpt, pagination } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const RentalCreateSchema = z.object({
  propertyId: cuid,
  contractId: cuid,
  tenantClientId: cuid,
  ownerId: cuid,
  managingAgentId: cuid.optional(),
  monthlyRent: money,
  currency: z.enum(ev(Currency)).default("MXN"),
  paymentDueDay: z.coerce.number().int().min(1).max(28),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  depositHeld: moneyOpt,
  utilitiesIncluded: z.array(z.string().max(30)).max(10).default([]),
  notes: z.string().max(4000).optional(),
});

export const RentalUpdateSchema = RentalCreateSchema.partial();

export const RentalTerminateSchema = z.object({
  rentalId: cuid,
  reason: z.string().max(400),
  depositReturned: moneyOpt,
  depositWithheld: moneyOpt,
  withheldReason: z.string().max(400).optional(),
});

export const PaymentRegisterSchema = z.object({
  paymentId: cuid,
  amountPaid: money,
  paidAt: z.coerce.date().default(() => new Date()),
  paymentReference: z.string().max(120).optional(),
  receivedBy: z.enum(ev(RentalPaymentChannel)).default("DIRECTO_AL_PROPIETARIO"),
  notes: z.string().max(1000).optional(),
});

export const PaymentProofUploadSchema = z.object({
  paymentId: cuid,
  fileUrl: z.string().url(),
  paymentReference: z.string().max(120).optional(),
});

export const RentalFiltersSchema = pagination.extend({
  status: z.enum(ev(RentalStatus)).optional(),
  propertyId: cuid.optional(),
  tenantClientId: cuid.optional(),
  ownerId: cuid.optional(),
});

export const PaymentFiltersSchema = pagination.extend({
  rentalId: cuid.optional(),
  status: z.enum(ev(RentalPaymentStatus)).optional(),
  periodMonth: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
});
