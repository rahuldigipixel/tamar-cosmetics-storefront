import Link from "next/link";
import type { Customer } from "@/lib/store/useAuthStore";
import { DASHBOARD_CARDS } from "@/lib/accountNav";
import { AccountLayout } from "@/components/auth/AccountLayout";

export function AccountDashboard({ customer, onLogout }: { customer: Customer; onLogout: () => void }) {
  const displayName = customer.firstName || customer.username;

  return (
    <AccountLayout>
      <p className="text-[18px] leading-[30px] text-black">
        שלום <strong className="font-bold">{displayName}</strong> (לא <strong className="font-bold">{displayName}</strong>?{" "}
        <button type="button" onClick={onLogout} className="hover:underline">
          התנתק
        </button>
        )
      </p>

      <p className="mt-4 text-[18px] leading-[30px] text-black">
        בלוח הבקרה של החשבון שלך ניתן לראות את ההזמנות האחרונות, לנהל את כתובות המשלוח והחיוב, ולערוך את הסיסמה
        ופרטי החשבון, להגיש בקשת החזרה של פריט ואפשרויות מתקדמות נוספות.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {DASHBOARD_CARDS.map((card) => {
          const Icon = card.icon;
          const content = (
            <>
              <Icon className="h-14 w-14 text-black/30" strokeWidth={1} />
              <span className="text-[16px] font-semibold text-gray-700">{card.label}</span>
            </>
          );
          const className =
            "flex flex-col items-center justify-center gap-4 rounded-lg p-5 text-center font-semibold text-gray-700 shadow-[0_0_4px_rgba(0,0,0,0.18)] transition-colors hover:bg-brand-soft/30";

          return card.isLogout ? (
            <button key={card.label} type="button" onClick={onLogout} className={className}>
              {content}
            </button>
          ) : (
            <Link key={card.label} href={card.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </AccountLayout>
  );
}
