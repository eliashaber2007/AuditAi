import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Public webhook endpoint for Stripe. Lives under /api/public/* so it
// bypasses any auth gate. No middleware is attached — Stripe POSTs the raw
// body and signature header, and we MUST return a 200 quickly on success
// so Stripe doesn't retry forever.
export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      // Health check / sanity ping — useful when verifying the URL in the
      // Stripe dashboard. Stripe itself only ever uses POST.
      GET: async () =>
        new Response("Stripe webhook endpoint. POST only.", { status: 200 }),

      POST: async ({ request }) => {
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

        const stripe = new Stripe(stripeKey);
        // IMPORTANT: must use the raw text body for signature verification.
        const body = await request.text();

        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(body, sig, secret);
        } catch (err: any) {
          console.error(
            "[stripe-webhook] Signature verification failed:",
            err?.message,
          );
          return new Response(`Bad signature: ${err?.message}`, {
            status: 400,
          });
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
              // Acknowledge so Stripe stops retrying; nothing we can do.
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
              `[stripe-webhook] Credited user ${userId} with ${credits} credits (now ${current + credits})`,
            );
          } else {
            console.log(`[stripe-webhook] Ignored event type ${event.type}`);
          }
        } catch (err: any) {
          console.error("[stripe-webhook] Handler error:", err?.message);
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
