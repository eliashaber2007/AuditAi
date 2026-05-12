import { createFileRoute } from "@tanstack/react-router";
import {
  handleStripeWebhookPost,
  stripeWebhookHealthResponse,
} from "@/lib/stripe-webhook-handler";

// Public webhook endpoint for Stripe. Lives under /api/public/* so it
// bypasses any auth gate. No middleware is attached — Stripe POSTs the raw
// body and signature header, and we MUST return a 200 quickly on success
// so Stripe doesn't retry forever.
export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      // Health check / sanity ping — useful when verifying the URL in the
      // Stripe dashboard. Stripe itself only ever uses POST.
      GET: async () => stripeWebhookHealthResponse(),

      POST: async ({ request }) => handleStripeWebhookPost(request),
    },
  },
});
