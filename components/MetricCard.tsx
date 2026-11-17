import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "neutral" | "emerald" | "amber" | "indigo" | "rose";
  tooltip?: string;
  icon?: ReactNode;
  iconBg?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  badge,
  badgeVariant = "neutral",
  tooltip,
  icon,
  iconBg = "bg-indigo-50 text-indigo-600 border-indigo-100",
}: MetricCardProps) {
  const badgeColors = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase">{title}</p>
            {tooltip && (
              <span
                className="text-[10px] text-slate-600 hover:text-slate-800 cursor-help"
                title={tooltip}
              >
                [?]
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
            {badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badgeColors[badgeVariant]}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[11px] text-slate-600 mt-1">{subtitle}</p>}
        </div>

        {icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
