import { NextResponse } from "next/server";
import { buildWeeklyReportPdf } from "@/lib/weeklyReportPdf.server";
import { generateWeeklyReport, getRecentWeeklyReports, storeWeeklyReport, type WeeklyReport } from "@/lib/weeklyReport.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || "Unknown error");
}

function filename(periodEnd: string) {
  return `ali-mobile-weekly-business-report-${new Date(periodEnd).toISOString().slice(0, 10)}.pdf`;
}

async function getReportForPdf(request: Request) {
  const shouldGenerate = new URL(request.url).searchParams.get("generate") === "1";
  if (shouldGenerate) {
    const report = await generateWeeklyReport();
    await storeWeeklyReport(report);
    return report;
  }

  const [latest] = await getRecentWeeklyReports(1);
  if (latest) {
    return {
      periodStart: latest.period_start,
      periodEnd: latest.period_end,
      markdown: latest.report_markdown,
      json: latest.report_json,
      aiModel: latest.ai_model,
    } as WeeklyReport;
  }

  const report = await generateWeeklyReport();
  await storeWeeklyReport(report);
  return report;
}

async function respondWithPdf(request: Request) {
  try {
    const report = await getReportForPdf(request);
    const pdf = buildWeeklyReportPdf(report);

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename(report.periodEnd)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[weekly-report-pdf] Failed to generate PDF:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return respondWithPdf(request);
}

export async function POST(request: Request) {
  return respondWithPdf(request);
}
