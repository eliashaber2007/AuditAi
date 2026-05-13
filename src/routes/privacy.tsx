import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Audit.ai" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
        <h1 className="text-3xl font-semibold tracking-tight">{t("privacy.title")}</h1>
        <p className="mt-2 text-sm text-neutral-500">{t("privacy.lastUpdated", { date })}</p>
        <div className="prose prose-neutral mt-8 max-w-none text-sm leading-relaxed text-neutral-700">
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">{t("privacy.h1")}</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>{t("privacy.l1a")}</li><li>{t("privacy.l1b")}</li><li>{t("privacy.l1c")}</li><li>{t("privacy.l1d")}</li>
          </ul>
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">{t("privacy.h2")}</h2>
          <p>{t("privacy.p2")}</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>{t("privacy.l2a")}</li><li>{t("privacy.l2b")}</li><li>{t("privacy.l2c")}</li>
          </ul>
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">{t("privacy.h3")}</h2>
          <p>{t("privacy.p3Pre")}<a href="mailto:support@tryauditai.com" className="text-neutral-900 underline">support@tryauditai.com</a>.</p>
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">{t("privacy.h4")}</h2>
          <p>{t("privacy.p4")}</p>
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">{t("privacy.h5")}</h2>
          <p>{t("privacy.p5")}</p>
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">{t("privacy.h6")}</h2>
          <p>{t("privacy.p6Pre")}<a href="mailto:support@tryauditai.com" className="text-neutral-900 underline">support@tryauditai.com</a>.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
