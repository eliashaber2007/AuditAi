import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import Stripe from "stripe";

export const PRICE_PACKS: Record<string, { credits: number; priceId: string; label: string; price: string }> = {
  starter: { credits: 1, priceId: "price_1TWIxU3tQoKHUCvUB9FnVrHW", label: "1 audit", price: "€2" },
  pack5: { credits: 5, priceId: "price_1TWIy73tQoKHUCvUECYwL9OA", label: "5 audits", price: "€8" },
  pack20: { credits: 20, priceId: "price_1TWIyf3tQoKHUCvUgFB8wLU0", label: "20 audits", price: "€25" },
};

export const getMyCredits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();
    return { credits: data?.credits ?? 0 };
  });

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { packKey: string; origin: string }) => data)
  .handler(async ({ data, context }) => {
    const pack = PRICE_PACKS[data.packKey];
    if (!pack) throw new Error("Invalid pack");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: pack.priceId, quantity: 1 }],
      success_url: `${data.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.origin}/pricing`,
      metadata: { user_id: context.userId, credits: String(pack.credits) },
      payment_intent_data: {
        metadata: { user_id: context.userId, credits: String(pack.credits) },
      },
    });
    return { url: session.url };
  });

export const verifyCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { sessionId: string }) => data)
  .handler(async ({ data, context }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    if (session.payment_status !== "paid") {
      return { credited: false, credits: 0 };
    }
    if (session.metadata?.user_id !== context.userId) {
      throw new Error("Session does not belong to this user");
    }
    const credits = Number(session.metadata?.credits ?? 0);
    await ensureCredits(context.userId, credits, session.id);
    const { data: row } = await supabaseAdmin
      .from("user_credits")
      .select("credits")
      .eq("user_id", context.userId)
      .maybeSingle();
    return { credited: true, credits: row?.credits ?? 0 };
  });

async function ensureCredits(userId: string, amount: number, sessionId: string) {
  if (process.env.STRIPE_WEBHOOK_SECRET) return;
  const { data: existing } = await supabaseAdmin
    .from("user_credits")
    .select("credits")
    .eq("user_id", userId)
    .maybeSingle();
  const current = existing?.credits ?? 0;
  await supabaseAdmin
    .from("user_credits")
    .upsert({ user_id: userId, credits: current + amount, updated_at: new Date().toISOString() });
}
