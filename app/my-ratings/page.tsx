"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthBar } from "@/components/auth-bar";
import { useAuth } from "@/hooks/use-auth";
import { reportLabels } from "@/lib/report-labels";
import { listRatingsByUser, listReportsByIds } from "@/services/reports";
import type { Report, ReportUserRating } from "@/types/report";

export default function MyRatingsPage() {
  const { isLoading, signIn, signOutUser, user } = useAuth();
  const [ratings, setRatings] = useState<ReportUserRating[]>([]);
  const [reportsById, setReportsById] = useState<Record<string, Report>>({});
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    let isActive = true;

    async function loadRatings() {
      if (!user) {
        setRatings([]);
        setReportsById({});
        return;
      }

      try {
        const nextRatings = await listRatingsByUser(user.uid);
        const nextReports = await listReportsByIds(nextRatings.map((rating) => rating.reportId));

        if (!isActive) {
          return;
        }

        setRatings(nextRatings);
        setReportsById(Object.fromEntries(nextReports.map((report) => [report.id, report])));
      } catch {
        if (isActive) {
          setStatus("טעינת הדירוגים נכשלה. נסה לרענן את העמוד.");
        }
      }
    }

    loadRatings();

    return () => {
      isActive = false;
    };
  }, [user]);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-4xl content-start gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-md border border-ink/20 bg-white px-3 py-2 font-bold text-steel">
        <ArrowRight className="size-5" />
        חזרה לדוחות
      </Link>
      <header className="border-b-2 border-ink pb-5">
        <h1 className="text-4xl font-black sm:text-6xl">הדירוגים שלי</h1>
        <p className="mt-3 text-sm leading-6 text-steel">כל הדוחות שדירגת, מסודרים מהעדכני ביותר.</p>
      </header>
      <AuthBar isLoading={isLoading} onSignIn={signIn} onSignOut={signOutUser} user={user} />
      {status ? <p className="rounded-md bg-white p-3 text-sm font-bold text-steel">{status}</p> : null}
      {!user ? (
        <section className="rounded-lg border-2 border-ink bg-paper p-5 shadow-[8px_8px_0_#161616]">
          <h2 className="text-xl font-black">צריך להתחבר כדי לראות דירוגים</h2>
          <button
            onClick={signIn}
            disabled={isLoading}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-mint px-4 font-bold text-white disabled:bg-ink/25"
          >
            כניסה עם Google
          </button>
        </section>
      ) : (
        <section className="grid gap-3">
          {ratings.length === 0 ? (
            <p className="rounded-lg border border-ink/15 bg-white p-4 text-sm font-bold text-steel">
              עוד לא דירגת דוחות.
            </p>
          ) : null}
          {ratings.map((rating) => {
            const report = reportsById[rating.reportId];

            return (
              <article key={`${rating.reportId}_${rating.userId}`} className="rounded-lg border border-ink/15 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-black">{report?.reporterName ?? "דוח שנמחק"}</h2>
                    <p className="mt-1 text-sm text-steel">{report?.role ?? rating.reportId}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-sun px-2 py-1 text-sm font-black">
                    <Star className="size-4" fill="currentColor" />
                    {rating.rating} - {reportLabels.rating[rating.rating]}
                  </span>
                </div>
                {rating.updatedAt ? (
                  <p className="mt-3 text-xs font-bold text-steel">
                    עודכן ב-{new Date(rating.updatedAt).toLocaleDateString("he-IL")}
                  </p>
                ) : null}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
