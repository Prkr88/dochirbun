"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Leaderboard } from "@/components/leaderboard";
import { seededReports } from "@/lib/demo-reports";
import { calculateLeaderboard } from "@/lib/leaderboard/calculate-leaderboard";
import { listRecentReports } from "@/services/reports";
import type { Report } from "@/types/report";

export default function LeaderboardPage() {
  const [reports, setReports] = useState<Report[]>(seededReports);
  const entries = useMemo(() => calculateLeaderboard(reports), [reports]);

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      try {
        const nextReports = await listRecentReports(100);

        if (isActive && nextReports.length > 0) {
          setReports(nextReports);
        }
      } catch {
        if (isActive) {
          setReports(seededReports);
        }
      }
    }

    loadReports();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-4xl content-start gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-md border border-ink/20 bg-white px-3 py-2 font-bold text-steel">
        <ArrowRight className="size-5" />
        חזרה לדוחות
      </Link>
      <header className="border-b-2 border-ink pb-5">
        <h1 className="text-4xl font-black sm:text-6xl">לוח המדווחים</h1>
        <p className="mt-3 text-sm leading-6 text-steel">דירוג המדווחים לפי כמות דוחות ודירוג החוויה הממוצע.</p>
      </header>
      <Leaderboard entries={entries} />
    </main>
  );
}
