"use client";

import Image from "next/image";
import { Clock, Droplets, Star } from "lucide-react";

import { playFartSound } from "@/lib/fart-sound";
import { reportLabels } from "@/lib/report-labels";
import type { Report, ReportRating, ReportRatingSummary } from "@/types/report";

interface RecentReportsProps {
  currentUserId?: string;
  isRating?: boolean;
  onRate?: (reportId: string, rating: ReportRating) => void | Promise<void>;
  reports: Report[];
  ratingSummaries?: Record<string, ReportRatingSummary>;
}

export function RecentReports({
  currentUserId,
  isRating,
  onRate,
  ratingSummaries = {},
  reports
}: RecentReportsProps) {
  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-black">דוחות חירבון אחרונים</h2>
      {reports.length === 0 ? (
        <p className="rounded-lg border border-ink/15 bg-white p-4 text-sm font-bold text-steel">
          אין עדיין דוחות. הדו&quot;ח הראשון יופיע כאן אחרי שליחה.
        </p>
      ) : null}
      {reports.map((report) => {
        const ratingSummary = ratingSummaries[report.id];

        return (
          <article key={report.id} className="grid gap-4 rounded-lg border border-ink/15 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black">{report.reporterName}</h3>
                <p className="mt-1 text-sm text-steel">{report.role}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-sun px-2 py-1 text-sm font-black">
                <Star className="size-4" fill="currentColor" />
                {report.rating} - {reportLabels.rating[report.rating]}
              </span>
            </div>

            {report.imageUrl ? (
              <Image src={report.imageUrl} alt="" width={640} height={360} className="max-h-80 w-full rounded-md object-cover" />
            ) : null}

            <div className="grid gap-2 text-sm leading-6 text-ink/80 sm:grid-cols-2">
              <ReportFact label="מתקן" value={reportLabels.facility[report.facility]} />
              <ReportFact label="זמן ישיבה" value={reportLabels.sittingTime[report.sittingTime]} />
              <ReportFact label="צבע" value={report.color === "other" ? report.colorOther : reportLabels.color[report.color]} />
              <ReportFact label="אופי" value={reportLabels.stoolCharacter[report.stoolCharacter]} />
              <ReportFact label="נפילה" value={reportLabels.dropStyle[report.dropStyle]} />
              <ReportFact label="רעש" value={reportLabels.dropSound[report.dropSound]} />
              <ReportFact label="ריח" value={report.smell === "other" ? report.smellOther : reportLabels.smell[report.smell]} />
              <ReportFact label="לאחר מעשה" value={reportLabels.aftermath[report.aftermath]} />
            </div>

            <ReportRatingControl
              currentUserId={currentUserId}
              isRating={isRating}
              onRate={onRate}
              reportId={report.id}
              summary={ratingSummary}
            />

            <p className="rounded-md bg-paper p-3 text-sm leading-6 text-ink/80">{report.notes}</p>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-steel">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-4" />
                {new Date(report.createdAt).toLocaleDateString("he-IL")}
              </span>
              <span className="inline-flex items-center gap-1">
                <Droplets className="size-4" />
                דו&quot;ח חירבון בלבד
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ReportFact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-3 rounded-md bg-paper px-3 py-2">
      <span className="font-bold text-steel">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ReportRatingControl({
  currentUserId,
  isRating,
  onRate,
  reportId,
  summary
}: {
  currentUserId?: string;
  isRating?: boolean;
  onRate?: (reportId: string, rating: ReportRating) => void | Promise<void>;
  reportId: string;
  summary?: ReportRatingSummary;
}) {
  return (
    <div className="grid gap-2 rounded-md border border-ink/15 bg-paper p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-black text-steel">דירוג קוראים</span>
        <span className="text-sm font-bold text-ink/75">
          {summary?.count ? `${summary.average.toFixed(1)} מתוך 5 (${summary.count})` : "אין דירוגים עדיין"}
        </span>
      </div>
      {currentUserId ? (
        <div className="flex gap-2" aria-label="דירוג הדוח">
          {([1, 2, 3, 4, 5] as ReportRating[]).map((rating) => (
            <button
              key={rating}
              type="button"
              disabled={isRating}
              onClick={() => {
                playFartSound();
                onRate?.(reportId, rating);
              }}
              className={`grid size-10 place-items-center rounded-md border transition disabled:cursor-wait ${
                summary?.currentUserRating && rating <= summary.currentUserRating
                  ? "border-ink bg-sun text-ink"
                  : "border-ink/20 bg-white text-ink/45"
              }`}
              aria-label={`${rating} מתוך 5`}
            >
              <Star className="size-5" fill="currentColor" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm font-bold text-steel">יש להתחבר כדי לדרג דוחות.</p>
      )}
    </div>
  );
}
