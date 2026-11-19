import { CURRENCIES } from './constants.js';

const find = (code) => CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

export function formatCurrency(amount, code = 'INR') {
  const c = find(code);
  const digits = c.code === 'JPY' ? 0 : 2;
  return new Intl.NumberFormat(c.locale, {
    style: 'currency', currency: c.code, minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(Number(amount) || 0);
}

/** Short number for chart axes, e.g. 12.5K */
export function formatCompact(amount, code = 'INR') {
  return new Intl.NumberFormat(find(code).locale, { notation: 'compact', maximumFractionDigits: 1 }).format(amount);
}

/** 'YYYY-MM-DD' -> '05 Jun 2026' (parsed manually to avoid timezone shifts) */
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
