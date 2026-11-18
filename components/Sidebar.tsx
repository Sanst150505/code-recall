"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

interface SidebarProps {
  username?: string;
  isInitialSyncComplete?: boolean;
}

export function Sidebar({ username = "" }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user")?.trim();
  const effectiveUser = userParam || username;

  const handleClearUser = () => {
    try {
      localStorage.removeItem("code_recall_active_user");
    } catch {}
    router.push("/dashboard");
  };

  const buildHref = (path: string) => {
    return effectiveUser ? `${path}?user=${encodeURIComponent(effectiveUser)}` : path;
  };

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
    },
    {
      label: "Revise Today",
      href: "/dashboard/revision",
    },
    {
      label: "My Progress",
      href: "/dashboard/topics",
    },
    {
      label: "History",
      href: "/dashboard/history",
    },
    {
      label: "Extension Sync",
      href: "/dashboard/sync",
    },
  ];

  return (
    <aside className="w-60 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80">
          <div>
            <span className="font-bold text-base tracking-tight text-white">CodeRecall</span>
            <p className="text-[11px] text-slate-400">DSA Practice</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={buildHref(item.href)}
                className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info Footer */}
      <div className="p-3 border-t border-slate-800/80">
        {userParam ? (
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{userParam}</p>
                <p className="text-[10px] text-slate-400">
                  {userParam === "demo" ? "Sample Demo Profile" : "LeetCode Connected"}
                </p>
              </div>
              <button
                onClick={handleClearUser}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition cursor-pointer font-medium ml-2 shrink-0"
              >
                Disconnect
              </button>
            </div>
            {userParam !== "demo" && (
              <div className="mt-2 pt-2 border-t border-slate-800/60 text-right">
                <a
                  href={`https://leetcode.com/${userParam}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                >
                  View LeetCode Profile
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/dashboard?user=demo"
              className="block p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 transition text-center"
            >
              <p className="text-xs font-semibold text-white">Live Demo Profile</p>
            </Link>
            <Link
              href="/dashboard/sync"
              className="block p-2 rounded-lg bg-slate-900/60 border border-dashed border-slate-700 hover:border-slate-500 transition group text-center"
            >
              <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition">No Profile Active</p>
              <span className="text-[10px] text-slate-400 font-medium block">Sync via Extension</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
