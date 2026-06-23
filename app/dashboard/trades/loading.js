function Pulse({ className }) {
  return <div className={'animate-pulse rounded-xl bg-white/[0.06] ' + (className || '')} />;
}

export default function TradesLoading() {
  return (
    <div className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Pulse className="h-8 w-20" />
        <div className="flex gap-2">
          <Pulse className="h-10 w-24 rounded-xl" />
          <Pulse className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Pulse key={i} className="h-9 w-20 rounded-lg" />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 border-t border-white/5 py-3">
            <Pulse className="h-4 w-20" />
            <Pulse className="h-5 w-12 rounded-md" />
            <Pulse className="h-4 w-14" />
            <Pulse className="h-4 w-20" />
            <Pulse className="h-4 w-16 flex-1" />
            <Pulse className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}
