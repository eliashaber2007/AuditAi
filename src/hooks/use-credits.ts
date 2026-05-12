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

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { credits, loading, refresh };
}
