const StatsPanel = ({ stats }) => {
  return (
    <div className="stats-panel-new">
      <h3 className="stats-title-new">Statistics</h3>
      <div className="stats-grid-new">
        <div className="stat-item-new">
          <div className="stat-label-new">Comparisons</div>
          <div className="stat-value-new">{stats.comparisons}</div>
        </div>
        {stats.swaps > 0 && (
          <div className="stat-item-new">
            <div className="stat-label-new">Swaps</div>
            <div className="stat-value-new">{stats.swaps}</div>
          </div>
        )}
        <div className="stat-item-new">
          <div className="stat-label-new">Time</div>
          <div className="stat-value-new complexity">{stats.timeComplexity}</div>
        </div>
        <div className="stat-item-new">
          <div className="stat-label-new">Space</div>
          <div className="stat-value-new complexity">{stats.spaceComplexity}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
