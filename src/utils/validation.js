export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export function validateName(value) {
  const n = String(value || '').trim();
  if (!n) return 'Enter your full name.';
  if (n.length < 2) return 'Name must be at least 2 characters.';
  if (n.length > 60) return 'Keep your name under 60 characters.';
  return '';
}
export function validateEmail(value) {
  const e = String(value || '').trim();
  if (!e) return 'Enter your email address.';
  if (!EMAIL_RE.test(e)) return 'Enter a valid email address.';
  return '';
}
export function validatePassword(value) {
  if (!value) return 'Enter a password.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  return '';
}
export function validateConfirm(password, confirm) {
  if (!confirm) return 'Confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return '';
}
/** Keep only the fields that actually have an error message. */
export const compact = (errors) => Object.fromEntries(Object.entries(errors).filter(([, v]) => v));

export const validateRegister = (v) => compact({
  name: validateName(v.name), email: validateEmail(v.email),
  password: validatePassword(v.password), confirmPassword: validateConfirm(v.password, v.confirmPassword),
});
export const validateLogin = (v) => compact({
  email: validateEmail(v.email), password: v.password ? '' : 'Enter your password.',
});
export const validateProfile = (v) => compact({ name: validateName(v.name), email: validateEmail(v.email) });
export const validatePasswordChange = (v) => compact({
  currentPassword: v.currentPassword ? '' : 'Enter your current password.',
  newPassword: validatePassword(v.newPassword),
  confirmPassword: validateConfirm(v.newPassword, v.confirmPassword),
});
export const validateReset = (v) => compact({
  email: validateEmail(v.email), newPassword: validatePassword(v.newPassword),
  confirmPassword: validateConfirm(v.newPassword, v.confirmPassword),
});
