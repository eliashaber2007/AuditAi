// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Vercel deploy target. The lovable wrapper defaults to the cloudflare-module
  // preset unless overridden here; this only takes effect outside Lovable's own
  // sandbox build (which always forces cloudflare-module regardless of this value).
  nitro: {
    preset: "vercel",
    vercel: {
      // runAudit (and any other server fn) can run up to ~55s worst case: 20s
      // fetch-site + 35s Anthropic (see audit.functions.ts), leaving headroom
      // under the 60s ceiling for the credit-check DB calls + JSON parsing.
      // All TanStack Start server functions share the /_serverFn base path, so
      // this one rule covers all of them. 60s is the max on Vercel's free
      // Hobby plan (Pro+ allows up to 300s/5min).
      functionRules: {
        "/_serverFn/**": { maxDuration: 60 },
      },
    },
  },
});
