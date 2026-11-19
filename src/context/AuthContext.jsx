import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { CURRENCIES, SESSION_FLAG_KEY, SESSION_KEY, USERS_KEY } from '../utils/constants.js';
import { hashPassword, PBKDF2_ITERATIONS, randomSalt, safeEqual } from '../utils/security.js';
import { normalizeEmail } from '../utils/validation.js';

const AuthContext = createContext(null);

const isUser = (u) => Boolean(u && typeof u === 'object' && ['id', 'name', 'email', 'passwordHash', 'salt'].every((k) => typeof u[k] === 'string'));
const sanitizeUsers = (data, fallback) => (Array.isArray(data) ? data.filter(isUser) : fallback);

// The session stores ONLY the user id (never the password or its hash).
// Without "Remember me" it is honoured only while the browser tab/session is alive.
const sanitizeSession = (s) => {
  if (!s || typeof s !== 'object' || typeof s.userId !== 'string') return null;
  if (s.remember) return s;
  try { return sessionStorage.getItem(SESSION_FLAG_KEY) === '1' ? s : null; } catch { return null; }
};

const newId = () => `user-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
const fail = (error, field) => ({ ok: false, error, field });
const hashError = (err) => fail(err?.message || 'Something went wrong. Please try again.');

export function AuthProvider({ children }) {
  const [users, setUsers] = useLocalStorage(USERS_KEY, [], { sanitize: sanitizeUsers });
  const [session, setSession] = useLocalStorage(SESSION_KEY, null, { sanitize: sanitizeSession });

  // The active user is always derived from the session, never from form input.
  const account = useMemo(() => (session ? users.find((u) => u.id === session.userId) || null : null), [session, users]);
  const user = useMemo(() => (account ? {
    id: account.id, name: account.name, email: account.email, createdAt: account.createdAt,
    currency: CURRENCIES.some((c) => c.code === account.currency) ? account.currency : 'INR',
  } : null), [account]);

  // A session pointing at a deleted/unknown user is invalid.
  useEffect(() => { if (session && !account) setSession(null); }, [session, account, setSession]);

  const register = useCallback(async ({ name, email, password }) => {
    const e = normalizeEmail(email);
    if (users.some((u) => u.email === e)) return fail('An account with this email already exists.', 'email');
    try {
      const salt = randomSalt();
      const passwordHash = await hashPassword(password, salt);
      setUsers((list) => [...list, {
        id: newId(), name: name.trim(), email: e, passwordHash, salt, iterations: PBKDF2_ITERATIONS,
        currency: 'INR', createdAt: new Date().toISOString(),
      }]);
      return { ok: true };
    } catch (err) { return hashError(err); }
  }, [users, setUsers]);

  const login = useCallback(async ({ email, password, remember }) => {
    const found = users.find((u) => u.email === normalizeEmail(email));
    try {
      // Hash even for unknown emails so response time doesn't reveal which emails exist.
      const hash = await hashPassword(password, found ? found.salt : randomSalt(), found?.iterations || PBKDF2_ITERATIONS);
      if (!found || !safeEqual(hash, found.passwordHash)) return fail('Incorrect email or password.');
      try { sessionStorage.setItem(SESSION_FLAG_KEY, '1'); } catch { /* ignore */ }
      setSession({ userId: found.id, remember: Boolean(remember), createdAt: Date.now() });
      return { ok: true };
    } catch (err) { return hashError(err); }
  }, [users, setSession]);

  // Logout clears only the session. Users and transactions stay saved.
  const logout = useCallback(() => {
    try { sessionStorage.removeItem(SESSION_FLAG_KEY); } catch { /* ignore */ }
    setSession(null);
  }, [setSession]);

  const updateProfile = useCallback(async ({ name, email }) => {
    if (!account) return fail('You are not signed in.');
    const e = normalizeEmail(email);
    if (users.some((u) => u.id !== account.id && u.email === e)) return fail('Another account already uses this email.', 'email');
    setUsers((list) => list.map((u) => (u.id === account.id ? { ...u, name: name.trim(), email: e } : u)));
    return { ok: true };
  }, [account, users, setUsers]);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    if (!account) return fail('You are not signed in.');
    try {
      const current = await hashPassword(currentPassword, account.salt, account.iterations || PBKDF2_ITERATIONS);
      if (!safeEqual(current, account.passwordHash)) return fail('Current password is incorrect.', 'currentPassword');
      const salt = randomSalt();
      const passwordHash = await hashPassword(newPassword, salt);
      setUsers((list) => list.map((u) => (u.id === account.id ? { ...u, salt, passwordHash, iterations: PBKDF2_ITERATIONS } : u)));
      return { ok: true };
    } catch (err) { return hashError(err); }
  }, [account, setUsers]);

  // Demo-only reset: a real app must verify email ownership first (see README).
  const resetPassword = useCallback(async ({ email, newPassword }) => {
    const found = users.find((u) => u.email === normalizeEmail(email));
    if (!found) return fail('No account found with this email.', 'email');
    try {
      const salt = randomSalt();
      const passwordHash = await hashPassword(newPassword, salt);
      setUsers((list) => list.map((u) => (u.id === found.id ? { ...u, salt, passwordHash, iterations: PBKDF2_ITERATIONS } : u)));
      return { ok: true };
    } catch (err) { return hashError(err); }
  }, [users, setUsers]);

  const setCurrency = useCallback((code) => {
    if (!account || !CURRENCIES.some((c) => c.code === code)) return;
    setUsers((list) => list.map((u) => (u.id === account.id ? { ...u, currency: code } : u)));
  }, [account, setUsers]);

  const value = useMemo(() => ({
    user, isAuthenticated: Boolean(user), register, login, logout, updateProfile, changePassword, resetPassword, setCurrency,
  }), [user, register, login, logout, updateProfile, changePassword, resetPassword, setCurrency]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
