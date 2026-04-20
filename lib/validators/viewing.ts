import { z } from "zod";
import { ViewingStatus, InterestLevel } from "../enums";
import { cuid, pagination } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const ViewingScheduleSchema = z.object({
  propertyId: cuid,
  leadId: cuid.optional(),
  clientId: cuid.optional(),
  agentId: cuid,
  scheduledAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(15).max(240).default(45),
  meetingPoint: z.string().max(200).optional(),
});

export const ViewingUpdateSchema = z.object({
  viewingId: cuid,
  status: z.enum(ev(ViewingStatus)).optional(),
  scheduledAt: z.coerce.date().optional(),
  leadInterestLevel: z.enum(ev(InterestLevel)).optional(),
  leadFeedback: z.string().max(2000).optional(),
  agentNotes: z.string().max(4000).optional(),
});

export const ViewingFiltersSchema = pagination.extend({
  status: z.enum(ev(ViewingStatus)).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  agentId: cuid.optional(),
  propertyId: cuid.optional(),
});
