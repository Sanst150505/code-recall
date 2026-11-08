import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Dark Sidebar */}
      <Sidebar username="sannidhya1505" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f8fafc]">
        {children}
      </div>
    </div>
  );
}
