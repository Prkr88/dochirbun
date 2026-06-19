import { describe, expect, it } from "vitest";

import { calculateLeaderboard } from "./calculate-leaderboard";
import type { Report } from "@/types/report";

const report = (overrides: Partial<Report>): Report => ({
  id: "report-1",
  userId: "user-1",
  userEmail: "user@example.com",
  reporterName: "מדווח",
  role: "בודק",
  facility: "organized-toilet",
  sittingTime: "up-to-5",
  peeTiming: "none",
  entertainment: "none",
  color: "dark-brown",
  foodResidue: "none",
  stoolCharacter: "single-lump",
  dropStyle: "direct-hit",
  dropSound: "plooysht",
  exitCharacter: "free-flow",
  smell: "typical",
  paperSquares: "up-to-8",
  rating: 3,
  aftermath: "soap-and-water",
  notes: "פרטים",
  createdAt: "2026-06-19T00:00:00.000Z",
  ...overrides
});

describe("calculateLeaderboard", () => {
  it("sorts by report count and then average rating", () => {
    const entries = calculateLeaderboard([
      report({ id: "1", userId: "alpha", rating: 5 }),
      report({ id: "2", userId: "beta", rating: 4 }),
      report({ id: "3", userId: "beta", rating: 2 }),
      report({ id: "4", userId: "gamma", rating: 5 })
    ]);

    expect(entries).toMatchObject([
      { userId: "beta", displayName: "מדווח", reportCount: 2, averageRating: 3 },
      { userId: "alpha", displayName: "מדווח", reportCount: 1, averageRating: 5 },
      { userId: "gamma", displayName: "מדווח", reportCount: 1, averageRating: 5 }
    ]);
  });

  it("uses reader rating summaries when available", () => {
    const entries = calculateLeaderboard(
      [report({ id: "1", userId: "alpha", rating: 1, reporterName: "אלפא" })],
      {
        "1": {
          average: 4.5,
          count: 2
        }
      }
    );

    expect(entries).toMatchObject([
      { userId: "alpha", displayName: "אלפא", reportCount: 1, averageRating: 4.5 }
    ]);
  });
});
