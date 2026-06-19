"use client";

import Image from "next/image";
import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";

import { AuthBar } from "@/components/auth-bar";
import { Leaderboard } from "@/components/leaderboard";
import { RecentReports } from "@/components/recent-reports";
import { ReportForm } from "@/components/report-form";
import { useAuth } from "@/hooks/use-auth";
import { calculateLeaderboard } from "@/lib/leaderboard/calculate-leaderboard";
import { createReport } from "@/services/reports";
import type { NewReportInput, Report } from "@/types/report";

const seededReports: Report[] = [
  {
    id: "seed-1",
    userId: "matan",
    userEmail: "matan@example.com",
    reporterName: "מתן",
    role: "מתעד שטח",
    facility: "organized-toilet",
    sittingTime: "up-to-5",
    peeTiming: "during",
    entertainment: "phone",
    color: "dark-brown",
    foodResidue: "corn",
    stoolCharacter: "single-lump",
    dropStyle: "direct-hit",
    dropSound: "plaaank",
    exitCharacter: "free-flow",
    smell: "typical",
    paperSquares: "magic",
    rating: 5,
    aftermath: "soap-and-water",
    notes: "אירוע נקי, מדויק, עם תחושת סגירה מלאה.",
    createdAt: "2026-06-19T08:00:00.000Z"
  },
  {
    id: "seed-2",
    userId: "noya",
    userEmail: "noya@example.com",
    reporterName: "נועה",
    role: "אחראית משמרת",
    facility: "chemical-toilet",
    sittingTime: "up-to-15",
    peeTiming: "before",
    entertainment: "none",
    color: "light-brown",
    foodResidue: "none",
    stoolCharacter: "multiple-lumps",
    dropStyle: "porcelain-slide-marked",
    dropSound: "tink-tink-tink",
    exitCharacter: "sweaty-effort",
    smell: "unbearable",
    paperSquares: "up-to-30",
    rating: 2,
    aftermath: "alcohol-gel",
    notes: "החוויה תועדה לטובת ההיסטוריה בלבד.",
    createdAt: "2026-06-19T09:30:00.000Z"
  }
];

export default function Home() {
  const { isLoading, signIn, signOutUser, user } = useAuth();
  const [reports, setReports] = useState<Report[]>(seededReports);
  const [status, setStatus] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const leaderboard = useMemo(() => calculateLeaderboard(reports), [reports]);

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

      setReports((current) => [
        {
          id: docRef.id,
          userId: user.uid,
          userEmail: user.email ?? "",
          userPhotoUrl: user.photoURL ?? undefined,
          createdAt: new Date().toISOString(),
          ...input
        },
        ...current
      ]);
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="grid content-start gap-5">
          <AuthBar isLoading={isLoading} onSignIn={signIn} onSignOut={signOutUser} user={user} />
          {status ? <p className="rounded-md bg-white p-3 text-sm font-bold text-steel">{status}</p> : null}
          <div>
            <h2 className="text-2xl font-black">דו&quot;ח חדש</h2>
            <p className="mt-2 text-sm text-steel">כל השדות המסומנים נדרשים. הטופס מיועד לחירבונים בלבד.</p>
          </div>
          <ReportForm isAuthenticated={Boolean(user)} isSubmitting={isSubmitting} onSubmit={handleSubmit} />
          <RecentReports reports={reports} />
        </section>

        <aside className="grid content-start gap-5">
          <Leaderboard entries={leaderboard} />
          <section className="rounded-lg bg-ink p-5 text-white">
            <h2 className="text-xl font-black">סטטוס Production</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt>Auth</dt>
                <dd className="font-bold text-sun">Google</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Database</dt>
                <dd className="font-bold text-sun">Firestore</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Images</dt>
                <dd className="font-bold text-sun">Storage</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}
