"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { PRIMARY_BTN } from "@/components/cart/cartStyles";

// Inline "returning customer" login box of the legacy checkout (opened by "קנית כאן בעבר?"). Sizes are the
// legacy page's (21px/34px text, 42px pill inputs, 470px wide) — approved exception, see AGENTS.md.
const INPUT =
  "h-[42px] w-full rounded-[35px] border-2 border-[#d9d9d9] bg-transparent px-[15px] text-[14px] leading-[22.4px] text-[#0c0c0c] outline-none transition-colors placeholder:text-[#0c0c0c] focus:border-brand-accent";
const LABEL = "mb-[10px] block text-[21px] leading-[34px] text-[#0c0c0c]";

export function CheckoutLoginBox({ open }: { open: boolean }) {
  const login = useAuthStore((s) => s.login);
  const rememberedUsername = useAuthStore((s) => s.rememberedUsername);
  const [username, setUsername] = useState(rememberedUsername ?? "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedUsername));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await login(username, password, rememberMe);
    } catch (err) {
      setError((err as Error).message || "פרטי ההתחברות שגויים");
      setSubmitting(false);
    }
  }

  return (
    <div
      inert={!open}
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
    >
      <div className="min-h-0 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="relative mb-[25px] w-full border-2 border-black/[0.075] bg-white p-[30px] min-[768px]:w-[470px] max-[767px]:p-[20px]"
        >
          <p className="mb-[20px] text-[21px] leading-[34px] text-[#0c0c0c]">
            אם קנית כאן בעבר, אנא הכנס את שם המשתמש והסיסמה בתיבות הבאות. אם אתה לקוח חדש אנא המשך לסעיף חיוב ומשלוח.
          </p>

          <label htmlFor="checkout-login-username" className={LABEL}>
            שם משתמש או כתובת אימייל <span className="text-brand-accent">*</span>
          </label>
          <input
            id="checkout-login-username"
            name="username"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="שם משתמש או כתובת אימייל"
            className={`${INPUT} mb-[20px]`}
          />

          <label htmlFor="checkout-login-password" className={LABEL}>
            סיסמה <span className="text-brand-accent">*</span>
          </label>
          <div className="mb-[20px] flex h-[42px] items-center overflow-hidden rounded-[35px] border-2 border-[#d9d9d9] focus-within:border-brand-accent">
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "הסתרת הסיסמה" : "הצגת הסיסמה"}
              className="order-2 flex h-full w-[42px] shrink-0 items-center justify-center bg-black/5 text-black/50"
            >
              {showPassword ? <EyeOff className="h-[16px] w-[16px]" /> : <Eye className="h-[16px] w-[16px]" />}
            </button>
            <input
              id="checkout-login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
              className="order-1 h-full min-w-0 flex-1 bg-transparent px-[15px] text-[14px] text-[#0c0c0c] outline-none placeholder:text-[#0c0c0c]"
            />
          </div>

          {error ? (
            <p role="alert" className="mb-[15px] text-[21px] leading-[34px] text-brand-accent">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !username.trim() || !password}
            className={`${PRIMARY_BTN} mb-[20px] h-[42px] w-full px-[20px] text-[13px] font-bold leading-[15.6px]`}
          >
            כניסה
          </button>

          <div className="flex items-center justify-between gap-[15px] text-[21px] leading-[34px]">
            <label className="flex cursor-pointer items-center gap-[10px] text-[#0c0c0c]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-[13px] w-[13px] accent-brand-accent"
              />
              זכור אותי
            </label>
            <Link prefetch={false} href="/my-account/lost-password/" className="text-brand-accent hover:underline">
              שכחת את הסיסמה?
            </Link>
          </div>

          {submitting ? (
            <div role="status" aria-live="polite" aria-label="מתחבר" className="absolute inset-0 z-10 flex cursor-wait items-center justify-center bg-white/60">
              <span className="h-[26px] w-[26px] animate-spin rounded-full border-[3px] border-black/15 border-t-brand-accent" />
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
