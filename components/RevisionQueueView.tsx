"use client";

import { useState, useMemo } from "react";
import { TopicAnalytics } from "@/lib/analytics-service";
import { RevisionCard } from "@/components/RevisionCard";

interface RevisionQueueViewProps {
  username: string;
  criticalTopics: TopicAnalytics[];
  frictionTopics: TopicAnalytics[];
  deficitTopics: TopicAnalytics[];
  maintainedTopics: TopicAnalytics[];
}

type TabType = "all" | "critical" | "friction" | "deficit" | "maintained";

export function RevisionQueueView({
  username,
  criticalTopics,
  frictionTopics,
  deficitTopics,
  maintainedTopics,
}: RevisionQueueViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allActionable = useMemo(() => {
    const map = new Map<string, TopicAnalytics>();
    for (const t of [...criticalTopics, ...frictionTopics, ...deficitTopics]) {
      map.set(t.topic, t);
    }
    return Array.from(map.values()).sort((a, b) => b.priorityScore - a.priorityScore);
  }, [criticalTopics, frictionTopics, deficitTopics]);

  const activeTopics = useMemo(() => {
    let list: TopicAnalytics[] = [];
    if (activeTab === "all") list = allActionable;
    else if (activeTab === "critical") list = criticalTopics;
    else if (activeTab === "friction") list = frictionTopics;
    else if (activeTab === "deficit") list = deficitTopics;
    else if (activeTab === "maintained") list = maintainedTopics;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return list.filter((t) => t.topic.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, allActionable, criticalTopics, frictionTopics, deficitTopics, maintainedTopics, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        {/* Segmented Queue Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs font-medium">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "all"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>All Actionable</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "all" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"
              }`}
            >
              {allActionable.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("critical")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "critical"
                ? "bg-rose-600 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-rose-700 hover:bg-rose-50/70"
            }`}
          >
            <span>Critical Decay</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "critical" ? "bg-rose-700 text-white" : "bg-rose-50 text-rose-700"
              }`}
            >
              {criticalTopics.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("friction")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "friction"
                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/70"
            }`}
          >
            <span>High Friction</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "friction" ? "bg-indigo-700 text-white" : "bg-indigo-50 text-indigo-700"
              }`}
            >
              {frictionTopics.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("deficit")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "deficit"
                ? "bg-amber-600 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-amber-700 hover:bg-amber-50/70"
            }`}
          >
            <span>Low Exposure</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "deficit" ? "bg-amber-700 text-white" : "bg-amber-50 text-amber-700"
              }`}
            >
              {deficitTopics.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("maintained")}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "maintained"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70"
            }`}
          >
            <span>Maintained Fresh</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === "maintained" ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {maintainedTopics.length}
            </span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full lg:w-64">
          <input
            type="text"
            placeholder="Search revision queue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Grid of Actionable Cards */}
      {activeTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeTopics.map((item, idx) => (
            <RevisionCard
              key={item.topic}
              item={item}
              rank={idx + 1}
              username={username}
              isFeatured={activeTab === "all" && idx === 0}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-base font-bold">
            ✓
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            {searchQuery
              ? `No topics matching "${searchQuery}" in this view`
              : activeTab === "all"
              ? "All topics are currently fresh and maintained"
              : `No topics flagged under ${activeTab}`}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? "Try clearing your search query or switching to another category tab."
              : "Great job! Keep up your regular practice cadence to prevent concept decay."}
          </p>
        </div>
      )}
    </div>
  );
}
