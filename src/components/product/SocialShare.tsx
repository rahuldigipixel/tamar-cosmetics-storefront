"use client";

import { useState } from "react";
import { Check, Facebook, Link2, MessageCircle, Twitter } from "lucide-react";

export function SocialShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "שיתוף בוואטסאפ",
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "שיתוף בפייסבוק",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "שיתוף ב-X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
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
    <div className="flex items-center gap-2">
      <span className="text-base font-medium text-black/50">שיתוף:</span>
      {links.map(({ label, icon: Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/60 transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="העתקת קישור"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/60 transition-colors hover:border-brand-accent hover:text-brand-accent"
      >
        {copied ? <Check className="h-4 w-4 text-brand-accent" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
