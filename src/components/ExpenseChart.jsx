import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from '../utils/constants.js';
import { formatCurrency } from '../utils/formatCurrency.js';

/** Donut chart + legend. `data` is the output of categoryBreakdown(). */
export default function ExpenseChart({ data, currency }) {
  if (!data.length) {
    return <p className="flex h-64 items-center justify-center text-center text-sm text-slate-500">No expenses yet. Add one to see your category breakdown.</p>;
  }
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={2} stroke="none">
              {data.map((d, i) => <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full flex-1 space-y-2">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="flex-1 truncate text-slate-600">{d.name}</span>
            <span className="font-semibold text-slate-900">{d.percent.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
