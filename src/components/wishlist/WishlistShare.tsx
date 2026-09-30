"use client";

import type { ReactNode } from "react";
import { Send } from "lucide-react";

const TITLE = "רשימת המשאלות שלי";

// Small filled brand glyphs (24x24 viewBox) to match the reference's share row.
const Glyph = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    {children}
  </svg>
);

const FacebookIcon = () => (
  <Glyph>
    <path d="M14 8V6.2c0-.8.2-1.2 1.3-1.2H17V2h-2.6C11.5 2 10 3.7 10 6v2H7.5v3H10v11h4V11h2.7l.4-3H14z" />
  </Glyph>
);
const XIcon = () => (
  <Glyph>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </Glyph>
);
const PinterestIcon = () => (
  <Glyph>
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
  </Glyph>
);
const LinkedinIcon = () => (
  <Glyph>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </Glyph>
);

const BUTTONS = [
  { label: "שיתוף בפייסבוק", icon: <FacebookIcon />, href: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  { label: "שיתוף ב-X", icon: <XIcon />, href: (u: string, t: string) => `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
  { label: "שיתוף בפינטרסט", icon: <PinterestIcon />, href: (u: string, t: string) => `https://pinterest.com/pin/create/button/?url=${u}&description=${t}` },
  { label: "שיתוף בלינקדאין", icon: <LinkedinIcon />, href: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  { label: "שיתוף בטלגרם", icon: <Send className="h-4 w-4" />, href: (u: string, t: string) => `https://t.me/share/url?url=${u}&text=${t}` },
];

/** "שיתוף:" row for the wishlist page, in the reference's order: Facebook, X, Pinterest, LinkedIn, Telegram. */
export function WishlistShare() {
  // Resolved at click time so the URL never differs between server and client render.
  function open(build: (url: string, title: string) => string) {
    const target = build(encodeURIComponent(window.location.href), encodeURIComponent(TITLE));
    window.open(target, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[21px] font-semibold leading-[34px] text-[#333]">שיתוף:</span>
      {BUTTONS.map(({ label, icon, href }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          onClick={() => open(href)}
          className="flex h-6 w-6 items-center justify-center text-[#333]/60 transition-colors hover:text-brand-accent"
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
