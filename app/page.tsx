"use client";

import Image from "next/image";
import Link from "next/link";
import { ClipboardList, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AuthBar } from "@/components/auth-bar";
import { RecentReports } from "@/components/recent-reports";
import { ReportForm } from "@/components/report-form";
import { useAuth } from "@/hooks/use-auth";
import { seededReports } from "@/lib/demo-reports";
import { createReport, listRatingsForReports, listRecentReports, rateReport } from "@/services/reports";
import type { NewReportInput, Report, ReportRating, ReportRatingSummary } from "@/types/report";

export default function Home() {
  const { isLoading, signIn, signOutUser, user } = useAuth();
  const [reports, setReports] = useState<Report[]>(seededReports);
  const [ratingSummaries, setRatingSummaries] = useState<Record<string, ReportRatingSummary>>({});
  const [status, setStatus] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRating, setIsRating] = useState(false);

  const refreshRatings = useCallback(
    async (nextReports: Report[]) => {
      const summaries = await listRatingsForReports(
        nextReports.map((report) => report.id),
        user?.uid
      );
      setRatingSummaries(summaries);
    },
    [user?.uid]
  );

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      try {
        const nextReports = await listRecentReports();

        if (!isActive) {
          return;
        }

        const visibleReports = nextReports.length > 0 ? nextReports : seededReports;
        setReports(visibleReports);
        await refreshRatings(visibleReports);
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
  }, [refreshRatings]);

  async function handleSubmit(input: NewReportInput, imageFile?: File) {
    if (!user?.email) {
      setStatus("צריך להתחבר עם Google לפני שליחת דו\"ח.");
      return;
    }

    setIsSubmitting(true);
    setStatus(undefined);

    try {
      const docRef = await createReport({
        imageFile,
        input,
        userEmail: user.email,
        userId: user.uid,
        userPhotoUrl: user.photoURL ?? undefined
      });

      const nextReports = [
        {
          id: docRef.id,
          userId: user.uid,
          userEmail: user.email ?? "",
          userPhotoUrl: user.photoURL ?? undefined,
          createdAt: new Date().toISOString(),
          ...input
        },
        ...reports
      ];

      setReports(nextReports);
      await refreshRatings(nextReports);
      setStatus("הדו\"ח נשמר בהצלחה.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "שמירת הדו\"ח נכשלה.";
      setStatus(
        message.includes("storage") || message.includes("Storage")
          ? "שמירת התמונה נכשלה כי Firebase Storage עדיין לא פעיל. אפשר לשלוח דו\"ח בלי תמונה או להפעיל Storage בהמשך."
          : message
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRate(reportId: string, rating: ReportRating) {
    if (!user) {
      setStatus("צריך להתחבר עם Google כדי לדרג דו\"ח.");
      return;
    }

    setIsRating(true);
    setStatus(undefined);

    try {
      if (reportId.startsWith("seed-")) {
        setRatingSummaries((current) => ({
          ...current,
          [reportId]: {
            average: rating,
            count: 1,
            currentUserRating: rating
          }
        }));
      } else {
        await rateReport(reportId, user.uid, rating);
        await refreshRatings(reports);
      }
    } catch {
      setStatus("שמירת הדירוג נכשלה. נסה שוב.");
    } finally {
      setIsRating(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <header className="grid gap-6 border-b-2 border-ink pb-6 lg:grid-cols-[1fr_22rem] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-bold text-white">
            <ClipboardList className="size-4" />
            כי כל חוויה ראויה לתיעוד.
          </div>
          <h1 className="text-5xl font-black leading-tight sm:text-7xl">דו&quot;ח חירבון</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-steel">
            מערכת הומוריסטית לתיעוד חירבונים בלבד, עם דירוג, פרטים טכניים, ותמונה אופציונלית.
          </p>
          <Link
            href="/leaderboard"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-ink/25 bg-white px-4 font-bold text-steel"
          >
            <Trophy className="size-5" />
            לוח המדווחים
          </Link>
        </div>
        <Image
          src="/receipt-stack.svg"
          alt="איור של דוח מתועד"
          width={640}
          height={460}
          priority
          className="h-auto w-full max-w-sm justify-self-center"
        />
      </header>

      <section className="mx-auto grid w-full max-w-4xl content-start gap-5">
        <AuthBar isLoading={isLoading} onSignIn={signIn} onSignOut={signOutUser} user={user} />
        {status ? <p className="rounded-md bg-white p-3 text-sm font-bold text-steel">{status}</p> : null}
        <div>
          <h2 className="text-2xl font-black">דו&quot;ח חדש</h2>
          <p className="mt-2 text-sm text-steel">כל השדות המסומנים נדרשים. הטופס מיועד לחירבונים בלבד.</p>
        </div>
        {user ? (
          <ReportForm isAuthenticated={Boolean(user)} isSubmitting={isSubmitting} onSubmit={handleSubmit} />
        ) : (
          <section className="rounded-lg border-2 border-ink bg-paper p-5 shadow-[8px_8px_0_#161616]">
            <h3 className="text-xl font-black">צריך להתחבר כדי לפרסם דו&quot;ח</h3>
            <p className="mt-2 text-sm leading-6 text-steel">
              אפשר לקרוא ולדרג דוחות רק לאחר כניסה. פרסום דו&quot;ח חדש מחייב חשבון Google.
            </p>
            <button
              onClick={signIn}
              disabled={isLoading}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-mint px-4 font-bold text-white disabled:bg-ink/25"
            >
              כניסה עם Google
            </button>
          </section>
        )}
        <RecentReports
          currentUserId={user?.uid}
          isRating={isRating}
          onRate={handleRate}
          ratingSummaries={ratingSummaries}
          reports={reports}
        />
      </section>
    </main>
  );
}
