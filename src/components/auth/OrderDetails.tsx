"use client";

import Link from "next/link";
import { AccountLayout } from "@/components/auth/AccountLayout";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { useAccountData } from "@/lib/utils/useAccountData";
import { formatPrice } from "@/lib/utils/formatPrice";
import { orderStatusLabel } from "@/lib/utils/orderStatus";
import type { OrderDetail } from "@/lib/wpgraphql/tamarApi";

export function OrderDetails({ number }: { number: string }) {
  const { ready, loggedIn, loading, data: order } = useAccountData<OrderDetail>(`/api/orders/${number}`);

  if (ready && !loggedIn) return <LoginPrompt />;

  return (
    <AccountLayout>
      {!ready || loading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-black/5" />
          ))}
        </div>
      ) : !order ? (
        <p className="text-[18px] text-black/70">
          ההזמנה לא נמצאה.{" "}
          <Link href="/my-account/orders" className="text-brand-accent underline">
            חזרה להזמנות
          </Link>
        </p>
      ) : (
        <div className="text-[18px] text-black">
          <p className="leading-[32px]">
            הזמנה <mark className="bg-black/5 px-1.5">#{order.number}</mark> נרשמה בתאריך{" "}
            <mark className="bg-black/5 px-1.5">{order.date}</mark> וכעת{" "}
            <mark className="bg-transparent font-bold">{orderStatusLabel(order.status, order.statusLabel)}</mark>.
          </p>

          <h2 className="mb-4 mt-10 text-[20px] font-bold">פרטי הזמנה</h2>
          <table className="w-full border-collapse text-start">
            <thead>
              <tr className="border-b border-black/10">
                <th className="py-3 text-start font-bold">מוצר</th>
                <th className="py-3 text-start font-bold">סה&quot;כ</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-black/10">
                  <td className="py-3">
                    {item.name} <strong>× {item.quantity}</strong>
                    {item.meta.map((m) => (
                      <div key={m.label} className="text-black/60">
                        {m.label}: {m.value}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 font-semibold text-brand-accent">{formatPrice(item.total)}</td>
                </tr>
              ))}
              <SummaryRow label="סכום ביניים:">
                <span className="font-semibold text-brand-accent">{formatPrice(order.subtotal)}</span>
              </SummaryRow>
              {order.discount > 0 && (
                <SummaryRow label="הנחה:">
                  <span className="font-semibold text-brand-accent">-{formatPrice(order.discount)}</span>
                </SummaryRow>
              )}
              {order.shippingMethod && <SummaryRow label="משלוח:">{order.shippingMethod}</SummaryRow>}
              {order.paymentMethod && <SummaryRow label="אמצעי תשלום:">{order.paymentMethod}</SummaryRow>}
              <SummaryRow label="סך הכל:">
                <span className="font-semibold text-brand-accent">{formatPrice(order.total)}</span>
              </SummaryRow>
              {order.note && <SummaryRow label="הערה:">{order.note}</SummaryRow>}
            </tbody>
          </table>

          <h2 className="mb-4 mt-10 text-[20px] font-bold">כתובת לחיוב</h2>
          <address className="leading-[32px] not-italic">
            {[order.billing.name, order.billing.company, order.billing.address1, order.billing.address2, order.billing.city]
              .filter(Boolean)
              .map((line) => (
                <div key={line}>{line}</div>
              ))}
            {order.billing.phone && <div><bdi>{order.billing.phone}</bdi></div>}
            {order.billing.email && <div><bdi>{order.billing.email}</bdi></div>}
          </address>
        </div>
      )}
    </AccountLayout>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-black/10">
      <th className="py-3 text-start font-bold">{label}</th>
      <td className="py-3">{children}</td>
    </tr>
  );
}
