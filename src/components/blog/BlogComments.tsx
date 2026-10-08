"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { formatDate } from "@/lib/utils/formatDate";
import type { BlogComment } from "@/lib/wpgraphql/posts";

export function BlogComments({
  postId,
  initialComments,
}: {
  postId: number;
  initialComments: BlogComment[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  // The persisted auth store only exists client-side — wait for hydration before choosing which form to show.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const customer = useAuthStore((st) => st.customer);
  const logout = useAuthStore((st) => st.logout);
  const loggedIn = mounted && !!customer;

  // "Save my name and email for next time" — restores what the visitor chose to remember.
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("blog-comment-author") ?? "null",
      );
      if (saved?.name || saved?.email || saved?.url) {
        /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from localStorage after hydration */
        setName(saved.name ?? "");
        setEmail(saved.email ?? "");
        setUrl(saved.url ?? "");
        setRemember(true);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // storage unavailable — the form simply starts empty
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/blog-comment/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          loggedIn
            ? {
                postId,
                authorName:
                  [customer.firstName, customer.lastName]
                    .filter(Boolean)
                    .join(" ") || customer.username,
                authorEmail: customer.email,
                content,
              }
            : {
                postId,
                authorName: name,
                authorEmail: email,
                authorUrl: url,
                content,
              },
        ),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("done");
        try {
          if (remember)
            localStorage.setItem(
              "blog-comment-author",
              JSON.stringify({ name, email, url }),
            );
          else localStorage.removeItem("blog-comment-author");
        } catch {
          // storage unavailable
        }
        if (!remember) {
          setName("");
          setEmail("");
          setUrl("");
        }
        setContent("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const field =
    "block w-full rounded-[35px] border-2 border-black/10 bg-transparent px-[15px] font-[family-name:Arial,Helvetica,sans-serif] text-[14px] leading-[22.4px] text-[#0c0c0c] outline-none focus:border-black/25";
  const label = "mb-[5px] block text-[21px] leading-[33.6px]";
  const star = <span className="text-[16px] text-[#e01020]"> *</span>;

  return (
    <section
      dir="rtl"
      className="mb-10 font-[family-name:Arial,Helvetica,sans-serif] text-[#0c0c0c]"
    >
      {initialComments.length > 0 ? (
        <div className="mb-10">
          <h2 className="mb-5 text-[22px] font-bold uppercase leading-[30.8px]">
            תגובות ({initialComments.length})
          </h2>
          <div className="flex flex-col gap-5">
            {initialComments.map((c) => (
              <div key={c.id} className="border-b border-black/10 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[18px] font-semibold">
                    {c.authorName}
                  </span>
                  <span className="text-[14px] text-[#bbb]">
                    {formatDate(c.date)}
                  </span>
                </div>
                <div
                  className="mt-2 text-[18px] leading-[28.8px] [&_p]:mb-0"
                  dangerouslySetInnerHTML={{ __html: c.contentHtml }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <h3 className="mb-5 text-[22px] font-bold uppercase leading-[30.8px]">
        כתיבת תגובה
      </h3>
      {status === "done" ? (
        <p className="text-[18px] text-green-700">
          התגובה נשלחה בהצלחה וממתינה לאישור.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          {loggedIn ? (
            <p className="mb-5 flex flex-wrap items-center text-[21px] leading-[33.6px]">
              <span className="flex items-center">
                <span className="text-[14px] font-semibold leading-[22px] text-[#333]">
                  <span className="text-[#777]">מחובר כ-</span>
                  {customer.firstName || customer.username}
                </span>
                <span className="mx-[10px] h-[14px] w-px bg-black/10" />
                <Link
                  href="/my-account/edit-account"
                  prefetch={false}
                  className="text-[14px] font-semibold leading-[22px] text-[#333] hover:text-black"
                >
                  עריכת הפרופיל
                </Link>
                <span className="mx-[10px] h-[14px] w-px bg-black/10" />
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="text-[14px] font-semibold leading-[22px] text-[#333] hover:text-black"
                >
                  התנתקות
                </button>
                <span className="mx-[10px] h-[14px] w-px bg-black/10" />
              </span>
              <span>שדות החובה מסומנים{star}</span>
            </p>
          ) : (
            <p className="mb-5 text-[21px] leading-[33.6px]">
              האימייל לא יוצג באתר. שדות החובה מסומנים{star}
            </p>
          )}
          <div className="mb-[15px]">
            <label htmlFor="blog-comment" className={label}>
              התגובה שלך{star}
            </label>
            <textarea
              id="blog-comment"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${field} h-[190px] resize-y py-[10px]`}
            />
          </div>
          {loggedIn ? null : (
            <>
              <div className="grid grid-cols-1 gap-x-5 lg:grid-cols-2">
                <div className="mb-[15px]">
                  <label htmlFor="blog-comment-name" className={label}>
                    שם{star}
                  </label>
                  <input
                    id="blog-comment-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${field} h-[42px]`}
                  />
                </div>
                <div className="mb-[15px]">
                  <label htmlFor="blog-comment-email" className={label}>
                    אימייל{star}
                  </label>
                  <input
                    id="blog-comment-email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${field} h-[42px]`}
                  />
                </div>
              </div>
              <div className="mb-[15px]">
                <label htmlFor="blog-comment-url" className={label}>
                  אתר
                </label>
                <input
                  id="blog-comment-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`${field} h-[42px]`}
                />
              </div>
              <label className="mb-[15px] flex items-start gap-[5px] text-[21px] leading-[33.6px]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="mt-[10px] h-[13px] w-[13px] shrink-0"
                />
                שמור בדפדפן זה את השם, האימייל והאתר שלי לפעם הבאה שאגיב.
              </label>
            </>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-[5px] inline-flex h-[42px] items-center rounded-[35px] bg-gradient-to-l from-brand-accent to-[#ff6b72] px-5 text-[13px] font-semibold uppercase leading-[15.6px] text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-8px_rgba(213,32,39,0.5)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {status === "loading" ? "שולח..." : "להגיב"}
          </button>
          {status === "error" ? (
            <p className="mt-3 text-[16px] text-brand-accent">
              משהו השתבש, נסו שוב.
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
