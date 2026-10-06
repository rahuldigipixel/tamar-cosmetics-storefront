"use client";

import { useState } from "react";

const STOP_WORDS = new Set([
  "אני", "את", "אתה", "האם", "מה", "איך", "מתי", "כמה", "איפה", "למה",
  "יש", "אפשר", "ניתן", "צריך", "רוצה", "של", "על", "עם", "זה", "זו",
  "לי", "לכם", "לכן", "בחנות", "בנוגע", "בקשר",
]);

const normalize = (text: string) =>
  text.replace(/[.,!?;:"'״׳()]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

interface Result {
  element: Element;
  text: string;
  score: number;
}

/**
 * "יש לך שאלה?" box: scores the paragraphs/list items/headings inside the
 * element with id `contentId` against the typed keywords, lists the best 5
 * and scrolls to the one clicked. Ported from the legacy site's inline script.
 */
export function FaqSearch({ contentId }: { contentId: string }) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  function search() {
    setResults([]);
    setMessage("");

    if (query.trim().length < 3) {
      setMessage("כתבי שאלה קצרה על החנות");
      return;
    }
    const words = normalize(query).split(" ").filter((w) => w.length > 1 && !STOP_WORDS.has(w));
    if (words.length === 0) {
      setMessage("נסי לשאול על משלוחים, החזרות, תשלום או איסוף עצמי");
      return;
    }
    const area = document.getElementById(contentId);
    if (!area) {
      setMessage("לא נמצא אזור תוכן בעמוד");
      return;
    }

    const found: Result[] = [];
    area.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6").forEach((element) => {
      const text = ((element as HTMLElement).innerText || "").replace(/\s+/g, " ").trim();
      if (text.length < 8) return;
      const clean = normalize(text);
      const score = words.filter((w) => clean.includes(w)).length;
      if (score > 0) found.push({ element, text, score });
    });
    found.sort((a, b) => b.score - a.score);

    if (found.length === 0) {
      setMessage("לא מצאתי תשובה קרובה בעמוד הזה");
      return;
    }
    setKeywords(words);
    setResults(found.slice(0, 5));
    setMessage("מצאתי תשובות שיכולות להתאים:");
  }

  function highlight(text: string) {
    const pattern = new RegExp("(" + keywords.map(escapeRegExp).join("|") + ")", "gi");
    return text.split(pattern).map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="rounded bg-[#fff3a3] px-[3px] py-px font-bold">{part}</span>
      ) : (
        part
      ),
    );
  }

  return (
    <div className="mx-auto mb-4 mt-[10px] max-w-[260px] font-[family-name:Arial,Helvetica,sans-serif] lg:mb-6 lg:mt-[18px] lg:max-w-[420px]">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder="יש לך שאלה?"
          className="h-[36px] min-w-0 flex-1 rounded-[10px] border border-[#ddd] px-[14px] text-[13px] leading-[20.8px] text-[#0c0c0c] outline-none focus:border-[#d52027] lg:h-[44px] lg:text-[15px] lg:leading-[24px]"
        />
        <button
          type="button"
          onClick={search}
          className="h-[42px] cursor-pointer whitespace-nowrap rounded-[10px] bg-[#d52027] px-[10px] text-[12.5px] font-semibold leading-[15px] text-white transition-colors hover:bg-[#b91b21] lg:h-[44px] lg:px-4 lg:text-[14px] lg:leading-[16.8px]"
        >
          מצא תשובה
        </button>
      </div>
      {message ? <p className="mt-[9px] text-center text-[14px] text-[#555]">{message}</p> : null}
      {results.length > 0 ? (
        <div className="mt-[10px] grid gap-2">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => r.element.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="cursor-pointer rounded-[10px] border border-[#eee] bg-[#fafafa] px-[10px] py-2 text-right text-[12.5px] leading-[1.55] hover:bg-[#f1f1f1] lg:px-[13px] lg:py-[11px] lg:text-[14px]"
            >
              {highlight(r.text)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
