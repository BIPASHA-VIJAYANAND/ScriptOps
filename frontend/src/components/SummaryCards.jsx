import { motion } from 'framer-motion';
import { Clapperboard, DollarSign, AlertTriangle, Flame } from 'lucide-react';

export default function SummaryCards({ analysis }) {
  if (!analysis) return null;
  const { total_scenes, total_budget, avg_risk_score, high_risk_scenes } = analysis;

  const cards = [
    { 
      label: 'Total Scenes', value: total_scenes, sub: 'Detected in script',
      icon: Clapperboard, color: 'text-blue-400', bg: 'bg-blue-400/10'
    },
    { 
      label: 'Total Budget', value: `$${(total_budget / 1000).toFixed(0)}K`, sub: 'Estimated production cost',
      icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10'
    },
    { 
      label: 'Avg Risk Score', value: avg_risk_score.toFixed(1), sub: 'Out of 100',
      icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10'
    },
    { 
      label: 'High Risk Scenes', value: high_risk_scenes, sub: 'Score ≥ 50',
      icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10'
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container} initial="hidden" animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
    >
      {cards.map((c, i) => (
        <motion.div 
          variants={item} key={i}
          whileHover={{ y: -6, scale: 1.02 }}
          className="glass rounded-2xl p-6 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:border-accent/50 border border-white/5 transition-all duration-300"
        >
          {/* Subtle gradient glow inside card */}
          <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${c.bg} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-slate-400 text-sm font-medium tracking-wide uppercase">{c.label}</h3>
            <div className={`p-2 rounded-xl ${c.bg} ${c.color}`}>
              <c.icon size={20} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="relative z-10">
            {c.label === 'Avg Risk Score' ? (
               <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/10" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className={c.color} strokeDasharray={`${c.value}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white tracking-tighter">{c.value}</div>
                  </div>
                  <div className="text-[0.65rem] uppercase text-slate-400 font-bold leading-tight max-w-[70px] tracking-widest">{c.sub}</div>
               </div>
            ) : (
               <>
                 <div className="text-4xl font-extrabold text-white tracking-tight mb-1">{c.value}</div>
                 <div className="text-xs text-slate-500 font-medium">{c.sub}</div>
               </>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
