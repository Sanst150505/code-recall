"use client";

import { useState } from "react";

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSync = async () => {
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
        data.stats
          ? `Synced ${data.stats.submissionsProcessed} submissions`
          : "Sync complete"
      );

      if (onSyncComplete) {
        onSyncComplete();
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
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        {description && <p className="text-xs text-slate-600 mt-0.5">{description}</p>}
      </div>

      <div className="flex items-center gap-3">
        {syncStatus === "success" && (
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-medium">
            {statusMessage}
          </span>
        )}

        {syncStatus === "error" && (
          <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md font-medium">
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
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50 transition cursor-pointer border border-slate-300"
        >
          <span>{isSyncing ? "Syncing..." : "Sync"}</span>
        </button>
      </div>
    </header>
  );
}
