"use client";

import { useState } from "react";

interface SyncStatusData {
  hasUser: boolean;
  user?: {
    id: number;
    username: string;
    lastSyncedAt: string | null;
    createdAt: string;
  };
  stats?: {
    totalSubmissions: number;
    totalProblems: number;
    acceptedCount: number;
    passRate: number | null;
  };
  checkpoint?: {
    isInitialSyncComplete: boolean;
    lastPersistedOffset: number;
    totalSyncedCount: number;
    newestSubmissionTime: string | null;
    oldestSubmissionTime: string | null;
    newestSubmissionId: string | null;
    oldestSubmissionId: string | null;
    lastSyncedAt: string | null;
  } | null;
}

export function SyncCenterView({ initialData }: { initialData: SyncStatusData }) {
  const [data, setData] = useState<SyncStatusData>(initialData);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const activeUsername = data.user?.username;

  // Sync current active account
  const handleSyncNow = async () => {
    if (!activeUsername) return;

    try {
      setIsSyncing(true);
      setMessage({ type: "info", text: `Syncing submissions for ${activeUsername}...` });

      const res = await fetch("/api/leetcode/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: activeUsername }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Sync failed");
      }

      setMessage({
        type: "success",
        text: `Sync complete: ${result.stats.submissionsProcessed} submissions checked (${result.stats.newSubmissionsSaved} new saved).`,
      });

      const statusRes = await fetch(`/api/sync/status?username=${encodeURIComponent(activeUsername)}`);
      if (statusRes.ok) {
        const freshData = await statusRes.json();
        setData(freshData);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Sync failed",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const checkpoint = data.checkpoint;

  return (
    <div className="space-y-6">
      {/* Active Account & Sync Status */}
      {activeUsername ? (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Connected LeetCode Account</h2>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-base font-bold text-slate-900">{activeUsername}</span>
                {activeUsername !== "demo" ? (
                  <a
                    href={`https://leetcode.com/${activeUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                  >
                    View Profile
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                    Demo Profile
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                <span>{isSyncing ? "Syncing..." : "Sync Latest"}</span>
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg border text-xs font-medium ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : message.type === "error"
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-indigo-50 text-indigo-800 border-indigo-200"
              }`}
            >
              <span>{message.text}</span>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Submissions</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{data.stats?.totalSubmissions || 0}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Problems Solved</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{data.stats?.totalProblems || 0}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Pass Rate</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{data.stats?.passRate ?? 0}%</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">History Span</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {checkpoint?.oldestSubmissionTime
                  ? new Date(checkpoint.oldestSubmissionTime).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                  : "Active"}
                {" – Present"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center py-10">
          <h2 className="text-sm font-bold text-slate-900">No Account Connected</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Use the CodeRecall Chrome extension while logged into LeetCode to sync your historical submissions.
          </p>
        </div>
      )}

      {/* Chrome Extension Status & Quick Setup */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Chrome Extension</h3>
          <p className="text-xs text-slate-500">Sync directly from your browser session</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="font-semibold text-slate-800 mb-1">1. Open Extensions</div>
            <p className="text-slate-500">
              Open <code className="text-slate-800 font-mono bg-slate-200/60 px-1 py-0.5 rounded">chrome://extensions</code> and enable Developer mode.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="font-semibold text-slate-800 mb-1">2. Load Unpacked</div>
            <p className="text-slate-500">
              Click <strong>Load unpacked</strong> and select the <code className="text-slate-800 font-mono bg-slate-200/60 px-1 py-0.5 rounded">extension/</code> folder.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="font-semibold text-slate-800 mb-1">3. Sync on LeetCode</div>
            <p className="text-slate-500">
              Log into LeetCode, open the extension, and click <strong>Sync Submissions</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
