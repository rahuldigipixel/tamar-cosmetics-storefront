export interface PasswordRule {
  label: string;
  ok: boolean;
}

/** Same rule the backend enforces (Tamar_Headless_Account::password_error): 8+ chars, upper, lower, digit, symbol. */
export function passwordRules(password: string): PasswordRule[] {
  return [
    { label: "לפחות 8 תווים", ok: password.length >= 8 },
    { label: "אות גדולה באנגלית", ok: /[A-Z]/.test(password) },
    { label: "אות קטנה באנגלית", ok: /[a-z]/.test(password) },
    { label: "ספרה", ok: /\d/.test(password) },
    { label: "תו מיוחד (למשל !@#$)", ok: /[^a-zA-Z0-9]/.test(password) },
  ];
}
