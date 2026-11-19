import { Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm.jsx';
import { useExpense } from '../context/ExpenseContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function AddTransaction() {
  const { addTransaction } = useExpense();
  const { notify } = useToast();

  const handleAdd = (data) => {
    addTransaction(data);
    notify('success', `${data.type === 'income' ? 'Income' : 'Expense'} "${data.title}" added.`);
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-3">
      <div className="card p-5 sm:p-7 lg:col-span-2">
        <h2 className="text-xl font-extrabold text-slate-900">New transaction</h2>
        <p className="mb-6 mt-1 text-sm text-slate-500">Record money coming in or going out.</p>
        <TransactionForm onSubmit={handleAdd} />
      </div>
      <aside className="card h-fit p-5">
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><Lightbulb size={20} /></span>
        <h3 className="font-extrabold text-slate-900">Tips</h3>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">
          <li>Pick Income or Expense first. The category list changes with it.</li>
          <li>Use a short title you can search for later.</li>
          <li>Made a mistake? Edit or delete it from <Link to="/history" className="font-semibold text-violet-700 hover:underline">Transaction History</Link>.</li>
        </ul>
      </aside>
    </div>
  );
}
