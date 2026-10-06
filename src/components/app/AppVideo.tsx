"use client";

import Image from "next/image";
import { useState } from "react";

interface AppVideoProps {
  videoId: string;
  posterUrl?: string;
  title: string;
}

/**
 * Poster + play button that swaps to the YouTube iframe on click, so the
 * (heavy) YouTube embed never loads with the page — keeps the 0-2s budget.
 */
export function AppVideo({ videoId, posterUrl, title }: AppVideoProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} aria-label={title} className="group absolute inset-0 block h-full w-full cursor-pointer">
      {posterUrl ? <Image src={posterUrl} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /> : <span className="absolute inset-0 bg-black/10" />}
      <span className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white/80 bg-black/10 transition group-hover:scale-110 group-hover:bg-black/25">
        <svg viewBox="0 0 24 24" className="h-8 w-8 translate-x-[2px] fill-white" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
