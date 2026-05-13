import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/auth_/reset-request")({
  validateSearch: (s: Record<string, unknown>) => ({
    error: typeof s.error === "string" ? s.error : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reset password — Audit.ai" },
      { name: "description", content: "Request a new password reset link for your Audit.ai account." },
      { property: "og:title", content: "Reset password — Audit.ai" },
      { property: "og:description", content: "Request a new password reset link for your Audit.ai account." },
    ],
  }),
  component: ResetRequestPage,
});

function ResetRequestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error: searchError } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const genericConfirmation = "If an account exists with this email, a reset link has been sent";

  useEffect(() => { if (searchError) toast.error(searchError); }, [searchError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        console.error("Password reset request failed", error);
      }
      setConfirmation(genericConfirmation);
      toast.success(genericConfirmation);
    } catch (err: any) {
      console.error("Password reset request failed", err);
      setConfirmation(genericConfirmation);
      toast.success(genericConfirmation);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="text-[22px] font-bold tracking-tight text-neutral-900">
            Audit<span className="text-emerald-500">.ai</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Request a password reset</h1>
          <p className="mt-2 text-sm text-neutral-600">Enter your email and we'll send you a fresh reset link.</p>
          {searchError && (
            <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchError}
            </div>
          )}
          {confirmation && (
            <div role="status" className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {confirmation}
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("common.email") || "Email"}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? (t("common.pleaseWait") || "Please wait…") : "Send reset link"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-neutral-600">
            <Link to="/auth" className="font-medium text-neutral-900 underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
