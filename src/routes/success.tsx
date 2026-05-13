import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { verifyCheckout, getMyCredits } from "@/lib/credits.functions";
import { useAuth } from "@/hooks/use-auth";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/success")({
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  head: () => ({ meta: [{ title: "Payment success — Audit.ai" }] }),
  component: SuccessPage,
});

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 15000;

function SuccessPage() {
  const { t } = useTranslation();
  const { session_id } = Route.useSearch();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const verifyFn = useServerFn(verifyCheckout);
  const creditsFn = useServerFn(getMyCredits);
  const [credits, setCredits] = useState<number | null>(null);
  const [status, setStatus] = useState<"polling" | "confirmed" | "timeout">("polling");
  const cancelledRef = useRef(false);

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [authLoading, user, navigate]);

  const startPolling = useRef<() => void>(() => {});
  startPolling.current = async () => {
    if (!user) return;
    cancelledRef.current = false;
    setStatus("polling");
    const startedAt = Date.now();
    while (!cancelledRef.current) {
      try {
        if (session_id) await verifyFn({ data: { sessionId: session_id } }).catch(() => null);
        const { credits: c } = await creditsFn({});
        if (cancelledRef.current) return;
        if (c > 0) { setCredits(c); setStatus("confirmed"); return; }
      } catch {}
      if (Date.now() - startedAt >= MAX_POLL_MS) { if (!cancelledRef.current) setStatus("timeout"); return; }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  };

  useEffect(() => {
    if (!user) return;
    startPolling.current();
    return () => { cancelledRef.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session_id]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold">{t("success.thanks")}</h1>

          {status === "polling" && (
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-neutral-600">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" aria-hidden />
              {t("success.confirming")}
            </div>
          )}

          {status === "confirmed" && credits !== null && (
            <p className="mt-5 text-sm text-neutral-700">
              {t("success.confirmedPrefix")}<span className="font-semibold">{credits}</span>{t("success.confirmedSuffix", { count: credits })}
            </p>
          )}

          {status === "timeout" && (
            <div className="mt-5">
              <p className="text-sm text-neutral-600">{t("success.processing")}</p>
              <button onClick={() => startPolling.current()} className="mt-4 rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
                {t("success.refresh")}
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-2">
            <Link to="/audit" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">{t("success.runAudit")}</Link>
            <Link to="/pricing" className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50">{t("success.buyMore")}</Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
