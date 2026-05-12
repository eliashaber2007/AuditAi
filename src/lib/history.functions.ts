import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Report } from "./qa-storage";

export interface AuditSummary {
  id: string;
  project_name: string;
  created_at: string;
  score: number;
  issueCount: number;
}

export const listMyAudits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AuditSummary[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("audits")
      .select("id, project_name, created_at, report")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => {
      const report = row.report as unknown as Report;
      return {
        id: row.id,
        project_name: row.project_name,
        created_at: row.created_at,
        score: typeof report?.score === "number" ? report.score : 0,
        issueCount: Array.isArray(report?.issues) ? report.issues.length : 0,
      };
    });
  });
