"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface SubmissionRow {
  id: string;
  problemId: number;
  title: string;
  titleSlug: string;
  difficulty: string;
  topics: string[];
  status: string;
  language: string | null;
  runtime: number | null;
  memory: number | null;
  submittedAt: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function SubmissionHistoryTable() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";
  const userParam = searchParams.get("user") || "";

  const [storedUser] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("code_recall_active_user")?.trim() || "";
    } catch {
      return "";
    }
  });
  const [reloadKey, setReloadKey] = useState(0);

  const activeUser = userParam || storedUser;

  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState(initialTopic);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;
    const userToFetch = activeUser;

    if (!userToFetch) {
      const timer = setTimeout(() => {
        if (!ignore) {
          setLoading(false);
          setSubmissions([]);
        }
      }, 0);
      return () => {
        ignore = true;
        clearTimeout(timer);
      };
    }

    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("pageSize", "20");
    params.set("username", userToFetch);
    if (search) params.set("search", search);
    if (status !== "All") params.set("status", status);
    if (difficulty !== "All") params.set("difficulty", difficulty);
    if (topic) params.set("topic", topic);

    fetch(`/api/submissions?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load submissions");
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          setSubmissions(data.submissions || []);
          setPagination(data.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 1 });
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Error fetching submissions:", err);
          setError(err instanceof Error ? err.message : "Error loading records");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, search, status, difficulty, topic, activeUser, reloadKey]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  // Difficulty badge styling
  const diffBadge = (diff: string) => {
    if (diff === "Easy") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (diff === "Medium") return "bg-amber-50 text-amber-700 border-amber-200";
    if (diff === "Hard") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Verdict badge styling
  const statusBadge = (s: string) => {
    if (s === "Accepted") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Accepted
        </span>
      );
    }
    if (s === "Wrong Answer") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Wrong Answer
        </span>
      );
    }
    if (s === "Time Limit Exceeded") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Time Limit Exceeded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search problem title or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs flex-1 sm:flex-none">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Verdicts</option>
              <option value="Accepted">Accepted Only</option>
              <option value="Failed">Failed Only</option>
              <option value="Wrong Answer">Wrong Answer</option>
              <option value="Time Limit Exceeded">Time Limit Exceeded</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 text-xs flex-1 sm:flex-none">
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {topic && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-medium">
              <span>Topic: {topic}</span>
              <button
                onClick={() => {
                  setTopic("");
                  setPage(1);
                }}
                className="hover:text-indigo-900 font-bold ml-1"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500 px-1">
        <span>
          Showing{" "}
          <strong className="text-slate-800">
            {pagination.total > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0}
          </strong>{" "}
          to{" "}
          <strong className="text-slate-800">
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}
          </strong>{" "}
          of <strong className="text-slate-800">{pagination.total}</strong> submissions
        </span>

        {loading && (
          <span className="text-indigo-600 font-medium text-xs">
            Loading records...
          </span>
        )}

        {error && (
          <div className="flex items-center gap-2 text-rose-600 text-xs font-medium">
            <span>{error}</span>
            <button
              onClick={handleRetry}
              className="text-xs underline hover:text-rose-800 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[760px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Problem Title</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Verdict</th>
                <th className="py-3.5 px-4">Topics</th>
                <th className="py-3.5 px-4">Language</th>
                <th className="py-3.5 px-4">Runtime / Mem</th>
                <th className="py-3.5 px-4">Submission Date</th>
                <th className="py-3.5 px-4 text-right">LeetCode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading && submissions.length === 0 && (
                <>
                  {[...Array(5)].map((_, idx) => (
                    <tr key={`skel-${idx}`} className="animate-pulse">
                      <td className="py-3.5 px-5"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-100 rounded w-14"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                      <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-10 ml-auto"></div></td>
                    </tr>
                  ))}
                </>
              )}

              {submissions.map((sub) => {
                const subDate = new Date(sub.submittedAt);
                const formattedDate = subDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                const formattedTime = subDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 whitespace-nowrap">
                      {sub.title}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${diffBadge(sub.difficulty)}`}>
                        {sub.difficulty}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {statusBadge(sub.status)}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="flex flex-wrap gap-1">
                        {sub.topics.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            onClick={() => {
                              setTopic(t);
                              setPage(1);
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium cursor-pointer transition border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                        {sub.topics.length > 3 && (
                          <span className="text-[10px] text-slate-600 font-medium">+{sub.topics.length - 3}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-800">
                      {sub.language || "—"}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-800 font-medium">
                      <span>{sub.runtime !== null ? `${sub.runtime} ms` : "—"}</span>
                      {sub.memory !== null && (
                        <span className="text-[10px] text-slate-600 ml-1.5">({sub.memory} MB)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                      <span>{formattedDate}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">{formattedTime}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <a
                        href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded-md hover:bg-indigo-50 transition text-xs"
                        title="Open problem on LeetCode"
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                );
              })}

              {!loading && submissions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    {!activeUser ? (
                      <div className="space-y-2 max-w-sm mx-auto">
                        <p className="font-semibold text-slate-700">No profile active</p>
                        <p className="text-[11px] text-slate-500">
                          Please select the demo persona or sync your LeetCode account with the extension.
                        </p>
                        <a
                          href="/dashboard?user=demo"
                          className="inline-block px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                        >
                          Load Demo Profile
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>No submissions found matching your active filter criteria.</p>
                        {(search || status !== "All" || difficulty !== "All" || topic) && (
                          <button
                            onClick={() => {
                              setSearch("");
                              setStatus("All");
                              setDifficulty("All");
                              setTopic("");
                              setPage(1);
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                          >
                            Reset all filters
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Page <strong className="text-slate-800">{pagination.page}</strong> of{" "}
            <strong className="text-slate-800">{Math.max(1, pagination.totalPages)}</strong>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1 || loading}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              Previous
            </button>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
