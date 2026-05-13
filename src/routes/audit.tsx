import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { runAudit } from "@/lib/audit.functions";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { UserMenu } from "@/components/UserMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";
import { History } from "lucide-react";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "New audit — Audit.ai" },
      { name: "description", content: "Describe your product and generate a full AI-powered audit report in minutes." },
      { property: "og:title", content: "New audit — Audit.ai" },
      { property: "og:description", content: "Describe your product and generate a full AI-powered audit report in minutes." },
    ],
  }),
  component: AuditPage,
});

// English values sent to backend (system prompt is always English).
const DEFAULT_CATEGORIES = [
  "UI & visual design",
  "User flows end-to-end",
  "Copy & microcopy",
  "Mobile responsiveness",
  "Payment & transaction logic",
  "Security surface",
  "Competitor comparison",
  "Onboarding experience",
];

function AuditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { credits, refresh: refreshCredits } = useCredits();
  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [description, setDescription] = useState("");
  const [targetUsers, setTargetUsers] = useState("");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [customInstructions, setCustomInstructions] = useState<string[]>([]);
  const [instructionInput, setInstructionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const runAuditFn = useServerFn(runAudit);

  const STATUS_MESSAGES = t("audit.statuses", { returnObjects: true }) as string[];
  const CATEGORY_LABELS: Record<string, string> = {
    "UI & visual design": t("categories.ui"),
    "User flows end-to-end": t("categories.flowsLong"),
    "Copy & microcopy": t("categories.copy"),
    "Mobile responsiveness": t("categories.mobile"),
    "Payment & transaction logic": t("categories.paymentLong"),
    "Security surface": t("categories.security"),
    "Competitor comparison": t("categories.competitor"),
    "Onboarding experience": t("categories.onboarding"),
  };

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!loading) {
      if (progress > 0 && progress < 100) setProgress(100);
      return;
    }
    setProgress(0); setStatusIdx(0);
    const start = Date.now();
    const DURATION = 45000;
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(95, (elapsed / DURATION) * 95));
    }, 100);
    const statusTimer = setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 3500);
    return () => { clearInterval(progressTimer); clearInterval(statusTimer); };
  }, [loading]);

  const toggleCategory = (c: string) => {
    setCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const addInstruction = () => {
    const v = instructionInput.trim();
    if (!v) return;
    setCustomInstructions((prev) => [...prev, v]);
    setInstructionInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) { toast.error(t("audit.fillName")); return; }
    if (description.trim().length < 200) { toast.error(t("audit.addMoreDetail")); return; }
    if ((credits ?? 0) <= 0) {
      navigate({ to: "/pricing", search: { msg: t("audit.noCredits") } });
      return;
    }
    setLoading(true); setErrorText(null);
    try {
      const { id } = await runAuditFn({
        data: { projectName, projectUrl, description, targetUsers, categories, customInstructions },
      });
      navigate({ to: "/results/$id", params: { id } });
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : String(err);
      if (msg.includes("NO_CREDITS")) {
        refreshCredits();
        navigate({ to: "/pricing", search: { msg: t("audit.noCredits") } });
        return;
      }
      setErrorText(msg);
      toast.error(t("audit.failed"));
      setLoading(false);
    } finally { refreshCredits(); }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="text-[22px] font-bold tracking-tight">Audit.ai</Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/history" aria-label={t("nav.myAudits")}
              className="hidden md:inline text-sm font-medium text-neutral-700 hover:text-neutral-900">
              {t("nav.myAudits")}
            </Link>
            <Link to="/history" aria-label={t("nav.myAudits")}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100">
              <History className="h-5 w-5" />
            </Link>
            <Link to="/pricing"
              className="hidden md:inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium tabular-nums text-neutral-700 hover:bg-neutral-200">
              {t("common.credits", { count: credits ?? 0 })}
            </Link>
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-center text-3xl font-semibold tracking-tight">{t("audit.title")}</h1>
        <p className="mt-2 text-center text-sm text-neutral-600">{t("audit.sub")}</p>

        <form onSubmit={handleSubmit} className="mt-12 space-y-12">
          <section className="space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{t("audit.projectInfo")}</h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("audit.projectName")}</label>
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                placeholder={t("audit.projectNamePh")} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("audit.projectUrl")}</label>
              <input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                placeholder={t("audit.projectUrlPh")} />
            </div>
            <div>
              <label className="mb-1.5 flex items-center justify-between text-sm font-medium">
                <span>{t("audit.shortDesc")} <span className="text-neutral-400">{t("audit.minLabel")}</span></span>
                <span className={`text-xs font-normal tabular-nums ${
                  description.length > 0 && description.length < 200 ? "text-red-600" : "text-neutral-400"
                }`}>{description.length}/500</span>
              </label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 500))} rows={6}
                className="w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                placeholder={t("audit.descPh")} />
              <p className="mt-1.5 text-xs text-neutral-500">{t("audit.descHelp")}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("audit.targetUsers")}</label>
              <input value={targetUsers} onChange={(e) => setTargetUsers(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                placeholder={t("audit.targetUsersPh")} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{t("audit.whatToTest")}</h2>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DEFAULT_CATEGORIES.map((c) => (
                <label key={c} className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50">
                  <input type="checkbox" checked={categories.includes(c)} onChange={() => toggleCategory(c)} className="h-4 w-4 rounded border-neutral-300" />
                  {CATEGORY_LABELS[c] ?? c}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{t("audit.customInstructions")}</h2>
            <div className="mt-4 flex gap-2">
              <input value={instructionInput} onChange={(e) => setInstructionInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInstruction(); } }}
                placeholder={t("audit.instructionPh")}
                className="flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400" />
              <button type="button" onClick={addInstruction} className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
                {t("audit.add")}
              </button>
            </div>
            {customInstructions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {customInstructions.map((ins, i) => (
                  <span key={i} className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                    {ins}
                    <button type="button" onClick={() => setCustomInstructions((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-neutral-400 hover:text-neutral-700" aria-label={t("audit.remove")}>×</button>
                  </span>
                ))}
              </div>
            )}
          </section>

          <div className="border-t border-neutral-100 pt-8">
            {loading ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-medium text-neutral-700 transition-opacity duration-300">
                    {STATUS_MESSAGES[statusIdx]}
                  </div>
                  <div className="font-mono text-2xl font-semibold tabular-nums text-neutral-900">{Math.floor(progress)}%</div>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div className="h-full rounded-full bg-neutral-900 transition-all duration-200 ease-out" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-4 text-xs text-neutral-500">{t("audit.thinkingNote")}</p>
              </div>
            ) : (
              <button type="submit" className="inline-flex items-center justify-center gap-3 rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
                {t("audit.run")}
              </button>
            )}
            {errorText && (
              <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-800">{t("audit.errorResponse")}</div>
                <pre className="whitespace-pre-wrap break-words font-mono text-xs text-red-900">{errorText}</pre>
              </div>
            )}
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
