"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  BrainCircuit,
  RotateCcw,
  History,
  RefreshCw,
  ExternalLink,
  Users,
} from "lucide-react";

interface SidebarProps {
  username?: string;
  isInitialSyncComplete?: boolean;
}

export function Sidebar({ username = "anonymous" }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user");
  const activeUser = userParam || username;

  const buildHref = (path: string) => {
    return userParam ? `${path}?user=${encodeURIComponent(userParam)}` : path;
  };

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Revise Today",
      href: "/dashboard/revision",
      icon: RotateCcw,
    },
    {
      label: "My Progress",
      href: "/dashboard/topics",
      icon: BrainCircuit,
    },
    {
      label: "History",
      href: "/dashboard/history",
      icon: History,
    },
    {
      label: "Profile & Connections",
      href: "/dashboard/sync",
      icon: RefreshCw,
    },
  ];

  return (
    <aside className="w-60 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white">CodeRecall</span>
            <p className="text-[11px] text-slate-400">DSA Practice</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={buildHref(item.href)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs">
              {activeUser.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{activeUser}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] text-slate-400">LeetCode</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={buildHref("/dashboard/sync")}
              title="Switch or manage accounts"
              className="text-slate-500 hover:text-indigo-400 p-1 rounded transition"
            >
              <Users className="w-3.5 h-3.5" />
            </Link>
            <a
              href={`https://leetcode.com/${activeUser}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open LeetCode Profile"
              className="text-slate-500 hover:text-slate-300 p-1 rounded transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
