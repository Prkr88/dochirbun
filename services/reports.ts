import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { firebaseStorage, firestore } from "@/lib/firebase/client";
import type { NewReportInput, Report, ReportRating, ReportRatingSummary, ReportUserRating } from "@/types/report";

interface CreateReportOptions {
  userId: string;
  userEmail: string;
  userPhotoUrl?: string;
  input: NewReportInput;
  imageFile?: File;
}

export async function createReport({ imageFile, input, userEmail, userId, userPhotoUrl }: CreateReportOptions) {
  const reports = collection(firestore(), "reports");
  const imageUrl = imageFile ? await uploadReportImage(userId, imageFile) : undefined;

  return addDoc(reports, stripUndefined({
    ...input,
    imageUrl,
    userId,
    userEmail,
    userPhotoUrl,
    createdAt: serverTimestamp()
  }));
}

async function uploadReportImage(userId: string, file: File) {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Image file must be 2 MB or smaller.");
  }

  const storageRef = ref(firebaseStorage(), `reports/${userId}/${crypto.randomUUID()}-${file.name}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

function stripUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined));
}

export async function listRecentReports(maxReports = 20): Promise<Report[]> {
  const reports = collection(firestore(), "reports");
  const snapshot = await getDocs(query(reports, orderBy("createdAt", "desc"), limit(maxReports)));

  return snapshot.docs.map((reportDoc) => mapReportDocument(reportDoc.id, reportDoc.data()));
}

export async function rateReport(reportId: string, userId: string, rating: ReportRating) {
  const ratingRef = doc(firestore(), "reportRatings", `${reportId}_${userId}`);

  return setDoc(
    ratingRef,
    {
      reportId,
      userId,
      rating,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function listRatingsForReports(reportIds: string[], currentUserId?: string) {
  const uniqueReportIds = Array.from(new Set(reportIds.filter(Boolean)));

  if (uniqueReportIds.length === 0) {
    return {};
  }

  const ratings = collection(firestore(), "reportRatings");
  const userRatings: ReportUserRating[] = [];

  for (let index = 0; index < uniqueReportIds.length; index += 30) {
    const reportIdChunk = uniqueReportIds.slice(index, index + 30);
    const snapshot = await getDocs(query(ratings, where("reportId", "in", reportIdChunk)));
    userRatings.push(...snapshot.docs.map((ratingDoc) => ratingDoc.data() as ReportUserRating));
  }

  return summarizeRatings(userRatings, currentUserId);
}

export async function listRatingsByUser(userId: string): Promise<ReportUserRating[]> {
  const ratings = collection(firestore(), "reportRatings");
  const snapshot = await getDocs(query(ratings, where("userId", "==", userId), orderBy("updatedAt", "desc")));

  return snapshot.docs.map((ratingDoc) => {
    const data = ratingDoc.data();

    return {
      reportId: data.reportId,
      userId: data.userId,
      rating: data.rating,
      updatedAt: data.updatedAt?.toDate?.().toISOString?.()
    };
  });
}

export async function listReportsByIds(reportIds: string[]) {
  const uniqueReportIds = Array.from(new Set(reportIds.filter(Boolean)));

  if (uniqueReportIds.length === 0) {
    return [];
  }

  const reports = collection(firestore(), "reports");
  const foundReports: Report[] = [];

  for (let index = 0; index < uniqueReportIds.length; index += 30) {
    const reportIdChunk = uniqueReportIds.slice(index, index + 30);
    const snapshot = await getDocs(query(reports, where("__name__", "in", reportIdChunk)));

    foundReports.push(...snapshot.docs.map((reportDoc) => mapReportDocument(reportDoc.id, reportDoc.data())));
  }

  return foundReports;
}

export function summarizeRatings(ratings: ReportUserRating[], currentUserId?: string) {
  const summaries: Record<string, ReportRatingSummary> = {};

  for (const userRating of ratings) {
    const summary = summaries[userRating.reportId] ?? { average: 0, count: 0 };

    summary.average = Number(
      ((summary.average * summary.count + userRating.rating) / (summary.count + 1)).toFixed(1)
    );
    summary.count += 1;

    if (userRating.userId === currentUserId) {
      summary.currentUserRating = userRating.rating;
    }

    summaries[userRating.reportId] = summary;
  }

  return summaries;
}

function mapReportDocument(id: string, data: Record<string, unknown>): Report {
  return {
    id,
    userId: data.userId as string,
    userEmail: data.userEmail as string,
    userPhotoUrl: data.userPhotoUrl as string | undefined,
    reporterName: data.reporterName as string,
    serviceNumber: data.serviceNumber as string | undefined,
    role: data.role as string,
    facility: data.facility as Report["facility"],
    improvisedFacilityDescription: data.improvisedFacilityDescription as string | undefined,
    sittingTime: data.sittingTime as Report["sittingTime"],
    peeTiming: data.peeTiming as Report["peeTiming"],
    entertainment: data.entertainment as Report["entertainment"],
    entertainmentOther: data.entertainmentOther as string | undefined,
    color: data.color as Report["color"],
    colorOther: data.colorOther as string | undefined,
    foodResidue: data.foodResidue as Report["foodResidue"],
    foodResidueOther: data.foodResidueOther as string | undefined,
    stoolCharacter: data.stoolCharacter as Report["stoolCharacter"],
    dropStyle: data.dropStyle as Report["dropStyle"],
    dropSound: data.dropSound as Report["dropSound"],
    exitCharacter: data.exitCharacter as Report["exitCharacter"],
    smell: data.smell as Report["smell"],
    smellOther: data.smellOther as string | undefined,
    paperSquares: data.paperSquares as Report["paperSquares"],
    rating: data.rating as ReportRating,
    aftermath: data.aftermath as Report["aftermath"],
    notes: data.notes as string,
    imageUrl: data.imageUrl as string | undefined,
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.().toISOString?.() ?? new Date().toISOString()
  };
}
