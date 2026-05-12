import { createFileRoute, Link } from "@tanstack/react-router";
import { UserMenu } from "@/components/UserMenu";
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
    n: "01",
    title: "Describe your product",
    body: "Explain your stack, features, and target users.",
  },
  {
    n: "02",
    title: "Choose what to test",
    body: "Pick from 8 expert testing categories.",
  },
  {
    n: "03",
    title: "Get your report",
    body: "A prioritised list of issues with fix suggestions.",
  },
];

const CATEGORIES = [
  { name: "UI & visual design", icon: Palette },
  { name: "User flows", icon: RouteIcon },
  { name: "Copy & microcopy", icon: Type },
  { name: "Mobile responsiveness", icon: Smartphone },
  { name: "Payment logic", icon: CreditCard },
  { name: "Security surface", icon: ShieldCheck },
  { name: "Competitor comparison", icon: Swords },
  { name: "Onboarding experience", icon: Sparkles },
];

const SAMPLE_ISSUES: {
  severity: "critical" | "medium" | "minor";
  category: string;
  title: string;
  detail: string;
  fix: string;
}[] = [
  {
    severity: "critical",
    category: "Payment & transaction logic",
    title: "Failed Stripe payments leave users on a blank screen",
    detail:
      "When a card is declined, the spinner disappears and the page reverts to the cart with no error state. Users retry blindly or abandon.",
    fix: "Catch the Stripe error from confirmCardPayment and surface a contextual message with retry and switch-method CTAs.",
  },
  {
    severity: "critical",
    category: "Security surface",
    title: "Anon key used for privileged writes",
    detail:
      "The /invite endpoint writes to the members table from the browser without an RLS policy. Anyone can add themselves to any pot.",
    fix: "Move the insert behind a server function and add an RLS policy: insert allowed only when auth.uid() = inviter_id.",
  },
  {
    severity: "medium",
    category: "Onboarding",
    title: "First-run empty state has no guidance",
    detail:
      "After signup, users land on an empty dashboard with no explanation of what a 'pot' is or how to create one.",
    fix: "Add an empty-state card with a one-line explanation, an example screenshot, and a 'Create your first pot' button.",
  },
];

const SEVERITY_STYLES: Record<"critical" | "medium" | "minor", string> = {
  critical: "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/30",
  medium: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30",
  minor: "bg-white/5 text-neutral-300 ring-1 ring-inset ring-white/10",
};

const LOGOS = ["Northwind", "Acme Labs", "Helios", "Lumen", "Foundry", "Parallax"];

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 antialiased">
      {/* Background grid */}
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
          <div className="flex items-center gap-5">
            <Link
              to="/pricing"
              className="text-sm font-medium text-neutral-400 hover:text-white"
            >
              Pricing
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative px-6 pt-28 pb-24 text-center sm:pt-36 sm:pb-32">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              AI-powered QA analysis
            </div>
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
              Find every flaw <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
                before your users do.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-neutral-400">
              Describe your product, get a forensic audit of UX, payments,
              security, and more — in minutes.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3">
              <Link
                to="/audit"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_-8px_rgba(255,255,255,0.4)] transition-all hover:bg-neutral-200"
              >
                Run your first audit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="text-xs text-neutral-500">
                1 free audit on signup. No card required.
              </p>
            </div>
          </div>
        </section>

        {/* Logos row */}
        <section className="border-t border-white/5 px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
              Trusted by builders shipping fast
            </p>
            <div className="mt-8 grid grid-cols-3 items-center justify-items-center gap-x-8 gap-y-6 sm:grid-cols-6">
              {LOGOS.map((l) => (
                <div
                  key={l}
                  className="text-base font-semibold tracking-tight text-neutral-600 transition-colors hover:text-neutral-400"
                >
                  {l}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                How it works
              </h2>
              <p className="mt-3 text-neutral-400">
                From description to actionable report in three steps.
              </p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="font-mono text-xs text-emerald-400">
                    {s.n}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-400">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we test */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                What we test
              </h2>
              <p className="mt-3 text-neutral-400">
                Eight expert testers, one report.
              </p>
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

        {/* Sample report */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Here's what a real report looks like
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-neutral-400">
                Every audit ships with a prioritised list of issues and concrete
                fixes.
              </p>
            </div>

            <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
              <div className="flex items-start justify-between gap-6 p-8">
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-500">
                    Acme App
                  </div>
                  <div className="mt-1 text-base font-semibold text-white">
                    Overall audit score
                  </div>
                  <p className="mt-2 max-w-sm text-sm text-neutral-400">
                    Solid foundations with friction points in checkout and
                    onboarding.
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-5xl font-bold tabular-nums text-transparent">
                    71
                  </div>
                  <div className="text-xs uppercase tracking-wide text-neutral-500">
                    / 100
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 px-8">
                <div className="rounded-md bg-red-500/10 p-3 text-center ring-1 ring-inset ring-red-500/20">
                  <div className="text-2xl font-bold tabular-nums text-red-300">
                    3
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-red-300/80">
                    Critical
                  </div>
                </div>
                <div className="rounded-md bg-amber-500/10 p-3 text-center ring-1 ring-inset ring-amber-500/20">
                  <div className="text-2xl font-bold tabular-nums text-amber-300">
                    7
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-amber-300/80">
                    Medium
                  </div>
                </div>
                <div className="rounded-md bg-white/5 p-3 text-center ring-1 ring-inset ring-white/10">
                  <div className="text-2xl font-bold tabular-nums text-neutral-200">
                    9
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-neutral-400">
                    Minor
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10">
                <div className="px-8 py-5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Top issues
                </div>
                <ul className="divide-y divide-white/10">
                  {SAMPLE_ISSUES.map((issue, i) => (
                    <li key={i} className="px-8 py-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${SEVERITY_STYLES[issue.severity]}`}
                        >
                          {issue.severity}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {issue.category}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-semibold text-white">
                        {issue.title}
                      </h4>
                      <p className="mt-2 text-sm text-neutral-400">
                        {issue.detail}
                      </p>
                      <div className="mt-3 rounded-md border border-white/10 bg-white/[0.02] p-3 text-sm text-neutral-300">
                        <span className="font-semibold text-emerald-400">
                          Suggested fix:{" "}
                        </span>
                        {issue.fix}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-white/5 px-6 py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Ready to ship with{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                confidence?
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-neutral-400">
              Catch the bugs, friction, and security holes before your users
              ever see them.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3">
              <Link
                to="/audit"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_-8px_rgba(255,255,255,0.4)] transition-all hover:bg-neutral-200"
              >
                Run your first audit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="text-xs text-neutral-500">
                1 free audit on signup.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm font-semibold">
            Audit<span className="text-emerald-400">.ai</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-neutral-400">
            <Link to="/pricing" className="hover:text-white">
              Pricing
            </Link>
            <Link to="/auth" className="hover:text-white">
              Login
            </Link>
          </nav>
          <div className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Audit.ai
          </div>
        </div>
      </footer>
    </div>
  );
}
