import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EXPENSE_COLOR, INCOME_COLOR } from '../utils/constants.js';
import { formatCompact, formatCurrency } from '../utils/formatCurrency.js';

export default function IncomeExpenseChart({ data, currency, height = 288 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tickLine={false} axisLine={false} width={48} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => formatCompact(v, currency)} />
          <Tooltip cursor={{ fill: '#f5f3ff' }} formatter={(v) => formatCurrency(v, currency)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[6, 6, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expense" name="Expenses" fill={EXPENSE_COLOR} radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
