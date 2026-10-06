"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { HeaderSearchResult } from "@/app/api/search/route";

const MIN_CHARS = 3;

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Bold + underline every occurrence of the query, as the reference does.
function Highlight({ text, query }: { text: string; query: string }) {
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <strong key={i} className="font-bold underline">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

/**
 * Header search box + live results dropdown (reference: Woodmart ajax
 * search). The dropdown is `absolute` against the nearest positioned
 * ancestor — the caller decides its span via `dropdownClassName`.
 */
export function HeaderSearch({
  formClassName,
  inputClassName,
  buttonClassName,
  iconClassName,
  dropdownClassName,
  columns,
}: {
  formClassName: string;
  inputClassName: string;
  buttonClassName: string;
  iconClassName: string;
  dropdownClassName: string;
  columns: "row" | "list";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<HeaderSearchResult[]>([]);
  // The query the current `results` belong to — loading is derived from it
  // (not a flag), so a stale list never shows as the answer to a new query.
  const [resultsFor, setResultsFor] = useState("");

  const trimmed = query.trim();
  const active = trimmed.length >= MIN_CHARS;
  const loading = active && resultsFor !== trimmed;

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((r) => r.json() as Promise<{ results: HeaderSearchResult[] }>)
        .then((d) => {
          setResults(d.results);
          setResultsFor(trimmed);
        })
        .catch(() => {});
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [active, trimmed]);

  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const allResultsHref = `/?s=${encodeURIComponent(trimmed)}&post_type=product`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    (document.activeElement as HTMLElement | null)?.blur();
    router.push(trimmed ? allResultsHref : "/shop");
  }

  return (
    <div ref={wrapperRef} className="contents">
      <form role="search" onSubmit={handleSubmit} className={formClassName}>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="חיפוש מוצר"
          aria-label="חיפוש מוצר"
          className={inputClassName}
        />
        {/* While a query is in flight the search icon turns into a spinner
            (as on the reference) — the dropdown only opens once results land. */}
        <button type="submit" aria-label="חיפוש" aria-busy={loading} className={buttonClassName}>
          {loading ? (
            <span
              role="status"
              aria-label="טוען תוצאות"
              className={`${iconClassName} animate-spin rounded-full border-2 border-black/15 border-t-black`}
            />
          ) : (
            <Search className={iconClassName} />
          )}
        </button>
      </form>

      {open && active && !(loading && results.length === 0) ? (
        <div className={`z-50 bg-white shadow-[0_0_9px_rgba(0,0,0,.1)] ${dropdownClassName}`}>
          {!loading && results.length === 0 ? (
            <p className="px-[15px] py-[25px] text-center text-[14px] text-[#777]">לא נמצאו מוצרים</p>
          ) : (
            <div className={`${loading ? "opacity-60" : ""} transition-opacity ${columns === "row" ? "pb-[20px]" : ""}`}>
              <div
                className={
                  columns === "row"
                    ? "grid grid-cols-5 px-[15px] pt-[15px]"
                    : "flex flex-col divide-y divide-black/5 px-[15px] py-[5px]"
                }
              >
                {results.map((r) => (
                  <Link prefetch={false}
                    key={r.id}
                    href={`/product/${r.slug}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-[15px] text-black transition-colors hover:bg-[#f5f5f5] ${columns === "list" ? "px-[5px] py-[10px]" : "p-[15px]"}`}
                  >
                    <span className="relative h-[60px] w-[60px] shrink-0">
                      {r.image ? (
                        <Image src={r.image.url} alt={r.image.alt} fill sizes="60px" className="object-contain" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-3 text-[14px] font-normal leading-[20px]">
                        <Highlight text={r.name} query={trimmed} />
                      </span>
                      {r.sku ? <span className="mt-[5px] block text-[14px] leading-[20px]">SKU: {r.sku}</span> : null}
                      {r.price !== null ? (
                        <span className="mt-[8px] block text-[24px] font-bold leading-[26px] text-[#d52027]">
                          {formatPrice(r.price)}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href={allResultsHref}
                onClick={() => setOpen(false)}
                className="flex h-[50px] items-center justify-center gap-[6px] text-[21px] font-semibold leading-[50px] text-[#333] transition-colors hover:bg-[#f4c5cd]"
              >
                צפייה בכל התוצאות
                <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
