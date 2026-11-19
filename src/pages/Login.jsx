import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, LogIn } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateLogin } from '../utils/validation.js';

export default function Login() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const registeredEmail = location.state?.registeredEmail;
  const [form, setForm] = useState({ email: registeredEmail || '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const found = validateLogin(form);
    if (Object.keys(found).length) { setErrors(found); return; }
    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);
    if (!result.ok) { setFormError(result.error); notify('error', result.error); return; }
    notify('success', 'Welcome back!');
    navigate(location.state?.from && location.state.from !== '/login' ? location.state.from : '/', { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back" subtitle="Log in to see your dashboard."
      footer={<>New to ExpenseFlow? <Link to="/register" className="font-semibold text-violet-700 hover:underline">Create an account</Link></>}
    >
      {registeredEmail && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700"><CheckCircle2 size={18} /> Account created. You can log in now.</p>
      )}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">{formError}</p>}
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input id="email" type="email" autoComplete="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" value={form.email} onChange={(e) => set('email')(e.target.value)} />
          {errors.email && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email}</p>}
        </div>
        <PasswordInput
          id="password" label="Password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="current-password"
          labelExtra={<Link to="/forgot-password" className="text-xs font-semibold text-violet-700 hover:underline">Forgot password?</Link>}
        />
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
          <input type="checkbox" checked={form.remember} onChange={(e) => set('remember')(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-300" />
          Remember me
        </label>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <><Loader2 size={18} className="animate-spin" /> Logging in…</> : <><LogIn size={18} /> Log in</>}
        </button>
      </form>
    </AuthLayout>
  );
}
