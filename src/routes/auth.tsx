import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    msg: typeof s.msg === "string" ? s.msg : undefined,
    error: typeof s.error === "string" ? s.error : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Audit.ai" },
      { name: "description", content: "Sign in or create your Audit.ai account to start generating product audits." },
      { property: "og:title", content: "Sign in — Audit.ai" },
      { property: "og:description", content: "Sign in or create your Audit.ai account to start generating product audits." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { msg, error: searchError } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (msg) toast.success(msg); }, [msg]);
  useEffect(() => { if (searchError) toast.error(searchError); }, [searchError]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/audit" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/audit` },
        });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate({ to: "/audit" });
        else toast.success(t("auth.checkEmail"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/audit" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? t("auth.failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const target = window.prompt(t("auth.resetPrompt"), email);
    if (!target) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(target, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(t("user.resetSent"));
    } catch (err: any) {
      toast.error(err?.message ?? t("user.resetFailed"));
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
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            {mode === "login" ? t("auth.signInToRun") : t("auth.signUpToStart")}
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("common.email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium">{t("common.password")}</label>
                {mode === "login" && (
                  <button type="button" onClick={handleForgotPassword}
                    className="text-xs font-medium text-neutral-600 hover:text-neutral-900 underline">
                    {t("auth.forgot")}
                  </button>
                )}
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50">
              {loading ? t("common.pleaseWait") : mode === "login" ? t("common.signIn") : t("common.signUp")}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-neutral-600">
            {mode === "login" ? t("auth.noAccount") : t("auth.alreadyHave")}{" "}
            <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-medium text-neutral-900 underline">
              {mode === "login" ? t("common.signUp") : t("common.signIn")}
            </button>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
