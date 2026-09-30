import { Sparkles } from "lucide-react";

/**
 * "הטיפ של תמר" callout above the icon boxes — text comes from the product's
 * `tip_description` field. Clean editorial card: white surface, hairline
 * border, small brand-coloured label with a divider rule, calm body text.
 */
export function TamarTip({ text }: { text: string }) {
  return (
    <aside className="rounded-xl border border-black/10 bg-white p-[18px] text-right shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-[8px]">
        <Sparkles className="h-[18px] w-[18px] shrink-0 text-brand-accent" strokeWidth={2} aria-hidden />
        <p className="text-[16px] leading-[22px] font-bold text-[#242424]">הטיפ של תמר</p>
        <span aria-hidden className="h-px flex-1 bg-black/10" />
      </div>
      <p className="mt-[12px] text-[15px] leading-[24px] whitespace-pre-line text-black/75">{text}</p>
    </aside>
  );
}
