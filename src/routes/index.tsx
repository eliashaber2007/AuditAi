import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { UserMenu } from "@/components/UserMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";
import {
  Palette,
  Route as RouteIcon,
  Type,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Swords,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Audit.ai — Find every flaw before your users do" },
      { name: "description", content: "AI-powered product analysis. Describe your product, get a full audit report in minutes. Used by founders and indie developers pre-launch." },
      { property: "og:title", content: "Audit.ai — Find every flaw before your users do" },
      { property: "og:description", content: "AI-powered product analysis. Describe your product, get a full audit report in minutes. Used by founders and indie developers pre-launch." },
      { property: "og:url", content: "https://tryauditai.com" },
    ],
  }),
  component: Index,
});

const SEVERITY_STYLES = {
  critical: "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/30",
  medium: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30",
  minor: "bg-white/5 text-neutral-300 ring-1 ring-inset ring-white/10",
} as const;

function Index() {
  const { t } = useTranslation();

  const STEPS = [
    { n: "01", title: t("landing.step1Title"), body: t("landing.step1Body") },
    { n: "02", title: t("landing.step2Title"), body: t("landing.step2Body") },
    { n: "03", title: t("landing.step3Title"), body: t("landing.step3Body") },
  ];

  const CATEGORIES = [
    { name: t("categories.ui"), icon: Palette },
    { name: t("categories.flows"), icon: RouteIcon },
    { name: t("categories.copy"), icon: Type },
    { name: t("categories.mobile"), icon: Smartphone },
    { name: t("categories.payment"), icon: CreditCard },
    { name: t("categories.security"), icon: ShieldCheck },
    { name: t("categories.competitor"), icon: Swords },
    { name: t("categories.onboarding"), icon: Sparkles },
  ];

  const SAMPLE_ISSUES: { severity: "critical" | "medium" | "minor"; category: string; title: string; detail: string; fix: string }[] = [
    { severity: "critical", category: t("sampleIssues.i1Cat"), title: t("sampleIssues.i1Title"), detail: t("sampleIssues.i1Detail"), fix: t("sampleIssues.i1Fix") },
    { severity: "critical", category: t("sampleIssues.i2Cat"), title: t("sampleIssues.i2Title"), detail: t("sampleIssues.i2Detail"), fix: t("sampleIssues.i2Fix") },
    { severity: "medium", category: t("sampleIssues.i3Cat"), title: t("sampleIssues.i3Title"), detail: t("sampleIssues.i3Detail"), fix: t("sampleIssues.i3Fix") },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 antialiased">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 40%, transparent 75%)",
        }}
      />

      <header className="sticky top-0 z-20 border-b border-white/5 bg-neutral-950/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="text-[22px] font-bold tracking-tight">
            Audit<span className="text-emerald-400">.ai</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/pricing"
              className="text-sm font-medium text-neutral-400 hover:text-white"
            >
              {t("nav.pricing")}
            </Link>
            <LanguageSwitcher variant="dark" />
            <UserMenu variant="dark" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative px-6 pt-12 pb-20 text-center sm:pt-16 sm:pb-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {t("landing.badge")}
            </div>
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
              {t("landing.heroLine1")} <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
                {t("landing.heroLine2")}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-neutral-400">
              {t("landing.heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center gap-3">
              <Link
                to="/audit"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_-8px_rgba(255,255,255,0.4)] transition-all hover:bg-neutral-200"
              >
                {t("landing.ctaRunFirst")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("landing.howTitle")}
              </h2>
              <p className="mt-3 text-neutral-400">{t("landing.howSub")}</p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="font-mono text-xs text-emerald-400">{s.n}</div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-neutral-400">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("landing.whatTitle")}
              </h2>
              <p className="mt-3 text-neutral-400">{t("landing.whatSub")}</p>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CATEGORIES.map(({ name, icon: Icon }) => (
                <div
                  key={name}
                  className="group flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 ring-1 ring-inset ring-white/10">
                    <Icon className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-medium text-white">{name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("landing.sampleTitle")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-neutral-400">{t("landing.sampleSub")}</p>
            </div>

            <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
              <div className="flex items-start justify-between gap-6 p-8">
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-500">
                    {t("landing.sampleProject")}
                  </div>
                  <div className="mt-1 text-base font-semibold text-white">
                    {t("landing.sampleOverall")}
                  </div>
                  <p className="mt-2 max-w-sm text-sm text-neutral-400">
                    {t("landing.sampleSummary")}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-5xl font-bold tabular-nums text-transparent">
                    71
                  </div>
                  <div className="text-xs uppercase tracking-wide text-neutral-500">
                    {t("severity.outOf100")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 px-8">
                <div className="rounded-md bg-red-500/10 p-3 text-center ring-1 ring-inset ring-red-500/20">
                  <div className="text-2xl font-bold tabular-nums text-red-300">3</div>
                  <div className="text-[11px] uppercase tracking-wide text-red-300/80">{t("severity.critical")}</div>
                </div>
                <div className="rounded-md bg-amber-500/10 p-3 text-center ring-1 ring-inset ring-amber-500/20">
                  <div className="text-2xl font-bold tabular-nums text-amber-300">7</div>
                  <div className="text-[11px] uppercase tracking-wide text-amber-300/80">{t("severity.medium")}</div>
                </div>
                <div className="rounded-md bg-white/5 p-3 text-center ring-1 ring-inset ring-white/10">
                  <div className="text-2xl font-bold tabular-nums text-neutral-200">9</div>
                  <div className="text-[11px] uppercase tracking-wide text-neutral-400">{t("severity.minor")}</div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10">
                <div className="px-8 py-5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {t("landing.topIssues")}
                </div>
                <ul className="divide-y divide-white/10">
                  {SAMPLE_ISSUES.map((issue, i) => (
                    <li key={i} className="px-8 py-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${SEVERITY_STYLES[issue.severity]}`}
                        >
                          {t(`severity.${issue.severity}`)}
                        </span>
                        <span className="text-xs text-neutral-500">{issue.category}</span>
                      </div>
                      <h4 className="mt-2 text-sm font-semibold text-white">{issue.title}</h4>
                      <p className="mt-2 text-sm text-neutral-400">{issue.detail}</p>
                      <div className="mt-3 rounded-md border border-white/10 bg-white/[0.02] p-3 text-sm text-neutral-300">
                        <span className="font-semibold text-emerald-400">{t("landing.suggestedFix")} </span>
                        {issue.fix}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 px-6 py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              {t("landing.finalLine1")}{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                {t("landing.finalLine2")}
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-neutral-400">{t("landing.finalSub")}</p>
            <div className="mt-10 flex flex-col items-center gap-3">
              <Link
                to="/audit"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_-8px_rgba(255,255,255,0.4)] transition-all hover:bg-neutral-200"
              >
                {t("landing.ctaRunFirst")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter variant="dark" />
    </div>
  );
}
