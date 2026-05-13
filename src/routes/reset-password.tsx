import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Audit.ai" },
      { name: "description", content: "Set a new password for your Audit.ai account." },
      { property: "og:title", content: "Reset password — Audit.ai" },
      { property: "og:description", content: "Set a new password for your Audit.ai account." },
    ],
  }),
  component: ResetPasswordPage,
});

const EXPIRED_MSG = "This reset link has expired. Please request a new one.";
const INVALID_MSG = "Invalid reset link.";

function isExpiredError(err: any): boolean {
  const code = err?.code || err?.error_code || "";
  const msg = (err?.message || "").toLowerCase();
  return (
    code === "otp_expired" ||
    code === "otp_disabled" ||
    msg.includes("expired") ||
    msg.includes("invalid") ||
    msg.includes("disabled")
  );
}

function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        const url = new URL(window.location.href);
        const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type") || hash.get("type");
        const errorCode = url.searchParams.get("error_code") || hash.get("error_code");
        const errorDesc = url.searchParams.get("error_description") || hash.get("error_description");
        const accessToken = hash.get("access_token");

        // Supabase already returned an error in the URL (expired/disabled link)
        if (errorCode) {
          if (errorCode === "otp_expired" || errorCode === "otp_disabled") {
            navigate({ to: "/auth/reset-request", search: { error: EXPIRED_MSG } });
          } else {
            navigate({ to: "/auth", search: { error: errorDesc || INVALID_MSG } });
          }
          return;
        }

        // If a session is already present (hash flow auto-handled), we're good
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          if (!cancelled) setVerifying(false);
          return;
        }

        // No token of any kind in the URL
        if (!code && !tokenHash && !accessToken) {
          navigate({ to: "/auth", search: { error: INVALID_MSG } });
          return;
        }

        // PKCE code flow
        if (code) {
          try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
          } catch (err: any) {
            if (isExpiredError(err)) {
              navigate({ to: "/auth/reset-request", search: { error: EXPIRED_MSG } });
            } else {
              navigate({ to: "/auth", search: { error: INVALID_MSG } });
            }
            return;
          }
        } else if (tokenHash) {
          try {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: (type as any) || "recovery",
            });
            if (error) throw error;
          } catch (err: any) {
            if (isExpiredError(err)) {
              navigate({ to: "/auth/reset-request", search: { error: EXPIRED_MSG } });
            } else {
              navigate({ to: "/auth", search: { error: INVALID_MSG } });
            }
            return;
          }
        }

        if (!cancelled) setVerifying(false);
      } catch {
        navigate({ to: "/auth", search: { error: INVALID_MSG } });
      }
    };

    verify();
    return () => { cancelled = true; };
  }, [navigate]);

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
      if (isExpiredError(err)) {
        navigate({ to: "/auth/reset-request", search: { error: EXPIRED_MSG } });
        return;
      }
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
          {verifying ? (
            <p className="mt-8 text-sm text-neutral-500">Verifying reset link…</p>
          ) : (
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
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
