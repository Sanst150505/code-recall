"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// 1. Difficulty Donut Chart
interface DifficultyChartProps {
  easy: number;
  medium: number;
  hard: number;
}

export function DifficultyDonutChart({ easy, medium, hard }: DifficultyChartProps) {
  const data = [
    { name: "Easy", value: easy, color: "#10b981" },
    { name: "Medium", value: medium, color: "#f59e0b" },
    { name: "Hard", value: hard, color: "#ef4444" },
  ];

  const total = easy + medium + hard;

  return (
    <div className="h-64 flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={88}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name: any) => [`${value} problems (${total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0}%)`, name]}
            contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-900">{total}</span>
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Solved</span>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
            <span>{item.name}:</span>
            <span className="font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Monthly Timeline Area Chart
interface TimelineItem {
  month: string;
  submissions: number;
  accepted: number;
}

export function ActivityTimelineChart({ data }: { data: TimelineItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No timeline activity data available.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Area
            type="monotone"
            dataKey="submissions"
            name="Total Attempts"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSubs)"
          />
          <Area
            type="monotone"
            dataKey="accepted"
            name="Accepted Solutions"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAc)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Top Topics Bar Chart
interface TopicBarItem {
  topic: string;
  solved: number;
  attempts: number;
}

export function TopTopicsBarChart({ data }: { data: TopicBarItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No topic metrics available.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="topic"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
          <Bar dataKey="solved" name="Unique Solved" fill="#4f46e5" radius={[0, 4, 4, 0]} />
          <Bar dataKey="attempts" name="Total Submissions" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 4. Rolling Windows Activity Chart
interface WindowsChartItem {
  window: string;
  solved: number;
  attempts: number;
}

export function RollingWindowsBarChart({ data }: { data: WindowsChartItem[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="window" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Bar dataKey="solved" name="Problems Solved" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          <Bar dataKey="attempts" name="Submission Attempts" fill="#818cf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
