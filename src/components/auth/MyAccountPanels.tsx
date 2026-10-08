"use client";

import { useLogoutToHome } from "@/lib/store/useLogoutToHome";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore, type Customer } from "@/lib/store/useAuthStore";
import { AUTH_BUTTON_CLASS } from "@/components/auth/authStyles";
import { AccountDashboard } from "@/components/auth/AccountDashboard";
import { PasswordField } from "@/components/auth/PasswordField";
import { TextField } from "@/components/auth/TextField";

type Mode = "login" | "register";

interface MyAccountPanelsProps {
  initialMode: Mode;
}

function LoginPanel({ notice }: { notice?: string | null }) {
  const login = useAuthStore((s) => s.login);
  const rememberedUsername = useAuthStore((s) => s.rememberedUsername);
  // Only the username is ever pre-filled from a previous "remember me"
  // login (same contract as wp-login.php) — the password is never
  // remembered, and this panel remounts fresh on every visit/toggle anyway
  // since it's conditionally rendered rather than kept mounted.
  const [username, setUsername] = useState(rememberedUsername ?? "");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedUsername));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isValid = username.trim() !== "" && password !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(username, password, rememberMe);
      router.push("/my-account");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-5 text-[24px] font-bold text-black">התחברות</h1>
      {notice ? <p className="mb-4 text-[16px] leading-[26px] text-green-700">{notice}</p> : null}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
        <TextField
          id="my-account-login-username"
          name="username"
          label="שם משתמש או כתובת אימייל"
          required
          autoComplete="username"
          value={username}
          onChange={setUsername}
        />
        <PasswordField
          id="my-account-login-password"
          name="password"
          label="סיסמה"
          required
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        {error ? <p className="text-[16px] leading-[26px] text-brand-accent">{error}</p> : null}

        <button type="submit" disabled={submitting || !isValid} className={AUTH_BUTTON_CLASS}>
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
            className="text-[16px] leading-[26px] font-normal text-brand-accent hover:underline"
          >
            שכחת את הסיסמה?
          </Link>
        </div>
      </form>
    </div>
  );
}

function RegisterPanel({ onRegistered }: { onRegistered: (notice: string) => void }) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isValid = username.trim() !== "" && email.trim() !== "" && password !== "" && optIn;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const json: { token?: string; customer?: Customer | null; error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "ההרשמה נכשלה, נסו שוב.");
      }
      if (json.token && json.customer) {
        // The account was created and the same credentials logged in
        // immediately (see /api/auth/register) — no need to make them
        // re-type their password.
        setSession(json.token, json.customer);
        router.push("/my-account");
      } else {
        onRegistered("ההרשמה הושלמה בהצלחה! ניתן להתחבר עם שם המשתמש והסיסמה שנבחרו.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-5 text-[24px] font-bold text-black">הרשמה</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
        <TextField
          id="my-account-register-username"
          name="username"
          label="שם משתמש"
          required
          autoComplete="username"
          value={username}
          onChange={setUsername}
        />
        <TextField
          id="my-account-register-email"
          name="email"
          type="email"
          label="כתובת אימייל"
          required
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />
        <PasswordField
          id="my-account-register-password"
          name="password"
          label="סיסמה"
          required
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />

        <label className="flex items-start gap-2 text-[16px] leading-[26px] text-black">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-black/30 text-brand-accent focus:ring-brand-accent"
          />
          <span>אני מסכימה לקבל דיוור פרסומי באמצעות מייל וסמס מחברת ע.צ.ת. תמר קוסמטיקס בע&quot;מ</span>
        </label>

        {error ? <p className="text-[16px] leading-[26px] text-brand-accent">{error}</p> : null}

        <button type="submit" disabled={submitting || !isValid} className={AUTH_BUTTON_CLASS}>
          הרשמה
        </button>
      </form>
    </div>
  );
}

export function MyAccountPanels({ initialMode }: MyAccountPanelsProps) {
  const customer = useAuthStore((s) => s.customer);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [registeredNotice, setRegisteredNotice] = useState<string | null>(null);

  const handleLogout = useLogoutToHome();

  if (customer) {
    return <AccountDashboard customer={customer} onLogout={handleLogout} />;
  }

  return (
    <div className="mx-auto max-w-[1040px]   py-16">
      {/* Grid columns are physical, but this site runs dir="rtl", which
          reverses which side a CSS Grid's column 1 lands on (inline-start =
          right). To match the reference (info/switch panel on the LEFT,
          active form on the RIGHT), the form panel is placed FIRST in
          source order (-> grid column 1 -> right), then the divider, then
          the info panel (-> grid column 3 -> left). `order` below only
          controls the *mobile* stacked order (info panel first, form
          second) and is reset back to source order at the md breakpoint. */}
      <div className="grid gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-10">
        <div className="order-2 md:order-none md:ps-16">
          {mode === "login" ? (
            <LoginPanel notice={registeredNotice} />
          ) : (
            <RegisterPanel
              onRegistered={(notice) => {
                setRegisteredNotice(notice);
                setMode("login");
              }}
            />
          )}
        </div>

        <div className="hidden border-e border-black/10 md:block" />

        <div className="order-1 flex flex-col gap-4 text-center md:order-none md:pe-16">
          <h2 className="text-[24px] font-bold text-black">התחברות</h2>
          <p className="text-[18px] leading-[30px] text-black">
            ההרשמה לאתר זה מאפשרת לך לגשת למצב ההזמנה והיסטוריית ההזמנות שלך. יש למלא את כתובת האימייל, ואנו נפתח לך
            חשבון חדש תוך זמן קצר ונשלח לך את הסיסמה לאימייל.
          </p>
          <button
            type="button"
            onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
            className={`${AUTH_BUTTON_CLASS} self-center px-10`}
          >
            {mode === "login" ? "הרשמה" : "התחברות"}
          </button>
        </div>
      </div>
    </div>
  );
}
