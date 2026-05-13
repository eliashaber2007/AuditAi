import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { listMyAudits, type AuditSummary } from "@/lib/history.functions";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { UserMenu } from "@/components/UserMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "My audits — Audit.ai" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { credits } = useCredits();
  const navigate = useNavigate();
  const fn = useServerFn(listMyAudits);
  const [audits, setAudits] = useState<AuditSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    fn({}).then(setAudits).catch((e) => setError(e?.message ?? t("history.loadFailed")));
  }, [user, fn, t]);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link to="/" className="text-[22px] font-bold tracking-tight">Audit.ai</Link>
          <div className="flex items-center gap-3">
            <Link to="/history" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">{t("nav.myAudits")}</Link>
            <Link to="/pricing" className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium tabular-nums text-neutral-700 hover:bg-neutral-200">
              {t("common.credits", { count: credits ?? 0 })}
            </Link>
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">{t("history.title")}</h1>
          <Link to="/audit" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            {t("history.newAudit")}
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        {audits === null && !error ? (
          <div className="mt-10 text-sm text-neutral-500">{t("common.loading")}</div>
        ) : audits && audits.length === 0 ? (
          <div className="mt-12 rounded-lg border border-dashed border-neutral-200 p-10 text-center">
            <p className="text-sm text-neutral-600">{t("history.empty")}</p>
            <Link to="/audit" className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              {t("history.runFirst")}
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {audits?.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-5 transition-colors hover:border-neutral-300">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold">{a.project_name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                    <span>{new Date(a.created_at).toLocaleDateString()}</span>
                    <span>{t("history.issues", { count: a.issueCount })}</span>
                  </div>
                </div>
                <div className="ml-6 flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold tabular-nums">{a.score}</div>
                    <div className="text-[10px] uppercase tracking-wide text-neutral-400">{t("severity.outOf100")}</div>
                  </div>
                  <Link to="/results/$id" params={{ id: a.id }} className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50">
                    {t("history.viewReport")}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
