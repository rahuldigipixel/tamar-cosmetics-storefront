"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AUTH_BUTTON_CLASS } from "@/components/auth/authStyles";
import { PasswordField } from "@/components/auth/PasswordField";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key") ?? "";
  const login = searchParams.get("login") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, login, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "איפוס הסיסמה נכשל, נסו שוב.");
      }
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!key || !login) {
    return (
      <div className="mx-auto max-w-[480px] px-[15px] py-16 text-right">
        <p className="text-[18px] leading-[30px] text-black">
          הקישור לאיפוס הסיסמה חסר או שאינו תקין. יש לבקש קישור חדש בדף{" "}
          <Link href="/my-account/lost-password/" className="text-brand-accent underline">
            שכחתי סיסמה
          </Link>
          .
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-[480px] px-[15px] py-16 text-right">
        <p className="text-[18px] leading-[30px] text-black">
          הסיסמה עודכנה בהצלחה. ניתן{" "}
          <Link href="/my-account" className="text-brand-accent underline">
            להתחבר
          </Link>{" "}
          כעת.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[480px] px-[15px] py-16">
      <p className="text-right text-[22px] font-normal leading-[34px] text-black">בחירת סיסמה חדשה</p>

      <hr className="my-8 border-black/10" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
        <PasswordField
          id="reset-password-new"
          name="password"
          label="סיסמה חדשה"
          required
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />
        <PasswordField
          id="reset-password-confirm"
          name="confirm_password"
          label="אימות סיסמה"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        {error ? <p className="text-[16px] leading-[26px] text-brand-accent">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting || password === "" || confirmPassword === ""}
          className={AUTH_BUTTON_CLASS}
        >
          עדכון סיסמה
        </button>
      </form>
    </div>
  );
}
