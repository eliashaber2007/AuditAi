import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type Report, type Severity } from "@/lib/qa-storage";
import { exportReportToPdf } from "@/lib/pdf-export";
import { UserMenu } from "@/components/UserMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/results/$id")({
  head: () => ({ meta: [{ title: "Audit results — Audit.ai" }] }),
  component: ResultsPage,
});

const SEVERITY_BADGE: Record<Severity, { badge: string; dot: string }> = {
  critical: { badge: "bg-red-100 text-red-800", dot: "bg-red-500" },
  medium: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  minor: { badge: "bg-green-100 text-green-800", dot: "bg-green-500" },
};

type Filter = "all" | Severity;

function ResultsPage() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "missing">("loading");
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("audits").select("report").eq("id", id).maybeSingle();
      if (cancelled) return;
      if (error || !data) { setLoadState("missing"); return; }
      setReport(data.report as unknown as Report);
      setLoadState("ready");
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleCopyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loadState === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500">{t("results.loading")}</div>;
  }

  if (loadState === "missing" || !report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="text-2xl font-semibold">{t("results.notFound")}</h1>
        <p className="mt-2 text-sm text-neutral-600">{t("results.notFoundSub")}</p>
        <Link to="/audit" className="mt-6 inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          {t("results.runNew")}
        </Link>
      </div>
    );
  }

  const counts = {
    critical: report.issues.filter((i) => i.severity === "critical").length,
    medium: report.issues.filter((i) => i.severity === "medium").length,
    minor: report.issues.filter((i) => i.severity === "minor").length,
  };

  const filtered = filter === "all" ? report.issues : report.issues.filter((i) => i.severity === filter);

  const filterLabel = (f: Filter) =>
    f === "all" ? t("results.filterAll")
    : f === "critical" ? t("results.filterCritical")
    : f === "medium" ? t("results.filterMedium")
    : t("results.filterMinor");

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4 print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="text-sm font-semibold">Audit.ai</Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {report.meta?.projectName || t("results.defaultTitle")}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-neutral-600">{report.summary}</p>
        </div>

        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 print:hidden">
          {t("results.englishNote")}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 print:hidden">
          <div className="flex-1 text-sm text-blue-900">
            <strong className="font-semibold">{t("results.copyHint")}</strong>{t("results.copyHintBody")}
          </div>
          <button onClick={handleCopyReport}
            className="shrink-0 rounded-md border border-blue-300 bg-white p-2 text-blue-700 transition-colors hover:bg-blue-100"
            aria-label={t("results.copyAria")} title={t("results.copyTitle")}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label={t("severity.critical")} value={counts.critical} tone="red" />
          <MetricCard label={t("severity.medium")} value={counts.medium} tone="amber" />
          <MetricCard label={t("severity.minor")} value={counts.minor} tone="green" />
          <MetricCard label={t("severity.score")} value={`${report.score}/100`} tone="neutral" />
        </div>

        <div className="mt-8 flex flex-wrap gap-2 print:hidden">
          {(["all", "critical", "medium", "minor"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filter === f ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}>
              {filterLabel(f)}
            </button>
          ))}
        </div>

        <ul className="mt-6 space-y-3">
          {filtered.map((issue) => {
            const isOpen = expanded[issue.id] ?? false;
            const sev = SEVERITY_BADGE[issue.severity];
            return (
              <li key={issue.id} className="rounded-lg border border-neutral-200 bg-white">
                <button onClick={() => setExpanded((p) => ({ ...p, [issue.id]: !isOpen }))}
                  className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left hover:bg-neutral-50">
                  <div className="flex flex-1 items-center gap-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${sev.badge}`}>
                      {t(`severity.${issue.severity}`)}
                    </span>
                    <span className="font-medium">{issue.title}</span>
                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{issue.category}</span>
                  </div>
                  <span className="text-neutral-400">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="space-y-3 border-t border-neutral-100 px-4 py-4 text-sm">
                    <p className="text-neutral-700">{issue.description}</p>
                    <div className="rounded-md border-l-4 border-green-500 bg-green-50 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-800">{t("results.suggestedFix")}</p>
                      <p className="mt-1 text-neutral-800">{issue.fix}</p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="rounded-lg border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
              {t("results.noIssues")}
            </li>
          )}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-neutral-100 pt-6 print:hidden">
          <button onClick={() => exportReportToPdf(report)} className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
            {t("results.exportPdf")}
          </button>
          <button onClick={() => navigate({ to: "/audit" })} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            {t("results.runAnother")}
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string | number; tone: "red" | "amber" | "green" | "neutral" }) {
  const tones: Record<typeof tone, string> = {
    red: "text-red-700", amber: "text-amber-700", green: "text-green-700", neutral: "text-neutral-900",
  };
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
