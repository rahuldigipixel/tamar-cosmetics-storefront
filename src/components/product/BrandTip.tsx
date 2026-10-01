/**
 * Grey "?" badge next to the brand on the product page — only rendered when
 * the brand has a description. Hover/focus shows it in a black tooltip above
 * the badge (legacy-site style: white centered 12px text). Pure CSS, no
 * client JS.
 */
export function BrandTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label="על המותג"
        className="inline-flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#ececec] text-[14px] leading-none font-bold text-[#333] transition-colors hover:bg-[#dcdcdc] focus-visible:bg-[#dcdcdc]"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-[10px] w-[205px] -translate-x-1/2 bg-black px-[12px] py-[12px] text-center text-[12px] leading-[19px] font-normal whitespace-pre-line text-white opacity-0 transition-opacity duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {text}
        <span aria-hidden className="absolute top-full left-1/2 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-black" />
      </span>
    </span>
  );
}
