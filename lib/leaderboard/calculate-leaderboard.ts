import type { LeaderboardEntry, Report, ReportRatingSummary } from "@/types/report";

export function calculateLeaderboard(
  reports: Report[],
  ratingSummaries: Record<string, ReportRatingSummary> = {}
): LeaderboardEntry[] {
  const users = new Map<
    string,
    { displayName: string; totalRating: number; reportCount: number; latestReport?: Report }
  >();

  for (const report of reports) {
    const current = users.get(report.userId) ?? {
      displayName: report.reporterName,
      totalRating: 0,
      reportCount: 0
    };
    const readerRating = ratingSummaries[report.id];
    const score = readerRating?.count ? readerRating.average : report.rating;
    const isNewer =
      !current.latestReport ||
      new Date(report.createdAt) > new Date(current.latestReport.createdAt);

    users.set(report.userId, {
      displayName: current.displayName,
      totalRating: current.totalRating + score,
      reportCount: current.reportCount + 1,
      latestReport: isNewer ? report : current.latestReport
    });
  }

  return Array.from(users.entries())
    .map(([userId, stats]) => ({
      userId,
      displayName: stats.displayName,
      reportCount: stats.reportCount,
      averageRating: Number((stats.totalRating / stats.reportCount).toFixed(1)),
      latestReport: stats.latestReport
        ? {
            facility: stats.latestReport.facility,
            sittingTime: stats.latestReport.sittingTime,
            entertainment: stats.latestReport.entertainment,
            stoolCharacter: stats.latestReport.stoolCharacter,
            smell: stats.latestReport.smell,
            aftermath: stats.latestReport.aftermath,
            rating: stats.latestReport.rating
          }
        : undefined
    }))
    .sort(
      (a, b) =>
        b.reportCount - a.reportCount ||
        b.averageRating - a.averageRating ||
        a.userId.localeCompare(b.userId)
    );
}
