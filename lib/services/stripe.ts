/// Billing con Stripe. Si no está configurado, expone helpers que no-op para dev.

import { env, isStripeConfigured } from "../env";
import { prisma } from "../prisma";

export type PlanId = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

function stripe() {
  if (!isStripeConfigured()) throw new Error("Stripe not configured");
  const Stripe = require("stripe");
  return new Stripe(env.stripeSecret!, { apiVersion: "2024-11-20.acacia" });
}

export async function createCustomer(
  organizationId: string,
  email: string,
  name: string,
): Promise<string> {
  const s = stripe();
  const customer = await s.customers.create({ email, name, metadata: { organizationId } });
  await prisma.organization.update({
    where: { id: organizationId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

export async function createSubscription(
  organizationId: string,
  plan: PlanId,
  trialDays = 0,
): Promise<{ subscriptionId: string; clientSecret?: string }> {
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
  const s = stripe();

  let customerId = org.stripeCustomerId;
  if (!customerId) {
    customerId = await createCustomer(organizationId, org.email ?? "", org.name);
  }

  const priceId = env.stripePrices[plan];
  if (!priceId) throw new Error(`Stripe price not configured for ${plan}`);

  const subscription = await s.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialDays || undefined,
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });

  const clientSecret =
    (subscription.latest_invoice as any)?.payment_intent?.client_secret ?? undefined;

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionPlan: plan,
      subscriptionStatus: subscription.status === "active" ? "ACTIVE" : "TRIAL",
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  return { subscriptionId: subscription.id, clientSecret };
}

export async function cancelSubscription(organizationId: string): Promise<void> {
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
  if (!org.stripeSubscriptionId) return;
  const s = stripe();
  await s.subscriptions.cancel(org.stripeSubscriptionId);
  await prisma.organization.update({
    where: { id: organizationId },
    data: { subscriptionStatus: "CANCELED" },
  });
}

/** Parsea y valida el evento de webhook de Stripe. */
export async function constructStripeEvent(rawBody: string, sig: string) {
  const s = stripe();
  return s.webhooks.constructEvent(rawBody, sig, env.stripeWebhookSecret!);
}

/** Sincroniza los cambios del webhook de Stripe a la DB. */
export async function handleStripeEvent(event: any): Promise<void> {
  switch (event.type) {
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object;
      const org = await prisma.organization.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!org) return;

      const statusMap: Record<string, string> = {
        active: "ACTIVE",
        trialing: "TRIAL",
        past_due: "PAST_DUE",
        canceled: "CANCELED",
        unpaid: "PAST_DUE",
        incomplete: "PAST_DUE",
        incomplete_expired: "CANCELED",
        paused: "PAST_DUE",
      };

      await prisma.organization.update({
        where: { id: org.id },
        data: {
          subscriptionStatus: (statusMap[sub.status] ?? "PAST_DUE") as any,
          subscriptionCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const org = await prisma.organization.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!org) return;
      await prisma.organization.update({
        where: { id: org.id },
        data: { subscriptionStatus: "CANCELED" },
      });
      break;
    }
  }
}
