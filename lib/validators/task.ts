import { z } from "zod";
import { TaskPriority, TaskStatus } from "../enums";
import { cuid, pagination } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  assignedToId: cuid,
  dueAt: z.coerce.date().optional(),
  priority: z.enum(ev(TaskPriority)).default("MEDIA"),
  relatedLeadId: cuid.optional(),
  relatedClientId: cuid.optional(),
  relatedPropertyId: cuid.optional(),
  relatedRentalId: cuid.optional(),
});

export const TaskUpdateSchema = z.object({
  taskId: cuid,
  status: z.enum(ev(TaskStatus)).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(4000).optional(),
  dueAt: z.coerce.date().optional(),
  priority: z.enum(ev(TaskPriority)).optional(),
  assignedToId: cuid.optional(),
});

export const TaskFiltersSchema = pagination.extend({
  status: z.enum(ev(TaskStatus)).optional(),
  assignedToId: cuid.optional(),
  /** Dueñas vencidas */
  overdue: z.coerce.boolean().optional(),
});
