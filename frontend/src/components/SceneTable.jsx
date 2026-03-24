export default function SceneTable({ scenes, selectedScene, onSelectScene }) {
  if (!scenes || scenes.length === 0) return null;

  const getRiskClass = (score) => {
    if (score >= 70) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (score >= 50) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    if (score >= 30) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-green-400 bg-green-400/10 border-green-400/20';
  };
  
  const getRiskBarColor = (score) => {
    if (score >= 70) return 'bg-red-400';
    if (score >= 50) return 'bg-orange-400';
    if (score >= 30) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  return (
    <div className="w-full overflow-x-auto h-[400px] overflow-y-auto custom-scrollbar">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="text-xs text-slate-400 uppercase bg-secondary/90 sticky top-0 backdrop-blur-md z-10 border-b border-white/5">
          <tr>
            <th className="px-6 py-4 font-semibold tracking-wider">#</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Location</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Characters</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Features</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Risk</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Budget</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {scenes.map((s) => {
            const badgeClass = getRiskClass(s.risk_score);
            const barClass = getRiskBarColor(s.risk_score);
            const activeFeatures = Object.entries(s.features).filter(([, v]) => v).map(([k]) => k);
            const isSelected = selectedScene === s.scene_number;
            
            return (
              <tr 
                key={s.scene_number} 
                className={`transition-colors duration-200 group ${isSelected ? 'bg-accent/10' : 'hover:bg-white/[0.03]'} cursor-default`}
              >
                <td className={`px-6 py-4 font-mono font-bold ${isSelected ? 'text-accent' : 'text-slate-500'}`}>
                  {String(s.scene_number).padStart(2, '0')}
                </td>
                <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate" title={s.location}>
                  {s.location || '—'}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-white/5 text-slate-300 border border-white/10">
                    {s.scene_type?.interior ? 'INT' : 'EXT'} · {s.scene_type?.day_night}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 font-medium" title={s.characters?.join(', ')}>
                  {s.characters?.length || 0} chars
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {activeFeatures.map((f) => (
                      <span key={f} className="text-[0.65rem] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                        {f}
                      </span>
                    ))}
                    {activeFeatures.length === 0 && <span className="text-slate-600">—</span>}
                  </div>
                </td>
                <td className="px-6 py-4 min-w-[140px]">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-xs border ${badgeClass}`}>
                      {s.risk_score}
                    </span>
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${barClass}`} style={{ width: `${s.risk_score}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-white font-medium">
                  ${(s.budget / 1000).toFixed(1)}K
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onSelectScene(s.scene_number)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                      isSelected 
                        ? 'bg-accent text-white shadow-[0_0_10px_rgba(124,58,237,0.4)] ring-1 ring-accent cursor-default' 
                        : 'bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Analyze'}
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
