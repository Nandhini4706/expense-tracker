import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Database, Info, KeyRound, Loader2, LogOut, Trash2, UserRound } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useExpense } from '../context/ExpenseContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CURRENCIES, STORAGE_KEY } from '../utils/constants.js';
import { validatePasswordChange, validateProfile } from '../utils/validation.js';

function Section({ icon: Icon, tone, title, desc, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={20} /></span>
        <div><h2 className="font-extrabold text-slate-900">{title}</h2>{desc && <p className="text-sm text-slate-500">{desc}</p>}</div>
      </div>
      {children}
    </section>
  );
}
const Err = ({ msg }) => (msg ? <p className="mt-1.5 text-xs font-medium text-rose-600">{msg}</p> : null);

export default function Settings() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { currency, setCurrency, transactions, clearAll } = useExpense();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: user.name, email: user.email });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    const found = validateProfile(profile);
    if (Object.keys(found).length) { setProfileErrors(found); return; }
    setSavingProfile(true);
    const r = await updateProfile(profile);
    setSavingProfile(false);
    if (!r.ok) { setProfileErrors({ [r.field || 'email']: r.error }); notify('error', r.error); return; }
    notify('success', 'Profile updated.');
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const found = validatePasswordChange(pw);
    if (Object.keys(found).length) { setPwErrors(found); return; }
    setSavingPw(true);
    const r = await changePassword(pw);
    setSavingPw(false);
    if (!r.ok) { setPwErrors({ [r.field || 'currentPassword']: r.error }); notify('error', r.error); return; }
    setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPwErrors({});
    notify('success', 'Password changed.');
  };

  const setPwField = (k) => (v) => { setPw((p) => ({ ...p, [k]: v })); setPwErrors((e) => ({ ...e, [k]: undefined })); };
  const setProfileField = (k, v) => { setProfile((p) => ({ ...p, [k]: v })); setProfileErrors((e) => ({ ...e, [k]: undefined })); };

  const handleClear = () => { clearAll(); setConfirming(false); notify('success', 'Your transaction history was cleared.'); };
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); notify('success', 'You have been logged out.'); };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Section icon={UserRound} tone="bg-violet-100 text-violet-700" title="Profile" desc={`Member since ${new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`}>
        <form onSubmit={saveProfile} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-name" className="label">Full name</label>
              <input id="p-name" className={`input ${profileErrors.name ? 'input-error' : ''}`} value={profile.name} onChange={(e) => setProfileField('name', e.target.value)} />
              <Err msg={profileErrors.name} />
            </div>
            <div>
              <label htmlFor="p-email" className="label">Email address</label>
              <input id="p-email" type="email" className={`input ${profileErrors.email ? 'input-error' : ''}`} value={profile.email} onChange={(e) => setProfileField('email', e.target.value)} />
              <Err msg={profileErrors.email} />
            </div>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">{savingProfile && <Loader2 size={18} className="animate-spin" />} Save profile</button>
        </form>
      </Section>

      <Section icon={KeyRound} tone="bg-blue-100 text-blue-700" title="Change password" desc="You will stay logged in on this device.">
        <form onSubmit={savePassword} noValidate className="max-w-md space-y-4">
          <PasswordInput id="cur" label="Current password" value={pw.currentPassword} onChange={setPwField('currentPassword')} error={pwErrors.currentPassword} autoComplete="current-password" />
          <PasswordInput id="new" label="New password" value={pw.newPassword} onChange={setPwField('newPassword')} error={pwErrors.newPassword} autoComplete="new-password" placeholder="At least 8 characters" />
          <PasswordInput id="conf" label="Confirm new password" value={pw.confirmPassword} onChange={setPwField('confirmPassword')} error={pwErrors.confirmPassword} autoComplete="new-password" />
          <button type="submit" disabled={savingPw} className="btn-primary">{savingPw && <Loader2 size={18} className="animate-spin" />} Update password</button>
        </form>
      </Section>

      <Section icon={Coins} tone="bg-blue-100 text-blue-700" title="Currency" desc="Used to display every amount in your account.">
        <label htmlFor="currency" className="label">Display currency</label>
        <select id="currency" className="input max-w-sm" value={currency} onChange={(e) => { setCurrency(e.target.value); notify('success', 'Currency updated.'); }}>
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
        <p className="mt-2 text-xs text-slate-500">This changes the symbol and number format only. Saved amounts are not converted.</p>
      </Section>

      <Section icon={Database} tone="bg-rose-100 text-rose-600" title="Your data" desc={`${transactions.length} transaction${transactions.length === 1 ? '' : 's'} saved for ${user.email}.`}>
        <button onClick={() => setConfirming(true)} disabled={transactions.length === 0} className="btn-danger"><Trash2 size={18} /> Clear my transaction history</button>
        <p className="mt-2 text-xs text-slate-500">{transactions.length === 0 ? 'There is nothing to clear.' : 'Only your own transactions are removed. Other accounts are not affected.'}</p>
      </Section>

      <Section icon={LogOut} tone="bg-slate-100 text-slate-700" title="Session" desc="Logging out keeps your account and transactions saved.">
        <button onClick={handleLogout} className="btn-secondary"><LogOut size={18} /> Log out</button>
      </Section>

      <Section icon={Info} tone="bg-violet-100 text-violet-700" title="About ExpenseFlow">
        <dl className="divide-y divide-slate-100 text-sm">
          {[['Version', '2.0.0'], ['Built with', 'React, Vite, Tailwind CSS, Recharts, Lucide'], ['Storage', `Browser localStorage (key: ${STORAGE_KEY})`], ['Security', 'Passwords are hashed (PBKDF2). This is a demo, not production-grade security.']].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4"><dt className="w-28 shrink-0 font-semibold text-slate-500">{k}</dt><dd className="text-slate-800">{v}</dd></div>
          ))}
        </dl>
      </Section>

      <ConfirmDialog
        open={confirming} title="Clear your transaction history?"
        message={`This permanently deletes your ${transactions.length} transactions. This cannot be undone.`}
        confirmLabel="Clear history" onConfirm={handleClear} onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
