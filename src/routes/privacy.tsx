import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Audit.ai" },
      { name: "description", content: "Privacy Policy for Audit.ai (RGPD compliant)." },
      { property: "og:title", content: "Privacy Policy — Audit.ai" },
      { property: "og:description", content: "Privacy Policy for Audit.ai (RGPD compliant)." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-neutral-500">RGPD compliant — last updated: {new Date().toLocaleDateString("en-GB")}</p>

        <div className="prose prose-neutral mt-8 max-w-none text-sm leading-relaxed text-neutral-700">
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">1. Data we collect</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Email address</li>
            <li>Password (stored as a salted hash, never in plain text)</li>
            <li>Audit submissions (the product descriptions you provide)</li>
            <li>Payment data (processed by Stripe, not stored by us)</li>
          </ul>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">2. Data processors</h2>
          <p>We share the minimum necessary data with the following sub-processors:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li><strong>Supabase</strong> — database hosting (EU region)</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Anthropic</strong> — AI processing of your audit descriptions</li>
          </ul>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">3. Your rights</h2>
          <p>
            Under the RGPD you have the right to access, correct, or delete your data at any
            time. To exercise these rights, contact{" "}
            <a href="mailto:support@tryauditai.com" className="text-neutral-900 underline">
              support@tryauditai.com
            </a>
            .
          </p>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">4. Cookies</h2>
          <p>
            We do not use any cookies beyond what is strictly necessary for session
            authentication. No tracking or advertising cookies are set.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">5. Data retention</h2>
          <p>
            Audit reports are retained for 12 months from creation, after which they are
            automatically deleted. Account data is retained until you request deletion.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">6. Contact</h2>
          <p>
            For any privacy-related question, contact{" "}
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
