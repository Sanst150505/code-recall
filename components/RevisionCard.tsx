import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight, Zap, CheckCircle2, ShieldAlert } from "lucide-react";
import { TopicAnalytics, RecommendationCategory } from "@/lib/analytics-service";

interface RevisionCardProps {
  item: TopicAnalytics;
  rank?: number;
}

export function RevisionCard({ item, rank }: RevisionCardProps) {
  const categoryConfig: Record<
    RecommendationCategory,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    CRITICAL_REVISION: {
      label: "Critical Revision",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: ShieldAlert,
    },
    INSUFFICIENT_EXPOSURE: {
      label: "Insufficient Exposure",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: AlertTriangle,
    },
    HIGH_FRICTION: {
      label: "High Friction",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      icon: Zap,
    },
    ACTIVE_MAINTAINED: {
      label: "Active & Maintained",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle2,
    },
  };

  const config = categoryConfig[item.category];
  const Icon = config.icon;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {rank !== undefined && (
              <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                #{rank}
              </span>
            )}
            <h3 className="font-bold text-base text-slate-900 tracking-tight">{item.topic}</h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border}`}
            >
              <Icon className="w-3 h-3" />
              {config.label}
            </span>

            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white shadow-xs">
              <span>{item.priorityScore}</span>
              <span className="text-[9px] text-slate-400 font-normal">/100</span>
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

          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <Clock className="w-3 h-3 text-slate-500" />
            {item.daysSinceLastPractice !== null
              ? `${item.daysSinceLastPractice}d ago`
              : "Never attempted"}
          </span>
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
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-600 text-[11px] font-medium">
          Priority Factors: Decay {item.decayFactor} · Deficit {item.volumeDeficitFactor} · Friction {item.frictionFactor}
        </span>

        <Link
          href={`/dashboard/history?topic=${encodeURIComponent(item.topic)}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition group"
        >
          <span>View practice history</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
