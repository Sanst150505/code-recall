"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useMobileNav } from "@/components/MobileNavContext";

interface SidebarProps {
  username?: string;
  isInitialSyncComplete?: boolean;
}

export function Sidebar({ username = "" }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isOpen, close } = useMobileNav();

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
      shortLabel: "Home",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Revise Today",
      shortLabel: "Revise",
      href: "/dashboard/revision",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      label: "My Progress",
      shortLabel: "Progress",
      href: "/dashboard/topics",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: "History",
      shortLabel: "History",
      href: "/dashboard/history",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Extension Sync",
      shortLabel: "Sync",
      href: "/dashboard/sync",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-[#0a0f1d] border-r border-slate-800/80 flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
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

      {/* 2. Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 md:hidden transition-opacity"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* 3. Mobile Slide-Over Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0a0f1d] border-r border-slate-800/90 z-50 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out md:hidden select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
      >
        <div>
          {/* Header with Close Button */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
            <div>
              <span className="font-bold text-base tracking-tight text-white">CodeRecall</span>
              <p className="text-[11px] text-slate-400">DSA Practice</p>
            </div>
            <button
              onClick={close}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={buildHref(item.href)}
                  onClick={close}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info Footer in Mobile Drawer */}
        <div className="p-3 border-t border-slate-800/80">
          {userParam ? (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{userParam}</p>
                  <p className="text-[10px] text-slate-400">
                    {userParam === "demo" ? "Sample Demo Profile" : "LeetCode Connected"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleClearUser();
                    close();
                  }}
                  className="text-[11px] text-rose-400 hover:text-rose-300 transition cursor-pointer font-medium ml-2 shrink-0 px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40"
                >
                  Disconnect
                </button>
              </div>
              {userParam !== "demo" && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-right">
                  <a
                    href={`https://leetcode.com/${userParam}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    View LeetCode Profile &rarr;
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/dashboard?user=demo"
                onClick={close}
                className="block p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 transition text-center"
              >
                <p className="text-xs font-semibold text-white">Live Demo Profile</p>
              </Link>
              <Link
                href="/dashboard/sync"
                onClick={close}
                className="block p-2.5 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 hover:border-slate-500 transition group text-center"
              >
                <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition">No Profile Active</p>
                <span className="text-[10px] text-slate-400 font-medium block">Sync via Extension</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 4. Mobile Bottom Quick-Navigation Bar */}
      <nav
        className="fixed bottom-0 inset-x-0 bg-[#0a0f1d]/95 backdrop-blur-md border-t border-slate-800/90 z-40 md:hidden flex items-center justify-around px-1 py-1 select-none"
        aria-label="Mobile quick navigation"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={buildHref(item.href)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-indigo-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className={`${isActive ? "text-indigo-400 scale-105" : "text-slate-400"} transition-transform`}>
                {item.icon}
              </div>
              <span className="mt-0.5 tracking-tight">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
