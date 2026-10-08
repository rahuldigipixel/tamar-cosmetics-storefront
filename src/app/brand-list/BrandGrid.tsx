"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/types/product";

export function BrandGrid({ brands }: { brands: Brand[] }) {
  const [query, setQuery] = useState("");

  const visible = query.trim()
    ? brands.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase()))
    : brands;

  return (
    <>
      {/* Search */}
      <div className="mb-[50px] flex justify-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש מותג"
          className="h-[42px] w-full max-w-[900px] rounded-full border border-[#ccc] bg-white px-6 text-center font-[Arial,Helvetica,sans-serif] text-[18px] text-black outline-none placeholder:text-black focus:border-brand-accent"
        />
      </div>

      {/* Grid with shared inner borders — same pattern as CategoryProductCard */}
      {visible.length === 0 ? (
        <p className="py-12 text-center text-black/50">לא נמצאו מותגים.</p>
      ) : (
        // Legacy (Elementor grid) cells, measured from the live /מותג/: 6 columns from 768px (2 below), no gap, every cell has a
        // 1px rgba(0,0,0,.106) bottom line and a divider on its side; the negative margin + overflow-hidden clips the
        // outer-edge divider so only the inner ones show (and empty slots in the last row stay borderless).
        <div className="overflow-hidden">
        <div className="-me-px grid grid-cols-2 min-[768px]:grid-cols-6">
          {visible.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}/`}
              className="flex flex-col border-b border-e border-black/[.106] bg-white text-center"
            >
              {/* Logo box: 190px (106px at ≤1023px), logo centred at 70% of the cell width, natural aspect. */}
              <span className="flex h-[190px] items-center justify-center max-[1023px]:h-[106px]">
                <Image
                  src={brand.thumbnailUrl || "/brand/logo.png"}
                  alt={brand.name}
                  width={0}
                  height={0}
                  sizes="(min-width: 1570px) 183px, (min-width: 768px) 12vw, 35vw"
                  quality={90}
                  className="mx-auto h-auto w-[70%]"
                />
              </span>
              {/* Caption: 17px/500 (27.2px line), black, 5px/10px padding — an approved exception to the 18px floor (AGENTS.md). */}
              <span className="px-[10px] py-[5px] text-[17px] font-medium leading-[27.2px] text-black">{brand.name}</span>
            </Link>
          ))}
        </div>
        </div>
      )}
    </>
  );
}
