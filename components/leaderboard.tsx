import { Trophy } from "lucide-react";

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
        {entries.map((entry, index) => (
          <div key={entry.userId} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-md border border-ink/15 bg-paper p-3">
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
        ))}
      </div>
    </section>
  );
}
