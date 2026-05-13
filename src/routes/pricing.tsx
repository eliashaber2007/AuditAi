import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createCheckout, PRICE_PACKS } from "@/lib/credits.functions";
import { useAuth } from "@/hooks/use-auth";
import { UserMenu } from "@/components/UserMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/pricing")({
  validateSearch: (s: Record<string, unknown>) => ({
    msg: typeof s.msg === "string" ? s.msg : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pricing — Audit.ai" },
      { name: "description", content: "Simple credit-based pricing. One credit = one full AI product audit. From €1.25 per audit." },
      { property: "og:title", content: "Pricing — Audit.ai" },
      { property: "og:description", content: "Simple credit-based pricing. One credit = one full AI product audit. From €1.25 per audit." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { msg } = Route.useSearch();
  const checkoutFn = useServerFn(createCheckout);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [authLoading, user, navigate]);

  const PACKS = [
    { key: "starter", popular: false, perAudit: t("pricing.perAudit", { price: "€2.00" }), label: t("pricing.packStarter"), price: PRICE_PACKS.starter.price },
    { key: "pack5", popular: true, perAudit: t("pricing.perAudit", { price: "€1.60" }), label: t("pricing.pack5"), price: PRICE_PACKS.pack5.price },
    { key: "pack20", popular: false, perAudit: t("pricing.perAudit", { price: "€1.25" }), label: t("pricing.pack20"), price: PRICE_PACKS.pack20.price },
  ];

  const buy = async (key: string) => {
    setLoadingKey(key);
    try {
      const { url } = await checkoutFn({ data: { packKey: key, origin: window.location.origin } });
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e?.message ?? t("pricing.checkoutFailed"));
      setLoadingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="text-[22px] font-bold tracking-tight">Audit.ai</Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">{t("pricing.title")}</h1>
        <p className="mt-2 text-sm text-neutral-600">{t("pricing.sub")}</p>
        {msg && (
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{msg}</div>
        )}
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {PACKS.map((p) => (
            <div key={p.key} className={`flex flex-col rounded-xl border p-8 ${p.popular ? "border-neutral-900 shadow-sm" : "border-neutral-200"}`}>
              {p.popular && (
                <div className="mb-3 inline-block self-start rounded bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
                  {t("pricing.popular")}
                </div>
              )}
              <div className="text-lg font-semibold">{p.label}</div>
              <div className="mt-4 text-4xl font-bold tabular-nums">{p.price}</div>
              <div className="mt-2 text-xs text-neutral-500">{p.perAudit}</div>
              <button onClick={() => buy(p.key)} disabled={loadingKey !== null}
                className="mt-8 w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60">
                {loadingKey === p.key ? t("pricing.redirecting") : t("pricing.buy")}
              </button>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
