import React, { useMemo } from 'react';

export default function Home({ expenses, categories, getCat }) {
  const now = new Date();

  const monthlyExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [expenses]);

  const weeklyExpenses = useMemo(() => {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return expenses.filter(e => new Date(e.date) >= weekAgo);
  }, [expenses]);

  const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const weeklyTotal = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyAvg = monthlyTotal / Math.max(now.getDate(), 1);

  const categorySummary = useMemo(() => {
    return categories
      .map(c => ({
        ...c,
        total: monthlyExpenses.filter(e => e.category === c.id).reduce((sum, e) => sum + e.amount, 0)
      }))
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [monthlyExpenses, categories]);

  const recent = expenses.slice(0, 5);

  const fmt = (n) => {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  };

  const fmtD = (s) => {
    const d = new Date(s);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div>
      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '500', marginBottom: '3px' }}>
        {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
      </div>
      
      <div className="big-amount" style={{ marginBottom: '3px' }}>
        {fmt(monthlyTotal)}
      </div>
      
      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
        spent this month
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div className="card" style={{ padding: '12px' }}>
          <p className="section-header" style={{ margin: '0 0 6px 0' }}>This week</p>
          <p style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', fontWeight: '500', margin: '0' }}>
            {fmt(weeklyTotal)}
          </p>
        </div>
        <div className="card" style={{ padding: '12px' }}>
          <p className="section-header" style={{ margin: '0 0 6px 0' }}>Daily avg</p>
          <p style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', fontWeight: '500', margin: '0' }}>
            {fmt(dailyAvg)}
          </p>
        </div>
      </div>

      {categorySummary.length > 0 && (
        <div className="card">
          <p className="section-header" style={{ margin: '0 0 10px 0' }}>
            By category — {new Date().toLocaleDateString('en-IN', { month: 'short' })}
          </p>
          {categorySummary.slice(0, 5).map(cat => (
            <div key={cat.id} style={{ marginBottom: '9px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <span style={{ fontSize: '12px', fontWeight: '500' }}>{cat.label}</span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: cat.color }}>
                  {fmt(cat.total)}
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${Math.round((cat.total / monthlyTotal) * 100)}%`,
                    background: cat.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
        <p className="section-header" style={{ margin: '0' }}>Recent</p>
      </div>

      <div className="raised-card" style={{ padding: '5px' }}>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
            </div>
            <p style={{ fontSize: '13px', margin: '0' }}>No expenses yet</p>
            <p style={{ fontSize: '11px', margin: '4px 0 0 0' }}>Tap + to add your first one</p>
          </div>
        ) : (
          recent.map(e => {
            const cat = getCat(e.category);
            return (
              <div key={e.id} className="tx-item">
                <div className="tx-dot" style={{ background: `${cat.color}22`, color: cat.color }}>
                  {cat.icon}
                </div>
                <div className="tx-info">
                  <div className="tx-label">{e.notes || cat.label}</div>
                  <div className="tx-sub">{fmtD(e.date)} · {cat.label}</div>
                </div>
                <span className="tx-amount">-{fmt(e.amount)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
