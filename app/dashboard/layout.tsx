import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ActiveUserSession } from "@/components/ActiveUserSession";
import { MobileNavProvider } from "@/components/MobileNavContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileNavProvider>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row">
        {/* Active User Session Syncer */}
        <Suspense fallback={null}>
          <ActiveUserSession />
        </Suspense>

        {/* Sidebar (Desktop sticky + Mobile slide-over drawer) */}
        <Suspense fallback={<div className="hidden md:block w-60 bg-[#0a0f1d] shrink-0 h-screen sticky top-0" />}>
          <Sidebar />
        </Suspense>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f8fafc] pb-16 md:pb-0">
          {children}
        </div>
      </div>
    </MobileNavProvider>
  );
}
