/**
 * WPGraphQL's built-in mutations (registerCustomer, sendPasswordResetEmail,
 * resetUserPassword) return their error messages in English regardless of
 * the WP site locale — there's no per-request Accept-Language negotiation.
 * Rather than showing English text to Hebrew users, map the known messages
 * to Hebrew and fall back to a route-supplied generic Hebrew message for
 * anything unmapped, so English never leaks through.
 */
const KNOWN_ERRORS: [RegExp, string][] = [
  [/already registered with/i, "כתובת האימייל שהוזנה כבר רשומה במערכת. ניתן להתחבר או להשתמש בכתובת אימייל אחרת."],
  [/email address you are trying to use is invalid/i, "כתובת האימייל שהוזנה אינה תקינה."],
  [/provide a valid email/i, "יש להזין כתובת אימייל תקינה."],
  [/username is already registered/i, "שם המשתמש כבר תפוס, יש לבחור שם משתמש אחר."],
  [/invalid username/i, "שם המשתמש אינו תקין."],
  [/password reset key is required/i, "הקישור לאיפוס הסיסמה אינו תקין."],
  [/user login is required/i, "יש להזין שם משתמש או כתובת אימייל."],
  [/new password is required/i, "יש להזין סיסמה חדשה."],
  [/invalid key|reset link is invalid/i, "הקישור לאיפוס הסיסמה אינו תקין או שפג תוקפו."],
  [/username.*required/i, "יש להזין שם משתמש."],
];

export function translateAuthErrorMessage(message: string, fallback: string): string {
  const match = KNOWN_ERRORS.find(([pattern]) => pattern.test(message));
  return match ? match[1] : fallback;
}
