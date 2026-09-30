"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ACCOUNT_NAV_ITEMS } from "@/lib/accountNav";

export function AccountDropdown() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="group relative flex h-[40px] items-center">
      <Link
        href="/my-account"
        title="החשבון שלי"
        aria-label="החשבון שלי"
        className="flex h-[40px] items-center px-[10px] transition-opacity hover:opacity-60"
      >
        <Image src="/brand/user.svg" alt="" width={18} height={14} unoptimized className="w-[18px]" />
      </Link>

      <div className="invisible absolute end-0 top-full z-50 w-[300px] translate-y-1 bg-white opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <ul className="py-3 text-right">
          {ACCOUNT_NAV_ITEMS.map((item) =>
            item.isLogout ? (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-5 py-2.5 text-right text-[16px] text-black/55 transition-colors hover:text-brand-accent"
                >
                  {item.label}
                </button>
              </li>
            ) : (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="block px-5 py-1.5 text-right text-[15px] text-black/55 transition-colors hover:text-brand-accent"
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}
