import type { Metadata } from "next";
import { Heebo, Rubik } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WelcomePopup } from "@/components/layout/WelcomePopup";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { AccessibilityWidget } from "@/components/layout/AccessibilityWidget";
import { listCategories } from "@/lib/wpgraphql/categories";
import { wpEnv } from "@/lib/wpgraphql/env";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
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
  const categories = await listCategories().catch(() => []);

  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${rubik.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer />
        <WelcomePopup />
        <CookieConsent />
        <CartDrawer />
        <FloatingActions />
        <AccessibilityWidget />
      </body>
    </html>
  );
}
