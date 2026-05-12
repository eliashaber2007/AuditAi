import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createCheckout, PRICE_PACKS } from "@/lib/credits.functions";
import { useAuth } from "@/hooks/use-auth";
import { UserMenu } from "@/components/UserMenu";

export const Route = createFileRoute("/pricing")({
  validateSearch: (s: Record<string, unknown>) => ({
    msg: typeof s.msg === "string" ? s.msg : undefined,
  }),
  head: () => ({ meta: [{ title: "Pricing — Audit.ai" }] }),
  component: PricingPage,
});

const PACKS = [
  { key: "starter", ...PRICE_PACKS.starter },
  { key: "pack5", ...PRICE_PACKS.pack5, popular: true },
  { key: "pack20", ...PRICE_PACKS.pack20 },
];

function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { msg } = Route.useSearch();
  const checkoutFn = useServerFn(createCheckout);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  const buy = async (key: string) => {
    setLoadingKey(key);
    try {
      const { url } = await checkoutFn({ data: { packKey: key, origin: window.location.origin } });
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e?.message ?? "Checkout failed");
      setLoadingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="text-sm font-semibold">Audit.ai</Link>
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Buy credits</h1>
        <p className="mt-2 text-sm text-neutral-600">One credit = one audit.</p>
        {msg && (
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {msg}
          </div>
        )}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PACKS.map((p) => (
            <div
              key={p.key}
              className={`rounded-lg border p-6 ${p.popular ? "border-neutral-900" : "border-neutral-200"}`}
            >
              {p.popular && (
                <div className="mb-2 inline-block rounded bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
                  Popular
                </div>
              )}
              <div className="text-lg font-semibold">{p.label}</div>
              <div className="mt-2 text-3xl font-bold tabular-nums">{p.price}</div>
              <div className="mt-1 text-xs text-neutral-500">
                {p.credits === 1 ? "1 credit" : `${p.credits} credits`}
              </div>
              <button
                onClick={() => buy(p.key)}
                disabled={loadingKey !== null}
                className="mt-6 w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
              >
                {loadingKey === p.key ? "Redirecting…" : "Buy"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
