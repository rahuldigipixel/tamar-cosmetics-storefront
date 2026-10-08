"use client";

import { useState } from "react";
import { AUTH_BUTTON_CLASS } from "@/components/auth/authStyles";
import { TextField } from "@/components/auth/TextField";

export default function LostPasswordPage() {
  const [userLogin, setUserLogin] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/auth/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userLogin }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "השליחה נכשלה, נסו שוב.");
      }
      setSent(true);
      setStatus("נשלח אימייל עם קישור לאיפוס הסיסמה. יש לבדוק גם בתיקיית הספאם.");
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[480px] px-[15px] py-16">
      <p className="text-right text-[22px] font-normal leading-[34px] text-black">
        שכחת את הסיסמה? יש להזין את שם המשתמש או כתובת האימייל. הוראות איפוס הסיסמה ישלחו באימייל.
      </p>

      <hr className="my-8 border-black/10" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
        <TextField
          id="lost-password-user-login"
          name="user_login"
          label="שם משתמש או כתובת אימייל"
          required
          autoComplete="username"
          value={userLogin}
          onChange={setUserLogin}
        />

        {status ? (
          <p className={`text-[16px] leading-[26px] ${sent ? "text-green-700" : "text-brand-accent"}`}>{status}</p>
        ) : null}

        <button type="submit" disabled={submitting || userLogin.trim() === ""} className={AUTH_BUTTON_CLASS}>
          איפוס סיסמה
        </button>
      </form>
    </div>
  );
}
