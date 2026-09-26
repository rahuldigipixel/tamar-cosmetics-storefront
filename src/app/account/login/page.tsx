"use client";

import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(
      "התחברות/הרשמה דורשת פלאגין JWT Auth מופעל בבקאנד (ראו שלבי ה-setup הידניים בתוכנית העבודה) — לא מוגדר עדיין."
    );
  }

  return (
    <div className="mx-auto max-w-md px-[15px] py-16 ">
      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => setMode("login")}
          className={`text-sm font-medium ${mode === "login" ? "text-brand-accent" : "text-black/40"}`}
        >
          התחברות
        </button>
        <button
          onClick={() => setMode("register")}
          className={`text-sm font-medium ${mode === "register" ? "text-brand-accent" : "text-black/40"}`}
        >
          הרשמה
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <input
          required
          type="email"
          placeholder="דוא&quot;ל"
          className="w-full rounded border border-black/10 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="סיסמה"
          className="w-full rounded border border-black/10 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:bg-brand-accent"
        >
          {mode === "login" ? "התחברות" : "הרשמה"}
        </button>
      </form>
    </div>
  );
}
