import { useState } from 'react';
import { Save } from 'lucide-react';
import { CATEGORIES, todayISO } from '../utils/constants.js';
import { useToast } from '../context/ToastContext.jsx';

const emptyForm = () => ({ title: '', amount: '', type: 'expense', category: '', date: todayISO(), description: '' });

function validate(f) {
  const errors = {};
  if (!f.title.trim()) errors.title = 'Enter a title.';
  else if (f.title.trim().length > 60) errors.title = 'Keep the title under 60 characters.';

  if (f.amount === '') errors.amount = 'Enter an amount.';
  else if (!Number.isFinite(Number(f.amount)) || Number(f.amount) <= 0) errors.amount = 'Amount must be greater than zero.';

  if (!CATEGORIES[f.type].includes(f.category)) errors.category = 'Choose a category.';
  if (!f.date || Number.isNaN(Date.parse(f.date))) errors.date = 'Pick a valid date.';
  if (f.description.length > 200) errors.description = 'Keep the description under 200 characters.';
  return errors;
}

function Field({ label, error, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

/** Used for both "Add" (no initial) and "Edit" (initial provided). onSubmit receives clean data. */
export default function TransactionForm({ initial, onSubmit, onCancel, submitLabel = 'Add transaction' }) {
  const { notify } = useToast();
  const [form, setForm] = useState(() => (initial ? { ...emptyForm(), ...initial, amount: String(initial.amount) } : emptyForm()));
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  // Switching type swaps the category list, so the old category is cleared.
  const changeType = (type) => {
    setForm((f) => ({ ...f, type, category: '' }));
    setErrors((e) => ({ ...e, category: undefined }));
  };
  const cls = (key) => `input ${errors[key] ? 'input-error' : ''}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(form);
    if (Object.keys(found).length) {
      setErrors(found);
      notify('error', 'Please fix the highlighted fields.');
      return;
    }
    onSubmit({
      title: form.title.trim(),
      amount: Math.round(Number(form.amount) * 100) / 100,
      type: form.type,
      category: form.category,
      date: form.date,
      description: form.description.trim(),
    });
    if (!initial) { setForm(emptyForm()); setErrors({}); } // reset after a successful add
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1" role="group" aria-label="Transaction type">
        {['expense', 'income'].map((t) => (
          <button
            type="button" key={t} onClick={() => changeType(t)} aria-pressed={form.type === t}
            className={`rounded-lg py-2 text-sm font-semibold capitalize transition ${form.type === t ? (t === 'income' ? 'bg-white text-blue-700 shadow-sm' : 'bg-white text-violet-700 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <Field label="Transaction title" error={errors.title} htmlFor="tx-title">
        <input id="tx-title" className={cls('title')} placeholder="e.g. Grocery shopping" value={form.title} onChange={(e) => update('title', e.target.value)} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Amount" error={errors.amount} htmlFor="tx-amount">
          <input id="tx-amount" type="number" inputMode="decimal" step="0.01" min="0" className={cls('amount')} placeholder="0.00" value={form.amount} onChange={(e) => update('amount', e.target.value)} />
        </Field>
        <Field label="Date" error={errors.date} htmlFor="tx-date">
          <input id="tx-date" type="date" className={cls('date')} value={form.date} onChange={(e) => update('date', e.target.value)} />
        </Field>
      </div>

      <Field label="Category" error={errors.category} htmlFor="tx-category">
        <select id="tx-category" className={cls('category')} value={form.category} onChange={(e) => update('category', e.target.value)}>
          <option value="">Select a category</option>
          {CATEGORIES[form.type].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="Description (optional)" error={errors.description} htmlFor="tx-desc">
        <textarea id="tx-desc" rows={3} className={cls('description')} placeholder="Add a note about this transaction" value={form.description} onChange={(e) => update('description', e.target.value)} />
      </Field>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
        <button type="submit" className="btn-primary"><Save size={18} /> {submitLabel}</button>
      </div>
    </form>
  );
}
