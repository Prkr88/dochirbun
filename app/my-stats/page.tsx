"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AuthBar } from "@/components/auth-bar";
import { useAuth } from "@/hooks/use-auth";
import { reportLabels } from "@/lib/report-labels";
import { listRatingsForReports, listRecentReports, listReportsByUser } from "@/services/reports";
import type { Report, ReportRatingSummary } from "@/types/report";

type FieldKey = "facility" | "sittingTime" | "color" | "smell" | "stoolCharacter" | "aftermath" | "dropStyle" | "dropSound";

const FIELD_DISPLAY_LABELS: Record<FieldKey, string> = {
  facility: "סוג מתקן",
  sittingTime: "זמן ישיבה",
  color: "צבע",
  smell: "ריח",
  stoolCharacter: "אופי",
  aftermath: "שטיפת ידיים",
  dropStyle: "סגנון נחיתה",
  dropSound: "צליל",
};

const COMPARE_FIELDS: FieldKey[] = ["facility", "sittingTime", "color", "smell", "stoolCharacter", "aftermath"];

function computeDistribution(reports: Report[], field: FieldKey): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const report of reports) {
    const val = String(report[field as keyof Report] ?? "");
    if (val) counts[val] = (counts[val] ?? 0) + 1;
  }
  return counts;
}

function mostCommonValue(reports: Report[], field: FieldKey): string | null {
  const dist = computeDistribution(reports, field);
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}

function computeAvg(values: number[]): number | null {
  if (values.length === 0) return null;
  return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
}

function getFieldLabels(field: FieldKey): Record<string, string> {
  return (reportLabels as Record<string, Record<string, string>>)[field] ?? {};
}

export default function MyStatsPage() {
  const { isLoading, signIn, signOutUser, user } = useAuth();
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [allRatingSummaries, setAllRatingSummaries] = useState<Record<string, ReportRatingSummary>>({});
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    let isActive = true;

    async function load() {
      if (!user) {
        setMyReports([]);
        setAllReports([]);
        setAllRatingSummaries({});
        return;
      }

      setIsDataLoading(true);

      try {
        const [nextMyReports, nextAllReports] = await Promise.all([
          listReportsByUser(user.uid),
          listRecentReports(100),
        ]);

        if (!isActive) return;

        const summaries = await listRatingsForReports(nextAllReports.map((r) => r.id));

        if (!isActive) return;

        setMyReports(nextMyReports);
        setAllReports(nextAllReports);
        setAllRatingSummaries(summaries);
      } catch {
        if (isActive) setStatus("טעינת הנתונים נכשלה. נסה לרענן את העמוד.");
      } finally {
        if (isActive) setIsDataLoading(false);
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, [user]);

  const stats = useMemo(() => {
    if (myReports.length === 0 || allReports.length === 0) return null;

    const userGroups = new Map<string, Report[]>();
    for (const report of allReports) {
      const group = userGroups.get(report.userId) ?? [];
      group.push(report);
      userGroups.set(report.userId, group);
    }

    if (!userGroups.has(user!.uid)) {
      userGroups.set(user!.uid, myReports);
    }

    const myCount = myReports.length;
    const allUserCounts = Array.from(userGroups.values()).map((g) => g.length);
    const countPercentile = Math.round(
      (allUserCounts.filter((c) => c < myCount).length / allUserCounts.length) * 100
    );
    const myRankByCount = allUserCounts.filter((c) => c > myCount).length + 1;

    const myRatingValues = myReports
      .map((r) => allRatingSummaries[r.id])
      .filter((s): s is ReportRatingSummary => Boolean(s?.count))
      .map((s) => s.average);
    const myAvgReaderRating = computeAvg(myRatingValues);

    const systemRatingValues = Object.values(allRatingSummaries)
      .filter((s) => s.count > 0)
      .map((s) => s.average);
    const systemAvgReaderRating = computeAvg(systemRatingValues);

    const userAvgRatings: number[] = [];
    for (const [, reports] of userGroups) {
      const vals = reports
        .map((r) => allRatingSummaries[r.id])
        .filter((s): s is ReportRatingSummary => Boolean(s?.count))
        .map((s) => s.average);
      if (vals.length > 0) {
        userAvgRatings.push(vals.reduce((a, b) => a + b, 0) / vals.length);
      }
    }
    const ratingPercentile =
      myAvgReaderRating !== null && userAvgRatings.length > 0
        ? Math.round(
            (userAvgRatings.filter((r) => r < myAvgReaderRating!).length / userAvgRatings.length) * 100
          )
        : null;

    const fieldStats = COMPARE_FIELDS.map((field) => {
      const systemDist = computeDistribution(allReports, field);
      const myMost = mostCommonValue(myReports, field);
      const labels = getFieldLabels(field);
      const total = allReports.length;

      const values = Object.entries(systemDist)
        .map(([val, count]) => ({
          val,
          label: labels[val] ?? val,
          pct: Math.round((count / total) * 100),
          isMyMost: val === myMost,
        }))
        .sort((a, b) => b.pct - a.pct);

      return { field, label: FIELD_DISPLAY_LABELS[field], values, myMost };
    });

    return {
      myCount,
      totalReports: allReports.length,
      totalUsers: userGroups.size,
      countPercentile,
      myRankByCount,
      myAvgReaderRating,
      systemAvgReaderRating,
      ratingPercentile,
      fieldStats,
    };
  }, [myReports, allReports, allRatingSummaries, user]);

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
        <h1 className="text-4xl font-black sm:text-6xl">הסטטיסטיקה שלי</h1>
        <p className="mt-3 text-sm leading-6 text-steel">
          השוואת הדוחות שלך מול כלל הדוחות במערכת (מבוסס על 100 הדוחות האחרונים).
        </p>
      </header>
      <AuthBar isLoading={isLoading} onSignIn={signIn} onSignOut={signOutUser} user={user} />
      {status ? <p className="rounded-md bg-white p-3 text-sm font-bold text-steel">{status}</p> : null}
      {!user ? (
        <section className="rounded-lg border-2 border-ink bg-paper p-5 shadow-[8px_8px_0_#161616]">
          <h2 className="text-xl font-black">צריך להתחבר כדי לראות סטטיסטיקות</h2>
          <button
            onClick={signIn}
            disabled={isLoading}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-mint px-4 font-bold text-white disabled:bg-ink/25"
          >
            כניסה עם Google
          </button>
        </section>
      ) : isDataLoading ? (
        <p className="text-sm font-bold text-steel">טוען נתונים...</p>
      ) : myReports.length === 0 ? (
        <section className="rounded-lg border-2 border-ink bg-paper p-5 shadow-[8px_8px_0_#161616]">
          <h2 className="text-xl font-black">עוד לא הגשת דוחות</h2>
          <p className="mt-2 text-sm text-steel">הגש את הדוח הראשון שלך כדי לראות סטטיסטיקות.</p>
          <Link
            href="/"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-mint px-4 font-bold text-white"
          >
            לדף הראשי
          </Link>
        </section>
      ) : stats ? (
        <div className="grid gap-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_#161616]">
              <p className="text-sm font-bold text-steel">הדוחות שלך</p>
              <p className="mt-1 text-3xl font-black">{stats.myCount}</p>
              <p className="mt-1 text-xs font-bold text-steel">
                מתוך {stats.totalReports} דוחות ו-{stats.totalUsers} מדווחים
              </p>
            </div>
            <div className="rounded-lg border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_#161616]">
              <p className="text-sm font-bold text-steel">מיקום בכמות</p>
              <p className="mt-1 text-3xl font-black">#{stats.myRankByCount}</p>
              <p className="mt-1 text-xs font-bold text-steel">
                עדיף מ-{stats.countPercentile}% מהמדווחים
              </p>
            </div>
            <div className="col-span-2 rounded-lg border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_#161616] sm:col-span-1">
              <p className="text-sm font-bold text-steel">דירוג ממוצע</p>
              {stats.myAvgReaderRating !== null ? (
                <>
                  <p className="mt-1 text-3xl font-black">{stats.myAvgReaderRating} ⭐</p>
                  <p className="mt-1 text-xs font-bold text-steel">
                    ממוצע מערכת: {stats.systemAvgReaderRating ?? "—"} ⭐
                    {stats.ratingPercentile !== null ? ` · עדיף מ-${stats.ratingPercentile}%` : ""}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm font-bold text-steel">עוד לא קיבלת דירוגים</p>
              )}
            </div>
          </div>

          <section>
            <h2 className="mb-2 text-2xl font-black">השוואת שדות</h2>
            <p className="mb-5 text-sm text-steel">
              הערך הנפוץ ביותר שלך מסומן בירוק. האחוזים מייצגים את חלוקת כלל הדוחות.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {stats.fieldStats.map(({ field, label, values, myMost }) => (
                <div key={field} className="rounded-lg border border-ink/15 bg-white p-4">
                  <h3 className="mb-3 font-black">{label}</h3>
                  <div className="grid gap-2">
                    {values.map(({ val, label: valLabel, pct, isMyMost }) => (
                      <div key={val}>
                        <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold">
                          <span className={isMyMost ? "text-mint" : "text-steel"}>{valLabel}</span>
                          <span className={isMyMost ? "font-black text-mint" : "text-steel"}>{pct}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-ink/10">
                          <div
                            className={`h-2 rounded-full ${isMyMost ? "bg-mint" : "bg-ink/25"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {myMost ? (
                    <p className="mt-3 text-xs font-bold text-steel">
                      הערך הנפוץ ביותר שלך:{" "}
                      <span className="text-mint">{getFieldLabels(field)[myMost] ?? myMost}</span>
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
