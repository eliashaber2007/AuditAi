import { jsPDF } from "jspdf";
import type { Report, Severity } from "./qa-storage";

const SEVERITY_COLOR: Record<Severity, [number, number, number]> = {
  critical: [220, 38, 38],
  medium: [217, 119, 6],
  minor: [22, 163, 74],
};

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "audit"
  );
}

export function exportReportToPdf(report: Report) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const marginY = 56;
  const contentWidth = pageWidth - marginX * 2;
  let y = marginY;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - marginY) {
      doc.addPage();
      y = marginY;
    }
  };

  const writeText = (
    text: string,
    opts: { size?: number; style?: "normal" | "bold"; color?: [number, number, number]; gap?: number } = {},
  ) => {
    const { size = 11, style = "normal", color = [30, 30, 30], gap = 6 } = opts;
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    const lineHeight = size * 1.3;
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, marginX, y);
      y += lineHeight;
    }
    y += gap;
  };

  const projectName = report.meta?.projectName || "Audit";

  // Title
  writeText(projectName, { size: 22, style: "bold", gap: 4 });
  writeText("Audit.ai Report", { size: 12, color: [110, 110, 110], gap: 14 });

  // Score
  writeText(`Score: ${report.score} / 100`, { size: 14, style: "bold", gap: 10 });

  // Summary
  writeText("Summary", { size: 13, style: "bold", gap: 4 });
  writeText(report.summary || "(no summary)", { size: 11, gap: 16 });

  // Issues header
  writeText(`Issues (${report.issues.length})`, { size: 13, style: "bold", gap: 8 });

  report.issues.forEach((issue, idx) => {
    ensureSpace(80);
    const sevColor = SEVERITY_COLOR[issue.severity];

    // Severity + category line
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
    const sevLabel = issue.severity.toUpperCase();
    doc.text(sevLabel, marginX, y);
    const sevWidth = doc.getTextWidth(sevLabel);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 110, 110);
    doc.text(`  ·  ${issue.category}`, marginX + sevWidth, y);
    y += 14;

    writeText(`${idx + 1}. ${issue.title}`, { size: 12, style: "bold", gap: 4 });
    writeText(issue.description, { size: 10, color: [50, 50, 50], gap: 6 });
    writeText("Fix:", { size: 10, style: "bold", color: [22, 101, 52], gap: 2 });
    writeText(issue.fix, { size: 10, color: [50, 50, 50], gap: 14 });
  });

  doc.save(`${slugify(projectName)}-audit.pdf`);
}
