import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Dark Sidebar */}
      <Suspense fallback={<div className="w-60 bg-[#0a0f1d] shrink-0 h-screen sticky top-0" />}>
        <Sidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f8fafc]">
        {children}
      </div>
    </div>
  );
}
