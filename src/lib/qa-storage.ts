export type Severity = "critical" | "medium" | "minor";

export interface Issue {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  fix: string;
}

export interface Report {
  score: number;
  summary: string;
  issues: Issue[];
  meta?: {
    projectName: string;
    projectUrl?: string;
    description: string;
    targetUsers: string;
    categories: string[];
    customInstructions: string[];
    createdAt: string;
  };
}

const KEY_PREFIX = "qa-report-";

export function saveReport(id: string, report: Report) {
  localStorage.setItem(KEY_PREFIX + id, JSON.stringify(report));
}

export function getReport(id: string): Report | null {
  const raw = localStorage.getItem(KEY_PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Report;
  } catch {
    return null;
  }
}

export function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
