import { createFileRoute } from "@tanstack/react-router";
import {
  handleStripeWebhookPost,
  stripeWebhookHealthResponse,
} from "@/lib/stripe-webhook-handler";

// Alternate Stripe webhook endpoint without the /public segment. It has no
// route-level middleware or component, so POST requests are handled only by
// this server route.
export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      GET: async () => stripeWebhookHealthResponse(),
      POST: async ({ request }) => handleStripeWebhookPost(request),
    },
  },
});