import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeBudget, setMonthlyBudget as setBudget } from '../services/goalService';
import { useAuth } from './AuthContext';

const GoalContext = createContext(null);

export function GoalProvider({ children }) {
  const { user } = useAuth();
  const [budget, setBudgetState] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBudgetState(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeBudget(user.uid, (data) => {
      setBudgetState(data.monthlyBudget || 0);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const setMonthlyBudget = useCallback(
    async (amount) => {
      if (!user) return;
      return setBudget(user.uid, amount);
    },
    [user]
  );

  return (
    <GoalContext.Provider value={{ budget, loading, setMonthlyBudget }}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoal() {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error('useGoal must be used within GoalProvider');
  return ctx;
}
