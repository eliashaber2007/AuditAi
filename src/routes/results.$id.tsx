import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getReport, type Severity } from "@/lib/qa-storage";

export const Route = createFileRoute("/results/$id")({
  head: () => ({
    meta: [{ title: "Audit results — QA Agent" }],
  }),
  component: ResultsPage,
});

const SEVERITY_STYLES: Record<Severity, { badge: string; dot: string; label: string }> = {
  critical: {
    badge: "bg-red-100 text-red-800",
    dot: "bg-red-500",
    label: "Critical",
  },
  medium: {
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
    label: "Medium",
  },
  minor: {
    badge: "bg-green-100 text-green-800",
    dot: "bg-green-500",
    label: "Minor",
  },
};

type Filter = "all" | Severity;

function ResultsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const report = useMemo(() => getReport(id), [id]);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="text-2xl font-semibold">Report not found</h1>
        <p className="mt-2 text-sm text-neutral-600">
          This audit may have been deleted or the link is invalid.
        </p>
        <Link
          to="/audit"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Run a new audit
        </Link>
      </div>
    );
  }

  const counts = {
    critical: report.issues.filter((i) => i.severity === "critical").length,
    medium: report.issues.filter((i) => i.severity === "medium").length,
    minor: report.issues.filter((i) => i.severity === "minor").length,
  };

  const filtered =
    filter === "all" ? report.issues : report.issues.filter((i) => i.severity === filter);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4 print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="text-sm font-semibold">
            QA Agent
          </Link>
          <Link to="/settings" className="text-xs text-neutral-500 hover:underline">
            Settings
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {report.meta?.projectName || "Audit results"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-neutral-600">{report.summary}</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Critical" value={counts.critical} tone="red" />
          <MetricCard label="Medium" value={counts.medium} tone="amber" />
          <MetricCard label="Minor" value={counts.minor} tone="green" />
          <MetricCard label="Score" value={`${report.score}/100`} tone="neutral" />
        </div>

        <div className="mt-8 flex flex-wrap gap-2 print:hidden">
          {(["all", "critical", "medium", "minor"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <ul className="mt-6 space-y-3">
          {filtered.map((issue) => {
            const isOpen = expanded[issue.id] ?? false;
            const sev = SEVERITY_STYLES[issue.severity];
            return (
              <li
                key={issue.id}
                className="rounded-lg border border-neutral-200 bg-white"
              >
                <button
                  onClick={() =>
                    setExpanded((p) => ({ ...p, [issue.id]: !isOpen }))
                  }
                  className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left hover:bg-neutral-50"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${sev.badge}`}
                    >
                      {sev.label}
                    </span>
                    <span className="font-medium">{issue.title}</span>
                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                      {issue.category}
                    </span>
                  </div>
                  <span className="text-neutral-400">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="space-y-3 border-t border-neutral-100 px-4 py-4 text-sm">
                    <p className="text-neutral-700">{issue.description}</p>
                    <div className="rounded-md border-l-4 border-green-500 bg-green-50 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
                        Suggested fix
                      </p>
                      <p className="mt-1 text-neutral-800">{issue.fix}</p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="rounded-lg border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
              No issues in this category.
            </li>
          )}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-neutral-100 pt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Export as PDF
          </button>
          <button
            onClick={() => navigate({ to: "/audit" })}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Run another audit
          </button>
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "red" | "amber" | "green" | "neutral";
}) {
  const tones: Record<typeof tone, string> = {
    red: "text-red-700",
    amber: "text-amber-700",
    green: "text-green-700",
    neutral: "text-neutral-900",
  };
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
