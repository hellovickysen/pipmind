/**
 * Dashboard skeleton loading state.
 * Shown automatically by Next.js while the dashboard page fetches data.
 */

function Pulse({ className }) {
  return <div className={'animate-pulse rounded-xl bg-white/[0.06] ' + (className || '')} />;
}

export default function DashboardLoading() {
  return (
    <div className="px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Pulse className="h-8 w-36" />
        <Pulse className="h-10 w-28 rounded-xl" />
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:col-span-1">
          <Pulse className="mb-2 h-3 w-16" />
          <Pulse className="h-9 w-28" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <Pulse className="mb-2 h-3 w-14" />
            <Pulse className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Discipline section */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-4">
          <Pulse className="h-[120px] w-[120px] rounded-full" />
          <div className="flex-1 space-y-3">
            <Pulse className="h-3 w-24" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <Pulse className="mb-1 h-2 w-16" />
                  <Pulse className="h-6 w-10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2-column: Equity + Calendar/Coach */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* Equity curve */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Pulse className="mb-3 h-4 w-24" />
            <Pulse className="h-[200px] w-full" />
          </div>
          {/* Recent trades */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <Pulse className="h-4 w-28" />
              <Pulse className="h-3 w-16" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 border-t border-white/5 py-3">
                <Pulse className="h-4 w-20" />
                <Pulse className="h-5 w-12 rounded-md" />
                <Pulse className="h-4 w-16 flex-1" />
                <Pulse className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {/* Calendar */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Pulse className="mb-3 h-4 w-20" />
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <Pulse key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
          {/* Expenses */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Pulse className="mb-3 h-4 w-32" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                  <Pulse className="mb-1 h-2 w-10" />
                  <Pulse className="h-5 w-14" />
                </div>
              ))}
            </div>
          </div>
          {/* AI Coach */}
          <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-violet-500/5 to-cyan-500/3 p-5">
            <Pulse className="mb-2 h-4 w-20" />
            <Pulse className="h-3 w-full" />
            <Pulse className="mt-1 h-3 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
