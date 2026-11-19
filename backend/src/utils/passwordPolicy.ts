export type PasswordValidationResult =
  | { valid: true }
  | { valid: false; message: string };

const MINIMUM_PASSWORD_LENGTH = 12;

const TEMPORARY_PASSWORDS: readonly string[] = [
  'Staff@123',
  'Student@123',
];

export const isTemporaryPassword = (password: string): boolean =>
  typeof password === 'string' &&
  TEMPORARY_PASSWORDS.includes(password);

export const validatePasswordStrength = (
  password: string
): PasswordValidationResult => {
  if (typeof password !== 'string') {
    return {
      valid: false,
      message: 'Password must be a string.',
    };
  }

  if (isTemporaryPassword(password)) {
    return {
      valid: false,
      message: 'Password cannot be a temporary password.',
    };
  }

  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: 'Password must be at least 12 characters long.',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter.',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter.',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number.',
    };
  }

  if (!/[^A-Za-z0-9\s]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character.',
    };
  }

  return { valid: true };
};

export const validatePasswordChange = (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): PasswordValidationResult => {
  if (
    typeof currentPassword !== 'string' ||
    typeof newPassword !== 'string' ||
    typeof confirmPassword !== 'string'
  ) {
    return {
      valid: false,
      message: 'Password values must be strings.',
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      valid: false,
      message: 'New password and confirmation password do not match.',
    };
  }

  if (newPassword === currentPassword) {
    return {
      valid: false,
      message: 'New password must be different from the current password.',
    };
  }

  if (isTemporaryPassword(newPassword)) {
    return {
      valid: false,
      message: 'Password cannot be a temporary password.',
    };
  }

  return validatePasswordStrength(newPassword);
};
