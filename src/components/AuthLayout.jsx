import { BarChart3, ShieldCheck, Wallet, PiggyBank } from 'lucide-react';

const points = [
  { icon: BarChart3, text: 'See income, spending and savings in clear charts' },
  { icon: PiggyBank, text: 'Track every transaction with search and filters' },
  { icon: ShieldCheck, text: 'Your records stay private to your own account' },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25"><Wallet size={22} /></span>
          <span className="text-xl font-extrabold tracking-tight">ExpenseFlow</span>
        </div>
        <div>
          <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">Know where every rupee goes.</h2>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-violet-50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15"><Icon size={18} /></span>{text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-violet-100/80">Demo app. Data is stored in this browser only.</p>
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10" aria-hidden="true" />
      </aside>

      <main className="flex items-center justify-center bg-[#f6f5fc] px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white"><Wallet size={20} /></span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">ExpenseFlow</span>
          </div>
          <div className="card p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
            {children}
          </div>
          <p className="mt-5 text-center text-sm text-slate-600">{footer}</p>
        </div>
      </main>
    </div>
  );
}
