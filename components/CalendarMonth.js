import Link from 'next/link';
import { num } from '@/lib/stats';

const DOW = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function fmtPnl(v) {
  if (v === 0) return '$0.00';
  const sign = v >= 0 ? '' : '-';
  const abs = Math.abs(v);
  return sign + '$' + (abs >= 1000 ? abs.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : abs % 1 === 0 ? abs.toFixed(2) : abs.toFixed(abs < 10 ? 2 : 1));
}

export default function CalendarMonth({ trades, year, month, selected, monthParam }) {
  // Index trades by day
  const byDay = {};
  (trades || []).forEach((t) => {
    const raw = t.closed_at || t.created_at;
    if (!raw) return;
    const d = new Date(raw);
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month) return;
    const day = d.getUTCDate();
    const e = byDay[day] || { net: 0, count: 0 };
    e.net += num(t.pnl);
    e.count += 1;
    byDay[day] = e;
  });

  // Build week rows
  const firstDow = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7; // 0=Mon
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const weeks = [];
  let currentWeek = new Array(7).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = (firstDow + d - 1) % 7;
    if (dow === 0 && d > 1) {
      weeks.push(currentWeek);
      currentWeek = new Array(7).fill(null);
    }
    currentWeek[dow] = d;
  }
  weeks.push(currentWeek);

  // Weekly summaries
  function weekSummary(week) {
    let net = 0;
    let days = 0;
    week.forEach((d) => {
      if (d && byDay[d]) {
        net += byDay[d].net;
        days += 1;
      }
    });
    return { net, days };
  }

  function cellBg(net) {
    const a = Math.min(0.35, 0.08 + Math.abs(net) / 2000);
    const c = net >= 0 ? '52,211,153' : '248,113,113';
    return { background: 'rgba(' + c + ',' + a + ')', borderLeft: '3px solid rgba(' + c + ',0.5)' };
  }

  return (
    <div>
      {/* Month quick navigator */}
      <div className="mb-5 flex items-start gap-6">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href={'/dashboard/calendar?month=' + (year - 1) + '-' + pad2(month + 1)}
              className="font-mono text-xs text-white/30 hover:text-white/60"
            >
              ‹
            </Link>
            <span className="font-mono text-sm font-semibold text-white/70">{year}</span>
            <Link
              href={'/dashboard/calendar?month=' + (year + 1) + '-' + pad2(month + 1)}
              className="font-mono text-xs text-white/30 hover:text-white/60"
            >
              ›
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((m, i) => (
              <Link
                key={m}
                href={'/dashboard/calendar?month=' + year + '-' + pad2(i + 1)}
                className={
                  'rounded px-2 py-1 text-center font-mono text-[10px] transition-colors ' +
                  (i === month
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5')
                }
              >
                {m}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-8" />
              {DOW.map((d) => (
                <th key={d} className="px-1 py-2 text-center font-mono text-[10px] font-normal uppercase tracking-wider text-white/30">
                  {d}
                </th>
              ))}
              <th className="px-2 py-2 text-right font-mono text-[10px] font-normal uppercase tracking-wider text-white/30">
                WEEKLY
              </th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => {
              const ws = weekSummary(week);
              return (
                <tr key={wi} className="border-t border-white/[0.06]">
                  {/* Week number */}
                  <td className="pr-2 pt-2 align-top font-mono text-[9px] text-white/20">
                    {week.find((d) => d !== null) ? 'Week ' + (wi + 1) : ''}
                  </td>

                  {/* Day cells */}
                  {week.map((d, di) => {
                    if (d === null) {
                      return <td key={di} className="p-0.5"><div className="h-16 rounded bg-white/[0.01]" /></td>;
                    }
                    const e = byDay[d];
                    const dateStr = year + '-' + pad2(month + 1) + '-' + pad2(d);
                    const isSel = selected === dateStr;

                    const cell = (
                      <div
                        className={
                          'flex h-16 flex-col justify-between rounded p-1.5 transition-colors ' +
                          (isSel ? 'ring-1 ring-cyan-400/50' : '') +
                          (e ? ' cursor-pointer hover:brightness-125' : ' bg-white/[0.02]')
                        }
                        style={e ? cellBg(e.net) : {}}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-white/40">{d}</span>
                          {e ? (
                            <span className="font-mono text-[9px] text-white/40">
                              {e.count} trade{e.count !== 1 ? 's' : ''}
                            </span>
                          ) : null}
                        </div>
                        {e ? (
                          <span className={'font-mono text-xs font-semibold ' + (e.net >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                            {fmtPnl(e.net)}
                          </span>
                        ) : null}
                      </div>
                    );

                    return (
                      <td key={di} className="p-0.5">
                        {e ? (
                          <Link href={'/dashboard/calendar?month=' + monthParam + '&date=' + dateStr}>
                            {cell}
                          </Link>
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}

                  {/* Weekly summary */}
                  <td className="p-0.5 pl-2 align-top">
                    <div className="flex h-16 flex-col justify-center text-right">
                      <span className={'font-mono text-xs font-semibold ' + (ws.days === 0 ? 'text-white/20' : ws.net >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {ws.days > 0 ? fmtPnl(ws.net) : '$0.00'}
                      </span>
                      <span className="font-mono text-[9px] text-white/30">
                        {ws.days > 0 ? ws.days + ' day' + (ws.days !== 1 ? 's' : '') : ''}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
