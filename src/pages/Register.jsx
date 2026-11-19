import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateRegister } from '../utils/validation.js';

export default function Register() {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
    const found = validateRegister(form);
    if (Object.keys(found).length) { setErrors(found); return; }
    setSubmitting(true);
    const result = await register(form);
    setSubmitting(false);
    if (!result.ok) {
      if (result.field) setErrors({ [result.field]: result.error });
      setFormError(result.error);
      notify('error', result.error);
      return;
    }
    notify('success', 'Account created. Please log in.');
    navigate('/login', { replace: true, state: { registeredEmail: form.email.trim().toLowerCase() } });
  };

  return (
    <AuthLayout
      title="Create your account" subtitle="Start tracking your income and expenses."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-violet-700 hover:underline">Log in</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">{formError}</p>}
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" autoComplete="name" className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Priya Sharma" value={form.name} onChange={(e) => set('name')(e.target.value)} />
          {errors.name && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input id="email" type="email" autoComplete="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" value={form.email} onChange={(e) => set('email')(e.target.value)} />
          {errors.email && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email}</p>}
        </div>
        <PasswordInput id="password" label="Password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" placeholder="At least 8 characters" />
        <PasswordInput id="confirmPassword" label="Confirm password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" />
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <><Loader2 size={18} className="animate-spin" /> Creating account…</> : <><UserPlus size={18} /> Create account</>}
        </button>
      </form>
    </AuthLayout>
  );
}
