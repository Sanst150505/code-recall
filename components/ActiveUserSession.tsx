"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ActiveUserSession({ currentUsername }: { currentUsername?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userInUrl = searchParams.get("user")?.trim();

    if (userInUrl) {
      // Save the active user in browser storage
      try {
        localStorage.setItem("code_recall_active_user", userInUrl);
      } catch {}
    } else {
      // If user opened /dashboard without ?user=, check if they had a saved session
      try {
        const savedUser = localStorage.getItem("code_recall_active_user")?.trim();
        if (savedUser) {
          router.replace(`/dashboard?user=${encodeURIComponent(savedUser)}`);
        }
      } catch {}
    }
  }, [searchParams, router]);

  return null;
}
