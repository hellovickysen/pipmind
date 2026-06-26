"use client";

import { useState, useRef, useCallback } from 'react';

const W = 800;
const H = 280;
const PAD = { top: 24, right: 16, bottom: 36, left: 64 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

function fmtVal(v) {
  const sign = v >= 0 ? '+' : '-';
  return sign + '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function yTicks(min, max, count = 5) {
  const range = max - min || 1;
  const step = range / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round((min + step * i) * 100) / 100);
}

export default function EquityChart({ data }) {
  const [mode, setMode] = useState('cumulative');
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  if (!data || data.length < 2) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-white/55">
        Log at least two trades to see your equity curve.
      </div>
    );
  }

  const values = data.map((d) => (mode === 'cumulative' ? d.cumulative : d.daily));
  const minVal = Math.min(0, ...values);
  const maxVal = Math.max(0, ...values);
  const range = maxVal - minVal || 1;

  function scaleX(i) { return PAD.left + (i / (data.length - 1)) * CHART_W; }
  function scaleY(v) { return PAD.top + CHART_H * (1 - (v - minVal) / range); }

  const barWidth = Math.max(4, Math.min(40, (CHART_W / data.length) * 0.6));
  const zeroY = scaleY(0);
  const ticks = yTicks(minVal, maxVal, 5);

  // X-axis labels: show ~5-7 evenly spaced
  const labelStep = Math.max(1, Math.ceil(data.length / 6));
  const xLabels = data.filter((_, i) => i % labelStep === 0 || i === data.length - 1);

  // Cumulative line path
  const linePts = data.map((d, i) => [scaleX(i), scaleY(d.cumulative)]);
  const linePath = linePts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const areaPath = linePath + ` L ${linePts[linePts.length - 1][0].toFixed(1)} ${zeroY.toFixed(1)} L ${linePts[0][0].toFixed(1)} ${zeroY.toFixed(1)} Z`;

  // Hover handler
  const handleMouseMove = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;
    const relX = mouseX - PAD.left;
    const idx = Math.round((relX / CHART_W) * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  }, [data.length]);

  const hoverItem = hoverIdx !== null ? data[hoverIdx] : null;
  const hoverVal = hoverItem ? (mode === 'cumulative' ? hoverItem.cumulative : hoverItem.daily) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-base font-semibold">P&L Performance</div>
        <div className="flex gap-0.5 rounded-lg border border-white/10 bg-black/30 p-0.5">
          {[{ key: 'cumulative', label: 'Cumulative' }, { key: 'daily', label: 'Daily' }].map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={'rounded-md px-3 py-1.5 text-xs font-semibold transition-all ' + (mode === m.key ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white/60')}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-[200px] sm:h-[280px] w-full select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="eqLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        {/* Grid lines + Y labels */}
        {ticks.map((v, i) => {
          const y = scaleY(v);
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="JetBrains Mono, monospace">
                ${Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'K' : v.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Zero line */}
        {minVal < 0 && (
          <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
        )}

        {/* X labels */}
        {xLabels.map((d) => {
          const i = data.indexOf(d);
          return (
            <text key={d.date} x={scaleX(i)} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="JetBrains Mono, monospace">
              {d.label}
            </text>
          );
        })}

        {/* ── Cumulative mode ── */}
        {mode === 'cumulative' && (
          <>
            <path d={areaPath} fill="url(#eqGrad)" />
            <path d={linePath} fill="none" stroke="url(#eqLine)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {/* Dots */}
            {data.map((d, i) => (
              <circle
                key={i}
                cx={scaleX(i)}
                cy={scaleY(d.cumulative)}
                r={hoverIdx === i ? 5 : 2.5}
                fill={hoverIdx === i ? '#22d3ee' : 'rgba(34,211,238,0.6)'}
                stroke={hoverIdx === i ? '#fff' : 'none'}
                strokeWidth="2"
              />
            ))}
          </>
        )}

        {/* ── Daily mode ── */}
        {mode === 'daily' && (
          <>
            {data.map((d, i) => {
              const x = scaleX(i) - barWidth / 2;
              const isPos = d.daily >= 0;
              const barY = isPos ? scaleY(d.daily) : zeroY;
              const barH = Math.abs(scaleY(d.daily) - zeroY);
              const isHovered = hoverIdx === i;
              return (
                <rect
                  key={i}
                  x={x}
                  y={barY}
                  width={barWidth}
                  height={Math.max(1, barH)}
                  rx={2}
                  fill={isPos ? (isHovered ? '#34d399' : 'rgba(52,211,153,0.7)') : (isHovered ? '#f87171' : 'rgba(248,113,113,0.7)')}
                />
              );
            })}
          </>
        )}

        {/* ── Hover crosshair + tooltip ── */}
        {hoverIdx !== null && hoverItem && (
          <>
            {/* Vertical line */}
            <line
              x1={scaleX(hoverIdx)}
              y1={PAD.top}
              x2={scaleX(hoverIdx)}
              y2={H - PAD.bottom}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              strokeDasharray="3 2"
            />

            {/* Tooltip background */}
            {(() => {
              const tx = scaleX(hoverIdx);
              const tooltipW = 140;
              const tooltipH = 44;
              // Flip tooltip if near right edge
              const tooltipX = tx + tooltipW + 10 > W ? tx - tooltipW - 10 : tx + 10;
              const tooltipY = PAD.top + 4;
              return (
                <g>
                  <rect x={tooltipX} y={tooltipY} width={tooltipW} height={tooltipH} rx={8} fill="#12121a" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                  <text x={tooltipX + 12} y={tooltipY + 18} fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="JetBrains Mono, monospace">
                    {hoverItem.label}
                  </text>
                  <text x={tooltipX + 12} y={tooltipY + 36} fill={hoverVal >= 0 ? '#34d399' : '#f87171'} fontSize="13" fontWeight="bold" fontFamily="Poppins, sans-serif">
                    {fmtVal(hoverVal)}
                  </text>
                </g>
              );
            })()}
          </>
        )}
      </svg>
    </div>
  );
}
