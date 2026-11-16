"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BrainCircuit,
  RotateCcw,
  History,
  RefreshCw,
  ExternalLink,
  Users,
  LogOut,
  UserPlus,
} from "lucide-react";

interface SidebarProps {
  username?: string;
  isInitialSyncComplete?: boolean;
}

export function Sidebar({ username = "" }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user")?.trim();

  const handleClearUser = () => {
    try {
      localStorage.removeItem("code_recall_active_user");
    } catch {}
    router.push("/dashboard");
  };

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
      label: "Extension Sync",
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
        {userParam ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center font-bold text-indigo-300 text-xs">
                {userParam.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{userParam}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] text-slate-400">LeetCode</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearUser}
                title="Disconnect profile"
                className="text-slate-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
              <a
                href={`https://leetcode.com/${userParam}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open LeetCode Profile"
                className="text-slate-500 hover:text-slate-300 p-1 rounded transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <Link
            href="/dashboard/sync"
            className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-dashed border-slate-700 hover:border-indigo-500/80 transition group"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 text-xs">
              <UserPlus className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition">No Profile Active</p>
              <span className="text-[10px] text-indigo-400 font-medium">Sync with Extension &rarr;</span>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
