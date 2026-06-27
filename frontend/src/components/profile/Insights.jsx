import { Tag, Zap, Clock, BarChart3, Terminal } from 'lucide-react';

const InsightTile = ({ k, v }) => (
  <div className="insight-tile">
    <div className="insight-tile-label">{k}</div>
    <div className="insight-tile-value">{v}</div>
  </div>
);

const Insights = ({ data = null }) => {
  // default items if no data provided
  const defaultItems = [
    { label: 'Most Solved', value: 'N/A' },
    { label: 'Fastest Exe', value: 'N/A' },
    { label: 'Active Day', value: 'N/A' },
    { label: 'Preferred', value: 'N/A' },
    { label: 'Load / Day', value: 'N/A' },
    { label: 'Global Rank', value: 'N/A' }
  ];

  const items = data ? [
    { label: 'Most Solved', value: data.mostSolvedCategory || 'N/A' },
    { label: 'Top Language', value: (() => {
      const lc = data.languageCount || {};
      const top = Object.entries(lc).sort((a,b) => b[1]-a[1])[0];
      return top ? `${top[0]} (${top[1]})` : 'N/A';
    })() },
    { label: 'Active Days', value: data.heatmap?.totalActiveDays ?? 'N/A' },
    { label: 'Total Pings', value: data.heatmap?.totalSubmissions ?? 'N/A' },
    { label: 'Max Streak', value: data.heatmap?.maxStreak ?? 'N/A' },
    { label: 'Global Rank', value: '—' }
  ] : defaultItems;

  return (
    <div className="insights-blueprint">
      {items.map((item, i) => (
        <div key={i} className="insight-tile">
          <span className="insight-tile-label">{item.label}</span>
          <span className="insight-tile-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default Insights;
