import '@testing-library/jest-dom/vitest';
import { webcrypto } from 'node:crypto';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no crypto.subtle; use Node's Web Crypto so real PBKDF2 hashing runs in tests.
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(() => cleanup());

// Recharts' ResponsiveContainer needs ResizeObserver, which jsdom lacks.
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
