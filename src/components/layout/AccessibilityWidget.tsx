"use client";

import { useState, useEffect, useRef } from "react";

// ── State ──────────────────────────────────────────────────────────────────
type A11yState = {
  zoom: number; // items 1 & 2  – CSS zoom
  fontSize: number; // items 3 & 4  – rem font-size
  readableFont: boolean; // item  5
  imageAlt: boolean; // item  6
  showDesc: boolean; // item  7
  highlightLinks: boolean; // item  8
  highlightHeadings: boolean; // item  9
  reverseContrast: boolean; // item 10
  blackYellow: boolean; // item 11
  highContrast: boolean; // item 12
  sepia: boolean; // item 13
  grayscale: boolean; // item 14
  stopAnimations: boolean; // item 15
  focusOutline: boolean; // item 16
  darkCursor: boolean; // item 17
  largeCursor: boolean; // item 18
};

const DEFAULT_A11Y: A11yState = {
  zoom: 1,
  fontSize: 0,
  readableFont: false,
  imageAlt: false,
  showDesc: false,
  highlightLinks: false,
  highlightHeadings: false,
  reverseContrast: false,
  blackYellow: false,
  highContrast: false,
  sepia: false,
  grayscale: false,
  stopAnimations: false,
  focusOutline: false,
  darkCursor: false,
  largeCursor: false,
};

function injectStyle(id: string, css: string | null) {
  let el = document.getElementById(id);
  if (css) {
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = css;
  } else {
    el?.remove();
  }
}

function applyA11y(s: A11yState) {
  // Zoom (items 1 & 2)
  (document.body.style as CSSStyleDeclaration & { zoom: string }).zoom =
    s.zoom !== 1 ? String(s.zoom.toFixed(2)) : "";

  // Font size (items 3 & 4)
  document.documentElement.style.fontSize = `${16 + s.fontSize * 2}px`;

  // Stacked filters
  const filters: string[] = [];
  if (s.grayscale) filters.push("grayscale(100%)");
  if (s.reverseContrast) filters.push("invert(100%)");
  if (s.highContrast) filters.push("contrast(210%)");
  if (s.sepia) filters.push("sepia(80%)");
  document.body.style.filter = filters.join(" ");

  injectStyle(
    "a11y-readable",
    s.readableFont
      ? "*{font-family:Arial,sans-serif!important;letter-spacing:.05em!important;line-height:1.7!important}"
      : null
  );
  injectStyle(
    "a11y-img-alt",
    s.imageAlt
      ? 'img[alt]:not([alt=""]){outline:2px solid #4caf50!important}img:not([alt]),img[alt=""]{outline:2px solid #f44336!important}'
      : null
  );
  injectStyle(
    "a11y-show-desc",
    s.showDesc ? "[title],[aria-label],[aria-describedby]{outline:1px dashed #1565c0!important}" : null
  );
  injectStyle("a11y-links", s.highlightLinks ? "a{outline:2px solid #e65100!important;background:#fff8e1!important}" : null);
  injectStyle(
    "a11y-headings",
    s.highlightHeadings
      ? "h1,h2,h3,h4,h5,h6{outline:2px solid #1565c0!important;background:rgba(21,101,192,0.07)!important}"
      : null
  );
  injectStyle(
    "a11y-by",
    s.blackYellow ? "html{filter:none!important}*{background-color:#000!important;color:#ff0!important;border-color:#ff0!important}" : null
  );
  injectStyle(
    "a11y-no-anim",
    s.stopAnimations
      ? "*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}"
      : null
  );
  injectStyle(
    "a11y-focus",
    s.focusOutline ? "*:focus,*:focus-visible{outline:3px solid #ff6600!important;outline-offset:3px!important}" : null
  );
  injectStyle("a11y-dark-cur", s.darkCursor ? "html *{cursor:crosshair!important}" : null);
  injectStyle(
    "a11y-big-cur",
    s.largeCursor
      ? `html *{cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath fill='%23000' stroke='%23fff' stroke-width='2' d='M8 3l26 18-11 3.5 8 20-6 2.5-8-20-9 8z'/%3E%3C/svg%3E") 8 3,auto!important}`
      : null
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────
const Ico = ({ children, w = 22 }: { children: React.ReactNode; w?: number }) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

// 1. Minimize screen – Feather minimize-2 (two inward L-brackets + diagonals)
const IcoMinimize = () => (
  <Ico>
    <path d="M4 14h6v6" />
    <path d="M20 10h-6V4" />
    <line x1="14" y1="10" x2="21" y2="3" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </Ico>
);

// 2. Maximize screen – Feather maximize-2 (two outward L-brackets + diagonals)
const IcoMaximize = () => (
  <Ico>
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </Ico>
);

// 3. Font reduce – path-drawn A with minus
const IcoFontDown = () => (
  <Ico>
    <path d="M4 19 L9 7 L14 19" />
    <line x1="5.5" y1="15" x2="12.5" y2="15" />
    <line x1="17" y1="14" x2="22" y2="14" strokeWidth={2.5} />
  </Ico>
);

// 4. Font increase – path-drawn A with plus
const IcoFontUp = () => (
  <Ico>
    <path d="M3 19 L8.5 6 L14 19" />
    <line x1="4.8" y1="15" x2="12.2" y2="15" />
    <line x1="18" y1="8" x2="18" y2="16" />
    <line x1="14" y1="12" x2="22" y2="12" />
  </Ico>
);

// 5. Readable font – clean serif T
const IcoReadFont = () => (
  <Ico>
    <line x1="4" y1="5" x2="20" y2="5" />
    <line x1="12" y1="5" x2="12" y2="20" />
    <line x1="9" y1="20" x2="15" y2="20" />
  </Ico>
);

// 6. Image description – picture frame + alt-text lines
const IcoImgDesc = () => (
  <Ico>
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <circle cx="8" cy="9" r="1.5" />
    <path d="M3 14l5-5 4 4 3-3 5 5" />
    <line x1="5" y1="20" x2="11" y2="20" />
    <line x1="13" y1="20" x2="19" y2="20" strokeDasharray="2 1.5" />
  </Ico>
);

// 7. Show descriptions – monitor with text lines inside
const IcoShowDesc = () => (
  <Ico>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <line x1="6" y1="8" x2="16" y2="8" />
    <line x1="6" y1="12" x2="13" y2="12" />
  </Ico>
);

// 8. Highlight links – chain
const IcoLink = () => (
  <Ico>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Ico>
);

// 9. Highlight headings – bold H with crossbar
const IcoHeadings = () => (
  <Ico>
    <line x1="4" y1="4" x2="4" y2="20" />
    <line x1="20" y1="4" x2="20" y2="20" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="2" y1="19" x2="8" y2="19" strokeWidth={3} />
  </Ico>
);

// 10. Invert colors – vertically split circle (left half filled)
const IcoInvert = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 0 0 20V2z" fill="currentColor" stroke="none" />
  </svg>
);

// 11. Black/Yellow – two rectangles: left filled, right outlined with Y-mark
const IcoBlackYellow = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="9" height="16" rx="1" fill="currentColor" stroke="none" />
    <rect x="13" y="4" width="9" height="16" rx="1" />
    <path d="M16 8 L18 11 L20 8" strokeWidth="1.5" />
    <line x1="18" y1="11" x2="18" y2="16" strokeWidth="1.5" />
  </svg>
);

// 12. High contrast – half-filled circle (right half filled)
const IcoContrast = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" stroke="none" />
  </svg>
);

// 13. Sepia – camera body
const IcoSepia = () => (
  <Ico>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </Ico>
);

// 14. Grayscale – three circles in a row with descending fill
const IcoGrayscale = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="12" r="4" fill="currentColor" stroke="none" />
    <circle cx="13" cy="12" r="4" fill="currentColor" stroke="currentColor" opacity="0.5" />
    <circle cx="20" cy="12" r="3" fill="none" />
  </svg>
);

// 15. Stop flashing – lightning bolt with an X badge
const IcoNoFlash = () => (
  <Ico>
    <path d="M11 2L3 13h8l-2 9 10-13h-8l2-7z" />
    <line x1="17" y1="5" x2="22" y2="10" />
    <line x1="22" y1="5" x2="17" y2="10" />
  </Ico>
);

// 16. Keyboard navigation – keyboard with keys
const IcoKeyboard = () => (
  <Ico>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="6" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="18" cy="10" r="1" fill="currentColor" stroke="none" />
    <line x1="7" y1="14" x2="17" y2="14" strokeWidth={2.5} />
  </Ico>
);

// 17. Dark cursor – solid filled pointer arrow
const IcoDarkCursor = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2 L4 18 L8 14 L11 20 L13.5 19 L10.5 13 L16 13 Z" fill="currentColor" stroke="none" />
  </svg>
);

// 18. Large cursor – bigger pointer arrow
const IcoLargeCursor = () => (
  <svg width="22" height="22" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2 L3 20 L8 15 L11.5 22 L14.5 20.5 L11 13.5 L18 13.5 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
  </svg>
);

// Reset
const IcoReset = () => (
  <Ico>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.12" />
  </Ico>
);

// ── Layout constants ──────────────────────────────────────────────────────
const CARD_W = 82; // px – card width
const CARD_H = 90; // px – card height
const BAR_PAD = 28; // px – bar top+bottom padding
const FOOTER_H = 53; // px – footer row
const BAR_H = CARD_H + BAR_PAD + FOOTER_H; // 154px

// ── Widget ────────────────────────────────────────────────────────────────
export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(DEFAULT_A11Y);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyA11y(state);
  }, [state]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (key: keyof Omit<A11yState, "fontSize" | "zoom">) => setState((s) => ({ ...s, [key]: !s[key] }));
  const changeZoom = (d: number) =>
    setState((s) => ({ ...s, zoom: Math.round(Math.max(0.7, Math.min(1.5, s.zoom + d)) * 100) / 100 }));
  const changeFont = (d: number) => setState((s) => ({ ...s, fontSize: Math.max(-3, Math.min(5, s.fontSize + d)) }));
  const reset = () => setState(DEFAULT_A11Y);

  // 18 items in reference order (left → right matching image 2)
  const items: { label: string; icon: React.ReactNode; onClick: () => void; active: boolean }[] = [
    { label: "הקטנת מסך", icon: <IcoMinimize />, onClick: () => changeZoom(-0.1), active: state.zoom < 1 },
    { label: "הגדלת מסך", icon: <IcoMaximize />, onClick: () => changeZoom(+0.1), active: state.zoom > 1 },
    { label: "הקטנת פונט", icon: <IcoFontDown />, onClick: () => changeFont(-1), active: state.fontSize < 0 },
    { label: "הגדלת פונט", icon: <IcoFontUp />, onClick: () => changeFont(+1), active: state.fontSize > 0 },
    { label: "גופן קריא", icon: <IcoReadFont />, onClick: () => toggle("readableFont"), active: state.readableFont },
    { label: "תיאור תמונות", icon: <IcoImgDesc />, onClick: () => toggle("imageAlt"), active: state.imageAlt },
    { label: "הצגת תיאורים", icon: <IcoShowDesc />, onClick: () => toggle("showDesc"), active: state.showDesc },
    { label: "הדגשת קישורים", icon: <IcoLink />, onClick: () => toggle("highlightLinks"), active: state.highlightLinks },
    { label: "הדגשת כותרות", icon: <IcoHeadings />, onClick: () => toggle("highlightHeadings"), active: state.highlightHeadings },
    { label: "ניגודיות הפוכה", icon: <IcoInvert />, onClick: () => toggle("reverseContrast"), active: state.reverseContrast },
    { label: "שחור-צהוב", icon: <IcoBlackYellow />, onClick: () => toggle("blackYellow"), active: state.blackYellow },
    { label: "ניגודיות גבוהה", icon: <IcoContrast />, onClick: () => toggle("highContrast"), active: state.highContrast },
    { label: "ספיה", icon: <IcoSepia />, onClick: () => toggle("sepia"), active: state.sepia },
    { label: "גווני אפור", icon: <IcoGrayscale />, onClick: () => toggle("grayscale"), active: state.grayscale },
    { label: "עצירת הבהוב", icon: <IcoNoFlash />, onClick: () => toggle("stopAnimations"), active: state.stopAnimations },
    { label: "ניווט מקלדת", icon: <IcoKeyboard />, onClick: () => toggle("focusOutline"), active: state.focusOutline },
    { label: "מצביע שחור", icon: <IcoDarkCursor />, onClick: () => toggle("darkCursor"), active: state.darkCursor },
    { label: "מצביע גדול", icon: <IcoLargeCursor />, onClick: () => toggle("largeCursor"), active: state.largeCursor },
  ];

  return (
    <>
      <style>{`
        .a11y-wrap {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 99 !important;
          /* slide the whole unit (FAB + bar) together */
          transform: translateY(${BAR_H}px);
          transition: transform 0.52s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .a11y-wrap.a11y-wrap--open {
          transform: translateY(0);
        }
        .a11y-fab-row {
          display: flex;
          direction: ltr;
          justify-content: flex-end;
          /* stacked above the same-size WhatsApp FAB (bottom-5 right-5, 44px) so they never overlap */
          padding: 0 20px 76px;
        }
        @media (min-width: 640px) {
          .a11y-fab-row {
            padding: 0 24px 80px;
          }
        }
        .a11y-fab {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #111;
          border: 2px solid rgba(255,255,255,0.18);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 14px rgba(0,0,0,0.45);
          transition: background 0.22s, border-color 0.22s;
          padding: 0;
        }
        .a11y-fab:hover { background: #2a2a2a; }
        .a11y-fab--open {
          background: #1565c0 !important;
          border-color: #1565c0 !important;
          box-shadow: 0 3px 16px rgba(21,101,192,0.55) !important;
        }
        .a11y-bar {
          background: linear-gradient(180deg, rgba(7,51,75,0.7) 0%, #000);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid hsla(0,0%,100%,0.2);
          box-shadow: 0 0 10px rgba(0,0,0,0.8);
          filter: grayscale(100%);
          padding: 14px 16px 14px;
          box-sizing: border-box;
        }
        .a11y-scroll {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding-bottom: 4px;
          direction: rtl;
        }
        .a11y-scroll::-webkit-scrollbar { height: 3px; }
        .a11y-scroll::-webkit-scrollbar-track { background: transparent; }
        .a11y-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22); border-radius: 2px; }
        .a11y-card {
          flex-shrink: 0;
          width: ${CARD_W}px;
          height: ${CARD_H}px;
          border-radius: 8px;
          border: 2px solid rgba(0,0,0,0.08);
          background: #fff;
          color: #1a1a1a;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 11px;
          font-family: Arial, sans-serif;
          text-align: center;
          line-height: 1.28;
          padding: 8px 5px 10px;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .a11y-card:hover:not(.a11y-card--on) { background: #f2f2f2; }
        .a11y-card--on {
          background: #1565c0 !important;
          color: #fff !important;
          border-color: #1565c0 !important;
          box-shadow: 0 0 0 3px rgba(21,101,192,0.22);
        }
        .a11y-card--on:hover { background: #1255a8 !important; }
        .a11y-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .a11y-reset-btn {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.55);
          cursor: pointer;
          font-size: 12px;
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 2px 6px;
          border-radius: 4px;
          transition: color 0.15s, background 0.15s;
        }
        .a11y-reset-btn:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.1); }
      `}</style>

      <div ref={containerRef} className={`a11y-wrap${open ? " a11y-wrap--open" : ""}`}>
        {/* FAB – sits above the bar, moves with it */}
        <div className="a11y-fab-row">
          <button
            className={`a11y-fab${open ? " a11y-fab--open" : ""}`}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="כלי נגישות"
          >
            <svg viewBox="0 0 45 45" width="26" height="26" fill="none" aria-hidden="true">
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M22.5 11.25a2.578 2.578 0 1 0 0 5.156 2.578 2.578 0 0 0 0-5.156Zm-6.586 6.4a1.406 1.406 0 0 0-.89 2.669l6.07 2.023v3.248l-4.451 6.677a1.406 1.406 0 1 0 2.34 1.56L22.5 28.55l3.518 5.276a1.406 1.406 0 1 0 2.34-1.56l-4.451-6.677v-3.248l6.07-2.023a1.406 1.406 0 0 0-.89-2.669L22.5 19.846l-6.586-2.196Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Bar */}
        <div className="a11y-bar" role="dialog" aria-label="כלי נגישות" aria-hidden={!open}>
          <div className="a11y-scroll">
            {items.map((item, i) => (
              <button
                key={i}
                className={`a11y-card${item.active ? " a11y-card--on" : ""}`}
                onClick={item.onClick}
                title={item.label}
                aria-pressed={item.active}
                aria-label={item.label}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Footer – reset */}
          <div className="a11y-footer">
            <button className="a11y-reset-btn" onClick={reset} aria-label="איפוס כל הגדרות הנגישות">
              <IcoReset />
              איפוס הגדרות
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
