import { useState } from 'react';
import './App.css';
import './styles/components.css';
import ScriptUpload from './components/ScriptUpload';
import SummaryCards from './components/SummaryCards';
import SceneTable from './components/SceneTable';
import RiskHeatmap from './components/RiskHeatmap';
import BudgetChart from './components/BudgetChart';
import WhatIfPanel from './components/WhatIfPanel';
import InsightsPanel from './components/InsightsPanel';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [selectedScene, setSelectedScene] = useState(null);

  const handleUploadComplete = (data) => {
    setAnalysis(data);
    setSelectedScene(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Script Intelligence Dashboard</h1>
        <p>AI-Powered Risk Analysis & Budget Estimation</p>
      </header>

      {/* Upload Section */}
      <div className="dashboard">
        <div className="dashboard-row full">
          <ScriptUpload onUploadComplete={handleUploadComplete} />
        </div>

        {analysis && (
          <>
            {/* Summary KPIs */}
            <SummaryCards analysis={analysis} />

            {/* Heatmap + Budget Chart */}
            <div className="dashboard-row two-col">
              <div className="card">
                <div className="section-title"><span className="icon">🔥</span> Risk Heatmap</div>
                <RiskHeatmap
                  scenes={analysis.scenes}
                  selectedScene={selectedScene}
                  onSelectScene={setSelectedScene}
                />
              </div>
              <div className="card">
                <div className="section-title"><span className="icon">💰</span> Budget by Scene</div>
                <BudgetChart scenes={analysis.scenes} />
              </div>
            </div>

            {/* Scene Table */}
            <div className="card">
              <div className="section-title"><span className="icon">📋</span> Scene Breakdown</div>
              <SceneTable
                scenes={analysis.scenes}
                selectedScene={selectedScene}
                onSelectScene={setSelectedScene}
              />
            </div>

            {/* What-If + Insights */}
            <div className="dashboard-row two-col">
              <div className="card">
                <div className="section-title"><span className="icon">🎯</span> What-If Simulator</div>
                <WhatIfPanel scenes={analysis.scenes} selectedScene={selectedScene} />
              </div>
              <div className="card">
                <div className="section-title"><span className="icon">🤖</span> AI Insights</div>
                <InsightsPanel analysis={analysis} selectedScene={selectedScene} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
