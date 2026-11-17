"use client";

import { useState } from "react";
import Link from "next/link";
import { TopicAnalytics, RecommendationCategory } from "@/lib/analytics-service";

interface RevisionCardProps {
  item: TopicAnalytics;
  rank?: number;
  username?: string;
  isFeatured?: boolean;
  onRevisionLogged?: () => void;
}

export function RevisionCard({
  item,
  rank,
  username,
  isFeatured = false,
  onRevisionLogged,
}: RevisionCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [localReassessmentCount, setLocalReassessmentCount] = useState(item.reassessmentCount || 0);
  const [localLastOutcome, setLocalLastOutcome] = useState<string | null>(item.lastOutcome || null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const categoryConfig: Record<
    RecommendationCategory,
    { label: string; bg: string; text: string; border: string }
  > = {
    CRITICAL_REVISION: {
      label: "Critical Revision",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
    },
    INSUFFICIENT_EXPOSURE: {
      label: "Insufficient Exposure",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    HIGH_FRICTION: {
      label: "High Friction",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
    ACTIVE_MAINTAINED: {
      label: "Active & Maintained",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
  };

  const config = categoryConfig[item.category];

  const handleLogRevision = async (outcome: "INDEPENDENT" | "WITH_HINTS" | "COULD_NOT_SOLVE") => {
    if (!username) return;
    try {
      setIsSubmitting(true);

      const res = await fetch("/api/revision/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          topic: item.topic,
          outcome,
        }),
      });

      if (!res.ok) throw new Error("Failed to save revision");

      setLocalReassessmentCount((prev) => prev + 1);
      setLocalLastOutcome(outcome);
      setSuccessFeedback(
        outcome === "INDEPENDENT"
          ? "Recorded: Solved independently!"
          : outcome === "WITH_HINTS"
          ? "Recorded: Solved with hints!"
          : "Recorded: Marked for further review."
      );

      if (onRevisionLogged) {
        onRevisionLogged();
      }

      setTimeout(() => {
        setIsDrawerOpen(false);
        setSuccessFeedback(null);
      }, 2000);
    } catch (err) {
      console.error("Error logging revision:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const diffBadgeColor = (diff: string) => {
    if (diff === "Easy") return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (diff === "Medium") return "text-amber-700 bg-amber-50 border-amber-200";
    if (diff === "Hard") return "text-rose-700 bg-rose-50 border-rose-200";
    return "text-slate-700 bg-slate-50 border-slate-200";
  };

  const outcomeLabels: Record<string, { text: string; color: string }> = {
    INDEPENDENT: { text: "Solved Independently", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    WITH_HINTS: { text: "Solved with Hints", color: "text-amber-700 bg-amber-50 border-amber-200" },
    COULD_NOT_SOLVE: { text: "Couldn't Solve", color: "text-rose-700 bg-rose-50 border-rose-200" },
  };

  return (
    <div
      className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between relative ${
        isFeatured
          ? "border-indigo-300 ring-2 ring-indigo-500/10 shadow-md bg-gradient-to-br from-white via-indigo-50/20 to-white"
          : "border-slate-200/90 shadow-xs hover:shadow-md"
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {rank !== undefined && (
              <span
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                  isFeatured
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                #{rank}
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 tracking-tight">
                  {item.topic}
                </h3>
                {isFeatured && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    Top Priority
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border}`}
            >
              {config.label}
            </span>

            <div
              className="relative flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white shadow-xs cursor-help"
              onMouseEnter={() => setActiveTooltip("priority")}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <span>{item.priorityScore}</span>
              <span className="text-[9px] text-slate-400 font-normal">/100</span>

              {activeTooltip === "priority" && (
                <div className="absolute right-0 top-7 z-30 w-52 p-2 bg-slate-900 text-slate-200 text-[10px] rounded-lg shadow-lg border border-slate-700 leading-snug pointer-events-none">
                  Priority Score: Composite retention urgency factoring in time decay (45%), solve volume deficit (35%), and past struggle friction (20%).
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Supporting metrics pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs text-slate-700">
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-medium">
            <strong className="text-slate-900">{item.uniqueSolved}</strong> solved
            {item.uniqueSolved > 0 && (
              <span className="text-slate-600 text-[10px] ml-1">
                ({item.difficulty.easy}E / {item.difficulty.medium}M / {item.difficulty.hard}H)
              </span>
            )}
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-medium">
            <strong className="text-slate-900">{item.totalAttempts}</strong> attempts
            {item.passRate !== null && (
              <span className="text-slate-600 text-[10px] ml-1">({item.passRate}% pass)</span>
            )}
          </span>

          {item.struggleRatio > 1 && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-medium">
              Struggle: <strong className="text-slate-900">{item.struggleRatio}x</strong>
            </span>
          )}

          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            {item.daysSinceLastPractice !== null
              ? `${item.daysSinceLastPractice}D ago`
              : "Never attempted"}
          </span>

          {localReassessmentCount > 0 && localLastOutcome && outcomeLabels[localLastOutcome] && (
            <span
              className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium ${outcomeLabels[localLastOutcome].color}`}
            >
              Reassessed: {outcomeLabels[localLastOutcome].text}
            </span>
          )}
        </div>

        {/* Transparent Explanation */}
        <p className="mt-3.5 text-xs leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
          {item.explanation}
        </p>

        {/* Recommended Action */}
        <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950">
          <span className="font-semibold text-indigo-800 block mb-0.5">Recommended Next Action:</span>
          {item.recommendedAction}
        </div>

        {/* Previously Solved Problems for this Topic */}
        {item.solvedProblems && item.solvedProblems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-700 mb-2">
              Associated Problems Solved ({item.solvedProblems.length}):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.solvedProblems.slice(0, 4).map((p) => (
                <a
                  key={p.id}
                  href={`https://leetcode.com/problems/${p.slug}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 transition border border-slate-200"
                  title={`Open ${p.title} on LeetCode`}
                >
                  <span className="truncate max-w-[130px]">{p.title}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded border ${diffBadgeColor(p.difficulty)}`}>
                    {p.difficulty}
                  </span>
                </a>
              ))}
              {item.solvedProblems.length > 4 && (
                <span className="text-[10px] text-slate-500 self-center">
                  +{item.solvedProblems.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Interactive Reassessment Drawer */}
        {isDrawerOpen && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-3">
            <div>
              <p className="font-semibold text-white">Record Reassessment Outcome</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Practice a problem from this topic on LeetCode, then select your performance outcome:
              </p>
            </div>

            {successFeedback ? (
              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-center text-xs">
                {successFeedback}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleLogRevision("INDEPENDENT")}
                  disabled={isSubmitting}
                  className="px-2.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs text-center transition cursor-pointer disabled:opacity-50"
                >
                  Solved Independently
                </button>
                <button
                  onClick={() => handleLogRevision("WITH_HINTS")}
                  disabled={isSubmitting}
                  className="px-2.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs text-center transition cursor-pointer disabled:opacity-50"
                >
                  Solved with Hints
                </button>
                <button
                  onClick={() => handleLogRevision("COULD_NOT_SOLVE")}
                  disabled={isSubmitting}
                  className="px-2.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs text-center transition cursor-pointer disabled:opacity-50"
                >
                  Couldn&apos;t Solve
                </button>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600 text-[11px]">
          <span
            className="cursor-help underline decoration-dotted"
            title="Decay Factor: Higher as days since last practice increases (max 100)"
          >
            Decay: {item.decayFactor}
          </span>
          <span>·</span>
          <span
            className="cursor-help underline decoration-dotted"
            title="Deficit Factor: Higher for topics with very low solved problem count"
          >
            Deficit: {item.volumeDeficitFactor}
          </span>
          <span>·</span>
          <span
            className="cursor-help underline decoration-dotted"
            title="Friction Factor: Higher when attempt-to-solve ratio indicates repeated struggle"
          >
            Friction: {item.frictionFactor}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
          >
            {isDrawerOpen ? "Cancel" : "Start Revision"}
          </button>

          <Link
            href={
              username
                ? `/dashboard/history?topic=${encodeURIComponent(item.topic)}&user=${encodeURIComponent(username)}`
                : `/dashboard/history?topic=${encodeURIComponent(item.topic)}`
            }
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition px-2 py-1 rounded-md hover:bg-slate-100"
          >
            <span>History</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
