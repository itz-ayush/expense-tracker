import React, { useState, useEffect } from 'react';

export default function Add({ categories, addExpense, onNavigate, syncing }) {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amt = parseFloat(amount);
    
    if (!amt || isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!date) {
      setError('Please select a date');
      return;
    }

    setIsSubmitting(true);
    
    const success = await addExpense({
      amount: amt,
      category: selectedCategory,
      date: date,
      notes: notes.trim()
    });

    setIsSubmitting(false);

    if (success) {
      setAmount('');
      setNotes('');
      setSelectedCategory('food');
      setDate(new Date().toISOString().split('T')[0]);
      setError('');
      onNavigate('home');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ fontSize: '19px', fontWeight: '500', marginBottom: '13px' }}>Add expense</p>

      <div className="amount-input-wrapper">
        <span className="amount-currency">₹</span>
        <input
          className="amount-input"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          inputMode="decimal"
          min="0"
          step="any"
          autoFocus
        />
      </div>

      <p className="section-header">Category</p>
      <div className="cat-grid">
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`cat-btn ${selectedCategory === cat.id ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <div className="cat-icon" style={{ background: `${cat.color}22`, color: cat.color }}>
              {cat.icon}
            </div>
            <span className="cat-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <p className="section-header">Date</p>
      <input
        className="input-field"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ marginBottom: '9px' }}
      />

      <p className="section-header">Notes (optional)</p>
      <input
        className="input-field"
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What did you spend on?"
        maxLength="60"
        style={{ marginBottom: '14px' }}
      />

      {error && (
        <p style={{ color: '#E24B4A', fontSize: '11px', marginBottom: '8px' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={isSubmitting || syncing}
        style={{ opacity: isSubmitting || syncing ? 0.6 : 1, cursor: isSubmitting || syncing ? 'not-allowed' : 'pointer' }}
      >
        {isSubmitting || syncing ? 'Adding...' : 'Add expense'}
      </button>
    </form>
  );
}
