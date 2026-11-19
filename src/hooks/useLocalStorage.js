import { useEffect, useState } from 'react';

/**
 * useState that persists to localStorage.
 *  - firstRun: value used only when the key has never been written (e.g. demo data).
 *  - fallback: value used when stored data is corrupt/unreadable.
 *  - sanitize: optional cleaner applied to parsed data.
 * The value is written back on every change, so the first-run seed is saved
 * immediately and is never re-inserted after a refresh (even if the user clears it).
 */
function read(key, fallback, firstRun, sanitize) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return firstRun !== undefined ? firstRun : fallback;
    const parsed = JSON.parse(raw);
    return sanitize ? sanitize(parsed, fallback) : parsed;
  } catch {
    return fallback; // corrupt JSON or storage blocked
  }
}

export default function useLocalStorage(key, fallback, { firstRun, sanitize } = {}) {
  const [value, setValue] = useState(() => read(key, fallback, firstRun, sanitize));

  useEffect(() => {
    try {
      // null/undefined removes the key (e.g. no active session) instead of storing the string "null".
      if (value === null || value === undefined) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Could not save "${key}" to localStorage`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
