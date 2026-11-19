import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

export default function Toast() {
  const { toasts, dismissToast } = useToast();
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((t) => {
        const ok = t.type === 'success';
        return (
          <div key={t.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 shadow-lg ${ok ? 'border-emerald-200' : 'border-rose-200'}`}>
            {ok ? <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" /> : <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />}
            <p className="flex-1 text-sm font-medium text-slate-700">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-slate-600" aria-label="Dismiss"><X size={16} /></button>
          </div>
        );
      })}
    </div>
  );
}
