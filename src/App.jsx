import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import Home from './screens/Home';
import Add from './screens/Add';
import Charts from './screens/Charts';
import History from './screens/History';
import './App.css';

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'F', color: '#D85A30' },
  { id: 'transport', label: 'Travel', icon: 'T', color: '#185FA5' },
  { id: 'shopping', label: 'Shop', icon: 'S', color: '#BA7517' },
  { id: 'bills', label: 'Bills', icon: 'B', color: '#0F6E56' },
  { id: 'entertain', label: 'Fun', icon: 'E', color: '#534AB7' },
  { id: 'health', label: 'Health', icon: 'H', color: '#993556' },
  { id: 'other', label: 'Other', icon: 'O', color: '#5F5E5A' }
];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [user, setUser] = useState(null);
  const syncTimeoutRef = useRef(null);

  // Check auth and load expenses
  useEffect(() => {
    const initApp = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Auto sign up anonymous user
          const { data: { user: anonUser }, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          setUser(anonUser);
        } else {
          setUser(session.user);
        }

        // Load expenses
        await loadExpenses();
      } catch (err) {
        console.error('Init error:', err);
        // Continue with local data if auth fails
        loadLocalExpenses();
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel(`expenses:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          loadExpenses();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadExpenses = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
      saveLocalExpenses(data || []);
    } catch (err) {
      console.error('Load error:', err);
      loadLocalExpenses();
    }
  };

  const loadLocalExpenses = () => {
    const local = localStorage.getItem('xp-local');
    setExpenses(local ? JSON.parse(local) : []);
  };

  const saveLocalExpenses = (data) => {
    localStorage.setItem('xp-local', JSON.stringify(data));
  };

  const addExpense = async (expenseData) => {
    try {
      setSyncing(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      const newExpense = {
        ...expenseData,
        user_id: currentUser?.id,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('expenses')
        .insert([newExpense]);

      if (error) throw error;

      // Optimistic update
      setExpenses([newExpense, ...expenses]);
      saveLocalExpenses([newExpense, ...expenses]);
      
      return true;
    } catch (err) {
      console.error('Add error:', err);
      // Fallback: save locally and sync later
      const localExpense = {
        ...expenseData,
        id: Date.now(),
        synced: false
      };
      const updated = [localExpense, ...expenses];
      setExpenses(updated);
      saveLocalExpenses(updated);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      setSyncing(true);
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExpenses(expenses.filter(e => e.id !== id));
      saveLocalExpenses(expenses.filter(e => e.id !== id));
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[6];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--color-background-primary)',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>₹</div>
          <div style={{ fontSize: '14px' }}>Loading ExpenseTracker...</div>
        </div>
      </div>
    );
  }

  const screenProps = {
    expenses,
    categories: CATEGORIES,
    getCat,
    addExpense,
    deleteExpense,
    syncing
  };

  return (
    <div className="app">
      <div className="screen-container">
        {screen === 'home' && <Home {...screenProps} />}
        {screen === 'add' && <Add {...screenProps} onNavigate={setScreen} />}
        {screen === 'charts' && <Charts {...screenProps} />}
        {screen === 'history' && <History {...screenProps} onNavigate={setScreen} />}
      </div>

      <nav className="nav">
        <button
          className={`nav-btn ${screen === 'home' ? 'active' : ''}`}
          onClick={() => setScreen('home')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </button>
        <button
          className={`nav-btn ${screen === 'charts' ? 'active' : ''}`}
          onClick={() => setScreen('charts')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Charts
        </button>
        <button
          className="nav-btn nav-add"
          onClick={() => setScreen('add')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" stroke="white" />
          </svg>
          Add
        </button>
        <button
          className={`nav-btn ${screen === 'history' ? 'active' : ''}`}
          onClick={() => setScreen('history')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          History
        </button>
      </nav>

      {syncing && (
        <div style={{
          position: 'fixed',
          bottom: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-text-primary)',
          color: 'var(--color-background-primary)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          Syncing...
        </div>
      )}
    </div>
  );
}
