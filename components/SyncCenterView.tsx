"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  UserPlus,
  Users,
  LogOut,
} from "lucide-react";
import { ChromeIcon } from "@/components/ChromeIcon";

interface UserSummary {
  id: number;
  username: string;
  lastSyncedAt: string | null;
}

interface SyncStatusData {
  hasUser: boolean;
  allUsers?: UserSummary[];
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
  const router = useRouter();
  const [data, setData] = useState<SyncStatusData>(initialData);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const activeUsername = data.user?.username || "sannidhya1505";

  // Sync current active account
  const handleSyncNow = async (targetUser = activeUsername) => {
    try {
      setIsSyncing(true);
      setMessage({ type: "info", text: `Syncing submissions for ${targetUser}...` });

      const res = await fetch("/api/leetcode/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetUser }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Sync failed");
      }

      setMessage({
        type: "success",
        text: `Sync complete: ${result.stats.submissionsProcessed} submissions checked (${result.stats.newSubmissionsSaved} new saved).`,
      });

      await refreshStatus(targetUser);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Sync failed",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Switch to another existing user
  const handleSwitchUser = async (targetUsername: string) => {
    try {
      setMessage({ type: "info", text: `Switching to ${targetUsername}...` });
      router.push(`/dashboard/sync?user=${encodeURIComponent(targetUsername)}`);
      await refreshStatus(targetUsername);
      setMessage({ type: "success", text: `Switched active account to ${targetUsername}.` });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to switch user",
      });
    }
  };

  // Connect and sync a new account
  const handleConnectNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newUsername.trim();
    if (!trimmed) return;

    try {
      setIsConnecting(true);
      setMessage({ type: "info", text: `Connecting LeetCode user "${trimmed}"...` });

      const res = await fetch("/api/leetcode/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to connect user");
      }

      setNewUsername("");
      setMessage({
        type: "success",
        text: `Connected "${trimmed}" successfully! Synced ${result.stats.submissionsProcessed} submissions.`,
      });

      router.push(`/dashboard/sync?user=${encodeURIComponent(trimmed)}`);
      await refreshStatus(trimmed);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to connect user",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshStatus = async (userToFetch = activeUsername) => {
    const statusRes = await fetch(`/api/sync/status?username=${encodeURIComponent(userToFetch)}`);
    if (statusRes.ok) {
      const freshData = await statusRes.json();
      setData(freshData);
    }
  };

  const checkpoint = data.checkpoint;
  const otherUsers = (data.allUsers || []).filter((u) => u.username !== activeUsername);

  return (
    <div className="space-y-6">
      {/* Active Account & Sync Status */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h2 className="text-sm font-bold text-slate-900">Current LeetCode Account</h2>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-base font-bold text-slate-900">{activeUsername}</span>
              <a
                href={`https://leetcode.com/${activeUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs"
              >
                <span>Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleSyncNow(activeUsername)}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Latest"}</span>
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : message.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-indigo-50 text-indigo-800 border-indigo-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            )}
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

      {/* Switch or Connect Another LeetCode Account */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Switch or Connect Another Account
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect a different LeetCode ID or switch between existing user profiles.
          </p>
        </div>

        {/* Existing Accounts List */}
        {otherUsers.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700">Other Synced Profiles:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {otherUsers.map((u) => (
                <div
                  key={u.username}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{u.username}</p>
                    <p className="text-[10px] text-slate-400">
                      Last sync: {u.lastSyncedAt ? new Date(u.lastSyncedAt).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSwitchUser(u.username)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-indigo-300 transition"
                  >
                    Switch to {u.username}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connect New Username Form */}
        <form onSubmit={handleConnectNewUser} className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter LeetCode username (e.g. tourist)"
            className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition font-mono"
          />
          <button
            type="submit"
            disabled={isConnecting || !newUsername.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isConnecting ? "Connecting..." : "Connect & Switch"}</span>
          </button>
        </form>
      </div>

      {/* Chrome Extension Status & Quick Setup */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ChromeIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Chrome Extension</h3>
              <p className="text-xs text-slate-500">1-click browser sync</p>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            Manifest V3 Ready
          </span>
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
              Open the extension while on LeetCode and click <strong>Sync Submissions</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
