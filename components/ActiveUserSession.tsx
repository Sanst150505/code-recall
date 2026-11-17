"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function ActiveUserSession({ currentUsername }: { currentUsername?: string } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userInUrl = searchParams.get("user")?.trim() || currentUsername?.trim();

    if (userInUrl) {
      // Save the active user in browser storage
      try {
        localStorage.setItem("code_recall_active_user", userInUrl);
      } catch {}
    } else {
      // If user opened a dashboard page without ?user=, restore from saved session
      try {
        const savedUser = localStorage.getItem("code_recall_active_user")?.trim();
        if (savedUser) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("user", savedUser);
          router.replace(`${pathname}?${params.toString()}`);
        }
      } catch {}
    }
  }, [searchParams, router, pathname, currentUsername]);

  return null;
}
