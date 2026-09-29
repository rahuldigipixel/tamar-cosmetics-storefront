"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ACCOUNT_NAV_ITEMS } from "@/lib/accountNav";

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-[1600px] px-[15px] py-16">
      {/* DOM order 1 -> right column, order 2 -> left column under this
          site's dir="rtl" grid (see the same note in MyAccountPanels.tsx) —
          the sidebar renders first so it lands on the right, matching the
          reference. A vertical divider sits between them, same pattern as
          the /my-account login/register page. */}
      <div className="grid gap-10 md:grid-cols-[260px_auto_1fr]">
        <aside>
          <h2 className="mb-4 text-[20px] font-bold text-black">החשבון שלי</h2>
          <nav>
            <ul className="divide-y divide-black/5">
              {ACCOUNT_NAV_ITEMS.map((item) => {
                const active = !item.isLogout && pathname === item.href;
                if (item.isLogout) {
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full py-3 text-right text-[16px] text-black/80 transition-colors hover:text-brand-accent"
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`block py-3 text-[16px] transition-colors ${
                        active ? "bg-black/5 px-4 font-semibold text-black" : "text-black/80 hover:text-brand-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="hidden border-e border-black/10 md:block" />

        <main>{children}</main>
      </div>
    </div>
  );
}
