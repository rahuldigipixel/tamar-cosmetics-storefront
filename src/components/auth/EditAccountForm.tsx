"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AccountLayout } from "@/components/auth/AccountLayout";
import { AccountField } from "@/components/auth/AccountField";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { AUTH_BUTTON_CLASS } from "@/components/auth/authStyles";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useAccountData } from "@/lib/utils/useAccountData";
import { passwordRules } from "@/lib/utils/passwordStrength";
import type { AccountProfile } from "@/lib/wpgraphql/tamarApi";

const subscribeNoop = () => () => {};

export function EditAccountForm({ confirmHash }: { confirmHash?: string }) {
  // Server render has no auth store; only decide "logged out" once hydrated on the client.
  const ready = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const loggedIn = useAuthStore((s) => !!s.token);
  if (ready && !loggedIn) return <LoginPrompt />;
  return (
    <AccountLayout>
      {confirmHash ? <ConfirmEmailGate hash={confirmHash} /> : <ProfileLoader />}
    </AccountLayout>
  );
}

/**
 * Landing for the link in the "confirm your new email" message (WP's
 * ?newuseremail=HASH flow): applies the pending change first, then shows the
 * form so it loads the already-updated address.
 */
function ConfirmEmailGate({ hash }: { hash: string }) {
  const token = useAuthStore((s) => s.token);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch("/api/account/confirm-email", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ hash }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        setResult(
          res.ok
            ? { ok: true, message: "כתובת האימייל עודכנה בהצלחה." }
            : { ok: false, message: json?.error ?? "אישור האימייל נכשל." }
        );
      })
      .catch(() => !cancelled && setResult({ ok: false, message: "אישור האימייל נכשל." }));
    return () => {
      cancelled = true;
    };
  }, [token, hash]);

  if (!result) return <div className="h-11 animate-pulse rounded-full bg-black/5" aria-busy="true" />;
  return (
    <>
      <p className={`mb-6 text-[18px] ${result.ok ? "text-green-700" : "text-brand-accent"}`} role="status">
        {result.message}
      </p>
      <ProfileLoader />
    </>
  );
}

function ProfileLoader() {
  const { ready, loading, data } = useAccountData<AccountProfile>("/api/account/profile");

  return (
    <>
      {!ready || loading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-full bg-black/5" />
          ))}
        </div>
      ) : !data ? (
        <p className="text-[18px] text-black/70">לא ניתן לטעון את פרטי החשבון כרגע. נסו שוב מאוחר יותר.</p>
      ) : (
        <Form initial={data} />
      )}
    </>
  );
}

function Form({ initial }: { initial: AccountProfile }) {
  const token = useAuthStore((s) => s.token);
  const [form, setForm] = useState(initial);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [pendingEmail, setPendingEmail] = useState(initial.pendingEmail);
  const [notice, setNotice] = useState<string | null>(null);
  const rules = passwordRules(newPassword);

  const set = (key: keyof AccountProfile) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setNotice(null);

    // Client-side mirror of the server's checks, so the common mistakes get
    // instant feedback instead of a round trip.
    if (newPassword || confirmPassword) {
      if (!currentPassword) return setError("נא להזין את הסיסמה הנוכחית.");
      if (!passwordRules(newPassword).every((r) => r.ok)) return setError("הסיסמה החדשה אינה עומדת בדרישות החוזק.");
      if (newPassword !== confirmPassword) return setError("הסיסמאות החדשות אינן תואמות.");
    }

    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, currentPassword, newPassword, confirmPassword }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "השמירה נכשלה.");

      // Keep the header/dashboard greeting in sync with the saved name.
      const customer = useAuthStore.getState().customer;
      if (customer) {
        useAuthStore.setState({
          customer: { ...customer, firstName: json.firstName, lastName: json.lastName, email: json.email },
        });
      }
      // The address itself only changes once the emailed link is clicked, so the
      // field goes back to the current address and the pending one is shown below.
      setForm((prev) => ({ ...prev, email: json.email }));
      setPendingEmail(json.pendingEmail);
      if (json.emailSent) setNotice(`נשלח אימייל אישור אל ${json.pendingEmail}. יש ללחוץ על הקישור בהודעה כדי להשלים את שינוי הכתובת.`);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "השמירה נכשלה.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelPending() {
    const res = await fetch("/api/account/cancel-email", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: "{}",
    });
    if (res.ok) {
      setPendingEmail("");
      setNotice(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <AccountField
          id="firstName"
          label="שם פרטי"
          required
          autoComplete="given-name"
          value={form.firstName}
          onChange={set("firstName")}
        />
        <AccountField
          id="lastName"
          label="שם משפחה"
          required
          autoComplete="family-name"
          value={form.lastName}
          onChange={set("lastName")}
        />
      </div>
      <AccountField
        id="displayName"
        label="שם תצוגה"
        required
        value={form.displayName}
        onChange={set("displayName")}
        hint="השם שיופיע במקטע החשבון ובביקורות"
      />
      <AccountField
        id="email"
        label="כתובת אימייל"
        type="email"
        required
        autoComplete="email"
        value={form.email}
        onChange={set("email")}
      />

      {pendingEmail && (
        <p className="-mt-2 text-[18px] text-black">
          ממתין לאישור שינוי כתובת האימייל אל <bdi className="font-semibold">{pendingEmail}</bdi>.{" "}
          <button type="button" onClick={cancelPending} className="text-brand-accent underline">
            ביטול השינוי
          </button>
        </p>
      )}

      <fieldset className="space-y-5 rounded border border-black/15 p-5 pt-3">
        <legend className="px-3 text-[20px] font-bold text-black">שינוי סיסמה</legend>
        <AccountField
          id="currentPassword"
          label="סיסמה נוכחית (כדי להשאיר ללא שינוי יש להשאיר ריק)"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <AccountField
          id="newPassword"
          label="סיסמה חדשה (כדי להשאיר ללא שינוי יש להשאיר ריק)"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={setNewPassword}
        />
        {newPassword && (
          <ul className="-mt-2 grid gap-x-6 text-[18px] sm:grid-cols-2" aria-live="polite">
            {rules.map((r) => (
              <li key={r.label} className={r.ok ? "text-green-700" : "text-black/60"}>
                {r.ok ? "✓" : "○"} {r.label}
              </li>
            ))}
          </ul>
        )}
        <AccountField
          id="confirmPassword"
          label="יש לאשר את הסיסמה החדשה"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </fieldset>

      {error && (
        <p className="text-[18px] text-brand-accent" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="text-[18px] text-black" role="status">
          {notice}
        </p>
      )}
      {saved && (
        <p className="text-[18px] text-black" role="status">
          פרטי החשבון נשמרו בהצלחה.
        </p>
      )}

      <button type="submit" disabled={saving} className={`${AUTH_BUTTON_CLASS} px-8 text-[18px]`}>
        {saving ? "שומר…" : "שמירת שינויים"}
      </button>
    </form>
  );
}
