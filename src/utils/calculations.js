// Pure functions: all dashboard / report numbers are derived from the transaction list.
const round2 = (n) => Math.round(n * 100) / 100;
const monthKey = (iso) => iso.slice(0, 7);

/** Income, expense, balance, and savings. Savings = sum of the surplus of every month where income exceeded spending. */
export function getTotals(transactions) {
  let income = 0;
  let expense = 0;
  const perMonth = {};
  for (const t of transactions) {
    const signed = t.type === 'income' ? t.amount : -t.amount;
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
    perMonth[monthKey(t.date)] = (perMonth[monthKey(t.date)] || 0) + signed;
  }
  const savings = Object.values(perMonth).reduce((sum, net) => sum + Math.max(net, 0), 0);
  return { income: round2(income), expense: round2(expense), balance: round2(income - expense), savings: round2(savings) };
}

/** Last `n` calendar months (oldest first, always ending with the current month). */
export function monthlySeries(transactions, n = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `${d.toLocaleString('en-US', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`,
      fullLabel: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      income: 0, expense: 0,
    });
  }
  const index = new Map(buckets.map((b) => [b.key, b]));
  for (const t of transactions) {
    const b = index.get(monthKey(t.date));
    if (b) b[t.type] += t.amount;
  }
  return buckets.map((b) => ({ ...b, income: round2(b.income), expense: round2(b.expense), net: round2(b.income - b.expense) }));
}

/** Category totals for one type, largest first, with share of the total. */
export function categoryBreakdown(transactions, type = 'expense') {
  const totals = {};
  let sum = 0;
  for (const t of transactions) {
    if (t.type !== type) continue;
    totals[t.category] = (totals[t.category] || 0) + t.amount;
    sum += t.amount;
  }
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value: round2(value), percent: sum ? (value / sum) * 100 : 0 }))
    .sort((a, b) => b.value - a.value);
}

export function currentMonthSummary(transactions) {
  const m = monthlySeries(transactions, 1)[0];
  const count = transactions.filter((t) => monthKey(t.date) === m.key).length;
  return { ...m, count, savingsRate: m.income ? (m.net / m.income) * 100 : 0 };
}

/** Apply search / type / category / date-range filters, then sort. */
export function filterTransactions(transactions, { search = '', type = 'all', category = 'all', from = '', to = '', sort = 'newest' }) {
  const q = search.trim().toLowerCase();
  const result = transactions.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q)) return false;
    if (type !== 'all' && t.type !== type) return false;
    if (category !== 'all' && t.category !== category) return false;
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    return true;
  });
  const dir = sort === 'oldest' ? 1 : -1;
  return result.sort((a, b) => dir * (a.date.localeCompare(b.date) || (a.createdAt || 0) - (b.createdAt || 0)));
}
