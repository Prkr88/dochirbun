import Image from "next/image";
import { Clock, Droplets, Star } from "lucide-react";

import { reportLabels } from "@/lib/report-labels";
import type { Report } from "@/types/report";

interface RecentReportsProps {
  reports: Report[];
}

export function RecentReports({ reports }: RecentReportsProps) {
  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-black">דוחות חירבון אחרונים</h2>
      {reports.map((report) => (
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
      ))}
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
