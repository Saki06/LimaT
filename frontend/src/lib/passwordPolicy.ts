export const validatePasswordStrength = (password: string): string | null => {
  if (password.length < 12) return "Password must be at least 12 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain a number.";
  if (!/[^A-Za-z0-9\s]/.test(password)) {
    return "Password must contain a special character that is not whitespace.";
  }
  if (password === "Staff@123" || password === "Student@123") {
    return "Password cannot be a temporary password.";
  }
  return null;
};
