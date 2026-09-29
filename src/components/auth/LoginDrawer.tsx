"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound, X } from "lucide-react";
import { useAuthDrawerStore } from "@/lib/store/useAuthDrawerStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { AUTH_BUTTON_CLASS } from "@/components/auth/authStyles";
import { PasswordField } from "@/components/auth/PasswordField";
import { TextField } from "@/components/auth/TextField";

export function LoginDrawer() {
  const router = useRouter();
  const isOpen = useAuthDrawerStore((s) => s.isOpen);
  const closeDrawer = useAuthDrawerStore((s) => s.closeDrawer);
  const customer = useAuthStore((s) => s.customer);
  const rememberedUsername = useAuthStore((s) => s.rememberedUsername);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Bumped every time the drawer opens, and used as a React `key` on the
  // form below — forces a full remount of the fields (clearing PasswordField's
  // own internal show/hide toggle state too) instead of just resetting the
  // values here, since the drawer component itself stays mounted the whole
  // time (it only slides in/out) rather than unmounting when closed.
  const [formKey, setFormKey] = useState(0);
  const isValid = username.trim() !== "" && password !== "";

  // Every time the drawer opens, start from a clean slate: only the
  // username is ever pre-filled, and only if "remember me" was checked on a
  // previous login (same contract as wp-login.php) — the password field is
  // never remembered. Adjusted synchronously during render (React's
  // documented pattern for "reset state when a prop changes") rather than
  // in a useEffect, so it can't cause an extra cascading render pass.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setUsername(rememberedUsername ?? "");
      setPassword("");
      setRememberMe(Boolean(rememberedUsername));
      setError(null);
      setFormKey((k) => k + 1);
    }
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(username, password, rememberMe);
      closeDrawer();
      router.push("/my-account");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
      />

      <aside
        className={`fixed inset-y-0 end-0 z-[95] flex w-[90%] max-w-[340px] flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="יש לי חשבון באתר"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-4 py-4">
          <h2 className="text-[21px] font-bold">יש לי חשבון באתר</h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex items-center gap-1.5 rounded-full py-2 pe-2 ps-3 text-[16px] leading-[26px] text-black/60 hover:bg-black/5 hover:text-brand-accent"
          >
            <span>לסגירה</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {customer ? (
          <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <UserRound className="h-14 w-14 text-black/20" strokeWidth={1.25} />
            <p className="text-[16px] leading-[26px] font-bold text-black">
              שלום, {customer.firstName || customer.username}
            </p>
            <p className="text-[16px] leading-[26px] text-black/60">{customer.email}</p>
            <button
              type="button"
              onClick={() => logout()}
              className={`mt-2 w-full ${AUTH_BUTTON_CLASS}`}
            >
              התנתקות
            </button>
          </div>
        ) : (
          <>
            <form key={formKey} onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-5 text-right">
              <TextField
                id="login-drawer-username"
                name="username"
                label="שם משתמש או כתובת אימייל"
                required
                autoComplete="username"
                value={username}
                onChange={setUsername}
              />

              <PasswordField
                id="login-drawer-password"
                name="password"
                label="סיסמה"
                required
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
              />

              {error ? <p className="text-[16px] leading-[26px] text-brand-accent">{error}</p> : null}

              <button type="submit" disabled={submitting || !isValid} className={`mt-1 ${AUTH_BUTTON_CLASS}`}>
                כניסה
              </button>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[16px] leading-[26px] text-black">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-black/30 text-brand-accent focus:ring-brand-accent"
                  />
                  זכור אותי
                </label>
                <Link
                  href="/my-account/lost-password/"
                  onClick={closeDrawer}
                  className="text-[16px] leading-[26px] font-normal text-brand-accent hover:underline"
                >
                  שכחת את הסיסמה?
                </Link>
              </div>
            </form>

            <div className="flex flex-col items-center gap-3 border-t border-black/5 px-4 py-6 text-center">
              <UserRound className="h-14 w-14 text-black/20" strokeWidth={1.25} />
              <p className="text-[16px] leading-[26px] font-bold text-black">פעם ראשונה שלי כאן?</p>
              <Link
                href="/my-account/?action=register"
                onClick={closeDrawer}
                className="text-[16px] leading-[26px] font-normal text-brand-accent underline underline-offset-2"
              >
                פתיחת חשבון
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
