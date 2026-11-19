import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import SummaryCard from '../components/SummaryCard.jsx';
import IncomeExpenseChart from '../components/IncomeExpenseChart.jsx';
import ExpenseChart from '../components/ExpenseChart.jsx';
import { useExpense } from '../context/ExpenseContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { categoryBreakdown, currentMonthSummary, filterTransactions, getTotals, monthlySeries } from '../utils/calculations.js';
import { formatCurrency, formatDate } from '../utils/formatCurrency.js';

export default function Dashboard() {
  const { transactions, currency } = useExpense();
  const { user } = useAuth();
  const money = (n) => formatCurrency(n, currency);

  // Everything below is derived from the saved transactions; nothing is hardcoded.
  const totals = useMemo(() => getTotals(transactions), [transactions]);
  const series = useMemo(() => monthlySeries(transactions, 6), [transactions]);
  const categories = useMemo(() => categoryBreakdown(transactions, 'expense'), [transactions]);
  const month = useMemo(() => currentMonthSummary(transactions), [transactions]);
  const recent = useMemo(() => filterTransactions(transactions, { sort: 'newest' }).slice(0, 6), [transactions]);

  const spentPct = month.income ? Math.min((month.expense / month.income) * 100, 100) : month.expense ? 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome back, {user.name.split(' ')[0]}</h2>
        <p className="text-sm text-slate-500">Here is where your money stands today.</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total balance" value={money(totals.balance)} icon={Wallet} tone="violet" hint="Income minus expenses, all time" />
        <SummaryCard label="Total income" value={money(totals.income)} icon={TrendingUp} tone="blue" hint="All recorded income" />
        <SummaryCard label="Total expenses" value={money(totals.expense)} icon={TrendingDown} tone="rose" hint="All recorded spending" />
        <SummaryCard label="Total savings" value={money(totals.savings)} icon={PiggyBank} tone="emerald" hint="Surplus from months you spent less than you earned" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-extrabold text-slate-900">Income and expenses</h2>
          <p className="mb-4 text-sm text-slate-500">Last 6 months</p>
          <IncomeExpenseChart data={series} currency={currency} />
        </div>
        <div className="card p-5">
          <h2 className="font-extrabold text-slate-900">Spending by category</h2>
          <p className="mb-4 text-sm text-slate-500">All recorded expenses</p>
          <ExpenseChart data={categories} currency={currency} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="font-extrabold text-slate-900">{month.fullLabel}</h2>
          <p className="mb-4 text-sm text-slate-500">{month.count} transaction{month.count === 1 ? '' : 's'} this month</p>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Income</dt><dd className="font-bold text-blue-700">{money(month.income)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Expenses</dt><dd className="font-bold text-violet-700">{money(month.expense)}</dd></div>
            <div className="flex justify-between border-t border-slate-100 pt-3"><dt className="text-slate-500">Net</dt><dd className={`font-extrabold ${month.net < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{money(month.net)}</dd></div>
          </dl>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-500">
              <span>Income spent</span><span>{month.income ? `${((month.expense / month.income) * 100).toFixed(0)}%` : '—'}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-600 transition-all" style={{ width: `${spentPct}%` }} />
            </div>
          </div>
        </div>

        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-extrabold text-slate-900">Recent transactions</h2>
            <Link to="/history" className="text-sm font-semibold text-violet-700 hover:underline">View all</Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 pb-8 pt-4 text-center text-sm text-slate-500">
              No transactions yet. <Link to="/add" className="font-semibold text-violet-700 hover:underline">Add your first one</Link>.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((t) => {
                const income = t.type === 'income';
                return (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${income ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>
                      {income ? <ArrowDownLeft size={19} /> : <ArrowUpRight size={19} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{t.title}</p>
                      <p className="text-xs text-slate-500">{t.category} · {formatDate(t.date)}</p>
                    </div>
                    <p className={`whitespace-nowrap text-sm font-bold ${income ? 'text-blue-700' : 'text-slate-900'}`}>{income ? '+' : '−'}{money(t.amount)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="card overflow-hidden">
        <h2 className="p-5 pb-3 font-extrabold text-slate-900">Monthly financial summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead><tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
              <th className="px-5 py-3">Month</th><th className="px-5 py-3 text-right">Income</th><th className="px-5 py-3 text-right">Expenses</th><th className="px-5 py-3 text-right">Net</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {[...series].reverse().slice(0, 4).map((m) => (
                <tr key={m.key}>
                  <td className="px-5 py-3 font-semibold text-slate-900">{m.fullLabel}</td>
                  <td className="px-5 py-3 text-right text-blue-700">{money(m.income)}</td>
                  <td className="px-5 py-3 text-right text-violet-700">{money(m.expense)}</td>
                  <td className={`px-5 py-3 text-right font-bold ${m.net < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{money(m.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
