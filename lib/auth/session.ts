import { cookies } from "next/headers";

import { adminAuth } from "@/lib/firebase/admin";

export async function getCurrentUserId() {
  const token = (await cookies()).get("session")?.value;

  if (!token) {
    return null;
  }

  const decodedToken = await adminAuth().verifySessionCookie(token, true);
  return decodedToken.uid;
}
