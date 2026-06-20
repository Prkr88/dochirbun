import type { User } from "firebase/auth";

import type { ReportRating } from "@/types/report";

export async function notifyReportRating({
  rating,
  reportId,
  user
}: {
  rating: ReportRating;
  reportId: string;
  user: User;
}) {
  const token = await user.getIdToken();

  await fetch("/api/report-rating-notification", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ rating, reportId })
  });
}
