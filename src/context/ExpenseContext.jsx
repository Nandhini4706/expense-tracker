import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { useAuth } from './AuthContext.jsx';
import { isValidTransaction, STORAGE_KEY } from '../utils/constants.js';

const ExpenseContext = createContext(null);
const sanitizeList = (data, fallback) => (Array.isArray(data) ? data.filter(isValidTransaction) : fallback);
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now()}-${Math.random().toString(16).slice(2)}`);

/**
 * All users' transactions live in one localStorage key, each tagged with a userId.
 * The provider exposes ONLY the signed-in user's rows, and every write is scoped to
 * the userId taken from the auth session (never from form data).
 */
export function ExpenseProvider({ children }) {
  const { user, setCurrency } = useAuth();
  const userId = user?.id;
  const [allTransactions, setAll] = useLocalStorage(STORAGE_KEY, [], { sanitize: sanitizeList });

  const transactions = useMemo(() => (userId ? allTransactions.filter((t) => t.userId === userId) : []), [allTransactions, userId]);

  const addTransaction = useCallback((data) => {
    if (!userId) return;
    setAll((list) => [...list, { ...data, id: newId(), userId, createdAt: Date.now() }]);
  }, [userId, setAll]);

  const updateTransaction = useCallback((id, data) => {
    if (!userId) return;
    setAll((list) => list.map((t) => (t.id === id && t.userId === userId ? { ...t, ...data, id: t.id, userId: t.userId } : t)));
  }, [userId, setAll]);

  const deleteTransaction = useCallback((id) => {
    if (!userId) return;
    setAll((list) => list.filter((t) => !(t.id === id && t.userId === userId)));
  }, [userId, setAll]);

  /** Removes only the signed-in user's transactions. */
  const clearAll = useCallback(() => {
    if (!userId) return;
    setAll((list) => list.filter((t) => t.userId !== userId));
  }, [userId, setAll]);

  const value = useMemo(() => ({
    transactions, currency: user?.currency || 'INR', setCurrency,
    addTransaction, updateTransaction, deleteTransaction, clearAll,
  }), [transactions, user?.currency, setCurrency, addTransaction, updateTransaction, deleteTransaction, clearAll]);

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpense() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpense must be used inside <ExpenseProvider>');
  return ctx;
}
