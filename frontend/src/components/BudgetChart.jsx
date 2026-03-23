import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BudgetChart({ scenes }) {
  if (!scenes || scenes.length === 0) return null;

  const data = scenes.map((s) => ({
    name: `S${s.scene_number}`,
    budget: s.budget,
    risk: s.risk_score,
  }));

  const getBarColor = (risk) => {
    if (risk >= 70) return '#dc2626';
    if (risk >= 50) return '#ef4444';
    if (risk >= 30) return '#f59e0b';
    return '#10b981';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: '0.8rem',
        }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Scene {d.name.replace('S', '')}</p>
          <p style={{ color: 'var(--accent-success)' }}>Budget: ${(d.budget / 1000).toFixed(1)}K</p>
          <p style={{ color: 'var(--accent-warning)' }}>Risk: {d.risk}/100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="budget" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.risk)} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
