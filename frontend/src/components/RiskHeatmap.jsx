import { Flame } from 'lucide-react';

export default function RiskHeatmap({ scenes, selectedScene, onSelectScene }) {
  if (!scenes || scenes.length === 0) return null;

  const getRiskStyles = (score) => {
    if (score >= 70) return { bg: 'bg-[#7A1F26]', text: 'text-white', border: 'border-[#9A2B35]', isCritical: true };
    if (score >= 50) return { bg: 'bg-[#8B5A00]', text: 'text-amber-100', border: 'border-[#B87A00]', isCritical: false };
    if (score >= 30) return { bg: 'bg-[#8B5A00]', text: 'text-amber-100', border: 'border-[#B87A00]', isCritical: false }; 
    return { bg: 'bg-[#1A4D3E]', text: 'text-emerald-100', border: 'border-[#2A6D5A]', isCritical: false };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(42px,1fr))] gap-1.5 flex-1 content-start overflow-y-auto custom-scrollbar p-2.5 pb-4">
        {scenes.map((s) => {
          const isSelected = selectedScene === s.scene_number;
          const style = getRiskStyles(s.risk_score);
          return (
            <div
              key={s.scene_number}
              className={`
                aspect-square rounded-md flex items-center justify-center font-bold text-xs cursor-pointer transition-all duration-200 border relative
                hover:scale-105 hover:z-20
                ${style.bg} ${style.text} ${style.border}
                ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#15151C] scale-105 z-20 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'opacity-90 hover:opacity-100'}
              `}
              onClick={() => onSelectScene(s.scene_number)}
              title={`Scene ${s.scene_number}: ${s.location} — Risk ${s.risk_score}`}
            >
              <span className="opacity-90">{s.scene_number}</span>
              {style.isCritical && <Flame size={10} className="absolute -top-1.5 -right-1 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)] fill-red-500" />}
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-wrap items-center gap-5 mt-4 pt-4 border-t border-white/10 text-[0.70rem] uppercase tracking-wider font-bold text-slate-400">
        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#1A4D3E] shadow-[0_0_8px_rgba(26,77,62,0.6)]" /> Low</span>
        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#8B5A00] shadow-[0_0_8px_rgba(139,90,0,0.6)]" /> Med</span>
        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#7A1F26] shadow-[0_0_8px_rgba(122,31,38,0.6)]" /> High / Critical</span>
      </div>
    </div>
  );
}
