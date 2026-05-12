import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export function stripeWebhookHealthResponse() {
  return new Response("Stripe webhook endpoint. POST only.", { status: 200 });
}

export async function handleStripeWebhookPost(request: Request) {
  console.log("[stripe-webhook] POST handler reached", {
    path: new URL(request.url).pathname,
    method: request.method,
  });

  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!sig) {
    console.error("[stripe-webhook] Missing stripe-signature header");
    return new Response("Missing signature", { status: 400 });
  }
  if (!secret || !stripeKey) {
    console.error("[stripe-webhook] Missing STRIPE_* env vars");
    return new Response("Webhook not configured", { status: 500 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err: any) {
    console.error("[stripe-webhook] Failed to read raw body:", err?.message);
    return new Response(`Failed to read request body: ${err?.message}`, {
      status: 400,
    });
  }

  const stripe = new Stripe(stripeKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    console.error("[stripe-webhook] Signature verification failed:", err?.message);
    return new Response(`Bad signature: ${err?.message}`, { status: 403 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const credits = Number(session.metadata?.credits ?? 0);

      if (!userId || !credits) {
        console.error(
          "[stripe-webhook] Missing user_id/credits metadata on session",
          session.id,
        );
        return new Response("ok", { status: 200 });
      }

      const { data: existing } = await supabaseAdmin
        .from("user_credits")
        .select("credits")
        .eq("user_id", userId)
        .maybeSingle();
      const current = existing?.credits ?? 0;

      const { error } = await supabaseAdmin.from("user_credits").upsert({
        user_id: userId,
        credits: current + credits,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error("[stripe-webhook] DB upsert failed", error);
        return new Response("DB error", { status: 500 });
      }
      console.log(
        `[stripe-webhook] Credited user ${userId} with ${credits} credits (now ${
          current + credits
        })`,
      );
    } else {
      console.log(`[stripe-webhook] Ignored event type ${event.type}`);
    }
  } catch (err: any) {
    console.error("[stripe-webhook] Handler error:", err?.message);
    return new Response("Handler error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}