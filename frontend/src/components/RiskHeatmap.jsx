export default function RiskHeatmap({ scenes, selectedScene, onSelectScene }) {
  if (!scenes || scenes.length === 0) return null;

  const getRiskClass = (score) => {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  };

  return (
    <div>
      <div className="heatmap-grid">
        {scenes.map((s) => (
          <div
            key={s.scene_number}
            className={`heatmap-cell ${getRiskClass(s.risk_score)} ${selectedScene === s.scene_number ? 'selected' : ''}`}
            onClick={() => onSelectScene(s.scene_number)}
            title={`Scene ${s.scene_number}: ${s.location} — Risk ${s.risk_score}`}
          >
            {s.scene_number}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span><span className="dot" style={{ background: 'var(--accent-success)' }} /> Low (0-29)</span>
        <span><span className="dot" style={{ background: 'var(--accent-warning)' }} /> Medium (30-49)</span>
        <span><span className="dot" style={{ background: 'var(--accent-danger)' }} /> High (50-69)</span>
        <span><span className="dot" style={{ background: 'var(--accent-critical)' }} /> Critical (70+)</span>
      </div>
    </div>
  );
}
