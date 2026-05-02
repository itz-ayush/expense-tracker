import React, { useState, useMemo } from 'react';

export default function History({ expenses, categories, getCat, deleteExpense }) {
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

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

  const filtered = useMemo(() => {
    return filter === 'all' 
      ? expenses 
      : expenses.filter(e => e.category === filter);
  }, [expenses, filter]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const key = fmtD(e.date);
      if (!groups[key]) {
        groups[key] = { label: key, exps: [], total: 0 };
      }
      groups[key].exps.push(e);
      groups[key].total += e.amount;
    });
    return Object.values(groups);
  }, [filtered]);

  const handleDelete = async (id) => {
    setDeleting(id);
    await deleteExpense(id);
    setDeleting(null);
  };

  const exportCSV = () => {
    const header = 'Date,Category,Amount,Notes\n';
    const rows = expenses
      .map(e => {
        const cat = getCat(e.category);
        const notesEscaped = (e.notes || '').replace(/"/g, '""');
        return `${e.date},${cat.label},${e.amount},"${notesEscaped}"`;
      })
      .join('\n');

    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <p style={{ fontSize: '19px', fontWeight: '500', margin: '0' }}>History</p>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '1px 0 0 0' }}>
            {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="btn-secondary"
        >
          Export CSV
        </button>
      </div>

      <div className="filter-scroll">
        <button
          className={`chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`chip ${filter === cat.id ? 'active' : ''}`}
            onClick={() => setFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p style={{ fontSize: '13px', margin: '0' }}>No transactions</p>
        </div>
      ) : (
        grouped.map(group => (
          <div key={group.label} style={{ marginBottom: '12px' }}>
            <div className="group-header">
              <span>{group.label}</span>
              <span>{fmt(group.total)}</span>
            </div>
            <div className="raised-card" style={{ padding: '5px', margin: '0' }}>
              {group.exps.map(e => {
                const cat = getCat(e.category);
                return (
                  <div
                    key={e.id}
                    className="tx-item"
                    style={{
                      opacity: deleting === e.id ? 0.5 : 1,
                      pointerEvents: deleting === e.id ? 'none' : 'auto'
                    }}
                  >
                    <div className="tx-dot" style={{ background: `${cat.color}22`, color: cat.color }}>
                      {cat.icon}
                    </div>
                    <div className="tx-info">
                      <div className="tx-label">{e.notes || cat.label}</div>
                      <div className="tx-sub">{e.date} · {cat.label}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span className="tx-amount">-{fmt(e.amount)}</span>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="btn-danger"
                        disabled={deleting === e.id}
                      >
                        {deleting === e.id ? '...' : 'Del'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
