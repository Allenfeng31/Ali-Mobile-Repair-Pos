import { NextResponse } from "next/server";
import { generateWeeklyReport, getRecentWeeklyReports, storeWeeklyReport } from "@/lib/weeklyReport.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || "Unknown error");
}

export async function GET() {
  try {
    const recentReports = await getRecentWeeklyReports(6);
    const latest = recentReports[0];

    return NextResponse.json({
      success: true,
      report: latest
        ? {
            periodStart: latest.period_start,
            periodEnd: latest.period_end,
            markdown: latest.report_markdown,
            json: latest.report_json,
            aiModel: latest.ai_model,
          }
        : null,
      recentReports,
    });
  } catch (error) {
    console.error("[weekly-report-api] Failed to build weekly report:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const report = await generateWeeklyReport();

    try {
      await storeWeeklyReport(report);
      report.stored = true;
    } catch (storageError) {
      report.stored = false;
      report.storageError = getErrorMessage(storageError);
      console.warn("[weekly-report-api] Report generated but storage failed:", report.storageError);
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("[weekly-report-api] Failed to generate weekly report:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
