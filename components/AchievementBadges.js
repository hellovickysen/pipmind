"use client";

export default function AchievementBadges({ achievements }) {
  if (!achievements || achievements.length === 0) return null;

  const earned = achievements.filter((a) => a.earned);
  const inProgress = achievements.filter((a) => !a.earned && a.progress > 0);
  const locked = achievements.filter((a) => !a.earned && a.progress === 0);

  return (
    <div>
      {/* Earned badges */}
      {earned.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-white/40">
            Earned ({earned.length}/{achievements.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {earned.map((a) => (
              <div
                key={a.key}
                className="group relative flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5"
                title={a.desc}
              >
                <span className="text-sm">{a.icon}</span>
                <span className="text-xs font-semibold text-white/80">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In progress */}
      {inProgress.length > 0 && (
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-white/30">
            In progress
          </div>
          <div className="flex flex-wrap gap-2">
            {inProgress.map((a) => (
              <div
                key={a.key}
                className="group relative flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.02] px-3 py-1.5"
                title={a.desc + ' (' + Math.round(a.progress * 100) + '%)'}
              >
                <span className="text-sm opacity-50">{a.icon}</span>
                <span className="text-xs text-white/40">{a.name}</span>
                <span className="font-mono text-[10px] text-white/25">{Math.round(a.progress * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
