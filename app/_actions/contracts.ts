"use server";

import { revalidatePath } from "next/cache";
import { requireSession, requireRole } from "@/lib/auth/session";
import { withTenant } from "@/lib/repos/tenant";
import { renewContract } from "@/lib/services/contract-expiry";
import { prisma } from "@/lib/prisma";
import {
  ContractCreateSchema,
  ContractUpdateSchema,
  ContractRenewSchema,
} from "@/lib/validators/contract";

export async function createContractAction(rawInput: unknown) {
  const u = await requireSession();
  const input = ContractCreateSchema.parse(rawInput);

  const contract = await withTenant(
    { organizationId: u.organizationId, userId: u.id },
    (db) =>
      db.propertyContract.create({
        data: {
          organizationId: u.organizationId,
          ...(input as any),
          durationMonths: input.endDate
            ? Math.round(
                (input.endDate.getTime() - input.startDate.getTime()) /
                  (1000 * 60 * 60 * 24 * 30.5),
              )
            : null,
        },
      }),
  );

  revalidatePath("/contratos");
  return { ok: true, id: contract.id };
}

export async function updateContractAction(contractId: string, rawInput: unknown) {
  const u = await requireSession();
  const input = ContractUpdateSchema.parse(rawInput);

  const c = await prisma.propertyContract.findFirst({
    where: { id: contractId, organizationId: u.organizationId },
  });
  if (!c) return { ok: false, error: "NOT_FOUND" };

  await prisma.propertyContract.update({
    where: { id: contractId },
    data: input as any,
  });

  revalidatePath(`/contratos/${contractId}`);
  return { ok: true };
}

export async function renewContractAction(rawInput: unknown) {
  const u = await requireRole("BROKER");
  const { contractId, newEndDate, newPrice } = ContractRenewSchema.parse(rawInput);

  const result = await renewContract(
    u.organizationId,
    contractId,
    newEndDate,
    newPrice,
  );

  revalidatePath("/contratos");
  return { ok: true, ...result };
}
