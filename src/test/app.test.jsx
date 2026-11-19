import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../App.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ExpenseProvider } from '../context/ExpenseContext.jsx';
import { hashPassword, randomSalt } from '../utils/security.js';

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider><AuthProvider><ExpenseProvider><App /></ExpenseProvider></AuthProvider></ToastProvider>
    </MemoryRouter>
  );
}
const heading = (name) => screen.findByRole('heading', { name });

async function register(user, name, email, password = 'secret123') {
  await user.click(screen.getByRole('link', { name: /create an account/i }));
  await user.type(screen.getByLabelText('Full name'), name);
  await user.type(screen.getByLabelText('Email address'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.type(screen.getByLabelText('Confirm password'), password);
  await user.click(screen.getByRole('button', { name: /create account/i }));
  await screen.findByText(/account created. you can log in now/i); // redirected to Login
}
async function login(user, email, password = 'secret123', remember = false) {
  await user.clear(screen.getByLabelText('Email address'));
  await user.type(screen.getByLabelText('Email address'), email);
  await user.type(screen.getByLabelText('Password'), password);
  if (remember) await user.click(screen.getByLabelText('Remember me'));
  await user.click(screen.getByRole('button', { name: /^log in$/i }));
}
async function addTx(user, { title, amount, type, category }) {
  await user.click(screen.getAllByRole('link', { name: /add transaction/i })[0]);
  await heading('New transaction');
  await user.click(screen.getByRole('button', { name: type }));
  await user.type(screen.getByLabelText('Transaction title'), title);
  await user.type(screen.getByLabelText('Amount'), String(amount));
  await user.selectOptions(screen.getByLabelText('Category'), category);
  await user.click(screen.getByRole('button', { name: /add transaction/i }));
}
async function logout(user) {
  await user.click(document.querySelector('[aria-haspopup="menu"]'));
  await user.click(await screen.findByRole('menuitem', { name: /log out/i }));
  await heading('Welcome back');
}

describe('validation & security helpers', () => {
  it('produces different hashes for different salts and never returns the plain password', async () => {
    const h1 = await hashPassword('secret123', randomSalt());
    const h2 = await hashPassword('secret123', randomSalt());
    expect(h1).not.toBe(h2);
    expect(h1).not.toContain('secret123');
  });
});

describe('ExpenseFlow end-to-end', () => {
  it('redirects unauthenticated users from every protected URL to Login', async () => {
    for (const path of ['/', '/add', '/history', '/reports', '/settings']) {
      const { unmount } = renderApp(path);
      expect(await heading('Welcome back')).toBeInTheDocument();
      unmount();
    }
  });

  it('registers, rejects duplicates and bad credentials, then logs in', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await register(user, 'Alice Rao', 'alice@example.com');
    expect(await screen.findByText(/account created. you can log in now/i)).toBeInTheDocument();

    // Stored hashed, never in plain text; unique id present.
    const stored = JSON.parse(localStorage.getItem('expenseTrackerUsers'));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toMatch(/^user-/);
    expect(JSON.stringify(stored)).not.toContain('secret123');
    expect(stored[0].passwordHash).toHaveLength(64);

    // Duplicate registration (case-insensitive email)
    await user.click(screen.getByRole('link', { name: /create an account/i }));
    await user.type(screen.getByLabelText('Full name'), 'Alice Two');
    await user.type(screen.getByLabelText('Email address'), 'ALICE@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm password'), 'secret123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect((await screen.findAllByText(/already exists/i)).length).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem('expenseTrackerUsers'))).toHaveLength(1);

    // Field validation
    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();

    // Wrong password, unknown user, then success
    await user.click(screen.getByRole('link', { name: /log in/i }));
    await login(user, 'alice@example.com', 'wrongpass1');
    expect((await screen.findAllByText(/incorrect email or password/i)).length).toBeGreaterThan(0);
    expect(localStorage.getItem('expenseTrackerCurrentUser')).toBeNull();
    await user.clear(screen.getByLabelText('Password'));
    await user.clear(screen.getByLabelText('Email address'));
    await login(user, 'nobody@example.com', 'secret123');
    expect((await screen.findAllByText(/incorrect email or password/i)).length).toBeGreaterThan(0);
    await user.clear(screen.getByLabelText('Password'));
    await login(user, 'alice@example.com');
    expect(await screen.findByText(/welcome back, alice/i)).toBeInTheDocument();

    // Session holds only the user id, no password material
    const session = JSON.parse(localStorage.getItem('expenseTrackerCurrentUser'));
    expect(Object.keys(session).sort()).toEqual(['createdAt', 'remember', 'userId']);
  });

  it('keeps each user\'s transactions private, and persists them across logout/login and refresh', async () => {
    const user = userEvent.setup();
    const first = renderApp('/login');
    await register(user, 'Alice Rao', 'alice@example.com');
    await login(user, 'alice@example.com', 'secret123', true);
    await screen.findByText(/welcome back, alice/i);

    await addTx(user, { title: 'Salary Nov', amount: 1000, type: 'income', category: 'Salary' });
    await addTx(user, { title: 'Groceries', amount: 250, type: 'expense', category: 'Food' });

    // Every stored transaction carries the session user's id
    const aliceId = JSON.parse(localStorage.getItem('expenseTrackerCurrentUser')).userId;
    const txs = JSON.parse(localStorage.getItem('expenseTrackerTransactions'));
    expect(txs).toHaveLength(2);
    expect(txs.every((t) => t.userId === aliceId)).toBe(true);

    // Dashboard totals: balance 750
    await user.click(screen.getAllByRole('link', { name: /dashboard/i })[0]);
    const balanceCard = (await screen.findByText('Total balance')).closest('.card');
    expect(within(balanceCard).getByText('₹750.00')).toBeInTheDocument();

    // History: search + type filter
    await user.click(screen.getAllByRole('link', { name: /transaction history/i })[0]);
    expect(await screen.findByText('Groceries')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/search transactions by title/i), 'sal');
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument();
    expect(screen.getByText('Salary Nov')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /clear search/i }));
    await user.selectOptions(screen.getByLabelText('Type'), 'expense');
    expect(screen.queryByText('Salary Nov')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reset filters/i }));

    // Edit
    await user.click(screen.getByRole('button', { name: 'Edit Groceries' }));
    const dlg = await screen.findByRole('dialog');
    const amt = within(dlg).getByLabelText('Amount');
    await user.clear(amt); await user.type(amt, '300');
    await user.click(within(dlg).getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText('−₹300.00')).toBeInTheDocument();

    // Delete with confirmation
    await user.click(screen.getByRole('button', { name: 'Delete Groceries' }));
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete' }));
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument();
    await addTx(user, { title: 'Groceries', amount: 250, type: 'expense', category: 'Food' });

    // "Refresh": remount app; Remember me keeps the session
    first.unmount();
    renderApp('/history');
    expect(await screen.findByText('Salary Nov')).toBeInTheDocument();
    // Logged-in users are bounced away from /login and /register
    for (const p of ['/login', '/register']) {
      const { unmount } = renderApp(p);
      expect(await screen.findAllByText(/welcome back, alice/i)).not.toHaveLength(0);
      unmount();
    }

    // Logout keeps users and transactions
    await logout(user);
    expect(localStorage.getItem('expenseTrackerCurrentUser')).toBeNull();
    expect(JSON.parse(localStorage.getItem('expenseTrackerTransactions'))).toHaveLength(2);
    expect(JSON.parse(localStorage.getItem('expenseTrackerUsers'))).toHaveLength(1);

    // Second user sees nothing of Alice's data
    await register(user, 'Bob Kumar', 'bob@example.com');
    await login(user, 'bob@example.com');
    await screen.findByText(/welcome back, bob/i);
    await user.click(screen.getAllByRole('link', { name: /transaction history/i })[0]);
    expect(await screen.findByText(/no transactions yet/i)).toBeInTheDocument();
    expect(screen.queryByText('Salary Nov')).not.toBeInTheDocument();
    await addTx(user, { title: 'Bob coffee', amount: 90, type: 'expense', category: 'Food' });

    // Bob clearing his history leaves Alice's intact
    await user.click(screen.getAllByRole('link', { name: /settings/i })[0]);
    await user.click(await screen.findByRole('button', { name: /clear my transaction history/i }));
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: /clear history/i }));
    const left = JSON.parse(localStorage.getItem('expenseTrackerTransactions'));
    expect(left).toHaveLength(2);
    expect(left.every((t) => t.userId === aliceId)).toBe(true);

    // Alice logs back in and her history loads
    await logout(user);
    await login(user, 'alice@example.com');
    await screen.findByText(/welcome back, alice/i);
    await user.click(screen.getAllByRole('link', { name: /transaction history/i })[0]);
    expect(await screen.findByText('Salary Nov')).toBeInTheDocument();
    expect(screen.queryByText('Bob coffee')).not.toBeInTheDocument();
  });

  it('without Remember me, the session ends when the browser session ends', async () => {
    const user = userEvent.setup();
    const a = renderApp('/login');
    await register(user, 'Cara Lee', 'cara@example.com');
    await login(user, 'cara@example.com');
    await screen.findByText(/welcome back, cara/i);
    a.unmount();
    renderApp('/');                 // same tab refresh: still signed in
    expect(await screen.findByText(/welcome back, cara/i)).toBeInTheDocument();
    sessionStorage.clear();         // simulate closing the browser
    renderApp('/');
    expect(await heading('Welcome back')).toBeInTheDocument();
  });

  it('updates profile with duplicate-email validation and changes password', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await register(user, 'Dev One', 'dev1@example.com');
    await user.click(screen.getByRole('link', { name: /create an account/i }));
    await user.type(screen.getByLabelText('Full name'), 'Dev Two');
    await user.type(screen.getByLabelText('Email address'), 'dev2@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm password'), 'secret123');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await login(user, 'dev2@example.com');
    await screen.findByText(/welcome back, dev/i);
    await user.click(screen.getAllByRole('link', { name: /settings/i })[0]);
    const email = await screen.findByLabelText('Email address');
    await user.clear(email); await user.type(email, 'dev1@example.com');
    await user.click(screen.getByRole('button', { name: /save profile/i }));
    expect((await screen.findAllByText(/another account already uses this email/i)).length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText('Current password'), 'secret123');
    await user.type(screen.getByLabelText('New password'), 'brandnew99');
    await user.type(screen.getByLabelText('Confirm new password'), 'brandnew99');
    await user.click(screen.getByRole('button', { name: /update password/i }));
    expect((await screen.findAllByText(/password changed/i)).length).toBeGreaterThan(0);
    await logout(user);
    await login(user, 'dev2@example.com', 'secret123');
    expect((await screen.findAllByText(/incorrect email or password/i)).length).toBeGreaterThan(0);
    await user.clear(screen.getByLabelText('Password'));
    await login(user, 'dev2@example.com', 'brandnew99');
    expect(await screen.findByText(/welcome back, dev/i)).toBeInTheDocument();
  });
});
