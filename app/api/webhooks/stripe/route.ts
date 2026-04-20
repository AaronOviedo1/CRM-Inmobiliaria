import { NextRequest, NextResponse } from "next/server";
import { constructStripeEvent, handleStripeEvent } from "@/lib/services/stripe";
import { isStripeConfigured } from "@/lib/env";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: unknown;
  try {
    event = await constructStripeEvent(rawBody, sig);
  } catch (err) {
    console.error("[webhook/stripe] signature verify failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (err) {
    console.error("[webhook/stripe] handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
