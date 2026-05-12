import { getApiKey, type Report } from "./qa-storage";

export interface AuditInput {
  projectName: string;
  projectUrl: string;
  description: string;
  targetUsers: string;
  categories: string[];
  customInstructions: string[];
}

const SYSTEM_PROMPT =
  "You are a senior product QA analyst. You will receive a description of a digital product and a list of things to test. Your job is to think like 8 different expert testers — a UX designer, a developer, a security analyst, a copywriter, a payments specialist, a mobile tester, a competitor analyst, and a first-time user. Return a thorough, honest, critical audit. Be specific — no generic advice. Every issue must reference the actual product described. Respond ONLY in valid JSON with no markdown, no preamble, no code fences.";

function buildUserMessage(input: AuditInput): string {
  return `Project name: ${input.projectName}
URL: ${input.projectUrl || "(not provided)"}
Description: ${input.description}
Target users: ${input.targetUsers}
Test categories selected: ${input.categories.join(", ")}
Custom instructions: ${input.customInstructions.length ? input.customInstructions.join("\n") : "None"}

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
  // Find first { and last }
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1) t = t.slice(first, last + 1);
  return t;
}

export async function runAudit(input: AuditInput): Promise<Report> {
  const apiKey = (typeof window !== "undefined" && localStorage.getItem("qa-anthropic-key")) || getApiKey();
  console.log("Anthropic API Key:", apiKey ? `${apiKey.slice(0, 10)}…(${apiKey.length} chars)` : "(none)");
  if (!apiKey || !apiKey.trim()) {
    throw new Error("MISSING_API_KEY");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(input) }],
    }),
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? "";
  const cleaned = stripFences(text);
  const parsed = JSON.parse(cleaned) as Report;
  return parsed;
}
