import { z } from "zod";
import {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus,
} from "../enums";
import { cuid, moneyOpt, pagination } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const MaintenanceCreateSchema = z.object({
  rentalId: cuid,
  title: z.string().min(3).max(120),
  description: z.string().min(5).max(4000),
  category: z.enum(ev(MaintenanceCategory)),
  priority: z.enum(ev(MaintenancePriority)).default("MEDIA"),
  images: z.array(z.string().url()).max(10).default([]),
  estimatedCost: moneyOpt,
});

export const MaintenanceUpdateSchema = z.object({
  requestId: cuid,
  status: z.enum(ev(MaintenanceStatus)).optional(),
  assignedToId: cuid.optional(),
  estimatedCost: moneyOpt,
  actualCost: moneyOpt,
  paidByOwner: z.boolean().optional(),
  paidByTenant: z.boolean().optional(),
  splitDetails: z.string().max(1000).optional(),
  internalNotes: z.string().max(4000).optional(),
  resolutionNotes: z.string().max(4000).optional(),
});

export const MaintenanceOwnerDecisionSchema = z.object({
  requestId: cuid,
  approved: z.boolean(),
  note: z.string().max(1000).optional(),
});

export const MaintenanceFiltersSchema = pagination.extend({
  status: z.enum(ev(MaintenanceStatus)).optional(),
  priority: z.enum(ev(MaintenancePriority)).optional(),
  rentalId: cuid.optional(),
  propertyId: cuid.optional(),
});
