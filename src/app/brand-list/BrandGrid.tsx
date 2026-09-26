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
      <div className="mb-8 flex justify-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש מותג"
          className="w-full max-w-[700px] rounded-full border border-black/15 px-6 py-3 text-[16px] outline-none focus:border-brand-accent"
        />
      </div>

      {/* Grid with shared inner borders — same pattern as CategoryProductCard */}
      {visible.length === 0 ? (
        <p className="py-12 text-center text-black/50">לא נמצאו מותגים.</p>
      ) : (
        <div className="-m-px grid grid-cols-2 overflow-hidden sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {visible.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}/`}
              className="group m-px flex flex-col bg-white p-4 text-center outline outline-[0.5px] outline-black/10"
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={brand.thumbnailUrl || "/brand/logo.png"}
                  alt={brand.name}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 22vw, 40vw"
                  className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="mt-2 text-[15px] font-semibold leading-snug text-black/85 group-hover:text-brand-accent">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
