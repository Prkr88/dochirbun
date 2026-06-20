import { NextResponse } from "next/server";

import { adminAuth, adminFirestore } from "@/lib/firebase/admin";
import { reportLabels } from "@/lib/report-labels";
import type { ReportRating } from "@/types/report";

export const runtime = "nodejs";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dochirbun.vercel.app";

interface RatingNotificationRequest {
  reportId?: string;
  rating?: ReportRating;
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
    }

    const body = (await request.json()) as RatingNotificationRequest;

    if (!body.reportId || !body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: "Invalid notification payload." }, { status: 400 });
    }

    const decodedToken = await adminAuth().verifyIdToken(token);
    const firestore = adminFirestore();
    const ratingId = `${body.reportId}_${decodedToken.uid}`;
    const [reportSnapshot, ratingSnapshot] = await Promise.all([
      firestore.collection("reports").doc(body.reportId).get(),
      firestore.collection("reportRatings").doc(ratingId).get()
    ]);

    if (!reportSnapshot.exists) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    if (!ratingSnapshot.exists || ratingSnapshot.data()?.rating !== body.rating) {
      return NextResponse.json({ error: "Rating was not persisted." }, { status: 409 });
    }

    const report = reportSnapshot.data();

    if (!report?.userEmail || report.userId === decodedToken.uid) {
      return NextResponse.json({ sent: false, reason: "No recipient or self-rating." });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;

    if (!resendApiKey || !emailFrom) {
      console.warn("Rating notification skipped: RESEND_API_KEY or EMAIL_FROM is missing.");
      return NextResponse.json({ sent: false, reason: "Email provider is not configured." });
    }

    const subject = `💩 הדו"ח שלך קיבל ${body.rating} כוכבים!`;
    const reportTitle = report.isAnonymous ? "דו\"ח אנונימי" : `הדו"ח של ${report.reporterName ?? "מדווח"}`;
    const stars = "⭐".repeat(body.rating);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [report.userEmail],
        subject,
        html: buildEmailHtml({
          reportTitle,
          rating: body.rating,
          stars,
          facility: labelOf(reportLabels.facility, report.facility),
          sittingTime: labelOf(reportLabels.sittingTime, report.sittingTime),
          stoolCharacter: labelOf(reportLabels.stoolCharacter, report.stoolCharacter),
          smell: report.smell === "other" ? report.smellOther : labelOf(reportLabels.smell, report.smell),
          appUrl
        })
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Rating notification email failed:", errorText);
      return NextResponse.json({ sent: false, reason: "Email provider rejected the request." });
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Rating notification failed:", error);
    return NextResponse.json({ sent: false, reason: "Notification failed." });
  }
}

function labelOf<TLabels extends Record<string, string>>(labels: TLabels, key: unknown) {
  return typeof key === "string" && key in labels ? labels[key] : "לא ידוע";
}

function buildEmailHtml({
  appUrl: url,
  facility,
  rating,
  reportTitle,
  sittingTime,
  smell,
  stars,
  stoolCharacter
}: {
  appUrl: string;
  facility: string;
  rating: number;
  reportTitle: string;
  sittingTime: string;
  smell: string;
  stars: string;
  stoolCharacter: string;
}) {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; background: #fffdf8; color: #161616; padding: 28px;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 2px solid #161616; border-radius: 10px; padding: 24px;">
        <div style="font-size: 44px; line-height: 1; margin-bottom: 16px;">💩🎉✨</div>
        <h1 style="margin: 0 0 12px; font-size: 28px;">מישהו דירג את החירבון שלך!</h1>
        <p style="margin: 0 0 18px; font-size: 18px; line-height: 1.6;">
          ${escapeHtml(reportTitle)} קיבל דירוג של <strong>${rating} מתוך 5</strong>
        </p>
        <div style="font-size: 30px; margin: 14px 0 22px;">${stars}</div>
        <div style="background: #f7f0e5; border-radius: 8px; padding: 16px; line-height: 1.8;">
          <div><strong>מתקן:</strong> ${escapeHtml(facility)}</div>
          <div><strong>זמן ישיבה:</strong> ${escapeHtml(sittingTime)}</div>
          <div><strong>אופי החרא:</strong> ${escapeHtml(stoolCharacter)}</div>
          <div><strong>ריח:</strong> ${escapeHtml(smell)}</div>
        </div>
        <p style="margin: 22px 0 0;">
          <a href="${escapeHtml(url)}" style="display: inline-block; background: #2f8f83; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 700;">
            פתיחת דו&quot;חירבון
          </a>
        </p>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
