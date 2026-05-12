import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Avoid trailing-slash 302 redirects so external POSTs (e.g. Stripe
    // webhooks at /api/public/stripe-webhook or .../stripe-webhook/) are
    // delivered straight to the handler instead of being redirected.
    trailingSlash: "preserve",
  });

  return router;
};
