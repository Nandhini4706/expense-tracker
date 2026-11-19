export const STORAGE_KEY = 'expenseTrackerTransactions';
export const USERS_KEY = 'expenseTrackerUsers';
export const SESSION_KEY = 'expenseTrackerCurrentUser';
export const SESSION_FLAG_KEY = 'expenseTrackerSessionActive'; // sessionStorage marker for non-"Remember me" logins

export const CATEGORIES = {
  expense: ['Food', 'Shopping', 'Transportation', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other'],
  income: ['Salary', 'Freelancing', 'Business', 'Investments', 'Other'],
};
export const ALL_CATEGORIES = [...new Set([...CATEGORIES.expense, ...CATEGORIES.income])];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)', locale: 'en-IN' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)', locale: 'ja-JP' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)', locale: 'en-AU' },
];

export const CHART_COLORS = ['#7c3aed', '#2563eb', '#a78bfa', '#60a5fa', '#c026d3', '#0ea5e9', '#6366f1', '#94a3b8'];
export const INCOME_COLOR = '#2563eb';
export const EXPENSE_COLOR = '#7c3aed';

const pad = (n) => String(n).padStart(2, '0');
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISODate(new Date());

export function isValidTransaction(t) {
  return Boolean(
    t && typeof t === 'object' &&
    typeof t.id === 'string' && typeof t.userId === 'string' && typeof t.title === 'string' &&
    Number.isFinite(t.amount) && t.amount > 0 &&
    (t.type === 'income' || t.type === 'expense') &&
    typeof t.category === 'string' &&
    typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date)
  );
}
