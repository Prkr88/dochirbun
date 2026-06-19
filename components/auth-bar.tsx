"use client";

import Image from "next/image";
import { LogIn, LogOut } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

interface AuthBarProps {
  user: ReturnType<typeof useAuth>["user"];
  isLoading: boolean;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function AuthBar({ isLoading, onSignIn, onSignOut, user }: AuthBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-ink/15 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-black">כניסה עם Google</p>
        <p className="text-sm leading-6 text-steel">
          השם, האימייל והתמונה המשויכים לחשבון יישמרו בעת שליחת הטופס.
        </p>
      </div>
      {user ? (
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <Image src={user.photoURL} alt="" width={40} height={40} className="size-10 rounded-full" />
          ) : null}
          <span className="max-w-44 truncate text-sm font-bold">{user.email}</span>
          <button onClick={onSignOut} className="grid size-10 place-items-center rounded-md bg-ink text-white" aria-label="יציאה">
            <LogOut className="size-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={onSignIn}
          disabled={isLoading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-mint px-4 font-bold text-white disabled:bg-ink/25"
        >
          <LogIn className="size-5" />
          כניסה
        </button>
      )}
    </div>
  );
}
