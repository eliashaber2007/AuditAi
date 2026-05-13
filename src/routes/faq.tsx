import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Audit.ai" },
      { name: "description", content: "Frequently asked questions about Audit.ai." },
      { property: "og:title", content: "FAQ — Audit.ai" },
      { property: "og:description", content: "Frequently asked questions about Audit.ai." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "What is Audit.ai?",
    a: "Audit.ai is an AI-powered product analysis tool. It generates structured quality reports from your product description — it is not a substitute for real QA testing.",
  },
  {
    q: "How does it work?",
    a: "Describe your product, pick the categories you want analyzed, and get a detailed report in minutes.",
  },
  {
    q: "Are credits refundable?",
    a: "No, credits are non-refundable once purchased. But each audit costs as little as €1.25, depending on your plan.",
  },
  {
    q: "How accurate are the reports?",
    a: "Reports are based on AI reasoning, not live testing. The more detail you provide in your description, the sharper and more relevant the results.",
  },
  {
    q: "Who is this for?",
    a: "Founders, indie developers, and product managers who want a fast pre-launch sanity check on their product.",
  },
  {
    q: "Is my data safe?",
    a: "Your descriptions are sent to Anthropic for processing and are not stored beyond your generated report.",
  },
  {
    q: "What if the audit times out?",
    a: "No credit is deducted on failed audits. You can simply try again.",
  },
];

function FaqPage() {
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
        <h1 className="text-3xl font-semibold tracking-tight">Frequently asked questions</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Everything you need to know about Audit.ai.
        </p>

        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-neutral-200">
              <AccordionTrigger className="text-left text-base font-medium text-neutral-900">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-neutral-700">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <SiteFooter />
    </div>
  );
}
