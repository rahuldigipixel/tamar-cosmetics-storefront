"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogoutToHome } from "@/lib/store/useLogoutToHome";
import { ACCOUNT_NAV_ITEMS } from "@/lib/accountNav";

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const rawPathname = usePathname();
  const pathname = safeDecode(rawPathname);
  const handleLogout = useLogoutToHome();

  return (
    <div className="mx-auto max-w-[1600px] px-[15px] py-16">
      {/* DOM order 1 -> right column, order 2 -> left column under this
          site's dir="rtl" grid (see the same note in MyAccountPanels.tsx) —
          the sidebar renders first so it lands on the right, matching the
          reference. A vertical divider sits between them, same pattern as
          the /my-account login/register page. */}
      <div className="grid gap-10 md:grid-cols-[22%_1px_1fr] md:gap-[30px]">
        <aside>
          <h2 className="mb-4 text-[18px] font-bold leading-[25px] text-[#0c0c0c]">החשבון שלי</h2>
          <nav>
            <ul>
              {ACCOUNT_NAV_ITEMS.map((item) => {
                const active =
                  !item.isLogout &&
                  (pathname === item.href || (item.href === "/my-account/orders" && pathname.startsWith("/my-account/view-order")) || (item.href !== "/my-account" && pathname.startsWith(`${item.href}/`)));
                if (item.isLogout) {
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex h-10 w-full items-center text-right text-[14px] font-semibold leading-5 text-[#242424] transition-colors hover:text-brand-accent"
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
                      className={`flex h-10 items-center text-[14px] font-semibold leading-5 text-[#242424] transition-colors ${
                        active ? "bg-black/5 px-4" : "hover:text-brand-accent"
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

// usePathname() can return Hebrew paths percent-encoded; nav hrefs are plain Hebrew.
function safeDecode(path: string) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}
