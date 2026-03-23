import { useState } from 'react';

const API = 'http://localhost:8000/api/v1';
const FEATURE_LIST = ['crowd', 'vfx', 'stunt', 'night', 'rain', 'vehicle', 'weapon', 'animal'];

export default function WhatIfPanel({ scenes, selectedScene }) {
  const scene = scenes?.find((s) => s.scene_number === selectedScene);
  const [features, setFeatures] = useState({});
  const [dayNight, setDayNight] = useState('');
  const [numChars, setNumChars] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset state when scene changes
  const sceneKey = scene?.scene_number;

  const toggleFeature = (feat) => {
    setFeatures((prev) => {
      const current = prev[feat] ?? scene?.features?.[feat] ?? false;
      return { ...prev, [feat]: !current };
    });
    setResult(null);
  };

  const simulate = async () => {
    if (!scene) return;
    setLoading(true);
    try {
      const body = {};
      if (Object.keys(features).length) body.features = features;
      if (dayNight) body.day_night = dayNight;
      if (numChars !== '') body.num_characters = parseInt(numChars) || 0;

      const res = await fetch(`${API}/whatif/${scene.scene_number}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!scene) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="icon">🎯</div>
        <h3>What-If Simulator</h3>
        <p>Select a scene from the table to simulate changes</p>
      </div>
    );
  }

  return (
    <div className="whatif-panel">
      <div className="whatif-scene-info">
        <h4>Scene #{scene.scene_number}</h4>
        <p>{scene.heading}</p>
      </div>

      <div className="whatif-controls">
        {FEATURE_LIST.map((feat) => {
          const isOn = features[feat] ?? scene.features?.[feat] ?? false;
          return (
            <div
              key={feat}
              className={`whatif-toggle ${isOn ? 'active' : ''}`}
              onClick={() => toggleFeature(feat)}
            >
              <span className="label">{feat}</span>
              <div className={`toggle-switch ${isOn ? 'on' : ''}`} />
            </div>
          );
        })}
      </div>

      <div className="whatif-extra">
        <label>Time of Day</label>
        <select value={dayNight || scene.scene_type?.day_night} onChange={(e) => { setDayNight(e.target.value); setResult(null); }}>
          <option value="DAY">Day</option>
          <option value="NIGHT">Night</option>
          <option value="DAWN/DUSK">Dawn/Dusk</option>
        </select>
      </div>

      <div className="whatif-extra">
        <label>Characters</label>
        <input
          type="number"
          min="0"
          max="50"
          value={numChars !== '' ? numChars : scene.num_characters}
          onChange={(e) => { setNumChars(e.target.value); setResult(null); }}
        />
      </div>

      <button className="simulate-btn" onClick={simulate} disabled={loading}>
        {loading ? '⏳ Simulating...' : '⚡ Simulate Changes'}
      </button>

      {result && (
        <div className="whatif-results">
          <h4>Simulation Results</h4>
          <div className="whatif-row">
            <span className="label">Risk Score</span>
            <span>
              {result.original_risk} → {result.modified_risk}
              <span className={`whatif-delta ${result.delta_risk > 0 ? 'positive' : result.delta_risk < 0 ? 'negative' : 'neutral'}`}>
                {' '}({result.delta_risk > 0 ? '+' : ''}{result.delta_risk})
              </span>
            </span>
          </div>
          <div className="whatif-row">
            <span className="label">Budget</span>
            <span>
              ${(result.original_budget / 1000).toFixed(1)}K → ${(result.modified_budget / 1000).toFixed(1)}K
              <span className={`whatif-delta ${result.delta_budget > 0 ? 'positive' : result.delta_budget < 0 ? 'negative' : 'neutral'}`}>
                {' '}({result.delta_budget > 0 ? '+' : ''}${(result.delta_budget / 1000).toFixed(1)}K)
              </span>
            </span>
          </div>
          <div className="whatif-row">
            <span className="label">Risk Level</span>
            <span>
              <span className={`badge badge-${result.original_risk_level.toLowerCase()}`}>{result.original_risk_level}</span>
              {' → '}
              <span className={`badge badge-${result.modified_risk_level.toLowerCase()}`}>{result.modified_risk_level}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
