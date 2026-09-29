"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.07-.062-.174-.041-.249-.024-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 0a12 12 0 0 0-4.373 23.178c-.035-.798-.008-1.7.198-2.539.223-.97 1.514-6.427 1.514-6.427s-.375-.756-.375-1.87c0-1.755 1.019-3.065 2.288-3.065 1.079 0 1.602.809 1.602 1.782 0 1.084-.69 2.708-1.048 4.213-.298 1.257.63 2.284 1.869 2.284 2.242 0 3.965-2.365 3.965-5.771 0-3.019-2.171-5.128-5.267-5.128-3.591 0-5.696 2.694-5.696 5.479 0 1.083.418 2.245.94 2.877a.377.377 0 0 1 .088.361c-.096.4-.31 1.257-.353 1.433-.055.23-.183.279-.42.168-1.569-.73-2.549-3.023-2.549-4.865 0-3.959 2.876-7.596 8.29-7.596 4.352 0 7.734 3.1 7.734 7.243 0 4.32-2.724 7.797-6.504 7.797-1.27 0-2.465-.66-2.873-1.44l-.783 2.983c-.283 1.09-1.048 2.457-1.56 3.29A12 12 0 1 0 12 0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.324-.593 1.324-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
    </svg>
  );
}

export function BlogShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: "שיתוף בטלגרם", Icon: TelegramIcon, color: "#29B6F6", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "שיתוף בלינקדאין", Icon: LinkedinIcon, color: "#0A66C2", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "שיתוף בפינטרסט", Icon: PinterestIcon, color: "#E60023", href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}` },
    { label: "שיתוף ב-X", Icon: XIcon, color: "#000000", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "שיתוף בפייסבוק", Icon: FacebookIcon, color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the link is still visible in the address bar
    }
  }

  return (
    <div dir="ltr" className="flex flex-wrap items-center justify-center gap-3">
      {links.map(({ label, Icon, color, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          style={{ backgroundColor: color }}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <Icon />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="העתקת קישור"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-brand-accent hover:text-brand-accent"
      >
        {copied ? <Check className="h-4 w-4 text-brand-accent" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
