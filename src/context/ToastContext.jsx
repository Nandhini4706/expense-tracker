import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);
let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismissToast = useCallback((id) => setToasts((l) => l.filter((t) => t.id !== id)), []);
  const notify = useCallback((type, message) => {
    const id = ++counter;
    setToasts((l) => [...l, { id, type, message }]);
    setTimeout(() => setToasts((l) => l.filter((t) => t.id !== id)), 3500);
  }, []);
  const value = useMemo(() => ({ toasts, notify, dismissToast }), [toasts, notify, dismissToast]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
