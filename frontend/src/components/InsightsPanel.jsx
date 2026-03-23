import { useState, useEffect, useRef } from 'react';

const API = 'http://127.0.0.1:8000/api/v1';

const DIFFICULTY_COLORS = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
  Extreme: '#dc2626',
};

function DifficultyBadge({ level }) {
  const color = DIFFICULTY_COLORS[level] || '#6366f1';
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: 12, fontSize: '0.75rem',
      fontWeight: 700, background: `${color}22`, color, border: `1px solid ${color}55`, letterSpacing: '0.5px',
    }}>
      {level}
    </span>
  );
}

function ShimmerRow() {
  return (
    <div style={{
      height: 80, borderRadius: 8,
      background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-card-hover) 50%, var(--bg-secondary) 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite',
    }} />
  );
}

function EmptyState({ tab, selectedScene }) {
  if (tab === 'scene' && !selectedScene) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎯</div>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No scene selected</p>
        <p style={{ fontSize: '0.82rem' }}>Click any row in the Scene Table or a cell in the Risk Heatmap to analyse it.</p>
      </div>
    );
  }
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🤖</div>
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No insights yet</p>
      <p style={{ fontSize: '0.82rem' }}>Click <strong>Generate</strong> to get AI-powered production advice.</p>
    </div>
  );
}

export default function InsightsPanel({ analysis, selectedScene }) {
  const [tab, setTab] = useState('overall'); // 'overall', 'scene', 'chat', 'crew'
  
  // Analytics State
  const [overallData, setOverallData] = useState(null);
  const [sceneData, setSceneData] = useState({});   // keyed by scene_number
  const [crewData, setCrewData] = useState(null);
  const [crewLoading, setCrewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevScene = useRef(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', content: "Hello! I'm your AI Production Assistant. Ask me anything about the script's budget, risks, or logistics!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-switch to scene tab when a scene is selected
  useEffect(() => {
    if (selectedScene && selectedScene !== prevScene.current) {
      // If we are not in chat, switch to scene tab automatically
      if (tab !== 'chat') {
        setTab('scene');
      }
      prevScene.current = selectedScene;
      if (!sceneData[selectedScene]) {
        fetchScene(selectedScene);
      }
    }
  }, [selectedScene, tab, sceneData]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (tab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, tab]);

  const fetchOverall = async () => {
    if (overallData) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/insights`);
      const data = await res.json();
      setOverallData(data);
    } catch (e) {
      setOverallData({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchScene = async (sceneNum) => {
    const num = sceneNum ?? selectedScene;
    if (!num) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/insights/${num}`);
      const data = await res.json();
      setSceneData(prev => ({ ...prev, [num]: data }));
    } catch (e) {
      setSceneData(prev => ({ ...prev, [num]: { error: e.message } }));
    } finally {
      setLoading(false);
    }
  };

  const fetchCrew = async () => {
    setCrewLoading(true);
    try {
      // Derive requirements from current scene or overall
      let reqs = {
        needs_vfx: 0, needs_stunts: 0, needs_night_shoot: 0, needs_crowd: 0,
        complexity_level: "medium", budget_level: "medium"
      };
      
      const currentSceneData = selectedScene ? analysis?.scenes.find(s => s.scene_number === selectedScene) : null;
      if (currentSceneData) {
        reqs.needs_vfx = currentSceneData.features.vfx ? 1 : 0;
        reqs.needs_stunts = currentSceneData.features.stunt ? 1 : 0;
        reqs.needs_night_shoot = currentSceneData.features.night ? 1 : 0;
        reqs.needs_crowd = currentSceneData.features.crowd ? 1 : 0;
        reqs.complexity_level = currentSceneData.risk_score > 60 ? 'high' : currentSceneData.risk_score < 30 ? 'low' : 'medium';
        reqs.budget_level = currentSceneData.budget > 50000 ? 'high' : currentSceneData.budget < 10000 ? 'low' : 'medium';
      } else if (analysis) {
        reqs.complexity_level = analysis.avg_risk_score > 60 ? 'high' : 'medium';
      }

      const res = await fetch(`${API}/match-creators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script_requirements: reqs })
      });
      const data = await res.json();
      setCrewData(data.matches || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCrewLoading(false);
    }
  };

  const handleGenerate = () => {
    if (tab === 'overall') fetchOverall();
    else if (tab === 'scene') fetchScene();
    else if (tab === 'crew') fetchCrew();
  };

  const refreshCurrent = () => {
    if (tab === 'overall') {
      setOverallData(null);
      setTimeout(() => fetchOverall(), 0);
    } else if (tab === 'scene' && selectedScene) {
      setSceneData(prev => { const n = { ...prev }; delete n[selectedScene]; return n; });
      setTimeout(() => fetchScene(selectedScene), 0);
    }
  };

  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: chatInput.trim() };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch(`${API}/insights/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          selected_scene_id: selectedScene || null
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Server returned an error");
      }
      
      setChatHistory(prev => [...prev, { role: 'model', content: data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', content: `⚠️ ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const currentData = tab === 'overall' ? overallData : (tab === 'scene' && selectedScene ? sceneData[selectedScene] : null);
  const hasData = currentData && !currentData.error;
  const hasError = currentData?.error;
  const needsGenerate = !currentData && !loading && tab !== 'chat';
  const missingScene = tab === 'scene' && !selectedScene;

  const currentScene = selectedScene
    ? analysis?.scenes.find(s => s.scene_number === selectedScene)
    : null;

  if (!analysis) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '500px', gap: 16 }}>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {[
          { id: 'overall', label: '🎬 Overall' },
          { id: 'scene',   label: selectedScene ? `🎯 Scene ${selectedScene}` : '🎯 Scene' },
          { id: 'chat',    label: '💬 Chat' },
          { id: 'crew',    label: '🎭 Crew' }
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid',
              borderColor: tab === id ? 'var(--accent-primary)' : 'var(--border-color)',
              background: tab === id ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)',
              color: tab === id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: tab === id ? 700 : 500, fontSize: '0.82rem',
              cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {label}
          </button>
        ))}

        {/* Refresh button — only when data exists on report tabs */}
        {hasData && tab !== 'chat' && tab !== 'crew' && (
          <button
            onClick={refreshCurrent} disabled={loading} title="Re-generate insights"
            style={{
              padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            ↻
          </button>
        )}
      </div>

      {/* Scene context strip */}
      {currentScene && (tab === 'scene' || tab === 'chat' || tab === 'crew') && (
        <div style={{
          padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-accent)',
          fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentScene.heading}</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Risk <strong style={{ color: currentScene.risk_score >= 70 ? 'var(--accent-critical)' : currentScene.risk_score >= 50 ? 'var(--accent-danger)' : currentScene.risk_score >= 30 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>{currentScene.risk_score}</strong>/100
            &nbsp;·&nbsp;
            Budget <strong style={{ color: 'var(--text-primary)' }}>${currentScene.budget.toLocaleString()}</strong>
          </span>
        </div>
      )}

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* CHAT TAB ────────────────────────────────────────────── */}
        {tab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '0 4px 16px 4px' }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  padding: '10px 14px', borderRadius: 12, maxWidth: '85%',
                  borderBottomRightRadius: msg.role === 'user' ? 2 : 12,
                  borderBottomLeftRadius: msg.role === 'model' ? 2 : 12,
                  fontSize: '0.85rem', lineHeight: 1.5,
                  border: msg.role === 'model' ? '1px solid var(--border-color)' : 'none'
                }}>
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 12, borderBottomLeftRadius: 2, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 16 }}>
                    <span className="dot-pulse" style={{ animationDelay: '0s' }}>●</span>
                    <span className="dot-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                    <span className="dot-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={selectedScene ? `Ask about Scene ${selectedScene}...` : "Ask about the script..."}
                disabled={chatLoading}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                style={{
                  padding: '0 20px', borderRadius: 8, background: 'var(--accent-primary)', color: 'white',
                  border: 'none', fontWeight: 600, cursor: (!chatInput.trim() || chatLoading) ? 'not-allowed' : 'pointer',
                  opacity: (!chatInput.trim() || chatLoading) ? 0.5 : 1, transition: 'all 0.2s'
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* LOADING SHIMMER */}
        {loading && tab !== 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ShimmerRow /><ShimmerRow /><ShimmerRow />
          </div>
        )}

        {/* EMPTY STATES */}
        {!loading && missingScene && tab !== 'chat' && tab !== 'crew' && <EmptyState tab="scene" selectedScene={null} />}
        {!loading && needsGenerate && !missingScene && tab !== 'chat' && tab !== 'crew' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
            <EmptyState tab={tab} selectedScene={selectedScene} />
            <button className="simulate-btn" onClick={handleGenerate} style={{ width: 'auto', padding: '12px 32px', fontSize: '0.9rem' }}>
              ✨ Generate Insights
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && hasError && tab !== 'chat' && (
          <div className="insight-item danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>⚠️ Error generating insights</h4>
              <p>{currentData.error}</p>
            </div>
            <button className="select-btn" onClick={handleGenerate}>Retry</button>
          </div>
        )}

        {/* ── OVERALL insights ─────────────────────────────────────────── */}
        {!loading && hasData && tab === 'overall' && (
          <div className="insights-content" style={{ paddingRight: 4 }}>
            {currentData.executive_summary && (
              <div className="insight-item">
                <h4>📋 Executive Summary</h4>
                <p>{currentData.executive_summary}</p>
              </div>
            )}
            {currentData.key_concerns?.length > 0 && (
              <div className="insight-item warning">
                <h4>⚠️ Key Concerns</h4>
                <ul>{currentData.key_concerns.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </div>
            )}
            {currentData.recommendations?.length > 0 && (
              <div className="insight-item success">
                <h4>💡 Recommendations</h4>
                <ul>{currentData.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}
            {currentData.suggested_shoot_order && (
              <div className="insight-item">
                <h4>📅 Shooting Order</h4>
                <p>{currentData.suggested_shoot_order}</p>
              </div>
            )}
            {currentData.estimated_total_shooting_days != null && (
              <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                🎥 Estimated total shooting days: <strong style={{ color: 'var(--accent-primary)' }}>{currentData.estimated_total_shooting_days}</strong>
              </div>
            )}
          </div>
        )}

        {/* ── SCENE insights ────────────────────────────────────────────── */}
        {!loading && hasData && tab === 'scene' && (
          <div className="insights-content" style={{ paddingRight: 4 }}>
            {currentData.summary && (
              <div className="insight-item">
                <h4>📋 Scene Summary</h4>
                <p>{currentData.summary}</p>
              </div>
            )}
            {currentData.top_risks?.length > 0 && (
              <div className="insight-item danger">
                <h4>🚨 Top Risks</h4>
                <ul>
                  {currentData.top_risks.map((r, i) => (
                    <li key={i}><strong>{r.risk}</strong> — {r.mitigation}</li>
                  ))}
                </ul>
              </div>
            )}
            {currentData.cost_optimizations?.length > 0 && (
              <div className="insight-item success">
                <h4>💰 Cost Optimizations</h4>
                <ul>{currentData.cost_optimizations.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </div>
            )}
            {currentData.difficulty && (
              <div className="insight-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h4>📊 Production Difficulty</h4>
                  <p style={{ marginTop: 6 }}>
                    Shooting days estimate: <strong style={{ color: 'var(--text-primary)' }}>{currentData.shooting_days_estimate ?? '—'}</strong>
                  </p>
                </div>
                <DifficultyBadge level={currentData.difficulty} />
              </div>
            )}
          </div>
        )}

        {/* ── CREW MATCHING ────────────────────────────────────────────── */}
        {tab === 'crew' && (
          <div className="insights-content" style={{ paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!crewData && !crewLoading && (
               <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                 <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎭</div>
                 <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Find Your Crew</p>
                 <p style={{ fontSize: '0.82rem', marginBottom: 16 }}>Match with the perfect creators based on your script's unique demands.</p>
                 <button className="simulate-btn" onClick={fetchCrew} style={{ width: 'auto', padding: '12px 32px' }}>
                   ✨ Find Matches
                 </button>
               </div>
            )}
            {crewLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ShimmerRow /><ShimmerRow />
              </div>
            )}
            {crewData && crewData.map((match, i) => (
              <div key={i} style={{
                background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, border: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column', gap: 12
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                     <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                       {match.creator_name.charAt(0)}
                     </div>
                     <div>
                       <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{match.creator_name}</h4>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{match.raw_data.experience_level} • {match.raw_data.engagement_rate} Engagement</span>
                     </div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: 16, fontWeight: 700, fontSize: '0.85rem' }}>
                    {match.score.toFixed(1)} Match
                  </div>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{match.explanation.why_they_fit}"
                </p>
                {match.explanation.trade_offs !== "None." && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', margin: 0 }}>
                    ⚠️ {match.explanation.trade_offs}
                  </p>
                )}
                
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {match.raw_data.skills.map((s, idx) => (
                    <span key={idx} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-accent)', borderRadius: 4, padding: '2px 8px', fontSize: '0.7rem', color: 'var(--text-primary)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
