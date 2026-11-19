import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox, PlusCircle, SearchX } from 'lucide-react';
import FilterSection, { defaultFilters } from '../components/FilterSection.jsx';
import TransactionTable from '../components/TransactionTable.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Modal from '../components/Modal.jsx';
import { useExpense } from '../context/ExpenseContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { filterTransactions, getTotals } from '../utils/calculations.js';
import { formatCurrency } from '../utils/formatCurrency.js';

const PAGE_SIZE = 8;

export default function TransactionHistory() {
  const { transactions, currency, updateTransaction, deleteTransaction } = useExpense();
  const { notify } = useToast();
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
  const totals = useMemo(() => getTotals(filtered), [filtered]);
  const money = (n) => formatCurrency(n, currency);

  useEffect(() => setPage(1), [filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages); // handles deleting the last item on the last page
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const saveEdit = (data) => {
    updateTransaction(editing.id, data);
    notify('success', `"${data.title}" updated.`);
    setEditing(null);
  };
  const confirmDelete = () => {
    deleteTransaction(deleting.id);
    notify('success', `"${deleting.title}" deleted.`);
    setDeleting(null);
  };

  return (
    <div className="space-y-5">
      <FilterSection filters={filters} setFilters={setFilters} />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card px-5 py-4"><p className="text-xs font-semibold text-slate-500">Income (filtered)</p><p className="text-lg font-extrabold text-blue-700">{money(totals.income)}</p></div>
        <div className="card px-5 py-4"><p className="text-xs font-semibold text-slate-500">Expenses (filtered)</p><p className="text-lg font-extrabold text-violet-700">{money(totals.expense)}</p></div>
        <div className="card px-5 py-4"><p className="text-xs font-semibold text-slate-500">Net total ({filtered.length} transaction{filtered.length === 1 ? '' : 's'})</p><p className={`text-lg font-extrabold ${totals.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{money(totals.balance)}</p></div>
      </div>

      <div className="card overflow-hidden">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><Inbox size={26} /></span>
            <h2 className="font-extrabold text-slate-900">No transactions yet</h2>
            <p className="mb-5 mt-1 max-w-xs text-sm text-slate-500">Add your first income or expense and it will show up here.</p>
            <Link to="/add" className="btn-primary"><PlusCircle size={18} /> Add transaction</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><SearchX size={26} /></span>
            <h2 className="font-extrabold text-slate-900">No matching transactions</h2>
            <p className="mb-5 mt-1 max-w-xs text-sm text-slate-500">Try a different search or loosen the filters.</p>
            <button onClick={() => setFilters(defaultFilters)} className="btn-secondary">Reset filters</button>
          </div>
        ) : (
          <>
            <TransactionTable transactions={visible} currency={currency} onEdit={setEditing} onDelete={setDeleting} />
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <p className="text-sm text-slate-500">Page {safePage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(safePage - 1)} disabled={safePage === 1} className="btn-secondary !px-3 !py-2" aria-label="Previous page"><ChevronLeft size={18} /></button>
                  <button onClick={() => setPage(safePage + 1)} disabled={safePage === totalPages} className="btn-secondary !px-3 !py-2" aria-label="Next page"><ChevronRight size={18} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={Boolean(editing)} title="Edit transaction" onClose={() => setEditing(null)}>
        {editing && <TransactionForm key={editing.id} initial={editing} submitLabel="Save changes" onSubmit={saveEdit} onCancel={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this transaction?"
        message={deleting ? `"${deleting.title}" (${money(deleting.amount)}) will be removed permanently.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
