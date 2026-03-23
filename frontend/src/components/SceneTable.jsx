export default function SceneTable({ scenes, selectedScene, onSelectScene }) {
  if (!scenes || scenes.length === 0) return null;

  const getRiskClass = (score) => {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  };

  return (
    <div className="scene-table-container">
      <table className="scene-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Location</th>
            <th>Type</th>
            <th>Characters</th>
            <th>Features</th>
            <th>Risk</th>
            <th>Budget</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {scenes.map((s) => {
            const rc = getRiskClass(s.risk_score);
            const activeFeatures = Object.entries(s.features).filter(([, v]) => v).map(([k]) => k);
            return (
              <tr key={s.scene_number} className={selectedScene === s.scene_number ? 'selected' : ''}>
                <td className="scene-num">{s.scene_number}</td>
                <td className="location">{s.location || '—'}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {s.scene_type?.interior ? 'INT' : 'EXT'} · {s.scene_type?.day_night}
                  </span>
                </td>
                <td className="characters" title={s.characters?.join(', ')}>
                  {s.characters?.length || 0} chars
                </td>
                <td>
                  <div className="features-list">
                    {activeFeatures.map((f) => (
                      <span key={f} className={`feature-tag ${f}`}>{f}</span>
                    ))}
                    {activeFeatures.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>}
                  </div>
                </td>
                <td>
                  <div className="risk-bar">
                    <div className={`risk-bar-fill ${rc}`} style={{ width: `${s.risk_score}%` }} />
                  </div>
                  <span className={`badge badge-${rc}`}>{s.risk_score}</span>
                </td>
                <td className="budget-cell">${(s.budget / 1000).toFixed(1)}K</td>
                <td>
                  <button
                    className={`select-btn ${selectedScene === s.scene_number ? 'active' : ''}`}
                    onClick={() => onSelectScene(s.scene_number)}
                  >
                    {selectedScene === s.scene_number ? 'Selected' : 'Analyze'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
