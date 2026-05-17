import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Audit.ai" },
      { name: "description", content: "Legal information for Audit.ai — publisher, hosting, and contact details." },
      { property: "og:title", content: "Mentions légales — Audit.ai" },
      { property: "og:description", content: "Legal information for Audit.ai — publisher, hosting, and contact details." },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="text-[22px] font-bold tracking-tight">
            Audit<span className="text-emerald-500">.ai</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">{t("legal.title")}</h1>
        <div className="prose prose-neutral mt-8 max-w-none text-sm leading-relaxed text-neutral-700">
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">{t("legal.publisher")}</h2>
          <p>{t("legal.publisherV")}</p>
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">{t("legal.director")}</h2>
          <p>{t("legal.directorV")}</p>
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">{t("legal.hosting")}</h2>
          <p>{t("legal.hostingV")}</p>
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">{t("legal.contact")}</h2>
          <p><a href="mailto:support@tryauditai.com" className="text-neutral-900 underline">support@tryauditai.com</a></p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
