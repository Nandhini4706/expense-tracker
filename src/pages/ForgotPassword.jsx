import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, TriangleAlert } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { validateReset } from '../utils/validation.js';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (value) => { setForm((f) => ({ ...f, [key]: value })); setErrors((e) => ({ ...e, [key]: undefined })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const found = validateReset(form);
    if (Object.keys(found).length) { setErrors(found); return; }
    setSubmitting(true);
    const result = await resetPassword(form);
    setSubmitting(false);
    if (!result.ok) { setErrors({ [result.field || 'email']: result.error }); notify('error', result.error); return; }
    notify('success', 'Password updated. Please log in.');
    navigate('/login', { replace: true, state: { registeredEmail: form.email.trim().toLowerCase() } });
  };

  return (
    <AuthLayout
      title="Reset your password" subtitle="Choose a new password for your account."
      footer={<Link to="/login" className="font-semibold text-violet-700 hover:underline">Back to log in</Link>}
    >
      <p className="mb-4 flex gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800">
        <TriangleAlert size={16} className="mt-0.5 shrink-0" />
        Demo only: with no server, there is no email to verify. A real app would send a reset link first.
      </p>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input id="email" type="email" autoComplete="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" value={form.email} onChange={(e) => set('email')(e.target.value)} />
          {errors.email && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email}</p>}
        </div>
        <PasswordInput id="newPassword" label="New password" value={form.newPassword} onChange={set('newPassword')} error={errors.newPassword} autoComplete="new-password" placeholder="At least 8 characters" />
        <PasswordInput id="confirmPassword" label="Confirm new password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" />
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><KeyRound size={18} /> Update password</>}
        </button>
      </form>
    </AuthLayout>
  );
}
