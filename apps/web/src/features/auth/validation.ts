export interface ValidationErrors {
  [key: string]: string;
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include at least one letter and one number.';
  }

  return '';
}

export function validateRequired(value: string, label: string) {
  return value.trim().length > 0 ? '' : `${label} is required.`;
}

