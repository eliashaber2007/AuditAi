import { createFileRoute, Link } from "@tanstack/react-router";
import { UserMenu } from "@/components/UserMenu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Audit.ai — AI-powered product audits" },
      {
        name: "description",
        content:
          "Find every flaw before your users do. AI-powered QA audits in minutes.",
      },
      { property: "og:title", content: "Audit.ai" },
      {
        property: "og:description",
        content: "Find every flaw before your users do.",
      },
    ],
  }),
  component: Index,
});

const STEPS = [
  {
    n: "1",
    title: "Describe your product",
    body: "Explain your stack, features, and target users.",
  },
  {
    n: "2",
    title: "Choose what to test",
    body: "Select from 8 testing categories.",
  },
  {
    n: "3",
    title: "Get your report",
    body: "Receive a prioritised list of issues with fix suggestions.",
  },
];

const CATEGORIES: { name: string; desc: string }[] = [
  { name: "UI & visual design", desc: "Spacing, hierarchy, contrast, polish." },
  { name: "User flows end-to-end", desc: "Friction points across complete journeys." },
  { name: "Copy & microcopy", desc: "Clarity, tone, error messages, CTAs." },
  { name: "Mobile responsiveness", desc: "Layout, touch targets, viewport handling." },
  { name: "Payment & transaction logic", desc: "Edge cases, failed payments, refunds." },
  { name: "Security surface", desc: "Common vulnerabilities and misconfigurations." },
  { name: "Competitor comparison", desc: "Where you trail or lead similar products." },
  { name: "Onboarding experience", desc: "First-run, empty states, time-to-value." },
];

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="text-[22px] font-bold tracking-tight">
            Audit.ai
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
              Pricing
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-24 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              AI-powered QA analysis
            </div>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">Audit.ai</h1>
            <p className="mt-5 text-lg text-neutral-600 sm:text-xl">
              Find every flaw before your users do.
            </p>
            <div className="mt-10">
              <Link
                to="/audit"
                className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Run your first audit →
              </Link>
              <p className="mt-3 text-xs text-neutral-500">1 free audit on signup. No card required.</p>
            </div>
          </div>
        </section>

        {/* Sample score card */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
              A sample report
            </p>
            <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-sm text-neutral-500">Acme App</div>
                  <div className="mt-1 text-base font-semibold">Overall audit score</div>
                  <p className="mt-2 max-w-sm text-sm text-neutral-600">
                    Solid foundations with several friction points in checkout and onboarding.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold tabular-nums">71</div>
                  <div className="text-xs uppercase tracking-wide text-neutral-400">/ 100</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-md bg-red-50 p-3 text-center">
                  <div className="text-2xl font-bold text-red-700 tabular-nums">3</div>
                  <div className="text-[11px] uppercase tracking-wide text-red-700/80">Critical</div>
                </div>
                <div className="rounded-md bg-amber-50 p-3 text-center">
                  <div className="text-2xl font-bold text-amber-700 tabular-nums">7</div>
                  <div className="text-[11px] uppercase tracking-wide text-amber-700/80">Medium</div>
                </div>
                <div className="rounded-md bg-neutral-100 p-3 text-center">
                  <div className="text-2xl font-bold text-neutral-700 tabular-nums">9</div>
                  <div className="text-[11px] uppercase tracking-wide text-neutral-500">Minor</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-neutral-100 bg-neutral-50/40 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight">How it works</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                    {s.n}
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we test */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight">What we test</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-neutral-600">
              Eight expert testers, one report.
            </p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {CATEGORIES.map((c) => (
                <div
                  key={c.name}
                  className="rounded-lg border border-neutral-200 p-5"
                >
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="mt-1 text-sm text-neutral-600">{c.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                to="/audit"
                className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Run your first audit →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-100 px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm font-semibold">Audit.ai</div>
          <nav className="flex items-center gap-6 text-sm text-neutral-600">
            <Link to="/pricing" className="hover:text-neutral-900">Pricing</Link>
            <Link to="/auth" className="hover:text-neutral-900">Sign in</Link>
          </nav>
          <div className="text-xs text-neutral-400">© {new Date().getFullYear()} Audit.ai</div>
        </div>
      </footer>
    </div>
  );
}
