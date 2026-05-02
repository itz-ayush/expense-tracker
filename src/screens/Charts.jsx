import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Charts({ expenses, categories }) {
  const [period, setPeriod] = useState('month');

  const fmt = (n) => {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  };

  const filterByPeriod = (exps, p) => {
    const now = new Date();
    return exps.filter(e => {
      const d = new Date(e.date);
      if (p === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      }
      if (p === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return d.getFullYear() === now.getFullYear();
    });
  };

  const getBarData = (exps, p) => {
    const now = new Date();
    if (p === 'week') {
      const labels = [];
      const values = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('en-IN', { weekday: 'short' }));
        values.push(exps.filter(e => e.date === dateStr).reduce((s, ex) => s + ex.amount, 0));
      }
      return labels.map((label, idx) => ({ name: label, amount: values[idx] }));
    }

    if (p === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const data = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const amount = exps.filter(e => e.date === dateStr).reduce((s, ex) => s + ex.amount, 0);
        data.push({ name: String(i), amount });
      }
      return data;
    }

    const data = [];
    for (let m = 0; m < 12; m++) {
      const monthStr = new Date(now.getFullYear(), m).toLocaleDateString('en-IN', { month: 'short' });
      const amount = exps.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === m && d.getFullYear() === now.getFullYear();
      }).reduce((s, ex) => s + ex.amount, 0);
      data.push({ name: monthStr, amount });
    }
    return data;
  };

  const filtered = useMemo(() => filterByPeriod(expenses, period), [expenses, period]);
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  const barData = useMemo(() => getBarData(filtered, period), [filtered, period]);

  const pieData = useMemo(() => {
    return categories
      .map(c => ({
        name: c.label,
        value: filtered.filter(e => e.category === c.id).reduce((s, ex) => s + ex.amount, 0),
        color: c.color
      }))
      .filter(d => d.value > 0);
  }, [filtered, categories]);

  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches;
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#eeeeee' : '#111111';

  return (
    <div>
      <p style={{ fontSize: '19px', fontWeight: '500', marginBottom: '3px' }}>Analytics</p>
      <p style={{ fontSize: '26px', fontFamily: 'var(--font-mono)', fontWeight: '500', marginBottom: '12px', letterSpacing: '-0.5px' }}>
        {fmt(total)}
      </p>

      <div className="tab-group">
        {['week', 'month', 'year'].map(p => (
          <button
            key={p}
            className={`tab ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        <p className="section-header" style={{ margin: '0 0 12px 0' }}>Spending over time</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ top: 10, right: 0, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} />
            <Tooltip
              formatter={(value) => fmt(value)}
              contentStyle={{ 
                backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
                border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                borderRadius: '8px'
              }}
              labelStyle={{ color: textColor }}
            />
            <Bar dataKey="amount" fill="#185FA5" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <p className="section-header" style={{ margin: '0 0 12px 0' }}>By category</p>
        {pieData.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <p style={{ fontSize: '12px', margin: '0' }}>No data for this period</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '2px',
                    background: d.color,
                    flexShrink: 0
                  }} />
                  <span style={{ flex: 1, fontSize: '12px' }}>{d.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: d.color }}>
                    {fmt(d.value)} ({Math.round((d.value / total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
