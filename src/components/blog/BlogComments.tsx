"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils/formatDate";
import type { BlogComment } from "@/lib/wpgraphql/posts";

export function BlogComments({ postId, initialComments }: { postId: number; initialComments: BlogComment[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/blog-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, authorName: name, authorEmail: email, content }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("done");
        setName("");
        setEmail("");
        setContent("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mt-12 border-t border-black/10 pt-8">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <MessageCircle className="h-5 w-5 text-brand-accent" />
        תגובות {initialComments.length > 0 ? `(${initialComments.length})` : ""}
      </h2>

      {initialComments.length > 0 ? (
        <div className="mt-6 flex flex-col gap-5">
          {initialComments.map((c) => (
            <div key={c.id} className="rounded-2xl border border-black/5 bg-brand-soft/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-black/85">{c.authorName}</span>
                <span className="text-sm text-black/40">{formatDate(c.date)}</span>
              </div>
              <div
                className="mt-2 text-base leading-relaxed text-black/75 [&_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: c.contentHtml }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-base text-black/50">היו הראשונים להגיב.</p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold">כתיבת תגובה</h3>
        {status === "done" ? (
          <p className="text-base text-green-700">התגובה נשלחה בהצלחה וממתינה לאישור.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="שם מלא *"
                className="h-12 rounded-xl border border-black/10 bg-black/[0.02] px-4 text-base outline-none focus:border-brand-accent"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="אימייל *"
                className="h-12 rounded-xl border border-black/10 bg-black/[0.02] px-4 text-base outline-none focus:border-brand-accent"
              />
            </div>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="התגובה שלך *"
              rows={4}
              className="rounded-xl border border-black/10 bg-black/[0.02] p-4 text-base outline-none focus:border-brand-accent"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="self-start rounded-full bg-gradient-to-l from-brand-accent to-[#ff6b72] px-6 py-2.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {status === "loading" ? "שולח..." : "שליחת תגובה"}
            </button>
            {status === "error" ? <p className="text-sm text-brand-accent">משהו השתבש, נסו שוב.</p> : null}
          </>
        )}
      </form>
    </section>
  );
}
