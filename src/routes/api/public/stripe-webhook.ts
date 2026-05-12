import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sig = request.headers.get("stripe-signature");
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!sig || !secret || !stripeKey) {
          return new Response("Webhook not configured", { status: 500 });
        }
        const stripe = new Stripe(stripeKey);
        const body = await request.text();
        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(body, sig, secret);
        } catch (err: any) {
          console.error("Webhook signature verification failed", err?.message);
          return new Response(`Bad signature: ${err?.message}`, { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.user_id;
          const credits = Number(session.metadata?.credits ?? 0);
          if (!userId || !credits) {
            console.error("Missing metadata on session", session.id);
            return new Response("Missing metadata", { status: 200 });
          }
          const { data: existing } = await supabaseAdmin
            .from("user_credits")
            .select("credits")
            .eq("user_id", userId)
            .maybeSingle();
          const current = existing?.credits ?? 0;
          const { error } = await supabaseAdmin
            .from("user_credits")
            .upsert({ user_id: userId, credits: current + credits, updated_at: new Date().toISOString() });
          if (error) {
            console.error("Failed to credit user", error);
            return new Response("DB error", { status: 500 });
          }
        }

        return new Response("ok");
      },
    },
  },
});
