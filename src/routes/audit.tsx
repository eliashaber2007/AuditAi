import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { runAudit } from "@/lib/anthropic";
import { saveReport, randomId } from "@/lib/qa-storage";

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

  useEffect(() => {
    const stored = localStorage.getItem("qa-anthropic-key");
    if (stored) setApiKeyState(stored);
  }, []);

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
      if (err?.message === "MISSING_API_KEY") {
        toast.error("No Anthropic API key found. Enter your key above to run an audit.");
      } else {
        toast.error("Audit failed — check your API key.");
      }
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

          <div className="border-t border-neutral-100 pt-8">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-3 rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Auditing your product…
                </>
              ) : (
                "Run audit →"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
