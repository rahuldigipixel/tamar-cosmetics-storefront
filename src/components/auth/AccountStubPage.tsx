"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { AccountLayout } from "@/components/auth/AccountLayout";

export function AccountStubPage({ title }: { title: string }) {
  const customer = useAuthStore((s) => s.customer);

  if (!customer) {
    return (
      <div className="mx-auto max-w-[480px] px-[15px] py-16 text-center">
        <p className="text-[18px] leading-[30px] text-black">
          יש{" "}
          <Link href="/my-account" className="text-brand-accent underline">
            להתחבר
          </Link>{" "}
          כדי לצפות בעמוד זה.
        </p>
      </div>
    );
  }

  return (
    <AccountLayout>
      <h1 className="mb-4 text-[22px] font-bold text-black">{title}</h1>
      <p className="text-[16px] leading-[28px] text-black/70">עמוד זה בבנייה ויהיה זמין בקרוב.</p>
    </AccountLayout>
  );
}
