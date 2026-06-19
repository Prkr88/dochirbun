"use client";

import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { useEffect, useState } from "react";

import { firebaseAuth } from "@/lib/firebase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signIn() {
    await signInWithPopup(firebaseAuth(), new GoogleAuthProvider());
  }

  async function signOutUser() {
    await signOut(firebaseAuth());
  }

  return { isLoading, signIn, signOutUser, user };
}
