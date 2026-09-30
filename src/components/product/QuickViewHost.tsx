"use client";

import dynamic from "next/dynamic";
import { useQuickViewStore } from "@/lib/store/useQuickViewStore";

// Code-split: the popup's JS only loads the first time someone opens it.
const QuickViewModal = dynamic(() => import("./QuickViewModal").then((m) => m.QuickViewModal), { ssr: false });

/** Mounted once in the root layout; renders the popup for whichever card opened it. */
export function QuickViewHost() {
  const product = useQuickViewStore((s) => s.product);
  return product ? <QuickViewModal product={product} /> : null;
}
