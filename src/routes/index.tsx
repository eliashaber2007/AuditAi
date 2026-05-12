import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QA Agent — AI-powered product audits" },
      {
        name: "description",
        content:
          "Describe your product. Get a full AI-powered QA audit in minutes.",
      },
      { property: "og:title", content: "QA Agent" },
      {
        property: "og:description",
        content: "Describe your product. Get a full audit in minutes.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            AI-powered product testing
          </div>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            QA Agent
          </h1>
          <p className="mt-5 text-lg text-neutral-600 sm:text-xl">
            Describe your product. Get a full audit in minutes.
          </p>
          <div className="mt-10">
            <Link
              to="/audit"
              className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Start free audit →
            </Link>
          </div>
        </div>
      </main>
      <footer className="border-t border-neutral-100 px-6 py-6 text-center text-xs text-neutral-500">
        <span>QA Agent · </span>
        <Link to="/settings" className="underline-offset-2 hover:underline">
          Settings
        </Link>
      </footer>
    </div>
  );
}
