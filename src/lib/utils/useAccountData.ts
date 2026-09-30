"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";

const subscribe = () => () => {};

/**
 * Fetches a logged-in-only `/api/...` route with the auth store's bearer
 * token. `loading` is derived from a "loaded for this url+token" marker, not
 * a boolean flipped early, so there is no false empty/error frame between
 * hydration and the fetch finishing. `ready` is false until the persisted
 * auth store has hydrated on the client.
 */
export function useAccountData<T>(url: string) {
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const token = useAuthStore((s) => s.token);
  const [result, setResult] = useState<{ key: string; data: T | null } | null>(null);
  const key = token ? `${url}|${token}` : null;

  useEffect(() => {
    if (!key || !token) return;
    let cancelled = false;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? (res.json() as Promise<T>) : null))
      .catch(() => null)
      .then((data) => {
        if (!cancelled) setResult({ key, data });
      });
    return () => {
      cancelled = true;
    };
  }, [key, token, url]);

  return {
    ready,
    loggedIn: !!token,
    loading: !!key && result?.key !== key,
    data: result?.key === key ? result.data : null,
  };
}
