"use client";

import { absoluteUrl } from "@/lib/seo";

const ICON_PATHS = {
  facebook:
    "M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  pinterest:
    "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z",
  telegram:
    "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
} as const;

/**
 * Quick-view share row, matching the reference: bold "Share:" label, then
 * small grey brand glyphs. In the RTL row the DOM order Facebook → X →
 * Pinterest → LinkedIn → Telegram reads right-to-left on screen, which is
 * the reference's order (Telegram, in, Pinterest, X, f from the left).
 */
export function QuickViewShare({
  url,
  title,
  image,
  label,
}: {
  url: string;
  title: string;
  image?: string;
  /** Overrides the bold English "Share:" label — the product page uses the regular-weight Hebrew "שיתוף:". */
  label?: string;
}) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  // Pinterest needs an absolute image URL (a relative /wp-content/… path gets no pin image).
  const mediaUrl = !image ? "" : /^https?:\/\//i.test(image) ? image : absoluteUrl(image);
  const links = [
    { key: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { key: "x", label: "X", href: `https://x.com/intent/tweet?url=${u}&text=${t}` },
    {
      key: "pinterest",
      label: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${u}&media=${encodeURIComponent(mediaUrl)}&description=${t}`,
    },
    { key: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { key: "telegram", label: "Telegram", href: `https://telegram.me/share/url?url=${u}&text=${t}` },
  ] as const;

  return (
    <div className="flex items-center gap-[14px]" dir="rtl">
      {label ? (
        <span className="text-[16px] leading-none font-normal text-[#333]">{label}</span>
      ) : (
        <span dir="ltr" className="text-[22px] leading-none font-bold text-[#333]">
          Share:
        </span>
      )}
      {links.map(({ key, label, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-[#777] transition-colors hover:text-[#333]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[14px] w-[14px]" aria-hidden>
            <path d={ICON_PATHS[key]} />
          </svg>
        </a>
      ))}
    </div>
  );
}
