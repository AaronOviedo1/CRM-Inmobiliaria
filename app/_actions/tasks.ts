"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { withTenant } from "@/lib/repos/tenant";
import { prisma } from "@/lib/prisma";
import { TaskCreateSchema, TaskUpdateSchema } from "@/lib/validators/task";

export async function createTaskAction(rawInput: unknown) {
  const u = await requireSession();
  const input = TaskCreateSchema.parse(rawInput);

  const task = await withTenant(
    { organizationId: u.organizationId, userId: u.id },
    (db) =>
      db.task.create({
        data: {
          organizationId: u.organizationId,
          ...(input as any),
          createdById: u.id,
        },
      }),
  );

  revalidatePath("/tareas");
  return { ok: true, id: task.id };
}

export async function updateTaskAction(rawInput: unknown) {
  const u = await requireSession();
  const input = TaskUpdateSchema.parse(rawInput);
  const { taskId, ...rest } = input;

  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId: u.organizationId },
  });
  if (!task) return { ok: false, error: "NOT_FOUND" };

  const completedAt =
    rest.status === "COMPLETADA" && task.status !== "COMPLETADA"
      ? new Date()
      : undefined;

  await prisma.task.update({
    where: { id: taskId },
    data: { ...(rest as any), completedAt },
  });

  revalidatePath("/tareas");
  if (task.relatedLeadId) revalidatePath(`/leads/${task.relatedLeadId}`);
  return { ok: true };
}

export async function completeTaskAction(taskId: string) {
  return updateTaskAction({ taskId, status: "COMPLETADA" });
}
