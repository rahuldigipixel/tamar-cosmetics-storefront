"use client";

import Link from "next/link";
import { AccountLayout } from "@/components/auth/AccountLayout";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { useAccountData } from "@/lib/utils/useAccountData";
import { formatPrice } from "@/lib/utils/formatPrice";
import { orderStatusLabel } from "@/lib/utils/orderStatus";
import type { OrderSummary } from "@/lib/wpgraphql/tamarApi";

const TH = "px-2 py-4 text-start text-[18px] font-bold text-black";

export function OrdersList() {
  const { ready, loggedIn, loading, data } = useAccountData<OrderSummary[]>("/api/orders");

  if (ready && !loggedIn) return <LoginPrompt />;

  return (
    <AccountLayout>
      {!ready || loading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded bg-black/5" />
          ))}
        </div>
      ) : !data ? (
        <p className="text-[18px] text-black/70">לא ניתן לטעון את ההזמנות כרגע. נסו שוב מאוחר יותר.</p>
      ) : data.length === 0 ? (
        <p className="text-[18px] text-black/70">
          עדיין לא בוצעו הזמנות.{" "}
          <Link href="/shop" className="text-brand-accent underline">
            לחנות
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-start text-[18px]">
            <thead>
              <tr className="border-b border-black/10">
                <th className={TH}>הזמנה</th>
                <th className={TH}>תאריך</th>
                <th className={TH}>מצב</th>
                <th className={TH}>סה&quot;כ</th>
                <th className={TH}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {data.map((order) => (
                <tr key={order.id} className="border-b border-black/10">
                  <td className="px-2 py-5 text-[20px] font-bold text-black">
                    <Link href={`/my-account/view-order/${order.number}`} className="hover:underline">
                      #{order.number}
                    </Link>
                  </td>
                  <td className="px-2 py-5 text-[20px] text-black">{order.date}</td>
                  <td className="px-2 py-5 text-[20px] text-black">{orderStatusLabel(order.status, order.statusLabel)}</td>
                  <td className="px-2 py-5 text-[20px] text-black">
                    <span className="font-semibold text-brand-accent">{formatPrice(order.total)}</span> עבור{" "}
                    {order.itemCount} פריטים
                  </td>
                  <td className="px-2 py-5">
                    <Link
                      href={`/my-account/view-order/${order.number}`}
                      className="inline-block rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-4 py-1.5 text-[15px] font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-[#ff6b72] hover:to-brand-accent hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)]"
                    >
                      צפייה
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AccountLayout>
  );
}
