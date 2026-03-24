import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BudgetChart({ scenes }) {
  if (!scenes || scenes.length === 0) return null;

  const data = scenes.map((s) => ({
    name: `S${s.scene_number}`,
    budget: s.budget,
    risk: s.risk_score,
  }));

  const getBarColor = (risk) => {
    if (risk >= 70) return '#EF4444'; // red-500
    if (risk >= 50) return '#F97316'; // orange-500
    if (risk >= 30) return '#EAB308'; // yellow-500
    return '#22C55E'; // green-500
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-secondary/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
          <p className="font-bold text-white mb-2 tracking-wide">Scene {d.name.replace('S', '')}</p>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <p className="text-slate-300 text-sm">Budget: <span className="font-mono text-white font-semibold">${(d.budget / 1000).toFixed(1)}K</span></p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getBarColor(d.risk) }}></div>
            <p className="text-slate-300 text-sm">Risk Score: <span className="font-mono text-white font-semibold">{d.risk}/100</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            axisLine={false}
            tickLine={false}
            dx={-8}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff0a' }} />
          <Bar dataKey="budget" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.risk)} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
