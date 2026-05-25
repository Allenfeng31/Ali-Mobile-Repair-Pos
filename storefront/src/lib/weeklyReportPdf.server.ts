import { format } from "date-fns";
import type { WeeklyReport, WeeklyReportJson, RepairConversionItem } from "@/lib/weeklyReport.server";

type PdfColor = [number, number, number];

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 44;
const BLUE: PdfColor = [37, 99, 235];
const NAVY: PdfColor = [15, 23, 42];
const SLATE: PdfColor = [71, 85, 105];
const LIGHT: PdfColor = [248, 250, 252];
const BORDER: PdfColor = [226, 232, 240];
const GREEN: PdfColor = [16, 185, 129];
const AMBER: PdfColor = [245, 158, 11];
const RED: PdfColor = [225, 29, 72];

function rgb(color: PdfColor) {
  return color.map((value) => (value / 255).toFixed(3)).join(" ");
}

function sanitizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .trim();
}

function money(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function pct(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function wrapText(text: string, maxChars: number) {
  const words = sanitizeText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function compactMarkdown(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.replace(/^#+\s*/, "").replace(/^[-*]\s*/, ""))
    .filter((line) => line.trim().length > 0)
    .slice(0, 12);
}

class SimplePdf {
  private pages: string[] = [];
  private commands: string[] = [];

  addPage() {
    if (this.commands.length > 0) {
      this.pages.push(this.commands.join("\n"));
    }
    this.commands = [];
  }

  finish() {
    if (this.commands.length > 0) {
      this.pages.push(this.commands.join("\n"));
      this.commands = [];
    }

    const objects: string[] = [];
    const addObject = (body: string) => {
      objects.push(body);
      return objects.length;
    };

    const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
    const pagesId = addObject("");
    const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    const pageIds: number[] = [];

    for (const page of this.pages) {
      const content = page;
      const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
      const pageId = addObject(
        [
          "<< /Type /Page",
          `/Parent ${pagesId} 0 R`,
          `/MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}]`,
          `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >>`,
          `/Contents ${contentId} 0 R`,
          ">>",
        ].join("\n")
      );
      pageIds.push(pageId);
    }

    objects[pagesId - 1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`;
    objects[catalogId - 1] = "<< /Type /Catalog /Pages 2 0 R >>";

    let output = "%PDF-1.4\n";
    const offsets = [0];

    objects.forEach((body, index) => {
      offsets.push(output.length);
      output += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });

    const xrefStart = output.length;
    output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      output += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return new TextEncoder().encode(output);
  }

  text(text: string, x: number, y: number, size = 10, color: PdfColor = NAVY, bold = false) {
    this.commands.push(
      `BT /${bold ? "F2" : "F1"} ${size} Tf ${rgb(color)} rg ${x.toFixed(2)} ${y.toFixed(2)} Td (${sanitizeText(text)}) Tj ET`
    );
  }

  rect(x: number, y: number, width: number, height: number, color: PdfColor, stroke?: PdfColor) {
    this.commands.push(`${rgb(color)} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`);
    if (stroke) {
      this.commands.push(`${rgb(stroke)} RG ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`);
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, color: PdfColor = BORDER) {
    this.commands.push(`${rgb(color)} RG ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }
}

function drawHeader(pdf: SimplePdf, title: string, subtitle: string) {
  pdf.rect(0, PAGE_HEIGHT - 92, PAGE_WIDTH, 92, NAVY);
  pdf.rect(0, PAGE_HEIGHT - 96, PAGE_WIDTH, 4, BLUE);
  pdf.text("ALI MOBILE & REPAIR", MARGIN, PAGE_HEIGHT - 38, 11, [191, 219, 254], true);
  pdf.text(title, MARGIN, PAGE_HEIGHT - 62, 22, [255, 255, 255], true);
  pdf.text(subtitle, MARGIN, PAGE_HEIGHT - 82, 10, [203, 213, 225]);
}

function drawKpiCard(pdf: SimplePdf, x: number, y: number, width: number, label: string, value: string, note: string, color: PdfColor) {
  pdf.rect(x, y, width, 72, LIGHT, BORDER);
  pdf.rect(x, y + 68, width, 4, color);
  pdf.text(label.toUpperCase(), x + 14, y + 49, 8, SLATE, true);
  pdf.text(value, x + 14, y + 27, 18, NAVY, true);
  pdf.text(note, x + 14, y + 12, 8, SLATE);
}

function drawRevenueChart(pdf: SimplePdf, json: WeeklyReportJson, x: number, y: number, width: number, height: number) {
  const values = [
    { label: "This week", value: json.revenue.current, color: BLUE },
    { label: "Last week", value: json.revenue.previous, color: SLATE },
    { label: "Last year", value: json.revenue.lastYear, color: AMBER },
  ];
  const max = Math.max(...values.map((item) => item.value), 1);
  pdf.text("Revenue Comparison", x, y + height + 20, 14, NAVY, true);
  pdf.line(x, y, x + width, y, BORDER);

  const barWidth = 74;
  const gap = (width - values.length * barWidth) / (values.length + 1);
  values.forEach((item, index) => {
    const barHeight = Math.max(4, (item.value / max) * (height - 34));
    const bx = x + gap + index * (barWidth + gap);
    pdf.rect(bx, y, barWidth, barHeight, item.color);
    pdf.text(money(item.value), bx, y + barHeight + 8, 10, NAVY, true);
    pdf.text(item.label, bx, y - 16, 8, SLATE);
  });
}

function drawArrivalChart(pdf: SimplePdf, json: WeeklyReportJson, x: number, y: number, width: number) {
  const stages = [
    { label: "Requests", value: json.arrival.bookingRequests, color: BLUE },
    { label: "Confirmed", value: json.arrival.confirmed, color: GREEN },
    { label: "Arrived", value: json.arrival.arrived, color: AMBER },
  ];
  const max = Math.max(...stages.map((stage) => stage.value), 1);
  pdf.text("Arrival Funnel", x, y + 108, 14, NAVY, true);
  stages.forEach((stage, index) => {
    const rowY = y + 70 - index * 30;
    const barWidth = Math.max(6, (stage.value / max) * (width - 112));
    pdf.text(stage.label, x, rowY + 4, 9, SLATE, true);
    pdf.rect(x + 78, rowY, width - 112, 12, [241, 245, 249], BORDER);
    pdf.rect(x + 78, rowY, barWidth, 12, stage.color);
    pdf.text(String(stage.value), x + width - 24, rowY + 3, 10, NAVY, true);
  });
  pdf.text(`Arrival rate: ${json.arrival.arrivalRate.toFixed(1)}%`, x, y - 16, 9, SLATE);
}

function drawKeywordRows(pdf: SimplePdf, items: Array<{ keyword: string; visits: number }>, x: number, y: number, title: string) {
  pdf.text(title, x, y, 14, NAVY, true);
  const maxVisits = Math.max(...items.map((item) => item.visits), 1);
  items.slice(0, 6).forEach((item, index) => {
    const rowY = y - 26 - index * 28;
    pdf.text(`#${index + 1}`, x, rowY, 8, BLUE, true);
    pdf.text(item.keyword.slice(0, 46), x + 28, rowY, 9, NAVY, true);
    pdf.rect(x + 28, rowY - 12, 220, 5, [226, 232, 240]);
    pdf.rect(x + 28, rowY - 12, (item.visits / maxVisits) * 220, 5, BLUE);
    pdf.text(`${item.visits} visits`, x + 260, rowY, 8, SLATE);
  });
}

function drawRepairTable(pdf: SimplePdf, items: RepairConversionItem[], x: number, y: number, title: string, danger = false) {
  pdf.text(title, x, y, 14, NAVY, true);
  pdf.text("Model + repair", x, y - 24, 8, SLATE, true);
  pdf.text("Views", x + 286, y - 24, 8, SLATE, true);
  pdf.text("Bookings", x + 336, y - 24, 8, SLATE, true);
  pdf.text("Rate", x + 405, y - 24, 8, SLATE, true);
  pdf.line(x, y - 31, x + 470, y - 31, BORDER);

  const rows = items.slice(0, 8);
  if (rows.length === 0) {
    pdf.text("Not enough data yet.", x, y - 54, 9, SLATE);
    return;
  }

  rows.forEach((item, index) => {
    const rowY = y - 52 - index * 24;
    pdf.text(item.name.slice(0, 44), x, rowY, 9, NAVY, true);
    pdf.text(String(item.views), x + 294, rowY, 9, SLATE);
    pdf.text(String(item.bookings), x + 350, rowY, 9, SLATE);
    pdf.text(`${item.rate.toFixed(1)}%`, x + 410, rowY, 9, danger && item.rate < 2 ? RED : GREEN, true);
  });
}

function drawRecommendations(pdf: SimplePdf, markdown: string, x: number, y: number) {
  pdf.text("AI Analyst Recommendations", x, y, 16, NAVY, true);
  let cursor = y - 26;
  for (const paragraph of compactMarkdown(markdown)) {
    const lines = wrapText(paragraph, 88).slice(0, 3);
    pdf.text("-", x, cursor, 10, BLUE, true);
    lines.forEach((line, index) => {
      pdf.text(line, x + 16, cursor - index * 14, 9, SLATE);
    });
    cursor -= Math.max(24, lines.length * 14 + 8);
    if (cursor < 90) break;
  }
}

function drawSuburbRows(pdf: SimplePdf, json: WeeklyReportJson, x: number, y: number) {
  pdf.text("Suburb Page Movement", x, y, 14, NAVY, true);
  const rows = json.suburbConversions.slice(0, 6);
  if (rows.length === 0) {
    pdf.text("Not enough suburb data yet.", x, y - 24, 9, SLATE);
    return;
  }
  rows.forEach((row, index) => {
    const rowY = y - 26 - index * 24;
    pdf.text(row.suburb, x, rowY, 9, NAVY, true);
    pdf.text(`${row.homepageClicks}/${row.views}`, x + 150, rowY, 9, SLATE);
    pdf.text(`${row.rate.toFixed(1)}% to homepage`, x + 205, rowY, 9, GREEN, true);
  });
}

export function buildWeeklyReportPdf(report: Pick<WeeklyReport, "periodStart" | "periodEnd" | "json" | "aiModel">) {
  const pdf = new SimplePdf();
  const json = report.json;
  const period = `${format(new Date(report.periodStart), "dd MMM yyyy")} to ${format(new Date(report.periodEnd), "dd MMM yyyy")}`;

  pdf.addPage();
  drawHeader(pdf, "Weekly Business Report", `${period} | Ringwood HQ | Analyst: ${report.aiModel}`);
  drawKpiCard(pdf, MARGIN, 650, 152, "Revenue", money(json.revenue.current), `vs last week ${pct(json.revenue.vsPreviousPct)}`, BLUE);
  drawKpiCard(pdf, 222, 650, 152, "Last Year", pct(json.revenue.vsLastYearPct), `${money(json.revenue.lastYear)} same period`, AMBER);
  drawKpiCard(pdf, 400, 650, 152, "Arrivals", `${json.arrival.arrivalRate.toFixed(1)}%`, `${json.arrival.arrived}/${json.arrival.confirmed} confirmed arrived`, GREEN);
  drawRevenueChart(pdf, json, MARGIN, 470, 250, 110);
  drawArrivalChart(pdf, json, 340, 470, 210);
  drawKeywordRows(pdf, json.seoKeywordVisits.top, MARGIN, 390, "Top SEO Landing Keywords");
  drawSuburbRows(pdf, json, 340, 390);
  drawRecommendations(pdf, json.aiRecommendations, MARGIN, 178);

  pdf.addPage();
  drawHeader(pdf, "Repair Conversion Detail", "Top and weak repair paths by category");
  const phones = json.repairConversions.Phones;
  const tablets = json.repairConversions.Tablets;
  const computers = json.repairConversions.Computers;
  const watches = json.repairConversions.Watches;
  drawRepairTable(pdf, phones.top, MARGIN, 700, "Phones - Highest Conversion");
  drawRepairTable(pdf, phones.bottom, MARGIN, 475, "Phones - Needs Review", true);
  drawRepairTable(pdf, [...tablets.top, ...computers.top, ...watches.top].slice(0, 8), MARGIN, 250, "Tablet, Computer, Watch Winners");

  pdf.addPage();
  drawHeader(pdf, "Opportunity Appendix", "Low conversion and low visibility signals");
  drawRepairTable(pdf, [...tablets.bottom, ...computers.bottom, ...watches.bottom].slice(0, 10), MARGIN, 700, "Non-phone Repair Paths To Improve", true);
  drawKeywordRows(pdf, json.seoKeywordVisits.bottom, MARGIN, 430, "Lowest SEO Landing Keywords");
  pdf.text("Report Notes", MARGIN, 190, 16, NAVY, true);
  pdf.text("This PDF is generated from the same stored weekly report JSON used by the dashboard.", MARGIN, 164, 9, SLATE);
  pdf.text("AI recommendations are isolated from SEO writing agents and use only the supplied weekly business dataset.", MARGIN, 148, 9, SLATE);
  pdf.text("News aggregator skill discipline is included in the analyst prompt, but no external news is claimed unless live news JSON is supplied.", MARGIN, 132, 9, SLATE);

  return pdf.finish();
}
