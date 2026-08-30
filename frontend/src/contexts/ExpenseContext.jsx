import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeExpenses, addExpense as addExp, removeExpense } from '../services/expenseService';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeExpenses(user.uid, (data) => {
      setExpenses(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addExpense = useCallback(
    async (data) => {
      if (!user) return;
      return addExp(user.uid, data);
    },
    [user]
  );

  const deleteExpense = useCallback(async (id) => {
    return removeExpense(id);
  }, []);

  return (
    <ExpenseContext.Provider value={{ expenses, loading, addExpense, deleteExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
}
