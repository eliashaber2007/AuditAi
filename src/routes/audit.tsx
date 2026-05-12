import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { runAudit } from "@/lib/anthropic";
import { saveReport, randomId } from "@/lib/qa-storage";

const STATUS_MESSAGES = [
  "Analysing UI & visual design...",
  "Testing user flows...",
  "Checking payment logic...",
  "Auditing mobile responsiveness...",
  "Reviewing copy & microcopy...",
  "Probing security surface...",
  "Comparing to competitors...",
  "Writing report...",
];

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "New audit — QA Agent" },
      { name: "description", content: "Describe your product to start a new QA audit." },
    ],
  }),
  component: AuditPage,
});

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
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [description, setDescription] = useState("");
  const [targetUsers, setTargetUsers] = useState("");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [customInstructions, setCustomInstructions] = useState<string[]>([]);
  const [instructionInput, setInstructionInput] = useState("");
  const [apiKey, setApiKeyState] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("qa-anthropic-key");
    if (stored) setApiKeyState(stored);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (progress > 0 && progress < 100) setProgress(100);
      return;
    }
    setProgress(0);
    setStatusIdx(0);
    const start = Date.now();
    const DURATION = 45000; // 45s to reach 95%
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(95, (elapsed / DURATION) * 95);
      setProgress(pct);
    }, 100);
    const statusTimer = setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 3500);
    return () => {
      clearInterval(progressTimer);
      clearInterval(statusTimer);
    };
  }, [loading]);

  const onApiKeyChange = (v: string) => {
    setApiKeyState(v);
    localStorage.setItem("qa-anthropic-key", v);
  };

  const toggleCategory = (c: string) => {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const addInstruction = () => {
    const v = instructionInput.trim();
    if (!v) return;
    setCustomInstructions((prev) => [...prev, v]);
    setInstructionInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !description.trim()) {
      toast.error("Please fill in project name and description.");
      return;
    }
    if (!apiKey.trim()) {
      toast.error("Please enter your Anthropic API key above.");
      return;
    }
    setLoading(true);
    setErrorText(null);
    try {
      const report = await runAudit({
        projectName,
        projectUrl,
        description,
        targetUsers,
        categories,
        customInstructions,
      });
      const id = randomId();
      report.meta = {
        projectName,
        projectUrl,
        description,
        targetUsers,
        categories,
        customInstructions,
        createdAt: new Date().toISOString(),
      };
      saveReport(id, report);
      navigate({ to: "/results/$id", params: { id } });
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.message === "MISSING_API_KEY"
          ? "No Anthropic API key found. Enter your key above to run an audit."
          : err?.message
            ? `${err.message}${err?.stack ? `\n\n--- Stack ---\n${err.stack}` : ""}`
            : String(err);
      setErrorText(msg);
      toast.error("Audit failed — see error details below.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="text-sm font-semibold">
            QA Agent
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">New audit</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Tell us about your product. We'll think like 8 expert testers.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-10">
          <section className="space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Project info
            </h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Project name</label>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                placeholder="Acme App"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Project URL <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                placeholder="https://acme.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Short description{" "}
                <span className="text-neutral-400">({description.length}/500)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                rows={4}
                className="w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                placeholder="What does the product do?"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Target users</label>
              <input
                value={targetUsers}
                onChange={(e) => setTargetUsers(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
                placeholder="French university students"
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              What to test
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DEFAULT_CATEGORIES.map((c) => (
                <label
                  key={c}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
                >
                  <input
                    type="checkbox"
                    checked={categories.includes(c)}
                    onChange={() => toggleCategory(c)}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  {c}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Custom instructions
            </h2>
            <div className="mt-4 flex gap-2">
              <input
                value={instructionInput}
                onChange={(e) => setInstructionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInstruction();
                  }
                }}
                placeholder="e.g. Pay extra attention to the checkout flow"
                className="flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
              />
              <button
                type="button"
                onClick={addInstruction}
                className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
              >
                Add
              </button>
            </div>
            {customInstructions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {customInstructions.map((ins, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                  >
                    {ins}
                    <button
                      type="button"
                      onClick={() =>
                        setCustomInstructions((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className="text-neutral-400 hover:text-neutral-700"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Anthropic API Key
            </h2>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="sk-ant-..."
              autoComplete="off"
              className="mt-4 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-mono outline-none focus:border-neutral-400"
            />
            <p className="mt-2 text-xs text-neutral-500">
              Stored locally in your browser under <code>qa-anthropic-key</code>. Never sent to our servers.
            </p>
          </section>

          <div className="border-t border-neutral-100 pt-8">
            {loading ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-medium text-neutral-700 transition-opacity duration-300">
                    {STATUS_MESSAGES[statusIdx]}
                  </div>
                  <div className="font-mono text-2xl font-semibold tabular-nums text-neutral-900">
                    {Math.floor(progress)}%
                  </div>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full bg-neutral-900 transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-4 text-xs text-neutral-500">
                  Thinking like 8 expert testers. This usually takes 30–60 seconds.
                </p>
              </div>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-3 rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Run audit →
              </button>
            )}
            {errorText && (
              <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-800">
                  Error response
                </div>
                <pre className="whitespace-pre-wrap break-words font-mono text-xs text-red-900">
{errorText}
                </pre>
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
