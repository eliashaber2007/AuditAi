import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Audit.ai" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error(t("reset.min6")); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      navigate({ to: "/auth", search: { msg: t("auth.passwordUpdatedRedirect") } });
    } catch (err: any) {
      toast.error(err?.message ?? t("reset.failed"));
    } finally { setLoading(false); }
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
          <h1 className="text-2xl font-semibold tracking-tight">{t("reset.title")}</h1>
          <p className="mt-2 text-sm text-neutral-600">{t("reset.sub")}</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("reset.newPassword")}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50">
              {loading ? t("reset.updating") : t("reset.update")}
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
