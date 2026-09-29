import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Customer {
  id: number;
  databaseId: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  token: string | null;
  customer: Customer | null;
  // Only the username, never the password — same "remember me" contract as
  // wp-login.php: it pre-fills the login field on your next visit, it does
  // not keep you (or anyone else on a shared machine) silently signed in.
  rememberedUsername: string | null;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  setSession: (token: string, customer: Customer, rememberedUsername?: string | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      customer: null,
      rememberedUsername: null,

      login: async (username, password, rememberMe = false) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? "ההתחברות נכשלה.");
        }
        set({
          token: json.token,
          customer: json.customer,
          rememberedUsername: rememberMe ? username : null,
        });
      },

      setSession: (token, customer, rememberedUsername) =>
        set({ token, customer, ...(rememberedUsername !== undefined ? { rememberedUsername } : {}) }),

      logout: async () => {
        const token = get().token;
        // rememberedUsername deliberately survives logout — that's the
        // whole point of "remember me": the field is pre-filled again next
        // time, the session itself is not.
        set({ token: null, customer: null });
        if (!token) return;
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // Local session is already cleared — server-side token cleanup is
          // best-effort (it also just expires on its own after 30 days).
        }
      },
    }),
    {
      name: "tamar-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        customer: state.customer,
        rememberedUsername: state.rememberedUsername,
      }),
    }
  )
);
