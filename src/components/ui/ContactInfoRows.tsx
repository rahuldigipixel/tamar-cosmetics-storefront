import Image from "next/image";

interface ContactInfoRowsProps {
  items: { html: string; tight: boolean; muted: boolean; icon: { url: string; size: number; alt: string } | null }[];
  /** Text size/alignment classes (rows are 16px/20.8px, right-aligned by default). */
  className?: string;
}

/**
 * The wp-admin "add more" contact rows (phone, WhatsApp + icon, address, ...):
 * text/links HTML with an optional icon on the left of its text (first in DOM =
 * right in RTL). Shared by the contact and suppliers pages.
 */
export function ContactInfoRows({ items, className = "text-right text-[16px] leading-[20.8px]" }: ContactInfoRowsProps) {
  if (items.length === 0) return null;

  return (
    <div className={`flex flex-col text-black ${className}`}>
      {items.map((item, i) => (
        <div key={i} className={`flex items-center gap-5 ${item.tight ? "" : "mb-5 last:mb-0"} ${item.muted ? "text-[#333]" : ""}`}>
          <div className="[&_a]:text-inherit [&_a]:hover:underline" dangerouslySetInnerHTML={{ __html: item.html }} />
          {item.icon ? (
            <Image src={item.icon.url} alt={item.icon.alt} width={item.icon.size} height={item.icon.size} unoptimized className="shrink-0" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
