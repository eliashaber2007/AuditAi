import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Audit.ai" },
      { name: "description", content: "Mentions légales du site Audit.ai." },
      { property: "og:title", content: "Mentions légales — Audit.ai" },
      { property: "og:description", content: "Mentions légales du site Audit.ai." },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
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
        <h1 className="text-3xl font-semibold tracking-tight">Mentions légales</h1>

        <div className="prose prose-neutral mt-8 max-w-none text-sm leading-relaxed text-neutral-700">
          <h2 className="mt-8 text-lg font-semibold text-neutral-900">Éditeur</h2>
          <p>Fortis Invest</p>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">Directeur de la publication</h2>
          <p>Elias Haber</p>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">Hébergement</h2>
          <p>Lovable Cloud / Cloudflare</p>

          <h2 className="mt-8 text-lg font-semibold text-neutral-900">Contact</h2>
          <p>
            <a href="mailto:support@tryauditai.com" className="text-neutral-900 underline">
              support@tryauditai.com
            </a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
