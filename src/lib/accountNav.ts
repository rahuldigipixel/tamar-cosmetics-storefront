import { CircleUserRound, LogOut, MapPin, Settings, FileText, Heart, type LucideIcon } from "lucide-react";

export interface AccountNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Rendered as a logout button instead of a Link. */
  isLogout?: boolean;
}

// Single source of truth for both the header's account dropdown and the
// /my-account dashboard's sidebar + card grid, so the two never drift.
export const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  { label: "לוח בקרה", href: "/my-account", icon: FileText },
  { label: "הזמנות", href: "/my-account/orders", icon: FileText },
  { label: "כתובת", href: "/my-account/edit-address", icon: MapPin },
  { label: "פרטי חשבון", href: "/my-account/edit-account", icon: CircleUserRound },
  { label: "רשימת המשאלות", href: "/רשימת-משאלות", icon: Heart },
  { label: "מעקב אחר המשלוח", href: "/my-account/d-shipment-tracking", icon: Settings },
  { label: "התנתק", href: "", icon: LogOut, isLogout: true },
];

// The dashboard's 6-card grid omits "לוח בקרה" (you're already there).
// Array order here IS the on-screen right-to-left reading order under this
// site's dir="rtl" grid (array index 0 lands in the rightmost cell) — so
// this list is written in the same order the reference reads, right to
// left: (הזמנות, כתובת, פרטי חשבון) then (רשימת המשאלות, מעקב אחר המשלוח, התנתק).
export const DASHBOARD_CARDS: AccountNavItem[] = [
  { label: "הזמנות", href: "/my-account/orders", icon: FileText },
  { label: "כתובת", href: "/my-account/edit-address", icon: MapPin },
  { label: "פרטי חשבון", href: "/my-account/edit-account", icon: CircleUserRound },
  { label: "רשימת המשאלות", href: "/רשימת-משאלות", icon: Heart },
  { label: "מעקב אחר המשלוח", href: "/my-account/d-shipment-tracking", icon: Settings },
  { label: "התנתק", href: "", icon: LogOut, isLogout: true },
];
