import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Audit.ai" },
      { name: "description", content: "Terms of Service for Audit.ai — your rights, responsibilities, refund policy, and how we deliver AI-powered product audit reports." },
      { property: "og:title", content: "Terms of Service — Audit.ai" },
      { property: "og:description", content: "Terms of Service for Audit.ai — your rights, responsibilities, refund policy, and how we deliver AI-powered product audit reports." },
      { property: "og:url", content: "https://tryauditai.com/terms" },
    ],
    links: [
      { rel: "canonical", href: "https://tryauditai.com/terms" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t, i18n } = useTranslation();
  const date = new Date().toLocaleDateString(i18n.language);
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="text-[22px] font-bold tracking-tight">Audit.ai</Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">{t("terms.title")}</h1>
        <p className="mt-2 text-sm text-neutral-500">{t("terms.lastUpdated", { date })}</p>
        <div className="prose prose-neutral mt-8 max-w-none text-sm leading-relaxed text-neutral-700">
          {([1,2,3,4,5,6] as const).map((n) => (
            <div key={n}>
              <h2 className="mt-8 text-lg font-semibold text-neutral-900">{t(`terms.h${n}`)}</h2>
              {n === 6 ? (
                <p>
                  {t("terms.p6Pre")}
                  <a href="mailto:support@tryauditai.com" className="text-neutral-900 underline">support@tryauditai.com</a>.
                </p>
              ) : (
                <p>{t(`terms.p${n}`)}</p>
              )}
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
