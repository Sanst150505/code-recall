"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TopicAnalytics, RecommendationCategory } from "@/lib/analytics-service";

interface TopicsTableProps {
  initialTopics: TopicAnalytics[];
}

export function TopicsTable({ initialTopics }: TopicsTableProps) {
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"priority" | "solved" | "struggle" | "recency" | "alphabetical">("priority");

  const filteredTopics = useMemo(() => {
    return initialTopics
      .filter((t) => {
        const matchesSearch = t.topic.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
          selectedCategory === "ALL" || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "priority") return b.priorityScore - a.priorityScore;
        if (sortBy === "solved") return b.uniqueSolved - a.uniqueSolved;
        if (sortBy === "struggle") return b.struggleRatio - a.struggleRatio;
        if (sortBy === "recency") {
          const aDays = a.daysSinceLastPractice ?? 9999;
          const bDays = b.daysSinceLastPractice ?? 9999;
          return aDays - bDays;
        }
        if (sortBy === "alphabetical") return a.topic.localeCompare(b.topic);
        return 0;
      });
  }, [initialTopics, search, selectedCategory, sortBy]);

  const categoryPills: Record<RecommendationCategory, { label: string; color: string }> = {
    CRITICAL_REVISION: { label: "Critical", color: "bg-rose-50 text-rose-700 border-rose-200" },
    INSUFFICIENT_EXPOSURE: { label: "Deficit", color: "bg-amber-50 text-amber-700 border-amber-200" },
    HIGH_FRICTION: { label: "Friction", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    ACTIVE_MAINTAINED: { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search active DSA topics (e.g., Dynamic Programming, Graph)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="CRITICAL_REVISION">Critical Revision</option>
              <option value="INSUFFICIENT_EXPOSURE">Insufficient Exposure</option>
              <option value="HIGH_FRICTION">High Friction</option>
              <option value="ACTIVE_MAINTAINED">Active & Maintained</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as "priority" | "solved" | "struggle" | "recency" | "alphabetical")}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="priority">Priority Score (High to Low)</option>
              <option value="solved">Unique Solved (High to Low)</option>
              <option value="struggle">Struggle Ratio (High to Low)</option>
              <option value="recency">Most Recently Practiced</option>
              <option value="alphabetical">Alphabetical (A to Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Topics Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredTopics.length}</strong> of{" "}
          <strong className="text-slate-800">{initialTopics.length}</strong> practiced topics{" "}
          <span className="text-slate-600">(from 88 supported LeetCode DSA categories)</span>
        </span>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Topics Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Topic</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Solved / Difficulty</th>
                <th className="py-3.5 px-4">Attempts / Pass Rate</th>
                <th className="py-3.5 px-4">Struggle</th>
                <th className="py-3.5 px-4">Last Practiced</th>
                <th className="py-3.5 px-4 text-center">30D / 90D / 365D</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredTopics.map((t) => {
                const categoryPill = categoryPills[t.category];

                return (
                  <tr key={t.topic} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                      <div>
                        <span>{t.topic}</span>
                        {t.reassessmentCount > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Reassessed: {t.reassessmentCount}x
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-full text-[11px] bg-slate-900 text-white">
                        {t.priorityScore}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${categoryPill.color}`}>
                        {categoryPill.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{t.uniqueSolved}</span>
                      <span className="text-[11px] text-slate-600 font-medium ml-1.5">
                        ({t.difficulty.easy} Easy · {t.difficulty.medium} Med · {t.difficulty.hard} Hard)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{t.totalAttempts} att</span>
                      <span className="text-slate-600 font-medium text-[11px] ml-1.5">
                        ({t.passRate !== null ? `${t.passRate}%` : "—"})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          t.struggleRatio >= 3
                            ? "text-rose-600"
                            : t.struggleRatio >= 2
                            ? "text-amber-600"
                            : "text-slate-700"
                        }`}
                      >
                        {t.struggleRatio}x
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {t.daysSinceLastPractice !== null ? (
                        <span>
                          {t.daysSinceLastPractice}D ago
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-[11px] text-slate-600">
                      <span className={t.windows.last30Days.solvedCount > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                        {t.windows.last30Days.solvedCount}
                      </span>{" "}
                      /{" "}
                      <span className={t.windows.last90Days.solvedCount > 0 ? "text-indigo-600 font-bold" : "text-slate-400"}>
                        {t.windows.last90Days.solvedCount}
                      </span>{" "}
                      /{" "}
                      <span className="text-slate-700 font-medium">
                        {t.windows.last365Days.solvedCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={
                            userParam
                              ? `/dashboard/revision?user=${encodeURIComponent(userParam)}`
                              : `/dashboard/revision`
                          }
                          className="text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 hover:bg-indigo-50 rounded-md transition text-xs"
                          title="Open in revision queue"
                        >
                          Revise
                        </Link>
                        <Link
                          href={
                            userParam
                              ? `/dashboard/history?topic=${encodeURIComponent(t.topic)}&user=${encodeURIComponent(userParam)}`
                              : `/dashboard/history?topic=${encodeURIComponent(t.topic)}`
                          }
                          className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 hover:bg-slate-100 rounded-md transition text-xs"
                          title="View submissions for this topic"
                        >
                          History
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
