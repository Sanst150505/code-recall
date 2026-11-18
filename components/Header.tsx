"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMobileNav } from "@/components/MobileNavContext";

interface HeaderProps {
  title: string;
  description?: string;
  username?: string;
  lastSyncedAt?: string | null;
  onSyncComplete?: () => void;
}

export function Header({
  title,
  description,
  username = "anonymous",
  lastSyncedAt,
  onSyncComplete,
}: HeaderProps) {
  const router = useRouter();
  const { toggle } = useMobileNav();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSync = async () => {
    if (!username || username === "anonymous") {
      setSyncStatus("error");
      setStatusMessage("Please connect a LeetCode username first");
      setTimeout(() => setSyncStatus("idle"), 4000);
      return;
    }

    try {
      setIsSyncing(true);
      setSyncStatus("idle");

      const response = await fetch("/api/leetcode/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sync failed");
      }

      setSyncStatus("success");
      setStatusMessage(
        data.message
          ? data.message
          : data.stats
          ? `Synced ${data.stats.submissionsProcessed} submissions`
          : "Sync complete"
      );

      if (onSyncComplete) {
        onSyncComplete();
      } else {
        router.refresh();
      }

      setTimeout(() => {
        setSyncStatus("idle");
      }, 4000);
    } catch (err) {
      setSyncStatus("error");
      setStatusMessage(err instanceof Error ? err.message : "Sync failed");
      setTimeout(() => {
        setSyncStatus("idle");
      }, 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const formattedTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently";

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile menu toggle hamburger */}
        <button
          onClick={toggle}
          className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-hidden"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">{title}</h1>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block truncate max-w-xs sm:max-w-md lg:max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {syncStatus === "success" && (
          <span
            className="text-[11px] sm:text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 sm:px-2.5 py-1 rounded-md font-medium max-w-[110px] sm:max-w-sm truncate"
            title={statusMessage}
          >
            {statusMessage}
          </span>
        )}

        {syncStatus === "error" && (
          <span
            className="text-[11px] sm:text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2 sm:px-2.5 py-1 rounded-md font-medium max-w-[110px] sm:max-w-sm truncate"
            title={statusMessage}
          >
            {statusMessage}
          </span>
        )}

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <span>Last sync:</span>
          <span className="font-semibold text-slate-900">{formattedTime}</span>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50 transition cursor-pointer border border-slate-300 shrink-0"
          title="Quick sync recent solves (last 20). For full history and struggle friction, sync via CodeRecall Extension."
        >
          <span>{isSyncing ? "Syncing..." : "Quick Sync"}</span>
        </button>
      </div>
    </header>
  );
}
