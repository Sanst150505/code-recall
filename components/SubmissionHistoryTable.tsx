"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Code2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCw,
} from "lucide-react";

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

  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState(initialTopic);
  const [page, setPage] = useState(1);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "20");
      if (search) params.set("search", search);
      if (status !== "All") params.set("status", status);
      if (difficulty !== "All") params.set("difficulty", difficulty);
      if (topic) params.set("topic", topic);

      const res = await fetch(`/api/submissions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load submissions");
      const data = await res.json();

      setSubmissions(data.submissions);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, difficulty, topic]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Accepted
        </span>
      );
    }
    if (s === "Wrong Answer") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          Wrong Answer
        </span>
      );
    }
    if (s === "Time Limit Exceeded") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          Time Limit Exceeded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search problem title or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Verdicts</option>
              <option value="Accepted">Accepted Only</option>
              <option value="Failed">Failed Only</option>
              <option value="Wrong Answer">Wrong Answer</option>
              <option value="Time Limit Exceeded">Time Limit Exceeded</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden"
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
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
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
          <span className="flex items-center gap-1.5 text-indigo-600 font-medium text-xs">
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
            Loading records...
          </span>
        )}
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
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
                        className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-slate-100 rounded-lg inline-flex items-center transition"
                        title="Open problem on LeetCode"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}

              {!loading && submissions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No submissions found matching your active filter criteria.
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
