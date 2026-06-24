const ACHIEVEMENT_DEFS = [
  { key: 'first_trade', name: 'First Trade', icon: '\u{1F3AF}', desc: 'Log your first trade', threshold: 1, metric: 'totalTrades' },
  { key: 'ten_trades', name: 'Getting Started', icon: '\u{1F4CA}', desc: 'Log 10 trades', threshold: 10, metric: 'totalTrades' },
  { key: 'fifty_trades', name: 'Committed', icon: '\u{1F4AA}', desc: 'Log 50 trades', threshold: 50, metric: 'totalTrades' },
  { key: 'century', name: 'Century Club', icon: '\u{1F3C6}', desc: 'Log 100 trades', threshold: 100, metric: 'totalTrades' },
  { key: 'streak_5', name: 'On Fire', icon: '\u{1F525}', desc: '5-day journal streak', threshold: 5, metric: 'journalStreak' },
  { key: 'streak_10', name: 'Unstoppable', icon: '⚡', desc: '10-day journal streak', threshold: 10, metric: 'journalStreak' },
  { key: 'streak_30', name: 'Iron Will', icon: '\u{1F3C5}', desc: '30-day journal streak', threshold: 30, metric: 'journalStreak' },
  { key: 'clean_week', name: 'Clean Week', icon: '✨', desc: 'No revenge trades for 7 days', threshold: 7, metric: 'noRevengeStreak' },
  { key: 'discipline_100', name: 'Perfect Discipline', icon: '\u{1F48E}', desc: '100% setup discipline this week', threshold: 100, metric: 'setupDiscipline' },
  { key: 'score_90', name: 'Elite Trader', icon: '\u{1F451}', desc: 'Weekly score above 90', threshold: 90, metric: 'weeklyScore' },
];

export function computeAchievements(metrics) {
  return ACHIEVEMENT_DEFS.map((a) => {
    const value = metrics[a.metric] || 0;
    const progress = Math.min(value / a.threshold, 1);
    const earned = value >= a.threshold;
    return { ...a, value, progress, earned };
  });
}
