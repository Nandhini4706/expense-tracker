import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** Labelled password field with a show/hide toggle. `labelExtra` sits on the right of the label (e.g. a link). */
export default function PasswordInput({ id, label, value, onChange, error, autoComplete, placeholder = '••••••••', labelExtra }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">{label}</label>
        {labelExtra}
      </div>
      <div className="relative">
        <input
          id={id} type={show ? 'text' : 'password'} value={value} autoComplete={autoComplete} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)}
          className={`input pr-11 ${error ? 'input-error' : ''}`}
        />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-700">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
