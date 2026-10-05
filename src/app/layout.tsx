import type { Metadata } from "next";
import Script from "next/script";
import { Open_Sans } from "next/font/google";
import { resolveIntegrations } from "@/lib/integrations";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FlashyTracker } from "@/components/layout/FlashyTracker";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { QuickViewHost } from "@/components/product/QuickViewHost";
import { LoginDrawer } from "@/components/auth/LoginDrawer";
import { LogoutOverlay } from "@/components/auth/LogoutOverlay";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { AccessibilityWidget } from "@/components/layout/AccessibilityWidget";
import { getGlobalData } from "@/lib/wpgraphql/tamarApi";
import { wpEnv } from "@/lib/wpgraphql/env";
import "./globals.css";

// The single site-wide typeface (see --font-sans in globals.css).
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["hebrew", "latin"],
  // Drop next/font's auto-generated "Open Sans Fallback" face so the stack
  // matches the legacy site: "Open Sans", Arial, Helvetica, sans-serif.
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(wpEnv.siteUrl),
  title: {
    default: "תמר קוסמטיקס - חנות למוצרי ציפורניים",
    template: "%s | תמר קוסמטיקס",
  },
  description: "תמר קוסמטיקס - חנות למוצרי ציפורניים, פדיקור וגבות",
  openGraph: {
    locale: "he_IL",
    type: "website",
    siteName: "תמר קוסמטיקס",
  },
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32" },
      { url: "/brand/favicon-192.png", sizes: "192x192" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const global = await getGlobalData();
  const menu = global?.menu ?? [];
  const siteSettings = global?.settings ?? null;
  const bar = global?.headerBar ?? null;
  const integrations = resolveIntegrations(siteSettings);
  const labelsCss = global?.labelsCss?.replace(/<\/style/gi, "") ?? "";

  return (
    <html lang="he" dir="rtl" className={`${openSans.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla's
          cz-shortcut-listen) inject attributes onto <body> before React
          hydrates, which otherwise throws a full-tree hydration mismatch
          that has nothing to do with our markup — the documented false
          positive at https://nextjs.org/docs/messages/react-hydration-error.
          Only suppresses the warning for this element's own attributes,
          not for actual content mismatches anywhere else in the tree. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {/* Product label styles (wp-admin → BeRocket → Advanced Labels), from the same /global-data call as the menu. */}
        {labelsCss ? <style dangerouslySetInnerHTML={{ __html: labelsCss }} /> : null}
        <Header menu={menu} logo={siteSettings?.headerLogo ?? null} stickyLogo={siteSettings?.headerStickyLogo ?? null} bar={bar} />
        <main className="flex-1">{children}</main>
        <Footer logo={siteSettings?.footerLogo ?? null} data={global?.footer ?? null} />
        <FlashyTracker />
        <CookieConsent />
        <CartDrawer />
        <LoginDrawer />
        <QuickViewHost />
        <LogoutOverlay />
        <FloatingActions whatsappNumber={integrations.whatsappNumber} />
        <AccessibilityWidget />
        <Script id="flashy-init" strategy="lazyOnload">
          {`(function (a, b, c) {
            if (!a.flashy) {
              // thunder.js reuses its cached popup list for 10 min, and on that path it never fills the product-page
              // recommendation containers (first visit works, repeat visits stay empty). Dropping the cache timestamp
              // makes it fetch the list again, so injection runs exactly like a first visit.
              try { localStorage.removeItem("flashy_popups_cache_time"); } catch (err) {}
              a.flashy = function () { a.flashy.event && a.flashy.event(arguments), a.flashy.queue.push(arguments) };
              a.flashy.queue = [];
              var d = document.getElementsByTagName(b)[0], e = document.createElement(b);
              e.src = c; e.async = true; d.parentNode.insertBefore(e, d);
            }
          })(window, "script", "https://js.flashyapp.com/thunder.js");
          window.__flashyAccountId = ${integrations.flashyAccountId};
          flashy("init", ${integrations.flashyAccountId});
          (window.__flashyPending || []).forEach(function (p) { flashy.apply(null, p); });
          window.__flashyPending = [];`}
        </Script>
      </body>
    </html>
  );
}
