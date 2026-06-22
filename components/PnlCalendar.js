import { num } from '@/lib/stats';

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function PnlCalendar({ trades }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const byDay = {};
  (trades || []).forEach((t) => {
    const raw = t.closed_at || t.created_at;
    if (!raw) return;
    const d = new Date(raw);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    const day = d.getDate();
    byDay[day] = (byDay[day] || 0) + num(t.pnl);
  });

  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function cellStyle(pnl) {
    if (pnl === undefined) return {};
    const a = Math.min(0.4, 0.12 + Math.abs(pnl) / 1500);
    const c = pnl >= 0 ? '52,211,153' : '248,113,113';
    return { background: 'rgba(' + c + ',' + a + ')', borderColor: 'rgba(' + c + ',0.3)' };
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-base font-semibold">P&amp;L calendar</div>
        <div className="font-mono text-xs text-white/40">{monthName}</div>
      </div>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {DOW.map((d, i) => (
          <div key={i} className="text-center font-mono text-[10px] text-white/30">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (d === null) return <div key={'b' + i} />;
          const pnl = byDay[d];
          const has = pnl !== undefined;
          const win = has && pnl >= 0;
          return (
            <div
              key={d}
              className="flex aspect-square flex-col justify-between rounded-lg border border-white/10 bg-white/[0.02] p-1.5"
              style={cellStyle(pnl)}
            >
              <div className="font-mono text-[10px] text-white/40">{d}</div>
              {has ? (
                <div className={'font-mono text-[10px] font-semibold ' + (win ? 'text-emerald-300' : 'text-red-300')}>
                  {(pnl >= 0 ? '+' : '-') + '$' + Math.abs(Math.round(pnl))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
