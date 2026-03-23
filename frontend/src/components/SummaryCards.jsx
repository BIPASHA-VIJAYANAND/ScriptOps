export default function SummaryCards({ analysis }) {
  if (!analysis) return null;
  const { total_scenes, total_budget, avg_risk_score, high_risk_scenes } = analysis;

  const cards = [
    { label: 'Total Scenes', value: total_scenes, sub: 'Detected in script' },
    { label: 'Total Budget', value: `$${(total_budget / 1000).toFixed(0)}K`, sub: 'Estimated production cost' },
    { label: 'Avg Risk Score', value: avg_risk_score.toFixed(1), sub: 'Out of 100' },
    { label: 'High Risk Scenes', value: high_risk_scenes, sub: 'Score ≥ 50' },
  ];

  return (
    <div className="summary-cards">
      {cards.map((c, i) => (
        <div className="summary-card" key={i}>
          <div className="label">{c.label}</div>
          <div className="value">{c.value}</div>
          <div className="sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
