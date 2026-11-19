import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatCurrency.js';

export default function TransactionTable({ transactions, currency, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
            {['Transaction', 'Category', 'Date', 'Type', 'Amount', 'Description', 'Actions'].map((h) => (
              <th key={h} className={`px-4 py-3 ${h === 'Amount' ? 'text-right' : ''} ${h === 'Actions' ? 'text-center' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((t) => {
            const income = t.type === 'income';
            return (
              <tr key={t.id} className="transition hover:bg-violet-50/40">
                <td className="max-w-[200px] truncate px-4 py-3.5 font-semibold text-slate-900" title={t.title}>{t.title}</td>
                <td className="px-4 py-3.5 text-slate-600">{t.category}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{formatDate(t.date)}</td>
                <td className="px-4 py-3.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${income ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>{income ? 'Income' : 'Expense'}</span>
                </td>
                <td className={`whitespace-nowrap px-4 py-3.5 text-right font-bold ${income ? 'text-blue-700' : 'text-slate-900'}`}>
                  {income ? '+' : '−'}{formatCurrency(t.amount, currency)}
                </td>
                <td className="max-w-[220px] truncate px-4 py-3.5 text-slate-500" title={t.description}>{t.description || '—'}</td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => onEdit(t)} className="rounded-lg p-2 text-slate-500 transition hover:bg-violet-100 hover:text-violet-700" aria-label={`Edit ${t.title}`}><Pencil size={17} /></button>
                    <button onClick={() => onDelete(t)} className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-100 hover:text-rose-600" aria-label={`Delete ${t.title}`}><Trash2 size={17} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
