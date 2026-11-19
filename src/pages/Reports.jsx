import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PiggyBank, Percent, TrendingDown, TrendingUp } from 'lucide-react';
import SummaryCard from '../components/SummaryCard.jsx';
import IncomeExpenseChart from '../components/IncomeExpenseChart.jsx';
import { useExpense } from '../context/ExpenseContext.jsx';
import { categoryBreakdown, monthlySeries } from '../utils/calculations.js';
import { CHART_COLORS, EXPENSE_COLOR, INCOME_COLOR } from '../utils/constants.js';
import { formatCompact, formatCurrency } from '../utils/formatCurrency.js';

const axis = { fontSize: 12, fill: '#64748b' };
const tip = { borderRadius: 12, border: '1px solid #e2e8f0' };

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card p-5">
      <h2 className="font-extrabold text-slate-900">{title}</h2>
      <p className="mb-4 text-sm text-slate-500">{subtitle}</p>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

export default function Reports() {
  const { transactions, currency } = useExpense();
  const [months, setMonths] = useState(6);
  const money = (n) => formatCurrency(n, currency);
  const fmtAxis = (v) => formatCompact(v, currency);

  const series = useMemo(() => monthlySeries(transactions, months), [transactions, months]);
  const inRange = useMemo(() => transactions.filter((t) => t.date.slice(0, 7) >= series[0].key), [transactions, series]);
  const categories = useMemo(() => categoryBreakdown(inRange, 'expense'), [inRange]);

  const income = series.reduce((s, m) => s + m.income, 0);
  const expense = series.reduce((s, m) => s + m.expense, 0);
  const saved = income - expense;
  const rate = income ? (saved / income) * 100 : 0;
  const avgSpend = expense / series.length;
  const best = series.reduce((a, b) => (b.net > a.net ? b : a), series[0]);
  const worst = series.reduce((a, b) => (b.net < a.net ? b : a), series[0]);
  const hasData = inRange.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Showing the last {months} months, including this one.</p>
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-card ring-1 ring-slate-200/70" role="group" aria-label="Report period">
          {[6, 12].map((n) => (
            <button key={n} onClick={() => setMonths(n)} aria-pressed={months === n}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${months === n ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              {n} months
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Income" value={money(income)} icon={TrendingUp} tone="blue" hint={`Last ${months} months`} />
        <SummaryCard label="Expenses" value={money(expense)} icon={TrendingDown} tone="violet" hint={`Avg ${money(avgSpend)} per month`} />
        <SummaryCard label="Net savings" value={money(saved)} icon={PiggyBank} tone={saved < 0 ? 'rose' : 'emerald'} hint="Income minus expenses" />
        <SummaryCard label="Savings rate" value={`${rate.toFixed(1)}%`} icon={Percent} tone="violet" hint="Share of income kept" />
      </section>

      {!hasData && <div className="card p-6 text-center text-sm text-slate-500">No transactions in this period yet. Charts will fill in as you add data.</div>}

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Monthly income report" subtitle="Income received each month">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} interval="preserveStartEnd" />
              <YAxis tickLine={false} axisLine={false} width={48} tick={axis} tickFormatter={fmtAxis} />
              <Tooltip cursor={{ fill: '#eff6ff' }} formatter={(v) => money(v)} contentStyle={tip} />
              <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly expense report" subtitle="Money spent each month">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} interval="preserveStartEnd" />
              <YAxis tickLine={false} axisLine={false} width={48} tick={axis} tickFormatter={fmtAxis} />
              <Tooltip cursor={{ fill: '#f5f3ff' }} formatter={(v) => money(v)} contentStyle={tip} />
              <Bar dataKey="expense" name="Expenses" fill={EXPENSE_COLOR} radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="card p-5">
          <h2 className="font-extrabold text-slate-900">Income versus expenses</h2>
          <p className="mb-4 text-sm text-slate-500">Side-by-side comparison per month</p>
          <IncomeExpenseChart data={series} currency={currency} height={256} />
        </div>

        <ChartCard title="Monthly spending trend" subtitle="Dashed line marks your monthly average">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} interval="preserveStartEnd" />
              <YAxis tickLine={false} axisLine={false} width={48} tick={axis} tickFormatter={fmtAxis} />
              <Tooltip formatter={(v) => money(v)} contentStyle={tip} />
              <ReferenceLine y={avgSpend} stroke="#94a3b8" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="expense" name="Expenses" stroke={EXPENSE_COLOR} strokeWidth={3} dot={{ r: 4, fill: EXPENSE_COLOR }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="card p-5">
          <h2 className="font-extrabold text-slate-900">Category-wise expenses</h2>
          <p className="mb-4 text-sm text-slate-500">Where your money went in this period</p>
          {categories.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500">No expenses in this period.</p>
          ) : (
            <>
              <div style={{ height: Math.max(180, categories.length * 36) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={96} tick={axis} />
                    <Tooltip cursor={{ fill: '#f5f3ff' }} formatter={(v) => money(v)} contentStyle={tip} />
                    <Bar dataKey="value" name="Spent" radius={[0, 6, 6, 0]} maxBarSize={22}>
                      {categories.map((c, i) => <Cell key={c.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {categories.map((c) => (
                  <li key={c.name} className="flex justify-between py-2"><span className="text-slate-600">{c.name}</span><span className="font-semibold text-slate-900">{money(c.value)} <span className="font-normal text-slate-400">({c.percent.toFixed(0)}%)</span></span></li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-extrabold text-slate-900">Savings summary</h2>
          <p className="mb-4 text-sm text-slate-500">Net result per month (income minus expenses)</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axis} interval="preserveStartEnd" />
                <YAxis tickLine={false} axisLine={false} width={48} tick={axis} tickFormatter={fmtAxis} />
                <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v) => money(v)} contentStyle={tip} />
                <ReferenceLine y={0} stroke="#cbd5e1" />
                <Bar dataKey="net" name="Net" radius={[6, 6, 6, 6]} maxBarSize={32}>
                  {series.map((m) => <Cell key={m.key} fill={m.net < 0 ? '#e11d48' : INCOME_COLOR} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {hasData && (
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-blue-50 p-3"><dt className="text-xs font-semibold text-blue-700">Best month</dt><dd className="font-bold text-slate-900">{best.fullLabel}</dd><dd className="text-slate-600">{money(best.net)}</dd></div>
              <div className="rounded-xl bg-violet-50 p-3"><dt className="text-xs font-semibold text-violet-700">Weakest month</dt><dd className="font-bold text-slate-900">{worst.fullLabel}</dd><dd className="text-slate-600">{money(worst.net)}</dd></div>
            </dl>
          )}
        </div>
      </section>
    </div>
  );
}
