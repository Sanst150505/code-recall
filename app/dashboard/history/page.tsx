import { Suspense } from "react";
import { Header } from "@/components/Header";
import { SubmissionHistoryTable } from "@/components/SubmissionHistoryTable";

export default function HistoryPage() {
  return (
    <>
      <Header
        title="History"
        description="All past submissions, runtimes, memory, and verdicts."
        username="sannidhya1505"
      />

      <main className="p-6 sm:p-8 max-w-6xl mx-auto w-full">
        <Suspense
          fallback={
            <div className="p-10 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              Loading submissions...
            </div>
          }
        >
          <SubmissionHistoryTable />
        </Suspense>
      </main>
    </>
  );
}
