import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyCredits } from "@/lib/credits.functions";
import { useAuth } from "@/hooks/use-auth";

export function useCredits() {
  const { user } = useAuth();
  const fn = useServerFn(getMyCredits);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCredits(null);
      return;
    }
    setLoading(true);
    try {
      const { credits } = await fn({});
      setCredits(credits);
    } catch {
      setCredits(0);
    } finally {
      setLoading(false);
    }
  }, [user, fn]);

  // Refetch on mount and whenever the user changes.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Also refetch when the tab becomes visible again (e.g. returning from
  // Stripe checkout in another tab, or after webhook latency).
  useEffect(() => {
    if (!user) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user, refresh]);

  return { credits, loading, refresh };
}
