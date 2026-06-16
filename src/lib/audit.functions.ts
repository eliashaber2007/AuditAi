import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Report } from "./qa-storage";

export interface AuditInput {
  projectName: string;
  projectUrl: string;
  description: string;
  targetUsers: string;
  categories: string[];
  customInstructions: string[];
}

interface FetchSiteResult {
  ok?: boolean;
  fetched?: boolean;
  title?: string;
  metaDescription?: string;
  headings?: { h1?: string[]; h2?: string[] };
  buttons?: string[];
  navLinks?: string[];
  bodyText?: string;
}

async function fetchSiteContent(url: string): Promise<FetchSiteResult | null> {
  try {
    const base = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!base || !key) {
      console.warn("fetch-site: missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY env var");
      return null;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20_000);
    try {
      const res = await fetch(`${base}/functions/v1/fetch-site`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          apikey: key,
        },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        console.warn("fetch-site: non-ok response", res.status);
        return null;
      }
      return (await res.json()) as FetchSiteResult;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (e) {
    console.warn("fetch-site: threw", e);
    return null;
  }
}

function formatSiteContent(site: FetchSiteResult): string {
  const h1 = site.headings?.h1?.slice(0, 20).join(" | ") ?? "";
  const h2 = site.headings?.h2?.slice(0, 30).join(" | ") ?? "";
  const buttons = (site.buttons ?? []).slice(0, 40).join(" | ");
  const navLinks = (site.navLinks ?? []).slice(0, 40).join(" | ");
  const body = (site.bodyText ?? "").slice(0, 6000);
  return `Title: ${site.title ?? ""}
Meta description: ${site.metaDescription ?? ""}
H1: ${h1}
H2: ${h2}
Buttons: ${buttons}
Nav links: ${navLinks}
Body text (truncated):
${body}`;
}

const SYSTEM_PROMPT =
  "You are a senior product QA analyst. You will receive a description of a digital product and a list of things to test. Your job is to think like 8 different expert testers — a UX designer, a developer, a security analyst, a copywriter, a payments specialist, a mobile tester, a competitor analyst, and a first-time user. Return a thorough, honest, critical audit. Be specific — no generic advice. Every issue must reference the actual product described. Respond ONLY in valid JSON with no markdown, no preamble, no code fences.";

function buildUserMessage(input: AuditInput, siteBlock: string | null, siteFailed: boolean): string {
  const liveSection = siteBlock
    ? `\n\nACTUAL LIVE SITE CONTENT (fetched and rendered):\n${siteBlock}`
    : siteFailed
      ? `\n\nNOTE: The live site at ${input.projectUrl} could not be fetched. Base the audit on the user's description only, and explicitly mention in the summary that the live site could not be accessed so analysis is based on the description alone.`
      : "";
  return `Project name: ${input.projectName}
URL: ${input.projectUrl || "(not provided)"}
Description: ${input.description}
Target users: ${input.targetUsers}
Test categories selected: ${input.categories.join(", ")}
Custom instructions: ${input.customInstructions.length ? input.customInstructions.join("\n") : "None"}${liveSection}

Return a JSON object in exactly this format:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence overall verdict>",
  "issues": [
    {
      "id": "<unique string>",
      "severity": "critical" | "medium" | "minor",
      "category": "<string>",
      "title": "<short title>",
      "description": "<detailed description referencing the actual product>",
      "fix": "<specific actionable fix>"
    }
  ]
}`;
}


function stripFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  }
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1) t = t.slice(first, last + 1);
  return t;
}

function repairTruncatedJson(input: string): string | null {
  const issuesIdx = input.indexOf('"issues"');
  if (issuesIdx === -1) return null;
  const arrStart = input.indexOf("[", issuesIdx);
  if (arrStart === -1) return null;
  let depth = 0;
  let inStr = false;
  let escape = false;
  let lastCompleteObjEnd = -1;
  let arrayClosed = false;
  for (let i = arrStart; i < input.length; i++) {
    const ch = input[i];
    if (inStr) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") {
      depth--;
      if (ch === "}" && depth === 1) lastCompleteObjEnd = i;
      if (ch === "]" && depth === 0) { arrayClosed = true; break; }
    }
  }
  if (arrayClosed) return null;
  if (lastCompleteObjEnd === -1) return input.slice(0, arrStart + 1) + "]}";
  return input.slice(0, lastCompleteObjEnd + 1) + "]}";
}

export const runAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: AuditInput) => data)
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    // Check credits up-front (don't deduct yet — only charge on successful audit)
    const { data: creditRow } = await supabaseAdmin
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();
    const current = creditRow?.credits ?? 0;
    if (current <= 0) {
      throw new Error("NO_CREDITS");
    }
    // Reserve the credit now to prevent concurrent double-spend.
    const { error: deductError } = await supabaseAdmin
      .from("user_credits")
      .upsert({ user_id: userId, credits: current - 1, updated_at: new Date().toISOString() });
    if (deductError) throw new Error(`Failed to deduct credit: ${deductError.message}`);

    // Refund helper — re-reads current balance and adds 1 back.
    const refundCredit = async () => {
      try {
        const { data: row } = await supabaseAdmin
          .from("user_credits")
          .select("credits")
          .eq("user_id", userId)
          .maybeSingle();
        const bal = row?.credits ?? 0;
        await supabaseAdmin
          .from("user_credits")
          .upsert({ user_id: userId, credits: bal + 1, updated_at: new Date().toISOString() });
      } catch (e) {
        console.error("Failed to refund credit for user", userId, e);
      }
    };

    try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured on the server.");

    // Fetch live site content if a URL was provided. Never fail the audit on errors.
    let siteBlock: string | null = null;
    let siteFailed = false;
    if (data.projectUrl) {
      const site = await fetchSiteContent(data.projectUrl);
      console.log("fetch-site result:", site?.fetched);
      if (site && site.fetched) siteBlock = formatSiteContent(site);
      else siteFailed = true;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35_000);

    let res: Response;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 3000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserMessage(data, siteBlock, siteFailed) }],
        }),
      });

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === "AbortError") {
        throw new Error("Anthropic API request timed out after 55 seconds. Try simplifying the audit input.");
      }
      throw err;
    }
    clearTimeout(timeoutId);

    const rawBody = await res.text();
    if (!res.ok) {
      throw new Error(`Anthropic API error ${res.status} ${res.statusText}\n\n${rawBody}`);
    }

    let payload: any;
    try { payload = JSON.parse(rawBody); } catch {
      throw new Error(`Failed to parse API response as JSON:\n\n${rawBody}`);
    }
    const text: string = payload?.content?.[0]?.text ?? "";
    const cleaned = stripFences(text);

    let report: Report;
    try {
      report = JSON.parse(cleaned) as Report;
    } catch {
      const repaired = repairTruncatedJson(cleaned);
      if (!repaired) throw new Error(`Failed to parse model output as JSON.\n\nRaw model text:\n${text}`);
      report = JSON.parse(repaired) as Report;
    }

    report.meta = {
      projectName: data.projectName,
      projectUrl: data.projectUrl,
      description: data.description,
      targetUsers: data.targetUsers,
      categories: data.categories,
      customInstructions: data.customInstructions,
      createdAt: new Date().toISOString(),
    };

    const { data: row, error } = await supabaseAdmin
      .from("audits")
      .insert({ project_name: data.projectName, report: report as any, user_id: userId })
      .select("id")
      .single();

    if (error) throw new Error(`Failed to save audit: ${error.message}`);

    return { id: row.id as string, report };
    } catch (err) {
      await refundCredit();
      throw err;
    }
  });
