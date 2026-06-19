import type { LeaderboardEntry, Report } from "@/types/report";

export function calculateLeaderboard(reports: Report[]): LeaderboardEntry[] {
  const users = new Map<string, { totalRating: number; reportCount: number }>();

  for (const report of reports) {
    const current = users.get(report.userId) ?? { totalRating: 0, reportCount: 0 };

    users.set(report.userId, {
      totalRating: current.totalRating + report.rating,
      reportCount: current.reportCount + 1
    });
  }

  return Array.from(users.entries())
    .map(([userId, stats]) => ({
      userId,
      displayName: `מדווח ${userId.slice(0, 4).toUpperCase()}`,
      reportCount: stats.reportCount,
      averageRating: Number((stats.totalRating / stats.reportCount).toFixed(1))
    }))
    .sort(
      (a, b) =>
        b.reportCount - a.reportCount ||
        b.averageRating - a.averageRating ||
        a.userId.localeCompare(b.userId)
    );
}
