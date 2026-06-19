import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { firebaseStorage, firestore } from "@/lib/firebase/client";
import type { NewReportInput, Report } from "@/types/report";

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
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image file must be 10 MB or smaller.");
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

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      userId: data.userId,
      userEmail: data.userEmail,
      userPhotoUrl: data.userPhotoUrl,
      reporterName: data.reporterName,
      serviceNumber: data.serviceNumber,
      role: data.role,
      facility: data.facility,
      improvisedFacilityDescription: data.improvisedFacilityDescription,
      sittingTime: data.sittingTime,
      peeTiming: data.peeTiming,
      entertainment: data.entertainment,
      entertainmentOther: data.entertainmentOther,
      color: data.color,
      colorOther: data.colorOther,
      foodResidue: data.foodResidue,
      foodResidueOther: data.foodResidueOther,
      stoolCharacter: data.stoolCharacter,
      dropStyle: data.dropStyle,
      dropSound: data.dropSound,
      exitCharacter: data.exitCharacter,
      smell: data.smell,
      smellOther: data.smellOther,
      paperSquares: data.paperSquares,
      rating: data.rating,
      aftermath: data.aftermath,
      notes: data.notes,
      imageUrl: data.imageUrl,
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString()
    };
  });
}
