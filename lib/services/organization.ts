/// Bootstrap y gestión de organizaciones (tenants).

import { prisma } from "../prisma";
import { hashPassword } from "../auth/password";
import type { OrgRegisterSchema } from "../validators/user";
import type { z } from "zod";

type OrgRegisterInput = z.infer<typeof import("../validators/user").OrgRegisterSchema>;

const TRIAL_DAYS = 14;

export async function registerOrganization(input: OrgRegisterInput): Promise<{
  organizationId: string;
  userId: string;
}> {
  const existing = await prisma.organization.findUnique({
    where: { slug: input.orgSlug.toLowerCase() },
  });
  if (existing) throw new Error("SLUG_TAKEN");

  const emailTaken = await prisma.user.findUnique({
    where: { email: input.adminEmail.toLowerCase() },
  });
  if (emailTaken) throw new Error("EMAIL_TAKEN");

  const hash = await hashPassword(input.adminPassword);
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  const org = await prisma.organization.create({
    data: {
      name: input.orgName,
      slug: input.orgSlug.toLowerCase(),
      subscriptionPlan: "TRIAL",
      subscriptionStatus: "TRIAL",
      trialEndsAt,
      users: {
        create: {
          email: input.adminEmail.toLowerCase(),
          name: input.adminName,
          passwordHash: hash,
          role: "AGENCY_ADMIN",
        },
      },
    },
    include: { users: true },
  });

  return {
    organizationId: org.id,
    userId: org.users[0]!.id,
  };
}

export async function getOrgBySlug(slug: string) {
  return prisma.organization.findUnique({ where: { slug } });
}

export async function suspendOrg(orgId: string) {
  return prisma.organization.update({
    where: { id: orgId },
    data: { subscriptionStatus: "CANCELED" },
  });
}

export async function activateOrgSubscription(
  orgId: string,
  plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE",
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  currentPeriodEnd: Date,
) {
  return prisma.organization.update({
    where: { id: orgId },
    data: {
      subscriptionPlan: plan,
      subscriptionStatus: "ACTIVE",
      stripeCustomerId,
      stripeSubscriptionId,
      subscriptionCurrentPeriodEnd: currentPeriodEnd,
    },
  });
}
