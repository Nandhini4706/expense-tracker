import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Plus, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const titles = {
  '/': 'Dashboard', '/add': 'Add Transaction', '/history': 'Transaction History',
  '/reports': 'Reports & Analytics', '/settings': 'Settings',
};

export default function Navbar({ onMenu }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const initials = user.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

  // Close the profile menu on outside click or Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
    notify('success', 'You have been logged out.');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button onClick={onMenu} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu"><Menu size={22} /></button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">{titles[pathname] || 'ExpenseFlow'}</h1>
          <p className="hidden text-xs text-slate-500 sm:block">{today}</p>
        </div>
        {pathname !== '/add' && (
          <Link to="/add" className="btn-primary"><Plus size={18} /> <span className="hidden sm:inline">Add transaction</span><span className="sm:hidden">Add</span></Link>
        )}

        <div className="relative" ref={ref}>
          <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
            className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-slate-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-600 text-sm font-bold text-white">{initials}</span>
            <ChevronDown size={16} className="hidden text-slate-500 sm:block" />
          </button>
          {open && (
            <div role="menu" className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <Link to="/settings" onClick={() => setOpen(false)} role="menuitem" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Settings size={17} /> Profile & settings</Link>
              <button onClick={handleLogout} role="menuitem" className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"><LogOut size={17} /> Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
