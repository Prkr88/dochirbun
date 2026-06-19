"use client";

import Link from "next/link";
import { ArrowRight, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthBar } from "@/components/auth-bar";
import { RecentReports } from "@/components/recent-reports";
import { useAuth } from "@/hooks/use-auth";
import { listRatingsForReports, listReportsByUser } from "@/services/reports";
import type { Report, ReportRatingSummary } from "@/types/report";

export default function MyReportsPage() {
  const { isLoading, signIn, signOutUser, user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [ratingSummaries, setRatingSummaries] = useState<Record<string, ReportRatingSummary>>({});
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    let isActive = true;

    async function load() {
      if (!user) {
        setReports([]);
        setRatingSummaries({});
        return;
      }

      setIsDataLoading(true);

      try {
        const nextReports = await listReportsByUser(user.uid);

        if (!isActive) return;

        setReports(nextReports);

        const summaries = await listRatingsForReports(nextReports.map((r) => r.id), user.uid);

        if (!isActive) return;

        setRatingSummaries(summaries);
      } catch {
        if (isActive) setStatus("טעינת הדוחות נכשלה. נסה לרענן את העמוד.");
      } finally {
        if (isActive) setIsDataLoading(false);
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, [user]);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-4xl content-start gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 rounded-md border border-ink/20 bg-white px-3 py-2 font-bold text-steel"
      >
        <ArrowRight className="size-5" />
        חזרה לדוחות
      </Link>
      <header className="border-b-2 border-ink pb-5">
        <h1 className="text-4xl font-black sm:text-6xl">הדוחות שלי</h1>
        <p className="mt-3 text-sm leading-6 text-steel">כל הדוחות שהגשת, מהחדש לישן.</p>
      </header>
      <AuthBar isLoading={isLoading} onSignIn={signIn} onSignOut={signOutUser} user={user} />
      {status ? <p className="rounded-md bg-white p-3 text-sm font-bold text-steel">{status}</p> : null}
      {!user ? (
        <section className="rounded-lg border-2 border-ink bg-paper p-5 shadow-[8px_8px_0_#161616]">
          <h2 className="text-xl font-black">צריך להתחבר כדי לראות דוחות</h2>
          <button
            onClick={signIn}
            disabled={isLoading}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-mint px-4 font-bold text-white disabled:bg-ink/25"
          >
            כניסה עם Google
          </button>
        </section>
      ) : isDataLoading ? (
        <p className="text-sm font-bold text-steel">טוען דוחות...</p>
      ) : reports.length === 0 ? (
        <section className="rounded-lg border-2 border-ink bg-paper p-5 shadow-[8px_8px_0_#161616]">
          <div className="flex items-center gap-3">
            <ScrollText className="size-8 text-steel" />
            <h2 className="text-xl font-black">עוד לא הגשת דוחות</h2>
          </div>
          <Link
            href="/"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-mint px-4 font-bold text-white"
          >
            הגשת דוח ראשון
          </Link>
        </section>
      ) : (
        <RecentReports
          currentUserId={user.uid}
          ratingSummaries={ratingSummaries}
          reports={reports}
        />
      )}
    </main>
  );
}
