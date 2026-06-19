import { Trophy } from "lucide-react";

import { reportLabels } from "@/lib/report-labels";
import type { LeaderboardEntry } from "@/types/report";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <section className="rounded-lg border-2 border-ink bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-sun text-ink">
          <Trophy className="size-5" />
        </span>
        <h2 className="text-xl font-black">לוח המדווחים</h2>
      </div>

      <div className="grid gap-3">
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <div key={entry.userId} className="rounded-md border border-ink/15 bg-paper p-3">
              <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3">
                <span className="grid size-9 place-items-center rounded-md bg-ink text-sm font-black text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="font-bold">{entry.displayName}</p>
                  <p className="text-sm text-steel">{entry.reportCount} דוחות</p>
                </div>
                <span className="rounded-md bg-mint px-3 py-1 text-sm font-black text-white">
                  {entry.averageRating.toFixed(1)}
                </span>
              </div>
              {entry.latestReport ? (
                <div className="mt-2 flex flex-wrap gap-1.5 border-t border-ink/10 pt-2">
                  <ReportPill label="מתקן" value={reportLabels.facility[entry.latestReport.facility]} />
                  <ReportPill label="זמן" value={reportLabels.sittingTime[entry.latestReport.sittingTime]} />
                  <ReportPill label="אופי" value={reportLabels.stoolCharacter[entry.latestReport.stoolCharacter]} />
                  <ReportPill label="ריח" value={reportLabels.smell[entry.latestReport.smell]} />
                  <ReportPill label="בידור" value={reportLabels.entertainment[entry.latestReport.entertainment]} />
                  <ReportPill label="לאחר מעשה" value={reportLabels.aftermath[entry.latestReport.aftermath]} />
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className="rounded-md bg-paper p-4 text-sm font-bold text-steel">אין עדיין דוחות להצגה.</p>
        )}
      </div>
    </section>
  );
}

function ReportPill({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-steel ring-1 ring-ink/10">
      <span className="text-ink/40">{label}</span>
      {value}
    </span>
  );
}
