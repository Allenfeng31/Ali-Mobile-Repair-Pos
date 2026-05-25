import { NextResponse } from "next/server";
import { generateWeeklyReport, shouldRunSundayNineMelbourne, storeWeeklyReport } from "@/lib/weeklyReport.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || "Unknown error");
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function runWeeklyReportJob(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const force = new URL(request.url).searchParams.get("force") === "1";
  if (!force && !shouldRunSundayNineMelbourne()) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "Not Sunday 09:00 in Australia/Melbourne.",
    });
  }

  try {
    const report = await generateWeeklyReport();
    await storeWeeklyReport(report);

    return NextResponse.json({
      success: true,
      skipped: false,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      aiModel: report.aiModel,
    });
  } catch (error) {
    console.error("[weekly-report-cron] Job failed:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return runWeeklyReportJob(request);
}

export async function POST(request: Request) {
  return runWeeklyReportJob(request);
}
