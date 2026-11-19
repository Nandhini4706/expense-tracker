# ExpenseFlow – Personal Expense Tracker with Authentication

A frontend-only React app: register, log in, and manage your own income and expenses. Everything is stored in the browser's localStorage. There is no backend.

**Stack:** React 18, Vite, React Router, Tailwind CSS, Recharts, Lucide React, Web Crypto API.

## Install and run

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # automated end-to-end tests (Vitest + Testing Library)
npm run build     # production build in dist/
```

Use `localhost` or HTTPS. Password hashing relies on `crypto.subtle`, which browsers only expose on secure origins.

## How to use

1. Open the app. You land on **Log in**. Choose **Create an account**.
2. Register (full name, email, password of 8+ characters, confirmation). You are redirected to Log in.
3. Log in. Tick **Remember me** to stay signed in after closing the browser. Without it, you stay signed in across refreshes but are signed out when the browser session ends.
4. Add transactions, then explore the Dashboard, Transaction History, Reports & Analytics and Settings.
5. Use the avatar menu (top right) or Settings to **log out**. Logging out never deletes your data.

## LocalStorage keys

| Key | Contents |
|---|---|
| `expenseTrackerUsers` | Registered users: `id`, `name`, `email`, `passwordHash`, `salt`, `iterations`, `currency`, `createdAt` |
| `expenseTrackerCurrentUser` | Active session: only `userId`, `remember`, `createdAt` (no password or hash) |
| `expenseTrackerTransactions` | All transactions, each with a `userId` |

## How user data is separated

- Each user gets a unique id (`user-<uuid>`).
- `ExpenseContext` filters transactions by the id from the auth session. Pages never see other users' rows.
- Add, edit, delete and "clear history" are all scoped to the session user's id. A `userId` sent from a form is ignored.
- Logout clears only the session key. Users and transactions stay saved, and a returning user's history loads again.
- Clearing history removes only the current user's transactions.

## Security: what is done, and what this cannot do

Done:
- Passwords are hashed with PBKDF2-SHA256 (150,000 iterations) and a random per-user salt using the Web Crypto API. Plain-text passwords are never stored.
- The session holds no credentials. The active user is always derived from the session id.
- Protected routes check authentication before rendering. Logged-in users are redirected away from Login and Register.
- Login errors are generic ("Incorrect email or password") and hash even for unknown emails, so timing does not reveal which emails exist.

**Important limitation: this is a demonstration, not production-grade security.** A frontend-only app cannot protect credentials or financial data from anyone who can use the browser's developer tools or modify its storage. For example, someone with access to the device can:
- read the stored hashes and attempt offline guessing,
- edit `expenseTrackerCurrentUser` to impersonate a user id,
- read or change any user's transactions directly, since they share one storage area.

Route guards and per-user filtering keep honest users separate in the UI; they are not an access-control boundary. The **Forgot password** page is also demo-only: with no server there is no way to verify email ownership, so anyone who knows an email can reset that account's password. For real use, authentication, password reset and data storage must be handled by a secure backend (server-side hashing, HTTP-only session cookies or tokens, per-user authorization on every request, and a database).

## Project structure

```
src/
  components/  Sidebar, Navbar (profile menu), ProtectedRoute, PublicRoute, AuthLayout,
               PasswordInput, SummaryCard, TransactionForm, TransactionTable, FilterSection,
               SearchBar, ExpenseChart, IncomeExpenseChart, ConfirmDialog, Modal, Toast
  pages/       Login, Register, ForgotPassword, Dashboard, AddTransaction,
               TransactionHistory, Reports, Settings
  context/     AuthContext, ExpenseContext, ToastContext
  hooks/       useLocalStorage
  utils/       calculations, validation, security, formatCurrency, constants
  test/        setup and end-to-end tests
```

## Notes

- Total Savings is the sum of the surplus from each month where income exceeded expenses.
- Transactions saved by the earlier single-user version (no `userId`) are ignored by this version.
- New accounts start empty; there is no demo data.
