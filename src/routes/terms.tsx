import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Audit.ai" },
      { name: "description", content: "Terms of Service for Audit.ai." },
      { property: "og:title", content: "Terms of Service — Audit.ai" },
      { property: "og:description", content: "Terms of Service for Audit.ai." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="text-[22px] font-bold tracking-tight">
            Audit.ai
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-neutral-500">Last updated: {new Date().toLocaleDateString("en-GB")}</p>

        <div className="prose prose-neutral mt-8 max-w-none text-sm leading-relaxed text-neutral-700">
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">1. Service description</h2>
          <p>
            Audit.ai provides AI-generated product quality analysis reports based on
            user-submitted descriptions. Reports are not a substitute for professional QA testing.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">2. Payment terms</h2>
          <p>
            Credits are non-refundable once purchased. One credit equals one audit report.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">3. Limitations</h2>
          <p>
            Audit.ai makes no guarantee of the accuracy or completeness of reports. All reports
            are AI-generated and should be reviewed by the user before being acted upon.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">4. Account termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts in cases of abuse,
            fraudulent activity, or violation of these terms.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">5. Governing law</h2>
          <p>
            These terms are governed by French law. Audit.ai is operated by Fortis Invest,
            Paris, France. Any disputes shall be subject to the jurisdiction of the courts of Paris.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">6. Contact</h2>
          <p>
            For any questions about these terms, contact{" "}
            <a href="mailto:support@tryauditai.com" className="text-neutral-900 underline">
              support@tryauditai.com
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
