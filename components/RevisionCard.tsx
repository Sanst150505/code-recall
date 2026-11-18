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
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedProblemSlug, setSelectedProblemSlug] = useState<string>(
    item.suggestedProblems?.[0]?.slug || item.solvedProblems?.[0]?.slug || ""
  );
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    message: string;
    title?: string;
  } | null>(null);

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

  const handleVerify = async () => {
    if (!username || !selectedProblemSlug) return;
    try {
      setIsVerifying(true);
      setVerificationResult(null);

      const res = await fetch("/api/revision/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          problemSlug: selectedProblemSlug,
          topic: item.topic,
        }),
      });

      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      setVerificationResult({
        verified: false,
        message: err instanceof Error ? err.message : "Network error verifying submission with LeetCode",
      });
    } finally {
      setIsVerifying(false);
    }
  };

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
          problemSlug: selectedProblemSlug || null,
          outcome,
          verified: verificationResult?.verified ?? false,
        }),
      });

      if (!res.ok) throw new Error("Failed to save revision");

      setLocalReassessmentCount((prev) => prev + 1);
      setLocalLastOutcome(outcome);
      setSuccessFeedback(
        outcome === "INDEPENDENT"
          ? "Verified & Recorded: Solved independently! Queue updated."
          : outcome === "WITH_HINTS"
          ? "Verified & Recorded: Solved with hints! Queue updated."
          : "Recorded: Marked for further review."
      );

      if (onRevisionLogged) {
        onRevisionLogged();
      }

      setTimeout(() => {
        setIsDrawerOpen(false);
        setSuccessFeedback(null);
        setVerificationResult(null);
      }, 2200);
    } catch (err) {
      console.error("Error logging revision:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const outcomeLabels: Record<string, { text: string; color: string }> = {
    INDEPENDENT: { text: "Solved Independently", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    WITH_HINTS: { text: "Solved with Hints", color: "text-amber-700 bg-amber-50 border-amber-200" },
    COULD_NOT_SOLVE: { text: "Couldn't Solve", color: "text-rose-700 bg-rose-50 border-rose-200" },
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between relative ${
        isFeatured
          ? "border-indigo-300 ring-1 ring-indigo-500/20 shadow-md bg-gradient-to-br from-white via-indigo-50/15 to-white"
          : "border-slate-200/90 shadow-2xs hover:shadow-sm"
      }`}
    >
      <div>
        {/* Top Status & Category Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {rank !== undefined && (
              <span
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                  isFeatured
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                #{rank}
              </span>
            )}
            {isFeatured && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                #1 Focus
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border ${config.bg} ${config.text} ${config.border}`}
            >
              {config.label}
            </span>

            <div
              className="relative flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-900 text-white shadow-xs cursor-help"
              onMouseEnter={() => setActiveTooltip("priority")}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <span>{item.priorityScore}</span>
              <span className="text-[8.5px] text-slate-400 font-normal">/100</span>

              {activeTooltip === "priority" && (
                <div className="absolute right-0 top-7 z-30 w-56 p-2.5 bg-slate-900 text-slate-200 text-[10px] rounded-lg shadow-xl border border-slate-700 leading-snug pointer-events-none">
                  Priority Score: Composite retention urgency factoring time decay (45%), solve volume deficit (35%), and past struggle friction (20%).
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Full-Width Topic Title (Never truncated) */}
        <h3 className="font-bold text-base text-slate-900 tracking-tight mt-2.5 leading-snug break-words">
          {item.topic}
        </h3>

        {/* Supporting metrics - Clean integrated inline layout */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-3 text-xs text-slate-600">
          <span className="font-medium text-slate-800">
            {item.uniqueSolved} solved
            {item.uniqueSolved > 0 && (
              <span className="text-slate-500 text-[11px] font-normal ml-1">
                ({item.difficulty.easy} Easy · {item.difficulty.medium} Med · {item.difficulty.hard} Hard)
              </span>
            )}
          </span>

          <span className="text-slate-300">·</span>

          <span className="text-slate-700 font-medium">
            {item.daysSinceLastPractice !== null
              ? `${item.daysSinceLastPractice}D ago`
              : "Never attempted"}
          </span>

          <span className="text-slate-300">·</span>

          <span className="text-slate-600">
            {item.totalAttempts} att ({item.passRate !== null ? `${item.passRate}% pass` : "—"})
          </span>

          {item.struggleRatio > 1.2 && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
                {item.struggleRatio}x struggle
              </span>
            </>
          )}

          {localReassessmentCount > 0 && localLastOutcome && outcomeLabels[localLastOutcome] && (
            <>
              <span className="text-slate-300">·</span>
              <span
                className={`px-2 py-0.2 rounded-md border text-[10px] font-semibold ${outcomeLabels[localLastOutcome].color}`}
              >
                Reassessed
              </span>
            </>
          )}
        </div>

        {/* Unified Rationale & Guidance Block */}
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
          <p className="text-slate-700 leading-relaxed font-normal">
            {item.explanation}
          </p>
          <p className="text-[11px] text-indigo-900 font-medium">
            <span className="font-semibold text-indigo-700">Directive:</span> {item.recommendedAction}
          </p>
        </div>

        {/* Previously Solved Problems for this Topic */}
        {!isDrawerOpen && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-700 shrink-0">
              Problems you&apos;ve done ({item.solvedProblems?.length || 0}):
            </span>
            {item.solvedProblems && item.solvedProblems.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 max-w-full">
                {item.solvedProblems.slice(0, 3).map((p) => (
                  <a
                    key={p.id}
                    href={`https://leetcode.com/problems/${p.slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate max-w-[150px] sm:max-w-[130px] px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
                    title={`Open ${p.title} on LeetCode`}
                  >
                    {p.title}
                  </a>
                ))}
                {item.solvedProblems.length > 3 && (
                  <span className="text-[10px] text-slate-500 font-medium shrink-0">
                    +{item.solvedProblems.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic">No previous solves recorded</span>
            )}
          </div>
        )}

        {/* Suggested Practice (3-5 Problems) - Essential for Insufficient Exposure & Revision */}
        {!isDrawerOpen && item.suggestedProblems && item.suggestedProblems.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-indigo-950 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                <span>
                  {item.category === "INSUFFICIENT_EXPOSURE"
                    ? "Recommended Practice (Build Exposure):"
                    : "Suggested Practice (3-5 Problems):"}
                </span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                Click to solve on LeetCode
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {item.suggestedProblems.slice(0, 5).map((prob) => {
                const diffBadge =
                  prob.difficulty === "Easy"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : prob.difficulty === "Medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100";

                return (
                  <a
                    key={prob.slug}
                    href={`https://leetcode.com/problems/${prob.slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition border flex items-center gap-1 ${diffBadge}`}
                    title={prob.reason || `Practice ${prob.title} on LeetCode`}
                  >
                    <span>{prob.title}</span>
                    <span className="text-[9px] font-bold opacity-75">({prob.difficulty[0]})</span>
                    <span className="text-[9px]">↗</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Topics Suggested for Practice */}
        {!isDrawerOpen && item.relatedTopics && item.relatedTopics.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10.5px] font-semibold text-slate-600 shrink-0">Related Topics:</span>
            {item.relatedTopics.map((relTopic) => (
              <Link
                key={relTopic}
                href={
                  username
                    ? `/dashboard/topics?user=${encodeURIComponent(username)}`
                    : `/dashboard/topics`
                }
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 transition font-medium"
              >
                {relTopic}
              </Link>
            ))}
          </div>
        )}

        {/* Interactive LeetCode Verification Drawer */}
        {isDrawerOpen && (
          <div className="mt-3 p-4 rounded-xl bg-slate-900 text-white text-xs space-y-3.5 border border-slate-800">
            <div>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">Live LeetCode Revision & Verification</p>
                <span className="text-[10px] text-indigo-300 bg-indigo-950/80 border border-indigo-700/60 px-2 py-0.5 rounded-full font-medium">
                  Verified Tracking
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Select a suggested or previously solved problem, solve it on LeetCode, and verify your Accepted verdict:
              </p>
            </div>

            {/* Problem selector (Both Suggested and Previously Done) */}
            <div className="space-y-2.5">
              {item.suggestedProblems && item.suggestedProblems.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-indigo-300">
                      Suggested Practice Problems to Solve:
                    </span>
                    <span className="text-[10px] text-slate-400">Curated for {item.topic}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {item.suggestedProblems.map((prob) => {
                      const isSelected = selectedProblemSlug === prob.slug;
                      return (
                        <button
                          key={prob.slug}
                          type="button"
                          onClick={() => {
                            setSelectedProblemSlug(prob.slug);
                            setVerificationResult(null);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-400 shadow-xs"
                              : "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <span className="truncate max-w-[150px]">{prob.title}</span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                              prob.difficulty === "Easy"
                                ? "bg-emerald-950 text-emerald-300"
                                : prob.difficulty === "Medium"
                                ? "bg-amber-950 text-amber-300"
                                : "bg-rose-950 text-rose-300"
                            }`}
                          >
                            {prob.difficulty[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {item.solvedProblems && item.solvedProblems.length > 0 && (
                <div className="space-y-1.5 pt-1.5 border-t border-slate-800/80">
                  <span className="font-semibold text-slate-400 text-[11px] block">
                    Or Re-verify Previously Solved Problem:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {item.solvedProblems.map((prob) => {
                      const isSelected = selectedProblemSlug === prob.slug;
                      return (
                        <button
                          key={prob.id}
                          type="button"
                          onClick={() => {
                            setSelectedProblemSlug(prob.slug);
                            setVerificationResult(null);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-400 shadow-xs"
                              : "bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <span className="truncate max-w-[140px]">{prob.title}</span>
                          <span className="text-[9px] opacity-75 font-semibold">({prob.difficulty[0]})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Target problem action bar */}
            {selectedProblemSlug && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-800/70 border border-slate-700">
                <div className="text-[11px] text-slate-300 truncate">
                  Target: <span className="text-white font-semibold">{selectedProblemSlug}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://leetcode.com/problems/${selectedProblemSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-700 hover:bg-slate-600 text-white transition flex items-center gap-1"
                  >
                    <span>Solve on LeetCode</span>
                    <span className="text-[10px]">↗</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? "Checking LeetCode..." : "Verify Submission"}
                  </button>
                </div>
              </div>
            )}

            {/* Verification Status Feedback */}
            {verificationResult && (
              <div
                className={`p-2.5 rounded-lg text-[11px] border leading-relaxed ${
                  verificationResult.verified
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/60 border-rose-500/40 text-rose-200"
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5">
                  {verificationResult.verified ? (
                    <>
                      <span>✓</span>
                      <span>LeetCode Verified: Accepted Submission Detected</span>
                    </>
                  ) : (
                    <>
                      <span>✕</span>
                      <span>Verification Check</span>
                    </>
                  )}
                </div>
                <p className="mt-0.5 opacity-90">{verificationResult.message}</p>
              </div>
            )}

            {/* Outcome Selection Buttons (Unlocked on Verification) */}
            {successFeedback ? (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-center text-xs">
                {successFeedback}
              </div>
            ) : verificationResult?.verified ? (
              <div className="space-y-1.5 pt-1 border-t border-slate-800">
                <p className="text-[11px] text-slate-300">
                  How was your recall of the core pattern and approach during this solve? Select outcome to update your retention status:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleLogRevision("INDEPENDENT")}
                    disabled={isSubmitting}
                    className="px-2.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs text-center transition cursor-pointer disabled:opacity-50"
                  >
                    Solved Independently
                    <span className="block text-[10px] opacity-80 font-normal">Reset decay to 0D</span>
                  </button>
                  <button
                    onClick={() => handleLogRevision("WITH_HINTS")}
                    disabled={isSubmitting}
                    className="px-2.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs text-center transition cursor-pointer disabled:opacity-50"
                  >
                    Solved with Hints
                    <span className="block text-[10px] opacity-80 font-normal">Partial decay reduction</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Couldn't Solve option & close */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => handleLogRevision("COULD_NOT_SOLVE")}
                disabled={isSubmitting}
                className="text-rose-400 hover:text-rose-300 transition underline cursor-pointer disabled:opacity-50"
              >
                I struggled and couldn&apos;t solve it
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setVerificationResult(null);
                }}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-600 text-[11px] flex-wrap">
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
            title="Friction Factor: Higher when attempt-to-solve ratio indicates difficulty grasping the pattern before solve"
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
