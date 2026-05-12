import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { verifyCheckout } from "@/lib/credits.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/success")({
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  head: () => ({ meta: [{ title: "Payment success — Audit.ai" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { session_id } = Route.useSearch();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const verifyFn = useServerFn(verifyCheckout);
  const [credits, setCredits] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || !session_id) return;
    let cancelled = false;
    let attempts = 0;
    const tick = async () => {
      try {
        const { credits: c, credited } = await verifyFn({ data: { sessionId: session_id } });
        if (cancelled) return;
        if (credited) {
          setCredits(c);
        } else if (attempts++ < 5) {
          setTimeout(tick, 1500);
        } else {
          setError("Payment is processing. Refresh in a moment.");
        }
      } catch (e: any) {
        setError(e?.message ?? "Verification failed");
      }
    };
    tick();
    return () => { cancelled = true; };
  }, [user, session_id, verifyFn]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-semibold">Thank you!</h1>
        {credits !== null ? (
          <p className="mt-3 text-sm text-neutral-600">
            Your balance is now <span className="font-semibold">{credits}</span> credit
            {credits === 1 ? "" : "s"}.
          </p>
        ) : error ? (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">Confirming your payment…</p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/audit" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            Run an audit
          </Link>
          <Link to="/pricing" className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
            Buy more
          </Link>
        </div>
      </div>
    </div>
  );
}
