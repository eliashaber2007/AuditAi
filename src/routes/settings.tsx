import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getStoredApiKeyOnly, setApiKey } from "@/lib/qa-storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings — QA Agent" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [key, setKey] = useState("");

  useEffect(() => {
    setKey(getStoredApiKeyOnly());
  }, []);

  const save = () => {
    setApiKey(key.trim());
    toast.success("API key saved");
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link to="/" className="text-sm font-semibold">
            QA Agent
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <div className="mt-8 space-y-3">
          <label className="block text-sm font-medium">Anthropic API Key</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-mono outline-none focus:border-neutral-400"
          />
          <p className="text-xs text-neutral-500">
            Your key is stored locally in your browser and never sent to our servers.
          </p>
          <button
            onClick={save}
            className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Save
          </button>
        </div>
      </main>
    </div>
  );
}
